"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { CRM_DOCTORS } from "@/lib/crm-doctors"

export default function CRMLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    doctorSlug: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const doctor = CRM_DOCTORS.find((item) => item.slug === formData.doctorSlug)
    if (!doctor) {
      setError("Seleccione una cuenta de médico")
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: doctor.email,
      password: formData.password,
    })

    if (authError || !data.user) {
      setError("Cuenta o contraseña incorrecta")
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("crm_medicos")
      .select("id")
      .eq("id", data.user.id)
      .eq("activo", true)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      setError("La cuenta no está vinculada o está desactivada")
      setLoading(false)
      return
    }

    router.push("/crm/pacientes")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2 border-teal-200">
          <CardHeader className="space-y-4 text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                CRM Dents23
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Sistema de Gestión de Pacientes
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Usuario */}
              <div className="space-y-2">
                <Label htmlFor="doctorSlug" className="text-base font-semibold text-gray-700">
                  Cuenta médica
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="doctorSlug"
                    value={formData.doctorSlug}
                    onChange={(e) => setFormData({ ...formData, doctorSlug: e.target.value })}
                    className="h-12 w-full rounded-md border-2 bg-white pl-10 pr-3 text-base focus:border-teal-500 focus:outline-none"
                    required
                    autoComplete="username"
                  >
                    <option value="">Seleccione su cuenta</option>
                    {CRM_DOCTORS.map((doctor) => (
                      <option key={doctor.slug} value={doctor.slug}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                  Contraseña segura del CRM
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    minLength={12}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contraseña de al menos 12 caracteres"
                    className="pl-10 pr-10 h-12 text-base border-2 focus:border-teal-500"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de Login */}
              <Button
                type="submit"
                disabled={loading || !formData.doctorSlug || formData.password.length < 12}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              {/* Info adicional */}
              <div className="text-center pt-4">
                <p className="text-xs text-gray-500">
                  Use su contraseña segura del CRM. El NIP para asignar expedientes es distinto.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Información de desarrollo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            © 2024 Dents23 - Sistema de Gestión Dental
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
