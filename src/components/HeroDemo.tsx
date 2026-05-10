import { Sparkles, MessageSquareText, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const TWEET = "Just shipped my SaaS in 2 weeks using AI tools 🚀";
const REPLIES = [
  "Congrats! What was the hardest part — distribution or the actual build?",
  "2 weeks?? Drop the stack, this is the kind of post that makes me jealous 😅",
  "Shipping fast is a superpower. Now the real game begins: getting users.",
];

/**
 * Cinematic hero demo — types the tweet, shows AI thinking, then streams
 * three replies token-by-token. Loops every ~14s. Pauses if user prefers
 * reduced motion.
 */
export function HeroDemo() {
  const [tweetText, setTweetText] = useState("");
  const [phase, setPhase] = useState<"typing" | "thinking" | "streaming" | "done">("typing");
  const [streams, setStreams] = useState<string[]>(["", "", ""]);
  const [tick, setTick] = useState(0);

  // Loop controller
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setTweetText(TWEET);
      setStreams(REPLIES);
      setPhase("done");
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)));

    async function run() {
      while (!cancelled) {
        // reset
        setTweetText("");
        setStreams(["", "", ""]);
        setPhase("typing");

        // type tweet
        for (let i = 1; i <= TWEET.length; i++) {
          if (cancelled) return;
          setTweetText(TWEET.slice(0, i));
          await wait(28);
        }
        await wait(600);

        // thinking
        setPhase("thinking");
        await wait(1100);

        // stream replies in parallel-ish
        setPhase("streaming");
        for (let r = 0; r < REPLIES.length; r++) {
          const text = REPLIES[r];
          const words = text.split(" ");
          for (let w = 1; w <= words.length; w++) {
            if (cancelled) return;
            setStreams((prev) => {
              const next = [...prev];
              next[r] = words.slice(0, w).join(" ");
              return next;
            });
            await wait(55);
          }
          await wait(180);
        }

        setPhase("done");
        await wait(2800);
      }
    }
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  // tiny cursor blink driver
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 480);
    return () => clearInterval(id);
  }, []);
  const caret = tick % 2 === 0 ? "▍" : " ";

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="absolute -inset-6 bg-gradient-brand opacity-25 blur-3xl rounded-[2rem] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-[var(--shadow-elegant)] overflow-hidden float-soft-slow">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/50 bg-card/40">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SmartReply · live
          </div>
        </div>

        <div className="p-5 space-y-4 text-left">
          {/* Tweet input */}
          <div className="rounded-lg border border-border/50 bg-background/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tweet</div>
            <div className="text-sm font-medium min-h-[1.25rem]">
              {tweetText}
              {phase === "typing" && <span className="text-primary">{caret}</span>}
            </div>
          </div>

          {/* Generate row */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow-sm)] transition-transform ${
                phase === "thinking" ? "scale-95 brightness-125" : ""
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Generate
            </div>
            {phase === "thinking" && (
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 animate-fade-in">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Crafting replies…
              </div>
            )}
            {phase === "done" && (
              <div className="text-xs text-emerald-400 inline-flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5" /> 3 replies ready
              </div>
            )}
          </div>

          {/* Streaming replies */}
          <div className="space-y-2">
            {streams.map((text, i) => {
              const visible = phase === "streaming" || phase === "done";
              const active = phase === "streaming" && text && text.length < REPLIES[i].length;
              return (
                <div
                  key={i}
                  className={`rounded-lg border border-border/50 bg-background/30 p-3 text-xs leading-relaxed flex gap-2 transition-all duration-500 ${
                    visible && text
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <MessageSquareText className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    {text}
                    {active && <span className="text-primary">{caret}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
