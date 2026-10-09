import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Reveal, Section } from "@/components/site/primitives";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Sitemap — Aurevia Bank" },
      { name: "description", content: "Every public and dashboard page on the Aurevia Bank website." },
      { property: "og:title", content: "Sitemap — Aurevia Bank" },
      { property: "og:description", content: "Browse all Aurevia Bank pages." },
    ],
  }),
  component: Sitemap,
});

const groups: [string, [string, string][]][] = [
  ["Main", [["Home", "/"], ["About", "/about"], ["Contact", "/contact"], ["FAQ", "/faq"], ["Mobile App", "/apps"], ["Security", "/security"]]],
  ["Services", [["Personal Banking", "/services/personal"], ["Business Banking", "/services/business"], ["Loans & Credit", "/services/loans"], ["Cards", "/services/cards"], ["Grants & Aid", "/services/grants"]]],
  ["Account", [["Sign In", "/auth/login"], ["Create Account", "/auth/register"]]],
  ["Legal", [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]],
];

function Sitemap() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Navigate" title="Sitemap" />
      <Section className="pt-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(([g, links]) => (
            <Reveal key={g} className="card-surface p-6">
              <h2 className="text-lg font-semibold">{g}</h2>
              <ul className="mt-4 space-y-2">{links.map(([l, to]) => <li key={to}><Link to={to} className="text-sm text-muted-foreground hover:text-primary">{l}</Link></li>)}</ul>
            </Reveal>
          ))}
        </div>
      </Section>
    </SiteLayout>
  );
}
