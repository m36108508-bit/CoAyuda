import { useEffect, useState } from 'react'
import { AlertTriangleIcon, PhoneIcon, ShieldIcon } from './icons'

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
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 py-3.5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200/25">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="disp text-xl font-black tracking-tight text-slate-950">CoAyuda</h1>
              <p className="text-[12px] font-medium text-slate-500">Ayuda para localizar a quienes faltan tras el sismo</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
            <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span>{online ? 'En línea' : 'Sin conexión'}</span>
            {pendientes > 0 && (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">{pendientes}</span>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <AlertTriangleIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-700">Emergencia</p>
                <p className="text-sm font-medium text-slate-700">Si hay riesgo inmediato, llama a emergencias.</p>
              </div>
            </div>
            <a
              href="tel:123"
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              <PhoneIcon className="h-4 w-4" />
              Llamar 123
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
