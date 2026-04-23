/**
 * Contact Intelligence Engine
 * ---------------------------
 * Turns raw lead data into a single actionable decision:
 *   • Who to contact   (likely decision maker)
 *   • How to contact   (best public path — never private mobile)
 *   • Why it matters   (reason tags)
 *   • What to do next  (one clear action)
 *   • What to say      (ready outreach message)
 *
 * Pure rule-based. No scraping. Public business signals only.
 * Designed to be extensible: add new rules in `inferDecisionMaker`,
 * `inferContactPath`, or `buildReasonTags`.
 */

export type Confidence = "high" | "medium" | "low";

export type ContactChannel =
  | "whatsapp"
  | "phone"
  | "instagram"
  | "contact_form"
  | "email";

export interface ContactPath {
  channel: ContactChannel;
  label: string;
  confidence: Confidence;
  reason: string;
  /** Optional URL the UI can open directly */
  href?: string;
}

export interface DecisionMaker {
  role: string;
  confidence: Confidence;
  reason: string;
}

export interface ContactIntelligence {
  best_contact_path: ContactPath;
  likely_decision_maker: DecisionMaker;
  reason_tags: string[];
  next_best_action: string;
  outreach_message: string;
}

/** Generic shape — works with both `Lead` and `SmartLead`. */
export interface LeadLike {
  name?: string;
  businessName?: string;
  category?: string;
  city?: string;
  area?: string;
  phone?: string;
  email?: string;
  website?: string;
  websiteUrl?: string;
  hasWebsite?: boolean;
  websiteStatus?: "no-website" | "weak-website" | "has-website";
  instagram?: string;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  isActive?: boolean;
}

/* ────────────────────────────────────────────────────────────
   Normalization
   ──────────────────────────────────────────────────────────── */

interface Normalized {
  name: string;
  category: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  hasWebsite: boolean;
  websiteWeak: boolean;
  rating: number;
  reviews: number;
  isLocalSmallBusiness: boolean;
  isMultiBranchSignal: boolean;
}

const SMALL_LOCAL_CATEGORIES = [
  "مطاعم", "كافيهات", "صالونات", "ورش", "عيادات",
  "restaurants", "cafes", "salons", "workshops", "clinics",
  "خدمات", "زهور وهدايا",
];

/** Heuristic: names with "شركة / مؤسسة / مجموعة / Group / Co" hint at multi-branch. */
const MULTI_BRANCH_HINTS = /شركة|مؤسسة|مجموعة|سلسلة|فروع|group|holding|co\.|corp|chain/i;

function normalize(lead: LeadLike): Normalized {
  const name = lead.businessName || lead.name || "";
  const category = lead.category || "";
  const website = lead.website || lead.websiteUrl;
  const hasWebsite =
    lead.hasWebsite === true ||
    lead.websiteStatus === "has-website" ||
    lead.websiteStatus === "weak-website" ||
    !!website;
  const websiteWeak = lead.websiteStatus === "weak-website";
  const reviews = lead.reviews ?? lead.reviews_count ?? 0;
  const rating = lead.rating ?? 0;

  const isLocalSmallBusiness =
    SMALL_LOCAL_CATEGORIES.some((c) => category.includes(c)) &&
    !MULTI_BRANCH_HINTS.test(name);
  const isMultiBranchSignal = MULTI_BRANCH_HINTS.test(name);

  return {
    name,
    category,
    phone: lead.phone,
    email: lead.email,
    website,
    instagram: lead.instagram,
    hasWebsite,
    websiteWeak,
    rating,
    reviews,
    isLocalSmallBusiness,
    isMultiBranchSignal,
  };
}

/* ────────────────────────────────────────────────────────────
   Decision Maker inference
   ──────────────────────────────────────────────────────────── */

function inferDecisionMaker(n: Normalized): DecisionMaker {
  if (n.isMultiBranchSignal) {
    return {
      role: "Marketing or Operations Manager",
      confidence: "medium",
      reason:
        "Multi-branch or corporate-style branding usually delegates marketing decisions.",
    };
  }
  if (n.isLocalSmallBusiness) {
    return {
      role: "Owner",
      confidence: "high",
      reason:
        "Small local businesses are almost always managed directly by the owner.",
    };
  }
  return {
    role: "Owner or Manager",
    confidence: "medium",
    reason:
      "Independent business — decisions typically made by the owner or general manager.",
  };
}

/* ────────────────────────────────────────────────────────────
   Best Contact Path inference
   ──────────────────────────────────────────────────────────── */

function buildWhatsAppHref(phone: string): string {
  // Saudi-style normalization: 05xxxxxxxx → 9665xxxxxxxx
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "966" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}

function inferContactPath(n: Normalized): ContactPath {
  const hasPhone = !!n.phone;
  const hasInsta = !!n.instagram;
  const hasSite = n.hasWebsite && !!n.website;

  // Priority 1: business phone → WhatsApp (most direct in KSA market)
  if (hasPhone) {
    return {
      channel: "whatsapp",
      label: "WhatsApp Business",
      confidence: "high",
      reason: "Public business number is available — fastest reply path.",
      href: buildWhatsAppHref(n.phone!),
    };
  }

  // Priority 2: only Instagram visible
  if (hasInsta && !hasSite) {
    return {
      channel: "instagram",
      label: "Instagram DM",
      confidence: "high",
      reason:
        "Instagram is the primary public channel — DMs are checked daily.",
      href: n.instagram!.startsWith("http")
        ? n.instagram
        : `https://instagram.com/${n.instagram!.replace(/^@/, "")}`,
    };
  }

  // Priority 3: website with likely contact form
  if (hasSite) {
    return {
      channel: "contact_form",
      label: "Website Contact Form",
      confidence: "medium",
      reason:
        "Website is published — the contact form reaches the team inbox.",
      href: n.website,
    };
  }

  // Priority 4: email fallback
  if (n.email) {
    return {
      channel: "email",
      label: "Email",
      confidence: "low",
      reason: "Only a public email is listed — slower but viable.",
      href: `mailto:${n.email}`,
    };
  }

  // Last resort: still give a clear next step (no fake data)
  return {
    channel: "instagram",
    label: "Search Instagram",
    confidence: "low",
    reason:
      "No direct channel detected. Search the brand on Instagram to open a DM.",
  };
}

