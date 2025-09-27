
// Aquí puedes centralizar llamadas a tu API (fetch/axios).
// Por ahora, mockeamos datos locales para desarrollo.
import { Alert } from '@/types/alert'

export const mockAlertas: Alert[] = [
  { id:1, titulo:'Deslizamiento menor', dep:'Carazo', mun:'El Rosario', loc:'La Calera (ER)', severidad:'Amarillo', tipo:'General', lat:12.865, lon:-85.297 },
  { id:2, titulo:'Crecida de río', dep:'León', mun:'Nagarote', loc:'El Papalonal', severidad:'Naranja', tipo:'Hidromet.', lat:12.268, lon:-86.567 },
  { id:3, titulo:'Incendio de pastizal', dep:'Chontales', mun:'El Coral', loc:'Las Delicias', severidad:'Rojo', tipo:'Incendio', lat:12.040, lon:-85.381 },
]

export async function getAlertas(): Promise<Alert[]>{
  // reemplaza por fetch('/api/alertas')...
  return Promise.resolve(mockAlertas)
}
