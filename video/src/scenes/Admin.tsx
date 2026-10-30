import { SendIcon, SparklesIcon } from "lucide-react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, Card, Counter, EASE_IN_OUT, GradientText, Kicker, Reveal, Stage, Window, useProgress } from "../theme";
import { Copy } from "./Student";

type Person = { name: string; role: string; match: number; top?: boolean };

const COL_W = 380;
const GAP = 24;
const CARD_H = 128;
const ROW = CARD_H + 16;
const HEAD = 70;

const columns: { title: string; people: Person[] }[] = [
  { title: "New", people: [{ name: "Elira Hoxha", role: "Housekeeping", match: 74 }, { name: "Arben Kola", role: "Bartender", match: 68 }] },
  { title: "Screening", people: [{ name: "Sara Meta", role: "Waitress", match: 81 }] },
  { title: "Interview", people: [{ name: "Dritan Leka", role: "Receptionist", match: 95, top: true }] },
  { title: "Hired", people: [{ name: "Klea Brahimi", role: "Chef de partie", match: 90, top: true }] },
];

const PersonCard = ({ p, glow }: { p: Person; glow: number }) => (
  <div
    style={{
      height: CARD_H,
      borderRadius: 18,
      backgroundColor: C.cardHi,
      border: `1.5px solid ${p.top ? `rgba(245,200,76,${0.15 + glow * 0.6})` : C.border}`,
      boxShadow: p.top ? `0 0 ${glow * 40}px rgba(245,200,76,${glow * 0.35})` : undefined,
      padding: "20px 22px",
      display: "flex",
      alignItems: "center",
      gap: 18,
    }}
  >
    <div style={{ width: 60, height: 60, borderRadius: 30, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 24, fontWeight: 800, backgroundColor: "rgba(240,162,75,0.2)", color: C.copper }}>
      {p.name.split(" ").map((s) => s[0]).join("")}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 27, fontWeight: 700, whiteSpace: "nowrap" }}>{p.name}</div>
      <div style={{ fontSize: 22, color: C.muted, marginTop: 4 }}>{p.role}</div>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: p.match >= 85 ? C.green : C.gold }}>{p.match}%</div>
  </div>
);

