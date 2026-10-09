import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { demoAuth, usd } from "@/lib/demo-data";
import { useMyAccounts } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard/transfers")({ head: () => ({ meta: [
  { title: "Transfers — Aurevia Bank" },
  { name: "description", content: "Transfers for your Aurevia Bank account." },
  { property: "og:title", content: "Transfers — Aurevia Bank" },
  { property: "og:description", content: "Transfers for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Transfers });

function Transfers() {
  const accounts = useMyAccounts(demoAuth.get()?.email);
  const [from, setFrom] = useState("chk");
  const [to, setTo] = useState("sav");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [confirm, setConfirm] = useState(false);
  const name = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) { toast.error("Enter a valid amount"); return; }
    if (from === to) { toast.error("Choose two different accounts"); return; }
    setConfirm(true);
  };
  return (
    <div className="max-w-2xl">
      <PageTitle title="Transfers" subtitle="Move money between your accounts." />
      <DashboardCard>
        <form onSubmit={submit} className="space-y-5">
          {([["From Account", from, setFrom], ["To Account", to, setTo]] as const).map(([l, v, set]) => (
            <div key={l}>
              <Label>{l}</Label>
              <Select value={v} onValueChange={set}>
                <SelectTrigger className="mt-2 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} {a.number} — {usd(a.balance)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
          <div><Label htmlFor="amt">Amount</Label><Input id="amt" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 h-11 rounded-xl" /></div>
          <div><Label htmlFor="desc">Description</Label><Input id="desc" maxLength={100} placeholder="Optional" value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-2 h-11 rounded-xl" /></div>
          <Button type="submit" variant="hero" size="xl" className="w-full">Review Transfer</Button>
        </form>
      </DashboardCard>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm transfer</AlertDialogTitle>
            <AlertDialogDescription>Send {usd(Number(amount) || 0)} from {name(from)} to {name(to)}{desc && ` — "${desc}"`}.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.success("Transfer completed"); setAmount(""); setDesc(""); }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
