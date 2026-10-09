import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Terms of Service — Aurevia Bank" },
      { name: "description", content: "Terms of use for the Aurevia Bank website." },
      { property: "og:title", content: "Terms of Service — Aurevia Bank" },
      { property: "og:description", content: "Website terms of use for Aurevia Bank." },
    ],
  }),
  component: () => (
    <LegalPage title="Terms of Service" sections={[
      ["Acceptance of Terms", "By using this website, you agree to these terms of use."],
      ["Accounts", "Account information, balances and activity are stored in this browser."],
      ["Prohibited Use", "Do not submit real banking credentials, card numbers, PINs, government identifiers or other sensitive personal data."],
      ["No Financial Advice", "Content including rates and calculators is illustrative and must not be relied on for financial decisions."],
      ["Intellectual Property", "The Aurevia Bank name, design and website content may not be reproduced without permission."],
      ["Limitation of Liability", "This website is provided as-is without warranties of any kind."],
      ["Changes", "These terms may be updated at any time."],
    ]} />
  ),
});
