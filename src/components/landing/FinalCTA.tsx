import { motion } from "framer-motion";
import CTAButton from "./CTAButton";

const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent" />

      <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3">
            كل يوم بدون مرضى جدد — يوم خسارة
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            ابدأ الحين وشوف أول مرضى محتملين في مدينتك خلال دقيقة — مجانًا وبدون بطاقة
          </p>
          <CTAButton href="/register">جرّب مجانًا الآن</CTAButton>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
