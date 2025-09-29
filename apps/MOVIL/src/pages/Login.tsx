import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'

export default function Login() {
  const [tab, setTab] = useState<'usuario' | 'institucion' | 'invitado'>('usuario')
  const nav = useNavigate()
  const goInvitado = () => nav('/principal')

  return (
    <div className="login screen login-bg">
      <div className="login-center">
     <Card className="w-full max-w-[540px] glass-white border-white/20 text-white shadow-2xl rounded-2xl">
      <CardHeader className="pb-2">
    <CardTitle className="flex items-center justify-between gap-2">
      <span>Iniciar sesión</span>
      <img src="/assets/sir-logo.png" className="login-logo" alt="SIR" />
    </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            {/* Segmento de 3 pestañas */}
            <div className="grid grid-cols-3 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setTab('usuario')}
                className={`py-2 rounded-lg transition ${
                  tab === 'usuario' ? 'bg-[var(--riaar-orange)]' : 'hover:bg-white/5'
                }`}
              >
                Usuario
              </button>

              <button
                onClick={() => setTab('institucion')}
                className={`py-2 rounded-lg transition ${
                  tab === 'institucion' ? 'bg-[var(--riaar-orange)]' : 'hover:bg-white/5'
                }`}
              >
                Institución
              </button>

              <button
                onClick={() => setTab('invitado')}
                className={`py-2 rounded-lg transition ${
                  tab === 'invitado' ? 'bg-[var(--riaar-orange)]' : 'hover:bg-white/5'
                }`}
              >
                Invitado
              </button>
            </div>

            {/* USUARIO */}
            {tab === 'usuario' && (
              <div className="space-y-3">
                <label>Correo</label>
                <Input placeholder="nombre@correo.com" />

                <label>Contraseña</label>
                <Input type="password" />

                <div className="flex justify-between items-center pt-2">
                  <Button onClick={() => nav('/principal')}>Entrar</Button>
                  <Button variant="ghost" onClick={() => nav('/registro')}>
                    Crear cuenta
                  </Button>
                </div>
              </div>
            )}

            {/* INSTITUCIÓN */}
            {tab === 'institucion' && (
              <div className="space-y-3">
                <label>ID Institución</label>
                <Input placeholder="Código o dominio" />

                <label>Clave</label>
                <Input type="password" />

                <div className="pt-2">
                  <Button onClick={() => nav('/inicio-institucion')}>Entrar</Button>
                </div>
              </div>
            )}

            {/* INVITADO */}
            {tab === 'invitado' && (
              <div className="space-y-3">
                <p className="text-sm text-white/80">
                  Puedes explorar la plataforma sin iniciar sesión.
                </p>
                <div className="pt-2">
                  <Button onClick={goInvitado}>Entrar como invitado</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}