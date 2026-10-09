import { useState } from "react";
import LiveWorkspace, { BEATS } from "./LiveWorkspace.jsx";
import Logo from "./Logo.jsx";
import { PersonalCrew } from "./product.jsx";
import { Cta, SectionHeader } from "./ui.jsx";

export function Nav() {
  return (
    <div className="nav nav-wrap">
      <div className="nav__inner">
        <a className="nav__brand" href="#top" aria-label="ClickUp 100x work, back to top">
          <Logo />
          <span className="nav__sub text-sm medium">100x work</span>
        </a>
        <Cta size="sm" />
      </div>
    </div>
  );
}

// Agents at work across the dashboard; each one pops in on its own beat

const CHAPTERS = ["Update the project", "Write the brief", "Tell the team", "Miya’s call"];

function Chapters({ beat }) {
  const now = BEATS.indexOf(beat);
  return (
    <ol className="chapters" aria-hidden="true">
      {CHAPTERS.map((label, i) => (
        <li key={label} style={{ display: "contents" }}>
          {i > 0 && <span className="chapter__sep" />}
          <span className={`chapter${i === now ? " is-on" : i < now ? " is-done" : ""}`}>
            <span className="chapter__n">{i + 1}</span>{label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function Hero() {
  const [beat, setBeat] = useState("board");
  return (
    <header className="section hero" id="top">
      <div className="section__inner">
        <SectionHeader
          as="h1"
          align="left"
          size="display-3xl"
          dark="Do 100x work"
          gray="without 100x the people."
          subtitle="ClickUp gives every employee a crew of AI agents & tools that do the work. They’re only left with what truly needs a human."
        >
          <Cta arrow />
        </SectionHeader>

        {/* Layered composition: a board the agents are working on as context, her personal crew as focus */}
        <figure className="section__content stage" aria-label="Super Agents update the Marketing board, the Writer Agent writes the launch brief in a Doc, then posts it in the #Marketing chat and tags Miya. In front, Miya's personal crew: three agents done, two working, and only one item needs her: approving the brief.">
          <LiveWorkspace className="stage__context ui-context" onBeat={setBeat} />
          <Chapters beat={beat} />
          <div className="stage__focus ai-highlight">
            <PersonalCrew beat={beat} />
          </div>
        </figure>
      </div>
    </header>
  );
}
