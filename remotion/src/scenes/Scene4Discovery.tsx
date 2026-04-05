import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

const benefits = [
  { icon: "⚡", title: "اكتشاف فوري", desc: "امسح السوق في ثوانٍ مو أيام", color: "#22c55e" },
  { icon: "🤖", title: "رسائل بالذكاء الاصطناعي", desc: "رسالة مخصصة لكل عميل تلقائياً", color: "#3b82f6" },
  { icon: "📊", title: "متابعة كاملة", desc: "تتبع كل عميل من الاكتشاف للإغلاق", color: "#a855f7" },
];

export const Scene4Discovery = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = spring({ frame, fps, config: { damping: 20 } });
  const titleY = interpolate(titleOp, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 40%, #0a1a0f 0%, #050a07 60%, #020503 100%)" }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 100, left: "50%", transform: `translateX(-50%) translateY(${titleY}px)`,
        fontFamily: "Space Grotesk, sans-serif", fontSize: 52, fontWeight: 700,
        color: "white", opacity: titleOp, textAlign: "center",
        textShadow: "0 0 50px rgba(0,0,0,0.5)",
      }}>
        ليش <span style={{ color: "#22c55e" }}>LeadHunter</span>؟
      </div>

      {/* Benefits */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex", gap: 50,
        marginTop: 40,
      }}>
        {benefits.map((b, i) => {
          const s = spring({ frame: frame - 20 - i * 12, fps, config: { damping: 14, stiffness: 140 } });
          const y = interpolate(s, [0, 1], [80, 0]);
          const glow = interpolate(Math.sin((frame - i * 10) * 0.08), [-1, 1], [0.3, 0.6]);

          return (
            <div key={i} style={{
              width: 380, textAlign: "center",
              opacity: s, transform: `translateY(${y}px)`,
            }}>
              {/* Icon circle */}
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: `radial-gradient(circle, ${b.color}22 0%, transparent 70%)`,
                border: `2px solid ${b.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 48, margin: "0 auto 24px",
                boxShadow: `0 0 ${40 * glow}px ${b.color}44`,
              }}>
                {b.icon}
              </div>

              <div style={{
                fontFamily: "Space Grotesk, sans-serif", fontSize: 28, fontWeight: 700,
                color: b.color, marginBottom: 12,
              }}>
                {b.title}
              </div>

              <div style={{
                fontFamily: "Space Grotesk, sans-serif", fontSize: 20,
                color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
              }}>
                {b.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
