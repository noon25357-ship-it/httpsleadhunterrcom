import { Gauge, Smartphone } from "lucide-react";

interface HealthAuditProps {
  speedScore: number;
  mobileScore: number;
}

const getBarColor = (score: number) => {
  if (score <= 39) return "bg-red-500";
  if (score <= 69) return "bg-yellow-500";
  return "bg-primary";
};

const getTextColor = (score: number) => {
  if (score <= 39) return "text-red-400";
  if (score <= 69) return "text-yellow-400";
  return "text-primary";
};

const HealthAudit = ({ speedScore, mobileScore }: HealthAuditProps) => (
  <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-3">
    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
      🔍 الفحص التقني
    </p>
    <div className="space-y-2.5">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Gauge className="w-3 h-3" /> سرعة الموقع
          </span>
          <span className={`text-[11px] font-bold ${getTextColor(speedScore)}`}>{speedScore}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${getBarColor(speedScore)}`} style={{ width: `${speedScore}%` }} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> توافق الجوال
          </span>
          <span className={`text-[11px] font-bold ${getTextColor(mobileScore)}`}>{mobileScore}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${getBarColor(mobileScore)}`} style={{ width: `${mobileScore}%` }} />
        </div>
      </div>
    </div>
  </div>
);

export default HealthAudit;
