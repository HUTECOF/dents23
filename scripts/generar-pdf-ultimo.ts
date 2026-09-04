import { getUltimoExpediente } from '../lib/supabase-helpers'
import { generatePatientPDF } from '../lib/pdf-generator'

async function generarPDFUltimoExpediente() {
  console.log('🔍 Buscando el último expediente en Supabase...')
  
  const expediente = await getUltimoExpediente()
  
  if (!expediente) {
    console.error('❌ No se encontró ningún expediente')
    return
  }
  
  console.log('✅ Expediente encontrado:')
  console.log(`   Paciente: ${expediente.historiaClinica?.nombre || 'N/A'}`)
  console.log(`   Empresa: ${expediente.historiaClinica?.empresa || 'N/A'}`)
  console.log(`   Fecha: ${expediente.historiaClinica?.fecha || 'N/A'}`)
  
  console.log('\n📄 Generando PDF...')
  
  generatePatientPDF(expediente)
  
  console.log('✅ PDF generado exitosamente!')
}

// Ejecutar
generarPDFUltimoExpediente()
