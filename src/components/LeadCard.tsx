import { motion } from "framer-motion";
import { Star, MapPin, ExternalLink, MessageCircle, Copy, Bookmark, BookmarkCheck, Lightbulb } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";
import { getWhyReasons } from "@/lib/messageGenerator";
import { LEAD_STATUSES, type SavedLead } from "@/lib/leadStatuses";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

const scoreBadge: Record<string, { text: string; shortText: string; classes: string }> = {
  hot: { text: "🔥 فرصة قوية", shortText: "🔥 قوية", classes: "bg-primary/15 text-primary neon-border" },
  warm: { text: "🟡 فرصة متوسطة", shortText: "🟡 متوسطة", classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
  cold: { text: "🔵 فرصة ضعيفة", shortText: "🔵 ضعيفة", classes: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
};

interface LeadCardProps {
  lead: Lead;
  index: number;
  onContact: (lead: Lead) => void;
  onSave?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onCopy?: (lead: Lead) => void;
  savedStatus?: SavedLead;
}

const LeadCard = ({ lead, index, onContact, onSave, onWhatsApp, onCopy, savedStatus }: LeadCardProps) => {
  const badge = scoreBadge[lead.label];
  const reasons = getWhyReasons(lead);
  const message = getDefaultMessage("website", "friendly");
  const isSaved = !!savedStatus;
  const statusInfo = savedStatus ? LEAD_STATUSES[savedStatus.status] : null;

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success("تم نسخ الرسالة!");
    trackEvent("copy_message_quick", { leadId: lead.id });
    onCopy?.(lead);
  };

  const whatsappUrl = `https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-4 sm:p-5 flex flex-col gap-3 group hover:neon-border transition-shadow duration-300 relative"
    >
      {/* Save button */}
      {onSave && (
        <button
          onClick={() => onSave(lead)}
          className={`absolute top-3 left-3 z-10 p-1.5 rounded-lg transition-colors ${
            isSaved
              ? "bg-primary/20 text-primary"
              : "bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary"
          }`}
          title={isSaved ? "محفوظ" : "حفظ"}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      )}

      {/* Header */}
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

      {/* Stats */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
        <span className="flex items-center gap-1 text-yellow-400">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          {lead.rating}
        </span>
        <span className="text-muted-foreground">{lead.reviews} تقييم</span>
        <a
          href={lead.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mr-auto"
        >
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="text-[10px] sm:text-xs">📍 الموقع</span>
        </a>
      </div>

      {/* Why this lead - enhanced */}
      {reasons.length > 0 && (
        <div className="bg-primary/[0.06] border border-primary/15 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="w-3 h-3 text-primary" />
            <p className="text-[10px] sm:text-xs font-bold text-primary">ليش هذه فرصة؟</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reasons.map((r) => (
              <span
                key={r.key}
                className="inline-flex items-center text-[10px] sm:text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md"
              >
                {r.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Primary CTA */}
      <button
        onClick={() => {
          trackEvent("click_start_contact", { leadId: lead.id, score: lead.score });
          onContact(lead);
        }}
        className="w-full bg-primary text-primary-foreground font-bold py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm hover:brightness-110 hover:shadow-[0_0_20px_hsl(145_80%_42%/0.3)] transition-all mt-auto active:scale-[0.98]"
      >
        👉 ابدأ التواصل الآن ⚡
      </button>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackEvent("click_whatsapp_quick", { leadId: lead.id });
            onWhatsApp?.(lead);
          }}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
        >
          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>📲 واتساب</span>
        </a>
        <button
          onClick={copyMessage}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-medium hover:bg-secondary/80 transition-colors active:scale-[0.98]"
        >
          <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>📋 نسخ رسالة</span>
        </button>
      </div>
    </motion.div>
  );
};

export default LeadCard;
