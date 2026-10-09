import { useEffect, useRef, useState } from "react";
import { ReviewQueue } from "./product.jsx";
import { BionicTitle, Reveal, SectionHeader } from "./ui.jsx";

const FAROS_URL = "https://www.faros.ai/research/ai-acceleration-whiplash";

// Every other tool still asking for Miya's attention, as small app windows around her review queue.
// Laid out in a top row and a bottom row: they sit behind the queue but never overlap each other.
// x/y: position in the cell, fx/fy: where the window flies in from on arrival.
const TOOLS = [
  { app: "Slack", icon: "slack.svg", title: "#launch", count: "38 new", rows: ["Can someone review the copy?", "Bumping this ↑"], x: "16px", y: "12px", r: -4, fx: -60, fy: -30 },
  { app: "Gmail", icon: "gmail.svg", title: "Inbox", count: "112", rows: ["Re: Q4 deck, final?", "Approval needed: budget"], x: "calc(100% - 186px)", y: "12px", r: 3, fx: 60, fy: -40 },
  { app: "Jira", icon: "jira.svg", title: "To review", count: "12", rows: ["LAUNCH-212 QA sign-off", "LAUNCH-219 Copy check"], x: "16px", y: "calc(100% - 128px)", r: 3, fx: -70, fy: 30 },
  { app: "Drive", icon: "google-drive-sm.svg", title: "Q4 brief", count: "9 comments", rows: ["Suggesting: 14 edits", "Waiting on you"], x: "calc(100% - 186px)", y: "calc(100% - 128px)", r: -3, fx: 70, fy: 40 },
  { app: "Dropbox", icon: "dropbox.svg", title: "Creative", count: "6 files", rows: ["hero_v7_final.png", "Needs your review"], x: "calc(50% - 85px)", y: "12px", r: 1.5, fx: 0, fy: -60 },
];

function ToolWindow({ t, i }) {
  return (
    <div className="tw product" style={{ left: t.x, top: t.y, "--r": `${t.r}deg`, "--fx": `${t.fx}px`, "--fy": `${t.fy}px`, "--i": i }}>
      <div className="tw__bar"><span className="tw__dots"><i /><i /><i /></span></div>
      <div className="tw__head"><img src={`/figma/${t.icon}`} alt="" /><b>{t.title}</b><span className="tw__count">{t.count}</span></div>
      {t.rows.map((r) => <div className="tw__row" key={r}><i />{r}</div>)}
    </div>
  );
}

// plays the arrival once the cell is in view (or straight away with ?static / reduced motion)
function useArrive() {
  const ref = useRef(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("static") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setIn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

export default function Problem() {
  const [ui, arrived] = useArrive();
  return (
    <Reveal as="section" className="section" id="problem">
      <div className="section__inner">
        <SectionHeader
          align="left"
          eyebrow="The problem"
          eyebrowGray
          dark="AI created more work."
          gray="And it lands on the same few experts."
          subtitle="More tools to hop between, more drafts and code to review."
        />

        <div className="section__content ogrid">
          <div className="grid-row kpi">
            <div className="grid-cell kpi__text">
              <div className="block">
                <span className="mono-sm eyebrow">Review time</span>
                <BionicTitle dark="Code takes 5x longer to get reviewed" gray="on teams that use AI heavily." />
              </div>
              <div className="kpi__stats">
                <div>
                  <span className="meter__big display-gradient" aria-hidden="true">5x</span>
                  <p className="text-md subtitle">longer to get code reviewed</p>
                </div>
                <div>
                  <span className="stat-v">22,000</span>
                  <p className="text-md subtitle">developers in the study</p>
                </div>
              </div>
              <p className="source text-xs">
                Source: <a href={FAROS_URL} target="_blank" rel="noreferrer">Faros AI, AI Engineering Report 2026</a>
              </p>
            </div>
            <div ref={ui} className={`grid-cell kpi__ui${arrived ? " is-in" : ""}`} aria-hidden="true">
              {/* clipped on its own layer, so the cell itself can show the grid markers on its edge */}
              <div className="kpi__noise">{TOOLS.map((t, i) => <ToolWindow key={t.app} t={t} i={i} />)}</div>
              <ReviewQueue />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
