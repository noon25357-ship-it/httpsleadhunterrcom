import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const Scene4Discovery = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.min(Math.floor(interpolate(frame, [0, 50], [47, 156], { extrapolateRight: "clamp" })), 156);

  // Scrolling list of leads
  const leadNames = [
    "مقهى السلام", "معمل حلويات الفرح", "مغسلة النظافة", "ورشة الإتقان",
    "صالون VIP", "مطعم الديرة", "بقالة الحي", "خياطة الأناقة",
    "مكتب المحاسب", "كافيه بريك", "مطبعة الإبداع", "محل الأزهار",
  ];

  const scrollY = interpolate(frame, [0, 80], [0, -400]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Left: scrolling leads */}
      <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, width: 500, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${scrollY}px)`, paddingTop: 200 }}>
          {leadNames.map((name, i) => {
            const s = spring({ frame: frame - i * 5, fps, config: { damping: 20 } });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 20px",
                  marginBottom: 8,
                  backgroundColor: "rgba(15,25,20,0.8)",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderRadius: 12,
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 18, color: "white" }}>{name}</span>
                <span style={{ marginLeft: "auto", fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "#ef4444", opacity: 0.8 }}>No site</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: counter and text */}
      <div style={{ position: "absolute", right: 120, top: "50%", transform: "translateY(-50%)", textAlign: "right" }}>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 120, fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>
          {count}
        </div>
        <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 28, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>
          leads discovered
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            opacity: spring({ frame: frame - 30, fps, config: { damping: 20 } }),
          }}
        >
          in under 10 seconds
        </div>
      </div>
    </AbsoluteFill>
  );
};
