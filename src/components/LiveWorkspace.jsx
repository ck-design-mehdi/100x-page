import { useEffect, useLayoutEffect, useRef, useState } from "react";

// One continuous story across three real ClickUp views (Figma "4.0 Product Screens for Marketing"):
//   Board (732:10022)  agents move the project forward
//   Doc   (640:89917)  Writer Agent writes the launch brief, live
//   Chat  (609:105810) Writer Agent posts in #Marketing, tags @Miya and shares the Doc
// Each view is the exported render with live HTML on top, in the render's 960x681 coordinates.
// `onBeat` lets the hero react (Miya's crew, chapter strip) as the story advances.

const W = 960, H = 681;
const A = (n) => `/figma/${n}`;

export const BEATS = ["board", "doc", "chat", "tagged"];

const AGENTS = {
  research: { name: "Research Agent", img: "agent-task-progress.png", tall: true, color: "#6647F0" },
  writer: { name: "Writer Agent", img: "agent-plum.png", tall: true, color: "#FF02F0" },
  planner: { name: "Project Planner", img: "agent-4.png", color: "#0091FF" },
};
const PEOPLE = { miya: "user-miya-lg.png", marc: "user-marc.png", juan: "user-juan.png", celia: "user-celia.png" };

/* ---------------- Board ---------------- */
const COLS = [
  { id: "open", label: "Open", x: 80, tone: "open", icon: "status-needs-update.svg" },
  { id: "progress", label: "In Progress", x: 372, tone: "progress", icon: "status-in-progress.svg" },
  { id: "review", label: "In Review", x: 664, tone: "review", icon: "status-review.svg" },
];
const CARD_X = 6, TOP = 209, GAP = 9;
const INITIAL = [
  { id: "promo", col: "open", title: "Create promotional videos and social media posts", lines: 2, files: 6, people: ["celia", "miya"], date: "Aug 18", prio: "Normal" },
  { id: "email", col: "open", list: "Marketing Campaign", title: "Email Announcement", files: 3, people: ["juan"], date: "Aug 12", late: true, prio: "Low" },
  { id: "badges", col: "progress", list: "Sprint list", title: "Revamp existing badges", files: 3, people: ["miya"], prio: "High" },
  { id: "screen", col: "progress", title: "Product Screen repository", files: 6, people: ["miya", "marc"] },
  { id: "launch", col: "progress", list: "Marketing Campaign", title: "Launch Campaign", files: 12, people: ["miya", "juan"], date: "Sep 3", prio: "High" },
  { id: "contracts", col: "review", list: "Sprint list", title: "Contracts Proposals", files: 2, people: ["celia", "miya", "marc"], date: "Aug 18", prio: "High" },
  { id: "press", col: "review", title: "Press releases for new product features or milestones", lines: 2, files: 8, people: ["marc"], date: "Aug 24", prio: "Low" },
  { id: "seo", col: "review", list: "SEO", title: "SEO Plan", files: 12, people: ["miya", "juan"], date: "Sep 3", prio: "High" },
];
const cardH = (c) => 12 + 21 * (c.lines || 1) + (c.list ? 21 : 0) + 4 + 64 + 6;
function layout(cards) {
  const pos = {}, heights = {};
  for (const col of COLS) {
    let y = TOP;
    cards.filter((k) => k.col === col.id).forEach((c, i) => {
      pos[c.id] = { x: col.x + CARD_X, y, i };
      y += cardH(c) + GAP;
    });
    heights[col.id] = y - 170 + 34;
  }
  return { pos, heights };
}
function moveCard(cards, id, col) {
  const card = { ...cards.find((c) => c.id === id), col };
  const rest = cards.filter((c) => c.id !== id);
  const at = rest.findIndex((c) => c.col === col);
  rest.splice(at < 0 ? rest.length : at, 0, card);
  return rest;
}

