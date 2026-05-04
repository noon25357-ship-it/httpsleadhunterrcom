import { useState } from "react";
import { Search, MessageCircle, Eye } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { calculateSEOOpportunity, SEO_BADGE } from "@/lib/seoOpportunity";
import SEOWhatsappModal from "./SEOWhatsappModal";

interface Props {
  lead: Lead;
}

const SEOOpportunityBox = ({ lead }: Props) => {
  const [waOpen, setWaOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const opp = calculateSEOOpportunity(lead);
  const meta = SEO_BADGE[opp.level];
  const topReasons = opp.reasons.slice(0, 2);

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <Search className="w-3.5 h-3.5 text-primary" />
          <span>فرصة الظهور في قوقل</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.classes}`}>
          {meta.emoji} {meta.label} ({opp.score})
        </span>
      </div>

      {/* Reasons */}
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

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setWaOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
        >
          <MessageCircle className="w-3 h-3" />
          ولّد رسالة واتساب
        </button>
        <button
          onClick={() => setPlanOpen((v) => !v)}
          className="inline-flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 px-2.5 rounded-lg bg-secondary hover:bg-secondary/70 text-foreground border border-border"
        >
          <Eye className="w-3 h-3" />
          عرض الخطة
        </button>
      </div>

      {planOpen && (
        <div className="text-[11px] text-foreground bg-background/60 border border-border/40 rounded-lg p-2.5 space-y-1.5">
          <div>
            <span className="text-muted-foreground">العرض المقترح:</span>{" "}
            <span className="font-bold">{opp.suggested_offer}</span>
          </div>
          <div>
            <span className="text-muted-foreground">زاوية التواصل:</span>{" "}
            <span>{opp.outreach_angle}</span>
          </div>
        </div>
      )}

      <SEOWhatsappModal lead={lead} opportunity={opp} open={waOpen} onClose={() => setWaOpen(false)} />
    </div>
  );
};

export default SEOOpportunityBox;
