import { useEffect, useRef, useState } from "react";
import { Agent, Person } from "./product.jsx";
import { Reveal, SectionHeader } from "./ui.jsx";

/* One job, handed down the crew: the lead Super Agent splits it, three specialists work their piece,
   and only the finished work lands with the person. Steps play in order and loop. */
const PIECES = [
  { agent: "agent-task-progress.png", name: "Research Agent", task: "Competitor pricing", y: 72 },
  { agent: "agent-plum.png", name: "Writer Agent", task: "Landing copy, 3 variants", y: 196 },
  { agent: "agent-green.png", name: "Design Agent", task: "Hero visuals", y: 320 },
];
const H = 392, MID = 196;
// step: 0 job arrives · 1 lead splits · 2 specialists start · 3–5 each one finishes · 6 ready for Miya · 7 hold
const LAST = 7, STEP_MS = 1300;
const isStatic = () => typeof window !== "undefined" && (new URLSearchParams(window.location.search).has("static") || window.matchMedia("(prefers-reduced-motion: reduce)").matches);

function State({ on, done }) {
  if (done) return <span className="p-run is-done"><i className="p-run__ok" />Done</span>;
  if (on) return <span className="p-run"><i className="p-run__spin" />Working</span>;
  return <span className="p-run is-idle">Queued</span>;
}

function Delegation() {
  const [step, setStep] = useState(() => (isStatic() ? 6 : 0));
  useEffect(() => {
    if (isStatic()) return;
    const t = setTimeout(() => setStep((s) => (s >= LAST ? 0 : s + 1)), step === LAST ? 2600 : STEP_MS);
    return () => clearTimeout(t);
  }, [step]);
  const done = (i) => step >= 3 + i;
  const ready = PIECES.filter((_, i) => done(i)).length;
  // connector paths in real pixels (x given in % of the row), so dashes and stroke widths stay true
  const box = useRef(null);
  const [W, setW] = useState(1000);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const c = (x1, y1, x2, y2) => {
    const [a, b] = [(x1 * W) / 100, (x2 * W) / 100], m = (a + b) / 2;
    return `M ${a} ${y1} C ${m} ${y1}, ${m} ${y2}, ${b} ${y2}`;
  };

  return (
    <div ref={box} className="dlg" style={{ height: H }} aria-hidden="true">
      <svg className="dlg__wires" width={W} height={H}>
        <defs>
          <linearGradient id="dlg-g" gradientUnits="userSpaceOnUse" spreadMethod="reflect" x1="0" y1="0" x2="60" y2="0">
            <stop offset="0%" stopColor="#0091FF" />
            <stop offset="50%" stopColor="#6647F0" />
            <stop offset="100%" stopColor="#FF02F0" />
          </linearGradient>
        </defs>
        {[
          [c(22, MID, 27, MID), step >= 1 && step < 3],
          ...PIECES.map((p, i) => [c(49, MID, 54, p.y), step >= 2 && !done(i)]),
          ...PIECES.map((p, i) => [c(78, p.y, 82, MID), done(i) && step < 7]),
        ].map(([d, on], k) => (
          <g key={k}>
            <path d={d} className="dlg__base" />
            {on && <path d={d} pathLength="1" className="dlg__run" />}
          </g>
        ))}
      </svg>

      {/* the job */}
      <div className="dlg__node product dlg__job" style={{ left: 0, width: "22%", top: MID }}>
        <span className="dlg__label">Task</span>
        <b>Launch the Q4 campaign</b>
        <span className="dlg__row"><Person who="miya" size="sm" />Miya <span className="dlg__muted">→ Campaign Lead</span></span>
      </div>

      {/* the lead Super Agent splits it */}
      <div className={`dlg__node product dlg__lead${step >= 1 ? " is-on" : ""}`} style={{ left: "27%", width: "22%", top: MID }}>
        <span className="dlg__head"><Agent img="agent-weekly-update.png" size="sm" /><b>Campaign Lead</b></span>
        <ul className="dlg__split">
          {PIECES.map((p, i) => (
            <li key={p.task} style={{ "--i": i }} className={step >= 1 ? "is-in" : ""}>
              <i className={`dlg__check${done(i) ? " is-done" : ""}`} />{p.task}
            </li>
          ))}
        </ul>
      </div>

      {/* the specialists */}
      {PIECES.map((p, i) => (
        <div key={p.name} className={`dlg__node product dlg__piece${step >= 2 && !done(i) ? " is-on" : ""}`} style={{ left: "54%", width: "24%", top: p.y }}>
          <span className="dlg__head"><Agent img={p.agent} size="sm" /><b>{p.name}</b><State on={step >= 2} done={done(i)} /></span>
          <span className="dlg__muted">{p.task}</span>
        </div>
      ))}

      {/* the person only sees what's ready */}
      <div className={`dlg__node product dlg__me${step >= 6 ? " is-on" : ""}`} style={{ left: "82%", width: "18%", top: MID }}>
        <span className="dlg__head"><Person who="miya" size="sm" /><b>Miya</b></span>
        <span className="dlg__count"><b key={ready}>{ready}</b>/3 ready for your call</span>
        <span className="dlg__btn">Review</span>
      </div>
    </div>
  );
}

export default function Crew() {
  return (
    <Reveal as="section" className="section crew" id="crew">
      <div className="section__inner">
        <SectionHeader
          align="left"
          eyebrow="Super Agents"
          dark="Then give every person"
          gray="their own crew."
          subtitle="A lead Super Agent breaks each job into pieces and hands them to specialists. Each person only sees what’s ready for their call, and when the work grows, the crew grows with it."
        />
        <div className="section__content card dlg__card">
          <Delegation />
        </div>
      </div>
    </Reveal>
  );
}
