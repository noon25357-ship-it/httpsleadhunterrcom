import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SectionWrapper from "./SectionWrapper";

const faqs = [
  {
    question: "كيف LeadHunter يجيب مرضى لعيادتي؟",
    answer: "نكتشف أشخاص في مدينتك يبحثون عن طبيب أسنان أو جلدية أو تجميل — ونعطيك أرقامهم مع تقييم جديّة لكل واحد. تبدأ بالأجدّ وتتواصل مباشرة.",
  },
  {
    question: "هل يشتغل مع تخصص عيادتي؟",
    answer: "أسنان، جلدية، تجميل، ليزر، أو أي تخصص طبي. تختار تخصصك ومدينتك — والنتائج تطلع خلال ثواني.",
  },
  {
    question: "هل أحتاج فريق تسويق أو خبرة تقنية؟",
    answer: "لا. أنت أو موظف الاستقبال تقدرون تستخدمونه. تختار المدينة والتخصص → تشوف المرضى المحتملين → ترسل رسالة واتساب. بس.",
  },
  {
    question: "كيف هي أدق من إعلانات قوقل؟",
    answer: "الإعلان يوصل للكل — المهتم وغير المهتم. LeadHunter يعطيك بس الناس اللي فعلاً تبحث عن عيادة الحين، مع تقييم جديّة لكل واحد.",
  },
  {
    question: "كم التكلفة؟",
    answer: "تبدأ مجانًا بـ 3 عمليات بحث شهريًا — بدون بطاقة ائتمان. لو حبيت أكثر، فيه خطط تبدأ من 49 ريال شهريًا.",
  },
  {
    question: "كيف أتواصل مع المرضى المحتملين؟",
    answer: "كل نتيجة فيها رقم جوال وواتساب. تضغط زر — تنرسل رسالة مخصصة جاهزة. ما تحتاج تكتب شي.",
  },
];

const FAQSection = () => {
  return (
    <SectionWrapper id="faq">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-sm font-medium text-primary mb-3">أسئلة شائعة</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
          عندك سؤال؟
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl mx-auto"
      >
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border rounded-xl px-5 data-[state=open]:border-primary/20"
            >
              <AccordionTrigger className="text-sm sm:text-base font-bold text-foreground hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </SectionWrapper>
  );
};

export default FAQSection;
