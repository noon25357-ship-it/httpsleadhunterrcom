import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MessageCircle, Copy, X, Check } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

interface TopActionProps {
  leads: Lead[];
}

const TopAction = ({ leads }: TopActionProps) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const topLeads = leads.filter((l) => l.label === "hot").slice(0, 5);
  if (topLeads.length === 0) return null;

  const message = getDefaultMessage("website", "friendly");

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("تم نسخ الرسالة!");
    trackEvent("copy_message_top5");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Sticky bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-30 mb-6"
      >
        <button
          onClick={() => {
            trackEvent("open_top5");
            setShowModal(true);
          }}
          className="w-full glass-card neon-border-strong rounded-2xl p-4 flex items-center justify-between gap-3 hover:brightness-110 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-foreground">👉 تواصل مع أفضل {topLeads.length} الآن ⚡</h3>
              <p className="text-xs text-muted-foreground">أرقام + رسالة جاهزة — ابدأ خلال ثواني</p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm shrink-0 group-hover:shadow-[0_0_15px_hsl(145_80%_42%/0.4)] transition-shadow">
            ابدأ
          </div>
        </button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card rounded-2xl neon-border overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg text-foreground">أفضل {topLeads.length} فرص الآن 🔥</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-5 space-y-2 max-h-[50vh] overflow-y-auto">
                {topLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
                    <div>
                      <span className="font-medium text-sm text-foreground block">{lead.name}</span>
                      <span className="text-xs text-muted-foreground">{lead.phone}</span>
                    </div>
                    <a
                      href={`https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("click_whatsapp_top5", { leadId: lead.id })}
                      className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={copyMessage}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  📋 نسخ رسالة واحدة للجميع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopAction;
