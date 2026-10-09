import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Privacy Policy — Aurevia Bank" },
      { name: "description", content: "How Aurevia Bank handles information on this website." },
      { property: "og:title", content: "Privacy Policy — Aurevia Bank" },
      { property: "og:description", content: "Information handling and privacy at Aurevia Bank." },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy" sections={[
      ["Information We Collect", "The name and email entered at sign-in are stored locally in your browser."],
      ["How We Use Information", "Stored account information personalizes the dashboard greeting. It is not sent to any server."],
      ["Information Sharing", "Locally stored account information is not sold or shared by this website."],
      ["Data Security", "Account information can be removed by signing out or clearing your browser storage. Do not share passwords, PINs or card details."],
      ["Your Rights", "You may clear your locally stored information at any time."],
      ["Cookies", "This website uses browser storage for your session."],
      ["Third-Party Services", "Web fonts are loaded from a third-party font provider."],
      ["Children's Privacy", "This website is not directed at children."],
      ["Policy Changes", "This policy may change without notice."],
      ["Contact", "Questions can be sent via the Contact page."],
    ]} />
  ),
});
