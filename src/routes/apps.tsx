import { createFileRoute } from "@tanstack/react-router";
import { Apple, Bell, Camera, CreditCard, Fingerprint, Lock, PieChart, Play, Receipt, Send, ShieldAlert, Wallet } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FeatureCard, PageHero, Reveal, Section, SectionHeading } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Banking Made Mobile — Aurevia Bank App" },
      { name: "description", content: "Take control of your finances with the Aurevia Bank mobile experience." },
      { property: "og:title", content: "Banking Made Mobile — Aurevia Bank" },
      { property: "og:description", content: "Account overview, transfers, bill pay, deposits and card controls on mobile." },
    ],
  }),
  component: Apps,
});

function Phone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-60 rounded-[2.5rem] bg-navy p-2.5 shadow-elegant ${className}`}>
      <div className="relative h-[480px] overflow-hidden rounded-[2rem] bg-background p-4">
        <div className="mx-auto mb-4 h-5 w-20 rounded-full bg-navy" />
        {children}
      </div>
    </div>
  );
}

function Apps() {
  const unavailable = () => toast("The mobile app is not available for download yet.");
  return (
    <SiteLayout>
      <PageHero eyebrow="Mobile" title="Banking Made Mobile" subtitle="Take control of your finances with the Aurevia Bank mobile experience.">
        <Button variant="navy" size="xl" onClick={unavailable}><Apple /> App Store</Button>
        <Button variant="navy" size="xl" onClick={unavailable}><Play /> Google Play</Button>
      </PageHero>
      <div className="flex justify-center gap-6 px-6">
        <Reveal className="hidden translate-y-10 sm:block">
          <Phone>
            <p className="text-xs text-muted-foreground">Spending</p>
            <p className="font-display text-2xl font-semibold">$3,010</p>
            <div className="mt-4 flex h-28 items-end gap-2">{[40, 70, 50, 90, 60, 80].map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-primary" style={{ height: `${h}%` }} />)}</div>
            {["Shopping", "Bills", "Dining"].map((c) => <div key={c} className="mt-3 flex justify-between rounded-xl bg-muted p-3 text-xs"><span>{c}</span><span className="font-semibold">$—</span></div>)}
          </Phone>
        </Reveal>
        <Reveal delay={0.1}>
          <Phone>
            <div className="rounded-2xl bg-gradient-navy p-4 text-navy-foreground">
              <p className="text-xs opacity-60">Total Balance</p>
              <p className="font-display text-2xl font-semibold">$124,592</p>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">{[Send, Receipt, Camera, CreditCard].map((I, i) => <span key={i} className="grid aspect-square place-items-center rounded-xl bg-accent text-accent-foreground"><I className="h-4 w-4" /></span>)}</div>
            {[["Incoming Transfer", "+$2,450"], ["Apple Store", "-$999"], ["Netflix", "-$15.99"], ["Salary", "+$4,500"]].map(([n, a]) => (
              <div key={n} className="mt-3 flex justify-between text-xs"><span>{n}</span><span className={a!.startsWith("+") ? "font-semibold text-success" : "font-semibold"}>{a}</span></div>
            ))}
          </Phone>
        </Reveal>
      </div>
      <Section>
        <SectionHeading eyebrow="Features" title="Everything in Your Pocket" />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[[Wallet, "Account Overview", "See every balance at a glance."], [Send, "Send Money", "Instant transfers to anyone."], [Receipt, "Bill Pay", "Schedule and automate bills."], [Camera, "Mobile Deposit", "Snap a check to deposit."], [CreditCard, "Card Controls", "Freeze, unfreeze and set limits."], [PieChart, "Budgeting", "Track categories and goals."]].map(([I, t, d], i) => (
            <FeatureCard key={t as string} icon={I as typeof Send} title={t as string} description={d as string} delay={(i % 3) * 0.08} cta="Get Started" />
          ))}
        </div>
      </Section>
      <Section className="bg-muted/50">
        <SectionHeading eyebrow="Security" title="Protected at Every Tap" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[[Fingerprint, "Biometric Login"], [Lock, "Encryption"], [Bell, "Real-Time Alerts"], [ShieldAlert, "Fraud Protection"]].map(([I, t]) => {
            const Icon = I as typeof Lock;
            return <Reveal key={t as string} className="card-surface p-6 text-center"><Icon className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-semibold">{t as string}</p></Reveal>;
          })}
        </div>
      </Section>
    </SiteLayout>
  );
}
