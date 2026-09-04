/**
 * Genera un folio único para el expediente del paciente
 * Formato: DENTS-YYYYMMDD-XXXX
 * Ejemplo: DENTS-20251028-0001
 */
export function generateFolio(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  // Generar número secuencial aleatorio de 4 dígitos
  const sequential = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')
  
  return `DENTS-${year}${month}${day}-${sequential}`
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getCurrentDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Formatea una fecha para mostrar en español
 */
export function formatDateSpanish(date: string): string {
  const d = new Date(date)
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}
