import { supabase } from './supabase'

// Función para subir imagen a Supabase Storage
export async function uploadImage(file: string, fileName: string, folder: 'firmas' | 'fotos'): Promise<string | null> {
  try {
    // Convertir base64 a blob
    const base64Data = file.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/png' })
    
    const filePath = `${folder}/${Date.now()}_${fileName}`
    
    const { data, error } = await supabase.storage
      .from('pacientes')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: false
      })
    
    if (error) {
      console.error('Error al subir imagen:', error)
      return null
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('pacientes')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
  } catch (error) {
    console.error('Error en uploadImage:', error)
    return null
  }
}

// Función para guardar historia clínica (compatible con nueva y vieja versión)
export async function saveHistoriaClinica(data: any) {
  try {
    // Subir firma y foto si existen (nuevos campos del formulario)
    let firmaUrl = null
    let fotoUrl = null
    
    if (data.firmaResponsable) {
      firmaUrl = await uploadImage(data.firmaResponsable, 'firma.png', 'firmas')
    } else if (data.firmaPaciente) {
      firmaUrl = await uploadImage(data.firmaPaciente, 'firma.png', 'firmas')
    }
    
    if (data.ineResponsable) {
      fotoUrl = await uploadImage(data.ineResponsable, 'foto.png', 'fotos')
    } else if (data.fotoPaciente) {
      fotoUrl = await uploadImage(data.fotoPaciente, 'foto.png', 'fotos')
    }
    
    // Preparar datos para insertar (compatible con ambas versiones)
    const historiaData = {
      // Datos Personales
      empresa: data.empresa || '',
      antiguedad: data.antiguedad || '',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      nombre: data.nombre || '',
      ocupacion: data.ocupacion || '',
      direccion: data.direccion || '',
      edad: data.edad || '',
      sexo: data.sexo || '',
      email: data.email || '',
      celular: data.celular || '',
      telefono: data.telefono || '',
      recomendado_por: data.recomendadoPor || data.recomendado_por || '',
      
      // Antecedentes Médicos
      alergico: data.alergias || data.alergico || 'no',
      alergico_cual: data.alergiasDetalles || data.alergicoCual || '',
      salud_buena: data.saludBuena || 'si',
      medico_ultimo_anio: data.medicamentoActual || data.medicoUltimoAnio || 'no',
      enfermedad_ultimos_6_meses: data.enfermedadUltimos6Meses || 'no',
      enfermedad_cuales: data.medicamentoActualDetalles || data.enfermedadCuales || '',
      
      // Enfermedades Sistémicas
      hipertension: data.hipertension || 'no',
      hipertension_valor: data.hipertensionDesde || data.hipertensionValor || '',
      tomando_medicamento: data.medicamentosPresion || data.tomandoMedicamento || 'no',
      medicamento_cual: data.medicamentosPresionCuales || data.medicamentoCual || '',
      diabetes: data.diabetes || 'no',
      diabetes_resultado: data.diabetesMedicamentos || data.diabetesResultado || '',
      
      // Enfermedades Infecciosas
      enfermedad_infecciosa: data.vih === 'si' || data.herpes === 'si' || data.sifilis === 'si' || data.gonorrea === 'si' ? 'si' : 'no',
      
      // Alteraciones Renales
      alteraciones_renales: data.dialisis === 'si' || data.alteracionRenal === 'si' || data.alteracionHepatica === 'si' || data.hepatitis === 'si' ? 'si' : 'no',
      
      // Problemas Sanguíneos
      cancer: data.cancer || 'no',
      sangrado_excesivo: data.hemorragiasFrecuentes || data.problemasCoagulacion || data.sangradoExcesivo || 'no',
      
      // Embarazo
      embarazada: data.embarazada || 'no',
      embarazada_meses: data.semanasGestacion || data.embarazadaMeses || '',
      
      // Otros
      epilepsia: data.epilepsia || 'no',
      medicamentos_anticoagulantes: data.aspirinasAnticoagulantes || data.medicamentosAnticoagulantes || 'no',
      aspirinas: data.aspirinas || 'no',
      aspirinas_frec: data.aspirinasFrec || '',
      notas_antecedentes: data.notasAntecedentes || '',
      firma_antecedentes: data.firmaAntecedentes || '',
      
      // Historia Clínica Dental
      ultima_visita_dentista: data.ultimaVisitaDentista || '',
      dolor_dental: data.dolorDental || 'no',
      dolor_frec: data.dolorFrec || '',
      anestesia: data.anestesiaBoca || data.anestesia || 'no',
      reaccion_alergica_anestesia: data.complicacionAnestesia || data.reaccionAlergicaAnestesia || 'no',
      complicacion_visita_dental: data.complicacionVisitaDental || 'no',
      impedimento_anestesia: data.impedimentoAnestesia || 'no',
      otra_enfermedad: data.otraCondicionMedica || data.otraEnfermedad || 'no',
      
      // Firma y Foto
      firma_paciente_url: firmaUrl,
      foto_paciente_url: fotoUrl,
      
      // Tipo de Paciente
      tipo_paciente: data.tipoPaciente || '',

      // Datos completos en JSON para acceso a todas las fases (3-5)
      datos_completos: data
    }
    
    const { data: insertedData, error } = await supabase
      .from('historias_clinicas')
      .insert([historiaData])
      .select()
      .single()
    
    if (error) {
      console.error('Error al guardar historia clínica:', error)
      return null
    }
    
    return insertedData
  } catch (error) {
    console.error('Error en saveHistoriaClinica:', error)
    return null
  }
}

