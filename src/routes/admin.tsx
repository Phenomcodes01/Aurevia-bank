import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/site/primitives";
import { DashboardCard, PageTitle } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/lib/theme";
import { usd } from "@/lib/demo-data";
import {
  adminAuth,
  store,
  useCustomers,
  type AccountId,
  type Customer,
} from "@/lib/bank-store";
import { SupportInbox } from "@/components/support/SupportInbox";
import { apiRequest } from "@/lib/api";


type AdminCustomer = Customer & {
  id: number;
  status: string;
  accountId: number | null;
  accountNumber: string | null;
  accountCurrency: string;
  accountStatus: string | null;
};

type AdminAccount = {
id: number;
user_id: number;
account_number: string;
balance: string | number;
currency: string;
status: "active" | "frozen" | "closed";
user: {
id: number;
name: string;
email: string;
status: string;
} | null;
};


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Aurevia Bank" },
      {
        name: "description",
        content: "Manage Aurevia Bank customers and account balances.",
      },
      { property: "og:title", content: "Admin Console — Aurevia Bank" },
      {
        property: "og:description",
        content: "Manage customers and account operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const acctNames: Record<AccountId, string> = {
  chk: "Checking",
  sav: "Savings",
  inv: "Investment",
};

const total = (c: Customer) =>
  c.balances.chk + c.balances.sav + c.balances.inv;

type AdminSection =
  | "overview"
  | "customers"
  | "approvals"
  | "wireTransfers"
  | "restricted"
  | "deposits"
  | "bitcoinDeposits"
  | "transfers"
  | "transactions"
  | "support"
  | "audit";

type NavItem = {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
  group: string;
};

const navigation: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "Main" },
  { id: "customers", label: "All Customers", icon: Users, group: "Customers" },
  {
    id: "approvals",
    label: "Pending Approvals",
    icon: Clock3,
    group: "Customers",
  },
  {
    id: "wireTransfers",
    label: "Wire Transfers",
    icon: ArrowUpRight,
    group: "Banking",
  },
  {
    id: "bitcoinDeposits",
    label: "Bitcoin Deposits",
    icon: Wallet,
    group: "Banking",
  },
  {
    id: "restricted",
    label: "Restricted Accounts",
    icon: ShieldAlert,
    group: "Customers",
  },
  // { id: "deposits", label: "Deposits", icon: ArrowDownLeft, group: "Banking" },
  // {
  //   id: "transfers",
  //   label: "Transfers",
  //   icon: ArrowLeftRight,
  //   group: "Banking",
  // },
  // {
  //   id: "transactions",
  //   label: "Transactions",
  //   icon: Activity,
  //   group: "Banking",
  // },
  {
    id: "support",
    label: "Support Inbox",
    icon: Headphones,
    group: "Management",
  },
  {
    id: "audit",
    label: "Audit Logs",
    icon: FileText,
    group: "Management",
  },
];

function AdminPage() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAdminSession = async () => {
      const token = localStorage.getItem("aurevia_admin_api_token");

      if (!token) {
        adminAuth.clear();
        if (!cancelled) setOk(false);
        return;
      }

      try {
        const data = await apiRequest<{
          id: number;
          role: string;
        }>("/user", {
          method: "GET",
          token,
        });

        if (data.role !== "admin") {
          throw new Error("Administrator access required.");
        }

        if (!cancelled) setOk(true);
      } catch {
        localStorage.removeItem("aurevia_admin_api_token");
        adminAuth.clear();

        if (!cancelled) setOk(false);
      }
    };

    checkAdminSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (ok === null) return null;

  return ok ? (
    <Console
      onOut={() => {
        adminAuth.clear();
        setOk(false);
      }}
    />
  ) : (
    <Login
      onIn={() => {
        adminAuth.set();
        setOk(true);
      }}
    />
  );
}

function Login({ onIn }: { onIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const data = await apiRequest<{
        message: string;
        user: {
          id: number;
          name: string;
          email: string;
          role: string;
        };
        token: string;
      }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (data.user.role !== "admin") {
        throw new Error("Access denied. Administrators only.");
      }

      localStorage.setItem("aurevia_admin_api_token", data.token);

      toast.success("Administrator login successful!");

      onIn();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-lg"
        onSubmit={handleLogin}
      >
        <Logo />

        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Admin sign in
        </h1>

        <div className="space-y-1.5">
          <Label htmlFor="admin-email">Email address</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <Link
          to="/"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          Back to site
        </Link>
      </form>
    </div>
  );
}

