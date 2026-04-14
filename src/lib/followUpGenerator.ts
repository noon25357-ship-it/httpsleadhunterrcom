import type { Lead } from "./leadData";
import type { LeadStatus } from "./leadStatuses";

export interface FollowUpSuggestion {
  type: "overdue" | "due_today" | "due_soon" | "no_response";
  urgency: "high" | "medium" | "low";
  label: string;
  message: string;
  daysElapsed: number;
}

const NO_RESPONSE_MESSAGES = [
  "السلام عليكم مرة ثانية 👋\nأرسلت لكم رسالة قبل كم يوم بخصوص تحسين حضوركم الرقمي، حبيت أتأكد وصلتكم الرسالة؟\n\nأقدر أعطيكم استشارة سريعة مجاناً لو تحبون 🚀",
  "السلام عليكم 👋\nتابعت معكم بخصوص الرسالة السابقة، أعرف إنكم مشغولين بس حبيت أأكد إن العرض لا زال متاح.\n\nإذا عندكم أي سؤال أنا موجود ✅",
  "السلام عليكم 👋\nآخر متابعة مني — لو تحبون نرتب موعد قصير 5 دقائق أشرح لكم كيف أقدر أساعدكم، بدون أي التزام.\n\nرقمي موجود لو احتجتوا أي شي 🙏",
];

const INTERESTED_FOLLOWUP = [
  "السلام عليكم 👋\nسعيد بإهتمامكم! حبيت أتابع معكم — هل تحبون نحدد موعد نناقش التفاصيل؟\n\nأقدر أجهز لكم عرض مخصص خلال 24 ساعة 💪",
  "السلام عليكم 👋\nكيف أقدر أساعدكم بأفضل شكل؟ لو عندكم أسئلة أو تبون تشوفون أمثلة من شغلي، أنا جاهز.\n\nنرتب موعد سريع؟ 🚀",
];

const OBJECTION_HANDLERS: Record<string, string> = {
  price: "أفهم إن الميزانية مهمة 💡\nعندي خيارات مرنة تناسب ميزانيات مختلفة. ممكن نبدأ بباقة أساسية ونطور مع الوقت.\n\nتبون أرسل لكم الخيارات؟",
  social_only: "فاهم إن حسابات التواصل مهمة 👍\nبس الموقع يعطيكم:\n✅ حضور احترافي\n✅ عملاء من قوقل مجاناً\n✅ مصداقية أعلى\n\nالموقع يكمّل السوشال مو يستبدله 🎯",
  busy: "أقدّر وقتكم وأعرف إنكم مشغولين 🙏\nلذلك أنا أتكفل بكل شي من الألف للياء — ما يحتاج منكم غير 15 دقيقة للموافقة على التصميم.\n\nمتى يناسبكم نرتب موعد سريع؟",
};

export function getFollowUpSuggestion(
  lead: Lead,
  status: LeadStatus,
  lastActionAt: string | null,
  followUpDate: string | null,
): FollowUpSuggestion | null {
  const now = new Date();
  const lastAction = lastActionAt ? new Date(lastActionAt) : null;
  const daysElapsed = lastAction
    ? Math.floor((now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Check scheduled follow-up date
  if (followUpDate) {
    const fDate = new Date(followUpDate);
    const diffDays = Math.floor((fDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: "overdue",
        urgency: "high",
        label: `متأخر ${Math.abs(diffDays)} يوم`,
        message: getFollowUpMessage(status, Math.abs(diffDays)),
        daysElapsed: Math.abs(diffDays),
      };
    }
    if (diffDays === 0) {
      return {
        type: "due_today",
        urgency: "high",
        label: "اليوم موعد المتابعة",
        message: getFollowUpMessage(status, daysElapsed),
        daysElapsed,
      };
    }
    if (diffDays <= 2) {
      return {
        type: "due_soon",
        urgency: "medium",
        label: `المتابعة بعد ${diffDays} يوم`,
        message: getFollowUpMessage(status, daysElapsed),
        daysElapsed,
      };
    }
    return null;
  }

  // Auto-detect: No follow-up date set but time elapsed since last action
  if (status === "contacted" && daysElapsed >= 3) {
    return {
      type: "no_response",
      urgency: daysElapsed >= 7 ? "high" : "medium",
      label: `${daysElapsed} يوم بدون رد`,
      message: NO_RESPONSE_MESSAGES[Math.min(Math.floor(daysElapsed / 3) - 1, NO_RESPONSE_MESSAGES.length - 1)],
      daysElapsed,
    };
  }

  if (status === "offer_sent" && daysElapsed >= 2) {
    return {
      type: "no_response",
      urgency: daysElapsed >= 5 ? "high" : "medium",
      label: `${daysElapsed} يوم من إرسال العرض`,
      message: NO_RESPONSE_MESSAGES[0],
      daysElapsed,
    };
  }

  if (status === "interested" && daysElapsed >= 2) {
    return {
      type: "no_response",
      urgency: "high",
      label: `مهتم — ${daysElapsed} يوم بدون متابعة`,
      message: INTERESTED_FOLLOWUP[Math.min(Math.floor(daysElapsed / 2) - 1, INTERESTED_FOLLOWUP.length - 1)],
      daysElapsed,
    };
  }

  if (status === "replied" && daysElapsed >= 2) {
    return {
      type: "no_response",
      urgency: "medium",
      label: `رد — ${daysElapsed} يوم بدون متابعة`,
      message: INTERESTED_FOLLOWUP[0],
      daysElapsed,
    };
  }

  return null;
}

function getFollowUpMessage(status: LeadStatus, daysElapsed: number): string {
  if (status === "interested") {
    return INTERESTED_FOLLOWUP[Math.min(Math.floor(daysElapsed / 2), INTERESTED_FOLLOWUP.length - 1)];
  }
  return NO_RESPONSE_MESSAGES[Math.min(Math.floor(daysElapsed / 3), NO_RESPONSE_MESSAGES.length - 1)];
}

export function getObjectionResponse(objectionType: string): string {
  return OBJECTION_HANDLERS[objectionType] || OBJECTION_HANDLERS.busy;
}

export const OBJECTION_TYPES = [
  { key: "price", label: "السعر غالي", emoji: "💰" },
  { key: "social_only", label: "عندنا سوشال يكفي", emoji: "📱" },
  { key: "busy", label: "مشغولين حالياً", emoji: "⏳" },
];
