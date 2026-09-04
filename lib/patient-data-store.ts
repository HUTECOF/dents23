// Store global para los datos del paciente
interface PatientData {
  historiaClinica: any
  contrato: any
  consentimiento: any
  historiaClinicaId: string | null
}

class PatientDataStore {
  private data: PatientData = {
    historiaClinica: null,
    contrato: null,
    consentimiento: null,
    historiaClinicaId: null
  }

  setHistoriaClinica(data: any, id?: string) {
    this.data.historiaClinica = data
    if (id) {
      this.data.historiaClinicaId = id
      if (typeof window !== 'undefined') {
        localStorage.setItem('historiaClinicaId', id)
      }
    }
    // NO guardar en localStorage si hay imágenes grandes (firma/foto)
    // Solo guardar en memoria para evitar QuotaExceededError
    if (typeof window !== 'undefined') {
      try {
        // Crear copia sin imágenes para localStorage
        const dataWithoutImages = { ...data }
        delete dataWithoutImages.firmaPaciente
        delete dataWithoutImages.fotoPaciente
        localStorage.setItem('historiaClinica', JSON.stringify(dataWithoutImages))
      } catch (e) {
        console.warn('No se pudo guardar en localStorage, continuando solo en memoria')
      }
    }
  }

  setContrato(data: any) {
    this.data.contrato = data
    if (typeof window !== 'undefined') {
      localStorage.setItem('contrato', JSON.stringify(data))
    }
  }

  setConsentimiento(data: any) {
    this.data.consentimiento = data
    if (typeof window !== 'undefined') {
      localStorage.setItem('consentimiento', JSON.stringify(data))
    }
  }

  getHistoriaClinica() {
    if (typeof window !== 'undefined' && !this.data.historiaClinica) {
      const stored = localStorage.getItem('historiaClinica')
      if (stored) this.data.historiaClinica = JSON.parse(stored)
    }
    return this.data.historiaClinica
  }

  getContrato() {
    if (typeof window !== 'undefined' && !this.data.contrato) {
      const stored = localStorage.getItem('contrato')
      if (stored) this.data.contrato = JSON.parse(stored)
    }
    return this.data.contrato
  }

  getConsentimiento() {
    if (typeof window !== 'undefined' && !this.data.consentimiento) {
      const stored = localStorage.getItem('consentimiento')
      if (stored) this.data.consentimiento = JSON.parse(stored)
    }
    return this.data.consentimiento
  }

  getAllData() {
    return {
      historiaClinica: this.getHistoriaClinica(),
      contrato: this.getContrato(),
      consentimiento: this.getConsentimiento()
    }
  }

  getHistoriaClinicaId() {
    if (typeof window !== 'undefined' && !this.data.historiaClinicaId) {
      const stored = localStorage.getItem('historiaClinicaId')
      if (stored) this.data.historiaClinicaId = stored
    }
    return this.data.historiaClinicaId
  }

  clearAll() {
    this.data = {
      historiaClinica: null,
      contrato: null,
      consentimiento: null,
      historiaClinicaId: null
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('historiaClinica')
      localStorage.removeItem('contrato')
      localStorage.removeItem('consentimiento')
      localStorage.removeItem('historiaClinicaId')
    }
  }
}

export const patientDataStore = new PatientDataStore()
