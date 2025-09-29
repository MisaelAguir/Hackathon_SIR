import React from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ChevronDown } from 'lucide-react'

type Severity = 'Amarillo' | 'Naranja' | 'Rojo'
type Dep = 'Managua' | 'León' | 'Carazo' | 'Chontales'

// ===== Colores por severidad (idénticos a tu pastel) =====
const SEV_COLORS: Record<Severity, string> = {
  Amarillo: '#F6C445',
  Naranja:  '#F26419',
  Rojo:     '#D7263D',
}

// ======= EJEMPLO opcional de dataset crudo =======
// Reemplázalo con tus alertas reales (con fecha ISO: 'YYYY-MM-DD')
type AlertRow = { id: string; dep: Dep; severity: Severity; date: string }
const alertsSeed: AlertRow[] = [
  { id:'1', dep:'Managua',   severity:'Amarillo', date:'2025-09-01' },
  { id:'2', dep:'León',      severity:'Naranja',  date:'2025-09-02' },
  { id:'3', dep:'Carazo',    severity:'Amarillo', date:'2025-09-03' },
  { id:'4', dep:'Chontales', severity:'Rojo',     date:'2025-09-04' },
  { id:'5', dep:'Managua',   severity:'Naranja',  date:'2025-09-06' },
  { id:'6', dep:'León',      severity:'Rojo',     date:'2025-09-07' },
  { id:'7', dep:'Carazo',    severity:'Amarillo', date:'2025-09-08' },
  { id:'8', dep:'Chontales', severity:'Amarillo', date:'2025-09-09' },
  { id:'9', dep:'Managua',   severity:'Amarillo', date:'2025-09-10' },
]

// ===== datos por defecto (fallback) =====
const BARRAS_DEFAULT = [
  { dep:'Managua', a:18 }, { dep:'León', a:9 }, { dep:'Carazo', a:11 }, { dep:'Chontales', a:6 },
]
const PASTEL_DEFAULT = [
  { name:'Amarillo', value: 24 },
  { name:'Naranja',  value: 12 },
  { name:'Rojo',     value: 8 },
]

