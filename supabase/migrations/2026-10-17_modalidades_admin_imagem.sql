-- ==========================================================
-- Ajuste: ADMIN cria modalidades + imagem da modalidade
-- Execute no SQL Editor do Supabase (ou via node scripts/exec-sql.mjs)
-- Idempotente: pode rodar quantas vezes quiser.
-- ==========================================================

-- ----------------------------------------------------------
-- 1) Helper: usuario logado e ADMIN?
-- ----------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------
-- 2) RLS: escrita em modalidades somente por ADMIN
--    (professor continua podendo editar apenas a propria modalidade)
-- ----------------------------------------------------------
drop policy if exists "modalidades_write_auth" on public.modalidades;
drop policy if exists "modalidades_insert_admin" on public.modalidades;
drop policy if exists "modalidades_update_admin" on public.modalidades;
drop policy if exists "modalidades_update_professor" on public.modalidades;
drop policy if exists "modalidades_delete_admin" on public.modalidades;

-- ADMIN pode criar
create policy "modalidades_insert_admin"
  on public.modalidades for insert
  to authenticated
  with check (public.is_admin());

-- ADMIN pode alterar qualquer modalidade
create policy "modalidades_update_admin"
  on public.modalidades for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- PROFESSOR pode alterar apenas a modalidade a que esta vinculado
create policy "modalidades_update_professor"
  on public.modalidades for update
  to authenticated
  using (
    exists (
      select 1 from public.professores p
      where p.perfil_id = auth.uid()
        and p.modalidade_id = modalidades.id
    )
  )
  with check (
    exists (
      select 1 from public.professores p
      where p.perfil_id = auth.uid()
        and p.modalidade_id = modalidades.id
    )
  );

-- ADMIN pode excluir
create policy "modalidades_delete_admin"
  on public.modalidades for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------
-- 3) Storage: bucket publico "modalidades" para as imagens
-- ----------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'modalidades',
  'modalidades',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Leitura publica das imagens
drop policy if exists "modalidades_img_select_public" on storage.objects;
create policy "modalidades_img_select_public"
  on storage.objects for select
  using (bucket_id = 'modalidades');

-- Upload/atualizacao/exclusao apenas por usuario autenticado
drop policy if exists "modalidades_img_insert_auth" on storage.objects;
create policy "modalidades_img_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'modalidades');

drop policy if exists "modalidades_img_update_auth" on storage.objects;
create policy "modalidades_img_update_auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'modalidades')
  with check (bucket_id = 'modalidades');

drop policy if exists "modalidades_img_delete_auth" on storage.objects;
create policy "modalidades_img_delete_auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'modalidades');

-- ----------------------------------------------------------
-- 4) Garante que a coluna imagem_url existe
-- ----------------------------------------------------------
alter table public.modalidades
  add column if not exists imagem_url text;
