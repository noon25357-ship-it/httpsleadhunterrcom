import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Trash2, LogOut, MessageCircle, Phone, Copy, Clock,
  ChevronDown, Star, Lightbulb, CalendarDays, StickyNote, Zap,
  Filter,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useLeadManager } from "@/hooks/useLeadManager";
import {
  LEAD_STATUSES, LeadStatus, CHANNEL_LABELS, ACTION_LABELS,
  type SavedLead, type ContactChannel, type LastAction,
} from "@/lib/leadStatuses";
import type { Lead } from "@/lib/leadData";
import ContactModal from "@/components/ContactModal";
import FollowUpReminders from "@/components/FollowUpReminders";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

const statusOrder: LeadStatus[] = ["new", "saved", "offer_sent", "contacted", "replied", "interested", "closed", "not_interested"];

// Next logical action suggestion per status
const SUGGESTED_ACTIONS: Record<LeadStatus, { label: string; emoji: string; nextStatus?: LeadStatus }> = {
  new: { label: "احفظ وابدأ التحليل", emoji: "🔖", nextStatus: "saved" },
  saved: { label: "أرسل عرض", emoji: "⚡", nextStatus: "offer_sent" },
  offer_sent: { label: "تواصل عبر واتساب", emoji: "📤", nextStatus: "contacted" },
  contacted: { label: "تابع الرد", emoji: "💬", nextStatus: "replied" },
  replied: { label: "حدد إذا مهتم", emoji: "🔥", nextStatus: "interested" },
  interested: { label: "أغلق الصفقة", emoji: "✅", nextStatus: "closed" },
  closed: { label: "تم ✅", emoji: "🎉" },
  not_interested: { label: "أرشف", emoji: "📁" },
};

