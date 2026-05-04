import type { Lead } from "./leadData";

export type SEOLevel = "strong" | "medium" | "weak";

export interface SEOOpportunity {
  score: number;             // 0-100
  level: SEOLevel;
  label: string;             // فرصة ظهور قوية/متوسطة/ضعيفة
  reasons: string[];         // 2-4 reasons
  suggested_local_keyword: string;
  suggested_offer: string;
  outreach_angle: string;
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

  // Map common categories to natural Arabic search phrases
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

/* ── Offer suggestion ── */
export function generateSuggestedOffer(lead: Pick<Lead, "category" | "hasWebsite" | "reviews">): string {
  const cat = lead.category || "";

  if (cat.includes("عيادة") || cat.includes("أسنان") || cat.includes("جلدية") || cat.includes("تجميل")) {
    return "صفحة خدمة محلية مثل: تقويم أسنان في جدة";
  }
  if (cat.includes("عقار")) {
    return "صفحة محلية مثل: مكتب عقار في شمال الرياض";
  }
  if (cat.includes("مطعم") || cat.includes("مطاعم")) {
    return "تحسين الظهور في بحث المطاعم القريبة";
  }
  if (!lead.hasWebsite) {
    return "صفحة هبوط محلية تظهر في قوقل";
  }
  if (lead.reviews < 20) {
    return "تحسين Google Business Profile وزيادة التقييمات";
  }
  return "تحسين صفحات الخدمات والكلمات المحلية";
}

/* ── Outreach angle ── */
function generateOutreachAngle(lead: Pick<Lead, "hasWebsite" | "rating" | "reviews">): string {
  if (!lead.hasWebsite) return "غياب موقع إلكتروني = فرصة ظهور سريعة في قوقل";
  if (lead.rating >= 4.2 && lead.reviews >= 10) return "تقييم ممتاز يحتاج فقط ظهور أقوى للعملاء القريبين";
  if (lead.reviews < 20) return "تحسين الملف الرقمي وزيادة التقييمات لرفع الظهور المحلي";
  return "تحسين الكلمات المحلية لاستهداف عملاء جدد في نفس المنطقة";
}

/* ── Main calculator ── */
export function calculateSEOOpportunity(lead: Lead): SEOOpportunity {
  let score = 0;
  const reasons: string[] = [];

  if (!lead.hasWebsite) {
    score += 35;
    reasons.push("لا يوجد موقع إلكتروني واضح");
  }
  if (lead.phone) {
    score += 10;
    reasons.push("وجود رقم تواصل يجعل فرصة البيع أسهل");
  }
  if (lead.rating >= 4.2) {
    score += 15;
    reasons.push("التقييم جيد ويمكن تحويله إلى ظهور أقوى في قوقل");
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
    reasons.push("النشاط مناسب لكلمات بحث محلية عالية النية");
  }

  if (score > 100) score = 100;

  const level: SEOLevel = score >= 70 ? "strong" : score >= 40 ? "medium" : "weak";
  const label = SEO_BADGE[level].label;

  // Trim reasons to 2-4
  const finalReasons = reasons.slice(0, 4);
  if (finalReasons.length < 2) {
    finalReasons.push("يمكن تحسين الظهور المحلي بخطوات بسيطة");
  }

  return {
    score,
    level,
    label,
    reasons: finalReasons,
    suggested_local_keyword: generateLocalKeyword(lead),
    suggested_offer: generateSuggestedOffer(lead),
    outreach_angle: generateOutreachAngle(lead),
  };
}

/* ── WhatsApp message generator ── */
export function generateWhatsappMessage(lead: Lead, opp: SEOOpportunity): string {
  const city = lead.city || "منطقتكم";
  const keyword = opp.suggested_local_keyword;

  return `السلام عليكم، لاحظت إن نشاطكم "${lead.name}" تقييمه جيد في قوقل، لكن ما ظهر لي موقع أو صفحة واضحة تستهدف بحث مثل: "${keyword}". ممكن تكون فيه فرصة بسيطة لتحسين ظهوركم للعملاء اللي يبحثون عن خدماتكم في ${city}. أقدر أرسل لكم ملاحظات مختصرة؟`;
}
