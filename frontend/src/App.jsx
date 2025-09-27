import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Cards from './components/Cards'
import MapNicaragua from './components/MapNicaragua'
import AntAssistant from './components/AntAssistant'
import IncidentForm from './components/IncidentForm'   // ← NUEVO (solo para la vista de Solicitudes)

const gradient = 'gradient-bg min-h-screen text-zinc-100'

export default function App() {
  const [active, setActive] = useState({ section: 'dashboard', item: 'resumen' })
  const [menu, setMenu] = useState([])
  const [mapPlace, setMapPlace] = useState('Nicaragua')
  const [incMode, setIncMode] = useState(false)
  const [incSeverity, setIncSeverity] = useState(null) // red|yellow|green|blue|purple
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    fetch(`${apiUrl}/menu`).then(r => r.json()).then(d => setMenu(d.menu || [])).catch(() => {})
  }, [apiUrl])

  const title = active.item ? `${active.section} — ${active.item}` : active.section

  // 👉 La hormiguita nos llama con {mode, place, severity}
  const handleAssistantNavigate = ({ mode, place, severity }) => {
    setMapPlace(place || 'Nicaragua')
    setActive({ section: 'mapa', item: '' })
    if (mode === 'incidents') {
      setIncMode(true)
      setIncSeverity(severity || null)
    } else {
      setIncMode(false)
      setIncSeverity(null)
    }
  }

  const renderMain = () => {
    // Vista de registro en menú: Alertas → Solicitudes
    if (active.section === 'alertas' && active.item === 'solicitudes') {
      return <IncidentForm apiUrl={apiUrl} />
    }

    // Vista de mapa (como siempre, con hormiguita controlando place/incidents)
    if (active.section === 'mapa') {
      return (
        <MapNicaragua
          apiUrl={apiUrl}
          place={mapPlace}
          showIncidents={incMode}
          severityFilter={incSeverity}
        />
      )
    }

    // Resto
    return <Cards title={title} />
  }

  return (
    <div className={gradient}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-64 w-[50rem] -translate-x-1/2 rounded-full blur-3xl opacity-50 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500" />
      </div>

      <div className="mx-auto max-w-[1800px] xl:max-w-[2000px] px-2 sm:px-4 lg:px-6 py-5 flex gap-3">
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="relative flex-1 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 glass">
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
              <p className="text-sm text-white/80 mt-1">Vista principal mostrando la información del menú seleccionado.</p>
            </div>

            {renderMain()}
          </section>

          <footer className="text-xs text-white/70">Hecho con ❤ para Nicaragua — Riaar UI base.</footer>

          {/* 🐜 Asistente flotante (sin tocar) */}
          <AntAssistant onNavigate={handleAssistantNavigate} />
        </main>
      </div>
    </div>
  )
}