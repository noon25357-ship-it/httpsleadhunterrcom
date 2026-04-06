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
    question: "كيف يشتغل LeadHunter؟",
    answer: "تختار المدينة والفئة المستهدفة، والنظام يبحث عن أنشطة تجارية تحتاج خدماتك — ويعطيك بياناتها مع تقييم لكل فرصة عشان تبدأ بالأفضل.",
  },
  {
    question: "هل أحتاج خبرة تقنية؟",
    answer: "أبدًا. الواجهة بسيطة وواضحة — تبحث، تشوف النتائج، وتبدأ تتواصل. ما تحتاج أي خلفية تقنية.",
  },
  {
    question: "هل البيانات دقيقة ومحدّثة؟",
    answer: "نعم. نعتمد على مصادر بيانات موثوقة ونحدّثها باستمرار عشان تضمن إنك تتواصل مع أنشطة فعلية وقائمة.",
  },
  {
    question: "هل فيه خطة مجانية؟",
    answer: "نعم! تقدر تبدأ مجانًا بـ 3 عمليات بحث شهريًا — بدون بطاقة ائتمان. لو حبيت تزيد، فيه خطط مرنة تناسب احتياجك.",
  },
  {
    question: "مين المستهدف من هذا المنتج؟",
    answer: "مصممين مواقع، مسوقين، وكالات، فريلانسرز، وأي شخص يقدم خدمات ويبحث عن عملاء جدد بشكل مستمر.",
  },
  {
    question: "كيف أقدر أتواصل مع العملاء؟",
    answer: "كل فرصة فيها بيانات التواصل جاهزة — رقم جوال، واتساب، أو إيميل. وتقدر تنسخ رسالة جاهزة للتواصل المباشر.",
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
