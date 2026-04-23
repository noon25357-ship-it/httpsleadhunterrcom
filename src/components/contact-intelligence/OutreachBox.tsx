import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  message: string;
  onChange?: (val: string) => void;
}

const OutreachBox = ({ message, onChange }: Props) => {
  const [copied, setCopied] = useState(false);
  const [value, setValue] = useState(message);

  // Keep external prop in sync if it changes (e.g. lead switch)
  if (message !== value && !onChange) {
    setValue(message);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Message copied");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        rows={5}
        dir="auto"
        className="w-full bg-secondary/60 rounded-xl p-3 text-sm leading-relaxed text-foreground resize-none border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      <button
        onClick={handleCopy}
        className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-secondary transition-colors active:scale-[0.98]"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-primary" /> Copied
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copy message
          </>
        )}
      </button>
    </div>
  );
};

export default OutreachBox;
