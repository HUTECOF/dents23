import { supabase } from './supabase'

export interface AuthenticatedDoctor {
  id: string
  nombre: string
  slug: string
  email: string
}

export async function getAuthenticatedDoctor(): Promise<AuthenticatedDoctor | null> {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData.session?.user
  if (!user) return null

  const { data: doctor, error } = await supabase
    .from('crm_medicos')
    .select('id, nombre, slug, email')
    .eq('id', user.id)
    .eq('activo', true)
    .single()

  if (error || !doctor) return null
  return doctor as AuthenticatedDoctor
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAuthenticatedDoctor())
}

export async function getAuthenticatedUser(): Promise<string | null> {
  return (await getAuthenticatedDoctor())?.nombre || null
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function checkAuthAndRedirect(router: { push: (path: string) => void }): Promise<boolean> {
  if (!(await isAuthenticated())) {
    router.push('/crm/login')
    return false
  }
  return true
}
