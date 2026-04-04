import { motion } from "framer-motion";
import { MapPin, Globe, AlertTriangle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import type { SmartLead } from "./types";
import HealthAudit from "./HealthAudit";
import AIGenerateOfferButton from "./AIGenerateOfferButton";

interface SmartLeadCardProps {
  lead: SmartLead;
  index: number;
}

const statusConfig = {
  'no-website': {
    label: 'لا يوجد موقع',
    icon: XCircle,
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    indicatorClass: 'bg-red-500',
  },
  'weak-website': {
    label: 'موقع ضعيف',
    icon: AlertTriangle,
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    indicatorClass: 'bg-yellow-500',
  },
  'has-website': {
    label: 'يوجد موقع',
    icon: CheckCircle,
    badgeClass: 'bg-primary/15 text-primary border-primary/30',
    indicatorClass: 'bg-primary',
  },
};

const SmartLeadCard = ({ lead, index }: SmartLeadCardProps) => {
  const status = statusConfig[lead.websiteStatus];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-4 sm:p-5 flex flex-col gap-3 group hover:neon-border transition-shadow duration-300 relative"
    >
      {/* Priority indicator dot */}
      <div className={`absolute top-4 left-4 w-2.5 h-2.5 rounded-full ${status.indicatorClass} shadow-[0_0_8px_currentColor]`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{lead.businessName}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>{lead.city}</span>
            <span className="text-border">•</span>
            <span>{lead.category}</span>
          </div>
        </div>
        <div className={`shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 border ${status.badgeClass}`}>
          <StatusIcon className="w-3 h-3" />
          <span className="hidden sm:inline">{status.label}</span>
        </div>
      </div>

      {/* Website link */}
      {lead.websiteUrl && (
        <a
          href={lead.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <Globe className="w-3 h-3" />
          <span className="truncate max-w-[200px]" dir="ltr">{lead.websiteUrl.replace(/^https?:\/\//, '')}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}

      {/* Health Audit for websites */}
      {lead.websiteStatus !== 'no-website' && lead.speedScore !== undefined && lead.mobileScore !== undefined && (
        <HealthAudit speedScore={lead.speedScore} mobileScore={lead.mobileScore} />
      )}

      {/* AI Offer */}
      <div className="mt-auto pt-1">
        <AIGenerateOfferButton lead={lead} />
      </div>
    </motion.div>
  );
};

export default SmartLeadCard;
