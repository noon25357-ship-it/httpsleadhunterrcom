import { motion } from "framer-motion";
import { Flame, Send, RotateCcw, CheckCircle2 } from "lucide-react";
import type { SmartLead } from "./types";

interface DashboardStatsProps {
  leads: SmartLead[];
}

const DashboardStats = ({ leads }: DashboardStatsProps) => {
  const highPotential = leads.filter(l => l.opportunityScore >= 70).length;
  const readyToContact = leads.filter(l => l.pipelineStatus === 'new' || l.pipelineStatus === 'offer_generated').length;
  const needsFollowUp = leads.filter(l => l.pipelineStatus === 'contacted' || l.pipelineStatus === 'follow_up').length;
  const closedThisWeek = leads.filter(l => l.pipelineStatus === 'closed').length;

  const stats = [
    { label: 'فرص عالية', value: highPotential, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'جاهز للتواصل', value: readyToContact, icon: Send, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { label: 'يحتاج متابعة', value: needsFollowUp, icon: RotateCcw, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'تم الإغلاق', value: closedThisWeek, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl border ${s.bg}`}
        >
          <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color} shrink-0`} />
          <div>
            <p className={`text-lg sm:text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;
