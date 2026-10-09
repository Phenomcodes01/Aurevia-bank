import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lock, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./primitives";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/lib/theme";

export const services = [
  { label: "Personal Banking", to: "/services/personal" },
  { label: "Business Banking", to: "/services/business" },
  { label: "Loans & Credit", to: "/services/loans" },
  { label: "Cards", to: "/services/cards" },
  { label: "Grants & Aid", to: "/services/grants" },
] as const;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [svc, setSvc] = useState(false);
  const [mSvc, setMSvc] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const link = "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-300 md:px-6",
          scrolled ? "glass shadow-soft" : "bg-transparent",
        )}
      >
        <Logo />
        <div className="hidden items-center gap-1 lg:flex">
          <Link to="/" className={link} activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/about" className={link} activeProps={{ className: "text-foreground" }}>About</Link>
          <div className="relative" onMouseEnter={() => setSvc(true)} onMouseLeave={() => setSvc(false)}>
            <button className={cn(link, "flex items-center gap-1")} aria-expanded={svc} onClick={() => setSvc((v) => !v)}>
              Services <ChevronDown className={cn("h-4 w-4 transition-transform", svc && "rotate-180")} />
            </button>
            <AnimatePresence>
              {svc && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                  <div className="card-surface p-2">
                    {services.map((s) => (
                      <Link key={s.to} to={s.to} onClick={() => setSvc(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground">{s.label}</Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link to="/contact" className={link} activeProps={{ className: "text-foreground" }}>Contact</Link>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" className="rounded-full"><Link to="/auth/login">Sign In</Link></Button>
          <Button asChild variant="hero"><Link to="/auth/register">Get Started</Link></Button>
        </div>
        <div className="flex items-center gap-1 lg:hidden"><ThemeToggle /><button className="rounded-full p-2" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button></div>
      </nav>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-card p-6 shadow-elegant lg:hidden">
              <div className="flex items-center justify-between"><Logo /><button aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
              <div className="mt-8 flex flex-col gap-1 text-base font-medium" onClick={(e) => (e.target as HTMLElement).tagName === "A" && setOpen(false)}>
                <Link to="/" className="rounded-xl px-3 py-3 hover:bg-accent">Home</Link>
                <Link to="/about" className="rounded-xl px-3 py-3 hover:bg-accent">About</Link>
                <button className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-accent" onClick={() => setMSvc((v) => !v)} aria-expanded={mSvc}>
                  Services <ChevronDown className={cn("h-4 w-4 transition-transform", mSvc && "rotate-180")} />
                </button>
                {mSvc && services.map((s) => <Link key={s.to} to={s.to} className="rounded-xl py-2.5 pl-7 text-sm text-muted-foreground hover:bg-accent">{s.label}</Link>)}
                <Link to="/contact" className="rounded-xl px-3 py-3 hover:bg-accent">Contact</Link>
              </div>
              <div className="mt-auto grid gap-2">
                <Button asChild variant="outline" className="rounded-full"><Link to="/auth/login" onClick={() => setOpen(false)}>Sign In</Link></Button>
                <Button asChild variant="hero"><Link to="/auth/register" onClick={() => setOpen(false)}>Get Started</Link></Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

const cols = [
  { title: "Quick Links", links: [["About Us", "/about"], ["Services", "/services/personal"], ["Grants & Aid", "/services/grants"], ["FAQ", "/faq"], ["Contact", "/contact"]] },
  { title: "Services", links: [["Personal Banking", "/services/personal"], ["Business Banking", "/services/business"], ["Loans & Credit", "/services/loans"], ["Cards", "/services/cards"]] },
  { title: "Member Services", links: [["Online Banking", "/auth/login"], ["Mobile App", "/apps"], ["Help & FAQ", "/faq"], ["Security", "/security"], ["Admin Console", "/admin"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Sitemap", "/sitemap"]] },
] as const;

function Footer() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-6">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-xs text-sm text-navy-foreground/60">Building financial strength together with personalized banking solutions for every member.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="font-display text-sm font-semibold">{c.title}</h3>
            <ul className="mt-4 space-y-3">
              {c.links.map(([l, to]) => <li key={l}><Link to={to} className="text-sm text-navy-foreground/60 transition-colors hover:text-navy-foreground">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-6 text-xs text-navy-foreground/50 md:flex-row">
          <p>© 2026 Aurevia Bank. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border px-3 py-1 text-navy-foreground/70"><ShieldCheck className="h-3.5 w-3.5 text-primary" />FDIC Insured</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border px-3 py-1 text-navy-foreground/70"><Lock className="h-3.5 w-3.5 text-primary" />256-bit SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Skip to content</a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
