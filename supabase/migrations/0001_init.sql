-- are-you-here database schema
-- Demo-first: all tables have permissive RLS policies for v1 (anonymous access)
-- Lock-down sprint will replace with owner-scoped policies

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- nullable until lock-down; will FK to auth.uid()
  linkedin_url text unique not null,
  name text not null,
  bio text,
  activity_preferences jsonb default '[]'::jsonb,
  payment_status text default 'free' check (payment_status in ('free', 'paid')),
  created_at timestamptz not null default now()
);

alter table users enable row level security;
drop policy if exists "users_v1_read" on users;
create policy "users_v1_read" on users for select using (true);
drop policy if exists "users_v1_write" on users;
create policy "users_v1_write" on users for all using (true) with check (true);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  city text not null,
  start_date date not null,
  end_date date not null,
  activities jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists visits_city_dates_idx on visits(city, start_date, end_date);

alter table visits enable row level security;
drop policy if exists "visits_v1_read" on visits;
create policy "visits_v1_read" on visits for select using (true);
drop policy if exists "visits_v1_write" on visits;
create policy "visits_v1_write" on visits for all using (true) with check (true);

create table if not exists connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references users(id) on delete cascade,
  recipient_id uuid references users(id) on delete cascade,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  mutual_connections_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists connection_requests_recipient_idx on connection_requests(recipient_id, status);
create index if not exists connection_requests_sender_idx on connection_requests(sender_id);

alter table connection_requests enable row level security;
drop policy if exists "connection_requests_v1_read" on connection_requests;
create policy "connection_requests_v1_read" on connection_requests for select using (true);
drop policy if exists "connection_requests_v1_write" on connection_requests;
create policy "connection_requests_v1_write" on connection_requests for all using (true) with check (true);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  amount numeric not null,
  currency text default 'usd',
  stripe_session_id text unique,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

alter table payments enable row level security;
drop policy if exists "payments_v1_read" on payments;
create policy "payments_v1_read" on payments for select using (true);
drop policy if exists "payments_v1_write" on payments;
create policy "payments_v1_write" on payments for all using (true) with check (true);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table activity_logs enable row level security;
drop policy if exists "activity_logs_v1_read" on activity_logs;
create policy "activity_logs_v1_read" on activity_logs for select using (true);
drop policy if exists "activity_logs_v1_write" on activity_logs;
create policy "activity_logs_v1_write" on activity_logs for all using (true) with check (true);

-- Seed demo users
insert into users (linkedin_url, name, bio, activity_preferences, payment_status) values
  ('https://linkedin.com/in/alice-chen', 'Alice Chen', 'Product designer, coffee enthusiast, always up for a hike.', '["coffee", "hiking"]', 'paid'),
  ('https://linkedin.com/in/bob-martinez', 'Bob Martinez', 'Software engineer traveling for conferences. Let''s grab dinner!', '["meal", "coffee"]', 'free'),
  ('https://linkedin.com/in/clara-wong', 'Clara Wong', 'Marketing lead, loves exploring new cities and catching indie films.', '["movie", "meal"]', 'free'),
  ('https://linkedin.com/in/david-kim', 'David Kim', 'Founder & CEO. In town for investor meetings. Open to coffee chats.', '["coffee"]', 'paid'),
  ('https://linkedin.com/in/emma-larson', 'Emma Larson', 'UX researcher. Enjoy hiking and deep conversations over meals.', '["hiking", "meal"]', 'free'),
  ('https://linkedin.com/in/frank-liu', 'Frank Liu', 'Data scientist. Movie buff. Always down for a casual meet-up.', '["movie", "coffee"]', 'free'),
  ('https://linkedin.com/in/grace-tanaka', 'Grace Tanaka', 'Sales VP. Love networking hikes and good coffee.', '["hiking", "coffee"]', 'paid'),
  ('https://linkedin.com/in/henry-osei', 'Henry Osei', 'Freelance writer. Prefer quiet coffee spots or shared meals.', '["coffee", "meal"]', 'free')
