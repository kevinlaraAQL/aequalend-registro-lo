-- ───────────────────────────────────────────────────────────────
-- Aequalend — lo_onboarding, segunda vuelta.
--
-- Lo que la forma preguntaba se quedaba corto contra lo que My AQL ya sabe
-- mostrar: idiomas, la liga de citas, la bio en español, la oficina publica y
-- el video de presentacion. Cada uno de esos campos existe en el perfil y hasta
-- hoy se llenaba a mano, o no se llenaba.
--
-- CORRE ESTO ANTES de publicar la forma nueva. La insercion manda la fila
-- completa: una columna que todavia no existe tumba el envio entero, y la
-- persona que se estaba dando de alta ve un error sin saber por que.
--
-- Se puede correr dos veces sin romper nada.
-- Pega TODO en Supabase → SQL Editor → New query → Run.
-- ───────────────────────────────────────────────────────────────

alter table public.lo_onboarding add column if not exists languages       text;
alter table public.lo_onboarding add column if not exists calendar_url    text;
alter table public.lo_onboarding add column if not exists bio_es          text;
alter table public.lo_onboarding add column if not exists office_address  text;
alter table public.lo_onboarding add column if not exists intro_video_url text;

-- La oficina publica del perfil. Existe en loan_officers desde hace tiempo,
-- pero nada la sembraba: se escribia a mano o se quedaba vacia.
alter table public.loan_officers add column if not exists office_address  text;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'lo_onboarding'
order by ordinal_position;
