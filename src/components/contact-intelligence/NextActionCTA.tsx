import { ArrowRight, Zap } from "lucide-react";

interface Props {
  action: string;
  href?: string;
  onClick?: () => void;
}

const NextActionCTA = ({ action, href, onClick }: Props) => {
  const content = (
    <>
      <span className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <span>{action}</span>
      </span>
      <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
    </>
  );

  const className =
    "group w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:brightness-110 hover:shadow-[0_0_20px_hsl(var(--primary)/0.35)] transition-all active:scale-[0.98]";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default NextActionCTA;
