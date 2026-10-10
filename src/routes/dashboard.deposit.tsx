import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, CreditCard, Info, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usd } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/deposit")({
head: () => ({
meta: [
{ title: "Deposit Funds — Aurevia Bank" },
{
name: "description",
content: "Review deposit options for your Aurevia Bank account.",
},
],
}),
component: Deposit,
});

type DepositMethod = "bank" | "card";

function Deposit() {
const [amount, setAmount] = useState("");
const [method, setMethod] = useState<DepositMethod>("bank");
const [step, setStep] = useState<"amount" | "review" | "instructions">(
"amount",
);

const numericAmount = Number(amount);
const validAmount =
amount.trim() !== "" &&
Number.isFinite(numericAmount) &&
numericAmount > 0;

function continueToReview() {
if (!validAmount) {
toast.error("Enter a valid deposit amount.");
return;
}

if (numericAmount < 10) {
  toast.error("The minimum deposit is $10.00.");
  return;
}

if (numericAmount > 100000) {
  toast.error("The maximum deposit for this demo is $100,000.00.");
  return;
}

setStep("review");

}

function confirmDeposit() {
setStep("instructions");
}

return ( <div className="mx-auto max-w-4xl space-y-6"> <PageTitle
     title="Deposit Funds"
     subtitle="Add funds to your Aurevia account."
   />

  <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
    <DashboardCard>
      {step === "amount" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Deposit amount</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose how much you want to add to your account.
            </p>
          </div>

          <div>
            <label
              htmlFor="deposit-amount"
              className="mb-2 block text-sm font-medium"
            >
              Amount in USD
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>

              <Input
                id="deposit-amount"
                type="number"
                min="10"
                max="100000"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-14 rounded-2xl pl-9 text-xl font-semibold"
              />
            </div>

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
            <h3 className="mb-3 text-sm font-semibold">
              Select deposit method
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  method === "bank"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    Bank Transfer
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Follow bank transfer instructions.
                  </span>
                </span>

                <span
                  className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                    method === "bank"
                      ? "border-primary bg-primary ring-2 ring-background"
                      : "border-muted-foreground/40"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  method === "card"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    Debit or Credit Card
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Card payment will be available after integration.
                  </span>
                </span>

                <span
                  className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                    method === "card"
                      ? "border-primary bg-primary ring-2 ring-background"
                      : "border-muted-foreground/40"
                  }`}
                />
              </button>
            </div>
          </div>

          <Button
            variant="hero"
            className="h-12 w-full"
            onClick={continueToReview}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setStep("amount")}
            className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h2 className="text-lg font-semibold">Review your deposit</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Check your details before continuing.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/60 p-5">
            <p className="text-sm text-muted-foreground">
              Deposit amount
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {usd(numericAmount)}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">
                {method === "bank" ? "Bank Transfer" : "Debit/Credit Card"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing fee</span>
              <span className="font-medium">To be confirmed</span>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-border p-4 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Your balance will not change until a deposit is verified by
              the payment provider and recorded by the banking system.
            </p>
          </div>

          <Button
            variant="hero"
            className="h-12 w-full"
            onClick={confirmDeposit}
          >
            Continue to instructions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === "instructions" && (
        <div className="py-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            {method === "bank" ? (
              <Building2 className="h-8 w-8" />
            ) : (
              <CreditCard className="h-8 w-8" />
            )}
          </span>

          <h2 className="mt-5 text-xl font-semibold">
            {method === "bank"
              ? "Bank transfer setup"
              : "Card payments coming soon"}
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            {method === "bank"
              ? "Aurevia has not been connected to a deposit provider yet. Receiving account details will appear here once the payment integration is configured."
              : "Card deposits are not connected yet. Once a payment provider is configured, you will be able to continue to a secure checkout."}
          </p>

          <div className="mt-6 rounded-2xl border border-border p-4 text-left">
            <div className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{usd(numericAmount)}</span>
            </div>
            <div className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="font-semibold">
                {method === "bank" ? "Bank Transfer" : "Card"}
              </span>
            </div>
            <div className="flex justify-between gap-4 py-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-amber-600">
                Not initiated
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => {
              setStep("amount");
              setAmount("");
              toast("You can start another deposit when you're ready.");
            }}
          >
            Start another deposit
          </Button>
        </div>
      )}
    </DashboardCard>

    <div className="space-y-6">
      <DashboardCard>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="h-5 w-5" />
        </span>

        <h2 className="mt-4 font-semibold">Depositing with Aurevia</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review the amount and method carefully. Deposit options will
          become available as payment services are connected.
        </p>

        <div className="mt-5 space-y-4">
          {[
            "Choose your deposit amount",
            "Review your deposit details",
            "Follow the payment instructions",
          ].map((item, index) => (
            <div key={item} className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                {index + 1}
              </span>
              <p className="pt-1 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Security reminder</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Only make deposits through payment instructions displayed
              within your account. Never share your password or one-time
              verification codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

);
}
