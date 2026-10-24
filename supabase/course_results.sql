-- نتائج كورسات MrElectroAI: الطلاب بيضيفوا بس، وأنور لحالو بيقرا.
-- شغّلو مرة وحدة بـ Supabase → SQL Editor. بدّل ADMIN_EMAIL بإيميلك (نفس يلي عملت فيه اليوزر).

create table if not exists public.course_results (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  client_id    text not null check (char_length(client_id) between 8 and 64),
  course       text not null check (course in ('electro', 'classic')),
  event        text not null check (event in ('start', 'rule', 'finish')),
  name         text not null check (char_length(name) between 2 and 80),
  phone        text not null check (char_length(phone) between 5 and 25),
  rules_done   int  not null default 0 check (rules_done between 0 and 50),
  total        int  not null default 0 check (total between 0 and 50),
  mistakes     int  not null default 0 check (mistakes between 0 and 5000),
  answers      int  not null default 0 check (answers between 0 and 10000),
  started_at   timestamptz,
  finished_at  timestamptz,
  data         jsonb check (pg_column_size(data) < 60000)
);
create index if not exists course_results_student on public.course_results (client_id, course, created_at desc);

alter table public.course_results enable row level security;

drop policy if exists "students insert" on public.course_results;
create policy "students insert" on public.course_results
  for insert to anon, authenticated with check (true);

drop policy if exists "admin reads" on public.course_results;
create policy "admin reads" on public.course_results
  for select to authenticated using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');

drop policy if exists "admin deletes" on public.course_results;
create policy "admin deletes" on public.course_results
  for delete to authenticated using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL');

revoke all on public.course_results from anon;
grant insert on public.course_results to anon;
grant select, insert, delete on public.course_results to authenticated;
