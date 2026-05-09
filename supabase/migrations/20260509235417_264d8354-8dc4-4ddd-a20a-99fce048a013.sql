-- Lock down SECURITY DEFINER functions: only service_role may call them.
REVOKE ALL ON FUNCTION public.decrement_daily_usage(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_daily_usage(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.increment_daily_usage(uuid, integer, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_daily_usage(uuid, integer, boolean) TO service_role;

REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO service_role;