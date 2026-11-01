-- =====================================================================
-- Roomies · esquema real (Supabase Auth + hogares con código + tiempo real)
-- Cada persona ve solo los datos de los hogares donde es miembro activo.
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;
create schema if not exists privado;          -- funciones auxiliares, no expuestas por la API

-- ---------- Tablas ----------
create table if not exists public.perfiles (
  id      uuid primary key references auth.users (id) on delete cascade,
  nombre  text not null,
  corto   text not null,
  ini     text not null,
  color   text not null,
  creado  timestamptz not null default now()
);

create table if not exists public.hogares (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null check (char_length(nombre) between 1 and 40),
  ubicacion    text not null default '',
  codigo       text not null unique,
  integrantes  integer not null default 4 check (integrantes between 1 and 12),
  reglas       jsonb not null default '{"aprobar": true, "dividir": true, "alertas": true}',
  admin        uuid not null references public.perfiles (id),
  creado       timestamptz not null default now()
);
create index if not exists hogares_admin_idx on public.hogares (admin);

create table if not exists public.miembros (
  hogar_id   uuid not null references public.hogares (id) on delete cascade,
  perfil_id  uuid not null references public.perfiles (id) on delete cascade,
  rol        text not null default 'miembro' check (rol in ('admin', 'miembro')),
  estado     text not null default 'pendiente' check (estado in ('pendiente', 'activo')),
  creado     timestamptz not null default now(),
  primary key (hogar_id, perfil_id)
);
create index if not exists miembros_perfil_idx on public.miembros (perfil_id);

create table if not exists public.tareas (
  id        uuid primary key default gen_random_uuid(),
  hogar_id  uuid not null references public.hogares (id) on delete cascade,
  titulo    text not null check (char_length(titulo) between 1 and 60),
  lugar     text not null default 'Casa',
  asignado  uuid not null references public.perfiles (id),
  por       uuid not null references public.perfiles (id),
  vence     timestamptz not null,
  estado    text not null default 'pendiente' check (estado in ('pendiente', 'progreso', 'completada')),
  repite    boolean not null default false,
  alertas   text[] not null default '{}',
  avisar    boolean not null default false,
  creado    timestamptz not null default now()
);
create index if not exists tareas_hogar_idx on public.tareas (hogar_id);
create index if not exists tareas_asignado_idx on public.tareas (asignado);
create index if not exists tareas_por_idx on public.tareas (por);

create table if not exists public.gastos (
  id        uuid primary key default gen_random_uuid(),
  hogar_id  uuid not null references public.hogares (id) on delete cascade,
  titulo    text not null check (char_length(titulo) between 1 and 40),
  cat       text not null default 'recibo',
  monto     integer not null check (monto > 0),          -- colones
  pago      uuid not null references public.perfiles (id),
  entre     uuid[] not null default '{}',
  pagados   uuid[] not null default '{}',
  fecha     timestamptz not null default now()
);
create index if not exists gastos_hogar_idx on public.gastos (hogar_id);
create index if not exists gastos_pago_idx on public.gastos (pago);

create table if not exists public.avisos (
  id        uuid primary key default gen_random_uuid(),
  hogar_id  uuid not null references public.hogares (id) on delete cascade,
  cat       text not null check (cat in ('tareas', 'hogar', 'gastos')),
  tipo      text not null,
  tarea     uuid,
  gasto     uuid,
  persona   uuid,
  hora      timestamptz not null default now()
);
create index if not exists avisos_hogar_idx on public.avisos (hogar_id);

create table if not exists public.mensajes (
  id        uuid primary key default gen_random_uuid(),
  hogar_id  uuid not null references public.hogares (id) on delete cascade,
  autor     uuid not null references public.perfiles (id),
  texto     text not null check (char_length(texto) between 1 and 1000),
  creado    timestamptz not null default now()
);
create index if not exists mensajes_hogar_creado_idx on public.mensajes (hogar_id, creado);
create index if not exists mensajes_autor_idx on public.mensajes (autor);

-- ---------- Perfil automático al registrarse ----------
create or replace function privado.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  n text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1));
  partes text[] := regexp_split_to_array(n, '\s+');
  colores text[] := array['#CFE0C3', '#B7D3BC', '#8FBDB5', '#E9C46A', '#C6D4DD', '#E5B8A8'];
