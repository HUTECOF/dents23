// ============================================
// HELPERS COMPLETOS PARA CRM DENT'S 23
// Todas las operaciones CRUD para el sistema
// ============================================

import { supabase } from './supabase'

// ============================================
// TIPOS
// ============================================

export interface Paciente {
  id: string
  historia_clinica_id?: string
  nombre_completo: string
  telefono?: string
  email?: string
  fecha_nacimiento?: string
  edad?: number
  sexo?: string
  direccion?: string
  empresa?: string
  ocupacion?: string
  antiguedad?: string
  ingreso_mensual?: number
  estado: 'activo' | 'inactivo' | 'en_tratamiento' | 'recuperacion'
  prioridad: 'alta' | 'media' | 'baja'
  alergias?: string[]
  enfermedades_cronicas?: string[]
  medicamentos_actuales?: string[]
  notas?: string
  created_at?: string
  updated_at?: string
}

export interface Cita {
  id: string
  paciente_id: string
  fecha_cita: string
  duracion_minutos?: number
  tipo_cita: string
  doctor: string
  consultorio?: string
  estado: 'programada' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada' | 'no_asistio'
  motivo_cancelacion?: string
  motivo_consulta?: string
  diagnostico?: string
  tratamiento_realizado?: string
  proxima_cita?: string
  notas?: string
  created_at?: string
}

export interface Seguimiento {
  id: string
  paciente_id: string
  tipo: string
  titulo: string
  descripcion?: string
  fecha_seguimiento: string
  completado: boolean
  fecha_completado?: string
  prioridad: 'alta' | 'media' | 'baja'
  asignado_a?: string
  resultado?: string
  notas?: string
  created_at?: string
}

export interface PlanPago {
  id: string
  paciente_id: string
  concepto: string
  monto_total: number
  numero_cuotas: number
  monto_cuota: number
  fecha_inicio: string
  fecha_primer_pago: string
  periodicidad: 'semanal' | 'quincenal' | 'mensual'
  estado: 'activo' | 'completado' | 'cancelado' | 'vencido'
  descuento_aplicado?: number
  interes_aplicado?: number
  notas?: string
  created_at?: string
}

export interface Pago {
  id: string
  paciente_id: string
  plan_pago_id?: string
  concepto: string
  monto: number
  numero_cuota?: number
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado'
  fecha_vencimiento?: string
  fecha_pago?: string
  metodo_pago?: string
  referencia?: string
  recargo?: number
  descuento?: number
  notas?: string
  created_at?: string
}

// ============================================
// PACIENTES
// ============================================

