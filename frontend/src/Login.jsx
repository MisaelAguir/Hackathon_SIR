import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!usuario || !contrasena) { setError('Ingresa usuario y contraseña.'); return }
    try {
      setLoading(true)
      const r = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario, password: contrasena }),
      })
      if (!r.ok) throw new Error(await r.text())
      const d = await r.json()
      localStorage.setItem('user', JSON.stringify(d.user))
      navigate('/', { replace: true })
    } catch {
      setError('Usuario o contraseña incorrectos.')
    } finally { setLoading(false) }
  }

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl p-6 glass text-zinc-100">
        <h1 className="text-2xl font-semibold text-center mb-1">Iniciar sesión</h1>
        <p className="text-sm text-white/70 text-center mb-6">Accede con tu usuario y contraseña</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Usuario</label>
            <input className="w-full h-11 rounded-xl bg-white/10 border border-white/20 text-white px-3"
                   value={usuario} onChange={e=>setUsuario(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input type="password" className="w-full h-11 rounded-xl bg-white/10 border border-white/20 text-white px-3"
                   value={contrasena} onChange={e=>setContrasena(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <div className="text-sm text-red-300">{error}</div>}
          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-white/20 hover:bg-white/25">
            {loading ? 'Ingresando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}