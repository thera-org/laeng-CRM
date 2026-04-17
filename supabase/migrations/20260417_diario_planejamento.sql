-- =========================================================================
-- Migration: diario_obras + planejamento_obras modules
-- Date: 2026-04-17
-- =========================================================================

-- ---------- helper: updated_at trigger function (idempotent) -------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================================
-- DIARIO DE OBRAS
-- =========================================================================

create sequence if not exists public.diario_obras_codigo_seq;

create table if not exists public.diario_obras (
  id              uuid primary key default gen_random_uuid(),
  codigo          int  not null default nextval('public.diario_obras_codigo_seq'),
  cliente_id      uuid not null references public.clientes(id) on delete restrict,
  responsavel     text not null,
  responsavel_id  uuid references auth.users(id) on delete set null,
  data            date not null default current_date,
  -- multi-select stored as JSONB arrays of strings
  -- turnos: subset of ('manha','tarde','noite')
  -- climas: subset of ('sol','nublado','chuva','impraticavel')
  turnos          jsonb not null default '[]'::jsonb,
  climas          jsonb not null default '[]'::jsonb,
  -- colaboradores: { pedreiro:int, ajudante:int, gesseiro:int, eletricista:int, pintor:int }
  colaboradores   jsonb not null default '{}'::jsonb,
  atividade       text,
  -- progresso: { item_key: boolean } over the 32 fixed items in diarioTypes
  progresso       jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  updated_by      uuid references auth.users(id) on delete set null,
  constraint diario_obras_codigo_unique unique (codigo),
  constraint diario_obras_atividade_length check (atividade is null or char_length(atividade) <= 2000),
  constraint diario_obras_turnos_array check (jsonb_typeof(turnos) = 'array'),
  constraint diario_obras_climas_array check (jsonb_typeof(climas) = 'array'),
  constraint diario_obras_colaboradores_object check (jsonb_typeof(colaboradores) = 'object'),
  constraint diario_obras_progresso_object check (jsonb_typeof(progresso) = 'object')
);

create index if not exists diario_obras_cliente_idx on public.diario_obras (cliente_id);
create index if not exists diario_obras_data_idx    on public.diario_obras (data desc);

drop trigger if exists trg_diario_obras_updated_at on public.diario_obras;
create trigger trg_diario_obras_updated_at
  before update on public.diario_obras
  for each row execute function public.set_updated_at();

-- ---------- diario_obras_fotos ------------------------------------------
create table if not exists public.diario_obras_fotos (
  id            uuid primary key default gen_random_uuid(),
  diario_id     uuid not null references public.diario_obras(id) on delete cascade,
  storage_path  text not null,
  ordem         int  not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists diario_obras_fotos_diario_idx
  on public.diario_obras_fotos (diario_id, ordem);

-- =========================================================================
-- PLANEJAMENTO DE OBRAS
-- =========================================================================

create sequence if not exists public.planejamento_obras_codigo_seq;

create table if not exists public.planejamento_obras (
  id              uuid primary key default gen_random_uuid(),
  codigo          int  not null default nextval('public.planejamento_obras_codigo_seq'),
  cliente_id      uuid not null references public.clientes(id) on delete restrict,
  responsavel     text not null,
  responsavel_id  uuid references auth.users(id) on delete set null,
  data_inicio     date not null,
  data_fim        date not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  updated_by      uuid references auth.users(id) on delete set null,
  constraint planejamento_obras_codigo_unique unique (codigo),
  constraint planejamento_obras_periodo_check check (data_fim >= data_inicio),
  constraint planejamento_obras_unique_period unique (cliente_id, data_inicio, data_fim)
);

create index if not exists planejamento_obras_cliente_idx on public.planejamento_obras (cliente_id);
create index if not exists planejamento_obras_periodo_idx on public.planejamento_obras (data_inicio desc, data_fim desc);

drop trigger if exists trg_planejamento_obras_updated_at on public.planejamento_obras;
create trigger trg_planejamento_obras_updated_at
  before update on public.planejamento_obras
  for each row execute function public.set_updated_at();

-- ---------- planejamento_atividades -------------------------------------
create table if not exists public.planejamento_atividades (
  id               uuid primary key default gen_random_uuid(),
  planejamento_id  uuid not null references public.planejamento_obras(id) on delete cascade,
  codigo           int  not null,
  descricao        text not null default '',
  realizado        boolean not null default false,
  ordem            int  not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint planejamento_atividades_codigo_unique unique (planejamento_id, codigo)
);

create index if not exists planejamento_atividades_pl_idx
  on public.planejamento_atividades (planejamento_id, ordem);

drop trigger if exists trg_planejamento_atividades_updated_at on public.planejamento_atividades;
create trigger trg_planejamento_atividades_updated_at
  before update on public.planejamento_atividades
  for each row execute function public.set_updated_at();

-- =========================================================================
-- STORAGE BUCKET: diario-imagens (private, 50 MB, jpeg/png)
-- =========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'diario-imagens',
  'diario-imagens',
  false,
  52428800,
  array['image/jpeg','image/png']
)
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='diario_imagens_select_auth') then
    create policy diario_imagens_select_auth on storage.objects
      for select to authenticated using (bucket_id = 'diario-imagens');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='diario_imagens_insert_auth') then
    create policy diario_imagens_insert_auth on storage.objects
      for insert to authenticated with check (bucket_id = 'diario-imagens');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='diario_imagens_update_auth') then
    create policy diario_imagens_update_auth on storage.objects
      for update to authenticated using (bucket_id = 'diario-imagens') with check (bucket_id = 'diario-imagens');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='diario_imagens_delete_auth') then
    create policy diario_imagens_delete_auth on storage.objects
      for delete to authenticated using (bucket_id = 'diario-imagens');
  end if;
end $$;
