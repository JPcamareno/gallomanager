// src/pages/Salud.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Heart, X } from 'lucide-react';

const empty = { ave_id: '', fecha: new Date().toISOString().slice(0,10), tipo: 'Vacuna', descripcion: '', tratamiento: '', veterinario: '', estado: 'En curso', proxima_revision: '' };

export default function Salud() {
  const { get, add, update } = useApp();
  const salud = get('salud');
  const aves = get('aves');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const handleSave = () => {
    if (!form.ave_id || !form.descripcion) return;
    if (modal === 'new') add('salud', form);
    else update('salud', modal.id, form);
    setModal(null);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Historial de <span>Salud</span></h1>
          <p className="page-sub">{salud.length} registros · {salud.filter(s => s.estado === 'En curso').length} tratamientos activos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal('new'); }}><Plus size={14} /> Nuevo Registro</button>
      </div>

      {/* Active treatments */}
      {salud.filter(s => s.estado === 'En curso').length > 0 && (
        <div style={{ background: 'rgba(255,92,122,0.08)', border: '1px solid rgba(255,92,122,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>⚕️ Tratamientos Activos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {salud.filter(s => s.estado === 'En curso').map(s => {
              const ave = aves.find(a => a.id === s.ave_id);
              return (
                <div key={s.id} style={{ background: 'rgba(255,92,122,0.1)', borderRadius: 10, padding: '8px 14px', fontSize: 12 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{ave?.nombre}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{s.descripcion}</span>
                  {s.proxima_revision && <span style={{ color: 'var(--gold)', marginLeft: 6 }}>Rev: {s.proxima_revision}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Ave</th><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Tratamiento</th><th>Estado</th><th>Próx. Rev.</th></tr></thead>
          <tbody>
            {salud.slice().reverse().map(s => {
              const ave = aves.find(a => a.id === s.ave_id);
              return (
                <tr key={s.id} className={s.estado === 'En curso' ? 'row-highlight' : ''}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ave?.nombre || '—'}</td>
                  <td>{s.fecha}</td>
                  <td><TipoBadge tipo={s.tipo} /></td>
                  <td>{s.descripcion}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.tratamiento}</td>
                  <td><span className={`badge ${s.estado === 'Completado' ? 'badge-green' : 'badge-orange'}`}>{s.estado}</span></td>
                  <td style={{ fontSize: 12, color: s.proxima_revision ? 'var(--gold)' : 'var(--text-muted)' }}>{s.proxima_revision || '—'}</td>
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
              <h3 className="modal-title">💊 Registro de Salud</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Ave *</label>
                  <select className="form-select" value={form.ave_id} onChange={e => setForm(f => ({ ...f, ave_id: e.target.value }))}>
                    <option value="">Seleccionar ave</option>
                    {aves.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    {['Vacuna','Enfermedad','Chequeo','Tratamiento','Lesión'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {['En curso','Completado','Pendiente'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Descripción *</label>
                  <input className="form-input" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Diagnóstico o descripción…" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Tratamiento</label>
                  <input className="form-input" value={form.tratamiento} onChange={e => setForm(f => ({ ...f, tratamiento: e.target.value }))} placeholder="Medicamento, dosis, frecuencia…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Veterinario</label>
                  <input className="form-input" value={form.veterinario} onChange={e => setForm(f => ({ ...f, veterinario: e.target.value }))} placeholder="Nombre del vet" />
                </div>
                <div className="form-group">
                  <label className="form-label">Próxima Revisión</label>
                  <input className="form-input" type="date" value={form.proxima_revision} onChange={e => setForm(f => ({ ...f, proxima_revision: e.target.value }))} />
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

function TipoBadge({ tipo }) {
  const map = { 'Vacuna': 'badge-green', 'Enfermedad': 'badge-red', 'Chequeo': 'badge-blue', 'Tratamiento': 'badge-orange', 'Lesión': 'badge-red' };
  return <span className={`badge ${map[tipo] || 'badge-blue'}`}>{tipo}</span>;
}
