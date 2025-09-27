from typing import Any, Dict, List

from rasa_sdk import Action
from rasa_sdk.events import SlotSet
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.interfaces import Tracker

from geopy.geocoders import Nominatim
from rapidfuzz import process as rf
import unicodedata, re

# User-Agent con contacto real (cumplir política de Nominatim)
_GEO = Nominatim(user_agent="Riaar/1.0 (soporte@mint.gob.ni)")

# Puedes reemplazar/expandir por tu gazetteer real de NI.
GAZETTEER = [
    "Managua", "León", "Santa Teresa, Carazo", "Masaya", "Granada",
    "Chinandega", "Estelí", "Matagalpa", "Jinotepe", "Tipitapa", "Masatepe"
]

PREV = {
    "terremoto": [
        "Identifica zonas seguras (debajo de mesas firmes, lejos de ventanas).",
        "Prepara mochila de emergencia (agua, botiquín, linterna, radio).",
        "Practica rutas de evacuación y punto de reunión."
    ],
    "inundación": [
        "No cruces corrientes: 30 cm pueden arrastrar un vehículo.",
        "Eleva documentos/equipos; corta electricidad si es seguro.",
        "Ubica refugios temporales en zonas altas."
    ],
    "incendio": [
        "Instala detectores de humo y revisa extintores (ABC).",
        "Planifica dos salidas por ambiente; pasillos despejados.",
        "Si hay humo: gatea y cubre nariz/boca."
    ],
    "huracán": [
        "Asegura techos/ventanas; retira objetos sueltos del exterior.",
        "Almacena agua, alimentos no perecederos y baterías.",
        "Sigue avisos oficiales; evita salir durante el ojo del huracán."
    ],
}

_ALLOWED = re.compile(r"[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ,\.-]")

def clean_place(text: str) -> str:
    s = unicodedata.normalize("NFC", (text or "").strip())
    s = re.sub(r'^(ir a|llevar|llévame a|vamos a|ubícame en)\s+', '', s, flags=re.I)
    s = _ALLOWED.sub('', s)
    s = re.sub(r'\s{2,}', ' ', s)
    return s.strip()

class ActionGeocodeAndRoute(Action):
    """Intención: navigate_to → geocodifica y envía payload 'navigate' para el mapa."""

    def name(self) -> str:
        return "action_geocode_and_route"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[str, Any]) -> List[Dict[str, Any]]:

        # 1) toma location del slot o del último mensaje
        place = tracker.get_slot("location") or (tracker.latest_message.get("text") or "")
        place = clean_place(place)

        # 2) autocorrección por gazetteer (typos tipo "satan"→"santa")
        match = rf.extractOne(place, GAZETTEER, score_cutoff=86)
        if match:
            place = match[0]

        # 3) geocodificar con sesgo a Nicaragua y español
        try:
            locs = _GEO.geocode(
                place,
                country_codes="ni",
                language="es",
                addressdetails=True,
                exactly_one=False,
                limit=3
            )
        except Exception:
            locs = None

        if not locs:
            dispatcher.utter_message(text=f"No pude verificar «{place}». Prueba con municipio y departamento.")
            return []

        # 4) desambiguación si hay varias coincidencias
        if len(locs) > 1:
            chips = [{"type": "suggest", "text": f"Ir a {l.address}"} for l in locs[:3]]
            dispatcher.utter_message(
                text="¿A cuál te refieres?",
                custom={"type": "suggestions", "items": chips}
            )
            return []

        # 5) único destino → enviar payload de navegación
        l = locs[0]
        pretty = l.address
        dispatcher.utter_message(
            text=f"Te llevo a **{pretty}**.",
            custom={
                "type": "navigate",
                "place": pretty,
                "destination": {"lat": l.latitude, "lon": l.longitude}
            }
        )
        return [SlotSet("location", pretty)]

class ActionPreventionTips(Action):
    """Intención: prevention_advice → envía payload 'tips' con medidas por riesgo."""

    def name(self) -> str:
        return "action_prevention_tips"

    def run(self,
            dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[str, Any]) -> List[Dict[str, Any]]:

        risk = (tracker.get_slot("risk_type") or "").strip().lower()

        # sinónimos básicos
        synonyms = {
            "inundacion": "inundación",
            "huracan": "huracán",
            "incendio": "incendio",
            "terremoto": "terremoto"
        }
        risk = synonyms.get(risk, risk)

        medidas = PREV.get(risk, [])
        if not medidas:
            dispatcher.utter_message(text="Dime el riesgo: terremoto, inundación, incendio o huracán.")
            return []

        dispatcher.utter_message(
            text=f"Medidas para **{risk}**:",
            custom={"type": "tips", "risk": risk, "items": medidas}
        )
        return []