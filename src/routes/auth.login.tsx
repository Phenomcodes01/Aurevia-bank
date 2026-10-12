import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { demoAuth } from "@/lib/demo-data";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sign In — Aurevia Bank" },
      {
        name: "description",
        content: "Sign in to your Aurevia Bank account.",
      },
      { property: "og:title", content: "Sign In — Aurevia Bank" },
      {
        property: "og:description",
        content: "Access your Aurevia Bank accounts and financial overview.",
      },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    status: string;
    role: string;
  };
};

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr("");

    const result = schema.safeParse({ email, password });

    if (!result.success) {
      setErr(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
        }),
      });

      // Save the Laravel authentication token for future API requests.
      localStorage.setItem("aurevia_api_token", data.token);

      // Temporary compatibility with the existing dashboard's login guard.
      // We will replace this demo session when we connect the dashboard.
      demoAuth.set({
        email: data.user.email,
        name: data.user.name,
      });

      toast.success("Welcome back to Aurevia Bank!");

      await navigate({ to: "/dashboard" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.";

      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account."
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-11 rounded-xl"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 h-11 rounded-xl"
            disabled={loading}
          />
        </div>

        {err && (
          <p role="alert" className="text-sm text-destructive">
            {err}
          </p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <Checkbox />
            Remember me
          </label>

          <button
            type="button"
            className="font-semibold text-primary"
            onClick={() => toast("Password reset is not available yet.")}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="hero"
          size="xl"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Don't have an account?
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        asChild
        variant="outline"
        size="xl"
        className="w-full"
      >
        <Link to="/auth/register">Create Account</Link>
      </Button>
    </AuthShell>
  );
}