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
      <div className="panel mb-4 p-4">
        <p className="section-label mb-2">Guía</p>
        <h2 className="disp text-xl font-black tracking-tight text-slate-900">Emergencia y acción inmediata</h2>
        <p className="mt-2 text-sm text-slate-600">Funciona sin internet. Guárdala en tu pantalla de inicio.</p>
      </div>

      <div className="panel mb-4 p-4">
        <h3 className="section-label mb-3">Llamadas directas</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <a href="tel:132" className="focus-ring block rounded-xl bg-red-600 py-3 text-white shadow-sm">
            <div className="text-xl font-black">132</div><div className="text-[11px] font-semibold">Cruz Roja</div>
          </a>
          <a href="tel:144" className="focus-ring block rounded-xl bg-amber-500 py-3 text-white shadow-sm">
            <div className="text-xl font-black">144</div><div className="text-[11px] font-semibold">Defensa Civil</div>
          </a>
          <a href="tel:119" className="focus-ring block rounded-xl bg-orange-600 py-3 text-white shadow-sm">
            <div className="text-xl font-black">119</div><div className="text-[11px] font-semibold">Bomberos</div>
          </a>
        </div>
        <a href="tel:123" className="focus-ring mt-3 block rounded-xl border-2 border-slate-300 bg-slate-50 py-2.5 text-center text-sm font-black text-slate-800">
          Línea única de emergencias: 123
        </a>
      </div>

      <div className="panel p-4">
        <h3 className="section-label mb-3">Checklist — qué hacer ahora</h3>
        <ul className="space-y-2">
          {PASOS.map((texto, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => toggle(i)}
                  className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                />
                <span className={`text-sm leading-relaxed ${checked[i] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{texto}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
