-- ================================================================
-- GALLOMANAGER — Ejecutar en Supabase > SQL Editor
-- ================================================================

-- 1. AVES
CREATE TABLE IF NOT EXISTS aves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  raza TEXT,
  sexo TEXT CHECK(sexo IN ('Macho','Hembra')),
  color TEXT,
  fecha_nacimiento DATE,
  estado TEXT DEFAULT 'Activo',
  ubicacion TEXT,
  padre_id UUID REFERENCES aves(id) ON DELETE SET NULL,
  madre_id UUID REFERENCES aves(id) ON DELETE SET NULL,
  notas TEXT,
  peso_g INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JAULAS
CREATE TABLE IF NOT EXISTS jaulas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  codigo TEXT NOT NULL,
  tipo TEXT,
  capacidad INTEGER DEFAULT 2,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REPRODUCCIONES
CREATE TABLE IF NOT EXISTS reproducciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  padre_id UUID REFERENCES aves(id) ON DELETE SET NULL,
  madre_id UUID REFERENCES aves(id) ON DELETE SET NULL,
  fecha_inicio DATE,
  fecha_eclosion_esperada DATE,
  num_huevos INTEGER DEFAULT 0,
  num_eclosionados INTEGER,
  estado TEXT DEFAULT 'En Incubación',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SALUD
CREATE TABLE IF NOT EXISTS salud (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ave_id UUID REFERENCES aves(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tipo TEXT,
  descripcion TEXT,
  tratamiento TEXT,
  veterinario TEXT,
  estado TEXT DEFAULT 'En curso',
  proxima_revision DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDICAMENTOS
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT,
  stock_ml NUMERIC DEFAULT 0,
  unidad TEXT DEFAULT 'ml',
  costo_unit NUMERIC DEFAULT 0,
  proveedor TEXT,
  fecha_vencimiento DATE,
  alerta_stock NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENTAS
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL,
  ave_id UUID REFERENCES aves(id) ON DELETE SET NULL,
  tipo TEXT,
  precio NUMERIC DEFAULT 0,
  cliente TEXT,
  cantidad INTEGER DEFAULT 1,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ALERTAS
CREATE TABLE IF NOT EXISTS alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT,
  descripcion TEXT,
  fecha DATE,
  prioridad TEXT DEFAULT 'Media',
  estado TEXT DEFAULT 'Pendiente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY — cada usuario solo ve sus datos
-- ================================================================
ALTER TABLE aves ENABLE ROW LEVEL SECURITY;
ALTER TABLE jaulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE salud ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_aves" ON aves FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_jaulas" ON jaulas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_reproducciones" ON reproducciones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_salud" ON salud FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_medicamentos" ON medicamentos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_ventas" ON ventas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_alertas" ON alertas FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
