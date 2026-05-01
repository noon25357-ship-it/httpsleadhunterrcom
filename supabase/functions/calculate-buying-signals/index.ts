// Edge function: calculate-buying-signals
// Recomputes buying-signal score/status/reasons/next_best_action for one or many
// saved_leads owned by the authenticated user, then persists the result.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SignalStatus = "Hot" | "Warm" | "Cold";

interface LeadShape {
  hasWebsite?: boolean;
  rating?: number;
  reviews?: number;
  phone?: string;
  reviewTexts?: string[];
}

const PROBLEM_KEYWORDS = [
  "تأخير", "متأخر", "زحمة", "حجز", "ما يردون", "ما يرد", "ما رد", "خدمة سيئة",
  "انتظار", "رد", "بطيء", "بطيئة", "سوء", "مزعج",
  "slow", "delay", "delayed", "bad service", "booking", "no response", "wait", "waiting",
];
const GROWTH_KEYWORDS = [
  "فرع جديد", "ممتاز", "أفضل", "دايم مليان", "مليان", "زحمة", "مشهور", "نجاح",
  "new branch", "busy", "popular", "best", "amazing", "crowded",
];

function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))); }
function statusFromScore(s: number): SignalStatus {
  if (s >= 75) return "Hot";
  if (s >= 45) return "Warm";
  return "Cold";
}
function matchesAny(haystack: string, needles: string[]) {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

function nextBestAction(p: {
  status: SignalStatus; hasWebsite: boolean; hasComplaints: boolean; pipelineStatus?: string;
}): string {
  if (p.pipelineStatus === "interested")
    return "اتصل به اليوم أو أرسل رابط حجز مكالمة قصيرة.";
  if (p.status === "Hot" && !p.hasWebsite)
    return "أرسل له رسالة تعرض فيها موقع سريع يحسّن ظهوره ويزيد الحجوزات.";
  if (p.status === "Hot")
    return "تواصل معه الآن، الفرصة قوية ويستحق الأولوية.";
  if (p.status === "Warm" && p.hasComplaints)
    return "ابدأ برسالة تركّز على تحسين تجربة العملاء وتقليل ضغط الاستفسارات.";
  if (p.status === "Warm")
    return "أرسل له عرضًا مختصرًا، وتابع بعد يومين إذا ما رد.";
  return "احفظه للمتابعة لاحقًا ولا تبدأ به الآن.";
}

function compute(lead: LeadShape, ctx: { pipelineStatus?: string; contactedNoReply?: boolean }) {
  let score = 0;
  const reasons: string[] = [];

  if (!lead.hasWebsite) { score += 25; reasons.push("لا يملك موقع إلكتروني"); }
  if (typeof lead.rating === "number" && lead.rating >= 4.0) {
    score += 15; reasons.push("تقييمه مرتفع وعنده عملاء فعليين");
  }
  if (typeof lead.reviews === "number" && lead.reviews > 30) {
    score += 15; reasons.push("عدد مراجعاته جيد ويدل على نشاط حقيقي");
  }
  if (lead.phone && String(lead.phone).trim()) {
    score += 10; reasons.push("لديه رقم تواصل مباشر");
  }

  let hasComplaints = false;
  const texts = lead.reviewTexts ?? [];
  if (texts.length > 0) {
    const joined = texts.join(" ");
    if (matchesAny(joined, PROBLEM_KEYWORDS)) {
      score += 20; reasons.push("توجد شكاوى متكررة في المراجعات"); hasComplaints = true;
    }
    if (matchesAny(joined, GROWTH_KEYWORDS)) {
      score += 15; reasons.push("يوجد مؤشر طلب عالي ونمو من المراجعات");
    }
  }

  if (ctx.contactedNoReply) { score -= 10; reasons.push("تم التواصل سابقًا ولم يرد"); }
  if (ctx.pipelineStatus === "interested") {
    score += 20; reasons.push("أبدى اهتمامًا في تواصل سابق");
  }

  const finalScore = clamp(score);
  const status = statusFromScore(finalScore);
  return {
    score: finalScore,
    status,
    reasons,
    next_best_action: nextBestAction({
      status, hasWebsite: !!lead.hasWebsite, hasComplaints, pipelineStatus: ctx.pipelineStatus,
    }),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const ids: string[] | undefined = Array.isArray(body?.lead_ids)
      ? body.lead_ids
      : body?.lead_id ? [body.lead_id] : undefined;

    let query = supabase
      .from("saved_leads")
      .select("id,status,lead_data,last_action,contact_channel")
      .eq("user_id", userData.user.id);

    if (ids && ids.length > 0) query = query.in("id", ids);

    const { data: rows, error: selErr } = await query;
    if (selErr) {
      return new Response(JSON.stringify({ error: selErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: Array<{ id: string; score: number; status: SignalStatus }> = [];

    for (const row of rows ?? []) {
      const lead = (row.lead_data ?? {}) as LeadShape;
      const contactedNoReply =
        row.status === "contacted" && (row.last_action === "no_reply" || row.last_action === "contacted");
      const result = compute(lead, {
        pipelineStatus: row.status as string | undefined,
        contactedNoReply,
      });

      const { error: updErr } = await supabase
        .from("saved_leads")
        .update({
          buying_signal_score: result.score,
          buying_signal_status: result.status,
          buying_signal_reasons: result.reasons,
          next_best_action: result.next_best_action,
          last_signal_calculated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (!updErr) results.push({ id: row.id, score: result.score, status: result.status });
    }

    return new Response(JSON.stringify({ updated: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
