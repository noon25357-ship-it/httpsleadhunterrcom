import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("بيانات الدخول غير صحيحة");
    } else {
      toast.success("تم تسجيل الدخول!");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        const isAdmin = roles?.some((r: any) => r.role === "admin");
        navigate(isAdmin ? "/admin" : "/dashboard");
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("حدث خطأ في تسجيل الدخول بقوقل");
        return;
      }
      if (result.redirected) return;
      toast.success("تم تسجيل الدخول!");
      navigate("/dashboard");
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <span className="font-black text-xl text-foreground">LeadHunter</span>
          </Link>
          <h1 className="text-2xl font-black text-foreground mb-2">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground">ادخل حسابك للوصول للداشبورد</p>
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
              placeholder="you@example.com"
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
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-base hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          ما عندك حساب؟{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            سجل مجانًا
          </Link>
        </p>

        <Link
          to="/"
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-3 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع للرئيسية
        </Link>
      </motion.div>
    </div>
  );
};

export default Login;
