-- ============================================================
-- Red Sismo Colombia — Esquema Supabase
-- Pega esto completo en: Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PERSONAS ----------
create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cedula text,
  estado text not null check (estado in ('desaparecido','encontrado','salvo')),
  ubicacion text not null,
  telefono text,
  votos_localizado int not null default 0,
  archivado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists votos_personas (
  persona_id uuid references personas(id) on delete cascade,
  device_id text not null,
  creado_en timestamptz not null default now(),
  primary key (persona_id, device_id)  -- un dispositivo = un voto por reporte
);

-- ---------- ACOPIOS / ZONAS CRÍTICAS ----------
create table if not exists acopios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text not null,
  necesidad text not null,
  gravedad text not null check (gravedad in ('alta','media','baja')),
  votos_solucionado int not null default 0,
  archivado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists votos_acopios (
  acopio_id uuid references acopios(id) on delete cascade,
  device_id text not null,
  creado_en timestamptz not null default now(),
  primary key (acopio_id, device_id)
);

-- ============================================================
-- RLS: datos públicos y abiertos, pero SIN edición/borrado directo.
-- El único camino para cambiar un estado "solucionado/localizado"
-- es a través de las funciones RPC de abajo (evita sabotaje trivial).
-- ============================================================
alter table personas enable row level security;
alter table acopios enable row level security;
alter table votos_personas enable row level security;
alter table votos_acopios enable row level security;

create policy "lectura publica personas" on personas for select using (true);
create policy "insercion publica personas" on personas for insert with check (true);
-- No hay policy de UPDATE/DELETE para el rol anon: solo las funciones RPC (SECURITY DEFINER) pueden tocar el estado.

create policy "lectura publica acopios" on acopios for select using (true);
create policy "insercion publica acopios" on acopios for insert with check (true);

-- Las tablas de votos no se leen ni escriben directo desde el cliente, solo vía RPC.
create policy "sin acceso directo votos_personas" on votos_personas for select using (false);
create policy "sin acceso directo votos_acopios" on votos_acopios for select using (false);

-- ============================================================
-- FUNCIONES RPC
-- ============================================================

-- Umbral más alto para personas (el costo de un falso "ya localizado" es muy alto)
create or replace function votar_persona_localizado(p_persona_id uuid, p_device_id text)
returns void
language plpgsql
security definer
as $$
declare v_umbral int := 5;
begin
  insert into votos_personas(persona_id, device_id)
  values (p_persona_id, p_device_id)
  on conflict (persona_id, device_id) do nothing;

  update personas
  set votos_localizado = (select count(*) from votos_personas where persona_id = p_persona_id),
      actualizado_en = now()
  where id = p_persona_id;

  update personas
  set archivado = true
  where id = p_persona_id and votos_localizado >= v_umbral;
end;
$$;

-- Reabrir es siempre más fácil que cerrar: 1 sola llamada, sin umbral.
create or replace function reabrir_persona(p_persona_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update personas set archivado = false, votos_localizado = 0, actualizado_en = now()
  where id = p_persona_id;
  delete from votos_personas where persona_id = p_persona_id;
end;
$$;

-- Acopios: umbral 3, misma lógica
create or replace function votar_acopio_solucionado(p_acopio_id uuid, p_device_id text)
returns void
language plpgsql
security definer
as $$
declare v_umbral int := 3;
begin
  insert into votos_acopios(acopio_id, device_id)
  values (p_acopio_id, p_device_id)
  on conflict (acopio_id, device_id) do nothing;

  update acopios
  set votos_solucionado = (select count(*) from votos_acopios where acopio_id = p_acopio_id),
      actualizado_en = now()
  where id = p_acopio_id;

  update acopios
  set archivado = true
  where id = p_acopio_id and votos_solucionado >= v_umbral;
end;
$$;

create or replace function reabrir_acopio(p_acopio_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update acopios set archivado = false, votos_solucionado = 0, actualizado_en = now()
  where id = p_acopio_id;
  delete from votos_acopios where acopio_id = p_acopio_id;
end;
$$;

-- Permite al cliente (rol anon) ejecutar únicamente estas funciones controladas.
grant execute on function votar_persona_localizado(uuid, text) to anon;
grant execute on function reabrir_persona(uuid) to anon;
grant execute on function votar_acopio_solucionado(uuid, text) to anon;
grant execute on function reabrir_acopio(uuid) to anon;

-- ============================================================
-- REALTIME: para que los reportes aparezcan al instante en todos los
-- dispositivos conectados, sin recargar la página.
-- ============================================================
alter publication supabase_realtime add table personas;
alter publication supabase_realtime add table acopios;
