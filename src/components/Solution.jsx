import { AgentProfile, BrainAnswer, SkillCard } from "./product.jsx";
import { BionicTitle, Cta, Reveal, SectionHeader } from "./ui.jsx";

function CardHead({ eyebrow, dark, gray }) {
  return (
    <div className="block">
      <span className="mono-sm eyebrow">{eyebrow}</span>
      <BionicTitle dark={dark} gray={gray} />
    </div>
  );
}

export default function Solution() {
  return (
    <Reveal as="section" className="section" id="solution">
      <div className="section__inner">
        <SectionHeader
          eyebrow="The solution"
          dark="100x teams start over with AI at the center,"
          gray="not bolted on."
          subtitle="The difference is what reaches your experts. ClickUp’s AI does the hands-on work with full context in view, and they only get the calls worth their time."
        >
          <Cta size="md" />
        </SectionHeader>

        <div className="section__content bento bento--three">
          <article className="card">
            <CardHead eyebrow="Brain²" dark="Answers questions." gray="With every project in view." />
            <div className="card__ui" aria-hidden="true">
              <BrainAnswer />
            </div>
          </article>

          <article className="card">
            <CardHead eyebrow="Super Agents" dark="Do the work." gray="Research and first drafts." />
            <div className="card__ui" aria-hidden="true">
              <AgentProfile withMemory memoryRows={2} />
            </div>
          </article>

          <article className="card">
            <CardHead eyebrow="Skills and Automations" dark="Keep it consistent." gray="Fix it once, reuse it." />
            <div className="card__ui card__ui--skills" aria-hidden="true">
              <SkillCard title="Brand Voice Enforcer" author="Zeb" date="9/12/26" desc="Checks every outbound draft against your brand voice before it reaches review." />
            </div>
          </article>
        </div>
      </div>
    </Reveal>
  );
}
