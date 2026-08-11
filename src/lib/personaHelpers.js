export function buildPersonaPayload({
  nombre,
  cedula,
  estado,
  ubicacion,
  telefono,
  foto_url
}) {
  return {
    nombre: String(nombre || '').trim(),
    cedula: String(cedula || '').trim() || null,
    estado,
    ubicacion: String(ubicacion || '').trim(),
    telefono: String(telefono || '').trim() || null,
    foto_url: String(foto_url || '').trim() || null
  }
}
