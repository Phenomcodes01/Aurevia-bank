import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAuth } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Create Account — Aurevia Bank" },
      { name: "description", content: "Create your Aurevia Bank account." },
      { property: "og:title", content: "Create Account — Aurevia Bank" },
      { property: "og:description", content: "Register for an Aurevia Bank account." },
    ],
  }),
  component: Register,
});

const schema = z.object({
  first: z.string().trim().min(1, "First name is required").max(50),
  last: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
  agree: z.literal(true, { errorMap: () => ({ message: "Please accept the terms" }) }),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

function Register() {
  const navigate = useNavigate();
  const [v, setV] = useState({ first: "", last: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const s = strength(v.password);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ ...v, agree });
    if (!r.success) return setErr(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
    demoAuth.set({ name: `${r.data.first} ${r.data.last}`, email: r.data.email });
    navigate({ to: "/dashboard" });
  };
  const f = (k: keyof typeof v, label: string, type = "text") => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} className="mt-2 h-11 rounded-xl" />
      {err[k] && <p className="mt-1 text-xs text-destructive">{err[k]}</p>}
    </div>
  );
  return (
    <AuthShell title="Create your account" subtitle="Start your journey with Aurevia Bank.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">{f("first", "First Name")}{f("last", "Last Name")}</div>
        {f("email", "Email", "email")}
        {f("password", "Password", "password")}
        {v.password && (
          <div>
            <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < s ? (s <= 1 ? "bg-destructive" : s <= 2 ? "bg-chart-4" : "bg-success") : "bg-muted")} />)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{labels[s]}</p>
          </div>
        )}
        {f("confirm", "Confirm Password", "password")}
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={agree} onCheckedChange={(c) => setAgree(c === true)} className="mt-0.5" />
          <span>I agree to the <Link to="/terms" className="text-primary">Terms of Service</Link> and <Link to="/privacy" className="text-primary">Privacy Policy</Link>.</span>
        </label>
        {err["agree"] && <p className="text-xs text-destructive">{err["agree"]}</p>}
        <Button type="submit" variant="hero" size="xl" className="w-full">Create Account</Button>
      </form>
    </AuthShell>
  );
}
