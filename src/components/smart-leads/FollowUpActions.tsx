import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldQuestion, RotateCcw, Copy, Check } from "lucide-react";
import type { SmartLead } from "./types";

interface FollowUpActionsProps {
  lead: SmartLead;
}

type MsgType = 'no_reply' | 'objection';

const templates: Record<MsgType, (name: string) => string> = {
  no_reply: (name) => `هلا مرة ثانية 👋

أرسلت لكم رسالة قبل كم يوم بخصوص تطوير الحضور الرقمي لـ ${name}.

أفهم إنكم مشغولين، بس حبيت أتأكد إن الرسالة وصلتكم.

لو عندكم أي استفسار أو حابين تشوفون تصور سريع، أنا جاهز 🚀`,
  objection: (name) => `أفهم وجهة نظرك تمامًا 👍

كثير من أصحاب الأنشطة مثل ${name} كانوا يشوفون نفس الشيء، لكن بعد ما جربوا لاحظوا فرق واضح في عدد العملاء اللي يجونهم من قوقل.

ممكن أعطيك تجربة بسيطة بدون أي التزام، وتقرر بنفسك. وش رأيك؟`,
};

const FollowUpActions = ({ lead }: FollowUpActionsProps) => {
  const [generating, setGenerating] = useState<MsgType | null>(null);
  const [message, setMessage] = useState<{ type: MsgType; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = (type: MsgType) => {
    setGenerating(type);
    setMessage(null);
    setTimeout(() => {
      setMessage({ type, text: templates[type](lead.businessName) });
      setGenerating(null);
    }, 1000 + Math.random() * 800);
  };

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <button
          onClick={() => generate('no_reply')}
          disabled={generating !== null}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold hover:bg-indigo-500/25 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" />
          متابعة عدم الرد
        </button>
        <button
          onClick={() => generate('objection')}
          disabled={generating !== null}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 text-[10px] font-bold hover:bg-orange-500/25 transition-colors disabled:opacity-50"
        >
          <ShieldQuestion className="w-3 h-3" />
          رد على اعتراض
        </button>
      </div>

      {generating && (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-muted-foreground">جاري التوليد...</span>
        </div>
      )}

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-secondary/60 border border-border rounded-lg p-2.5"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {message.type === 'no_reply' ? 'رسالة المتابعة' : 'رد على الاعتراض'}
              </span>
              <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground">
                {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                {copied ? 'تم' : 'نسخ'}
              </button>
            </div>
            <p className="text-[11px] text-foreground/90 leading-relaxed whitespace-pre-line">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpActions;
