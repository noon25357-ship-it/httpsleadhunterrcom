import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageCircle, PhoneCall, Copy, Check,
  Bookmark, CheckCircle2, Lightbulb, MapPin, Star,
  ChevronDown, ChevronUp,
} from "lucide-react";
import type { Lead } from "@/lib/leadData";
import {
  generateSmartMessage, getWhyReasons,
  SERVICE_OPTIONS, TONE_OPTIONS,
} from "@/lib/messageGenerator";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

interface ContactModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSave?: (lead: Lead) => void;
  onMarkContacted?: (lead: Lead, channel: string) => void;
}

const ContactModal = ({ lead, onClose, onSave, onMarkContacted }: ContactModalProps) => {
  const [service, setService] = useState("website");
  const [tone, setTone] = useState("friendly");
  const [copied, setCopied] = useState<string | null>(null);
  const [editableMessage, setEditableMessage] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);

  const reasons = useMemo(() => (lead ? getWhyReasons(lead) : []), [lead]);

  const smartMessage = useMemo(() => {
    if (!lead) return "";
    return generateSmartMessage({ lead, service, tone });
  }, [lead, service, tone]);

  const message = editableMessage ?? smartMessage;

  if (!lead) return null;

  const whatsappUrl = `https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("تم النسخ!");
    trackEvent(label === "msg" ? "copy_message" : "copy_phone", { leadId: lead.id });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleServiceChange = (key: string) => {
    setService(key);
    setEditableMessage(null);
  };

  const handleToneChange = (key: string) => {
    setTone(key);
    setEditableMessage(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg glass-card rounded-t-2xl sm:rounded-2xl neon-border overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header: Lead info */}
          <div className="p-5 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-foreground truncate">{lead.name}</h3>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {lead.area}، {lead.city}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {lead.rating}
                  </span>
                  <span>{lead.reviews} تقييم</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  📂 {lead.category} · 📞 <span dir="ltr">{lead.phone}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Why this is an opportunity */}
          {reasons.length > 0 && (
            <div className="mx-5 mt-4 bg-primary/[0.08] border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">ليش هذه فرصة؟</span>
              </div>
              <ul className="space-y-1.5">
                {reasons.map((r) => (
                  <li key={r.key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="p-5 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("click_whatsapp", { leadId: lead.id });
                onMarkContacted?.(lead, "whatsapp");
              }}
              className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:brightness-110 transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              أرسل عبر واتساب
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${lead.phone}`}
                onClick={() => {
                  trackEvent("click_call", { leadId: lead.id });
                  onMarkContacted?.(lead, "call");
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
              >
                <PhoneCall className="w-4 h-4" />
                📞 اتصال
              </a>
              <button
                onClick={() => copyText(lead.phone, "phone")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
              >
                {copied === "phone" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                📋 نسخ الرقم
              </button>
            </div>
          </div>

          {/* Customize section */}
          <div className="px-5 pb-2">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="flex items-center justify-between w-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <span>⚙️ تخصيص الرسالة</span>
              {showCustomize ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showCustomize && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pb-4">
                    {/* Service selection */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">اختر الخدمة</label>
                      <div className="flex gap-2 flex-wrap">
                        {SERVICE_OPTIONS.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => handleServiceChange(s.key)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              service === s.key
                                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {s.emoji} {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tone selection */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">اختر الأسلوب</label>
                      <div className="flex gap-2">
                        {TONE_OPTIONS.map((t) => (
                          <button
                            key={t.key}
                            onClick={() => handleToneChange(t.key)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              tone === t.key
                                ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {t.emoji} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message */}
          <div className="px-5 pb-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">✉️ الرسالة الجاهزة</span>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                ذكية ✨
              </span>
            </div>

            <textarea
              value={message}
              onChange={(e) => setEditableMessage(e.target.value)}
              rows={6}
              className="w-full bg-secondary rounded-xl p-4 text-sm leading-relaxed text-secondary-foreground resize-none border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-2">
              <button
                onClick={() => copyText(message, "msg")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary transition-colors active:scale-[0.98]"
              >
                {copied === "msg" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                📋 نسخ الرسالة
              </button>
              <button
                onClick={() => setEditableMessage(null)}
                className="px-4 py-2.5 rounded-xl text-xs text-muted-foreground hover:bg-secondary transition-colors border border-border"
              >
                إعادة ضبط
              </button>
            </div>
          </div>

          {/* Bottom actions: Save + Mark contacted */}
          <div className="px-5 pb-5 flex gap-2">
            {onSave && (
              <button
                onClick={() => {
                  onSave(lead);
                  toast.success("تم حفظ الفرصة!");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/80 transition-colors active:scale-[0.98] border border-border"
              >
                <Bookmark className="w-4 h-4" />
                حفظ
              </button>
            )}
            {onMarkContacted && (
              <button
                onClick={() => {
                  onMarkContacted(lead, "manual");
                  toast.success("تم تسجيل التواصل!");
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/15 text-primary font-bold text-sm hover:bg-primary/25 transition-colors active:scale-[0.98] border border-primary/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                تم التواصل ✅
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactModal;
