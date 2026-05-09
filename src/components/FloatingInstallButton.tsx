import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function FloatingInstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

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

  return (
    <button
      onClick={handleInstall}
      aria-label="Install app"
      className="sm:hidden fixed right-3 z-40 inline-flex items-center gap-1.5 rounded-full bg-card/70 backdrop-blur-md border border-border/50 text-foreground/80 text-[11px] font-medium pl-2.5 pr-3 py-1.5 shadow-sm hover:text-foreground hover:bg-card/90 active:scale-95 transition"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <Download className="h-3 w-3 text-primary" />
      Install
    </button>
  );
}
