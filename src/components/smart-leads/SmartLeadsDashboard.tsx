import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SmartLeadCard from "./SmartLeadCard";
import { MOCK_SMART_LEADS } from "./types";

const SmartLeadsDashboard = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">أداة المبيعات الذكية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            حوّل الفرص إلى صفقات <span className="neon-text">بنقرة واحدة</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            اكتشف نقاط ضعف المنافسين، ولّد عروض مخصصة بالذكاء الاصطناعي، وتواصل فورًا عبر واتساب أو إيميل
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SMART_LEADS.map((lead, i) => (
            <SmartLeadCard key={lead.id} lead={lead} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartLeadsDashboard;
