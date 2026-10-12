import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
AlertDialog,
AlertDialogAction,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { apiRequest } from "@/lib/api";
import { usd } from "@/lib/demo-data";
import { useRealAccount } from "@/lib/use-real-account";

export const Route = createFileRoute("/dashboard/transfers")({
head: () => ({
meta: [
{ title: "Transfer Money — Aurevia Bank" },
{
name: "description",
content: "Transfer money securely to another Aurevia account.",
},
],
}),
component: Transfers,
});

type RecipientResponse = {
recipient: {
account_number: string;
name: string;
currency: string;
};
message: string;
};

type TransferResponse = {
message: string;
transaction: {
reference: string;
type: string;
amount: string | number;
currency: string;
status: string;
recipient_account_number: string | null;
created_at: string;
};
};

function Transfers() {
const { account, loading: accountLoading, error: accountError, refresh } =
useRealAccount();

const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
const recipientAccountNumberRef = useRef("");
const [recipient, setRecipient] =
useState<RecipientResponse["recipient"] | null>(null);
const [amount, setAmount] = useState("");
const [description, setDescription] = useState("");

const [verifying, setVerifying] = useState(false);
const [processing, setProcessing] = useState(false);
const [confirm, setConfirm] = useState(false);
const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

const verifyRecipient = async (accountNumber: string) => {
  if (!/^\d{10}$/.test(accountNumber)) return;

  const token = localStorage.getItem("aurevia_api_token");

  if (!token) {
    toast.error("Please sign in again to continue.");
    return;
  }

  setVerifying(true);
  setRecipient(null);

  try {
    const data = await apiRequest<RecipientResponse>(
      "/transfers/recipient",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          account_number: accountNumber,
        }),
      },
    );

    // Only display the result if the input still contains this account number.
    if (recipientAccountNumberRef.current === accountNumber) {
      setRecipient(data.recipient);
      toast.success("Recipient verified successfully.");
    }
  } catch (error) {
    if (recipientAccountNumberRef.current === accountNumber) {
      setRecipient(null);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to verify this recipient.",
      );
    }
  } finally {
    setVerifying(false);
  }
};


const reviewTransfer = (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();

if (!recipient) {
  toast.error("Verify the recipient before continuing.");
  return;
}

const numericAmount = Number(amount);

if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
  toast.error("Enter a valid transfer amount.");
  return;
}

if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
  toast.error("Enter an amount with no more than two decimal places.");
  return;
}

if (numericAmount > 1000000) {
  toast.error("The maximum transfer amount is $1,000,000.");
  return;
}

if (account && numericAmount > account.balance) {
  toast.error("Your available balance is insufficient.");
  return;
}

setIdempotencyKey(crypto.randomUUID());
setConfirm(true);

};

const confirmTransfer = async () => {
if (!recipient || !idempotencyKey) {
toast.error("Please review the transfer again.");
return;
}

const token = localStorage.getItem("aurevia_api_token");

if (!token) {
  toast.error("Please sign in again to continue.");
  return;
}

setProcessing(true);

try {
  const data = await apiRequest<TransferResponse>("/transfers", {
    method: "POST",
    token,
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      recipient_account_number: recipient.account_number,
      amount: amount.trim(),
      description: description.trim(),
    }),
  });

  if (data.transaction.status !== "completed") {
    throw new Error("The transfer has not been confirmed as completed.");
  }

  setConfirm(false);
  setIdempotencyKey(null);
  setRecipientAccountNumber("");
  setRecipient(null);
  setAmount("");
  setDescription("");

  await refresh();

  toast.success("Transfer completed successfully.", {
    description: `Reference: ${data.transaction.reference}`,
  });
} catch (error) {
  toast.error(
    error instanceof Error
      ? error.message
      : "Transfer failed. Please try again.",
  );
} finally {
  setProcessing(false);
}


};

