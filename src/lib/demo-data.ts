export type Txn = { id: string; name: string; category: string; date: string; amount: number; account: string };

const names: [string, string, number][] = [
  ["Incoming Transfer", "Transfer", 2450],
  ["Apple Store", "Shopping", -999],
  ["Netflix", "Entertainment", -15.99],
  ["Salary — Acme Corp", "Income", 4500],
  ["Whole Foods", "Groceries", -86.4],
  ["Uber", "Transport", -23.5],
  ["Electric Utility", "Bills", -112.3],
  ["Spotify", "Entertainment", -10.99],
  ["Freelance Payment", "Income", 1200],
  ["Shell Gas", "Transport", -54.2],
  ["Amazon", "Shopping", -142.75],
  ["Blue Bottle Coffee", "Dining", -7.5],
];

export const transactions: Txn[] = Array.from({ length: 48 }, (_, i) => {
  const [name, category, amount] = names[i % names.length]!;
  const d = new Date(2026, 8, 30 - Math.floor(i * 0.6));
  return { id: `t${i}`, name, category, amount: amount * (1 + (i % 5) * 0.03) * (i < 4 ? 1 / (1 + (i % 5) * 0.03) : 1), date: d.toISOString().slice(0, 10), account: i % 3 ? "Checking •• 4582" : "Savings •• 9013" };
});

export const accounts = [
  { id: "chk", name: "Everyday Checking", type: "Checking Account", number: "•• 4582", balance: 18420.55 },
  { id: "sav", name: "High-Yield Savings", type: "Savings Account", number: "•• 9013", balance: 42180.0 },
  { id: "inv", name: "Growth Portfolio", type: "Investment Account", number: "•• 7720", balance: 63991.45 },
];

export const balanceSeries = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({ month: m, balance: 96000 + i * 5200 + (i % 2) * 2100 }));
export const spending = [
  { name: "Shopping", value: 1240 },
  { name: "Bills", value: 860 },
  { name: "Dining", value: 420 },
  { name: "Transport", value: 310 },
  { name: "Entertainment", value: 180 },
];

export const usd = (n: number, sign = false) =>
  (sign && n > 0 ? "+" : n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const KEY = "nexabank-demo-user";
export type DemoUser = { name: string; email: string };
export const demoAuth = {
  get(): DemoUser | null {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  },
  set(u: DemoUser) { localStorage.setItem(KEY, JSON.stringify(u)); },
  clear() { localStorage.removeItem(KEY); },
};

export function amortize(principal: number, annualRate: number, years: number) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  const monthly = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  const total = monthly * n;
  return { monthly, total, interest: total - principal };
}
