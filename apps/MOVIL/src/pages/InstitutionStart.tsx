
import React from 'react'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Bell, FileText } from 'lucide-react'

function QuickLink({ Icon, title, onClick }:{Icon:any,title:string,onClick:()=>void}){
  return (
    <button onClick={onClick} className="group glass p-5 rounded-2xl border brand-border hover:shadow-card transition w-full text-left">
      <Icon className="h-6 w-6 text-[var(--riaar-yellow)] group-hover:scale-110 transition" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-sm text-white/70">Ir al módulo</p>
    </button>
  )
}

export default function InstitutionStart(){
  const nav = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src="/assets/hormiga.png" className="h-12" />
        <div>
          <h2 className="text-2xl font-bold">Bienvenido, Institución</h2>
          <p className="text-white/80">Accesos rápidos a los módulos operativos.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <QuickLink Icon={LayoutDashboard} title="Principal" onClick={()=>nav('/principal')} />
        <QuickLink Icon={Bell} title="Alertas" onClick={()=>nav('/alertas')} />
        <QuickLink Icon={FileText} title="Registros" onClick={()=>nav('/registros')} />
      </div>
    </div>
  )
}
