import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './styles/globals.css'
import 'leaflet/dist/leaflet.css'

import AppShell from '@/components/layout/AppShell'

// Páginas
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import RegisterUser from '@/pages/RegisterUser'
import InstitutionStart from '@/pages/InstitutionStart'
import Dashboard from '@/pages/Dashboard'
import AlertsList from '@/pages/AlertsList'
import AlertsRegister from '@/pages/AlertsRegister'
import Stats from '@/pages/Stats'
import Education from '@/pages/Education'

// Pantalla previa
import WelcomeScreen from '@/pages/WelcomeScreen'

const router = createBrowserRouter([
  // 1) Landing (sin AppShell)
  { path: '/', element: <WelcomeScreen /> },

  // 2) Login independiente (sin AppShell)
  { path: '/login', element: <Login /> },
   { path: 'registro', element: <RegisterUser /> },

  // 3) Alias para /home -> Home dentro de AppShell
  
  // 4) Resto del área con AppShell (mismas rutas que ya tenías)
  {
    path: '/',
    element: <AppShell />,
    children: [

   { path: '/home', element: <Home /> },
     
      { path: 'inicio-institucion', element: <InstitutionStart /> },
      { path: 'principal', element: <Home /> },
      { path: 'alertas', element: <AlertsList /> },
      { path: 'registros', element: <AlertsRegister /> },
      { path: 'estadisticas', element: <Stats /> },
      { path: 'educativa', element: <Education /> },
    ],
  },

  // 5) Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)