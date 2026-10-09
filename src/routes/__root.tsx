import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { themeInitScript } from "@/lib/theme";
import { ChatWidget } from "@/components/support/ChatWidget";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function GTranslateWidget() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Create GTranslate's wrapper.
    let wrapper = document.querySelector<HTMLElement>(
      ".gtranslate_wrapper"
    );

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "gtranslate_wrapper";
      document.body.appendChild(wrapper);
    }

    window.gtranslateSettings = {
      default_language: "en",
      wrapper_selector: ".gtranslate_wrapper",
      switcher_horizontal_position: "right",
      flag_style: "3d",
    };

    // Load GTranslate only once.
    let script = document.querySelector<HTMLScriptElement>(
      'script[src*="cdn.gtranslate.net/widgets/latest/float.js"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
      script.defer = true;
      document.body.appendChild(script);
    }

    let widget: HTMLElement | null = null;
    let observer: MutationObserver | null = null;
    let pollTimer: number | undefined;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const savedPosition = localStorage.getItem(
      "aurevia-translator-position"
    );

    const applyPosition = (element: HTMLElement) => {
      element.style.setProperty("position", "fixed", "important");
      element.style.setProperty("right", "auto", "important");
      element.style.setProperty("bottom", "auto", "important");
      element.style.setProperty("z-index", "9998", "important");
      element.style.setProperty("cursor", "grab", "important");
      element.style.setProperty("touch-action", "none", "important");

      if (savedPosition) {
        try {
          const position = JSON.parse(savedPosition);

          if (
            Number.isFinite(position.left) &&
            Number.isFinite(position.top)
          ) {
            element.style.setProperty(
              "left",
              `${position.left}px`,
              "important"
            );

            element.style.setProperty(
              "top",
              `${position.top}px`,
              "important"
            );

            return;
          }
        } catch {
          // Use the default position.
        }
      }

      // Default position: above the customer service button.
      element.style.setProperty("left", "auto", "important");
      element.style.setProperty("right", "20px", "important");
      element.style.setProperty("top", "auto", "important");
      element.style.setProperty("bottom", "120px", "important");
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!widget) return;

      // Ignore right-clicks.
      if (event.pointerType === "mouse" && event.button !== 0) return;

      // Let users interact normally with the language menu.
      const target = event.target as HTMLElement;

      if (
        target.closest(".gt_options") ||
        target.closest("select") ||
        target.closest("input")
      ) {
        return;
      }

      const rect = widget.getBoundingClientRect();

      startX = event.clientX;
      startY = event.clientY;
      startLeft = rect.left;
      startTop = rect.top;

      dragging = true;
      moved = false;

      widget.style.cursor = "grabbing";

      try {
        widget.setPointerCapture(event.pointerId);
      } catch {
        // Continue if pointer capture isn't available.
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || !widget) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        moved = true;
      }

      if (!moved) return;

      event.preventDefault();

      const maxLeft = Math.max(0, window.innerWidth - widget.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - widget.offsetHeight);

      const left = Math.max(0, Math.min(maxLeft, startLeft + dx));
      const top = Math.max(0, Math.min(maxTop, startTop + dy));

      widget.style.setProperty("left", `${left}px`, "important");
      widget.style.setProperty("top", `${top}px`, "important");
      widget.style.setProperty("right", "auto", "important");
      widget.style.setProperty("bottom", "auto", "important");
    };

    const onPointerUp = () => {
      if (!dragging || !widget) return;

      dragging = false;
      widget.style.cursor = "grab";

      if (moved) {
        const rect = widget.getBoundingClientRect();

        localStorage.setItem(
          "aurevia-translator-position",
          JSON.stringify({
            left: Math.round(rect.left),
            top: Math.round(rect.top),
          })
        );
      }
    };

    const attachToWidget = () => {
      // GTranslate may render its switcher outside the wrapper.
      const found = document.querySelector<HTMLElement>(
        ".gt_float_switcher, .gt_switcher_wrapper"
      );

      if (!found || found === widget) return;

      if (widget) {
        widget.removeEventListener("pointerdown", onPointerDown, true);
      }

      widget = found;
      applyPosition(widget);

      widget.addEventListener("pointerdown", onPointerDown, true);
    };

    observer = new MutationObserver(attachToWidget);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check periodically in case GTranslate loads slowly.
    pollTimer = window.setInterval(attachToWidget, 500);

    attachToWidget();

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      observer?.disconnect();

      if (pollTimer !== undefined) {
        window.clearInterval(pollTimer);
      }

      widget?.removeEventListener("pointerdown", onPointerDown, true);

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      initialized.current = false;
    };
  }, []);

  return null;
}





export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aurevia Bank — Digital Banking" },
      { name: "description", content: "Aurevia Bank brings accounts, cards, savings and financial tools together." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <ChatWidget />
      <GTranslateWidget />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
