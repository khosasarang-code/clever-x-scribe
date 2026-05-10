REVOKE ALL ON FUNCTION public.decrement_daily_usage(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_daily_usage(uuid) TO service_role;