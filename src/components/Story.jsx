import { Agent } from "./product.jsx";
import { Reveal, SectionHeader } from "./ui.jsx";

const STATS = [
  ["20", "Super Agents", "working in four pods"],
  ["1 day", "to audit two new clients", "audits and content, ready"],
  ["< 1 week", "to deliver a month of work", "reviewed by one person"],
];

// House of Growth's workspace: four pods of Super Agents (product-style list)
const PODS = [
  { name: "SEO", agents: ["agent-task-progress.png", "agent-plum.png", "agent-green.png"], more: 3, doing: "Hotel site audits", state: "Working" },
  { name: "Sales", agents: ["agent-weekly-update.png", "agent-green.png"], more: 3, doing: "Proposal drafts", state: "Working" },
  { name: "Campaigns", agents: ["agent-plum.png", "agent-task-progress.png"], more: 2, doing: "Launch emails, 3 variants", state: "Ready for review" },
  { name: "Operations", agents: ["agent-weekly-update.png"], more: 3, doing: "Client onboarding", state: "Done" },
];

function PodBoard() {
  return (
    <div className="product sp">
      <div className="sp__head">
        <span className="sp__ws">H</span>
        <div>
          <b>House of Growth</b>
          <span>8 people · 20 Super Agents</span>
        </div>
      </div>
      {PODS.map((p) => (
        <div className="sp__row" key={p.name}>
          <div className="sp__pod">
            <b>{p.name} pod</b>
            <span>{p.doing}</span>
          </div>
          <span className="sp__agents">
            {p.agents.map((a, i) => <Agent key={i} img={a} size="sm" />)}
            <i>+{p.more}</i>
          </span>
          <span className={`p-run sp__state${p.state === "Done" ? " is-done" : ""}${p.state.startsWith("Ready") ? " is-review" : ""}`}>
            {p.state === "Done" ? <i className="p-run__ok" /> : p.state.startsWith("Ready") ? <i className="sp__dot" /> : <i className="p-run__spin" />}
            {p.state}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Story() {
  return (
    <Reveal as="section" className="section" id="story">
      <div className="section__inner">
        <SectionHeader
          align="left"
          eyebrow="Customer story"
          dark="One agency did a month of SEO work"
          gray="in under a week."
        />

        <div className="section__content story">
          <div className="story__text">
            <p className="text-lg subtitle">
              House of Growth is an eight-person marketing agency running 20 Super Agents in ClickUp, in pods for SEO, sales, campaigns and operations. When two hotel clients signed on, audits and content were ready within one business day. A person reviewed all of it.
            </p>
            <dl className="story__stats">
              {STATS.map(([v, label, sub], i) => (
                <div key={label}>
                  <dt className={i === STATS.length - 1 ? "display-gradient" : ""}>{v}</dt>
                  <dd><b>{label}</b><span>{sub}</span></dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="story__visual card">
            <PodBoard />
          </div>
        </div>

        <figure className="story__quote">
          <blockquote>“They sit on the same workspace my team works in, so they already have the client context. My people spend their time on senior strategy and final review instead of production.”</blockquote>
          <figcaption>
            <span className="story__who lb-person lb-person--marc"><img src="/figma/user-marc.png" alt="" /></span>
            <span><b>Jared Threw</b>Founder &amp; CEO, House of Growth</span>
          </figcaption>
        </figure>
      </div>
    </Reveal>
  );
}
