import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PlaceResult {
  id: string;
  name: string;
  category: string;
  area: string;
  city: string;
  rating: number;
  reviews: number;
  phone: string;
  hasWebsite: boolean;
  isActive: boolean;
  score: number;
  label: "hot" | "warm" | "cold";
  mapsUrl: string;
  address?: string;
  websiteUrl?: string;
  // Smart enrichment
  insights?: string[];
  socialPresence?: { instagram?: boolean; whatsapp?: boolean; tiktok?: boolean };
  priceLevel?: number;
  yearsActive?: number | null;
  isChain?: boolean;
  goldenOpportunity?: boolean;
}

// Multi-query search terms per category (Arabic + English variations for richer results)
const categorySearchTerms: Record<string, string[]> = {
  مطاعم: ["restaurants", "مطاعم", "local restaurants", "family restaurants"],
  كافيهات: ["cafes", "كافيهات", "coffee shops", "specialty coffee"],
  صالونات: ["beauty salons", "صالون نسائي", "hair salons", "صالون رجالي barber"],
  ورش: ["car repair shops", "ورش سيارات", "auto mechanic", "ورشة صيانة"],
  عيادات: ["medical clinics", "عيادات", "dental clinics", "عيادة أسنان"],
  محلات_ملابس: ["clothing stores", "محلات ملابس", "boutiques", "fashion stores"],
  صيدليات: ["pharmacies", "صيدليات"],
  فنادق: ["hotels", "فنادق", "boutique hotels", "شقق فندقية"],
  مدارس: ["private schools", "مدارس أهلية", "academies"],
  مكتبات: ["bookstores", "مكتبات", "stationery stores", "office supplies"],
  عقارات: ["real estate agencies", "مكاتب عقارات", "property management", "مكتب عقاري"],
  جيم: ["gyms", "جيم", "fitness centers", "نادي رياضي"],
  مغاسل: ["car wash", "مغسلة سيارات", "laundry", "مغسلة ملابس"],
  حلاقة: ["barber shops", "محلات حلاقة", "men salon"],
};

// City coordinates + popular districts for area-level search
const cityCoords: Record<string, { lat: number; lng: number; nameEn: string; districts: string[] }> = {
  الرياض: {
    lat: 24.7136, lng: 46.6753, nameEn: "Riyadh",
    districts: ["Olaya", "Al Malqa", "Al Yasmin", "Al Naseem", "Hittin", "Al Wurud", "King Abdullah District"],
  },
  جدة: {
    lat: 21.4858, lng: 39.1925, nameEn: "Jeddah",
    districts: ["Al Hamra", "Al Rawdah", "Al Salamah", "Al Shati", "Obhur", "Al Naeem"],
  },
  الدمام: {
    lat: 26.4207, lng: 50.0888, nameEn: "Dammam",
    districts: ["Al Faisaliyah", "Al Shati", "Al Khalidiyah", "Al Mazruiyah"],
  },
  "المدينة المنورة": { lat: 24.4539, lng: 39.6142, nameEn: "Medina", districts: ["Al Aziziyah", "Quba"] },
  مكة: { lat: 21.3891, lng: 39.8579, nameEn: "Mecca", districts: ["Al Aziziyah", "Al Awali"] },
  الخبر: { lat: 26.2172, lng: 50.1971, nameEn: "Khobar", districts: ["Al Aqrabiyah", "Al Rakah", "Al Thuqbah"] },
  تبوك: { lat: 28.3835, lng: 36.5662, nameEn: "Tabuk", districts: [] },
  أبها: { lat: 18.2164, lng: 42.5053, nameEn: "Abha", districts: [] },
  القصيم: { lat: 26.3260, lng: 43.9750, nameEn: "Buraidah", districts: [] },
  حائل: { lat: 27.5114, lng: 41.7208, nameEn: "Hail", districts: [] },
  الطائف: { lat: 21.2703, lng: 40.4158, nameEn: "Taif", districts: [] },
  "خميس مشيط": { lat: 18.3066, lng: 42.7283, nameEn: "Khamis Mushait", districts: [] },
  نجران: { lat: 17.4933, lng: 44.1322, nameEn: "Najran", districts: [] },
};

