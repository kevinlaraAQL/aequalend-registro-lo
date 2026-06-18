-- ───────────────────────────────────────────────────────────────
-- Aequalend — Tabla dedicada de ONBOARDING de Loan Officers
-- (separada de la tabla pública de perfiles `loan_officers`).
-- Pega TODO en Supabase → SQL Editor → New query → Run.
-- ───────────────────────────────────────────────────────────────

create table if not exists public.lo_onboarding (
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

-- Seguridad: activa RLS sin políticas públicas (solo la service_role puede escribir).
alter table public.lo_onboarding enable row level security;

-- Refresca el cache del API de Supabase (PostgREST).
notify pgrst, 'reload schema';
