import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const problems = [
  { emoji: "⏳", text: "تضيع وقت تدور عملاء يدوي" },
  { emoji: "❓", text: "ما تعرف مين فعلاً يحتاج خدمتك" },
  { emoji: "🚫", text: "تتواصل مع ناس ما عندها نية تشتري" },
  { emoji: "💸", text: "تضيع فرص لأنك ما تبدأ بالأهم" },
];

const features = [
  { title: "بحث ذكي عن ليدز", desc: "اختر المدينة والفئة → يطلع لك بزنسات بدون مواقع جاهزة للتواصل" },
  { title: "Lead Scoring تلقائي", desc: "نرتب لك أفضل الفرص بناءً على التقييم وعدد المراجعات ووجود رقم تواصل" },
  { title: "لوحة تحكم بسيطة", desc: "جدول لليدز مع فلترة وتحديد حالة التواصل — كل شي واضح" },
  { title: "تصدير CSV + نسخ", desc: "حمّل الليدز كملف CSV أو انسخها مباشرة للاستخدام الفوري" },
];

const audience = [
  { emoji: "🎨", text: "مصممين مواقع" },
  { emoji: "📢", text: "مسوقين" },
  { emoji: "🏢", text: "وكالات" },
  { emoji: "💻", text: "فريلانسرز" },
  { emoji: "🛠", text: "أصحاب خدمات" },
  { emoji: "🚀", text: "أي شخص يبحث عن عملاء" },
];

const plans = [
  {
    name: "مجاني",
    price: "0 ر.س",
    features: ["3 عمليات بحث شهريًا", "بحث أساسي", "حفظ الليدز", "Lead Scoring"],
    cta: "ابدأ مجانًا",
    href: "https://leadhunterr.com/register",
    highlight: false,
  },
  {
    name: "أساسي",
    price: "49 ر.س / شهر",
    features: ["100 عملية بحث شهريًا", "تصدير CSV", "Lead Scoring متقدم", "فلترة متقدمة"],
    cta: "تواصل معنا",
    href: "/contact",
    internal: true,
    highlight: true,
  },
  {
    name: "برو",
    price: "149 ر.س / شهر",
    features: ["بحث غير محدود", "Google Sheets", "أولوية في النتائج", "دعم مباشر"],
    cta: "تواصل معنا",
    href: "/contact",
    internal: true,
    highlight: false,
  },
];

const LandingSections = () => {
  return (
    <div className="bg-background">
      {/* Problem Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl sm:text-2xl md:text-3xl font-black text-center text-foreground mb-8 sm:mb-12 leading-tight"
        >
          المشكلة مو في السوق… <span className="neon-text">المشكلة في الوصول له</span>
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
            >
              <span className="text-xl sm:text-2xl">{p.emoji}</span>
              <p className="text-sm sm:text-base text-foreground font-medium">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2 sm:mb-3">
            LeadHunter <span className="neon-text">يختصر عليك الطريق</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-2">بدل البحث العشوائي، النظام يجيب لك بزنسات جاهزة تحتاج خدماتك الآن</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 sm:p-6 hover:neon-border transition-shadow duration-300"
            >
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 sm:mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl sm:text-2xl md:text-3xl font-black text-center text-foreground mb-6 sm:mb-10"
        >
          لمن هذا المنتج؟
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {audience.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-foreground"
            >
              <span>{a.emoji}</span>
              <span>{a.text}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Value Prop */}
      <section className="max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl neon-border p-5 sm:p-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2 sm:mb-3">
            مو مجرد ليدز… <span className="neon-text">قرار جاهز</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            LeadHunter ما يعطيك بيانات فقط — يعطيك أفضل الفرص عشان تبدأ البيع مباشرة
          </p>
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xl sm:text-2xl md:text-3xl font-black text-center text-foreground mb-6 sm:mb-10"
        >
          خطط بسيطة تناسبك
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card rounded-xl p-5 sm:p-6 flex flex-col ${plan.highlight ? "neon-border-strong" : ""}`}
            >
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-xl sm:text-2xl font-black neon-text mb-3 sm:mb-4">{plan.price}</p>
              <ul className="space-y-2 mb-5 sm:mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {(plan as any).internal ? (
                <Link
                  to={plan.href}
                  className={`w-full text-center py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] block ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:brightness-110"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <a
                  href={plan.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] block ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:brightness-110"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.cta}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground mb-2 sm:mb-3">
            ابدأ بأبسط شيء الناس تدفع عليه
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">جرّب LeadHunter وابدأ تجيب عملاء اليوم</p>
          <a
            href="https://leadhunterr.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:brightness-110 transition-all active:scale-[0.98]"
          >
            👉 ابدأ مجانًا
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingSections;
