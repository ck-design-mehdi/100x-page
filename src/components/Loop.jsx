import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";
import { Agent, BrainMark, Person } from "./product.jsx";
import { Reveal, SectionHeader } from "./ui.jsx";
import PulseGL from "./PulseGL.jsx";

const A = (n) => `/figma/${n}`;

/* The taste loop, horizontal: Brain² on a soft isometric pedestal on the left, the four moments as
   product windows in a row on the right. A light rail runs from Brain² to the windows and its pulse
   moves to the moment that is playing. */

// isometric pedestal (SVG), drawn in its own 520x380 box
const PW = 520, PH = 380, CX = 260, CY = 236, K = 58, COS = 0.866, SIN = 0.5;
const P = (x, y, z = 0) => [CX + (x - y) * COS * K, CY + (x + y) * SIN * K - z * K];
function roundedTop(cx, cy, half, r, z) {
  const out = [];
  const corners = [[half - r, half - r, 0], [-(half - r), half - r, 90], [-(half - r), -(half - r), 180], [half - r, -(half - r), 270]];
  for (const [ox, oy, a0] of corners) {
    for (let a = a0; a <= a0 + 90; a += 10) {
      const t = (a * Math.PI) / 180;
      out.push(P(cx + ox + Math.cos(t) * r, cy + oy + Math.sin(t) * r, z));
    }
  }
  return "M " + out.map((p) => p.join(",")).join(" L ") + " Z";
}
function Platform({ half, h, z0 = 0, top = "#FFFFFF" }) {
  const r = Math.min(1.1, half * 0.42), bands = [];
  for (let z = z0; z < z0 + h; z += 0.04) bands.push(roundedTop(0, 0, half, r, z));
  return (
    <g>
      {z0 === 0 && <path d={roundedTop(0.4, 0.6, half, r, -0.3)} className="iso-plat__shadow" />}
      {bands.map((d, i) => <path key={i} d={d} fill="url(#iso-side)" />)}
      <path d={roundedTop(0, 0, half, r, z0 + h)} className="iso-plat__top" fill={top} />
      <path d={roundedTop(0, 0, half - 0.25, r * 0.8, z0 + h)} className="iso-plat__inset" />
    </g>
  );
}

const TOOLS = ["clickup-lg.svg", "google-drive-sm.svg", "slack.svg", "gmail.svg", "jira.svg", "dropbox.svg"];

