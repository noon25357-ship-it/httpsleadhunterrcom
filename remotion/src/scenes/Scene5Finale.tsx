import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const Scene5Finale = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const tagOp = spring({ frame: frame - 15, fps, config: { damping: 20 } });
  const tagY = interpolate(tagOp, [0, 1], [20, 0]);
  const ctaScale = spring({ frame: frame - 35, fps, config: { damping: 10 } });
  const urlOp = spring({ frame: frame - 50, fps, config: { damping: 20 } });

  // Breathing glow
  const glowSize = interpolate(Math.sin(frame * 0.07), [-1, 1], [350, 550]);
  const glowOp = interpolate(Math.sin(frame * 0.07), [-1, 1], [0.1, 0.2]);

  // Particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: 960 + Math.cos(i * 0.52 + frame * 0.02) * (250 + i * 20),
    y: 540 + Math.sin(i * 0.52 + frame * 0.02) * (150 + i * 15),
    size: 3 + (i % 3),
    op: 0.15 + (i % 4) * 0.05,
  }));

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #0d1f12 0%, #060d08 50%, #020503 100%)" }}>
      {/* Floating particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: "50%",
          background: "#22c55e", opacity: p.op,
          boxShadow: `0 0 ${p.size * 3}px rgba(34,197,94,0.4)`,
        }} />
      ))}

      {/* Central glow */}
      <div style={{
        position: "absolute", left: "50%", top: "45%",
        transform: "translate(-50%, -50%)",
        width: glowSize, height: glowSize, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(34,197,94,${glowOp}) 0%, transparent 70%)`,
      }} />

      {/* Content */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, #22c55e, #15803d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
            boxShadow: "0 0 40px rgba(34,197,94,0.4), 0 8px 30px rgba(0,0,0,0.3)",
          }}>🎯</div>
          <span style={{
            fontFamily: "Space Grotesk, sans-serif", fontSize: 64, fontWeight: 700,
            color: "white", letterSpacing: -1,
          }}>
            Lead<span style={{ color: "#22c55e" }}>Hunter</span>
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: "Space Grotesk, sans-serif", fontSize: 34, fontWeight: 700,
          color: "rgba(255,255,255,0.85)",
          opacity: tagOp, transform: `translateY(${tagY}px)`,
        }}>
          اكتشف · تواصل · أغلق الصفقة
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 24,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#000",
          fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 24,
          padding: "20px 70px", borderRadius: 16,
          transform: `scale(${ctaScale})`,
          boxShadow: "0 0 50px rgba(34,197,94,0.4), 0 10px 40px rgba(0,0,0,0.3)",
        }}>
          ابدأ مجانًا الآن ←
        </div>

        {/* URL */}
        <div style={{
          fontFamily: "Space Grotesk, sans-serif", fontSize: 22,
          color: "rgba(255,255,255,0.35)",
          opacity: urlOp, marginTop: 12,
          letterSpacing: 1,
        }}>
          leadhunterr.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
