import { motion } from "framer-motion";
import HeroRadar from "./HeroRadar";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden gradient-mesh pt-16">
      <HeroRadar />

      <div className="relative z-10 text-center px-5 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-primary/30 bg-primary/[0.08] text-primary text-xs sm:text-sm font-medium mb-5 sm:mb-6"
        >
          ⚡ منتج سعودي 100%
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-5 leading-tight text-foreground">
            اكتشف أنشطة تجارية تحتاج خدماتك
            <span className="neon-text block mt-1 sm:mt-2">وابدأ التواصل معها برسائل جاهزة بالذكاء الاصطناعي</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
            LeadHunter يبحث لك في Google Maps، يرتب الفرص المناسبة، ويجهز لك رسالة تواصل خلال دقائق.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <a
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:brightness-110 transition-all animate-pulse-neon"
          >
            👉 ابدأ مجانًا
          </a>
          <a
            href="#search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:bg-secondary/80 transition-all border border-border"
          >
            👉 جرّب البحث
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