export const pacientesHelpers = {
  // Obtener todos los pacientes
  async getAll(filtros?: { estado?: string; busqueda?: string }) {
    let query = supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado)
    }

    if (filtros?.busqueda) {
      query = query.or(`nombre_completo.ilike.%${filtros.busqueda}%,email.ilike.%${filtros.busqueda}%,telefono.ilike.%${filtros.busqueda}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Paciente[]
  },

  // Obtener un paciente por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Paciente
  },

  // Crear paciente
  async create(paciente: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pacientes')
      .insert([paciente])
      .select()
      .single()

    if (error) throw error
    return data as Paciente
  },

  // Actualizar paciente
  async update(id: string, paciente: Partial<Paciente>) {
    const { data, error } = await supabase
      .from('pacientes')
      .update(paciente)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Paciente
  },

  // Eliminar paciente
  async delete(id: string) {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Convertir prospecto a paciente
  async convertirProspecto(historiaClinicaId: string) {
    const { data, error } = await supabase
      .rpc('convertir_prospecto_a_paciente', { historia_id: historiaClinicaId })

    if (error) throw error
    return data
  },

  // Obtener estadísticas de pacientes
  async getEstadisticas() {
    const { data, error } = await supabase
      .from('pacientes')
      .select('estado')

    if (error) throw error

    const stats = {
      total: data.length,
      activos: data.filter(p => p.estado === 'activo').length,
      en_tratamiento: data.filter(p => p.estado === 'en_tratamiento').length,
      recuperacion: data.filter(p => p.estado === 'recuperacion').length,
      inactivos: data.filter(p => p.estado === 'inactivo').length,
    }

    return stats
  }
}

// ============================================
// CITAS
// ============================================

export const citasHelpers = {
  // Obtener todas las citas
  async getAll(filtros?: { estado?: string; fecha_desde?: string; fecha_hasta?: string; paciente_id?: string }) {
    let query = supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes(nombre_completo, telefono, email)
      `)
      .order('fecha_cita', { ascending: true })

    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado)
    }

    if (filtros?.fecha_desde) {
      query = query.gte('fecha_cita', filtros.fecha_desde)
    }

    if (filtros?.fecha_hasta) {
      query = query.lte('fecha_cita', filtros.fecha_hasta)
    }

    if (filtros?.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Obtener citas de hoy
  async getHoy() {
    const hoy = new Date().toISOString().split('T')[0]
    return this.getAll({ fecha_desde: hoy, fecha_hasta: hoy })
  },

  // Obtener citas de la semana
  async getSemana() {
    const hoy = new Date()
    const finSemana = new Date(hoy)
    finSemana.setDate(hoy.getDate() + 7)

    return this.getAll({
      fecha_desde: hoy.toISOString().split('T')[0],
      fecha_hasta: finSemana.toISOString().split('T')[0]
    })
  },

  // Crear cita
  async create(cita: Omit<Cita, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('citas')
      .insert([cita])
      .select()
      .single()

    if (error) throw error
    return data as Cita
  },

  // Actualizar cita
  async update(id: string, cita: Partial<Cita>) {
    const { data, error } = await supabase
      .from('citas')
      .update(cita)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Cita
  },

  // Cancelar cita
  async cancelar(id: string, motivo: string) {
    return this.update(id, {
      estado: 'cancelada',
      motivo_cancelacion: motivo
    })
  },

  // Completar cita
  async completar(id: string, datos: { diagnostico?: string; tratamiento_realizado?: string; notas?: string }) {
    return this.update(id, {
      estado: 'completada',
      ...datos
    })
  },

  // Eliminar cita
  async delete(id: string) {
    const { error } = await supabase
      .from('citas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ============================================
// SEGUIMIENTOS
// ============================================

export const seguimientosHelpers = {
  // Obtener todos los seguimientos
  async getAll(filtros?: { completado?: boolean; prioridad?: string; paciente_id?: string }) {
    let query = supabase
      .from('seguimientos')
      .select(`
        *,
        paciente:pacientes(nombre_completo, telefono, email)
      `)
      .order('fecha_seguimiento', { ascending: true })

    if (filtros?.completado !== undefined) {
      query = query.eq('completado', filtros.completado)
    }

    if (filtros?.prioridad && filtros.prioridad !== 'todos') {
      query = query.eq('prioridad', filtros.prioridad)
    }

    if (filtros?.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Obtener seguimientos pendientes
  async getPendientes() {
    return this.getAll({ completado: false })
  },

  // Crear seguimiento
  async create(seguimiento: Omit<Seguimiento, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('seguimientos')
      .insert([seguimiento])
      .select()
      .single()

    if (error) throw error
    return data as Seguimiento
  },

  // Actualizar seguimiento
  async update(id: string, seguimiento: Partial<Seguimiento>) {
    const { data, error } = await supabase
      .from('seguimientos')
      .update(seguimiento)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Seguimiento
  },

  // Marcar como completado
  async completar(id: string, resultado?: string) {
    return this.update(id, {
      completado: true,
      fecha_completado: new Date().toISOString(),
      resultado
    })
  },

  // Eliminar seguimiento
  async delete(id: string) {
    const { error } = await supabase
      .from('seguimientos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ============================================
// PLANES DE PAGO
// ============================================

export const planesPagoHelpers = {
  // Obtener todos los planes
  async getAll(filtros?: { estado?: string; paciente_id?: string }) {
    let query = supabase
      .from('planes_pago')
      .select(`
        *,
        paciente:pacientes(nombre_completo, telefono, email)
      `)
      .order('created_at', { ascending: false })

    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado)
    }

    if (filtros?.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Crear plan de pago
  async create(plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('planes_pago')
      .insert([plan])
      .select()
      .single()

    if (error) throw error

    // Crear los pagos automáticamente
    if (data) {
      await this.generarPagos(data.id, plan)
    }

    return data as PlanPago
  },

  // Generar pagos del plan
  async generarPagos(planId: string, plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) {
    const pagos = []
    const fechaInicio = new Date(plan.fecha_primer_pago)

    for (let i = 0; i < plan.numero_cuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio)
      
      // Calcular fecha según periodicidad
      if (plan.periodicidad === 'semanal') {
        fechaVencimiento.setDate(fechaInicio.getDate() + (i * 7))
      } else if (plan.periodicidad === 'quincenal') {
        fechaVencimiento.setDate(fechaInicio.getDate() + (i * 15))
      } else { // mensual
        fechaVencimiento.setMonth(fechaInicio.getMonth() + i)
      }

      pagos.push({
        paciente_id: plan.paciente_id,
        plan_pago_id: planId,
        concepto: `${plan.concepto} - Cuota ${i + 1}/${plan.numero_cuotas}`,
        monto: plan.monto_cuota,
        numero_cuota: i + 1,
        estado: 'pendiente',
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0]
      })
    }

    const { error } = await supabase
      .from('pagos')
      .insert(pagos)

    if (error) throw error
  },

  // Actualizar plan
  async update(id: string, plan: Partial<PlanPago>) {
    const { data, error } = await supabase
      .from('planes_pago')
      .update(plan)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as PlanPago
  },

  // Cancelar plan
  async cancelar(id: string) {
    // Actualizar plan
    await this.update(id, { estado: 'cancelado' })

    // Cancelar pagos pendientes
    const { error } = await supabase
      .from('pagos')
      .update({ estado: 'cancelado' })
      .eq('plan_pago_id', id)
      .eq('estado', 'pendiente')

    if (error) throw error
  }
}

// ============================================
// PAGOS
// ============================================

export const pagosHelpers = {
  // Obtener todos los pagos
  async getAll(filtros?: { estado?: string; paciente_id?: string; plan_pago_id?: string }) {
    let query = supabase
      .from('pagos')
      .select(`
        *,
        paciente:pacientes(nombre_completo, telefono, email),
        plan_pago:planes_pago(concepto, numero_cuotas)
      `)
      .order('fecha_vencimiento', { ascending: true })

    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado)
    }

    if (filtros?.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id)
    }

    if (filtros?.plan_pago_id) {
      query = query.eq('plan_pago_id', filtros.plan_pago_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Obtener pagos pendientes
  async getPendientes() {
    return this.getAll({ estado: 'pendiente' })
  },

  // Obtener pagos vencidos
  async getVencidos() {
    const hoy = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        paciente:pacientes(nombre_completo, telefono, email)
      `)
      .eq('estado', 'pendiente')
      .lt('fecha_vencimiento', hoy)

    if (error) throw error
    return data
  },

  // Crear pago
  async create(pago: Omit<Pago, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([pago])
      .select()
      .single()

    if (error) throw error
    return data as Pago
  },

  // Registrar pago
  async registrarPago(id: string, datos: { metodo_pago: string; referencia?: string; monto?: number }) {
    const { data, error } = await supabase
      .from('pagos')
      .update({
        estado: 'pagado',
        fecha_pago: new Date().toISOString(),
        metodo_pago: datos.metodo_pago,
        referencia: datos.referencia,
        monto: datos.monto
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Verificar si el plan está completado
    if (data.plan_pago_id) {
      await this.verificarPlanCompletado(data.plan_pago_id)
    }

    return data as Pago
  },

  // Verificar si un plan está completado
  async verificarPlanCompletado(planId: string) {
    const { data, error } = await supabase
      .from('pagos')
      .select('estado')
      .eq('plan_pago_id', planId)

    if (error) throw error

    const todosPagados = data.every(p => p.estado === 'pagado')
    
    if (todosPagados) {
      await planesPagoHelpers.update(planId, { estado: 'completado' })
    }
  },

  // Actualizar pago
  async update(id: string, pago: Partial<Pago>) {
    const { data, error } = await supabase
      .from('pagos')
      .update(pago)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Pago
  },

  // Eliminar pago
  async delete(id: string) {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obtener estadísticas de pagos
  async getEstadisticas() {
    const { data, error } = await supabase
      .from('pagos')
      .select('estado, monto, fecha_pago')

    if (error) throw error

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const stats = {
      pendientes: data.filter(p => p.estado === 'pendiente').length,
      monto_pendiente: data
        .filter(p => p.estado === 'pendiente')
        .reduce((sum, p) => sum + Number(p.monto), 0),
      pagados_mes: data.filter(p => 
        p.estado === 'pagado' && 
        p.fecha_pago && 
        new Date(p.fecha_pago) >= inicioMes
      ).length,
      ingresos_mes: data
        .filter(p => 
          p.estado === 'pagado' && 
          p.fecha_pago && 
          new Date(p.fecha_pago) >= inicioMes
        )
        .reduce((sum, p) => sum + Number(p.monto), 0)
    }

    return stats
  }
}

// ============================================
// DASHBOARD
// ============================================

export const dashboardHelpers = {
  // Obtener estadísticas completas
  async getEstadisticas() {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats')

    if (error) {
      // Si la función no existe, calcular manualmente
      const [pacientes, pagos, citas, seguimientos] = await Promise.all([
        pacientesHelpers.getEstadisticas(),
        pagosHelpers.getEstadisticas(),
        citasHelpers.getHoy(),
        seguimientosHelpers.getPendientes()
      ])

      return {
        total_pacientes: pacientes.activos,
        total_prospectos: 0, // Calcular desde historias_clinicas
        citas_hoy: citas.length,
        pagos_pendientes: pagos.pendientes,
        monto_pendiente: pagos.monto_pendiente,
        ingresos_mes: pagos.ingresos_mes,
        seguimientos_pendientes: seguimientos.length
      }
    }

    return data
  }
}
