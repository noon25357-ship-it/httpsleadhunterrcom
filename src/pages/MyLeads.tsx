import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Search, LogOut, Filter } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useLeadManager } from "@/hooks/useLeadManager";
import {
  LEAD_STATUSES, STATUS_ORDER, migrateStatus,
  type SavedLead, type LeadStatus, type ContactChannel,
} from "@/lib/leadStatuses";
import type { Lead } from "@/lib/leadData";
import FollowUpReminders from "@/components/FollowUpReminders";
import ActionLeadCard from "@/components/ActionLeadCard";
import ExecutionModal from "@/components/ExecutionModal";
import { toast } from "sonner";

const MyLeads = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "pipeline">("list");
  const [executionTarget, setExecutionTarget] = useState<SavedLead | null>(null);

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

  const processedLeads = useMemo(() => {
    return savedLeads.map(l => ({
      ...l,
      status: migrateStatus(l.status) as LeadStatus,
    }));
  }, [savedLeads]);

  const sortedLeads = useMemo(() => {
    return [...processedLeads].sort((a, b) => {
      const leadA = a.lead_data as Lead;
      const leadB = b.lead_data as Lead;
      const aActive = !["won", "lost"].includes(a.status);
      const bActive = !["won", "lost"].includes(b.status);
      if (aActive !== bActive) return aActive ? -1 : 1;
      if ((leadB.score || 0) !== (leadA.score || 0)) return (leadB.score || 0) - (leadA.score || 0);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [processedLeads]);

  const filtered = filterStatus === "all"
    ? sortedLeads
    : sortedLeads.filter((l) => l.status === filterStatus);

  const grouped = useMemo(() => {
    const groups: Record<string, SavedLead[]> = {};
    STATUS_ORDER.forEach(s => { groups[s] = []; });
    sortedLeads.forEach(l => {
      if (groups[l.status]) groups[l.status].push(l);
      else groups["new"].push(l);
    });
    return groups;
  }, [sortedLeads]);

  const counts = processedLeads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handlePrimaryAction = (saved: SavedLead, _lead: Lead) => {
    setExecutionTarget(saved);
  };

  const handleExecute = async (savedId: string, updates: {
    status: LeadStatus;
    followUpDate: string;
    channel: ContactChannel;
    lastAction: string;
  }) => {
    const lead = savedLeads.find(l => l.id === savedId);
    if (!lead) return;

    const updatedData = { ...(lead.lead_data as any), follow_up_date: updates.followUpDate };

    await supabase.from("saved_leads").update({
      status: updates.status as any,
      last_action: updates.lastAction as any,
      contact_channel: updates.channel as any,
      last_action_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lead_data: updatedData as any,
    }).eq("id", savedId);

    toast.success("تم تحديث الحالة تلقائياً ✅");
    await fetchSavedLeads();
  };

  const handleSaveNote = async (savedId: string, noteText: string) => {
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
  };

  const handleSaveFollowUp = async (savedId: string, date: string) => {
    const lead = savedLeads.find(l => l.id === savedId);
    if (lead) {
      const updatedData = { ...(lead.lead_data as any), follow_up_date: date };
      await supabase.from("saved_leads").update({
        lead_data: updatedData as any,
        updated_at: new Date().toISOString(),
      }).eq("id", savedId);
      toast.success("تم تحديد موعد المتابعة");
      fetchSavedLeads();
    }
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
            <ThemeToggle />
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
          <h1 className="text-xl font-black text-foreground">📋 فرصي ({processedLeads.length})</h1>
          <div className="flex items-center gap-2">
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
              الكل ({processedLeads.length})
            </button>
            {STATUS_ORDER.map((s) => {
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
        <FollowUpReminders leads={processedLeads} onExecuteTask={handleExecute} />

        {/* Pipeline View */}
        {viewMode === "pipeline" ? (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible">
            {STATUS_ORDER.filter(s => !["won", "lost"].includes(s) || (counts[s] || 0) > 0).map((s) => {
              const info = LEAD_STATUSES[s];
              const items = grouped[s] || [];
              return (
                <div key={s} className="bg-card/50 border border-border rounded-xl p-2 min-w-[200px] w-[75vw] sm:w-auto snap-start shrink-0 md:min-w-0 md:w-auto">
                  <div className={`flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg ${info.color}`}>
                    <span className="text-xs">{info.emoji}</span>
                    <span className="text-xs font-bold">{info.label}</span>
                    <span className="text-[10px] mr-auto opacity-70">({items.length})</span>
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {items.map((saved) => {
                      const lead = saved.lead_data as Lead;
                      return (
                        <button
                          key={saved.id}
                          onClick={() => setExecutionTarget(saved)}
                          className="w-full text-right bg-secondary/50 border border-border/50 rounded-lg p-2 text-[11px] hover:bg-secondary/80 transition-colors"
                        >
                          <p className="font-bold text-foreground truncate">{lead.name}</p>
                          <p className="text-muted-foreground truncate">{lead.category}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`font-black ${(lead.score || 0) >= 80 ? "text-primary" : "text-muted-foreground"}`}>
                              {lead.score || 0}%
                            </span>
                          </div>
                        </button>
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
              <p className="text-foreground font-bold">لا توجد فرص</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filterStatus === "all" ? "ابحث واحفظ الفرص من صفحة البحث" : "لا توجد فرص بهذه الحالة"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((saved, i) => (
                  <ActionLeadCard
                    key={saved.id}
                    saved={saved}
                    index={i}
                    onPrimaryAction={handlePrimaryAction}
                    onStatusChange={updateLeadStatus}
                    onMarkContacted={markAsContacted}
                    onDelete={deleteLead}
                    onSaveNote={handleSaveNote}
                    onSaveFollowUp={handleSaveFollowUp}
                  />
                ))}
              </AnimatePresence>
            </div>
          )
        )}
      </div>

      {/* Execution Modal */}
      {executionTarget && (
        <ExecutionModal
          saved={executionTarget}
          onClose={() => setExecutionTarget(null)}
          onExecute={handleExecute}
          onStatusChange={updateLeadStatus}
        />
      )}
    </div>
  );
};

export default MyLeads;
