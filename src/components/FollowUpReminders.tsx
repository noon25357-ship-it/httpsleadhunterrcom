import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, ChevronUp, AlertTriangle, Clock, Zap, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { SavedLead, LeadStatus } from "@/lib/leadStatuses";
import type { Lead } from "@/lib/leadData";
import { getFollowUpSuggestion, type FollowUpSuggestion } from "@/lib/followUpGenerator";
import { openWhatsApp, getNextStatus, calculateFollowUpDate, getNextActionHint } from "@/lib/executionEngine";

interface FollowUpRemindersProps {
  leads: SavedLead[];
  onExecuteTask: (savedId: string, updates: {
    status: LeadStatus;
    followUpDate: string;
    channel: "whatsapp" | "call" | "copy";
    lastAction: string;
  }) => Promise<void>;
}

interface LeadTask {
  saved: SavedLead;
  lead: Lead & { follow_up_date?: string };
  suggestion: FollowUpSuggestion;
}

const FollowUpReminders = ({ leads, onExecuteTask }: FollowUpRemindersProps) => {
  const [expanded, setExpanded] = useState(true);
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const tasks: LeadTask[] = leads
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
    .filter(Boolean) as LeadTask[];

  tasks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.suggestion.urgency] - order[b.suggestion.urgency];
  });

  const visibleTasks = tasks.filter(
    (t) => !completedIds.has(t.saved.id) && !skippedIds.has(t.saved.id)
  );

  if (visibleTasks.length === 0 && tasks.length === 0) return null;

  const highCount = visibleTasks.filter((t) => t.suggestion.urgency === "high").length;

  const executeTask = async (task: LeadTask) => {
    const { saved, lead, suggestion } = task;
    const id = saved.id;

    setExecutingIds((prev) => new Set(prev).add(id));

    // 1. Open WhatsApp with pre-filled message
    if (lead.phone) {
      openWhatsApp(lead.phone, suggestion.message);
    } else {
      navigator.clipboard.writeText(suggestion.message);
    }

    // 2. Calculate next status & follow-up
    const nextStatus = getNextStatus(saved.status as LeadStatus);
    const score = lead.score || 50;
    const followUpDate = calculateFollowUpDate(score);
    const followUpDays = Math.ceil(
      (new Date(followUpDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // 3. Persist: status + follow-up + channel
    await onExecuteTask(id, {
      status: nextStatus,
      followUpDate,
      channel: lead.phone ? "whatsapp" : "copy",
      lastAction: "message_sent",
    });

    // 4. Show success feedback with next action hint
    const hint = getNextActionHint(nextStatus, followUpDays);
    toast.success(
      <div className="text-right">
        <p className="font-bold">تم التنفيذ ✅</p>
        <p className="text-xs mt-1 opacity-80">📌 {hint}</p>
      </div>,
      { duration: 4000 }
    );

    // 5. Animate removal
    setExecutingIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setCompletedIds((prev) => new Set(prev).add(id));
  };

  const skipTask = (id: string) => {
    setSkippedIds((prev) => new Set(prev).add(id));
    toast("تم تخطي المهمة", { duration: 2000 });
  };

  const urgencyStyles = {
    high: "border-red-500/30 bg-red-500/5",
    medium: "border-orange-500/30 bg-orange-500/5",
    low: "border-yellow-500/30 bg-yellow-500/5",
  };

  const completedCount = completedIds.size + skippedIds.size;

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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                {highCount}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="font-bold text-foreground text-sm">
              ⚡ مهام جاهزة للتنفيذ ({visibleTasks.length})
            </span>
            {completedCount > 0 && (
              <span className="text-[10px] text-primary font-medium mr-2">
                ✅ {completedCount} مكتملة
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Task List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 mt-2">
              {visibleTasks.length === 0 && tasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 bg-primary/5 border border-primary/20 rounded-xl"
                >
                  <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-bold text-foreground text-sm">كل المهام مكتملة 🎉</p>
                  <p className="text-xs text-muted-foreground mt-1">أحسنت! تابع شغلك</p>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {visibleTasks.map((task) => {
                  const { saved, lead, suggestion } = task;
                  const isExecuting = executingIds.has(saved.id);
                  const urgencyIcon =
                    suggestion.urgency === "high" ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : suggestion.urgency === "medium" ? (
                      <Clock className="w-4 h-4 text-orange-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    );

                  return (
                    <motion.div
                      key={saved.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
                      className={`rounded-xl border ${urgencyStyles[suggestion.urgency]} overflow-hidden`}
                    >
                      <div className="flex items-center gap-3 px-3 py-3">
                        {/* Urgency icon */}
                        {urgencyIcon}

                        {/* Lead info + suggested action */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm truncate">
                              {lead.name}
                            </span>
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground shrink-0">
                              {lead.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-orange-400 font-bold mt-0.5">
                            {suggestion.label}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Skip button */}
                          <button
                            onClick={() => skipTask(saved.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
                            title="تخطي"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Execute button — ONE CLICK */}
                          <button
                            onClick={() => executeTask(task)}
                            disabled={isExecuting}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                              isExecuting
                                ? "bg-primary/30 text-primary cursor-wait"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                            }`}
                          >
                            {isExecuting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                جاري التنفيذ...
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5" />
                                نفّذ ⚡
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Preview message strip */}
                      <div className="px-3 pb-2">
                        <p className="text-[10px] text-muted-foreground leading-relaxed truncate">
                          💬 {suggestion.message.split("\n")[0]}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpReminders;
