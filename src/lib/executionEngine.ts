/**
 * Execution Engine — transforms "decision UI" into "execution engine"
 * Handles: message generation, WhatsApp launch, auto-status update, follow-up scheduling
 */
import type { Lead } from "./leadData";
import type { LeadStatus, SmartAction } from "./leadStatuses";
import { getSmartAction, getNextFollowUpDays } from "./leadStatuses";
import { generateSmartMessage } from "./messageGenerator";

// ─── Follow-up Sequence System ───
export interface SequenceStep {
  step: number;
  label: string;
  daysAfterPrevious: number;
  messageType: "first_contact" | "follow_up" | "closing";
  tone: string;
}

export function getSequence(score: number): SequenceStep[] {
  const fast = score >= 70;
  return [
    { step: 1, label: "الرسالة الأولى", daysAfterPrevious: 0, messageType: "first_contact", tone: "friendly" },
    { step: 2, label: "متابعة أولى", daysAfterPrevious: fast ? 2 : 3, messageType: "follow_up", tone: "friendly" },
    { step: 3, label: "الدفعة الأخيرة", daysAfterPrevious: fast ? 3 : 5, messageType: "closing", tone: "friendly" },
  ];
}

// ─── Message Generation by Stage ───
const FOLLOW_UP_TEMPLATES: Record<string, string[]> = {
  follow_up: [
    "السلام عليكم مرة ثانية 👋\nأرسلت لكم رسالة قبل كم يوم بخصوص تحسين حضوركم الرقمي، حبيت أتأكد وصلتكم الرسالة؟\n\nأقدر أعطيكم استشارة سريعة مجاناً لو تحبون 🚀",
    "السلام عليكم 👋\nتابعت معكم بخصوص الرسالة السابقة، أعرف إنكم مشغولين بس حبيت أأكد إن العرض لا زال متاح.\n\nإذا عندكم أي سؤال أنا موجود ✅",
  ],
  closing: [
    "السلام عليكم 👋\nآخر متابعة مني — لو تحبون نرتب موعد قصير 5 دقائق أشرح لكم كيف أقدر أساعدكم، بدون أي التزام.\n\nرقمي موجود لو احتجتوا أي شي 🙏",
  ],
  proposal: [
    "السلام عليكم 👋\nسعيد بإهتمامكم! حبيت أتابع معكم — هل تحبون نحدد موعد نناقش التفاصيل؟\n\nأقدر أجهز لكم عرض مخصص خلال 24 ساعة 💪",
  ],
};

export function generateExecutionMessage(
  lead: Lead,
  messageType: "first_contact" | "follow_up" | "closing" | "proposal",
  service: string = "website",
): string {
  if (messageType === "first_contact") {
    return generateSmartMessage({ lead, service, tone: "friendly" });
  }

  const templates = FOLLOW_UP_TEMPLATES[messageType] || FOLLOW_UP_TEMPLATES.follow_up;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Personalize with lead name
  return template.replace("{name}", lead.name || "");
}

// ─── WhatsApp Launcher ───
export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = phone.startsWith("0") ? `966${phone.slice(1)}` : phone;
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
}

// ─── Auto Status Transition ───
export function getNextStatus(currentStatus: LeadStatus): LeadStatus {
  const transitions: Partial<Record<LeadStatus, LeadStatus>> = {
    new: "contacted",
    contacted: "follow_up",
    no_response: "follow_up",
    follow_up: "interested",
    interested: "negotiation",
    negotiation: "won",
  };
  return transitions[currentStatus] || currentStatus;
}

// ─── Follow-up Date Calculator ───
export function calculateFollowUpDate(score: number): string {
  const days = getNextFollowUpDays(score);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// ─── Next Action Hints ───
export function getNextActionHint(newStatus: LeadStatus, followUpDays: number): string {
  const hints: Partial<Record<LeadStatus, string>> = {
    contacted: `انتظر الرد أو تابع بعد ${followUpDays} يوم`,
    follow_up: "إذا ما رد، أرسل الرسالة الأخيرة",
    interested: "حدد مكالمة أو أرسل عرض",
    negotiation: "أغلق الصفقة الآن",
    won: "مبروك! 🎉 تم إغلاق الصفقة",
  };
  return hints[newStatus] || "تابع العميل";
}

// ─── Outcome Labels ───
export const OUTCOME_ACTIONS = [
  { key: "replied", label: "تم الرد", emoji: "💬", nextStatus: "interested" as LeadStatus },
  { key: "no_response", label: "بدون رد", emoji: "😶", nextStatus: "no_response" as LeadStatus },
  { key: "interested", label: "مهتم", emoji: "🔥", nextStatus: "interested" as LeadStatus },
  { key: "won", label: "تم الإغلاق", emoji: "✅", nextStatus: "won" as LeadStatus },
  { key: "lost", label: "خسرناه", emoji: "❌", nextStatus: "lost" as LeadStatus },
] as const;

// ─── User Preferences (localStorage) ───
const PREFS_KEY = "leadhunter_user_prefs";

export interface UserPreferences {
  preferredChannel: "whatsapp" | "call" | "copy";
  preferredTone: "friendly" | "formal";
  preferredService: string;
}

export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { preferredChannel: "whatsapp", preferredTone: "friendly", preferredService: "website" };
}

export function updateUserPreference(key: keyof UserPreferences, value: string): void {
  const prefs = getUserPreferences();
  (prefs as any)[key] = value;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
