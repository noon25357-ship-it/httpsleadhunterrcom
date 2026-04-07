import { Composition } from "remotion";
import { TwitterAd } from "./TwitterAd";

export const RootTwitterAd = () => (
  <Composition
    id="twitter-ad"
    component={TwitterAd}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1080}
  />
);