// Función para guardar contrato
export async function saveContrato(data: any, historiaClinicaId: string) {
  try {
    const contratoData = {
      historia_clinica_id: historiaClinicaId,
      colaborador_nombre: data.colaboradorNombre,
      fecha_autorizacion: data.fechaAutorizacion,
      paciente_edad: data.pacienteEdad,
      celular_paciente: data.celularPaciente,
      telefono_contacto: data.telefonoContacto,
      empresa: data.empresa,
      numero_nomina: data.numeroNomina,
      antiguedad: data.antiguedad,
      area: data.area,
      departamento: data.departamento,
      diagnostico: data.diagnostico,
      tratamiento: data.tratamiento,
      costo_total: data.costoTotal,
      pago_semanal: data.pagoSemanal,
      numero_semanas: data.numeroSemanas,
      pago_efectivo: data.pagoEfectivo,
      persona_designada: data.personaDesignada,
      autoriza_deducciones: data.autorizaDeducciones,
      acepta_no_cancelacion: data.aceptaNoCancelacion,
      penalizacion_monto: data.penalizacionMonto,
      firma_paciente: data.firmaPaciente,
      fecha_firma: data.fechaFirma,
      ciudad_firma: data.ciudadFirma
    }
    
    const { data: insertedData, error } = await supabase
      .from('contratos')
      .insert([contratoData])
      .select()
      .single()
    
    if (error) {
      console.error('Error al guardar contrato:', error)
      return null
    }
    
    return insertedData
  } catch (error) {
    console.error('Error en saveContrato:', error)
    return null
  }
}

// Función para guardar consentimiento
export async function saveConsentimiento(data: any, historiaClinicaId: string) {
  try {
    const consentimientoData = {
      historia_clinica_id: historiaClinicaId,
      nombre_paciente: data.nombrePaciente,
      representante_tutor: data.representanteTutor,
      doctor_asignado: data.doctorAsignado,
      procedimiento: data.procedimiento,
      firma_paciente: data.firmaPaciente,
      nombre_paciente_firma: data.nombrePacienteFirma,
      fecha_autorizacion: data.fechaAutorizacion,
      ciudad_autorizacion: data.ciudadAutorizacion
    }
    
    const { data: insertedData, error } = await supabase
      .from('consentimientos')
      .insert([consentimientoData])
      .select()
      .single()
    
    if (error) {
      console.error('Error al guardar consentimiento:', error)
      return null
    }
    
    return insertedData
  } catch (error) {
    console.error('Error en saveConsentimiento:', error)
    return null
  }
}

// Función para obtener todos los pacientes
export async function getAllPacientes() {
  try {
    const { data, error } = await supabase
      .from('historias_clinicas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error al obtener pacientes:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error en getAllPacientes:', error)
    return []
  }
}

// Función para obtener expediente completo de un paciente
export async function getExpedienteCompleto(historiaClinicaId: string) {
  try {
    const { data: historia, error: historiaError } = await supabase
      .from('historias_clinicas')
      .select('*')
      .eq('id', historiaClinicaId)
      .single()
    
    if (historiaError) {
      console.error('Error al obtener historia:', historiaError)
      return null
    }
    
    const { data: contrato } = await supabase
      .from('contratos')
      .select('*')
      .eq('historia_clinica_id', historiaClinicaId)
      .single()
    
    const { data: consentimiento } = await supabase
      .from('consentimientos')
      .select('*')
      .eq('historia_clinica_id', historiaClinicaId)
      .single()
    
    return {
      historiaClinica: historia,
      contrato,
      consentimiento
    }
  } catch (error) {
    console.error('Error en getExpedienteCompleto:', error)
    return null
  }
}

// Función para obtener el último expediente creado
export async function getUltimoExpediente() {
  try {
    const { data: historia, error: historiaError } = await supabase
      .from('historias_clinicas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (historiaError) {
      console.error('Error al obtener última historia:', historiaError)
      return null
    }
    
    if (!historia) {
      console.log('No se encontró ningún expediente')
      return null
    }
    
    // Obtener contrato y consentimiento asociados
    const { data: contrato } = await supabase
      .from('contratos')
      .select('*')
      .eq('historia_clinica_id', historia.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const { data: consentimiento } = await supabase
      .from('consentimientos')
      .select('*')
      .eq('historia_clinica_id', historia.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    return {
      historiaClinica: historia,
      contrato,
      consentimiento
    }
  } catch (error) {
    console.error('Error en getUltimoExpediente:', error)
    return null
  }
}
