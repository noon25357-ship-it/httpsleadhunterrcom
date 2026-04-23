import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { generateContactIntelligence, type LeadLike } from "@/lib/contactIntelligence";
import ContactPathBadge from "./ContactPathBadge";
import DecisionMakerBadge from "./DecisionMakerBadge";
import ReasonTags from "./ReasonTags";
import NextActionCTA from "./NextActionCTA";
import OutreachBox from "./OutreachBox";

interface Props {
  lead: LeadLike;
}

/**
 * Full Contact Intelligence section.
 * Designed for the lead details / contact modal.
 */
const ContactIntelligenceCard = ({ lead }: Props) => {
  const ci = useMemo(() => generateContactIntelligence(lead), [lead]);

  return (
    <section className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border/70 flex items-center gap-2 bg-primary/[0.04]">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-black text-foreground tracking-tight">
          Contact Intelligence
        </h3>
        <span className="ms-auto text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Decision engine
        </span>
      </header>

      <div className="p-4 space-y-5">
        {/* 1. Best Contact Path */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Best contact path
          </p>
          <ContactPathBadge path={ci.best_contact_path} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ci.best_contact_path.reason}
          </p>
        </div>

        {/* 2. Likely Decision Maker */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Likely decision maker
          </p>
          <DecisionMakerBadge decisionMaker={ci.likely_decision_maker} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ci.likely_decision_maker.reason}
          </p>
        </div>

        {/* 3. Why this lead */}
        {ci.reason_tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Why this lead
            </p>
            <ReasonTags tags={ci.reason_tags} />
          </div>
        )}

        {/* 4. Next best action — primary CTA */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Next best action
          </p>
          <NextActionCTA
            action={ci.next_best_action}
            href={ci.best_contact_path.href}
          />
        </div>

        {/* 5. Ready outreach message */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Ready outreach message
          </p>
          <OutreachBox message={ci.outreach_message} />
        </div>
      </div>
    </section>
  );
};

export default ContactIntelligenceCard;
