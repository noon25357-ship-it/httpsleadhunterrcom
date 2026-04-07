import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Mail, Phone, Clock, LogIn, LogOut, Eye, EyeOff, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SubscriptionManager from "@/components/admin/SubscriptionManager";

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
}

const Admin = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "subscriptions">("requests");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setCheckingAuth(false);
      if (session) fetchRequests();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setCheckingAuth(false);
      if (session) fetchRequests();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل الطلبات");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRequests([]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <span className="font-black text-lg text-foreground tracking-tight">LeadHunter</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </button>
            )}
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              الرئيسية
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        {!isLoggedIn ? (
          /* Login Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto"
          >
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-foreground mb-2">لوحة التحكم</h1>
              <p className="text-sm text-muted-foreground">سجل دخولك للوصول للطلبات</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 bg-card border border-border rounded-2xl p-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="admin@example.com"
                  className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-base hover:brightness-110 transition-all disabled:opacity-60"
              >
                {authLoading ? "جاري الدخول..." : "دخول"}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Dashboard */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-6">
              <h1 className="text-2xl font-black text-foreground">لوحة التحكم</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-secondary rounded-xl p-1">
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "requests"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                طلبات التواصل
              </button>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "subscriptions"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Crown className="w-4 h-4" />
                إدارة الاشتراكات
              </button>
            </div>

            {activeTab === "requests" ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">{requests.length}</p>
                    <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">
                      {requests.filter(r => {
                        const d = new Date(r.created_at);
                        const now = new Date();
                        return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
                      }).length}
                    </p>
                    <p className="text-xs text-muted-foreground">آخر 7 أيام</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">
                      {requests.filter(r => r.email).length}
                    </p>
                    <p className="text-xs text-muted-foreground">بريد إلكتروني</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 text-center">
                    <Phone className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-black text-foreground">
                      {requests.filter(r => r.phone).length}
                    </p>
                    <p className="text-xs text-muted-foreground">رقم جوال</p>
                  </div>
                </div>

                {/* Requests Table */}
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground animate-pulse">جاري تحميل الطلبات...</div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-bold">لا توجد طلبات بعد</p>
                    <p className="text-sm text-muted-foreground mt-1">الطلبات ستظهر هنا عند استقبالها</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map((req, i) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-2xl p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 className="font-bold text-foreground">{req.name}</h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(req.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <a href={`mailto:${req.email}`} className="text-primary hover:underline flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {req.email}
                          </a>
                          {req.phone && (
                            <a href={`tel:${req.phone}`} className="text-primary hover:underline flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {req.phone}
                            </a>
                          )}
                        </div>
                        {req.message && (
                          <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 rounded-xl p-3">{req.message}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <SubscriptionManager />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
