"use client"

import { motion } from "framer-motion"
import { CreditCard, Building2, Landmark, User, Key } from "lucide-react"

interface TipoPacienteSelectorProps {
  value?: "charly" | "nomina" | "bancario" | "particular" | ""
  onChange: (value: "charly" | "nomina" | "bancario" | "particular") => void
  label: string
  required?: boolean
}

export function TipoPacienteSelector({ value, onChange, label, required = false }: TipoPacienteSelectorProps) {
  const opciones = [
    {
      id: "charly" as const,
      titulo: "Paciente Charly",
      descripcion: "Clave para el Dr.",
      icono: Key,
      color: "blue",
      gradiente: "from-blue-500 to-blue-600"
    },
    {
      id: "nomina" as const,
      titulo: "Paciente Vía Nómina",
      descripcion: "Descuento por nómina",
      icono: Building2,
      color: "green",
      gradiente: "from-green-500 to-green-600"
    },
    {
      id: "bancario" as const,
      titulo: "Financiamiento Bancario",
      descripcion: "Crédito bancario",
      icono: Landmark,
      color: "purple",
      gradiente: "from-purple-500 to-purple-600"
    },
    {
      id: "particular" as const,
      titulo: "Paciente Particular",
      descripcion: "Pago directo",
      icono: CreditCard,
      color: "orange",
      gradiente: "from-orange-500 to-orange-600"
    }
  ]

  return (
    <div className="studio-selector min-w-0 max-w-full space-y-4">
      <label className="text-lg font-bold text-foreground block text-center">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opciones.map((opcion) => {
          const Icono = opcion.icono
          const isSelected = value === opcion.id
          
          return (
            <motion.button
              key={opcion.id}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opcion.id)}
              className={`studio-selector-option relative min-w-0 w-full overflow-hidden rounded-2xl transition-all p-4 sm:p-6 ${
                isSelected
                  ? `studio-selector-option-active border-${opcion.color}-500 bg-${opcion.color}-50 shadow-lg shadow-${opcion.color}-200`
                  : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
              }`}
            >
              {/* Gradiente de fondo cuando está seleccionado */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  className={`absolute inset-0 bg-gradient-to-br ${opcion.gradiente}`}
                />
              )}
              
              <div className="relative flex flex-col items-center gap-3">
                {/* Icono */}
                <div className={`p-4 rounded-full ${
                  isSelected 
                    ? `bg-gradient-to-br ${opcion.gradiente} text-white` 
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <Icono className="w-8 h-8" />
                </div>
                
                {/* Título */}
                <h3 className={`font-bold text-lg text-center ${
                  isSelected ? `text-${opcion.color}-900` : "text-gray-700"
                }`}>
                  {opcion.titulo}
                </h3>
                
                {/* Descripción */}
                <p className={`text-sm text-center ${
                  isSelected ? `text-${opcion.color}-700` : "text-gray-500"
                }`}>
                  {opcion.descripcion}
                </p>
                
                {/* Indicador de selección */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${opcion.gradiente} flex items-center justify-center`}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
