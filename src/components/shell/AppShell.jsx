import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import SideNav from "@/components/shell/SideNav";
import TopBar from "@/components/shell/TopBar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border/70 bg-card/30 lg:block">
          <div className="sticky top-0 h-screen">
            <SideNav />
          </div>
        </aside>
        <div className="min-w-0">
          <TopBar onMenu={() => setMenuOpen(true)} />
          <main className="min-w-0 pb-20">
            <Outlet />
          </main>
        </div>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[286px] border-r border-border/70 p-0">
          <SideNav onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}