const Board = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const lift = Math.sin(move * Math.PI);
  const glow = interpolate(frame, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mover: Person = { name: "Luan Shehu", role: "Receptionist", match: 92, top: true };
  return (
    <div style={{ position: "relative", padding: 32, display: "flex", gap: GAP }}>
      {columns.map((col, ci) => (
        <div key={col.title} style={{ width: COL_W }}>
          <div style={{ height: HEAD, display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700 }}>
            {col.title}
            <span style={{ fontSize: 22, color: C.muted, fontWeight: 600 }}>
              {col.people.length + (ci === 1 ? 1 - Math.round(move) : 0) + (ci === 2 ? Math.round(move) : 0)}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {col.people.map((p) => (
              <PersonCard key={p.name} p={p} glow={glow} />
            ))}
            {/* Drop slot under Interview */}
            {ci === 2 ? <div style={{ height: CARD_H, borderRadius: 18, border: `2px dashed rgba(240,162,75,${0.5 * lift})` }} /> : null}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          width: COL_W,
          left: 32 + (COL_W + GAP) * (1 + move),
          top: 32 + HEAD + ROW,
          scale: 1 + lift * 0.06,
          rotate: `${lift * 3}deg`,
          boxShadow: `0 ${lift * 40}px ${lift * 80}px rgba(0,0,0,0.5)`,
          borderRadius: 18,
        }}
      >
        <PersonCard p={mover} glow={glow} />
      </div>
    </div>
  );
};

export const AdminBoard = () => {
  const badge = useProgress(132, 22);
  return (
    <Stage style={{ gap: 44 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Reveal delay={0}>
            <Kicker>For administrators · Applicant board</Kicker>
          </Reveal>
          <Reveal delay={8}>
            <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 20, lineHeight: 1.05 }}>
              Your whole pipeline, <GradientText>ranked by match.</GradientText>
            </div>
          </Reveal>
        </div>
      </div>
      <Reveal delay={18} y={80}>
        <Window url="melia-talent-hub / admin / applicants">
          <Board />
        </Window>
      </Reveal>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {["Drag & drop between stages", "Compare side by side", "Bulk actions & CSV export"].map((t, i) => (
          <Reveal key={t} delay={40 + i * 10} y={20}>
            <div style={{ fontSize: 27, fontWeight: 600, whiteSpace: "nowrap", padding: "14px 24px", borderRadius: 999, border: `1.5px solid ${C.border}`, backgroundColor: "rgba(255,255,255,0.03)" }}>{t}</div>
          </Reveal>
        ))}
        <div style={{ opacity: badge, scale: 0.8 + badge * 0.2, display: "flex", alignItems: "center", gap: 12, fontSize: 27, fontWeight: 700, whiteSpace: "nowrap", padding: "14px 24px", borderRadius: 999, backgroundColor: "rgba(245,200,76,0.15)", color: C.gold }}>
          <SparklesIcon size={30} /> Top picks: best 3 per job
        </div>
      </div>
    </Stage>
  );
};

const cats = [
  { name: "Front Office", pick: 35, of: 60 },
  { name: "Food & Beverage", pick: 40, of: 90 },
  { name: "Housekeeping", pick: 25, of: 50 },
];

const funnel = [
  { label: "Sent", v: 100, color: C.copper },
  { label: "Confirmed", v: 78, color: C.green },
  { label: "Waiting", v: 14, color: C.gold },
  { label: "Declined → backfilled", v: 8, color: C.red },
];

const Bar = ({ pct, delay, color }: { pct: number; delay: number; color: string }) => {
  const p = useProgress(delay, 34, EASE_IN_OUT);
  return (
    <div style={{ height: 16, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct * p}%`, borderRadius: 8, backgroundColor: color }} />
    </div>
  );
};

export const AdminInvite = () => {
  const sent = useProgress(112, 26);
  return (
    <Stage style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 80 }}>
      <Copy
        kicker="For administrators · Invitations"
        title={<>Invite your best 100 of 200 <GradientText>in a few clicks.</GradientText></>}
        body="Set how many you need per category. The highest-rated returning workers are invited first."
        benefits={["Auto-fill from category targets", "Follow up on anyone who hasn't replied", "Declines backfilled automatically"]}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 30 }}>
        <Reveal delay={16} y={80}>
          <Card style={{ padding: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>Summer 2027 campaign</div>
              <div style={{ fontSize: 30, color: C.muted }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: C.text }}>
                  <Counter to={100} delay={30} duration={60} />
                </span>{" "}
                of 200
              </div>
            </div>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 26 }}>
              {cats.map((c, i) => (
                <div key={c.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, marginBottom: 12 }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: C.muted }}>
                      <Counter to={c.pick} delay={30 + i * 10} duration={45} /> of {c.of}
                    </span>
                  </div>
                  <Bar pct={(c.pick / c.of) * 100} delay={30 + i * 10} color={C.copper} />
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                padding: "20px 0",
                borderRadius: 16,
                fontSize: 30,
                fontWeight: 700,
                color: C.bg,
                backgroundColor: sent > 0.5 ? C.green : C.copper,
                scale: 1 - Math.sin(sent * Math.PI) * 0.05,
              }}
            >
              <SendIcon size={30} /> {sent > 0.5 ? "100 invitations sent" : "Send campaign"}
            </div>
          </Card>
        </Reveal>
        <Reveal delay={128} y={50}>
          <Card style={{ padding: "30px 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {funnel.map((f, i) => (
              <div key={f.label}>
                <div style={{ fontSize: 44, fontWeight: 800, color: f.color }}>
                  <Counter to={f.v} delay={136 + i * 6} duration={34} />
                </div>
                <div style={{ fontSize: 22, color: C.muted, marginTop: 4, lineHeight: 1.25 }}>{f.label}</div>
              </div>
            ))}
          </Card>
        </Reveal>
      </div>
    </Stage>
  );
};
