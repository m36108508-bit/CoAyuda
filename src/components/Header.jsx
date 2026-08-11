import { useEffect, useState } from 'react'

export default function Header({ pendientes }) {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-lg font-black text-white shadow-lg shadow-blue-200">
              C
            </div>
            <div>
              <h1 className="disp text-xl font-black tracking-tight text-slate-900">CoAyuda</h1>
              <p className="text-[11px] font-medium text-slate-500">Ayuda comunitaria clara y segura</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
            <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span>{online ? 'En línea' : 'Sin conexión'}</span>
            {pendientes > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendientes}</span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-700">Emergencia</p>
            <p className="text-xs font-medium text-red-800">Si hay riesgo inmediato, llama a emergencias.</p>
          </div>
          <a
            href="tel:123"
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-red-200"
          >
            🚨 Llamar 123
          </a>
        </div>
      </div>
    </header>
  )
}
