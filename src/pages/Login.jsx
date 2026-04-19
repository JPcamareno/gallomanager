// src/pages/Login.jsx
import { useState } from 'react'
import { auth } from '../lib/db'

export default function Login() {
  const [email, setEmail] = useState('hi@monkeia.com')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // login | signup
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'error'|'success', text }

  const handle = async () => {
    if (!email || !password) { setMsg({ type: 'error', text: 'Ingresa correo y contraseña' }); return }
    setLoading(true)
    setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await auth.signIn(email, password)
        if (error) setMsg({ type: 'error', text: error.message })
      } else {
        const { error } = await auth.signUp(email, password)
        if (error) setMsg({ type: 'error', text: error.message })
        else setMsg({ type: 'success', text: '¡Cuenta creada! Revisa tu correo para confirmar.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-deep)', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(66,120,255,0.1) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(14,24,52,0.95)', border: '1px solid var(--border-bright)',
        borderRadius: 24, padding: '44px 40px', width: '100%', maxWidth: 400,
        backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1,
        boxShadow: '0 32px 80px rgba(6,11,26,0.8)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            boxShadow: '0 8px 32px var(--accent-glow)'
          }}>🐓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            GalloManager
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {mode === 'login' ? 'Ingresa a tu granja' : 'Crear nueva cuenta'}
          </p>
        </div>

        {/* Fields */}
        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13,
            background: msg.type === 'error' ? 'rgba(255,92,122,0.12)' : 'rgba(0,210,160,0.12)',
            color: msg.type === 'error' ? 'var(--red)' : 'var(--green)',
            border: `1px solid ${msg.type === 'error' ? 'rgba(255,92,122,0.25)' : 'rgba(0,210,160,0.25)'}`
          }}>
            {msg.type === 'error' ? '⚠️' : '✓'} {msg.text}
          </div>
        )}

        {/* CTA */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginBottom: 12 }}
          onClick={handle}
          disabled={loading}
        >
          {loading ? '⏳ Cargando…' : mode === 'login' ? '🔑 Entrar' : '✨ Crear cuenta'}
        </button>

        <button
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setMsg(null) }}
        >
          {mode === 'login' ? '¿Sin cuenta? Registrarse' : '¿Ya tienes cuenta? Entrar'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 20 }}>
          GalloManager · Granja de Gallos Miniatura y Gallinas Ornamentales
        </p>
      </div>
    </div>
  )
}
