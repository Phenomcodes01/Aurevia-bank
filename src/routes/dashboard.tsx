import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Headphones,
  LayoutDashboard,
  List,
  LogOut,
  Receipt,
  Search,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/site/primitives";
import {
  demoAuth,
  type DemoUser,
  accounts as demoAccounts,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/lib/theme";
import { store } from "@/lib/bank-store";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { useRealAccount } from "../lib/use-real-account";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard — Aurevia Bank" },
      {
        name: "description",
        content: "Manage your Aurevia Bank accounts and transactions.",
      },
      { property: "og:title", content: "Dashboard — Aurevia Bank" },
      {
        property: "og:description",
        content: "View balances and account activity at Aurevia Bank.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardLayout,
});

const nav = [
{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, exact: true },
{ label: "Accounts", to: "/dashboard/accounts", icon: Wallet },
{ label: "Cards", to: "/dashboard/cards", icon: CreditCard },
{ label: "Transactions", to: "/dashboard/transactions", icon: List },
{ label: "Settings", to: "/dashboard/settings", icon: Settings },
// { label: "Support", to: "/faq", icon: Headphones },
] as const;



type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "account" | "security" | "transfer";
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Welcome to Aurevia",
    message:
      "Welcome aboard! Your Aurevia dashboard is ready for you to explore.",
    time: "Just now",
    read: false,
    type: "account",
  },
  {
    id: 2,
    title: "Account security",
    message:
      "Remember to keep your sign-in details private and secure.",
    time: "2 hours ago",
    read: false,
    type: "security",
  },
  {
    id: 3,
    title: "Explore your dashboard",
    message:
      "You can review your account activity and manage your banking preferences here.",
    time: "Yesterday",
    read: true,
    type: "account",
  },
];

function Sidebar({
  user,
  onNav,
}: {
  user: DemoUser;
  onNav?: () => void;
}) {
  const navigate = useNavigate();
  const { account } = useRealAccount();

  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const token = localStorage.getItem("aurevia_api_token");

      if (!token) return;

      try {
        const data = await apiRequest<{
          profile: {
            name: string;
            email: string;
          };
        }>("/profile", {
          method: "GET",
          token,
        });

        if (active) {
          setProfileName(data.profile.name);
          setProfileEmail(data.profile.email);
        }
      } catch {
        // Keep the existing sidebar details if loading fails.
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-sidebar p-5 text-sidebar-foreground">
      {/* Customer profile */}
      <div className="flex items-center gap-3 border-b border-sidebar-border pb-6">
        <ProfileAvatar
          email={profileEmail}
          name={profileName}
          size="lg"
          editable
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {profileName}
          </p>

          <p className="mt-1 text-xs text-sidebar-foreground/70">
            Account Number <br />
            {account?.account_number ?? "••••"}
          </p>
        </div>
      </div>

      <nav
        aria-label="Dashboard"
        className="mt-8 flex flex-col gap-1"
      >
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNav}
            activeOptions={{ exact: "exact" in n }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{
              className:
                "bg-sidebar-accent text-sidebar-accent-foreground",
            }}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => {
          demoAuth.clear();
          localStorage.removeItem("aurevia_api_token");
          navigate({ to: "/auth/login" });
          onNav?.();
        }}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sidebar-accent"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState<DemoUser | null>(null);
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    const u = demoAuth.get();

    if (!u) {
      navigate({ to: "/auth/login" });
    } else {
      store.ensure(u.email, u.name);
      setUser(u);
    }
  }, [navigate]);

  useEffect(() => {
    if (!open && !notificationsOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, notificationsOpen]);

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Desktop sidebar remains visible */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <Sidebar user={user} />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 h-full w-full bg-navy/50"
            onClick={() => setOpen(false)}
          />

          <aside className="relative h-full w-64">
            <Sidebar user={user} onNav={() => setOpen(false)} />
          </aside>

          <button
            type="button"
            className="absolute right-4 top-4 text-navy-foreground"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          {/* Search */}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              aria-label="Search"
              placeholder="Search…"
              className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <ThemeToggle />

          {/* Notifications button */}
          <button
            type="button"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setOpen(false);
            }}
            className={cn(
              "relative shrink-0 rounded-full p-2 transition-colors hover:bg-muted",
              notificationsOpen && "bg-muted",
            )}
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />

                <span className="sr-only">
                  {unreadCount} unread notifications
                </span>
              </>
            )}
          </button>

          {/* Profile initials: opens the mobile sidebar */}
          <button
            type="button"
            aria-label="Open navigation menu"
            title="Open menu"
            onClick={() => {
              setOpen(true);
              setNotificationsOpen(false);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-80"
          >
            {user.name.slice(0, 1).toUpperCase()}
          </button>
        </header>

        {/* Notifications panel */}
        {notificationsOpen && (
          <div className="fixed inset-0 z-40">
            {/* Click outside to close */}
            <button
              type="button"
              aria-label="Close notifications"
              className="absolute inset-0 h-full w-full bg-black/20 sm:bg-transparent"
              onClick={() => setNotificationsOpen(false)}
            />

            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="notifications-title"
              className="absolute inset-0 flex flex-col overflow-hidden border-border bg-background shadow-xl sm:inset-auto sm:right-4 sm:top-16 sm:max-h-[calc(100vh-5rem)] sm:w-[380px] sm:rounded-2xl sm:border"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2
                    id="notifications-title"
                    className="text-lg font-semibold"
                  >
                    Notifications
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {unreadCount === 0
                      ? "You're all caught up"
                      : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded-full p-2 transition-colors hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <div className="flex justify-end border-b border-border px-5 py-3">
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 text-xs font-medium text-primary hover:opacity-75"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all as read
                  </button>
                </div>
              )}

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-3 border-b border-border px-5 py-4 transition-colors",
                        notification.read
                          ? "bg-background"
                          : "bg-primary/[0.04]",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                          notification.type === "security"
                            ? "bg-amber-500/10 text-amber-600"
                            : notification.type === "transfer"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-primary/10 text-primary",
                        )}
                      >
                        {notification.type === "security" ? (
                          <Settings className="h-4 w-4" />
                        ) : notification.type === "transfer" ? (
                          <ArrowLeftRight className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold">
                            {notification.title}
                          </h3>

                          {!notification.read && (
                            <span
                              aria-label="Unread"
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                            />
                          )}
                        </div>

                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {notification.message}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>

                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
                              className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:opacity-75"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-muted">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <h3 className="mt-4 font-semibold">
                      You're all caught up
                    </h3>

                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                      When there are new updates about your account, they'll
                      appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Panel footer */}
              <div className="border-t border-border px-5 py-3">
                <p className="text-center text-xs text-muted-foreground">
                  Aurevia Bank · Account updates
                </p>
              </div>
            </section>
          </div>
        )}

        <main className={cn("flex-1 p-4 md:p-8")}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}