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
    <header className="sticky top-0 z-30 bg-ink text-paper">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="disp font-extrabold text-lg sm:text-xl tracking-tight">Red Sismo Colombia</h1>
          <p className="text-[11px] sm:text-xs text-stone-300 -mt-0.5">Información entre vecinos, sin depender de internet</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-700">
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span>{online ? 'En línea' : 'Sin conexión'}</span>
          {pendientes > 0 && (
            <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5">{pendientes}</span>
          )}
        </div>
      </div>
    </header>
  )
}
