
import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Terms of Service — Aurevia Bank" },
      {
        name: "description",
        content:
          "Review the terms and conditions governing access to and use of Aurevia Bank's website and services.",
      },
      { property: "og:title", content: "Terms of Service — Aurevia Bank" },
      {
        property: "og:description",
        content:
          "Learn about account responsibilities, permitted use, transactions, security, and other terms governing Aurevia Bank services.",
      },
    ],
  }),

  component: () => (
    <LegalPage
      title="Terms of Service"
      sections={[
        [
          "Acceptance of Terms",
          "These Terms of Service govern your access to and use of the Aurevia Bank website and the services made available through it. By accessing or using our website, you acknowledge that you have read and understood these Terms. If you do not agree with them, you should discontinue use of the relevant services. Additional terms may apply to specific products or services where applicable.",
        ],
        [
          "Eligibility and Registration",
          "Certain services may require you to create an account and satisfy applicable eligibility requirements. You agree to provide accurate, complete, and current information when registering and to update that information when necessary. We may request additional information to verify identity, protect account security, or satisfy applicable legal requirements.",
        ],
        [
          "Account Security",
          "You are responsible for taking reasonable steps to protect your account credentials and prevent unauthorized access. Do not share passwords, one-time verification codes, or other authentication details with unauthorized persons. If you suspect that your account has been compromised, report the issue through the appropriate customer support channel as soon as possible.",
        ],
        [
          "Use of Banking Services",
          "Subject to eligibility and availability, services may include account management, balance information, transaction history, deposits, withdrawals, transfers, cards, and other financial features. Individual services may be subject to separate agreements, eligibility conditions, transaction limits, fees, and verification requirements. The availability of a feature on the website does not, by itself, guarantee that the service is operational.",
        ],
        [
          "Deposits and Payments",
          "Deposits and payments are subject to applicable processing, verification, and authorization requirements. A submitted payment instruction or displayed confirmation does not independently establish that funds have been received or settled. Where payment services are available, processing times may depend on the payment method, participating institutions, verification requirements, and circumstances outside our control.",
        ],
        [
          "Withdrawals and Transfers",
          "Withdrawal requests and transfers are subject to available funds, account status, transaction limits, verification procedures, and applicable processing requirements. Certain requests may require administrative review before processing. A request marked Pending has not necessarily been approved or completed. A transaction should be considered complete only when the relevant processing steps have been successfully completed and the outcome confirmed.",
        ],
        [
          "Fees and Transaction Limits",
          "Applicable fees, charges, and transaction limits will be disclosed in connection with the relevant service, as required by applicable law. Some transactions may be subject to limits imposed for security, operational, regulatory, or risk-management reasons. Any changes to applicable fees or limits will be handled in accordance with relevant agreements and legal requirements.",
        ],
        [
          "Prohibited Activities",
          "You must not use the website or its services for fraud, unlawful activities, unauthorized transactions, impersonation, or any activity that violates applicable law. You must not attempt to gain unauthorized access to accounts or administrative functions, interfere with website operations, bypass security controls, introduce malicious software, or misuse another person's information. Violations may result in access restrictions or other appropriate action.",
        ],
        [
          "Monitoring and Compliance",
          "Where applicable, account activity and transactions may be reviewed to protect customers, detect suspicious activity, prevent fraud, maintain security, and meet legal or regulatory obligations. Additional information may be requested when necessary to verify a transaction or account. Restrictions or delays may apply where required or permitted by law.",
        ],
        [
          "Privacy and Personal Information",
          "Our collection and handling of personal information are described in our Privacy Policy. By using the relevant services, you acknowledge that information may be processed for account administration, service delivery, security, customer support, and other lawful purposes described in that policy.",
        ],
        [
          "Website Availability",
          "We aim to maintain a reliable website, but uninterrupted access cannot be guaranteed. Access may be affected by maintenance, technical issues, network interruptions, security incidents, or other circumstances. Website features may be modified, suspended, or discontinued as necessary, subject to applicable legal and contractual obligations.",
        ],
        [
          "Electronic Communications",
          "Where available and permitted by law, electronic communications may be used to provide service notices, account notifications, transaction updates, statements, and policy changes. You are responsible for keeping your contact information current and reviewing important communications relating to your account.",
        ],
        [
          "Intellectual Property",
          "The Aurevia Bank name, branding, website design, text, graphics, and other original content are owned by or used under authorization by the relevant rights holders. You may not reproduce, distribute, modify, or commercially exploit protected materials without appropriate permission, except as permitted by applicable law.",
        ],
        [
          "Third-Party Services",
          "The website may contain links to external websites or rely on third-party services. Such services may be governed by their own terms and privacy policies. Where applicable, users should review those terms before using the relevant third-party service. The inclusion of a link does not necessarily indicate endorsement or a formal partnership.",
        ],
        [
          "Disclaimer",
          "To the extent permitted by applicable law, the website and its information are provided on an as-available basis. We do not guarantee uninterrupted access or that all features will always operate without errors. General website information does not constitute personalized financial, investment, tax, or legal advice. Nothing in these Terms removes any rights or protections that cannot lawfully be excluded.",
        ],
        [
          "Limitation of Liability",
          "To the extent permitted by applicable law, liability for indirect or consequential losses arising from the use of the website may be limited. Nothing in these Terms excludes or limits liability where such exclusion or limitation would be unlawful. Any additional terms applicable to an operational financial product must be consistent with its governing agreement and applicable law.",
        ],
        [
          "Suspension and Termination",
          "Access to an account or service may be restricted, suspended, or terminated where permitted by law, including when necessary to address suspected fraud, security risks, violations of these Terms, or legal requirements. Where applicable, account closure and suspension procedures will be subject to relevant agreements and legal obligations.",
        ],
        [
          "Changes to These Terms",
          "We may revise these Terms to reflect changes in our services, website functionality, business operations, or legal obligations. Updated terms will be published on this page with a revised effective date. Where required by law, appropriate notice or consent will be provided before changes take effect.",
        ],
        [
          "Governing Law",
          "These Terms are subject to applicable law and any mandatory consumer protections that apply to the relevant services. The governing law and dispute-resolution arrangements for a specific financial product may be described in its separate customer agreement.",
        ],
        [
          "Contact Us",
          "If you have questions about these Terms or need assistance, please contact Aurevia Bank through the official Contact page on our website.",
        ],
      ]}
    />
  ),
});

