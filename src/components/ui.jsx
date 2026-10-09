import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";

export const SIGNUP_URL = "https://app.clickup.com/signup";

// Adds .in once the element scrolls into view (fade-up reveal).
export function useReveal() {
  const ref = useRef(null);
  // ?static disables the reveal (screenshots, reviews)
  const isStatic = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("static");
  const [inView, setInView] = useState(isStatic);
  useEffect(() => {
    const node = ref.current;
    if (!node || isStatic) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

export function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const [ref, inView] = useReveal();
  return (
    <Tag ref={ref} className={`${className} reveal${inView ? " in" : ""}`} {...rest}>
      {children}
    </Tag>
  );
}

export function Cta({ variant = "primary", size = "lg", arrow = false, children = "Get started. It’s FREE." }) {
  const cls = ["btn", `button-${size}`];
  if (variant === "secondary") cls.push("btn--secondary");
  if (variant === "white") cls.push("btn--white");
  if (size === "sm") cls.push("btn--sm");
  return (
    <a className={cls.join(" ")} href={SIGNUP_URL} target="_blank" rel="noreferrer">
      {children}
      {arrow && <Icon name="arrow" />}
    </a>
  );
}

// Section header (centered by default, align="left" for heroes): eyebrow (24px) → title + subtitle (12px) → optional button.
export function SectionHeader({ eyebrow, eyebrowGray = false, dark, gray, subtitle, as: H = "h2", size = "display-xl", align = "center", children }) {
  return (
    <div className={`section__header block${align === "left" ? " section__header--left" : ""}`}>
      {eyebrow && <span className={`mono-sm eyebrow${eyebrowGray ? " gray" : ""}`}>{eyebrow}</span>}
      <div className="block__text">
        <H className={size}>
          <span className="t-dark">{dark}</span>
          {gray && (
            <>
              <br />
              <span className="t-gray">{gray}</span>
            </>
          )}
        </H>
        {subtitle && <p className="text-lg subtitle">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function BionicTitle({ dark, gray, className = "card__title" }) {
  return (
    <h3 className={className}>
      <span className="t-dark">{dark}</span>
      <br />
      <span className="t-gray">{gray}</span>
    </h3>
  );
}

export function Status({ kind, children }) {
  return <span className={`status status--${kind}`}>{children}</span>;
}
