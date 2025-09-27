import { useState } from 'react'
import {
  PanelsTopLeft, Layers, FileText, BarChart3, MapPin,
  BellRing, ChevronRight, ChevronDown, ChevronLeft, ChevronFirst
} from 'lucide-react'

const MENU = [
  { id: 'dashboard', title: 'Panel', icon: PanelsTopLeft, items: [
    { id: 'resumen', title: 'Resumen' },
    { id: 'actividad', title: 'Actividad' },
  ]},

  // ← NUEVO grupo
  { id: 'alertas', title: 'Alertas', icon: BellRing, items: [
    { id: 'solicitudes', title: 'Solicitudes' },   // aquí queda el formulario de incidencias
    { id: 'expedientes', title: 'Expedientes' },
  ]},

  { id: 'registros', title: 'Registros', icon: FileText, items: [
    { id: 'ciudadanos', title: 'Ciudadanos' },
    { id: 'instituciones', title: 'Instituciones' },
  ]},
  { id: 'reportes', title: 'Reportes', icon: BarChart3, items: [
    { id: 'estadisticas', title: 'Estadísticas' },
    { id: 'descargas', title: 'Descargas' },
  ]},
  { id: 'mapa', title: 'Mapa Nicaragua', icon: MapPin },
]

export default function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const [open, setOpen] = useState({ dashboard: true, alertas: true })
  const toggle = (id) => setOpen(s => ({ ...s, [id]: !s[id] }))
  const W = collapsed ? 'w-20' : 'w-72'

  return (
    <aside className={`${W} shrink-0 rounded-3xl p-3 glass text-zinc-100 sticky top-6 h-[calc(100vh-3rem)]`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2 px-2 py-1`}>
        {!collapsed && <span className="text-lg font-semibold tracking-wide">Riaar</span>}
        <button className="rounded-xl p-2 bg-white/10" title={collapsed ? 'Expandir' : 'Colapsar'} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronFirst className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="mt-2 space-y-1 overflow-y-auto h-[calc(100%-3rem)] pr-1">
        {MENU.map(sec => (
          <div key={sec.id} className="rounded-xl">
            <button
              onClick={() => sec.items ? toggle(sec.id) : setActive({ section: sec.id })}
              className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-xl hover:bg-white/10 transition`}
            >
              <span className="flex items-center gap-2">
                <sec.icon className="h-4 w-4" />
                {!collapsed && <span className="text-sm font-medium">{sec.title}</span>}
              </span>
              {!collapsed && sec.items ? (open[sec.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : null}
            </button>

            {sec.items && open[sec.id] && !collapsed && (
              <div className="pl-9 pr-2">
                {sec.items.map(it => (
                  <button
                    key={it.id}
                    onClick={() => setActive({ section: sec.id, item: it.id })}
                    className={`w-full text-left my-1 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition ${
                      active.section === sec.id && active.item === it.id ? 'bg-white/15' : ''
                    }`}
                  >
                    {it.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}