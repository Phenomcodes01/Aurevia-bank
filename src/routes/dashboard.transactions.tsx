import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RefreshCw, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";
import {
useRealTransactions,
type RealTransaction,
} from "@/lib/use-real-transactions";
import { TransactionReceipt } from "@/components/dashboard/transaction-receipt";
import { usd } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/transactions")({
head: () => ({
meta: [
{ title: "Transactions — Aurevia Bank" },
{
name: "description",
content: "Transactions for your Aurevia Bank account.",
},
{ property: "og:title", content: "Transactions — Aurevia Bank" },
{
property: "og:description",
content: "Transactions for your Aurevia Bank account.",
},
{ property: "og:type", content: "website" },
{ name: "twitter:card", content: "summary" },
],
}),
component: Transactions,
});

function formatDate(value: string) {
const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return value;
}

return new Intl.DateTimeFormat("en-US", {
month: "short",
day: "numeric",
year: "numeric",
}).format(date);
}

function formatAmount(transaction: RealTransaction) {
const amount = Number(transaction.amount);

if (!Number.isFinite(amount)) {
return `${transaction.currency || "USD"} —`;
}

const formatted = usd(amount, true);

return transaction.direction === "credit"
? `+${formatted}`
: `−${formatted}`;
}

function formatDescription(transaction: RealTransaction) {
const transactionType = transaction.type.toLowerCase();

if (transactionType === "external_transfer") {
const existingDescription = transaction.description?.trim();


if (
  existingDescription &&
  existingDescription.toLowerCase().startsWith("wire transfer to ")
) {
  return existingDescription;
}

return "Wire Transfer";


}

if (transaction.description?.trim()) {
return transaction.description;
}

switch (transactionType) {
case "transfer":
return transaction.direction === "credit"
? "Incoming transfer"
: "Outgoing transfer";


case "deposit":
  return "Account deposit";

case "withdrawal":
  return "Withdrawal";

default:
  return "Account transaction";


}
}


function formatTransactionType(type: string) {
switch (type.toLowerCase()) {
case "external_transfer":
return "Wire Transfer";


case "transfer":
  return "Transfer";

case "deposit":
  return "Deposit";

case "withdrawal":
  return "Withdrawal";

case "bill_payment":
  return "Bill Payment";

default:
  return type.replace(/_/g, " ");


}
}



function formatStatus(status: string, type: string) {
const normalizedStatus = status.toLowerCase();
const normalizedType = type.toLowerCase();

if (
normalizedStatus === "pending" &&
normalizedType === "external_transfer"
) {
return "Pending Approval";
}

switch (normalizedStatus) {
case "completed":
return "Completed";

case "pending":
  return "Pending";

case "processing":
  return "Processing";

case "rejected":
  return "Rejected";

case "failed":
  return "Failed";

default:
  return status.replace(/_/g, " ");

}
}



