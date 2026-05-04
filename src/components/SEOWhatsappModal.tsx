import { useState } from "react";
import { Copy, X, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/lib/leadData";
import { type SEOOpportunity, SEO_BADGE, generateWhatsappMessage } from "@/lib/seoOpportunity";

interface Props {
  lead: Lead;
  opportunity: SEOOpportunity;
  open: boolean;
  onClose: () => void;
}

const SEOWhatsappModal = ({ lead, opportunity, open, onClose }: Props) => {
  const [message, setMessage] = useState(() => generateWhatsappMessage(lead, opportunity));
  if (!open) return null;

  const meta = SEO_BADGE[opportunity.level];

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    toast.success("تم نسخ الرسالة");
  };

  const openWhatsApp = () => {
    const phone = (lead.phone || "").replace(/\D/g, "");
    if (!phone) {
      toast.error("لا يوجد رقم جوال متاح");
      return;
    }
    const intl = phone.startsWith("966") ? phone : phone.startsWith("0") ? `966${phone.slice(1)}` : `966${phone}`;
    const url = `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-black text-foreground text-sm">زاوية تواصل — فرصة الظهور في قوقل</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Badge + keyword */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1.5 ${meta.classes}`}>
              <span>{meta.emoji}</span>
              <span>{meta.label}</span>
              <span className="opacity-70">({opportunity.score}/100)</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              كلمة محلية: <span className="font-bold text-foreground">{opportunity.suggested_local_keyword}</span>
            </span>
          </div>

          {/* Plan: offer + angle */}
          <div className="bg-background/60 border border-border/50 rounded-xl p-3 space-y-2 text-xs">
            <div>
              <div className="text-muted-foreground font-bold mb-0.5">العرض المقترح</div>
              <div className="text-foreground">{opportunity.suggested_offer}</div>
            </div>
            <div>
              <div className="text-muted-foreground font-bold mb-0.5">زاوية التواصل</div>
              <div className="text-foreground leading-relaxed">{opportunity.outreach_angle}</div>
            </div>
          </div>

          {/* Editable message */}
          <div>
            <label className="text-xs font-bold text-foreground mb-1.5 block">رسالة واتساب (قابلة للتعديل)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground leading-relaxed focus:outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-bold py-2.5 rounded-xl text-sm inline-flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              نسخ الرسالة
            </button>
            {lead.phone && (
              <button
                onClick={openWhatsApp}
                className="flex-1 bg-[hsl(145_80%_42%)] hover:brightness-110 text-white font-bold py-2.5 rounded-xl text-sm inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                فتح واتساب
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOWhatsappModal;
