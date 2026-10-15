import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
ArrowLeft,
ArrowRight,
Building2,
CheckCircle2,
Clock3,
Info,
ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
AlertDialog,
AlertDialogAction,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { apiRequest } from "@/lib/api";
import { usd } from "@/lib/demo-data";
import { useRealAccount } from "@/lib/use-real-account";

export const Route = createFileRoute("/dashboard/withdraw")({
head: () => ({
meta: [
{ title: "Wire Transfer — Aurevia Bank" },
{
name: "description",
content: "Submit and track a domestic wire transfer request.",
},
],
}),
component: Withdraw,
});

type ExternalTransferResponse = {
message: string;
transaction: {
reference: string;
type: string;
amount: string | number;
currency: string;
status: string;
bank_name: string | null;
routing_number: string | null;
account_number: string | null;
account_type: string | null;
account_name: string | null;
recipient_address: string | null;
transfer_purpose: string | null;
created_at: string;
};
};

type TransferReceipt = {
reference: string;
amount: number;
bankName: string;
routingNumber: string;
accountName: string;
accountNumber: string;
accountType: string;
recipientAddress: string;
transferPurpose: string;
createdAt: string;
};

const PURPOSE_OPTIONS = [
{ value: "personal", label: "Personal transfer" },
{ value: "business", label: "Business payment" },
{ value: "education", label: "Education" },
{ value: "family_support", label: "Family support" },
{ value: "other", label: "Other" },
] as const;

function Withdraw() {
const {
account,
loading: accountLoading,
error: accountError,
refresh,
} = useRealAccount();

const availableBalance = account?.balance ?? 0;

const [amount, setAmount] = useState("");
const [bankName, setBankName] = useState("");
const [routingNumber, setRoutingNumber] = useState("");
const [accountName, setAccountName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
const [accountType, setAccountType] = useState<"checking" | "savings">(
"checking",
);
const [recipientAddress, setRecipientAddress] = useState("");
const [transferPurpose, setTransferPurpose] = useState("personal");
const [transferPin, setTransferPin] = useState("");

const [step, setStep] = useState<"details" | "review">("details");
const [processing, setProcessing] = useState(false);
const [receiptOpen, setReceiptOpen] = useState(false);
const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

const numericAmount = Number(amount);

function continueToReview() {
if (
amount.trim() === "" ||
!Number.isFinite(numericAmount) ||
numericAmount <= 0 ||
!/^\d{1,8}(.\d{1,2})?$/.test(amount.trim())
) {
toast.error("Enter a valid amount with no more than two decimal places.");
return;
}


if (numericAmount < 10) {
  toast.error("The minimum transfer amount is $10.00.");
  return;
}

if (numericAmount > 1000000) {
  toast.error("The maximum transfer amount is $1,000,000.");
  return;
}

if (numericAmount > availableBalance) {
  toast.error("The transfer amount exceeds your available balance.");
  return;
}

if (!bankName.trim() || bankName.trim().length > 100) {
  toast.error("Enter a valid destination bank name.");
  return;
}

if (!/^\d{9}$/.test(routingNumber)) {
  toast.error("Enter a valid 9-digit US wire routing number.");
  return;
}

if (!/^\d{6,20}$/.test(accountNumber)) {
  toast.error("Enter a valid destination account number.");
  return;
}

if (accountNumber !== confirmAccountNumber) {
  toast.error("The account numbers do not match.");
  return;
}

if (!accountName.trim() || accountName.trim().length > 150) {
  toast.error("Enter the recipient's full name.");
  return;
}

if (recipientAddress.trim().length > 255) {
  toast.error("The recipient address must not exceed 255 characters.");
  return;
}

if (
  !PURPOSE_OPTIONS.some((option) => option.value === transferPurpose)
) {
  toast.error("Select a valid transfer purpose.");
  return;
}

if (!account || account.status !== "active") {
  toast.error("Your account is unavailable for transfers.");
  return;
}

setIdempotencyKey(crypto.randomUUID());
setTransferPin("");
setStep("review");


}

async function submitRequest() {
if (!idempotencyKey) {
toast.error("Please review the transfer details again.");
setStep("details");
return;
}


if (!/^\d{4}$/.test(transferPin)) {
  toast.error("Enter your four-digit Transfer PIN.");
  return;
}

const token = localStorage.getItem("aurevia_api_token");

if (!token) {
  toast.error("Please sign in again to continue.");
  return;
}

setProcessing(true);

try {
  const data = await apiRequest<ExternalTransferResponse>(
    "/external-transfers",
    {
      method: "POST",
      token,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        bank_name: bankName.trim(),
        routing_number: routingNumber,
        account_number: accountNumber,
        account_type: accountType,
        account_name: accountName.trim(),
        recipient_address: recipientAddress.trim() || null,
        transfer_purpose: transferPurpose,
        amount: amount.trim(),
        transfer_pin: transferPin,
      }),
    },
  );

  if (data.transaction.status !== "pending") {
    toast.error(
      "The request was not confirmed as pending. Check your transaction history before trying again.",
    );
    return;
  }

  setReceipt({
    reference: data.transaction.reference,
    amount: Number(data.transaction.amount),
    bankName: data.transaction.bank_name || bankName.trim(),
    routingNumber:
      data.transaction.routing_number || routingNumber,
    accountName: data.transaction.account_name || accountName.trim(),
    accountNumber:
      data.transaction.account_number || accountNumber,
    accountType: data.transaction.account_type || accountType,
    recipientAddress:
      data.transaction.recipient_address || recipientAddress.trim(),
    transferPurpose:
      data.transaction.transfer_purpose || transferPurpose,
    createdAt: data.transaction.created_at,
  });

  setReceiptOpen(true);
  setStep("details");

  setAmount("");
  setBankName("");
  setRoutingNumber("");
  setAccountName("");
  setAccountNumber("");
  setConfirmAccountNumber("");
  setAccountType("checking");
  setRecipientAddress("");
  setTransferPurpose("personal");
  setTransferPin("");
  setIdempotencyKey(null);

  try {
    await refresh();
  } catch {
    // The request already succeeded; preserve its receipt.
  }

  toast.success("Wire transfer request submitted.", {
    description: "Your request is awaiting administrator review.",
  });
} catch (error) {
  setTransferPin("");

  toast.error(
    error instanceof Error
      ? error.message
      : "Unable to submit your request. Please try again.",
  );
} finally {
  setProcessing(false);
}


}

