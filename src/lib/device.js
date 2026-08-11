// Genera y persiste un ID anónimo por dispositivo/navegador.
// No identifica a la persona, solo evita que un mismo dispositivo
// vote varias veces sobre el mismo reporte (se refuerza además en el
// servidor con una restricción única en la base de datos).
const KEY = 'rsc_device_id'

export function getDeviceId() {
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2))
    localStorage.setItem(KEY, id)
  }
  return id
}
