interface Props {
  tags: string[];
  max?: number;
  size?: "sm" | "md";
}

const ReasonTags = ({ tags, max, size = "md" }: Props) => {
  const list = max ? tags.slice(0, max) : tags;
  if (list.length === 0) return null;

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5"
      : "text-xs px-2.5 py-1";

  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((t) => (
        <span
          key={t}
          className={`${sizeClasses} font-semibold rounded-full border border-primary/20 bg-primary/[0.07] text-primary/90`}
        >
          {t}
        </span>
      ))}
    </div>
  );
};

export default ReasonTags;
