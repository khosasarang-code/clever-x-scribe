import { ClipboardPaste, Wand2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "Paste a tweet",
    desc: "Drop any tweet, link, or your own thread idea. No setup, no signup needed to try.",
  },
  {
    icon: Wand2,
    title: "Pick a tone & voice",
    desc: "Choose Witty, Bold, Savage, Salesy — or reply like @naval, @levelsio, or in your own style.",
  },
  {
    icon: Send,
    title: "Copy & post",
    desc: "Get 9 ready-to-ship replies in seconds. Tap to copy, paste on X, watch engagement climb.",
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          How it <span className="text-gradient-brand">works</span>
        </h2>
        <p className="text-base text-muted-foreground">
          From blank cursor to viral reply in under 10 seconds.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 relative">
        {/* Connecting line on desktop */}
        <div className="hidden sm:block absolute top-12 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

        {STEPS.map((s, i) => (
          <Card
            key={s.title}
            className="relative p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur border-border/60 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow-sm)]"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow-sm)]">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border border-primary/40 grid place-items-center text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
