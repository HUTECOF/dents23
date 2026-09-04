import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas
export interface HistoriaClinica {
  id?: string
  created_at?: string
  // Datos Personales
  empresa: string
  antiguedad: string
  fecha: string
  nombre: string
  ocupacion: string
  direccion: string
  edad: string
  sexo: string
  email: string
  celular: string
  telefono: string
  recomendado_por: string
  
  // Antecedentes Personales
  alergico: string
  alergico_cual: string
  salud_buena: string
  medico_ultimo_anio: string
  enfermedad_ultimos_6_meses: string
  enfermedad_cuales: string
  hipertension: string
  hipertension_valor: string
  tomando_medicamento: string
  medicamento_cual: string
  enfermedad_infecciosa: string
  diabetes: string
  diabetes_resultado: string
  alteraciones_renales: string
  cancer: string
  sangrado_excesivo: string
  embarazada: string
  embarazada_meses: string
  epilepsia: string
  medicamentos_anticoagulantes: string
  aspirinas: string
  aspirinas_frec: string
  notas_antecedentes: string
  firma_antecedentes: string
  
  // Historia Clínica Dental
  ultima_visita_dentista: string
  dolor_dental: string
  dolor_frec: string
  anestesia: string
  reaccion_alergica_anestesia: string
  complicacion_visita_dental: string
  impedimento_anestesia: string
  otra_enfermedad: string
  
  // Firma y Foto
  firma_paciente_url: string
  foto_paciente_url: string
  
  // Tipo de Paciente
  tipo_paciente: string

  // Datos completos de la historia clínica (Fases 3-5)
  datos_completos?: any
}

export interface Contrato {
  id?: string
  created_at?: string
  historia_clinica_id: string
  colaborador_nombre: string
  fecha_autorizacion: string
  paciente_edad: string
  celular_paciente: string
  telefono_contacto: string
  empresa: string
  numero_nomina: string
  antiguedad: string
  area: string
  departamento: string
  diagnostico: string
  tratamiento: string
  costo_total: string
  pago_semanal: string
  numero_semanas: string
  pago_efectivo: boolean
  persona_designada: string
  autoriza_deducciones: boolean
  acepta_no_cancelacion: boolean
  penalizacion_monto: string
  firma_paciente: string
  fecha_firma: string
  ciudad_firma: string
}

export interface Consentimiento {
  id?: string
  created_at?: string
  historia_clinica_id: string
  nombre_paciente: string
  representante_tutor: string
  doctor_asignado: string
  procedimiento: string
  firma_paciente: string
  nombre_paciente_firma: string
  fecha_autorizacion: string
  ciudad_autorizacion: string
}
