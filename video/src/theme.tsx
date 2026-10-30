import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

// Meliá Durrës palette, taken from the app's dark theme.
export const C = {
  bg: "#140b06",
  card: "#26160d",
  cardHi: "#321d10",
  border: "rgba(255, 215, 170, 0.14)",
  text: "#fbeedb",
  muted: "#c4a285",
  copper: "#f0a24b",
  terracotta: "#d97b3a",
  gold: "#f5c84c",
  green: "#9cc66b",
  red: "#f87171",
};

export const GRADIENT = `linear-gradient(90deg, ${C.copper}, ${C.gold})`;
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 progress between two frames with the house easing. */
export const useProgress = (from: number, duration: number, easing = EASE_OUT) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, from + duration], [0, 1], { ...clamp, easing });
};

/** Fade, rise and un-blur into place. */
export const Reveal = ({
  delay = 0,
  duration = 24,
  y = 40,
  x = 0,
  children,
  style,
}: {
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  children: ReactNode;
  style?: CSSProperties;
}) => {
  const p = useProgress(delay, duration);
  return (
    <div
      style={{
        opacity: p,
        translate: `${(1 - p) * x}px ${(1 - p) * y}px`,
        filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Slow drifting warm glows over a faint grid; shared by every scene. */
export const Backdrop = () => {
  const frame = useCurrentFrame();
  const drift = (speed: number, amp: number) => Math.sin(frame / speed) * amp;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 900,
          right: -200 + drift(70, 60),
          top: -380 + drift(90, 40),
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(240,162,75,0.28), transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 800,
          left: -300 + drift(80, 50),
          bottom: -360 + drift(60, 40),
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(245,200,76,0.16), transparent)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,238,219,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(251,238,219,0.045) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${frame * 0.3}px`,
          maskImage: "radial-gradient(ellipse at 50% 40%, #000 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Kicker = ({ children, color = C.gold }: { children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color }}>
    {children}
  </div>
);

export const GradientText = ({ children }: { children: ReactNode }) => (
  <span style={{ backgroundImage: GRADIENT, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
    {children}
  </span>
);

export const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      backgroundColor: C.card,
      border: `1.5px solid ${C.border}`,
      borderRadius: 28,
      boxShadow: "0 40px 120px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.2)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Browser-style window chrome around a product mock. */
export const Window = ({ url, children, style }: { url: string; children: ReactNode; style?: CSSProperties }) => (
  <Card style={{ overflow: "hidden", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 24px", borderBottom: `1.5px solid ${C.border}` }}>
      {["#f87171", "#f5c84c", "#9cc66b"].map((c) => (
        <span key={c} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c }} />
      ))}
      <span style={{ marginLeft: 16, flex: 1, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", padding: "8px 16px", fontSize: 20, color: C.muted }}>
        {url}
      </span>
    </div>
    {children}
  </Card>
);

/** Circular score that fills and counts up. */
export const Ring = ({ value, size, delay, duration = 45, color = C.green }: { value: number; size: number; delay: number; duration?: number; color?: string }) => {
  const p = useProgress(delay, duration, EASE_IN_OUT);
  const stroke = size * 0.09;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ rotate: "-90deg" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke="rgba(255,255,255,0.08)" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke={color} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (value / 100) * p * c} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: size * 0.28, fontWeight: 800, color: C.text }}>
        {Math.round(value * p)}%
      </div>
    </div>
  );
};

/** Number that counts from 0 to `to`. */
export const Counter = ({ to, delay, duration = 40, prefix = "", suffix = "" }: { to: number; delay: number; duration?: number; prefix?: string; suffix?: string }) => {
  const p = useProgress(delay, duration, EASE_IN_OUT);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {Math.round(to * p)}
      {suffix}
    </span>
  );
};

export const Logo = ({ size = 72 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.26,
      display: "grid",
      placeItems: "center",
      backgroundImage: `linear-gradient(135deg, ${C.copper}, ${C.gold})`,
      color: "white",
      fontWeight: 800,
      fontSize: size * 0.5,
      boxShadow: `0 0 ${size}px rgba(240,162,75,0.45)`,
    }}
  >
    M
  </div>
);

/** Padded full-frame layout shared by most scenes. */
export const Stage = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <AbsoluteFill style={{ fontFamily, color: C.text, padding: "110px 130px", ...style }}>{children}</AbsoluteFill>
);
