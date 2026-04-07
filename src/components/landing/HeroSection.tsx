import { motion } from "framer-motion";
import CTAButton from "./CTAButton";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />

      <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] text-primary text-xs sm:text-sm font-medium mb-6"
        >
          لعيادات الأسنان، الجلدية، والتجميل
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight text-foreground"
        >
          مرضى يبحثون عن عيادتك الحين
          <span className="block mt-2 text-primary">وصّلهم قبل لا يحجزون عند غيرك</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8"
        >
          نكتشف لك الأشخاص اللي يبحثون عن طبيب أسنان أو جلدية أو تجميل في مدينتك — ونعطيك أرقامهم جاهزة للتواصل
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <CTAButton href="/register">جرّب مجانًا — بدون بطاقة</CTAButton>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
