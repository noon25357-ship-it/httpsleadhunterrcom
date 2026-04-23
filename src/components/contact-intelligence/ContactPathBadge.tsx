import { CHANNEL_META, CONFIDENCE_META, type ContactPath } from "@/lib/contactIntelligence";

interface Props {
  path: ContactPath;
  compact?: boolean;
}

const ContactPathBadge = ({ path, compact = false }: Props) => {
  const meta = CHANNEL_META[path.channel];
  const conf = CONFIDENCE_META[path.confidence];

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-secondary/70 border border-border/60 px-2 py-0.5 rounded-md">
        <span>{meta.emoji}</span>
        <span className="truncate max-w-[120px]">{meta.shortLabel}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground bg-secondary border border-border px-2.5 py-1 rounded-lg">
        <span>{meta.emoji}</span>
        <span>{path.label}</span>
      </span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.classes}`}>
        {conf.label}
      </span>
    </div>
  );
};

export default ContactPathBadge;
