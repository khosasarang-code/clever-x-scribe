import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Do my replies sound like AI?",
    a: "No. SmartReply is tuned for X — short, punchy, human. Choose from 12 tones (Witty, Bold, Helpful, Savage, Pro…) or mirror a creator's voice with @persona. Most users say they can't tell their own replies from ours.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. You get 10 free generations per day, forever. No credit card. Upgrade to Pro ($19/mo) only when you want unlimited replies and threads.",
  },
  {
    q: "Will this get my X account flagged?",
    a: "No. SmartReply gives you drafts to copy and post manually. We never auto-post or touch your X account. You stay in full control.",
  },
  {
    q: "Can it write full viral threads?",
    a: "Yes. Drop one idea in the Thread Generator and you'll get a structured, hook-first thread engineered for engagement — usually in under 12 seconds.",
  },
  {
    q: "Do you train on my inputs?",
    a: "Never. Your prompts, drafts and history stay yours. We don't train models on your data.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — one click in the billing portal. No questions, no retention games.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <div className="inline-block text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Questions, answered.</h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className={`glow-border rounded-xl border bg-card/50 backdrop-blur-xl transition-all ${
                isOpen ? "border-primary/40" : "border-border/60"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-sm sm:text-base">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 sm:px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
