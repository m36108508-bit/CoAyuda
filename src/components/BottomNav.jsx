const ITEMS = [
  { id: 'personas', label: 'Personas', icon: '🧍' },
  { id: 'acopios', label: 'Acopios', icon: '📦' },
  { id: 'guia', label: 'Guía', icon: '⛑️' }
]

export default function BottomNav({ view, setView }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white text-slate-600 border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
      <div className="max-w-2xl mx-auto grid grid-cols-3 text-center">
        {ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`focus-ring py-3 text-xs font-semibold flex flex-col items-center gap-0.5 ${view === item.id ? 'text-sky-700' : 'text-slate-500'}`}
          >
            <span className="text-lg">{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
