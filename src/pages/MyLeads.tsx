import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Filter, Search, Trash2, LogOut,
  MessageCircle, Phone, Copy, Clock, ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLeadManager } from "@/hooks/useLeadManager";
import {
  LEAD_STATUSES, LeadStatus, CHANNEL_LABELS, ACTION_LABELS,
  type SavedLead, type ContactChannel, type LastAction,
} from "@/lib/leadStatuses";
import type { Lead } from "@/lib/leadData";
import ContactModal from "@/components/ContactModal";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const statusOrder: LeadStatus[] = ["new", "saved", "contacted", "replied", "interested", "closed", "not_interested"];

const MyLeads = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

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

  const filtered = filterStatus === "all"
    ? savedLeads
    : savedLeads.filter((l) => l.status === filterStatus);

  const counts = savedLeads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

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
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">البحث</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-foreground">📋 الليدز ({savedLeads.length})</h1>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Search className="w-4 h-4" />
            بحث جديد
          </Link>
        </div>

        {/* Status filters - scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
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

        {/* Leads list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-bold">لا توجد ليدز</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filterStatus === "all"
                ? "ابحث واحفظ الفرص من صفحة البحث"
                : "لا توجد ليدز بهذه الحالة"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((saved) => {
                const lead = saved.lead_data as Lead;
                const statusInfo = LEAD_STATUSES[saved.status] || LEAD_STATUSES.new;
                const isStatusOpen = openStatusId === saved.id;

                return (
                  <motion.div
                    key={saved.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    {/* Lead info row */}
                    <div className="p-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground truncate">{lead.name}</h3>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.emoji} {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.category} — {lead.area}، {lead.city}
                        </p>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                          {saved.last_action && (
                            <span>{ACTION_LABELS[saved.last_action as LastAction]}</span>
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
                      </div>

                      <button
                        onClick={() => deleteLead(saved.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Actions bar */}
                    <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                      {/* Status dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenStatusId(isStatusOpen ? null : saved.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                          تغيير الحالة
                          <ChevronDown className={`w-3 h-3 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {isStatusOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.95 }}
                              className="absolute top-full mt-1.5 right-0 z-20 bg-card border border-border rounded-xl shadow-2xl py-2 min-w-[200px]"
                            >
                              <p className="px-3 pb-1.5 text-[10px] text-muted-foreground font-medium border-b border-border mb-1">اختر الحالة الجديدة</p>
                              {statusOrder.map((s) => {
                                const info = LEAD_STATUSES[s];
                                const isActive = saved.status === s;
                                return (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      updateLeadStatus(saved.id, s);
                                      setOpenStatusId(null);
                                    }}
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Quick contact actions */}
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:brightness-110 transition-all"
                      >
                        ابدأ تواصل ⚡
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ContactModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};

export default MyLeads;
