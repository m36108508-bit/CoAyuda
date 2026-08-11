import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabaseClient'
import { flushQueue, pendingCount } from './lib/offlineQueue'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import PersonasView from './components/PersonasView'
import AcopiosView from './components/AcopiosView'
import GuiaView from './components/GuiaView'
import PersonaForm from './components/PersonaForm'
import AcopioForm from './components/AcopioForm'

export default function App() {
  const [view, setView] = useState('personas')
  const [personas, setPersonas] = useState([])
  const [acopios, setAcopios] = useState([])
  const [modal, setModal] = useState(null) // 'persona' | 'acopio' | null
  const [toast, setToast] = useState('')
  const [pendientes, setPendientes] = useState(pendingCount())

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  const cargarDatos = useCallback(async () => {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('personas').select('*').order('creado_en', { ascending: false }),
      supabase.from('acopios').select('*').order('creado_en', { ascending: false })
    ])
    if (p) setPersonas(p)
    if (a) setAcopios(a)
  }, [])

  useEffect(() => {
    cargarDatos()

    // Tiempo real: cualquier reporte nuevo o voto aparece al instante en todos los dispositivos.
    const canal = supabase
      .channel('rsc-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personas' }, cargarDatos)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'acopios' }, cargarDatos)
      .subscribe()

    // Reintenta la cola offline al volver la conexión.
    const reintentar = async () => {
      await flushQueue(supabase, setPendientes)
      cargarDatos()
    }
    window.addEventListener('online', reintentar)
    const interval = setInterval(reintentar, 15000) // por si "online" no dispara bien en móviles

    return () => {
      supabase.removeChannel(canal)
      window.removeEventListener('online', reintentar)
      clearInterval(interval)
    }
  }, [cargarDatos])

  return (
    <div className="pb-24 min-h-screen bg-paper">
      <Header pendientes={pendientes} />

      <main className="max-w-2xl mx-auto px-4 mt-4">
        {view === 'personas' && (
          <PersonasView personas={personas} onNuevo={() => setModal('persona')} />
        )}
        {view === 'acopios' && (
          <AcopiosView acopios={acopios} onNuevo={() => setModal('acopio')} />
        )}
        {view === 'guia' && <GuiaView />}
      </main>

      <BottomNav view={view} setView={setView} />

      {modal === 'persona' && (
        <PersonaForm personas={personas} onClose={() => setModal(null)} onToast={showToast} />
      )}
      {modal === 'acopio' && (
        <AcopioForm onClose={() => setModal(null)} onToast={showToast} />
      )}

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
