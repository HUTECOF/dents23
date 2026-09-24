"use client"

import { motion } from "framer-motion"

interface GenderSelectorProps {
  value?: "masculino" | "femenino"
  onChange: (value: "masculino" | "femenino") => void
  label: string
}

export function GenderSelector({ value, onChange, label }: GenderSelectorProps) {
  return (
    <div className="studio-selector min-w-0 max-w-full space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {/* Masculino */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange("masculino")}
          className={`studio-selector-option flex min-w-0 w-full flex-col items-center gap-2 p-3 sm:p-6 rounded-2xl transition-all ${
            value === "masculino"
              ? "studio-selector-option-active border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-300"
          }`}
        >
          <div className={`text-4xl ${value === "masculino" ? "text-blue-600" : "text-gray-400"}`}>
            👦
          </div>
          <span className="text-sm font-medium">Masculino</span>
        </motion.button>

        {/* Femenino */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange("femenino")}
          className={`studio-selector-option flex min-w-0 w-full flex-col items-center gap-2 p-3 sm:p-6 rounded-2xl transition-all ${
            value === "femenino"
              ? "studio-selector-option-active border-pink-500 bg-pink-50"
              : "border-gray-300 bg-white hover:border-pink-300"
          }`}
        >
          <div className={`text-4xl ${value === "femenino" ? "text-pink-600" : "text-gray-400"}`}>
            👧
          </div>
          <span className="text-sm font-medium">Femenino</span>
        </motion.button>
      </div>
    </div>
  )
}
