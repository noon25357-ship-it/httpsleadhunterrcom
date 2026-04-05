import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from "remotion";

const cities = [
  { name: "الرياض", x: 960, y: 400, size: 18 },
  { name: "جدة", x: 600, y: 520, size: 14 },
  { name: "الدمام", x: 1350, y: 380, size: 14 },
  { name: "مكة", x: 550, y: 580, size: 12 },
  { name: "المدينة", x: 480, y: 350, size: 12 },
  { name: "أبها", x: 700, y: 700, size: 11 },
  { name: "تبوك", x: 350, y: 250, size: 11 },
  { name: "القصيم", x: 850, y: 300, size: 11 },
];

export const Scene2Signals = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Radar sweep
  const sweepAngle = interpolate(frame, [0, 90], [0, 720]);
  const radarOp = interpolate(frame, [0, 10], [0, 0.6], { extrapolateRight: "clamp" });

  // Title
  const titleOp = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, #071a0e 0%, #040d07 60%, #020503 100%)" }}>
      {/* Radar sweep from center */}
      <div style={{
        position: "absolute", left: 960, top: 400,
        width: 800, height: 800,
        marginLeft: -400, marginTop: -400,
        borderRadius: "50%",
        background: `conic-gradient(from ${sweepAngle}deg, transparent 0deg, rgba(34,197,94,0.15) 30deg, transparent 60deg)`,
        opacity: radarOp,
      }} />

      {/* Radar rings */}
      {[200, 350, 500].map((r, i) => (
        <div key={i} style={{
          position: "absolute", left: 960 - r, top: 400 - r,
          width: r * 2, height: r * 2,
          borderRadius: "50%",
          border: "1px solid rgba(34,197,94,0.08)",
        }} />
      ))}

      {/* City dots */}
      {cities.map((city, i) => {
        const s = spring({ frame: frame - 5 - i * 6, fps, config: { damping: 14, stiffness: 180 } });
        const ping = interpolate((frame - i * 6) % 40, [0, 40], [0.4, 2], { extrapolateRight: "clamp" });
        const pingOp = interpolate((frame - i * 6) % 40, [0, 20, 40], [0.6, 0.2, 0]);
        return (
          <div key={i} style={{ position: "absolute", left: city.x, top: city.y, opacity: s }}>
            {/* Ping ring */}
            <div style={{
              position: "absolute", left: -15, top: -15,
              width: 30, height: 30, borderRadius: "50%",
              border: "1.5px solid rgba(34,197,94,0.4)",
              transform: `scale(${ping})`, opacity: pingOp,
            }} />
            {/* Dot */}
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 12px rgba(34,197,94,0.7)",
              transform: `scale(${s})`,
            }} />
            {/* Label */}
            <div style={{
              position: "absolute", top: -28, left: 14, whiteSpace: "nowrap",
              fontFamily: "Space Grotesk, sans-serif", fontSize: city.size,
              color: "rgba(255,255,255,0.65)",
              background: "rgba(0,0,0,0.5)", padding: "2px 8px", borderRadius: 5,
              border: "1px solid rgba(34,197,94,0.15)",
              transform: `scale(${s})`,
            }}>
              {city.name}
            </div>
          </div>
        );
      })}

      {/* Title */}
      <div style={{
        position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)",
        fontFamily: "Space Grotesk, sans-serif", fontSize: 44, fontWeight: 700,
        color: "#22c55e", opacity: titleOp,
        textShadow: "0 0 40px rgba(34,197,94,0.3)",
      }}>
        LeadHunter يمسح السوق بالكامل
      </div>

      {/* Counter */}
      <Sequence from={20}>
        <div style={{
          position: "absolute", bottom: 80, right: 120,
          fontFamily: "Space Grotesk, sans-serif",
        }}>
          <span style={{ fontSize: 80, fontWeight: 700, color: "#22c55e" }}>
            {Math.min(Math.floor(interpolate(frame - 20, [0, 50], [0, 247], { extrapolateRight: "clamp" })), 247)}
          </span>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginRight: 12 }}> فرصة حية</span>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
