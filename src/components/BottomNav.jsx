import { PackageIcon, ShieldIcon, UserIcon } from './icons'

const ITEMS = [
  { id: 'personas', label: 'Personas', Icon: UserIcon },
  { id: 'acopios', label: 'Ayuda', Icon: PackageIcon },
  { id: 'guia', label: 'Guía', Icon: ShieldIcon }
]

export default function BottomNav({ view, setView }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200/70 bg-white/95 backdrop-blur-md shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
      <div className="mx-auto grid max-w-2xl grid-cols-3 text-center py-3">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`focus-ring flex flex-col items-center gap-1 py-2 text-[11px] font-semibold transition ${active ? 'text-slate-950' : 'text-slate-500'}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${active ? 'bg-slate-100 text-slate-950' : 'bg-slate-100/90 text-slate-400'}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
