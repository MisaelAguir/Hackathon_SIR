import os
import datetime as dt
from typing import Any, Dict, Optional, List

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

# Mantengo tu import del asistente actual como fallback
from ai import assistant as ai_assistant

from db import query_one, query_all  # ← usamos ambos

load_dotenv()

API_TITLE = os.getenv("API_TITLE", "Riaar API")
API_VERSION = os.getenv("API_VERSION", "0.3.0")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
NOMINATIM_URL = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org/search")

# --- Config Rasa y User-Agent/Contacto ---
RASA_URL = os.getenv("RASA_URL", "http://localhost:5005/webhooks/rest/webhook")
RASA_ENABLED = os.getenv("RASA_ENABLED", "1") != "0"
RASA_TIMEOUT = float(os.getenv("RASA_TIMEOUT", "10"))

UA_APP = os.getenv("UA_APP", "Riaar")
UA_CONTACT = os.getenv("UA_CONTACT", "soporte@mint.gob.ni")
UA_HEADER = {"User-Agent": f"{UA_APP}/{API_VERSION} ({UA_CONTACT})"}

# --- Caché simple para geocoding (opcional) ---
try:
    from cachetools import TTLCache
    _GEO_CACHE: "TTLCache[str, Dict[str, Any]]" = TTLCache(maxsize=1024, ttl=1800)  # 30 min
except Exception:
    _GEO_CACHE = {}  # si no hay cachetools, cae a dict (sin TTL)

# Nicaragua bbox aprox (west, south, east, north)
NI_BBOX = (-87.8, 10.6, -83.0, 15.1)

