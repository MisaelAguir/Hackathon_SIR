import React from 'react' 
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import { ChevronDown } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { getAlertas } from '@/services/api'
import type { Alert } from '@/types/alert'

/* ===== Leyenda severidades ===== */
const SEVERITY_META: Record<string, { color: string; description: string }> = {
  Verde:    { color: '#20c997', description: 'Tranquilidad' },
  Amarillo: { color: '#F6C445', description: 'Infórmate' },
  Naranja:  { color: '#F2994A', description: 'Prepárate' },
  Rojo:     { color: '#E74C3C', description: 'Sigue instrucciones oficiales' },
  Azul:     { color: '#3498DB', description: 'No meteorológicas' },
}

/* ===== Ícono reducido con glow + pin SIR ===== */
function iconForSeverity(sev?: string) {
  const key = (sev || '').trim()
  const color = SEVERITY_META[key]?.color ?? '#94a3b8'
  const w = 36, h = 48, ax = Math.round(w / 2), ay = h

  return L.divIcon({
    className: 'riaar-pin',
    html: `
      <div class="pinStack" style="--pinW:${w}px;--pinH:${h}px;--c:${color}">
        <span class="dot"></span>
        <span class="glow"></span>
        <img src="/assets/sir-logo.png" alt="SIR pin" class="pinTop" />
      </div>
    `,
    iconSize: [w, h],
    iconAnchor: [ax, ay],
    popupAnchor: [0, -h + 8],
  })
}

