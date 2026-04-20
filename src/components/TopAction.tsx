import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MessageCircle, Copy, X, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

interface TopActionProps {
  leads: Lead[];
}

const TopAction = ({ leads }: TopActionProps) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const topLeads = leads.filter((l) => l.label === "hot").slice(0, 5);
  if (topLeads.length === 0) return null;

  const message = getDefaultMessage("website", "friendly");

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success(t("leadCard.messageCopied"));
    trackEvent("copy_message_top5");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-2 sm:top-4 z-30 mb-4 sm:mb-6"
      >
        <button
          onClick={() => {
            trackEvent("open_top5");
            setShowModal(true);
          }}
          className="w-full glass-card neon-border-strong rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3 hover:brightness-110 transition-all group active:scale-[0.99]"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/15 shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="text-right min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{t("topAction.title", { count: topLeads.length })}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t("topAction.subtitle")}</p>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm shrink-0 group-hover:shadow-[0_0_15px_hsl(145_80%_42%/0.4)] transition-shadow">
            {t("topAction.start")}
          </div>
        </button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md glass-card rounded-t-2xl sm:rounded-2xl neon-border overflow-hidden max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border">
                <h3 className="font-bold text-base sm:text-lg text-foreground">{t("topAction.modalTitle", { count: topLeads.length })}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-2 overflow-y-auto max-h-[50vh]">
                {topLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm text-foreground block truncate">{lead.name}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">{lead.phone}</span>
                    </div>
                    <a
                      href={`https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("click_whatsapp_top5", { leadId: lead.id })}
                      className="p-2 sm:p-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all shrink-0 mr-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="p-4 sm:p-5 pt-0">
                <button
                  onClick={copyMessage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border border-border text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors active:scale-[0.98]"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  {t("topAction.copyForAll")}
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
