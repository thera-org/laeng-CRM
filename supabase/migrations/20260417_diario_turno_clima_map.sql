-- =========================================================================
-- Migration: replace diario turnos/climas arrays with clima_por_turno mapping
-- Date: 2026-04-17
-- =========================================================================

alter table if exists public.diario_obras
  drop constraint if exists diario_obras_turnos_array,
  drop constraint if exists diario_obras_climas_array;

alter table if exists public.diario_obras
  drop column if exists turnos,
  drop column if exists climas,
  add column if not exists clima_por_turno jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'diario_obras_clima_por_turno_object'
      and conrelid = 'public.diario_obras'::regclass
  ) then
    alter table public.diario_obras
      add constraint diario_obras_clima_por_turno_object
      check (jsonb_typeof(clima_por_turno) = 'object');
  end if;
end $$;