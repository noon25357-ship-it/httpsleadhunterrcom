import { UserCircle2 } from "lucide-react";
import { CONFIDENCE_META, type DecisionMaker } from "@/lib/contactIntelligence";

interface Props {
  decisionMaker: DecisionMaker;
  compact?: boolean;
}

const DecisionMakerBadge = ({ decisionMaker, compact = false }: Props) => {
  const conf = CONFIDENCE_META[decisionMaker.confidence];

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-secondary/70 border border-border/60 px-2 py-0.5 rounded-md">
        <UserCircle2 className="w-3 h-3 text-muted-foreground" />
        <span className="truncate max-w-[140px]">{decisionMaker.role}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground bg-secondary border border-border px-2.5 py-1 rounded-lg">
        <UserCircle2 className="w-3.5 h-3.5 text-primary" />
        <span>{decisionMaker.role}</span>
      </span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.classes}`}>
        {conf.label}
      </span>
    </div>
  );
};

export default DecisionMakerBadge;
