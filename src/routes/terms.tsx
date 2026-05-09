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
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Terms of Service — SmartReply AI X</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          By using SmartReply AI X, you agree to use the service for lawful purposes only. You are
          responsible for all content you post on X using our generated replies. We reserve the right
          to suspend accounts that abuse the platform.
        </p>
        <p>
          The service is provided "as is" without warranties. We are not liable for engagement
          results. Subscription fees are non-refundable unless required by law.
        </p>
        <p>
          Contact{" "}
          <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
            hello@smartreplyaix.com
          </a>{" "}
          for any disputes.
        </p>
      </div>
    </main>
  );
}