// Known chain keywords — leads matching are flagged (chains rarely buy from freelancers)
const CHAIN_KEYWORDS = [
  "starbucks", "ستاربكس", "mcdonald", "ماكدونالدز", "kfc", "كنتاكي", "burger king", "برجر كينج",
  "dunkin", "دانكن", "subway", "صب واي", "pizza hut", "بيتزا هت", "domino", "دومينوز",
  "herfy", "هرفي", "albaik", "البيك", "kudu", "كودو", "shawarmer", "شاورمر",
  "tim hortons", "تيم هورتنز", "costa", "كوستا", "barn", "البرن", "dr. cafe", "دكتور كيف",
  "carrefour", "كارفور", "danube", "الدانوب", "lulu", "لولو", "panda", "بنده",
  "nahdi", "النهدي", "dawaa", "الدواء",
];

interface SmartScore {
  score: number;
  label: "hot" | "warm" | "cold";
  insights: string[];
  goldenOpportunity: boolean;
}

function calculateSmartScore(lead: {
  hasWebsite: boolean;
  phone: string;
  reviews: number;
  rating: number;
  isActive: boolean;
  isChain: boolean;
  hasInstagram?: boolean;
  yearsActive?: number | null;
}): SmartScore {
  let score = 0;
  const insights: string[] = [];

  // Negative: chains are bad leads
  if (lead.isChain) {
    score -= 30;
    insights.push("🏢 سلسلة كبيرة — احتمالية ضعيفة");
  }

  // Strongest signal: no website = real opportunity
  if (!lead.hasWebsite) {
    score += 45;
    insights.push("🌐 بدون موقع — فرصة ذهبية");
  } else {
    score += 5;
  }

  // Has phone = reachable
  if (lead.phone) score += 10;

  // Engaged customer base = real business with budget
  if (lead.reviews >= 100) {
    score += 25;
    insights.push("⭐ +100 تقييم — نشاط ناضج");
  } else if (lead.reviews >= 50) {
    score += 15;
  } else if (lead.reviews >= 10) {
    score += 8;
  } else if (lead.reviews < 5 && lead.reviews > 0) {
    insights.push("🆕 نشاط جديد — جاهز للنمو");
    score += 10;
  }

  // High rating = quality business
  if (lead.rating >= 4.5) {
    score += 20;
    insights.push("🏆 تقييم ممتاز");
  } else if (lead.rating >= 4.0) {
    score += 12;
  } else if (lead.rating > 0 && lead.rating < 3.5) {
    insights.push("⚠️ تقييم منخفض — يحتاج تحسين سمعة");
    score += 8;
  }

  if (lead.isActive) score += 5;

  // Golden opportunity: no website + good rating + reviews + not a chain
  const goldenOpportunity =
    !lead.hasWebsite && lead.rating >= 4 && lead.reviews >= 30 && !lead.isChain;

  if (goldenOpportunity) {
    score += 15;
    insights.unshift("💎 فرصة ذهبية مؤكدة");
  }

  score = Math.max(0, Math.min(100, score));
  const label: "hot" | "warm" | "cold" =
    score >= 75 ? "hot" : score >= 45 ? "warm" : "cold";

  return { score, label, insights, goldenOpportunity };
}

