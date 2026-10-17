-- ==========================================================
-- Projeto Futuro - Sistema de Chamada de Presenca
-- Execute este script no SQL Editor do Supabase
-- ==========================================================

-- Extensao para gerar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------
-- MODALIDADES
-- ----------------------------------------------------------
create table if not exists public.modalidades (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  nome        text not null,
  descricao   text,
  imagem_url  text,
  horario     text,
  local       text,
  criado_em   timestamptz not null default now()
);

-- Imagens padrao (Unsplash) para cada modalidade
insert into public.modalidades (slug, nome, descricao, imagem_url, horario, local)
values
  ('skate',   'Skate',   'Aulas de skate para todas as idades, do basico ao avancado.',
   'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=1200&q=80',
   'Segunda e Quarta - 18h',    'Pista Central'),
  ('karate',  'Karate',  'Arte marcial tradicional, disciplina e defesa pessoal.',
   'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80',
   'Terca e Quinta - 19h',      'Dojo - Sala 2'),
  ('violao',  'Violao',  'Aulas de violao do iniciante ao intermediario.',
   'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
   'Sexta - 17h',               'Sala de Musica'),
  ('bale',    'Bale',    'Ballet classico com foco em tecnica e postura.',
   'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1200&q=80',
   'Segunda e Quinta - 16h',    'Estudio de Danca'),
  ('futebol', 'Futebol', 'Escolinha de futebol para criancas e adolescentes.',
   'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
   'Sabado - 09h',              'Campo Society')
on conflict (slug) do nothing;

-- ----------------------------------------------------------
-- PERFIS (vinculado ao auth.users)
-- ----------------------------------------------------------
create table if not exists public.perfis (
  id                   uuid primary key references auth.users(id) on delete cascade,
  nome                 text not null,
  email                text not null,
  role                 text not null default 'professor' check (role in ('admin','professor')),
  precisa_trocar_senha boolean not null default false,
  criado_em            timestamptz not null default now()
);

-- Garante a coluna tambem em bancos ja existentes
alter table public.perfis
  add column if not exists precisa_trocar_senha boolean not null default false;

-- ----------------------------------------------------------
-- PROFESSORES
-- ----------------------------------------------------------
create table if not exists public.professores (
  id             bigint generated always as identity primary key,
  perfil_id      uuid references public.perfis(id) on delete set null,
  nome           text not null,
  email          text,
  telefone       text,
  modalidade_id  bigint not null references public.modalidades(id) on delete restrict,
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now()
);

create index if not exists professores_modalidade_idx on public.professores(modalidade_id);

-- ----------------------------------------------------------
-- ALUNOS
-- ----------------------------------------------------------
create table if not exists public.alunos (
  id               bigint generated always as identity primary key,
  nome             text not null,
  email            text,
  telefone         text,
  data_nascimento  date,
  modalidade_id    bigint not null references public.modalidades(id) on delete restrict,
  professor_id     bigint references public.professores(id) on delete set null,
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now()
);

create index if not exists alunos_modalidade_idx on public.alunos(modalidade_id);
create index if not exists alunos_professor_idx  on public.alunos(professor_id);

-- ----------------------------------------------------------
-- CHAMADAS (presenca)
-- ----------------------------------------------------------
create table if not exists public.chamadas (
  id             bigint generated always as identity primary key,
  aluno_id       bigint not null references public.alunos(id) on delete cascade,
  modalidade_id  bigint not null references public.modalidades(id) on delete restrict,
  data           date not null default current_date,
  presente       boolean not null default false,
  observacao     text,
  criado_em      timestamptz not null default now(),
  unique (aluno_id, data, modalidade_id)
);

create index if not exists chamadas_data_idx       on public.chamadas(data);
create index if not exists chamadas_modalidade_idx on public.chamadas(modalidade_id);

-- ----------------------------------------------------------
-- RLS
-- ----------------------------------------------------------
alter table public.modalidades enable row level security;
alter table public.perfis      enable row level security;
alter table public.professores enable row level security;
alter table public.alunos      enable row level security;
alter table public.chamadas    enable row level security;

-- Helper: usuario autenticado e admin?
create or replace function public.is_authenticated()
returns boolean language sql stable as $$
  select auth.uid() is not null;
$$;

-- Helper: usuario logado e admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfis where id = auth.uid() and role = 'admin'
  );
$$;

-- Modalidades: leitura publica (landing page), escrita apenas autenticado
drop policy if exists "modalidades_select_public" on public.modalidades;
create policy "modalidades_select_public"
  on public.modalidades for select using (true);

drop policy if exists "modalidades_write_auth" on public.modalidades;
drop policy if exists "modalidades_insert_admin" on public.modalidades;
drop policy if exists "modalidades_update_admin" on public.modalidades;
drop policy if exists "modalidades_update_professor" on public.modalidades;
drop policy if exists "modalidades_delete_admin" on public.modalidades;

-- Criar: somente admin
create policy "modalidades_insert_admin"
  on public.modalidades for insert to authenticated
  with check (public.is_admin());

-- Alterar: admin em qualquer uma
create policy "modalidades_update_admin"
  on public.modalidades for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Alterar: professor apenas a modalidade a que esta vinculado
create policy "modalidades_update_professor"
  on public.modalidades for update to authenticated
  using (
    exists (
      select 1 from public.professores p
      where p.perfil_id = auth.uid() and p.modalidade_id = modalidades.id
    )
  )
  with check (
    exists (
      select 1 from public.professores p
      where p.perfil_id = auth.uid() and p.modalidade_id = modalidades.id
    )
  );

-- Excluir: somente admin
create policy "modalidades_delete_admin"
  on public.modalidades for delete to authenticated
  using (public.is_admin());


-- Perfis: cada usuario le/edita o proprio; autenticados leem todos
drop policy if exists "perfis_select_auth" on public.perfis;
create policy "perfis_select_auth"
  on public.perfis for select using (public.is_authenticated());

drop policy if exists "perfis_update_self" on public.perfis;
create policy "perfis_update_self"
  on public.perfis for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "perfis_insert_self" on public.perfis;
create policy "perfis_insert_self"
  on public.perfis for insert
  with check (auth.uid() = id);

-- Professores / Alunos / Chamadas: acesso total para autenticados
do $$
declare t text;
begin
  foreach t in array array['professores','alunos','chamadas'] loop
    execute format('drop policy if exists "%s_all_auth" on public.%I;', t, t);
    execute format(
      'create policy "%s_all_auth" on public.%I for all using (public.is_authenticated()) with check (public.is_authenticated());',
      t, t
    );
  end loop;
end $$;

-- ----------------------------------------------------------
-- TRIGGER: cria perfil automaticamente ao cadastrar usuario
-- ----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, email, role, precisa_trocar_senha)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'professor'),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
