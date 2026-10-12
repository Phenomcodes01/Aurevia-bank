import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/auth/verify-otp")({
validateSearch: z.object({
email: z.string().catch(""),
}),
component: VerifyOtp,
});

type VerifyResponse = {
message: string;
status: string;
};

type ResendResponse = {
message: string;
};

function VerifyOtp() {
const { email } = Route.useSearch();
const navigate = useNavigate();

const [code, setCode] = useState("");
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);
const [resending, setResending] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);

const verify = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();
setError("");
setMessage("");

if (!email) {
  setError("Your email address is missing. Please register again.");
  return;
}

if (!/^\d{6}$/.test(code)) {
  setError("Enter the six-digit verification code.");
  return;
}

setLoading(true);

try {
  await apiRequest<VerifyResponse>("/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  setShowSuccessModal(true);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Verification failed. Please try again.",
  );
} finally {
  setLoading(false);
}

};

const resendCode = async () => {
setError("");
setMessage("");

if (!email) {
  setError("Your email address is missing. Please register again.");
  return;
}

setResending(true);

try {
  const result = await apiRequest<ResendResponse>("/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  setMessage(result.message);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to request another code. Please try again.",
  );
} finally {
  setResending(false);
}

};

const handleModalOkay = () => {
setShowSuccessModal(false);
navigate({ to: "/auth/login" });
};

return (
<AuthShell
title="Verify your email"
subtitle={`Enter the verification code sent to ${email || "your email address"}.`}
> <form onSubmit={verify} className="space-y-5" noValidate> <div> <Label htmlFor="otp">Six-digit verification code</Label>
<Input
id="otp"
type="text"
inputMode="numeric"
autoComplete="one-time-code"
maxLength={6}
placeholder="000000"
value={code}
onChange={(e) =>
setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
}
className="mt-2 h-12 rounded-xl text-center text-xl tracking-[0.4em]"
disabled={loading}
/> </div>

    {error && (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )}

    {message && (
      <p role="status" className="text-sm text-foreground">
        {message}
      </p>
    )}

    <Button
      type="submit"
      variant="hero"
      size="xl"
      className="w-full"
      disabled={loading || !email}
    >
      {loading ? "Verifying..." : "Verify Email"}
    </Button>

    <Button
      type="button"
      variant="outline"
      size="xl"
      className="w-full"
      onClick={resendCode}
      disabled={resending || loading || !email}
    >
      {resending ? "Requesting code..." : "Resend Code"}
    </Button>

    <p className="text-center text-sm text-muted-foreground">
      Already verified?{" "}
      <Link to="/auth/login" className="font-semibold text-primary">
        Sign in
      </Link>
    </p>
  </form>

  {showSuccessModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="verification-success-title"
        aria-describedby="verification-success-description"
        className="w-full max-w-md rounded-2xl border border-border bg-background p-7 text-center shadow-2xl sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </div>

        <h2
          id="verification-success-title"
          className="text-2xl font-bold tracking-tight"
        >
          Email Verified Successfully!
        </h2>

        <p
          id="verification-success-description"
          className="mt-3 text-sm leading-6 text-muted-foreground"
        >
          Your Aurevia Bank account is now under review by our team. 
          You will be able to sign in once your account has been approved.
        </p>

        <Button
          type="button"
          variant="hero"
          size="xl"
          className="mt-7 w-full"
          onClick={handleModalOkay}
        >
          OK
        </Button>
      </div>
    </div>
  )}
</AuthShell>

);
}
