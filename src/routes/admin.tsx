import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, Minus, Plus, RotateCcw, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/site/primitives";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/lib/theme";
import { usd } from "@/lib/demo-data";
import { adminAuth, store, useCustomers, type AccountId, type Customer } from "@/lib/bank-store";
import { SupportInbox } from "@/components/support/SupportInbox";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Aurevia Bank" },
      { name: "description", content: "Manage Aurevia Bank customers and account balances." },
      { property: "og:title", content: "Admin Console — Aurevia Bank" },
      { property: "og:description", content: "Manage customers and adjust balances." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const acctNames: Record<AccountId, string> = { chk: "Checking", sav: "Savings", inv: "Investment" };
const total = (c: Customer) => c.balances.chk + c.balances.sav + c.balances.inv;

function AdminPage() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(adminAuth.get()), []);
  if (ok === null) return null;
  return ok ? <Console onOut={() => { adminAuth.clear(); setOk(false); }} /> : <Login onIn={() => { adminAuth.set(); setOk(true); }} />;
}

function Login({ onIn }: { onIn: () => void }) {
  const [u, setU] = useState("admin");
  const [p, setP] = useState("admin1234");
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <form className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-lg"
        onSubmit={(e) => { e.preventDefault(); if (u === "admin" && p === "admin1234") onIn(); else toast.error("Invalid admin credentials"); }}>
        <Logo />
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold"><ShieldCheck className="h-6 w-6 text-primary" /> Admin sign in</h1>
        <div className="space-y-1.5"><Label htmlFor="u">Username</Label><Input id="u" value={u} onChange={(e) => setU(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Password</Label><Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} /></div>
        <Button type="submit" className="w-full">Sign in</Button>
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:underline">Back to site</Link>
      </form>
    </div>
  );
}

function Console({ onOut }: { onOut: () => void }) {
  const customers = useCustomers();
  const [sel, setSel] = useState<string>("");
  const [q, setQ] = useState("");
  const current = customers.find((c) => c.email === sel) ?? customers[0];
  const shown = customers.filter((c) => (c.name + c.email).toLowerCase().includes(q.toLowerCase()));
  const deposits = customers.reduce((s, c) => s + total(c), 0);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
        <Logo />
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Admin</span>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={onOut}><LogOut className="mr-1 h-4 w-4" /> Sign out</Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 md:p-8">
        <PageTitle title="Admin Console" subtitle="Manage customers and adjust their balances. Changes show up instantly in the customer's dashboard." />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[["Customers", String(customers.length)], ["Total deposits", usd(deposits)], ["Adjustments made", String(customers.reduce((s, c) => s + c.history.length, 0))]].map(([l, v]) => (
            <DashboardCard key={l}><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-2xl font-semibold">{v}</p></DashboardCard>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <DashboardCard title="Customers" action={<Button variant="ghost" size="sm" onClick={() => { store.reset(); toast.success("Account data reset"); }}><RotateCcw className="mr-1 h-4 w-4" />Reset</Button>}>
            <Input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
            <ul className="divide-y divide-border">
              {shown.map((c) => (
                <li key={c.email}>
                  <button onClick={() => setSel(c.email)} className={`flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted ${current?.email === c.email ? "bg-muted" : ""}`}>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">{c.name[0]}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.name}</span><span className="block truncate text-xs text-muted-foreground">{c.email}</span></span>
                    <span className="font-semibold">{usd(total(c))}</span>
                  </button>
                </li>
              ))}
              {!shown.length && <li className="py-6 text-center text-sm text-muted-foreground"><Users className="mx-auto mb-2 h-5 w-5" />No customers found</li>}
            </ul>
          </DashboardCard>
          {current && <Editor c={current} />}
        </div>
        <SupportInbox />
      </main>
    </div>
  );
}

function Editor({ c }: { c: Customer }) {
  const [account, setAccount] = useState<AccountId>("chk");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const apply = (sign: 1 | -1) => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) { toast.error("Enter an amount between 0 and 10,000,000"); return; }
    store.adjust(c.email, account, sign * n, note.trim().slice(0, 100) || (sign > 0 ? "Admin credit" : "Admin debit"));
    toast.success(`${sign > 0 ? "Added" : "Removed"} ${usd(n)} ${sign > 0 ? "to" : "from"} ${c.name}'s ${acctNames[account]}`);
    setAmount(""); setNote("");
  };
  return (
    <DashboardCard title={c.name}>
      <p className="-mt-2 mb-4 text-sm text-muted-foreground">{c.email}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(acctNames) as AccountId[]).map((k) => (
          <div key={k} className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">{acctNames[k]}</p><p className="mt-1 font-semibold">{usd(c.balances[k])}</p></div>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Account</Label>
          <Select value={account} onValueChange={(v) => setAccount(v as AccountId)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(acctNames) as AccountId[]).map((k) => <SelectItem key={k} value={k}>{acctNames[k]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label htmlFor="amt">Amount (USD)</Label><Input id="amt" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="note">Note (optional)</Label><Input id="note" maxLength={100} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for adjustment" /></div>
      </div>
      <div className="mt-4 flex gap-3">
        <Button className="flex-1" onClick={() => apply(1)}><Plus className="mr-1 h-4 w-4" />Add money</Button>
        <Button variant="destructive" className="flex-1" onClick={() => apply(-1)}><Minus className="mr-1 h-4 w-4" />Remove money</Button>
      </div>
      <h3 className="mt-8 text-sm font-semibold">Adjustment history</h3>
      <ul className="mt-2 divide-y divide-border text-sm">
        {c.history.slice(0, 10).map((h) => (
          <li key={h.id} className="flex justify-between py-2">
            <span>{h.note} <span className="text-muted-foreground">· {acctNames[h.account]} · {new Date(h.date).toLocaleString()}</span></span>
            <span className={h.amount > 0 ? "font-semibold text-primary" : "font-semibold text-destructive"}>{usd(h.amount, true)}</span>
          </li>
        ))}
        {!c.history.length && <li className="py-3 text-muted-foreground">No adjustments yet.</li>}
      </ul>
    </DashboardCard>
  );
}
