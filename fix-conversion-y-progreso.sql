-- ============================================
-- FIX: Conversión de Prospectos y Progreso Inteligente
-- ============================================

-- 1. ARREGLAR FUNCIÓN DE CONVERSIÓN (campo ingreso_mensual)
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
  
  -- Crear el paciente (ARREGLADO: ingreso_mensual en lugar de ingresoMensual)
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
    historia.edad,
    historia.sexo,
    historia.direccion,
    historia.empresa,
    historia.ocupacion,
    historia.antiguedad,
    historia.ingreso_mensual,  -- ARREGLADO: nombre correcto del campo
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

-- 2. FUNCIÓN PARA DETECTAR PROGRESO INTELIGENTE
-- Analiza qué documentos tiene el prospecto y calcula el progreso real
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

-- 3. ACTUALIZAR PROGRESO DE TODOS LOS PROSPECTOS EXISTENTES
-- Esto detecta automáticamente el progreso real de cada prospecto
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

-- 4. FUNCIÓN MEJORADA PARA ACTUALIZAR PROGRESO
-- Ahora también actualiza los flags de contrato y consentimiento
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
      url := '/contrato';
    WHEN 'formulario_completo' THEN 
      porcentaje := 50;
      url := '/contrato';
    WHEN 'aprobacion_credito' THEN 
      porcentaje := 65;
      url := '/contrato';
    WHEN 'contrato' THEN 
      porcentaje := 80;
      url := '/consentimiento';
    WHEN 'consentimiento' THEN 
      porcentaje := 100;
      url := '/';
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
    formulario_completo = CASE WHEN paso_actual = 'formulario_completo' AND completado THEN TRUE ELSE COALESCE(formulario_completo, FALSE) END,
    aprobacion_credito = CASE WHEN paso_actual = 'aprobacion_credito' AND completado THEN TRUE ELSE COALESCE(aprobacion_credito, FALSE) END,
    contrato_firmado = CASE WHEN paso_actual = 'contrato' AND completado THEN TRUE ELSE COALESCE(contrato_firmado, FALSE) END,
    consentimiento_firmado = CASE WHEN paso_actual = 'consentimiento' AND completado THEN TRUE ELSE COALESCE(consentimiento_firmado, FALSE) END
  WHERE id = historia_id;

  -- Registrar en tabla de progreso
  INSERT INTO progreso_registro (historia_clinica_id, paso, completado, fecha_completado)
  VALUES (historia_id, paso_actual, completado, CASE WHEN completado THEN NOW() ELSE NULL END)
  ON CONFLICT DO NOTHING;

END;
$$;

-- 5. VERIFICACIÓN
SELECT 
  'Fix aplicado correctamente' as mensaje,
  COUNT(*) as prospectos_actualizados
FROM historias_clinicas 
WHERE convertido_paciente = FALSE;
