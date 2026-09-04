// ============================================
// SCRIPT PARA EXPORTAR TODA LA BASE DE DATOS
// Ejecutar: node exportar-base-datos.js
// ============================================

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

// Configuración - NUEVA BASE DE DATOS
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const TABLAS = [
  'historias_clinicas',
  'pacientes',
  'citas',
  'seguimientos',
  'planes_pago',
  'pagos',
  'tratamientos',
  'documentos',
  'contratos',
  'consentimientos'
]

async function exportarTabla(nombreTabla) {
  console.log(`📥 Exportando ${nombreTabla}...`)
  
  const { data, error } = await supabase
    .from(nombreTabla)
    .select('*')
    .limit(10000) // Ajusta si tienes más datos
  
  if (error) {
    console.error(`❌ Error en ${nombreTabla}:`, error.message)
    return null
  }
  
  console.log(`✅ ${nombreTabla}: ${data?.length || 0} registros`)
  return data || []
}

function generarSQLInsert(tabla, datos) {
  if (!datos || datos.length === 0) return ''
  
  const columnas = Object.keys(datos[0]).filter(col => col !== 'id' && !col.startsWith('_'))
  
  const valores = datos.map(row => {
    const vals = columnas.map(col => {
      const val = row[col]
      if (val === null || val === undefined) return 'NULL'
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
      if (Array.isArray(val)) return `'${JSON.stringify(val).replace(/'/g, "''")}'`
      if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`
      return val
    })
    return `(${vals.join(', ')})`
  })
  
  return `
-- Datos de ${tabla}
INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES
${valores.join(',\n')};
`
}

async function main() {
  console.log('🚀 Iniciando exportación de base de datos...\n')
  
  const exportacion = {
    fecha: new Date().toISOString(),
    url: SUPABASE_URL,
    tablas: {}
  }
  
  let sqlCompleto = `-- ============================================
-- EXPORTACIÓN COMPLETA DE BASE DE DATOS
-- Fecha: ${new Date().toISOString()}
-- Origen: ${SUPABASE_URL}
-- ============================================\n\n`

  for (const tabla of TABLAS) {
    const datos = await exportarTabla(tabla)
    if (datos) {
      exportacion.tablas[tabla] = datos
      sqlCompleto += generarSQLInsert(tabla, datos)
      sqlCompleto += '\n'
    }
  }
  
  // Guardar JSON completo
  fs.writeFileSync('exportacion-completa.json', JSON.stringify(exportacion, null, 2))
  console.log('\n💾 JSON guardado: exportacion-completa.json')
  
  // Guardar SQL
  fs.writeFileSync('exportacion-datos.sql', sqlCompleto)
  console.log('💾 SQL guardado: exportacion-datos.sql')
  
  console.log('\n✅ Exportación completada!')
  console.log('\n📊 Resumen:')
  Object.entries(exportacion.tablas).forEach(([tabla, datos]) => {
    console.log(`   ${tabla}: ${datos.length} registros`)
  })
}

main().catch(console.error)
