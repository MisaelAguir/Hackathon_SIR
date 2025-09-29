// frontend/src/components/MapNicaragua.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Nicaragua bounds: [[west, south], [east, north]]
const MAX_BOUNDS = [[-87.8, 10.6], [-83.0, 15.1]];
const DEFAULT_CENTER = { lat: 12.865, lon: -85.207 };
const DEFAULT_ZOOM = 7;

// Estilo vectorial (usa .env, con fallback que NO requiere key)
const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";

const COLORS = {
  red: "#ef4444",
  yellow: "#f59e0b",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
};

function Legend() {
  const items = [
    ["Rojo", COLORS.red, "Grave"],
    ["Amarillo", COLORS.yellow, "Peligro medio"],
    ["Verde", COLORS.green, "Precaución leve"],
    ["Azul", COLORS.blue, "Accidente de tránsito menor"],
    ["Morado", COLORS.purple, "Accidente muy grande"],
  ];
  return (
    <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 text-white text-xs p-2 space-y-1 z-30">
      <div className="font-semibold">Incidencias</div>
      {items.map(([label, color, desc]) => (
        <div key={label} className="flex items-center gap-2">
          <span style={{ background: color }} className="inline-block w-3 h-3 rounded-full" />
          <span>{label}</span>
          <span className="text-white/60">— {desc}</span>
        </div>
      ))}
    </div>
  );
}

export default function MapNicaragua({
  apiUrl,
  place = "Nicaragua",
  showIncidents = false,
  severityFilter = null,
}) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [incidents, setIncidents] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const mapDiv = useRef(null);
  const map = useRef(null);
  const centerPopup = useRef(null);
  const [mapReady, setMapReady] = useState(false); // ← NUEVO

  // Carga de datos (geocode o incidents)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setErrorMsg("");
        if (showIncidents) {
          const url = new URL(`${apiUrl}/incidents`);
          url.searchParams.set("place", place);
          if (severityFilter) url.searchParams.set("severity", severityFilter);
          const r = await fetch(url);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const d = await r.json();
          if (!cancelled) {
            setCenter(d.center || DEFAULT_CENTER);
            setIncidents(d.incidents || []);
          }
        } else {
          const r = await fetch(`${apiUrl}/geocode?place=${encodeURIComponent(place)}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const d = await r.json();
          if (!cancelled) {
            setCenter(d.center || DEFAULT_CENTER);
            setIncidents([]);
          }
        }
      } catch (err) {
        console.warn("Mapa error:", err);
        if (!cancelled) {
          setCenter(DEFAULT_CENTER);
          setIncidents([]);
          setErrorMsg("No se pudo cargar información. Usando centro por defecto.");
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [place, showIncidents, severityFilter, apiUrl]);

  const centerArr = useMemo(() => [Number(center.lon), Number(center.lat)], [center]); // [lon,lat]

  // Inicializar mapa
  useEffect(() => {
    if (map.current) return;
    const m = new maplibregl.Map({
      container: mapDiv.current,
      style: STYLE_URL,
      center: centerArr,
      zoom: DEFAULT_ZOOM,
      maxBounds: MAX_BOUNDS,
      renderWorldCopies: false,
      attributionControl: true,
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    m.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: false,
      }),
      "bottom-right"
    );

    // Solo marcamos el mapa como listo cuando el estilo cargó
    m.on("load", () => setMapReady(true));

    // Listeners seguros después del load
    const clickHandler = (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties || {};
      const html = `
        <div style="min-width:180px">
          <div style="font-weight:600">${p.title ?? "Incidente"}</div>
          <div style="font-size:12px;opacity:.75">${p.timestamp ?? ""}</div>
        </div>`;
      new maplibregl.Popup({ closeOnClick: true }).setLngLat(e.lngLat).setHTML(html).addTo(m);
    };
    m.on("click", "incidents-lyr", clickHandler);

    map.current = m;
    return () => {
      m.off("click", "incidents-lyr", clickHandler);
      m.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Centrar map cuando cambia el centro (esperar estilo)
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;
    m.flyTo({ center: centerArr, zoom: showIncidents ? 8 : 7, essential: true });
  }, [centerArr, showIncidents, mapReady]);

  // Pin del centro (cuando NO hay incidentes)
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const srcId = "center-src";
    const lyrId = "center-lyr";

    if (showIncidents) {
      if (m.getLayer(lyrId)) m.removeLayer(lyrId);
      if (m.getSource(srcId)) m.removeSource(srcId);
      if (centerPopup.current) {
        centerPopup.current.remove();
        centerPopup.current = null;
      }
      return;
    }

    const data = {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "Point", coordinates: centerArr } }],
    };

    if (m.getSource(srcId)) m.getSource(srcId).setData(data);
    else {
      m.addSource(srcId, { type: "geojson", data });
      m.addLayer({
        id: lyrId,
        type: "circle",
        source: srcId,
        paint: {
          "circle-radius": 8,
          "circle-color": "#007aff",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    }

    if (centerPopup.current) centerPopup.current.remove();
    const popup = new maplibregl.Popup({ closeOnClick: false }).setLngLat(centerArr).setText(place);
    popup.addTo(m);
    centerPopup.current = popup;
  }, [centerArr, place, showIncidents, mapReady]);

  // Incidentes (círculos por severidad) cuando showIncidents = true
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const srcId = "incidents-src";
    const lyrId = "incidents-lyr";

    if (!showIncidents || incidents.length === 0) {
      if (m.getLayer(lyrId)) m.removeLayer(lyrId);
      if (m.getSource(srcId)) m.removeSource(srcId);
      return;
    }

    const fc = {
      type: "FeatureCollection",
      features: incidents.map((it) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [Number(it.lon), Number(it.lat)] },
        properties: {
          id: String(it.id),
          title: it.title || "Incidente",
          timestamp: new Date(it.timestamp).toLocaleString(),
          color: COLORS[it.severity] || "#ffffff",
        },
      })),
    };

    if (m.getSource(srcId)) {
      m.getSource(srcId).setData(fc);
    } else {
      m.addSource(srcId, { type: "geojson", data: fc });
      m.addLayer({
        id: lyrId,
        type: "circle",
        source: srcId,
        paint: {
          "circle-radius": 8,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.85,
        },
      });
    }
  }, [incidents, showIncidents, mapReady]);

  return (
    <div className="rounded-2xl overflow-hidden relative">
      {errorMsg && <div className="px-4 pt-3 text-xs text-red-300">{errorMsg}</div>}
      <div className="h-[540px] relative">
        <div ref={mapDiv} className="h-full w-full" />
        {showIncidents && <Legend />}
      </div>
    </div>
  );
}