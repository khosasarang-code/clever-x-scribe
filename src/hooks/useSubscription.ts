import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "./useAuth";

type Subscription = {
  status: string;
  price_id: string;
  product_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  paddle_subscription_id: string;
  paddle_customer_id: string;
  environment: string;
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const env = getPaddleEnvironment();

  const fetchSub = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as any) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSub();
    if (!user) return;
    const channel = supabase
      .channel(`sub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => fetchSub(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isActive = Boolean(
    subscription &&
      ((["active", "trialing", "past_due"].includes(subscription.status) &&
        (!subscription.current_period_end ||
          new Date(subscription.current_period_end) > new Date())) ||
        (subscription.status === "canceled" &&
          subscription.current_period_end &&
          new Date(subscription.current_period_end) > new Date())),
  );

  return { subscription, isPro: isActive, loading };
}
