import { motion } from "framer-motion";
import { Clock, HelpCircle, UserX, TrendingDown } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const problems = [
  {
    icon: Clock,
    title: "وقت ضائع",
    text: "تقضي ساعات تبحث عن عملاء يدويًا بدون نتيجة واضحة",
  },
  {
    icon: HelpCircle,
    title: "بدون بيانات",
    text: "ما تعرف مين فعلاً يحتاج خدمتك ومين مضيعة وقت",
  },
  {
    icon: UserX,
    title: "تواصل عشوائي",
    text: "تتواصل مع ناس ما عندها نية تشتري — وتحس بالإحباط",
  },
  {
    icon: TrendingDown,
    title: "فرص ضائعة",
    text: "تضيع فرص حقيقية لأنك ما تبدأ بالأهم أولًا",
  },
];

const ProblemSection = () => {
  return (
    <SectionWrapper id="problem">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground leading-tight">
          المشكلة مو في السوق…{" "}
          <span className="text-primary">المشكلة في الوصول له</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {problems.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <p.icon className="w-5 h-5 text-destructive/70" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ProblemSection;
