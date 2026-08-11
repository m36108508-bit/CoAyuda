import { useEffect, useState } from 'react'

const PASOS = [
  'Aléjate de ventanas, espejos y objetos que puedan caer.',
  'Ubícate junto a una columna, bajo un mueble resistente o en el "triángulo de vida".',
  'Si estás en la calle, aléjate de edificios, postes y cables eléctricos.',
  'No uses ascensores. Usa siempre las escaleras.',
  'Después del sismo, revisa si hay heridos antes de moverte tú mismo.',
  'Cierra la llave de gas y desconecta la energía eléctrica si es seguro hacerlo.',
  'No regreses a edificios dañados por ningún motivo.',
  'Ten lista una mochila de emergencia con agua, linterna, radio y documentos.'
]
const KEY = 'rsc_checklist'

export default function GuiaView() {
  const [checked, setChecked] = useState({})

  useEffect(() => {
    try { setChecked(JSON.parse(localStorage.getItem(KEY)) || {}) } catch { /* noop */ }
  }, [])
  function toggle(i) {
    const next = { ...checked, [i]: !checked[i] }
    setChecked(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  return (
    <section>
      <h2 className="disp font-bold text-lg mb-1">Guía de emergencia sísmica</h2>
      <p className="text-sm text-stone-600 mb-4">Funciona sin internet. Guárdala en tu pantalla de inicio.</p>

      <div className="bg-white border border-line rounded-xl p-4 mb-4">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-stone-500">Llamadas directas</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <a href="tel:132" className="focus-ring block rounded-lg bg-red-600 text-white py-3">
            <div className="text-xl font-black">132</div><div className="text-[11px]">Cruz Roja</div>
          </a>
          <a href="tel:144" className="focus-ring block rounded-lg bg-amber-600 text-white py-3">
            <div className="text-xl font-black">144</div><div className="text-[11px]">Defensa Civil</div>
          </a>
          <a href="tel:119" className="focus-ring block rounded-lg bg-orange-700 text-white py-3">
            <div className="text-xl font-black">119</div><div className="text-[11px]">Bomberos</div>
          </a>
        </div>
        <a href="tel:123" className="focus-ring mt-2 block text-center rounded-lg border-2 border-ink py-2.5 font-bold text-sm">
          Línea única de emergencias: 123
        </a>
      </div>

      <div className="bg-white border border-line rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3 uppercase tracking-wide text-stone-500">Checklist — qué hacer ahora</h3>
        <ul className="space-y-2">
          {PASOS.map((texto, i) => (
            <li key={i}>
              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => toggle(i)}
                  className="mt-1 w-5 h-5 accent-alert shrink-0"
                />
                <span className={`text-sm ${checked[i] ? 'line-through text-stone-400' : ''}`}>{texto}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
