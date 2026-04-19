// src/pages/Jaulas.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Home, X } from 'lucide-react';
import { TIPOS_JAULA } from '../lib/store';

const empty = { codigo: '', tipo: 'Reproductora', capacidad: 2, descripcion: '', activa: true };

export default function Jaulas() {
  const { get, add, update } = useApp();
  const jaulas = get('jaulas');
  const aves = get('aves');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const avesEnJaula = (codigo) => aves.filter(a => a.ubicacion === codigo);

  const handleSave = () => {
    if (!form.codigo) return;
    if (modal === 'new') add('jaulas', { ...form, capacidad: Number(form.capacidad) });
    else update('jaulas', modal.id, { ...form, capacidad: Number(form.capacidad) });
    setModal(null);
  };

  const tipoColor = (t) => {
    const map = { 'Reproductora': 'badge-blue', 'Individual': 'badge-purple', 'Cría': 'badge-gold', 'Libre': 'badge-green', 'Maternidad': 'badge-orange', 'Cuarentena': 'badge-red' };
    return map[t] || 'badge-gray';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Control de <span>Jaulas</span></h1>
          <p className="page-sub">{jaulas.length} ubicaciones · {aves.length} aves distribuidas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal('new'); }}><Plus size={14} /> Nueva Jaula</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {jaulas.map(j => {
          const ocupantes = avesEnJaula(j.codigo);
          const pct = Math.round((ocupantes.length / j.capacidad) * 100);
          const llena = ocupantes.length >= j.capacidad;
          return (
            <div key={j.id} className="panel">
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{j.codigo}</div>
                    <span className={`badge ${tipoColor(j.tipo)}`} style={{ fontSize: 10 }}>{j.tipo}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: llena ? 'var(--red)' : 'var(--green)', fontFamily: 'var(--font-display)' }}>{ocupantes.length}/{j.capacidad}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>aves</div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div className="progress-bar" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, pct)}%`, background: llena ? 'linear-gradient(90deg,var(--red),var(--orange))' : undefined }} />
                  </div>
                </div>

                {ocupantes.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {ocupantes.map(a => (
                      <span key={a.id} className="tag" style={{ fontSize: 11 }}>
                        {a.sexo === 'Macho' ? '♂' : '♀'} {a.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin ocupantes</div>
                )}

                {j.descripcion && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>{j.descripcion}</div>}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...j }); setModal(j); }}>Editar jaula</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title"><Home size={16} color="var(--accent)" style={{ marginRight: 6 }} />{modal === 'new' ? 'Nueva Jaula' : 'Editar Jaula'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Código / Nombre *</label>
                <input className="form-input" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej: Jaula-A1, Libre-Norte" />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                  {TIPOS_JAULA.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacidad máxima</label>
                <input className="form-input" type="number" value={form.capacidad} onChange={e => setForm(f => ({ ...f, capacidad: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
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