// counts up to `to` while the moment plays, shows the final number otherwise
function Count({ on, to, ms = 2400 }) {
  const [n, setN] = useState(to);
  useEffect(() => {
    if (!on) { setN(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, to, ms]);
  return n.toLocaleString("en-US");
}

const words = (text, from = 0) => text.split(" ").map((w, i) => <span key={i} className="orb-ev__w" style={{ "--i": from + i }}>{w} </span>);

// Each moment: what its card shows while it plays (`on`) and once it is done (`done`)
const MOMENTS = [
  {
    n: "01", title: "Brain² learns", desc: "Reads your projects, docs, chats.", foot: (on) => <><Count on={on} to={2184} /> items · 6 tools</>,
    head: <><BrainMark size={20} /><b>Brain²</b></>,
    meta: (on, done) => (on && !done ? <span className="p-run"><i className="p-run__spin" />Indexing</span> : <span className="p-run is-done"><i className="p-run__ok" />Up to date</span>),
    body: (on) => (
      <div className="orb-ev__index">
        <span className="orb-ev__tools">{TOOLS.map((t, i) => <img key={t} src={A(t)} alt="" style={{ "--i": i }} />)}</span>
        <span className="orb-ev__bar"><i /></span>
        <span className="orb-ev__src">Q4 brief · Brand guide · #launch</span>
      </div>
    ),
  },
  {
    n: "02", title: "Agents draft", desc: "Agents write with that context.", foot: () => "Context: Q4 brief, 3 past launches",
    head: <><Agent img="agent-plum.png" size="sm" /><b>Writer Agent</b></>,
    meta: (on, done) => (on && !done ? <span className="p-run"><i className="p-run__spin" />Writing</span> : <span className="p-run is-done"><i className="p-run__ok" />Draft ready</span>),
    body: () => (
      <div className="orb-ev__doc">
        <span className="orb-ev__doc-title"><img src={A("icon-doc-blue.svg")} alt="" />Hotel landing page</span>
        <span className="orb-ev__lines">
          <i style={{ width: "96%", "--i": 0 }} /><i style={{ width: "82%", "--i": 1 }} /><i style={{ width: "90%", "--i": 2 }} /><i className="is-writing" style={{ width: "54%", "--i": 3 }} />
        </span>
      </div>
    ),
  },
  {
    n: "03", title: "You react", desc: "Tag Brain² on what’s off.", foot: () => "1 note for Brain²",
    head: <><Person who="miya" size="sm" /><b>Miya</b></>,
    meta: () => "now",
    body: () => (
      <div className="orb-ev__note">
        <blockquote>“We would like to <mark>inform you that our establishment</mark> is open.”</blockquote>
        <span className="orb-ev__say"><span className="p-link orb-ev__w" style={{ "--i": 0 }}>@Brain² </span>{words("too formal, keep it warm.", 1)}</span>
      </div>
    ),
  },
  {
    n: "04", title: "Skills remember", desc: "The fix becomes a Skill.", foot: () => "Applies to every next draft",
    head: <><span className="orb-ev__gem"><img src={A("skill-gem.svg")} alt="" /></span><b>Brand voice</b></>,
    // the Skill stays on v3 while the fixes land, and only turns v4 once Warm and Short are in
    meta: (on) => (on
      ? <span className="ev-ver"><span className="p-badge ev-ver__old">v3</span><span className="p-badge ev-ver__new">v4</span></span>
      : <span className="p-badge">v4</span>),
    body: () => (
      <ul className="orb-ev__diff">
        <li style={{ "--i": 0 }}><s>Formal</s><Icon name="arrow" /><b>Warm</b></li>
        <li style={{ "--i": 1 }}><s>Long</s><Icon name="arrow" /><b>Short</b></li>
      </ul>
    ),
  },
];
const STEP_MS = 3800;

// measures where Brain² and each window sit, so the connectors can be drawn between them
function useAnchors(wrap, brainRef, cardRefs) {
  const [g, setG] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const box = wrap.current.getBoundingClientRect();
      const b = brainRef.current.getBoundingClientRect();
      const from = [b.left + b.width / 2 - box.left, b.bottom - box.top];
      const to = cardRefs.current.map((el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 - box.left, r.top - box.top - 16]; }); // stop 16px above the card
      setG({ w: box.width, h: box.height, from, to });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [wrap, brainRef, cardRefs]);
  return g;
}