/* ────────────────────────────────────────────────────────────
   Reason tags (2–4)
   ──────────────────────────────────────────────────────────── */

function buildReasonTags(n: Normalized): string[] {
  const tags: string[] = [];

  if (!n.hasWebsite) tags.push("No website");
  else if (n.websiteWeak) tags.push("Weak website");

  if (n.rating >= 4 && n.reviews >= 50) tags.push("Strong demand");
  else if (n.rating >= 4) tags.push("High rating");

  if (n.reviews >= 100) tags.push("Many reviews");

  if (n.rating >= 4 && !n.hasWebsite) tags.push("Strong demand, weak funnel");

  if (n.instagram && !n.hasWebsite) tags.push("Instagram active, no funnel");

  if (n.hasWebsite && !n.phone && !n.email) tags.push("No direct contact");

  if (!n.hasWebsite && !n.instagram) tags.push("Weak online presence");

  // Dedupe + cap at 4, prioritize the most actionable insights first
  const seen = new Set<string>();
  return tags.filter((t) => (seen.has(t) ? false : (seen.add(t), true))).slice(0, 4);
}

/* ────────────────────────────────────────────────────────────
   Next Best Action — one sentence, action-oriented
   ──────────────────────────────────────────────────────────── */

function inferNextAction(path: ContactPath): string {
  switch (path.channel) {
    case "whatsapp":
      return "Message on WhatsApp now";
    case "phone":
      return "Call during business hours";
    case "instagram":
      return "Send a message via Instagram";
    case "contact_form":
      return "Use the website contact form";
    case "email":
      return "Send a short email";
    default:
      return "Reach out via the best public channel";
  }
}

/* ────────────────────────────────────────────────────────────
   Outreach message — Saudi-friendly, short, non-salesy
   ──────────────────────────────────────────────────────────── */

function buildOutreachMessage(n: Normalized, tags: string[]): string {
  const greet = "هلا 👋";
  const addressed = n.name ? ` ${n.name}` : "";

  // Pick the strongest insight to lead with
  let hook: string;
  if (tags.includes("Strong demand, weak funnel")) {
    hook = `لاحظت إن نشاطكم${addressed} عليه طلب وتقييم ممتاز، بس ما فيه موقع واضح يسهّل على العميل يعرف الخدمات أو يحجز.`;
  } else if (tags.includes("No website")) {
    hook = `لاحظت إن نشاطكم${addressed} ما له موقع إلكتروني — وهذا غالبًا يفوّت عليكم عملاء يبحثون قبل ما يتواصلون.`;
  } else if (tags.includes("Weak website")) {
    hook = `اطلعت على موقعكم${addressed}، فيه فرصة بسيطة نحسّن تجربة الزائر عشان يتحول لعميل فعلي.`;
  } else if (tags.includes("Instagram active, no funnel")) {
    hook = `لاحظت نشاطكم${addressed} على إنستقرام قوي، بس ما فيه مسار واضح يحوّل المتابع لعميل.`;
  } else if (tags.includes("High rating") || tags.includes("Strong demand")) {
    hook = `تقييماتكم${addressed} ممتازة وهذا يدل على ثقة العملاء — في مساحة بسيطة نستثمر فيها أكثر.`;
  } else {
    hook = `أتابع نشاطكم${addressed} وعندي ملاحظة بسيطة ممكن تفيدكم.`;
  }

  const offer =
    "عندي فكرة مختصرة ممكن أعرضها عليكم في دقيقتين، بدون أي التزام.";
  const cta = "متى يناسبكم أرسل التفاصيل؟";

  return `${greet}\n\n${hook}\n\n${offer}\n${cta}`;
}

/* ────────────────────────────────────────────────────────────
   Public API
   ──────────────────────────────────────────────────────────── */

export function generateContactIntelligence(
  lead: LeadLike,
): ContactIntelligence {
  const n = normalize(lead);
  const best_contact_path = inferContactPath(n);
  const likely_decision_maker = inferDecisionMaker(n);
  const reason_tags = buildReasonTags(n);
  const next_best_action = inferNextAction(best_contact_path);
  const outreach_message = buildOutreachMessage(n, reason_tags);

  return {
    best_contact_path,
    likely_decision_maker,
    reason_tags,
    next_best_action,
    outreach_message,
  };
}

/* ────────────────────────────────────────────────────────────
   UI helpers
   ──────────────────────────────────────────────────────────── */

export const CHANNEL_META: Record<
  ContactChannel,
  { emoji: string; shortLabel: string }
> = {
  whatsapp: { emoji: "💬", shortLabel: "WhatsApp" },
  phone: { emoji: "📞", shortLabel: "Phone" },
  instagram: { emoji: "📸", shortLabel: "Instagram" },
  contact_form: { emoji: "🌐", shortLabel: "Contact Form" },
  email: { emoji: "✉️", shortLabel: "Email" },
};

export const CONFIDENCE_META: Record<
  Confidence,
  { label: string; classes: string }
> = {
  high: {
    label: "High confidence",
    classes: "bg-primary/15 text-primary border-primary/30",
  },
  medium: {
    label: "Medium confidence",
    classes: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  low: {
    label: "Low confidence",
    classes: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
};
