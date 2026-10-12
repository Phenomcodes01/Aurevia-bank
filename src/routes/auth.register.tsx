import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Create Account — Aurevia Bank" },
      { name: "description", content: "Create your Aurevia Bank account." },
      { property: "og:title", content: "Create Account — Aurevia Bank" },
      {
        property: "og:description",
        content: "Register for an Aurevia Bank account.",
      },
    ],
  }),
  component: Register,
});

const schema = z
  .object({
    first: z.string().trim().min(1, "First name is required").max(50),
    last: z.string().trim().min(1, "Last name is required").max(50),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z
      .string()
      .min(10, "Password must be at least 10 characters"),
    confirm: z.string(),
    agree: z.literal(true, {
      errorMap: () => ({ message: "Please accept the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type RegisterResponse = {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    status: string;
  };
};

function strength(password: string) {
  let score = 0;

  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

function Register() {
  const navigate = useNavigate();

  const [v, setV] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = strength(v.password);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr({});
    setServerError("");

    const result = schema.safeParse({ ...v, agree });

    if (!result.success) {
      setErr(
        Object.fromEntries(
          result.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      return;
    }

    const email = result.data.email.toLowerCase();
    const name = `${result.data.first} ${result.data.last}`;

    setLoading(true);

    try {
      await apiRequest<RegisterResponse>("/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password: result.data.password,
          password_confirmation: result.data.confirm,
        }),
      });

      await navigate({
        to: "/auth/verify-otp",
        search: { email },
      });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const field = (
    key: keyof typeof v,
    label: string,
    type = "text",
  ) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        autoComplete={
          key === "email"
            ? "email"
            : key === "password"
              ? "new-password"
              : key === "confirm"
                ? "new-password"
                : "given-name"
        }
        value={v[key]}
        onChange={(e) => setV({ ...v, [key]: e.target.value })}
        aria-invalid={!!err[key]}
        className="mt-2 h-11 rounded-xl"
        disabled={loading}
      />
      {err[key] && (
        <p className="mt-1 text-xs text-destructive">{err[key]}</p>
      )}
    </div>
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your journey with Aurevia Bank."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("first", "First Name")}
          {field("last", "Last Name")}
        </div>

        {field("email", "Email", "email")}
        {field("password", "Password", "password")}

        {v.password && (
          <div>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    i < score
                      ? score <= 1
                        ? "bg-destructive"
                        : score <= 2
                          ? "bg-chart-4"
                          : "bg-success"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {labels[score]}
            </p>
          </div>
        )}

        {field("confirm", "Confirm Password", "password")}

        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={agree}
            onCheckedChange={(checked) => setAgree(checked === true)}
            className="mt-0.5"
            disabled={loading}
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" className="text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {err.agree && (
          <p className="text-xs text-destructive">{err.agree}</p>
        )}

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}