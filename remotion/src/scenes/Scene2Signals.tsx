import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";

const signals = [
  { x: 350, y: 280, label: "مطعم الريان" },
  { x: 900, y: 400, label: "ورشة الخليج" },
  { x: 1400, y: 300, label: "صالون النخبة" },
  { x: 600, y: 600, label: "مغسلة البركة" },
  { x: 1200, y: 550, label: "حلويات سمير" },
  { x: 300, y: 500, label: "كافيه المسار" },
];

export const Scene2Signals = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {[...Array(12)].map((_, i) => (
        <div key={`h-${i}`} style={{ position: "absolute", top: `${(i + 1) * 8}%`, left: 0, right: 0, height: 1, backgroundColor: "rgba(34,197,94,0.06)" }} />
      ))}
      {[...Array(16)].map((_, i) => (
        <div key={`v-${i}`} style={{ position: "absolute", left: `${(i + 1) * 6}%`, top: 0, bottom: 0, width: 1, backgroundColor: "rgba(34,197,94,0.06)" }} />
      ))}

      {signals.map((sig, i) => {
        const s = spring({ frame: frame - i * 8, fps, config: { damping: 14, stiffness: 180 } });
        const pinScale = spring({ frame: frame - i * 8 - 5, fps, config: { damping: 20 } });
        return (
          <div key={i} style={{ position: "absolute", left: sig.x, top: sig.y, transform: `scale(${s})`, opacity: s }}>
            <div style={{ position: "absolute", width: 50, height: 50, borderRadius: "50%", border: "2px solid rgba(34,197,94,0.3)", top: -20, left: -20, transform: `scale(${interpolate(Math.max(frame - i * 8 - 10, 0) % 30, [0, 30], [0.5, 2])})`, opacity: interpolate(Math.max(frame - i * 8 - 10, 0) % 30, [0, 15, 30], [0.6, 0.3, 0]) }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 15px rgba(34,197,94,0.7)", transform: `scale(${pinScale})` }} />
            <div style={{ position: "absolute", top: -30, left: 18, whiteSpace: "nowrap", fontFamily: "Space Grotesk, sans-serif", fontSize: 16, color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(0,0,0,0.6)", padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(34,197,94,0.2)", transform: `scale(${pinScale})` }}>
              {sig.label}
            </div>
          </div>
        );
      })}

      <Sequence from={30}>
        <div style={{ position: "absolute", top: 60, right: 80, fontFamily: "Space Grotesk, sans-serif", display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#22c55e" }}>
            {Math.min(Math.floor(interpolate(frame - 30, [0, 40], [0, 47], { extrapolateRight: "clamp" })), 47)}
          </span>
          <span style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>فرصة تم اكتشافها</span>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
