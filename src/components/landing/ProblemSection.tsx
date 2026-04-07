import { motion } from "framer-motion";
import { Banknote, UserX, Clock, TrendingDown } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const problems = [
  {
    icon: Banknote,
    title: "تصرف على إعلانات — والنتيجة؟ مواعيد فاضية",
    text: "تدفع لقوقل وإنستقرام وما تعرف هل اللي شاف الإعلان فعلاً يبحث عن طبيب أسنان أو بس يتصفح",
  },
  {
    icon: UserX,
    title: "مريض يبحث عن عيادة جلدية — ويحجز عند المنافس",
    text: "ما عندك طريقة تعرف مين اللي يبحث عن تخصصك في مدينتك الحين — فالمنافس يوصله أول",
  },
  {
    icon: Clock,
    title: "تضيع وقتك تتواصل مع ناس مو مهتمة",
    text: "ترسل عروض تبييض أو فيلر للكل — بدل ما تركز على اللي فعلاً يدور هالخدمة الحين",
  },
  {
    icon: TrendingDown,
    title: "الكرسي فاضي — والإيجار يمشي",
    text: "كل يوم بدون مرضى جدد يعني خسارة. والانتظار مو استراتيجية",
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
          كل يوم فيه مرضى يبحثون عن عيادة —{" "}
          <span className="text-primary">وما يلاقونك</span>
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
