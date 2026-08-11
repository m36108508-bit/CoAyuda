import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getDeviceId } from '../lib/device'
import {
  CheckIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  ShieldIcon,
  TrashIcon,
  UserIcon
} from './icons'

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
      <div className="panel mb-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-950 shadow-sm shadow-slate-200/40">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Inicio</p>
              <h2 className="disp text-2xl font-black tracking-tight text-slate-950">CoAyuda</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {activas.length} activas
            </span>
            <button
              onClick={onNuevo}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-950/10 transition hover:bg-slate-800"
            >
              Nuevo reporte
            </button>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          Unidos para encontrar a las personas que faltan, ubicar ayuda y actuar con claridad cuando más importa.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">Personas</div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">Ayuda</div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2">Guía</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab('busca')}
          className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition-all ${tab === 'busca' ? 'border-slate-900 bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-[0_10px_24px_rgba(15,23,42,0.20)]' : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-700 shadow-[0_6px_14px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.12)]'}`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            Se busca
          </span>
        </button>
        <button
          onClick={() => setTab('salvo')}
          className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition-all ${tab === 'salvo' ? 'border-emerald-700 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)]' : 'border-slate-200 bg-gradient-to-br from-white to-slate-50 text-slate-700 shadow-[0_6px_14px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.12)]'}`}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            A salvo
          </span>
        </button>
      </div>

      <div className="relative mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por nombre, cédula o ubicación..."
          className="focus-ring w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-base text-slate-800 shadow-sm"
        />
        <span className="absolute left-3 top-3.5 text-slate-400"><SearchIcon className="h-4 w-4" /></span>
      </div>

      <div className="space-y-3">
        {filtradas.map(p => {
          const color = p.estado === 'desaparecido' ? 'border-l-red-600' : p.estado === 'salvo' ? 'border-l-emerald-600' : 'border-l-amber-600'
          return (
            <div key={p.id} className="panel overflow-hidden border border-slate-200 p-0">
              {p.foto_url && (
                <img src={p.foto_url} alt={p.nombre} className="h-44 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{p.nombre}</h4>
                    {p.cedula && <p className="text-xs text-slate-500">CC {p.cedula}</p>}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.estado === 'desaparecido' ? 'bg-red-100 text-red-700' : p.estado === 'salvo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {estadoLabel[p.estado]}
                  </span>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPinIcon className="h-4 w-4 text-slate-500" />
                    <span>{p.ubicacion}</span>
                  </div>
                  {p.telefono && (
                    <a href={`tel:${p.telefono}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <PhoneIcon className="h-3.5 w-3.5" />
                      {p.telefono}
                    </a>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[11px] text-slate-400">{tiempoRelativo(p.creado_en)}</span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button onClick={() => onEditar?.(p)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200">
                      <PencilIcon className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button onClick={() => onEliminar?.(p.id, p.nombre)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100">
                      <TrashIcon className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                    <button onClick={() => compartirReporte(p)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-100">
                      <ShareIcon className="h-3.5 w-3.5" />
                      Compartir
                    </button>
                    <button onClick={() => votar(p.id)} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50">
                      <CheckIcon className="h-3.5 w-3.5" />
                      Ya localizado ({p.votos_localizado || 0}/5)
                    </button>
                  </div>
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
      className="focus-ring hidden sm:inline-flex fixed bottom-24 right-5 z-30 h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)] ring-4 ring-white/80 transition duration-200 hover:scale-105 active:scale-95"
    >
      <PlusIcon className="h-6 w-6 stroke-[2.2]" />
    </button>
  )
}