begin
  insert into public.perfiles (id, nombre, corto, ini, color)
  values (
    new.id, n, partes[1],
    upper(left(partes[1], 1) || coalesce(left(partes[2], 1), substr(partes[1], 2, 1))),
    colores[1 + abs(hashtext(new.id::text)) % array_length(colores, 1)]
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function privado.crear_perfil();

-- ---------- Funciones de acceso (usadas por las políticas) ----------
create or replace function privado.es_miembro(h uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.miembros m where m.hogar_id = h and m.perfil_id = (select auth.uid()) and m.estado = 'activo');
$$;
create or replace function privado.es_admin(h uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.miembros m where m.hogar_id = h and m.perfil_id = (select auth.uid()) and m.estado = 'activo' and m.rol = 'admin');
$$;
create or replace function privado.tiene_fila(h uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.miembros m where m.hogar_id = h and m.perfil_id = (select auth.uid()));
$$;
create or replace function privado.comparte_hogar(p uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros yo join public.miembros otro on otro.hogar_id = yo.hogar_id
    where yo.perfil_id = (select auth.uid()) and otro.perfil_id = p
  );
$$;
revoke all on all functions in schema privado from public, anon;
grant usage on schema privado to authenticated;
grant execute on all functions in schema privado to authenticated;

-- ---------- Seguridad por filas ----------
alter table public.perfiles enable row level security;
alter table public.hogares  enable row level security;
alter table public.miembros enable row level security;
alter table public.tareas   enable row level security;
alter table public.gastos   enable row level security;
alter table public.avisos   enable row level security;
alter table public.mensajes enable row level security;

revoke all on public.perfiles, public.hogares, public.miembros, public.tareas, public.gastos, public.avisos, public.mensajes from anon;
grant select, update on public.perfiles to authenticated;
grant select, delete on public.hogares to authenticated;
grant update (nombre, ubicacion, integrantes, reglas) on public.hogares to authenticated;   -- código y admin no se editan desde la app
grant select, delete on public.miembros to authenticated;
grant update (rol, estado) on public.miembros to authenticated;
grant select, insert, update, delete on public.tareas, public.gastos, public.avisos to authenticated;
grant select, insert, delete on public.mensajes to authenticated;

drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or privado.comparte_hogar(id));
drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists hogares_ver on public.hogares;
create policy hogares_ver on public.hogares for select to authenticated using (privado.tiene_fila(id));
drop policy if exists hogares_editar on public.hogares;
create policy hogares_editar on public.hogares for update to authenticated
  using (privado.es_miembro(id)) with check (privado.es_miembro(id));
drop policy if exists hogares_borrar on public.hogares;
create policy hogares_borrar on public.hogares for delete to authenticated using (privado.es_admin(id));

drop policy if exists miembros_ver on public.miembros;
create policy miembros_ver on public.miembros for select to authenticated
  using (perfil_id = (select auth.uid()) or privado.es_miembro(hogar_id));
drop policy if exists miembros_aprobar on public.miembros;
create policy miembros_aprobar on public.miembros for update to authenticated
  using (privado.es_admin(hogar_id)) with check (privado.es_admin(hogar_id));
