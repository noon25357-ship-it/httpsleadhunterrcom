import type { Lead } from "./leadData";

export type SEOLevel = "strong" | "medium" | "weak";

export type OpportunityType =
  | "website"          // فرصة موقع إلكتروني
  | "reviews"          // فرصة تقييمات
  | "local_visibility" // فرصة ظهور محلي
  | "whatsapp_booking" // فرصة واتساب وحجز
  | "google_business"  // فرصة Google Business
  | "content";         // فرصة محتوى

export interface SEOOpportunity {
  score: number;             // 0-100
  level: SEOLevel;
  label: string;             // فرصة ظهور قوية/متوسطة/ضعيفة
  reasons: string[];         // 2-4 reasons
  suggested_local_keyword: string;
  suggested_offer: string;
  outreach_angle: string;
  opportunity_type: OpportunityType;
  opportunity_type_label: string;
  opportunity_type_reason: string;
}

export const SEO_BADGE: Record<SEOLevel, { label: string; emoji: string; classes: string }> = {
  strong: {
    label: "فرصة ظهور قوية",
    emoji: "🌿",
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  medium: {
    label: "فرصة ظهور متوسطة",
    emoji: "⚡",
    classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  weak: {
    label: "فرصة ضعيفة",
    emoji: "•",
    classes: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  },
};

export const OPPORTUNITY_TYPE_META: Record<OpportunityType, { label: string; emoji: string }> = {
  website:           { label: "فرصة موقع إلكتروني",     emoji: "🌐" },
  reviews:           { label: "فرصة تقييمات",            emoji: "⭐" },
  local_visibility:  { label: "فرصة ظهور محلي",          emoji: "📍" },
  whatsapp_booking:  { label: "فرصة واتساب وحجز",        emoji: "💬" },
  google_business:   { label: "فرصة Google Business",    emoji: "🗺️" },
  content:           { label: "فرصة محتوى",              emoji: "✍️" },
};

const HIGH_VALUE_CATEGORIES = [
  "عيادة", "عيادات", "أسنان", "جلدية", "تجميل",
  "عقار", "عقارات", "مطعم", "مطاعم",
  "مغسلة", "مغاسل", "صالون", "صالونات",
  "مركز تدريب", "تدريب",
];

const MAJOR_CITIES = ["الرياض", "جدة", "الخبر", "الدمام", "المدينة", "المدينة المنورة", "مكة"];

function isHighValueCategory(category: string): boolean {
  if (!category) return false;
  return HIGH_VALUE_CATEGORIES.some((c) => category.includes(c));
}

function isMajorCity(city: string): boolean {
  if (!city) return false;
  return MAJOR_CITIES.some((c) => city.includes(c));
}

/* ── Local keyword generator ── */
export function generateLocalKeyword(lead: Pick<Lead, "category" | "city" | "area">): string {
  const cat = (lead.category || "").trim();
  const city = (lead.city || "").trim();
  if (!cat && !city) return "خدمات محلية";

  const map: Record<string, string> = {
    عيادات: "عيادة أسنان",
    عيادة: "عيادة",
    أسنان: "تقويم أسنان",
    جلدية: "عيادة جلدية",
    تجميل: "مركز تجميل",
    عقارات: "مكتب عقار",
    عقار: "مكتب عقار",
    مطاعم: "مطعم",
    مطعم: "مطعم",
    كافيهات: "كافيه",
    صالونات: "صالون نسائي",
    صالون: "صالون",
    مغاسل: "مغسلة ملابس",
    مغسلة: "مغسلة",
    ورش: "ورشة سيارات",
    صيدليات: "صيدلية",
    "مركز تدريب": "مركز تدريب",
  };

  let phrase = cat;
  for (const key of Object.keys(map)) {
    if (cat.includes(key)) {
      phrase = map[key];
      break;
    }
  }

  return city ? `${phrase} في ${city}` : phrase;
}

/* ── Opportunity type detection ── */
function detectOpportunityType(lead: Lead): { type: OpportunityType; reason: string } {
  const cat = lead.category || "";

  // 1. لا يوجد موقع + تقييم جيد → فرصة موقع
  if (!lead.hasWebsite && lead.rating >= 4.0) {
    return {
      type: "website",
      reason: "النشاط تقييمه جيد لكن لا يوجد موقع واضح.",
    };
  }
  // 2. مراجعات قليلة → فرصة تقييمات
  if (lead.reviews < 15) {
    return {
      type: "reviews",
      reason: "عدد المراجعات قليل مقارنة بطبيعة القطاع.",
    };
  }
  // 3. مطاعم/كافيهات → فرصة واتساب وحجز
  if (cat.includes("مطعم") || cat.includes("مطاعم") || cat.includes("كافيه")) {
    return {
      type: "whatsapp_booking",
      reason: "النشاط يعتمد على الحجز والطلبات السريعة عبر واتساب.",
    };
  }
  // 4. لا يوجد موقع (بدون تقييم قوي) → Google Business
  if (!lead.hasWebsite) {
    return {
      type: "google_business",
      reason: "تحسين الملف على Google Business يرفع الظهور بسرعة.",
    };
  }
  // 5. عقار/خدمات → محتوى
  if (cat.includes("عقار") || cat.includes("تدريب")) {
    return {
      type: "content",
      reason: "صفحات محتوى محلية تجلب عملاء يبحثون بنية شراء.",
    };
  }
  // 6. الافتراضي → ظهور محلي
  return {
    type: "local_visibility",
    reason: "تحسين الكلمات المحلية يجلب عملاء قريبين من النشاط.",
  };
}

/* ── Offer suggestion (short, sales-focused) ── */
export function generateSuggestedOffer(lead: Pick<Lead, "category" | "hasWebsite" | "reviews">): string {
  const cat = lead.category || "";

  if (!lead.hasWebsite) {
    return "صفحة هبوط محلية + تحسين ظهور قوقل";
  }
  if (lead.reviews < 20) {
    return "تحسين Google Business + زيادة التقييمات";
  }
  if (cat.includes("عيادة") || cat.includes("أسنان") || cat.includes("جلدية") || cat.includes("تجميل")) {
    return "صفحة خدمة محلية (مثلاً: تقويم أسنان في جدة)";
  }
  if (cat.includes("عقار")) {
    return "صفحة محلية (مثلاً: مكتب عقار في شمال الرياض)";
  }
  if (cat.includes("مطعم") || cat.includes("مطاعم")) {
    return "تحسين الظهور في بحث المطاعم القريبة";
  }
  return "تحسين صفحات الخدمات والكلمات المحلية";
}

/* ── Outreach angle ── */
function generateOutreachAngle(lead: Pick<Lead, "hasWebsite" | "rating" | "reviews">): string {
  if (!lead.hasWebsite && lead.rating >= 4.0) {
    return "التقييم جيد، لكن الظهور ممكن يتحسن لأن النشاط لا يملك موقعًا واضحًا.";
  }
  if (!lead.hasWebsite) return "غياب موقع إلكتروني = فرصة ظهور سريعة في قوقل.";
  if (lead.reviews < 20) return "تحسين الملف الرقمي وزيادة التقييمات لرفع الظهور المحلي.";
  return "تحسين الكلمات المحلية لاستهداف عملاء جدد في نفس المنطقة.";
}

/* ── Main calculator ── */
export function calculateSEOOpportunity(lead: Lead): SEOOpportunity {
  let score = 0;
  const reasons: string[] = [];

  if (!lead.hasWebsite) {
    score += 25;
    reasons.push("لا يوجد موقع إلكتروني واضح يمثّل النشاط");
  }
  if (lead.phone) {
    score += 15;
    reasons.push("يسهل تحويل المهتمين إلى تواصل مباشر عبر واتساب");
  }
  if (lead.rating >= 4.2) {
    score += 15;
    reasons.push("تقييم ممتاز يستحق ظهور أقوى أمام العملاء");
  }
  if (lead.reviews >= 10 && lead.reviews <= 200) {
    score += 10;
    reasons.push("حجم مراجعات مناسب للنمو في البحث المحلي");
  }
  if (isHighValueCategory(lead.category)) {
    score += 20;
    reasons.push("القطاع يعتمد على بحث العملاء القريبين");
  }
  if (isMajorCity(lead.city)) {
    score += 10;
    reasons.push("المدينة فيها بحث محلي عالي على هذا النوع من الخدمات");
  }
  // Bonus: تقييم جيد + بدون موقع = فرصة ذهبية حقيقية
  if (!lead.hasWebsite && lead.rating >= 4.2) {
    score += 10;
    reasons.unshift("فرصة ذهبية: تقييم ممتاز بدون موقع إلكتروني");
  }

  if (score > 100) score = 100;

  const level: SEOLevel = score >= 70 ? "strong" : score >= 40 ? "medium" : "weak";
  const label = SEO_BADGE[level].label;

  const finalReasons = reasons.slice(0, 4);
  if (finalReasons.length < 2) {
    finalReasons.push("يمكن تحسين الظهور المحلي بخطوات بسيطة");
  }

  const oppType = detectOpportunityType(lead);

  return {
    score,
    level,
    label,
    reasons: finalReasons,
    suggested_local_keyword: generateLocalKeyword(lead),
    suggested_offer: generateSuggestedOffer(lead),
    outreach_angle: generateOutreachAngle(lead),
    opportunity_type: oppType.type,
    opportunity_type_label: OPPORTUNITY_TYPE_META[oppType.type].label,
    opportunity_type_reason: oppType.reason,
  };
}

/* ── WhatsApp message generator (Saudi tone, non-aggressive) ── */
export function generateWhatsappMessage(lead: Lead, opp: SEOOpportunity): string {
  const city = lead.city || "منطقتكم";
  const keyword = opp.suggested_local_keyword;

  return `السلام عليكم، لاحظت إن نشاطكم "${lead.name}" تقييمه جيد في قوقل، لكن ما ظهر لي موقع أو صفحة واضحة تستهدف بحث مثل: "${keyword}". ممكن تكون فيه فرصة بسيطة لتحسين ظهوركم للعملاء اللي يبحثون عن خدماتكم في ${city}. أقدر أرسل لكم ملاحظات مختصرة؟`;
}
