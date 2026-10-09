import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Laptop, Lightbulb, Radar, ShieldCheck, Smartphone } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FeatureCard, PageHero, Reveal, Section } from "@/components/site/primitives";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Security Center — Aurevia Bank" },
      { name: "description", content: "How the Aurevia Bank approaches account protection, 2FA, fraud monitoring and device safety." },
      { property: "og:title", content: "Security Center — Aurevia Bank" },
      { property: "og:description", content: "Account protection, two-factor authentication and security tips." },
    ],
  }),
  component: Security,
});

const items = [
  { icon: ShieldCheck, title: "Account Protection", description: "Layered defenses guard every login and transaction.", features: ["Encrypted sessions", "Automatic timeouts"] },
  { icon: Smartphone, title: "Two-Factor Authentication", description: "A second step keeps your account yours.", features: ["Authenticator apps", "Biometric approval"] },
  { icon: Radar, title: "Fraud Monitoring", description: "Unusual activity is flagged in real time.", features: ["Instant alerts", "Card auto-freeze"] },
  { icon: KeyRound, title: "Password Security", description: "Strong, unique passwords are required.", features: ["Strength checks", "Breach detection"] },
  { icon: Laptop, title: "Device Management", description: "See and revoke signed-in devices.", features: ["Trusted devices", "Remote sign-out"] },
  { icon: Lightbulb, title: "Security Tips", description: "Aurevia Bank will never ask for your PIN or password.", features: ["Beware phishing", "Verify URLs"] },
];

function Security() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Security" title="Security Center" subtitle="Your protection is built into every layer of the Aurevia Bank experience." />
      <Section className="pt-4">
        <Reveal className="mx-auto mb-14 flex max-w-2xl items-center gap-6 rounded-3xl bg-gradient-navy p-6 text-navy-foreground">
          <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-4 border-success">
            <span className="font-display text-xl font-semibold">98</span>
          </div>
          <div>
            <p className="text-sm text-navy-foreground/60">Security status</p>
            <p className="font-display text-2xl font-semibold">Protected</p>
            <p className="text-sm text-navy-foreground/60">2FA on · 2 trusted devices · No alerts</p>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => <FeatureCard key={it.title} {...it} delay={(i % 3) * 0.08} cta="Learn more" to="/faq" />)}
        </div>
      </Section>
    </SiteLayout>
  );
}
