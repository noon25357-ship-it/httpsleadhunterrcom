import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSending(true);

    const id = crypto.randomUUID();
    const { error } = await supabase.from("contact_requests").insert({
      id,
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
    });

    if (error) {
      setSending(false);
      toast.error("حصل خطأ، حاول مرة ثانية");
      return;
    }

    // Send confirmation email
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "contact-confirmation",
        recipientEmail: form.email,
        idempotencyKey: `contact-confirm-${id}`,
        templateData: { name: form.name },
      },
    });

    setSending(false);
    toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريبًا ⚡");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

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
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            الرئيسية
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Form Section */}
      <div className="pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">تواصل معنا</h1>
            <p className="text-sm text-muted-foreground">
              مهتم بالاشتراك؟ اترك بياناتك وسنتواصل معك
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-card border border-border rounded-2xl p-6"
          >
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                الاسم الكامل
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="مثال: محمد العتيبي"
                className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                البريد الإلكتروني
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={255}
                dir="ltr"
                placeholder="email@example.com"
                className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                رقم الجوال
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                maxLength={15}
                dir="ltr"
                placeholder="05XXXXXXXX"
                className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                رسالتك (اختياري)
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="اكتب استفسارك أو الباقة اللي تبيها..."
                className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-base hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {sending ? (
                <span className="animate-pulse">جاري الإرسال...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  أرسل الطلب
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
