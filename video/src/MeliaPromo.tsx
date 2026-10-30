import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill } from "remotion";
import { AdminBoard, AdminInvite } from "./scenes/Admin";
import { Brand, Chapter, Hook, Problem, TwoSides } from "./scenes/Intro";
import { Closing, Exchange, Impact } from "./scenes/Outro";
import { StudentMatch, StudentTrack } from "./scenes/Student";
import { Backdrop, C } from "./theme";

const xfade = linearTiming({ durationInFrames: 16 });
const push = springTiming({ config: { damping: 200 }, durationInFrames: 24 });

export const MeliaPromo = () => (
  <AbsoluteFill>
    <Backdrop />
    <TransitionSeries>
      <TransitionSeries.Sequence name="Hook" durationInFrames={150}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Problem" durationInFrames={165}>
        <Problem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Brand" durationInFrames={135}>
        <Brand />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Two sides" durationInFrames={165}>
        <TwoSides />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={push} />
      <TransitionSeries.Sequence name="Students chapter" durationInFrames={80}>
        <Chapter index="01" label="For students" title="Your career, not just a summer job." accent={C.copper} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Student matching" durationInFrames={210}>
        <StudentMatch />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={push} />
      <TransitionSeries.Sequence name="Student applications" durationInFrames={210}>
        <StudentTrack />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={push} />
      <TransitionSeries.Sequence name="Admins chapter" durationInFrames={80}>
        <Chapter index="02" label="For administrators" title="One console for your whole workforce." accent={C.gold} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Admin board" durationInFrames={200}>
        <AdminBoard />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={push} />
      <TransitionSeries.Sequence name="Admin invitations" durationInFrames={215}>
        <AdminInvite />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Exchange" durationInFrames={210}>
        <Exchange />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Impact" durationInFrames={180}>
        <Impact />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={xfade} />
      <TransitionSeries.Sequence name="Closing" durationInFrames={150}>
        <Closing />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
