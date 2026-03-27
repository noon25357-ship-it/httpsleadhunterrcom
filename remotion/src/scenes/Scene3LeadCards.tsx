import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

const leads = [
  { name: "مطعم الريان", cat: "مطاعم", rating: 4.2, reviews: 87, noSite: true },
  { name: "ورشة الخليج", cat: "صيانة سيارات", rating: 3.8, reviews: 34, noSite: true },
  { name: "صالون النخبة", cat: "حلاقة رجالية", rating: 4.5, reviews: 120, noSite: true },
];

export const Scene3LeadCards = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 38,
          fontWeight: 700,
          color: "white",
          opacity: spring({ frame, fps, config: { damping: 20 } }),
          transform: `translateY(${interpolate(spring({ frame, fps, config: { damping: 20 } }), [0, 1], [20, 0])}px)`,
        }}
      >
        Find leads before your competitors
      </div>

      {/* Cards */}
      <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
        {leads.map((lead, i) => {
          const s = spring({ frame: frame - 15 - i * 12, fps, config: { damping: 15, stiffness: 160 } });
          return (
            <div
              key={i}
              style={{
                width: 380,
                backgroundColor: "rgba(15,25,20,0.9)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 16,
                padding: 30,
                transform: `scale(${s}) translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                opacity: s,
                boxShadow: "0 0 40px rgba(34,197,94,0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 22, fontWeight: 700, color: "white" }}>{lead.name}</span>
                <span style={{ fontSize: 14, color: "rgba(34,197,94,0.8)", backgroundColor: "rgba(34,197,94,0.12)", padding: "4px 12px", borderRadius: 20, fontFamily: "Space Grotesk, sans-serif" }}>{lead.cat}</span>
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 20, fontFamily: "Space Grotesk, sans-serif" }}>
                <span style={{ color: "#fbbf24", fontSize: 16 }}>★ {lead.rating}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{lead.reviews} reviews</span>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#ef4444", backgroundColor: "rgba(239,68,68,0.12)", padding: "4px 12px", borderRadius: 8, fontFamily: "Space Grotesk, sans-serif" }}>❌ No website</span>
                <span style={{ fontSize: 13, color: "#22c55e", backgroundColor: "rgba(34,197,94,0.12)", padding: "4px 12px", borderRadius: 8, fontFamily: "Space Grotesk, sans-serif" }}>📱 Has phone</span>
              </div>

              {/* CTA button */}
              {frame > 40 + i * 12 && (
                <div
                  style={{
                    backgroundColor: "#22c55e",
                    color: "#000",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    padding: "12px 0",
                    borderRadius: 10,
                    textAlign: "center",
                    transform: `scale(${spring({ frame: frame - 40 - i * 12, fps, config: { damping: 12 } })})`,
                  }}
                >
                  Start Contact →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
