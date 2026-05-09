create or replace function public.decrement_daily_usage(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'utc')::date;
begin
  update public.daily_usage
  set count = greatest(count - 1, 0), updated_at = now()
  where user_id = _user_id and day = today;
end;
$$;