function Console({ onOut }: { onOut: () => void }) {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  async function loadCustomers() {
    const token = localStorage.getItem("aurevia_admin_api_token");

    if (!token) {
      toast.error("Admin session expired. Please sign in again.");
      setCustomersLoading(false);
      return;
    }

    try {
      const response = await apiRequest<{
        customers: Array<{
          id: number;
          name: string;
          email: string;
          status: string;
          account: {
            id: number;
            account_number: string;
            balance: string | number;
            currency: string;
            status: string;
          } | null;
        }>;
      }>("/admin/customers", { token });

      setCustomers(
        response.customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          status: customer.status,
          accountId: customer.account?.id ?? null,
          accountNumber: customer.account?.account_number ?? null,
          accountCurrency: customer.account?.currency ?? "USD",
          accountStatus: customer.account?.status ?? null,
          balances: {
            chk: Number(customer.account?.balance ?? 0),
            sav: 0,
            inv: 0,
          },
          history: [],
        })),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load customers.",
      );
    } finally {
      setCustomersLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  const [section, setSection] = useState<AdminSection>("overview");
  const [customerSearch, setCustomerSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalBalances = customers.reduce((sum, c) => sum + total(c), 0);

  const adjustmentCount = 0;
  const recentAdjustments: Adjustment[] = [];

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email}`
      .toLowerCase()
      .includes(customerSearch.toLowerCase()),
  );

  const activeNav = navigation.find((item) => item.id === section);

  function navigateTo(next: AdminSection) {
    setSection(next);
    setMobileNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted/40 lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <AdminSidebar
          section={section}
          onNavigate={navigateTo}
          onOut={onOut}
        />
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 h-full w-full bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl">
            <AdminSidebar
              section={section}
              onNavigate={navigateTo}
              onOut={onOut}
              mobile
              onClose={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {activeNav?.label ?? "Admin Console"}
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Aurevia Bank · Administration
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {/* <span className="text-xs text-muted-foreground">
                Demo environment
              </span> */}
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              title="Notifications"
              onClick={() =>
                toast.info("Admin notifications will be connected to the backend later.")
              }
            >
              <Bell className="h-5 w-5" />
            </Button>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
              A
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-8">
          {section === "overview" && (
            <Overview
              customers={customers}
              totalBalances={totalBalances}
              adjustmentCount={adjustmentCount}
              recentAdjustments={recentAdjustments}
              onNavigate={navigateTo}
            />
          )}

          {section === "customers" && (
            <CustomersSection
              customers={filteredCustomers}
              search={customerSearch}
              onSearch={setCustomerSearch}
              onUpdated={loadCustomers}
              loading={customersLoading}
            />
          )}

          {section === "approvals" && <PendingApprovalsSection />}
          {section === "wireTransfers" && <WireTransfersSection />}
          {section === "bitcoinDeposits" && <BitcoinDepositsSection />}

          {section === "restricted" && <RestrictedAccountsSection />}

          {section === "deposits" && (
            <PlaceholderSection
              title="Deposit Management"
              description="A central place to review incoming deposits and their payment-provider verification status."
              icon={ArrowDownLeft}
              items={[
                "Search deposits by customer or reference",
                "Filter pending, successful, failed and reversed deposits",
                "Review verified payment confirmations",
              ]}
            />
          )}

          {section === "transfers" && (
            <PlaceholderSection
              title="Transfer Management"
              description="Review transfers between Aurevia customer accounts."
              icon={ArrowLeftRight}
              items={[
                "View sender and recipient details",
                "Search transfer references",
                "Review transfer statuses",
              ]}
            />
          )}

          {section === "transactions" && (
            <PlaceholderSection
              title="Transaction History"
              description="A combined view of customer financial activity."
              icon={Activity}
              items={[
                "Review transaction amounts and references",
                "Filter transactions by type and status",
                "Inspect transaction dates and customer details",
              ]}
            />
          )}

          {section === "support" && (
            <div className="space-y-6">
              <PageTitle
                title="Support Inbox"
                subtitle="Review customer conversations and manage support requests."
              />
              <SupportInbox />
            </div>
          )}

          {section === "audit" && (
            <AuditSection adjustments={recentAdjustments} />
          )}
        </main>
      </div>
    </div>
  );
}

function PendingApprovalsSection() {
  type PendingCustomer = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    status: string;
    created_at: string;
  };

  const [customers, setCustomers] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadCustomers = async () => {
    const token = localStorage.getItem("aurevia_admin_api_token");

    if (!token) {
      setError("Your administrator session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const data = await apiRequest<{
        customers: PendingCustomer[];
      }>("/admin/customers/pending", {
        method: "GET",
        token,
      });

      setCustomers(data.customers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pending applications.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const handleDecision = async (
    customer: PendingCustomer,
    decision: "approve" | "reject",
  ) => {
    const action = decision === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${customer.name}'s application?`,
    );

    if (!confirmed) return;

    const token = localStorage.getItem("aurevia_admin_api_token");

    if (!token) {
      toast.error("Your administrator session has expired. Please sign in again.");
      return;
    }

    setProcessingId(customer.id);

    try {
      const result = await apiRequest<{ message: string }>(
        `/admin/customers/${customer.id}/${action}`,
        {
          method: "PATCH",
          token,
        },
      );

      toast.success(result.message);
      await loadCustomers();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to ${action} this application.`,
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            Pending Approvals
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review customer registrations before activating their accounts.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => void loadCustomers()}
          disabled={loading || processingId !== null}
        >
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="rounded-xl border border-border bg-card p-6">
          Loading customer applications...
        </div>
      )}

      {!loading && error && (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-card p-6">
          <p className="text-sm text-destructive">{error}</p>

          <Button
            variant="outline"
            onClick={() => {
              setLoading(true);
              void loadCustomers();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h3 className="font-semibold">No pending applications</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            New customer registrations awaiting approval will appear here.
          </p>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {customers.length} application(s) awaiting review
          </p>

          {customers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {customer.name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>

                  <p className="text-sm">
                    Email verification:{" "}
                    <span
                      className={
                        customer.email_verified_at
                          ? "font-medium text-emerald-600"
                          : "font-medium text-amber-600"
                      }
                    >
                      {customer.email_verified_at
                        ? "Verified"
                        : "Not verified"}
                    </span>
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Registered:{" "}
                    {new Date(customer.created_at).toLocaleDateString()}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Customer ID: {customer.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={
                      processingId !== null ||
                      !customer.email_verified_at
                    }
                    onClick={() =>
                      void handleDecision(customer, "approve")
                    }
                  >
                    {processingId === customer.id
                      ? "Processing..."
                      : "Approve"}
                  </Button>

                  <Button
                    variant="outline"
                    disabled={processingId !== null}
                    onClick={() =>
                      void handleDecision(customer, "reject")
                    }
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {!customer.email_verified_at && (
                <p className="mt-4 text-xs text-amber-600">
                  This customer must verify their email before approval.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSidebar({
  section,
  onNavigate,
  onOut,
  mobile = false,
  onClose,
}: {
  section: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onOut: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const groups = [...new Set(navigation.map((item) => item.group))];

  return (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-sidebar-border px-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Aurevia</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
              Admin console
            </p>
          </div>
        </div>

        {mobile && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {groups.map((group) => (
          <div key={group} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
              {group}
            </p>

            <div className="space-y-1">
              {navigation
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const selected = section === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        selected
                          ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {selected && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-4 rounded-xl bg-sidebar-accent/50 p-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Administrator</p>
              {/* <p className="text-xs text-sidebar-foreground/60">
                Demo access
              </p> */}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  );
}

function Overview({
  customers,
  totalBalances,
  adjustmentCount,
  recentAdjustments,
  onNavigate,
}: {
  customers: Customer[];
  totalBalances: number;
  adjustmentCount: number;
  recentAdjustments: {
    id: string;
    note: string;
    date: string;
    amount: number;
    account: AccountId;
    customerName: string;
    customerEmail: string;
  }[];
  onNavigate: (section: AdminSection) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageTitle
          title="Overview"
          subtitle="Here's what's happening across your Aurevia environment."
        />

        {/* <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Demo data
        </span> */}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total customers</p>
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-semibold">
            {customers.length}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Registered customers
          </p>
        </DashboardCard>

        {/* <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Customer balances</p>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 break-words font-display text-3xl font-semibold">
            {usd(totalBalances)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Sum of account balances
          </p>
        </DashboardCard> */}

        {/* <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Manual adjustments</p>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-semibold">
            {adjustmentCount}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Recorded balance changes
          </p>
        </DashboardCard> */}

        {/* <DashboardCard>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Account controls</p>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-semibold">Setup</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Approval and restriction logic pending
          </p>
        </DashboardCard> */}
      </div>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="font-display text-lg font-semibold">Quick actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump straight to a management section.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            icon={Users}
            title="Manage customers"
            description="Search customers and inspect balances."
            onClick={() => onNavigate("customers")}
          />
          <QuickAction
            icon={Clock3}
            title="Account approvals"
            description="Prepare to review registration requests."
            onClick={() => onNavigate("approvals")}
          />
          {/* <QuickAction
            icon={ArrowDownLeft}
            title="Deposit records"
            description="Open deposit management."
            onClick={() => onNavigate("deposits")}
          /> */}
          <QuickAction
            icon={Headphones}
            title="Support inbox"
            description="Review customer support conversations."
            onClick={() => onNavigate("support")}
          />
        </div>
      </section>

      {/* Recent demo adjustments */}
      <DashboardCard
        title="Recent account adjustments"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("audit")}
          >
            View audit logs
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        }
      >
        {recentAdjustments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Account</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentAdjustments.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/70">
                    <td className="py-4 pr-4">
                      <p className="font-medium">{entry.customerName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.customerEmail}
                      </p>
                    </td>
                    <td className="py-4 pr-4">{entry.note}</td>
                    <td className="py-4 pr-4">
                      {acctNames[entry.account]}
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-4 text-right font-semibold ${
                        entry.amount >= 0
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                    >
                      {usd(entry.amount, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No recent adjustments"
            description="Customer balance adjustments will appear here."
          />
        )}
      </DashboardCard>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function CustomersSection({
customers,
search,
onSearch,
onUpdated,
loading,
}: {
customers: AdminCustomer[];
search: string;
onSearch: (value: string) => void;
onUpdated: () => Promise<void>;
loading: boolean;
}) {
const [selectedEmail, setSelectedEmail] = useState("");

const current =
customers.find((customer) => customer.email === selectedEmail) ??
customers[0];

return ( <div className="space-y-6"> <PageTitle
     title="All Customers"
     subtitle="View customer accounts, check USD balances, and manage balance adjustments."
   />


  <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <DashboardCard
      title="Customer directory"
      action={
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {loading ? "Loading..." : `${customers.length} customers`}
        </span>
      }
    >
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          aria-label="Search customers"
          placeholder="Search name or email…"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      <ul className="divide-y divide-border">
        {loading ? (
          <li className="py-8 text-center text-sm text-muted-foreground">
            Loading customers from the server...
          </li>
        ) : (
          customers.map((customer) => (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => setSelectedEmail(customer.email)}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted ${
                  current?.email === customer.email ? "bg-muted" : ""
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
                  {customer.name[0]?.toUpperCase()}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {customer.name}
                  </span>

                  <span className="block truncate text-xs text-muted-foreground">
                    {customer.email}
                  </span>

                  <span className="block truncate text-[10px] text-muted-foreground">
                    {customer.accountNumber
                      ? `Account: ${customer.accountNumber}`
                      : "No account assigned"}
                  </span>
                </span>

                <span className="text-right">
                  <span className="block text-sm font-semibold">
                    {usd(customer.balances.chk)}
                  </span>

                  <span className="text-[10px] text-muted-foreground">
                    USD balance
                  </span>
                </span>
              </button>
            </li>
          ))
        )}

        {!loading && customers.length === 0 && (
          <li className="py-8 text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-2 h-5 w-5" />
            No customers found.
          </li>
        )}
      </ul>
    </DashboardCard>

    {current && !loading ? (
      <Editor
        key={current.email}
        c={current}
        onUpdated={onUpdated}
      />
    ) : (
      <DashboardCard>
        <EmptyState
          icon={Users}
          title={loading ? "Loading customers" : "Select a customer"}
          description={
            loading
              ? "Retrieving customer accounts from the server."
              : "Choose a customer from the directory to manage their account."
          }
        />
      </DashboardCard>
    )}
  </div>
</div>


);
}


function RestrictedAccountsSection() {
const [accounts, setAccounts] = useState<AdminAccount[]>([]);
const [loading, setLoading] = useState(true);
const [updatingId, setUpdatingId] = useState<number | null>(null);
const [filter, setFilter] = useState<"all" | "frozen" | "active">("all");

async function loadAccounts() {
const token = localStorage.getItem("aurevia_admin_api_token");


if (!token) {
  toast.error("Admin session expired. Please sign in again.");
  setLoading(false);
  return;
}

try {
  const response = await apiRequest<{ accounts: AdminAccount[] }>(
    "/admin/accounts",
    { token },
  );

  setAccounts(response.accounts);
} catch (error) {
  toast.error(
    error instanceof Error
      ? error.message
      : "Unable to load customer accounts.",
  );
} finally {
  setLoading(false);
}


}

useEffect(() => {
void loadAccounts();
}, []);

async function changeStatus(account: AdminAccount) {
const nextStatus = account.status === "frozen" ? "active" : "frozen";
const action = nextStatus === "frozen" ? "freeze" : "unfreeze";


const confirmed = window.confirm(
  `${action === "freeze" ? "Freeze" : "Unfreeze"} ${account.user?.name ?? "this customer's"} account (${account.account_number})?`,
);

if (!confirmed) return;

const token = localStorage.getItem("aurevia_admin_api_token");

if (!token) {
  toast.error("Admin session expired. Please sign in again.");
  return;
}

setUpdatingId(account.id);

try {
  await apiRequest<{ message: string }>(
    `/admin/accounts/${account.id}/status`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({ status: nextStatus }),
    },
  );

  await loadAccounts();

  toast.success(
    nextStatus === "frozen"
      ? "Account frozen successfully."
      : "Account unfrozen successfully.",
  );
} catch (error) {
  toast.error(
    error instanceof Error
      ? error.message
      : "Unable to update account status.",
  );
} finally {
  setUpdatingId(null);
}


}

const visibleAccounts = accounts.filter((account) => {
if (filter === "frozen") return account.status === "frozen";
if (filter === "active") return account.status === "active";
return true;
});

const frozenCount = accounts.filter(
(account) => account.status === "frozen",
).length;

return ( <div className="space-y-6"> <PageTitle
     title="Restricted Accounts"
     subtitle="Review customer account statuses and freeze or restore account access."
   />


  <div className="grid gap-4 sm:grid-cols-3">
    <DashboardCard title="Total accounts">
      <p className="text-2xl font-semibold">{accounts.length}</p>
    </DashboardCard>

    <DashboardCard title="Frozen accounts">
      <p className="text-2xl font-semibold text-destructive">
        {frozenCount}
      </p>
    </DashboardCard>

    <DashboardCard title="Active accounts">
      <p className="text-2xl font-semibold text-emerald-600">
        {accounts.filter((account) => account.status === "active").length}
      </p>
    </DashboardCard>
  </div>

  <DashboardCard
    title="Customer accounts"
    action={
      <Button
        variant="outline"
        size="sm"
        onClick={() => void loadAccounts()}
        disabled={loading}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    }
  >
    <div className="mb-5 flex flex-wrap gap-2">
      {(["all", "frozen", "active"] as const).map((status) => (
        <Button
          key={status}
          size="sm"
          variant={filter === status ? "default" : "outline"}
          onClick={() => setFilter(status)}
        >
          {status === "all"
            ? "All accounts"
            : status === "frozen"
              ? "Frozen"
              : "Active"}
        </Button>
      ))}
    </div>

    {loading ? (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading customer accounts...
      </p>
    ) : visibleAccounts.length === 0 ? (
      <div className="py-10 text-center">
        <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">No accounts found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No accounts match the selected filter.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Account number</th>
              <th className="px-3 py-3 font-medium">Balance</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {visibleAccounts.map((account) => (
              <tr key={account.id}>
                <td className="px-3 py-4">
                  <p className="font-medium">
                    {account.user?.name ?? "Unknown customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.user?.email ?? "No email available"}
                  </p>
                </td>

                <td className="px-3 py-4 font-mono text-xs">
                  {account.account_number}
                </td>

                <td className="px-3 py-4 font-medium">
                  {account.currency}{" "}
                  {Number(account.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td className="px-3 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      account.status === "frozen"
                        ? "bg-destructive/10 text-destructive"
                        : account.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {account.status}
                  </span>
                </td>

                <td className="px-3 py-4 text-right">
                  {account.status === "closed" ? (
                    <span className="text-xs text-muted-foreground">
                      Closed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={
                        account.status === "frozen"
                          ? "default"
                          : "destructive"
                      }
                      disabled={updatingId !== null}
                      onClick={() => void changeStatus(account)}
                    >
                      {updatingId === account.id
                        ? "Updating..."
                        : account.status === "frozen"
                          ? "Unfreeze"
                          : "Freeze"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </DashboardCard>
</div>


);
}



function PlaceholderSection({
  title,
  description,
  icon: Icon,
  items,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
}) {
  return (
    <div className="space-y-6">
      <PageTitle title={title} subtitle={description} />

      <DashboardCard>
        <div className="flex flex-col items-center px-4 py-10 text-center sm:px-10">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>

          <span className="mt-5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
            Backend integration pending
          </span>

          <h2 className="mt-4 font-display text-xl font-semibold">
            {title}
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The section is ready for its data and business logic to be
            connected. No real customer records or transaction statuses are
            being fabricated here.
          </p>

          <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}

function AuditSection({
  adjustments,
}: {
  adjustments: {
    id: string;
    note: string;
    date: string;
    amount: number;
    account: AccountId;
    customerName: string;
    customerEmail: string;
  }[];
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        title="Audit Logs"
        subtitle="Review the balance adjustments currently recorded in the customer store."
      />

      <DashboardCard
        title="Recorded balance adjustments"
        action={
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {adjustments.length} recent
          </span>
        }
      >
        {adjustments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Action / note</th>
                  <th className="pb-3 pr-4 font-medium">Account</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>

              <tbody>
                {adjustments.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/70">
                    <td className="py-4 pr-4">
                      <p className="font-medium">{entry.customerName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.customerEmail}
                      </p>
                    </td>
                    <td className="py-4 pr-4">{entry.note}</td>
                    <td className="py-4 pr-4">
                      {acctNames[entry.account]}
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {new Date(entry.date).toLocaleString()}
                    </td>
                    <td
                      className={`py-4 text-right font-semibold ${
                        entry.amount >= 0
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                    >
                      {usd(entry.amount, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No adjustments recorded"
            description="Recorded balance adjustments will appear here."
          />
        )}

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            These are existing adjustment records, not a tamper-resistant
            security audit trail. A production audit log must be generated and
            protected by the backend.
          </p>
        </div>
      </DashboardCard>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Editor({
c,
onUpdated,
}: {
c: AdminCustomer;
onUpdated: () => Promise<void>;
}) {
const [amount, setAmount] = useState("");
const [isSaving, setIsSaving] = useState(false);

const apply = async (sign: 1 | -1) => {
const n = Number(amount);


if (!Number.isFinite(n) || n <= 0 || n > 1_000_000_000) {
  toast.error("Enter a valid amount greater than 0.");
  return;
}

if (!c.accountId) {
  toast.error("This customer does not have an account to adjust.");
  return;
}

const token = localStorage.getItem("aurevia_admin_api_token");

if (!token) {
  toast.error("Your admin session has expired. Please sign in again.");
  return;
}

setIsSaving(true);

try {
  await apiRequest<{
    message: string;
    account: { balance: string | number };
  }>(`/admin/accounts/${c.accountId}/balance`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      action: sign > 0 ? "add" : "subtract",
      amount: n,
    }),
  });

  await onUpdated();

  toast.success(
    `${sign > 0 ? "Added" : "Removed"} ${usd(n)} ${
      sign > 0 ? "to" : "from"
    } ${c.name}'s USD account.`,
  );

  setAmount("");
} catch (error) {
  toast.error(
    error instanceof Error
      ? error.message
      : "Unable to update the account balance.",
  );
} finally {
  setIsSaving(false);
}


};

