-- ============================================
-- MIGRACIÓN: FASES 3, 4 Y 5
-- Agrega soporte para datos completos de la historia clínica
-- ============================================

-- Agregar columna JSON para almacenar todos los datos del formulario
ALTER TABLE historias_clinicas
ADD COLUMN IF NOT EXISTS datos_completos JSONB DEFAULT '{}';

-- Comentarios
COMMENT ON COLUMN historias_clinicas.datos_completos IS 'JSON completo con los datos de todas las fases del formulario de historia clínica';

-- Índices para búsquedas frecuentes en JSON
CREATE INDEX IF NOT EXISTS idx_historias_datos_completos
ON historias_clinicas USING GIN (datos_completos jsonb_path_ops);
