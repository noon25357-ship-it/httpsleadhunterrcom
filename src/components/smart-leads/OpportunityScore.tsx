import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface OpportunityScoreProps {
  score: number;
}

const OpportunityScore = ({ score }: OpportunityScoreProps) => {
  const getConfig = () => {
    if (score >= 70) return { label: 'فرصة قوية', emoji: '🔥', color: 'text-primary', bg: 'bg-primary/15 border-primary/30', bar: 'bg-primary' };
    if (score >= 40) return { label: 'فرصة متوسطة', emoji: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', bar: 'bg-yellow-500' };
    return { label: 'فرصة ضعيفة', emoji: '🔵', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', bar: 'bg-blue-500' };
  };

  const config = getConfig();

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${config.bg}`}>
      <TrendingUp className={`w-3.5 h-3.5 ${config.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold ${config.color}`}>{config.emoji} {config.label}</span>
          <span className={`text-[10px] font-bold ${config.color}`}>{score}/100</span>
        </div>
        <div className="w-full h-1 bg-muted rounded-full mt-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${config.bar}`}
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityScore;
