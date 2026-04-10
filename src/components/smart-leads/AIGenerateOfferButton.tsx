import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check } from "lucide-react";
import type { SmartLead } from "./types";
import { generateOfferMessage } from "./generateOffer";
import QuickActions from "./QuickActions";

interface AIGenerateOfferButtonProps {
  lead: SmartLead;
  onGenerated?: () => void;
}

const AIGenerateOfferButton = ({ lead, onGenerated }: AIGenerateOfferButtonProps) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setState("loading");
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      setMessage(generateOfferMessage(lead));
      setState("done");
      onGenerated?.();
    }, delay);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === "idle") {
    return (
      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:brightness-110 hover:shadow-[0_0_20px_hsl(145_80%_42%/0.3)] transition-all active:scale-[0.98]"
      >
        <Sparkles className="w-4 h-4" />
        ولّد رسالة ✨
      </button>
    );
  }

  if (state === "loading") {
    return (
      <div className="w-full flex flex-col items-center gap-2 py-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground">جاري توليد العرض بالذكاء الاصطناعي...</span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="bg-secondary/60 border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> الرسالة المولدة
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
              {copied ? "تم النسخ" : "نسخ"}
            </button>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">{message}</p>
        </div>
        <QuickActions lead={lead} message={message} />
      </motion.div>
    </AnimatePresence>
  );
};

export default AIGenerateOfferButton;
