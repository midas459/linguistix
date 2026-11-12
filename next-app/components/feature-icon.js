export default function FeatureIcon({ name, size = 20, className = "" }) {
  const paths = {
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 0 1 10.5 7h2A7.5 7.5 0 0 1 20 14.5" /><path d="M8 12h8M8 15h5" /></>,
    audio: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
    alphabet: <><path d="M4 19 9 5l5 14M6 14h7M16 8h5M18.5 8v11M16 19h5" /></>,
    edit: <><path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="M12 20h8" /></>,
    cards: <><rect x="4" y="5" width="13" height="15" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v12M8 10h5M8 14h5" /></>,
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2 2-2 2-2-1.2-.1-.1a7.7 7.7 0 0 1-1.6.7l-.6 2.3h-2.8l-.6-2.3a7.7 7.7 0 0 1-1.6-.7l-.1.1-2 1.2-2-2 1.2-2 .1-.1a7.7 7.7 0 0 1-.7-1.6L3 12.8V10l2.3-.6a7.7 7.7 0 0 1 .7-1.6l-.1-.1-1.2-2 2-2 2 1.2.1.1a7.7 7.7 0 0 1 1.6-.7L11 2h2.8l.6 2.3a7.7 7.7 0 0 1 1.6.7l.1-.1 2-1.2 2 2-1.2 2-.1.1a7.7 7.7 0 0 1 .7 1.6l2.3.6v2.8l-2.3.6a7.7 7.7 0 0 1-.7 1.6Z" /></>,
    flame: <><path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-7-.3 2-1.3 3-2 3-1-3-2-5-4-7 0 4-4 7-4 12 0 3.5 2.8 6 7 6Z" /><path d="M12 22c-2 0-3-1.4-3-3 0-1.4 1-2.7 2.5-4 0 1.5 1 2 1.5 2 1-1 1-2 1-2 1.2 1.1 2 2.3 2 4 0 1.6-1.5 3-4 3Z" /></>,
    heart: <path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    medal: <><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v4h14v-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.star}</svg>;
}
