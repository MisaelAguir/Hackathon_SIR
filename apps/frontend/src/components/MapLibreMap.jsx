import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_CENTER = { lat: 12.1364, lon: -86.2514 };
const DEFAULT_ZOOM = 11;

// Fallback que funciona sin key
const STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";

export default function MapLibreMap({ center, destination, route }) {
  const mapDiv = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;
    const m = new maplibregl.Map({
      container: mapDiv.current,
      style: STYLE_URL,
      center: [center?.lon ?? DEFAULT_CENTER.lon, center?.lat ?? DEFAULT_CENTER.lat],
      zoom: DEFAULT_ZOOM,
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
    map.current = m;
    return () => m.remove();
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !destination) return;

    const srcId = "dest-src";
    const lyrId = "dest-lyr";
    const data = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Point", coordinates: [destination.lon, destination.lat] } },
      ],
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
    m.flyTo({ center: [destination.lon, destination.lat], zoom: 14, essential: true });
  }, [destination]);

  useEffect(() => {
    const m = map.current;
    if (!m || !route?.geometry) return;

    const srcId = "route-src";
    const lyrId = "route-lyr";
    const data = { type: "FeatureCollection", features: [{ type: "Feature", geometry: route.geometry }] };

    if (m.getSource(srcId)) m.getSource(srcId).setData(data);
    else {
      m.addSource(srcId, { type: "geojson", data });
      m.addLayer({
        id: lyrId,
        type: "line",
        source: srcId,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-width": 5 },
      });
    }
  }, [route]);

  return <div ref={mapDiv} className="w-full h-full" />;
}