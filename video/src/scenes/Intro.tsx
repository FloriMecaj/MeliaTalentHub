import { BadgeEuroIcon, CalendarClockIcon, GraduationCapIcon, LayoutDashboardIcon, RotateCcwIcon } from "lucide-react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, Card, EASE_OUT, GradientText, Kicker, Logo, Reveal, Stage, useProgress } from "../theme";

export const Hook = () => (
  <Stage style={{ justifyContent: "center", alignItems: "center", textAlign: "center", gap: 28 }}>
    <Reveal delay={6}>
      <Interactive.Div name="Hook line 1" style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.03em" }}>
        Every summer, hotels hire hundreds.
      </Interactive.Div>
    </Reveal>
    <Reveal delay={42}>
      <Interactive.Div name="Hook line 2" style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.03em", color: C.copper }}>
        Every autumn, they let them go.
      </Interactive.Div>
    </Reveal>
    <Reveal delay={84}>
      <Interactive.Div name="Hook line 3" style={{ fontSize: 48, fontWeight: 500, color: C.muted, marginTop: 16 }}>
        And every spring, they start again from zero.
      </Interactive.Div>
    </Reveal>
  </Stage>
);

const pains = [
  { Icon: CalendarClockIcon, title: "Weeks of manual hiring", body: "Spreadsheets, calls and CVs every single spring." },
  { Icon: BadgeEuroIcon, title: "Agency fees on every hire", body: "Headhunters for roles you've filled before." },
  { Icon: RotateCcwIcon, title: "Re-training the same people", body: "Good staff leave in winter and never come back." },
];

export const Problem = () => (
  <Stage style={{ justifyContent: "center", gap: 70 }}>
    <div>
      <Reveal delay={0}>
        <Kicker>The seasonal trap</Kicker>
      </Reveal>
      <Reveal delay={8}>
        <Interactive.Div name="Problem title" style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 20 }}>
          Talent leaks out every season.
        </Interactive.Div>
      </Reveal>
    </div>
    <div style={{ display: "flex", gap: 36 }}>
      {pains.map(({ Icon, title, body }, i) => (
        <Reveal key={title} delay={30 + i * 14} style={{ flex: 1 }}>
          <Card style={{ padding: 44, minHeight: 360 }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, display: "grid", placeItems: "center", backgroundColor: "rgba(248,113,113,0.14)", color: C.red }}>
              <Icon size={44} />
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, marginTop: 34 }}>{title}</div>
            <div style={{ fontSize: 30, color: C.muted, marginTop: 14, lineHeight: 1.35 }}>{body}</div>
          </Card>
        </Reveal>
      ))}
    </div>
  </Stage>
);

export const Brand = () => {
  const frame = useCurrentFrame();
  const pop = useProgress(4, 30);
  return (
    <Stage style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ scale: interpolate(pop, [0, 1], [0.6, 1]), opacity: pop, rotate: `${(1 - pop) * -12}deg` }}>
        <Logo size={150} />
      </div>
      <Reveal delay={20}>
        <Interactive.Div name="Brand name" style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 44 }}>
          Meliá <span style={{ color: C.muted, fontWeight: 600 }}>Talent Hub</span>
        </Interactive.Div>
      </Reveal>
      <Reveal delay={44}>
        <Interactive.Div name="Brand tagline" style={{ fontSize: 60, fontWeight: 700, marginTop: 24 }}>
          Seasonal jobs become <GradientText>12-month careers.</GradientText>
        </Interactive.Div>
      </Reveal>
      <div
        style={{
          width: interpolate(frame, [60, 100], [0, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }),
          height: 3,
          marginTop: 44,
          borderRadius: 2,
          backgroundImage: `linear-gradient(90deg, transparent, ${C.copper}, transparent)`,
        }}
      />
    </Stage>
  );
};

const SidePanel = ({ delay, Icon, label, title, points, accent }: { delay: number; Icon: typeof GraduationCapIcon; label: string; title: string; points: string[]; accent: string }) => (
  <Reveal delay={delay} y={60} style={{ width: 700 }}>
    <Card style={{ padding: 52, height: 520 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 88, height: 88, borderRadius: 24, display: "grid", placeItems: "center", backgroundColor: `${accent}22`, color: accent }}>
          <Icon size={46} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>{label}</div>
      </div>
      <div style={{ fontSize: 50, fontWeight: 800, marginTop: 36, lineHeight: 1.15 }}>{title}</div>
      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 16 }}>
        {points.map((p, i) => (
          <Reveal key={p} delay={delay + 18 + i * 8} y={16}>
            <div style={{ fontSize: 32, color: C.muted, display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: accent }} />
              {p}
            </div>
          </Reveal>
        ))}
      </div>
    </Card>
  </Reveal>
);

/** Rotating arrows that tie the two dashboards into one loop. */
const LoopMark = () => {
  const frame = useCurrentFrame();
  const draw = useProgress(30, 40);
  return (
    <div style={{ width: 170, height: 170, opacity: draw, rotate: `${frame * 1.2}deg` }}>
      <svg width={170} height={170} viewBox="0 0 170 170">
        {[0, 180].map((r) => (
          <g key={r} transform={`rotate(${r} 85 85)`}>
            <path d="M 30 85 A 55 55 0 0 1 140 85" fill="none" stroke={C.copper} strokeWidth={8} strokeLinecap="round" strokeDasharray={175} strokeDashoffset={175 * (1 - draw)} />
            <path d="M 128 72 L 140 88 L 154 72" fill="none" stroke={C.copper} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const TwoSides = () => (
  <Stage style={{ alignItems: "center", gap: 60 }}>
    <Reveal delay={0}>
      <Interactive.Div name="Two sides title" style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center" }}>
        Two dashboards. <GradientText>One closed loop.</GradientText>
      </Interactive.Div>
    </Reveal>
    <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
      <SidePanel delay={16} Icon={GraduationCapIcon} label="Students" title="Find the right role, every season" accent={C.copper} points={["Matched to every job", "Apply & track in one place", "Invited back each year"]} />
      <LoopMark />
      <SidePanel delay={28} Icon={LayoutDashboardIcon} label="Administrators" title="Hire, retain and place your workforce" accent={C.gold} points={["Pipeline ranked by match", "Invite your best in clicks", "Winter exchange programs"]} />
    </div>
  </Stage>
);

/** Big numbered section card between the two halves of the video. */
export const Chapter = ({ index, label, title, accent }: { index: string; label: string; title: string; accent: string }) => {
  const line = useProgress(4, 30);
  return (
    <Stage style={{ justifyContent: "center" }}>
      <Reveal delay={0} x={-60} y={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: accent }}>{index}</span>
          <span style={{ width: 160 * line, height: 4, backgroundColor: accent, borderRadius: 2 }} />
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: accent }}>{label}</span>
        </div>
      </Reveal>
      <Reveal delay={12}>
        <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: "-0.035em", marginTop: 36, maxWidth: 1500, lineHeight: 1.05 }}>{title}</div>
      </Reveal>
    </Stage>
  );
};
