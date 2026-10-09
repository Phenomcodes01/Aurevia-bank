import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Globe, ShieldCheck, Smartphone, Wifi } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BankingCard, CTASection, PageHero, Reveal, Section, SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/services/cards")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Banking Cards — Aurevia Bank" },
      { name: "description", content: "Cashback, travel, business, student, secured and debit cards from Aurevia Bank." },
      { property: "og:title", content: "Banking Cards — Aurevia Bank" },
      { property: "og:description", content: "Find the card that fits how you spend." },
    ],
  }),
  component: Cards,
});

const cards = [
  { name: "Cashback Rewards", tone: "primary", fee: "$0", reward: "2% on everything", benefits: ["No foreign fees", "Instant redemption"] },
  { name: "Travel Rewards", tone: "navy", fee: "$95", reward: "3x on travel", benefits: ["Lounge access", "Travel insurance"] },
  { name: "Business Card", tone: "glass", fee: "$0", reward: "2% on business spend", benefits: ["Employee cards", "Expense tools"] },
  { name: "Student Card", tone: "primary", fee: "$0", reward: "1% + GPA bonus", benefits: ["Build credit", "Low limits"] },
  { name: "Secured Card", tone: "navy", fee: "$0", reward: "1% cashback", benefits: ["Refundable deposit", "Credit building"] },
  { name: "Debit Card", tone: "glass", fee: "$0", reward: "Free ATM network", benefits: ["Freeze anytime", "Real-time alerts"] },
] as const;

function Cards() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Cards" title="Banking Cards" subtitle="Premium card designs with rewards built for every lifestyle." />
      <Section>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.name} delay={(i % 3) * 0.08} className="card-surface flex flex-col p-6">
              <BankingCard tone={c.tone} label={c.name} last4={String(4100 + i * 137).slice(-4)} />
              <h3 className="mt-6 text-xl font-semibold">{c.name}</h3>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground">{c.reward}</span>
                <span className="rounded-full bg-muted px-3 py-1">Annual fee {c.fee}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm">{c.benefits.map((b) => <li key={b} className="flex gap-2"><Check className="h-4 w-4 text-success" />{b}</li>)}</ul>
              <Button asChild variant="navy" className="mt-6"><Link to="/auth/register">Apply Now</Link></Button>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Benefits" title="Card Features & Benefits" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[ShieldCheck, "Fraud Protection"], [Smartphone, "Mobile Banking"], [Wifi, "Contactless Pay"], [Globe, "Global Acceptance"]].map(([I, t]) => {
            const Icon = I as typeof Globe;
            return <Reveal key={t as string} className="card-surface p-6 text-center"><Icon className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-semibold">{t as string}</p></Reveal>;
          })}
        </div>
      </Section>
      <CTASection title="Find Your Perfect Card" cta="Apply in Minutes" />
    </SiteLayout>
  );
}
