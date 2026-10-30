import { BellRingIcon, HomeIcon, LayoutDashboardIcon, SnowflakeIcon, SunIcon, UserRoundIcon } from "lucide-react";
import { Interactive, interpolate, useCurrentFrame } from "remotion";
import { C, Card, Counter, EASE_IN_OUT, GradientText, Kicker, Logo, Reveal, Stage, useProgress } from "../theme";

const stops = [
  { Icon: SunIcon, season: "Summer", place: "Meliá Durrës", color: C.gold },
  { Icon: SnowflakeIcon, season: "Winter", place: "Hotel Alpenhof, Zermatt", color: "#9cc3e6" },
  { Icon: SunIcon, season: "Next summer", place: "Back at Meliá", color: C.gold },
];

const Journey = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const W = 1500;
  return (
    <div style={{ position: "relative", width: W, height: 230, alignSelf: "center" }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 58, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", left: 60, top: 58, height: 4, borderRadius: 2, width: (W - 120) * t, backgroundImage: `linear-gradient(90deg, ${C.gold}, #9cc3e6, ${C.gold})`, backgroundSize: `${W - 120}px 4px` }} />
      <div style={{ position: "absolute", left: 60 + (W - 120) * t - 14, top: 46, width: 28, height: 28, borderRadius: 14, backgroundColor: C.text, boxShadow: `0 0 30px ${C.copper}` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between" }}>
        {stops.map(({ Icon, season, place, color }, i) => {
          const on = interpolate(t, [i / 2 - 0.08, i / 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={season} style={{ width: 120, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, display: "grid", placeItems: "center", backgroundColor: C.card, border: `3px solid ${on ? color : C.border}`, color, scale: 0.85 + on * 0.15, boxShadow: `0 0 ${on * 50}px ${color}55` }}>
                <Icon size={56} />
              </div>
              <div style={{ fontSize: 34, fontWeight: 800, marginTop: 20, whiteSpace: "nowrap", opacity: 0.4 + on * 0.6 }}>{season}</div>
              <div style={{ fontSize: 26, color: C.muted, whiteSpace: "nowrap", opacity: 0.4 + on * 0.6 }}>{place}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Exchange = () => (
  <Stage style={{ gap: 56 }}>
    <div>
      <Reveal delay={0}>
        <Kicker>For everyone · Winter exchange</Kicker>
      </Reveal>
      <Reveal delay={8}>
        <Interactive.Div name="Exchange title" style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 20 }}>
          Winter no longer ends the job.
          <br />
          <GradientText>It continues the career.</GradientText>
        </Interactive.Div>
      </Reveal>
    </div>
    <Reveal delay={20}>
      <Journey />
    </Reveal>
    <div style={{ display: "flex", gap: 36 }}>
      {[
        { Icon: UserRoundIcon, who: "Workers see", text: "Partner, dates, salary, housing and transport", delay: 110 },
        { Icon: LayoutDashboardIcon, who: "Admins get", text: "Pipeline, partner capacity and smart matching", delay: 120 },
        { Icon: BellRingIcon, who: "Nobody is forgotten", text: "Return reminders bring everyone back", delay: 130 },
      ].map(({ Icon, who, text, delay }) => (
        <Reveal key={who} delay={delay} style={{ flex: 1 }}>
          <Card style={{ padding: 34, display: "flex", gap: 24, alignItems: "center" }}>
            <Icon size={48} color={C.copper} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>{who}</div>
              <div style={{ fontSize: 26, color: C.muted, marginTop: 6, lineHeight: 1.3 }}>{text}</div>
            </div>
          </Card>
        </Reveal>
      ))}
    </div>
  </Stage>
);

const stats = [
  { to: 70, prefix: "-", suffix: "%", label: "Time-to-fill", body: "Matching replaces weeks of admin" },
  { to: 40, prefix: "-", suffix: "%", label: "Onboarding cost", body: "Returning staff are already trained" },
  { to: 0, prefix: "€", suffix: "", label: "Agency fees", body: "Your own talent pipeline" },
  { to: 12, prefix: "", suffix: " mo", label: "Retention", body: "Seasonal turnover, closed" },
];

export const Impact = () => (
  <Stage style={{ justifyContent: "center", gap: 70 }}>
    <div>
      <Reveal delay={0}>
        <Kicker>The impact</Kicker>
      </Reveal>
      <Reveal delay={8}>
        <Interactive.Div name="Impact title" style={{ fontSize: 92, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 20 }}>
          Good for margins. <GradientText>Good for people.</GradientText>
        </Interactive.Div>
      </Reveal>
    </div>
    <div style={{ display: "flex", gap: 32 }}>
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={24 + i * 10} style={{ flex: 1 }}>
          <Card style={{ padding: "44px 40px", minHeight: 360 }}>
            <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: "-0.04em", color: C.copper }}>
              <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} delay={30 + i * 10} duration={45} />
            </div>
            <div style={{ fontSize: 38, fontWeight: 700, marginTop: 10 }}>{s.label}</div>
            <div style={{ fontSize: 27, color: C.muted, marginTop: 10, lineHeight: 1.35 }}>{s.body}</div>
          </Card>
        </Reveal>
      ))}
    </div>
    <Reveal delay={80}>
      <div style={{ fontSize: 32, color: C.muted, display: "flex", alignItems: "center", gap: 16 }}>
        <HomeIcon size={32} color={C.green} />
        Built around ESG (social pillar) and UN SDG 8: decent, year-round work.
      </div>
    </Reveal>
  </Stage>
);

export const Closing = () => {
  const frame = useCurrentFrame();
  const pop = useProgress(0, 30);
  return (
    <Stage style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ opacity: pop, scale: 0.7 + pop * 0.3 }}>
        <Logo size={120} />
      </div>
      <Reveal delay={12}>
        <Interactive.Div name="Closing line" style={{ fontSize: 132, fontWeight: 800, letterSpacing: "-0.035em", marginTop: 44, lineHeight: 1.05 }}>
          Excellence knows
          <br />
          <GradientText>no season.</GradientText>
        </Interactive.Div>
      </Reveal>
      <Reveal delay={40}>
        <div style={{ fontSize: 44, fontWeight: 700, marginTop: 40 }}>
          Meliá <span style={{ color: C.muted, fontWeight: 600 }}>Talent Hub</span>
        </div>
      </Reveal>
      <Reveal delay={56}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", color: C.gold, marginTop: 20, opacity: interpolate(frame, [56, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          INNOVATION BOOTCAMP ALBANIA
        </div>
      </Reveal>
    </Stage>
  );
};
