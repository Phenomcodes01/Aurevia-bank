import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeftRight, Bell, CreditCard, Headphones, LayoutDashboard, List, LogOut, Menu, Receipt, Search, Settings, Wallet, X } from "lucide-react";
import { Logo } from "@/components/site/primitives";
import { demoAuth, type DemoUser } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/lib/theme";
import { store } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — Aurevia Bank" },
      { name: "description", content: "Manage your Aurevia Bank accounts and transactions." },
      { property: "og:title", content: "Dashboard — Aurevia Bank" },
      { property: "og:description", content: "View balances and account activity at Aurevia Bank." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Accounts", to: "/dashboard/accounts", icon: Wallet },
  { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
  { label: "Payments", to: "/dashboard/payments", icon: Receipt },
  { label: "Cards", to: "/dashboard/cards", icon: CreditCard },
  { label: "Transactions", to: "/dashboard/transactions", icon: List },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
  { label: "Support", to: "/faq", icon: Headphones },
] as const;

function Sidebar({ onNav }: { onNav?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col bg-sidebar p-5 text-sidebar-foreground">
      <Logo light />
      <nav aria-label="Dashboard" className="mt-10 flex flex-col gap-1">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} onClick={onNav} activeOptions={{ exact: "exact" in n }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
      </nav>
      <button onClick={() => { demoAuth.clear(); navigate({ to: "/auth/login" }); }} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const u = demoAuth.get();
    if (!u) navigate({ to: "/auth/login" });
    else { store.ensure(u.email, u.name); setUser(u); }
  }, [navigate]);
  if (!user) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block"><Sidebar /></aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64"><Sidebar onNav={() => setOpen(false)} /></aside>
          <button className="absolute right-4 top-4 text-navy-foreground" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label="Search" placeholder="Search…" className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <ThemeToggle />
          <button aria-label="Notifications" className="relative rounded-full p-2 hover:bg-muted"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" /></button>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">{user.name.slice(0, 1).toUpperCase()}</span>
        </header>
        <main className={cn("flex-1 p-4 md:p-8")}><Outlet /></main>
      </div>
    </div>
  );
}
