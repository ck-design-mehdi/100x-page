import { useEffect, useMemo, useRef, useState } from "react";
import Logo from "./Logo.jsx";
import { Cta, Reveal } from "./ui.jsx";

// A wall of Super Agents at work, with the few people they work for standing out in it.
// The grid follows the screen: 16 columns on desktop, 10 on tablet, 6 on phones.
const AGENTS = ["agent-2.png", "agent-3.png", "agent-4.png", "agent-5.png", "agent-design-manager.png", "agent-green.png", "agent-plum.png", "agent-task-progress.png", "agent-weekly-update.png"];
const TALL = new Set(["agent-task-progress.png", "agent-plum.png", "agent-green.png", "agent-weekly-update.png"]);
// people, placed by [column fraction, row]
const PEOPLE = [[0.2, 1, "celia", "user-celia.png"], [0.8, 1, "miya", "user-miya-lg.png"], [0.3, 6, "marc", "user-marc.png"], [0.75, 6, "juan", "user-juan.png"]];
const gridFor = (w) => (w < 640 ? { cols: 6, rows: 8 } : w < 1024 ? { cols: 10, rows: 8 } : { cols: 16, rows: 8 });
function buildCells({ cols, rows }) {
  const people = {};
  for (const [fx, row, who, img] of PEOPLE) people[row * cols + Math.round(fx * (cols - 1))] = [who, img];
  return Array.from({ length: cols * rows }, (_, i) => people[i] ? { person: people[i] } : { agent: AGENTS[(i * 7 + Math.floor(i / cols) * 3) % AGENTS.length] });
}
// a cell's starting state: most agents are working, some are done, a few idle
const seed = (i) => ((i * 2654435761) >>> 0) % 10;
const initial = (cells) => cells.map((c, i) => (c.person ? null : seed(i) < 4 ? "run" : seed(i) < 6 ? "ok" : null));
// curved wall: each column sits on the inside of a cylinder, so the edges bend toward the viewer
const R = 900;
const curve = (i, cols) => {
  const step = 73.6 / cols; // same total arc whatever the column count
  const t = ((i % cols) - (cols - 1) / 2) * step;
  return { "--z": `${(R * (1 - Math.cos((t * Math.PI) / 180))).toFixed(1)}px`, "--ry": `${-t}deg`, "--d": Math.abs((i % cols) - (cols - 1) / 2).toFixed(1) };
};
function useGrid() {
  const [grid, setGrid] = useState(() => gridFor(typeof window === "undefined" ? 1440 : window.innerWidth));
  useEffect(() => {
    const on = () => setGrid((g) => { const n = gridFor(window.innerWidth); return n.cols === g.cols ? g : n; });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return grid;
}

// cursor: the agents near the pointer wake up and lean out of the wall, and the wall's vanishing point follows
function useCursor(ref, key) {
  useEffect(() => {
    const wall = ref.current, host = wall.parentElement;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = [...wall.children];
    let pts = [], raf = 0, x = 0, y = 0;
    const measure = () => { pts = cells.map((el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); };
    const paint = () => {
      raf = 0;
      const box = wall.getBoundingClientRect();
      wall.style.setProperty("--ox", `${(((x - box.left) / box.width) * 100 - 50) * 0.5 + 50}%`);
      wall.style.setProperty("--oy", `${(((y - box.top) / box.height) * 100 - 50) * 0.5 + 50}%`);
      cells.forEach((el, i) => {
        const d = Math.hypot(pts[i][0] - x, pts[i][1] - y);
        el.style.setProperty("--p", Math.max(0, 1 - d / 170).toFixed(3));
      });
    };
    const move = (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(paint); };
    const leave = () => { cancelAnimationFrame(raf); raf = 0; cells.forEach((el) => el.style.setProperty("--p", 0)); wall.style.removeProperty("--ox"); wall.style.removeProperty("--oy"); };
    host.addEventListener("pointerenter", measure);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", measure, { passive: true });
    return () => { cancelAnimationFrame(raf); host.removeEventListener("pointerenter", measure); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); window.removeEventListener("scroll", measure); };
  }, [ref, key]);
}

function Mosaic() {
  const wall = useRef(null);
  const grid = useGrid();
  const cells = useMemo(() => buildCells(grid), [grid]);
  useCursor(wall, grid.cols);
  const [states, setStates] = useState(() => initial(cells));
  useEffect(() => setStates(initial(cells)), [cells]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).has("static")) return;
    // every beat a few agents move on: idle → working → done → idle
    const t = setInterval(() => setStates((prev) => {
      const next = prev.slice();
      for (let n = 0; n < 6; n++) {
        const i = Math.floor(Math.random() * cells.length);
        if (cells[i].person) continue;
        next[i] = next[i] === "run" ? "ok" : next[i] === "ok" ? null : "run";
      }
      return next;
    }), 700);
    return () => clearInterval(t);
  }, [cells]);

  return (
    <div ref={wall} className="mosaic" aria-hidden="true" style={{ "--cols": grid.cols }}>
      {cells.map((c, i) => c.person ? (
        <span key={i} className="mosaic__cell mosaic__cell--me" style={curve(i, grid.cols)}>
          <span className={`mosaic__av lb-person lb-person--${c.person[0]}`}><img src={`/figma/${c.person[1]}`} alt="" /></span>
        </span>
      ) : (
        <span key={i} className={`mosaic__cell${states[i] ? ` is-${states[i]}` : ""}`} style={curve(i, grid.cols)}>
          <span className={`mosaic__av${TALL.has(c.agent) ? " av-tall" : ""}`}><img src={`/figma/${c.agent}`} alt="" /></span>
          <i className="mosaic__state">{states[i] === "run" ? <i className="p-run__spin" /> : states[i] === "ok" ? <i className="p-run__ok" /> : null}</i>
        </span>
      ))}
    </div>
  );
}

export default function Closing() {
  return (
    <section className="section" id="start">
      <div className="section__inner">
        <Reveal className="cta-wall">
          <Mosaic />
          <div className="block cta-wall__text">
            <div className="block__text">
              <h2 className="display-xl"><span className="t-dark">Blow up the old org chart.</span><br /><span className="t-gray">Build a 100x one.</span></h2>
              <p className="text-lg subtitle">Start your 100x org in ClickUp with one team this week.</p>
            </div>
            <Cta arrow />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot nav-wrap">
      <div className="foot__inner text-sm">
        <Logo />
        <span>100x work · © 2026 ClickUp</span>
      </div>
    </footer>
  );
}
