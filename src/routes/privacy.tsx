import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — SmartReply AI X" },
      { name: "description", content: "How SmartReply AI X collects, uses, and protects your data." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back home
      </Link>
      <h1 className="mt-6 text-4xl font-bold tracking-tight">Privacy Policy — SmartReply AI X</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
        <p>
          We collect only the data necessary to provide our service (email address upon signup, and
          tweet content you submit for reply generation). We do not sell your data to third parties.
          Generated replies are not stored beyond your session unless you are logged in. We use
          industry-standard encryption.
        </p>
        <p>
          For questions, contact{" "}
          <a className="text-primary underline" href="mailto:hello@smartreplyaix.com">
            hello@smartreplyaix.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
