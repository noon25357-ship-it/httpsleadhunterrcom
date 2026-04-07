import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  Search, RefreshCw, Filter, ExternalLink, Copy, Check,
  Sparkles, Globe, MessageSquare, TrendingUp, Zap, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type IntentLead = {
  id: string;
  source: string;
  source_url: string;
  author: string | null;
  title: string | null;
  content: string;
  subreddit: string | null;
  intent_score: number;
  intent_category: string;
  ai_summary: string | null;
  suggested_reply: string | null;
  status: string;
  created_at: string;
};

const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  needs_website: { label: "يحتاج موقع", emoji: "🌐", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  needs_marketing: { label: "يحتاج تسويق", emoji: "📈", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  needs_design: { label: "يحتاج تصميم", emoji: "🎨", color: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
  needs_seo: { label: "يحتاج SEO", emoji: "🔍", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  other: { label: "أخرى", emoji: "📋", color: "bg-muted text-muted-foreground border-border" },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "جديد", color: "bg-primary/15 text-primary border-primary/30" },
  contacted: { label: "تم التواصل", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  replied: { label: "رد", color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  converted: { label: "تحول لعميل", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  ignored: { label: "تم التجاهل", color: "bg-muted text-muted-foreground border-border" },
};

const IntentLeads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<IntentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [minScore, setMinScore] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }

    let query = supabase
      .from("intent_leads")
      .select("*")
      .order("intent_score", { ascending: false })
      .order("created_at", { ascending: false });

    if (filterSource !== "all") query = query.eq("source", filterSource);
    if (filterCategory !== "all") query = query.eq("intent_category", filterCategory);
    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (minScore > 0) query = query.gte("intent_score", minScore);

    const { data, error } = await query;
    if (error) { console.error(error); toast.error("خطأ في تحميل البيانات"); }
    else setLeads((data as IntentLead[]) || []);
    setLoading(false);
  }, [filterSource, filterCategory, filterStatus, minScore, navigate]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("intent-leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "intent_leads" }, () => {
        fetchLeads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLeads]);

  const scanSource = async (source: "reddit" | "google") => {
    setScanning(source);
    try {
      const { data, error } = await supabase.functions.invoke(
        source === "reddit" ? "scan-reddit" : "scan-google",
        {}
      );
      if (error) throw error;
      toast.success(`تم العثور على ${data.found} نتيجة، أُضيف ${data.inserted} جديد`);
      fetchLeads();
    } catch (e: any) {
      toast.error(e.message || "خطأ في المسح");
    } finally {
      setScanning(null);
    }
  };

  const classifyLeads = async () => {
    setClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("classify-intent", {});
      if (error) throw error;
      toast.success(`تم تصنيف ${data.classified} من ${data.total} lead بالذكاء الاصطناعي`);
      fetchLeads();
    } catch (e: any) {
      toast.error(e.message || "خطأ في التصنيف");
    } finally {
      setClassifying(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("intent_leads").update({ status }).eq("id", id);
    if (error) toast.error("خطأ في تحديث الحالة");
    else fetchLeads();
  };

  const copyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-muted-foreground";
  };

  const unclassifiedCount = leads.filter(l => l.intent_score === 0).length;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Intent Leads
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              اكتشف عملاء محتملين من الإنترنت بالذكاء الاصطناعي
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => scanSource("reddit")}
              disabled={scanning !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/25 transition disabled:opacity-50"
            >
              {scanning === "reddit" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
              مسح Reddit
            </button>
            <button
              onClick={() => scanSource("google")}
              disabled={scanning !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-500/25 transition disabled:opacity-50"
            >
              {scanning === "google" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              مسح Google
            </button>
            {unclassifiedCount > 0 && (
              <button
                onClick={classifyLeads}
                disabled={classifying}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/15 text-primary border border-primary/30 text-xs font-bold hover:bg-primary/25 transition disabled:opacity-50"
              >
                {classifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                تصنيف AI ({unclassifiedCount})
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "إجمالي", value: leads.length, icon: Search },
            { label: "نية عالية (80+)", value: leads.filter(l => l.intent_score >= 80).length, icon: TrendingUp },
            { label: "Reddit", value: leads.filter(l => l.source === "reddit").length, icon: MessageSquare },
            { label: "Google", value: leads.filter(l => l.source === "google").length, icon: Globe },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto text-primary mb-1" />
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs"
          >
            <option value="all">كل المصادر</option>
            <option value="reddit">Reddit</option>
            <option value="google">Google</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs"
          >
            <option value="all">كل التصنيفات</option>
            {Object.entries(CATEGORY_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs"
          >
            <option value="all">كل الحالات</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs"
          >
            <option value={0}>كل النقاط</option>
            <option value={40}>40+</option>
            <option value={60}>60+</option>
            <option value={80}>80+</option>
          </select>
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ابدأ بمسح Reddit أو Google للعثور على عملاء محتملين
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {leads.map((lead) => {
                const cat = CATEGORY_MAP[lead.intent_category] || CATEGORY_MAP.other;
                const stat = STATUS_MAP[lead.status] || STATUS_MAP.new;
                const isExpanded = expandedId === lead.id;

                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xl font-bold ${scoreColor(lead.intent_score)}`}>
                            {lead.intent_score}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cat.color}`}>
                            {cat.emoji} {cat.label}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${stat.color}`}>
                            {stat.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {lead.source === "reddit" ? "🟠 Reddit" : "🔵 Google"}
                            {lead.subreddit && ` • r/${lead.subreddit}`}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold line-clamp-1">{lead.title || "بدون عنوان"}</h3>
                      </div>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* AI Summary */}
                    {lead.ai_summary && (
                      <p className="text-xs text-primary/80 mb-2 flex items-start gap-1">
                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                        {lead.ai_summary}
                      </p>
                    )}

                    {/* Expanded content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3 mt-3"
                      >
                        <div className="bg-secondary/60 rounded-lg p-3">
                          <p className="text-[11px] text-muted-foreground mb-1 font-bold">المنشور الأصلي:</p>
                          <p className="text-xs text-foreground/80 whitespace-pre-line line-clamp-6">
                            {lead.content}
                          </p>
                        </div>

                        {lead.suggested_reply && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> الرد المقترح
                              </span>
                              <button
                                onClick={() => copyReply(lead.id, lead.suggested_reply!)}
                                className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground"
                              >
                                {copiedId === lead.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                                {copiedId === lead.id ? "تم" : "نسخ"}
                              </button>
                            </div>
                            <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                              {lead.suggested_reply}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <a
                        href={lead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> فتح المنشور
                      </a>
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        className="text-[10px] px-2 py-1 rounded-md bg-secondary border-none"
                      >
                        {Object.entries(STATUS_MAP).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <span className="text-[9px] text-muted-foreground mr-auto">
                        {lead.author && `@${lead.author}`} • {new Date(lead.created_at).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntentLeads;
