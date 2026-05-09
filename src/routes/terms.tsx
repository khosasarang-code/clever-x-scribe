import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — SmartReply AI X" },
      { name: "description", content: "Terms of service for using SmartReply AI X." },
    ],
  }),
});

function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back home
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Who you are contracting with</h2>
          <p>
            The SmartReply AI X service ("Service") is provided by <strong>Sarang Khosa</strong>{" "}
            ("Seller", "we", "us"), trading as SmartReply AI X. By creating an account or using
            the Service, you ("User", "you") enter into a binding agreement with Sarang Khosa on
            these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Acceptance of terms</h2>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms and our{" "}
            <Link to="/privacy" className="text-primary underline">Privacy Notice</Link>. If you do
            not agree, do not use the Service. If you are using the Service on behalf of an
            organisation, you represent that you have authority to bind that organisation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">3. The Service</h2>
          <p>
            SmartReply AI X is an AI-powered tool that helps users draft replies, threads, and
            other social content for X (formerly Twitter). The Service is provided on an "as is"
            and "as available" basis. We do not guarantee uninterrupted or error-free operation
            and disclaim all implied warranties to the fullest extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Acceptable use</h2>
          <p>You must not use the Service to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>break the law or infringe anyone's rights, including intellectual property rights;</li>
            <li>generate or distribute spam, harassment, hate speech, deepfakes, or sexual content involving minors;</li>
            <li>attempt to interfere with security, probe, scrape, or reverse-engineer the Service;</li>
            <li>jailbreak the underlying AI models or evade safety filters;</li>
            <li>resell or redistribute the Service or its outputs as your own platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. AI-specific terms</h2>
          <p>
            You are responsible for the prompts you submit, for verifying the accuracy of any
            outputs, and for how you use those outputs. You confirm you have the rights necessary
            to submit any input content. Outputs may be inaccurate, incomplete, or unsuitable for
            regulated professional, medical, legal, or financial advice. You must exercise human
            oversight before relying on or publishing any output.
          </p>
          <p className="mt-2">
            We may remove content, refuse outputs, or suspend accounts that breach these Terms or
            applicable law. Rights-holders may submit takedown requests at{" "}
            <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
              hello@smartreplyaix.com
            </a>
            ; repeat infringers will be terminated.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Intellectual property</h2>
          <p>
            The Service, including all software, models, designs, branding, and documentation, is
            owned by Sarang Khosa or its licensors and is protected by intellectual property laws.
            We grant you a limited, non-exclusive, non-transferable right to use the Service in
            accordance with your subscription plan. You retain rights to your inputs and grant us
            a limited licence to host and process them solely to provide the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Payments and refunds — Paddle as Merchant of Record</h2>
          <p>
            Our order process is conducted by our online reseller{" "}
            <a className="text-primary underline" href="https://www.paddle.com" target="_blank" rel="noopener noreferrer">
              Paddle.com
            </a>
            . Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer
            service inquiries and handles returns. Subscription terms, billing frequency, taxes,
            cancellations, and refunds are governed by{" "}
            <a className="text-primary underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">
              Paddle's Buyer Terms
            </a>
            .
          </p>
          <p className="mt-2">
            For refund requests, please see our{" "}
            <Link to="/refund-policy" className="text-primary underline">Refund Policy</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Account and credentials</h2>
          <p>
            You are responsible for keeping your credentials confidential and for all activity
            under your account. You must provide accurate registration information and keep it up
            to date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">9. Suspension and termination</h2>
          <p>
            We may suspend or terminate your access for material breach of these Terms, non-payment,
            security or fraud risk, or repeated or serious policy violations. You may close your
            account at any time. On termination, your right to use the Service ends; we may delete
            your data after a reasonable export window, subject to legal retention requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">10. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, our aggregate liability for any claim relating
            to the Service is capped at the fees you paid to Paddle for the Service in the 12
            months preceding the claim. We are not liable for indirect, consequential, or special
            damages, including lost profits, data, or goodwill. Nothing in these Terms excludes
            liability that cannot be excluded by law (e.g. fraud, death, or personal injury caused
            by negligence).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">11. Indemnity</h2>
          <p>
            You will indemnify Sarang Khosa against claims arising from your inputs, your use of
            outputs, or your breach of these Terms or applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">12. Governing law</h2>
          <p>
            These Terms are governed by the laws of the seller's jurisdiction. Disputes will be
            resolved in the courts of that jurisdiction, subject to any mandatory consumer rights
            in your country of residence.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">13. Changes</h2>
          <p>
            We may update these Terms from time to time. Material changes will be communicated via
            the Service or by email. Continued use after changes take effect constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">14. Contact</h2>
          <p>
            Questions about these Terms?{" "}
            <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
              hello@smartreplyaix.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
