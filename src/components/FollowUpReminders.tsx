import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Copy, MessageCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import type { SavedLead, LeadStatus } from "@/lib/leadStatuses";
import type { Lead } from "@/lib/leadData";
import { getFollowUpSuggestion, getObjectionResponse, OBJECTION_TYPES, type FollowUpSuggestion } from "@/lib/followUpGenerator";

interface FollowUpRemindersProps {
  leads: SavedLead[];
  onMarkContacted: (id: string, channel: "whatsapp" | "call" | "copy") => void;
}

interface LeadWithFollowUp {
  saved: SavedLead;
  lead: Lead & { follow_up_date?: string };
  suggestion: FollowUpSuggestion;
}

const FollowUpReminders = ({ leads, onMarkContacted }: FollowUpRemindersProps) => {
  const [expanded, setExpanded] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedObjection, setSelectedObjection] = useState<Record<string, string>>({});

  // Get all leads that need follow-up
  const needsFollowUp: LeadWithFollowUp[] = leads
    .map((saved) => {
      const lead = saved.lead_data as Lead & { follow_up_date?: string };
      const suggestion = getFollowUpSuggestion(
        lead,
        saved.status as LeadStatus,
        saved.last_action_at,
        lead.follow_up_date || null,
      );
      if (!suggestion) return null;
      return { saved, lead, suggestion };
    })
    .filter(Boolean) as LeadWithFollowUp[];

  // Sort: high urgency first
  needsFollowUp.sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.suggestion.urgency] - urgencyOrder[b.suggestion.urgency];
  });

  if (needsFollowUp.length === 0) return null;

  const highCount = needsFollowUp.filter((l) => l.suggestion.urgency === "high").length;

  const copyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg);
    toast.success("تم نسخ الرسالة ✅");
  };

  const sendWhatsApp = (lead: Lead, msg: string, savedId: string) => {
    const phone = lead.phone ? `966${lead.phone.slice(1)}` : "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    onMarkContacted(savedId, "whatsapp");
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-gradient-to-l from-orange-500/10 via-red-500/10 to-transparent border border-orange-500/20 rounded-xl px-4 py-3 hover:bg-orange-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-orange-400" />
            {highCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-black flex items-center justify-center">
                {highCount}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="font-bold text-foreground text-sm">
              ⏰ تحتاج متابعة ({needsFollowUp.length})
            </span>
            {highCount > 0 && (
              <span className="text-[10px] text-orange-400 font-medium mr-2">
                {highCount} عاجل
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Cards */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-2">
              {needsFollowUp.map(({ saved, lead, suggestion }) => {
                const isExpanded = expandedCard === saved.id;
                const urgencyStyles = {
                  high: "border-red-500/30 bg-red-500/5",
                  medium: "border-orange-500/30 bg-orange-500/5",
                  low: "border-yellow-500/30 bg-yellow-500/5",
                };
                const urgencyIcon = suggestion.urgency === "high"
                  ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  : <Clock className="w-3.5 h-3.5 text-orange-400" />;

                return (
                  <motion.div
                    key={saved.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border ${urgencyStyles[suggestion.urgency]} overflow-hidden`}
                  >
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : saved.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-right"
                    >
                      {urgencyIcon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm truncate">{lead.name}</span>
                          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground shrink-0">
                            {lead.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-orange-400 font-medium mt-0.5">
                          {suggestion.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lead.phone && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sendWhatsApp(lead, suggestion.message, saved.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/15 text-primary text-[11px] font-bold hover:bg-primary/25 transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            تابع
                          </button>
                        )}
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </button>

                    {/* Expanded: message + objection handling */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 border-t border-border/30 pt-2">
                            {/* Auto-generated follow-up message */}
                            <div className="bg-secondary/60 rounded-lg p-3 mb-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-primary" />
                                  رسالة متابعة جاهزة
                                </span>
                                <button
                                  onClick={() => copyMessage(suggestion.message)}
                                  className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline"
                                >
                                  <Copy className="w-3 h-3" />
                                  نسخ
                                </button>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                                {suggestion.message}
                              </p>
                            </div>

                            {/* Quick actions */}
                            <div className="flex items-center gap-2 mb-2">
                              {lead.phone && (
                                <button
                                  onClick={() => sendWhatsApp(lead, suggestion.message, saved.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25 transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  أرسل واتساب
                                </button>
                              )}
                              <button
                                onClick={() => copyMessage(suggestion.message)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                نسخ الرسالة
                              </button>
                            </div>

                            {/* Objection handlers */}
                            <div className="border-t border-border/30 pt-2">
                              <p className="text-[10px] font-bold text-muted-foreground mb-1.5">رد على اعتراض شائع:</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {OBJECTION_TYPES.map((obj) => (
                                  <button
                                    key={obj.key}
                                    onClick={() => setSelectedObjection(prev => ({ ...prev, [saved.id]: obj.key }))}
                                    className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-colors ${
                                      selectedObjection[saved.id] === obj.key
                                        ? "bg-primary/15 text-primary border-primary/30"
                                        : "bg-secondary text-muted-foreground border-border hover:border-primary/30"
                                    }`}
                                  >
                                    {obj.emoji} {obj.label}
                                  </button>
                                ))}
                              </div>
                              {selectedObjection[saved.id] && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-2 bg-secondary/40 rounded-lg p-2.5"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-foreground">💡 رد مقترح</span>
                                    <button
                                      onClick={() => copyMessage(getObjectionResponse(selectedObjection[saved.id]))}
                                      className="text-[10px] text-primary font-bold flex items-center gap-1"
                                    >
                                      <Copy className="w-3 h-3" /> نسخ
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {getObjectionResponse(selectedObjection[saved.id])}
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpReminders;
