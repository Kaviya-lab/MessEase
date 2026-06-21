-- =====================================================================
-- MessEase database schema  (roll-no based login, no Supabase Auth)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================
--
-- AUTH MODEL: this app does NOT use Supabase Auth / passwords for
-- students. A student "logs in" with just their name + roll number —
-- the first time a roll number is used it creates that student, after
-- that it just signs them back in. This is fine for a class project /
-- closed group, but anyone who knows a roll number can act as that
-- student — do not put real sensitive data here, and don't expose this
-- publicly with real student records.
--
-- The mess admin uses one fixed username/password, checked in app code
-- against an env variable (see src/lib/adminAuth.ts) — not in this DB.
--
-- Because there's no auth.uid() to key off, RLS below is intentionally
-- open (anon role can read/write everything) and access control is
-- enforced in the frontend instead. If you ever expose this beyond a
-- trusted classroom demo, tighten these policies first.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES — one row per student. roll_no is the login key.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll_no text not null unique,
  room_no text,
  balance numeric default 0,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Anyone can create a profile (self-registration by roll no)"
  on public.profiles for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can update profiles"
  on public.profiles for update
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 2. MENU ITEMS
-- ---------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  day_of_week text not null check (day_of_week in
    ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  meal text not null check (meal in ('breakfast','lunch','dinner')),
  name text not null,
  is_veg boolean default true,
  calories integer,
  created_at timestamptz default now()
);

alter table public.menu_items enable row level security;

create policy "Anyone can read menu items"
  on public.menu_items for select
  to anon, authenticated
  using (true);

create policy "Anyone can modify menu items"
  on public.menu_items for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 3. ATTENDANCE  (this is the key table that answers
--    "how many students are coming in for lunch today?")
-- ---------------------------------------------------------------------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  date date not null default current_date,
  meal text not null check (meal in ('breakfast','lunch','dinner')),
  attending boolean not null default true,
  created_at timestamptz default now(),
  unique (student_id, date, meal)  -- one record per student per meal per day
);

alter table public.attendance enable row level security;

create policy "Anyone can read attendance"
  on public.attendance for select
  to anon, authenticated
  using (true);

create policy "Anyone can write attendance"
  on public.attendance for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 4. COMPLAINTS
-- ---------------------------------------------------------------------
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('food','hygiene','service','billing','other')),
  status text not null default 'open' check (status in ('open','in-progress','resolved')),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table public.complaints enable row level security;

create policy "Anyone can read complaints"
  on public.complaints for select
  to anon, authenticated
  using (true);

create policy "Anyone can write complaints"
  on public.complaints for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 5. PAYMENTS
-- ---------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  month text not null,
  status text not null default 'pending' check (status in ('paid','pending','overdue')),
  due_date date not null,
  paid_on timestamptz,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

create policy "Anyone can read payments"
  on public.payments for select
  to anon, authenticated
  using (true);

create policy "Anyone can write payments"
  on public.payments for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 6. ANNOUNCEMENTS
-- ---------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  created_at timestamptz default now()
);

alter table public.announcements enable row level security;

create policy "Anyone can read announcements"
  on public.announcements for select
  to anon, authenticated
  using (true);

create policy "Anyone can write announcements"
  on public.announcements for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 7. VIEW: live attendance count per meal for today
--    (this is literally the answer to "how many students are coming")
-- ---------------------------------------------------------------------
create or replace view public.todays_attendance_summary as
select
  meal,
  count(*) filter (where attending) as attending_count,
  count(*) filter (where not attending) as skipping_count,
  count(*) as total_marked
from public.attendance
where date = current_date
group by meal;

-- ---------------------------------------------------------------------
-- 8. Seed: this week's menu (optional — feel free to edit via the
--    admin "Manage Menu" page instead once the app is running)
-- ---------------------------------------------------------------------
insert into public.menu_items (day_of_week, meal, name, is_veg, calories) values
  ('Monday', 'breakfast', 'Idli Sambar', true, 280),
  ('Monday', 'breakfast', 'Coconut Chutney', true, 80),
  ('Monday', 'lunch', 'Rice', true, 350),
  ('Monday', 'lunch', 'Dal Tadka', true, 180),
  ('Monday', 'lunch', 'Rajma Curry', true, 220),
  ('Monday', 'dinner', 'Chapati', true, 300),
  ('Monday', 'dinner', 'Paneer Butter Masala', true, 320),
  ('Tuesday', 'breakfast', 'Pongal', true, 320),
  ('Tuesday', 'breakfast', 'Vada', true, 180),
  ('Tuesday', 'lunch', 'Rice', true, 350),
  ('Tuesday', 'lunch', 'Sambar', true, 150),
  ('Tuesday', 'lunch', 'Chicken Curry', false, 380),
  ('Tuesday', 'dinner', 'Fried Rice', true, 420),
  ('Tuesday', 'dinner', 'Gobi Manchurian', true, 280)
on conflict do nothing;
