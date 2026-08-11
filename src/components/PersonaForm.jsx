import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { buildQueuedPersonaPayload, enqueue } from '../lib/offlineQueue'
import { buildPersonaPayload } from '../lib/personaHelpers'
import { getDeviceId } from '../lib/device'
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

function dataUrlToFile(dataUrl, filename) {
  const [meta, base64] = dataUrl.split(',')
  const mime = meta.match(/:(.*?);/)[1]
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i)
  }
  return new File([array], filename, { type: mime })
}

async function cropImageToSquare(imageUrl) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imageUrl
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('No se pudo cargar la imagen para recortar'))
  })

  const size = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - size) / 2
  const sy = (img.naturalHeight - size) / 2
  const canvas = document.createElement('canvas')
  const targetSize = 760
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize)
  return canvas.toDataURL('image/jpeg', 0.92)
}

function parseStoragePathFromUrl(url) {
  if (!url) return null
  const pathSegment = url.split('/personas/')[1]
  if (!pathSegment) return null
  return decodeURIComponent(pathSegment.split('?')[0])
}

export default function PersonaForm({ personas, persona, onClose, onToast, onSaved }) {
  const [nombre, setNombre] = useState(persona?.nombre || '')
  const [cedula, setCedula] = useState(persona?.cedula || '')
  const [estado, setEstado] = useState(persona?.estado || 'desaparecido')
  const [ubicacion, setUbicacion] = useState(persona?.ubicacion || '')
  const [telefono, setTelefono] = useState(persona?.telefono || '')
  const [fotoFile, setFotoFile] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(persona?.foto_url || '')
  const [originalFotoFile, setOriginalFotoFile] = useState(null)
  const [originalPreview, setOriginalPreview] = useState(persona?.foto_url || '')
  const [fotoCropped, setFotoCropped] = useState(false)
  const [cropError, setCropError] = useState('')
  const [saving, setSaving] = useState(false)

  function esErrorOffline(err) {
    const mensaje = String(err?.message || '')
    return !navigator.onLine || /network|offline|fetch/i.test(mensaje)
  }

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

    const { data, error: publicUrlError } = supabase.storage.from('personas').getPublicUrl(fileName)
    if (publicUrlError) throw publicUrlError
    if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública de la foto.')

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
        foto_url: persona?.foto_url || '',
        owner_device: getDeviceId()
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
          p_foto_url: fotoUrl || payload.foto_url || null,
          p_device_id: getDeviceId()
        })
        if (error) throw error
        onToast('Reporte actualizado')
        onSaved?.()
        onClose()
      } else {
        const foto_url = await uploadFoto()
        const insertPayload = buildPersonaPayload({ nombre, cedula, estado, ubicacion, telefono, foto_url, owner_device: getDeviceId() })
        if (duplicado) {
          const updatePayload = {
            ...insertPayload,
            actualizado_en: new Date().toISOString(),
            foto_url: foto_url ?? duplicado.foto_url ?? null
          }
          const { error } = await supabase.from('personas')
            .update(updatePayload)
            .eq('id', duplicado.id)
          if (error) throw error
          onToast('Reporte actualizado')
          onSaved?.()
          onClose()
        } else {
          const { error } = await supabase.from('personas').insert(insertPayload)
          if (error) throw error
          onToast('Reporte guardado y sincronizado')
          onSaved?.()
          onClose()
        }
      }
    } catch (err) {
      console.error(err)
      const isOffline = esErrorOffline(err)
      if (isOffline && !persona) {
        const fotoDataUrl = fotoFile ? await readAsDataUrl(fotoFile) : null
        const offlinePayload = buildPersonaPayload({ nombre, cedula, estado, ubicacion, telefono, foto_url: null, owner_device: getDeviceId() })
        enqueue({ table: 'personas', payload: buildQueuedPersonaPayload(offlinePayload, fotoDataUrl) })
        onToast('Sin conexión: se guardó en tu equipo y se enviará automáticamente')
        onSaved?.()
        onClose()
        return
      }

      onToast(
        isOffline
          ? 'Sin conexión: no se puede actualizar este reporte mientras estás offline.'
          : err?.message || 'No se pudo guardar el reporte. Revisa tu conexión e inténtalo de nuevo.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 modal-backdrop flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
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
            <span className="text-xs font-semibold text-slate-600">Tipo de reporte</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEstado('desaparecido')}
                className={`rounded-2xl border p-3 text-left text-sm font-semibold transition ${estado === 'desaparecido' ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-900 hover:text-slate-900'}`}
              >
                <div>Persona desaparecida</div>
                <p className="mt-1 text-[11px] font-normal text-slate-500">Falta en algún lugar y se necesita encontrarla.</p>
              </button>
              <button
                type="button"
                onClick={() => setEstado('sin_identidad')}
                className={`rounded-2xl border p-3 text-left text-sm font-semibold transition ${estado === 'sin_identidad' ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-900 hover:text-slate-900'}`}
              >
                <div>Persona sin identidad</div>
                <p className="mt-1 text-[11px] font-normal text-slate-500">No se sabe quién es o necesita localizar a su familia.</p>
              </button>
            </div>
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
                const previewUrl = URL.createObjectURL(file)
                setFotoFile(file)
                setOriginalFotoFile(file)
                setOriginalPreview(previewUrl)
                setFotoPreview(previewUrl)
                setFotoCropped(false)
                setCropError('')
              }}
              className="focus-ring w-full border border-slate-200 rounded-2xl p-3 mt-2 bg-white text-slate-800"
            />
            {(fotoPreview || persona?.foto_url) && (
              <div className="mt-3 overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100 shadow-sm">
                <div className="relative h-52 overflow-hidden bg-slate-200">
                  <img
                    src={fotoPreview || persona?.foto_url}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent p-3 text-[11px] text-white">
                    {fotoCropped ? 'Recorte aplicado' : 'Previsualización de la imagen'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!fotoPreview) return
                      setCropError('')
                      try {
                        const dataUrl = await cropImageToSquare(fotoPreview)
                        const croppedFile = dataUrlToFile(
                          dataUrl,
                          fotoFile?.name ? `recortada-${fotoFile.name}` : `recortada-${Date.now()}.jpg`
                        )
                        if (fotoPreview.startsWith('blob:')) URL.revokeObjectURL(fotoPreview)
                        setFotoFile(croppedFile)
                        setFotoPreview(URL.createObjectURL(croppedFile))
                        setFotoCropped(true)
                      } catch (err) {
                        console.error(err)
                        setCropError(err?.message || 'No se pudo recortar la imagen.')
                      }
                    }}
                    className="focus-ring inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Recortar imagen
                  </button>
                  {fotoCropped && originalPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!originalPreview || !originalFotoFile) return
                        if (fotoPreview.startsWith('blob:')) URL.revokeObjectURL(fotoPreview)
                        setFotoFile(originalFotoFile)
                        setFotoPreview(originalPreview)
                        setFotoCropped(false)
                        setCropError('')
                      }}
                      className="focus-ring inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Revertir recorte
                    </button>
                  )}
                </div>
                {cropError && <p className="px-3 pb-3 text-sm font-semibold text-red-700">{cropError}</p>}
              </div>
            )}
          </div>

          <button disabled={saving} type="submit" className="w-full py-3 rounded-3xl bg-slate-950 text-white font-semibold mt-2 shadow-[0_16px_32px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 disabled:opacity-60">
            {saving ? 'Guardando...' : persona ? 'Actualizar reporte' : 'Guardar reporte'}
          </button>
        </form>
      </div>
    </div>
  )
}