const MyLeads = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editingFollowUp, setEditingFollowUp] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");

  const {
    savedLeads, fetchSavedLeads, updateLeadStatus,
    markAsContacted, deleteLead,
  } = useLeadManager(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
      setLoading(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (user) fetchSavedLeads();
  }, [user, fetchSavedLeads]);

  // Sort by priority: high score first, then by status priority
  const sortedLeads = useMemo(() => {
    const sorted = [...savedLeads].sort((a, b) => {
      const leadA = a.lead_data as Lead;
      const leadB = b.lead_data as Lead;
      // Active statuses first (not closed/not_interested)
      const aActive = !["closed", "not_interested"].includes(a.status);
      const bActive = !["closed", "not_interested"].includes(b.status);
      if (aActive !== bActive) return aActive ? -1 : 1;
      // Then by score (high first)
      if ((leadB.score || 0) !== (leadA.score || 0)) return (leadB.score || 0) - (leadA.score || 0);
      // Then by most recent update
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return sorted;
  }, [savedLeads]);

  const filtered = filterStatus === "all"
    ? sortedLeads
    : sortedLeads.filter((l) => l.status === filterStatus);

  // Group by status for pipeline view
  const grouped = useMemo(() => {
    const groups: Record<string, SavedLead[]> = {};
    statusOrder.forEach(s => { groups[s] = []; });
    sortedLeads.forEach(l => {
      if (groups[l.status]) groups[l.status].push(l);
      else groups["new"].push(l);
    });
    return groups;
  }, [sortedLeads]);

  const counts = savedLeads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSmartStatusChange = (savedId: string, currentStatus: LeadStatus) => {
    const suggestion = SUGGESTED_ACTIONS[currentStatus];
    if (suggestion.nextStatus) {
      updateLeadStatus(savedId, suggestion.nextStatus);
    }
  };

  const saveNote = async (savedId: string) => {
    await supabase.from("saved_leads").update({
      lead_data: supabase.rpc ? undefined : undefined, // We update via direct column if available
    }).eq("id", savedId);
    // For now, store notes in lead_data
    const lead = savedLeads.find(l => l.id === savedId);
    if (lead) {
      const updatedData = { ...(lead.lead_data as any), notes: noteText };
      await supabase.from("saved_leads").update({
        lead_data: updatedData as any,
        updated_at: new Date().toISOString(),
      }).eq("id", savedId);
      toast.success("تم حفظ الملاحظة");
      fetchSavedLeads();
    }
    setEditingNote(null);
    setNoteText("");
  };

  const saveFollowUp = async (savedId: string) => {
    const lead = savedLeads.find(l => l.id === savedId);
    if (lead) {
      const updatedData = { ...(lead.lead_data as any), follow_up_date: followUpDate };
      await supabase.from("saved_leads").update({
        lead_data: updatedData as any,
        updated_at: new Date().toISOString(),
      }).eq("id", savedId);
      toast.success("تم تحديد موعد المتابعة");
      fetchSavedLeads();
    }
    setEditingFollowUp(null);
    setFollowUpDate("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  const renderLeadCard = (saved: SavedLead) => {
    const lead = saved.lead_data as Lead & { notes?: string; follow_up_date?: string };
    const statusInfo = LEAD_STATUSES[saved.status as LeadStatus] || LEAD_STATUSES.new;
    const suggestion = SUGGESTED_ACTIONS[saved.status as LeadStatus] || SUGGESTED_ACTIONS.new;
    const scoreLabel = (lead.score || 0) >= 80 ? "🔥" : (lead.score || 0) >= 50 ? "🟡" : "⚪";

    // Opportunity reasons
    const reasons: string[] = [];
    if (!lead.hasWebsite) reasons.push("ما عنده موقع");
    if (lead.reviews > 50) reasons.push("تقييمات كثيرة");
    if (lead.rating >= 4) reasons.push("تقييم عالي");
    if (lead.isActive) reasons.push("نشط حالياً");
    if (lead.phone) reasons.push("رقم متوفر");

    return (
      <motion.div
        key={saved.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-4">
          {/* Header: Name + Status + Score */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-foreground truncate">{lead.name}</h3>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                  {statusInfo.emoji} {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {lead.category} — {lead.area}، {lead.city}
              </p>
            </div>

            {/* ⑵ Opportunity Score */}
            <div className="shrink-0 flex flex-col items-center gap-0.5">
              <div className={`text-lg font-black ${(lead.score || 0) >= 80 ? "text-primary" : (lead.score || 0) >= 50 ? "text-yellow-400" : "text-muted-foreground"}`}>
                {scoreLabel} {lead.score || 0}
              </div>
              <span className="text-[9px] text-muted-foreground">درجة الفرصة</span>
            </div>

            <button
              onClick={() => deleteLead(saved.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* ⑴ Why this lead - Opportunity Reasons */}
          {reasons.length > 0 && (
            <div className="mt-2 bg-secondary/40 border border-border/50 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] font-bold text-foreground">ليش فرصة؟</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {reasons.map((r, i) => (
                  <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground border border-border/50">
                    💡 {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ⑨ Last action + meta */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
            {saved.last_action && (
              <span className="bg-secondary px-2 py-0.5 rounded-full font-medium">
                {ACTION_LABELS[saved.last_action as LastAction]}
              </span>
            )}
            {saved.contact_channel && (
              <span>📱 {CHANNEL_LABELS[saved.contact_channel as ContactChannel]}</span>
            )}
            {saved.updated_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(saved.updated_at), { addSuffix: true, locale: ar })}
              </span>
            )}
          </div>

          {/* ⑶ Follow-up date */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {lead.follow_up_date && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                <CalendarDays className="w-3 h-3" />
                متابعة: {lead.follow_up_date}
              </span>
            )}
            {editingFollowUp === saved.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="text-[11px] bg-secondary border border-border rounded px-2 py-1 text-foreground"
                />
                <button onClick={() => saveFollowUp(saved.id)} className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-bold">حفظ</button>
                <button onClick={() => setEditingFollowUp(null)} className="text-[10px] text-muted-foreground px-1">✕</button>
              </div>
            ) : (
              <button
                onClick={() => { setEditingFollowUp(saved.id); setFollowUpDate(lead.follow_up_date || ""); }}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <CalendarDays className="w-3 h-3" />
                {lead.follow_up_date ? "تعديل" : "حدد موعد متابعة"}
              </button>
            )}
          </div>

          {/* ⑷ Notes */}
          <div className="mt-2">
            {lead.notes && editingNote !== saved.id && (
              <div className="bg-secondary/40 border border-border/50 rounded-lg p-2 text-[11px] text-muted-foreground">
                <StickyNote className="w-3 h-3 inline ml-1" />
                {lead.notes}
              </div>
            )}
            {editingNote === saved.id ? (
              <div className="flex flex-col gap-1">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="اكتب ملاحظة..."
                  className="text-[11px] bg-secondary border border-border rounded-lg px-2 py-1.5 text-foreground resize-none h-16"
                />
                <div className="flex gap-1">
                  <button onClick={() => saveNote(saved.id)} className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded font-bold">حفظ</button>
                  <button onClick={() => setEditingNote(null)} className="text-[10px] text-muted-foreground px-2">إلغاء</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setEditingNote(saved.id); setNoteText((lead as any).notes || ""); }}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
              >
                <StickyNote className="w-3 h-3" />
                {lead.notes ? "تعديل الملاحظة" : "أضف ملاحظة"}
              </button>
            )}
          </div>
        </div>

        {/* Actions bar */}
        <div className="px-4 pb-3 flex items-center gap-2 flex-wrap border-t border-border/30 pt-2">
          {/* ⑸ Suggested Next Action */}
          {suggestion.nextStatus && (
            <button
              onClick={() => handleSmartStatusChange(saved.id, saved.status as LeadStatus)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all animate-pulse"
            >
              <Zap className="w-3 h-3" />
              {suggestion.emoji} {suggestion.label}
            </button>
          )}

          {/* Status dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors">
                تغيير الحالة
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" sideOffset={8} className="w-[220px] p-0 rounded-xl border-border bg-card shadow-2xl">
              <p className="px-3 pt-2 pb-1.5 text-[10px] text-muted-foreground font-medium border-b border-border">اختر الحالة الجديدة</p>
              <div className="py-1">
                {statusOrder.map((s) => {
                  const info = LEAD_STATUSES[s];
                  const isActive = saved.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => updateLeadStatus(saved.id, s)}
                      className={`w-full text-right px-3 py-2.5 text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2.5 ${
                        isActive ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs border ${info.color}`}>
                        {info.emoji}
                      </span>
                      <span className={isActive ? "text-primary font-bold" : "text-foreground font-medium"}>
                        {info.label}
                      </span>
                      {isActive && <span className="mr-auto text-primary text-[10px]">✓ الحالية</span>}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick contact */}
          <a
            href={`https://wa.me/966${lead.phone?.slice(1)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markAsContacted(saved.id, "whatsapp")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            واتساب
          </a>
          <a
            href={`tel:${lead.phone}`}
            onClick={() => markAsContacted(saved.id, "call")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            <Phone className="w-3 h-3" />
            اتصال
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(lead.phone || "");
              markAsContacted(saved.id, "copy");
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            <Copy className="w-3 h-3" />
            نسخ
          </button>
          <button
            onClick={() => setSelectedLead(lead)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-all"
          >
            ابدأ تواصل ⚡
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <span className="font-black text-lg text-foreground">LeadHunter</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">البحث</span>
            </Link>
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-foreground">📋 الليدز ({savedLeads.length})</h1>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                قائمة
              </button>
              <button
                onClick={() => setViewMode("pipeline")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${viewMode === "pipeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                بايبلاين
              </button>
            </div>
            <Link to="/dashboard" className="flex items-center gap-1 text-sm text-primary hover:underline">
              <Search className="w-4 h-4" />
              بحث جديد
            </Link>
          </div>
        </div>

        {/* Status filters */}
        {viewMode === "list" && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              onClick={() => setFilterStatus("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                filterStatus === "all"
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary text-secondary-foreground border-border"
              }`}
            >
              الكل ({savedLeads.length})
            </button>
            {statusOrder.map((s) => {
              const info = LEAD_STATUSES[s];
              const count = counts[s] || 0;
              if (count === 0 && filterStatus !== s) return null;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    filterStatus === s ? info.color : "bg-secondary text-secondary-foreground border-border"
                  }`}
                >
                  {info.emoji} {info.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Follow-up Reminders */}
        <FollowUpReminders leads={savedLeads} onMarkContacted={markAsContacted} />

        {/* ⑦ Pipeline View */}
        {viewMode === "pipeline" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statusOrder.filter(s => !["closed", "not_interested"].includes(s) || (counts[s] || 0) > 0).map((s) => {
              const info = LEAD_STATUSES[s];
              const items = grouped[s] || [];
              return (
                <div key={s} className="bg-card/50 border border-border rounded-xl p-2">
                  <div className={`flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg ${info.color}`}>
                    <span className="text-xs">{info.emoji}</span>
                    <span className="text-xs font-bold">{info.label}</span>
                    <span className="text-[10px] mr-auto opacity-70">({items.length})</span>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {items.map((saved) => {
                      const lead = saved.lead_data as Lead;
                      return (
                        <div key={saved.id} className="bg-secondary/50 border border-border/50 rounded-lg p-2 text-[11px]">
                          <p className="font-bold text-foreground truncate">{lead.name}</p>
                          <p className="text-muted-foreground truncate">{lead.category}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`font-black ${(lead.score || 0) >= 80 ? "text-primary" : "text-muted-foreground"}`}>
                              {lead.score || 0}%
                            </span>
                            {SUGGESTED_ACTIONS[s as LeadStatus]?.nextStatus && (
                              <button
                                onClick={() => handleSmartStatusChange(saved.id, s as LeadStatus)}
                                className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-bold"
                              >
                                {SUGGESTED_ACTIONS[s as LeadStatus].emoji} نقل
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">فارغ</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          filtered.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-bold">لا توجد ليدز</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filterStatus === "all" ? "ابحث واحفظ الفرص من صفحة البحث" : "لا توجد ليدز بهذه الحالة"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map(renderLeadCard)}
              </AnimatePresence>
            </div>
          )
        )}
      </div>

      <ContactModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};

export default MyLeads;
