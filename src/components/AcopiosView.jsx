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
const badge = { alta: 'bg-red-100 text-red-800', media: 'bg-amber-100 text-amber-800', baja: 'bg-emerald-100 text-emerald-800' }
const borde = { alta: 'border-l-red-600', media: 'border-l-amber-600', baja: 'border-l-emerald-600' }
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
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-red-800">● Alta</span>
        <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-amber-800">● Media</span>
        <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-emerald-800">● Baja</span>
      </div>

      <div className="space-y-3">
        {activos.map(a => (
          <div key={a.id} className={`panel border-l-4 p-4 ${borde[a.gravedad]}`}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <PackageIcon className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-base text-slate-900">{a.nombre}</h4>
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${badge[a.gravedad]}`}>{a.gravedad.toUpperCase()}</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">{a.direccion}</p>
            <p className="mt-2 flex items-start gap-2 text-sm font-medium text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <AlertTriangleIcon className="h-3.5 w-3.5" />
              </span>
              {a.necesidad}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
              <span className="text-[11px] text-stone-400">{tiempoRelativo(a.creado_en)}</span>
              <button onClick={() => votar(a.id)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-200">
                <CheckIcon className="h-3.5 w-3.5" />
                Ya solucionado ({a.votos_solucionado || 0}/3)
              </button>
            </div>
          </div>
        ))}
        {activos.length === 0 && (
          <p className="text-center text-stone-500 text-sm py-10">Aún no hay reportes de acopio. Registra el primero.</p>
        )}
      </div>

      {archivados.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dashed border-line">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Posiblemente resueltos ({archivados.length})</p>
          <div className="space-y-2">
            {archivados.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-stone-100 rounded-lg px-3 py-2 text-sm">
                <span className="text-stone-500">{a.nombre} — marcado solucionado {a.votos_solucionado}×</span>
                <button onClick={() => reabrir(a.id)} className="focus-ring text-xs font-bold text-alert underline shrink-0 ml-2">Sigue faltando, reabrir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNuevo}
        className="focus-ring fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-alert text-white shadow-xl transition active:scale-95"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </section>
  )
}
