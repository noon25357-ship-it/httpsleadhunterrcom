// Advanced Buying Signal Detector — pure scoring helpers (Saudi/Arabic tone)
// Used both client-side (after a search) and on the server (calculate-buying-signals).
// Keep this file dependency-free so the same logic can be ported to the edge function.

import type { Lead } from "@/lib/leadData";

export type BuyingSignalStatus = "Hot" | "Warm" | "Cold";

export interface BuyingSignalResult {
  score: number;                  // 0..100
  status: BuyingSignalStatus;
  reasons: string[];              // plain-language Arabic reasons
  next_best_action: string;       // recommended next step
}

export interface BuyingSignalContext {
  /** Pipeline status from saved_leads (e.g. "interested", "contacted_no_reply") */
  pipelineStatus?: string;
  /** Whether this lead was contacted before with no reply */
  contactedNoReply?: boolean;
  /** Optional review snippets if available */
  reviewTexts?: string[];
}

const PROBLEM_KEYWORDS = [
  "تأخير", "متأخر", "زحمة", "حجز", "ما يردون", "ما يرد", "ما رد", "خدمة سيئة",
  "انتظار", "رد", "بطيء", "بطيئة", "سوء", "مزعج",
  "slow", "delay", "delayed", "bad service", "booking", "no response", "wait", "waiting",
];

const GROWTH_KEYWORDS = [
  "فرع جديد", "ممتاز", "أفضل", "دايم مليان", "مليان", "زحمة", "مشهور", "نجاح",
  "new branch", "busy", "popular", "best", "amazing", "crowded",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function statusFromScore(score: number): BuyingSignalStatus {
  if (score >= 75) return "Hot";
  if (score >= 45) return "Warm";
  return "Cold";
}

function matchesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((n) => lower.includes(n.toLowerCase()));
}

function buildNextBestAction(params: {
  status: BuyingSignalStatus;
  hasWebsite: boolean;
  hasComplaints: boolean;
  pipelineStatus?: string;
}): string {
  const { status, hasWebsite, hasComplaints, pipelineStatus } = params;

  if (pipelineStatus === "interested") {
    return "اتصل به اليوم أو أرسل رابط حجز مكالمة قصيرة.";
  }

  if (status === "Hot" && !hasWebsite) {
    return "أرسل له رسالة تعرض فيها موقع سريع يحسّن ظهوره ويزيد الحجوزات.";
  }
  if (status === "Hot") {
    return "تواصل معه الآن، الفرصة قوية ويستحق الأولوية.";
  }
  if (status === "Warm" && hasComplaints) {
    return "ابدأ برسالة تركّز على تحسين تجربة العملاء وتقليل ضغط الاستفسارات.";
  }
  if (status === "Warm") {
    return "أرسل له عرضًا مختصرًا، وتابع بعد يومين إذا ما رد.";
  }
  return "احفظه للمتابعة لاحقًا ولا تبدأ به الآن.";
}

/** Compute buying signal from a Lead (and optional pipeline context). */
export function calculateBuyingSignal(
  lead: Pick<Lead, "hasWebsite" | "rating" | "reviews" | "phone">,
  ctx: BuyingSignalContext = {}
): BuyingSignalResult {
  let score = 0;
  const reasons: string[] = [];

  if (!lead.hasWebsite) {
    score += 25;
    reasons.push("لا يملك موقع إلكتروني");
  }

  if (typeof lead.rating === "number" && lead.rating >= 4.0) {
    score += 15;
    reasons.push("تقييمه مرتفع وعنده عملاء فعليين");
  }

  if (typeof lead.reviews === "number" && lead.reviews > 30) {
    score += 15;
    reasons.push("عدد مراجعاته جيد ويدل على نشاط حقيقي");
  }

  if (lead.phone && lead.phone.trim().length > 0) {
    score += 10;
    reasons.push("لديه رقم تواصل مباشر");
  }

  // Review text signals (only if we have actual review snippets)
  let hasComplaints = false;
  const texts = ctx.reviewTexts ?? [];
  if (texts.length > 0) {
    const joined = texts.join(" ");
    if (matchesAny(joined, PROBLEM_KEYWORDS)) {
      score += 20;
      reasons.push("توجد شكاوى متكررة في المراجعات");
      hasComplaints = true;
    }
    if (matchesAny(joined, GROWTH_KEYWORDS)) {
      score += 15;
      reasons.push("يوجد مؤشر طلب عالي ونمو من المراجعات");
    }
  }

  // Pipeline adjustments
  if (ctx.contactedNoReply) {
    score -= 10;
    reasons.push("تم التواصل سابقًا ولم يرد");
  }
  if (ctx.pipelineStatus === "interested") {
    score += 20;
    reasons.push("أبدى اهتمامًا في تواصل سابق");
  }

  const finalScore = clamp(score);
  const status = statusFromScore(finalScore);
  const next_best_action = buildNextBestAction({
    status,
    hasWebsite: !!lead.hasWebsite,
    hasComplaints,
    pipelineStatus: ctx.pipelineStatus,
  });

  return { score: finalScore, status, reasons, next_best_action };
}

/** UI helpers */
export const SIGNAL_BADGE: Record<BuyingSignalStatus, {
  label: string;
  shortLabel: string;
  classes: string;
  emoji: string;
}> = {
  Hot:  { label: "إشارة شراء قوية", shortLabel: "قوية",  emoji: "🔥",
          classes: "bg-primary/15 text-primary border border-primary/30" },
  Warm: { label: "فرصة متوسطة",     shortLabel: "متوسطة", emoji: "⚡",
          classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
  Cold: { label: "احفظه للمتابعة",  shortLabel: "ضعيفة", emoji: "🧊",
          classes: "bg-muted text-muted-foreground border border-border" },
};
