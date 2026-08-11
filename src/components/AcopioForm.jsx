import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { enqueue } from '../lib/offlineQueue'
import { XIcon } from './icons'

export default function AcopioForm({ onClose, onToast }) {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [necesidad, setNecesidad] = useState('')
  const [gravedad, setGravedad] = useState('alta')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { nombre: nombre.trim(), direccion: direccion.trim(), necesidad: necesidad.trim(), gravedad }
    try {
      const { error } = await supabase.from('acopios').insert(payload)
      if (error) throw error
      onToast('Zona registrada y sincronizada')
    } catch {
      enqueue({ table: 'acopios', payload })
      onToast('Sin conexión: se guardó en tu equipo y se enviará automáticamente')
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="section-label mb-1">Reporte</p>
            <h3 className="disp text-lg font-black text-slate-900">Zona / acopio</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del lugar / zona *</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus-ring" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Dirección / Ciudad *</label>
            <input required value={direccion} onChange={e => setDireccion(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus-ring" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Necesidad urgente *</label>
            <input required placeholder="Ej: falta agua, faltan medicamentos" value={necesidad} onChange={e => setNecesidad(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus-ring" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Nivel de gravedad *</label>
            <select value={gravedad} onChange={e => setGravedad(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus-ring">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <button disabled={saving} type="submit" className="primary-button mt-2 w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
