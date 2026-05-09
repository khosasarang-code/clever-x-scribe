import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — SmartReply AI X" },
      {
        name: "description",
        content:
          "Simple pricing for SmartReply AI X. Start free with 10 generations a day, or go Pro for unlimited replies and viral threads.",
      },
      { property: "og:title", content: "Pricing — SmartReply AI X" },
      {
        property: "og:description",
        content: "Free 10/day or Pro $19/mo unlimited.",
      },
    ],
  }),
});

type Tier = {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  cta: string;
  highlight?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Perfect for trying it out and casual posting.",
    cta: "Get started",
    features: [
      "10 generations / day",
      "Smart replies (9 per tweet)",
      "Viral thread builder",
      "All 5 tone presets",
      "Local history",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    blurb: "For creators who post every day and want unlimited firepower.",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "Unlimited generations",
      "Priority AI model",
      "Longer threads (up to 15 tweets)",
      "Saved tone profiles",
      "Cloud-synced history",
      "Early access to new features",
    ],
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-30 bg-background/70">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow)]">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="font-semibold tracking-tight">
              SmartReply <span className="text-muted-foreground">AI X</span>
            </div>
          </Link>
          <Button asChild size="sm" variant="ghost">
            <Link to="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Simple, <span className="text-gradient-brand">honest pricing.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you're ready to post like a machine.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={
                "p-6 flex flex-col gap-5 relative " +
                (tier.highlight
                  ? "border-primary/50 shadow-[var(--shadow-glow)]"
                  : "")
              }
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-6 text-[10px] font-semibold tracking-wider uppercase bg-gradient-brand text-primary-foreground px-2 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{tier.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{tier.blurb}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.cadence}</span>
              </div>
              <ul className="space-y-2.5 text-sm flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={
                  tier.highlight
                    ? "bg-gradient-brand text-primary-foreground hover:opacity-90"
                    : ""
                }
                variant={tier.highlight ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
            </Card>
          ))}
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime. No hidden fees.
        </p>
      </main>

      <footer className="border-t border-border/60 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
          Made with <span className="text-red-400">❤️</span> using Lovable
        </div>
      </footer>
    </div>
  );
}
