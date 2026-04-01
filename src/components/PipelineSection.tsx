import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bookmark, MessageSquare, ArrowLeftRight, Clock, Phone, Copy, ChevronLeft } from "lucide-react";

const steps = [
  {
    icon: <Bookmark className="w-5 h-5" />,
    title: "احفظ الفرصة",
    desc: "شفت فرصة تهمك؟ احفظها بضغطة وحدة وارجع لها بأي وقت.",
    accent: false,
  },
  {
    icon: <ArrowLeftRight className="w-5 h-5" />,
    title: "تابع الحالة",
    desc: "حدد حالة كل فرصة: جديد، تم التواصل، مهتم، مغلق — كل شي واضح قدامك.",
    accent: false,
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "سجّل التواصل",
    desc: "واتساب، اتصال، أو نسخ — سجّل طريقة التواصل وتاريخه تلقائياً.",
    accent: true,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "ارجع وتابع",
    desc: "كل إجراء ينحفظ بوقته. ارجع لصفحة فرصي وشوف وين وقفت بالضبط.",
    accent: false,
  },
];

const statuses = [
  { label: "جديد", emoji: "🆕" },
  { label: "محفوظ", emoji: "🔖" },
  { label: "تم التواصل", emoji: "📤" },
  { label: "رد", emoji: "💬" },
  { label: "مهتم", emoji: "🔥" },
  { label: "مغلق", emoji: "✅" },
  { label: "غير مهتم", emoji: "❌" },
];

const PipelineSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block text-xs font-bold tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            PIPELINE MANAGER
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight">
            ما يكفي تشوف الفرصة…<br />
            <span className="neon-text">لازم تتابعها لين تقفلها</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            بدون متابعة، الفرصة تضيع. LeadHunter يحوّل كل فرصة إلى خطوة عملية — من الاكتشاف إلى الإغلاق.
          </p>
        </motion.div>

        {/* Before / After contrast */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-12 sm:mb-16"
        >
          <div className="glass-card rounded-xl p-5 sm:p-6 border border-destructive/20 bg-destructive/5">
            <p className="text-sm font-bold text-destructive mb-3">❌ بدون Pipeline</p>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>• تشوف الفرصة وتنساها</li>
              <li>• ما تعرف مين تواصلت معه</li>
              <li>• تضيع وقتك تكرر نفس الشغل</li>
              <li>• ما عندك صورة واضحة عن تقدمك</li>
            </ul>
          </div>
          <div className="glass-card rounded-xl p-5 sm:p-6 neon-border">
            <p className="text-sm font-bold text-primary mb-3">✅ مع LeadHunter Pipeline</p>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>• كل فرصة محفوظة ومرتبة</li>
              <li>• تعرف وين وقفت مع كل عميل</li>
              <li>• تتابع من حيث وقفت بثواني</li>
              <li>• pipeline واضح يوريك التقدم</li>
            </ul>
          </div>
        </motion.div>

        {/* Step cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-12 sm:mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card rounded-xl p-5 sm:p-6 group hover:border-primary/30 transition-all duration-300 ${
                step.accent ? "neon-border" : ""
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                step.accent
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
              } transition-colors duration-300`}>
                {step.icon}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Status flow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-5 sm:p-8 mb-12 sm:mb-16"
        >
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-4 text-center">
            حالات الفرصة — من الاكتشاف إلى الإغلاق
          </h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {statuses.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-1.5 bg-muted/50 border border-border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground"
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
                {i < statuses.length - 1 && (
                  <ChevronLeft className="w-3 h-3 text-muted-foreground mr-[-4px]" />
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> اتصال</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> واتساب</span>
            <span className="flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> نسخ</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm sm:text-base text-muted-foreground mb-5">
            ابدأ ببناء pipeline عملائك — مجانًا
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base hover:brightness-110 transition-all active:scale-[0.98]"
          >
            🚀 ابدأ الآن
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PipelineSection;
