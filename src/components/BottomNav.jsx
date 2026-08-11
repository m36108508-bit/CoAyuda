import { PackageIcon, ShieldIcon, UserIcon } from './icons'

const ITEMS = [
  { id: 'personas', label: 'Personas', Icon: UserIcon },
  { id: 'acopios', label: 'Ayuda', Icon: PackageIcon },
  { id: 'guia', label: 'Guía', Icon: ShieldIcon }
]

export default function BottomNav({ view, setView }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
      <div className="mx-auto grid max-w-2xl grid-cols-3 text-center">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`focus-ring flex flex-col items-center gap-1 py-3 text-[11px] font-bold ${active ? 'text-blue-700' : 'text-slate-500'}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
