import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "smartreply_install_dismissed_v1";

export function PWAEnhancements() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [offline, setOffline] = useState(false);

  // Install prompt
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem(DISMISS_KEY)) return;
      setDeferred(e as BIPEvent);
      setShowInstall(true);
    };
    const onInstalled = () => {
      setShowInstall(false);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Online/offline
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShowInstall(false);
    setDeferred(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowInstall(false);
  };

  return (
    <>
      {offline && (
        <div
          role="status"
          className="fixed top-0 inset-x-0 z-50 bg-destructive text-destructive-foreground text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
        >
          <WifiOff className="h-3.5 w-3.5" />
          You're offline — generations will resume when you're back online.
        </div>
      )}

      {showInstall && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
          <div className="rounded-xl border border-border/70 bg-card/95 backdrop-blur-md shadow-2xl p-3 flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-brand grid place-items-center">
              <Download className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight">Install SmartReply AI</div>
              <div className="text-[11px] text-muted-foreground truncate">
                Add to your home screen for one-tap access.
              </div>
            </div>
            <Button
              size="sm"
              onClick={install}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
