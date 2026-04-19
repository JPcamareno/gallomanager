// src/pages/Dashboard.jsx
import { useApp } from '../context/AppContext';
import { Bird, Dna, AlertTriangle, TrendingUp, Heart, Home, ShoppingBag, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RAZA_COLORS = {
  'Minifénix': '#4278ff', 'Azteca': '#6c5ce7', 'Kuai': '#00d2a0',
  'Nagasaki': '#f5c842', 'Vainilla': '#ff8c42', 'default': '#7ca4ff'
};

export default function Dashboard() {
  const { get, stats } = useApp();
  const navigate = useNavigate();
  const s = stats();
  const aves = get('aves');
  const alertas = get('alertas').filter(a => a.estado === 'Pendiente');
  const salud = get('salud');
  const reproducciones = get('reproducciones');
  const ventas = get('ventas');

  // Razas distribution
  const razaCount = aves.reduce((acc, a) => { acc[a.raza] = (acc[a.raza] || 0) + 1; return acc; }, {});
  const razaList = Object.entries(razaCount).sort((a, b) => b[1] - a[1]);

  // Recent activity (últimas acciones simuladas)
  const recentSalud = salud.slice(-3).reverse();

  const statCards = [
    { label: 'Total Aves', value: s.total, icon: '🐓', color: 'var(--accent)', bg: 'rgba(66,120,255,0.12)', change: '+3', up: true },
    { label: 'Gallos', value: s.machos, icon: '⚔️', color: 'var(--gold)', bg: 'rgba(245,200,66,0.1)', change: null },
    { label: 'Gallinas', value: s.hembras, icon: '🥚', color: '#ff8c9e', bg: 'rgba(255,92,122,0.1)', change: null },
    { label: 'Pollitos', value: s.pollitos, icon: '🐣', color: 'var(--green)', bg: 'rgba(0,210,160,0.1)', change: '+2', up: true },
    { label: 'En Tratamiento', value: s.tratamiento, icon: '💊', color: 'var(--red)', bg: 'rgba(255,92,122,0.1)', change: null },
    { label: 'Echadas', value: s.echadas, icon: '🥚', color: 'var(--orange)', bg: 'rgba(255,140,66,0.1)', change: null },
    { label: 'Razas', value: s.razas, icon: '🧬', color: 'var(--accent-2)', bg: 'rgba(108,92,231,0.12)', change: null },
    { label: 'Alertas', value: s.alertas, icon: '🔔', color: 'var(--red)', bg: 'rgba(255,92,122,0.1)', change: null },
  ];

  const prioridadColor = (p) => p === 'Alta' ? 'var(--red)' : p === 'Media' ? 'var(--orange)' : 'var(--accent)';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Haz que tu granja <span>funcione</span> 🐓</h1>
          <p className="page-sub">Gestión y control en tiempo real · {new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/aves')}>
          <Plus size={14} /> Nueva Ave
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {statCards.map((c, i) => (
          <div key={i} className="stat-card" style={{ '--accent-color': c.color }}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
            {c.change && <div className={`stat-change ${c.up ? 'up' : 'down'}`}>{c.change}</div>}
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Aves recientes */}
        <div className="panel">
          <div className="panel-header">
            <Bird size={15} color="var(--accent)" />
            <span className="panel-title">Aves Registradas</span>
            <span className="panel-action" onClick={() => navigate('/aves')}>Ver todas →</span>
          </div>
          <div className="panel-body">
            <table className="data-table">
              <thead><tr>
                <th>ID</th><th>Nombre</th><th>Raza</th><th>Estado</th><th>Ubicación</th>
              </tr></thead>
              <tbody>
                {aves.slice(0, 6).map(a => (
                  <tr key={a.id}>
                    <td><span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 11 }}>{a.codigo}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.nombre}</td>
                    <td><span className="badge badge-blue" style={{ '--accent': RAZA_COLORS[a.raza] || RAZA_COLORS.default, background: `${RAZA_COLORS[a.raza] || RAZA_COLORS.default}20`, color: RAZA_COLORS[a.raza] || RAZA_COLORS.default }}>{a.raza}</span></td>
                    <td><EstadoBadge estado={a.estado} /></td>
                    <td style={{ fontSize: 11 }}>{a.ubicacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nota del día */}
          <div className="note-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nota del día</span>
              <span style={{ fontSize: 11, background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>HOY</span>
            </div>
            <p className="note-text">🥚 Sakura lleva 10 días echada — revisar eclosión el <strong>11 Dic</strong><br />💊 Estrella día 7 de antibiótico — observar mejora<br />🔔 Vacunación lote B programada 10 Dic</p>
            <div className="note-meta">
              <span>Actualizado hace 20 min</span>
              <span style={{ color: 'var(--green)' }}>✓ Todo bajo control</span>
            </div>
          </div>

          {/* Distribución razas */}
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <span style={{ fontSize: 14 }}>🧬</span>
              <span className="panel-title">Distribución por Raza</span>
            </div>
            <div style={{ padding: '14px 20px' }}>
              {razaList.map(([raza, count]) => (
                <div key={raza} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 80, fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>{raza}</span>
                  <div style={{ flex: 1 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(count / s.total) * 100}%`, background: `linear-gradient(90deg, ${RAZA_COLORS[raza] || RAZA_COLORS.default}, ${RAZA_COLORS[raza] || RAZA_COLORS.default}99)` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Alertas */}
        <div className="panel">
          <div className="panel-header">
            <AlertTriangle size={15} color="var(--red)" />
            <span className="panel-title">Alertas Activas</span>
            <span style={{ fontSize: 11, background: 'rgba(255,92,122,0.15)', color: 'var(--red)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{alertas.length}</span>
          </div>
          <div>
            {alertas.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">✅</div><p>Sin alertas pendientes</p></div>
            ) : alertas.map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-dot" style={{ background: prioridadColor(a.prioridad) }} />
                <div className="activity-content">
                  <div className="activity-title">{a.descripcion}</div>
                  <div className="activity-time">📅 {a.fecha} · <span style={{ color: prioridadColor(a.prioridad), fontWeight: 600 }}>{a.prioridad}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reproducciones activas */}
        <div className="panel">
          <div className="panel-header">
            <Dna size={15} color="var(--green)" />
            <span className="panel-title">Reproducción Activa</span>
            <span className="panel-action" onClick={() => navigate('/reproduccion')}>Ver →</span>
          </div>
          <div>
            {reproducciones.map(r => {
              const padre = get('aves').find(a => a.id === r.padre_id);
              const madre = get('aves').find(a => a.id === r.madre_id);
              return (
                <div key={r.id} className="activity-item">
                  <div className="activity-dot" style={{ background: r.estado === 'Completado' ? 'var(--green)' : 'var(--accent)' }} />
                  <div className="activity-content">
                    <div className="activity-title">{padre?.nombre || '?'} × {madre?.nombre || '?'}</div>
                    <div className="activity-time">
                      🥚 {r.num_huevos} huevos ·{' '}
                      <span className={`badge ${r.estado === 'Completado' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 10, padding: '1px 6px' }}>{r.estado}</span>
                      {r.estado === 'En Incubación' && <span style={{ marginLeft: 6, color: 'var(--gold)' }}>📅 {r.fecha_eclosion_esperada}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actividad reciente salud */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <Heart size={15} color="var(--red)" />
          <span className="panel-title">Actividad de Salud Reciente</span>
          <span className="panel-action" onClick={() => navigate('/salud')}>Ver historial →</span>
        </div>
        <table className="data-table">
          <thead><tr><th>Ave</th><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Estado</th></tr></thead>
          <tbody>
            {salud.slice().reverse().slice(0, 4).map(s => {
              const ave = get('aves').find(a => a.id === s.ave_id);
              return (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ave?.nombre || '—'}</td>
                  <td>{s.fecha}</td>
                  <td><TipoBadge tipo={s.tipo} /></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.descripcion}</td>
                  <td><span className={`badge ${s.estado === 'Completado' ? 'badge-green' : s.estado === 'En curso' ? 'badge-orange' : 'badge-blue'}`}>{s.estado}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const map = { 'Activo': 'badge-green', 'Echada': 'badge-gold', 'Pollito': 'badge-blue', 'Tratamiento': 'badge-red', 'Vendido': 'badge-gray', 'Fallecido': 'badge-gray', 'Cuarentena': 'badge-orange' };
  return <span className={`badge ${map[estado] || 'badge-gray'}`}>{estado}</span>;
}

function TipoBadge({ tipo }) {
  const map = { 'Vacuna': 'badge-green', 'Enfermedad': 'badge-red', 'Chequeo': 'badge-blue', 'Tratamiento': 'badge-orange' };
  return <span className={`badge ${map[tipo] || 'badge-blue'}`}>{tipo}</span>;
}
