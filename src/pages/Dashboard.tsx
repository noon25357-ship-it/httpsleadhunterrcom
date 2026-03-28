import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Bookmark, Settings, LogOut, Crown,
  Zap, ArrowRight, Trash2, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SearchPanel from "@/components/SearchPanel";
import LeadCard from "@/components/LeadCard";
import ContactModal from "@/components/ContactModal";
import ScanningOverlay from "@/components/ScanningOverlay";
import { generateMockLeads, type Lead } from "@/lib/leadData";
import { trackEvent } from "@/lib/analytics";

const Dashboard = () => {
  const navigate = useNavigate();
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

  // Saved leads
  const [savedLeads, setSavedLeads] = useState<any[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchSavedLeads(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  };

  const fetchSavedLeads = async (userId: string) => {
    const { data } = await supabase
      .from("saved_leads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setSavedLeads(data || []);
  };

  const handleSearch = useCallback(async (city: string, category: string) => {
    if (!user) return;

    // Check limit via RPC
    const { data: newCount, error } = await supabase.rpc("increment_search_count", {
      _user_id: user.id,
    });

    if (error || newCount === -1) {
      setLimitReached(true);
      toast.error("انتهت تجاربك المجانية! اشترك للاستمرار");
      return;
    }

    setIsSearching(true);
    setLeads([]);
    setHasSearched(false);
    trackEvent("search", { city, category });

    setTimeout(() => {
      const results = generateMockLeads(city, category);
      setLeads(results);
      setIsSearching(false);
      setHasSearched(true);
      // Update local profile
      setProfile((p: any) => p ? { ...p, search_count: newCount } : p);
    }, 1800);
  }, [user]);

  const saveLead = async (lead: Lead) => {
    if (!user) return;
    const { error } = await supabase.from("saved_leads").insert({
      user_id: user.id,
      lead_data: lead as any,
    });
    if (error) {
      toast.error("خطأ في حفظ الليد");
    } else {
      toast.success("تم حفظ الليد ✅");
      fetchSavedLeads(user.id);
    }
  };

  const deleteSavedLead = async (id: string) => {
    await supabase.from("saved_leads").delete().eq("id", id);
    if (user) fetchSavedLeads(user.id);
    toast.success("تم الحذف");
  };

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

  const remainingSearches = profile ? profile.max_searches - profile.search_count : 0;

  const tabs = [
    { id: "search" as const, label: "بحث", icon: Search },
    { id: "saved" as const, label: "المحفوظات", icon: Bookmark },
    { id: "settings" as const, label: "الحساب", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
        {/* Search counter */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-foreground">مرحبًا، {profile?.full_name || "مستخدم"} 👋</h1>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{remainingSearches}</span>
            <span className="text-xs text-muted-foreground">بحث متبقي</span>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "search" && (
          <div>
            {limitReached ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-card border border-border rounded-2xl"
              >
                <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-black text-foreground mb-2">انتهت تجاربك المجانية!</h2>
                <p className="text-muted-foreground mb-6">اشترك الآن لعمليات بحث غير محدودة</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl hover:brightness-110 transition-all"
                >
                  اشترك الآن 🚀
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
                        className="text-center text-lg font-bold text-foreground mb-6"
                      >
                        👉 لقينا لك <span className="neon-text text-2xl">{leads.length}</span> فرصة
                      </motion.p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leads.map((lead, i) => (
                          <div key={lead.id} className="relative">
                            <LeadCard lead={lead} index={i} onContact={setSelectedLead} />
                            <button
                              onClick={() => saveLead(lead)}
                              className="absolute top-3 left-3 z-10 p-1.5 bg-primary/20 hover:bg-primary/40 rounded-lg transition-colors"
                              title="حفظ"
                            >
                              <Bookmark className="w-4 h-4 text-primary" />
                            </button>
                          </div>
                        ))}
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
            <h2 className="text-lg font-black text-foreground mb-4">الليدز المحفوظة ({savedLeads.length})</h2>
            {savedLeads.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-bold">لا توجد ليدز محفوظة</p>
                <p className="text-sm text-muted-foreground mt-1">ابحث واحفظ أفضل الفرص هنا</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLeads.map((saved) => {
                  const lead = saved.lead_data as Lead;
                  return (
                    <motion.div
                      key={saved.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-foreground">{lead.name}</h3>
                        <p className="text-sm text-muted-foreground">{lead.category} — {lead.city}</p>
                      </div>
                      <button
                        onClick={() => deleteSavedLead(saved.id)}
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
            <h2 className="text-lg font-black text-foreground mb-4">إعدادات الحساب</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">الاسم</label>
                <p className="text-foreground font-bold">{profile?.full_name || "—"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">البريد</label>
                <p className="text-foreground font-bold" dir="ltr">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">عمليات البحث المستخدمة</label>
                <p className="text-foreground font-bold">{profile?.search_count} / {profile?.max_searches}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الباقة</label>
                <p className="text-foreground font-bold">مجانية</p>
              </div>
              <Link
                to="/contact"
                className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:brightness-110 transition-all"
              >
                ترقية الباقة 🚀
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tabs (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ContactModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};

export default Dashboard;
