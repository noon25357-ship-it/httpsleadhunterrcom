import { motion } from "framer-motion";
import HeroRadar from "./HeroRadar";

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden gradient-mesh pt-14">
      <HeroRadar />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/[0.08] text-primary text-sm font-medium mb-6"
        >
          ⚡ منتج سعودي 100%
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight text-foreground">
            خل العملاء يجونك…
            <span className="neon-text block mt-2">بدل ما تدور عليهم</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            LeadHunter يجيب لك بزنسات بدون مواقع إلكترونية، ويرتب لك أفضل الفرص عشان تبدأ البيع مباشرة
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-3 justify-center"
        >
          <a
            href="https://leadhunterr.com/register"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl text-lg hover:brightness-110 transition-all animate-pulse-neon"
          >
            👉 ابدأ مجانًا
          </a>
          <a
            href="#search"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-8 py-4 rounded-xl text-lg hover:bg-secondary/80 transition-all border border-border"
          >
            👉 جرّب البحث
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
