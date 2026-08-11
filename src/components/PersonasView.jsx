import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getDeviceId } from '../lib/device'

function normaliza(s = '') {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
function tiempoRelativo(ts) {
  const min = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}
const estadoLabel = { desaparecido: 'Desaparecido', encontrado: 'Encontrado', salvo: 'A salvo' }

export default function PersonasView({ personas, onNuevo, onEditar, onEliminar }) {
  const [tab, setTab] = useState('busca')
  const [q, setQ] = useState('')

  const activas = useMemo(
    () => personas.filter(p => !p.archivado && p.estado === 'desaparecido'),
    [personas]
  )

  const filtradas = useMemo(() => {
    const term = normaliza(q)
    return personas
      .filter(p => !p.archivado)
      .filter(p => (tab === 'busca' ? p.estado === 'desaparecido' : p.estado !== 'desaparecido'))
      .filter(p => !term || normaliza(p.nombre).includes(term) || normaliza(p.cedula || '').includes(term) || normaliza(p.ubicacion || '').includes(term))
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
  }, [personas, tab, q])

  async function votar(id) {
    const { error } = await supabase.rpc('votar_persona_localizado', {
      p_persona_id: id,
      p_device_id: getDeviceId()
    })
    if (error) console.error(error)
  }

  async function reabrir(id) {
    const { error } = await supabase.rpc('reabrir_persona', { p_persona_id: id })
    if (error) console.error(error)
  }

  async function compartirReporte(p) {
    const texto = `CoAyuda: ${p.nombre} está reportado como ${estadoLabel[p.estado].toLowerCase()} en ${p.ubicacion}. Contacto: ${p.telefono || 'No indicado'}.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `CoAyuda - ${p.nombre}`,
          text: texto,
          url: window.location.href
        })
        return
      } catch {
        // sigue con la copia al portapapeles
      }
    }

    await navigator.clipboard.writeText(texto)
    window.alert('Se copió el dato del reporte para compartirlo.')
  }

  return (
    <section>
      <div className="panel mb-4 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="brand-mark">C</div>
            <div>
              <p className="section-label mb-1">Inicio</p>
              <h2 className="disp text-xl font-black tracking-tight text-slate-900">CoAyuda</h2>
            </div>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
            {activas.length} activas
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Reporta personas, ubica centros de ayuda y comparte información útil para la comunidad.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab('busca')}
          className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${tab === 'busca' ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200' : 'border-slate-200 bg-white text-slate-700'}`}
        >🔴 Se busca</button>
        <button
          onClick={() => setTab('salvo')}
          className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition ${tab === 'salvo' ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'border-slate-200 bg-white text-slate-700'}`}
        >🟢 A salvo</button>
      </div>

      <div className="relative mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por nombre, cédula o ubicación..."
          className="focus-ring w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-base text-slate-800 shadow-sm"
        />
        <span className="absolute left-3 top-3 text-slate-400">🔎</span>
      </div>

      <div className="space-y-3">
        {filtradas.map(p => {
          const color = p.estado === 'desaparecido' ? 'border-l-red-600' : p.estado === 'salvo' ? 'border-l-emerald-600' : 'border-l-amber-600'
          return (
            <div key={p.id} className={`panel border-l-4 p-4 ${color}`}>
              {p.foto_url && (
                <img src={p.foto_url} alt={p.nombre} className="mb-3 h-40 w-full object-cover rounded-lg border border-slate-200" />
              )}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-base">{p.nombre}</h4>
                  {p.cedula && <p className="text-xs text-stone-500">CC {p.cedula}</p>}
                </div>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${p.estado === 'desaparecido' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {estadoLabel[p.estado]}
                </span>
              </div>
              <p className="text-sm mt-2">📍 {p.ubicacion}</p>
              {p.telefono && <a href={`tel:${p.telefono}`} className="text-sm text-blue-700 font-semibold underline">📞 {p.telefono}</a>}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                <span className="text-[11px] text-stone-400">{tiempoRelativo(p.creado_en)}</span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button onClick={() => onEditar?.(p)} className="focus-ring rounded-full bg-blue-100 px-2.5 py-1.5 text-[11px] font-bold text-blue-700">
                    ✏️ Editar
                  </button>
                  <button onClick={() => onEliminar?.(p.id, p.nombre)} className="focus-ring rounded-full bg-red-100 px-2.5 py-1.5 text-[11px] font-bold text-red-700">
                    🗑 Eliminar
                  </button>
                  <button onClick={() => compartirReporte(p)} className="focus-ring rounded-full bg-sky-100 px-2.5 py-1.5 text-[11px] font-bold text-sky-700">
                    ↗ Compartir
                  </button>
                  <button onClick={() => votar(p.id)} className="focus-ring rounded-full bg-stone-100 px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-200">
                    ✓ Ya localizado ({p.votos_localizado || 0}/5)
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {filtradas.length === 0 && (
          <p className="text-center text-stone-500 text-sm py-10">No hay reportes en esta pestaña todavía.</p>
        )}
      </div>

      <ArchivadosPersonas personas={personas} onReabrir={reabrir} />

      <FabButton onClick={onNuevo} />
    </section>
  )
}

function ArchivadosPersonas({ personas, onReabrir }) {
  const archivados = personas.filter(p => p.archivado)
  if (archivados.length === 0) return null
  return (
    <div className="mt-6 pt-4 border-t border-dashed border-line">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Posiblemente resueltos ({archivados.length})</p>
      <div className="space-y-2">
        {archivados.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-stone-100 rounded-lg px-3 py-2 text-sm">
            <span className="text-stone-500">{p.nombre} — marcado localizado {p.votos_localizado}×</span>
            <button onClick={() => onReabrir(p.id)} className="focus-ring text-xs font-bold text-alert underline shrink-0 ml-2">Sigue faltando, reabrir</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function FabButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="focus-ring fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-alert text-white text-3xl font-bold shadow-xl flex items-center justify-center active:scale-95 transition"
    >+</button>
  )
}