return ( <DashboardCard title="Customer account controls"> <div className="mb-5 flex items-center gap-3"> <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-primary text-lg font-semibold text-primary-foreground">
{c.name[0]?.toUpperCase()} </div>


    <div className="min-w-0">
      <h3 className="font-semibold">{c.name}</h3>
      <p className="truncate text-sm text-muted-foreground">
        {c.email}
      </p>
    </div>
  </div>

  <div className="rounded-2xl bg-muted p-4">
    <p className="text-xs text-muted-foreground">Available USD balance</p>
    <p className="mt-1 break-words text-2xl font-semibold">
      {usd(c.balances.chk)}
    </p>
  </div>

  <div className="mt-4 space-y-3 rounded-2xl border border-border p-4">
    <div>
      <p className="text-xs text-muted-foreground">Account number</p>
      <p className="font-medium">
        {c.accountNumber ?? "No account assigned"}
      </p>
    </div>

    <div>
      <p className="text-xs text-muted-foreground">Account status</p>
      <p className="font-medium capitalize">
        {c.accountStatus ?? "Unavailable"}
      </p>
    </div>

    <div>
      <p className="text-xs text-muted-foreground">Customer status</p>
      <p className="font-medium capitalize">{c.status}</p>
    </div>
  </div>

  <div className="mt-6 rounded-2xl border border-border p-4">
    <h3 className="text-sm font-semibold">Manual balance adjustment</h3>

    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
      Changes are applied to the customer's account balance on the server.
      Check the amount carefully before confirming.
    </p>

    <div className="mt-4 space-y-1.5">
      <Label htmlFor="admin-adjustment-amount">Amount (USD)</Label>

      <Input
        id="admin-adjustment-amount"
        type="number"
        min="0.01"
        max="1000000000"
        step="0.01"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        placeholder="0.00"
        disabled={isSaving || !c.accountId}
      />
    </div>

    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <Button
        className="flex-1"
        onClick={() => void apply(1)}
        disabled={isSaving || !c.accountId}
      >
        <Plus className="mr-1 h-4 w-4" />
        {isSaving ? "Updating..." : "Add balance"}
      </Button>

      <Button
        variant="destructive"
        className="flex-1"
        onClick={() => void apply(-1)}
        disabled={isSaving || !c.accountId}
      >
        <Minus className="mr-1 h-4 w-4" />
        {isSaving ? "Updating..." : "Remove balance"}
      </Button>
    </div>

    {!c.accountId && (
      <p className="mt-3 text-sm text-destructive">
        This customer has no account assigned, so the balance cannot be
        adjusted.
      </p>
    )}
  </div>
</DashboardCard>


);
}