app = FastAPI(title=API_TITLE, version=API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- MODELOS ---------
class SearchResult(BaseModel):
    id: str
    title: str
    snippet: str

class LoginReq(BaseModel):
    username: str
    password: str

class Incident(BaseModel):
    id: str
    title: str
    description: str = ""
    severity: str  # red|yellow|green|blue|purple
    type: str = "general"  # traffic,flood,fire,...
    lat: float
    lon: float
    timestamp: str

class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    severity: str   # acepta 'red|yellow|green|blue|purple' o 'grave|medio|leve|transito_menor|muy_grande'
    type: str = "general"
    lat: float
    lon: float

class AssistantReq(BaseModel):
    message: str

# --------- MENÚ ---------
MENU = [
    {"id": "dashboard","title": "Panel","items": [
        {"id": "resumen", "title": "Resumen"},
        {"id": "actividad", "title": "Actividad"},
    ]},
    {"id": "alertas","title": "Alertas","items": [
        {"id": "solicitudes", "title": "Solicitudes"},
        {"id": "expedientes", "title": "Expedientes"},
    ]},
    {"id": "registros","title": "Registros","items": [
        {"id": "ciudadanos", "title": "Ciudadanos"},
        {"id": "instituciones", "title": "Instituciones"},
    ]},
    {"id": "reportes","title": "Reportes","items": [
        {"id": "estadisticas", "title": "Estadísticas"},
        {"id": "descargas", "title": "Descargas"},
    ]},
    {"id": "mapa", "title": "Mapa Nicaragua"},
]

# --------- UTILIDADES ---------
async def nominatim_geocode(place: str) -> Dict[str, Any]:
    """
    Geocodificación sesgada a Nicaragua con headers correctos, idioma ES y caché.
    Devuelve center y bbox (contrato intacto).
    """
    key = (place or "").strip().lower()
    try:
        cached = _GEO_CACHE.get(key)
        if cached:
            return cached
    except Exception:
        pass

    params = {
        "format": "json",
        "q": place,
        "countrycodes": "ni",
        "limit": 1,
        "accept-language": "es",
        "addressdetails": 1,
        # viewbox = west, north, east, south
        "viewbox": f"{NI_BBOX[0]},{NI_BBOX[3]},{NI_BBOX[2]},{NI_BBOX[1]}",
        "bounded": 1
    }

    async with httpx.AsyncClient(timeout=8.0, headers=UA_HEADER) as client:
        r = await client.get(NOMINATIM_URL, params=params)
        r.raise_for_status()
        data = r.json()
        if not data:
            raise RuntimeError("No geocode result")
        hit = data[0]
        lat, lon = float(hit["lat"]), float(hit["lon"])
        # boundingbox: ["south","north","west","east"]
        bb = hit.get("boundingbox", ["10.6", "15.1", "-87.8", "-83.0"])
        south, north, west, east = map(float, bb)
        result = {
            "center": {"lat": lat, "lon": lon},
            "bbox": {"west": west, "south": south, "east": east, "north": north},
        }

    try:
        _GEO_CACHE[key] = result
    except Exception:
        pass
    return result

# mapear etiquetas lógicas → color
LOGICAL_TO_COLOR = {
    "grave": "red",
    "medio": "yellow",
    "leve": "green",
    "transito_menor": "blue",
    "muy_grande": "purple",
}
COLOR_SET = {"red", "yellow", "green", "blue", "purple"}

def normalize_severity(value: str) -> str:
    v = (value or "").strip().lower()
    if v in COLOR_SET:
        return v
    return LOGICAL_TO_COLOR.get(v, "yellow")

# --------- ENDPOINTS BÁSICOS ---------
@app.get("/health")
def health():
    db_ok = True
    try:
        _ = query_one("SELECT 1 AS ok")
    except Exception:
        db_ok = False
    return {"status": "ok", "db": db_ok}

@app.get("/menu")
def get_menu():
    return {"menu": MENU}

@app.get("/search")
def search(q: str = Query("", min_length=0), section: str = "", item: str = "") -> Dict[str, Any]:
    scope = f"{section}{' / ' + item if item else ''}".strip() or "global"
    results = [
        SearchResult(id="1", title=f"{scope}: {q} — resultado A", snippet="Ejemplo A"),
        SearchResult(id="2", title=f"{scope}: {q} — resultado B", snippet="Ejemplo B"),
    ]
    return {"query": q, "section": section, "item": item, "results": [r.model_dump() for r in results]}

@app.get("/geocode")
async def geocode(place: str = Query("Nicaragua")) -> Dict[str, Any]:
    fallback = {
        "place": place,
        "center": {"lat": 12.865, "lon": -85.207},
        "bbox": {"west": -87.8, "south": 10.6, "east": -83.0, "north": 15.1},
        "source": "fallback",
    }
    try:
        g = await nominatim_geocode(place)
        return {"place": place, **g, "source": "nominatim"}
    except Exception:
        return fallback

# --------- LOGIN DEMO ---------
@app.post("/auth/login")
def login(payload: LoginReq) -> Dict[str, Any]:
    if payload.username == "user" and payload.password == "pass":
        return {"user": {"Id": 1, "usuario": "user"}}
    raise HTTPException(status_code=401, detail={"DETALLE_ERRORES": [{
        "Codigo_error": "401", "Descripcion_error": "Usuario o Contraseña incorrectos."
    }]})

# --------- INCIDENTES (GET conectado a BD) ---------
@app.get("/incidents")
async def incidents(place: str = Query("Nicaragua"), severity: Optional[str] = Query(None)):
    """
    Devuelve incidentes desde la tabla Incidentes cerca del lugar indicado.
    Tabla: Id, Titulo, Descripcion, Severidad, Tipo, Lat, Lon, Fecha
    """
    try:
        g = await geocode(place)
        c = g["center"]
    except Exception:
        c = {"lat": 12.865, "lon": -85.207}

    lat_min, lat_max = float(c["lat"]) - 0.25, float(c["lat"]) + 0.25
    lon_min, lon_max = float(c["lon"]) - 0.25, float(c["lon"]) + 0.25

    sev_sql = ""
    params: List[Any] = [lat_min, lat_max, lon_min, lon_max]
    if severity:
        sev = severity.lower()
        logical = next((k for k, v in LOGICAL_TO_COLOR.items() if v == sev), None)
        sev_sql = " AND (LOWER(Severidad) = ? OR LOWER(Severidad) = ?) "
        params.extend([sev, logical or sev])

    sql = f"""
      SELECT TOP 200
        Id, Titulo, Descripcion, Severidad, Tipo, Lat, Lon, Fecha
      FROM Incidentes
      WHERE Lat BETWEEN ? AND ?
        AND Lon BETWEEN ? AND ?
        {sev_sql}
      ORDER BY Fecha DESC
    """
    rows = query_all(sql, tuple(params))

    def to_color(value: str) -> str:
        v = (value or "").lower()
        if v in COLOR_SET:
            return v
        return LOGICAL_TO_COLOR.get(v, "yellow")

    items: List[Dict[str, Any]] = []
    for r in rows:
        color = to_color(str(r.get("Severidad", "")))
        ts = r.get("Fecha")
        ts_iso = ts.isoformat() if hasattr(ts, "isoformat") else (str(ts) if ts is not None else dt.datetime.utcnow().isoformat()+"Z")
        items.append({
            "id": str(r.get("Id")),
            "title": r.get("Titulo") or "Incidente",
            "description": r.get("Descripcion") or "",
            "severity": color,
            "type": r.get("Tipo") or "general",
            "lat": float(r["Lat"]),
            "lon": float(r["Lon"]),
            "timestamp": ts_iso,
        })

    return {"place": place, "center": c, "incidents": items}

# --------- INCIDENCIAS (POST: crear registro) ---------
@app.post("/incidents")
def create_incident(payload: IncidentCreate) -> Dict[str, Any]:
    """
    Crea una incidencia en la tabla Incidentes y devuelve el registro insertado.
    """
    sev = normalize_severity(payload.severity)

    sql = """
        INSERT INTO Incidentes (Titulo, Descripcion, Severidad, Tipo, Lat, Lon, Fecha)
        OUTPUT INSERTED.Id, INSERTED.Titulo, INSERTED.Descripcion, INSERTED.Severidad,
               INSERTED.Tipo, INSERTED.Lat, INSERTED.Lon, INSERTED.Fecha
        VALUES (?, ?, ?, ?, ?, ?, GETDATE());
    """
    row = query_one(sql, (
        payload.title, payload.description or "", sev, payload.type,
        float(payload.lat), float(payload.lon)
    ))

    color = normalize_severity(row.get("Severidad"))
    ts = row.get("Fecha")
    ts_iso = ts.isoformat() if hasattr(ts, "isoformat") else str(ts)

    return {
        "incident": {
            "id": str(row.get("Id")),
            "title": row.get("Titulo"),
            "description": row.get("Descripcion"),
            "severity": color,
            "type": row.get("Tipo") or "general",
            "lat": float(row["Lat"]),
            "lon": float(row["Lon"]),
            "timestamp": ts_iso,
        }
    }

# --------- ASISTENTE IA ---------
async def _ask_rasa(text: str) -> Optional[Dict[str, Any]]:
    """
    Envía el texto a Rasa (REST) y devuelve {reply, actions} o None si no hay respuesta útil.
    """
    async with httpx.AsyncClient(timeout=RASA_TIMEOUT) as client:
        resp = await client.post(RASA_URL, json={"sender": "user", "message": text})
        resp.raise_for_status()
        payload = resp.json()  # lista de mensajes
    reply_parts: List[str] = []
    actions: List[Dict[str, Any]] = []
    for m in payload:
        if m.get("text"):
            reply_parts.append(m["text"])
        if "custom" in m:  # navigate / tips / suggestions
            actions.append(m["custom"])
    reply = " ".join(reply_parts).strip()
    if not reply and not actions:
        return None
    return {"reply": reply, "actions": actions}

@app.post("/assistant")
async def assistant_api(body: AssistantReq):
    """
    1) Intenta con Rasa si está habilitado.
    2) Si Rasa no responde/errores, cae al asistente existente (ai_assistant).
    """
    text = body.message or ""
    if RASA_ENABLED:
        try:
            rasa_out = await _ask_rasa(text)
            if rasa_out:
                return rasa_out
        except Exception:
            pass  # fallback silencioso

    result = await ai_assistant(text)  # tu lógica anterior sigue viva
    if isinstance(result, str):
        return {"reply": result, "actions": []}
    return result