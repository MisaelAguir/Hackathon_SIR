
# RIAAR Native (frontend)

Frontend base en **React + TypeScript + Vite + Tailwind** con **Leaflet**, **Recharts** y un widget del asistente.

## Requisitos
- Node.js >= 18
- PNPM/NPM/Yarn a tu gusto

## Instalación
```bash
npm install
npm run dev
# o
pnpm i && pnpm dev
```

## Estructura
```
src/
  assets/              # imágenes de marca (hormiga, logo)
  components/
    layout/            # AppShell, Sidebar, AssistantWidget
    map/               # MapBasic, DraggableMarker
    ui/                # Button, Input, Textarea, Card, Badge (estilo Tailwind)
  pages/               # vistas: inicio, login, registro, etc.
  services/            # api.ts (mock) -> conecta aquí tu backend
  types/               # tipos TS (Alert, etc.)
  styles/              # Tailwind + variables de color
```

## Buenas prácticas aplicadas
- **Ruteo claro** con React Router (`/`, `/login`, `/registro`, `/inicio-institucion`, `/principal`, `/alertas`, `/registros`, `/estadisticas`, `/educativa`).
- **Separación por capas**: componentes UI atómicos, layout, mapa, páginas, servicios, tipos.
- **Variables de color** de marca y utilidades (`glass`, `brand-border`) centralizadas en `styles/globals.css`.
- **Componentes reutilizables** (Button, Card, etc.) para consistencia visual.
- **Mocks aislados** en `services/api.ts` para sustituir por tu API real.
- **Assets** en `src/assets/` (coloca tus imágenes allí).

## Integraciones pendientes
- Conectar selects de Dep/Mun/Loc a tu catálogo real.
- Guardar incidencias (`/registros`) vía tu API.
- Cablear el widget de asistente a tu backend/NLP.
- Implementar autenticación real (JWT u OIDC).
```



## Si ves 404 en http://localhost:5173
- Asegúrate de **estar en la carpeta del proyecto** y ejecutar:
  ```bash
  npm install
  npm run dev
  ```
- Abre la **URL exacta** que imprime Vite en la terminal.
- Si el puerto 5173 no funciona, prueba:
  ```bash
  npm run dev -- --port 5174 --host
  ```
- Verifica que `index.html` existe en la raíz del proyecto.
