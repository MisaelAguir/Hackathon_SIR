import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { MapContainer as RLMapContainer, TileLayer as RLTileLayer } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import DraggableMarker from '@/components/map/DraggableMarker'

export default function AlertsRegister() {
  const [coords, setCoords] = React.useState<{ lat: number; lng: number }>({
    lat: 12.865,
    lng: -85.297,
  })
  const center: LatLngExpression = [coords.lat, coords.lng]

  return (
    <div className="chat-aware pr-3 sm:pr-6">
      <div className="max-w-[1280px] lg:max-w-[1320px] xl:max-w-[1360px] 2xl:max-w-[1720px] mx-auto">
        <div className="grid gap-3 sm:gap-3.5">

          {/* ====== FORM ====== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg lg:text-[15px]">Registrar incidencia</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-2 sm:gap-2.5 text-[12.5px] leading-snug px-2 sm:px-3.5">

              {/* Dep / Mun / Loc */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-end">
                <div className="space-y-0.5">
                  <label className="text-white/80 text-[12px] tracking-tight whitespace-nowrap">Dep.</label>
                  <select className="bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 h-8 w-full">
                    <option>Carazo</option><option>León</option><option>Chontales</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-white/80 text-[12px] tracking-tight whitespace-nowrap">Mun.</label>
                  <select className="bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 h-8 w-full">
                    <option>El Rosario</option><option>Nagarote</option><option>El Coral</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-white/80 text-[12px] tracking-tight whitespace-nowrap">Localidad</label>
                  <select className="bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 h-8 w-full">
                    <option>La Calera (ER)</option><option>El Papalonal</option><option>Las Delicias</option>
                  </select>
                </div>
              </div>

              {/* Título — etiqueta a la par */}
              <div className="flex items-center gap-2 sm:gap-3">
                <label className="shrink-0 w-[72px] sm:w-[88px] text-white/80 text-[12px] tracking-tight">
                  Título
                </label>
                <Input placeholder="Ej. Inundación en barrio X" className="h-8 text-[12.5px] flex-1" />
              </div>

              {/* Tipo + Severidad — etiquetas a la par */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="shrink-0 w-[72px] sm:w-[88px] text-white/80 text-[12px] tracking-tight">
                    Tipo
                  </label>
                  <select className="bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 h-8 w-full flex-1">
                    <option>General</option><option>Hidromet.</option><option>Incendio</option><option>Sismo</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="shrink-0 w-[72px] sm:w-[88px] text-white/80 text-[12px] tracking-tight">
                    Severidad
                  </label>
                  <select className="bg-white/10 border border-white/20 rounded-xl px-2 py-1.5 h-8 w-full flex-1">
                    <option>Amarillo</option><option>Naranja</option><option>Rojo</option>
                  </select>
                </div>
              </div>

              {/* Descripción — MISMO ANCHO que Título + etiqueta a la par */}
              <div className="flex items-center gap-2 sm:gap-3">
                <label className="shrink-0 w-[72px] sm:w-[88px] text-white/80 text-[12px] tracking-tight">
                  Descripción
                </label>
                <Textarea
                  rows={2}
                  placeholder="Detalles de la incidencia..."
                  className="text-[12.5px] leading-snug min-h-[48px] flex-1"
                />
              </div>

              {/* Lat / Lon — etiquetas a la par */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="shrink-0 w-[72px] sm:w-[88px] text-white/80 text-[12px] tracking-tight">Lat</label>
                  <Input value={coords.lat.toFixed(6)} readOnly className="h-8 text-[12.5px] flex-1" />
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="shrink-0 w-[72px] sm:w-[88px] text-white/80 text-[12px] tracking-tight">Lon</label>
                  <Input value={coords.lng.toFixed(6)} readOnly className="h-8 text-[12.5px] flex-1" />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 sm:gap-3 justify-between pt-0.5">
                <Button variant="outline" className="text-[12.5px] px-3 py-1.5 h-8">Limpiar</Button>
                <Button className="text-[12.5px] px-3 py-1.5 h-8 ml-auto">Guardar incidencia</Button>
              </div>
            </CardContent>
          </Card>

          {/* ====== MAPA ====== */}
          <Card className="map-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg lg:text-[15px]">Mapa</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 px-2 sm:px-3.5">
              <div className="h-[38vh] sm:h-[48vh] lg:h-[52vh] xl:h-[56vh] 2xl:h-[58vh]">
                <RLMapContainer center={center} zoom={10} className="h-full w-full rounded-xl overflow-hidden">
                  <RLTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <DraggableMarker position={coords} onChange={setCoords} />
                </RLMapContainer>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}