// ClickUp product UI pieces, recreated from Figma "4.0 Product Screens for Marketing".
// Assets live in /public/figma (exported from the same file).

const A = (name) => `/figma/${name}`;

const PEOPLE = {
  marc: { img: "user-marc.png" },
  miya: { img: "user-miya-lg.png" },
  juan: { img: "user-juan.png" },
};

export function Person({ who, size }) {
  return (
    <span className={`p-person p-person--${who}${size === "sm" ? " p-person--sm" : ""}`}>
      <img src={A(PEOPLE[who].img)} alt="" />
    </span>
  );
}

export function Agent({ img = "agent-task-progress.png", size }) {
  return (
    <span className={`p-agent${size === "sm" ? " p-agent--sm" : ""}`}>
      <span className={`p-agent__clip${TALL.has(img) ? " is-tall" : ""}`}><img src={A(img)} alt="" /></span>
      <img className="p-agent__spark" src={A("ai-star-fill.svg")} alt="" />
    </span>
  );
}

export function TaskLink({ name, status, kind, people = [], icon = "status-in-progress.svg" }) {
  return (
    <span className="p-task">
      <span className="p-task__name"><img src={A(icon)} alt="" />{name}</span>
      {status && <span className={`p-status p-status--${kind}`}>{status}</span>}
      {people.length > 0 && (
        <span className="p-stack">{people.map((p) => <Person key={p} who={p} size="sm" />)}</span>
      )}
    </span>
  );
}

function WindowHead({ title, icon }) {
  return (
    <div className="p-window__head">
      <span className="p-window__title p-label">{icon}{title}</span>
      <span className="p-window__ask p-label"><img src={A("brain-ai-outlined.svg")} alt="" />Ask</span>
    </div>
  );
}

