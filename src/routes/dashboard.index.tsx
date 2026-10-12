import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
// import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChevronDown, Download, Send, Building2, ArrowLeftRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardCard, PageTitle, TransactionRow } from "@/components/dashboard/ui";
import { BankingCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAuth, usd } from "@/lib/demo-data";
import { useMyAccounts } from "@/lib/bank-store";
import { useRealAccount } from "../lib/use-real-account";

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
  const navigate = useNavigate();
  const { account, loading, error } = useRealAccount();

  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [transferMethod, setTransferMethod] = useState<"aurevia" | "wire" | null>(null);
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
                {loading
                ? "Loading..."
                : account
                  ? usd(Number(account.balance))
                  : "—"}
              </p>
              {error && (
                <p className="mt-2 text-sm text-red-300">{error}</p>
              )}

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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card-surface p-5">
              <p className="text-sm text-muted-foreground">
                USD Account Balance
              </p>

              <p className="mt-2 font-display text-xl font-semibold">
                {loading
                  ? "Loading..."
                  : account
                    ? usd(Number(account.balance))
                    : "—"}
              </p>
            </div>

            <div className="card-surface p-5">
              <p className="text-sm text-muted-foreground">
                Account Number
              </p>

              <p className="mt-2 font-display text-xl font-semibold">
                {account?.account_number ?? "Unavailable"}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Status: {account?.status ?? "Unavailable"}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <button
          type="button"
          onClick={() => {
            setTransferMethod(null);
            setShowTransferOptions(true);
          }}
          className="card-surface flex items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-elegant"
        >
          <Send className="h-4 w-4 text-primary" />
          Transfer
        </button>

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

      {/* Transfer Method Selection */}
      {showTransferOptions && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowTransferOptions(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
            className="w-full max-w-lg rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="transfer-modal-title"
                  className="text-xl font-semibold sm:text-2xl"
                >
                  Choose Transfer Method
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  How would you like to send your money?
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTransferOptions(false)}
                aria-label="Close transfer selection"
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Aurevia Account */}
              <button
                type="button"
                aria-pressed={transferMethod === "aurevia"}
                onClick={() => setTransferMethod("aurevia")}
                className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  transferMethod === "aurevia"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      transferMethod === "aurevia"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <ArrowLeftRight className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">Aurevia Account</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Send money to another Aurevia customer using their account number.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      transferMethod === "aurevia"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {transferMethod === "aurevia" && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Wire Transfer */}
              <button
                type="button"
                aria-pressed={transferMethod === "wire"}
                onClick={() => setTransferMethod("wire")}
                className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  transferMethod === "wire"
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      transferMethod === "wire"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">Wire Transfer</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Send a transfer request to an account at another bank.
                    </p>
                  </div>

                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      transferMethod === "wire"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {transferMethod === "wire" && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setShowTransferOptions(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="hero"
                className="rounded-xl"
                disabled={!transferMethod}
                onClick={() => {
                  if (transferMethod === "aurevia") {
                    setShowTransferOptions(false);
                    void navigate({ to: "/dashboard/transfers" });
                  } else if (transferMethod === "wire") {
                    setShowTransferOptions(false);
                    void navigate({ to: "/dashboard/withdraw" });
                  }
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
