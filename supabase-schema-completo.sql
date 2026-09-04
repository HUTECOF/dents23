-- ============================================
-- SCHEMA COMPLETO PARA CRM DENT'S 23
-- Sistema de gestión de prospectos a pacientes
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA: historias_clinicas (YA EXISTE - ACTUALIZAR)
-- ============================================
-- Esta tabla almacena las historias clínicas completas
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS estado_prospecto TEXT DEFAULT 'prospecto';
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS convertido_paciente BOOLEAN DEFAULT FALSE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS fecha_conversion TIMESTAMP WITH TIME ZONE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS vivienda_propia BOOLEAN;

-- Comentarios
COMMENT ON COLUMN historias_clinicas.estado_prospecto IS 'prospecto, paciente, rechazado, en_seguimiento';
COMMENT ON COLUMN historias_clinicas.convertido_paciente IS 'TRUE si el prospecto se convirtió en paciente';

-- ============================================
-- 2. TABLA: pacientes
-- ============================================
-- Vista enriquecida de pacientes (prospectos convertidos)
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historia_clinica_id UUID REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  
  -- Información básica
  nombre_completo TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  fecha_nacimiento DATE,
  edad INTEGER,
  sexo TEXT,
  direccion TEXT,
  
  -- Información laboral
  empresa TEXT,
  ocupacion TEXT,
  antiguedad TEXT,
  ingreso_mensual NUMERIC,
  
  -- Estado del paciente
  estado TEXT DEFAULT 'activo', -- activo, inactivo, en_tratamiento, recuperacion
  prioridad TEXT DEFAULT 'media', -- alta, media, baja
  
  -- Información médica
  alergias TEXT[],
  enfermedades_cronicas TEXT[],
  medicamentos_actuales TEXT[],
  
  -- Notas y observaciones
  notas TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  
  -- Índices
  CONSTRAINT unique_historia_clinica UNIQUE(historia_clinica_id)
);

-- Índices para búsqueda rápida
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
  
  -- Información de la cita
  fecha_cita TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  tipo_cita TEXT NOT NULL, -- consulta_general, seguimiento, urgencia, tratamiento, revision
  
  -- Asignación
  doctor TEXT NOT NULL,
  consultorio TEXT,
  
  -- Estado
  estado TEXT DEFAULT 'programada', -- programada, confirmada, en_proceso, completada, cancelada, no_asistio
  motivo_cancelacion TEXT,
  
  -- Detalles
  motivo_consulta TEXT,
  diagnostico TEXT,
  tratamiento_realizado TEXT,
  proxima_cita DATE,
  notas TEXT,
  
  -- Recordatorios
  recordatorio_enviado BOOLEAN DEFAULT FALSE,
  fecha_recordatorio TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Índices
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
  
  -- Tipo de seguimiento
  tipo TEXT NOT NULL, -- llamada, whatsapp, email, visita, recordatorio, laboratorio, resultados
  
  -- Información
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Programación
  fecha_seguimiento TIMESTAMP WITH TIME ZONE NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  
  -- Prioridad
  prioridad TEXT DEFAULT 'media', -- alta, media, baja
  
  -- Asignación
  asignado_a TEXT,
  
  -- Resultado
  resultado TEXT,
  notas TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Índices
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
  
  -- Información del plan
  concepto TEXT NOT NULL,
  monto_total NUMERIC NOT NULL,
  numero_cuotas INTEGER NOT NULL,
  monto_cuota NUMERIC NOT NULL,
  
  -- Fechas
  fecha_inicio DATE NOT NULL,
  fecha_primer_pago DATE NOT NULL,
  periodicidad TEXT DEFAULT 'mensual', -- semanal, quincenal, mensual
  
  -- Estado
  estado TEXT DEFAULT 'activo', -- activo, completado, cancelado, vencido
  
  -- Información adicional
  descuento_aplicado NUMERIC DEFAULT 0,
  interes_aplicado NUMERIC DEFAULT 0,
  notas TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planes_pago_paciente ON planes_pago(paciente_id);
CREATE INDEX IF NOT EXISTS idx_planes_pago_estado ON planes_pago(estado);

