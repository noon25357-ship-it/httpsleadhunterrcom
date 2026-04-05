import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { Scene1Radar } from "./scenes/Scene1Radar";
import { Scene2Signals } from "./scenes/Scene2Signals";
import { Scene3LeadCards } from "./scenes/Scene3LeadCards";
import { Scene4Discovery } from "./scenes/Scene4Discovery";
import { Scene5Finale } from "./scenes/Scene5Finale";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <Scene1Radar />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene2Signals />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene3LeadCards />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene4Discovery />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene5Finale />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
