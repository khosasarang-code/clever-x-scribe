import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, Copy, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { rewriteAI, REWRITE_STYLES } from "@/lib/ai.functions";
import { getPaddleEnvironment } from "@/lib/paddle";

type Props = {
  initialText?: string;
  trigger?: React.ReactNode;
};

const STYLE_META: Record<(typeof REWRITE_STYLES)[number], { emoji: string; hint: string }> = {
  Stronger: { emoji: "💪", hint: "Punchier, more confident" },
  Funnier: { emoji: "😂", hint: "Add wit and surprise" },
  "More Viral": { emoji: "🔥", hint: "Built for engagement" },
  Shorter: { emoji: "✂️", hint: "Cut ruthlessly" },
  "More Professional": { emoji: "👔", hint: "Polished and credible" },
};

export function RewriteDialog({ initialText = "", trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState<(typeof REWRITE_STYLES)[number]>("Stronger");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setText(initialText);
      setResult("");
    }
  }, [open, initialText]);

  const run = async () => {
    if (!text.trim()) {
      toast.error("Paste a reply first");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await rewriteAI({ data: { text, style, environment: getPaddleEnvironment() } });
      setResult(res.text);
    } catch (e: any) {
      toast.error(e?.message ?? "Rewrite failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Rewritten reply copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
            <Wand2 className="h-3.5 w-3.5" /> Rewrite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" /> Rewrite this reply
          </DialogTitle>
          <DialogDescription>
            Paste your reply and pick a style. AI will rewrite it instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the reply you want to rewrite…"
            className="min-h-[110px] text-sm resize-none bg-input/40 border-border/60 focus-visible:ring-primary"
          />

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Make it</div>
            <div className="flex flex-wrap gap-2">
              {REWRITE_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    style === s
                      ? "bg-gradient-brand text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                      : "bg-background/40 text-muted-foreground border-border/60 hover:text-foreground hover:border-primary/40"
                  }`}
                  title={STYLE_META[s].hint}
                >
                  <span className="mr-1">{STYLE_META[s].emoji}</span>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={run}
            disabled={loading}
            className="w-full bg-gradient-brand text-primary-foreground hover:opacity-95 shadow-[var(--shadow-glow)] font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Rewriting…" : `Rewrite ${style.toLowerCase()}`}
          </Button>

          {(loading || result) && (
            <Card className="p-3 bg-card/60 border-border/70 space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Rewritten
              </div>
              {loading && !result ? (
                <div className="space-y-2">
                  <div className="h-3 rounded bg-muted/60 w-5/6 shimmer-bg" />
                  <div className="h-3 rounded bg-muted/60 w-full shimmer-bg" />
                  <div className="h-3 rounded bg-muted/60 w-2/3 shimmer-bg" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
              )}
              {result && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">{result.length} chars</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setText(result)}>
                      Use as input
                    </Button>
                    <Button size="sm" variant="secondary" onClick={copy}>
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
