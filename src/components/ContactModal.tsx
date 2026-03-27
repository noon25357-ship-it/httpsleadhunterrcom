import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, PhoneCall, Copy, Check, Settings2 } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

interface ContactModalProps {
  lead: Lead | null;
  onClose: () => void;
}

const services = [
  { key: "website", label: "موقع" },
  { key: "marketing", label: "تسويق" },
  { key: "social", label: "سوشيال" },
];

const tones = [
  { key: "friendly", label: "ودّي" },
  { key: "formal", label: "رسمي" },
];

const ContactModal = ({ lead, onClose }: ContactModalProps) => {
  const [service, setService] = useState("website");
  const [tone, setTone] = useState("friendly");
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editableMessage, setEditableMessage] = useState<string | null>(null);

  if (!lead) return null;

  const defaultMsg = getDefaultMessage(service, tone);
  const message = editableMessage ?? defaultMsg;
  const whatsappUrl = `https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`;

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("تم النسخ!");
    trackEvent(label === "msg" ? "copy_message" : "copy_phone", { leadId: lead.id });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-2xl neon-border overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-bold text-lg text-foreground">{lead.name}</h3>
              <p className="text-sm text-muted-foreground">{lead.area}، {lead.city}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Actions */}
          <div className="p-5 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("click_whatsapp", { leadId: lead.id })}
              className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:brightness-110 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              👉 واتساب
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                📞 اتصال
              </a>
              <button
                onClick={() => copyText(lead.phone, "phone")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                {copied === "phone" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                📋 نسخ الرقم
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="px-5 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">الرسالة الجاهزة</span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Settings2 className="w-3.5 h-3.5" />
                تخصيص
              </button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pb-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">الخدمة</label>
                      <div className="flex gap-2">
                        {services.map((s) => (
                          <button
                            key={s.key}
                            onClick={() => { setService(s.key); setEditableMessage(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${service === s.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">الأسلوب</label>
                      <div className="flex gap-2">
                        {tones.map((t) => (
                          <button
                            key={t.key}
                            onClick={() => { setTone(t.key); setEditableMessage(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tone === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              value={message}
              onChange={(e) => setEditableMessage(e.target.value)}
              rows={5}
              className="w-full bg-secondary rounded-xl p-4 text-sm leading-relaxed text-secondary-foreground resize-none border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-2">
              <button
                onClick={() => copyText(message, "msg")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                {copied === "msg" ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                👉 نسخ الرسالة
              </button>
              <button
                onClick={() => setEditableMessage(null)}
                className="px-4 py-2.5 rounded-xl text-xs text-muted-foreground hover:bg-secondary transition-colors border border-border"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactModal;