return ( <div className="mx-auto max-w-4xl space-y-6 pb-8"> <PageTitle
     title="Wire Transfer"
     subtitle="Submit a US domestic wire transfer request."
   />


  <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
    <DashboardCard>
      {step === "details" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Wire transfer details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the recipient's US bank details and transfer amount.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">
              Available balance
            </p>

            {accountLoading ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Loading balance...
              </p>
            ) : account ? (
              <p className="mt-1 font-display text-2xl font-semibold">
                {usd(availableBalance)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-destructive">
                {accountError || "Unable to load your account."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wire-amount">Transfer amount (USD)</Label>
            <Input
              id="wire-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 rounded-2xl"
              required
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {[50, 100, 250, 500].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
                >
                  ${value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Recipient information</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wire-account-name">
                  Recipient's full name
                </Label>
                <Input
                  id="wire-account-name"
                  autoComplete="name"
                  maxLength={150}
                  placeholder="Enter recipient's legal name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wire-recipient-address">
                  Recipient's address (optional)
                </Label>
                <Input
                  id="wire-recipient-address"
                  autoComplete="street-address"
                  maxLength={255}
                  placeholder="Street, city, state, ZIP code"
                  value={recipientAddress}
                  onChange={(event) =>
                    setRecipientAddress(event.target.value)
                  }
                  className="h-12 rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Recipient bank details</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wire-bank-name">Bank name</Label>
                <Input
                  id="wire-bank-name"
                  autoComplete="organization"
                  maxLength={100}
                  placeholder="Enter recipient's bank"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wire-routing-number">Routing number</Label>
                <Input
                  id="wire-routing-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={9}
                  placeholder="9-digit wire routing number"
                  value={routingNumber}
                  onChange={(event) =>
                    setRoutingNumber(
                      event.target.value.replace(/\D/g, "").slice(0, 9),
                    )
                  }
                  className="h-12 rounded-2xl"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the routing number provided by the recipient's
                  bank for domestic wire transfers.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wire-account-number">Account number</Label>
                <Input
                  id="wire-account-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={20}
                  placeholder="Enter recipient's account number"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(
                      event.target.value.replace(/\D/g, "").slice(0, 20),
                    )
                  }
                  className="h-12 rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wire-confirm-account-number">
                  Confirm account number
                </Label>
                <Input
                  id="wire-confirm-account-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={20}
                  placeholder="Re-enter account number"
                  value={confirmAccountNumber}
                  onChange={(event) =>
                    setConfirmAccountNumber(
                      event.target.value.replace(/\D/g, "").slice(0, 20),
                    )
                  }
                  className="h-12 rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wire-account-type">Account type</Label>
                <select
                  id="wire-account-type"
                  value={accountType}
                  onChange={(event) =>
                    setAccountType(
                      event.target.value as "checking" | "savings",
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wire-purpose">Purpose of transfer</Label>
            <select
              id="wire-purpose"
              value={transferPurpose}
              onChange={(event) => setTransferPurpose(event.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm"
              required
            >
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="hero"
            className="h-12 w-full"
            onClick={continueToReview}
            disabled={
              accountLoading ||
              !account ||
              account.status !== "active" ||
              processing
            }
          >
            Review wire transfer
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              if (processing) return;
              setStep("details");
              setTransferPin("");
              setIdempotencyKey(null);
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to details
          </button>

          <div>
            <h2 className="text-lg font-semibold">
              Review wire transfer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Carefully check all details before submitting your request.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl bg-muted/60 p-5">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{usd(numericAmount)}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Recipient</span>
              <span className="text-right font-semibold">{accountName}</span>
            </div>

            {recipientAddress.trim() && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="max-w-[60%] text-right font-medium">
                  {recipientAddress}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Bank</span>
              <span className="text-right font-semibold">{bankName}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Routing number</span>
              <span className="font-semibold">
                ••••••{routingNumber.slice(-3)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Account number</span>
              <span className="font-semibold">
                ••••{accountNumber.slice(-4)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Account type</span>
              <span className="font-semibold">
                {accountType === "checking" ? "Checking" : "Savings"}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Purpose</span>
              <span className="text-right font-semibold">
                {PURPOSE_OPTIONS.find(
                  (option) => option.value === transferPurpose,
                )?.label ?? "Other"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-border p-4 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Your balance will be debited when the request is submitted
              successfully. The request will remain pending review.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wire-transfer-pin">Transfer PIN</Label>
            <Input
              id="wire-transfer-pin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="Enter your 4-digit PIN"
              value={transferPin}
              onChange={(event) =>
                setTransferPin(
                  event.target.value.replace(/\D/g, "").slice(0, 4),
                )
              }
              className="h-12 rounded-2xl"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your Transfer PIN to authorize this request.
            </p>
          </div>

          <Button
            variant="hero"
            className="h-12 w-full"
            onClick={() => void submitRequest()}
            disabled={processing || transferPin.length !== 4}
          >
            {processing ? "Submitting request..." : "Submit wire request"}
          </Button>
        </div>
      )}
    </DashboardCard>

    <div className="space-y-6">
      <DashboardCard>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </span>

        <h2 className="mt-4 font-semibold">Domestic wire transfer</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use the wire routing number supplied by the recipient's bank.
          ACH routing numbers may differ from domestic wire routing
          numbers. Verify the recipient's details before submitting.
        </p>
      </DashboardCard>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Protect your account</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Never share your password or Transfer PIN. Check all
              destination details before authorizing a request.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AlertDialog open={receiptOpen} onOpenChange={setReceiptOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-amber-500/10 text-amber-600">
          <Clock3 className="h-7 w-7" />
        </div>

        <AlertDialogTitle className="text-center">
          Wire Transfer Request Submitted
        </AlertDialogTitle>

        <AlertDialogDescription className="text-center">
          Your request is awaiting review. The transfer has not been
          completed or sent to the destination bank.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {receipt && (
        <div className="space-y-4 rounded-2xl border p-5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Requested amount
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {usd(receipt.amount)}
            </p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-600">
              <Clock3 className="h-4 w-4" />
              Pending Approval
            </span>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Recipient</span>
              <span className="text-right font-medium">
                {receipt.accountName}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Bank</span>
              <span className="text-right font-medium">
                {receipt.bankName}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Routing number</span>
              <span className="font-medium">
                ••••••{receipt.routingNumber.slice(-3)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium">
                ••••{receipt.accountNumber.slice(-4)}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Account type</span>
              <span className="font-medium">
                {receipt.accountType === "checking"
                  ? "Checking"
                  : "Savings"}
              </span>
            </div>

            {receipt.recipientAddress && (
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="max-w-[60%] text-right font-medium">
                  {receipt.recipientAddress}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Purpose</span>
              <span className="text-right font-medium">
                {PURPOSE_OPTIONS.find(
                  (option) => option.value === receipt.transferPurpose,
                )?.label ?? "Other"}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="max-w-[60%] break-all text-right font-medium">
                {receipt.reference}
              </span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="text-right font-medium">
                {new Date(receipt.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Keep this reference to track the request in your transaction
              history.
            </p>
          </div>
        </div>
      )}

      <AlertDialogFooter>
        <AlertDialogAction onClick={() => setReceiptOpen(false)}>
          Done
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>

);
}
