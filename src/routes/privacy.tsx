
import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Privacy Policy — Aurevia Bank" },
      {
        name: "description",
        content:
          "Learn how Aurevia Bank collects, uses, protects, and manages personal information.",
      },
      { property: "og:title", content: "Privacy Policy — Aurevia Bank" },
      {
        property: "og:description",
        content:
          "Aurevia Bank's privacy policy explains our approach to personal information and data protection.",
      },
    ],
  }),

  component: () => (
    <LegalPage
      title="Privacy Policy"
      sections={[
        [
          "Introduction",
          "At Aurevia Bank, protecting your privacy and maintaining the confidentiality of your personal information are important to us. This Privacy Policy explains how information may be collected, used, stored, and disclosed when you visit our website or use our services. We are committed to handling personal information responsibly and in accordance with applicable data protection laws.",
        ],
        [
          "Information We Collect",
          "Depending on the services you use, we may collect personal information such as your full name, email address, telephone number, residential address, date of birth, and account registration details. Where applicable, we may also collect identity verification information, account details, transaction records, payment information, and communications submitted through our customer support channels. Technical information, including browser type, device information, IP address, and website usage data, may also be collected to support website functionality and security.",
        ],
        [
          "How We Use Your Information",
          "We may use personal information to establish and manage accounts, verify identities, authenticate users, process authorized transactions, provide customer support, communicate important account information, maintain website security, detect and prevent fraud, improve our services, and comply with applicable legal and regulatory obligations. Information will be used for purposes reasonably related to the services provided and as otherwise permitted by law.",
        ],
        [
          "Information Sharing and Disclosure",
          "Aurevia Bank does not intend to sell personal information to third parties. Where necessary, information may be shared with authorized service providers, technology partners, payment processors, financial institutions, professional advisers, or regulatory and law enforcement authorities where required or permitted by applicable law. We expect service providers handling information on our behalf to apply appropriate safeguards and use that information only for authorized purposes.",
        ],
        [
          "Data Security",
          "We recognize the importance of protecting personal information against unauthorized access, loss, misuse, alteration, or disclosure. Appropriate administrative, technical, and organizational safeguards should be maintained to protect information handled through our services. No electronic transmission or storage system can be guaranteed to be completely secure. Users should protect their passwords and verification codes and should never disclose sensitive banking credentials through unverified channels.",
        ],
        [
          "Data Retention",
          "Personal information may be retained for as long as reasonably necessary to provide services, maintain account records, resolve disputes, prevent fraud, enforce applicable agreements, and meet legal or regulatory obligations. Financial and transaction records may be subject to specific retention requirements. When information is no longer required, appropriate deletion or anonymization procedures should be applied, subject to applicable law.",
        ],
        [
          "Your Privacy Rights",
          "Depending on your location and applicable law, you may have the right to request access to personal information, correct inaccurate information, request deletion where legally permitted, object to certain processing, request restrictions on processing, or withdraw consent where processing is based on consent. You may also have the right to request a copy of certain information or lodge a complaint with the relevant data protection authority. Identity verification may be required before a request is processed.",
        ],
        [
          "Cookies and Browser Storage",
          "Our website may use cookies, browser storage, and similar technologies to maintain sessions, remember preferences, support account functionality, and improve the user experience. The information stored depends on the features you use. You may manage cookies through your browser settings, although disabling certain technologies may affect website functionality.",
        ],
        [
          "Third-Party Services and Websites",
          "Our website may use third-party services or contain links to external websites. These services may process information in accordance with their own privacy policies and practices. We encourage users to review the relevant privacy notices before submitting information to third parties. Our website may also load resources, such as web fonts, from external providers.",
        ],
        [
          "Children's Privacy",
          "Our services are not intended to collect personal information from children in violation of applicable law. Where we become aware that personal information has been collected unlawfully from a child, appropriate steps will be taken to address the matter in accordance with applicable requirements.",
        ],
        [
          "International Data Transfers",
          "Where personal information is processed or stored outside your country of residence, appropriate safeguards should be applied to any international transfer as required by applicable data protection law. The locations and safeguards involved may depend on the service providers and infrastructure used.",
        ],
        [
          "Changes to This Privacy Policy",
          "We may update this Privacy Policy to reflect changes in our services, technology, data handling practices, or legal obligations. Any revised policy will be published on this page with an updated effective date. Where required by law, additional notice or consent will be provided before relevant changes take effect.",
        ],
        [
          "Contact Us",
          "If you have questions about this Privacy Policy or wish to make a privacy-related request, please contact us through the official Contact page on the Aurevia Bank website.",
        ],
      ]}
    />
  ),
});

