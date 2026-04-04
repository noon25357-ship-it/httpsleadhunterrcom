import { MessageCircle, Mail } from "lucide-react";
import type { SmartLead } from "./types";

interface QuickActionsProps {
  lead: SmartLead;
  message: string;
}

const QuickActions = ({ lead, message }: QuickActionsProps) => {
  const phone = lead.phone ? `966${lead.phone.slice(1)}` : "";
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const mailSubject = encodeURIComponent(`اقتراح لتحسين حضور ${lead.businessName} الرقمي`);
  const mailBody = encodeURIComponent(message);
  const mailUrl = `mailto:${lead.email || ""}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[hsl(145_80%_42%/0.15)] text-primary text-xs font-bold hover:bg-[hsl(145_80%_42%/0.25)] transition-colors active:scale-[0.98]"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        واتساب
      </a>
      <a
        href={mailUrl}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 text-xs font-bold hover:bg-blue-500/25 transition-colors active:scale-[0.98]"
      >
        <Mail className="w-3.5 h-3.5" />
        إيميل
      </a>
    </div>
  );
};

export default QuickActions;