export default function AlertsList() {
  const [items, setItems] = React.useState<Alert[]>([])
  const [sel, setSel] = React.useState<Alert | null>(null)

  // Filtros
  const [sevChecked, setSevChecked] = React.useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(SEVERITY_META).map(k => [k, true]))
  )
  const [typeChecked, setTypeChecked] = React.useState<Record<string, boolean>>({})

  // Desplegables (acordeón)
  const [openSev, setOpenSev] = React.useState(false)
  const [openTypes, setOpenTypes] = React.useState(false)

  const barRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    getAlertas().then((r) => {
      setItems(r)
      setSel(r[0] ?? null)

      // tipos dinámicos
      const allTypes = Array.from(
        new Set(r.map(a => (a as any).tipo || (a as any).category || 'Otro'))
      ).sort()
      setTypeChecked(Object.fromEntries(allTypes.map(t => [t, true])))
    })
  }, [])

  const allTypes = React.useMemo(() => Object.keys(typeChecked), [typeChecked])

  const filtered = React.useMemo(() => {
    const sevActive = new Set(
      Object.entries(sevChecked).filter(([, v]) => v).map(([k]) => k)
    )
    const typesActive = new Set(
      Object.entries(typeChecked).filter(([, v]) => v).map(([k]) => k)
    )
    return items.filter(a => {
      const sev = (a.severidad || '').trim() || 'Otro'
      const tipo = ((a as any).tipo || (a as any).category || 'Otro') as string
      const sevOk  = sevActive.size === 0 ? true : sevActive.has(sev)
      const tipoOk = typesActive.size === 0 ? true : typesActive.has(tipo)
      return sevOk && tipoOk
    })
  }, [items, sevChecked, typeChecked])

  const center: LatLngExpression =
    sel ? [sel.lat, sel.lon]
        : filtered[0] ? [filtered[0].lat, filtered[0].lon]
                      : [12.114, -86.236] // Managua

  const toggleSev = () => { setOpenSev(v => !v); setOpenTypes(false) }
  const toggleTypes = () => { setOpenTypes(v => !v); setOpenSev(false) }

  const setAllTypes = (val: boolean) =>
    setTypeChecked(Object.fromEntries(allTypes.map(t => [t, val])))
  const setAllSev = (val: boolean) =>
    setSevChecked(Object.fromEntries(Object.keys(SEVERITY_META).map(k => [k, val])))

  // Click afuera -> cerrar paneles
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!barRef.current) return
      if (!barRef.current.contains(e.target as Node)) {
        setOpenSev(false); setOpenTypes(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div className="space-y-3">
      {/* ===== Barra de filtros arriba (sticky bajo el header) ===== */}
      <div className="sticky z-[1600] top-[calc(var(--hdr)+8px)]" ref={barRef}>
        <Card className="glass-white border-white/20 overflow-visible">
          <div className="px-3 sm:px-4 py-3 relative overflow-visible">
            {/* Botones */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSev}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 border
                  ${openSev ? 'bg-white/15 border-white/30' : 'bg-white/10 hover:bg-white/15 border-white/20'}`}
              >
                Severidad
                <ChevronDown className={`h-4 w-4 transition-transform ${openSev ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={toggleTypes}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 border
                  ${openTypes ? 'bg-white/15 border-white/30' : 'bg-white/10 hover:bg-white/15 border-white/20'}`}
              >
                Checklist
                <ChevronDown className={`h-4 w-4 transition-transform ${openTypes ? 'rotate-180' : ''}`} />
              </button>

              <div className="ml-auto text-sm text-white/80">
                Mostrando <b>{filtered.length}</b> alertas{sel ? <> · centrado en <b>{sel.mun}</b></> : null}
              </div>
            </div>

            {/* === Panel overlay Severidad (no empuja el mapa) === */}
            {openSev && (
              <div className="absolute left-2 right-2 top-[calc(100%+8px)] z-[1700] rounded-xl border border-white/20 bg-[#0b1320]/95 backdrop-blur-xl shadow-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Severidad</h4>
                  <div className="flex gap-4 text-xs">
                    <button className="underline text-white/80 hover:text-white" onClick={()=>setAllSev(true)}>Todos</button>
                    <button className="underline text-white/80 hover:text-white" onClick={()=>setAllSev(false)}>Ninguno</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.keys(SEVERITY_META).map(k => {
                    const meta = SEVERITY_META[k]
                    return (
                      <label key={k} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={!!sevChecked[k]} onChange={()=>setSevChecked(s=>({...s,[k]:!s[k]}))} />
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 rounded-sm border border-white/20" style={{ background: meta.color }} />
                          {k}
                          <span className="text-white/60 hidden xl:inline">— {meta.description}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* === Panel overlay Checklist (no empuja el mapa) === */}
            {openTypes && (
              <div className="absolute left-2 right-2 top-[calc(100%+8px)] z-[1700] rounded-xl border border-white/20 bg-[#0b1320]/95 backdrop-blur-xl shadow-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Tipo de incidencia</h4>
                  <div className="flex gap-4 text-xs">
                    <button className="underline text-white/80 hover:text-white" onClick={()=>setAllTypes(true)}>Todos</button>
                    <button className="underline text-white/80 hover:text-white" onClick={()=>setAllTypes(false)}>Ninguno</button>
                  </div>
                </div>

                {allTypes.length === 0 ? (
                  <p className="text-sm text-white/60">Sin datos de tipo.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[36vh] overflow-y-auto pr-1">
                    {allTypes.map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="checkbox" checked={!!typeChecked[t]} onChange={()=>setTypeChecked(s=>({...s,[t]:!s[t]}))} />
                        {t}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ===== Mapa grande (full width) ===== */}
      <Card className="w-full">
        <CardHeader className="pb-2"><CardTitle>Mapa</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="h-[70vh] sm:h-[72vh] lg:h-[74vh] xl:h-[78vh]">
            <RLMapContainer
              key={`${sel?.id ?? 'none'}-${filtered.length}`}
              center={center}
              zoom={8}
              className="h-full w-full rounded-2xl overflow-hidden z-0"
            >
              <RLTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filtered.map(a => (
                <RLMarker
                  key={a.id}
                  position={[a.lat, a.lon]}
                  icon={iconForSeverity(a.severidad)}
                  eventHandlers={{ click: () => setSel(a) }}
                >
                  <RLPopup>
                    <b>{a.titulo}</b><br />
                    {a.dep} — {a.mun}<br />
                    <small>Lat {a.lat.toFixed(3)}, Lon {a.lon.toFixed(3)}</small><br />
                    <small>
                      <b>Severidad:</b> {a.severidad || '—'} ·{' '}
                      <b>Tipo:</b> {(a as any).tipo || (a as any).category || 'Otro'}
                    </small>
                  </RLPopup>
                </RLMarker>
              ))}
            </RLMapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}