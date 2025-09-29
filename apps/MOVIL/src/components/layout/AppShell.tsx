import React, { useEffect, useRef, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import AssistantWidget from './AssistantWidget'
import Button from '@/components/ui/Button'
import { Menu, Settings } from 'lucide-react'

export default function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement | null>(null)

  // cerrar el popover de la tuerca al tocar fuera
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!actionsRef.current) return
      if (!actionsRef.current.contains(e.target as Node)) setMobileActionsOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const desktopCols = collapsed
    ? 'lg:grid-cols-[100px,1fr]'
    : 'lg:grid-cols-[280px,1fr]'

  return (
    <div className="app-bg min-h-screen text-blue">
      {/* Header (altura controlada por --hdr) */}
      <header className="app-header sticky top-0 z-[60] border-b brand-border/30 bg-black/30 backdrop-blur">
        <div className="px-3 py-3 flex items-center gap-3">
          {/* menú lateral (móvil) */}
          <button onClick={() => setDrawerOpen(v => !v)} className="lg:hidden">
            <Menu />
          </button>

          <img src="/assets/sir-logo.png" alt="SIR" className="app-logo" />
          <span className="brand-title text-2xl lg:text-3xl">
            Sistema Integral de Riesgos
          </span>

          {/* Acciones DESKTOP */}
          <div className="ml-auto hidden lg:flex items-center gap-2">
            <Link to="/home"><Button variant="ghost">Inicio</Button></Link>
            <Link to="/login"><Button variant="ghost">Registro</Button></Link>
          </div>

          {/* Acciones MÓVIL: tuerca + popover */}
          <div className="ml-auto lg:hidden relative" ref={actionsRef}>
            <button
              onClick={() => setMobileActionsOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={mobileActionsOpen}
              className="tap-target rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-2 py-1.5"
              title="Acciones"
            >
              <Settings className="h-5 w-5" />
            </button>
            {mobileActionsOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-[70] glass-white border border-white/20 rounded-xl shadow-2xl w-44 overflow-hidden"
              >
                <Link
                  to="/home"
                  className="block px-3 py-2 hover:bg-white/10"
                  onClick={() => setMobileActionsOpen(false)}
                >
                  Inicio
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 hover:bg-white/10"
                  onClick={() => setMobileActionsOpen(false)}
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido (padding-top = --hdr) */}
      <div className="pt-header">
        <div className={`px-3 pb-4 grid grid-cols-1 ${desktopCols} gap-4 relative`}>
          {/* Drawer móvil */}
          {drawerOpen && (
            <div className="lg:hidden fixed inset-0 z-[80]" aria-modal="true" role="dialog">
              <button
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
              />
              <aside className="relative h-full w-72 max-w-[85vw] bg-[#0b1320]/95 border-r border-white/10 p-2 shadow-2xl">
                <Sidebar collapsed={false} onToggle={() => {}} />
              </aside>
            </div>
          )}

          {/* Sidebar desktop */}
          <aside className="hidden lg:block relative z-[50]">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
          </aside>

          {/* Main */}
          <main className="relative z-[10] min-h-[calc(100vh-var(--hdr))]">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Asistente */}
      <div className="relative z-[90]">
        <AssistantWidget />
      </div>
    </div>
  )
}