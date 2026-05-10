import { ShieldCheck, Lock, CreditCard, Zap, Twitter } from "lucide-react";

/**
 * Compact trust strip: security/payment badges + recognizable icons.
 * Reads as a quiet, "venture-backed SaaS" reassurance bar.
 */
export function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "SOC-2 aligned" },
    { icon: Lock, label: "256-bit SSL" },
    { icon: CreditCard, label: "Secure checkout by Paddle" },
    { icon: Zap, label: "99.9% uptime" },
    { icon: Twitter, label: "Built for X" },
  ];
  return (
    <div className="border-y border-border/40 bg-card/20 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs sm:text-sm text-muted-foreground">
          {items.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary/80" />
              <span className="font-medium tracking-tight">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
