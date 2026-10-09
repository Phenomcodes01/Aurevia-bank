import { SiteLayout } from "./SiteLayout";
import { PageHero } from "./primitives";

export function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <SiteLayout>
      <PageHero eyebrow="Legal" title={title} subtitle="Last updated October 1, 2026" />
      <article className="mx-auto max-w-3xl px-6 pb-24">
        {sections.map(([h, p], i) => (
          <section key={h} className="mb-10">
            <h2 className="text-xl font-semibold">{i + 1}. {h}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{p}</p>
          </section>
        ))}
      </article>
    </SiteLayout>
  );
}
