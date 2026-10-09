import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, Building2, Check, CreditCard, Fingerprint, Headphones,
  LineChart, Lock, PiggyBank, ShieldCheck, Smartphone, Sparkles, TrendingUp, Zap, Clock, BadgeCheck, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BankingCard, CTASection, Counter, FeatureCard, Reveal, Section, SectionHeading, StepList } from "@/components/site/primitives";
import businessImg from "@/assets/business.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Aurevia Bank — Wealth Management Without Limits" },
      { name: "description", content: "Premium digital banking: accounts, cards, savings, loans and a full dashboard experience." },
      { property: "og:title", content: "Aurevia Bank — Wealth Management Without Limits" },
      { property: "og:description", content: "Experience a seamless blend of traditional banking and digital innovation." },
    ],
  }),
  component: Home,
});

function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="card-surface p-6 shadow-elegant">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="mt-1 font-display text-4xl font-semibold">$124,592.00</p>
          </div>
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">+24.8% / mo</span>
        </div>
        <svg viewBox="0 0 300 80" className="mt-6 h-24 w-full" aria-hidden>
          <defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity=".3" /><stop offset="1" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>
          <path d="M0 65 C40 60 60 45 90 50 S150 30 180 34 240 12 300 8 L300 80 L0 80Z" fill="url(#hg)" />
          <path d="M0 65 C40 60 60 45 90 50 S150 30 180 34 240 12 300 8" fill="none" stroke="var(--primary)" strokeWidth="2.5" />
        </svg>
        <ul className="mt-4 divide-y divide-border">
          <li className="flex items-center gap-3 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/10 text-success"><ArrowDownLeft className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-medium">Incoming Transfer</span>
            <span className="font-semibold text-success">+$2,450.00</span>
          </li>
          <li className="flex items-center gap-3 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted"><ArrowUpRight className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-medium">Apple Store</span>
            <span className="font-semibold">-$999.00</span>
          </li>
        </ul>
      </motion.div>
      <div className="absolute -left-10 -top-8 hidden animate-float md:block">
        <div className="glass flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-soft">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></span>
          <div><p className="text-[11px] text-muted-foreground">Security Status</p><p className="text-sm font-semibold">Protected</p></div>
        </div>
      </div>
      <div className="absolute -bottom-8 -right-6 hidden animate-float-slow md:block">
        <div className="glass flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-soft">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-success/15 text-success"><TrendingUp className="h-5 w-5" /></span>
          <div><p className="text-[11px] text-muted-foreground">Monthly Growth</p><p className="text-sm font-semibold">+24.8%</p></div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: Smartphone, title: "Digital Banking", features: ["Mobile check deposit", "Instant transfers", "Bill payment automation"] },
  { icon: Lock, title: "Advanced Security", features: ["Encryption", "Two-factor authentication", "Fraud detection alerts"] },
  { icon: BarChart3, title: "Smart Analytics", features: ["Spending categorization", "Budget tracking", "Financial insights"] },
  { icon: Headphones, title: "Premium Support", features: ["24/7 support", "Dedicated relationship assistance", "Priority assistance"] },
  { icon: LineChart, title: "Investment Tools", features: ["Automated investing", "Portfolio diversification", "Retirement planning"] },
  { icon: CreditCard, title: "Smart Cards", features: ["Contactless payments", "Freeze/unfreeze", "Real-time notifications"] },
];

