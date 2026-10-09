import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero, Reveal, Section } from "@/components/site/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Frequently Asked Questions — Aurevia Bank" },
      { name: "description", content: "Answers about Aurevia Bank accounts, deposits, withdrawals and referrals." },
      { property: "og:title", content: "FAQ — Aurevia Bank" },
      { property: "og:description", content: "Find quick answers to common Aurevia Bank questions." },
    ],
  }),
  component: Faq,
});

const faqs: Record<string, [string, string][]> = {
  "About Us": [
    ["What can I find on Aurevia Bank's website?", "Explore personal and business accounts, cards, financing and financial tools."],
    ["How do I contact Aurevia Bank?", "Visit the Contact page for customer, business and technical support."],
  ],
  "My Account": [
    ["How do I open an account?", "Select Get Started and complete the registration form."],
    ["How do I reset my password?", "Password reset is not available yet."],
    ["Can I view multiple accounts?", "Your dashboard includes checking, savings and investment accounts."],
  ],
  Deposits: [
    ["Where do I view my balance?", "Your dashboard and Accounts page show your balances."],
    ["Is mobile check deposit available?", "The mobile app is not available for download yet."],
  ],
  Withdrawals: [
    ["Where do I review transfers?", "Open the Transfers page in your dashboard."],
    ["Where are card spending limits?", "Visit the Cards page to view your spending limit settings."],
  ],
  "Referral Program": [
    ["Is there a referral bonus?", "No referral rewards are currently available."],
  ],
  "Additional Questions": [
    ["How should I protect my account information?", "Never share passwords, PINs, card numbers or personal identifiers."],
    ["Is my data stored?", "Sign-in information is stored in your browser and can be cleared by signing out."],
  ],
};

function Faq() {
  const cats = Object.keys(faqs);
  return (
    <SiteLayout>
      <PageHero eyebrow="Help" title="Frequently Asked Questions" subtitle="Quick answers to common questions about Aurevia Bank." />
      <Section className="pt-6">
        <Tabs defaultValue={cats[0] ?? "About Us"} className="mx-auto max-w-3xl">
          <TabsList className="flex h-auto flex-wrap justify-center gap-1 rounded-2xl bg-muted p-1.5">
            {cats.map((c) => <TabsTrigger key={c} value={c} className="rounded-xl px-4 py-2">{c}</TabsTrigger>)}
          </TabsList>
          {cats.map((c) => (
            <TabsContent key={c} value={c} className="mt-8">
              <Accordion type="single" collapsible className="card-surface px-6">
                {(faqs[c] ?? []).map(([q, a], i) => (
                  <AccordionItem key={q} value={`${i}`} className="last:border-0">
                    <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
        <Reveal className="mx-auto mt-16 max-w-3xl rounded-3xl bg-gradient-navy p-10 text-center text-navy-foreground">
          <h2 className="text-2xl font-semibold">Can't Find What You're Looking For?</h2>
          <p className="mt-2 text-navy-foreground/70">Our support team is happy to help.</p>
          <Button asChild variant="hero" size="xl" className="mt-6"><Link to="/contact">Contact Support</Link></Button>
        </Reveal>
      </Section>
    </SiteLayout>
  );
}
