import type { Lead } from "./leadData";

export type ReadinessLevel = "hot" | "warm" | "low";

export type Niche =
  | "dental_clinic"
  | "beauty_clinic"
  | "real_estate"
  | "restaurant"
  | "cafe"
  | "car_wash"
  | "laundry"
  | "salon"
  | "car_repair"
  | "training_center"
  | "cleaning_company"
  | "pest_control"
  | "flowers_gifts"
  | "mobile_shop"
  | "general_local_business";

export type ObjectionType = "price" | "not_interested" | "send_details";

export interface SmartOutreach {
  contact_readiness_score: number;
  contact_readiness_level: ReadinessLevel;
  contact_reason: string;
  suggested_offer: string;
  local_angle: string;
  first_whatsapp_message: string;
  follow_up_message: string;
  next_best_action: string;
  objection_replies: Record<ObjectionType, string>;
  tags: string[];
  niche: Niche;
}

export const READINESS_BADGE: Record<
  ReadinessLevel,
  { label: string; emoji: string; classes: string }
> = {
  hot: {
    label: "جاهز للتواصل",
    emoji: "🟢",
    classes: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  warm: {
    label: "يحتاج مراجعة",
    emoji: "🟡",
    classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  low: {
    label: "أولوية منخفضة",
    emoji: "⚪",
    classes: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  },
};

const MAJOR_CITIES = [
  "الرياض", "جدة", "الدمام", "الخبر", "مكة", "المدينة",
  "الطائف", "القصيم", "بريدة", "حائل", "أبها", "خميس مشيط",
];

const HIGH_INTENT_KEYWORDS = [
  "عيادة", "أسنان", "جلدية", "تجميل",
  "عقار", "عقارات",
  "مطعم", "مطاعم", "كافيه", "كوفي",
  "مغسلة", "مغاسل", "صالون", "مشغل",
  "ورشة", "ورش",
  "مركز تدريب", "تدريب",
  "تنظيف", "مكافحة حشرات",
  "ورد", "هدايا",
  "جوالات", "جوال",
];

function isMajorCity(city: string): boolean {
  if (!city) return false;
  return MAJOR_CITIES.some((c) => city.includes(c));
}

function isHighIntent(category: string): boolean {
  if (!category) return false;
  return HIGH_INTENT_KEYWORDS.some((k) => category.includes(k));
}

/* ── Niche detection ── */
export function detectNiche(category: string): Niche {
  const c = (category || "").toLowerCase();
  const has = (...words: string[]) => words.some((w) => c.includes(w.toLowerCase()));

  if (has("أسنان", "dental", "dentist", "تقويم")) return "dental_clinic";
  if (has("جلدية", "تجميل", "ليزر", "بشرة", "beauty", "cosmetic")) return "beauty_clinic";
  if (has("عقار", "real estate", "property", "عقارات")) return "real_estate";
  if (has("مطعم", "مطاعم", "restaurant", "مطبخ", "شاورما", "بروست")) return "restaurant";
  if (has("كافيه", "كوفي", "coffee", "cafe", "قهوة")) return "cafe";
  if (has("مغسلة سيارات", "غسيل سيارات", "car wash")) return "car_wash";
  if (has("مغسلة", "مغاسل", "laundry", "ملابس")) return "laundry";
  if (has("صالون", "salon", "مشغل", "حلاق", "barber")) return "salon";
  if (has("ورشة", "ورش", "auto", "repair", "mechanic", "صيانة سيارات")) return "car_repair";
  if (has("تدريب", "training", "معهد", "أكاديمي")) return "training_center";
  if (has("تنظيف", "cleaning")) return "cleaning_company";
  if (has("مكافحة", "حشرات", "pest")) return "pest_control";
  if (has("ورد", "هدايا", "زهور", "flowers", "gifts")) return "flowers_gifts";
  if (has("جوالات", "جوال", "mobile", "هاتف")) return "mobile_shop";
  return "general_local_business";
}

/* ── Readiness calculation ── */
export function calculateContactReadiness(lead: Lead): {
  score: number;
  level: ReadinessLevel;
} {
  let score = 0;
  if (lead.phone) score += 20;
  if (!lead.hasWebsite) score += 25;
  if (lead.rating >= 4.2) score += 15;
  if (lead.reviews >= 10 && lead.reviews <= 250) score += 10;
  else if (lead.reviews < 10) score += 8;
  if (isMajorCity(lead.city)) score += 10;
  if (isHighIntent(lead.category)) score += 20;

  if (score > 100) score = 100;

  // Hot needs combination — not just "no website"
  const hotEligible =
    !!lead.phone && lead.rating >= 4.0 && isHighIntent(lead.category);

  let level: ReadinessLevel;
  if (score >= 75 && hotEligible) level = "hot";
  else if (score >= 75) level = "warm"; // downgrade if missing core combo
  else if (score >= 45) level = "warm";
  else level = "low";

  return { score, level };
}

/* ── Contact reason ── */
export function generateContactReason(lead: Lead, niche: Niche): string {
  if (!lead.hasWebsite && lead.rating >= 4.0) {
    return "النشاط تقييمه جيد لكن لا يوجد موقع واضح يساعد العملاء يعرفون الخدمات ويتواصلون بسهولة.";
  }
  if (lead.reviews < 10) {
    return "عدد التقييمات قليل، وهذا قد يقلل ثقة العملاء الجدد رغم وجود النشاط على قوقل.";
  }
  switch (niche) {
    case "restaurant":
    case "cafe":
      return "النشاط يعتمد على بحث العملاء القريبين، وتحسين ظهوره في قوقل قد يساعده يستقبل طلبات وزيارات أكثر.";
    case "real_estate":
      return "قطاع العقار يعتمد على الظهور المحلي حسب المدينة والحي، وهذا النشاط يمكن عرض صفحات محلية أو حملات واتساب عليه.";
    case "dental_clinic":
    case "beauty_clinic":
      return "العيادات تعتمد على الحجز والثقة، ووجود صفحة خدمة واضحة قد يحول الباحثين إلى مواعيد.";
    case "car_wash":
    case "car_repair":
      return "خدمة محلية يبحث عنها العميل بسرعة، وتحسين الظهور وزر الواتساب يرفع نسبة التحويل.";
    case "salon":
      return "العميلات يبحثن عن صالون قريب بتقييم جيد، وصفحة خدمات واضحة ترفع الحجز.";
    case "training_center":
      return "المتدربون يبحثون بنية تسجيل مباشر، وصفحة دورات محلية تختصر القرار.";
    case "cleaning_company":
    case "pest_control":
      return "الخدمة طلبها سريع، ووجود صفحة هبوط مع زر واتساب يجلب طلبات عرض سعر مباشرة.";
    default:
      return "تحسين ظهور النشاط في البحث المحلي يجلب عملاء جدد بنية تواصل واضحة.";
  }
}

/* ── Suggested offer per niche ── */
export function generateSuggestedOffer(_lead: Lead, niche: Niche): string {
  const map: Record<Niche, string> = {
    dental_clinic: "صفحة خدمة محلية + زر حجز واتساب + تحسين ملف قوقل",
    beauty_clinic: "صفحة خدمة للعلاجات الأكثر طلبًا + رسائل حجز واتساب",
    real_estate: "صفحات محلية حسب الأحياء + نموذج تواصل واتساب",
    restaurant: "تحسين ملف قوقل + صور ومنشورات أسبوعية + رابط طلب أو واتساب",
    cafe: "تحسين الظهور في بحث الكافيهات القريبة + منشورات Google Business",
    car_wash: "صفحة هبوط محلية + زر حجز سريع + تحسين كلمات البحث المحلية",
    laundry: "صفحة خدمة محلية + زر واتساب لطلب التوصيل",
    salon: "صفحة خدمات + واتساب حجز + إبراز العروض والتقييمات",
    car_repair: "صفحة خدمات واضحة + ظهور في بحث الورش القريبة + واتساب",
    training_center: "صفحات دورات محلية + نموذج تسجيل سريع",
    cleaning_company: "صفحة خدمة محلية + واتساب طلب عرض سعر",
    pest_control: "صفحة خدمة عاجلة + واتساب طلب فوري",
    flowers_gifts: "منشورات مناسبات + صفحة طلب واتساب",
    mobile_shop: "تحسين ملف قوقل + عروض محلية + واتساب استفسار",
    general_local_business: "صفحة هبوط محلية + تحسين ملف قوقل + رسالة واتساب واضحة",
  };
  return map[niche];
}

/* ── Short offer (card view) — 2 components max ── */
export function generateShortOffer(_lead: Lead, niche: Niche): string {
  const map: Record<Niche, string> = {
    dental_clinic: "صفحة حجز + رابط واتساب",
    beauty_clinic: "صفحة خدمة + واتساب حجز",
    real_estate: "صفحة حي محلية + واتساب",
    restaurant: "تحسين ملف قوقل + رابط واتساب",
    cafe: "تحسين ملف قوقل + منشورات",
    car_wash: "صفحة هبوط + حجز سريع",
    laundry: "صفحة خدمة + واتساب توصيل",
    salon: "صفحة خدمات + واتساب حجز",
    car_repair: "ظهور محلي + واتساب",
    training_center: "صفحة دورات + تسجيل",
    cleaning_company: "صفحة خدمة + واتساب",
    pest_control: "صفحة عاجلة + واتساب",
    flowers_gifts: "منشورات + واتساب طلب",
    mobile_shop: "تحسين ملف قوقل + واتساب",
    general_local_business: "تحسين ملف قوقل + رابط واتساب",
  };
  return map[niche];
}

/* ── Local angle ── */
function generateLocalAngle(lead: Lead, niche: Niche): string {
  const city = lead.city || "منطقتكم";
  if (niche === "real_estate") return `الباحثون عن عقار في ${city} يحتاجون صفحة محلية واضحة.`;
  if (niche === "restaurant" || niche === "cafe")
    return `العملاء القريبون في ${city} يبحثون بنية زيارة فورية.`;
  return `بحث العملاء المحليين في ${city} يمكن استثماره بظهور أوضح.`;
}

/* ── First WhatsApp message ── */
export function generateFirstWhatsappMessage(
  lead: Lead,
  niche: Niche,
  _reason: string,
  _offer: string,
): string {
  const city = lead.city || "منطقتكم";

  if (!lead.hasWebsite) {
    return `السلام عليكم، لاحظت نشاطكم "${lead.name}" في قوقل وتقييمكم جيد، لكن ما ظهر لي موقع أو صفحة واضحة تعرض خدماتكم وتسهل التواصل. فيه فرصة بسيطة لتحسين الظهور وتحويل الباحثين إلى واتساب. أقدر أرسل لكم ملاحظتين؟`;
  }
  if (niche === "restaurant" || niche === "cafe") {
    return `السلام عليكم، لاحظت ${niche === "cafe" ? "كافيهكم" : "مطعمكم"} "${lead.name}" في قوقل وتقييمكم جيد. فيه فرصة تقوون ظهوركم للناس اللي يبحثون عن مكان قريب في ${city}. أقدر أرسل لكم فكرة مختصرة؟`;
  }
  if (niche === "real_estate") {
    return `السلام عليكم، شفت مكتبكم "${lead.name}" في قوقل، وفيه فرصة تظهرون أكثر للباحثين عن عقار في ${city}. عندي ملاحظة بسيطة ممكن تساعدكم تجيبون استفسارات أكثر من البحث المحلي.`;
  }
  return `السلام عليكم، لاحظت نشاطكم "${lead.name}" في قوقل وشفت فيه فرصة بسيطة لتحسين ظهوركم للعملاء اللي يبحثون عن خدماتكم في ${city}. أقدر أرسل لكم ملاحظتين مختصرات؟`;
}

/* ── Follow-up message ── */
export function generateFollowUpMessage(_lead: Lead, _niche: Niche, _reason: string, _offer: string): string {
  return `أهلًا، بس أتابع معك بخصوص الملاحظة اللي أرسلتها عن تحسين ظهوركم في قوقل. أقدر أرسل لك مثال سريع يوضح الفكرة؟`;
}

/* ── Objection replies ── */
export function generateObjectionReply(_lead: Lead, _niche: Niche, type: ObjectionType): string {
  const replies: Record<ObjectionType, string> = {
    price:
      "فاهم عليك. الفكرة مو حملة كبيرة أو تكلفة عالية، نبدأ بخطوة بسيطة توضح خدماتكم وتسهّل وصول العملاء لكم، وبعدها تقيسون النتائج.",
    not_interested:
      "تمام، ولا يهمك. بخليها عندك كملاحظة: تحسين الظهور المحلي يفيد جدًا لما العميل يبحث قريب منك. بالتوفيق لكم.",
    send_details:
      "أكيد. أرسل لك ملخص بسيط: الفكرة نجهز لكم ظهور أوضح في قوقل من خلال صفحة/ملف مرتب، كلمات محلية مناسبة، وزر واتساب واضح لتحويل المهتمين لتواصل مباشر.",
  };
  return replies[type];
}

/* ── Next best action ── */
export function generateNextBestAction(lead: Lead, outreach: { contact_readiness_level: ReadinessLevel }): string {
  if (outreach.contact_readiness_level === "hot" && lead.phone) {
    return "أرسل الرسالة الأولى عبر واتساب الآن.";
  }
  if (outreach.contact_readiness_level === "hot") {
    return "افتح ملف النشاط في قوقل واحصل على رقم تواصل مباشر.";
  }
  if (outreach.contact_readiness_level === "warm") {
    return "راجع البيانات بسرعة، ثم أرسل رسالة قصيرة لاختبار الاهتمام.";
  }
  return "أجّل التواصل وركّز على فرص أعلى جاهزية.";
}

/* ── Tags ── */
function generateTags(lead: Lead): string[] {
  const tags: string[] = [];
  if (!lead.hasWebsite) tags.push("بدون موقع");
  if (lead.rating >= 4.2) tags.push("تقييم جيد");
  if (lead.phone) tags.push("واتساب متاح");
  if (lead.reviews < 10) tags.push("مراجعات قليلة");
  if (isMajorCity(lead.city)) tags.push("مدينة رئيسية");
  if (isHighIntent(lead.category)) tags.push("قطاع عالي النية");
  return tags.slice(0, 4);
}

/* ── Main composer ── */
export function generateSmartOutreach(lead: Lead): SmartOutreach {
  const niche = detectNiche(lead.category);
  const { score, level } = calculateContactReadiness(lead);
  const reason = generateContactReason(lead, niche);
  const offer = generateSuggestedOffer(lead, niche);
  const local_angle = generateLocalAngle(lead, niche);
  const first = generateFirstWhatsappMessage(lead, niche, reason, offer);
  const follow = generateFollowUpMessage(lead, niche, reason, offer);
  const nba = generateNextBestAction(lead, { contact_readiness_level: level });

  return {
    contact_readiness_score: score,
    contact_readiness_level: level,
    contact_reason: reason,
    suggested_offer: offer,
    local_angle,
    first_whatsapp_message: first,
    follow_up_message: follow,
    next_best_action: nba,
    objection_replies: {
      price: generateObjectionReply(lead, niche, "price"),
      not_interested: generateObjectionReply(lead, niche, "not_interested"),
      send_details: generateObjectionReply(lead, niche, "send_details"),
    },
    tags: generateTags(lead),
    niche,
  };
}

/* ── WhatsApp phone cleaner ── */
export function cleanSaudiPhone(phone: string | undefined | null): string | null {
  if (!phone) return null;
  let p = phone.replace(/[\s\-()+]/g, "").replace(/\D/g, "");
  if (!p) return null;
  if (p.startsWith("00966")) p = p.slice(2);
  if (p.startsWith("966")) {
    if (p.length >= 11 && p.length <= 13) return p;
    return null;
  }
  if (p.startsWith("05") && p.length === 10) return "966" + p.slice(1);
  if (p.startsWith("5") && p.length === 9) return "966" + p;
  return null;
}
