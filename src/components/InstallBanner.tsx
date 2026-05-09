import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (standalone) setInstalled(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const isIOS =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    if (isIOS) {
      toast.info("Tap the Share icon in Safari, then 'Add to Home Screen'.", {
        duration: 6000,
      });
      return;
    }
    toast.info("Open your browser menu and tap 'Install app' or 'Add to Home Screen'.", {
      duration: 6000,
    });
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-4 sm:p-5 flex items-center gap-4 shadow-[var(--shadow-glow)]">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-brand grid place-items-center">
        <Smartphone className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold leading-tight text-sm sm:text-base">
          Install this app on your phone for the best experience
        </div>
        <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
          One-tap access, full-screen mode, works like a native app.
        </div>
      </div>
      <Button
        onClick={handleInstall}
        className="bg-gradient-brand text-primary-foreground hover:opacity-90 shrink-0"
      >
        <Download className="h-4 w-4" />
        Install
      </Button>
    </div>
  );
}