export default function Stats(){
  // ----------- Filtros -----------
  const [from, setFrom] = React.useState<string>('')   // 'YYYY-MM-DD'
  const [to,   setTo]   = React.useState<string>('')
  const [sevChecked, setSevChecked] = React.useState<Record<Severity, boolean>>({
    Amarillo: true, Naranja: true, Rojo: true,
  })

  const deps: Dep[] = ['Managua','León','Carazo','Chontales']

  const toggleSev = (k: Severity) =>
    setSevChecked(s => ({ ...s, [k]: !s[k] }))

  const setAllSev = (val: boolean) =>
    setSevChecked({ Amarillo: val, Naranja: val, Rojo: val })

  const resetFilters = () => {
    setFrom('')
    setTo('')
    setAllSev(true)
  }

  // ----------- Filtrado de dataset crudo -----------
  const filteredAlerts = React.useMemo(() => {
    if (!alertsSeed.length) return [] as AlertRow[]
    return alertsSeed.filter(a => {
      const inDate =
        (!from || a.date >= from) &&
        (!to   || a.date <= to)
      const inSev = !!sevChecked[a.severity]
      return inDate && inSev
    })
  }, [from, to, sevChecked])

  // ----------- Derivados para los gráficos -----------
  // Línea: conteo por departamento
  const barras = React.useMemo(() => {
    if (!alertsSeed.length) return BARRAS_DEFAULT
    const counts = Object.fromEntries(deps.map(d => [d, 0])) as Record<Dep, number>
    for (const a of filteredAlerts) counts[a.dep]++
    return deps.map(dep => ({ dep, a: counts[dep] }))
  }, [filteredAlerts])

  // Pie: conteo por severidad
  const pastel = React.useMemo(() => {
    if (!alertsSeed.length) return PASTEL_DEFAULT
    const order: Severity[] = ['Amarillo','Naranja','Rojo']
    const counts = { Amarillo:0, Naranja:0, Rojo:0 }
    for (const a of filteredAlerts) counts[a.severity]++
    return order.map(s => ({ name: s, value: counts[s] }))
  }, [filteredAlerts])

  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)

  return (
    <div
      className="
        mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-7
        lg:pr-[520px] xl:pr-[560px]
      "
    >

      {/* Filtros móviles (acordeón) */}
      <Card className="lg:hidden">
        <button
          onClick={()=>setMobileFiltersOpen(o=>!o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="font-semibold">Filtros</span>
          <ChevronDown className={`h-5 w-5 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileFiltersOpen && (
          <CardContent className="pt-0 space-y-5 animate-fadeIn">
            {/* Rango de fecha */}
            <div>
              <p className="mb-2 font-medium">Rango de fechas</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  value={from}
                  onChange={e=>setFrom(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                />
                <input
                  type="date"
                  value={to}
                  onChange={e=>setTo(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            {/* Severidad */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Severidad</p>
                <div className="flex gap-2 text-xs">
                  <button onClick={()=>setAllSev(true)} className="underline text-white/80 hover:text-white">Todos</button>
                  <span className="text-white/30">·</span>
                  <button onClick={()=>setAllSev(false)} className="underline text-white/80 hover:text-white">Ninguno</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['Amarillo','Naranja','Rojo'] as Severity[]).map(k => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={!!sevChecked[k]}
                      onChange={()=>toggleSev(k)}
                    />
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-sm border border-white/20"
                        style={{ background: SEV_COLORS[k] }}
                      />
                      {k}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-1">
              <button
                onClick={resetFilters}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-2 text-sm"
              >
                Limpiar filtros
              </button>
            </div>
          </CardContent>
        )}
      </Card>
      {/* Línea arriba */}
      <Card>
        <CardHeader><CardTitle>Alertas por departamento</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={barras}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
              <XAxis dataKey="dep" stroke="#fff" />
              <YAxis stroke="#fff" allowDecimals={false} />
              <Tooltip contentStyle={{ background:'#0D2B45', border:'1px solid rgba(255,255,255,.2)', color:'white' }} />
              <Line type="monotone" dataKey="a" stroke="#F26419" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie abajo */}
      <Card>
        <CardHeader><CardTitle>Distribución por severidad</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pastel} dataKey="value" nameKey="name" outerRadius={110}>
                {pastel.map((e,i) => (
                  <Cell key={i} fill={SEV_COLORS[e.name as Severity]}/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:'#0D2B45', border:'1px solid rgba(255,255,255,.2)', color:'white' }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ===== Panel de Filtros (desktop fijo) ===== */}
      <div className="hidden lg:block fixed right-6 xl:right-12 top-[140px] xl:top-[160px] z-40 w-[360px] xl:w-[400px]">
        <Card className="glass max-h-[calc(100vh-220px)] overflow-auto">
          <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {/* Rango de fecha */}
            <div>
              <p className="mb-2 font-medium">Rango de fechas</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={from}
                  onChange={e=>setFrom(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                />
                <input
                  type="date"
                  value={to}
                  onChange={e=>setTo(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Severidad */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Severidad</p>
                <div className="flex gap-2 text-xs">
                  <button onClick={()=>setAllSev(true)}  className="underline text-white/80 hover:text-white">Todos</button>
                  <span className="text-white/30">·</span>
                  <button onClick={()=>setAllSev(false)} className="underline text-white/80 hover:text-white">Ninguno</button>
                </div>
              </div>
              <div className="space-y-2">
                {(['Amarillo','Naranja','Rojo'] as Severity[]).map(k => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!sevChecked[k]}
                      onChange={()=>toggleSev(k)}
                    />
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-3.5 w-3.5 rounded-sm border border-white/20"
                        style={{ background: SEV_COLORS[k] }}
                      />
                      <span className="font-medium">{k}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={resetFilters}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-2"
              >
                Limpiar filtros
              </button>
            </div>

            {/* Mini resumen */}
            {alertsSeed.length > 0 && (
              <p className="text-xs text-white/70">
                {filteredAlerts.length} alerta(s) dentro del rango/colores seleccionados.
              </p>
            )}
          </CardContent>
        </Card>
  </div>
    </div>
  )
}