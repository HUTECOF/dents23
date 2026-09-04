import { supabase } from '../lib/supabase'

async function verificarTablas() {
  console.log('🔍 Verificando estructura de tablas en Supabase...\n')
  
  // Verificar tabla historias_clinicas
  console.log('📋 Tabla: historias_clinicas')
  const { data: historias, error: historiasError } = await supabase
    .from('historias_clinicas')
    .select('*')
    .limit(1)
  
  if (historiasError) {
    console.error('❌ Error:', historiasError.message)
  } else {
    console.log('✅ Tabla existe')
    if (historias && historias.length > 0) {
      console.log('📊 Columnas disponibles:', Object.keys(historias[0]))
    }
  }
  
  console.log('\n📋 Tabla: contratos')
  const { data: contratos, error: contratosError } = await supabase
    .from('contratos')
    .select('*')
    .limit(1)
  
  if (contratosError) {
    console.error('❌ Error:', contratosError.message)
  } else {
    console.log('✅ Tabla existe')
    if (contratos && contratos.length > 0) {
      console.log('📊 Columnas disponibles:', Object.keys(contratos[0]))
    }
  }
  
  console.log('\n📋 Tabla: consentimientos')
  const { data: consentimientos, error: consentimientosError } = await supabase
    .from('consentimientos')
    .select('*')
    .limit(1)
  
  if (consentimientosError) {
    console.error('❌ Error:', consentimientosError.message)
  } else {
    console.log('✅ Tabla existe')
    if (consentimientos && consentimientos.length > 0) {
      console.log('📊 Columnas disponibles:', Object.keys(consentimientos[0]))
    }
  }
  
  console.log('\n✅ Verificación completa!')
}

verificarTablas()
