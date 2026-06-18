-- ───────────────────────────────────────────────────────────────
-- Aequalend — Tabla de LOAN OFFICERS para el formulario de onboarding
-- Pega TODO esto en Supabase → SQL Editor → New query → Run.
-- (Proyecto "AQL - Database", el mismo donde está la tabla `staff`.)
-- ───────────────────────────────────────────────────────────────

create table if not exists public.loan_officers (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  name            text not null,
  role            text,
  nmls            text,
  email           text,
  phone           text,
  birth_date      date,
  start_date      date,
  licensed_states text,
  street_address  text,
  city            text,
  state           text,
  zip_code        text,
  linkedin        text,
  instagram       text,
  facebook        text,
  tiktok          text,
  bio             text,
  shirt_size      text,
  photo_url       text,
  status          text default 'Activo'
);

-- Seguridad: activa RLS sin políticas públicas.
-- Bloquea el acceso con la llave pública (anon). La Netlify Function usa la
-- service_role key, que ignora RLS, así que sí podrá insertar.
alter table public.loan_officers enable row level security;

-- Refresca el cache del API de Supabase (PostgREST).
notify pgrst, 'reload schema';