/* Hero focus: Task Activity with the Weekly Update Agent (node 2088:174894) */
export function TaskActivity() {
  return (
    <div className="product p-window p-activity">
      <div className="p-window__head"><span className="p-label" style={{ fontWeight: 500, color: "var(--p-text-2)" }}>Task Activity</span></div>
      <div className="p-sheet" style={{ borderRadius: 12, margin: "0 5px 5px" }}>
        <div className="p-msg">
          <Person who="miya" />
          <div className="p-msg__body">
            <span className="p-label">Miya</span>
            <span className="p-body">What’s the latest on this campaign?</span>
          </div>
        </div>
        <div className="p-msg">
          <Agent img="agent-weekly-update.png" />
          <div className="p-msg__body p-body">
            <span className="p-label">Weekly Update Agent</span>
            <span>Hey <span className="p-link">@Miya</span>! The campaign is on track for launch. Here’s the update for campaign task:</span>
            <ul>
              <li><TaskLink name="Launch Email" icon="icon-subtask.svg" /> subtask 80% done.</li>
              <li><span className="p-link">@Taylor</span> will finalize the landing page by Friday.</li>
              <li><span className="p-link">@Stormie</span> will preview the design on Monday.</li>
              <li><span className="p-link">@Brian</span>, social ads ready for approval.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Brain² card: Task Progress Agent answering Marc (node 2088:173273) */
export function TaskProgressChat() {
  return (
    <div className="product p-window">
      <WindowHead title="Task Progress Agent" icon={<Agent size="sm" />} />
      <div className="p-sheet">
        <div className="p-msg">
          <Person who="marc" />
          <div className="p-msg__body">
            <span className="p-label">Marc</span>
            <span className="p-body">What’s my prioritization for this week?</span>
          </div>
        </div>
        <div className="p-msg">
          <Agent />
          <div className="p-msg__body">
            <span className="p-label">Task Progress Agent</span>
            <span className="p-body">Hey <span className="p-link">@Marc</span>, here’s your prioritization for this week:</span>
            <TaskLink name="Landing Page Design" status="In progress" kind="progress" people={["miya", "marc"]} icon="status-in-progress.svg" />
            <TaskLink name="Content and Layout Execution" status="Review" kind="review" people={["marc", "juan"]} icon="status-review.svg" />
            <TaskLink name="Building Out Page Section" status="Needs update" kind="update" people={["marc"]} icon="status-needs-update.svg" />
          </div>
        </div>
      </div>
    </div>
  );
}

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5z" /></svg>
);

/* Super Agent profile: Design manager (node 2088:170365, header part) */
export function AgentProfile({ withMemory = false, memoryRows = 5 }) {
  return (
    <div className="product p-profile">
      <div className="p-profile__head">
        <div className="p-profile__who">
          <span className="p-profile__avatar">
            <img src={A("agent-design-manager.png")} alt="" />
            <img className="p-online" src={A("online-indicator.svg")} alt="" />
          </span>
          <div>
            <div className="p-profile__name">Design manager <img src={A("ai-agent-colored.png")} alt="" /></div>
            <div className="p-profile__desc">Automates and manages the entire design team</div>
          </div>
        </div>
        <div className="p-profile__actions">
          <span className="p-btn p-btn--primary"><MessageIcon />Message</span>
          <span className="p-btn p-btn--secondary"><PlayIcon />Run agent</span>
          <span className="p-btn p-btn--secondary p-btn--icon">⋮</span>
        </div>
      </div>
      {withMemory && <KnowledgeMemory rows={memoryRows} />}
    </div>
  );
}

const SOURCES = [
  ["clickup-sm.svg", "ClickUp", "Workspace"],
  ["google-drive.svg", "Google Drive"],
  ["slack.svg", "Slack"],
  ["gmail.svg", "Gmail"],
  ["jira.svg", "Jira"],
];

/* Knowledge & Memory toggles (node 2088:170418 + 2088:170432) */
export function KnowledgeMemory({ rows = 5 }) {
  return (
    <div className="product p-km">
      <div className="p-km__head">
        Knowledge &amp; Memory
        <span className="p-km__apps">
          <img src={A("lock.svg")} alt="" /><img src={A("clickup-sm.svg")} alt="" /><img src={A("google-drive.svg")} alt="" /><img src={A("slack.svg")} alt="" />
        </span>
      </div>
      {SOURCES.slice(0, rows).map(([icon, name, sub]) => (
        <div className="p-km__row" key={name}>
          <img src={A(icon)} alt="" />
          <span>{name}{sub && <small> · {sub}</small>}</span>
          <img src={A("switch-on.svg")} alt="" />
        </div>
      ))}
    </div>
  );
}

// Full-body renders that need the head-and-shoulders crop
const TALL = new Set(["agent-green.png", "agent-plum.png", "agent-task-progress.png", "agent-weekly-update.png"]);

const ROLES = [
  { group: "Product & Engineering", items: [["agent-4.png", "Project Planner", "Schedule Velocity"], ["agent-3.png", "Release Notes", "Note Generator"], ["agent-2.png", "Scheduler", "Optimizes your time"], ["edit.svg", "Writer", "Polishes your Wikis"]] },
  { group: "Research", items: [["agent-5.png", "Project Planner", "Drives delivery"], ["agent-green.png", "Analyst", "Finds insights"], ["agent-plum.png", "Researcher", "Digs into sources"], ["edit.svg", "Writer", "Drafts the brief"]] },
];

/* Super Agent Builder: a crew of specialists (node 2088:173534) */
export function SuperAgentBuilder() {
  return (
    <div className="product p-window">
      <WindowHead title="Super Agent Builder" icon={<img src={A("super-agent-glasses.png")} alt="" style={{ width: 18, height: "auto" }} />} />
      <div className="p-sheet" style={{ paddingTop: 0 }}>
        {ROLES.map(({ group, items }) => (
          <div key={group}>
            <div className="p-group">{group}</div>
            <div className="p-roles">
              {items.map(([img, name, desc]) => (
                <div className="p-role" key={group + name}>
                  <span className="p-role__icon">{TALL.has(img) ? <span className="av-tall"><img src={A(img)} alt="" /></span> : <img src={A(img)} alt="" />}</span>
                  <b>{name}</b>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Skill card (node 4110:2905) */
export function SkillCard({ title, author, date, desc, status = "Active" }) {
  return (
    <div className="product p-skill">
      <div className="p-skill__top">
        <span className="p-skill__gem"><img src={A("skill-gem.svg")} alt="" /></span>
        <span className="p-badge">{status}</span>
      </div>
      <div>
        <div className="p-skill__title">{title}</div>
        <div className="p-skill__meta"><span>{author}</span><span>{date}</span></div>
      </div>
      <p className="p-skill__desc">{desc}</p>
    </div>
  );
}

const QUEUE = [
  ["Review PR #4182 · checkout flow", "Review", "review", "status-review.svg"],
  ["Approve launch blog draft", "Review", "review", "status-review.svg"],
  ["Review PR #4190 · billing API", "Review", "review", "status-review.svg"],
  ["Check AI-generated test suite", "Needs update", "update", "status-needs-update.svg"],
  ["Review PR #4197 · search index", "Needs update", "update", "status-needs-update.svg"],
];

/* Review queue piling up on one expert (built from product list rows) */
export function ReviewQueue() {
  return (
    <div className="product p-list">
      <div className="p-list__head p-xs"><b style={{ color: "var(--p-text)", fontWeight: 600 }}>Assigned to Miya</b><span>14 waiting for review</span></div>
      {QUEUE.map(([name, status, kind, icon]) => (
        <div className="p-list__row" key={name}>
          <TaskLink name={name} status={status} kind={kind} icon={icon} />
          <Person who="miya" size="sm" />
        </div>
      ))}
    </div>
  );
}

// Miya's crew follows the story played in the workspace (beats: board → doc → chat → tagged)
const STEP = { board: 0, doc: 1, chat: 2, tagged: 3 };
function crewRows(beat) {
  const n = STEP[beat] ?? 0;
  return [
    { img: "agent-task-progress.png", tall: true, name: "Research Agent", ...(n >= 1 ? { did: "Moved Email Announcement to In Progress", status: "Done", kind: "done" } : { did: "Pulled competitor pricing into the Q3 brief", status: "Done", kind: "done" }) },
    { img: "agent-plum.png", tall: true, name: "Writer Agent", ...(n >= 3 ? { did: "Shared the brief in #Marketing and tagged you", status: "Done", kind: "done" } : n === 2 ? { did: "Posting the brief in #Marketing", status: "In progress", kind: "progress" } : n === 1 ? { did: "Writing the Q4 Launch brief", status: "In progress", kind: "progress" } : { did: "Drafting the launch email, 3 variants", status: "In progress", kind: "progress" }) },
    { img: "agent-2.png", name: "Scheduler", did: "Booked the launch review, Thu 2pm", status: "Done", kind: "done" },
    { img: "agent-4.png", name: "Project Planner", ...(n >= 1 ? { did: "Set Product Screen to Friday, priority High", status: "Done", kind: "done" } : { did: "Updating the timeline after the scope change", status: "In progress", kind: "progress" }) },
    { img: "agent-3.png", name: "Release Notes", did: "Writing the changelog for v4.2", status: "In progress", kind: "progress" },
  ];
}

// Agent run state, not a task status: a spinner while it works, a check when it's done
function AgentState({ kind }) {
  const working = kind === "progress";
  return (
    <span className={`p-run${working ? "" : " is-done"}`}>
      {working ? <i className="p-run__spin" /> : <i className="p-run__ok" />}
      {working ? "Working" : "Done"}
    </span>
  );
}

/* Hero focus: one employee's personal crew of Super Agents, built from product pieces */
export function PersonalCrew({ beat = "board" }) {
  const tagged = beat === "tagged";
  return (
    <div className="product p-window p-crew">
      <div className="p-window__head">
        <span className="p-window__title p-label"><Person who="miya" size="sm" />Miya’s crew <span className="p-crew__meta">5 Super Agents</span></span>
        <span className="p-window__ask p-label"><img src={A("brain-ai-outlined.svg")} alt="" />Ask</span>
      </div>
      <div className="p-sheet">
        {crewRows(beat).map((a) => (
          <div className="p-crew__row" key={a.name}>
            {a.tall ? <Agent img={a.img} /> : <span className="p-agent-round"><img src={A(a.img)} alt="" /></span>}
            <div className="p-crew__text">
              <span className="p-label">{a.name}</span>
              <span className="p-crew__did" key={a.did}>{a.did}</span>
            </div>
            <AgentState key={a.kind} kind={a.kind} />
          </div>
        ))}
        <div className={`p-crew__you${tagged ? " is-new" : ""}`} key={tagged ? "tagged" : "base"}>
          <Person who="miya" />
          <div className="p-crew__text">
            <span className="p-crew__flag">{tagged ? <>Needs you <span className="p-crew__from">· Writer Agent tagged you in #Marketing</span></> : "Needs you"}</span>
            <span className="p-label">{tagged ? "Approve the Q4 Launch brief" : "Approve the launch email before 3pm"}</span>
          </div>
          <span className="p-btn p-btn--primary p-crew__cta">Review</span>
        </div>
      </div>
    </div>
  );
}

/* Agent presence over the dashboard: who is doing what, right now */
export function AgentToast({ img, tall, name, action, style }) {
  return (
    <div className="product p-toast" style={style}>
      {tall ? <Agent img={img} size="sm" /> : <span className="p-agent-round p-agent-round--sm"><img src={A(img)} alt="" /></span>}
      <span className="p-toast__text"><b>{name}</b> {action}</span>
      <span className="p-toast__live" />
    </div>
  );
}

/* Brain² mark: official Figma artwork ("Brain 2.0", 3274:2807), cropped to the mark */
export function BrainMark({ size = 18 }) {
  return <img className="p-brain-mark" src={A("brain-mark.svg")} alt="" style={{ width: size, height: size }} />;
}

/* Brain² answering with workspace context, then the Brain input (Figma 2088:124966) */
export function BrainAnswer() {
  return (
    <div className="product p-brain">
      <div className="p-brain__head">
        <img src={A("brain-logo.svg")} alt="Brain²" className="p-brain__word" />
        <span className="p-brain__ctx"><img src={A("icon-add-context.svg")} alt="" />Q3 Launch</span>
      </div>
      <div className="p-brain__q">What’s blocking the Q3 launch?</div>
      <div className="p-brain__a">
        <BrainMark size={20} />
        <div>
          <p><b>2 tasks</b> are blocked by legal review. Both sit with <span className="p-link">@Miya</span>, due Friday.</p>
          <div className="p-brain__src">
            <img src={A("clickup-lg.svg")} alt="" /><img src={A("google-drive-sm.svg")} alt="" /><img src={A("slack.svg")} alt="" />
            <span>3 sources</span>
          </div>
        </div>
      </div>
      <div className="p-brain__input">
        <span className="p-brain__ph">Search, Ask, or Create</span>
        <div className="p-brain__bar">
          <span className="p-brain__search">Search
            <img src={A("clickup-lg.svg")} alt="" /><img src={A("google-drive-sm.svg")} alt="" /><img src={A("dropbox.svg")} alt="" />
            <b>+5</b>
          </span>
          <span className="p-brain__web"><img src={A("icon-web.svg")} alt="" /></span>
        </div>
      </div>
    </div>
  );
}