function WireTransfersSection() {
  type WireTransfer = {
    id: number;
    reference: string;
    type: string;
    amount: string | number;
    currency: string;
    status: string;
    description: string | null;
    created_at: string;
    metadata?: {
      transfer_method?: string;
      bank_name?: string;
      routing_number?: string;
      account_number?: string;
      account_type?: string;
      account_name?: string;
      recipient_address?: string | null;
      transfer_purpose?: string;
    } | null;
    sender_account?: {
      account_number?: string;
      user?: {
        id: number;
        name: string;
        email: string;
      } | null;
    } | null;
    senderAccount?: {
      account_number?: string;
      user?: {
        id: number;
        name: string;
        email: string;
      } | null;
    } | null;
  };

  type PaginatedTransfers = {
    data: WireTransfer[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };

  const [transfers, setTransfers] = useState<WireTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadTransfers = async () => {
    const token = localStorage.getItem("aurevia_admin_api_token");

    if (!token) {
      setError("Your administrator session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const result = await apiRequest<PaginatedTransfers>(
        "/admin/external-transfers/pending",
        {
          method: "GET",
          token,
        },
      );

      setTransfers(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pending wire transfers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransfers();
  }, []);

  const handleDecision = async (
    transfer: WireTransfer,
    decision: "approve" | "reject",
  ) => {
    const actionLabel = decision === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      decision === "approve"
        ? `Approve wire transfer ${transfer.reference} for ${transfer.currency} ${Number(
            transfer.amount,
          ).toFixed(2)}? It will move to processing, not completed.`
        : `Reject wire transfer ${transfer.reference}? The reserved funds will be returned to the customer's account.`,
    );

    if (!confirmed) return;

    const token = localStorage.getItem("aurevia_admin_api_token");

    if (!token) {
      toast.error("Your administrator session has expired. Please sign in again.");
      return;
    }

    setProcessingId(transfer.id);

    try {
      const result = await apiRequest<{
        message: string;
        transaction?: {
          status?: string;
        };
      }>(
        `/admin/external-transfers/${transfer.id}/${actionLabel}`,
        {
          method: "PATCH",
          token,
        },
      );

      toast.success(result.message);

      // Remove the processed request from the pending list.
      setTransfers((current) =>
        current.filter((item) => item.id !== transfer.id),
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Unable to ${actionLabel} this wire transfer.`,
      );

      // Refresh in case the transaction was processed elsewhere.
      await loadTransfers();
    } finally {
      setProcessingId(null);
    }
  };

  const maskAccountNumber = (value?: string) => {
    if (!value) return "Not provided";

    if (value.length <= 4) {
      return "*".repeat(value.length);
    }

    return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Wire Transfers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review customer wire transfer requests awaiting administrator
            approval.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setLoading(true);
            void loadTransfers();
          }}
          disabled={loading || processingId !== null}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

        <div>
          <p className="text-sm font-semibold">Approval does not send the money</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Approving a request moves it to Processing. The transfer must not
            be represented as completed unless an actual settlement mechanism
            confirms that the funds have been sent.
          </p>
        </div>
      </div> */}

      {loading && (
        <DashboardCard>
          <p className="text-sm text-muted-foreground">
            Loading pending wire transfers...
          </p>
        </DashboardCard>
      )}

      {!loading && error && (
        <DashboardCard>
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                void loadTransfers();
              }}
            >
              Try again
            </Button>
          </div>
        </DashboardCard>
      )}

      {!loading && !error && transfers.length === 0 && (
        <DashboardCard>
          <EmptyState
            icon={CheckCircle2}
            title="No pending wire transfers"
            description="New customer requests awaiting review will appear here."
          />
        </DashboardCard>
      )}

      {!loading && !error && transfers.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {transfers.length} pending request(s) on this page
          </p>

          {transfers.map((transfer) => {
            const metadata = transfer.metadata ?? {};

            const sender =
              transfer.senderAccount?.user ??
              transfer.sender_account?.user;

            const senderAccount =
              transfer.senderAccount?.account_number ??
              transfer.sender_account?.account_number;

            return (
              <DashboardCard key={transfer.id}>
                <div className="space-y-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                        <Clock3 className="h-3.5 w-3.5" />
                        Pending Approval
                      </span>

                      <h3 className="mt-3 text-lg font-semibold">
                        {metadata.account_name || "Unnamed recipient"}
                      </h3>

                      <p className="mt-1 break-all text-xs text-muted-foreground">
                        Reference: {transfer.reference}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-2xl font-semibold">
                        {transfer.currency}{" "}
                        {Number(transfer.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Requested{" "}
                        {new Date(transfer.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Customer
                      </p>

                      <p className="mt-1 font-medium">
                        {sender?.name || "Customer information unavailable"}
                      </p>

                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {sender?.email || "Email unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Customer account
                      </p>

                      <p className="mt-1 font-medium">
                        {senderAccount
                          ? maskAccountNumber(senderAccount)
                          : "Not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Recipient bank
                      </p>

                      <p className="mt-1 font-medium">
                        {metadata.bank_name || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Recipient account
                      </p>

                      <p className="mt-1 font-medium">
                        {maskAccountNumber(metadata.account_number)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Routing number
                      </p>

                      <p className="mt-1 font-medium">
                        {metadata.routing_number || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Account type
                      </p>

                      <p className="mt-1 font-medium capitalize">
                        {metadata.account_type || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Transfer purpose
                      </p>

                      <p className="mt-1 font-medium">
                        {(
                          metadata.transfer_purpose || "Not specified"
                        ).replaceAll("_", " ")}
                      </p>
                    </div>

                    {metadata.recipient_address && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Recipient address
                        </p>

                        <p className="mt-1 break-words font-medium">
                          {metadata.recipient_address}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      disabled={processingId !== null}
                      onClick={() =>
                        void handleDecision(transfer, "reject")
                      }
                    >
                      {processingId === transfer.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Reject & Refund
                        </>
                      )}
                    </Button>

                    <Button
                      disabled={processingId !== null}
                      onClick={() =>
                        void handleDecision(transfer, "approve")
                      }
                    >
                      {processingId === transfer.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve for Processing
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

type BtcCustomerSubmission = {
  txid: string | null;
  submitted_at: string | null;
  verification_status: string;
};

type BtcMatchedOutput = {
  txid: string;
  output_index: number;
  value_satoshis: string;
  confirmations: number;
  confirmed: boolean;
  status: string;
};

type BtcPaymentVerification = {
  verified_by_admin_id?: number;
  verified_at?: string;
  verified_satoshis?: string;
  confirmations?: number;
  block_height?: number;
  underpayment?: boolean;
  quote_expired?: boolean;
  requires_manual_review?: boolean;
};

type BtcDeposit = {
  id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  account?: {
    id: number;
    user_id: number;
    account_number: string;
    currency: string;
  } | null;
  transaction?: {
    id?: number;
    reference: string;
    status: string;
  } | null;
  usd_amount: string | number;
  btc_amount: string | number;
  btc_received: string | number | null;
  receiving_address: string;
  status: string;
  confirmations: number;
  expires_at: string | null;
  created_at: string | null;
  customer_submitted_txids: BtcCustomerSubmission[];
  matched_output: BtcMatchedOutput | null;
  payment_verification: BtcPaymentVerification | null;
};

type BtcChainOutput = {
  id: number;
  txid: string;
  output_index: number;
  value_satoshis: string | number;
  receiving_address: string;
  confirmations: number;
  confirmed: boolean;
  status: string;
  first_seen_at: string | null;
};

type PaginatedBtcData<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
};

function BitcoinDepositsSection() {
  const [deposits, setDeposits] = useState<BtcDeposit[]>([]);
  const [outputs, setOutputs] = useState<BtcChainOutput[]>([]);
  const [selectedOutputs, setSelectedOutputs] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [pageInfo, setPageInfo] = useState({
    total: 0,
    currentPage: 1,
    lastPage: 1,
  });

  const getToken = () => {
    const token = localStorage.getItem("aurevia_admin_api_token");

    if (!token) {
      throw new Error(
        "Your administrator session has expired. Please sign in again.",
      );
    }

    return token;
  };

  const loadDeposits = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    setError("");

    try {
      const token = getToken();

      const [depositResponse, outputResponse] = await Promise.all([
        apiRequest<{
          deposits: PaginatedBtcData<BtcDeposit>;
        }>("/admin/btc-deposits/pending", {
          method: "GET",
          token,
        }),

        apiRequest<{
          outputs: PaginatedBtcData<BtcChainOutput> | BtcChainOutput[];
          message?: string;
        }>("/admin/btc-chain-outputs/available", {
          method: "GET",
          token,
        }),
      ]);

      const depositPage = depositResponse.deposits;

      setDeposits(depositPage?.data ?? []);

      setPageInfo({
        total: depositPage?.total ?? depositPage?.data?.length ?? 0,
        currentPage: depositPage?.current_page ?? 1,
        lastPage: depositPage?.last_page ?? 1,
      });

      const availableOutputs = Array.isArray(outputResponse.outputs)
        ? outputResponse.outputs
        : outputResponse.outputs?.data ?? [];

      setOutputs(availableOutputs);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load Bitcoin deposits.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDeposits();
  }, []);

  const formatUsd = (amount: string | number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));

  const formatBtc = (amount: string | number | null) =>
    amount === null || amount === undefined
      ? "Not recorded"
      : `${Number(amount).toFixed(8)} BTC`;

  const statusLabel = (status: string) =>
    status.replaceAll("_", " ").replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );

  const statusClass = (status: string) => {
    if (status === "completed") {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600";
    }

    if (
      status === "underpayment_review" ||
      status === "expired_payment_review"
    ) {
      return "border-destructive/30 bg-destructive/10 text-destructive";
    }

    if (status === "detected") {
      return "border-blue-500/30 bg-blue-500/10 text-blue-600";
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-600";
  };

  const handleMatch = async (deposit: BtcDeposit) => {
    const selectedOutputId = selectedOutputs[deposit.id];

    if (!selectedOutputId) {
      toast.error("Select an available blockchain output first.");
      return;
    }

    const selectedOutput = outputs.find(
      (output) => String(output.id) === selectedOutputId,
    );

    if (!selectedOutput) {
      toast.error("That blockchain output is no longer available. Refresh the list.");
      return;
    }

    const confirmed = window.confirm(
      `Match the selected blockchain output to deposit #${deposit.id}?\n\n` +
        `Customer: ${deposit.user?.name ?? "Unknown"}\n` +
        `Requested amount: ${formatUsd(deposit.usd_amount)}\n` +
        `Transaction ID: ${selectedOutput.txid}\n\n` +
        "Matching does not credit the customer's account.",
    );

    if (!confirmed) return;

    setProcessingId(deposit.id);

    try {
      const token = getToken();

      const result = await apiRequest<{
        message: string;
        deposit?: BtcDeposit;
        review_reasons?: string[];
      }>(`/admin/btc-deposits/${deposit.id}/match`, {
        method: "POST",
        token,
        body: JSON.stringify({
          chain_output_id: Number(selectedOutputId),
        }),
      });

      if (result.review_reasons?.length) {
        toast.warning(
          `${result.message} Review required: ${result.review_reasons.join(", ")}.`,
        );
      } else {
        toast.success(result.message);
      }

      setSelectedOutputs((current) => {
        const next = { ...current };
        delete next[deposit.id];
        return next;
      });

      await loadDeposits(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to match the Bitcoin payment.",
      );

      await loadDeposits(false);
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (deposit: BtcDeposit) => {
    if (deposit.status !== "detected" || !deposit.matched_output) {
      toast.error("This deposit is not eligible for standard approval.");
      return;
    }

    const confirmed = window.confirm(
      `Approve and credit this Bitcoin deposit?\n\n` +
        `Customer: ${deposit.user?.name ?? "Unknown"}\n` +
        `Amount: ${formatUsd(deposit.usd_amount)}\n` +
        `Bitcoin received: ${formatBtc(deposit.btc_received)}\n` +
        `Transaction ID: ${deposit.matched_output.txid}\n\n` +
        "The backend will independently verify the payment before crediting the customer's USD account.",
    );

    if (!confirmed) return;

    setProcessingId(deposit.id);

    try {
      const token = getToken();

      const result = await apiRequest<{
        message: string;
        credited_amount?: string | number;
        currency?: string;
        account_balance?: string | number;
      }>(`/admin/btc-deposits/${deposit.id}/approve`, {
        method: "PATCH",
        token,
      });

      toast.success(
        result.account_balance !== undefined
          ? `${result.message} New account balance: ${formatUsd(result.account_balance)}.`
          : result.message,
      );

      await loadDeposits(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to approve this Bitcoin deposit.",
      );

      await loadDeposits(false);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            Bitcoin Deposit Management
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Verify incoming Bitcoin payments and review deposits before
            crediting customer USD accounts.
          </p>
        </div>

        <Button
          variant="outline"
          disabled={loading || processingId !== null}
          onClick={() => void loadDeposits()}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

        <div>
          <p className="text-sm font-semibold">
            Payment verification is required
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Customer-submitted transaction IDs are unverified claims.
            Matching records a verified payment but does not credit an
            account. Only eligible deposits can proceed to standard approval.
            Expired payments and underpayments require manual review.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Awaiting review
              </p>
              <p className="text-2xl font-semibold">
                {deposits.filter((deposit) => deposit.status === "pending").length}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Matched payments
              </p>
              <p className="text-2xl font-semibold">
                {deposits.filter((deposit) => deposit.status === "detected").length}
              </p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-destructive/10 p-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Manual review
              </p>
              <p className="text-2xl font-semibold">
                {
                  deposits.filter((deposit) =>
                    [
                      "expired_payment_review",
                      "underpayment_review",
                    ].includes(deposit.status),
                  ).length
                }
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {loading && (
        <DashboardCard>
          <p className="text-sm text-muted-foreground">
            Loading Bitcoin deposits and available blockchain outputs...
          </p>
        </DashboardCard>
      )}

      {!loading && error && (
        <DashboardCard>
          <div className="space-y-3">
            <p className="text-sm text-destructive">{error}</p>

            <Button
              variant="outline"
              onClick={() => void loadDeposits()}
            >
              Try again
            </Button>
          </div>
        </DashboardCard>
      )}

      {!loading && !error && deposits.length === 0 && (
        <DashboardCard>
          <EmptyState
            icon={Wallet}
            title="No Bitcoin deposits awaiting review"
            description="New Bitcoin deposit requests requiring administrator review will appear here."
          />
        </DashboardCard>
      )}

      {!loading && !error && deposits.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {deposits.length} deposit(s) on this page
            {pageInfo.total > 0 ? ` · ${pageInfo.total} total` : ""}
          </p>

          {deposits.map((deposit) => {
            const requiresManualReview = [
              "expired_payment_review",
              "underpayment_review",
            ].includes(deposit.status);

            const canMatch =
              deposit.status === "pending" &&
              !deposit.matched_output &&
              (deposit.customer_submitted_txids ?? []).some(
                (submission) => Boolean(submission.txid),
              );

            const canApprove =
              deposit.status === "detected" &&
              Boolean(deposit.matched_output) &&
              !requiresManualReview;

            return (
              <DashboardCard key={deposit.id}>
                <div className="space-y-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                          deposit.status,
                        )}`}
                      >
                        {statusLabel(deposit.status)}
                      </span>

                      <h3 className="mt-3 text-lg font-semibold">
                        {deposit.user?.name ?? "Customer information unavailable"}
                      </h3>

                      <p className="mt-1 break-all text-sm text-muted-foreground">
                        {deposit.user?.email ?? "Email unavailable"}
                      </p>

                      <p className="mt-2 break-all text-xs text-muted-foreground">
                        Deposit ID: {deposit.id}
                        {deposit.transaction?.reference
                          ? ` · Reference: ${deposit.transaction.reference}`
                          : ""}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-2xl font-semibold">
                        {formatUsd(deposit.usd_amount)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Quoted: {formatBtc(deposit.btc_amount)}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Received: {formatBtc(deposit.btc_received)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Confirmations: {deposit.confirmations ?? 0}
                      </p>

                      {deposit.created_at && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Created{" "}
                          {new Date(deposit.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Customer account
                      </p>

                      <p className="mt-1 break-all font-medium">
                        {deposit.account?.account_number ?? "Unavailable"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Currency: {deposit.account?.currency ?? "Unknown"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Receiving address
                      </p>

                      <p className="mt-1 break-all font-mono text-xs">
                        {deposit.receiving_address}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Quote expiry
                      </p>

                      <p className="mt-1 text-sm">
                        {deposit.expires_at
                          ? new Date(deposit.expires_at).toLocaleString()
                          : "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Transaction status
                      </p>

                      <p className="mt-1 text-sm">
                        {statusLabel(deposit.transaction?.status ?? "unknown")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">
                      Customer-submitted transaction IDs
                    </h4>

                    {(deposit.customer_submitted_txids ?? []).length > 0 ? (
                      <div className="space-y-2">
                        {deposit.customer_submitted_txids.map(
                          (submission, index) => (
                            <div
                              key={`${submission.txid ?? "missing"}-${index}`}
                              className="rounded-xl border border-border p-3"
                            >
                              <p className="break-all font-mono text-xs">
                                {submission.txid ?? "No transaction ID recorded"}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600">
                                  Unverified claim
                                </span>

                                {submission.submitted_at && (
                                  <span className="text-xs text-muted-foreground">
                                    Submitted{" "}
                                    {new Date(
                                      submission.submitted_at,
                                    ).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        The customer has not submitted a transaction ID.
                      </p>
                    )}
                  </div>

                  {deposit.matched_output && (
                    <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                        <h4 className="text-sm font-semibold">
                          Matched blockchain output
                        </h4>
                      </div>

                      <p className="break-all font-mono text-xs">
                        TXID: {deposit.matched_output.txid}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Output index: {deposit.matched_output.output_index}
                        {" · "}
                        Value:{" "}
                        {deposit.matched_output.value_satoshis} satoshis
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Confirmations: {deposit.matched_output.confirmations}
                        {" · "}
                        {deposit.matched_output.confirmed
                          ? "Confirmed"
                          : "Not confirmed"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Output status:{" "}
                        {statusLabel(deposit.matched_output.status)}
                      </p>
                    </div>
                  )}

                  {requiresManualReview && (
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                      <div>
                        <p className="text-sm font-semibold text-destructive">
                          Manual review required
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {deposit.status === "underpayment_review"
                            ? "The verified payment is below the quoted Bitcoin amount."
                            : "The payment was received after the deposit quote expired."}
                          {" "}Standard approval is disabled. No account credit
                          should be inferred from the payment match.
                        </p>
                      </div>
                    </div>
                  )}

                  {deposit.payment_verification && (
                    <div className="rounded-xl border border-border p-4">
                      <h4 className="text-sm font-semibold">
                        Payment verification record
                      </h4>

                      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                        <p className="text-muted-foreground">
                          Verified confirmations:{" "}
                          <span className="font-medium text-foreground">
                            {deposit.payment_verification.confirmations ?? "—"}
                          </span>
                        </p>

                        <p className="text-muted-foreground">
                          Block height:{" "}
                          <span className="font-medium text-foreground">
                            {deposit.payment_verification.block_height ?? "—"}
                          </span>
                        </p>

                        <p className="text-muted-foreground">
                          Underpayment:{" "}
                          <span className="font-medium text-foreground">
                            {deposit.payment_verification.underpayment
                              ? "Yes"
                              : "No"}
                          </span>
                        </p>

                        <p className="text-muted-foreground">
                          Quote expired:{" "}
                          <span className="font-medium text-foreground">
                            {deposit.payment_verification.quote_expired
                              ? "Yes"
                              : "No"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {canMatch && (
                    <div className="space-y-3 rounded-xl border border-border p-4">
                      <div>
                        <h4 className="text-sm font-semibold">
                          Match a blockchain payment
                        </h4>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Only unmatched outputs discovered by the backend
                          monitor are listed. The selected transaction must
                          match a customer-submitted TXID.
                        </p>
                      </div>

                      {outputs.length > 0 ? (
                        <>
                          <Select
                            value={selectedOutputs[deposit.id] ?? ""}
                            onValueChange={(value) =>
                              setSelectedOutputs((current) => ({
                                ...current,
                                [deposit.id]: value,
                              }))
                            }
                            disabled={processingId !== null}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an available blockchain output" />
                            </SelectTrigger>

                            <SelectContent>
                              {outputs.map((output) => (
                                <SelectItem
                                  key={output.id}
                                  value={String(output.id)}
                                >
                                  {`${output.txid.slice(0, 12)}…${output.txid.slice(-8)} · Output ${output.output_index} · ${output.value_satoshis} sats`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => void handleMatch(deposit)}
                            disabled={
                              processingId !== null ||
                              !selectedOutputs[deposit.id]
                            }
                          >
                            {processingId === deposit.id
                              ? "Verifying payment..."
                              : "Verify & Match Payment"}
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No available blockchain outputs were returned.
                          Refresh after the backend monitor discovers new
                          outputs.
                        </p>
                      )}
                    </div>
                  )}

                  {canApprove && (
                    <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Payment matched — awaiting approval
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Approval triggers another blockchain verification
                          and credits the requested USD amount only if the
                          backend checks pass.
                        </p>
                      </div>

                      <Button
                        disabled={processingId !== null}
                        onClick={() => void handleApprove(deposit)}
                      >
                        {processingId === deposit.id
                          ? "Verifying & approving..."
                          : "Approve & Credit USD"}
                      </Button>
                    </div>
                  )}

                  {!canMatch &&
                    !canApprove &&
                    !requiresManualReview &&
                    deposit.status !== "completed" && (
                      <p className="rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                        {deposit.status === "pending" &&
                        !(deposit.customer_submitted_txids ?? []).some(
                          (submission) => Boolean(submission.txid),
                        )
                          ? "Waiting for the customer to submit a Bitcoin transaction ID."
                          : deposit.status === "confirming"
                            ? "The payment is still confirming. Standard approval is unavailable."
                            : "This deposit is not currently eligible for matching or standard approval."}
                      </p>
                    )}

                  {deposit.status === "completed" && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-600">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      This deposit has already been credited. No further
                      approval action is available.
                    </div>
                  )}
                </div>
              </DashboardCard>
            );
          })}

          {pageInfo.lastPage > 1 && (
            <p className="text-xs text-muted-foreground">
              Page {pageInfo.currentPage} of {pageInfo.lastPage}. Pagination
              controls can be added if you have more than 20 deposits or
              available outputs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}