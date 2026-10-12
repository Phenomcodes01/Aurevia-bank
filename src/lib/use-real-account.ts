import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./api";

export type RealAccount = {
account_number: string;
currency: string;
balance: number;
status: string;
};

type AccountResponse = {
account: RealAccount;
};

export function useRealAccount() {
const [account, setAccount] = useState<RealAccount | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const refresh = useCallback(async () => {
const token = localStorage.getItem("aurevia_api_token");

if (!token) {
  setAccount(null);
  setError("Please sign in to view your account.");
  setLoading(false);
  return;
}

setLoading(true);
setError(null);

try {
  const data = await apiRequest<AccountResponse>("/account", {
    method: "GET",
    token,
  });

  setAccount(data.account);
} catch (err) {
  setAccount(null);
  setError(
    err instanceof Error
      ? err.message
      : "Unable to load your account."
  );
} finally {
  setLoading(false);
}

}, []);

useEffect(() => {
void refresh();
}, [refresh]);

return { account, loading, error, refresh };
}
