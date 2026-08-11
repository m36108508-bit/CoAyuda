const ITEMS = [
  { id: 'personas', label: 'Personas', icon: '🧍' },
  { id: 'acopios', label: 'Acopios', icon: '📦' },
  { id: 'guia', label: 'Guía', icon: '⛑️' }
]

export default function BottomNav({ view, setView }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-ink text-stone-300 border-t border-black/30">
      <div className="max-w-2xl mx-auto grid grid-cols-3 text-center">
        {ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`focus-ring py-3 text-xs font-semibold flex flex-col items-center gap-0.5 ${view === item.id ? 'text-white' : ''}`}
          >
            <span className="text-lg">{item.icon}</span>{item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
