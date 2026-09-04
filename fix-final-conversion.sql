-- ============================================
-- FIX FINAL: Conversión de Prospectos - SIN ERRORES
-- Arregla todos los problemas de tipos de datos y campos
-- ============================================

-- 1. AGREGAR COLUMNAS FALTANTES
ALTER TABLE historias_clinicas ADD COLUMN IF NOT EXISTS ingreso_mensual NUMERIC;

-- 2. FUNCIÓN DE CONVERSIÓN CORREGIDA - CON CASTING DE TIPOS
CREATE OR REPLACE FUNCTION convertir_prospecto_a_paciente(historia_id UUID)
RETURNS UUID AS $$
DECLARE
  nuevo_paciente_id UUID;
  historia RECORD;
BEGIN
  -- Obtener datos de la historia clínica
  SELECT * INTO historia FROM historias_clinicas WHERE id = historia_id;
  
  -- Verificar que existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Historia clínica no encontrada';
  END IF;
  
  -- Verificar que no esté ya convertido
  IF historia.convertido_paciente THEN
    RAISE EXCEPTION 'Este prospecto ya fue convertido a paciente';
  END IF;
  
  -- Crear el paciente con CASTING correcto de tipos
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
    estado,
    prioridad
  ) VALUES (
    historia_id,
    historia.nombre,
    COALESCE(historia.celular, historia.telefono),
    historia.email,
    -- CASTING: Convertir edad a INTEGER
    CASE 
      WHEN historia.edad IS NULL THEN NULL
      WHEN historia.edad::text ~ '^[0-9]+$' THEN historia.edad::INTEGER
      ELSE NULL
    END,
    historia.sexo,
    historia.direccion,
    historia.empresa,
    historia.ocupacion,
    historia.antiguedad,
    -- CASTING: Convertir ingreso_mensual a NUMERIC
    CASE 
      WHEN historia.ingreso_mensual IS NULL THEN NULL
      WHEN historia.ingreso_mensual::text ~ '^[0-9.]+$' THEN historia.ingreso_mensual::NUMERIC
      ELSE NULL
    END,
    'activo',
    'media'
  ) RETURNING id INTO nuevo_paciente_id;
  
  -- Actualizar la historia clínica
  UPDATE historias_clinicas 
  SET 
    estado_prospecto = 'paciente',
    convertido_paciente = TRUE,
    fecha_conversion = NOW()
  WHERE id = historia_id;
  
  RETURN nuevo_paciente_id;
END;
$$ LANGUAGE plpgsql;

-- 3. FUNCIÓN DE DETECCIÓN DE PROGRESO INTELIGENTE
CREATE OR REPLACE FUNCTION detectar_progreso_prospecto(historia_id UUID)
RETURNS TABLE (
  progreso_paso TEXT,
  progreso_porcentaje INTEGER,
  tiene_contrato BOOLEAN,
  tiene_consentimiento BOOLEAN
) AS $$
DECLARE
  tiene_contrato_val BOOLEAN;
  tiene_consentimiento_val BOOLEAN;
  paso_actual TEXT;
  porcentaje INTEGER;
BEGIN
  -- Verificar si tiene contrato
  SELECT EXISTS(
    SELECT 1 FROM contratos WHERE historia_clinica_id = historia_id
  ) INTO tiene_contrato_val;
  
  -- Verificar si tiene consentimiento
  SELECT EXISTS(
    SELECT 1 FROM consentimientos WHERE historia_clinica_id = historia_id
  ) INTO tiene_consentimiento_val;
  
  -- Determinar el paso y porcentaje basado en lo que tiene
  IF tiene_consentimiento_val THEN
    paso_actual := 'consentimiento';
    porcentaje := 100;
  ELSIF tiene_contrato_val THEN
    paso_actual := 'contrato';
    porcentaje := 80;
  ELSE
    -- Si solo tiene historia clínica
    paso_actual := 'historia_clinica';
    porcentaje := 25;
  END IF;
  
  RETURN QUERY SELECT paso_actual, porcentaje, tiene_contrato_val, tiene_consentimiento_val;
END;
$$ LANGUAGE plpgsql;

-- 4. ACTUALIZAR PROGRESO DE TODOS LOS PROSPECTOS EXISTENTES
DO $$
DECLARE
  prospecto RECORD;
  progreso_info RECORD;
BEGIN
  FOR prospecto IN 
    SELECT id FROM historias_clinicas WHERE convertido_paciente = FALSE
  LOOP
    -- Detectar progreso real
    SELECT * INTO progreso_info FROM detectar_progreso_prospecto(prospecto.id);
    
    -- Actualizar con el progreso detectado
    UPDATE historias_clinicas
    SET
      progreso_paso = progreso_info.progreso_paso,
      progreso_porcentaje = progreso_info.progreso_porcentaje,
      contrato_firmado = progreso_info.tiene_contrato,
      consentimiento_firmado = progreso_info.tiene_consentimiento,
      fecha_ultimo_paso = COALESCE(fecha_ultimo_paso, created_at),
      url_continuar = CASE progreso_info.progreso_paso
        WHEN 'historia_clinica' THEN '/contrato'
        WHEN 'contrato' THEN '/consentimiento'
        WHEN 'consentimiento' THEN '/'
        ELSE '/'
      END
    WHERE id = prospecto.id;
  END LOOP;
  
  RAISE NOTICE 'Progreso actualizado para todos los prospectos existentes';
END $$;

-- 5. VERIFICACIÓN FINAL
SELECT 
  'Fix aplicado correctamente - Conversión lista para usar' as mensaje,
  COUNT(*) as total_prospectos,
  COUNT(*) FILTER (WHERE progreso_porcentaje = 100) as completos,
  COUNT(*) FILTER (WHERE progreso_porcentaje >= 80 AND progreso_porcentaje < 100) as casi_completos,
  COUNT(*) FILTER (WHERE progreso_porcentaje < 80) as incompletos
FROM historias_clinicas 
WHERE convertido_paciente = FALSE;

-- 6. MOSTRAR EJEMPLO DE PROSPECTOS
SELECT 
  nombre,
  edad,
  progreso_paso,
  progreso_porcentaje,
  contrato_firmado,
  consentimiento_firmado
FROM historias_clinicas
WHERE convertido_paciente = FALSE
ORDER BY progreso_porcentaje DESC
LIMIT 5;
