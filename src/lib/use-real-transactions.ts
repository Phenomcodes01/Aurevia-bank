import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";

export type RealTransaction = {
  reference: string;
  type: "transfer" | "deposit" | "withdrawal" | string;
  direction: "debit" | "credit";
  amount: number | string;
  currency: string;
  status: "pending" | "completed" | "failed" | "rejected" | string;
  description: string | null;
  counterparty_account_number: string | null;
  created_at: string;
};

type TransactionPagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type TransactionsResponse = {
  transactions: RealTransaction[];
  pagination: TransactionPagination;
};

type UseRealTransactionsResult = {
  transactions: RealTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useRealTransactions(): UseRealTransactionsResult {
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("aurevia_api_token");

    if (!token) {
      setTransactions([]);
      setError("Please sign in to view your transactions.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the first page to determine how many pages exist.
      const firstPage = await apiRequest<TransactionsResponse>(
        "/transactions?per_page=50&page=1",
        {
          method: "GET",
          token,
        },
      );

      let allTransactions = [...firstPage.transactions];

      // Fetch additional pages so client-side search and filters
      // can work across the customer's complete transaction history.
      for (
        let page = 2;
        page <= firstPage.pagination.last_page;
        page++
      ) {
        const response = await apiRequest<TransactionsResponse>(
          `/transactions?per_page=50&page=${page}`,
          {
            method: "GET",
            token,
          },
        );

        allTransactions = allTransactions.concat(response.transactions);
      }

      setTransactions(allTransactions);
    } catch (err) {
      setTransactions([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your transactions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => {
    void refresh();

    // Refresh transaction statuses every 10 seconds.
    const interval = window.setInterval(() => {
        if (document.visibilityState === "visible") {
        void refresh();
        }
    }, 10000);

    // Refresh when the customer returns to the browser tab.
    const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
        void refresh();
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        window.clearInterval(interval);
        document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
        );
    };
    }, [refresh]);

  return {
    transactions,
    loading,
    error,
    refresh,
  };
}