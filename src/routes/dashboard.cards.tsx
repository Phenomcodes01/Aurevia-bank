import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { BankingCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { demoAuth, usd } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/cards")({ head: () => ({ meta: [
  { title: "Cards — Aurevia Bank" },
  { name: "description", content: "Cards for your Aurevia Bank account." },
  { property: "og:title", content: "Cards — Aurevia Bank" },
  { property: "og:description", content: "Cards for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Cards });

function CardPanel({ label, tone, last4 }: { label: string; tone: "navy" | "primary"; last4: string }) {
  const [frozen, setFrozen] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [limit, setLimit] = useState(2500);
  return (
    <DashboardCard>
      <div className={frozen ? "opacity-50 grayscale transition" : "transition"}><BankingCard tone={tone} label={label} last4={last4} name={demoAuth.get()?.name ?? "Alex Morgan"} /></div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm">Status: <span className={frozen ? "font-semibold text-destructive" : "font-semibold text-success"}>{frozen ? "Frozen" : "Active"}</span></span>
        <Button variant={frozen ? "hero" : "outline"} className="rounded-full" onClick={() => { setFrozen(!frozen); toast(frozen ? "Card unfrozen" : "Card frozen"); }}>
          {frozen ? "Unfreeze Card" : "Freeze Card"}
        </Button>
      </div>
      <div className="mt-5 flex items-center justify-between"><Label htmlFor={`a-${last4}`}>Transaction Alerts</Label><Switch id={`a-${last4}`} checked={alerts} onCheckedChange={setAlerts} /></div>
      <div className="mt-5">
        <div className="flex justify-between text-sm"><Label>Spending Limit</Label><span className="font-semibold">{usd(limit)}</span></div>
        <Slider className="mt-3" value={[limit]} min={100} max={10000} step={100} onValueChange={([v]) => setLimit(v ?? 100)} aria-label="Spending limit" />
      </div>
    </DashboardCard>
  );
}

function Cards() {
  return (
    <div>
      <PageTitle title="Cards" subtitle="Manage your cards, alerts and spending limits." />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardPanel label="Virtual Debit" tone="primary" last4="7731" />
        <CardPanel label="Physical Debit" tone="navy" last4="4582" />
      </div>
    </div>
  );
}
