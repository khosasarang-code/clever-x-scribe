create or replace function public.increment_daily_usage(
  _user_id uuid,
  _limit integer,
  _is_pro boolean
)
returns table (count integer, allowed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  today date := (now() at time zone 'utc')::date;
begin
  insert into public.daily_usage (user_id, day, count)
  values (_user_id, today, 0)
  on conflict (user_id, day) do nothing;

  select du.count into current_count
  from public.daily_usage as du
  where du.user_id = _user_id and du.day = today;

  if not _is_pro and current_count >= _limit then
    return query select current_count, false;
    return;
  end if;

  update public.daily_usage as du
  set count = du.count + 1,
      updated_at = now()
  where du.user_id = _user_id and du.day = today
  returning du.count into current_count;

  return query select current_count, true;
end;
$$;

create or replace function public.decrement_daily_usage(_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'utc')::date;
begin
  update public.daily_usage as du
  set count = greatest(du.count - 1, 0),
      updated_at = now()
  where du.user_id = _user_id and du.day = today;
end;
$$;

revoke all on function public.increment_daily_usage(uuid, integer, boolean) from public, anon, authenticated;
grant execute on function public.increment_daily_usage(uuid, integer, boolean) to service_role;

revoke all on function public.decrement_daily_usage(uuid) from public, anon, authenticated;
grant execute on function public.decrement_daily_usage(uuid) to service_role;