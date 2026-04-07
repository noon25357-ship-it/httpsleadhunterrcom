import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Crown, User, ChevronDown, Check, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  search_count: number;
  max_searches: number;
  created_at: string;
}

const PLANS = [
  { label: "تجريبي", searches: 2, color: "text-muted-foreground" },
  { label: "أساسي", searches: 10, color: "text-blue-400" },
  { label: "متقدم", searches: 50, color: "text-purple-400" },
  { label: "احترافي", searches: 200, color: "text-primary" },
  { label: "غير محدود", searches: 99999, color: "text-yellow-400" },
];

function getPlan(maxSearches: number) {
  return PLANS.find(p => p.searches === maxSearches) || PLANS[0];
}

const SubscriptionManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    // We need to join profiles with auth.users to get emails
    // Since we can't query auth.users from client, we'll use profiles + a workaround
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل المستخدمين");
      setLoading(false);
      return;
    }

    // Map profiles to UserProfile format
    const mapped: UserProfile[] = (data || []).map(p => ({
      id: p.id,
      full_name: p.full_name,
      email: "", // Will be shown as ID if no name
      search_count: p.search_count,
      max_searches: p.max_searches,
      created_at: p.created_at,
    }));

    setUsers(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpgrade = async (userId: string, newMax: number) => {
    setSavingUser(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ max_searches: newMax })
      .eq("id", userId);

    if (error) {
      toast.error("فشل تحديث الباقة");
    } else {
      toast.success("تم تحديث الباقة بنجاح ✅");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, max_searches: newMax } : u));
    }
    setSavingUser(null);
    setEditingUser(null);
  };

  const handleResetSearchCount = async (userId: string) => {
    setSavingUser(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ search_count: 0 })
      .eq("id", userId);

    if (error) {
      toast.error("فشل إعادة التعيين");
    } else {
      toast.success("تم إعادة تعيين العداد ✅");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, search_count: 0 } : u));
    }
    setSavingUser(null);
  };

  const filtered = users.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.full_name?.toLowerCase().includes(q)) || u.id.toLowerCase().includes(q);
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          إدارة الاشتراكات
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم..."
            className="w-full bg-secondary text-foreground rounded-xl pr-10 pl-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-black text-foreground">{users.length}</p>
          <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-black text-blue-400">{users.filter(u => u.max_searches === 10).length}</p>
          <p className="text-xs text-muted-foreground">أساسي</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-black text-purple-400">{users.filter(u => u.max_searches === 50).length}</p>
          <p className="text-xs text-muted-foreground">متقدم</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xl font-black text-primary">{users.filter(u => u.max_searches >= 200).length}</p>
          <p className="text-xs text-muted-foreground">احترافي+</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground animate-pulse">جاري تحميل المستخدمين...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-bold">لا يوجد مستخدمين</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => {
            const plan = getPlan(user.max_searches);
            const usage = user.max_searches === 99999 ? 0 : Math.round((user.search_count / user.max_searches) * 100);

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground truncate">
                        {user.full_name || "بدون اسم"}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${plan.color} bg-current/10 border-current/20`}
                        style={{ backgroundColor: 'transparent' }}
                      >
                        {plan.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate" dir="ltr">{user.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      انضم: {formatDate(user.created_at)}
                    </p>
                  </div>

                  {/* Usage */}
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm font-bold text-foreground">
                        {user.search_count} / {user.max_searches === 99999 ? "∞" : user.max_searches}
                      </p>
                      <div className="w-full h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(usage, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">عمليات بحث</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetSearchCount(user.id)}
                        disabled={savingUser === user.id}
                        className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                        title="إعادة تعيين العداد"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {editingUser === user.id ? (
                        <div className="flex flex-col gap-1 bg-secondary rounded-xl p-2 border border-border">
                          {PLANS.map(p => (
                            <button
                              key={p.searches}
                              onClick={() => handleUpgrade(user.id, p.searches)}
                              disabled={savingUser === user.id}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-colors text-right ${
                                user.max_searches === p.searches
                                  ? "bg-primary/20 text-primary font-bold"
                                  : "hover:bg-card text-foreground"
                              }`}
                            >
                              {p.label} ({p.searches === 99999 ? "∞" : p.searches})
                              {user.max_searches === p.searches && <Check className="w-3 h-3 inline mr-1" />}
                            </button>
                          ))}
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-xs text-muted-foreground hover:text-foreground mt-1"
                          >
                            <X className="w-3 h-3 inline ml-1" />
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          title="تغيير الباقة"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
