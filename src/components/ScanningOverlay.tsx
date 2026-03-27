import { motion } from "framer-motion";

const ScanningOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-20 gap-6"
  >
    <div className="relative w-28 h-28">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          style={{
            animation: `pulse-ring ${1.5 + i * 0.4}s cubic-bezier(0.4,0,0.6,1) infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent 0%, hsl(145 80% 42% / 0.2) 25%, transparent 35%)",
          animation: "radar-sweep 1.5s linear infinite",
        }}
      />
      <div className="absolute inset-[40%] rounded-full bg-primary/40 blur-sm" />
    </div>
    <p className="text-muted-foreground font-medium animate-pulse">جاري مسح الفرص...</p>
  </motion.div>
);

export default ScanningOverlay;
