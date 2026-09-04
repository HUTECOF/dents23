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

export default function CRMLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    usuario: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Credenciales del sistema
  const CREDENTIALS = {
    usuario: "Dr Erick Mancilla",
    password: "dents23"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 800))

    // Validar credenciales
    if (formData.usuario === CREDENTIALS.usuario && formData.password === CREDENTIALS.password) {
      // Guardar sesión en localStorage
      localStorage.setItem("crm_authenticated", "true")
      localStorage.setItem("crm_user", formData.usuario)
      localStorage.setItem("crm_login_time", new Date().toISOString())
      
      // Redirigir al CRM
      router.push("/crm/pacientes")
    } else {
      setError("Usuario o contraseña incorrectos")
      setLoading(false)
    }
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
                <Label htmlFor="usuario" className="text-base font-semibold text-gray-700">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="usuario"
                    type="text"
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                    placeholder="Ingrese su usuario"
                    className="pl-10 h-12 text-base border-2 focus:border-teal-500"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Ingrese su contraseña"
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
                disabled={loading || !formData.usuario || !formData.password}
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
                  Sistema protegido - Acceso solo para personal autorizado
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
