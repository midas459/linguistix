import "./globals.css";

export const metadata = {
  title: "Linguistix — Learn, Practice, Speak",
  description: "Learn languages through guided lessons, flashcards and daily practice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
