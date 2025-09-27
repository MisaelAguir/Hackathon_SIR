import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, LogIn, UserPlus, Building2, LayoutDashboard, Bell, FileText, BarChart3, GraduationCap, ChevronsLeft, ChevronsRight,} from 'lucide-react'

function Item({to, label, Icon, collapsed}:{to:string,label:string,Icon:any,collapsed:boolean}) {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        `w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition
         ${isActive ? 'bg-white/10 border-white/20' : ''}`
      }
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 text-[var(--riaar-yellow)]" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onToggle }:{collapsed:boolean; onToggle:()=>void}) {
  return (
    <div className={`rounded-2xl border brand-border glass ${collapsed ? 'w-[72px] px-2' : 'w-[240px] px-3'} py-3 transition-all`}>
      {/* Header del menú + botón plegar/expandir */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} pb-3 border-b border-white/10 mb-3`}>
        <div className="flex items-center gap-3">
          <img src="/assets/hormiga.png" className="h-17 w-14 rounded-full" />
          {!collapsed && (
            <div>
              <p className="text-sm text-white/70">Bienvenido</p>
              <p className="font-semibold">Agente SIR</p>
            </div>
          )}
        </div>
        <button onClick={onToggle} className="hidden lg:inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/10">
          {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </button>
      </div>

      <div className="space-y-1">
       
        <div className="h-2" />
       
        <Item to="/principal"         label="Principal"           Icon={LayoutDashboard}collapsed={collapsed} />
        <Item to="/alertas"           label="Alertas"             Icon={Bell}           collapsed={collapsed} />
        <Item to="/registros"         label="Registros"           Icon={FileText}       collapsed={collapsed} />
        <Item to="/estadisticas"      label="Estadísticas"        Icon={BarChart3}      collapsed={collapsed} />
        <Item to="/educativa"         label="Educativa"           Icon={GraduationCap}  collapsed={collapsed} />
      </div>
    </div>
  )
}