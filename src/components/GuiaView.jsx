import { useEffect, useState } from 'react'

const PASOS = [
  'Aléjate de objetos que puedan caer y busca un lugar seguro.',
  'Refúgiate bajo una mesa, junto a una columna o en un ángulo protegido.',
  'Aléjate de líneas eléctricas, postes y fachadas inestables si estás afuera.',
  'No uses ascensor. Usa escaleras solo si son seguras.',
  'Revisa si hay heridos antes de moverte y da prioridad a tu propia seguridad.',
  'Cierra gas y electricidad solo si puedes hacerlo sin ponerte en riesgo.',
  'No vuelvas a entrar a estructuras dañadas.',
  'Mantén lista una mochila con agua, alimentos, linterna, radio y documentos.'
]
const GUIA_COMPLETA = [
  {
    titulo: 'Antes del sismo',
    items: [
      'Prepara una mochila con agua, alimentos, linterna, cargador, radio y primeros auxilios.',
      'Ubica rutas de evacuación y puntos de encuentro seguros con tu familia o vecinos.',
      'Asegura muebles y objetos pesados que puedan caer.',
      'Guarda los números de emergencia y el contacto de personas de confianza.'
    ]
  },
  {
    titulo: 'Durante el sismo',
    items: [
      'Protege tu cabeza y cuello con los brazos o un objeto resistente.',
      'Si estás dentro, busca abrigo bajo una mesa o junto a una columna estable.',
      'Si estás afuera, aléjate de edificios, ventanas y cables eléctricos.',
      'No te muevas apresurado. Espera a que termine la sacudida antes de evaluar.'
    ]
  },
  {
    titulo: 'Después del sismo',
    items: [
      'Evalúa tu entorno antes de moverte y mantén la calma.',
      'Revisa si hay personas heridas y pide ayuda si hay lesiones graves.',
      'Corta gas y electricidad solo si es seguro hacerlo.',
      'No ingreses a edificios que presenten grietas, inclinaciones o daños visibles.'
    ]
  },
  {
    titulo: 'Cómo ayudar de forma segura',
    items: [
      'Prioriza a bebés, ancianos, personas con discapacidad y quienes estén desorientados.',
      'Comparte información clara sobre ubicaciones, riesgos y necesidades.',
      'No muevas a personas con posibles lesiones de columna salvo que haya peligro inmediato.',
      'Ayuda con agua, abrigo y calma, sin exponerte tú mismo.'
    ]
  },
  {
    titulo: 'Qué evitar',
    items: [
      'No uses ascensores, ni vuelvas a ingresar a estructuras inestables.',
      'No te acerques a cables caídos, fugas de gas o filtraciones eléctricas.',
      'No tomes decisiones precipitadas con información insuficiente.',
      'No desplaces a personas heridas innecesariamente.'
    ]
  },
  {
    titulo: 'Primeros auxilios esenciales',
    items: [
      'Si alguien no respira, pide ayuda y, si sabes hacerlo, inicia RCP.',
      'Detén hemorragias con presión directa usando una tela limpia.',
      'Inmoviliza fracturas y evita mover a la persona si sospechas lesión de columna.',
      'Mantén a las víctimas abrigadas y en un lugar seguro hasta que llegue ayuda.'
    ]
  }
]
const KEY = 'rsc_checklist'

export default function GuiaView() {
  const [checked, setChecked] = useState({})
  const [openGuide, setOpenGuide] = useState(false)

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
      <div className="panel mb-4 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Guía de emergencia</p>
          <h2 className="disp mt-1 text-xl font-black tracking-tight">Acciones clave para actuar con seguridad</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Guía práctica y directa para actuar con seguridad antes, durante y después de un sismo.</p>
          <button
            onClick={() => setOpenGuide(true)}
            className="focus-ring mt-3 inline-flex items-center rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm"
          >
            Abrir guía completa
          </button>
        </div>
      </div>

      <div className="panel mb-4 p-4">
        <h3 className="section-label mb-3">Llamadas directas</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <a href="tel:132" className="focus-ring block rounded-2xl bg-red-600 py-3 text-white shadow-[0_8px_16px_rgba(220,38,38,0.2)]">
            <div className="text-xl font-black">132</div><div className="text-[11px] font-semibold">Cruz Roja</div>
          </a>
          <a href="tel:144" className="focus-ring block rounded-2xl bg-amber-500 py-3 text-white shadow-[0_8px_16px_rgba(245,158,11,0.2)]">
            <div className="text-xl font-black">144</div><div className="text-[11px] font-semibold">Defensa Civil</div>
          </a>
          <a href="tel:119" className="focus-ring block rounded-2xl bg-orange-600 py-3 text-white shadow-[0_8px_16px_rgba(249,115,22,0.2)]">
            <div className="text-xl font-black">119</div><div className="text-[11px] font-semibold">Bomberos</div>
          </a>
        </div>
        <a href="tel:123" className="focus-ring mt-3 block rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-black text-slate-800 shadow-sm">
          Línea única de emergencias: 123
        </a>
      </div>

      <div className="panel mb-4 p-4">
        <h3 className="section-label mb-3">Prioridad inmediata</h3>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p><strong>1.</strong> Verifica si hay personas heridas o atrapadas y avisa a rescate si corresponde.</p>
          <p><strong>2.</strong> No uses ascensores. Usa siempre escaleras y mantente alejado de estructuras dañadas.</p>
          <p><strong>3.</strong> Si hay gas o electricidad comprometida, corta el suministro si es seguro hacerlo.</p>
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="section-label mb-3">Checklist — qué hacer ahora</h3>
        <ul className="space-y-2">
          {PASOS.map((texto, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-2.5 transition hover:bg-slate-50">
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

      {openGuide && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 p-3 sm:items-center">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <p className="section-label mb-1">Guía completa</p>
                <h3 className="disp text-lg font-black text-slate-900">Qué hacer ante un sismo</h3>
              </div>
              <button onClick={() => setOpenGuide(false)} className="focus-ring rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                Cerrar
              </button>
            </div>

            <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              {GUIA_COMPLETA.map(seccion => (
                <div key={seccion.titulo} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">{seccion.titulo}</h4>
                  <ul className="mt-2 space-y-2">
                    {seccion.items.map(item => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
