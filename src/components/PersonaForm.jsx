import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { buildQueuedPersonaPayload, enqueue } from '../lib/offlineQueue'
import { buildPersonaPayload } from '../lib/personaHelpers'
import { XIcon } from './icons'

function normaliza(s = '') {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}

function parseStoragePathFromUrl(url) {
  if (!url) return null
  const match = url.match(/\/personas\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function PersonaForm({ personas, persona, onClose, onToast }) {
  const [nombre, setNombre] = useState(persona?.nombre || '')
  const [cedula, setCedula] = useState(persona?.cedula || '')
  const [estado, setEstado] = useState(persona?.estado || 'desaparecido')
  const [ubicacion, setUbicacion] = useState(persona?.ubicacion || '')
  const [telefono, setTelefono] = useState(persona?.telefono || '')
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(persona?.foto_url || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return () => {
      if (fotoPreview && fotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(fotoPreview)
      }
    }
  }, [fotoPreview])

  const duplicado = !persona && nombre.trim().length > 2
    ? personas.find(p => normaliza(p.nombre) === normaliza(nombre))
    : null

  async function deleteOldPhoto() {
    if (!persona?.foto_url) return
    const path = parseStoragePathFromUrl(persona.foto_url)
    if (!path) return
    await supabase.storage.from('personas').remove([path])
  }

  async function uploadFoto() {
    if (persona && !fotoFile) {
      return persona.foto_url || null
    }
    if (!fotoFile) return null

    const ext = fotoFile.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('personas')
      .upload(fileName, fotoFile, { upsert: true, cacheControl: '3600' })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('personas').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = buildPersonaPayload({
        nombre,
        cedula,
        estado,
        ubicacion,
        telefono,
        foto_url: persona?.foto_url || ''
      })

      if (persona) {
        const fotoUrl = await uploadFoto()
        if (fotoFile && persona.foto_url) {
          await deleteOldPhoto()
        }
        const { error } = await supabase.rpc('update_persona', {
          p_persona_id: persona.id,
          p_nombre: payload.nombre,
          p_cedula: payload.cedula,
          p_estado: payload.estado,
          p_ubicacion: payload.ubicacion,
          p_telefono: payload.telefono,
          p_foto_url: fotoUrl || payload.foto_url || null
        })
        if (error) throw error
        onToast('Reporte actualizado')
      } else {
        const foto_url = await uploadFoto()
        const insertPayload = buildPersonaPayload({ nombre, cedula, estado, ubicacion, telefono, foto_url })
        if (duplicado) {
          const { error } = await supabase.from('personas')
            .update({ ...insertPayload, actualizado_en: new Date().toISOString() })
            .eq('id', duplicado.id)
          if (error) throw error
          onToast('Reporte actualizado')
        } else {
          const { error } = await supabase.from('personas').insert(insertPayload)
          if (error) throw error
          onToast('Reporte guardado y sincronizado')
        }
      }
    } catch (err) {
      console.error(err)
      const fotoDataUrl = fotoFile ? await readAsDataUrl(fotoFile) : null
      const offlinePayload = buildPersonaPayload({ nombre, cedula, estado, ubicacion, telefono, foto_url: null })
      enqueue({ table: 'personas', payload: buildQueuedPersonaPayload(offlinePayload, fotoDataUrl) })
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
          <div>
            <p className="section-label mb-1">Ficha</p>
            <h3 className="disp font-bold text-lg text-slate-800">{persona ? 'Editar persona' : 'Reportar persona'}</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {!persona && duplicado && (
          <div className="mb-3 p-3 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-sm">
            Ya existe un reporte para <strong>{duplicado.nombre}</strong>. Si guardas, se <strong>actualizará</strong> ese reporte en vez de duplicarlo.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre completo *</label>
            <input required value={nombre} onChange={e => setNombre(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-lg p-2.5 mt-1 bg-white text-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Cédula / Identificación (opcional)</label>
            <input value={cedula} onChange={e => setCedula(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-lg p-2.5 mt-1 bg-white text-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Estado *</label>
            <select value={estado} onChange={e => setEstado(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-lg p-2.5 mt-1 bg-white text-slate-800">
              <option value="desaparecido">Desaparecido</option>
              <option value="encontrado">Encontrado</option>
              <option value="salvo">A salvo</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Última ubicación conocida *</label>
            <input required value={ubicacion} onChange={e => setUbicacion(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-lg p-2.5 mt-1 bg-white text-slate-800" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Teléfono de contacto</label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="focus-ring w-full border border-slate-200 rounded-lg p-2.5 mt-1 bg-white text-slate-800" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Foto del desaparecido (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setFotoFile(file)
                setFotoPreview(URL.createObjectURL(file))
              }}
              className="focus-ring w-full border border-slate-200 rounded-lg p-2.5 mt-1 bg-white text-slate-800"
            />
            {(fotoPreview || persona?.foto_url) && (
              <img src={fotoPreview || persona?.foto_url} alt="Vista previa" className="mt-3 h-32 w-full object-cover rounded-xl border border-slate-200" />
            )}
          </div>

          <button disabled={saving} type="submit" className="w-full py-3 rounded-lg bg-sky-600 text-white font-bold mt-2 disabled:opacity-60">
            {saving ? 'Guardando...' : persona ? 'Actualizar reporte' : 'Guardar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
