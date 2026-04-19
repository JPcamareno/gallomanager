// src/lib/store.js — Local state management (migra a Supabase después)
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'gallomanager_data';

const seedData = {
  aves: [
    { id: 'av1', codigo: 'GM-001', nombre: 'Fuego', raza: 'Minifénix', sexo: 'Macho', color: 'Rojo Dorado', fecha_nacimiento: '2023-03-15', estado: 'Activo', ubicacion: 'Jaula-A1', padre_id: null, madre_id: null, foto: null, notas: 'Ejemplar de exhibición', peso_g: 650 },
    { id: 'av2', codigo: 'GM-002', nombre: 'Luna', raza: 'Minifénix', sexo: 'Hembra', color: 'Plateado', fecha_nacimiento: '2023-04-10', estado: 'Activo', ubicacion: 'Jaula-A1', padre_id: null, madre_id: null, foto: null, notas: 'Buena ponedora', peso_g: 480 },
    { id: 'av3', codigo: 'GM-003', nombre: 'Azteca I', raza: 'Azteca', sexo: 'Macho', color: 'Negro Plateado', fecha_nacimiento: '2022-11-20', estado: 'Activo', ubicacion: 'Jaula-B2', padre_id: null, madre_id: null, foto: null, notas: 'Campeón regional 2024', peso_g: 720 },
    { id: 'av4', codigo: 'GM-004', nombre: 'Sakura', raza: 'Nagasaki', sexo: 'Hembra', color: 'Blanco Perlado', fecha_nacimiento: '2023-07-01', estado: 'Echada', ubicacion: 'Jaula-C1', padre_id: null, madre_id: null, foto: null, notas: 'Incubando — 8 huevos', peso_g: 520 },
    { id: 'av5', codigo: 'GM-005', nombre: 'Kuai Rey', raza: 'Kuai', sexo: 'Macho', color: 'Dorado Moteado', fecha_nacimiento: '2022-08-15', estado: 'Activo', ubicacion: 'Libre-Norte', padre_id: null, madre_id: null, foto: null, notas: '', peso_g: 680 },
    { id: 'av6', codigo: 'GM-006', nombre: 'Vainilla', raza: 'Vainilla', sexo: 'Hembra', color: 'Crema', fecha_nacimiento: '2023-09-12', estado: 'Activo', ubicacion: 'Libre-Norte', padre_id: null, madre_id: null, foto: null, notas: '', peso_g: 450 },
    { id: 'av7', codigo: 'GM-007', nombre: 'Chiquitín', raza: 'Kuai', sexo: 'Macho', color: 'Negro', fecha_nacimiento: '2024-01-10', estado: 'Pollito', ubicacion: 'Cría-1', padre_id: 'av5', madre_id: 'av6', foto: null, notas: '3 meses', peso_g: 180 },
    { id: 'av8', codigo: 'GM-008', nombre: 'Estrella', raza: 'Azteca', sexo: 'Hembra', color: 'Azul Apizarrado', fecha_nacimiento: '2023-02-28', estado: 'Tratamiento', ubicacion: 'Enfermería', padre_id: null, madre_id: null, foto: null, notas: 'En tratamiento respiratorio', peso_g: 490 },
  ],
  jaulas: [
    { id: 'j1', codigo: 'Jaula-A1', tipo: 'Reproductora', capacidad: 3, descripcion: 'Pareja Minifénix reproducción', activa: true },
    { id: 'j2', codigo: 'Jaula-B2', tipo: 'Individual', capacidad: 1, descripcion: 'Macho campeón exhibición', activa: true },
    { id: 'j3', codigo: 'Jaula-C1', tipo: 'Maternidad', capacidad: 2, descripcion: 'Gallinas echadas', activa: true },
    { id: 'j4', codigo: 'Cría-1', tipo: 'Cría', capacidad: 20, descripcion: 'Pollitos recientes', activa: true },
    { id: 'j5', codigo: 'Libre-Norte', tipo: 'Libre', capacidad: 30, descripcion: 'Área norte — sueltas', activa: true },
    { id: 'j6', codigo: 'Enfermería', tipo: 'Cuarentena', capacidad: 5, descripcion: 'Aves en tratamiento', activa: true },
  ],
  reproducciones: [
    { id: 'r1', padre_id: 'av1', madre_id: 'av2', fecha_inicio: '2024-10-15', fecha_eclosion_esperada: '2024-11-05', num_huevos: 9, num_eclosionados: 7, estado: 'Completado', notas: 'Excelente fertilidad' },
    { id: 'r2', padre_id: 'av5', madre_id: 'av4', fecha_inicio: '2024-11-20', fecha_eclosion_esperada: '2024-12-11', num_huevos: 8, num_eclosionados: null, estado: 'En Incubación', notas: 'Día 10 de incubación' },
  ],
  salud: [
    { id: 's1', ave_id: 'av8', fecha: '2024-11-25', tipo: 'Enfermedad', descripcion: 'Infección respiratoria leve', tratamiento: 'Enrofloxacina 10mg/kg oral', veterinario: 'Dr. Méndez', estado: 'En curso', proxima_revision: '2024-12-02' },
    { id: 's2', ave_id: 'av3', fecha: '2024-10-10', tipo: 'Vacuna', descripcion: 'Newcastle + Bronquitis', tratamiento: 'Vacuna polivalente ocular', veterinario: 'Dr. Méndez', estado: 'Completado', proxima_revision: '2025-04-10' },
    { id: 's3', ave_id: 'av1', fecha: '2024-09-05', tipo: 'Vacuna', descripcion: 'Marek preventivo', tratamiento: 'Vacuna Marek 1 dosis', veterinario: 'Auto', estado: 'Completado', proxima_revision: null },
  ],
  medicamentos: [
    { id: 'm1', nombre: 'Enrofloxacina 10%', tipo: 'Antibiótico', stock_ml: 45, unidad: 'ml', costo_unit: 3500, proveedor: 'VetPro', fecha_vencimiento: '2025-08-01', alerta_stock: 20 },
    { id: 'm2', nombre: 'Ivermectina 1%', tipo: 'Antiparasitario', stock_ml: 30, unidad: 'ml', costo_unit: 2800, proveedor: 'AgroVet', fecha_vencimiento: '2025-06-15', alerta_stock: 10 },
    { id: 'm3', nombre: 'Vitaminas ADE', tipo: 'Suplemento', stock_ml: 120, unidad: 'ml', costo_unit: 1200, proveedor: 'AgroVet', fecha_vencimiento: '2025-12-01', alerta_stock: 30 },
    { id: 'm4', nombre: 'Newcastle Vacuna', tipo: 'Vacuna', stock_ml: 8, unidad: 'dosis', costo_unit: 800, proveedor: 'Biovac', fecha_vencimiento: '2025-02-01', alerta_stock: 5 },
  ],
  ventas: [
    { id: 'v1', fecha: '2024-11-10', ave_id: 'av1', tipo: 'Ave', precio: 85000, cliente: 'Carlos Ruiz', notas: 'Macho campeón fenotipo' },
    { id: 'v2', fecha: '2024-10-22', ave_id: null, tipo: 'Huevos fértiles', precio: 12000, cliente: 'María González', cantidad: 6, notas: 'Huevos Minifénix' },
  ],
  alertas: [
    { id: 'al1', tipo: 'Vacuna', descripcion: 'Revacunación Newcastle para lote B', fecha: '2024-12-10', prioridad: 'Alta', estado: 'Pendiente' },
    { id: 'al2', tipo: 'Nacimiento', descripcion: 'Eclosión esperada Jaula-C1 — Sakura', fecha: '2024-12-11', prioridad: 'Media', estado: 'Pendiente' },
    { id: 'al3', tipo: 'Stock', descripcion: 'Newcastle Vacuna — bajo stock (8 dosis)', fecha: '2024-11-28', prioridad: 'Alta', estado: 'Pendiente' },
  ]
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _data = load() || JSON.parse(JSON.stringify(seedData));

export const db = {
  get: (table) => [...(_data[table] || [])],

  add: (table, item) => {
    const newItem = { id: uuid(), ...item };
    _data[table] = [...(_data[table] || []), newItem];
    save(_data);
    return newItem;
  },

  update: (table, id, updates) => {
    _data[table] = _data[table].map(item => item.id === id ? { ...item, ...updates } : item);
    save(_data);
    return _data[table].find(i => i.id === id);
  },

  delete: (table, id) => {
    _data[table] = _data[table].filter(item => item.id !== id);
    save(_data);
  },

  find: (table, id) => (_data[table] || []).find(i => i.id === id),
  
  reset: () => { _data = JSON.parse(JSON.stringify(seedData)); save(_data); },

  stats: () => {
    const aves = _data.aves || [];
    return {
      total: aves.length,
      machos: aves.filter(a => a.sexo === 'Macho').length,
      hembras: aves.filter(a => a.sexo === 'Hembra').length,
      pollitos: aves.filter(a => a.estado === 'Pollito').length,
      tratamiento: aves.filter(a => a.estado === 'Tratamiento').length,
      echadas: aves.filter(a => a.estado === 'Echada').length,
      razas: [...new Set(aves.map(a => a.raza))].length,
      alertas: (_data.alertas || []).filter(a => a.estado === 'Pendiente').length,
      ventas_mes: (_data.ventas || []).reduce((s, v) => s + v.precio, 0),
      reproducciones_activas: (_data.reproducciones || []).filter(r => r.estado === 'En Incubación').length,
    };
  }
};

export const RAZAS = ['Minifénix', 'Azteca', 'Kuai', 'Nagasaki', 'Vainilla', 'Serama', 'Pekin', 'Cochin', 'Silkie', 'Otra'];
export const ESTADOS_AVE = ['Activo', 'Echada', 'Pollito', 'Tratamiento', 'Vendido', 'Fallecido', 'Cuarentena'];
export const TIPOS_JAULA = ['Reproductora', 'Individual', 'Cría', 'Libre', 'Maternidad', 'Cuarentena'];
