import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { enqueue } from '../lib/offlineQueue'

function normaliza(s = '') {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function PersonaForm({ personas, onClose, onToast }) {
  const [nombre, setNombre] = useState('')
  const [cedula, setCedula] = useState('')
  const [estado, setEstado] = useState('desaparecido')
  const [ubicacion, setUbicacion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving, setSaving] = useState(false)

  const duplicado = nombre.trim().length > 2
    ? personas.find(p => normaliza(p.nombre) === normaliza(nombre))
    : null

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { nombre: nombre.trim(), cedula: cedula.trim() || null, estado, ubicacion: ubicacion.trim(), telefono: telefono.trim() || null }

    try {
      if (duplicado) {
        const { error } = await supabase.from('personas')
          .update({ ...payload, actualizado_en: new Date().toISOString() })
          .eq('id', duplicado.id)
        if (error) throw error
        onToast('Reporte actualizado ✓')
      } else {
        const { error } = await supabase.from('personas').insert(payload)
        if (error) throw error
        onToast('Reporte guardado ✓ se sincroniza con otros dispositivos')
      }
    } catch (err) {
      // Sin internet o Supabase no responde: se guarda para reintentar después.
      enqueue({ table: 'personas', payload })
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
          <h3 className="disp font-bold text-lg">Reportar persona</h3>
          <button onClick={onClose} className="text-2xl leading-none">✕</button>
        </div>

        {duplicado && (
          <div className="mb-3 p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-sm">
            Ya existe un reporte para <strong>{duplicado.nombre}</strong>. Si guardas, se <strong>actualizará</strong> ese reporte en vez de duplicarlo.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-600">Nombre completo *</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Cédula / Identificación (opcional)</label>
            <input value={cedula} onChange={e => setCedula(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Estado *</label>
            <select value={estado} onChange={e => setEstado(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1">
              <option value="desaparecido">Desaparecido</option>
              <option value="encontrado">Encontrado</option>
              <option value="salvo">A salvo</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Última ubicación conocida *</label>
            <input required value={ubicacion} onChange={e => setUbicacion(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600">Teléfono de contacto</label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="focus-ring w-full border border-line rounded-lg p-2.5 mt-1" />
          </div>
          <button disabled={saving} type="submit" className="w-full py-3 rounded-lg bg-alert text-white font-bold mt-2 disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
