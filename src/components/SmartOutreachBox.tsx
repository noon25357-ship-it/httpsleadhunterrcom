import { useMemo, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { generateSmartOutreach, generateShortOffer, READINESS_BADGE } from "@/lib/smartOutreach";
import { calculateSEOOpportunity } from "@/lib/seoOpportunity";
import SmartOutreachModal from "./SmartOutreachModal";

interface Props {
  lead: Lead;
  onMarkContacted?: (lead: Lead) => void;
}

const SmartOutreachBox = ({ lead, onMarkContacted }: Props) => {
  const [open, setOpen] = useState(false);
  const outreach = useMemo(() => generateSmartOutreach(lead), [lead]);
  const seo = useMemo(() => calculateSEOOpportunity(lead), [lead]);
  const meta = READINESS_BADGE[outreach.contact_readiness_level];
  const showVisibility = seo.level === "strong";
  const shortOffer = useMemo(() => generateShortOffer(lead, outreach.niche), [lead, outreach.niche]);

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

      {/* Suggested offer (short) */}
      <div className="text-[11px] text-foreground bg-background/60 border border-border/40 rounded-lg px-2 py-1.5">
        <span className="text-muted-foreground">العرض:</span>{" "}
        <span className="font-bold">{shortOffer}</span>
      </div>

      {/* Subtle visibility hint (no level/score) */}
      {showVisibility && (
        <div className="text-[10.5px] text-muted-foreground/90 inline-flex items-center gap-1">
          <span>🔍</span>
          <span>فرصة ظهور:</span>
          <span className="text-foreground/80 font-semibold truncate">{seo.suggested_local_keyword}</span>
        </div>
      )}

      {/* CTA — primary */}
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-500/90 text-white shadow-[0_0_18px_hsl(145_80%_42%/0.25)] transition-all active:scale-[0.98]"
      >
        <Sparkles className="w-3.5 h-3.5" />
        جهّز الرسالة
      </button>

      <SmartOutreachModal
        lead={lead}
        outreach={outreach}
        seo={seo}
        open={open}
        onClose={() => setOpen(false)}
        onMarkContacted={onMarkContacted}
      />
    </div>
  );
};

export default SmartOutreachBox;
