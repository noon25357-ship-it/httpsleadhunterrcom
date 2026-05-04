import { useState } from "react";
import { MessageCircle, Eye, Eye as EyeOpen } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { calculateSEOOpportunity, SEO_BADGE, OPPORTUNITY_TYPE_META } from "@/lib/seoOpportunity";
import SEOWhatsappModal from "./SEOWhatsappModal";

interface Props {
  lead: Lead;
}

const SEOOpportunityBox = ({ lead }: Props) => {
  const [waOpen, setWaOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const opp = calculateSEOOpportunity(lead);
  const meta = SEO_BADGE[opp.level];
  const typeMeta = OPPORTUNITY_TYPE_META[opp.opportunity_type];
  const topReasons = opp.reasons.slice(0, 2);

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
          <span>🔍</span>
          <span>فرصة الظهور في قوقل</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.classes}`}>
          {meta.emoji} {meta.label} ({opp.score})
        </span>
      </div>

      {/* Opportunity type chip */}
      <div className="inline-flex items-start gap-1.5 text-[11px] bg-background/60 border border-border/40 rounded-lg px-2 py-1.5">
        <span>{typeMeta.emoji}</span>
        <div className="min-w-0">
          <div className="font-bold text-foreground">نوع الفرصة: {typeMeta.label}</div>
          <div className="text-muted-foreground leading-snug">{opp.opportunity_type_reason}</div>
        </div>
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
          {planOpen ? <EyeOpen className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {planOpen ? "إخفاء الخطة" : "عرض الخطة"}
        </button>
      </div>

      {/* Short sales plan */}
      {planOpen && (
        <div className="text-[11px] bg-background/60 border border-border/40 rounded-lg p-2.5 space-y-2">
          <div>
            <div className="text-muted-foreground font-bold">العرض المناسب:</div>
            <div className="text-foreground">{opp.suggested_offer}</div>
          </div>
          <div>
            <div className="text-muted-foreground font-bold">زاوية التواصل:</div>
            <div className="text-foreground">{opp.outreach_angle}</div>
          </div>
          <div>
            <div className="text-muted-foreground font-bold">ماذا أرسل له؟</div>
            <div className="text-foreground">رسالة واتساب جاهزة (اضغط زر "ولّد رسالة واتساب").</div>
          </div>
          <div>
            <div className="text-muted-foreground font-bold">ماذا أبيع عليه؟</div>
            <div className="text-foreground">صفحة تعريفية + واتساب + تحسين Google Business.</div>
          </div>
        </div>
      )}

      <SEOWhatsappModal lead={lead} opportunity={opp} open={waOpen} onClose={() => setWaOpen(false)} />
    </div>
  );
};

export default SEOOpportunityBox;
