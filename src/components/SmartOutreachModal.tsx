import { useEffect, useState } from "react";
import { X, Copy, MessageCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/lib/leadData";
import { cleanSaudiPhone, type SmartOutreach } from "@/lib/smartOutreach";
import { SEO_BADGE, OPPORTUNITY_TYPE_META, type SEOOpportunity } from "@/lib/seoOpportunity";

interface Props {
  lead: Lead;
  outreach: SmartOutreach;
  seo?: SEOOpportunity;
  open: boolean;
  onClose: () => void;
  onMarkContacted?: (lead: Lead) => void;
}

type Tab = "first" | "follow";

const SmartOutreachModal = ({ lead, outreach, seo, open, onClose, onMarkContacted }: Props) => {
  const [tab, setTab] = useState<Tab>("first");
  const [first, setFirst] = useState(outreach.first_whatsapp_message);
  const [follow, setFollow] = useState(outreach.follow_up_message);
  const [openObj, setOpenObj] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFirst(outreach.first_whatsapp_message);
      setFollow(outreach.follow_up_message);
      setTab("first");
      setOpenObj(null);
    }
  }, [open, outreach]);

  if (!open) return null;

  const cleanPhone = cleanSaudiPhone(lead.phone);
  const activeMessage = tab === "first" ? first : follow;

  const copy = (text: string, label = "تم نسخ الرسالة") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const openWhatsapp = () => {
    if (!cleanPhone) return;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(activeMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const markContacted = () => {
    onMarkContacted?.(lead);
    toast.success("تم تحديث الحالة كـ تم التواصل");
    onClose();
  };

  const objections: Array<{ id: keyof SmartOutreach["objection_replies"]; label: string; emoji: string }> = [
    { id: "price", label: "السعر", emoji: "💰" },
    { id: "not_interested", label: "غير مهتم", emoji: "🚫" },
    { id: "send_details", label: "أرسل التفاصيل", emoji: "📄" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-black text-foreground truncate">{lead.name}</h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {lead.category} — {lead.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Reason + offer */}
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-lg bg-secondary/40 border border-border/60 p-3">
              <p className="text-[10px] font-bold text-emerald-400 mb-1">سبب التواصل</p>
              <p className="text-xs text-foreground leading-snug">{outreach.contact_reason}</p>
            </div>
            <div className="rounded-lg bg-secondary/40 border border-border/60 p-3">
              <p className="text-[10px] font-bold text-emerald-400 mb-1">العرض المقترح</p>
              <p className="text-xs text-foreground leading-snug">{outreach.suggested_offer}</p>
            </div>
            <div className="rounded-lg bg-secondary/40 border border-border/60 p-3">
              <p className="text-[10px] font-bold text-emerald-400 mb-1">الزاوية المحلية</p>
              <p className="text-xs text-foreground leading-snug">{outreach.local_angle}</p>
            </div>
          </div>

          {/* Visibility opportunity details */}
          {seo && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-emerald-400">🔍 تفاصيل فرصة الظهور</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${SEO_BADGE[seo.level].classes}`}>
                  {SEO_BADGE[seo.level].emoji} {SEO_BADGE[seo.level].label} ({seo.score})
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-[11px] text-foreground">
                <div>
                  <span className="text-muted-foreground">الكلمة المحلية المقترحة: </span>
                  <span className="font-bold">{seo.suggested_local_keyword}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">نوع الفرصة: </span>
                  <span className="font-bold">
                    {OPPORTUNITY_TYPE_META[seo.opportunity_type].emoji} {seo.opportunity_type_label}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">العرض المقترح: </span>
                  <span className="font-bold">{seo.suggested_offer}</span>
                </div>
              </div>
              <ul className="space-y-1 pt-1 border-t border-emerald-500/15">
                {seo.reasons.slice(0, 2).map((r) => (
                  <li key={r} className="text-[11px] text-muted-foreground leading-snug flex gap-1.5">
                    <span className="text-emerald-400/70">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/60 p-1 rounded-lg">
            <button
              onClick={() => setTab("first")}
              className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${
                tab === "first" ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              الرسالة الأولى
            </button>
            <button
              onClick={() => setTab("follow")}
              className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-colors ${
                tab === "follow" ? "bg-card text-foreground" : "text-muted-foreground"
              }`}
            >
              رسالة المتابعة
            </button>
          </div>

          {/* Editable textarea */}
          {tab === "first" ? (
            <textarea
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              rows={6}
              className="w-full text-xs text-foreground bg-background border border-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              dir="rtl"
            />
          ) : (
            <textarea
              value={follow}
              onChange={(e) => setFollow(e.target.value)}
              rows={5}
              className="w-full text-xs text-foreground bg-background border border-border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              dir="rtl"
            />
          )}

          {/* Actions row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => copy(activeMessage)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border"
            >
              <Copy className="w-3.5 h-3.5" />
              نسخ الرسالة
            </button>
            {cleanPhone ? (
              <button
                onClick={openWhatsapp}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                فتح واتساب
              </button>
            ) : (
              <button
                onClick={() => copy(activeMessage, "لا يوجد رقم — تم نسخ الرسالة")}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg bg-secondary text-muted-foreground border border-border"
                title="رقم غير صالح للواتساب"
              >
                <Copy className="w-3.5 h-3.5" />
                نسخ فقط
              </button>
            )}
          </div>

          {/* Objection replies accordion */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              ردود الاعتراضات
            </p>
            {objections.map((o) => {
              const isOpen = openObj === o.id;
              const text = outreach.objection_replies[o.id];
              return (
                <div key={o.id} className="rounded-lg border border-border/60 bg-secondary/30 overflow-hidden">
                  <button
                    onClick={() => setOpenObj(isOpen ? null : o.id)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-foreground"
                  >
                    <span>{o.emoji} {o.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-snug">{text}</p>
                      <button
                        onClick={() => copy(text, "تم نسخ الرد")}
                        className="text-[10px] font-bold text-emerald-400 inline-flex items-center gap-1 hover:underline"
                      >
                        <Copy className="w-3 h-3" /> نسخ الرد
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save status */}
          {onMarkContacted && (
            <button
              onClick={markContacted}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              حفظ الحالة كـ "تم التواصل"
            </button>
          )}

          {/* Next best action */}
          <div className="text-[11px] text-muted-foreground text-center">
            ⚡ {outreach.next_best_action}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartOutreachModal;
