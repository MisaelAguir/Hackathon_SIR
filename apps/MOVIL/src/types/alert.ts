
export type Alert = {
  id: number;
  titulo: string;
  dep: string; mun: string; loc: string;
  severidad: 'Amarillo'|'Naranja'|'Rojo';
  tipo: 'General'|'Hidromet.'|'Incendio'|'Sismo';
  lat: number; lon: number;
}
