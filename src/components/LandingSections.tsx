import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LandingSections = () => {
  const { t } = useTranslation();

  const problems = [
    { emoji: "⏳", text: t("landing.problems.p1") },
    { emoji: "❓", text: t("landing.problems.p2") },
    { emoji: "🚫", text: t("landing.problems.p3") },
    { emoji: "💸", text: t("landing.problems.p4") },
  ];

  const features = [
    { title: t("landing.features.f1Title"), desc: t("landing.features.f1Desc") },
    { title: t("landing.features.f2Title"), desc: t("landing.features.f2Desc") },
    { title: t("landing.features.f3Title"), desc: t("landing.features.f3Desc") },
    { title: t("landing.features.f4Title"), desc: t("landing.features.f4Desc") },
  ];

  const audience = [
    { emoji: "🎨", text: t("landing.audience.a1") },
    { emoji: "📢", text: t("landing.audience.a2") },
    { emoji: "🏢", text: t("landing.audience.a3") },
    { emoji: "💻", text: t("landing.audience.a4") },
    { emoji: "🛠", text: t("landing.audience.a5") },
    { emoji: "🚀", text: t("landing.audience.a6") },
  ];

  const plans = [
    {
      name: t("landing.plans.free"),
      price: t("landing.plans.freePrice"),
      tagline: t("landing.plans.freeTagline"),
      features: [t("landing.plans.freeF1"), t("landing.plans.freeF2"), t("landing.plans.freeF3"), t("landing.plans.freeF4")],
      cta: t("landing.plans.ctaFree"),
      href: "/register",
      highlight: false,
    },
    {
      name: t("landing.plans.basic"),
      price: t("landing.plans.basicPrice"),
      tagline: t("landing.plans.basicTagline"),
      features: [t("landing.plans.basicF1"), t("landing.plans.basicF2"), t("landing.plans.basicF3"), t("landing.plans.basicF4")],
      cta: t("landing.plans.ctaSubscribe"),
      href: "/register",
      highlight: true,
    },
    {
      name: t("landing.plans.pro"),
      price: t("landing.plans.proPrice"),
      tagline: t("landing.plans.proTagline"),
      features: [t("landing.plans.proF1"), t("landing.plans.proF2"), t("landing.plans.proF3"), t("landing.plans.proF4")],
      cta: t("landing.plans.ctaSubscribe"),
      href: "/register",
      highlight: false,
    },
  ];

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
          {t("landing.problemTitle1")} <span className="neon-text">{t("landing.problemTitle2")}</span>
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
            {t("landing.featuresTitle1")} <span className="neon-text">{t("landing.featuresTitle2")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-2">{t("landing.featuresSubtitle")}</p>
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
          {t("landing.audienceTitle")}
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
            {t("landing.valueTitle1")} <span className="neon-text">{t("landing.valueTitle2")}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("landing.valueDesc")}
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
          {t("landing.pricingTitle")}
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
              <p className="text-xl sm:text-2xl font-black neon-text mb-1 sm:mb-2">{plan.price}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{plan.tagline}</p>
              <ul className="space-y-2 mb-5 sm:mb-6 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="text-primary">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
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
            {t("landing.footerTitle")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">{t("landing.footerSubtitle")}</p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:brightness-110 transition-all active:scale-[0.98]"
          >
            {t("landing.footerCta")}
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingSections;
