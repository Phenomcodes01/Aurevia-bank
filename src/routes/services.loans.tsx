import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase, Car, GraduationCap, Home, HomeIcon, User } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection, FeatureCard, PageHero, Reveal, Section, SectionHeading, StepList } from "@/components/site/primitives";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { amortize, usd } from "@/lib/demo-data";

export const Route = createFileRoute("/services/loans")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Loans & Financing — Aurevia Bank" },
      { name: "description", content: "Home, auto, personal, business and student loans with a live loan calculator." },
      { property: "og:title", content: "Loans & Financing — Aurevia Bank" },
      { property: "og:description", content: "Explore loan products and calculate your monthly payment." },
    ],
  }),
  component: Loans,
});

const loans = [
  { icon: Home, title: "Home Loans", rate: "6.25%", amount: "Up to $1M", term: "15–30 yrs" },
  { icon: Car, title: "Auto Loans", rate: "5.49%", amount: "Up to $100K", term: "3–7 yrs" },
  { icon: User, title: "Personal Loans", rate: "8.99%", amount: "Up to $50K", term: "1–5 yrs" },
  { icon: Briefcase, title: "Business Loans", rate: "7.75%", amount: "Up to $500K", term: "1–10 yrs" },
  { icon: GraduationCap, title: "Student Loans", rate: "4.99%", amount: "Up to $150K", term: "5–15 yrs" },
  { icon: HomeIcon, title: "Home Equity", rate: "7.10%", amount: "Up to $250K", term: "5–20 yrs" },
];

function Calc() {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(5);
  const r = useMemo(() => amortize(amount, rate, years), [amount, rate, years]);
  const rows: [string, number, (v: number) => void, number, number, number, string][] = [
    ["Loan Amount", amount, setAmount, 1000, 500000, 1000, usd(amount).replace(".00", "")],
    ["Interest Rate", rate, setRate, 0, 20, 0.05, `${rate.toFixed(2)}%`],
    ["Loan Term", years, setYears, 1, 30, 1, `${years} years`],
  ];
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Reveal className="card-surface space-y-8 p-8 lg:col-span-3">
        {rows.map(([l, v, set, min, max, step, disp]) => (
          <div key={l}>
            <div className="flex justify-between"><Label>{l}</Label><span className="font-semibold">{disp}</span></div>
            <Slider className="mt-4" value={[v]} min={min} max={max} step={step} onValueChange={([n]) => set(n ?? min)} aria-label={l} />
          </div>
        ))}
      </Reveal>
      <Reveal delay={0.1} className="rounded-[1.5rem] bg-gradient-navy p-8 text-navy-foreground lg:col-span-2">
        <p className="text-sm text-navy-foreground/60">Monthly Payment</p>
        <p className="mt-1 font-display text-5xl font-semibold">{usd(r.monthly)}</p>
        <div className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between border-b border-sidebar-border pb-3"><span className="text-navy-foreground/60">Total Interest</span><span className="font-semibold">{usd(r.interest)}</span></div>
          <div className="flex justify-between"><span className="text-navy-foreground/60">Total Payment</span><span className="font-semibold">{usd(r.total)}</span></div>
        </div>
        <p className="mt-8 text-xs text-navy-foreground/50">Estimates only. Not a loan offer.</p>
      </Reveal>
    </div>
  );
}

function Loans() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Loans & Credit" title="Loans & Financing" subtitle="Flexible financing for life's biggest moments." />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((l, i) => (
            <FeatureCard key={l.title} icon={l.icon} title={l.title} cta="Apply Now" delay={(i % 3) * 0.08}
              meta={[{ label: "Rate", value: l.rate }, { label: "Amount", value: l.amount }, { label: "Term", value: l.term }]} />
          ))}
        </div>
      </Section>
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Calculator" title="Estimate Your Payment" />
        <div className="mt-12"><Calc /></div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Process" title="Easy Application Process" />
        <div className="mt-14"><StepList steps={[{ title: "Apply Online" }, { title: "Quick Review" }, { title: "Get Approved" }, { title: "Receive Funds" }]} /></div>
      </Section>
      <CTASection title="Ready to Apply?" cta="Start Application" />
    </SiteLayout>
  );
}
