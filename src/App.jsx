import { IconSprite } from "./components/Icons.jsx";
import Hero, { Nav } from "./components/Hero.jsx";
import Problem from "./components/Problem.jsx";
import Solution from "./components/Solution.jsx";
import Loop from "./components/Loop.jsx";
import Crew from "./components/Crew.jsx";
import Story from "./components/Story.jsx";
import Closing, { Footer } from "./components/Closing.jsx";

export default function App() {
  return (
    <>
      <IconSprite />
      <Nav />
      <Hero />
      <main>
        <Problem />
        <Solution />
        <Loop />
        <Crew />
        <Story />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
