-- Agregar columna tipo_paciente a la tabla historias_clinicas
ALTER TABLE historias_clinicas 
ADD COLUMN IF NOT EXISTS tipo_paciente VARCHAR(20) DEFAULT '';

-- Crear índice para mejorar las consultas por tipo de paciente
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_tipo_paciente 
ON historias_clinicas(tipo_paciente);

-- Comentario para documentar la columna
COMMENT ON COLUMN historias_clinicas.tipo_paciente IS 'Tipo de paciente: charly, nomina, bancario, particular';
