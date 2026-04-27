import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageCircle, Copy, CheckCircle2, ChevronDown,
  Zap, Clock, Pencil, Send,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/lib/leadData";
import type { SavedLead, LeadStatus, ContactChannel } from "@/lib/leadStatuses";
import { getSmartAction, getNextFollowUpDays } from "@/lib/leadStatuses";
import {
  generateExecutionMessage, openWhatsApp, getNextStatus,
  calculateFollowUpDate, getNextActionHint, getSequence,
  getUserPreferences, updateUserPreference,
  OUTCOME_ACTIONS,
} from "@/lib/executionEngine";
import { SERVICE_OPTIONS } from "@/lib/messageGenerator";

interface ExecutionModalProps {
  saved: SavedLead | null;
  onClose: () => void;
  onExecute: (savedId: string, updates: {
    status: LeadStatus;
    followUpDate: string;
    channel: ContactChannel;
    lastAction: string;
  }) => Promise<void>;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

type Phase = "preview" | "executing" | "done";

const ExecutionModal = ({ saved, onClose, onExecute, onStatusChange }: ExecutionModalProps) => {
  const [phase, setPhase] = useState<Phase>("preview");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState("website");

  const lead = saved ? (saved.lead_data as Lead) : null;
  const status = (saved?.status || "new") as LeadStatus;
  const score = lead?.score || 0;

  const prefs = useMemo(() => getUserPreferences(), []);

  const daysElapsed = useMemo(() => {
    if (!saved?.last_action_at) return 0;
    return Math.floor((Date.now() - new Date(saved.last_action_at).getTime()) / (1000 * 60 * 60 * 24));
  }, [saved?.last_action_at]);

  const smartAction = useMemo(
    () => getSmartAction(status, daysElapsed, score),
    [status, daysElapsed, score]
  );

  const nextStatus = getNextStatus(status);
  const followUpDays = getNextFollowUpDays(score);
  const followUpDate = calculateFollowUpDate(score);
  const nextHint = getNextActionHint(nextStatus, followUpDays);
  const sequence = getSequence(score);

  // Generate message on open
  useEffect(() => {
    if (lead && saved) {
      setPhase("preview");
      setIsEditing(false);
      setSelectedService(prefs.preferredService || "website");
      const msg = generateExecutionMessage(lead, smartAction.messageType, prefs.preferredService);
      setMessage(msg);
    }
  }, [saved?.id]);

  // Regenerate when service changes
  useEffect(() => {
    if (lead) {
      const msg = generateExecutionMessage(lead, smartAction.messageType, selectedService);
      setMessage(msg);
      updateUserPreference("preferredService", selectedService);
    }
  }, [selectedService]);

  if (!saved || !lead) return null;

  const handleExecute = async () => {
    setPhase("executing");

    // 1. Open WhatsApp with pre-filled message
    if (lead.phone) {
      openWhatsApp(lead.phone, message);
      updateUserPreference("preferredChannel", "whatsapp");
    } else {
      navigator.clipboard.writeText(message);
      toast.success("تم نسخ الرسالة");
    }

    // 2. Auto-update status + schedule follow-up
    await onExecute(saved.id, {
      status: nextStatus,
      followUpDate,
      channel: lead.phone ? "whatsapp" : "copy",
      lastAction: "message_sent",
    });

    // 3. Show done state
    setTimeout(() => setPhase("done"), 800);
  };

  const handleCopyOnly = () => {
    navigator.clipboard.writeText(message);
    toast.success("تم نسخ الرسالة");
    updateUserPreference("preferredChannel", "copy");
  };

  const handleOutcome = (outcomeStatus: LeadStatus) => {
    onStatusChange(saved.id, outcomeStatus);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-black text-foreground text-sm">{lead.name}</h2>
                <p className="text-[10px] text-muted-foreground">{smartAction.emoji} {smartAction.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* ── Preview Phase ── */}
            {phase === "preview" && (
              <>
                {/* Service selector */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground mb-1.5">الخدمة</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {SERVICE_OPTIONS.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setSelectedService(s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          selectedService === s.key
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}
                      >
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message preview / editor */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground">الرسالة</p>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-[10px] text-primary flex items-center gap-1 hover:underline"
                    >
                      <Pencil className="w-3 h-3" />
                      {isEditing ? "معاينة" : "تعديل"}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-xl p-3 text-sm text-foreground resize-none min-h-[180px] leading-relaxed"
                      autoFocus
                    />
                  ) : (
                    <div className="bg-secondary/60 border border-border rounded-xl p-3 text-sm text-foreground whitespace-pre-line leading-relaxed min-h-[120px]">
                      {message}
                    </div>
                  )}
                </div>

                {/* Execution plan summary */}
                <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-black text-primary">عند الضغط على "نفّذ" سيحصل:</p>
                  <div className="space-y-1.5 text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{lead.phone ? "فتح واتساب مع الرسالة جاهزة" : "نسخ الرسالة للحافظة"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>تحديث الحالة تلقائياً → {nextStatus === "contacted" ? "تم التواصل" : nextStatus === "follow_up" ? "يحتاج متابعة" : nextStatus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>جدولة متابعة بعد {followUpDays} {followUpDays === 1 ? "يوم" : "أيام"}</span>
                    </div>
                  </div>
                </div>

                {/* Sequence preview */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground mb-1.5">تسلسل المتابعة</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {sequence.map((step, i) => (
                      <div
                        key={step.step}
                        className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-[10px] ${
                          i === 0
                            ? "bg-primary/10 border-primary/30 text-primary font-bold"
                            : "bg-secondary border-border text-muted-foreground"
                        }`}
                      >
                        <span className="font-black">خطوة {step.step}</span>
                        <span>{step.label}</span>
                        {step.daysAfterPrevious > 0 && (
                          <span className="text-[9px] opacity-70">بعد {step.daysAfterPrevious} أيام</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExecute}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-black hover:brightness-110 transition-all active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4" />
                    نفّذ الآن ⚡
                  </button>
                  <button
                    onClick={handleCopyOnly}
                    className="shrink-0 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* ── Executing Phase ── */}
            {phase === "executing" && (
              <div className="py-12 flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-10 h-10 text-primary" />
                </motion.div>
                <p className="text-sm font-bold text-foreground">جاري التنفيذ...</p>
              </div>
            )}

            {/* ── Done Phase ── */}
            {phase === "done" && (
              <div className="space-y-4">
                {/* Success feedback */}
                <div className="py-6 flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-base font-black text-foreground">تم الإرسال ✅</p>
                    <p className="text-xs text-muted-foreground mt-1">تم جدولة المتابعة ⏰</p>
                  </div>
                </div>

                {/* Next action hint */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-amber-400 mb-1">الخطوة التالية</p>
                  <p className="text-sm font-bold text-foreground">{nextHint}</p>
                </div>

                {/* Outcome tracking buttons */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground mb-2">ماذا حصل؟ (حدّث لاحقاً)</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {OUTCOME_ACTIONS.map((action) => (
                      <button
                        key={action.key}
                        onClick={() => handleOutcome(action.nextStatus)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-secondary border border-border hover:bg-secondary/80 transition-colors text-foreground"
                      >
                        <span>{action.emoji}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExecutionModal;
