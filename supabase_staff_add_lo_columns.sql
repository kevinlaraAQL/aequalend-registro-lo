-- ───────────────────────────────────────────────────────────────
-- Aequalend — Agregar a la tabla `staff` las columnas que usan los LOs
-- (para tener UNA sola tabla con staff + loan officers).
-- Pega TODO en Supabase → SQL Editor → New query → Run. No borra nada.
-- ───────────────────────────────────────────────────────────────

alter table public.staff add column if not exists nmls            text;
alter table public.staff add column if not exists licensed_states text;
alter table public.staff add column if not exists linkedin        text;
alter table public.staff add column if not exists instagram       text;
alter table public.staff add column if not exists facebook        text;
alter table public.staff add column if not exists tiktok          text;
alter table public.staff add column if not exists bio             text;
alter table public.staff add column if not exists shirt_size      text;

-- Refresca el cache del API de Supabase (PostgREST).
notify pgrst, 'reload schema';
