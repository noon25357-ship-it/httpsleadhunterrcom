export const LEAD_STATUSES = {
  new: { label: "جديد", emoji: "🆕", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  saved: { label: "محفوظ", emoji: "🔖", color: "bg-muted text-muted-foreground border-border" },
  contacted: { label: "تم التواصل", emoji: "📤", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  replied: { label: "رد", emoji: "💬", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  interested: { label: "مهتم", emoji: "🔥", color: "bg-primary/15 text-primary border-primary/30" },
  closed: { label: "مغلق", emoji: "✅", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  not_interested: { label: "غير مهتم", emoji: "❌", color: "bg-destructive/15 text-destructive border-destructive/30" },
} as const;

export type LeadStatus = keyof typeof LEAD_STATUSES;
export type LastAction = "message_sent" | "saved" | "status_changed";
export type ContactChannel = "whatsapp" | "call" | "copy";

export const ACTION_LABELS: Record<LastAction, string> = {
  message_sent: "📤 أرسل رسالة",
  saved: "🔖 تم الحفظ",
  status_changed: "🔄 تغيير الحالة",
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
