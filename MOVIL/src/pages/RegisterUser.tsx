// src/pages/RegisterUser.tsx
import React from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { useNavigate } from 'react-router-dom'
import '../styles/Register.css'          // ⬅️ importa tu CSS nuevo

export default function RegisterUser(){
  const nav = useNavigate()
  return (
    <div className="register screen register-bg">
      <div className="register-center">
        <Card className="register-card text-white">
          <CardContent className="p-5 sm:p-6">
            <h2 className="register-title mb-4">Registro de usuario</h2>

            <div className="register-form">
              <div className="space-y-2">
                <label className="register-label">Nombres</label>
                <Input placeholder="Juan" />
              </div>

              <div className="space-y-2">
                <label className="register-label">Apellidos</label>
                <Input placeholder="Pérez" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="register-label">Correo</label>
                <Input placeholder="nombre@correo.com" />
              </div>

              <div className="space-y-2">
                <label className="register-label">Contraseña</label>
                <Input type="password" />
              </div>

              <div className="space-y-2">
                <label className="register-label">Confirmar contraseña</label>
                <Input type="password" />
              </div>

              <div className="register-actions">
                <Button variant="ghost" onClick={()=>nav('/login')}>Volver</Button>
                <Button onClick={()=>nav('/principal')}>Crear cuenta</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
