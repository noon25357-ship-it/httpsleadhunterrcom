import { Lightbulb } from "lucide-react";

interface WhyThisLeadProps {
  reasons: string[];
}

const WhyThisLead = ({ reasons }: WhyThisLeadProps) => {
  if (!reasons.length) return null;

  return (
    <div className="bg-secondary/40 border border-border/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-[11px] font-bold text-foreground">ليش هذه فرصة؟</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {reasons.map((r, i) => (
          <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground border border-border/50">
            💡 {r}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WhyThisLead;
