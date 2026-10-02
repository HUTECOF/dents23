import { supabase } from './supabase'

export interface HistoriaClinicaExtras {
  odontogramaData?: unknown
  odontogramaFinalData?: unknown
  notasMedico?: string
  notasOdontogramaFinal?: string
  planTratamiento?: unknown
}

// Función para subir imagen a Supabase Storage
export async function uploadImage(file: string, fileName: string, folder: 'firmas' | 'fotos'): Promise<string | null> {
  try {
    if (!file.startsWith('data:')) return file

    const [metadata, base64Data] = file.split(',')
    if (!base64Data) return null

    const contentType = metadata.match(/^data:([^;]+);base64$/)?.[1] || 'image/png'
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: contentType })
    
    const filePath = `${folder}/${crypto.randomUUID()}_${fileName}`
    
    const { error } = await supabase.storage
      .from('pacientes')
      .upload(filePath, blob, {
        contentType,
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
export async function saveHistoriaClinica(data: any, extras: HistoriaClinicaExtras = {}) {
  try {
    const firmaOriginal = data.firmaResponsable || data.firmaPaciente || ''
    const fotoOriginal = data.ineResponsable || data.fotoPaciente || ''
    const firmaUrl = firmaOriginal ? await uploadImage(firmaOriginal, 'firma.png', 'firmas') : null
    const fotoUrl = fotoOriginal ? await uploadImage(fotoOriginal, 'foto.png', 'fotos') : null

    if (firmaOriginal && !firmaUrl) throw new Error('No se pudo guardar la firma en Storage')
    if (fotoOriginal && !fotoUrl) throw new Error('No se pudo guardar la identificación o fotografía en Storage')

    const odontogramaData = extras.odontogramaData ?? data.odontogramaData ?? { dientes: {} }
    const odontogramaFinalData = extras.odontogramaFinalData ?? data.odontogramaFinalData ?? { dientes: {} }
    const notasMedico = extras.notasMedico ?? data.notasMedico ?? ''
    const notasOdontogramaFinal = extras.notasOdontogramaFinal ?? data.notasOdontogramaFinal ?? ''
    const planTratamiento = extras.planTratamiento ?? data.planTratamiento ?? {}
    const odontogramas = {
      inicial: odontogramaData,
      final: odontogramaFinalData,
    }
    const historiaClinica = {
      ...data,
      firmaResponsable: data.firmaResponsable ? firmaUrl : data.firmaResponsable,
      firmaPaciente: data.firmaPaciente ? firmaUrl : data.firmaPaciente,
      ineResponsable: data.ineResponsable ? fotoUrl : data.ineResponsable,
      fotoPaciente: data.fotoPaciente ? fotoUrl : data.fotoPaciente,
    }
    const datosCompletos = {
      version: 3,
      historiaClinica,
      odontogramas,
      notasMedico,
      notasOdontogramaFinal,
      planTratamiento,
    }

    // Preparar datos para insertar (compatible con ambas versiones)
    const historiaData = {
      // Datos Personales
      empresa: data.empresa || '',
      antiguedad: data.antiguedadTrabajo || data.antiguedad || '',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      nombre: data.nombre || data.nombreCompleto || '',
      ocupacion: data.ocupacion || '',
      direccion: data.direccion || '',
      edad: data.edad || '',
      sexo: data.sexo || '',
      email: data.email || '',
      celular: data.celular || '',
      telefono: data.telefono || data.contacto || '',
      recomendado_por: data.recomendadoPor || data.recomendado_por || '',
      
      // Antecedentes Médicos
      alergico: data.alergicoMedicamento || data.alergias || data.alergico || 'no',
      alergico_cual: data.alergicoMedicamentoCual || data.alergiasDetalles || data.alergicoCual || '',
      salud_buena: data.saludBuena || 'si',
      medico_ultimo_anio: data.medicoUltimoAnio || data.medicamentoActual || 'no',
      enfermedad_ultimos_6_meses: data.enfermedadUltimos6Meses || 'no',
      enfermedad_cuales: data.medicoUltimoAnioDetalles || data.medicamentoActualDetalles || data.enfermedadCuales || '',
      
      // Enfermedades Sistémicas
      hipertension: data.hipertension || 'no',
      hipertension_valor: data.hipertensionDesde || data.hipertensionValor || '',
      tomando_medicamento: data.medicamentosPresion || data.tomaMedicamento || data.tomandoMedicamento || 'no',
      medicamento_cual: data.medicamentosPresionCuales || data.tomaMedicamentoCual || data.medicamentoCual || '',
      diabetes: data.diabetes || 'no',
      diabetes_resultado: data.nivelGlucosaResultado || data.diabetesMedicamentos || data.diabetesResultado || '',
      
      // Enfermedades Infecciosas
      enfermedad_infecciosa: data.vih === 'si' || data.herpes === 'si' || data.sifilis === 'si' || data.gonorrea === 'si' ? 'si' : 'no',
      
      // Alteraciones Renales
      alteraciones_renales: data.dialisis === 'si' || data.alteracionRenal === 'si' || data.alteracionHepatica === 'si' || data.hepatitis === 'si' ? 'si' : 'no',
      
      // Problemas Sanguíneos
      cancer: data.oncologico || data.cancerHeredofamiliar || data.cancer || 'no',
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
      dolor_dental: data.dolor || data.dolorDental || 'no',
      dolor_frec: data.frecuencia || data.dolorFrec || '',
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
      datos_completos: datosCompletos,
      odontograma: odontogramas,
      notas_medico: [notasMedico, notasOdontogramaFinal].filter(Boolean).join('\n\n'),
      plan_tratamiento: planTratamiento,
      updated_at: new Date().toISOString(),
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

export async function updateHistoriaClinicaSection(historiaClinicaId: string, section: string, data: unknown) {
  try {
    const { data: updatedData, error } = await supabase.rpc('guardar_seccion_expediente', {
      p_historia_id: historiaClinicaId,
      p_seccion: section,
      p_datos: data,
    })

    if (error) {
      console.error(`Error al guardar la sección ${section}:`, error)
      return null
    }

    return updatedData
  } catch (error) {
    console.error(`Error en updateHistoriaClinicaSection (${section}):`, error)
    return null
  }
}

// Función para guardar contrato
export async function saveContrato(data: any, historiaClinicaId: string) {
  try {
    const contratoData = {
      historia_clinica_id: historiaClinicaId,
      colaborador_nombre: data.colaboradorNombre || data.nombreColaborador || data.nombrePaciente || '',
      fecha_autorizacion: data.fechaAutorizacion || data.fecha || '',
      paciente_edad: data.pacienteEdad || data.edad || '',
      celular_paciente: data.celularPaciente || data.cel || data.telefono || '',
      telefono_contacto: data.telefonoContacto || data.telContacto || '',
      empresa: data.empresa || '',
      numero_nomina: data.numeroNomina || data.noNomina || '',
      antiguedad: data.antiguedad || '',
      area: data.area || '',
      departamento: data.departamento || data.depto || '',
      diagnostico: data.diagnostico || data.diagnosticoClinico || '',
      tratamiento: [data.tratamiento, data.tratamiento2, data.tratamiento3].filter(Boolean).join(' | ') || data.planTratamiento || '',
      costo_total: data.costoTotal || '',
      pago_semanal: data.pagoSemanal || '',
      numero_semanas: data.numeroSemanas || data.noSemanas || data.numSemanas || '',
      pago_efectivo: data.pagoEfectivo === true || data.pagoEfectivo === 'si',
      persona_designada: data.personaDesignada || '',
      autoriza_deducciones: data.autorizaDeducciones === true,
      acepta_no_cancelacion: data.aceptaNoCancelacion === true,
      penalizacion_monto: data.penalizacionMonto || '',
      firma_paciente: data.firmaPaciente || data.nombreFirma || '',
      fecha_firma: data.fechaFirma || [data.diaAutorizacion, data.mesAutorizacion, data.anioAutorizacion].filter(Boolean).join('/'),
      ciudad_firma: data.ciudadFirma || ''
    }
    
    const { data: existingContrato } = await supabase
      .from('contratos')
      .select('id')
      .eq('historia_clinica_id', historiaClinicaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const contratoQuery = existingContrato
      ? supabase.from('contratos').update(contratoData).eq('id', existingContrato.id)
      : supabase.from('contratos').insert([contratoData])
    const { data: insertedData, error } = await contratoQuery.select().single()
    
    if (error) {
      console.error('Error al guardar contrato:', error)
      return null
    }

    const completeData = await updateHistoriaClinicaSection(historiaClinicaId, 'contrato', data)
    if (!completeData) return null
    
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
    
    const { data: existingConsentimiento } = await supabase
      .from('consentimientos')
      .select('id')
      .eq('historia_clinica_id', historiaClinicaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const consentimientoQuery = existingConsentimiento
      ? supabase.from('consentimientos').update(consentimientoData).eq('id', existingConsentimiento.id)
      : supabase.from('consentimientos').insert([consentimientoData])
    const { data: insertedData, error } = await consentimientoQuery.select().single()
    
    if (error) {
      console.error('Error al guardar consentimiento:', error)
      return null
    }

    const completeData = await updateHistoriaClinicaSection(historiaClinicaId, 'consentimiento', data)
    if (!completeData) return null
    
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
