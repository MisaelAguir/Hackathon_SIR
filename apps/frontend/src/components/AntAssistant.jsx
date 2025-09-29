import { useEffect, useRef, useState } from "react";
import MapNicaraguaLeaflet from "./MapNicaragua";
import AssistantDrawer from "./AssistantDrawer"; // tu chat glass con la hormiga

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"; 

export default function AntAssistant() {
  // Estado de navegación y ruta que provee el asistente (Rasa)
  const [navTarget, setNavTarget] = useState(null); // {lat,lon}
  const [routeGeo, setRouteGeo] = useState(null);   // GeoJSON LineString
  const [tips, setTips] = useState([]);

  // Origen del usuario para rutas OSRM (lo usa AssistantDrawer)
  const originRef = useRef(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => (originRef.current = { lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Recibir navegación desde el chat
  function handleNavigate(dest /* {lat,lon} */) {
    setNavTarget(dest);
    setRouteGeo(null); // limpia ruta previa
  }

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] rounded-2xl overflow-hidden border">
      {/* Mapa (Leaflet) */}
      <MapNicaraguaLeaflet
        apiUrl={API}
        place="Nicaragua"
        showIncidents={false}
        navTarget={navTarget}
        routeGeo={routeGeo}
      />

      {/* Panel de medidas (overlay) */}
      {tips.length > 0 && (
        <div className="absolute left-3 bottom-3 max-w-md bg-yellow-50/95 border rounded-lg p-3 shadow z-[500]">
          <div className="font-semibold text-sm mb-1">Medidas de prevención</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      {/* Chat (Rasa) → mueve el mapa y calcula rutas */}
      <AssistantDrawer
        origin={originRef.current}
        onNavigate={handleNavigate}
        onRoute={(r) => setRouteGeo(r?.geometry || null)}
        onTips={setTips}
      />
    </div>
  );
}