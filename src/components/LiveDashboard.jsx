import { useEffect, useState } from "react";

// The Figma "Q2 Project Launch" dashboard (node 640:106971) with live charts.
// The app frame (sidebar, header, tabs, cards) is the exported render; the charts are redrawn
// in SVG on top, in the render's own 960x681 coordinates. Every few seconds the data changes and
// bars, lines, dots and areas morph to the new values (CSS transitions on y/height/cx/cy/d).

const W = 960, H = 681;

// Sprint velocity: 5 sprints, forecast (gray) and velocity (purple), in points
const VELOCITY = [
  { f: [25.6, 41.6, 20, 34.8, 32], v: [14, 37.4, 14.8, 30.3, 35.5], cur: 23, avg: 30, sprints: 7 },
  { f: [27, 40, 24, 36, 38], v: [18, 39, 21, 34, 41], cur: 26, avg: 31, sprints: 8 },
  { f: [24, 43, 22, 33, 40], v: [21, 41, 26, 37, 44], cur: 29, avg: 33, sprints: 9 },
];
const SPRINTS = ["Apr 7", "Apr 14", "Apr 21", "Apr 28", "May 3"];
const BAR_X = [136, 204, 272, 340, 408];
const vy = (v) => 436.5 - v * 3.1; // 10 pts = 31px, baseline at 436.5

// Cumulative flow: thousands of tasks (not started, active, complete), 6 weeks
const FLOW = [
  { ns: [5.2, 4.9, 4.3, 4.2, 4.8, 4.5], ac: [0.5, 0.9, 1.5, 1.3, 2.6, 4.5], co: [0.4, 0.7, 1.1, 0.9, 1.8, 3.3] },
  { ns: [5.2, 5, 4.6, 4.4, 4.9, 4.9], ac: [0.6, 1.2, 1.9, 2, 3.2, 4.9], co: [0.4, 0.9, 1.4, 1.5, 2.5, 4.1] },
  { ns: [5.3, 5.1, 4.8, 4.7, 5.1, 5.2], ac: [0.8, 1.5, 2.3, 2.8, 3.9, 5.2], co: [0.5, 1.1, 1.8, 2.2, 3.2, 4.8] },
];
const FX = [548, 618, 688, 758, 828, 899];
const fy = (k) => 449 - k * 39.5;
const area = (top) => `M${FX[0]} 449 ` + top.map((k, i) => `L${FX[i]} ${fy(k).toFixed(1)}`).join(" ") + ` L${FX[5]} 449 Z`;

// Sprint burnup stats
const BURNUP = [
  { total: 23, guide: 30, done: 7, started: 36 },
  { total: 26, guide: 30, done: 9, started: 38 },
  { total: 29, guide: 31, done: 12, started: 41 },
];

const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function LiveDashboard({ className = "" }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % VELOCITY.length), 4000);
    return () => clearInterval(t);
  }, []);

  const vel = VELOCITY[i], flow = FLOW[i], bu = BURNUP[i];
  const line = (vals, dx) => vals.map((v, k) => `${k ? "L" : "M"}${BAR_X[k] + dx} ${vy(v).toFixed(1)}`).join(" ");
  const d = (path) => ({ d: `path("${path}")` });

  return (
    <div className={`live-dash ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <img src="/figma/dashboard.png" alt="" />
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {/* --- Sprint velocity --- */}
        <rect x="92" y="238" width="380" height="226" fill="#FFFFFF" />
        <Stat x={96} label="Current velocity" value={`${vel.cur} pts`} />
        <Stat x={233} label="Average forecast" value={`${vel.avg} pts`} />
        <Stat x={370} label="Sprints" value={vel.sprints} />
        {[50, 40, 30, 20, 10, 0].map((n) => (
          <g key={n}>
            <text x="96" y={vy(n) + 3.5} className="ld-axis">{n}</text>
            <line x1="119" x2="474" y1={vy(n)} y2={vy(n)} className="ld-grid" />
          </g>
        ))}
        {BAR_X.map((x, k) => (
          <g key={x}>
            <rect x={x} width="20" rx="1.5" fill="#E6E6E6" className="ld-bar" style={{ y: vy(vel.f[k]), height: 436.5 - vy(vel.f[k]) }} />
            <rect x={x + 20} width="20" rx="1.5" fill="#C9C3F7" className="ld-bar" style={{ y: vy(vel.v[k]), height: 436.5 - vy(vel.v[k]) }} />
            <text x={x + 20} y="455" className="ld-axis" textAnchor="middle">{SPRINTS[k]}</text>
          </g>
        ))}
        <path className="ld-line ld-line--forecast" style={d(line(vel.f, 10))} />
        <path className="ld-line ld-line--velocity" style={d(line(vel.v, 30))} />
        {vel.f.map((v, k) => <circle key={`f${k}`} cx={BAR_X[k] + 10} r="2.4" fill="#202020" className="ld-dot" style={{ cy: vy(v) }} />)}
        {vel.v.map((v, k) => <circle key={`v${k}`} cx={BAR_X[k] + 30} r="2.6" fill="#8B3FF0" className="ld-dot" style={{ cy: vy(v) }} />)}

        {/* --- Cumulative flow --- */}
        <rect x="514" y="200" width="396" height="262" fill="#FFFFFF" />
        {[6, 4, 2, 0].map((k) => (
          <g key={k}>
            <text x="536" y={fy(k) + 3.5} className="ld-axis" textAnchor="end">{k ? `${k}k` : "0"}</text>
            <line x1="548" x2="899" y1={fy(k)} y2={fy(k)} className="ld-grid" />
          </g>
        ))}
        {FX.map((x) => <line key={x} x1={x} x2={x} y1={fy(6)} y2="449" className="ld-grid" />)}
        <path className="ld-area" fill="#E9E9EF" style={d(area(flow.ns))} />
        <path className="ld-area" fill="#14A39A" style={d(area(flow.ac))} />
        <path className="ld-area" fill="#1FC486" style={d(area(flow.co))} />
        <g className="ld-legend" transform="translate(668 218)">
          <rect width="9" height="9" rx="2" fill="#E0E0E6" /><text x="16" y="8">Not started</text>
          <rect x="92" width="9" height="9" rx="2" fill="#14A39A" /><text x="108" y="8">Active</text>
          <rect x="157" width="9" height="9" rx="2" fill="#1FC486" /><text x="173" y="8">Complete</text>
        </g>

        {/* --- Sprint burnup stats --- */}
        <rect x="92" y="590" width="470" height="22" fill="#FFFFFF" />
        <Value x={96} y={604} v={`${bu.total} pts`} />
        <Value x={233} y={604} v={`${bu.guide} pts`} />
        <Value x={370} y={604} v={bu.done} />
        <Value x={506} y={604} v={`${bu.started} pts`} />
      </svg>
    </div>
  );
}

function Stat({ x, label, value }) {
  return (
    <g>
      <text x={x} y="232" className="ld-label">{label}</text>
      <Value x={x} y={254} v={value} />
    </g>
  );
}

function Value({ x, y, v }) {
  return <text key={String(v)} x={x} y={y} className="ld-value">{v}</text>;
}
