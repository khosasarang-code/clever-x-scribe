create table public.daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.daily_usage enable row level security;

create policy "Users can view own usage"
  on public.daily_usage for select
  using (auth.uid() = user_id);

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
  from public.daily_usage du
  where du.user_id = _user_id and du.day = today;

  if not _is_pro and current_count >= _limit then
    return query select current_count, false;
    return;
  end if;

  update public.daily_usage
  set count = count + 1, updated_at = now()
  where user_id = _user_id and day = today
  returning count into current_count;

  return query select current_count, true;
end;
$$;

revoke all on function public.increment_daily_usage(uuid, integer, boolean) from public, anon, authenticated;