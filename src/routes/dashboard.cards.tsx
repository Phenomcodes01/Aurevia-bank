import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Snowflake, LockKeyhole, LoaderCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { BankingCard } from "@/components/site/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAuth } from "@/lib/demo-data";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/dashboard/cards")({
  head: () => ({
    meta: [
      { title: "Cards — Aurevia Bank" },
      {
        name: "description",
        content: "Manage your Aurevia Bank cards and card preferences.",
      },
      { property: "og:title", content: "Cards — Aurevia Bank" },
      {
        property: "og:description",
        content: "Manage your Aurevia Bank cards and card preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cards,
});

type CardStatus = "active" | "frozen";

type CardDetails = {
  card_number: string;
  last_four: string;
  expiry: string;
  cvv: string;
  status: CardStatus;
};

type CardResponse = {
  card: {
    last_four: string;
    status: CardStatus;
    expiry_masked: string;
    cvv_masked: string;
  };
};

type RevealResponse = {
  card: CardDetails;
};

type ActionResponse = {
  message: string;
  status: CardStatus;
};

type PinAction = "reveal" | "freeze" | "unfreeze";

function Cards() {
  const name = demoAuth.get()?.name ?? "Account Holder";

  const [card, setCard] = useState<CardDetails | null>(null);
  const [status, setStatus] = useState<CardStatus>("active");
  const [showDetails, setShowDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState("");

  const [pinAction, setPinAction] = useState<PinAction | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCard() {
      const token = localStorage.getItem("aurevia_api_token");

      if (!token) {
        if (!cancelled) {
          setPageError(
            "Please sign in to your Aurevia account to access your virtual card.",
          );
          setLoading(false);
        }
        return;
      }

      try {
        const response = await apiRequest<CardResponse>("/virtual-card", {
          method: "GET",
          token,
        });

        if (!cancelled) {
          setStatus(response.card.status);
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to load your virtual card.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCard();

    return () => {
      cancelled = true;
    };
  }, []);

  function requestPin(action: PinAction) {
    setPin("");
    setPinAction(action);
  }

  function closePinPrompt() {
    if (busy) return;
    setPinAction(null);
    setPin("");
  }

  async function submitPin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!pinAction || busy) return;

    if (!/^\d{4}$/.test(pin)) {
      toast.error("Enter your 4-digit Transfer PIN.");
      return;
    }

    const token = localStorage.getItem("aurevia_api_token");

    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setBusy(true);

    try {
      if (pinAction === "reveal") {
        const response = await apiRequest<RevealResponse>(
          "/virtual-card/reveal",
          {
            method: "POST",
            token,
            body: JSON.stringify({ pin }),
          },
        );

        setCard(response.card);
        setStatus(response.card.status);
        setShowDetails(true);

        toast.success("Card details revealed.");
      } else {
        const endpoint =
          pinAction === "freeze"
            ? "/virtual-card/freeze"
            : "/virtual-card/unfreeze";

        const response = await apiRequest<ActionResponse>(endpoint, {
          method: "POST",
          token,
          body: JSON.stringify({ pin }),
        });

        setStatus(response.status);

        // Hide sensitive details whenever card status changes.
        setShowDetails(false);
        setCard(null);

        toast.success(response.message);
      }

      setPinAction(null);
      setPin("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }

  const frozen = status === "frozen";

  return (
    <div className="space-y-6">
      <PageTitle
        title="Cards"
        subtitle="Manage your virtual card and explore upcoming card options."
      />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        {/* Virtual Card */}
        <DashboardCard>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Virtual Debit Card
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your digital card and card controls.
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                frozen
                  ? "bg-red-500/10 text-red-600"
                  : "bg-emerald-500/10 text-emerald-600"
              }`}
            >
              {frozen ? "Frozen" : "Active"}
            </span>
          </div>

          {loading ? (
            <div className="flex aspect-[1.586] w-full items-center justify-center rounded-3xl border border-border bg-muted/30">
              <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading your card...
              </span>
            </div>
          ) : pageError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {pageError}
            </div>
          ) : (
            <>
              {/* Card face */}
              <div
                className={`transition ${
                  frozen ? "opacity-60 grayscale" : ""
                }`}
              >
                <BankingCard
                  tone="primary"
                  label="Virtual Debit"
                  last4={card?.last_four ?? "••••"}
                  name={name}
                  cardNumber={card?.card_number}
                  expiry={card?.expiry}
                  cvv={card?.cvv}
                  showFullNumber={showDetails}
                  showExpiry={showDetails}
                  showCvv={showDetails}
                />
              </div>

              {/* Reveal all card details */}
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full rounded-xl"
                disabled={busy}
                onClick={() => {
                  if (showDetails) {
                    setShowDetails(false);
                    setCard(null);
                  } else {
                    requestPin("reveal");
                  }
                }}
              >
                {showDetails ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide Card Details
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Reveal Card Details
                  </>
                )}
              </Button>

              {/* Freeze / Unfreeze */}
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Snowflake className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold">
                      {frozen ? "Unfreeze Card" : "Freeze Card"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {frozen
                        ? "Your card is currently marked as frozen."
                        : "Temporarily freeze your virtual card."}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant={frozen ? "hero" : "outline"}
                  className="shrink-0 rounded-full"
                  disabled={busy}
                  onClick={() =>
                    requestPin(frozen ? "unfreeze" : "freeze")
                  }
                >
                  {frozen ? "Unfreeze" : "Freeze"}
                </Button>
              </div>
            </>
          )}

          {/* Transfer PIN prompt */}
          {pinAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="card-pin-title"
                className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                </div>

                <h3
                  id="card-pin-title"
                  className="text-lg font-semibold"
                >
                  Confirm with Transfer PIN
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your 4-digit Transfer PIN to{" "}
                  {pinAction === "reveal"
                    ? "reveal all your card details"
                    : pinAction === "freeze"
                      ? "freeze your card"
                      : "unfreeze your card"}
                  .
                </p>

                <form onSubmit={submitPin} className="mt-5 space-y-4">
                  <div>
                    <Label htmlFor="card-transfer-pin">
                      Transfer PIN
                    </Label>

                    <Input
                      id="card-transfer-pin"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      placeholder="••••"
                      value={pin}
                      onChange={(event) =>
                        setPin(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        )
                      }
                      className="mt-2 h-12 rounded-xl text-center text-lg tracking-[0.5em]"
                      disabled={busy}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={closePinPrompt}
                      disabled={busy}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="flex-1 rounded-xl"
                      disabled={busy || pin.length !== 4}
                    >
                      {busy ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </DashboardCard>

        {/* Physical Card */}
        <DashboardCard>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Physical Debit Card
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A physical card for your everyday spending.
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold tracking-wide text-amber-600">
              COMING SOON
            </span>
          </div>

          <div className="relative">
            <div className="pointer-events-none select-none opacity-60">
              <BankingCard
                tone="navy"
                label="Physical Debit"
                last4="4582"
                name={name}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="font-semibold">
                Your physical card is coming soon
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Physical card ordering and delivery will become available
                when the service launches. You don't need to take any
                action right now.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
              <LockKeyhole className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Ordering, activation, and delivery tracking are not yet
                available.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled
              className="w-full rounded-xl"
            >
              Physical Card — Coming Soon
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
