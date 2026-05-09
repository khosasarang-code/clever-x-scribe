import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: "Reset password — SmartReply AI X" }],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery link via URL hash.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Allow direct access if already in a recovery session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <Toaster theme="dark" position="top-center" />
      <Card className="w-full max-w-sm p-6 space-y-5 bg-card/70 border-border/70">
        <Link to="/" className="flex items-center gap-2 justify-center">
          <div className="h-9 w-9 rounded-lg bg-gradient-brand grid place-items-center shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="font-semibold tracking-tight">
            SmartReply <span className="text-muted-foreground">AI X</span>
          </div>
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-center">Set a new password</h1>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {ready ? "Enter your new password below." : "Verifying recovery link…"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={busy || !ready}
          />
          <Button
            type="submit"
            disabled={busy || !ready}
            className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
