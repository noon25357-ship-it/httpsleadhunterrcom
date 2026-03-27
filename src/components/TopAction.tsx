import { motion } from "framer-motion";
import { Zap, MessageCircle } from "lucide-react";
import type { Lead } from "@/lib/leadData";
import { getDefaultMessage } from "@/lib/leadData";

interface TopActionProps {
  leads: Lead[];
}

const TopAction = ({ leads }: TopActionProps) => {
  const topLeads = leads.filter((l) => l.label === "hot").slice(0, 5);
  if (topLeads.length === 0) return null;

  const message = getDefaultMessage("website", "friendly");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl neon-border-strong p-5 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/15">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">تواصل مع أفضل {topLeads.length} الآن</h3>
          <p className="text-xs text-muted-foreground">فرص ساخنة جاهزة للتواصل</p>
        </div>
      </div>
      <div className="space-y-2">
        {topLeads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-2.5">
            <div>
              <span className="font-medium text-sm text-foreground">{lead.name}</span>
              <span className="text-xs text-muted-foreground mr-2">{lead.phone}</span>
            </div>
            <a
              href={`https://wa.me/966${lead.phone.slice(1)}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TopAction;
