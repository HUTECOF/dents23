"use client"

import { Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ThumbsSelectorProps {
  value?: "si" | "no"
  onChange: (value: "si" | "no") => void
  label: string
  required?: boolean
}

export function ThumbsSelector({ value, onChange, label, required = false }: ThumbsSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative group"
    >
      {/* Glowing background effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />

      <div className="relative space-y-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Question label with animated dot */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
          />
          <label className="text-sm font-semibold text-slate-700 leading-relaxed">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center sm:justify-start">
          {/* YES button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange("si")}
            className={`relative flex-1 sm:flex-none flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
              value === "si"
                ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800 shadow-lg shadow-emerald-200/50"
                : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
            }`}
          >
            {/* Selected glow */}
            <AnimatePresence>
              {value === "si" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10"
                />
              )}
            </AnimatePresence>

            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              value === "si"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-300"
                : "bg-slate-100 text-slate-400"
            }`}>
              <Check className="w-5 h-5" strokeWidth={3} />
            </div>
            <div className="relative text-left">
              <span className="block text-lg font-bold">Sí</span>
              <span className="block text-[10px] opacity-70 font-medium uppercase tracking-wider">
                {value === "si" ? "Seleccionado" : "Presione para sí"}
              </span>
            </div>
          </motion.button>

          {/* NO button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange("no")}
            className={`relative flex-1 sm:flex-none flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
              value === "no"
                ? "border-rose-400 bg-gradient-to-br from-rose-50 to-red-50 text-rose-800 shadow-lg shadow-rose-200/50"
                : "border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-600"
            }`}
          >
            <AnimatePresence>
              {value === "no" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-red-400/10"
                />
              )}
            </AnimatePresence>

            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              value === "no"
                ? "bg-rose-500 text-white shadow-md shadow-rose-300"
                : "bg-slate-100 text-slate-400"
            }`}>
              <X className="w-5 h-5" strokeWidth={3} />
            </div>
            <div className="relative text-left">
              <span className="block text-lg font-bold">No</span>
              <span className="block text-[10px] opacity-70 font-medium uppercase tracking-wider">
                {value === "no" ? "Seleccionado" : "Presione para no"}
              </span>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
