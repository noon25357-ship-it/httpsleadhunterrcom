import { motion } from "framer-motion";
import HeroRadar from "./HeroRadar";

const HeroSection = () => {
  return (
    <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden gradient-mesh">
      <HeroRadar />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight text-foreground">
            هذي بزنسات تحتاج
            <span className="neon-text block mt-2">خدماتك الآن</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            نطلع لك بزنسات بدون موقع — جاهزة تتواصل معها وتبدأ البيع
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <a
            href="#search"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl text-lg hover:brightness-110 transition-all animate-pulse-neon"
          >
            👉 ابدأ البحث الآن
          </a>
          <p className="text-sm text-muted-foreground mt-3 opacity-70">
            بدون تسجيل — جرّب مباشرة
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
