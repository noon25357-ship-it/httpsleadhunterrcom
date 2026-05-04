import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { calculateSEOOpportunity, SEO_BADGE, OPPORTUNITY_TYPE_META } from "@/lib/seoOpportunity";
import SEOWhatsappModal from "./SEOWhatsappModal";

interface Props {
  lead: Lead;
}

const SEOOpportunityBox = ({ lead }: Props) => {
  const [open, setOpen] = useState(false);
  const opp = calculateSEOOpportunity(lead);
  const meta = SEO_BADGE[opp.level];
  const typeMeta = OPPORTUNITY_TYPE_META[opp.opportunity_type];
  const topReasons = opp.reasons.slice(0, 2);

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 flex flex-col gap-2.5">
      {/* Header — title + badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <span>🔍</span>
          <span>فرصة ظهور في قوقل</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.classes}`}>
          {meta.emoji} {meta.label} ({opp.score})
        </span>
      </div>

      {/* Type chip — single line */}
      <div className="text-[11px] text-muted-foreground">
        <span className="text-foreground font-bold">{typeMeta.emoji} {typeMeta.label}</span>
      </div>

      {/* Reasons (max 2) */}
      <ul className="space-y-1">
        {topReasons.map((r) => (
          <li key={r} className="text-[11px] text-muted-foreground leading-snug flex gap-1.5">
            <span className="text-primary/70">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>

      {/* Local keyword */}
      <div className="text-[11px] text-foreground bg-background/60 border border-border/40 rounded-lg px-2 py-1.5">
        <span className="text-muted-foreground">كلمة محلية:</span>{" "}
        <span className="font-bold">{opp.suggested_local_keyword}</span>
      </div>

      {/* Single CTA */}
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
      >
        <Sparkles className="w-3.5 h-3.5" />
        استخدم كزاوية تواصل
      </button>

      <SEOWhatsappModal lead={lead} opportunity={opp} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default SEOOpportunityBox;
