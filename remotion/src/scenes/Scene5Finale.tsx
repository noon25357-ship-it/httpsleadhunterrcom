import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const Scene5Finale = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const taglineOpacity = spring({ frame: frame - 20, fps, config: { damping: 20 } });
  const ctaScale = spring({ frame: frame - 40, fps, config: { damping: 10 } });
  const subtextOpacity = spring({ frame: frame - 55, fps, config: { damping: 20 } });

  // Breathing glow
  const glowSize = interpolate(Math.sin(frame * 0.08), [-1, 1], [300, 500]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Logo / Brand */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          transform: `scale(${logoScale})`,
        }}
      >
        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #22c55e, #15803d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "0 0 30px rgba(34,197,94,0.4)",
            }}
          >
            🎯
          </div>
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 56,
              fontWeight: 700,
              color: "white",
              letterSpacing: -1,
            }}
          >
            Lead<span style={{ color: "#22c55e" }}>Hunter</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            opacity: taglineOpacity,
            transform: `translateY(${interpolate(taglineOpacity, [0, 1], [15, 0])}px)`,
          }}
        >
          Start closing faster
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: 20,
            backgroundColor: "#22c55e",
            color: "#000",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            padding: "18px 60px",
            borderRadius: 14,
            transform: `scale(${ctaScale})`,
            boxShadow: "0 0 40px rgba(34,197,94,0.4), 0 0 80px rgba(34,197,94,0.15)",
          }}
        >
          Try Free Now →
        </div>

        {/* URL */}
        <div
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            opacity: subtextOpacity,
            marginTop: 10,
          }}
        >
          leadhunterr.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
