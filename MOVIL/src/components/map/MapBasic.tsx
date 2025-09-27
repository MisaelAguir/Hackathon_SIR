import React from 'react'
import {
  MapContainer as RLMapContainer,
  TileLayer as RLTileLayer,
  Marker as RLMarker,
  Popup as RLPopup,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import { markerIcon } from './leaflet'

export default function MapBasic(){
  const center: LatLngExpression = [12.114, -86.236] // Managua
  return (
    <div className="h-64">
      <RLMapContainer center={center} zoom={8} scrollWheelZoom={false} className="h-full w-full">
        <RLTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <RLMarker position={center} icon={markerIcon}>
          <RLPopup>Managua — punto de ejemplo</RLPopup>
        </RLMarker>
      </RLMapContainer>
    </div>
  )
}