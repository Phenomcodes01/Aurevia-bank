import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
ArrowLeft,
ArrowRight,
Building2,
CheckCircle2,
Info,
Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usd } from "@/lib/demo-data";
import { demoAuth } from "@/lib/demo-data";
import { useMyAccounts } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard/withdraw")({
head: () => ({
meta: [
{ title: "Withdraw Funds — Aurevia Bank" },
{
name: "description",
content: "Review withdrawal options for your Aurevia Bank account.",
},
],
}),
component: Withdraw,
});

function Withdraw() {
const email = demoAuth.get()?.email;
const accounts = useMyAccounts(email);
const availableBalance = accounts[0]?.balance ?? 0;

const [amount, setAmount] = useState("");
const [bankName, setBankName] = useState("");
const [accountName, setAccountName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [step, setStep] = useState<"details" | "review" | "submitted">(
"details",
);

const numericAmount = Number(amount);

function continueToReview() {
if (
amount.trim() === "" ||
!Number.isFinite(numericAmount) ||
numericAmount <= 0
) {
toast.error("Enter a valid withdrawal amount.");
return;
}

if (numericAmount < 10) {
  toast.error("The minimum withdrawal is $10.00.");
  return;
}

if (numericAmount > availableBalance) {
  toast.error("The withdrawal amount exceeds your available balance.");
  return;
}

if (!bankName.trim() || !accountName.trim() || !/^\d{6,20}$/.test(accountNumber)) {
  toast.error("Enter valid destination account details.");
  return;
}

setStep("review");


}

function submitRequest() {
setStep("submitted");
toast.success("Withdrawal request prepared.");
}

return ( <div className="mx-auto max-w-4xl space-y-6"> <PageTitle
     title="Withdraw Funds"
     subtitle="Review your withdrawal details before proceeding."
   />

  <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
    <DashboardCard>
      {step === "details" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Withdrawal details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the amount and destination account.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">
              Available balance
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {usd(availableBalance)}
            </p>
          </div>

          <div>
            <label
              htmlFor="withdraw-amount"
              className="mb-2 block text-sm font-medium"
            >
              Withdrawal amount (USD)
            </label>

            <Input
              id="withdraw-amount"
              type="number"
              min="10"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 rounded-2xl"
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
            <h3 className="mb-3 font-semibold">Destination account</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bank-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Bank name
                </label>
                <Input
                  id="bank-name"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div>
                <label
                  htmlFor="account-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Account holder name
                </label>
                <Input
                  id="account-name"
                  placeholder="Enter account holder name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div>
                <label
                  htmlFor="account-number"
                  className="mb-2 block text-sm font-medium"
                >
                  Account number
                </label>
                <Input
                  id="account-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value.replace(/\D/g, ""))
                  }
                  className="h-12 rounded-2xl"
                />
              </div>
            </div>
          </div>

          <Button
            variant="hero"
            className="h-12 w-full"
            onClick={continueToReview}
          >
            Review withdrawal
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setStep("details")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to details
          </button>

          <div>
            <h2 className="text-lg font-semibold">Review withdrawal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm the details below.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl bg-muted/60 p-5">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{usd(numericAmount)}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Bank</span>
              <span className="text-right font-semibold">{bankName}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Account holder</span>
              <span className="text-right font-semibold">{accountName}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Account number</span>
              <span className="font-semibold">
                •••• {accountNumber.slice(-4)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-border p-4 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              This is a frontend demonstration. No money will be sent and
              your balance will not be changed.
            </p>
          </div>

          <Button
            variant="hero"
            className="h-12 w-full"
            onClick={submitRequest}
          >
            Submit withdrawal request
          </Button>
        </div>
      )}

      {step === "submitted" && (
        <div className="py-8 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </span>

          <h2 className="mt-5 text-xl font-semibold">
            Withdrawal request submitted
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Your withdrawal request has been submitted and is awaiting
            approval. You can check its status in your transaction history.
            Your available balance will not be reduced until the request
            is approved and processed.
          </p>

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => {
              setStep("details");
              setAmount("");
              setBankName("");
              setAccountName("");
              setAccountNumber("");
            }}
          >
            Start another withdrawal
          </Button>
        </div>
      )}
    </DashboardCard>

    <div className="space-y-6">
      <DashboardCard>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </span>

        <h2 className="mt-4 font-semibold">Withdrawal overview</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Check your destination details carefully before reviewing your
          request. Processing times and fees will depend on the payment
          service configured for Aurevia.
        </p>
      </DashboardCard>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Protect your account</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Never share your password or one-time verification codes.
              Only use withdrawal methods that Aurevia officially supports.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


);
}
