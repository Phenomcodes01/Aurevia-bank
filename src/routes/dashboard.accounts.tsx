import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardCard, PageTitle, TransactionRow } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { demoAuth, transactions, usd } from "@/lib/demo-data";
import { useMyAccounts } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard/accounts")({ head: () => ({ meta: [
  { title: "Accounts — Aurevia Bank" },
  { name: "description", content: "Accounts for your Aurevia Bank account." },
  { property: "og:title", content: "Accounts — Aurevia Bank" },
  { property: "og:description", content: "Accounts for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Accounts });

function Accounts() {
  const accounts = useMyAccounts(demoAuth.get()?.email);
  return (
    <div>
      <PageTitle title="Accounts" subtitle="Your checking, savings and investment accounts." />
      <div className="grid gap-6 xl:grid-cols-3">
        {accounts.map((a, i) => (
          <DashboardCard key={a.id}>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{a.type}</p>
            <h2 className="mt-1 text-lg font-semibold">{a.name} <span className="text-sm font-normal text-muted-foreground">{a.number}</span></h2>
            <p className="mt-3 font-display text-3xl font-semibold">{usd(a.balance)}</p>
            <h3 className="mt-6 text-sm font-semibold">Recent activity</h3>
            <ul className="divide-y divide-border">{transactions.slice(i * 3, i * 3 + 3).map((t) => <TransactionRow key={t.id} t={t} />)}</ul>
            <Button variant="soft" className="mt-4 w-full" onClick={() => toast(`${a.name} details`)}>View details</Button>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
