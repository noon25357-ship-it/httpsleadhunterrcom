import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const points = [
  "يكتشف الأنشطة التجارية اللي تحتاج خدماتك تلقائيًا",
  "يرتّب الفرص حسب الأولوية — تبدأ بالأفضل دائمًا",
  "يعطيك بيانات جاهزة للتواصل المباشر",
];

const SolutionSection = () => {
  return (
    <SectionWrapper id="solution" className="py-12 sm:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-primary mb-3">الحل</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4 leading-tight">
            LeadHunter يختصر عليك الطريق
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            بدل البحث العشوائي، النظام يجيب لك أنشطة تجارية جاهزة تحتاج خدماتك الآن — مرتبة ومصنّفة.
          </p>
          <ul className="space-y-3">
            {points.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                {point}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card border border-border rounded-2xl p-8 sm:p-10"
        >
          <div className="space-y-4">
            {["بحث ذكي", "تصنيف تلقائي", "تواصل فوري"].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default SolutionSection;
