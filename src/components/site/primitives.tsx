import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoA from "@/assets/aurevia-a-logo.png";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Aurevia Bank home">
      <img
        src="/favicon.ico"
        alt="Aurevia Bank logo"
        className="h-9 w-auto rounded-xl object-contain -translate-y-1"
      />

      <span
        className={cn(
          "font-display text-xl font-semibold tracking-tight",
          light ? "text-navy-foreground" : "text-foreground"
        )}
      >
        Aurevia<span className="text-primary">Bank</span>
      </span>
    </Link>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.8, ease: "easeOut", onUpdate: setN });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center = true, light = false }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean; light?: boolean }) {
  return (
    <Reveal className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest", light ? "glass-dark text-navy-foreground" : "bg-accent text-accent-foreground")}>
          {eyebrow}
        </span>
      )}
      <h2 className={cn("mt-4 text-3xl font-semibold md:text-5xl", light ? "text-navy-foreground" : "text-foreground")}>{title}</h2>
      {subtitle && <p className={cn("mt-4 text-lg", light ? "text-navy-foreground/70" : "text-muted-foreground")}>{subtitle}</p>}
    </Reveal>
  );
}

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-gradient-soft pb-20 pt-36">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-foreground">{eyebrow}</span>
          <h1 className="mt-5 text-4xl font-semibold md:text-6xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
          {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export function FeatureCard({ icon: Icon, title, description, features, cta = "Learn More", meta, to = "/auth/register", delay = 0 }: {
  icon: LucideIcon; title: string; description?: string; features?: string[]; cta?: string; meta?: { label: string; value: string }[]; to?: string; delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="card-surface group flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-5 text-xl font-semibold">{title}</h3>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
        {meta && (
          <dl className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-muted p-3 text-center">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.label}</dt>
                <dd className="mt-1 text-sm font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {features && (
          <ul className="mt-5 space-y-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {f}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-6">
          <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export function StepList({ steps }: { steps: { title: string; text?: string }[] }) {
  return (
    <ol className="relative grid gap-6 md:grid-cols-4">
      <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-primary opacity-30 md:block" aria-hidden />
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.1}>
          <li className="relative text-center">
            <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-primary font-display text-lg font-semibold text-primary-foreground shadow-elegant">{i + 1}</span>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            {s.text && <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>}
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function CTASection({ title = "Ready to Join Aurevia Bank?", subtitle = "Open an account and explore the full digital banking experience.", cta = "Open an Account", secondary }: { title?: string; subtitle?: string; cta?: string; secondary?: { label: string; to: string } }) {
  return (
    <section className="px-6 py-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-navy px-8 py-16 text-center md:px-16 md:py-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" aria-hidden />
        <h2 className="relative text-3xl font-semibold text-navy-foreground md:text-5xl">{title}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-navy-foreground/70">{subtitle}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="xl"><Link to="/auth/register">{cta} <ArrowRight /></Link></Button>
          {secondary && <Button asChild variant="glass" size="xl"><Link to={secondary.to}>{secondary.label}</Link></Button>}
        </div>
      </Reveal>
    </section>
  );
}

export function BankingCard({
  tone = "navy",
  name = "Alex Morgan",
  last4 = "4582",
  label = "Aurevia Bank Debit",
  className,
  cardNumber,
  expiry,
  cvv,
  showFullNumber = false,
  showExpiry = false,
  showCvv = false,
  onToggleNumber,
  onToggleExpiry,
  onToggleCvv,
  onCopyCardNumber,
  copied = false,
}: {
  tone?: "navy" | "primary" | "glass";
  name?: string;
  last4?: string;
  label?: string;
  className?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  showFullNumber?: boolean;
  showExpiry?: boolean;
  showCvv?: boolean;
  onToggleNumber?: () => void;
  onToggleExpiry?: () => void;
  onToggleCvv?: () => void;
  onCopyCardNumber?: () => void;
  copied?: boolean;
}) {
  const bg =
    tone === "navy"
      ? "bg-gradient-navy"
      : tone === "primary"
        ? "bg-gradient-primary"
        : "bg-navy";

  const displayedNumber = cardNumber
    ? showFullNumber
      ? cardNumber
      : `•••• •••• •••• ${last4}`
    : `•••• •••• •••• ${last4}`;

  const hasCardActions =
    Boolean(onToggleNumber) ||
    Boolean(onToggleExpiry) ||
    Boolean(onToggleCvv) ||
    Boolean(onCopyCardNumber);

  return (
    <div
      className={cn(
        "relative aspect-[1.586] w-full overflow-hidden rounded-3xl p-5 text-navy-foreground shadow-elegant transition-transform duration-500 hover:-translate-y-1 hover:rotate-[-1deg] sm:p-6",
        bg,
        className,
      )}
    >
      <div
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-navy-foreground/10"
        aria-hidden
      />

      <div
        className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-navy-foreground/5"
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className="font-display text-sm font-semibold tracking-wide">
            {label}
          </span>

          <span className="shrink-0 text-xs font-semibold tracking-widest opacity-80">
            AUREVIA
          </span>
        </div>

        <div
          className="h-8 w-11 rounded-md border border-navy-foreground/20 bg-gradient-to-br from-navy-foreground/50 to-navy-foreground/20"
          aria-hidden
        />

        <div className="min-w-0">
          <p
            className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-base tracking-wider sm:text-lg sm:tracking-[0.12em]"
            aria-label={
              cardNumber && !showFullNumber
                ? `Card number ending in ${last4}`
                : undefined
            }
          >
            {displayedNumber}
          </p>

          {hasCardActions && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold sm:text-xs">
              {onToggleNumber && (
                <button
                  type="button"
                  onClick={onToggleNumber}
                  className="underline underline-offset-2 hover:opacity-75"
                >
                  {showFullNumber ? "Hide number" : "Show number"}
                </button>
              )}

              {onCopyCardNumber && (
                <button
                  type="button"
                  onClick={onCopyCardNumber}
                  className="underline underline-offset-2 hover:opacity-75"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
          )}

          <div className="mt-3 flex items-end justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] uppercase tracking-widest opacity-70">
                Cardholder
              </p>

              <p className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold uppercase">
                {name}
              </p>
            </div>

            <div className="flex shrink-0 items-end gap-4 text-right">
              <div>
                <p className="mb-1 text-[9px] uppercase tracking-widest opacity-70">
                  Expires
                </p>

                <p className="font-mono font-semibold">
                  {expiry && showExpiry ? expiry : "••/••"}
                </p>

                {onToggleExpiry && (
                  <button
                    type="button"
                    onClick={onToggleExpiry}
                    className="mt-1 text-[10px] underline underline-offset-2 hover:opacity-75"
                  >
                    {showExpiry ? "Hide" : "Show"}
                  </button>
                )}
              </div>

              {cvv !== undefined && (
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-widest opacity-70">
                    CVV
                  </p>

                  <p className="font-mono font-semibold">
                    {showCvv ? cvv : "•••"}
                  </p>

                  {onToggleCvv && (
                    <button
                      type="button"
                      onClick={onToggleCvv}
                      className="mt-1 text-[10px] underline underline-offset-2 hover:opacity-75"
                    >
                      {showCvv ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={cn("px-6 py-24", className)}><div className="mx-auto max-w-7xl">{children}</div></section>;
}

