import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Sequence } from "remotion";

export const TwitterAd = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene 1: frames 0-140 (0-4.7s) - Maps image with camera push-in
  // Transition: frames 120-165 (4-5.5s) - Scan line sweep
  // Scene 2: frames 145-300 (4.8-10s) - Radar image with pulse effects

  // --- SCENE 1: Camera push-in on Maps ---
  const scene1Scale = interpolate(frame, [0, 140], [1, 1.15], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scene1X = interpolate(frame, [0, 140], [0, -10], { extrapolateRight: "clamp" });
  const scene1Y = interpolate(frame, [0, 140], [0, -20], { extrapolateRight: "clamp" });
  const scene1Opacity = interpolate(frame, [120, 155], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Scene 1 neon glow overlay pulse
  const glowPulse = Math.sin(frame * 0.08) * 0.15 + 0.25;

  // Location pin pulses (4 pins at approximate positions)
  const pins = [
    { x: 72, y: 55 }, // Riyadh
    { x: 35, y: 72 }, // Jeddah  
    { x: 30, y: 82 }, // Makkah
    { x: 50, y: 60 }, // center
    { x: 60, y: 45 }, // top
  ];

  // Button shimmer on scene 1
  const shimmerX = interpolate(frame % 90, [0, 90], [-100, 200]);

  // --- TRANSITION: Scan line sweep ---
  const scanLineY = interpolate(frame, [120, 160], [-10, 110], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanOpacity = interpolate(frame, [120, 130, 150, 160], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- SCENE 2: Radar with effects ---
  const scene2Opacity = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scene2Scale = interpolate(frame, [140, 170], [1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Radar sweep rotation
  const radarAngle = interpolate(frame, [145, durationInFrames], [0, 360], { extrapolateLeft: "clamp" });

  // Radar pulse rings
  const pulseFrame = (frame - 145) % 60;
  const pulseScale1 = interpolate(pulseFrame, [0, 60], [0.3, 1.8], { extrapolateRight: "clamp" });
  const pulseOp1 = interpolate(pulseFrame, [0, 30, 60], [0.5, 0.3, 0], { extrapolateRight: "clamp" });
  const pulseFrame2 = ((frame - 145) + 30) % 60;
  const pulseScale2 = interpolate(pulseFrame2, [0, 60], [0.3, 1.8], { extrapolateRight: "clamp" });
  const pulseOp2 = interpolate(pulseFrame2, [0, 30, 60], [0.5, 0.3, 0], { extrapolateRight: "clamp" });

  // Scene 2 subtle glow
  const glow2 = Math.sin((frame - 145) * 0.06) * 0.12 + 0.2;

  // Digital scan particles for transition
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 137.5) % 100,
    delay: i * 2,
    size: 2 + (i % 3),
  }));

  // Loop-friendly: fade out at end
  const loopFade = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#030a06", opacity: loopFade }}>
      {/* SCENE 1 */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: scene1Opacity,
        transform: `scale(${scene1Scale}) translate(${scene1X}px, ${scene1Y}px)`,
        willChange: "transform",
      }}>
        <Img src={staticFile("images/scene1-maps.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Neon glow overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, rgba(34,197,94,${glowPulse}) 0%, transparent 60%)`,
          mixBlendMode: "screen",
        }} />

        {/* Pin pulse effects */}
        {frame < 140 && pins.map((pin, i) => {
          const pinPulse = ((frame + i * 15) % 45) / 45;
          const pinScale = 1 + pinPulse * 1.5;
          const pinOp = 1 - pinPulse;
          return (
            <div key={i} style={{
              position: "absolute",
              left: `${pin.x}%`, top: `${pin.y}%`,
              width: 20, height: 20,
              borderRadius: "50%",
              border: "1.5px solid rgba(34,197,94,0.6)",
              transform: `translate(-50%, -50%) scale(${pinScale})`,
              opacity: pinOp * 0.5,
            }} />
          );
        })}

        {/* Button shimmer effect */}
        <div style={{
          position: "absolute",
          bottom: "6%", right: "6%",
          width: 130, height: 40,
          overflow: "hidden",
          borderRadius: 8,
          opacity: 0.6,
        }}>
          <div style={{
            position: "absolute",
            top: 0, left: `${shimmerX}%`,
            width: 30, height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            transform: "skewX(-20deg)",
          }} />
        </div>

        {/* Subtle scan lines overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,197,94,0.02) 3px, rgba(34,197,94,0.02) 4px)",
          opacity: 0.5,
        }} />
      </div>

      {/* TRANSITION: Green scan line sweep */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: `${scanLineY}%`,
        height: 4,
        background: "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.8) 20%, rgba(34,197,94,1) 50%, rgba(34,197,94,0.8) 80%, transparent 100%)",
        opacity: scanOpacity,
        boxShadow: "0 0 30px rgba(34,197,94,0.6), 0 0 80px rgba(34,197,94,0.3)",
        zIndex: 10,
      }} />

      {/* Transition scan glow spread */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: `${scanLineY - 5}%`,
        height: "12%",
        background: "linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.08) 40%, rgba(34,197,94,0.15) 50%, rgba(34,197,94,0.08) 60%, transparent 100%)",
        opacity: scanOpacity,
        zIndex: 9,
      }} />

      {/* Digital particles during transition */}
      {frame >= 120 && frame <= 165 && particles.map((p, i) => {
        const pFrame = frame - 120 - p.delay;
        if (pFrame < 0 || pFrame > 30) return null;
        const pOp = interpolate(pFrame, [0, 10, 25, 30], [0, 0.8, 0.5, 0]);
        return (
          <div key={`p${i}`} style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${scanLineY}%`,
            width: p.size, height: p.size,
            background: "#22c55e",
            borderRadius: "50%",
            opacity: pOp,
            boxShadow: "0 0 6px rgba(34,197,94,0.8)",
            zIndex: 11,
          }} />
        );
      })}

      {/* SCENE 2 */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: scene2Opacity,
        transform: `scale(${scene2Scale})`,
        willChange: "transform",
      }}>
        <Img src={staticFile("images/scene2-radar.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />

        {/* Radar sweep overlay */}
        {frame >= 145 && (
          <div style={{
            position: "absolute",
            left: "50%", top: "42%",
            width: 500, height: 500,
            marginLeft: -250, marginTop: -250,
            borderRadius: "50%",
            background: `conic-gradient(from ${radarAngle}deg, transparent 0deg, rgba(34,197,94,0.12) 30deg, transparent 60deg)`,
            opacity: 0.7,
          }} />
        )}

        {/* Pulse rings */}
        {frame >= 145 && (
          <>
            <div style={{
              position: "absolute",
              left: "50%", top: "42%",
              width: 300, height: 300,
              marginLeft: -150, marginTop: -150,
              borderRadius: "50%",
              border: "1.5px solid rgba(34,197,94,0.4)",
              transform: `scale(${pulseScale1})`,
              opacity: pulseOp1,
            }} />
            <div style={{
              position: "absolute",
              left: "50%", top: "42%",
              width: 300, height: 300,
              marginLeft: -150, marginTop: -150,
              borderRadius: "50%",
              border: "1.5px solid rgba(34,197,94,0.3)",
              transform: `scale(${pulseScale2})`,
              opacity: pulseOp2,
            }} />
          </>
        )}

        {/* Subtle glow on radar center */}
        {frame >= 145 && (
          <div style={{
            position: "absolute",
            left: "50%", top: "42%",
            width: 200, height: 200,
            marginLeft: -100, marginTop: -100,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(34,197,94,${glow2}) 0%, transparent 70%)`,
            mixBlendMode: "screen",
          }} />
        )}

        {/* Scan lines overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,197,94,0.015) 3px, rgba(34,197,94,0.015) 4px)",
          opacity: 0.4,
        }} />
      </div>

      {/* Vignette overlay for cinematic feel */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)",
        pointerEvents: "none",
        zIndex: 20,
      }} />
    </AbsoluteFill>
  );
};
