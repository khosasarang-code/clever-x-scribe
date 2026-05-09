import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — SmartReply AI X" },
      { name: "description", content: "How SmartReply AI X collects, uses, shares, and protects your personal data." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back home
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Privacy Notice</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-2xl font-semibold mb-2">1. Who we are</h2>
          <p>
            This service, SmartReply AI X ("SmartReply", "we", "us"), is operated by{" "}
            <strong>Sarang Khosa</strong> (the "Seller"). Sarang Khosa is the data controller
            responsible for personal data processed in connection with the SmartReply AI X
            service. You can contact us at{" "}
            <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
              hello@smartreplyaix.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">2. Categories of personal data we collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account data:</strong> name, email address, hashed password, authentication identifiers.</li>
            <li><strong>Profile and content data:</strong> tweets and other text you submit, generated replies, saved tone profiles, history.</li>
            <li><strong>Usage and telemetry:</strong> features used, generation counts, timestamps, error logs.</li>
            <li><strong>Device and technical data:</strong> IP address, browser type, device identifiers, operating system.</li>
            <li><strong>Support data:</strong> messages and attachments you send when contacting support.</li>
            <li><strong>Billing data:</strong> handled by our payments provider Paddle (see Section 4); we receive limited transaction metadata such as plan, status, and country.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">3. Purposes and legal bases</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Providing the service</strong> (account creation, generating replies) — performance of a contract.</li>
            <li><strong>Security and fraud prevention</strong> — legitimate interests and legal obligation.</li>
            <li><strong>Product improvement and analytics</strong> — legitimate interests.</li>
            <li><strong>Customer support</strong> — performance of a contract and legitimate interests.</li>
            <li><strong>Marketing communications</strong> — consent (you can withdraw at any time).</li>
            <li><strong>Compliance with legal obligations</strong> — legal obligation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. How we share your data</h2>
          <p>We share personal data with the following categories of recipients:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Paddle.com Market Limited ("Paddle")</strong> — our Merchant of Record and
              payments provider. Paddle handles all checkout, billing, tax, invoicing, refunds,
              and subscription management. See{" "}
              <a className="text-primary underline" href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer">
                Paddle's Privacy Notice
              </a>.
            </li>
            <li><strong>Hosting and infrastructure providers</strong> (cloud hosting, CDN, database).</li>
            <li><strong>AI model providers</strong> who process the prompts you submit to generate replies.</li>
            <li><strong>Analytics and error-monitoring providers.</strong></li>
            <li><strong>Professional advisers</strong> (legal, accounting) where strictly necessary.</li>
            <li><strong>Authorities</strong> where required by law or valid legal process.</li>
          </ul>
          <p className="mt-2">We do not sell your personal data.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. International transfers</h2>
          <p>
            Your data may be processed outside your country of residence, including in the United
            States. Where required, we rely on appropriate safeguards such as Standard Contractual
            Clauses or adequacy decisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Data retention</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account data: kept while your account is active and for up to 24 months after closure.</li>
            <li>Generated content and history: kept while your account is active; deleted on request.</li>
            <li>Billing and tax records: retained by Paddle and by us for up to 7 years to meet legal obligations.</li>
            <li>Logs and telemetry: typically retained for up to 12 months.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Your rights</h2>
          <p>
            Subject to applicable law, you have the right to access, rectify, erase, restrict, or
            object to processing of your personal data; the right to data portability; the right to
            withdraw consent; and the right to lodge a complaint with your local data protection
            authority. To exercise these rights, contact{" "}
            <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
              hello@smartreplyaix.com
            </a>
            . We aim to respond within one month.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Security</h2>
          <p>
            We use appropriate technical and organisational measures including encryption in
            transit, access controls, and regular security reviews. No system is perfectly secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">9. Cookies</h2>
          <p>
            We use essential cookies required for authentication and the service to function, and
            limited analytics cookies to understand usage. You can control non-essential cookies
            via your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">10. Changes to this notice</h2>
          <p>
            We may update this Privacy Notice from time to time. Material changes will be
            communicated via the service or by email.
          </p>
        </section>
      </div>
    </main>
  );
}