-- ============================================
-- 6. TABLA: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  plan_pago_id UUID REFERENCES planes_pago(id) ON DELETE SET NULL,
  
  -- Información del pago
  concepto TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  numero_cuota INTEGER, -- NULL si es pago único
  
  -- Estado
  estado TEXT DEFAULT 'pendiente', -- pendiente, pagado, vencido, cancelado
  
  -- Fechas
  fecha_vencimiento DATE,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  
  -- Método de pago
  metodo_pago TEXT, -- efectivo, tarjeta, transferencia, cheque
  referencia TEXT,
  
  -- Información adicional
  recargo NUMERIC DEFAULT 0,
  descuento NUMERIC DEFAULT 0,
  notas TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  procesado_por TEXT
);

-- Índices
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
  
  -- Información del tratamiento
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT, -- preventivo, correctivo, estetico, quirurgico
  
  -- Estado
  estado TEXT DEFAULT 'planificado', -- planificado, en_proceso, completado, cancelado
  
  -- Fechas
  fecha_inicio DATE,
  fecha_fin DATE,
  fecha_estimada_fin DATE,
  
  -- Costos
  costo_estimado NUMERIC,
  costo_real NUMERIC,
  
  -- Asignación
  doctor_responsable TEXT,
  
  -- Progreso
  porcentaje_completado INTEGER DEFAULT 0,
  sesiones_totales INTEGER,
  sesiones_completadas INTEGER DEFAULT 0,
  
  -- Notas
  notas TEXT,
  observaciones TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tratamientos_paciente ON tratamientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tratamientos_estado ON tratamientos(estado);

-- ============================================
-- 8. TABLA: documentos
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  
  -- Información del documento
  tipo TEXT NOT NULL, -- historia_clinica, contrato, consentimiento, receta, orden_laboratorio, resultado, radiografia
  nombre TEXT NOT NULL,
  descripcion TEXT,
  
  -- Archivo
  url TEXT,
  tipo_archivo TEXT, -- pdf, jpg, png, etc
  tamano_bytes BIGINT,
  
  -- Metadata
  fecha_documento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_documentos_paciente ON documentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);

-- ============================================
-- 9. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seguimientos_updated_at BEFORE UPDATE ON seguimientos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planes_pago_updated_at BEFORE UPDATE ON planes_pago FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tratamientos_updated_at BEFORE UPDATE ON tratamientos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. FUNCIONES ÚTILES
-- ============================================

-- Función para convertir prospecto a paciente
CREATE OR REPLACE FUNCTION convertir_prospecto_a_paciente(historia_id UUID)
RETURNS UUID AS $$
DECLARE
  nuevo_paciente_id UUID;
  historia RECORD;
BEGIN
  -- Obtener datos de la historia clínica
  SELECT * INTO historia FROM historias_clinicas WHERE id = historia_id;
  
  -- Crear paciente
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
  
  -- Actualizar historia clínica
  UPDATE historias_clinicas 
  SET 
    estado_prospecto = 'paciente',
    convertido_paciente = TRUE,
    fecha_conversion = NOW()
  WHERE id = historia_id;
  
  RETURN nuevo_paciente_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del dashboard
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
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (permitir todo por ahora - ajustar según autenticación)
CREATE POLICY "Enable all access for authenticated users" ON pacientes FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON citas FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON seguimientos FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON planes_pago FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON pagos FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON tratamientos FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON documentos FOR ALL USING (true);

-- ============================================
-- 12. HABILITAR REALTIME
-- ============================================

-- Habilitar realtime en las tablas principales
ALTER PUBLICATION supabase_realtime ADD TABLE pacientes;
ALTER PUBLICATION supabase_realtime ADD TABLE citas;
ALTER PUBLICATION supabase_realtime ADD TABLE seguimientos;
ALTER PUBLICATION supabase_realtime ADD TABLE pagos;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Comentarios finales
COMMENT ON TABLE pacientes IS 'Pacientes activos (prospectos convertidos)';
COMMENT ON TABLE citas IS 'Citas médicas programadas y realizadas';
COMMENT ON TABLE seguimientos IS 'Seguimientos y tareas pendientes';
COMMENT ON TABLE planes_pago IS 'Planes de pago acordados con pacientes';
COMMENT ON TABLE pagos IS 'Registro de pagos realizados y pendientes';
COMMENT ON TABLE tratamientos IS 'Tratamientos dentales en curso';
COMMENT ON TABLE documentos IS 'Documentos asociados a pacientes';
