// src/pages/Ventas.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ShoppingBag, X, TrendingUp } from 'lucide-react';

const empty = { fecha: new Date().toISOString().slice(0,10), ave_id: '', tipo: 'Ave', precio: '', cliente: '', cantidad: 1, notas: '' };

export default function Ventas() {
  const { get, add } = useApp();
  const ventas = get('ventas');
  const aves = get('aves');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const handleSave = () => {
    if (!form.tipo || !form.precio) return;
    add('ventas', { ...form, precio: Number(form.precio), cantidad: Number(form.cantidad) });
    setModal(null);
  };

  const totalMes = ventas.reduce((s, v) => s + v.precio, 0);
  const totalVentas = ventas.length;
  const ventasPorTipo = ventas.reduce((acc, v) => { acc[v.tipo] = (acc[v.tipo] || 0) + 1; return acc; }, {});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Registro de <span>Ventas</span></h1>
          <p className="page-sub">{totalVentas} transacciones · ₡{totalMes.toLocaleString()} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setModal('new'); }}><Plus size={14} /> Nueva Venta</button>
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 28 }}>
        <div className="stat-card" style={{ '--accent-color': 'var(--green)' }}>
          <div className="stat-icon" style={{ background: 'rgba(0,210,160,0.1)', color: 'var(--green)', fontSize: 20 }}>💰</div>
          <div className="stat-value" style={{ color: 'var(--green)', fontSize: 22 }}>₡{totalMes.toLocaleString()}</div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--accent)' }}>
          <div className="stat-icon" style={{ background: 'rgba(66,120,255,0.1)', color: 'var(--accent)', fontSize: 20 }}>📦</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalVentas}</div>
          <div className="stat-label">Transacciones</div>
        </div>
        {Object.entries(ventasPorTipo).slice(0, 2).map(([tipo, count]) => (
          <div key={tipo} className="stat-card" style={{ '--accent-color': 'var(--gold)' }}>
            <div className="stat-icon" style={{ background: 'rgba(245,200,66,0.1)', color: 'var(--gold)', fontSize: 20 }}>🐓</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{count}</div>
            <div className="stat-label">{tipo}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Ave / Producto</th><th>Cliente</th><th>Cantidad</th><th>Precio</th><th>Notas</th></tr></thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">🛒</div><p>No hay ventas registradas aún</p></div></td></tr>
            ) : ventas.slice().reverse().map(v => {
              const ave = aves.find(a => a.id === v.ave_id);
              return (
                <tr key={v.id}>
                  <td>{v.fecha}</td>
                  <td><span className={`badge ${v.tipo === 'Ave' ? 'badge-blue' : v.tipo === 'Huevos fértiles' ? 'badge-gold' : 'badge-purple'}`} style={{ fontSize: 10 }}>{v.tipo}</span></td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{ave?.nombre || v.tipo}</td>
                  <td>{v.cliente}</td>
                  <td style={{ textAlign: 'center' }}>{v.cantidad || 1}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>₡{v.precio.toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v.notas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3 className="modal-title"><ShoppingBag size={16} color="var(--green)" style={{ marginRight: 6 }} />Registrar Venta</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de venta</label>
                  <select className="form-select" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    {['Ave','Huevos fértiles','Pollitos','Servicio de monta','Otro'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {form.tipo === 'Ave' && (
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Ave vendida</label>
                    <select className="form-select" value={form.ave_id} onChange={e => setForm(f => ({ ...f, ave_id: e.target.value }))}>
                      <option value="">Seleccionar ave</option>
                      {aves.filter(a => a.estado === 'Activo').map(a => <option key={a.id} value={a.id}>{a.nombre} — {a.raza} ({a.sexo})</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <input className="form-input" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} placeholder="Nombre del cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio (₡)</label>
                  <input className="form-input" type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} placeholder="85000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad</label>
                  <input className="form-input" type="number" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Notas</label>
                  <input className="form-input" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Detalles adicionales…" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>✓ Registrar Venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
