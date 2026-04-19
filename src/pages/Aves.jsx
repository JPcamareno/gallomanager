// src/pages/Aves.jsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Filter, X, Bird, Edit2, Trash2, QrCode } from 'lucide-react';
import { RAZAS, ESTADOS_AVE } from '../lib/store';

const SEXO_COLORS = { 'Macho': 'badge-blue', 'Hembra': 'badge-red' };
const ESTADO_COLORS = { 'Activo': 'badge-green', 'Echada': 'badge-gold', 'Pollito': 'badge-purple', 'Tratamiento': 'badge-red', 'Vendido': 'badge-gray', 'Fallecido': 'badge-gray', 'Cuarentena': 'badge-orange' };

const emptyAve = { codigo: '', nombre: '', raza: '', sexo: 'Macho', color: '', fecha_nacimiento: '', estado: 'Activo', ubicacion: '', padre_id: '', madre_id: '', notas: '', peso_g: '' };

export default function Aves() {
  const { get, add, update, remove } = useApp();
  const aves = get('aves');
  const [search, setSearch] = useState('');
  const [filterRaza, setFilterRaza] = useState('');
  const [filterSexo, setFilterSexo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | {editing: ave}
  const [form, setForm] = useState(emptyAve);
  const [delConfirm, setDelConfirm] = useState(null);

  const filtered = aves.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q) || a.raza.toLowerCase().includes(q);
    const matchRaza = !filterRaza || a.raza === filterRaza;
    const matchSexo = !filterSexo || a.sexo === filterSexo;
    const matchEstado = !filterEstado || a.estado === filterEstado;
    return matchQ && matchRaza && matchSexo && matchEstado;
  });

  const openNew = () => { setForm({ ...emptyAve, codigo: `GM-${String(aves.length + 1).padStart(3, '0')}` }); setModal('new'); };
  const openEdit = (a) => { setForm({ ...a }); setModal({ editing: a }); };

  const handleSave = () => {
    if (!form.nombre || !form.raza) return;
    if (modal === 'new') add('aves', form);
    else update('aves', modal.editing.id, form);
    setModal(null);
  };

  const handleDelete = (id) => { remove('aves', id); setDelConfirm(null); };

  const razasUsadas = [...new Set(aves.map(a => a.raza))];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Inventario de <span>Aves</span></h1>
          <p className="page-sub">{aves.length} aves registradas · {filtered.length} mostradas</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={14} /> Registrar Ave</button>
      </div>

      {/* Search & Filters */}
      <div className="filters-row">
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Buscar por nombre, código, raza…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filterRaza} onChange={e => setFilterRaza(e.target.value)}>
          <option value="">Todas las razas</option>
          {razasUsadas.map(r => <option key={r}>{r}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterSexo} onChange={e => setFilterSexo(e.target.value)}>
          <option value="">Todos</option>
          <option>Macho</option>
          <option>Hembra</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_AVE.map(e => <option key={e}>{e}</option>)}
        </select>
        {(search || filterRaza || filterSexo || filterEstado) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRaza(''); setFilterSexo(''); setFilterEstado(''); }}><X size={12} /> Limpiar</button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['Macho', 'Hembra', 'Activo', 'Echada', 'Pollito', 'Tratamiento'].map(v => {
          const count = aves.filter(a => a.sexo === v || a.estado === v).length;
          if (!count) return null;
          return (
            <div key={v} className="filter-chip" onClick={() => {
              if (v === 'Macho' || v === 'Hembra') setFilterSexo(filterSexo === v ? '' : v);
              else setFilterEstado(filterEstado === v ? '' : v);
            }}>
              {v === 'Macho' ? '♂' : v === 'Hembra' ? '♀' : '•'} {v} <strong style={{ color: 'var(--text-primary)' }}>{count}</strong>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="panel">
        <table className="data-table">
          <thead><tr>
            <th>Código</th><th>Nombre</th><th>Raza</th><th>Sexo</th><th>Estado</th>
            <th>Fecha Nac.</th><th>Ubicación</th><th>Peso</th><th style={{ textAlign: 'right' }}>Acciones</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}><div className="empty-state"><div className="empty-state-icon"><Bird size={36} /></div><p>No hay aves que coincidan</p></div></td></tr>
            ) : filtered.map(a => (
              <tr key={a.id}>
                <td><code style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 11 }}>{a.codigo}</code></td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.nombre}</td>
                <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{a.raza}</span></td>
                <td><span className={`badge ${SEXO_COLORS[a.sexo]}`} style={{ fontSize: 11 }}>{a.sexo === 'Macho' ? '♂' : '♀'} {a.sexo}</span></td>
                <td><span className={`badge ${ESTADO_COLORS[a.estado] || 'badge-gray'}`} style={{ fontSize: 11 }}>{a.estado}</span></td>
                <td style={{ fontSize: 12 }}>{a.fecha_nacimiento || '—'}</td>
                <td style={{ fontSize: 12 }}>{a.ubicacion}</td>
                <td style={{ fontSize: 12 }}>{a.peso_g ? `${a.peso_g}g` : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Editar" onClick={() => openEdit(a)}><Edit2 size={13} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Eliminar" onClick={() => setDelConfirm(a)} style={{ color: 'var(--red)' }}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'new' ? '🐓 Registrar Nueva Ave' : `✏️ Editar ${modal.editing.nombre}`}</h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Código *</label>
                  <input className="form-input" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="GM-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del ave" />
                </div>
                <div className="form-group">
                  <label className="form-label">Raza *</label>
                  <select className="form-select" value={form.raza} onChange={e => setForm(f => ({ ...f, raza: e.target.value }))}>
                    <option value="">Seleccionar raza</option>
                    {RAZAS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select className="form-select" value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
                    <option>Macho</option>
                    <option>Hembra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color / Fenotipo</label>
                  <input className="form-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="Rojo Dorado, Plateado…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <input className="form-input" type="date" value={form.fecha_nacimiento} onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                    {ESTADOS_AVE.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ubicación / Jaula</label>
                  <input className="form-input" value={form.ubicacion} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} placeholder="Jaula-A1, Libre-Norte…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Padre (ID)</label>
                  <select className="form-select" value={form.padre_id} onChange={e => setForm(f => ({ ...f, padre_id: e.target.value }))}>
                    <option value="">Desconocido</option>
                    {aves.filter(a => a.sexo === 'Macho').map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Madre (ID)</label>
                  <select className="form-select" value={form.madre_id} onChange={e => setForm(f => ({ ...f, madre_id: e.target.value }))}>
                    <option value="">Desconocida</option>
                    {aves.filter(a => a.sexo === 'Hembra').map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Peso (gramos)</label>
                  <input className="form-input" type="number" value={form.peso_g} onChange={e => setForm(f => ({ ...f, peso_g: e.target.value }))} placeholder="650" />
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notas</label>
                <input className="form-input" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Observaciones, historial, premios…" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal === 'new' ? '✓ Registrar Ave' : '✓ Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDelConfirm(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Eliminar Ave</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>¿Eliminar a <strong style={{ color: 'var(--text-primary)' }}>{delConfirm.nombre}</strong> ({delConfirm.codigo})? Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDelConfirm(null)}>Cancelar</button>
              <button className="btn" style={{ background: 'var(--red)', color: 'white' }} onClick={() => handleDelete(delConfirm.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
