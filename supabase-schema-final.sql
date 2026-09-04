-- ============================================
-- SCHEMA COMPLETO PARA CRM DENT'S 23 - VERSIÓN FINAL
-- Sistema de gestión de prospectos a pacientes
-- SIN ERRORES - PUEDE EJECUTARSE MÚLTIPLES VECES
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA: historias_clinicas (ACTUALIZAR)
-- ============================================
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS estado_prospecto TEXT DEFAULT 'prospecto';
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS convertido_paciente BOOLEAN DEFAULT FALSE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS fecha_conversion TIMESTAMP WITH TIME ZONE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS vivienda_propia BOOLEAN;

-- ============================================
-- 2. TABLA: pacientes
-- ============================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historia_clinica_id UUID REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  fecha_nacimiento DATE,
  edad INTEGER,
  sexo TEXT,
  direccion TEXT,
  empresa TEXT,
  ocupacion TEXT,
  antiguedad TEXT,
  ingreso_mensual NUMERIC,
  estado TEXT DEFAULT 'activo',
  prioridad TEXT DEFAULT 'media',
  alergias TEXT[],
  enfermedades_cronicas TEXT[],
  medicamentos_actuales TEXT[],
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Agregar constraint solo si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_historia_clinica'
  ) THEN
    ALTER TABLE pacientes ADD CONSTRAINT unique_historia_clinica UNIQUE(historia_clinica_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_telefono ON pacientes(telefono);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(estado);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_at ON pacientes(created_at DESC);

-- ============================================
-- 3. TABLA: citas
-- ============================================
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  tipo_cita TEXT NOT NULL,
  doctor TEXT NOT NULL,
  consultorio TEXT,
  estado TEXT DEFAULT 'programada',
  motivo_cancelacion TEXT,
  motivo_consulta TEXT,
  diagnostico TEXT,
  tratamiento_realizado TEXT,
  proxima_cita DATE,
  notas TEXT,
  recordatorio_enviado BOOLEAN DEFAULT FALSE,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_doctor ON citas(doctor);

-- ============================================
-- 4. TABLA: seguimientos
-- ============================================
CREATE TABLE IF NOT EXISTS seguimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_seguimiento TIMESTAMP WITH TIME ZONE NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  prioridad TEXT DEFAULT 'media',
  asignado_a TEXT,
  resultado TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_seguimientos_paciente ON seguimientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_fecha ON seguimientos(fecha_seguimiento);
CREATE INDEX IF NOT EXISTS idx_seguimientos_completado ON seguimientos(completado);
CREATE INDEX IF NOT EXISTS idx_seguimientos_prioridad ON seguimientos(prioridad);

-- ============================================
-- 5. TABLA: planes_pago
-- ============================================
CREATE TABLE IF NOT EXISTS planes_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  monto_total NUMERIC NOT NULL,
  numero_cuotas INTEGER NOT NULL,
  monto_cuota NUMERIC NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_primer_pago DATE NOT NULL,
  periodicidad TEXT DEFAULT 'mensual',
  estado TEXT DEFAULT 'activo',
  descuento_aplicado NUMERIC DEFAULT 0,
  interes_aplicado NUMERIC DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_planes_pago_paciente ON planes_pago(paciente_id);
CREATE INDEX IF NOT EXISTS idx_planes_pago_estado ON planes_pago(estado);

-- ============================================
-- 6. TABLA: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  plan_pago_id UUID REFERENCES planes_pago(id) ON DELETE SET NULL,
  concepto TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  numero_cuota INTEGER,
  estado TEXT DEFAULT 'pendiente',
  fecha_vencimiento DATE,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  metodo_pago TEXT,
  referencia TEXT,
  recargo NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  procesado_por TEXT
);

CREATE INDEX IF NOT EXISTS idx_pagos_paciente ON pagos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_plan ON pagos(plan_pago_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_vencimiento ON pagos(fecha_vencimiento);

-- ============================================
-- 7. TABLA: tratamientos
-- ============================================
CREATE TABLE IF NOT EXISTS tratamientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT,
  estado TEXT DEFAULT 'planificado',
  fecha_inicio DATE,
  fecha_fin DATE,
  fecha_estimada_fin DATE,
  costo_estimado NUMERIC,
  costo_real NUMERIC,
  doctor_responsable TEXT,
  porcentaje_completado INTEGER DEFAULT 0,
  sesiones_totales INTEGER,
  sesiones_completadas INTEGER DEFAULT 0,
  notas TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_tratamientos_paciente ON tratamientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tratamientos_estado ON tratamientos(estado);

-- ============================================
-- 8. TABLA: documentos
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  url TEXT,
  tipo_archivo TEXT,
  tamano_bytes BIGINT,
  fecha_documento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_documentos_paciente ON documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);

