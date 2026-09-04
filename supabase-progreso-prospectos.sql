-- ============================================
-- SISTEMA DE PROGRESO PARA PROSPECTOS
-- Tracking del flujo de registro
-- ============================================

-- Agregar columnas de progreso a historias_clinicas
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS progreso_paso TEXT DEFAULT 'historia_clinica';
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS progreso_porcentaje INTEGER DEFAULT 25;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS formulario_completo BOOLEAN DEFAULT FALSE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS aprobacion_credito BOOLEAN DEFAULT FALSE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS contrato_firmado BOOLEAN DEFAULT FALSE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS consentimiento_firmado BOOLEAN DEFAULT FALSE;
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS fecha_ultimo_paso TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS url_continuar TEXT;

-- Crear tabla para tracking detallado de pasos
CREATE TABLE IF NOT EXISTS progreso_registro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historia_clinica_id UUID REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  paso TEXT NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completado TIMESTAMP WITH TIME ZONE,
  datos_paso JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_progreso_historia ON progreso_registro(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_progreso_paso ON progreso_registro(paso);
CREATE INDEX IF NOT EXISTS idx_historias_progreso ON historias_clinicas(progreso_paso);

-- Función para actualizar progreso
CREATE OR REPLACE FUNCTION actualizar_progreso_prospecto(
  historia_id UUID,
  paso_actual TEXT,
  completado BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  porcentaje INTEGER;
  url TEXT;
BEGIN
  -- Calcular porcentaje según el paso
  CASE paso_actual
    WHEN 'historia_clinica' THEN 
      porcentaje := 25;
      url := '/';
    WHEN 'formulario_completo' THEN 
      porcentaje := 50;
      url := '/formulario-completo';
    WHEN 'aprobacion_credito' THEN 
      porcentaje := 65;
      url := '/formulario-completo';
    WHEN 'contrato' THEN 
      porcentaje := 80;
      url := '/contrato';
    WHEN 'consentimiento' THEN 
      porcentaje := 100;
      url := '/consentimiento';
    ELSE 
      porcentaje := 0;
      url := '/';
  END CASE;

  -- Actualizar historia_clinica
  UPDATE historias_clinicas
  SET 
    progreso_paso = paso_actual,
    progreso_porcentaje = porcentaje,
    fecha_ultimo_paso = NOW(),
    url_continuar = url,
    -- Actualizar flags específicos
    formulario_completo = CASE WHEN paso_actual = 'formulario_completo' AND completado THEN TRUE ELSE formulario_completo END,
    aprobacion_credito = CASE WHEN paso_actual = 'aprobacion_credito' AND completado THEN TRUE ELSE aprobacion_credito END,
    contrato_firmado = CASE WHEN paso_actual = 'contrato' AND completado THEN TRUE ELSE contrato_firmado END,
    consentimiento_firmado = CASE WHEN paso_actual = 'consentimiento' AND completado THEN TRUE ELSE consentimiento_firmado END
  WHERE id = historia_id;

  -- Registrar en tabla de progreso
  INSERT INTO progreso_registro (historia_clinica_id, paso, completado, fecha_completado)
  VALUES (historia_id, paso_actual, completado, CASE WHEN completado THEN NOW() ELSE NULL END)
  ON CONFLICT DO NOTHING;

END;
$$;

-- Función para obtener prospectos incompletos
CREATE OR REPLACE FUNCTION get_prospectos_incompletos()
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  empresa TEXT,
  progreso_paso TEXT,
  progreso_porcentaje INTEGER,
  url_continuar TEXT,
  fecha_ultimo_paso TIMESTAMP WITH TIME ZONE,
  dias_inactivo INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hc.id,
    hc.nombre,
    hc.email,
    COALESCE(hc.celular, hc.telefono) as telefono,
    hc.empresa,
    hc.progreso_paso,
    hc.progreso_porcentaje,
    hc.url_continuar,
    hc.fecha_ultimo_paso,
    EXTRACT(DAY FROM NOW() - hc.fecha_ultimo_paso)::INTEGER as dias_inactivo
  FROM historias_clinicas hc
  WHERE 
    hc.convertido_paciente = FALSE
    AND hc.progreso_porcentaje < 100
  ORDER BY hc.fecha_ultimo_paso DESC;
END;
$$;

-- Comentarios
COMMENT ON COLUMN historias_clinicas.progreso_paso IS 'Último paso completado: historia_clinica, formulario_completo, aprobacion_credito, contrato, consentimiento';
COMMENT ON COLUMN historias_clinicas.progreso_porcentaje IS 'Porcentaje de completitud del registro (0-100)';
COMMENT ON COLUMN historias_clinicas.url_continuar IS 'URL para continuar el registro desde donde se quedó';
COMMENT ON TABLE progreso_registro IS 'Tracking detallado de cada paso del registro';

-- Verificación
SELECT 'Sistema de progreso instalado correctamente' as mensaje;
