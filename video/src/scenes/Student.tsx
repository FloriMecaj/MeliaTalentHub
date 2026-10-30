import { AlertCircleIcon, CheckCircle2Icon, CheckIcon, MessageCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, Card, GradientText, Kicker, Reveal, Ring, Stage, Window, useProgress } from "../theme";

/** Left copy column shared by the feature scenes. */
export const Copy = ({ kicker, title, body, benefits, accent = C.gold }: { kicker: string; title: ReactNode; body: string; benefits: string[]; accent?: string }) => (
  <div style={{ width: 760, flexShrink: 0 }}>
    <Reveal delay={0}>
      <Kicker color={accent}>{kicker}</Kicker>
    </Reveal>
    <Reveal delay={8}>
      <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 22 }}>{title}</div>
    </Reveal>
    <Reveal delay={20}>
      <div style={{ fontSize: 36, color: C.muted, lineHeight: 1.4, marginTop: 30 }}>{body}</div>
    </Reveal>
    <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 20 }}>
      {benefits.map((b, i) => (
        <Reveal key={b} delay={36 + i * 12} x={-30} y={0}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 34, fontWeight: 600 }}>
            <CheckCircle2Icon size={38} color={C.green} />
            {b}
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

const Split = ({ children }: { children: ReactNode }) => (
  <Stage style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 80 }}>{children}</Stage>
);

const reasons = [
  { ok: true, text: "Wants Front Office: category match" },
  { ok: true, text: "English, Italian: languages covered" },
  { ok: true, text: "2 seasons at Meliá: returning bonus" },
  { ok: false, text: "Add “Opera PMS” to reach 100%" },
];

export const StudentMatch = () => (
  <Split>
    <Copy
      kicker="For students · Matching"
      title={<>A compatibility score for <GradientText>every job.</GradientText></>}
      body="No more guessing. Each opening is scored against your profile, with the reasons you fit and what to improve."
      benefits={["Know before you apply", "See exactly which skill boosts you", "No CV required to start"]}
      accent={C.copper}
    />
    <Reveal delay={16} y={80} style={{ flex: 1 }}>
      <Window url="melia-talent-hub / student / jobs">
        <div style={{ padding: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Ring value={92} size={210} delay={30} duration={50} />
            <div>
              <div style={{ fontSize: 50, fontWeight: 800 }}>Receptionist</div>
              <div style={{ fontSize: 28, color: C.muted, marginTop: 8 }}>Front Office · Meliá Durrës · All year</div>
              <Reveal delay={78} y={10}>
                <div style={{ display: "inline-block", marginTop: 18, padding: "10px 22px", borderRadius: 999, backgroundColor: "rgba(156,198,107,0.16)", color: C.green, fontSize: 26, fontWeight: 700 }}>
                  You're compatible
                </div>
              </Reveal>
            </div>
          </div>
          <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 18 }}>
            {reasons.map((r, i) => (
              <Reveal key={r.text} delay={64 + i * 12} x={30} y={0}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    fontSize: 30,
                    padding: "18px 24px",
                    borderRadius: 18,
                    backgroundColor: r.ok ? "rgba(255,255,255,0.04)" : "rgba(245,200,76,0.12)",
                    color: r.ok ? C.text : C.gold,
                    fontWeight: r.ok ? 500 : 700,
                  }}
                >
                  {r.ok ? <CheckIcon size={32} color={C.green} /> : <AlertCircleIcon size={32} />}
                  {r.text}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Window>
    </Reveal>
  </Split>
);

const stages = ["Applied", "Screening", "Interview", "Offer"];

const Tracker = () => {
  const frame = useCurrentFrame();
  // Advances one stage every ~20 frames, ending on "Offer".
  const step = interpolate(frame, [40, 110], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Card style={{ padding: 44 }}>
      <div style={{ fontSize: 26, color: C.muted, fontWeight: 600 }}>My applications</div>
      <div style={{ fontSize: 40, fontWeight: 800, marginTop: 8 }}>Waiter / Waitress · F&B</div>
      <div style={{ position: "relative", marginTop: 50, height: 120 }}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 28, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", left: 30, top: 28, height: 6, borderRadius: 3, width: `calc((100% - 60px) * ${step / 3})`, backgroundImage: `linear-gradient(90deg, ${C.copper}, ${C.gold})` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between" }}>
          {stages.map((s, i) => {
            const on = step >= i - 0.02;
            return (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 60 }}>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: on ? C.copper : C.cardHi,
                    border: `3px solid ${on ? C.gold : C.border}`,
                    scale: on && step - i < 0.4 ? 1 + (0.4 - (step - i)) * 0.5 : 1,
                  }}
                >
                  {on ? <CheckIcon size={30} color={C.bg} strokeWidth={3} /> : null}
                </div>
                <div style={{ fontSize: 26, marginTop: 16, fontWeight: 600, color: on ? C.text : C.muted, whiteSpace: "nowrap" }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const Invite = () => {
  const frame = useCurrentFrame();
  const press = interpolate(frame, [150, 156, 164], [1, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const accepted = frame >= 156;
  return (
    <Card style={{ padding: 36, display: "flex", gap: 28, alignItems: "flex-start" }}>
      <div style={{ width: 80, height: 80, borderRadius: 22, display: "grid", placeItems: "center", backgroundColor: "#25d366", color: "white", flexShrink: 0 }}>
        <MessageCircleIcon size={44} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 24, color: C.muted, fontWeight: 600 }}>WhatsApp · Meliá Durrës</div>
        <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>You're invited back for Summer 2027.</div>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          <div style={{ scale: press, padding: "14px 34px", borderRadius: 14, fontSize: 28, fontWeight: 700, backgroundColor: accepted ? C.green : C.copper, color: C.bg }}>
            {accepted ? "Accepted ✓" : "Accept"}
          </div>
          <div style={{ padding: "14px 34px", borderRadius: 14, fontSize: 28, fontWeight: 600, border: `1.5px solid ${C.border}`, color: C.muted, opacity: accepted ? 0.4 : 1 }}>
            Decline
          </div>
        </div>
      </div>
    </Card>
  );
};

export const StudentTrack = () => {
  const slide = useProgress(110, 30);
  return (
    <Split>
      <Copy
        kicker="For students · Applications"
        title={<>Apply in one click. <GradientText>Come back every season.</GradientText></>}
        body="Follow each application to the interview, then get invited back next year instead of applying again."
        benefits={["Every stage in one place", "Invitations by WhatsApp or in-app", "Accept or decline in one tap"]}
        accent={C.copper}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 36 }}>
        <Reveal delay={16} y={80}>
          <Tracker />
        </Reveal>
        <div style={{ opacity: slide, translate: `${(1 - slide) * 140}px 0px`, filter: `blur(${(1 - slide) * 10}px)` }}>
          <Invite />
        </div>
      </div>
    </Split>
  );
};
