-- ============================================================
-- SCHEMA DE BASE DE DATOS PARA SISTEMA DE RESERVAS
-- Empresa de Limpieza Industrial
-- ============================================================

-- Tabla principal de reservas
CREATE TABLE reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(8) UNIQUE NOT NULL,  -- código legible ej: "LIM-4821"

  -- Datos del cliente
  nombre TEXT NOT NULL,
  empresa TEXT,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  tipo_cliente TEXT CHECK (tipo_cliente IN ('empresa', 'particular')),

  -- Detalles del servicio
  tipo_servicio TEXT NOT NULL,
  superficie_m2 INTEGER NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  codigo_postal TEXT NOT NULL,

  -- Fecha y hora
  fecha DATE NOT NULL,
  franja_horaria TEXT CHECK (franja_horaria IN ('manana', 'tarde')),

  -- Extra
  observaciones TEXT,

  -- Control
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para el dashboard
CREATE INDEX idx_reservas_fecha ON reservas(fecha);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_email ON reservas(email);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservas_updated_at
BEFORE UPDATE ON reservas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Política: el público puede insertar reservas (formulario web)
CREATE POLICY "Público puede insertar reservas"
  ON reservas FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: solo admins autenticados pueden leer todas las reservas
CREATE POLICY "Solo admin puede leer todas las reservas"
  ON reservas FOR SELECT
  TO authenticated
  USING (true);

-- Política: solo admins autenticados pueden actualizar reservas
CREATE POLICY "Solo admin puede actualizar reservas"
  ON reservas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: solo admins autenticados pueden eliminar reservas
CREATE POLICY "Solo admin puede eliminar reservas"
  ON reservas FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- FUNCIONES AUXILIARES
-- ============================================================

-- Función para generar código único de reserva
CREATE OR REPLACE FUNCTION generate_reservation_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Genera código del formato "LIM-XXXX" donde XXXX es un número aleatorio de 4 dígitos
    new_code := 'LIM-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Verifica si el código ya existe
    SELECT EXISTS(SELECT 1 FROM reservas WHERE codigo = new_code) INTO code_exists;

    -- Si no existe, retorna el código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- NOTAS PARA EL ADMINISTRADOR
-- ============================================================

-- 1. Ejecutar este script en el editor SQL de Supabase
-- 2. Crear un usuario admin en Supabase Auth con email y contraseña
-- 3. El público (anon) solo puede crear reservas, no leerlas
-- 4. Los usuarios autenticados (admin) tienen acceso completo
-- 5. El código de reserva se genera automáticamente en la aplicación
