import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const EmailCapture = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(t("emailCapture.thanks"));
    setEmail("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto glass-card rounded-2xl p-6 text-center neon-border"
    >
      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
        <Mail className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{t("emailCapture.title")}</h3>
      <p className="text-sm text-muted-foreground mb-5">{t("emailCapture.subtitle")}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          dir="ltr"
          className="flex-1 bg-secondary text-foreground rounded-xl px-4 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          required
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("emailCapture.submit")}
        </button>
      </form>
    </motion.div>
  );
};

export default EmailCapture;
