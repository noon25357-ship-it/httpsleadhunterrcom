import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal, MessageCircle, Phone, Copy, Trash2,
  Zap, StickyNote, CalendarDays,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import type { Lead } from "@/lib/leadData";
import {
  LEAD_STATUSES, STATUS_ORDER, getSmartAction, getUrgency, migrateStatus,
  type SavedLead, type LeadStatus, type ContactChannel,
} from "@/lib/leadStatuses";
import ContactIntelligenceStrip from "@/components/contact-intelligence/ContactIntelligenceStrip";

interface ActionLeadCardProps {
  saved: SavedLead;
  index: number;
  onPrimaryAction: (saved: SavedLead, lead: Lead) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onMarkContacted: (id: string, channel: ContactChannel) => void;
  onDelete: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onSaveFollowUp: (id: string, date: string) => void;
}

const ActionLeadCard = ({
  saved, index, onPrimaryAction, onStatusChange,
  onMarkContacted, onDelete, onSaveNote, onSaveFollowUp,
}: ActionLeadCardProps) => {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");

  const lead = saved.lead_data as Lead & { notes?: string; follow_up_date?: string };
  const status = migrateStatus(saved.status) as LeadStatus;
  const statusInfo = LEAD_STATUSES[status] || LEAD_STATUSES.new;

  // Time elapsed since last action
  const daysElapsed = useMemo(() => {
    if (!saved.last_action_at) return 0;
    return Math.floor((Date.now() - new Date(saved.last_action_at).getTime()) / (1000 * 60 * 60 * 24));
  }, [saved.last_action_at]);

  const score = lead.score || 0;
  const smartAction = getSmartAction(status, daysElapsed, score);
  const urgency = getUrgency(status, daysElapsed, score);

  // Compact reason inference now handled inside ContactIntelligenceStrip

  const isTerminal = status === "won" || status === "lost";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        {/* Row 1: Name + Score + Menu */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground truncate text-sm">{lead.name}</h3>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                {statusInfo.emoji} {statusInfo.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {lead.category} — {lead.area}، {lead.city}
            </p>
          </div>

          {/* Score */}
          <div className={`shrink-0 text-center ${score >= 80 ? "text-primary" : score >= 50 ? "text-yellow-400" : "text-muted-foreground"}`}>
            <div className="text-lg font-black leading-none">{score}</div>
            <div className="text-[8px] text-muted-foreground">فرصة</div>
          </div>

          {/* ⋯ Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="w-[200px] p-1 rounded-xl border-border bg-card shadow-2xl">
              {/* Contact actions */}
              {lead.phone && (
                <>
                  <button
                    onClick={() => {
                      window.open(`https://wa.me/966${lead.phone?.slice(1)}`, "_blank");
                      onMarkContacted(saved.id, "whatsapp");
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2 rounded-lg"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-primary" /> واتساب
                  </button>
                  <button
                    onClick={() => {
                      window.open(`tel:${lead.phone}`);
                      onMarkContacted(saved.id, "call");
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2 rounded-lg"
                  >
                    <Phone className="w-3.5 h-3.5" /> اتصال
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lead.phone || "");
                      toast.success("تم النسخ");
                      onMarkContacted(saved.id, "copy");
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" /> نسخ الرقم
                  </button>
                </>
              )}
              <div className="border-t border-border my-1" />
              {/* Status change */}
              <p className="px-3 py-1 text-[10px] text-muted-foreground font-medium">تغيير الحالة</p>
              {STATUS_ORDER.map((s) => {
                const info = LEAD_STATUSES[s];
                const isActive = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(saved.id, s)}
                    className={`w-full text-right px-3 py-1.5 text-xs hover:bg-secondary/80 flex items-center gap-2 rounded-lg ${isActive ? "bg-primary/10" : ""}`}
                  >
                    <span className="text-xs">{info.emoji}</span>
                    <span className={isActive ? "text-primary font-bold" : "text-foreground"}>{info.label}</span>
                    {isActive && <span className="mr-auto text-primary text-[9px]">✓</span>}
                  </button>
                );
              })}
              <div className="border-t border-border my-1" />
              {/* Note & follow-up */}
              <button
                onClick={() => { setEditingNote(true); setNoteText(lead.notes || ""); }}
                className="w-full text-right px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2 rounded-lg"
              >
                <StickyNote className="w-3.5 h-3.5" /> {lead.notes ? "تعديل الملاحظة" : "أضف ملاحظة"}
              </button>
              <button
                onClick={() => { setEditingFollowUp(true); setFollowUpDate(lead.follow_up_date || ""); }}
                className="w-full text-right px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2 rounded-lg"
              >
                <CalendarDays className="w-3.5 h-3.5" /> موعد متابعة
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => onDelete(saved.id)}
                className="w-full text-right px-3 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 2: Urgency banner */}
        {urgency && (
          <div className={`mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${urgency.colorClass}`}>
            <span>{urgency.emoji}</span>
            <span>{urgency.label}</span>
          </div>
        )}

        {/* Row 3: Contact Intelligence (compact decision strip) */}
        <div className="mt-2.5">
          <ContactIntelligenceStrip lead={lead} />
        </div>

        {/* Row 4: Notes & Follow-up inline */}
        {(lead.notes || lead.follow_up_date) && !editingNote && !editingFollowUp && (
          <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
            {lead.notes && (
              <span className="bg-secondary/60 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                📝 {lead.notes}
              </span>
            )}
            {lead.follow_up_date && (
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                📅 {lead.follow_up_date}
              </span>
            )}
          </div>
        )}

        {/* Inline note editor */}
        {editingNote && (
          <div className="mt-2 space-y-1">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظة..."
              className="w-full text-[11px] bg-secondary border border-border rounded-lg px-3 py-2 text-foreground resize-none h-16"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={() => { onSaveNote(saved.id, noteText); setEditingNote(false); }}
                className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-lg font-bold"
              >
                حفظ
              </button>
              <button onClick={() => setEditingNote(false)} className="text-[10px] text-muted-foreground px-2">إلغاء</button>
            </div>
          </div>
        )}

        {/* Inline follow-up editor */}
        {editingFollowUp && (
          <div className="mt-2 flex items-center gap-1">
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="text-[11px] bg-secondary border border-border rounded px-2 py-1 text-foreground"
              autoFocus
            />
            <button
              onClick={() => { onSaveFollowUp(saved.id, followUpDate); setEditingFollowUp(false); }}
              className="text-[10px] bg-primary text-primary-foreground px-2.5 py-1 rounded-lg font-bold"
            >
              حفظ
            </button>
            <button onClick={() => setEditingFollowUp(false)} className="text-[10px] text-muted-foreground px-1">✕</button>
          </div>
        )}
      </div>

      {/* Action bar */}
      {!isTerminal && (
        <div className="px-4 pb-3 border-t border-border/30 pt-2.5">
          {/* Suggested action label */}
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">الخطوة المقترحة:</span>
            <span className="text-[10px] font-bold text-foreground">{smartAction.label}</span>
          </div>

          {/* Primary action button */}
          <button
            onClick={() => onPrimaryAction(saved, lead)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <span>{smartAction.emoji}</span>
            نفّذ الخطوة الأفضل ⚡
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ActionLeadCard;
