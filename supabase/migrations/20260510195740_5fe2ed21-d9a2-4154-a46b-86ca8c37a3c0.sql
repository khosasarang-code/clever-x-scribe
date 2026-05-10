
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text,
  rating smallint not null,
  message text not null,
  approved boolean not null default true,
  user_id uuid,
  created_at timestamptz not null default now()
);

alter table public.reviews
  add constraint reviews_rating_range check (rating between 1 and 5),
  add constraint reviews_name_len check (char_length(name) between 1 and 60),
  add constraint reviews_handle_len check (handle is null or char_length(handle) <= 30),
  add constraint reviews_message_len check (char_length(message) between 4 and 600);

alter table public.reviews enable row level security;

create policy "Anyone can view approved reviews"
  on public.reviews for select
  using (approved = true);

create policy "Anyone can submit a review"
  on public.reviews for insert
  with check (approved = true);

create index reviews_created_at_idx on public.reviews (created_at desc);
