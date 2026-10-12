import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardCard, PageTitle, TransactionRow } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { demoAuth, transactions, usd } from "@/lib/demo-data";
import { useMyAccounts } from "@/lib/bank-store";
import { useRealAccount } from "../lib/use-real-account";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export const Route = createFileRoute("/dashboard/accounts")({ head: () => ({ meta: [
  { title: "Accounts — Aurevia Bank" },
  { name: "description", content: "Accounts for your Aurevia Bank account." },
  { property: "og:title", content: "Accounts — Aurevia Bank" },
  { property: "og:description", content: "Accounts for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Accounts });

function Accounts() {
  const { account, loading, error } = useRealAccount();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyAccountNumber = async () => {
    if (!account?.account_number) return;

    try {
      await navigator.clipboard.writeText(account.account_number);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy account number. Please copy it manually.");
    }
  };

  return (
    <div>
      <PageTitle
        title="Accounts"
        subtitle="View your account details and available balance."
      />

      {loading ? (
        <div className="card-surface p-6">
          <p className="text-sm text-muted-foreground">
            Loading your account...
          </p>
        </div>
      ) : error ? (
        <div className="card-surface p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : account ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <DashboardCard>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {account.currency} Account
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Aurevia Account
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Account Number: {account.account_number}
            </p>

            <p className="mt-3 font-display text-3xl font-semibold">
              {usd(Number(account.balance))}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Account status: {account.status}
            </p>

            <Button
              variant="soft"
              className="mt-6 w-full"
              onClick={() => setDetailsOpen(true)}
            >
              View details
            </Button>
          </DashboardCard>
        </div>
      ) : (
        <div className="card-surface p-6">
          <p className="text-sm text-muted-foreground">
            No account information is available.
          </p>
        </div>
      )}

      {detailsOpen && account && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-details-title"
            className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  Aurevia Bank
                </p>

                <h2
                  id="account-details-title"
                  className="mt-2 text-2xl font-semibold"
                >
                  Account details
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your personal account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                aria-label="Close account details"
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Account holder
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {demoAuth.get()?.name ?? "Account holder"}
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground">
                  Account number
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="break-all text-xl font-semibold tracking-wide">
                    {account.account_number}
                  </p>

                  <Button
                    type="button"
                    variant="soft"
                    size="icon"
                    onClick={copyAccountNumber}
                    aria-label="Copy account number"
                    title="Copy account number"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {copied
                    ? "Account number copied!"
                    : "Copy your account number to share it."}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Account currency
                  </p>

                  <p className="mt-1 font-semibold">
                    {account.currency}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Account status
                  </p>

                  <p className="mt-1 font-semibold capitalize">
                    {account.status}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => setDetailsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
