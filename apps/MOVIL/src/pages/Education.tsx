
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function Education(){
  const videos = [
    { id:1, title:'Cómo actuar ante sismos', src:'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id:2, title:'Prevención de incendios', src:'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ]
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Biblioteca educativa</CardTitle>
          <Button variant="outline">Subir video</Button>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {videos.map(v => (
            <div key={v.id} className="space-y-2">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <iframe className="w-full h-full" src={v.src} title={v.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
              <p className="font-medium">{v.title}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Artículos y recursos</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="font-semibold">Guía #{i}: Preparación ante desastres</p>
              <p className="text-sm text-white/70">Contenido breve y enlace de descarga/lectura.</p>
              <div className="pt-2"><Button size="sm">Leer</Button></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
