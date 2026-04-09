import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, CheckCircle2 } from "lucide-react";
import type { SmartLead, PipelineStatus } from "./types";
import LeadPipelineBadge from "./LeadPipelineBadge";

/* ── Action button config per pipeline status ── */
const NEXT_ACTION: Record<PipelineStatus, { label: string; emoji: string; next: PipelineStatus } | null> = {
  new: { label: 'أنشئ عرض', emoji: '⚡', next: 'offer_generated' },
  offer_generated: { label: 'أرسل العرض', emoji: '📤', next: 'contacted' },
  contacted: { label: 'سجّل رد', emoji: '💬', next: 'replied' },
  replied: { label: 'مهتم؟', emoji: '🔥', next: 'interested' },
  interested: { label: 'تابع', emoji: '🔄', next: 'follow_up' },
  follow_up: { label: 'أغلق الصفقة', emoji: '✅', next: 'closed' },
  closed: null,
  not_interested: null,
};

/* ── Score color helper ── */
const scoreColor = (s: number) =>
  s >= 70 ? 'text-primary' : s >= 40 ? 'text-yellow-400' : 'text-blue-400';

const scoreBg = (s: number) =>
  s >= 70 ? 'bg-primary/15 border-primary/30' : s >= 40 ? 'bg-yellow-500/15 border-yellow-500/30' : 'bg-blue-500/15 border-blue-500/30';

interface SmartLeadCardProps {
  lead: SmartLead;
  index: number;
  onUpdate: (lead: SmartLead) => void;
}

const SmartLeadCard = ({ lead, index, onUpdate }: SmartLeadCardProps) => {
  const [justChanged, setJustChanged] = useState(false);
  const action = NEXT_ACTION[lead.pipelineStatus];

  const handleAction = () => {
    if (!action) return;
    setJustChanged(true);
    onUpdate({ ...lead, pipelineStatus: action.next, lastContact: new Date().toISOString() });
    setTimeout(() => setJustChanged(false), 1200);
  };

  const handleStatusChange = (status: PipelineStatus) => {
    setJustChanged(true);
    onUpdate({ ...lead, pipelineStatus: status });
    setTimeout(() => setJustChanged(false), 1200);
  };

  const formatRelative = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'اليوم';
    if (days === 1) return 'أمس';
    return `قبل ${days} يوم`;
  };

  const reasons = lead.opportunityReasons.slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, layout: { duration: 0.3 } }}
      className="glass-card rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3 hover:neon-border transition-shadow duration-300 relative overflow-hidden"
    >
      {/* Success flash overlay */}
      <AnimatePresence>
        {justChanged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-primary/10 pointer-events-none z-10 rounded-xl"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute top-3 left-3"
            >
              <CheckCircle2 className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row 1: Name + Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{lead.businessName}</h3>
          <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span className="truncate">{lead.category}</span>
            <span className="text-border">•</span>
            <span>{lead.city}</span>
          </div>
        </div>
        <motion.div
          key={lead.opportunityScore}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black border ${scoreBg(lead.opportunityScore)} ${scoreColor(lead.opportunityScore)}`}
        >
          {lead.opportunityScore}%
        </motion.div>
      </div>

      {/* Row 2: Pipeline badge with animation */}
      <motion.div layout="position">
        <AnimatePresence mode="wait">
          <motion.div
            key={lead.pipelineStatus}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            <LeadPipelineBadge status={lead.pipelineStatus} onChange={handleStatusChange} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Row 3: Why this lead (2 reasons max) */}
      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reasons.map((r, i) => (
            <span key={i} className="text-[9px] sm:text-[10px] bg-secondary/60 text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded-full border border-border/50 leading-tight">
              💡 {r}
            </span>
          ))}
        </div>
      )}

      {/* Row 4: Meta (last action + follow-up) */}
      <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-muted-foreground">
        <AnimatePresence mode="wait">
          {lead.lastContact ? (
            <motion.span
              key={`contact-${lead.lastContact}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1"
            >
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {formatRelative(lead.lastContact)}
            </motion.span>
          ) : null}
        </AnimatePresence>
        {lead.nextFollowUp && (
          <span className="flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {new Date(lead.nextFollowUp).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {!lead.lastContact && !lead.nextFollowUp && (
          <span className="opacity-60">لم يتم التواصل بعد</span>
        )}
      </div>

      {/* Row 5: Single CTA with animation */}
      <AnimatePresence mode="wait">
        {action ? (
          <motion.button
            key={lead.pipelineStatus}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={handleAction}
            className="w-full mt-auto py-2 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-[11px] sm:text-xs font-bold hover:brightness-110 hover:shadow-[0_0_16px_hsl(var(--primary)/0.3)] transition-all active:scale-[0.97]"
          >
            {action.emoji} {action.label}
          </motion.button>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full mt-auto py-2 rounded-xl bg-secondary/50 text-center text-[10px] sm:text-[11px] text-muted-foreground font-medium"
          >
            {lead.pipelineStatus === 'closed' ? '✅ تم الإغلاق' : '❌ غير مهتم'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmartLeadCard;