on conflict (linkedin_url) do nothing;

-- Seed demo visits (overlapping dates in SF, NYC, London, Tokyo, Austin)
insert into visits (user_id, city, start_date, end_date, activities)
select u.id, v.city, v.start_date, v.end_date, v.activities
from (values
  ('alice-chen', 'San Francisco, CA', '2025-01-10', '2025-01-15', '["coffee", "hiking"]'),
  ('bob-martinez', 'San Francisco, CA', '2025-01-12', '2025-01-18', '["meal", "coffee"]'),
  ('clara-wong', 'San Francisco, CA', '2025-01-14', '2025-01-20', '["movie", "meal"]'),
  ('david-kim', 'New York, NY', '2025-02-01', '2025-02-05', '["coffee"]'),
  ('emma-larson', 'New York, NY', '2025-02-03', '2025-02-08', '["hiking", "meal"]'),
  ('frank-liu', 'London, UK', '2025-02-10', '2025-02-14', '["movie", "coffee"]'),
  ('grace-tanaka', 'London, UK', '2025-02-12', '2025-02-16', '["hiking", "coffee"]'),
  ('henry-osei', 'London, UK', '2025-02-11', '2025-02-13', '["coffee", "meal"]'),
  ('alice-chen', 'Tokyo, Japan', '2025-03-01', '2025-03-07', '["coffee", "hiking"]'),
  ('bob-martinez', 'Austin, TX', '2025-03-10', '2025-03-14', '["meal", "coffee"]'),
  ('clara-wong', 'Austin, TX', '2025-03-12', '2025-03-16', '["movie", "meal"]'),
  ('david-kim', 'Austin, TX', '2025-03-11', '2025-03-15', '["coffee"]'),
  ('emma-larson', 'San Francisco, CA', '2025-04-01', '2025-04-05', '["hiking", "meal"]'),
  ('frank-liu', 'San Francisco, CA', '2025-04-02', '2025-04-06', '["movie", "coffee"]'),
  ('grace-tanaka', 'New York, NY', '2025-04-10', '2025-04-14', '["hiking", "coffee"]')
) as v(username, city, start_date, end_date, activities)
join users u on u.linkedin_url = 'https://linkedin.com/in/' || v.username;

-- Seed demo connection requests
insert into connection_requests (sender_id, recipient_id, message, status, mutual_connections_count)
select s.id, r.id, msg, st, mc
from (values
  ('alice-chen', 'bob-martinez', 'Hey Bob! I see you''ll be in SF too. Want to grab coffee on the 13th?', 'pending', 2),
  ('clara-wong', 'alice-chen', 'Hi Alice! Let''s catch a movie while we''re both in SF. I''m free on the 15th.', 'accepted', 1),
  ('david-kim', 'emma-larson', 'Emma, I''ll be in NYC for a few days. Would love to connect over a meal!', 'pending', 0),
  ('grace-tanaka', 'henry-osei', 'Henry, fellow London visitor here. Coffee on the 12th?', 'accepted', 3)
) as c(sender, recipient, msg, st, mc)
join users s on s.linkedin_url = 'https://linkedin.com/in/' || c.sender
join users r on r.linkedin_url = 'https://linkedin.com/in/' || c.recipient;

-- Seed demo payments
insert into payments (user_id, amount, currency, stripe_session_id, status)
select u.id, 9.99, 'usd', 'cs_demo_' || u.name, 'completed'
from users u
where u.payment_status = 'paid';

-- Seed demo activity logs
insert into activity_logs (user_id, action, details)
select u.id, 'visit_created', jsonb_build_object('city', v.city, 'dates', v.start_date || ' to ' || v.end_date)
from visits v
join users u on u.id = v.user_id
limit 5;

insert into activity_logs (user_id, action, details)
select sender_id, 'connection_sent', jsonb_build_object('recipient_id', recipient_id, 'status', status)
from connection_requests
limit 4;