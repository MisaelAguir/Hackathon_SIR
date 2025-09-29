import React from 'react'
import Button from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { MapPin, Bell, MessageSquare } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import '../styles/Home.css'

export default function Home() {
  return (
    <div className="home-wrap">
      <section aria-label="Introducción y vitrina" className="home-grid">

        {/* ⬅️ HERO como item independiente para poder span=2 en móvil */}
        <div className="home-hero">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Respuesta Inteligente de Alertas y Asistencia{' '}
            <span className="text-[var(--riaar-yellow)]">SIR</span>
          </h1>

          <p className="home-lead mt-3 text-white/80">
            Plataforma unificada para registrar incidencias, visualizar información y
            coordinar la respuesta con un asistente virtual integrado.
          </p>

          <div className="home-actions">
            <Link to="/login">
              <Button className="home-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--riaar-yellow)]">
                Entrar
              </Button>
            </Link>
            <Link to="/principal">
              <Button
                variant="outline"
                className="home-btn-outline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--riaar-yellow)]"
              >
                Ver demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Columna izquierda: solo features/cards */}
        <div className="home-left">
          <div className="home-features">
            <Card className="home-card">
              <CardHeader className="home-card-header">
                <MapPin className="home-card-icon" />
                <CardTitle className="home-card-title">Mapa interactivo</CardTitle>
              </CardHeader>
              <CardContent className="home-card-content">
                Catálogo Dep/Mun/Localidad.
              </CardContent>
            </Card>

            <Card className="home-card">
              <CardHeader className="home-card-header">
                <Bell className="home-card-icon" />
                <CardTitle className="home-card-title">Alertas en tiempo real</CardTitle>
              </CardHeader>
              <CardContent className="home-card-content">
                Gestión por severidad y tipo.
              </CardContent>
            </Card>

            <Card className="home-card">
              <CardHeader className="home-card-header">
                <MessageSquare className="home-card-icon" />
                <CardTitle className="home-card-title">Asistente IA</CardTitle>
              </CardHeader>
              <CardContent className="home-card-content">
                “Llévame a…” y consultas.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Columna derecha: hormiga */}
        <div className="home-figure">
          <div className="home-figure-stick">
            <img
              src="/assets/hormiga.png"
              alt="Hormiga SIR"
              className="home-ant"
              loading="lazy"
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 400px"
            />
          </div>
        </div>

      </section>
    </div>
  )
}