function isChainBusiness(name: string): boolean {
  const lower = name.toLowerCase();
  return CHAIN_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function detectSocialPresence(place: any): { instagram?: boolean; whatsapp?: boolean; tiktok?: boolean } {
  const website = (place.website || "").toLowerCase();
  const desc = (place.description || "").toLowerCase();
  const haystack = `${website} ${desc}`;
  return {
    instagram: haystack.includes("instagram.com") || haystack.includes("@"),
    whatsapp: haystack.includes("wa.me") || haystack.includes("whatsapp"),
    tiktok: haystack.includes("tiktok.com"),
  };
}

async function fetchSerpResults(
  query: string,
  coords: { lat: number; lng: number },
  apiKey: string,
  zoom = 13
): Promise<any[]> {
  const url = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&ll=@${coords.lat},${coords.lng},${zoom}z&type=search&api_key=${apiKey}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.error) {
      console.warn(`SerpAPI warning for "${query}":`, data.error);
      return [];
    }
    return data.local_results || [];
  } catch (e) {
    console.error(`SerpAPI fetch error for "${query}":`, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SERPAPI_KEY = Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_KEY) {
      return new Response(
        JSON.stringify({ error: "SerpAPI key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { city, category, filters = {} } = body as {
      city: string;
      category: string;
      filters?: {
        excludeChains?: boolean;
        onlyNoWebsite?: boolean;
        minRating?: number;
        minReviews?: number;
        maxResults?: number;
        deepSearch?: boolean; // multi-query + districts
      };
    };

    if (!city || !category) {
      return new Response(
        JSON.stringify({ error: "city and category are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const coords = cityCoords[city];
    if (!coords) {
      return new Response(
        JSON.stringify({ error: `City "${city}" not supported` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const terms = categorySearchTerms[category] || [category];
    const queries: { q: string; coords: { lat: number; lng: number }; zoom: number }[] = [];

    // Always: primary terms in city center
    const primaryTerms = filters.deepSearch ? terms : terms.slice(0, 2);
    for (const term of primaryTerms) {
      queries.push({ q: `${term} in ${coords.nameEn}`, coords, zoom: 13 });
    }

    // Deep search: scan top districts as well
    if (filters.deepSearch && coords.districts.length > 0) {
      const topDistricts = coords.districts.slice(0, 3);
      for (const district of topDistricts) {
        queries.push({
          q: `${terms[0]} in ${district}, ${coords.nameEn}`,
          coords,
          zoom: 14,
        });
      }
    }

    console.log(`🔍 Smart search: ${queries.length} queries for ${category} in ${city}`);

    // Run queries in parallel
    const allResultsArrays = await Promise.all(
      queries.map((q) => fetchSerpResults(q.q, q.coords, SERPAPI_KEY, q.zoom))
    );

    // Merge + dedupe by place_id / data_id / name
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const arr of allResultsArrays) {
      for (const place of arr) {
        const key = place.place_id || place.data_id || (place.title || "").toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(place);
      }
    }

    console.log(`📦 Merged ${merged.length} unique places from ${queries.length} queries`);

    const detailedLeads: PlaceResult[] = [];

    for (const place of merged) {
      try {
        const name = place.title || "Unknown";
        const hasWebsite = !!place.website;
        const phone = (place.phone || "").replace(/\s/g, "");
        const reviews = place.reviews || 0;
        const rating = place.rating || 0;
        const isActive = place.type !== "permanently_closed" && !place.permanently_closed;
        const isChain = isChainBusiness(name);
        const social = detectSocialPresence(place);

        // Apply filters
        if (filters.excludeChains && isChain) continue;
        if (filters.onlyNoWebsite && hasWebsite) continue;
        if (filters.minRating && rating < filters.minRating) continue;
        if (filters.minReviews && reviews < filters.minReviews) continue;

        const { score, label, insights, goldenOpportunity } = calculateSmartScore({
          hasWebsite, phone, reviews, rating, isActive, isChain,
          hasInstagram: social.instagram,
        });

        const address = place.address || "";
        const addressParts = address.split(/[،,]/);
        const area = addressParts.length > 1 ? addressParts[1].trim() : addressParts[0]?.trim() || city;

        detailedLeads.push({
          id: `sp-${place.place_id || place.data_id || Math.random().toString(36).substr(2, 9)}`,
          name,
          category,
          area,
          city,
          rating,
          reviews,
          phone,
          hasWebsite,
          isActive,
          score,
          label,
          mapsUrl: place.place_id
            ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
            : `https://maps.google.com/?q=${encodeURIComponent(name + " " + city)}`,
          address,
          websiteUrl: place.website || "",
          insights,
          socialPresence: social,
          priceLevel: place.price,
          isChain,
          goldenOpportunity,
        });
      } catch (e) {
        console.error("Error processing place:", e);
        continue;
      }
    }

    // Smart sort: golden opportunities first, then by score
    detailedLeads.sort((a, b) => {
      if (a.goldenOpportunity && !b.goldenOpportunity) return -1;
      if (!a.goldenOpportunity && b.goldenOpportunity) return 1;
      return b.score - a.score;
    });

    const max = filters.maxResults || 30;
    const final = detailedLeads.slice(0, max);

    const stats = {
      total: final.length,
      golden: final.filter((l) => l.goldenOpportunity).length,
      noWebsite: final.filter((l) => !l.hasWebsite).length,
      chains: final.filter((l) => l.isChain).length,
      hot: final.filter((l) => l.label === "hot").length,
    };

    console.log(`✅ Returning ${final.length} leads`, stats);

    return new Response(JSON.stringify({ leads: final, total: final.length, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-places error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
