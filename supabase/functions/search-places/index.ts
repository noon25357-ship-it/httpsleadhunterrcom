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

// Category mapping to Google Places types
const categoryToType: Record<string, string> = {
  مطاعم: "restaurant",
  كافيهات: "cafe",
  صالونات: "beauty_salon",
  ورش: "car_repair",
  عيادات: "doctor",
  محلات_ملابس: "clothing_store",
  صيدليات: "pharmacy",
  فنادق: "lodging",
  مدارس: "school",
  مكتبات: "book_store",
};

// City coordinates
const cityCoords: Record<string, { lat: number; lng: number }> = {
  الرياض: { lat: 24.7136, lng: 46.6753 },
  جدة: { lat: 21.4858, lng: 39.1925 },
  الدمام: { lat: 26.4207, lng: 50.0888 },
  "المدينة المنورة": { lat: 24.4539, lng: 39.6142 },
  مكة: { lat: 21.3891, lng: 39.8579 },
  الخبر: { lat: 26.2172, lng: 50.1971 },
  تبوك: { lat: 28.3835, lng: 36.5662 },
  أبها: { lat: 18.2164, lng: 42.5053 },
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
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Google Places API key not configured" }),
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

    const placeType = categoryToType[category] || "establishment";

    // Step 1: Text Search to find places
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(category + " في " + city)}&location=${coords.lat},${coords.lng}&radius=15000&type=${placeType}&language=ar&key=${GOOGLE_API_KEY}`;

    console.log("Searching for:", category, "in", city);
    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", searchData.status, searchData.error_message);
      return new Response(
        JSON.stringify({ error: `Google API error: ${searchData.status}`, details: searchData.error_message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const places = searchData.results || [];
    console.log(`Found ${places.length} places`);

    // Step 2: Get details for each place (limited to first 10 for speed)
    const detailedLeads: PlaceResult[] = [];

    const placesToProcess = places.slice(0, 10);

    for (const place of placesToProcess) {
      try {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,business_status,url,geometry&language=ar&key=${GOOGLE_API_KEY}`;

        const detailResp = await fetch(detailUrl);
        const detailData = await detailResp.json();

        if (detailData.status !== "OK") continue;

        const d = detailData.result;
        const hasWebsite = !!d.website;
        const phone = d.formatted_phone_number || "";
        const reviews = d.user_ratings_total || 0;
        const rating = d.rating || 0;
        const isActive = d.business_status === "OPERATIONAL";

        const { score, label } = calculateScore({ hasWebsite, phone, reviews, rating, isActive });

        // Extract area from address
        const addressParts = (d.formatted_address || "").split("،");
        const area = addressParts.length > 1 ? addressParts[1].trim() : addressParts[0]?.trim() || city;

        detailedLeads.push({
          id: `gp-${place.place_id}`,
          name: d.name || place.name,
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
          mapsUrl: d.url || `https://maps.google.com/?q=${encodeURIComponent(d.name + " " + city)}`,
          address: d.formatted_address || "",
          websiteUrl: d.website || "",
        });
      } catch (e) {
        console.error("Error fetching place details:", e);
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
