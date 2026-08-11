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
  if (q.length === 0) return
  const remaining = []
  for (const item of q) {
    try {
      const { table, payload } = item
      const { error } = await supabase.from(table).insert(payload)
      if (error) throw error
    } catch {
      remaining.push(item) // se queda para el próximo intento
    }
  }
  writeQueue(remaining)
  if (onProgress) onProgress(remaining.length)
}