export default function Loop() {
  const [step, setStep] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setStep((n) => (n + 1) % MOMENTS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [step, reduced]);
  // a moment's card switches to its finished state shortly before the next one starts
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(false);
    const t = setTimeout(() => setDone(true), STEP_MS - 900);
    return () => clearTimeout(t);
  }, [step]);
  const brain = P(0, 0, 1.9);
  const wrap = useRef(null), brainRef = useRef(null), cardRefs = useRef([]);
  const g = useAnchors(wrap, brainRef, cardRefs);
  const curve = ([x1, y1], [x2, y2]) => `M ${x1} ${y1} C ${x1} ${y1 + 70}, ${x2} ${y2 - 90}, ${x2} ${y2}`;

  return (
    <Reveal as="section" className="section loop" id="loop">
      <div ref={wrap} className="section__inner loop2">
        {/* connectors: only the playing moment is wired to Brain². No full line: a short stroke in the
            ClickUp gradient keeps running from Brain² to the moment while it plays. */}
        {g && (
          <svg className="loop2__wires" width={g.w} height={g.h} aria-hidden="true">
            <defs>
              {g.to.map((t, i) => {
                // a looping gradient, half the link long, that slides from Brain² toward the moment
                const dx = (t[0] - g.from[0]) / 2, dy = (t[1] - g.from[1]) / 2;
                return (
                  <linearGradient key={i} id={`wire-g${i}`} gradientUnits="userSpaceOnUse" spreadMethod="repeat" x1={g.from[0]} y1={g.from[1]} x2={g.from[0] + dx} y2={g.from[1] + dy}>
                    <stop offset="0%" stopColor="#0091FF" />
                    <stop offset="33%" stopColor="#6647F0" />
                    <stop offset="66%" stopColor="#FF02F0" />
                    <stop offset="100%" stopColor="#0091FF" />
                    {!reduced && <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to={`${dx} ${dy}`} dur="1.6s" repeatCount="indefinite" />}
                  </linearGradient>
                );
              })}
            </defs>
            {g.to.map((t, i) => {
              const d = curve(g.from, t);
              const on = i === step;
              return (
                <g key={i} className={`loop2__link${on ? " is-on" : ""}`}>
                  <path d={d} className="loop2__rail" />
                  {on && <path d={d} pathLength="1" className="loop2__run" style={{ stroke: `url(#wire-g${i})` }} key={`run${step}`} />}
                </g>
              );
            })}
          </svg>
        )}

        <div className="loop2__top">
          {/* Brain², bigger, on its pedestal */}
          <div className="split__brain loop2__brain" aria-hidden="true">
            <svg viewBox={`0 0 ${PW} ${PH}`} className="split__svg">
              <defs>
                <linearGradient id="iso-side" x1="0" x2="1">
                  <stop offset="0%" stopColor="#F0F0F0" />
                  <stop offset="50%" stopColor="#E8E8E8" />
                  <stop offset="100%" stopColor="#F0F0F0" />
                </linearGradient>
                <radialGradient id="iso-halo">
                  <stop offset="0%" stopColor="#B38CFF" stopOpacity=".55" />
                  <stop offset="50%" stopColor="#FF8AF7" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#7ACAFF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="iso-orbit-fade" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#E0E0E0" stopOpacity="0" />
                  <stop offset="65%" stopColor="#E0E0E0" stopOpacity=".9" />
                  <stop offset="100%" stopColor="#E0E0E0" stopOpacity=".3" />
                </linearGradient>
                <linearGradient id="iso-orbit-g" x1="0" x2="1">
                  <stop offset="0%" stopColor="#0091FF" />
                  <stop offset="50%" stopColor="#6647F0" />
                  <stop offset="100%" stopColor="#FF02F0" />
                </linearGradient>
              </defs>
              <Platform half={2.3} h={0.5} />
              <Platform half={1.2} h={1.4} z0={0.5} />
            </svg>
            <div className="iso-brain" style={{ left: `${(brain[0] / PW) * 100}%`, top: `${(brain[1] / PH) * 100}%` }}>
              <PulseGL beat={step} className="iso-pulse" />
              <span key={step} className="iso-brain__beat">
                <img className="p-brain-mark" src="/figma/brain-mark-body.svg" alt="" style={{ width: 110, height: 110 }} />
                <img className="iso-brain__star" src="/figma/brain-star.svg" alt="" />
              </span>
            </div>
            <span ref={brainRef} className="loop2__anchor" />
          </div>

          <SectionHeader
            align="left"
            eyebrow="The taste loop"
            dark="Teach the AI your taste once."
            gray="The next draft starts there."
            size="display-lg"
            subtitle="Super Agents do the work with everything Brain² knows about your projects. Your part is taste. Tag Brain² on what’s off and it saves the fix as a Skill."
          />
        </div>

        {/* the four moments, below, each wired to Brain² */}
        <div className="split__moments loop2__moments" aria-hidden="true">
          {MOMENTS.map((m, i) => (
            <div key={m.n} ref={(el) => (cardRefs.current[i] = el)} className={`split__m${i === step ? " is-on" : ""}${i < step ? " is-past" : ""}`}>
              <div className="split__label">
                <span className="split__n"><span className="split__num">{m.n}</span>{m.title}</span>
                <p className="split__desc">{m.desc}</p>
              </div>
              <div className="orb-ev__card product">
                <div className="orb-ev__head">{m.head}<span className="orb-ev__meta">{m.meta(i === step, done)}</span></div>
                <div className="orb-ev__body">{m.body(i === step)}</div>
                <div className="orb-ev__foot">{m.foot(i === step)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
