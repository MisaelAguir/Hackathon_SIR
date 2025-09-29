import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const OSRM_URL = import.meta.env.VITE_OSRM_URL || "https://router.project-osrm.org";

/**
 * Widget de chat compacto con estilo “glass”.
 * - Transparente con blur, borde tenue y tipografía blanca.
 * - Logo de hormiga en cabecera (pásalo como prop logoSrc o cae a emoji 🐜).
 * - Habla con /assistant (backend→Rasa).
 */
export default function AssistantDrawer({
  origin,
  onNavigate,
  onRoute,
  onTips,
  logoSrc = null,        // ej: import ant from "../assets/ant.svg"; <AssistantDrawer logoSrc={ant} />
  title = "Hormiga asistente",
}) {
  const [open, setOpen] = useState(true); // ábrelo por defecto (pon false si lo quieres minimizado)
  const [chat, setChat] = useState([
    { role: "assistant", text: "Pregúntame y te llevo en el mapa (ej., “ir a Managua”)." },
  ]);
  const [text, setText] = useState("");
  const [chips, setChips] = useState([]);

  async function send(textToSend) {
    const msg = textToSend.trim();
    if (!msg) return;

    setChat((c) => [...c, { role: "user", text: msg }]);
    setText("");
    setChips([]);

    try {
      const r = await fetch(`${API}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!r.ok) {
        setChat((c) => [
          ...c,
          { role: "assistant", text: `No pude conectar con el servidor (HTTP ${r.status}).` },
        ]);
        return;
      }

      const data = await r.json();

      if (data.reply) setChat((c) => [...c, { role: "assistant", text: data.reply }]);

      if (Array.isArray(data.actions)) {
        for (const a of data.actions) {
          if (a.type === "navigate" && a.destination) {
            onNavigate?.(a.destination, a.place);

            if (origin?.lat && origin?.lon) {
              try {
                const url = `${OSRM_URL}/route/v1/driving/${origin.lon},${origin.lat};${a.destination.lon},${a.destination.lat}?overview=full&geometries=geojson&alternatives=true`;
                const rr = await fetch(url);
                const j = await rr.json();
                if (j.routes?.length) onRoute?.(j.routes[0]);
              } catch {/* silencioso */}
            }
          }
          if (a.type === "tips" && Array.isArray(a.items)) onTips?.(a.items);
          if (a.type === "suggestions" && Array.isArray(a.items)) setChips(a.items);
        }
      }
    } catch {
      setChat((c) => [...c, { role: "assistant", text: "Error de red al hablar con el servidor." }]);
    }
  }

  return (
    <>
      {/* Botón flotante (si está minimizado) */}
      {!open && (
        <button
          className="fixed bottom-4 right-4 z-40 rounded-full px-4 py-2 bg-black/40 backdrop-blur border border-white/20 text-white shadow-lg hover:bg-black/55 flex items-center gap-2"
          onClick={() => setOpen(true)}
        >
          {logoSrc ? <img src={logoSrc} alt="logo" className="h-5 w-5" /> : <span>🐜</span>}
          <span className="text-sm">Asistente</span>
        </button>
      )}

      {/* Ventanita glass */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[320px] sm:w-[360px] h-[440px] rounded-2xl
                        bg-black/30 backdrop-blur-md border border-white/20 shadow-2xl
                        text-white flex flex-col overflow-hidden">
          {/* Cabecera */}
          <div className="px-3 py-2 border-b border-white/15 bg-gradient-to-br from-sky-400/30 to-cyan-600/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logoSrc ? (
                <img src={logoSrc} alt="logo" className="h-5 w-5 rounded-full" />
              ) : (
                <span className="text-lg">🐜</span>
              )}
              <span className="text-sm font-semibold">{title}</span>
            </div>
            <button
              className="text-xs text-white/80 hover:text-white"
              onClick={() => setOpen(false)}
              title="Minimizar"
            >
              Cerrar
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {chat.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div
                  className={`inline-block max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-snug
                              ${m.role === "user" ? "bg-sky-500/30" : "bg-white/15"} 
                              border border-white/15`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {chips.map((c, idx) => (
                  <button
                    key={idx}
                    className="px-2 py-1 rounded-full border border-white/20 bg-white/10 text-xs
                               hover:bg-white/15"
                    onClick={() => send(c.text)}
                    title={c.text}
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            className="p-2 flex gap-2 border-t border-white/15 bg-black/25"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <input
              className="flex-1 rounded-lg px-2 py-2 text-sm bg-white/10 border border-white/20
                         placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
              placeholder='Ej. "Ir a Managua" o "Medidas de terremoto"'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="px-3 py-2 rounded-lg bg-sky-500/80 hover:bg-sky-500 text-white text-sm">
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}