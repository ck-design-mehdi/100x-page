// Shared SVG symbols, referenced with <Icon name="bot" />.
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-bot" viewBox="0 0 24 24"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></symbol>
        <symbol id="i-doc" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 13H8" /><path d="M16 17H8" /></symbol>
        <symbol id="i-task" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></symbol>
        <symbol id="i-loop" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></symbol>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></symbol>
        <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="7.4" r="4.3" /><path d="M3.6 21.6c0-4.9 3.8-8.4 8.4-8.4s8.4 3.5 8.4 8.4z" /></symbol>
      </defs>
    </svg>
  );
}

export function Icon({ name, className = "icon", style }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function AgentAvatar({ size }) {
  const box = size ? { width: size, height: size } : undefined;
  const icon = size ? { width: size * 0.6, height: size * 0.6 } : undefined;
  return (
    <span className="avatar avatar--agent" style={box}>
      <Icon name="bot" style={icon} />
    </span>
  );
}
