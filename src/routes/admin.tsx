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
  | "restricted"
  | "deposits"
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
    id: "restricted",
    label: "Restricted Accounts",
    icon: ShieldAlert,
    group: "Customers",
  },
  { id: "deposits", label: "Deposits", icon: ArrowDownLeft, group: "Banking" },
  {
    id: "transfers",
    label: "Transfers",
    icon: ArrowLeftRight,
    group: "Banking",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: Activity,
    group: "Banking",
  },
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
    setOk(adminAuth.get());
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
  const [u, setU] = useState("admin");
  const [p, setP] = useState("admin1234");

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();

          if (u === "admin" && p === "admin1234") {
            onIn();
          } else {
            toast.error("Invalid admin credentials");
          }
        }}
      >
        <Logo />

        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Admin sign in
        </h1>

        <div className="space-y-1.5">
          <Label htmlFor="u">Username</Label>
          <Input id="u" value={u} onChange={(e) => setU(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p">Password</Label>
          <Input
            id="p"
            type="password"
            value={p}
            onChange={(e) => setP(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          Sign in
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
  const customers = useCustomers();

  const [section, setSection] = useState<AdminSection>("overview");
  const [customerSearch, setCustomerSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalBalances = customers.reduce((sum, c) => sum + total(c), 0);

  const adjustmentCount = customers.reduce(
    (sum, c) => sum + c.history.length,
    0,
  );

  const recentAdjustments = customers
    .flatMap((customer) =>
      customer.history.map((entry) => ({
        ...entry,
        customerName: customer.name,
        customerEmail: customer.email,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 6);

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
            />
          )}

          {section === "approvals" && (
            <PlaceholderSection
              title="Pending Approvals"
              description="Review customer registration applications and decide whether to activate their accounts."
              icon={Clock3}
              items={[
                "View pending registration applications",
                "Review customer details before approval",
                "Approve or reject applications",
              ]}
            />
          )}

          {section === "restricted" && (
            <PlaceholderSection
              title="Restricted Accounts"
              description="Review accounts that have been restricted and manage access when account-status controls are connected."
              icon={ShieldAlert}
              items={[
                "Review restricted customer accounts",
                "Inspect restriction reasons",
                "Restore access when appropriate",
              ]}
            />
          )}

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

        <DashboardCard>
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
        </DashboardCard>

        <DashboardCard>
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
        </DashboardCard>

        <DashboardCard>
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
        </DashboardCard>
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
          <QuickAction
            icon={ArrowDownLeft}
            title="Deposit records"
            description="Open deposit management."
            onClick={() => onNavigate("deposits")}
          />
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
}: {
  customers: Customer[];
  search: string;
  onSearch: (value: string) => void;
}) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const current =
    customers.find((customer) => customer.email === selectedEmail) ??
    customers[0];

  return (
    <div className="space-y-6">
      <PageTitle
        title="All Customers"
        subtitle="Search customers, review their account balances and manage balance adjustments."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard
          title="Customer directory"
          action={
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {customers.length} customers
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
            {customers.map((customer) => (
              <li key={customer.email}>
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
                  </span>

                  <span className="text-right">
                    <span className="block text-sm font-semibold">
                      {usd(total(customer))}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Balance
                    </span>
                  </span>
                </button>
              </li>
            ))}

            {!customers.length && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                <Users className="mx-auto mb-2 h-5 w-5" />
                No customers found.
              </li>
            )}
          </ul>

          <div className="mt-4 border-t border-border pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                store.reset();
                setSelectedEmail("");
                toast.success("Account data reset");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset account data
            </Button>
          </div>
        </DashboardCard>

        {current ? (
          <Editor key={current.email} c={current} />
        ) : (
          <DashboardCard>
            <EmptyState
              icon={Users}
              title="Select a customer"
              description="Choose a customer from the directory to inspect their accounts."
            />
          </DashboardCard>
        )}
      </div>
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

function Editor({ c }: { c: Customer }) {
  const [account, setAccount] = useState<AccountId>("chk");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const apply = (sign: 1 | -1) => {
    const n = Number(amount);

    if (!Number.isFinite(n) || n <= 0 || n > 10_000_000) {
      toast.error("Enter an amount between 0 and 10,000,000");
      return;
    }

    store.adjust(
      c.email,
      account,
      sign * n,
      note.trim().slice(0, 100) ||
        (sign > 0 ? "Admin credit" : "Admin debit"),
    );

    toast.success(
      `${sign > 0 ? "Added" : "Removed"} ${usd(n)} ${
        sign > 0 ? "to" : "from"
      } ${c.name}'s ${acctNames[account]}`,
    );

    setAmount("");
    setNote("");
  };

  return (
    <DashboardCard
      title="Customer account controls"
      // action={
      //   // <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-600">
      //   //   Demo mode
      //   // </span>
      // }
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-primary text-lg font-semibold text-primary-foreground">
          {c.name[0]?.toUpperCase()}
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold">{c.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{c.email}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(acctNames) as AccountId[]).map((key) => (
          <div key={key} className="rounded-2xl bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              {acctNames[key]}
            </p>
            <p className="mt-1 break-words font-semibold">
              {usd(c.balances[key])}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold">Manual balance adjustment</h3>
        {/* <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Demo-only adjustment. This does not represent a verified deposit or
          an actual movement of money.
        </p> */}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Account</Label>
            <Select
              value={account}
              onValueChange={(value) => setAccount(value as AccountId)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(acctNames) as AccountId[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {acctNames[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amt">Amount (USD)</Label>
            <Input
              id="amt"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              maxLength={100}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reason for adjustment"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={() => apply(1)}>
            <Plus className="mr-1 h-4 w-4" />
            Add balance
          </Button>

          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => apply(-1)}
          >
            <Minus className="mr-1 h-4 w-4" />
            Remove balance
          </Button>
        </div>
      </div>

      <h3 className="mt-8 text-sm font-semibold">
        Adjustment history
      </h3>

      <ul className="mt-2 divide-y divide-border text-sm">
        {c.history.slice(0, 10).map((entry) => (
          <li key={entry.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p>{entry.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {acctNames[entry.account]} ·{" "}
                {new Date(entry.date).toLocaleString()}
              </p>
            </div>

            <span
              className={`shrink-0 font-semibold ${
                entry.amount > 0
                  ? "text-emerald-600"
                  : "text-destructive"
              }`}
            >
              {usd(entry.amount, true)}
            </span>
          </li>
        ))}

        {!c.history.length && (
          <li className="py-3 text-muted-foreground">
            No adjustments yet.
          </li>
        )}
      </ul>
    </DashboardCard>
  );
}