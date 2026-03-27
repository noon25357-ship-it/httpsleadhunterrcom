import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden gradient-mesh">
      {/* Radar */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/10"
              style={{
                animation: `pulse-ring ${2 + i * 0.5}s cubic-bezier(0.4,0,0.6,1) infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, hsl(145 80% 42% / 0.12) 30%, transparent 40%)",
              animation: "radar-sweep 3s linear infinite",
            }}
          />
          <div className="absolute inset-[45%] rounded-full bg-primary/30 blur-sm" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            اصطاد عملاءك
            <span className="neon-text block mt-2">قبل منافسيك</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            اكتشف الأنشطة التجارية اللي ما عندها مواقع إلكترونية وتواصل معهم فوراً
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          {["بدون موقع = فرصة لك", "تواصل فوري", "نتائج ذكية"].map((tag) => (
            <span key={tag} className="px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground border border-border">
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
