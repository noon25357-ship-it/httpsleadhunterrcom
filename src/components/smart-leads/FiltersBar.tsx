import { Filter } from "lucide-react";
import type { PipelineStatus } from "./types";
import { PIPELINE_STATUSES } from "./types";

export interface Filters {
  city: string;
  websiteStatus: string;
  scoreRange: string;
  pipelineStatus: string;
}

interface FiltersBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FiltersBar = ({ filters, onChange }: FiltersBarProps) => {
  const set = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });

  const selectClass = "bg-muted/50 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
      <select value={filters.city} onChange={e => set('city', e.target.value)} className={selectClass}>
        <option value="">كل المدن</option>
        {{['الرياض', 'جدة', 'مكة', 'الدمام', 'المدينة المنورة'].map(c => <option key={c} value={c}>{c}</option>)}.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filters.websiteStatus} onChange={e => set('websiteStatus', e.target.value)} className={selectClass}>
        <option value="">حالة الموقع</option>
        <option value="no-website">بدون موقع</option>
        <option value="weak-website">موقع ضعيف</option>
        <option value="has-website">يوجد موقع</option>
      </select>
      <select value={filters.scoreRange} onChange={e => set('scoreRange', e.target.value)} className={selectClass}>
        <option value="">كل الفرص</option>
        <option value="high">فرصة قوية (70+)</option>
        <option value="medium">فرصة متوسطة (40-69)</option>
        <option value="low">فرصة ضعيفة (&lt;40)</option>
      </select>
      <select value={filters.pipelineStatus} onChange={e => set('pipelineStatus', e.target.value)} className={selectClass}>
        <option value="">كل الحالات</option>
        {Object.entries(PIPELINE_STATUSES).map(([key, val]) => (
          <option key={key} value={key}>{val.emoji} {val.label}</option>
        ))}
      </select>
    </div>
  );
};

export default FiltersBar;
