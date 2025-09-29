import React, { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Props = {
  floating?: boolean
  transparent?: boolean
  size?: 'md' | 'lg'
}

export default function AssistantWidget({
  floating = true,
  transparent = false,
  size = 'md',
}: Props){
  const [open, setOpen] = useState(false)

  /* >>> NUEVO: agrega/quita una clase en <body> para que el layout se ajuste */
  useEffect(() => {
    document.body.classList.toggle('assistant-open', open)
    // Por si quieres escuchar el evento desde otra parte, lo disparamos también:
    window.dispatchEvent(new CustomEvent('assistant:toggle', { detail: { open } }))
    return () => document.body.classList.remove('assistant-open')
  }, [open])
  /* <<< FIN NUEVO */

  const panelClasses = [
    transparent ? 'bg-transparent' : 'glass',
    transparent ? 'border-transparent' : 'border brand-border',
    'rounded-2xl p-3 text-sm'
  ].join(' ')

  const height = size === 'lg' ? 'h-[400px]' : 'h-[200px]'

  const Panel = (
    <div className={`${panelClasses} ${floating ? 'w-[320px]' : 'w-full'} assistant-panel`}>
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="relative flex items-center gap-2 group cursor-pointer"
          aria-label="Colapsar asistente"
          title="Click para colapsar"
        >
          <img
            src="/assets/hormiga.png"
            alt="Hormiga asistente"
            className="h-17 w-14 rounded-full shadow-sm transition-transform group-active:scale-95"
          />
          <span className="font-semibold group-hover:opacity-90">Hormiga asistente</span>
          <span
            className="
              pointer-events-none
              absolute -top-9 left-6
              px-2 py-1 rounded-md text-xs font-medium
              bg-[var(--riaar-orange)]/95 text-black
              opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
              transition-opacity shadow-[0_6px_18px_rgba(0,0,0,.35)]
            "
            role="tooltip"
            id="tt-colapsar"
          >
            {/* tooltip */}
            <span className="absolute left-4 top-full h-2 w-2 rotate-45 bg-[var(--riaar-orange)]/95" />
          </span>
        </button>
      </div>

      <div className={`${height} overflow-auto brand-scroll space-y-2 py-2`}>
        <div className="bg-white/10 rounded-xl p-2 w-fit max-w-[90%]">
          Te llevo a <b>Las Delicias, El Coral, Chontales</b>.
        </div>
        <div className="bg-white/5 rounded-xl p-2 w-fit max-w-[90%] ml-auto">Llévame a Diriamba</div>
        <div className="bg-white/10 rounded-xl p-2 w-fit max-w-[90%]">Artículos sobre terremotos en Nic...</div>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Escribe aquí..." />
        <Button>Enviar</Button>
      </div>
    </div>
  )

  if (!floating) return Panel

  return (
    // z-index MUY alto para quedar por encima del mapa y cualquier overlay
    <div className="fixed bottom-6 right-6 z-[2147483647]">
      {open && <div className="mb-4">{Panel}</div>}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir asistente"
          className="
            h-16 w-16 rounded-full
            bg-black/45 backdrop-blur-xl
            border-2 border-[var(--riaar-orange)]
            shadow-[0_0_22px_rgba(242,100,25,.45)]
            hover:scale-105 transition-transform
          "
        >
          <img
            src="/assets/hormiga.png"
            alt="Abrir asistente"
            className="h-14 w-10 mx-auto select-none drop-shadow-[0_3px_6px_rgba(0,0,0,.45)]"
          />
        </button>
      )}
    </div>
  )
}