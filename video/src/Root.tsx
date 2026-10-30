import { Composition } from "remotion";
import { MeliaPromo } from "./MeliaPromo";

// Scenes 2150 frames - 8 fades x 16 - 4 pushes x 24 = 1926 frames (~64 s).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="MeliaPromo" component={MeliaPromo} durationInFrames={1926} fps={30} width={1920} height={1080} />
    </>
  );
};
