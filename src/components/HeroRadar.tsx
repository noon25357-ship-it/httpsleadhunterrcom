import { motion } from "framer-motion";

const HeroRadar = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="relative w-[420px] h-[420px] md:w-[580px] md:h-[580px] lg:w-[680px] lg:h-[680px]">
        
        {/* Ambient glow behind radar */}
        <div className="absolute inset-[15%] rounded-full bg-primary/[0.06] blur-[80px]" />

        {/* Static concentric rings */}
        {[0, 18, 32, 46].map((inset) => (
          <div
            key={inset}
            className="absolute rounded-full border border-primary/[0.12]"
            style={{ inset: `${inset}%` }}
          />
        ))}

        {/* Crosshair lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/[0.12] to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-primary/[0.12] to-transparent" />
        </div>

        {/* Radar sweep arm — smooth rotation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          {/* Sweep trail */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent 0%, hsl(145 80% 42% / 0.18) 8%, hsl(145 80% 42% / 0.06) 18%, transparent 28%)",
            }}
          />
          {/* Sweep leading edge line */}
          <div className="absolute top-0 left-1/2 -translate-x-[0.5px] w-[1px] h-1/2 origin-bottom bg-gradient-to-t from-primary/40 to-transparent" />
        </motion.div>

        {/* Expanding pulse rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute inset-[20%] rounded-full border border-primary/20"
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Detected blips */}
        {[
          { top: "28%", left: "62%", delay: 0.5 },
          { top: "55%", left: "30%", delay: 1.8 },
          { top: "38%", left: "45%", delay: 3.0 },
          { top: "65%", left: "68%", delay: 2.2 },
        ].map((blip, i) => (
          <motion.div
            key={`blip-${i}`}
            className="absolute"
            style={{ top: blip.top, left: blip.left }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1, 1, 0],
              opacity: [0, 1, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: blip.delay,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(145_80%_42%/0.6),0_0_20px_hsl(145_80%_42%/0.3)]" />
          </motion.div>
        ))}

        {/* Center core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-primary/30 shadow-[0_0_15px_hsl(145_80%_42%/0.4),0_0_40px_hsl(145_80%_42%/0.15)]" />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/50"
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroRadar;
