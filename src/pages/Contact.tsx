import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, Phone, MessageSquare, ArrowRight, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

const Contact = () => {
  const { t } = useTranslation();
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
      toast.error(t("contact.error"));
      return;
    }

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "contact-confirmation",
        recipientEmail: form.email,
        idempotencyKey: `contact-confirm-${id}`,
        templateData: { name: form.name },
      },
    });

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "new-contact-notification",
        recipientEmail: "support@leadhunterr.com",
        idempotencyKey: `contact-notify-${id}`,
        templateData: {
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message || undefined,
        },
      },
    });

    setSending(false);
    toast.success(t("contact.success"));
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <span className="font-black text-lg text-foreground tracking-tight">LeadHunter</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {t("nav.home")}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </nav>

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
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">{t("contact.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-card border border-border rounded-2xl p-6"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {t("contact.name")}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder={t("contact.namePlaceholder")}
                className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                {t("contact.email")}
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                {t("contact.phone")}
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

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                {t("contact.messageLabel")}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder={t("contact.messagePlaceholder")}
                className="w-full bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-base hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {sending ? (
                <span className="animate-pulse">{t("contact.sending")}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t("contact.send")}
                </>
              )}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t("common.or")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <a
              href={`https://wa.me/966591405049?text=${encodeURIComponent("السلام عليكم، أبغى أشترك في LeadHunter 🚀")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[hsl(145_80%_42%)] text-white font-bold py-3.5 rounded-xl text-base hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              تواصل واتساب للاشتراك
            </a>
            <p className="text-center text-xs text-muted-foreground" dir="ltr">
              0591405049
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
