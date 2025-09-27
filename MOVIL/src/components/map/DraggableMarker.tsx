import React from 'react'
import { Marker as RLMarker, Popup as RLPopup, useMapEvents } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { markerIcon } from './leaflet'

export default function DraggableMarker({
  position,
  onChange
}:{ position:{lat:number,lng:number}, onChange:(ll:{lat:number,lng:number})=>void }){
  const [pos, setPos] = React.useState<{lat:number,lng:number}>(position)
  const markerRef = React.useRef<any>(null)
  useMapEvents({ click(e){ const p = e.latlng as any; setPos(p); onChange(p) } })
  const place: LatLngExpression = [pos.lat, pos.lng]
  return (
    <RLMarker
      draggable
      eventHandlers={{ dragend: ()=>{
        const m = markerRef.current
        if (m){ const ll = m.getLatLng(); const p={lat:ll.lat, lng:ll.lng}; setPos(p); onChange(p) }
      }}}
      position={place}
      ref={markerRef}
      icon={markerIcon}
    >
      <RLPopup>Arrástrame o haz clic en el mapa</RLPopup>
    </RLMarker>
  )
}