export const LEAD_STATUSES = {
  new: { label: "جديد", emoji: "🆕", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", priority: 1 },
  contacted: { label: "تم التواصل", emoji: "📤", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", priority: 2 },
  no_response: { label: "بدون رد", emoji: "😶", color: "bg-orange-500/15 text-orange-400 border-orange-500/30", priority: 3 },
  follow_up: { label: "يحتاج متابعة", emoji: "🔄", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", priority: 4 },
  interested: { label: "مهتم", emoji: "🔥", color: "bg-primary/15 text-primary border-primary/30", priority: 5 },
  negotiation: { label: "تفاوض", emoji: "🤝", color: "bg-purple-500/15 text-purple-400 border-purple-500/30", priority: 6 },
  won: { label: "تم الإغلاق", emoji: "✅", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", priority: 7 },
  lost: { label: "خسرناه", emoji: "❌", color: "bg-destructive/15 text-destructive border-destructive/30", priority: 8 },
} as const;

export type LeadStatus = keyof typeof LEAD_STATUSES;
export type LastAction = "message_sent" | "saved" | "status_changed" | "follow_up_sent" | "call_made";
export type ContactChannel = "whatsapp" | "call" | "copy";

export const ACTION_LABELS: Record<LastAction, string> = {
  message_sent: "📤 أرسل رسالة",
  saved: "🔖 تم الحفظ",
  status_changed: "🔄 تغيير الحالة",
  follow_up_sent: "🔁 أرسل متابعة",
  call_made: "📞 تم الاتصال",
};

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: "واتساب",
  call: "اتصال",
  copy: "نسخ",
};

export interface SavedLead {
  id: string;
  user_id: string;
  lead_data: any;
  status: LeadStatus;
  last_action: LastAction | null;
  last_action_at: string | null;
  contact_channel: ContactChannel | null;
  updated_at: string;
  created_at: string;
}

// ─── Smart Action Engine ───
export interface SmartAction {
  label: string;
  emoji: string;
  type: "outreach" | "follow_up" | "close" | "schedule";
  nextStatus?: LeadStatus;
  messageType: "first_contact" | "follow_up" | "closing" | "proposal";
}

export function getSmartAction(status: LeadStatus, daysElapsed: number, score: number): SmartAction {
  switch (status) {
    case "new":
      return {
        label: "ابدأ أول تواصل",
        emoji: "⚡",
        type: "outreach",
        nextStatus: "contacted",
        messageType: "first_contact",
      };
    case "contacted":
      if (daysElapsed >= 3) {
        return {
          label: "أرسل متابعة الآن",
          emoji: "🔁",
          type: "follow_up",
          nextStatus: "no_response",
          messageType: "follow_up",
        };
      }
      return {
        label: "انتظر الرد",
        emoji: "⏳",
        type: "follow_up",
        messageType: "follow_up",
      };
    case "no_response":
      return {
        label: "أرسل متابعة أخيرة",
        emoji: "📩",
        type: "follow_up",
        nextStatus: "follow_up",
        messageType: "follow_up",
      };
    case "follow_up":
      if (score >= 70) {
        return {
          label: "ادفع العميل للإغلاق",
          emoji: "🔥",
          type: "close",
          nextStatus: "interested",
          messageType: "closing",
        };
      }
      return {
        label: "أرسل متابعة ذكية",
        emoji: "💬",
        type: "follow_up",
        nextStatus: "interested",
        messageType: "follow_up",
      };
    case "interested":
      return {
        label: "أرسل عرض / حدد موعد",
        emoji: "📋",
        type: "close",
        nextStatus: "negotiation",
        messageType: "proposal",
      };
    case "negotiation":
      return {
        label: "أغلق الصفقة",
        emoji: "🤝",
        type: "close",
        nextStatus: "won",
        messageType: "closing",
      };
    case "won":
      return {
        label: "تم ✅",
        emoji: "🎉",
        type: "close",
        messageType: "closing",
      };
    case "lost":
      return {
        label: "أرشف",
        emoji: "📁",
        type: "close",
        messageType: "closing",
      };
    default:
      return {
        label: "تواصل",
        emoji: "⚡",
        type: "outreach",
        messageType: "first_contact",
      };
  }
}

// ─── Urgency System ───
export interface UrgencyInfo {
  level: "high" | "medium" | "low";
  label: string;
  emoji: string;
  colorClass: string;
}

export function getUrgency(status: LeadStatus, daysElapsed: number, score: number): UrgencyInfo | null {
  // Won/Lost don't need urgency
  if (status === "won" || status === "lost") return null;

  // High-value lead not acted on
  if (status === "new" && score >= 80) {
    return {
      level: "high",
      label: "عميل عالي القيمة — لا تفوّت الفرصة",
      emoji: "🚨",
      colorClass: "text-red-400 bg-red-500/10 border-red-500/20",
    };
  }

  // Overdue follow-up
  const idealDays = score >= 70 ? 2 : score >= 40 ? 3 : 5;

  if (["contacted", "no_response", "follow_up"].includes(status)) {
    if (daysElapsed > idealDays + 2) {
      return {
        level: "high",
        label: `تأخرت ${daysElapsed - idealDays} يوم عن المتابعة المثالية`,
        emoji: "⏰",
        colorClass: "text-red-400 bg-red-500/10 border-red-500/20",
      };
    }
    if (daysElapsed >= idealDays) {
      return {
        level: "medium",
        label: "الوقت مناسب الآن للتواصل",
        emoji: "⚡",
        colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    }
  }

  if (status === "interested" && daysElapsed >= 2) {
    return {
      level: "high",
      label: "مهتم — تابع قبل ما يبرد",
      emoji: "🔥",
      colorClass: "text-red-400 bg-red-500/10 border-red-500/20",
    };
  }

  if (status === "negotiation" && daysElapsed >= 3) {
    return {
      level: "medium",
      label: "تفاوض مفتوح — أغلق الآن",
      emoji: "🤝",
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
  }

  if (status === "new" && daysElapsed === 0) {
    return {
      level: "low",
      label: "فرصة جديدة جاهزة",
      emoji: "✨",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };
  }

  return null;
}

// ─── Follow-up timing intelligence ───
export function getNextFollowUpDays(score: number): number {
  if (score >= 70) return 1;
  if (score >= 40) return 3;
  return 5;
}

// Status order for pipeline & filters
export const STATUS_ORDER: LeadStatus[] = [
  "new", "contacted", "no_response", "follow_up",
  "interested", "negotiation", "won", "lost",
];

// Legacy status migration
export function migrateStatus(oldStatus: string): LeadStatus {
  const map: Record<string, LeadStatus> = {
    saved: "new",
    offer_sent: "contacted",
    replied: "interested",
    closed: "won",
    not_interested: "lost",
  };
  return map[oldStatus] || (oldStatus as LeadStatus);
}