/* ---------------- Doc + Chat copy ---------------- */
const DOC_OVERVIEW = "Launch moves to Oct 14. Email Announcement is now in progress, Product Screen is due Friday, and the landing page is waiting for final copy approval.";
const DOC_ITEMS = [
  { who: "Miya", text: "approve the final landing page copy", due: "Today" },
  { who: "Scheduler", text: "booked the launch review", due: "Thu 2pm", done: true },
  { who: "Research Agent", text: "competitor pricing added to the appendix", due: "Done", done: true },
];
// Short enough to sit on one composer line with the Doc chip (no clipping while typing)
const CHAT_TEXT = " the Q4 brief is ready, the landing page copy needs your approval today.";
const MSG_H = 214; // posted message height, the feed shifts up by this

const INITIAL_STATE = {
  view: "board", cards: INITIAL, lifted: null, cursors: {}, fade: false,
  doc: { overview: "", items: 0, checked: false, caret: false },
  chat: { mention: false, draft: "", attach: false, posted: false, reaction: false },
};

// ?scene=doc|compose|chat freezes the story on that scene's end state (reviews, screenshots)
const SCENE = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("scene") : null;
const SCENE_STATE = {
  doc: { ...INITIAL_STATE, view: "doc", doc: { overview: DOC_OVERVIEW, items: DOC_ITEMS.length, checked: true, caret: false } },
  chat: { ...INITIAL_STATE, view: "chat", chat: { mention: true, draft: CHAT_TEXT, attach: true, posted: true, reaction: true } },
  compose: { ...INITIAL_STATE, view: "chat", chat: { mention: true, draft: CHAT_TEXT, attach: true, posted: false, reaction: false } },
};

