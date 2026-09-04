// Helpers para autenticación del CRM

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('crm_authenticated') === 'true'
}

export function getAuthenticatedUser(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('crm_user')
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('crm_authenticated')
  localStorage.removeItem('crm_user')
  localStorage.removeItem('crm_login_time')
}

export function checkAuthAndRedirect(router: any): boolean {
  if (!isAuthenticated()) {
    router.push('/crm/login')
    return false
  }
  return true
}
