import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

function ClickToSet({ setPos }) {
  useMapEvents({
    click(e) { setPos({ lat: e.latlng.lat, lon: e.latlng.lng }) }
  })
  return null
}

export default function IncidentForm({ apiUrl }) {
  const [place, setPlace] = useState('Nicaragua')
  const [center, setCenter] = useState({ lat: 12.865, lon: -85.207 })
  const [pos, setPos] = useState({ lat: 12.865, lon: -85.207 })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiUrl}/geocode?place=${encodeURIComponent(place)}`)
        const d = await r.json()
        setCenter(d.center)
        setPos(d.center)
      } catch {}
    })()
  }, [place, apiUrl])

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    const body = {
      title: fd.get('title') || '',
      description: fd.get('description') || '',
      severity: fd.get('severity') || 'yellow',
      type: fd.get('type') || 'general',
      lat: Number(fd.get('lat')),
      lon: Number(fd.get('lon')),
    }
    try {
      setSaving(true)
      const r = await fetch(`${apiUrl}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setMsg(`Incidencia creada (ID: ${data.incident.id}).`)
      e.currentTarget.reset()
    } catch (err) {
      setMsg('No se pudo guardar la incidencia.')
    } finally {
      setSaving(false)
    }
  }

  const centerArr = [center.lat, center.lon]
  const posArr = [pos.lat, pos.lon]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Registrar incidencia</h3>
        <p className="text-sm text-white/70">Usa el formulario o haz click en el mapa para fijar las coordenadas.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <form onSubmit={onSubmit} className="rounded-2xl glass p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/70">Título</label>
              <input name="title" required className="w-full h-10 rounded-xl bg-white/10 border border-white/20 px-3 text-white" />
            </div>
            <div>
              <label className="text-xs text-white/70">Severidad</label>
              <select name="severity" defaultValue="yellow" className="w-full h-10 rounded-xl bg-white/10 border border-white/20 px-3 text-white">
                <option value="red">Rojo — grave</option>
                <option value="yellow">Amarillo — medio</option>
                <option value="green">Verde — leve</option>
                <option value="blue">Azul — tránsito menor</option>
                <option value="purple">Morado — accidente muy grande</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/70">Tipo</label>
            <select name="type" defaultValue="general" className="w-full h-10 rounded-xl bg-white/10 border border-white/20 px-3 text-white">
              <option value="general">General</option>
              <option value="traffic">Tránsito</option>
              <option value="flood">Inundación</option>
              <option value="fire">Incendio</option>
              <option value="earthquake">Terremoto</option>
              <option value="landslide">Deslizamiento</option>
              <option value="volcano">Volcán</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/70">Descripción</label>
            <textarea name="description" rows={3} className="w-full rounded-xl bg-white/10 border border-white/20 px-3 text-white" />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-white/70">Buscar lugar (geocodificar)</label>
              <div className="flex gap-2">
                <input
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  placeholder="Ej. León, Matagalpa, Bluefields…"
                  className="flex-1 h-10 rounded-xl bg-white/10 border border-white/20 px-3 text-white"
                />
                <button type="button" onClick={() => setPlace(place)} className="h-10 px-3 rounded-xl bg-white/20">Ir</button>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/70">Coordenadas</label>
              <div className="grid grid-cols-2 gap-2">
                <input name="lat" value={pos.lat} onChange={(e)=>setPos(p=>({...p,lat:Number(e.target.value)}))}
                  className="h-10 rounded-xl bg-white/10 border border-white/20 px-3 text-white" />
                <input name="lon" value={pos.lon} onChange={(e)=>setPos(p=>({...p,lon:Number(e.target.value)}))}
                  className="h-10 rounded-xl bg-white/10 border border-white/20 px-3 text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button disabled={saving} className="rounded-xl px-4 py-2 bg-white/20">
              {saving ? 'Guardando…' : 'Guardar incidencia'}
            </button>
            {msg && <span className="text-xs text-white/70">{msg}</span>}
          </div>
        </form>

        {/* Mapa para elegir coordenadas */}
        <div className="rounded-2xl overflow-hidden glass">
          <div className="h-[420px]">
            <MapContainer center={centerArr} zoom={7} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors" />
              <Marker position={posArr} icon={icon} />
              <ClickToSet setPos={setPos} />
            </MapContainer>
          </div>
          <div className="p-2 text-xs text-white/70">Click en el mapa para fijar lat/lon.</div>
        </div>
      </div>
    </div>
  )
}