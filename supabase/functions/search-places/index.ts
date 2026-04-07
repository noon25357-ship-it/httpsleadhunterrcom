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
}

// Category mapping for search queries
const categorySearchTerms: Record<string, string> = {
  مطاعم: "restaurants",
  كافيهات: "cafes",
  صالونات: "beauty salons",
  ورش: "car repair shops",
  عيادات: "clinics",
  محلات_ملابس: "clothing stores",
  صيدليات: "pharmacies",
  فنادق: "hotels",
  مدارس: "schools",
  مكتبات: "bookstores",
  عقارات: "real estate agencies",
};

// City coordinates for SerpAPI
const cityCoords: Record<string, { lat: number; lng: number; nameEn: string }> = {
  الرياض: { lat: 24.7136, lng: 46.6753, nameEn: "Riyadh" },
  جدة: { lat: 21.4858, lng: 39.1925, nameEn: "Jeddah" },
  الدمام: { lat: 26.4207, lng: 50.0888, nameEn: "Dammam" },
  "المدينة المنورة": { lat: 24.4539, lng: 39.6142, nameEn: "Medina" },
  مكة: { lat: 21.3891, lng: 39.8579, nameEn: "Mecca" },
  الخبر: { lat: 26.2172, lng: 50.1971, nameEn: "Khobar" },
  تبوك: { lat: 28.3835, lng: 36.5662, nameEn: "Tabuk" },
  أبها: { lat: 18.2164, lng: 42.5053, nameEn: "Abha" },
  القصيم: { lat: 26.3260, lng: 43.9750, nameEn: "Qassim" },
  حائل: { lat: 27.5114, lng: 41.7208, nameEn: "Hail" },
  الطائف: { lat: 21.2703, lng: 40.4158, nameEn: "Taif" },
  "خميس مشيط": { lat: 18.3066, lng: 42.7283, nameEn: "Khamis Mushait" },
  نجران: { lat: 17.4933, lng: 44.1322, nameEn: "Najran" },
};

function calculateScore(lead: {
  hasWebsite: boolean;
  phone: string;
  reviews: number;
  rating: number;
  isActive: boolean;
}): { score: number; label: "hot" | "warm" | "cold" } {
  let score = 0;
  if (!lead.hasWebsite) score += 40;
  if (lead.phone) score += 10;
  if (lead.reviews > 50) score += 20;
  if (lead.rating >= 4) score += 20;
  if (lead.isActive) score += 10;
  const label = score >= 80 ? "hot" : score >= 50 ? "warm" : "cold";
  return { score, label };
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

    const { city, category } = await req.json();

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

    const searchTerm = categorySearchTerms[category] || category;
    const query = `${searchTerm} in ${coords.nameEn}`;

    // Use SerpAPI Google Maps endpoint
    const serpUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&ll=@${coords.lat},${coords.lng},14z&type=search&api_key=${SERPAPI_KEY}`;

    console.log("SerpAPI searching for:", query);
    const serpResp = await fetch(serpUrl);
    const serpData = await serpResp.json();

    if (serpData.error) {
      console.error("SerpAPI error:", serpData.error);
      return new Response(
        JSON.stringify({ error: `SerpAPI error: ${serpData.error}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const places = serpData.local_results || [];
    console.log(`Found ${places.length} places via SerpAPI`);

    const detailedLeads: PlaceResult[] = [];

    // Process up to 15 results
    const placesToProcess = places.slice(0, 15);

    for (const place of placesToProcess) {
      try {
        const hasWebsite = !!place.website;
        const phone = place.phone || "";
        const reviews = place.reviews || 0;
        const rating = place.rating || 0;
        const isActive = place.type !== "permanently_closed";

        const { score, label } = calculateScore({ hasWebsite, phone, reviews, rating, isActive });

        // Extract area from address
        const address = place.address || "";
        const addressParts = address.split("،");
        const area = addressParts.length > 1 ? addressParts[1].trim() : addressParts[0]?.trim() || city;

        detailedLeads.push({
          id: `sp-${place.place_id || place.data_id || Math.random().toString(36).substr(2, 9)}`,
          name: place.title || "Unknown",
          category,
          area,
          city,
          rating,
          reviews,
          phone: phone.replace(/\s/g, ""),
          hasWebsite,
          isActive,
          score,
          label,
          mapsUrl: place.place_id
            ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
            : `https://maps.google.com/?q=${encodeURIComponent((place.title || "") + " " + city)}`,
          address,
          websiteUrl: place.website || "",
        });
      } catch (e) {
        console.error("Error processing place:", e);
        continue;
      }
    }

    // Sort by score descending
    detailedLeads.sort((a, b) => b.score - a.score);

    console.log(`Returning ${detailedLeads.length} leads`);

    return new Response(JSON.stringify({ leads: detailedLeads, total: detailedLeads.length }), {
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
