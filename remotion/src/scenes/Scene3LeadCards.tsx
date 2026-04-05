import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

const leads = [
  { name: "مطعم الريان", category: "مطاعم", score: 92, signal: "بدون موقع", city: "الرياض" },
  { name: "صالون VIP", category: "تجميل", score: 87, signal: "تقييمات سلبية", city: "جدة" },
  { name: "ورشة الإتقان", category: "خدمات", score: 95, signal: "بدون سوشال", city: "الدمام" },
  { name: "مغسلة النظافة", category: "خدمات", score: 78, signal: "إعلانات ضعيفة", city: "مكة" },
];

export const Scene3LeadCards = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 50%, #0a1a0f 0%, #050a07 60%, #020503 100%)" }}>
      <div style={{ position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", fontFamily: "Space Grotesk, sans-serif", textAlign: "center", opacity: titleOp }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: "white" }}>بطاقات ذكية لكل فرصة</div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>كل المعلومات اللي تحتاجها في مكان واحد</div>
      </div>
      <div style={{ position: "absolute", top: 200, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 28 }}>
        {leads.map((lead, i) => {
          const s = spring({ frame: frame - 15 - i * 10, fps, config: { damping: 15, stiffness: 150 } });
          const y = interpolate(s, [0, 1], [60, 0]);
          const hover = interpolate(Math.sin((frame - i * 8) * 0.06), [-1, 1], [-4, 4]);
          return (
            <div key={i} style={{
              width: 340, padding: 28,
              background: "linear-gradient(160deg, rgba(15,30,20,0.95) 0%, rgba(10,20,14,0.98) 100%)",
              border: "1px solid rgba(34,197,94,0.15)", borderRadius: 20,
              opacity: s, transform: `translateY(${y + hover}px)`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(34,197,94,0.05)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, color: "white" }}>{lead.name}</div>
                <div style={{
                  background: lead.score >= 90 ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #eab308, #ca8a04)",
                  padding: "4px 12px", borderRadius: 20,
                  fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 700, color: "#000",
                }}>{lead.score}%</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 8 }}>{lead.category}</span>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 8 }}>{lead.city}</span>
              </div>
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10, padding: "10px 14px",
                fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "#ef4444", marginBottom: 16,
              }}>⚠️ {lead.signal}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, textAlign: "center", background: "#22c55e", color: "#000", fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 700, padding: "10px 0", borderRadius: 10 }}>تواصل</div>
                <div style={{ flex: 1, textAlign: "center", background: "rgba(255,255,255,0.08)", color: "white", fontFamily: "Space Grotesk, sans-serif", fontSize: 14, fontWeight: 600, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>احفظ</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
