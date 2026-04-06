import { Search, BarChart3, LayoutDashboard } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import FeatureCard from "./FeatureCard";
import { motion } from "framer-motion";

const features = [
  {
    icon: Search,
    title: "بحث ذكي عن ليدز",
    description: "اختر المدينة والفئة — النظام يجيب لك أنشطة تجارية جاهزة للتواصل مع تقييم لكل فرصة",
  },
  {
    icon: BarChart3,
    title: "تقييم تلقائي للفرص",
    description: "نرتب لك الفرص بناءً على التقييمات والمراجعات ووجود بيانات تواصل — تبدأ بالأفضل",
  },
  {
    icon: LayoutDashboard,
    title: "لوحة تحكم بسيطة",
    description: "تابع فرصك، حدد حالة التواصل، وصدّر البيانات — كل شي واضح في مكان واحد",
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
        <p className="text-sm font-medium text-primary mb-3">المميزات</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">
          كل اللي تحتاجه في مكان واحد
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
