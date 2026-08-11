// Cola simple de reintentos. Si el navegador no tiene internet (o Supabase
// no responde), el reporte se guarda aquí y se reintenta automáticamente
// cuando vuelve la conexión o cada vez que se llama a flushQueue().
const KEY = 'rsc_cola_pendientes'

function readQueue() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
}
function writeQueue(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function toBlobFromDataUrl(dataUrl) {
  const [header, content] = dataUrl.split(',')
  if (!header || !content) return null

  const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9.+-]+);base64/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const binary = atob(content)
  const array = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i)
  }

  return new Blob([array], { type: mime })
}

async function uploadQueuedPersonaPhoto(supabase, payload) {
  if (!payload.foto_data_url) return payload

  const blob = toBlobFromDataUrl(payload.foto_data_url)
  if (!blob) return payload

  const ext = blob.type.includes('png') ? 'png' : 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('personas')
    .upload(fileName, blob, { upsert: true, cacheControl: '3600', contentType: blob.type || 'image/jpeg' })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('personas').getPublicUrl(fileName)

  return {
    ...payload,
    foto_url: data.publicUrl,
    foto_data_url: undefined
  }
}

export function buildQueuedPersonaPayload(payload, fotoDataUrl) {
  if (!fotoDataUrl) return payload
  return {
    ...payload,
    foto_data_url: fotoDataUrl,
    foto_url: null
  }
}

export function enqueue(item) {
  const q = readQueue()
  q.push({ ...item, _queuedAt: Date.now() })
  writeQueue(q)
}

export function pendingCount() {
  return readQueue().length
}

export async function flushQueue(supabase, onProgress) {
  const q = readQueue()
  if (q.length === 0) {
    if (onProgress) onProgress(0)
    return []
  }

  const remaining = []

  for (const item of q) {
    try {
      const { table, payload } = item
      let nextPayload = payload

      if (table === 'personas' && payload.foto_data_url) {
        nextPayload = await uploadQueuedPersonaPhoto(supabase, payload)
      }

      const { error } = await supabase.from(table).insert(nextPayload)
      if (error) throw error
    } catch (err) {
      console.error('No se pudo procesar cola offline:', err)
      remaining.push(item)
    }
  }

  writeQueue(remaining)
  if (onProgress) onProgress(remaining.length)
  return remaining
}
