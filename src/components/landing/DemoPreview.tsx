import { motion } from "framer-motion";
import { Play } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const DemoPreview = () => {
  return (
    <SectionWrapper id="demo" className="py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="text-sm font-medium text-primary mb-3">شاهد بنفسك</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
          كيف يشتغل LeadHunter؟
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl border border-border bg-card overflow-hidden aspect-video max-w-4xl mx-auto"
      >
        {/* Placeholder — replace with actual screenshot or video */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Play className="w-7 h-7 text-primary ms-1" />
          </div>
          <p className="text-sm text-muted-foreground">عرض توضيحي قريبًا</p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default DemoPreview;
