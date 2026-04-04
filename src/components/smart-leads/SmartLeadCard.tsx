import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import type { SmartLead, PipelineStatus } from "./types";
import HealthAudit from "./HealthAudit";
import AIGenerateOfferButton from "./AIGenerateOfferButton";
import OpportunityScore from "./OpportunityScore";
import WhyThisLead from "./WhyThisLead";
import LeadPipelineBadge from "./LeadPipelineBadge";
import SavedLeadNotes from "./SavedLeadNotes";
import FollowUpActions from "./FollowUpActions";

const statusConfig = {
  'no-website': { label: 'لا يوجد موقع', badgeClass: 'bg-destructive/15 text-destructive border-destructive/30', indicatorClass: 'bg-destructive' },
  'weak-website': { label: 'موقع ضعيف', badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', indicatorClass: 'bg-yellow-500' },
  'has-website': { label: 'يوجد موقع', badgeClass: 'bg-primary/15 text-primary border-primary/30', indicatorClass: 'bg-primary' },
};

interface SmartLeadCardProps {
  lead: SmartLead;
  index: number;
  onUpdate: (lead: SmartLead) => void;
}

const SmartLeadCard = ({ lead, index, onUpdate }: SmartLeadCardProps) => {
  const [saved, setSaved] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const status = statusConfig[lead.websiteStatus];

  const handleStatusChange = (pipelineStatus: PipelineStatus) => {
    onUpdate({ ...lead, pipelineStatus });
  };

  const handleNotesUpdate = (data: { notes: string; lastContact: string | null; nextFollowUp: string | null }) => {
    onUpdate({ ...lead, ...data });
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleOfferGenerated = () => {
    if (lead.pipelineStatus === 'new') {
      onUpdate({ ...lead, pipelineStatus: 'offer_generated' });
    }
    setShowFollowUp(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 group hover:neon-border transition-shadow duration-300 relative"
    >
      {/* Priority dot */}
      <div className={`absolute top-4 left-4 w-2.5 h-2.5 rounded-full ${status.indicatorClass} shadow-[0_0_8px_currentColor]`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{lead.businessName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{lead.city}</span>
            <span className="text-border">•</span>
            <span>{lead.category}</span>
          </div>
        </div>
        <button onClick={handleSave} className="shrink-0 p-1 hover:bg-muted rounded-md transition-colors">
          {saved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
        </button>
      </div>

      {/* Pipeline + Website status */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <LeadPipelineBadge status={lead.pipelineStatus} onChange={handleStatusChange} />
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.badgeClass}`}>
          {status.label}
        </span>
      </div>

      {/* Opportunity Score */}
      <OpportunityScore score={lead.opportunityScore} />

      {/* Website link */}
      {lead.websiteUrl && (
        <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-fit">
          <Globe className="w-3 h-3" />
          <span className="truncate max-w-[200px]" dir="ltr">{lead.websiteUrl.replace(/^https?:\/\//, '')}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}

      {/* Health Audit */}
      {lead.websiteStatus !== 'no-website' && lead.speedScore !== undefined && lead.mobileScore !== undefined && (
        <HealthAudit speedScore={lead.speedScore} mobileScore={lead.mobileScore} />
      )}

      {/* Why This Lead */}
      <WhyThisLead reasons={lead.opportunityReasons} />

      {/* Notes */}
      <SavedLeadNotes
        notes={lead.notes}
        lastContact={lead.lastContact}
        nextFollowUp={lead.nextFollowUp}
        onUpdate={handleNotesUpdate}
      />

      {/* AI Offer + Follow-up */}
      <div className="mt-auto pt-1 space-y-2">
        <AIGenerateOfferButton lead={lead} onGenerated={handleOfferGenerated} />
        {showFollowUp && <FollowUpActions lead={lead} />}
      </div>
    </motion.div>
  );
};

export default SmartLeadCard;
