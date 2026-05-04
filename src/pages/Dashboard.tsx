import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Bookmark, Settings, LogOut, Crown,
  Zap, ClipboardList, Trash2, Flame, Snowflake,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SearchPanel from "@/components/SearchPanel";
import LeadCard from "@/components/LeadCard";
import ContactModal from "@/components/ContactModal";
import ScanningOverlay from "@/components/ScanningOverlay";
import { searchRealPlaces, generateMockLeads, type Lead, type SearchFilters, type SearchStats } from "@/lib/leadData";
import { calculateBuyingSignal } from "@/lib/buyingSignals";
import { calculateSEOOpportunity } from "@/lib/seoOpportunity";
import { calculateContactReadiness } from "@/lib/smartOutreach";
import { trackEvent } from "@/lib/analytics";
import { LEAD_STATUSES } from "@/lib/leadStatuses";
import { useLeadManager } from "@/hooks/useLeadManager";

type SignalFilter =
  | "all" | "Hot" | "Warm" | "Cold" | "noWebsiteHot" | "phoneHot"
  | "seoStrong" | "noWebsiteStrong"
  | "outreachHot" | "hasPhone" | "noWebsiteReady" | "ratingNoWebsite" | "needsFollowUp";

const SIGNAL_FILTERS: Array<{ id: SignalFilter; label: string }> = [
  { id: "all",              label: "كل الفرص" },
  { id: "Hot",              label: "🔥 Hot فقط" },
  { id: "Warm",             label: "⚡ Warm فقط" },
  { id: "Cold",             label: "🧊 Cold فقط" },
  { id: "noWebsiteHot",     label: "بدون موقع + Hot" },
  { id: "phoneHot",         label: "لديه رقم + Hot" },
  { id: "seoStrong",        label: "🌿 فرص ظهور قوية" },
  { id: "noWebsiteStrong",  label: "💎 بدون موقع + فرصة قوية" },
  { id: "outreachHot",      label: "🟢 جاهز للتواصل" },
  { id: "hasPhone",         label: "📱 عنده رقم/واتساب" },
  { id: "noWebsiteReady",   label: "بدون موقع + جاهز" },
  { id: "ratingNoWebsite",  label: "تقييم جيد + بدون موقع" },
  { id: "needsFollowUp",    label: "يحتاج متابعة" },
];

