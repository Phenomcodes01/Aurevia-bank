import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Send,
  Building2,
  ArrowLeftRight,
  Check,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { TransactionReceipt } from "@/components/dashboard/transaction-receipt";
import { BankingCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoAuth, usd } from "@/lib/demo-data";
import { useRealAccount } from "../lib/use-real-account";
import { useRealTransactions } from "../lib/use-real-transactions";
import type { RealTransaction } from "../lib/use-real-transactions";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — Aurevia Bank" },
      {
        name: "description",
        content: "Overview for your Aurevia Bank account.",
      },
      { property: "og:title", content: "Overview — Aurevia Bank" },
      {
        property: "og:description",
        content: "Overview for your Aurevia Bank account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Overview,
});

function formatTransactionDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTransactionType(type: string) {
  switch (type.toLowerCase()) {
    case "transfer":
      return "Transfer";
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    default:
      return type.replace(/_/g, " ");
  }
}

function getTransactionDescription(transaction: RealTransaction) {
  if (transaction.description?.trim()) {
    return transaction.description;
  }

  const type = formatTransactionType(transaction.type);

  if (transaction.counterparty_account_number) {
    return `${type} · Account ${transaction.counterparty_account_number}`;
  }

  return type;
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-600";

    case "pending":
      return "bg-amber-500/10 text-amber-600";

    case "failed":
    case "rejected":
      return "bg-red-500/10 text-red-600";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function Overview() {
  const navigate = useNavigate();

  const { account, loading, error } = useRealAccount();

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useRealTransactions();

  const [showTransferOptions, setShowTransferOptions] = useState(false);
  const [transferMethod, setTransferMethod] = useState<
    "aurevia" | "wire" | null
  >(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<RealTransaction | null>(null);

  const name = demoAuth.get()?.name ?? "there";

  const [amt, setAmt] = useState("");
  const [showBalances, setShowBalances] = useState(false);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <PageTitle
        title={`Welcome back, ${name.split(" ")[0]}`}
        subtitle="Here's your financial overview."
      />

      {/* Total Balance */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowBalances((prev) => !prev)}
          aria-expanded={showBalances}
          className="w-full rounded-[1.5rem] bg-gradient-navy p-6 text-left text-navy-foreground shadow-elegant transition hover:shadow-lg"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-navy-foreground/70">
                Total Balance
              </p>

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
                {showBalances
                  ? "Hide account breakdown"
                  : "Click to view account breakdown"}
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

      {/* Quick Actions */}
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

      {/* Dashboard Cards */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent Transactions */}
        <DashboardCard
          title="Recent Transactions"
          action={
            <Link
              to="/dashboard/transactions"
              className="text-sm font-semibold text-primary"
            >
              View all
            </Link>
          }
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Your latest account activity
            </p>

            <button
              type="button"
              onClick={() => void refreshTransactions()}
              disabled={transactionsLoading}
              aria-label="Refresh recent transactions"
              title="Refresh transactions"
              className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  transactionsLoading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {transactionsLoading && transactions.length === 0 ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-muted" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded bg-muted" />
                    <div className="h-2 w-20 rounded bg-muted" />
                  </div>

                  <div className="h-4 w-16 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : transactionsError && transactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Unable to load your recent transactions.
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void refreshTransactions()}
              >
                Try again
              </Button>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-3 font-medium">No transactions yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Your recent account activity will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTransactions.map((transaction) => {
                const isCredit = transaction.direction === "credit";
                const status = transaction.status.toLowerCase();

                return (
                  <li key={transaction.reference}>
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(transaction)}
                      className="flex w-full items-center gap-3 py-4 text-left transition hover:bg-muted/40"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {getTransactionDescription(transaction)}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTransactionDate(
                              transaction.created_at,
                            )}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusClasses(
                              status,
                            )}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            isCredit ? "text-emerald-600" : ""
                          }`}
                        >
                          {isCredit ? "+" : "−"}
                          {usd(Number(transaction.amount))}
                        </p>

                        <p className="mt-1 text-[10px] capitalize text-muted-foreground">
                          {formatTransactionType(transaction.type)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {transactionsError && transactions.length > 0 && (
            <p className="mt-3 text-xs text-amber-600">
              Refresh failed. Showing the transactions already loaded.
            </p>
          )}
        </DashboardCard>

        {/* Quick Transfer */}
        {/* <DashboardCard title="Quick Transfer">
          <p className="text-sm text-muted-foreground">
            Send money quickly to another Aurevia account.
          </p>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();

              if (!Number(amt) || Number(amt) <= 0) {
                toast.error("Enter a valid amount");
                return;
              }

              setAmt("");
              void navigate({ to: "/dashboard/transfers" });
            }}
          >
            <Input
              aria-label="Amount"
              inputMode="decimal"
              placeholder="$0.00"
              value={amt}
              onChange={(event) => setAmt(event.target.value)}
              className="rounded-full"
            />

            <Button variant="hero" type="submit">
              Send
            </Button>
          </form>
        </DashboardCard> */}

        {/* My Card */}
        <DashboardCard
          title="My Card"
          action={
            <Link
              to="/dashboard/cards"
              className="text-sm font-semibold text-primary"
            >
              Manage
            </Link>
          }
        >
          <BankingCard name={name} />
        </DashboardCard>
      </div>

      {/* Transaction Receipt */}
      <TransactionReceipt
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

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
                      Send money to another Aurevia customer using their
                      account number.
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