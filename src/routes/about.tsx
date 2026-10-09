import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Lightbulb, ShieldCheck, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection, Counter, FeatureCard, PageHero, Reveal, Section, SectionHeading } from "@/components/site/primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "About Aurevia Bank — Our Story" },
      { name: "description", content: "Discover the story, mission and values of Aurevia Bank." },
      { property: "og:title", content: "About Aurevia Bank — Our Story" },
      { property: "og:description", content: "Mission, values and journey of Aurevia Bank." },
    ],
  }),
  component: About,
});

const timeline = [
  ["1985", "The Beginning", "A small community savings office opens its doors."],
  ["2005", "Digital Era", "Online banking launches for every member."],
  ["2015", "Mobile First", "The Aurevia Bank app puts the branch in your pocket."],
  ["Today", "Leading the Future", "AI-assisted insights and instant everything."],
];

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our Story" title="Building the Future of Digital Banking" subtitle="We believe banking should be transparent, fast, and designed around people — not paperwork." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-semibold md:text-4xl">Our Mission</h2>
            <p className="mt-5 text-lg text-muted-foreground">To give every member the tools, guidance and confidence to build lasting financial strength — combining the trust of a traditional institution with the speed of modern technology.</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[[50, "K+", "Active Customers", "", 0], [2.5, "B", "Assets Managed", "$", 1], [25, "", "Service Locations", "", 0], [99.9, "%", "Platform Availability", "", 1]].map(([v, s, l, p, d]) => (
              <Reveal key={l as string} className="card-surface p-6">
                <p className="font-display text-3xl font-semibold text-primary"><Counter value={v as number} suffix={s as string} prefix={p as string} decimals={d as number} /></p>
                <p className="mt-1 text-sm text-muted-foreground">{l}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Core Values" title="What Guides Us" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[[ShieldCheck, "Trust & Security", "Protecting members comes first, always."], [Lightbulb, "Innovation", "We build tools that simplify money."], [HeartHandshake, "Customer Care", "Real people, real help, any time."], [Users, "Community", "We grow when our members grow."]].map(([I, t, d], i) => (
            <FeatureCard key={t as string} icon={I as typeof Users} title={t as string} description={d as string} delay={i * 0.08} cta="Join us" />
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Our Journey" title="Four Decades of Progress" />
        <ol className="relative mx-auto mt-14 max-w-3xl border-l-2 border-accent pl-8">
          {timeline.map(([y, t, d], i) => (
            <Reveal key={y} delay={i * 0.1}>
              <li className="relative mb-10">
                <span className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-gradient-primary ring-4 ring-background" />
                <p className="font-display text-sm font-semibold text-primary">{y}</p>
                <h3 className="mt-1 text-xl font-semibold">{t}</h3>
                <p className="mt-1 text-muted-foreground">{d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>
      <CTASection title="Ready to Join Our Family?" />
    </SiteLayout>
  );
}
