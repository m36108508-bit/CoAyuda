import { useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getDeviceId } from '../lib/device'
import { AlertTriangleIcon, CheckIcon, PackageIcon, PlusIcon, TrashIcon } from './icons'

function tiempoRelativo(ts) {
  const min = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}
const badge = { alta: 'bg-red-50 text-red-700', media: 'bg-amber-50 text-amber-700', baja: 'bg-emerald-50 text-emerald-700' }
const peso = { alta: 0, media: 1, baja: 2 }
const tipoMeta = {
  zona_critica: {
    label: 'Zona crítica',
    title: 'Zonas críticas',
    badge: 'border-red-200 bg-red-50 text-red-700',
    card: 'border-red-200 bg-gradient-to-br from-red-50/80 via-white to-red-100/70 shadow-sm shadow-red-100/70'
  },
  centro_acopio: {
    label: 'Centro de acopio',
    title: 'Centros de acopio',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    card: 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/70 shadow-sm shadow-emerald-100/70'
  }
}

export default function AcopiosView({ acopios, onNuevo, onDelete }) {
  const activos = useMemo(() =>
    acopios.filter(a => !a.archivado)
      .sort((a, b) => peso[a.gravedad] - peso[b.gravedad] || new Date(b.creado_en) - new Date(a.creado_en))
  , [acopios])
  const archivados = acopios.filter(a => a.archivado)
  const zonasCriticas = activos.filter(a => (a.tipo || 'zona_critica') === 'zona_critica')
  const centrosAcopio = activos.filter(a => (a.tipo || 'zona_critica') === 'centro_acopio')

  async function votar(id) {
    const { error } = await supabase.rpc('votar_acopio_solucionado', {
      p_acopio_id: id,
      p_device_id: getDeviceId()
    })
    if (error) console.error(error)
  }
  async function reabrir(id) {
    const { error } = await supabase.rpc('reabrir_acopio', { p_acopio_id: id })
    if (error) console.error(error)
  }

  function renderCard(a) {
    const tipo = a.tipo || 'zona_critica'
    const meta = tipoMeta[tipo] || tipoMeta.zona_critica

    return (
      <div key={a.id} className={`panel border p-4 ${meta.card}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tipo === 'centro_acopio' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              <PackageIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-950">{a.nombre}</h4>
              <p className="text-xs text-slate-500">{a.direccion}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${meta.badge}`}>{meta.label}</span>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${badge[a.gravedad]}`}>{a.gravedad.toUpperCase()}</span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{a.necesidad}</p>
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] text-slate-400">{tiempoRelativo(a.creado_en)}</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onDelete?.(a.id, a.nombre)} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50">
              <TrashIcon className="h-3.5 w-3.5" />
              Eliminar
            </button>
            <button onClick={() => votar(a.id)} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
              <CheckIcon className="h-4 w-4" />
              Marcar solucionado ({a.votos_solucionado || 0}/3)
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangleIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="disp font-bold text-lg text-slate-950">Ayuda y respuesta rápida</h2>
            <p className="text-sm text-slate-500">Registra zonas críticas y centros de acopio para orientar mejor la ayuda.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950">Zonas críticas</h3>
              <p className="text-sm text-slate-500">Puntos de riesgo y áreas que requieren atención inmediata.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {zonasCriticas.map(renderCard)}
            {zonasCriticas.length === 0 && (<p className="py-4 text-center text-sm text-stone-500">Aún no hay zonas críticas registradas.</p>)}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 p-4 shadow-sm shadow-emerald-100/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <PackageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="disp font-bold text-lg text-slate-950">Centros de acopio</h3>
              <p className="text-sm text-slate-600">Puntos de ayuda y distribución para la comunidad.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {centrosAcopio.map(renderCard)}
            {centrosAcopio.length === 0 && (<p className="py-4 text-center text-sm text-stone-500">Aún no hay centros de acopio registrados.</p>)}
          </div>
        </div>
      </div>

      {archivados.length > 0 && (
        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Posiblemente resueltos ({archivados.length})</p>
          <div className="space-y-3">
            {archivados.map(a => (
              <div key={a.id} className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-slate-600">{a.nombre} — marcado solucionado {a.votos_solucionado}×</span>
                <button onClick={() => reabrir(a.id)} className="focus-ring text-xs font-semibold text-red-600 transition hover:text-red-700">
                  Reabrir reporte
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNuevo}
        className="focus-ring fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)] ring-4 ring-white/80 transition duration-200 hover:scale-105 active:scale-95"
      >
        <PlusIcon className="h-6 w-6 stroke-[2.2]" />
      </button>
    </section>
  )
}
