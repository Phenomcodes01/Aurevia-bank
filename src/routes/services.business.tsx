import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Briefcase, Building2, CreditCard, Headphones, Landmark, Monitor, PiggyBank, ShieldCheck, Store } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection, FeatureCard, PageHero, Reveal, Section, SectionHeading } from "@/components/site/primitives";
import businessImg from "@/assets/business.jpg";

export const Route = createFileRoute("/services/business")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Business Banking Solutions — Aurevia Bank" },
      { name: "description", content: "Business checking, savings, loans, merchant services and credit cards." },
      { property: "og:title", content: "Business Banking Solutions — Aurevia Bank" },
      { property: "og:description", content: "Complete banking solutions designed for growing businesses." },
    ],
  }),
  component: Business,
});

const services = [
  { icon: Building2, title: "Business Checking", description: "Unlimited transactions for daily operations.", features: ["Multi-user access", "Free ACH", "Integrated invoicing"] },
  { icon: PiggyBank, title: "Business Savings", description: "Earn on your operating reserves.", features: ["Competitive APY", "Sweep accounts", "No lockups"] },
  { icon: Landmark, title: "Business Loans", description: "Capital to expand, hire and invest.", features: ["Term loans", "Lines of credit", "Equipment financing"] },
  { icon: Store, title: "Merchant Services", description: "Accept payments anywhere.", features: ["POS terminals", "Online checkout", "Next-day deposits"] },
  { icon: Briefcase, title: "Cash Management", description: "Optimize liquidity and payments.", features: ["Positive pay", "Wire automation", "Cash forecasting"] },
  { icon: CreditCard, title: "Business Credit Cards", description: "Rewards on every business purchase.", features: ["Employee cards", "Spend controls", "2% cashback"] },
];

function Business() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Business" title="Business Banking Solutions" subtitle="Complete banking solutions designed for growing businesses." />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => <FeatureCard key={s.title} {...s} cta="Get Started" delay={(i % 3) * 0.08} />)}
        </div>
      </Section>
      <Section className="bg-muted/50">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal><img src={businessImg} alt="Business team at work" width={1280} height={1024} loading="lazy" className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-elegant" /></Reveal>
          <div>
            <SectionHeading eyebrow="Why us" title="Why Businesses Choose Us" center={false} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[[Headphones, "Dedicated Support"], [Monitor, "Digital Banking"], [BarChart3, "Financial Insights"], [ShieldCheck, "Security First"]].map(([I, t]) => {
                const Icon = I as typeof Monitor;
                return <Reveal key={t as string} className="card-surface p-5"><Icon className="h-6 w-6 text-primary" /><p className="mt-3 font-semibold">{t as string}</p></Reveal>;
              })}
            </div>
          </div>
        </div>
      </Section>
      <CTASection title="Grow Your Business With Aurevia Bank" cta="Open Business Account" secondary={{ label: "Speak with Advisor", to: "/contact" }} />
    </SiteLayout>
  );
}
