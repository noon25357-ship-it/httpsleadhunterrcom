import type { PipelineStatus } from "./types";
import { PIPELINE_STATUSES } from "./types";

interface LeadPipelineBadgeProps {
  status: PipelineStatus;
  onChange?: (status: PipelineStatus) => void;
}

const LeadPipelineBadge = ({ status, onChange }: LeadPipelineBadgeProps) => {
  const config = PIPELINE_STATUSES[status];

  if (!onChange) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.color}`}>
        {config.emoji} {config.label}
      </span>
    );
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as PipelineStatus)}
      className={`appearance-none cursor-pointer px-2 py-1 rounded-full text-[10px] font-bold border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary ${config.color}`}
    >
      {Object.entries(PIPELINE_STATUSES).map(([key, val]) => (
        <option key={key} value={key} className="bg-card text-foreground">
          {val.emoji} {val.label}
        </option>
      ))}
    </select>
  );
};

export default LeadPipelineBadge;
