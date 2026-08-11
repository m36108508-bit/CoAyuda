# Red Sismo Colombia

PWA offline-first para ayuda humanitaria: personas desaparecidas/a salvo, zonas
críticas y acopios, guía de emergencia. Backend con Supabase (Postgres + Realtime).

## 1. Crear el backend (5 min)

1. Ve a https://supabase.com → **New project** (elige la región más cercana, ej. `sa-east-1`).
2. Cuando esté listo, entra a **SQL Editor → New query**, pega **todo** el contenido de
   `supabase/schema.sql` y dale **Run**. Esto crea las tablas, la seguridad (RLS) y las
   funciones anti-manipulación de votos.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

## 2. Configurar el proyecto (2 min)

```bash
npm install
cp .env.example .env
# pega tu Project URL y anon key en .env
npm run dev
```

Abre `http://localhost:5173` — deberías ver la app funcionando y ya sincronizando
contra tu Supabase real.

## 3. Desplegar (3 min)

### Railway
```bash
# 1) crea un repo en GitHub
# 2) sube el proyecto y conéctalo a Railway
# 3) agrega estas variables de entorno en Railway:
#    VITE_SUPABASE_URL
#    VITE_SUPABASE_ANON_KEY
```
En Railway, usa el comando de build por defecto (`npm install && npm run build`) y
el comando de start: `npm run start`. El script `start` ya ajusta el puerto de forma
compatible con Railway y con Windows.

### Vercel
```bash
npm i -g vercel
vercel
```
En el panel de Vercel, agrega las variables de entorno `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` (Project Settings → Environment Variables), y vuelve a
desplegar (`vercel --prod`).

### Netlify
```bash
npm run build
```
Sube la carpeta `dist/` desde el panel de Netlify, o conecta el repo de GitHub y
configura las mismas variables de entorno en **Site settings → Environment variables**.
Build command: `npm run build` · Publish directory: `dist`.

## Subir a GitHub
```bash
git init
git checkout -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Despliegue en Railway
1. Crea una cuenta en https://railway.app
2. Entra a **New Project → Deploy from GitHub Repo**
3. Selecciona tu repositorio
4. Agrega las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
5. Railway ejecutará `npm install && npm run build` y luego `npm run start`
6. La app quedará disponible con la URL pública que te proporcione Railway

## Cómo funciona la protección contra manipulación de votos

- Un dispositivo solo puede votar **una vez** por reporte (restricción única en la
  base de datos, no solo en el navegador).
- Los votos de "ya localizado / ya solucionado" no borran nada: el reporte pasa a
  **"Posiblemente resuelto"** y sigue visible, con un botón de un clic para reabrirlo.
- Personas desaparecidas necesitan **5 votos** para archivarse; acopios necesitan **3**
  (el costo de un falso "ya localizado" es mucho más alto).

## Qué falta si quieres reforzar aún más (no bloquea el lanzamiento de hoy)

- Rate limiting de inserciones (Supabase Edge Function) para frenar spam masivo.
- Moderación básica: un canal de Slack/Telegram que reciba cada nuevo reporte para
  que un voluntario le eche un ojo.
- Exportar los datos abiertos (CSV/JSON) para que Cruz Roja/Defensa Civil los usen
  directamente.
