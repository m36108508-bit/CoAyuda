import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabaseClient'
import { flushQueue, pendingCount } from './lib/offlineQueue'
import { getDeviceId } from './lib/device'
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
  const [modal, setModal] = useState(null)
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

  const eliminarPersona = useCallback(async (personaId, nombre) => {
    const confirmado = window.confirm(`¿Quieres eliminar este reporte de ${nombre}?\n\nEsta acción no se puede deshacer.`)
    if (!confirmado) return

    try {
      const { error } = await supabase.rpc('delete_persona', { p_persona_id: personaId, p_device_id: getDeviceId() })
      if (error) throw error
      setPersonas(prev => prev.filter(p => p.id !== personaId))
      showToast('Reporte eliminado')
    } catch (err) {
      console.error(err)
      showToast('No se pudo eliminar el reporte')
    }
  }, [showToast])

  useEffect(() => {
    cargarDatos()

    const canal = supabase
      .channel('rsc-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'personas' }, cargarDatos)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'acopios' }, cargarDatos)
      .subscribe()

    const reintentar = async () => {
      await flushQueue(supabase, setPendientes)
      cargarDatos()
    }
    window.addEventListener('online', reintentar)
    const interval = setInterval(reintentar, 15000)

    return () => {
      supabase.removeChannel(canal)
      window.removeEventListener('online', reintentar)
      clearInterval(interval)
    }
  }, [cargarDatos])

  return (
    <div className="app-shell pb-24">
      <Header pendientes={pendientes} />

      <main className="max-w-2xl mx-auto px-4 mt-5 pb-4">
        {view === 'personas' && (
          <PersonasView
            personas={personas}
            onNuevo={() => setModal({ type: 'persona', persona: null })}
            onEditar={(persona) => setModal({ type: 'persona', persona })}
            onEliminar={eliminarPersona}
          />
        )}
        {view === 'acopios' && (
          <AcopiosView acopios={acopios} onNuevo={() => setModal({ type: 'acopio' })} />
        )}
        {view === 'guia' && <GuiaView />}
      </main>

      <BottomNav view={view} setView={setView} />

      {modal?.type === 'persona' && (
        <PersonaForm
          personas={personas}
          persona={modal.persona}
          onClose={() => setModal(null)}
          onToast={showToast}
        />
      )}
      {modal?.type === 'acopio' && (
        <AcopioForm onClose={() => setModal(null)} onToast={showToast} />
      )}

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 border border-slate-200 bg-white text-slate-800 text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-slate-200/60">
          {toast}
        </div>
      )}
    </div>
  )
}