drop policy if exists miembros_quitar on public.miembros;
create policy miembros_quitar on public.miembros for delete to authenticated
  using (privado.es_admin(hogar_id) or perfil_id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['tareas', 'gastos', 'avisos'] loop
    execute format('drop policy if exists %I on public.%I', t || '_ver', t);
    execute format('drop policy if exists %I on public.%I', t || '_crear', t);
    execute format('drop policy if exists %I on public.%I', t || '_editar', t);
    execute format('drop policy if exists %I on public.%I', t || '_borrar', t);
    execute format('create policy %I on public.%I for select to authenticated using (privado.es_miembro(hogar_id))', t || '_ver', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (privado.es_miembro(hogar_id))', t || '_crear', t);
    execute format('create policy %I on public.%I for update to authenticated using (privado.es_miembro(hogar_id)) with check (privado.es_miembro(hogar_id))', t || '_editar', t);
    execute format('create policy %I on public.%I for delete to authenticated using (privado.es_miembro(hogar_id))', t || '_borrar', t);
  end loop;
end $$;

drop policy if exists mensajes_ver on public.mensajes;
create policy mensajes_ver on public.mensajes for select to authenticated using (privado.es_miembro(hogar_id));
drop policy if exists mensajes_enviar on public.mensajes;
create policy mensajes_enviar on public.mensajes for insert to authenticated
  with check (privado.es_miembro(hogar_id) and autor = (select auth.uid()));
drop policy if exists mensajes_borrar on public.mensajes;
create policy mensajes_borrar on public.mensajes for delete to authenticated using (autor = (select auth.uid()));

-- ---------- Acciones del flujo de hogar (RPC) ----------
-- Crear hogar: lo crea, deja a quien lo crea como admin y devuelve la fila
create or replace function public.crear_hogar(p_nombre text, p_integrantes integer, p_reglas jsonb)
returns public.hogares language plpgsql security definer set search_path = '' as $$
declare
  yo uuid := (select auth.uid());
  letras constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  cod text; h public.hogares;
begin
  if yo is null then raise exception 'Inicia sesión para crear un hogar'; end if;
  if exists (select 1 from public.miembros where perfil_id = yo) then
    raise exception 'Ya perteneces a un hogar o tienes una solicitud pendiente';
  end if;
  loop
    cod := '';
    for i in 1..6 loop cod := cod || substr(letras, 1 + floor(random() * length(letras))::int, 1); end loop;
    exit when not exists (select 1 from public.hogares where codigo = cod);
  end loop;
  insert into public.hogares (nombre, codigo, integrantes, reglas, admin)
  values (trim(p_nombre), cod, coalesce(p_integrantes, 4), coalesce(p_reglas, '{"aprobar": true, "dividir": true, "alertas": true}'), yo)
  returning * into h;
  insert into public.miembros (hogar_id, perfil_id, rol, estado) values (h.id, yo, 'admin', 'activo');
  return h;
end $$;

-- Buscar por código: solo datos públicos del hogar (nombre, cantidad, admin)
create or replace function public.buscar_hogar(p_codigo text)
returns table (id uuid, nombre text, ubicacion text, codigo text, miembros integer, admin_nombre text, iniciales text[])
language sql stable security definer set search_path = '' as $$
  select h.id, h.nombre, h.ubicacion, h.codigo,
         (select count(*)::int from public.miembros m where m.hogar_id = h.id and m.estado = 'activo'),
         (select p.corto from public.perfiles p where p.id = h.admin),
         array(select p.ini from public.miembros m join public.perfiles p on p.id = m.perfil_id
               where m.hogar_id = h.id and m.estado = 'activo' order by m.creado limit 4)
  from public.hogares h
  where (select auth.uid()) is not null and h.codigo = upper(trim(p_codigo));
$$;

-- Unirse: crea la solicitud (o entra directo si el hogar no pide aprobación) y avisa al hogar
create or replace function public.solicitar_unirse(p_codigo text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  yo uuid := (select auth.uid()); h public.hogares; est text;
begin
  if yo is null then raise exception 'Inicia sesión para unirte'; end if;
  select * into h from public.hogares where codigo = upper(trim(p_codigo));
  if not found then raise exception 'No hay un hogar con ese código'; end if;
  if exists (select 1 from public.miembros where perfil_id = yo) then
    raise exception 'Ya perteneces a un hogar o tienes una solicitud pendiente';
  end if;
  est := case when coalesce((h.reglas ->> 'aprobar')::boolean, true) then 'pendiente' else 'activo' end;
  insert into public.miembros (hogar_id, perfil_id, rol, estado) values (h.id, yo, 'miembro', est);
  insert into public.avisos (hogar_id, cat, tipo, persona) values (h.id, 'hogar', 'solicitud', yo);
  return est;
end $$;

revoke execute on function public.crear_hogar(text, integer, jsonb), public.buscar_hogar(text), public.solicitar_unirse(text) from public, anon;
grant execute on function public.crear_hogar(text, integer, jsonb), public.buscar_hogar(text), public.solicitar_unirse(text) to authenticated;

-- ---------- Tiempo real ----------
do $$
declare t text;
begin
  foreach t in array array['perfiles', 'hogares', 'miembros', 'tareas', 'gastos', 'avisos', 'mensajes'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- Registro sin confirmación por correo ----------
-- Crea la cuenta ya confirmada (sin enviar correos) y la app inicia sesión enseguida.
-- Es tan abierto como un registro público normal; para producción conviene volver a Supabase Auth con confirmación.
create or replace function public.registrar_cuenta(p_nombre text, p_correo text, p_clave text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := gen_random_uuid();
  c text := lower(trim(p_correo));
  n text := regexp_replace(trim(p_nombre), '[[:space:]]+', ' ', 'g');
begin
  if c !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]{2,}$' then raise exception 'Correo no válido'; end if;
  if char_length(coalesce(p_clave, '')) < 8 then raise exception 'Password should be at least 8 characters'; end if;
  if char_length(n) not between 2 and 60 or n ~ '[<>&"''`]' then raise exception 'Nombre no válido'; end if;
  if exists (select 1 from auth.users u where u.email = c) then raise exception 'User already registered'; end if;

  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                          confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', c,
          extensions.crypt(p_clave, extensions.gen_salt('bf')), now(),
          '{"provider": "email", "providers": ["email"]}', jsonb_build_object('nombre', n), now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text,
          jsonb_build_object('sub', uid::text, 'email', c, 'email_verified', true),
          'email', now(), now(), now());
  return uid;
end $$;
revoke execute on function public.registrar_cuenta(text, text, text) from public;
grant execute on function public.registrar_cuenta(text, text, text) to anon, authenticated;

-- ---------- Usuario de prueba: Bairon (sin hogar, listo para crear o unirse) ----------
-- Correo: bairon@roomies.cr · Contraseña: roomies2026
do $$
begin
  if not exists (select 1 from auth.users where email = 'bairon@roomies.cr') then
    perform public.registrar_cuenta('Bairon Fallas', 'bairon@roomies.cr', 'roomies2026');
  end if;
end $$;

-- Que la API vea las funciones nuevas sin esperar
notify pgrst, 'reload schema';