function useStory(reduced, onBeat) {
  const [s, set] = useState(SCENE_STATE[SCENE] || INITIAL_STATE);
  const beat = useRef(onBeat);
  beat.current = onBeat;
  useEffect(() => {
    if (SCENE_STATE[SCENE]) { beat.current?.(SCENE === "chat" ? "tagged" : SCENE === "compose" ? "chat" : "doc"); return; }
    if (reduced) return;
    let alive = true;
    const timers = [];
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    const patch = (fn) => alive && set((p) => ({ ...p, ...(typeof fn === "function" ? fn(p) : fn) }));
    const cur = (id, pt) => (p) => ({ cursors: { ...p.cursors, [id]: { ...p.cursors[id], on: true, pressed: false, ...pt } } });
    const hide = (id) => (p) => ({ cursors: { ...p.cursors, [id]: { ...p.cursors[id], on: false } } });
    const press = async (id) => { patch(cur(id, { pressed: true })); await wait(130); patch(cur(id, { pressed: false })); };
    const doc = (d) => (p) => ({ doc: { ...p.doc, ...d } });
    const chat = (c) => (p) => ({ chat: { ...p.chat, ...c } });
    const at = (p, id) => layout(p.cards).pos[id];
    // Cursor travel: duration grows with distance, and the script waits for the arrival before acting.
    // A cursor that isn't on screen yet spawns just beside its target and glides in (no pop).
    const last = {};
    const go = async (id, pt, fixed) => {
      const from = last[id];
      if (!from) {
        const spawn = { x: pt.x - 36, y: pt.y + 28 };
        patch(cur(id, { ...spawn, dur: 0 }));
        await wait(40);
        last[id] = spawn;
        return go(id, pt, fixed);
      }
      const dist = Math.hypot(pt.x - from.x, pt.y - from.y);
      const dur = fixed ?? Math.round(Math.min(1100, Math.max(450, 420 + dist * 0.9)));
      last[id] = pt;
      patch(cur(id, { ...pt, dur }));
      await wait(dur + 60);
    };
    const leave = (id) => { patch(hide(id)); delete last[id]; };
    const type = async (text, write, speed) => {
      const words = text.split(/(?<= )/);
      let out = "";
      for (const w of words) { if (!alive) return; out += w; write(out); await wait(speed); }
    };

    (async () => {
      while (alive) {
        beat.current?.("board");
        // ── Board: Research Agent moves Email Announcement into In Progress
        const email = layout(INITIAL).pos.email;
        await go("research", { x: email.x + 150, y: email.y + 50 });
        await press("research");
        patch({ lifted: "email" });
        await wait(220);
        const moved = moveCard(INITIAL, "email", "progress");
        const to = layout(moved).pos.email;
        patch({ cards: moved });
        await go("research", { x: to.x + 150, y: to.y + 50 }, 750); // travels with the card
        patch((p) => ({ lifted: null, cards: p.cards.map((c) => (c.id === "email" ? { ...c, agent: "research", late: false, date: "Oct 14" } : c)) }));
        await wait(400);
        leave("research");
        // ── Board: Project Planner sets Friday + High on Product Screen
        const screen = layout(moved).pos.screen;
        await go("planner", { x: screen.x + 220, y: screen.y + 92 });
        await press("planner");
        patch((p) => ({ cards: p.cards.map((c) => (c.id === "screen" ? { ...c, agent: "planner", date: "Fri", prio: "High", ping: true } : c)) }));
        await wait(700);
        leave("planner");
        // ── Board → Doc: Writer Agent opens the brief from the card
        await go("writer", { x: to.x + 60, y: to.y + 64 });
        await press("writer");
        await wait(100);
        patch({ view: "doc" });
        beat.current?.("doc");
        await go("writer", { x: 470, y: 268 }); // to where the writing starts
        await wait(150);

        // ── Doc: live writing with a collaborative caret
        leave("writer");
        patch(doc({ caret: true }));
        await type(DOC_OVERVIEW, (t) => patch(doc({ overview: t })), 70);
        await wait(300);
        for (let i = 1; i <= DOC_ITEMS.length && alive; i++) { patch(doc({ items: i })); await wait(320); }
        await wait(250);
        patch(doc({ caret: false }));
        // ── Doc → Chat: Share
        await go("writer", { x: 812, y: 54 });
        await press("writer");
        await wait(120);
        patch({ view: "chat" });
        beat.current?.("chat");
        await go("writer", { x: 420, y: 594 }); // into the composer
        await wait(150);

        // ── Chat: tag @Miya, write, attach the Doc, send
        leave("writer");
        patch(chat({ mention: true }));
        await wait(350);
        await type(CHAT_TEXT, (t) => patch(chat({ draft: t })), 55);
        await wait(250);
        patch(chat({ attach: true }));
        await wait(450);
        await go("writer", { x: 874, y: 622 });
        await press("writer");
        patch(chat({ posted: true }));
        await wait(400);
        leave("writer");
        await wait(600);
        beat.current?.("tagged");
        await wait(900);
        patch(chat({ reaction: true }));
        await wait(3200);

        // ── reset
        patch({ fade: true });
        await wait(480); // let the fade-out finish before the board resets
        Object.keys(last).forEach((k) => delete last[k]);
        set({ ...INITIAL_STATE, fade: true });
        await wait(60);
        patch({ fade: false });
        await wait(600);
      }
    })();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, [reduced]);
  return s;
}

export default function LiveWorkspace({ className = "", onBeat }) {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const s = useStory(reduced, onBeat);
  const wrap = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className={`live-board ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <div className="lb-stage product" style={{ transform: `scale(${scale})` }} aria-hidden="true">
        <div className={`lb-layer${s.fade ? " lb-layer--fade" : ""}`}>
          <View on={s.view === "board"}><BoardView s={s} /></View>
          <View on={s.view === "doc"}><DocView doc={s.doc} /></View>
          <View on={s.view === "chat"}><ChatView chat={s.chat} /></View>
          {Object.entries(s.cursors).map(([id, c]) => <Cursor key={id} agent={AGENTS[id]} {...c} />)}
        </div>
      </div>
    </div>
  );
}

// A view: the app navigates, so the new view arrives with a short fade + 8px slide
function View({ on, children }) {
  return <div className={`lw-view${on ? " is-on" : ""}`}>{children}</div>;
}

function BoardView({ s }) {
  const { pos, heights } = layout(s.cards);
  return (
    <>
      <img className="lw-base" src={A("board@2x.png")} alt="" />
      <div className="lb-cover" />
      {COLS.map((col) => (
        <div key={col.id} className={`lb-col lb-col--${col.tone}`} style={{ left: col.x, height: heights[col.id] }}>
          <div className="lb-col__head">
            <span className={`lb-pill lb-pill--${col.tone}`}><img src={A(col.icon)} alt="" />{col.label}</span>
            <span className="lb-count">{s.cards.filter((c) => c.col === col.id).length}</span>
          </div>
          <div className="lb-add" style={{ transform: `translateY(${heights[col.id] - 30}px)` }}>+ Add task</div>
        </div>
      ))}
      {s.cards.map((c) => <Card key={c.id} c={c} at={pos[c.id]} lifted={s.lifted === c.id} />)}
    </>
  );
}

function DocView({ doc }) {
  return (
    <>
      <img className="lw-base" src={A("doc@2x.png")} alt="" />
      <div className="lw-cover" style={{ left: 128, top: 50, width: 300, height: 26 }} />
      <div className="lw-crumb"><img src={A("icon-doc-blue.svg")} alt="" />Q4 Launch brief</div>
      <div className="lw-cover" style={{ left: 150, top: 104, width: 740, height: 566 }} />
      <div className="lw-doc">
        <h4 className="lw-doc__title">Q4 Launch brief</h4>
        <div className="lw-doc__meta">
          <span className="lb-person lb-person--agent av-tall" style={{ "--ring": AGENTS.writer.color, width: 20, height: 20 }}><img src={A(AGENTS.writer.img)} alt="" /></span>
          Writer Agent <span className="lw-dot">·</span> {doc.caret ? <span className="lw-live">Editing now</span> : "Updated just now"}
        </div>
        <hr />
        <h5>Overview</h5>
        <p>
          {doc.overview}
          {doc.caret && <span className="lw-caret"><span className="lw-caret__tag">Writer Agent</span></span>}
        </p>
        <h5 className={doc.items ? "" : "lw-ghost"}>Action items</h5>
        <ul className="lw-doc__items">
          {DOC_ITEMS.slice(0, doc.items).map((it) => (
            <li key={it.text} className={it.done ? "is-done" : ""}>
              <span className="lw-check" />
              <span><b className={it.who === "Miya" ? "lw-mention" : ""}>{it.who === "Miya" ? "@Miya" : it.who}</b> {it.text} <span className="lw-due">({it.due})</span></span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ChatView({ chat }) {
  return (
    <>
      <img className="lw-base" src={A("chat@2x.png")} alt="" />
      {/* feed: the real chat feed as a clipped strip that scrolls up when the message lands */}
      <div className="lw-feed">
        <div className="lw-feed__strip" style={{ transform: `translateY(${chat.posted ? -MSG_H : 0}px)` }} />
        <div className={`lw-msg${chat.posted ? " is-posted" : ""}`}>
          <span className="lw-msg__av av-tall"><img src={A(AGENTS.writer.img)} alt="" /></span>
          <div className="lw-msg__body">
            <div className="lw-msg__head"><b>Writer Agent</b><span className="lw-ai">AI</span><span className="lw-time">4:41 pm</span></div>
            <p><span className="lw-mention">@Miya</span>{CHAT_TEXT}</p>
            <DocEmbed />
            <div className="lw-reacts">
              {chat.reaction && <span className="lw-react is-on">👀 <b>1</b></span>}
              <span className="lw-react-add" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11v1a10 10 0 1 1-9-10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /><path d="M16 5h6" /><path d="M19 2v6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* composer */}
      <div className="lw-cover" style={{ left: 98, top: 578, width: 800, height: 30 }} />
      <div className="lw-compose">
        {(!chat.mention || chat.posted) && <span className="lw-placeholder">Write to Marketing</span>}
        {!chat.posted && chat.mention && <span className="lw-mention">@Miya</span>}
        {!chat.posted && <span style={{ whiteSpace: "pre" }}>{chat.draft}</span>}
        {!chat.posted && chat.mention && <span className="lw-caret lw-caret--plain" />}
        {!chat.posted && chat.attach && <span className="lw-attach"><img src={A("icon-doc-blue.svg")} alt="" />Q4 Launch brief</span>}
      </div>
    </>
  );
}

function DocEmbed() {
  return (
    <div className="lw-embed">
      <div>
        <b>Q4 Launch brief</b>
        <span><img src={A("icon-doc-blue.svg")} alt="" /> Doc in Marketing · Edited just now</span>
      </div>
      <div className="lw-embed__thumb"><i /><i /><i /><i /></div>
    </div>
  );
}

function Card({ c, at, lifted }) {
  const agent = c.agent && AGENTS[c.agent];
  // Outer element travels (position), inner element lifts (rotate/scale/shadow): two timings
  return (
    <div className={`lb-slot${lifted ? " is-lifted" : ""}`} style={{ transform: `translate(${at.x}px, ${at.y}px)`, zIndex: lifted ? 5 : 1, transitionDelay: lifted ? "0ms" : `${at.i * 40}ms` }}>
      <div className="lb-card" style={{ height: cardH(c) }}>
        {c.list && <div className="lb-card__list">{c.list}</div>}
        <div className="lb-card__title">{c.title}</div>
        <div className="lb-card__row">
          <img src={A("icon-description.svg")} alt="" />
          <img src={A("icon-attachment.svg")} alt="" />
          <span className="lb-muted">{c.files}</span>
        </div>
        <div className="lb-card__row">
          <span className="lb-people">
            {c.people.map((p) => <span key={p} className={`lb-person lb-person--${p}`}><img src={A(PEOPLE[p])} alt="" /></span>)}
            {agent && (
              <span className={`lb-person lb-person--agent${agent.tall ? " av-tall" : ""}`} style={{ "--ring": agent.color }}>
                <img src={A(agent.img)} alt="" />
              </span>
            )}
          </span>
          {c.date ? <span key={c.date} className={`lb-chip${c.late ? " is-late" : ""}${c.agent ? " is-ping" : ""}`}><img src={A("icon-date.svg")} alt="" />{c.date}</span> : <span className="lb-chip lb-chip--empty"><img src={A("icon-date.svg")} alt="" /></span>}
          {c.prio && <span key={c.prio} className={`lb-chip lb-chip--${c.prio.toLowerCase()}${c.ping ? " is-ping" : ""}`}><i />{c.prio}</span>}
        </div>
      </div>
    </div>
  );
}

function Cursor({ agent, x, y, on, pressed, dur = 600 }) {
  return (
    <div className={`lb-cursor${on ? " is-on" : ""}${pressed ? " is-pressed" : ""}`} style={{ transform: `translate(${x}px, ${y}px)`, transitionDuration: `${dur}ms, 200ms`, "--c": agent.color }}>
      <span className="lb-cursor__inner">
        <svg viewBox="0 0 16 16" width="18" height="18"><path d="M1 1l5.2 13.4 2-5.6 5.6-2z" fill="var(--c)" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" /></svg>
        <span className="lb-cursor__tag">
          <span className={`lb-cursor__av${agent.tall ? " av-tall" : ""}`}><img src={A(agent.img)} alt="" /></span>
          {agent.name}
        </span>
      </span>
    </div>
  );
}
