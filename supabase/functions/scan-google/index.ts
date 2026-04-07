import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_QUERIES = [
  '"أحتاج موقع" OR "ابي موقع" OR "محتاج تصميم موقع"',
  '"need a website" OR "looking for web developer" OR "need web designer"',
  '"أحتاج تسويق" OR "محتاج مسوق" OR "ابي تسويق رقمي"',
  '"looking for SEO" OR "need marketing help" OR "need social media manager"',
  '"who can build my website" OR "recommend a developer" OR "need an agency"',
];

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

    const SERPAPI_KEY = Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_KEY) {
      return new Response(JSON.stringify({ error: "SERPAPI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { queries } = await req.json().catch(() => ({}));
    const searchQueries = queries?.length ? queries : DEFAULT_QUERIES;

    console.log(`Scanning Google with ${searchQueries.length} queries...`);

    const allResults: any[] = [];

    for (const query of searchQueries.slice(0, 5)) {
      try {
        const params = new URLSearchParams({
          api_key: SERPAPI_KEY,
          engine: "google",
          q: query,
          num: "10",
          tbs: "qdr:w", // Last week
        });

        const resp = await fetch(`https://serpapi.com/search.json?${params}`);
        if (!resp.ok) {
          console.warn(`SerpAPI error: ${resp.status}`);
          continue;
        }

        const data = await resp.json();
        const results = data?.organic_results || [];

        for (const r of results) {
          const content = `${r.title || ""}\n\n${r.snippet || ""}`.trim();
          if (!content || content.length < 15) continue;

          allResults.push({
            source: "google",
            source_url: r.link || r.url || "",
            author: new URL(r.link || "https://unknown.com").hostname,
            title: r.title || "",
            content: content.substring(0, 2000),
            user_id: userId,
          });
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (e) {
        console.warn(`Error with query "${query}":`, e);
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueResults = allResults.filter((r) => {
      if (!r.source_url || seen.has(r.source_url)) return false;
      seen.add(r.source_url);
      return true;
    });

    console.log(`Found ${uniqueResults.length} unique results from Google`);

    let inserted = 0;
    for (const result of uniqueResults) {
      const { error } = await supabase.from("intent_leads").upsert(result, {
        onConflict: "user_id,source_url",
        ignoreDuplicates: true,
      });
      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        found: uniqueResults.length,
        inserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scan-google error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
