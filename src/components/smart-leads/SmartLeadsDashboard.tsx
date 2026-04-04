import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SmartLeadCard from "./SmartLeadCard";
import DashboardStats from "./DashboardStats";
import FiltersBar, { type Filters } from "./FiltersBar";
import { MOCK_SMART_LEADS, type SmartLead } from "./types";

const SmartLeadsDashboard = () => {
  const [leads, setLeads] = useState<SmartLead[]>(MOCK_SMART_LEADS);
  const [filters, setFilters] = useState<Filters>({ city: '', websiteStatus: '', scoreRange: '', pipelineStatus: '' });

  const handleUpdate = (updated: SmartLead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (filters.city && l.city !== filters.city) return false;
      if (filters.websiteStatus && l.websiteStatus !== filters.websiteStatus) return false;
      if (filters.pipelineStatus && l.pipelineStatus !== filters.pipelineStatus) return false;
      if (filters.scoreRange === 'high' && l.opportunityScore < 70) return false;
      if (filters.scoreRange === 'medium' && (l.opportunityScore < 40 || l.opportunityScore >= 70)) return false;
      if (filters.scoreRange === 'low' && l.opportunityScore >= 40) return false;
      return true;
    });
  }, [leads, filters]);

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">أداة المبيعات الذكية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
            حوّل الفرص إلى صفقات <span className="neon-text">بنقرة واحدة</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            اكتشف، تابع، وأغلق الصفقات من مكان واحد
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-6">
          <DashboardStats leads={leads} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FiltersBar filters={filters} onChange={setFilters} />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead, i) => (
            <SmartLeadCard key={lead.id} lead={lead} index={i} onUpdate={handleUpdate} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            لا توجد فرص تطابق الفلاتر المحددة
          </div>
        )}
      </div>
    </section>
  );
};

export default SmartLeadsDashboard;
