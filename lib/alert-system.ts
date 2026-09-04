/**
 * Sistema de Alertas para el CRM
 * Gestiona las alertas médicas importantes que deben ser visibles en el CRM
 */

export interface MedicalAlert {
  id: string
  type: 'alergias' | 'medicamentos' | 'enfermedades' | 'condiciones_especiales'
  severity: 'alta' | 'media' | 'baja'
  message: string
  details?: string
  timestamp: string
}

export class AlertSystem {
  private alerts: MedicalAlert[] = []

  /**
   * Agrega una alerta al sistema
   */
  addAlert(
    type: MedicalAlert['type'],
    severity: MedicalAlert['severity'],
    message: string,
    details?: string
  ): void {
    const alert: MedicalAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      details,
      timestamp: new Date().toISOString()
    }
    
    this.alerts.push(alert)
    console.warn(`🚨 ALERTA MÉDICA [${severity.toUpperCase()}]:`, message, details || '')
  }

  /**
   * Obtiene todas las alertas
   */
  getAlerts(): MedicalAlert[] {
    return this.alerts
  }

  /**
   * Obtiene alertas por severidad
   */
  getAlertsBySeverity(severity: MedicalAlert['severity']): MedicalAlert[] {
    return this.alerts.filter(alert => alert.severity === severity)
  }

  /**
   * Limpia todas las alertas
   */
  clearAlerts(): void {
    this.alerts = []
  }

  /**
   * Verifica si hay alertas de alta prioridad
   */
  hasHighPriorityAlerts(): boolean {
    return this.alerts.some(alert => alert.severity === 'alta')
  }

  /**
   * Obtiene el conteo de alertas por tipo
   */
  getAlertCount(): { total: number; alta: number; media: number; baja: number } {
    return {
      total: this.alerts.length,
      alta: this.alerts.filter(a => a.severity === 'alta').length,
      media: this.alerts.filter(a => a.severity === 'media').length,
      baja: this.alerts.filter(a => a.severity === 'baja').length
    }
  }
}

// Instancia global del sistema de alertas
export const alertSystem = new AlertSystem()
