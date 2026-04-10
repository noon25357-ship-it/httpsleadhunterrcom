import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Calendar, CheckCircle2, ChevronDown } from "lucide-react";
import type { SmartLead, PipelineStatus } from "./types";
import { PIPELINE_STATUSES } from "./types";

/* ── Next action per status ── */
const NEXT_ACTION: Record<PipelineStatus, { label: string; emoji: string; next: PipelineStatus } | null> = {
  new: { label: 'نقل إلى محفوظ', emoji: '📥', next: 'offer_generated' },
  offer_generated: { label: 'نقل إلى تم التواصل', emoji: '📤', next: 'contacted' },
  contacted: { label: 'نقل إلى بانتظار رد', emoji: '💬', next: 'replied' },
  replied: { label: 'نقل إلى مهتم', emoji: '🔥', next: 'interested' },
  interested: { label: 'نقل إلى عرض مرسل', emoji: '⚡', next: 'follow_up' },
  follow_up: { label: 'نقل إلى مغلق', emoji: '✅', next: 'closed' },
  closed: null,
  not_interested: null,
};

/* ── Score ring color ── */
const scoreRing = (s: number) =>
  s >= 70 ? 'border-primary text-primary bg-primary/10' 
  : s >= 40 ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' 
  : 'border-blue-400 text-blue-400 bg-blue-400/10';

interface SmartLeadCardProps {
  lead: SmartLead;
  index: number;
  onUpdate: (lead: SmartLead) => void;
}

const SmartLeadCard = ({ lead, index, onUpdate }: SmartLeadCardProps) => {
  const [justChanged, setJustChanged] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const action = NEXT_ACTION[lead.pipelineStatus];
  const statusConfig = PIPELINE_STATUSES[lead.pipelineStatus];

  const handleAction = () => {
    if (!action) return;
    setJustChanged(true);
    onUpdate({ ...lead, pipelineStatus: action.next, lastContact: new Date().toISOString() });
    setTimeout(() => setJustChanged(false), 1200);
  };

  const handleStatusChange = (status: PipelineStatus) => {
    setJustChanged(true);
    onUpdate({ ...lead, pipelineStatus: status });
    setShowStatusMenu(false);
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
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative glass-card rounded-2xl overflow-hidden hover:neon-border transition-shadow duration-300"
    >
      {/* Success flash */}
      <AnimatePresence>
        {justChanged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/10 pointer-events-none z-20 rounded-2xl flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="w-8 h-8 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* ── Header: Score + Name + Location ── */}
        <div className="flex items-start gap-3">
          {/* Score circle */}
          <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center ${scoreRing(lead.opportunityScore)}`}>
            <span className="text-base sm:text-lg font-black leading-none">{lead.opportunityScore}%</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-black text-foreground leading-tight truncate">
              {lead.businessName}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{lead.category}</span>
              <span className="text-border">•</span>
              <span>{lead.city}</span>
            </div>
          </div>
        </div>

        {/* ── Status badge (clickable) ── */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${statusConfig.color}`}
          >
            <span>{statusConfig.emoji}</span>
            <span>{statusConfig.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full right-0 mt-1 z-30 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[160px]"
              >
                {Object.entries(PIPELINE_STATUSES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key as PipelineStatus)}
                    className={`w-full text-right flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-secondary/80 ${lead.pipelineStatus === key ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                  >
                    <span>{val.emoji}</span>
                    <span>{val.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Why this lead ── */}
        {reasons.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">لماذا هذا العميل؟</span>
            <div className="flex flex-wrap gap-1.5">
              {reasons.map((r, i) => (
                <span key={i} className="text-[11px] sm:text-xs bg-secondary/80 text-muted-foreground px-2.5 py-1 rounded-lg border border-border/50 leading-tight">
                  💡 {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Timeline info ── */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {lead.lastContact ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              آخر تواصل: {formatRelative(lead.lastContact)}
            </span>
          ) : null}
          {lead.nextFollowUp ? (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              متابعة: {new Date(lead.nextFollowUp).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
            </span>
          ) : null}
          {!lead.lastContact && !lead.nextFollowUp && (
            <span className="opacity-60">🕐 لم يتم التواصل بعد</span>
          )}
        </div>

        {/* ── Main CTA ── */}
        <AnimatePresence mode="wait">
          {action ? (
            <motion.button
              key={lead.pipelineStatus}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onClick={handleAction}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all active:scale-[0.97]"
            >
              {action.emoji} {action.label}
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-3 rounded-xl bg-secondary/50 text-center text-xs text-muted-foreground font-semibold"
            >
              {lead.pipelineStatus === 'closed' ? '✅ تم الإغلاق' : '❌ غير مهتم'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SmartLeadCard;
