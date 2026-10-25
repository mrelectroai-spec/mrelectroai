-- مرجع: هيدا الشكل يلي انعمل بقاعدة البيانات (25 تشرين 2026). ما في داعي تشغّلو مرة تانية.
-- الأدمن: أي يوزر id تبعو بجدول site_admins. الطلاب بيضيفوا نتائجهن بس. العالم بيقرا site_stats() بس.

create table public.site_admins (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create function public.is_site_admin() returns boolean language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.site_admins where user_id = auth.uid()); $$;

create table public.course_results (
  id bigint generated always as identity primary key, created_at timestamptz not null default now(),
  client_id text not null, course text not null check (course in ('electro','classic','solar')),
  event text not null check (event in ('start','rule','finish')),
  name text not null, phone text not null, rules_done int not null default 0, total int not null default 0,
  mistakes int not null default 0, answers int not null default 0, started_at timestamptz, finished_at timestamptz, data jsonb);
-- RLS: insert للكل، select/delete للأدمن بس.

create table public.books (id text primary key, title text not null, price numeric(10,2) not null default 0,
  bundle_price numeric(10,2), rules int, summary text not null default '', sort int not null default 0, created_at timestamptz not null default now());
create table public.book_sales (id bigint generated always as identity primary key, sold_at timestamptz not null default now(),
  book_id text not null references public.books(id), price numeric(10,2) not null, buyer text, note text);
-- RLS: الأدمن بس (قراية وكتابة).

create table public.site_counters (key text primary key, value bigint not null default 0, updated_at timestamptz not null default now());
-- hit_sample(): بيزيد عدّاد قراية العيّنة (للكل).
-- site_stats(): الأرقام العامة بلا أسعار: books_sold (الباقة = 2)، sample_reads، students، finished.
