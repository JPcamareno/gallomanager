// src/pages/Reproduccion.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Dna } from 'lucide-react';

const empty = { padre_id: '', madre_id: '', fecha_inicio: new Date().toISOString().slice(0,10), fecha_eclosion_esperada: '', num_huevos: '', num_eclosionados: '', estado: 'En Incubación', notas: '' };

export default function Reproduccion() {
  const { get, add, update } = useApp();
  const repros = get('reproducciones');
  const aves = get('aves');
  const machos = aves.filter(a => a.sexo === 'Macho');
  const hembras = aves.filter(a => a.sexo === 'Hembra');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const calcEclosion = (inicio) => {
    if (!inicio) return '';
    const d = new Date(inicio);
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  };

  const handleSave = () => {
    if (!form.padre_id || !form.madre_id) return;
    const data = { ...form, num_huevos: Number(form.num_huevos) || 0, num_eclosionados: form.num_eclosionados ? Number(form.num_eclosionados) : null };
    if (modal === 'new') add('reproducciones', data);
    else update('reproducciones', modal.id, data);
    setModal(null);
  };

  const activos = repros.filter(r => r.estado === 'En Incubación');
  const completados = repros.filter(r => r.estado === 'Completado');
  const totalHuevos = repros.reduce((s, r) => s + (r.num_huevos || 0), 0);
  const totalNacidos = repros.reduce((s, r) => s + (r.num_eclosionados || 0), 0);
  const fertilidad = totalHuevos > 0 ? Math.round((totalNacidos / totalHuevos) * 100) : 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Control de <span>Reproducción</span></h1>
          <p className="page-sub">{activos.length} en incubación · Fertilidad global {fertilidad}%</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal('new'); }}><Plus size={14} /> Nueva Pareja</button>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'En Incubación', value: activos.length, icon: '🥚', color: 'var(--accent)' },
          { label: 'Total Huevos', value: totalHuevos, icon: '🫧', color: 'var(--gold)' },
          { label: 'Nacidos', value: totalNacidos, icon: '🐣', color: 'var(--green)' },
          { label: '% Fertilidad', value: `${fertilidad}%`, icon: '🧬', color: 'var(--accent-2)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color, fontSize: 20 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active incubations */}
      {activos.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>🥚 En Incubación</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 28 }}>
            {activos.map(r => <ReproCard key={r.id} r={r} aves={aves} onEdit={() => { setForm({ ...r, num_huevos: String(r.num_huevos), num_eclosionados: String(r.num_eclosionados || '') }); setModal(r); }} onComplete={() => update('reproducciones', r.id, { estado: 'Completado' })} />)}
          </div>
        </>
      )}

      {/* History */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--text-secondary)' }}>📋 Historial</h2>
      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Padre</th><th>Madre</th><th>Inicio</th><th>Eclosión</th><th>Huevos</th><th>Nacidos</th><th>%</th><th>Estado</th></tr></thead>
          <tbody>
            {repros.slice().reverse().map(r => {
              const padre = aves.find(a => a.id === r.padre_id);
              const madre = aves.find(a => a.id === r.madre_id);
              const pct = r.num_huevos > 0 && r.num_eclosionados ? Math.round((r.num_eclosionados / r.num_huevos) * 100) : null;
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{padre?.nombre || '—'} <span style={{ fontSize: 10, color: 'var(--accent)' }}>♂</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{madre?.nombre || '—'} <span style={{ fontSize: 10, color: '#ff8c9e' }}>♀</span></td>
                  <td>{r.fecha_inicio}</td>
                  <td style={{ color: 'var(--gold)' }}>{r.fecha_eclosion_esperada}</td>
                  <td style={{ textAlign: 'center' }}>{r.num_huevos}</td>
                  <td style={{ textAlign: 'center', color: 'var(--green)' }}>{r.num_eclosionados ?? '—'}</td>
                  <td>{pct !== null ? <span style={{ color: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--gold)' : 'var(--red)', fontWeight: 700 }}>{pct}%</span> : '—'}</td>
                  <td><span className={`badge ${r.estado === 'Completado' ? 'badge-green' : 'badge-blue'}`}>{r.estado}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title"><Dna size={16} color="var(--green)" style={{ marginRight: 6 }} />{modal === 'new' ? 'Registrar Pareja' : 'Editar Reproducción'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Padre (Macho) *</label>
                  <select className="form-select" value={form.padre_id} onChange={e => setForm(f => ({ ...f, padre_id: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    {machos.map(a => <option key={a.id} value={a.id}>{a.nombre} — {a.raza}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Madre (Hembra) *</label>
                  <select className="form-select" value={form.madre_id} onChange={e => setForm(f => ({ ...f, madre_id: e.target.value }))}>
                    <option value="">Seleccionar</option>
                    {hembras.map(a => <option key={a.id} value={a.id}>{a.nombre} — {a.raza}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de inicio</label>
                  <input className="form-input" type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value, fecha_eclosion_esperada: calcEclosion(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Eclosión esperada (21 días)</label>
                  <input className="form-input" type="date" value={form.fecha_eclosion_esperada} onChange={e => setForm(f => ({ ...f, fecha_eclosion_esperada: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">N° Huevos</label>
                  <input className="form-input" type="number" value={form.num_huevos} onChange={e => setForm(f => ({ ...f, num_huevos: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">N° Eclosionados</label>
                  <input className="form-input" type="number" value={form.num_eclosionados} onChange={e => setForm(f => ({ ...f, num_eclosionados: e.target.value }))} placeholder="Dejar vacío si en curso" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {['En Incubación','Completado','Cancelado'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Notas</label>
                  <input className="form-input" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>✓ Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReproCard({ r, aves, onEdit, onComplete }) {
  const padre = aves.find(a => a.id === r.padre_id);
  const madre = aves.find(a => a.id === r.madre_id);
  const today = new Date();
  const start = new Date(r.fecha_inicio);
  const end = new Date(r.fecha_eclosion_esperada);
  const daysTotal = Math.ceil((end - start) / 86400000);
  const daysPassed = Math.ceil((today - start) / 86400000);
  const pct = Math.min(100, Math.max(0, (daysPassed / daysTotal) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - today) / 86400000));

  return (
    <div className="panel" style={{ overflow: 'visible' }}>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {padre?.nombre} <span style={{ color: 'var(--accent)' }}>♂</span> × {madre?.nombre} <span style={{ color: '#ff8c9e' }}>♀</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{padre?.raza} × {madre?.raza}</div>
          </div>
          <span style={{ fontSize: 22 }}>🥚</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Día {daysPassed} de {daysTotal}</span>
            <span style={{ fontSize: 12, color: daysLeft <= 3 ? 'var(--gold)' : 'var(--text-muted)' }}>
              {daysLeft <= 3 ? `⚡ ¡${daysLeft} días!` : `${daysLeft} días restantes`}
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 80 ? 'linear-gradient(90deg, var(--gold), var(--orange))' : undefined }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <div>🥚 <strong>{r.num_huevos}</strong> huevos</div>
          <div>📅 Eclosión: <strong style={{ color: 'var(--gold)' }}>{r.fecha_eclosion_esperada}</strong></div>
        </div>
        {r.notas && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{r.notas}</div>}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>Editar</button>
        <button className="btn btn-sm" style={{ background: 'rgba(0,210,160,0.15)', color: 'var(--green)', border: '1px solid rgba(0,210,160,0.3)' }} onClick={onComplete}>✓ Completar</button>
      </div>
    </div>
  );
}
