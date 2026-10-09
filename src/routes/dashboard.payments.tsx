import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Droplets, Phone, Wifi, Zap } from "lucide-react";
import { DashboardCard, PageTitle, TransactionRow } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { usd } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/payments")({ head: () => ({ meta: [
  { title: "Payments — Aurevia Bank" },
  { name: "description", content: "Payments for your Aurevia Bank account." },
  { property: "og:title", content: "Payments — Aurevia Bank" },
  { property: "og:description", content: "Payments for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Payments });

const initial = [
  { id: 1, name: "Electric Utility", icon: Zap, amount: 112.3, due: "Oct 5" },
  { id: 2, name: "Internet", icon: Wifi, amount: 69.99, due: "Oct 8" },
  { id: 3, name: "Water", icon: Droplets, amount: 42.1, due: "Oct 12" },
  { id: 4, name: "Mobile Plan", icon: Phone, amount: 55, due: "Oct 15" },
];

function Payments() {
  const [bills, setBills] = useState(initial);
  const [paid, setPaid] = useState<{ name: string; amount: number; date: string; category: string }[]>([
    { name: "Credit Card Payment", amount: -450, date: "Sep 25", category: "Bills" },
    { name: "Insurance", amount: -128.5, date: "Sep 20", category: "Bills" },
  ]);
  const pay = (id: number) => {
    const b = bills.find((x) => x.id === id)!;
    setBills(bills.filter((x) => x.id !== id));
    setPaid([{ name: b.name, amount: -b.amount, date: "Today", category: "Bills" }, ...paid]);
    toast.success(`Paid ${b.name}`);
  };
  return (
    <div className="space-y-6">
      <PageTitle title="Payments" subtitle="Pay bills and manage scheduled payments." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {bills.map((b) => (
          <DashboardCard key={b.id}>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><b.icon className="h-5 w-5" /></span>
            <p className="mt-4 font-semibold">{b.name}</p>
            <p className="text-sm text-muted-foreground">Due {b.due}</p>
            <p className="mt-3 font-display text-xl font-semibold">{usd(b.amount)}</p>
            <Button variant="hero" className="mt-4 w-full" onClick={() => pay(b.id)}>Pay Bill</Button>
          </DashboardCard>
        ))}
        {bills.length === 0 && <p className="text-sm text-muted-foreground">All bills paid. 🎉</p>}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Scheduled Payments">
          <ul className="divide-y divide-border text-sm">
            {[["Rent", "Nov 1", 1850], ["Gym Membership", "Oct 20", 39], ["Car Loan", "Oct 25", 342.6]].map(([n, d, a]) => (
              <li key={n as string} className="flex justify-between py-3"><span>{n as string} <span className="text-muted-foreground">· {d as string}</span></span><span className="font-semibold">{usd(a as number)}</span></li>
            ))}
          </ul>
        </DashboardCard>
        <DashboardCard title="Recent Payments"><ul className="divide-y divide-border">{paid.map((p, i) => <TransactionRow key={i} t={p} />)}</ul></DashboardCard>
      </div>
    </div>
  );
}
