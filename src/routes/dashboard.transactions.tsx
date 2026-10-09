import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { transactions, usd } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/transactions")({ head: () => ({ meta: [
  { title: "Transactions — Aurevia Bank" },
  { name: "description", content: "Transactions for your Aurevia Bank account." },
  { property: "og:title", content: "Transactions — Aurevia Bank" },
  { property: "og:description", content: "Transactions for your Aurevia Bank account." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
] }), component: Transactions });

const PER = 10;
const cats = ["all", ...Array.from(new Set(transactions.map((t) => t.category)))];

function Transactions() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [kind, setKind] = useState("all");
  const [since, setSince] = useState("");
  const [page, setPage] = useState(1);
  const rows = useMemo(() => transactions.filter((t) =>
    t.name.toLowerCase().includes(q.toLowerCase()) &&
    (cat === "all" || t.category === cat) &&
    (kind === "all" || (kind === "income" ? t.amount > 0 : t.amount < 0)) &&
    (!since || t.date >= since)), [q, cat, kind, since]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const cur = Math.min(page, pages);
  const reset = <T,>(f: (v: T) => void) => (v: T) => { f(v); setPage(1); };
  return (
    <div>
      <PageTitle title="Transactions" subtitle="Search and filter your activity." />
      <DashboardCard>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input placeholder="Search transactions" aria-label="Search transactions" value={q} onChange={(e) => reset(setQ)(e.target.value)} className="rounded-xl" />
          <Input type="date" aria-label="From date" value={since} onChange={(e) => reset(setSince)(e.target.value)} className="rounded-xl" />
          <Select value={cat} onValueChange={reset(setCat)}><SelectTrigger className="rounded-xl" aria-label="Category"><SelectValue /></SelectTrigger><SelectContent>{cats.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>)}</SelectContent></Select>
          <Select value={kind} onValueChange={reset(setKind)}><SelectTrigger className="rounded-xl" aria-label="Type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Income & expenses</SelectItem><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expenses</SelectItem></SelectContent></Select>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="hidden sm:table-cell">Category</TableHead><TableHead className="hidden md:table-cell">Account</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.slice((cur - 1) * PER, cur * PER).map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="hidden sm:table-cell"><span className="rounded-full bg-muted px-2.5 py-1 text-xs">{t.category}</span></TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{t.account}</TableCell>
                <TableCell className="text-muted-foreground">{t.date}</TableCell>
                <TableCell className={cn("text-right font-semibold", t.amount > 0 && "text-success")}>{usd(t.amount, true)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No transactions match your filters.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {cur} of {pages} · {rows.length} results</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>Next</Button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
