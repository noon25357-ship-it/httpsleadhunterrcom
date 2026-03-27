import { motion } from "framer-motion";
import { Star, MapPin, ExternalLink, MessageCircle, Copy } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

const scoreBadge: Record<string, { text: string; classes: string }> = {
  hot: { text: "🔥 فرصة قوية", classes: "bg-primary/15 text-primary neon-border" },
  warm: { text: "🟡 فرصة متوسطة", classes: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
  cold: { text: "🔵 فرصة ضعيفة", classes: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
};

function getWhyReasons(lead: Lead): string[] {
  const reasons: string[] = [];
  if (!lead.hasWebsite) reasons.push("بدون موقع إلكتروني");
  if (lead.reviews > 50) reasons.push(`تقييمات عالية (${lead.reviews}+)`);
  if (lead.rating >= 4) reasons.push(`تقييم ممتاز ⭐ ${lead.rating}`);
  if (lead.isActive) reasons.push("نشاط واضح");
  return reasons;
}

interface LeadCardProps {
  lead: Lead;
  index: number;
  onContact: (lead: Lead) => void;
}

const LeadCard = ({ lead, index, onContact }: LeadCardProps) => {
  const badge = scoreBadge[lead.label];
  const reasons = getWhyReasons(lead);
  const message = getDefaultMessage("website", "friendly");

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success("تم نسخ الرسالة!");
    trackEvent("copy_message_quick", { leadId: lead.id });
  };

  const whatsappUrl = `https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card rounded-xl p-5 flex flex-col gap-3 group hover:neon-border transition-shadow duration-300"
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
          <span>{badge.text}</span>
          <span className="opacity-70">({lead.score})</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          {lead.rating}
        </span>
        <span className="text-muted-foreground">{lead.reviews} تقييم</span>
        <a
          href={lead.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mr-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="text-xs">📍 الموقع</span>
        </a>
      </div>

      {/* Why this lead */}
      {reasons.length > 0 && (
        <div className="bg-primary/[0.05] border border-primary/10 rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-primary/80 mb-1">ليش هذي فرصة؟</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {reasons.join(" • ")}
          </p>
        </div>
      )}

      {/* Primary CTA */}
      <button
        onClick={() => {
          trackEvent("click_start_contact", { leadId: lead.id, score: lead.score });
          onContact(lead);
        }}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm hover:brightness-110 hover:shadow-[0_0_20px_hsl(145_80%_42%/0.3)] transition-all mt-auto"
      >
        👉 ابدأ التواصل الآن ⚡
      </button>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("click_whatsapp_quick", { leadId: lead.id })}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          📲 واتساب مباشر
        </a>
        <button
          onClick={copyMessage}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          📋 نسخ رسالة
        </button>
      </div>
    </motion.div>
  );
};

export default LeadCard;
