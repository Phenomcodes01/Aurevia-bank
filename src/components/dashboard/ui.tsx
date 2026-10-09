import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { usd, type Txn } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function DashboardCard({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-6", className)}>
      {(title || action) && <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="mb-6"><h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>;
}

export function TransactionRow({ t }: { t: Pick<Txn, "name" | "amount" | "date" | "category"> }) {
  const inc = t.amount > 0;
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", inc ? "bg-success/10 text-success" : "bg-muted")}>
        {inc ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.category} · {t.date}</p></div>
      <span className={cn("text-sm font-semibold", inc && "text-success")}>{usd(t.amount, true)}</span>
    </li>
  );
}
