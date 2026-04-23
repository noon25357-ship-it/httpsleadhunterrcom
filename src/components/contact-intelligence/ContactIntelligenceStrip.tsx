import { useMemo } from "react";
import { generateContactIntelligence, type LeadLike } from "@/lib/contactIntelligence";
import ContactPathBadge from "./ContactPathBadge";
import DecisionMakerBadge from "./DecisionMakerBadge";
import ReasonTags from "./ReasonTags";

interface Props {
  lead: LeadLike;
}

/**
 * Compact 1-line CI summary for lead cards.
 * Shows: Best path · Decision maker · 1–2 reason tags.
 */
const ContactIntelligenceStrip = ({ lead }: Props) => {
  const ci = useMemo(() => generateContactIntelligence(lead), [lead]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <ContactPathBadge path={ci.best_contact_path} compact />
      <DecisionMakerBadge decisionMaker={ci.likely_decision_maker} compact />
      <ReasonTags tags={ci.reason_tags} max={2} size="sm" />
    </div>
  );
};

export default ContactIntelligenceStrip;
