import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
  head: () => ({
    meta: [
      { title: "Refund Policy — SmartReply AI X" },
      { name: "description", content: "30-day money-back guarantee. How to request a refund for SmartReply AI X via Paddle." },
    ],
  }),
});

function RefundPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back home
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Refund Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
        <section>
          <p>
            SmartReply AI X is provided by <strong>Sarang Khosa</strong>. We want you to be happy
            with your purchase.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">30-day money-back guarantee</h2>
          <p>
            If you are not satisfied with your subscription, you can request a full refund within{" "}
            <strong>30 days</strong> of your order date. This applies to your initial purchase and
            to subsequent renewal charges, on a per-charge basis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">How to request a refund</h2>
          <p>
            All payments for SmartReply AI X are processed by our Merchant of Record,{" "}
            <a className="text-primary underline" href="https://www.paddle.com" target="_blank" rel="noopener noreferrer">
              Paddle.com
            </a>
            . Refunds are issued by Paddle under their{" "}
            <a className="text-primary underline" href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer">
              Refund Policy
            </a>
            .
          </p>
          <p className="mt-2">To request a refund, you can either:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              Visit{" "}
              <a className="text-primary underline" href="https://paddle.net" target="_blank" rel="noopener noreferrer">
                paddle.net
              </a>{" "}
              (or the link in your Paddle receipt email) and submit a refund request directly to
              Paddle, or
            </li>
            <li>
              Email us at{" "}
              <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
                hello@smartreplyaix.com
              </a>{" "}
              and we will help you process the refund through Paddle.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Cancellations</h2>
          <p>
            You can cancel your subscription at any time from your account or via the Paddle
            customer portal linked in your receipt. Cancellation stops future renewals; access
            continues until the end of the current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Contact</h2>
          <p>
            Questions about refunds or billing?{" "}
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
