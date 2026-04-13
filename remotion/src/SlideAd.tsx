import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Sequence } from "remotion";

export const SlideAd = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timeline: 4 slides × ~3.5s each = 14s = 420 frames at 30fps
  // Slide 1: 0-105 (3.5s)
  // Slide 2: 90-195 (transition starts at 90)
  // Slide 3: 180-285
  // Slide 4: 270-420

  const slides = [
    { src: "images/leadhunter-slide-1.png", start: 0, end: 110 },
    { src: "images/leadhunter-slide-2.png", start: 95, end: 210 },
    { src: "images/leadhunter-slide-3.png", start: 195, end: 310 },
    { src: "images/leadhunter-slide-4.png", start: 295, end: 420 },
  ];

  // Fade out at end for loop
  const loopFade = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#030a06", opacity: loopFade }}>
      {slides.map((slide, i) => {
        const dur = slide.end - slide.start;
        const localFrame = frame - slide.start;
        
        // Opacity: fade in during first 15 frames, fade out last 15
        const fadeIn = interpolate(localFrame, [0, 15], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const fadeOut = i < slides.length - 1
          ? interpolate(localFrame, [dur - 20, dur], [1, 0], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            })
          : 1;
        const opacity = fadeIn * fadeOut;

        if (opacity <= 0) return null;

        // Ken Burns: slow push-in with slight drift
        const directions = [
          { sx: 1, sy: 1, ex: 1.12, ey: 1.12, tx: 0, ty: -15 },     // push in center
          { sx: 1.08, sy: 1.08, ex: 1, ey: 1, tx: 10, ty: 10 },      // pull out
          { sx: 1, sy: 1, ex: 1.1, ey: 1.1, tx: -10, ty: -10 },      // push in left
          { sx: 1.05, sy: 1.05, ex: 1, ey: 1, tx: 0, ty: 5 },        // subtle pull
        ];
        const dir = directions[i];
        const progress = interpolate(localFrame, [0, dur], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        const scale = interpolate(progress, [0, 1], [dir.sx, dir.ex]);
        const tx = interpolate(progress, [0, 1], [0, dir.tx]);
        const ty = interpolate(progress, [0, 1], [0, dir.ty]);

        // Glitch/scan line effect during transition
        const isTransitioning = localFrame > dur - 20 && i < slides.length - 1;
        const scanY = isTransitioning
          ? interpolate(localFrame, [dur - 20, dur], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : -10;

        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            {/* Main slide image with Ken Burns */}
            <div style={{
              position: "absolute", inset: 0,
              transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
              willChange: "transform",
            }}>
              <Img src={staticFile(slide.src)} style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
            </div>

            {/* Green scan line during transitions */}
            {isTransitioning && (
              <>
                <div style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${scanY}%`, height: 3,
                  background: "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.8) 20%, rgba(34,197,94,1) 50%, rgba(34,197,94,0.8) 80%, transparent 100%)",
                  boxShadow: "0 0 30px rgba(34,197,94,0.5), 0 0 60px rgba(34,197,94,0.2)",
                  zIndex: 10,
                }} />
                <div style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${scanY - 4}%`, height: "10%",
                  background: "linear-gradient(180deg, transparent, rgba(34,197,94,0.06) 50%, transparent)",
                  zIndex: 9,
                }} />
              </>
            )}

            {/* Subtle CRT scan lines overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(34,197,94,0.015) 3px, rgba(34,197,94,0.015) 4px)",
              opacity: 0.5, pointerEvents: "none",
            }} />
          </AbsoluteFill>
        );
      })}

      {/* Green pulse at center during slide 3 (solution reveal) */}
      {frame >= 195 && frame <= 310 && (() => {
        const pulseFrame = (frame - 195) % 40;
        const pulseScale = interpolate(pulseFrame, [0, 40], [0.5, 2], { extrapolateRight: "clamp" });
        const pulseOp = interpolate(pulseFrame, [0, 20, 40], [0.3, 0.15, 0], { extrapolateRight: "clamp" });
        return (
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            width: 200, height: 200, marginLeft: -100, marginTop: -100,
            borderRadius: "50%",
            border: "1px solid rgba(34,197,94,0.4)",
            transform: `scale(${pulseScale})`,
            opacity: pulseOp,
            pointerEvents: "none",
          }} />
        );
      })()}

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none", zIndex: 20,
      }} />
    </AbsoluteFill>
  );
};
