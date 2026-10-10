import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
// import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChevronDown, Download, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardCard, PageTitle, TransactionRow } from "@/components/dashboard/ui";
import { BankingCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAuth, usd } from "@/lib/demo-data";
import { useMyAccounts } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard/")({ head: () => ({ meta: [
  { title: "Overview — Aurevia Bank" },
  { name: "description", content: "Overview for your Aurevia Bank account." },
  { property: "og:title", content: "Overview — Aurevia Bank" },
  { property: "og:description", content: "Overview for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Overview });

const recent = [
  { name: "Incoming Transfer", amount: 2450, category: "Transfer", date: "Sep 30" },
  { name: "Apple Store", amount: -999, category: "Shopping", date: "Sep 29" },
  { name: "Netflix", amount: -15.99, category: "Entertainment", date: "Sep 28" },
  { name: "Salary", amount: 4500, category: "Income", date: "Sep 27" },
];
// const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Overview() {
  const accts = useMyAccounts(demoAuth.get()?.email);
  const name = demoAuth.get()?.name ?? "there";
  const [amt, setAmt] = useState("");
  const [showBalances, setShowBalances] = useState(false);
  const act = (l: string) => toast(`${l} is not available yet`, { description: "" });
  return (
    <div className="space-y-6">
      <PageTitle title={`Welcome back, ${name.split(" ")[0]}`} subtitle="Here's your financial overview." />
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowBalances((prev) => !prev)}
          aria-expanded={showBalances}
          className="w-full rounded-[1.5rem] bg-gradient-navy p-6 text-left text-navy-foreground shadow-elegant transition hover:shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-navy-foreground/70">Total Balance</p>

              <p className="mt-2 font-display text-3xl font-semibold">
                {usd(accts[0]!.balance + accts[1]!.balance + accts[2]!.balance)}
              </p>

              <p className="mt-2 text-xs text-navy-foreground/70">
                {showBalances ? "Hide account breakdown" : "Click to view account breakdown"}
              </p>
            </div>

            <ChevronDown
              className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                showBalances ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {showBalances && (
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Available Balance", accts[0]!.balance],
              ["Savings", accts[1]!.balance],
              ["Investments", accts[2]!.balance],
            ].map(([label, balance]) => (
              <div key={label as string} className="card-surface p-5">
                <p className="text-sm text-muted-foreground">
                  {label as string}
                </p>

                <p className="mt-2 font-display text-xl font-semibold">
                  {usd(balance as number)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <Link
          to="/dashboard/withdraw"
          className="card-surface flex items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-elegant"
        >
          <Send className="h-4 w-4 text-primary" />
          Withdraw
        </Link>

        <Link
          to="/dashboard/deposit"
          className="card-surface flex items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-elegant"
        >
          <Download className="h-4 w-4 text-primary" />
          Deposit
        </Link>
      </div>


      {/* <div className="grid gap-6 xl:grid-cols-3">
        <DashboardCard title="Balance" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={balanceSeries}>
                <defs><linearGradient id="bal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity={0.3} /><stop offset="1" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip formatter={(v: number) => usd(v)} />
                <Area dataKey="balance" stroke="var(--primary)" strokeWidth={2.5} fill="url(#bal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
        <DashboardCard title="Spending">
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart><Pie data={spending} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>{spending.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip formatter={(v: number) => usd(v)} /></PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm">{spending.map((s, i) => <li key={s.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />{s.name}<span className="ml-auto font-medium">{usd(s.value)}</span></li>)}</ul>
        </DashboardCard>
      </div> */}
      <div className="grid gap-6 xl:grid-cols-3">
        <DashboardCard title="Recent Transactions" action={<Link to="/dashboard/transactions" className="text-sm font-semibold text-primary">View all</Link>}>
          <ul className="divide-y divide-border">{recent.map((t) => <TransactionRow key={t.name} t={t} />)}</ul>
        </DashboardCard>
        <DashboardCard title="Savings Goal">
          <p className="text-sm text-muted-foreground">Emergency fund</p>
          <div className="mt-4 h-2.5 rounded-full bg-muted"><div className="h-2.5 w-[78%] rounded-full bg-gradient-primary" /></div>
          <h3 className="mt-8 text-sm font-semibold">Quick Transfer</h3>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!Number(amt)) { toast.error("Enter an amount"); return; } toast.success(`Sent ${usd(Number(amt))}`); setAmt(""); }}>
            <Input aria-label="Amount" inputMode="decimal" placeholder="$0.00" value={amt} onChange={(e) => setAmt(e.target.value)} className="rounded-full" />
            <Button variant="hero" type="submit">Send</Button>
          </form>
        </DashboardCard>
        <DashboardCard title="My Card" action={<Link to="/dashboard/cards" className="text-sm font-semibold text-primary">Manage</Link>}>
          <BankingCard name={name} />
        </DashboardCard>
      </div>
    </div>
  );
}
