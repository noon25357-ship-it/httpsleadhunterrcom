import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const Scene1Radar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1Y = interpolate(spring({ frame, fps, config: { damping: 18, stiffness: 120 } }), [0, 1], [80, 0]);
  const line1Op = spring({ frame, fps, config: { damping: 20 } });
  const line2Y = interpolate(spring({ frame: frame - 12, fps, config: { damping: 18 } }), [0, 1], [60, 0]);
  const line2Op = spring({ frame: frame - 12, fps, config: { damping: 20 } });
  const xScale = interpolate(Math.sin(frame * 0.12), [-1, 1], [0.9, 1.15]);
  const bgScale = interpolate(frame, [0, 90], [1.05, 1.15], { extrapolateRight: "clamp" });

  const searches = [
    { x: 300, y: 250, delay: 8 },
    { x: 1500, y: 300, delay: 16 },
    { x: 800, y: 650, delay: 24 },
    { x: 1200, y: 200, delay: 10 },
    { x: 500, y: 500, delay: 20 },
  ];

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #0a1a0f 0%, #050a07 60%, #020503 100%)", transform: `scale(${bgScale})` }}>
      {[...Array(20)].map((_, i) => (
        <div key={`g${i}`} style={{ position: "absolute", top: `${i * 5.5}%`, left: 0, right: 0, height: 1, background: "rgba(34,197,94,0.03)" }} />
      ))}
      {searches.map((s, i) => {
        const appear = spring({ frame: frame - s.delay, fps, config: { damping: 12 } });
        return (
          <div key={i} style={{ position: "absolute", left: s.x, top: s.y, opacity: appear, transform: `scale(${appear * xScale})` }}>
            <div style={{ fontSize: 42, color: "#ef4444", textShadow: "0 0 20px rgba(239,68,68,0.5)" }}>✕</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 4, whiteSpace: "nowrap" }}>بحث يدوي</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 10 }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 72, fontWeight: 700, color: "white", opacity: line1Op, transform: `translateY(${line1Y}px)`, lineHeight: 1.2, textShadow: "0 0 60px rgba(0,0,0,0.8)" }}>
          تضيع وقتك تدور عملاء؟
        </div>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 36, color: "#ef4444", opacity: line2Op, transform: `translateY(${line2Y}px)`, marginTop: 20, textShadow: "0 0 30px rgba(239,68,68,0.4)" }}>
          الطريقة القديمة ما تنفع
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
