import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bitcoin,
  CheckCircle2,
  Clock,
  Copy,
  History,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/dashboard/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit Funds — Aurevia Bank" },
      {
        name: "description",
        content: "Manage Bitcoin deposit requests on Aurevia Bank.",
      },
    ],
  }),
  component: Deposit,
});

type DepositRecord = {
  id: number;
  reference: string | null;
  usd_amount: string;
  btc_amount: string;
  receiving_address: string;
  status: string;
  confirmations: number;
  expires_at: string | null;
  created_at: string | null;
};

type DepositListResponse = {
  data: DepositRecord[];
  current_page: number;
  last_page: number;
  total: number;
};

type DepositResponse = {
  message: string;
  deposit: DepositRecord;
};

const formatUSD = (value: string | number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));

const formatBTC = (value: string | number) =>
  `${Number(value).toFixed(8)} BTC`;

function formatDate(value: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Awaiting payment",
    detected: "Payment detected",
    underpayment_review: "Underpayment review",
    expired_payment_review: "Payment review",
    completed: "Completed",
    expired: "Expired",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function statusStyle(status: string) {
  if (status === "completed") {
    return "bg-emerald-500/10 text-emerald-600";
  }

  if (
    status === "detected" ||
    status === "underpayment_review" ||
    status === "expired_payment_review"
  ) {
    return "bg-blue-500/10 text-blue-600";
  }

  if (status === "pending") {
    return "bg-amber-500/10 text-amber-600";
  }

  return "bg-muted text-muted-foreground";
}

function Deposit() {
  const [amount, setAmount] = useState("");
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [activeDeposit, setActiveDeposit] =
    useState<DepositRecord | null>(null);

  const [txid, setTxid] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submittingTxid, setSubmittingTxid] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("aurevia_api_token")
      : null;

  const loadDeposits = useCallback(
    async (showToast = false) => {
      if (!token) {
        setLoading(false);
        setLoadError("Please sign in to access your deposit history.");
        return;
      }

      setRefreshing(true);
      setLoadError("");

      try {
        const response = await apiRequest<DepositListResponse>(
          "/btc-deposits",
          { token },
        );

        setDeposits(response.data ?? []);

        setActiveDeposit((current) => {
          if (!current) return null;

          return (
            response.data.find((item) => item.id === current.id) ??
            current
          );
        });

        if (showToast) {
          toast.success("Deposit history refreshed.");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load deposit history.";

        setLoadError(message);

        if (showToast) {
          toast.error(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadDeposits();
  }, [loadDeposits]);

  async function createDeposit() {
    const normalizedAmount = amount.trim();

    if (!normalizedAmount) {
      toast.error("Enter the amount you want to deposit.");
      return;
    }

    if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(normalizedAmount)) {
      toast.error("Enter a valid USD amount with up to two decimal places.");
      return;
    }

    const numericAmount = Number(normalizedAmount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 10 ||
      numericAmount > 10000
    ) {
      toast.error("Deposits must be between $10 and $10,000.");
      return;
    }

    if (!token) {
      toast.error("Please sign in before creating a deposit.");
      return;
    }

    setCreating(true);

    try {
      const response = await apiRequest<DepositResponse>(
        "/btc-deposits",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            amount: normalizedAmount,
          }),
        },
      );

      setActiveDeposit(response.deposit);
      setTxid("");
      setAmount("");

      toast.success("Deposit request created.");

      await loadDeposits();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your deposit request.";

      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function submitTransactionId() {
    if (!activeDeposit || !token) {
      toast.error("Select a deposit before submitting a transaction ID.");
      return;
    }

    const normalizedTxid = txid.trim();

    if (!/^[a-fA-F0-9]{64}$/.test(normalizedTxid)) {
      toast.error(
        "Enter a valid Bitcoin transaction ID containing 64 hexadecimal characters.",
      );
      return;
    }

    setSubmittingTxid(true);

    try {
      const response = await apiRequest<DepositResponse>(
        `/btc-deposits/${activeDeposit.id}/transaction-id`,
        {
          method: "POST",
          token,
          body: JSON.stringify({
            txid: normalizedTxid,
          }),
        },
      );

      setActiveDeposit(response.deposit);
      setTxid("");

      toast.success(response.message);

      await loadDeposits();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit your transaction ID.";

      toast.error(message);
    } finally {
      setSubmittingTxid(false);
    }
  }

  async function copyAddress(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Bitcoin address copied.");
    } catch {
      toast.error("Unable to copy the address. Please copy it manually.");
    }
  }

  function selectDeposit(deposit: DepositRecord) {
    setActiveDeposit(deposit);
    setTxid("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const canSubmitTxid =
    activeDeposit?.status === "pending" &&
    Boolean(activeDeposit.receiving_address);

  const qrValue = activeDeposit
    ? `bitcoin:${activeDeposit.receiving_address}?amount=${activeDeposit.btc_amount}`
    : "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageTitle
        title="Deposit Center"
        subtitle="Add funds to your Aurevia account using Bitcoin."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {!activeDeposit ? (
            <DashboardCard>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Bitcoin className="h-6 w-6" />
                </span>

                <div>
                  <h2 className="text-lg font-semibold">
                    Deposit with Bitcoin
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Choose an amount in USD. Your Bitcoin payment
                    instructions will be generated by Aurevia's backend.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="deposit-amount"
                    className="mb-2 block text-sm font-medium"
                  >
                    Deposit amount (USD)
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>

                    <Input
                      id="deposit-amount"
                      type="number"
                      min="10"
                      max="10000"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="h-14 rounded-2xl pl-9 text-xl font-semibold"
                      disabled={creating}
                    />
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Minimum $10.00 · Maximum $10,000.00
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[50, 100, 250, 500].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAmount(String(value))}
                        disabled={creating}
                        className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        ${value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                      <Bitcoin className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Bitcoin (BTC)</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Bitcoin Mainnet
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                      Selected
                    </span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="h-12 w-full"
                  onClick={createDeposit}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting Bitcoin quote...
                    </>
                  ) : (
                    <>
                      Continue to payment instructions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs leading-5 text-muted-foreground">
                  Your deposit request must be created successfully before
                  payment instructions can be displayed.
                </p>
              </div>
            </DashboardCard>
          ) : (
            <DashboardCard>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                    <Bitcoin className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Bitcoin payment instructions
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Deposit reference:{" "}
                      {activeDeposit.reference ?? `#${activeDeposit.id}`}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusStyle(
                    activeDeposit.status,
                  )}`}
                >
                  {statusLabel(activeDeposit.status)}
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-muted/50 p-5">
                <p className="text-sm text-muted-foreground">
                  Requested USD amount
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {formatUSD(activeDeposit.usd_amount)}
                </p>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">
                    Bitcoin to send
                  </span>

                  <span className="text-right font-semibold">
                    {formatBTC(activeDeposit.btc_amount)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Network
                  </span>

                  <span className="text-sm font-medium">
                    Bitcoin Mainnet
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Confirmations
                  </span>

                  <span className="text-sm font-medium">
                    {activeDeposit.confirmations}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Quote expires
                  </span>

                  <span className="text-right text-sm font-medium">
                    {formatDate(activeDeposit.expires_at)}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-border p-5 text-center">
                  <h3 className="font-semibold">Scan to pay with Bitcoin</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Scan this QR code using your Bitcoin wallet.
                  </p>

                  <div className="mx-auto mt-5 flex w-fit items-center justify-center rounded-2xl bg-white p-4">
                    <QRCodeSVG
                      value={qrValue}
                      size={220}
                      level="M"
                      marginSize={2}
                      title="Aurevia Bitcoin deposit payment QR code"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold">
                    {formatBTC(activeDeposit.btc_amount)}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Bitcoin Mainnet
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Receiving Bitcoin address
                  </h3>

                  <div className="break-all rounded-xl border border-border bg-background p-4 font-mono text-sm leading-6">
                    {activeDeposit.receiving_address}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      copyAddress(activeDeposit.receiving_address)
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy receiving address
                  </Button>
                </div>
              </div>

              {activeDeposit.status === "pending" && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <p className="text-sm leading-6 text-muted-foreground">
                      Send the exact BTC amount using Bitcoin Mainnet only.
                      Sending another asset or using another network may
                      result in lost funds. Check the address carefully
                      before confirming your transfer.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="bitcoin-txid"
                      className="mb-2 block text-sm font-medium"
                    >
                      Bitcoin transaction ID (TXID)
                    </label>

                    <Input
                      id="bitcoin-txid"
                      value={txid}
                      onChange={(event) => setTxid(event.target.value)}
                      placeholder="Enter your 64-character transaction ID"
                      className="h-12 rounded-xl font-mono text-sm"
                      maxLength={64}
                      autoComplete="off"
                    />

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      After sending your Bitcoin, paste the transaction ID
                      here so the deposit can be reviewed.
                    </p>
                  </div>

                  <Button
                    variant="hero"
                    className="h-12 w-full"
                    onClick={submitTransactionId}
                    disabled={submittingTxid || !txid.trim()}
                  >
                    {submittingTxid ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting transaction ID...
                      </>
                    ) : (
                      "Submit transaction ID"
                    )}
                  </Button>
                </div>
              )}

              {activeDeposit.status !== "pending" && (
                <div className="mt-6 rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div>
                      <p className="font-medium">
                        {activeDeposit.status === "completed"
                          ? "Deposit completed"
                          : "Deposit status update"}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {activeDeposit.status === "completed"
                          ? "This deposit has been approved by the banking system."
                          : "Your deposit is no longer in the initial pending state. Check the status above or refresh your deposit history for the latest information."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => {
                  setActiveDeposit(null);
                  setTxid("");
                }}
              >
                Back to Deposit Center
              </Button>
            </DashboardCard>
          )}

          <DashboardCard>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <History className="h-5 w-5" />
                </span>

                <div>
                  <h2 className="font-semibold">Deposit history</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review your previous Bitcoin deposit requests.
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => void loadDeposits(true)}
                disabled={refreshing}
                aria-label="Refresh deposit history"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {loadError && (
              <div className="mt-4 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
                {loadError}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading deposit history...
              </div>
            ) : deposits.length === 0 ? (
              <div className="py-10 text-center">
                <Wallet className="mx-auto h-9 w-9 text-muted-foreground/60" />

                <p className="mt-3 font-medium">No deposits yet</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Your Bitcoin deposit requests will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {deposits.map((deposit) => (
                  <button
                    key={deposit.id}
                    type="button"
                    onClick={() => selectDeposit(deposit)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary/50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                      <Bitcoin className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {formatUSD(deposit.usd_amount)}
                      </span>

                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {deposit.reference ?? `Deposit #${deposit.id}`}
                      </span>

                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDate(deposit.created_at)}
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(
                          deposit.status,
                        )}`}
                      >
                        {statusLabel(deposit.status)}
                      </span>

                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </span>

            <h2 className="mt-4 font-semibold">How Bitcoin deposits work</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Follow these steps to submit a deposit for verification.
            </p>

            <div className="mt-6 space-y-5">
              {[
                {
                  title: "Create a deposit request",
                  description:
                    "Choose your USD amount and obtain a generated BTC quote.",
                },
                {
                  title: "Send Bitcoin",
                  description:
                    "Use the exact amount and receiving address provided for your request.",
                },
                {
                  title: "Submit your transaction ID",
                  description:
                    "Provide the TXID so the payment can be located and reviewed.",
                },
                {
                  title: "Wait for verification",
                  description:
                    "The payment must pass the required checks and administrator approval.",
                },
              ].map((item, index) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold">
                    {index + 1}
                  </span>

                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div>
                <h3 className="text-sm font-semibold">
                  Account and payment security
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Never share your password, one-time verification codes,
                  wallet recovery phrase, or private keys. Only send funds
                  after checking the payment details in your account.
                </p>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Submitting a transaction ID does not guarantee approval.
                  Your Aurevia USD balance will not be credited until the
                  payment has been verified and approved.
                </p>
              </div>
            </div>
          </div>

          {activeDeposit && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <h3 className="text-sm font-semibold">
                    Selected deposit
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatUSD(activeDeposit.usd_amount)} ·{" "}
                    {formatBTC(activeDeposit.btc_amount)}
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                    {activeDeposit.reference ?? `Deposit #${activeDeposit.id}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}