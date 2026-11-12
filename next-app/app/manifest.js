export default function manifest() {
  return {
    id: "/",
    name: "Linguistix — Learn, Practice, Speak",
    short_name: "Linguistix",
    description: "Learn languages through guided lessons, flashcards and daily practice.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f5f8fa",
    theme_color: "#315d62",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
    ]
  };
}
