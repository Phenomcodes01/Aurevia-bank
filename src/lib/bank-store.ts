import { useEffect, useState } from "react";
import { accounts as baseAccounts } from "./demo-data";

export type AccountId = "chk" | "sav" | "inv";
export type Adjustment = { id: string; account: AccountId; amount: number; note: string; date: string };
export type Customer = { email: string; name: string; balances: Record<AccountId, number>; history: Adjustment[] };

const KEY = "nexabank-customers";
const ADMIN_KEY = "nexabank-admin";
const EVT = "nexabank-store";

const defaults = (): Record<AccountId, number> => ({ chk: 18420.55, sav: 42180, inv: 63991.45 });

const seed: Customer[] = [
  { email: "alex@aurevia.example", name: "Alex Morgan", balances: defaults(), history: [] },
  { email: "jordan.lee@example.com", name: "Jordan Lee", balances: { chk: 5230.1, sav: 12000, inv: 8400 }, history: [] },
  { email: "priya.shah@example.com", name: "Priya Shah", balances: { chk: 940.75, sav: 3100, inv: 0 }, history: [] },
  { email: "sam.okafor@example.com", name: "Sam Okafor", balances: { chk: 27110, sav: 65000, inv: 120500 }, history: [] },
];

function read(): Customer[] {
  if (typeof window === "undefined") return seed;
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); return Array.isArray(v) ? v : seed; } catch { return seed; }
}
function write(c: Customer[]) { localStorage.setItem(KEY, JSON.stringify(c)); window.dispatchEvent(new Event(EVT)); }

export const store = {
  all: read,
  ensure(email: string, name: string) {
    const c = read();
    if (!c.some((x) => x.email === email)) write([...c, { email, name, balances: defaults(), history: [] }]);
  },
  adjust(email: string, account: AccountId, amount: number, note: string) {
    write(read().map((c) => c.email !== email ? c : {
      ...c,
      balances: { ...c.balances, [account]: Math.round((c.balances[account] + amount) * 100) / 100 },
      history: [{ id: crypto.randomUUID(), account, amount, note, date: new Date().toISOString() }, ...c.history],
    }));
  },
  reset() { write(seed); },
};

export function useCustomers() {
  const [list, setList] = useState<Customer[]>(seed);
  useEffect(() => {
    const f = () => setList(read());
    f();
    window.addEventListener(EVT, f);
    window.addEventListener("storage", f);
    return () => { window.removeEventListener(EVT, f); window.removeEventListener("storage", f); };
  }, []);
  return list;
}

/** The signed-in customer's accounts with live (admin-adjustable) balances. */
export function useMyAccounts(email?: string) {
  const list = useCustomers();
  const me = list.find((c) => c.email === email);
  return baseAccounts.map((a) => ({ ...a, balance: me ? me.balances[a.id as AccountId] : a.balance }));
}

export const adminAuth = {
  get: () => typeof window !== "undefined" && localStorage.getItem(ADMIN_KEY) === "1",
  set: () => localStorage.setItem(ADMIN_KEY, "1"),
  clear: () => localStorage.removeItem(ADMIN_KEY),
};
