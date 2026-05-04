import { useMemo, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { generateSmartOutreach, READINESS_BADGE } from "@/lib/smartOutreach";
import SmartOutreachModal from "./SmartOutreachModal";

interface Props {
  lead: Lead;
  onMarkContacted?: (lead: Lead) => void;
}

const SmartOutreachBox = ({ lead, onMarkContacted }: Props) => {
  const [open, setOpen] = useState(false);
  const outreach = useMemo(() => generateSmartOutreach(lead), [lead]);
  const meta = READINESS_BADGE[outreach.contact_readiness_level];

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>مساعد التواصل الذكي</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.classes}`}>
          {meta.emoji} {meta.label} ({outreach.contact_readiness_score})
        </span>
      </div>

      {/* Contact reason */}
      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
        💡 {outreach.contact_reason}
      </p>

      {/* Suggested offer */}
      <div className="text-[11px] text-foreground bg-background/60 border border-border/40 rounded-lg px-2 py-1.5">
        <span className="text-muted-foreground">العرض:</span>{" "}
        <span className="font-bold">{outreach.suggested_offer}</span>
      </div>

      {/* Tags */}
      {outreach.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {outreach.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] text-muted-foreground bg-secondary/60 border border-border/50 px-1.5 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        جهّز الرسالة
      </button>

      <SmartOutreachModal
        lead={lead}
        outreach={outreach}
        open={open}
        onClose={() => setOpen(false)}
        onMarkContacted={onMarkContacted}
      />
    </div>
  );
};

export default SmartOutreachBox;
