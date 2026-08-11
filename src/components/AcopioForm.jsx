import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { enqueue } from '../lib/offlineQueue'

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
      onToast('Zona registrada ✓ se sincroniza con otros dispositivos')
    } catch {
      enqueue({ table: 'acopios', payload })
      onToast('Sin conexión: se guardó en tu equipo y se enviará automáticamente')
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="disp font-bold text-lg">Reportar zona / acopio</h3>
          <button onClick={onClose} className="text-2xl leading-none">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-600">Nombre del lugar / zona *</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Dirección / Ciudad *</label>
            <input required value={direccion} onChange={e => setDireccion(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Necesidad urgente *</label>
            <input required placeholder="Ej: falta agua, faltan medicamentos" value={necesidad} onChange={e => setNecesidad(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Nivel de gravedad *</label>
            <select value={gravedad} onChange={e => setGravedad(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <button disabled={saving} type="submit" className="w-full py-3 rounded-lg bg-alert text-white font-bold mt-2 disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
