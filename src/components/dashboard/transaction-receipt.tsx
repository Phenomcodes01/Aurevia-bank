import { X, Printer, Copy, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useState } from "react";
import type { RealTransaction } from "@/lib/use-real-transactions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type TransactionReceiptProps = {
transaction: RealTransaction | null;
onClose: () => void;
};

function formatAmount(amount: number | string, currency: string) {
return new Intl.NumberFormat("en-US", {
style: "currency",
currency: currency || "USD",
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}).format(Number(amount));
}

function formatDate(date: string) {
const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
return date;
}

return new Intl.DateTimeFormat("en-US", {
year: "numeric",
month: "long",
day: "numeric",
hour: "2-digit",
minute: "2-digit",
}).format(parsedDate);
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

function formatTransactionDescription(transaction: RealTransaction) {
const type = transaction.type.toLowerCase();
const description = transaction.description?.trim();

if (type === "external_transfer") {
if (
description &&
description.toLowerCase().startsWith("wire transfer to ")
) {
return description;
}


return "Wire Transfer";


}

if (description) {
return description;
}

switch (type) {
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

function getStatusDetails(status: string, type: string) {
const normalizedStatus = status.toLowerCase();
const isWireTransfer = type.toLowerCase() === "external_transfer";

if (normalizedStatus === "pending") {
return {
label: isWireTransfer ? "Pending Approval" : "Pending",
icon: Clock3,
className: "text-amber-600 bg-amber-500/10",
};
}

switch (normalizedStatus) {
case "processing":
return {
label: "Processing",
icon: Clock3,
className: "text-blue-600 bg-blue-500/10",
};


case "rejected":
  return {
    label: "Rejected",
    icon: XCircle,
    className: "text-red-600 bg-red-500/10",
  };

case "failed":
  return {
    label: "Failed",
    icon: XCircle,
    className: "text-red-600 bg-red-500/10",
  };

case "completed":
  return {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-green-600 bg-green-500/10",
  };

default:
  return {
    label: status || "Unknown",
    icon: Clock3,
    className: "text-muted-foreground bg-muted",
  };


}
}


export function TransactionReceipt({
transaction,
onClose,
}: TransactionReceiptProps) {
const [copied, setCopied] = useState(false);

if (!transaction) {
return null;
}

const status = getStatusDetails(
transaction.status,
transaction.type,
);

const StatusIcon = status.icon;

const amount = formatAmount(
transaction.amount,
transaction.currency || "USD",
);

const isCredit = transaction.direction === "credit";
const transactionType = formatTransactionType(transaction.type);
const description = formatTransactionDescription(transaction);

const handleCopyReference = async () => {
try {
await navigator.clipboard.writeText(transaction.reference);
setCopied(true);
toast.success("Transaction reference copied.");


  window.setTimeout(() => setCopied(false), 2000);
} catch {
  toast.error("Unable to copy the transaction reference.");
}


};

const handlePrint = () => {
const printWindow = window.open("", "_blank", "width=700,height=800");


if (!printWindow) {
  toast.error("Allow pop-ups to print your receipt.");
  return;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const receiptHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Transaction Receipt - Aurevia Bank</title>
      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 36px 20px;
          font-family: Arial, Helvetica, sans-serif;
          color: #172033;
          background: #fff;
        }

        .receipt {
          max-width: 560px;
          margin: 0 auto;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
        }

        .brand {
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .logo {
          display: block;
          width: 180px;
          max-width: 100%;
          max-height: 80px;
          margin: 0 auto;
          object-fit: contain;
        }

        .brand p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .amount {
          text-align: center;
          padding: 28px 0;
        }

        .amount p {
          margin: 0 0 10px;
          color: #64748b;
          font-size: 13px;
        }

        .amount h2 {
          margin: 0;
          font-size: 32px;
        }

        .status {
          display: inline-block;
          margin-top: 14px;
          padding: 7px 12px;
          border-radius: 20px;
          background: #f1f5f9;
          font-size: 12px;
          font-weight: bold;
        }

        .details {
          border-top: 1px solid #e5e7eb;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }

        .label {
          color: #64748b;
        }

        .value {
          text-align: right;
          overflow-wrap: anywhere;
          font-weight: 600;
        }

        .footer {
          margin-top: 24px;
          text-align: center;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        @media print {
          body {
            padding: 0;
          }

          .receipt {
            border: none;
            padding: 16px;
          }
        }
      </style>
    </head>

    <body>
      <main class="receipt">
        <header class="brand">
          <img
            class="logo"
            src="/favicon.ico"
            alt="Aurevia Bank"
          />
          <p>Transaction Receipt</p>
        </header>

        <section class="amount">
          <p>${isCredit ? "Amount Received" : "Amount Sent"}</p>
          <h2>${escapeHtml(`${isCredit ? "+" : "−"}${amount}`)}</h2>
          <span class="status">
            ${escapeHtml(status.label)}
          </span>
        </section>

        <section class="details">
          <div class="row">
            <span class="label">Reference</span>
            <span class="value">${escapeHtml(transaction.reference)}</span>
          </div>

          <div class="row">
            <span class="label">Transaction type</span>
            <span class="value">${escapeHtml(transactionType)}</span>
          </div>

          <div class="row">
            <span class="label">Description</span>
            <span class="value">${escapeHtml(description)}</span>
          </div>

          <div class="row">
            <span class="label">Account number</span>
            <span class="value">${escapeHtml(transaction.counterparty_account_number || "Not available")}</span>
          </div>

          <div class="row">
            <span class="label">Date and time</span>
            <span class="value">${escapeHtml(formatDate(transaction.created_at))}</span>
          </div>

          <div class="row">
            <span class="label">Status</span>
            <span class="value">${escapeHtml(status.label)}</span>
          </div>
        </section>

        <footer class="footer">
          <p>Keep this receipt for your records.</p>
          <p>Aurevia Bank · Transaction reference: ${escapeHtml(transaction.reference)}</p>
          ${
            transaction.type.toLowerCase() === "external_transfer" &&
            transaction.status.toLowerCase() === "pending"
              ? "<p>This wire transfer request is awaiting approval. This receipt does not confirm that funds have been sent.</p>"
              : ""
          }
        </footer>
      </main>

      <script>
        window.onload = function () {
          window.print();
        };
      </script>
    </body>
  </html>
`;

printWindow.document.open();
printWindow.document.write(receiptHtml);
printWindow.document.close();


};

return ( <div
   className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
   onClick={onClose}
 >
<div
role="dialog"
aria-modal="true"
aria-labelledby="transaction-receipt-title"
className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl"
onClick={(event) => event.stopPropagation()}
> <div className="flex items-center justify-between border-b border-border p-5 sm:p-6"> <div> <h2
           id="transaction-receipt-title"
           className="text-xl font-semibold"
         >
Transaction Receipt </h2>


        <p className="mt-1 text-sm text-muted-foreground">
          Review your transaction details.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close receipt"
        className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    <div className="p-5 sm:p-7">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isCredit ? "Amount Received" : "Amount Sent"}
        </p>

        <p
          className={`mt-2 font-display text-3xl font-bold ${
            isCredit ? "text-green-600" : ""
          }`}
        >
          {isCredit ? "+" : "−"}
          {amount}
        </p>

        <div
          className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${status.className}`}
        >
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </div>
      </div>

      <div className="my-6 border-t border-dashed border-border" />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Reference
          </span>

          <div className="flex min-w-0 items-center gap-2">
            <span className="break-all text-right text-sm font-medium">
              {transaction.reference}
            </span>

            <button
              type="button"
              onClick={handleCopyReference}
              aria-label="Copy transaction reference"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <ReceiptRow
          label="Transaction type"
          value={transactionType}
        />

        <ReceiptRow
          label="Description"
          value={description}
        />

        <ReceiptRow
          label="Account number"
          value={
            transaction.counterparty_account_number || "Not available"
          }
        />

        <ReceiptRow
          label="Date and time"
          value={formatDate(transaction.created_at)}
        />

        <ReceiptRow
          label="Currency"
          value={transaction.currency || "USD"}
        />

        <ReceiptRow
          label="Status"
          value={status.label}
        />
      </div>

      {transaction.type.toLowerCase() === "external_transfer" &&
        transaction.status.toLowerCase() === "pending" && (
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Your wire transfer request is awaiting approval. This
              receipt confirms the request, not that funds have been sent.
            </p>
          </div>
        )}

      <div className="mt-6 rounded-xl bg-muted/50 p-4">
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Keep this receipt for your records. Transaction details and
          status are based on the information returned by your account.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onClose}
        >
          Close
        </Button>

        <Button
          type="button"
          variant="hero"
          className="rounded-xl"
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
    </div>
  </div>
</div>


);
}

function ReceiptRow({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div className="flex items-start justify-between gap-4"> <span className="shrink-0 text-sm text-muted-foreground">
{label} </span>


  <span className="break-all text-right text-sm font-medium">
    {value}
  </span>
</div>


);
}