return ( <div className="mx-auto w-full max-w-2xl space-y-6 pb-8">
{/* Page heading */} <div className="space-y-1"> <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
Transfer Money </h1> <p className="text-sm text-muted-foreground">
Send money instantly to another Aurevia account. </p> </div>

  {/* Available balance */}
  <section className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="flex items-center gap-3 border-b border-border px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ArrowDownLeft className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-semibold">Available Balance</h2>
        <p className="text-xs text-muted-foreground">Your USD account</p>
      </div>
    </div>

    <div className="space-y-3 p-5">
      {accountLoading ? (
        <p className="text-sm text-muted-foreground">
          Loading your balance...
        </p>
      ) : account ? (
        <>
          <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {usd(account.balance)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Account number
              </p>
              <p className="mt-1 text-sm font-medium tracking-wide">
                {account.account_number}
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                account.status === "active"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {account.status}
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-destructive">
          {accountError || "Unable to load your account."}
        </p>
      )}
    </div>
  </section>

  {/* Transfer details */}
  <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
    <div className="mb-6">
      <h2 className="text-lg font-semibold">Transfer Details</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the recipient's details and the amount you want to send.
      </p>
    </div>

    <form onSubmit={reviewTransfer} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="recipientAccount">
          Recipient account number
        </Label>

        <Input
          id="recipientAccount"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder="Enter 10-digit account number"
          value={recipientAccountNumber}
          onChange={(event) => {
            const value = event.target.value
              .replace(/\D/g, "")
              .slice(0, 10);

            recipientAccountNumberRef.current = value;
            setRecipientAccountNumber(value);
            setRecipient(null);

            if (value.length === 10) {
              void verifyRecipient(value);
            }
          }}
          className="h-12 rounded-xl"
          required
        />

        {verifying && (
          <p className="text-sm text-muted-foreground">
            Checking account details...
          </p>
        )}

        {recipient && !verifying && (
          <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div className="min-w-0">
              <p className="font-semibold">{recipient.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Account {recipient.account_number}
              </p>
              <p className="mt-1 text-xs text-green-600">
                Recipient verified successfully
              </p>
            </div>
          </div>
        )}
      </div>


      <div className="space-y-2">
        <Label htmlFor="transferAmount">Amount (USD)</Label>
        <Input
          id="transferAmount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="h-12 rounded-xl"
          required
        />
        {account && (
          <p className="text-xs text-muted-foreground">
            Available: {usd(account.balance)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="transferDescription">
          Description <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="transferDescription"
          maxLength={100}
          placeholder="What's this transfer for?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="h-12 rounded-xl"
        />
      </div>

      <Button
        type="submit"
        variant="hero"
        size="xl"
        className="w-full rounded-xl"
        disabled={
          !recipient ||
          verifying ||
          processing ||
          accountLoading ||
          !account ||
          account.status !== "active"
        }
      >
        Review Transfer
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        Review the recipient and amount before confirming.
      </p>
    </form>
  </section>

  {/* Transfer confirmation */}
  <AlertDialog
    open={confirm}
    onOpenChange={(open) => {
      if (processing) return;

      setConfirm(open);

      if (!open) {
        setIdempotencyKey(null);
      }
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirm your transfer</AlertDialogTitle>
        <AlertDialogDescription>
          Check the details below before sending money.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-4 rounded-xl border p-4">
        <div>
          <p className="text-sm text-muted-foreground">Recipient</p>
          <p className="font-semibold">{recipient?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">
            {recipient?.account_number ?? "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="text-2xl font-semibold">
            {usd(Number(amount) || 0)}
          </p>
        </div>

        {description.trim() && (
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{description.trim()}</p>
          </div>
        )}
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={processing}>
          Cancel
        </AlertDialogCancel>

        <AlertDialogAction
          disabled={processing}
          onClick={(event) => {
            event.preventDefault();
            void confirmTransfer();
          }}
        >
          {processing ? "Processing..." : "Confirm & Send"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>

);
}