-- ============================================
-- 9. FUNCIÓN: update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 10. TRIGGERS (CON DROP IF EXISTS)
-- ============================================
DROP TRIGGER IF EXISTS update_pacientes_updated_at ON pacientes;
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_citas_updated_at ON citas;
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seguimientos_updated_at ON seguimientos;
CREATE TRIGGER update_seguimientos_updated_at BEFORE UPDATE ON seguimientos 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_planes_pago_updated_at ON planes_pago;
CREATE TRIGGER update_planes_pago_updated_at BEFORE UPDATE ON planes_pago 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pagos_updated_at ON pagos;
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tratamientos_updated_at ON tratamientos;
CREATE TRIGGER update_tratamientos_updated_at BEFORE UPDATE ON tratamientos 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. FUNCIÓN: convertir_prospecto_a_paciente
-- ============================================
CREATE OR REPLACE FUNCTION convertir_prospecto_a_paciente(historia_id UUID)
RETURNS UUID AS $$
DECLARE
  nuevo_paciente_id UUID;
  historia RECORD;
BEGIN
  SELECT * INTO historia FROM historias_clinicas WHERE id = historia_id;
  
  INSERT INTO pacientes (
    historia_clinica_id,
    nombre_completo,
    telefono,
    email,
    edad,
    sexo,
    direccion,
    empresa,
    ocupacion,
    antiguedad,
    ingreso_mensual,
    estado
  ) VALUES (
    historia_id,
    historia.nombre,
    COALESCE(historia.celular, historia.telefono),
    historia.email,
    historia.edad,
    historia.sexo,
    historia.direccion,
    historia.empresa,
    historia.ocupacion,
    historia.antiguedad,
    historia.ingresoMensual,
    'activo'
  ) RETURNING id INTO nuevo_paciente_id;
  
  UPDATE historias_clinicas 
  SET 
    estado_prospecto = 'paciente',
    convertido_paciente = TRUE,
    fecha_conversion = NOW()
  WHERE id = historia_id;
  
  RETURN nuevo_paciente_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. FUNCIÓN: get_dashboard_stats
-- ============================================
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_pacientes', (SELECT COUNT(*) FROM pacientes WHERE estado = 'activo'),
    'total_prospectos', (SELECT COUNT(*) FROM historias_clinicas WHERE estado_prospecto = 'prospecto'),
    'citas_hoy', (SELECT COUNT(*) FROM citas WHERE DATE(fecha_cita) = CURRENT_DATE AND estado = 'programada'),
    'citas_semana', (SELECT COUNT(*) FROM citas WHERE fecha_cita >= CURRENT_DATE AND fecha_cita < CURRENT_DATE + INTERVAL '7 days'),
    'pagos_pendientes', (SELECT COUNT(*) FROM pagos WHERE estado = 'pendiente'),
    'monto_pendiente', (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE estado = 'pendiente'),
    'ingresos_mes', (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE estado = 'pagado' AND DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)),
    'seguimientos_pendientes', (SELECT COUNT(*) FROM seguimientos WHERE completado = FALSE AND fecha_seguimiento <= CURRENT_DATE + INTERVAL '7 days')
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 13. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Políticas (permitir todo por ahora)
DROP POLICY IF EXISTS "Enable all access" ON pacientes;
CREATE POLICY "Enable all access" ON pacientes FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON citas;
CREATE POLICY "Enable all access" ON citas FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON seguimientos;
CREATE POLICY "Enable all access" ON seguimientos FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON planes_pago;
CREATE POLICY "Enable all access" ON planes_pago FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON pagos;
CREATE POLICY "Enable all access" ON pagos FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON tratamientos;
CREATE POLICY "Enable all access" ON tratamientos FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON documentos;
CREATE POLICY "Enable all access" ON documentos FOR ALL USING (true);

-- ============================================
-- 14. HABILITAR REALTIME (CON MANEJO DE ERRORES)
-- ============================================
-- Nota: Si ya están en realtime, esto no causará error
DO $$ 
BEGIN
  -- Intentar agregar pacientes a realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pacientes;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Ya existe, ignorar
  END;

  -- Intentar agregar citas a realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE citas;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  -- Intentar agregar seguimientos a realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE seguimientos;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  -- Intentar agregar pagos a realtime
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pagos;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- ============================================
-- FIN - VERIFICACIÓN
-- ============================================
-- Verificar que todo se creó correctamente
SELECT 
  'Schema creado exitosamente!' as mensaje,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('pacientes', 'citas', 'seguimientos', 'planes_pago', 'pagos', 'tratamientos', 'documentos')) as tablas_creadas;
