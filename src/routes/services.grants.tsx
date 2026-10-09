import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, GraduationCap, HeartPulse, Home, LifeBuoy, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection, FeatureCard, PageHero, Section, SectionHeading, StepList } from "@/components/site/primitives";

export const Route = createFileRoute("/services/grants")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Grants & Financial Aid — Aurevia Bank" },
      { name: "description", content: "Grant programs for business, education, housing, relief and healthcare." },
      { property: "og:title", content: "Grants & Financial Aid — Aurevia Bank" },
      { property: "og:description", content: "Explore financial aid programs." },
    ],
  }),
  component: Grants,
});

const programs = [
  { icon: Briefcase, title: "Small Business Grant", description: "Seed funding for local entrepreneurs.", amount: "Up to $25,000", elig: "Businesses under 3 years" },
  { icon: GraduationCap, title: "Education Grant", description: "Tuition support for continuing learners.", amount: "Up to $10,000", elig: "Enrolled students" },
  { icon: Home, title: "Home Ownership Grant", description: "Down-payment assistance for first homes.", amount: "Up to $15,000", elig: "First-time buyers" },
  { icon: LifeBuoy, title: "Emergency Relief Grant", description: "Fast help after unexpected hardship.", amount: "Up to $5,000", elig: "Verified hardship" },
  { icon: Users, title: "Community Development", description: "Funding for neighborhood initiatives.", amount: "Up to $50,000", elig: "Nonprofits" },
  { icon: HeartPulse, title: "Healthcare Grant", description: "Support for medical expenses.", amount: "Up to $8,000", elig: "Members in good standing" },
];

function Grants() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Grants & Aid" title="Grants & Financial Aid" subtitle="Explore programs for business, education, housing and community support." />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <FeatureCard key={p.title} icon={p.icon} title={p.title} description={p.description} delay={(i % 3) * 0.08}
              features={[`Funding: ${p.amount}`, `Eligibility: ${p.elig}`]} />
          ))}
        </div>
      </Section>
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Process" title="How to Apply" />
        <div className="mt-14"><StepList steps={[{ title: "Choose Program" }, { title: "Submit Application" }, { title: "Review Process" }, { title: "Receive Funding" }]} /></div>
      </Section>
      <CTASection />
    </SiteLayout>
  );
}
