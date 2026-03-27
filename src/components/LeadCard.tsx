import { motion } from "framer-motion";
import { Star, MapPin, Phone, ExternalLink } from "lucide-react";
import type { Lead } from "@/lib/leadData";

const scoreBadge: Record<string, { emoji: string; classes: string }> = {
  hot: { emoji: "🔥", classes: "bg-primary/15 text-primary neon-border" },
  warm: { emoji: "🟡", classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
  cold: { emoji: "🔵", classes: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
};

interface LeadCardProps {
  lead: Lead;
  index: number;
  onContact: (lead: Lead) => void;
}

const LeadCard = ({ lead, index, onContact }: LeadCardProps) => {
  const badge = scoreBadge[lead.label];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-5 flex flex-col gap-4 group hover:neon-border transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground truncate">{lead.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{lead.area}، {lead.city}</span>
          </div>
        </div>
        <div className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${badge.classes}`}>
          <span>{badge.emoji}</span>
          <span>{lead.score}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          {lead.rating}
        </span>
        <span className="text-muted-foreground">{lead.reviews} تقييم</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        <button
          onClick={() => onContact(lead)}
          className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-lg text-sm hover:brightness-110 transition-all"
        >
          ابدأ التواصل 👉
        </button>
        <a
          href={lead.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

export default LeadCard;
