-- Crear tabla de historias clínicas
CREATE TABLE IF NOT EXISTS historias_clinicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Datos Personales
  empresa TEXT,
  antiguedad TEXT,
  fecha TEXT,
  nombre TEXT NOT NULL,
  ocupacion TEXT,
  direccion TEXT,
  edad TEXT,
  sexo TEXT,
  email TEXT,
  celular TEXT,
  telefono TEXT,
  recomendado_por TEXT,
  
  -- Antecedentes Personales
  alergico TEXT,
  alergico_cual TEXT,
  salud_buena TEXT,
  medico_ultimo_anio TEXT,
  enfermedad_ultimos_6_meses TEXT,
  enfermedad_cuales TEXT,
  hipertension TEXT,
  hipertension_valor TEXT,
  tomando_medicamento TEXT,
  medicamento_cual TEXT,
  enfermedad_infecciosa TEXT,
  diabetes TEXT,
  diabetes_resultado TEXT,
  alteraciones_renales TEXT,
  cancer TEXT,
  sangrado_excesivo TEXT,
  embarazada TEXT,
  embarazada_meses TEXT,
  epilepsia TEXT,
  medicamentos_anticoagulantes TEXT,
  aspirinas TEXT,
  aspirinas_frec TEXT,
  notas_antecedentes TEXT,
  firma_antecedentes TEXT,
  
  -- Historia Clínica Dental
  ultima_visita_dentista TEXT,
  dolor_dental TEXT,
  dolor_frec TEXT,
  anestesia TEXT,
  reaccion_alergica_anestesia TEXT,
  complicacion_visita_dental TEXT,
  impedimento_anestesia TEXT,
  otra_enfermedad TEXT,
  
  -- URLs de firma y foto en Supabase Storage
  firma_paciente_url TEXT,
  foto_paciente_url TEXT
);

-- Crear tabla de contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  historia_clinica_id UUID REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  
  colaborador_nombre TEXT NOT NULL,
  fecha_autorizacion TEXT,
  paciente_edad TEXT,
  celular_paciente TEXT,
  telefono_contacto TEXT,
  empresa TEXT,
  numero_nomina TEXT,
  antiguedad TEXT,
  area TEXT,
  departamento TEXT,
  diagnostico TEXT,
  tratamiento TEXT,
  costo_total TEXT,
  pago_semanal TEXT,
  numero_semanas TEXT,
  pago_efectivo BOOLEAN DEFAULT false,
  persona_designada TEXT,
  autoriza_deducciones BOOLEAN DEFAULT false,
  acepta_no_cancelacion BOOLEAN DEFAULT false,
  penalizacion_monto TEXT,
  firma_paciente TEXT,
  fecha_firma TEXT,
  ciudad_firma TEXT
);

-- Crear tabla de consentimientos
CREATE TABLE IF NOT EXISTS consentimientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  historia_clinica_id UUID REFERENCES historias_clinicas(id) ON DELETE CASCADE,
  
  nombre_paciente TEXT NOT NULL,
  representante_tutor TEXT,
  doctor_asignado TEXT,
  procedimiento TEXT,
  firma_paciente TEXT,
  nombre_paciente_firma TEXT,
  fecha_autorizacion TEXT,
  ciudad_autorizacion TEXT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_nombre ON historias_clinicas(nombre);
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_email ON historias_clinicas(email);
CREATE INDEX IF NOT EXISTS idx_contratos_historia_id ON contratos(historia_clinica_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_historia_id ON consentimientos(historia_clinica_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE historias_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consentimientos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (permitir todo por ahora, puedes ajustarlas después)
CREATE POLICY "Permitir todo en historias_clinicas" ON historias_clinicas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en contratos" ON contratos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en consentimientos" ON consentimientos FOR ALL USING (true) WITH CHECK (true);

-- Crear bucket de storage para fotos y firmas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pacientes', 'pacientes', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para permitir subir archivos
CREATE POLICY "Permitir subir archivos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pacientes');
CREATE POLICY "Permitir ver archivos" ON storage.objects FOR SELECT USING (bucket_id = 'pacientes');
