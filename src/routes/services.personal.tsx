import { createFileRoute } from "@tanstack/react-router";
import { Baby, Bell, Globe, Landmark, PiggyBank, Receipt, Smartphone, Timer, TrendingUp, Wallet } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection, FeatureCard, PageHero, Reveal, Section, SectionHeading } from "@/components/site/primitives";

export const Route = createFileRoute("/services/personal")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Personal Banking — Aurevia Bank" },
      { name: "description", content: "Checking, savings, money market, CDs, IRAs and youth accounts from Aurevia Bank." },
      { property: "og:title", content: "Personal Banking — Aurevia Bank" },
      { property: "og:description", content: "Comprehensive banking solutions tailored to your personal financial needs." },
    ],
  }),
  component: Personal,
});

const accounts = [
  { icon: Wallet, title: "Checking Account", description: "Everyday banking with zero monthly fees.", features: ["No minimum balance", "Early direct deposit", "Free debit card"] },
  { icon: PiggyBank, title: "High-Yield Savings", description: "Earn more on every dollar you save.", features: ["4.50% APY", "Automatic round-ups", "Savings goals"] },
  { icon: Landmark, title: "Money Market", description: "Higher yields with check-writing flexibility.", features: ["Tiered rates", "Check writing", "Instant transfers"] },
  { icon: Timer, title: "Certificate of Deposit", description: "Lock in a guaranteed rate.", features: ["3–60 month terms", "Fixed rates", "Auto-renew option"] },
  { icon: TrendingUp, title: "IRA Accounts", description: "Plan for retirement with tax-advantaged accounts.", features: ["Traditional & Roth", "Auto contributions", "Planning tools"] },
  { icon: Baby, title: "Youth Savings", description: "Teach good money habits early.", features: ["Parent controls", "No fees", "Learning resources"] },
];

function Personal() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Personal" title="Personal Banking" subtitle="Comprehensive banking solutions tailored to your personal financial needs." />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a, i) => <FeatureCard key={a.title} {...a} cta="Open Account" delay={(i % 3) * 0.08} />)}
        </div>
      </Section>
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Digital" title="Digital Banking Features" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[Smartphone, "Mobile Banking"], [Globe, "Online Banking"], [Bell, "Account Alerts"], [Receipt, "Bill Pay"]].map(([I, t], i) => {
            const Icon = I as typeof Bell;
            return <Reveal key={t as string} delay={i * 0.08} className="card-surface p-6 text-center"><Icon className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-semibold">{t as string}</p></Reveal>;
          })}
        </div>
      </Section>
      <CTASection />
    </SiteLayout>
  );
}
