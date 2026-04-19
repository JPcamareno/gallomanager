// src/components/Layout.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Bird, Home, Heart, Pill, ShoppingBag,
  Bell, Settings, ChevronRight, Search, Menu, X, Dna, LogOut
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { auth } from '../lib/db'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Aves', icon: Bird, path: '/aves' },
  { label: 'Jaulas', icon: Home, path: '/jaulas' },
  { label: 'Reproducción', icon: Dna, path: '/reproduccion' },
  { label: 'Salud', icon: Heart, path: '/salud' },
  { label: 'Medicamentos', icon: Pill, path: '/medicamentos' },
  { label: 'Ventas', icon: ShoppingBag, path: '/ventas' },
]

export default function Layout({ children, session }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { stats, loading } = useApp()
  const s = stats()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const badgeFor = (path) => {
    if (path === '/salud') return s.tratamiento > 0 ? s.tratamiento : null
    if (path === '/') return s.alertas > 0 ? s.alertas : null
    if (path === '/reproduccion') return s.reproducciones_activas > 0 ? s.reproducciones_activas : null
    return null
  }

  const pageName = navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'
  const userEmail = session?.user?.email || 'hi@monkeia.com'
  const userInitial = userEmail[0].toUpperCase()

  const handleLogout = async () => {
    await auth.signOut()
  }

  return (
    <div className="app-layout">
      <aside className="sidebar" style={{
        width: sidebarOpen ? 'var(--sidebar-w)' : '64px',
        minWidth: sidebarOpen ? 'var(--sidebar-w)' : '64px',
        transition: 'width 0.25s ease, min-width 0.25s ease'
      }}>
        <div className="sidebar-logo">
          <div className="logo-icon">🐓</div>
          {sidebarOpen && (
            <div className="logo-text">
              GalloManager
              <div className="logo-sub">Granja Pro</div>
            </div>
          )}
          <div style={{ marginLeft: 'auto', cursor: 'pointer', color: 'var(--text-muted)' }}
            onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </div>
        </div>

        <nav className="nav-section">
          {sidebarOpen && <div className="nav-label">Principal</div>}
          {navItems.map(({ label, icon: Icon, path }) => {
            const badge = badgeFor(path)
            return (
              <div
                key={path}
                className={`nav-item ${location.pathname === path ? 'active' : ''}`}
                onClick={() => navigate(path)}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon size={16} className="nav-icon" />
                {sidebarOpen && <span>{label}</span>}
                {sidebarOpen && badge && (
                  <span className={`nav-badge ${path === '/salud' ? 'red' : ''}`}>{badge}</span>
                )}
              </div>
            )
          })}

          {sidebarOpen && <div className="nav-label">Sistema</div>}
          <div className="nav-item" title={!sidebarOpen ? 'Alertas' : undefined}>
            <Bell size={16} className="nav-icon" />
            {sidebarOpen && <span>Alertas</span>}
            {sidebarOpen && s.alertas > 0 && <span className="nav-badge red">{s.alertas}</span>}
          </div>
          <div className="nav-item" title={!sidebarOpen ? 'Configuración' : undefined}>
            <Settings size={16} className="nav-icon" />
            {sidebarOpen && <span>Configuración</span>}
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">{userInitial}</div>
            {sidebarOpen && (
              <div className="user-info">
                <div className="user-name">Monkeia Admin</div>
                <div className="user-email">{userEmail}</div>
              </div>
            )}
            {sidebarOpen && (
              <div
                style={{ cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                title="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogOut size={14} />
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span style={{ color: 'var(--text-muted)' }}>Inicio</span>
            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
            <span>{pageName}</span>
          </div>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                animation: 'pulse 1s infinite'
              }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sincronizando…</span>
            </div>
          )}
          <div className="topbar-right">
            <div className="icon-btn"><Search size={15} /></div>
            <div className="icon-btn" style={{ position: 'relative' }}>
              <Bell size={15} />
              {s.alertas > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, background: 'var(--red)',
                  borderRadius: '50%', border: '1.5px solid var(--bg-deep)'
                }} />
              )}
            </div>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{userInitial}</div>
          </div>
        </header>

        <main className="content animate-in">
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
