import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `أنت محلل ذكي متخصص في تقييم نية الشراء من منشورات الإنترنت.

مهمتك:
1. حلل المنشور التالي وحدد إذا الشخص يحتاج خدمات رقمية (موقع، تسويق، تصميم، SEO)
2. أعطِ نقاط نية من 0 إلى 100
3. صنّف النية
4. اكتب ملخص قصير بالعربي
5. اكتب رد مقترح احترافي وودي بالعربي أو الإنجليزي (حسب لغة المنشور)

التصنيفات المتاحة:
- needs_website: يحتاج موقع إلكتروني
- needs_marketing: يحتاج تسويق رقمي
- needs_design: يحتاج تصميم (شعار، هوية، UI/UX)
- needs_seo: يحتاج تحسين محركات البحث
- other: غير واضح أو لا يحتاج خدمات رقمية

معايير النقاط:
- 80-100: نية واضحة جداً، يطلب الخدمة مباشرة
- 60-79: نية قوية، يبحث عن حلول
- 40-59: نية متوسطة، يشتكي من مشكلة ممكن نحلها
- 20-39: نية ضعيفة، مجرد نقاش عام
- 0-19: لا توجد نية شراء`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lead_ids } = await req.json().catch(() => ({}));

    // Get unclassified leads
    let query = supabase
      .from("intent_leads")
      .select("*")
      .eq("user_id", userId)
      .eq("intent_score", 0);

    if (lead_ids?.length) {
      query = query.in("id", lead_ids);
    }

    const { data: leads, error: fetchError } = await query.limit(20);
    if (fetchError) throw fetchError;
    if (!leads?.length) {
      return new Response(
        JSON.stringify({ success: true, classified: 0, message: "No unclassified leads found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Classifying ${leads.length} leads with AI...`);

    let classified = 0;

    for (const lead of leads) {
      try {
        const prompt = `حلل هذا المنشور:

العنوان: ${lead.title || "بدون عنوان"}
المحتوى: ${lead.content}
المصدر: ${lead.source}${lead.subreddit ? ` (r/${lead.subreddit})` : ""}
الكاتب: ${lead.author}`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "classify_lead",
                  description: "Classify the intent lead with score, category, summary and suggested reply",
                  parameters: {
                    type: "object",
                    properties: {
                      intent_score: { type: "integer", minimum: 0, maximum: 100 },
                      intent_category: {
                        type: "string",
                        enum: ["needs_website", "needs_marketing", "needs_design", "needs_seo", "other"],
                      },
                      ai_summary: { type: "string", description: "ملخص قصير بالعربي (جملة أو جملتين)" },
                      suggested_reply: { type: "string", description: "رد مقترح احترافي وودي" },
                    },
                    required: ["intent_score", "intent_category", "ai_summary", "suggested_reply"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "classify_lead" } },
          }),
        });

        if (!aiResp.ok) {
          if (aiResp.status === 429) {
            console.warn("Rate limited, stopping classification");
            break;
          }
          console.warn(`AI error: ${aiResp.status}`);
          continue;
        }

        const aiData = await aiResp.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall?.function?.arguments) continue;

        const result = JSON.parse(toolCall.function.arguments);

        const { error: updateError } = await supabase
          .from("intent_leads")
          .update({
            intent_score: result.intent_score,
            intent_category: result.intent_category,
            ai_summary: result.ai_summary,
            suggested_reply: result.suggested_reply,
          })
          .eq("id", lead.id)
          .eq("user_id", userId);

        if (!updateError) classified++;

        // Rate limit
        await new Promise((r) => setTimeout(r, 500));
      } catch (e) {
        console.warn(`Error classifying lead ${lead.id}:`, e);
      }
    }

    console.log(`Successfully classified ${classified}/${leads.length} leads`);

    return new Response(
      JSON.stringify({ success: true, classified, total: leads.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("classify-intent error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
