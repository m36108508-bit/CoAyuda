import { useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getDeviceId } from '../lib/device'
import { AlertTriangleIcon, CheckIcon, PackageIcon, PlusIcon } from './icons'

function tiempoRelativo(ts) {
  const min = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}
const badge = { alta: 'bg-red-50 text-red-700', media: 'bg-amber-50 text-amber-700', baja: 'bg-emerald-50 text-emerald-700' }
const borde = { alta: 'border-slate-200', media: 'border-slate-200', baja: 'border-slate-200' }
const peso = { alta: 0, media: 1, baja: 2 }

export default function AcopiosView({ acopios, onNuevo }) {
  const activos = useMemo(() =>
    acopios.filter(a => !a.archivado)
      .sort((a, b) => peso[a.gravedad] - peso[b.gravedad] || new Date(b.creado_en) - new Date(a.creado_en))
  , [acopios])
  const archivados = acopios.filter(a => a.archivado)

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

  return (
    <section>
      <h2 className="disp font-bold text-lg mb-3">Zonas críticas y centros de acopio</h2>
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Alta</span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Media</span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Baja</span>
      </div>

      <div className="space-y-4">
        {activos.map(a => (
          <div key={a.id} className={`panel border p-4 ${borde[a.gravedad]}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <PackageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-950">{a.nombre}</h4>
                  <p className="text-xs text-slate-500">{a.direccion}</p>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${badge[a.gravedad]}`}>{a.gravedad.toUpperCase()}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {a.necesidad}
            </p>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[11px] text-slate-400">{tiempoRelativo(a.creado_en)}</span>
              <button onClick={() => votar(a.id)} className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100">
                <CheckIcon className="h-4 w-4" />
                Marcar solucionado ({a.votos_solucionado || 0}/3)
              </button>
            </div>
          </div>
        ))}
        {activos.length === 0 && (
          <p className="text-center text-stone-500 text-sm py-10">Aún no hay reportes de acopio. Registra el primero.</p>
        )}
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
