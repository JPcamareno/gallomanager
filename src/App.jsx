// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth } from './lib/db'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Aves from './pages/Aves'
import Jaulas from './pages/Jaulas'
import Reproduccion from './pages/Reproduccion'
import Salud from './pages/Salud'
import Medicamentos from './pages/Medicamentos'
import Ventas from './pages/Ventas'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-deep)', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 48 }}>🐓</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Cargando GalloManager…</div>
    </div>
  )

  if (!session) return <Login />

  return (
    <AppProvider userId={session.user.id}>
      <BrowserRouter>
        <Layout session={session}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/aves" element={<Aves />} />
            <Route path="/jaulas" element={<Jaulas />} />
            <Route path="/reproduccion" element={<Reproduccion />} />
            <Route path="/salud" element={<Salud />} />
            <Route path="/medicamentos" element={<Medicamentos />} />
            <Route path="/ventas" element={<Ventas />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
