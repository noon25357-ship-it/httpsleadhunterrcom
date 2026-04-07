import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUBREDDITS = [
  "smallbusiness",
  "Entrepreneur",
  "web_design",
  "webdev",
  "marketing",
  "saudiarabia",
  "freelance",
  "startups",
];

const KEYWORDS_EN = [
  "need a website",
  "looking for developer",
  "need web developer",
  "need a designer",
  "looking for someone to build",
  "need help with my website",
  "need marketing help",
  "looking for SEO",
  "need social media manager",
  "rebuild my website",
  "redesign my website",
  "need an app",
  "looking for agency",
  "who can build",
  "recommend a developer",
];

const KEYWORDS_AR = [
  "أحتاج موقع",
  "أبي موقع",
  "ابغى موقع",
  "أحتاج مصمم",
  "أحتاج مسوق",
  "ابي تسويق",
  "محتاج موقع",
  "محتاج تصميم",
  "ابي تطبيق",
  "أحتاج تطبيق",
];

const ALL_KEYWORDS = [...KEYWORDS_EN, ...KEYWORDS_AR];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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

    const { subreddits, keywords } = await req.json().catch(() => ({}));
    const searchSubreddits = subreddits?.length ? subreddits : SUBREDDITS;
    const searchKeywords = keywords?.length ? keywords : ALL_KEYWORDS;

    console.log(`Scanning ${searchSubreddits.length} subreddits for intent leads...`);

    const allPosts: any[] = [];

    for (const sub of searchSubreddits) {
      try {
        // Search each subreddit for keyword matches
        for (const keyword of searchKeywords.slice(0, 5)) {
          const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=new&limit=10&t=week`;
          
          const resp = await fetch(url, {
            headers: { "User-Agent": "LeadHunter/1.0" },
          });

          if (!resp.ok) {
            console.warn(`Reddit API error for r/${sub}: ${resp.status}`);
            continue;
          }

          const data = await resp.json();
          const posts = data?.data?.children || [];

          for (const post of posts) {
            const p = post.data;
            if (!p || p.removed_by_category) continue;

            const content = `${p.title || ""}\n\n${p.selftext || ""}`.trim();
            if (!content || content.length < 20) continue;

            // Check if content actually matches intent keywords
            const lowerContent = content.toLowerCase();
            const hasIntent = searchKeywords.some(
              (kw: string) => lowerContent.includes(kw.toLowerCase())
            );
            if (!hasIntent) continue;

            allPosts.push({
              source: "reddit",
              source_url: `https://reddit.com${p.permalink}`,
              author: p.author || "unknown",
              title: p.title || "",
              content: content.substring(0, 2000),
              subreddit: p.subreddit || sub,
              user_id: userId,
            });
          }

          // Rate limit: wait between requests
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e) {
        console.warn(`Error scanning r/${sub}:`, e);
      }
    }

    // Deduplicate by source_url
    const seen = new Set<string>();
    const uniquePosts = allPosts.filter((p) => {
      if (seen.has(p.source_url)) return false;
      seen.add(p.source_url);
      return true;
    });

    console.log(`Found ${uniquePosts.length} unique intent posts from Reddit`);

    // Upsert to DB (ignore duplicates)
    let inserted = 0;
    for (const post of uniquePosts) {
      const { error } = await supabase.from("intent_leads").upsert(post, {
        onConflict: "user_id,source_url",
        ignoreDuplicates: true,
      });
      if (!error) inserted++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        found: uniquePosts.length,
        inserted,
        sources: searchSubreddits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scan-reddit error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
