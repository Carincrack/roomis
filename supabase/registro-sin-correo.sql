-- Roomies · registro SIN correo de verificación
-- Pega todo esto en Supabase → SQL Editor → New query → Run. Se puede correr varias veces.

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

-- Confirma las cuentas que quedaron esperando el correo de verificación, para que ya puedan entrar
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;

-- Que la API vea la función nueva enseguida
notify pgrst, 'reload schema';