function Home() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft px-6 pb-24 pt-36 md:pt-44">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Next-Gen Financial Ecosystem
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] md:text-7xl">
              Wealth Management <span className="text-gradient">Without Limits</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Experience a seamless blend of traditional banking and digital innovation. Control your finances, automate savings, and build your financial future from one powerful platform.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/auth/register">Get Started Free <ArrowRight /></Link></Button>
              <Button asChild variant="outline" size="xl" className="rounded-full"><a href="#how">How It Works</a></Button>
            </div>
          </motion.div>
          <HeroDashboard />
        </div>
      </section>

      {/* Stats */}
      <section className="px-6">
        <div className="mx-auto -mt-6 grid max-w-5xl gap-4 rounded-[2rem] bg-gradient-navy p-8 text-center text-navy-foreground shadow-elegant sm:grid-cols-3">
          {[[10000, "+", "Active Users", 0, ""], [99.9, "%", "Platform Uptime", 1, ""], [500, "M+", "Transactions", 0, "$"]].map(([v, s, l, d, p]) => (
            <div key={l as string} className="py-2">
              <p className="font-display text-4xl font-semibold md:text-5xl"><Counter value={v as number} suffix={s as string} decimals={d as number} prefix={p as string} /></p>
              <p className="mt-1 text-sm text-navy-foreground/60">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <Section>
        <SectionHeading eyebrow="Trusted" title="Banking That Speaks for Itself" subtitle="Join thousands of customers who trust Aurevia Bank with their financial future." />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[[10000, "", "Happy Customers", ""], [2500, "K", "Total Deposited", "$"], [14, "", "Years of Innovation", ""], [98, "%", "Customer Satisfaction", ""]].map(([v, s, l, p]) => (
            <Reveal key={l as string} className="card-surface p-6 text-center">
              <p className="font-display text-3xl font-semibold text-primary"><Counter value={v as number} suffix={s as string} prefix={p as string} /></p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, "Bank-Level Security", "Advanced encryption and modern security architecture protect your information."],
            [Headphones, "24/7 Human Support", "Real people ready to help whenever you need us."],
            [Cpu, "Cutting-Edge Technology", "Modern digital banking tools designed around your financial life."],
          ].map(([I, t, d], i) => {
            const Icon = I as typeof ShieldCheck;
            return (
              <Reveal key={t as string} delay={i * 0.1} className="rounded-3xl bg-muted p-7">
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{t as string}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d as string}</p>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Features" title="Everything You Need in One Place" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={(i % 3) * 0.08} to="/services/personal" />)}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how">
        <SectionHeading eyebrow="How it works" title="Get Started in 4 Simple Steps" />
        <div className="mt-16">
          <StepList steps={[
            { title: "Apply Online", text: "Complete a simple account application." },
            { title: "Verify Identity", text: "Complete the identity verification process." },
            { title: "Fund Account", text: "Connect a funding method in the experience." },
            { title: "Start Banking", text: "Access your personalized banking dashboard." },
          ]} />
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[[BadgeCheck, "No Hidden Fees"], [Zap, "Fast Setup"], [Headphones, "Expert Support"]].map(([I, t]) => {
            const Icon = I as typeof Zap;
            return <Reveal key={t as string} className="flex items-center gap-4 rounded-2xl border border-border p-5"><Icon className="h-6 w-6 text-primary" /><span className="font-semibold">{t as string}</span></Reveal>;
          })}
        </div>
      </Section>

      {/* Products */}
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Products" title="Banking Solutions for Every Need" />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <Reveal className="card-surface flex flex-col p-7 lg:row-span-1">
            <h3 className="text-xl font-semibold">Personal Checking</h3>
            <p className="mt-2 text-sm text-muted-foreground">Everyday banking with no monthly fees and instant alerts.</p>
            <div className="mt-6 rounded-3xl bg-navy p-5 text-navy-foreground">
              <div className="flex justify-between text-xs"><span className="font-semibold tracking-widest">DEBIT CARD</span><span className="rounded-full bg-success/20 px-2 py-0.5 text-success">Active</span></div>
              <p className="mt-6 font-mono tracking-[0.2em]">•••• 4582</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div><p className="opacity-60">Available Balance</p><p className="mt-1 text-lg font-semibold">$4,250.00</p></div>
                <div><p className="opacity-60">Pending Transactions</p><p className="mt-1 text-lg font-semibold">-$125.50</p></div>
              </div>
            </div>
            <ul className="mt-6 space-y-2 text-sm">{["No minimum balance", "Early direct deposit", "Free ATM network"].map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-success" />{f}</li>)}</ul>
            <Button asChild variant="navy" className="mt-6"><Link to="/services/personal">Open Checking</Link></Button>
          </Reveal>
          <Reveal delay={0.1} className="card-surface flex flex-col p-7">
            <h3 className="text-xl font-semibold">Business Banking</h3>
            <p className="mt-2 text-sm text-muted-foreground">Accounts, payroll and credit for growing teams.</p>
            <div className="mt-6 grid gap-3">
              {[["Revenue this month", "$84,210"], ["Payroll scheduled", "Oct 15"], ["Credit available", "$50,000"]].map(([a, b]) => (
                <div key={a} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm"><span className="text-muted-foreground">{a}</span><span className="font-semibold">{b}</span></div>
              ))}
            </div>
            <ul className="mt-6 space-y-2 text-sm">{["Multi-user access", "Invoicing tools", "Merchant services"].map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-success" />{f}</li>)}</ul>
            <Button asChild variant="navy" className="mt-auto"><Link to="/services/business">Explore Business</Link></Button>
          </Reveal>
          <Reveal delay={0.2} className="card-surface flex flex-col p-7">
            <h3 className="text-xl font-semibold">Savings & Investment</h3>
            <p className="mt-2 text-sm text-muted-foreground">Grow your money automatically with smart goals.</p>
            <div className="mt-6 rounded-2xl bg-accent p-5">
              <p className="text-xs text-accent-foreground">Emergency fund goal</p>
              <div className="mt-3 h-2 rounded-full bg-background"><div className="h-2 w-[78%] rounded-full bg-gradient-primary" /></div>
            </div>
            <ul className="mt-6 space-y-2 text-sm">{["4.50% APY", "Round-up savings", "Auto-invest portfolios"].map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-success" />{f}</li>)}</ul>
            <Button asChild variant="navy" className="mt-auto"><Link to="/services/personal">Start Saving</Link></Button>
          </Reveal>
        </div>
      </Section>

      {/* Business */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative">
            <img src={businessImg} alt="Business team reviewing finances" width={1280} height={1024} loading="lazy" className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-elegant" />
            <div className="glass absolute bottom-6 left-6 rounded-2xl p-4 shadow-soft">
              <p className="text-xs text-muted-foreground">Payroll processed</p><p className="font-display text-xl font-semibold">$128,400</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-foreground">For Business</span>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Business Banking</h2>
            <p className="mt-4 text-lg text-muted-foreground">Complete banking solutions designed for growing businesses.</p>
            <div className="mt-8 space-y-4">
              {[[Building2, "Business Checking", "Unlimited transactions and multi-user access."], [Clock, "Payroll Services", "Automated, on-time payroll for your team."], [CreditCard, "Business Credit", "Flexible credit lines that scale with you."]].map(([I, t, d]) => {
                const Icon = I as typeof Clock;
                return (
                  <div key={t as string} className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></span>
                    <div><h3 className="font-semibold">{t as string}</h3><p className="text-sm text-muted-foreground">{d as string}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/services/business">Explore Business</Link></Button>
              <Button asChild variant="outline" size="xl" className="rounded-full"><Link to="/contact">Contact Sales</Link></Button>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Wealth */}
      <section className="bg-gradient-navy px-6 py-24 text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Grow Wealth" title="Savings & Investment" subtitle="Put your money to work with tools built for long-term growth." center={false} light />
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[[PiggyBank, "High-Yield Savings"], [LineChart, "Automated Investing"], [TrendingUp, "Retirement Planning"]].map(([I, t]) => {
                const Icon = I as typeof PiggyBank;
                return <Reveal key={t as string} className="glass-dark rounded-2xl p-5"><Icon className="h-6 w-6 text-primary-glow" /><p className="mt-3 text-sm font-semibold">{t as string}</p></Reveal>;
              })}
            </div>
          </div>
          <Reveal delay={0.15} className="glass-dark rounded-[2rem] p-8">
            <p className="text-sm text-navy-foreground/60">Portfolio value</p>
            <p className="mt-1 font-display text-4xl font-semibold">$63,991.45</p>
            <div className="mt-8 flex h-40 items-end gap-3">
              {[40, 55, 48, 62, 70, 66, 82, 90, 86, 100].map((h, i) => <div key={i} className="flex-1 rounded-t-lg bg-gradient-primary" style={{ height: `${h}%`, opacity: 0.5 + i * 0.05 }} />)}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
              {[["Stocks", "60%"], ["Bonds", "30%"], ["Cash", "10%"]].map(([a, b]) => <div key={a} className="rounded-xl bg-navy-foreground/5 p-3"><p className="text-navy-foreground/60">{a}</p><p className="font-semibold">{b}</p></div>)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Security */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Security" title="Your Money, Protected" subtitle="Layered protection designed to keep your account safe around the clock." center={false} />
            <Button asChild variant="soft" size="xl" className="mt-8"><Link to="/security">Visit Security Center <ArrowRight /></Link></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[[Lock, "256-bit Encryption"], [Fingerprint, "Biometric Login"], [ShieldCheck, "Fraud Monitoring"], [Smartphone, "Device Management"]].map(([I, t], i) => {
              const Icon = I as typeof Lock;
              return <Reveal key={t as string} delay={i * 0.08} className="card-surface p-6"><Icon className="h-7 w-7 text-primary" /><p className="mt-4 font-semibold">{t as string}</p><p className="mt-1 text-sm text-muted-foreground">Active on every account.</p></Reveal>;
            })}
          </div>
        </div>
      </Section>

      <CTASection title="Start Your Financial Journey Today" subtitle="Discover accounts, cards and financial tools with Aurevia Bank." cta="Get Started Free" secondary={{ label: "Contact Us", to: "/contact" }} />
    </SiteLayout>
  );
}
