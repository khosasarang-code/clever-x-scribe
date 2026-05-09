import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const FREE_DAILY_LIMIT = 10;

export const getDailyUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("day", today)
      .maybeSingle();
    return { count: (data?.count as number | undefined) ?? 0, limit: FREE_DAILY_LIMIT };
  });
