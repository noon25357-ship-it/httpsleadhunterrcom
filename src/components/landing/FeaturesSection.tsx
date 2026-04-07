import { Users, BarChart3, MessageCircle } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import FeatureCard from "./FeatureCard";
import { motion } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "قائمة مرضى محتملين جاهزة",
    description: "كل بحث يعطيك أشخاص يبحثون عن عيادة أسنان أو جلدية أو تجميل في منطقتك — مع أرقامهم",
  },
  {
    icon: BarChart3,
    title: "تعرف مين يحجز ومين يتصفح",
    description: "كل شخص عليه تقييم جديّة — تركز وقتك على اللي فعلاً يبحث عن موعد مو بس يتصفح",
  },
  {
    icon: MessageCircle,
    title: "رسالة واتساب جاهزة — ترسلها بضغطة",
    description: "رسالة مخصصة لكل مريض محتمل — ما تحتاج تكتب من الصفر. اضغط وأرسل",
  },
];

const FeaturesSection = () => {
  return (
    <SectionWrapper id="features">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-sm font-medium text-primary mb-3">النتائج</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
          مرضى جدد كل أسبوع — بدون ما تصرف على إعلانات
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {features.map((feature, i) => (
          <FeatureCard
            key={i}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={i}
          />
        ))}
      </div>
    </SectionWrapper>
  );
};

export default FeaturesSection;
