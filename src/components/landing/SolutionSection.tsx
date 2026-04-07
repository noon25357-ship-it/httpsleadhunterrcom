import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const points = [
  "نكتشف أشخاص يبحثون عن طبيب أسنان أو جلدية أو تجميل في مدينتك",
  "نرتّبهم حسب جديّتهم — تبدأ باللي أقرب للحجز",
  "تتواصل معهم مباشرة برسالة واتساب أو اتصال",
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
          <p className="text-sm font-medium text-primary mb-3">كيف يشتغل</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-4 leading-tight">
            من الكرسي الفاضي إلى جدول حجوزات ممتلئ
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            بدل ما تنتظر المريض يجيك من الإعلان، LeadHunter يوصّلك لناس تبحث عن عيادتك الحين.
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
            {["اكتشاف المرضى", "ترتيب بالجديّة", "تواصل مباشر"].map((step, i) => (
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
