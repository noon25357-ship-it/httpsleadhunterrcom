import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.03), [-1, 1], [0.03, 0.08]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070B0F" }}>
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 1200,
          height: 1200,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(34,197,94,${pulse}) 0%, transparent 70%)`,
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </AbsoluteFill>
  );
};
