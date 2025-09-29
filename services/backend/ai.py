import os, re, unicodedata, datetime as dt, random
from typing import Dict, Any, List, Optional
import httpx

NOMINATIM_URL = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org/search")
UA = {"User-Agent": "Riaar/assistant 0.1 (contact: dev@example.com)"}

def _norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")
    return s.lower().strip()

async def geocode(place: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=8.0, headers=UA) as client:
        r = await client.get(NOMINATIM_URL, params={"format": "json", "q": place, "countrycodes": "ni", "limit": 1})
        r.raise_for_status()
        data = r.json()
        if not data:
            raise RuntimeError("no geocode")
        hit = data[0]
        lat, lon = float(hit["lat"]), float(hit["lon"])
        bb = hit.get("boundingbox", ["10.6", "15.1", "-87.8", "-83.0"])  # [south, north, west, east]
        south, north, west, east = map(float, bb)
        return {"center": {"lat": lat, "lon": lon}, "bbox": {"west": west, "south": south, "east": east, "north": north}}

async def wiki_search(query: str) -> List[Dict[str, Any]]:
    """Búsqueda simple en Wikipedia (es). Sin API key."""
    async with httpx.AsyncClient(timeout=8.0, headers=UA) as client:
        # 1) obtener títulos sugeridos
        s = await client.get("https://es.wikipedia.org/w/api.php", params={
            "action": "opensearch", "search": query, "limit": 5, "namespace": 0, "format": "json"
        })
        s.raise_for_status()
        sug = s.json()  # [query, titles[], descriptions[], urls[]]
        titles, descs, urls = sug[1], sug[2], sug[3]
        res = []
        for i, title in enumerate(titles):
            res.append({
                "title": title,
                "snippet": descs[i] if i < len(descs) else "",
                "url": urls[i] if i < len(urls) else f"https://es.wikipedia.org/wiki/{title.replace(' ', '_')}",
            })
        return res

def _map_severity(text: str) -> Optional[str]:
    if re.search(r"(muy grande|morado|morada)", text): return "purple"
    if re.search(r"(grave|severa|alto)", text):         return "red"
    if re.search(r"(medio|media|amarill)", text):       return "yellow"
    if re.search(r"(leve|verde)", text):                return "green"
    if re.search(r"(transito|tr[aá]nsito|azul)", text): return "blue"
    return None

def _detect_intent(q: str) -> Dict[str, Any]:
    t = _norm(q)

    # artículos
    if re.search(r"(articul|noticia|informacion|que es|definicion|definici[oó]n)", t):
        m = re.search(r"(?:sobre|de)\s+(.*)$", t)
        query = m.group(1) if m else q
        return {"type": "articles", "query": query}

    # incidencias
    if re.search(r"(incidencia|insidencia|accidente|evento|alerta)", t):
        sev = _map_severity(t)
        m = re.search(r"(?:en)\s+(.+)$", t)
        place = m.group(1) if m else ""
        return {"type": "incidents", "place": place, "severity": sev}

    # navegar
    m = re.search(r"(?:(?:ir|ve|vamos)\s+a|buscar|donde queda|ubicaci[oó]n de)\s+(.+)$", t)
    if m:
        return {"type": "navigate", "place": m.group(1)}

    # tips de seguridad
    if re.search(r"(transito|trafico|conducir|accidente)", t):     return {"type": "tips", "topic": "transito"}
    if re.search(r"(terremoto|sismo)", t):                         return {"type": "tips", "topic": "terremoto"}
    if re.search(r"(inundaci[oó]n|lluvia|crecida)", t):            return {"type": "tips", "topic": "inundacion"}
    if re.search(r"(huracan|tormenta)", t):                        return {"type": "tips", "topic": "huracan"}
    if re.search(r"(incendio|fuego)", t):                          return {"type": "tips", "topic": "incendio"}
    if re.search(r"(deslizamiento|derrumbe)", t):                  return {"type": "tips", "topic": "deslizamiento"}
    if re.search(r"(volcan|erupcion|ceniza)", t):                  return {"type": "tips", "topic": "volcan"}
    if re.search(r"(seguridad|desastres|emergencia|prevencion)", t): return {"type": "tips", "topic": "general"}

    # fallback: intenta navegar si hay "en ..."
    m = re.search(r"(?:en)\s+(.+)$", t)
    if m:
        return {"type": "navigate", "place": m.group(1)}
    return {"type": "unknown"}

async def assistant(message: str) -> Dict[str, Any]:
    intent = _detect_intent(message)
    out: Dict[str, Any] = {"reply": "", "actions": [], "articles": []}

    if intent["type"] == "navigate" and intent.get("place"):
        out["reply"] = f"Te llevo a **{intent['place']}**."
        out["actions"].append({"type": "navigate", "place": intent["place"]})
        try:
            await geocode(intent["place"])  # validación ligera
        except Exception:
            out["reply"] = f"No pude verificar el lugar, pero intento llevarte a **{intent['place']}**."
        return out

    if intent["type"] == "incidents" and intent.get("place"):
        sev = intent.get("severity")
        tag = {"red":"grave","yellow":"medio","green":"leve","blue":"tránsito menor","purple":"muy grande"}.get(sev,"")
        sev_txt = f" (severidad {tag})" if sev else ""
        out["reply"] = f"Buscando incidencias en **{intent['place']}**{sev_txt}…"
        out["actions"].append({"type": "incidents", "place": intent["place"], "severity": sev})
        return out

    if intent["type"] == "articles":
        out["reply"] = f"Buscando artículos sobre **{intent['query']}**…"
        try:
            res = await wiki_search(intent["query"])
            out["articles"] = res
            if not res:
                out["reply"] = "No encontré artículos para ese tema."
        except Exception:
            out["reply"] = "No pude consultar artículos en este momento."
        return out

    if intent["type"] == "tips":
        out["reply"] = f"Te doy medidas de **{intent['topic']}**. ¿Quieres que además te lleve a un lugar? (Ej.: “incidencia en Managua”)."
        out["actions"].append({"type": "tips", "topic": intent["topic"]})
        return out

    out["reply"] = "Puedo llevarte al mapa (ej. “ir a León”), mostrar incidencias (ej. “incidencia grave en Managua”) o buscar artículos (ej. “artículos sobre terremotos en Nicaragua”)."
    return out