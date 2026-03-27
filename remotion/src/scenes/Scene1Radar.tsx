import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Scene1Radar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweepAngle = interpolate(frame, [0, 80], [0, 720]);
  const glowIntensity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Pulse rings
  const rings = [0, 20, 40].map((delay) => {
    const progress = interpolate(Math.max(frame - delay, 0) % 40, [0, 40], [0, 1]);
    return { scale: interpolate(progress, [0, 1], [0.3, 2.5]), opacity: interpolate(progress, [0, 0.3, 1], [0, 0.6, 0]) };
  });

  // Blips appearing
  const blips = [
    { x: 200, y: -120, delay: 25 },
    { x: -180, y: 100, delay: 40 },
    { x: 120, y: 160, delay: 55 },
    { x: -100, y: -180, delay: 35 },
    { x: 250, y: 50, delay: 50 },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Concentric rings */}
      {[140, 220, 300, 380].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            border: "1px solid rgba(34,197,94,0.15)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Crosshairs */}
      <div style={{ position: "absolute", width: 760, height: 1, background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
      <div style={{ position: "absolute", width: 1, height: 760, background: "linear-gradient(transparent, rgba(34,197,94,0.15), transparent)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

      {/* Sweep arm */}
      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${sweepAngle}deg)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "conic-gradient(from 0deg, transparent 0%, rgba(34,197,94,0.25) 8%, rgba(34,197,94,0.08) 18%, transparent 28%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 2,
            height: "50%",
            transformOrigin: "bottom",
            background: "linear-gradient(to top, rgba(34,197,94,0.5), transparent)",
          }}
        />
      </div>

      {/* Pulse rings */}
      {rings.map((ring, i) => (
        <div
          key={`pulse-${i}`}
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "2px solid rgba(34,197,94,0.4)",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${ring.scale})`,
            opacity: ring.opacity * glowIntensity,
          }}
        />
      ))}

      {/* Blips */}
      {blips.map((blip, i) => {
        const s = spring({ frame: frame - blip.delay, fps, config: { damping: 12 } });
        return (
          <div
            key={`blip-${i}`}
            style={{
              position: "absolute",
              top: `calc(50% + ${blip.y}px)`,
              left: `calc(50% + ${blip.x}px)`,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow: "0 0 12px rgba(34,197,94,0.8), 0 0 30px rgba(34,197,94,0.4)",
              transform: `scale(${s})`,
              opacity: s,
            }}
          />
        );
      })}

      {/* Center dot */}
      <div
        style={{
          position: "absolute",
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "rgba(34,197,94,0.5)",
          boxShadow: "0 0 20px rgba(34,197,94,0.6), 0 0 50px rgba(34,197,94,0.2)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </AbsoluteFill>
  );
};
