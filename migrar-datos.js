// ============================================
// SCRIPT DE MIGRACIÓN: BASE VIEJA → BASE NUEVA
// ============================================

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// BASE VIEJA (origen - donde están los datos)
const ORIGEN_URL = process.env.ORIGEN_SUPABASE_URL
const ORIGEN_KEY = process.env.ORIGEN_SUPABASE_KEY

// BASE NUEVA (destino - ya configurada en el proyecto)
const DESTINO_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const DESTINO_KEY = process.env.SUPABASE_SERVICE_KEY

const supabaseOrigen = createClient(ORIGEN_URL, ORIGEN_KEY)
const supabaseDestino = createClient(DESTINO_URL, DESTINO_KEY)

const TABLAS = [
  'historias_clinicas',
  'pacientes', 
  'citas',
  'seguimientos',
  'tratamientos',
  'planes_pago',
  'pagos',
  'documentos',
  'contratos',
  'consentimientos'
]

async function migrarTabla(nombreTabla) {
  console.log(`\n📥 Leyendo ${nombreTabla} desde ORIGEN...`)
  
  const { data: registros, error: errorLectura } = await supabaseOrigen
    .from(nombreTabla)
    .select('*')
    .limit(10000)
  
  if (errorLectura) {
    console.error(`❌ Error leyendo ${nombreTabla}:`, errorLectura.message)
    return { tabla: nombreTabla, exito: false, error: errorLectura.message, count: 0 }
  }
  
  if (!registros || registros.length === 0) {
    console.log(`⚪ ${nombreTabla}: sin datos`)
    return { tabla: nombreTabla, exito: true, count: 0 }
  }
  
  console.log(`✅ ${nombreTabla}: ${registros.length} registros encontrados`)
  console.log(`📤 Insertando en DESTINO...`)
  
  // Insertar en lotes de 100 para evitar timeouts
  const BATCH_SIZE = 100
  let insertados = 0
  let errores = []
  
  for (let i = 0; i < registros.length; i += BATCH_SIZE) {
    const lote = registros.slice(i, i + BATCH_SIZE)
    
    const { error: errorInsercion } = await supabaseDestino
      .from(nombreTabla)
      .insert(lote)
    
    if (errorInsercion) {
      console.error(`❌ Error en lote ${i}-${i+BATCH_SIZE}:`, errorInsercion.message)
      errores.push({ lote: i, error: errorInsercion.message })
    } else {
      insertados += lote.length
      process.stdout.write(`  ${insertados}/${registros.length}...\r`)
    }
  }
  
  console.log(`\n✅ ${nombreTabla}: ${insertados}/${registros.length} registros migrados`)
  
  return {
    tabla: nombreTabla,
    exito: errores.length === 0,
    count: insertados,
    errores: errores.length > 0 ? errores : null
  }
}

async function main() {
  console.log('🚀 INICIANDO MIGRACIÓN DE BASE DE DATOS\n')
  console.log(`Origen:  ${ORIGEN_URL}`)
  console.log(`Destino: ${DESTINO_URL}\n`)
  
  const resultados = []
  
  for (const tabla of TABLAS) {
    const resultado = await migrarTabla(tabla)
    resultados.push(resultado)
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE MIGRACIÓN')
  console.log('='.repeat(50))
  
  let totalOrigen = 0
  let totalDestino = 0
  
  resultados.forEach(r => {
    const status = r.exito ? '✅' : '❌'
    console.log(`${status} ${r.tabla.padEnd(25)} ${String(r.count).padStart(5)} registros`)
    totalOrigen += r.count
    if (r.exito) totalDestino += r.count
  })
  
  console.log('='.repeat(50))
  console.log(`Total registros migrados: ${totalDestino}`)
  
  const conErrores = resultados.filter(r => !r.exito && r.errores)
  if (conErrores.length > 0) {
    console.log('\n⚠️ Tablas con errores:')
    conErrores.forEach(r => {
      console.log(`  - ${r.tabla}: ${r.errores.length} lotes fallidos`)
    })
  }
  
  console.log('\n🎉 Migración completada!')
}

main().catch(err => {
  console.error('💥 Error fatal:', err)
  process.exit(1)
})
