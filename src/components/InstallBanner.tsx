import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "smartreply_install_banner_dismissed_v1";

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem(DISMISS_KEY)) return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS
      window.navigator.standalone === true;
    if (standalone) return;

    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
    if (!isMobile) return;

    setHidden(false);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setHidden(true);
      setDeferred(null);
      return;
    }
    toast.info(
      isIOS
        ? "Tap the Share icon, then 'Add to Home Screen'."
        : "Open your browser menu and tap 'Install app'.",
      { duration: 6000 },
    );
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  return (
    <div className="sm:hidden px-3 pt-2">
      <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card/40 backdrop-blur-md pl-3 pr-1 py-1 shadow-sm">
        <Smartphone className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-[11px] text-muted-foreground flex-1 min-w-0 truncate">
          Install for the best experience
        </span>
        <button
          onClick={handleInstall}
          className="text-[11px] font-medium px-2.5 py-1 rounded-full text-primary hover:bg-primary/10 transition-colors inline-flex items-center gap-1 shrink-0"
        >
          <Download className="h-3 w-3" />
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-1 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
