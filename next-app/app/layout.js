import "./globals.css";
import { LearnProvider } from "../lib/learn-store";
import AppShell from "../components/app-shell";
import CloudSync from "../lib/cloud-sync";

export const metadata = {
  title: "Linguistix — Learn, Practice, Speak",
  description: "Learn languages through guided lessons, flashcards and daily practice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LearnProvider>
          <CloudSync />
          <AppShell>{children}</AppShell>
        </LearnProvider>
      </body>
    </html>
  );
}
