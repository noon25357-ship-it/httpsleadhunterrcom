import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MailX, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid" | "success" | "error">("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("used");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) {
        setStatus("error");
      } else if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("used");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
          <span className="font-black text-xl text-foreground">LeadHunter</span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">جاري التحقق...</p>
            </>
          )}

          {status === "valid" && (
            <>
              <MailX className="w-10 h-10 text-primary mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">إلغاء الاشتراك</h1>
              <p className="text-sm text-muted-foreground mb-6">
                هل تريد إلغاء اشتراكك من إيميلات LeadHunter؟
              </p>
              <button
                onClick={handleUnsubscribe}
                disabled={processing}
                className="w-full bg-destructive text-destructive-foreground font-bold py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-60"
              >
                {processing ? "جاري المعالجة..." : "تأكيد إلغاء الاشتراك"}
              </button>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">تم إلغاء الاشتراك</h1>
              <p className="text-sm text-muted-foreground">
                لن تتلقى إيميلات منا بعد الآن.
              </p>
            </>
          )}

          {status === "used" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">تم الإلغاء مسبقًا</h1>
              <p className="text-sm text-muted-foreground">
                اشتراكك ملغي بالفعل.
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">رابط غير صالح</h1>
              <p className="text-sm text-muted-foreground">
                الرابط غير صحيح أو منتهي الصلاحية.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">حصل خطأ</h1>
              <p className="text-sm text-muted-foreground">
                حاول مرة ثانية لاحقًا.
              </p>
            </>
          )}
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع للرئيسية
        </Link>
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