function Transactions() {
const {
transactions,
loading,
error,
refresh,
} = useRealTransactions();

const [query, setQuery] = useState("");
const [type, setType] = useState("all");
const [direction, setDirection] = useState("all");
const [status, setStatus] = useState("all");
const [since, setSince] = useState("");
const [page, setPage] = useState(1);
const [selectedTransaction, setSelectedTransaction] =
useState<RealTransaction | null>(null);

const perPage = 10;

const rows = useMemo(() => {
const normalizedQuery = query.trim().toLowerCase();


return transactions.filter((transaction) => {
  const description = formatDescription(transaction).toLowerCase();

  const matchesQuery =
    !normalizedQuery ||
    description.includes(normalizedQuery) ||
    transaction.reference.toLowerCase().includes(normalizedQuery) ||
    transaction.type.toLowerCase().includes(normalizedQuery) ||
    (transaction.counterparty_account_number ?? "")
      .toLowerCase()
      .includes(normalizedQuery);

  const matchesType =
    type === "all" || transaction.type.toLowerCase() === type;

  const matchesDirection =
    direction === "all" || transaction.direction === direction;

  const matchesStatus =
    status === "all" || transaction.status.toLowerCase() === status;

  const transactionDate = new Date(transaction.created_at);
  const matchesDate =
    !since ||
    (!Number.isNaN(transactionDate.getTime()) &&
      transactionDate >= new Date(`${since}T00:00:00`));

  return (
    matchesQuery &&
    matchesType &&
    matchesDirection &&
    matchesStatus &&
    matchesDate
  );
});


}, [transactions, query, type, direction, status, since]);

const pages = Math.max(1, Math.ceil(rows.length / perPage));
const currentPage = Math.min(page, pages);

const visibleRows = rows.slice(
(currentPage - 1) * perPage,
currentPage * perPage,
);

const currentSelectedTransaction = selectedTransaction
  ? transactions.find(
      (transaction) =>
        transaction.reference === selectedTransaction.reference,
    ) ?? selectedTransaction
  : null;

const updateFilter = <T,>(setter: (value: T) => void) => {
return (value: T) => {
setter(value);
setPage(1);
};
};

return ( <div className="space-y-6"> <PageTitle
     title="Transactions"
     subtitle="Review and search your account activity."
   />


  <DashboardCard>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-semibold">Transaction history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {loading
            ? "Loading your transaction history..."
            : `${rows.length} matching transaction${rows.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        onClick={() => void refresh()}
        disabled={loading}
      >
        <RefreshCw
          className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
        />
        Refresh
      </Button>
    </div>

    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search transactions"
          aria-label="Search transactions"
          value={query}
          onChange={(event) =>
            updateFilter(setQuery)(event.target.value)
          }
          className="rounded-xl pl-9"
        />
      </div>

      <Input
        type="date"
        aria-label="From date"
        value={since}
        onChange={(event) =>
          updateFilter(setSince)(event.target.value)
        }
        className="rounded-xl"
      />

      <Select
        value={type}
        onValueChange={updateFilter(setType)}
      >
        <SelectTrigger className="rounded-xl" aria-label="Transaction type">
          <SelectValue placeholder="All transaction types" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All transaction types</SelectItem>
          <SelectItem value="transfer">Transfers</SelectItem>
          <SelectItem value="deposit">Deposits</SelectItem>
          <SelectItem value="withdrawal">Withdrawals</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={direction}
        onValueChange={updateFilter(setDirection)}
      >
        <SelectTrigger className="rounded-xl" aria-label="Transaction direction">
          <SelectValue placeholder="All directions" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Incoming & outgoing</SelectItem>
          <SelectItem value="credit">Money received</SelectItem>
          <SelectItem value="debit">Money sent</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={updateFilter(setStatus)}
      >
        <SelectTrigger className="rounded-xl" aria-label="Transaction status">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {error && (
      <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{error}</p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 rounded-lg"
          onClick={() => void refresh()}
          disabled={loading}
        >
          Try again
        </Button>
      </div>
    )}

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {!loading &&
          !error &&
          visibleRows.map((transaction) => (
            <TableRow
              key={transaction.reference}
              tabIndex={0}
              role="button"
              aria-label={`View receipt for ${formatDescription(transaction)}`}
              onClick={() => setSelectedTransaction(transaction)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedTransaction(transaction);
                }
              }}
              className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      transaction.direction === "credit"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {transaction.direction === "credit" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {formatDescription(transaction)}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Ref: {transaction.reference}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                  {formatTransactionType(transaction.type)}
                </span>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <span
                className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                transaction.status.toLowerCase() === "completed" &&
                "bg-green-500/10 text-green-600",
                transaction.status.toLowerCase() === "processing" &&
                "bg-blue-500/10 text-blue-600",
                transaction.status.toLowerCase() === "pending" &&
                "bg-amber-500/10 text-amber-600",
                ["failed", "rejected"].includes(
                transaction.status.toLowerCase(),
                ) && "bg-red-500/10 text-red-600",
                ![
                "completed",
                "processing",
                "pending",
                "failed",
                "rejected",
                ].includes(transaction.status.toLowerCase()) &&
                "bg-muted text-muted-foreground",
                )}

                >

                {formatStatus(transaction.status, transaction.type)} </span>

              </TableCell>

              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(transaction.created_at)}
              </TableCell>

              <TableCell
                className={cn(
                  "whitespace-nowrap text-right font-semibold",
                  transaction.direction === "credit" && "text-green-600",
                )}
              >
                {formatAmount(transaction)}
              </TableCell>
            </TableRow>
          ))}

        {loading && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-12 text-center text-muted-foreground"
            >
              Loading your transactions...
            </TableCell>
          </TableRow>
        )}

        {!loading && !error && rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-12 text-center text-muted-foreground"
            >
              {transactions.length === 0
                ? "You don't have any transactions yet."
                : "No transactions match your filters."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>

    <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">
        Page {currentPage} of {pages} · {rows.length} results
      </span>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Previous
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= pages}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  </DashboardCard>

  <TransactionReceipt
    transaction={currentSelectedTransaction}
    onClose={() => setSelectedTransaction(null)}
  />
</div>

);
}
