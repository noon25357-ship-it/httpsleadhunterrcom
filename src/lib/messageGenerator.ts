import type { Lead } from "./leadData";

export interface MessageContext {
  lead: Lead;
  service: string;
  tone: string;
}

interface WhyReason {
  key: string;
  text: string;
  messageHook: Record<string, string>; // tone → message snippet
}

function getReasons(lead: Lead): WhyReason[] {
  const reasons: WhyReason[] = [];

  if (!lead.hasWebsite) {
    reasons.push({
      key: "no_website",
      text: "بدون موقع إلكتروني",
      messageHook: {
        friendly: "لاحظت إن ما عندكم موقع إلكتروني",
        formal: "لاحظت أن نشاطكم التجاري لا يملك موقعًا إلكترونيًا",
      },
    });
  }

  if (lead.rating >= 4 && !lead.hasWebsite) {
    reasons.push({
      key: "high_rating_no_site",
      text: `تقييم عالي (${lead.rating}) بدون موقع`,
      messageHook: {
        friendly: `تقييمكم ${lead.rating} ⭐ ممتاز، بس العملاء ما يلقون موقع يتصفحونه`,
        formal: `تقييمكم المميز ${lead.rating} يدل على جودة خدماتكم، لكن غياب الموقع قد يفوّت عليكم فرصًا كثيرة`,
      },
    });
  } else if (lead.rating >= 4) {
    reasons.push({
      key: "high_rating",
      text: `تقييم ممتاز (${lead.rating} ⭐)`,
      messageHook: {
        friendly: `تقييمكم ${lead.rating} يدل إنكم ممتازين`,
        formal: `تقييمكم المتميز ${lead.rating} يعكس جودة عالية في خدماتكم`,
      },
    });
  }

  if (lead.reviews > 50) {
    reasons.push({
      key: "many_reviews",
      text: `عدد تقييمات كبير (${lead.reviews}+)`,
      messageHook: {
        friendly: `عندكم ${lead.reviews} تقييم وهذا يعني قاعدة عملاء ممتازة`,
        formal: `حجم التقييمات (${lead.reviews}) يشير إلى قاعدة عملاء واسعة`,
      },
    });
  }

  if (lead.isActive && !lead.hasWebsite) {
    reasons.push({
      key: "active_no_digital",
      text: "نشاط واضح لكن حضور رقمي ضعيف",
      messageHook: {
        friendly: "نشاطكم واضح بس حضوركم الرقمي يحتاج تقوية",
        formal: "نشاطكم التجاري واضح ومتميز، إلا أن تواجدكم الرقمي يحتاج تعزيزًا",
      },
    });
  }

  return reasons;
}

const categoryIntros: Record<string, Record<string, string>> = {
  مطاعم: {
    friendly: "السلام عليكم 👋\nشفت مطعمكم وأعجبني",
    formal: "السلام عليكم ورحمة الله\nاطلعت على مطعمكم المميز",
  },
  كافيهات: {
    friendly: "السلام عليكم 👋\nشفت الكافيه حقكم وعجبني",
    formal: "السلام عليكم ورحمة الله\nاطلعت على الكافيه الخاص بكم",
  },
  صالونات: {
    friendly: "السلام عليكم 👋\nشفت الصالون حقكم",
    formal: "السلام عليكم ورحمة الله\nاطلعت على صالونكم المميز",
  },
  ورش: {
    friendly: "السلام عليكم 👋\nشفت الورشة حقكم",
    formal: "السلام عليكم ورحمة الله\nاطلعت على ورشتكم",
  },
  عيادات: {
    friendly: "السلام عليكم 👋\nشفت العيادة حقكم",
    formal: "السلام عليكم ورحمة الله\nاطلعت على عيادتكم",
  },
};

const serviceOffers: Record<string, Record<string, string>> = {
  website: {
    friendly: "أقدر أسوي لكم موقع إلكتروني احترافي يجيب لكم عملاء أكثر ويعطي انطباع قوي 💪",
    formal: "يسعدني أن أقدم لكم خدمة تصميم موقع إلكتروني احترافي يعزز تواجدكم الرقمي ويستقطب المزيد من العملاء",
  },
  marketing: {
    friendly: "أقدر أساعدكم في التسويق الرقمي عشان توصلون لعملاء أكثر 📈",
    formal: "يسعدني تقديم خدمة التسويق الرقمي لتعزيز وصولكم واستقطاب شريحة أوسع من العملاء",
  },
  social: {
    friendly: "أقدر أدير لكم حسابات السوشال ميديا بشكل احترافي يزيد متابعينكم وعملاءكم 📱",
    formal: "يسعدني إدارة حساباتكم على منصات التواصل الاجتماعي لبناء حضور رقمي قوي ومؤثر",
  },
};

const ctas: Record<string, string> = {
  friendly: "إذا تبون نرتب موعد سريع أعرض عليكم الفكرة؟ 🚀",
  formal: "هل يمكننا ترتيب موعد قصير لعرض تفاصيل الخدمة؟\n\nمع خالص التقدير",
};

export function generateSmartMessage(ctx: MessageContext): string {
  const { lead, service, tone } = ctx;

  // 1. Category-aware intro
  const intro = categoryIntros[lead.category]?.[tone] || categoryIntros["مطاعم"][tone];

  // 2. Pick the best reason hook (prioritize combined reasons)
  const reasons = getReasons(lead);
  const bestReason = reasons.find(r => r.key === "high_rating_no_site")
    || reasons.find(r => r.key === "active_no_digital")
    || reasons.find(r => r.key === "no_website")
    || reasons[0];

  const hook = bestReason?.messageHook[tone] || "";

  // 3. Service offer
  const offer = serviceOffers[service]?.[tone] || serviceOffers.website[tone];

  // 4. CTA
  const cta = ctas[tone];

  // Build message
  const parts = [intro];
  if (hook) parts.push(hook);
  parts.push(offer);
  parts.push(cta);

  return parts.join("\n\n");
}

export function getWhyReasons(lead: Lead): { key: string; text: string }[] {
  return getReasons(lead).map(r => ({ key: r.key, text: r.text }));
}

export const SERVICE_OPTIONS = [
  { key: "website", label: "موقع إلكتروني", emoji: "🌐" },
  { key: "marketing", label: "تسويق رقمي", emoji: "📈" },
  { key: "social", label: "سوشال ميديا", emoji: "📱" },
];

export const TONE_OPTIONS = [
  { key: "friendly", label: "ودّي", emoji: "😊" },
  { key: "formal", label: "رسمي", emoji: "👔" },
];
