import "./globals.css";
import { LearnProvider } from "../lib/learn-store";

export const metadata = {
  title: "Linguistix — Learn, Practice, Speak",
  description: "Learn languages through guided lessons, flashcards and daily practice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><LearnProvider>{children}</LearnProvider></body>
    </html>
  );
}