const OUTREACH_FILTER_IDS: SignalFilter[] = ["outreachHot", "hasPhone", "noWebsiteReady", "ratingNoWebsite", "needsFollowUp"];
const VISIBILITY_FILTER_IDS: SignalFilter[] = ["seoStrong", "noWebsiteStrong"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"search" | "saved" | "settings">("search");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);
  const [signalFilter, setSignalFilter] = useState<SignalFilter>("all");
  const [sortBySignal, setSortBySignal] = useState(true);
  const [sortBySEO, setSortBySEO] = useState(false);
  const [sortByOutreach, setSortByOutreach] = useState(false);

  const {
    savedLeads, fetchSavedLeads, saveLead, deleteLead,
    getLeadStatus, markAsContacted,
  } = useLeadManager(user?.id);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/login"); return; }
      setUser(session.user);
      fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) fetchSavedLeads();
  }, [user, fetchSavedLeads]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  };

  const handleSearch = useCallback(async (city: string, category: string, filters: SearchFilters = {}) => {
    if (!user) return;

    const { data: newCount, error } = await supabase.rpc("increment_search_count", {
      _user_id: user.id,
    });

    if (error || newCount === -1) {
      setLimitReached(true);
      toast.error(t("dashboard.trialEndedToast"));
      return;
    }

    setIsSearching(true);
    setLeads([]);
    setSearchStats(null);
    setHasSearched(false);
    trackEvent("search", { city, category, ...filters });

    try {
      const { leads: results, stats } = await searchRealPlaces(city, category, filters);
      const enriched = enrichWithSignals(results);
      setLeads(enriched);
      setSearchStats(stats || null);
      setHasSearched(true);
      setProfile((p: any) => p ? { ...p, search_count: newCount } : p);
    } catch (err) {
      console.error("Real search failed, falling back to mock:", err);
      toast.error(t("dashboard.fallbackSearch"));
      const results = enrichWithSignals(generateMockLeads(city, category));
      setLeads(results);
      setHasSearched(true);
      setProfile((p: any) => p ? { ...p, search_count: newCount } : p);
    } finally {
      setIsSearching(false);
    }
  }, [user, t]);

  // Compute buying-signal fields for raw leads (used right after search).
  function enrichWithSignals(arr: Lead[]): Lead[] {
    return arr.map((l) => {
      const s = calculateBuyingSignal(l, { reviewTexts: l.reviewTexts });
      return {
        ...l,
        buying_signal_score: s.score,
        buying_signal_status: s.status,
        buying_signal_reasons: s.reasons,
        next_best_action: s.next_best_action,
      };
    });
  }

  // ── Filter + sort visible leads by buying signal ──
  const visibleLeads = useMemo(() => {
    let arr = [...leads];
    switch (signalFilter) {
      case "Hot":  arr = arr.filter(l => l.buying_signal_status === "Hot"); break;
      case "Warm": arr = arr.filter(l => l.buying_signal_status === "Warm"); break;
      case "Cold": arr = arr.filter(l => l.buying_signal_status === "Cold"); break;
      case "noWebsiteHot":
        arr = arr.filter(l => !l.hasWebsite && l.buying_signal_status === "Hot"); break;
      case "phoneHot":
        arr = arr.filter(l => !!l.phone && l.buying_signal_status === "Hot"); break;
      case "seoStrong":
        arr = arr.filter(l => calculateSEOOpportunity(l).level === "strong"); break;
      case "noWebsiteStrong":
        arr = arr.filter(l => !l.hasWebsite && calculateSEOOpportunity(l).level === "strong"); break;
      case "outreachHot":
        arr = arr.filter(l => calculateContactReadiness(l).level === "hot"); break;
      case "hasPhone":
        arr = arr.filter(l => !!l.phone); break;
      case "noWebsiteReady":
        arr = arr.filter(l => !l.hasWebsite && calculateContactReadiness(l).level !== "low"); break;
      case "ratingNoWebsite":
        arr = arr.filter(l => !l.hasWebsite && l.rating >= 4.0); break;
      case "needsFollowUp":
        arr = arr.filter(l => calculateContactReadiness(l).level === "warm"); break;
    }
    if (sortByOutreach) {
      arr.sort((a, b) => calculateContactReadiness(b).score - calculateContactReadiness(a).score);
    } else if (sortBySEO) {
      arr.sort((a, b) => calculateSEOOpportunity(b).score - calculateSEOOpportunity(a).score);
    } else if (sortBySignal) {
      arr.sort((a, b) => (b.buying_signal_score ?? 0) - (a.buying_signal_score ?? 0));
    } else {
      arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }
    return arr;
  }, [leads, signalFilter, sortBySignal, sortBySEO, sortByOutreach]);

  // ── Stats over current results ──
  const signalStats = useMemo(() => {
    const hot  = leads.filter(l => l.buying_signal_status === "Hot").length;
    const warm = leads.filter(l => l.buying_signal_status === "Warm").length;
    const cold = leads.filter(l => l.buying_signal_status === "Cold").length;
    const sum  = leads.reduce((acc, l) => acc + (l.buying_signal_score ?? 0), 0);
    const avg  = leads.length ? Math.round(sum / leads.length) : 0;
    const byCategory: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    for (const l of leads) {
      if (l.buying_signal_status === "Hot") {
        byCategory[l.category] = (byCategory[l.category] ?? 0) + 1;
        byCity[l.city]         = (byCity[l.city] ?? 0) + 1;
      }
    }
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topCity     = Object.entries(byCity).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { hot, warm, cold, avg, topCategory, topCity };
  }, [leads]);


  const handleSaveLead = async (lead: Lead) => {
    await saveLead(lead);
  };

  const handleContactLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleWhatsAppClick = async (lead: Lead) => {
    const saved = getLeadStatus(lead.id);
    if (saved) {
      await markAsContacted(saved.id, "whatsapp");
    }
  };

  const handleCopyClick = async (lead: Lead) => {
    const saved = getLeadStatus(lead.id);
    if (saved) {
      await markAsContacted(saved.id, "copy");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  const remainingSearches = profile ? profile.max_searches - profile.search_count : 0;

  const tabs = [
    { id: "search" as const, label: t("dashboard.tabSearch"), icon: Search },
    { id: "saved" as const, label: t("dashboard.tabSaved"), icon: Bookmark },
    { id: "settings" as const, label: t("dashboard.tabSettings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <span className="font-black text-lg text-foreground">LeadHunter</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="/my-leads"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-bold"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">{t("dashboard.tabLeads")}</span>
              {savedLeads.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {savedLeads.length}
                </span>
              )}
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-24 px-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-foreground">{t("dashboard.welcome", { name: profile?.full_name || t("dashboard.user") })}</h1>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{remainingSearches}</span>
            <span className="text-xs text-muted-foreground">{t("dashboard.remainingSearches")}</span>
          </div>
        </div>

        {activeTab === "search" && (
          <div>
            {limitReached ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-card border border-border rounded-2xl"
              >
                <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-black text-foreground mb-2">{t("dashboard.trialEnded")}</h2>
                <p className="text-muted-foreground mb-6">{t("dashboard.subscribePrompt")}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all"
                >
                  {t("dashboard.subscribeNow")}
                </Link>
              </motion.div>
            ) : (
              <>
                <SearchPanel onSearch={handleSearch} isSearching={isSearching} />

                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    {isSearching && <ScanningOverlay key="scan" />}
                  </AnimatePresence>

                  {hasSearched && !isSearching && (
                    <>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-lg font-bold text-foreground mb-3"
                      >
                        👉 {t("search.foundLeads").replace("👉 ", "")} <span className="neon-text text-2xl">{leads.length}</span> {t("search.foundOpportunities")}
                      </motion.p>

                      {searchStats && leads.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-wrap items-center justify-center gap-2 mb-6"
                        >
                          {searchStats.golden > 0 && (
                            <span className="bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold">
                              💎 {searchStats.golden} فرصة ذهبية
                            </span>
                          )}
                          {searchStats.noWebsite > 0 && (
                            <span className="bg-secondary text-foreground border border-border px-3 py-1 rounded-full text-xs font-bold">
                              🌐 {searchStats.noWebsite} بدون موقع
                            </span>
                          )}
                          {searchStats.hot > 0 && (
                            <span className="bg-orange-500/15 text-orange-500 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold">
                              🔥 {searchStats.hot} ساخن
                            </span>
                          )}
                        </motion.div>
                      )}

                      {/* ── Buying Signal stats cards ── */}
                      {leads.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                          <StatCard icon={<Flame className="w-4 h-4" />} label="Hot" value={signalStats.hot} tone="hot" />
                          <StatCard icon={<Zap className="w-4 h-4" />} label="Warm" value={signalStats.warm} tone="warm" />
                          <StatCard icon={<Snowflake className="w-4 h-4" />} label="Cold" value={signalStats.cold} tone="cold" />
                          <StatCard label="متوسط الإشارة" value={signalStats.avg} tone="neutral" />
                          <StatCard label="أفضل قطاع" value={signalStats.topCategory ?? "—"} tone="neutral" />
                          <StatCard label="أفضل مدينة" value={signalStats.topCity ?? "—"} tone="neutral" />
                        </div>
                      )}

                      {/* ── Filters: split into two visual groups ── */}
                      {leads.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {/* Sales filters (Buying Signal) */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <span className="shrink-0 text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                              فلاتر البيع
                            </span>
                            {SIGNAL_FILTERS.filter(f => !VISIBILITY_FILTER_IDS.includes(f.id) && !OUTREACH_FILTER_IDS.includes(f.id)).map((f) => (
                              <button
                                key={f.id}
                                onClick={() => setSignalFilter(f.id)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                  signalFilter === f.id
                                    ? "bg-primary/15 text-primary border-primary/30"
                                    : "bg-secondary text-secondary-foreground border-border"
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                            <button
                              onClick={() => { setSortBySignal((v) => !v); if (!sortBySignal) { setSortBySEO(false); setSortByOutreach(false); } }}
                              className={`shrink-0 ml-auto px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                sortBySignal
                                  ? "bg-primary/15 text-primary border-primary/30"
                                  : "bg-secondary text-secondary-foreground border-border"
                              }`}
                              title="ترتيب حسب درجة الإشارة"
                            >
                              ↕ ترتيب حسب الإشارة
                            </button>
                          </div>

                          {/* Visibility filters */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-t border-border/40 pt-2">
                            <span className="shrink-0 text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider px-1">
                              فلاتر الظهور
                            </span>
                            {SIGNAL_FILTERS.filter(f => VISIBILITY_FILTER_IDS.includes(f.id)).map((f) => (
                              <button
                                key={f.id}
                                onClick={() => setSignalFilter(f.id)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                  signalFilter === f.id
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : "bg-secondary text-secondary-foreground border-border"
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                            <button
                              onClick={() => { setSortBySEO((v) => !v); if (!sortBySEO) { setSortBySignal(false); setSortByOutreach(false); } }}
                              className={`shrink-0 ml-auto px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                sortBySEO
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-secondary text-secondary-foreground border-border"
                              }`}
                              title="الأعلى فرصة ظهور في قوقل"
                            >
                              🌿 الأعلى فرصة ظهور
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleLeads.map((lead, i) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            index={i}
                            onContact={handleContactLead}
                            onSave={handleSaveLead}
                            onWhatsApp={handleWhatsAppClick}
                            onCopy={handleCopyClick}
                            savedStatus={getLeadStatus(lead.id)}
                          />
                        ))}
                        {visibleLeads.length === 0 && (
                          <div className="col-span-full text-center py-10 text-muted-foreground text-sm">
                            لا توجد فرص تطابق الفلاتر المحددة
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-foreground">{t("dashboard.savedLeadsTitle", { count: savedLeads.length })}</h2>
              {savedLeads.length > 0 && (
                <Link
                  to="/my-leads"
                  className="text-sm text-primary hover:underline font-bold flex items-center gap-1"
                >
                  <ClipboardList className="w-4 h-4" />
                  {t("dashboard.manageLeads")}
                </Link>
              )}
            </div>
            {savedLeads.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-bold">{t("dashboard.noSavedLeads")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("dashboard.searchAndSave")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLeads.map((saved) => {
                  const lead = saved.lead_data as Lead;
                  const statusInfo = LEAD_STATUSES[saved.status] || { label: saved.status, emoji: "📌", color: "" };
                  return (
                    <motion.div
                      key={saved.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{lead.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.emoji} {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.category} — {lead.city}</p>
                      </div>
                      <button
                        onClick={() => deleteLead(saved.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-md">
            <h2 className="text-lg font-black text-foreground mb-4">{t("dashboard.settingsTitle")}</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">{t("dashboard.name")}</label>
                <p className="text-foreground font-bold">{profile?.full_name || "—"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("dashboard.emailLabel")}</label>
                <p className="text-foreground font-bold" dir="ltr">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("dashboard.usedSearches")}</label>
                <p className="text-foreground font-bold">{profile?.search_count} / {profile?.max_searches}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("dashboard.plan")}</label>
                <p className="text-foreground font-bold">{t("dashboard.planFree")}</p>
              </div>
              <Link
                to="/contact"
                className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:brightness-110 transition-all"
              >
                {t("dashboard.upgrade")}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tabs (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex items-center justify-around h-14">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
          <Link
            to="/my-leads"
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-xs font-medium">{t("dashboard.tabLeads")}</span>
          </Link>
        </div>
      </div>

      <ContactModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onSave={handleSaveLead}
        onMarkContacted={async (lead, channel) => {
          const ch = channel as import("@/lib/leadStatuses").ContactChannel;
          const saved = getLeadStatus(lead.id);
          if (saved) {
            await markAsContacted(saved.id, ch);
          } else {
            await saveLead(lead);
            const newSaved = getLeadStatus(lead.id);
            if (newSaved) await markAsContacted(newSaved.id, ch);
          }
        }}
      />
    </div>
  );
};

const TONE_CLASSES: Record<string, string> = {
  hot:     "bg-primary/10 border-primary/30 text-primary",
  warm:    "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  cold:    "bg-muted border-border text-muted-foreground",
  neutral: "bg-card border-border text-foreground",
};

const StatCard = ({
  icon, label, value, tone = "neutral",
}: { icon?: React.ReactNode; label: string; value: number | string; tone?: keyof typeof TONE_CLASSES }) => (
  <div className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${TONE_CLASSES[tone]}`}>
    {icon && <span className="shrink-0">{icon}</span>}
    <div className="min-w-0">
      <p className="text-[10px] font-bold opacity-70 truncate">{label}</p>
      <p className="text-sm font-black truncate">{value}</p>
    </div>
  </div>
);

export default Dashboard;
