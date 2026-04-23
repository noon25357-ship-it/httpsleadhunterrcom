import { useMemo } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, ExternalLink, Copy, Bookmark, BookmarkCheck, UserCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";
import { LEAD_STATUSES, type SavedLead } from "@/lib/leadStatuses";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
import {
  generateContactIntelligence,
  CHANNEL_META,
  CONFIDENCE_META,
  type ContactChannel,
} from "@/lib/contactIntelligence";

interface LeadCardProps {
  lead: Lead;
  index: number;
  onContact: (lead: Lead) => void;
  onSave?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onCopy?: (lead: Lead) => void;
  savedStatus?: SavedLead;
}

/* CTA copy per channel — Saudi tone */
const CTA_BY_CHANNEL: Record<ContactChannel, string> = {
  whatsapp: "راسلهم واتساب الآن",
  instagram: "أرسل رسالة إنستقرام",
  phone: "اتصل الآن",
  contact_form: "افتح نموذج التواصل",
  email: "أرسل إيميل الآن",
};

const LeadCard = ({ lead, index, onContact, onSave, onWhatsApp, onCopy, savedStatus }: LeadCardProps) => {
  const { t } = useTranslation();

  const ci = useMemo(() => generateContactIntelligence(lead), [lead]);
  const channelMeta = CHANNEL_META[ci.best_contact_path.channel];
  const confMeta = CONFIDENCE_META[ci.best_contact_path.confidence];
  const ctaText = CTA_BY_CHANNEL[ci.best_contact_path.channel];
  const visibleTags = ci.reason_tags.slice(0, 2);

  const scoreBadge: Record<string, { text: string; shortText: string; classes: string }> = {
    hot: { text: t("leadCard.hot"), shortText: t("leadCard.hotShort"), classes: "bg-primary/15 text-primary neon-border" },
    warm: { text: t("leadCard.warm"), shortText: t("leadCard.warmShort"), classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
    cold: { text: t("leadCard.cold"), shortText: t("leadCard.coldShort"), classes: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  };
  const badge = scoreBadge[lead.label];
  const message = getDefaultMessage("website", "friendly");
  const isSaved = !!savedStatus;
  const statusInfo = savedStatus ? LEAD_STATUSES[savedStatus.status] : null;

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success(t("leadCard.messageCopied"));
    trackEvent("copy_message_quick", { leadId: lead.id });
    onCopy?.(lead);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-4 sm:p-5 flex flex-col gap-3.5 group hover:neon-border transition-shadow duration-300 relative"
    >
      {onSave && (
        <button
          onClick={() => onSave(lead)}
          className={`absolute top-3 left-3 z-10 p-1.5 rounded-lg transition-colors ${
            isSaved
              ? "bg-primary/20 text-primary"
              : "bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary"
          }`}
          title={isSaved ? t("leadCard.saved") : t("leadCard.save")}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      )}

      {/* ── DECISION ROW (top) — WHERE · WHO · CONFIDENCE ── */}
      <div className="flex items-center gap-2 flex-wrap pr-8">
        {/* WHERE — channel */}
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-foreground bg-primary/10 border border-primary/25 px-2 py-1 rounded-md">
          <span>{channelMeta.emoji}</span>
          <span>{channelMeta.shortLabel}</span>
        </span>

        {/* subtle visual divider between WHERE and WHO */}
        <span className="text-border text-xs leading-none select-none">·</span>

        {/* WHO — decision maker */}
        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-muted-foreground bg-secondary/60 border border-border/60 px-2 py-1 rounded-md">
          <UserCircle2 className="w-3 h-3" />
          <span className="truncate max-w-[140px]">{ci.likely_decision_maker.role}</span>
        </span>

        {/* CONFIDENCE — small */}
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${confMeta.classes}`}>
          {ci.best_contact_path.confidence.toUpperCase()}
        </span>
      </div>

      {/* ── Identity ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{lead.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{lead.area}، {lead.city}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 ${badge.classes}`}>
            <span className="hidden sm:inline">{badge.text}</span>
            <span className="sm:hidden">{badge.shortText}</span>
            <span className="opacity-70">({lead.score})</span>
          </div>
          {statusInfo && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
              {statusInfo.emoji} {statusInfo.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Meta line: rating + maps ── */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
        <span className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          {lead.rating}
        </span>
        <span className="text-muted-foreground">{lead.reviews} {t("leadCard.reviews")}</span>
        <a
          href={lead.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mr-auto"
        >
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="text-[10px] sm:text-xs">{t("leadCard.location")}</span>
        </a>
      </div>

      {/* ── PRIMARY CTA — dynamic by channel ── */}
      <button
        onClick={() => {
          trackEvent("click_start_contact", { leadId: lead.id, score: lead.score, channel: ci.best_contact_path.channel });
          onContact(lead);
        }}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:brightness-110 hover:shadow-[0_0_20px_hsl(145_80%_42%/0.3)] transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
      >
        <span>{channelMeta.emoji}</span>
        <span>{ctaText}</span>
      </button>

      {/* ── Subtle insight chips (max 2) + quick copy ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] sm:text-[11px] text-muted-foreground/80 bg-transparent border border-border/50 px-2 py-0.5 rounded-md"
          >
            {tag}
          </span>
        ))}
        <button
          onClick={copyMessage}
          className="ml-auto inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          title={t("leadCard.copyMessage")}
        >
          <Copy className="w-3 h-3" />
          <span>{t("leadCard.copyMessage")}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default LeadCard;
