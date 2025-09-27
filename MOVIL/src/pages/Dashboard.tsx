
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import MapBasic from '@/components/map/MapBasic'

export default function Dashboard(){
  const cards = [
    { title:'Incidencias hoy', value: 12 },
    { title:'Pendientes', value: 7 },
    { title:'Instituciones activas', value: 18 },
    { title:'Tiempo medio respuesta', value: '22m' },
  ]
  const trend = [
    { d:'Lun', v:4 },{ d:'Mar', v:8 },{ d:'Mié', v:6 },{ d:'Jue', v:12 },{ d:'Vie', v:10 },{ d:'Sáb', v:5 },{ d:'Dom', v:3 },
  ]
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c,i)=>(
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-white/70">{c.title}</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{c.value}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Tendencia semanal</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.12)" />
                <XAxis dataKey="d" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{ background:'#0D2B45', border:'1px solid rgba(255,255,255,.2)', color:'white' }} />
                <Line type="monotone" dataKey="v" stroke="#F6C445" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Mapa rápido</CardTitle></CardHeader>
          <CardContent><MapBasic /></CardContent>
        </Card>
      </div>
    </div>
  )
}
