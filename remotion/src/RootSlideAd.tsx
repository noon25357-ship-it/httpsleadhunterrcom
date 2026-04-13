import { Composition } from "remotion";
import { SlideAd } from "./SlideAd";

export const RootSlideAd = () => (
  <Composition
    id="slide-ad"
    component={SlideAd}
    durationInFrames={420}
    fps={30}
    width={1920}
    height={1080}
  />
);
