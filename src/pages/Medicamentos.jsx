// src/pages/Medicamentos.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pill, X, AlertTriangle } from 'lucide-react';

const empty = { nombre: '', tipo: 'Antibiótico', stock_ml: '', unidad: 'ml', costo_unit: '', proveedor: '', fecha_vencimiento: '', alerta_stock: 10 };
const TIPOS = ['Antibiótico','Antiparasitario','Antifúngico','Suplemento','Vacuna','Antiinflamatorio','Desinfectante','Otro'];
const UNIDADES = ['ml','dosis','g','comprimidos','litros'];

export default function Medicamentos() {
  const { get, add, update, remove } = useApp();
  const meds = get('medicamentos');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const handleSave = () => {
    if (!form.nombre) return;
    const parsed = { ...form, stock_ml: Number(form.stock_ml), costo_unit: Number(form.costo_unit), alerta_stock: Number(form.alerta_stock) };
    if (modal === 'new') add('medicamentos', parsed);
    else update('medicamentos', modal.id, parsed);
    setModal(null);
  };

  const stockLow = meds.filter(m => m.stock_ml <= m.alerta_stock);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Inventario de <span>Medicamentos</span></h1>
          <p className="page-sub">{meds.length} productos · {stockLow.length} con stock bajo</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal('new'); }}><Plus size={14} /> Agregar</button>
      </div>

      {stockLow.length > 0 && (
        <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={16} color="var(--gold)" />
          <span style={{ fontSize: 13 }}>Stock bajo: {stockLow.map(m => <strong key={m.id} style={{ color: 'var(--gold)', marginRight: 8 }}>{m.nombre} ({m.stock_ml} {m.unidad})</strong>)}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {meds.map(m => {
          const pct = Math.min(100, (m.stock_ml / (m.alerta_stock * 3)) * 100);
          const low = m.stock_ml <= m.alerta_stock;
          return (
            <div key={m.id} className="panel" style={{ overflow: 'visible' }}>
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{m.nombre}</div>
                    <span className={`badge ${m.tipo === 'Antibiótico' ? 'badge-red' : m.tipo === 'Vacuna' ? 'badge-green' : m.tipo === 'Suplemento' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: 10 }}>{m.tipo}</span>
                  </div>
                  {low && <span style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--gold)', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>⚠️ BAJO</span>}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: low ? 'var(--gold)' : 'var(--green)' }}>{m.stock_ml} {m.unidad}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: low ? 'linear-gradient(90deg, var(--gold), var(--orange))' : undefined }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Alerta al llegar a {m.alerta_stock} {m.unidad}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div>💰 ₡{m.costo_unit?.toLocaleString()}/{m.unidad}</div>
                  <div>🏪 {m.proveedor}</div>
                  <div style={{ gridColumn: '1/-1' }}>📅 Vence: {m.fecha_vencimiento || 'N/A'}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setForm({ ...m }); setModal(m); }}>Editar</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => {
                  const qty = prompt('¿Cuánto agregar al stock?');
                  if (qty) update('medicamentos', m.id, { stock_ml: m.stock_ml + Number(qty) });
                }}>+ Stock</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title"><Pill size={16} color="var(--accent)" style={{ marginRight: 6 }} />{modal === 'new' ? 'Agregar Medicamento' : 'Editar Medicamento'}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Enrofloxacina 10%" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unidad</label>
                  <select className="form-select" value={form.unidad} onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                    {UNIDADES.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock actual</label>
                  <input className="form-input" type="number" value={form.stock_ml} onChange={e => setForm(f => ({ ...f, stock_ml: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Alerta de stock mínimo</label>
                  <input className="form-input" type="number" value={form.alerta_stock} onChange={e => setForm(f => ({ ...f, alerta_stock: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Costo unitario (₡)</label>
                  <input className="form-input" type="number" value={form.costo_unit} onChange={e => setForm(f => ({ ...f, costo_unit: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Proveedor</label>
                  <input className="form-input" value={form.proveedor} onChange={e => setForm(f => ({ ...f, proveedor: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Fecha de vencimiento</label>
                  <input className="form-input" type="date" value={form.fecha_vencimiento} onChange={e => setForm(f => ({ ...f, fecha_vencimiento: e.target.value }))} />
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
