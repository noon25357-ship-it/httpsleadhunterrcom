import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { SmartLead, PipelineStatus, PIPELINE_STATUSES } from "./types";
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
  const action = NEXT_ACTION[lead.pipelineStatus];

  const handleAction = () => {
    if (action) {
      onUpdate({ ...lead, pipelineStatus: action.next });
    }
  };

  const handleStatusChange = (status: PipelineStatus) => {
    onUpdate({ ...lead, pipelineStatus: status });
  };

  // Format relative time for lastContact
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card rounded-xl p-4 flex flex-col gap-3 hover:neon-border transition-shadow duration-300"
    >
      {/* Row 1: Name + Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground truncate">{lead.businessName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{lead.category}</span>
            <span className="text-border">•</span>
            <span>{lead.city}</span>
          </div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-black border ${scoreBg(lead.opportunityScore)} ${scoreColor(lead.opportunityScore)}`}>
          {lead.opportunityScore}%
        </div>
      </div>

      {/* Row 2: Pipeline badge */}
      <LeadPipelineBadge status={lead.pipelineStatus} onChange={handleStatusChange} />

      {/* Row 3: Why this lead (2 reasons max) */}
      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reasons.map((r, i) => (
            <span key={i} className="text-[10px] bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
              💡 {r}
            </span>
          ))}
        </div>
      )}

      {/* Row 4: Meta (last action + follow-up) */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        {lead.lastContact && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelative(lead.lastContact)}
          </span>
        )}
        {lead.nextFollowUp && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(lead.nextFollowUp).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {!lead.lastContact && !lead.nextFollowUp && (
          <span className="opacity-60">لم يتم التواصل بعد</span>
        )}
      </div>

      {/* Row 5: Single CTA */}
      {action && (
        <button
          onClick={handleAction}
          className="w-full mt-auto py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 hover:shadow-[0_0_16px_hsl(var(--primary)/0.3)] transition-all active:scale-[0.98]"
        >
          {action.emoji} {action.label}
        </button>
      )}

      {!action && (
        <div className="w-full mt-auto py-2 rounded-xl bg-secondary/50 text-center text-[11px] text-muted-foreground font-medium">
          {lead.pipelineStatus === 'closed' ? '✅ تم الإغلاق' : '❌ غير مهتم'}
        </div>
      )}
    </motion.div>
  );
};

export default SmartLeadCard;
