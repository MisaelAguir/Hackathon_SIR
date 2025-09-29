import IncidentForm from '../components/IncidentForm'

export default function RegisterIncidentStandalone() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return (
    <div className="gradient-bg min-h-screen text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-64 w-[50rem] -translate-x-1/2 rounded-full blur-3xl opacity-50 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500" />
      </div>
      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 lg:px-8 py-6">
        <header className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold">Registro de incidencias</h1>
          <p className="text-sm text-white/70">Ventana independiente — no toca tu app principal.</p>
        </header>
        <IncidentForm apiUrl={apiUrl} />
      </div>
    </div>
  )
}

