import { Search } from 'lucide-react'

export default function Topbar({ q, setQ, onSearch, placeholder = 'Buscar…', children }) {
  return (
    <div className="sticky top-4 z-10 rounded-2xl p-3 glass text-zinc-100">
      <div className="flex items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearch(e)
          }}
          className="relative flex-1"
          role="search"
          aria-label="Buscar"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            className="pl-9 pr-24 h-11 w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 bg-white/20"
          >
            Buscar
          </button>
        </form>

        {/* Slot opcional para acciones a la derecha (p.ej. botón Salir) */}
        {children}
      </div>
    </div>
  )
}