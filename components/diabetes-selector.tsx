"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X, HelpCircle, Ban } from "lucide-react"

interface DiabetesSelectorProps {
  value?: "si" | "no" | "no_recuerdo" | "nunca_tomada"
  onChange: (value: "si" | "no" | "no_recuerdo" | "nunca_tomada") => void
  label: string
  required?: boolean
}

const OPTIONS = [
  { id: "si" as const, label: "Sí", sub: "Confirmado", icon: Check, color: "emerald", activeColor: "bg-emerald-500", borderActive: "border-emerald-400", bgActive: "from-emerald-50 to-teal-50", textActive: "text-emerald-800", shadowActive: "shadow-emerald-200/50" },
  { id: "no" as const, label: "No", sub: "Negativo", icon: X, color: "rose", activeColor: "bg-rose-500", borderActive: "border-rose-400", bgActive: "from-rose-50 to-red-50", textActive: "text-rose-800", shadowActive: "shadow-rose-200/50" },
  { id: "no_recuerdo" as const, label: "No recuerdo", sub: "Indeciso", icon: HelpCircle, color: "amber", activeColor: "bg-amber-500", borderActive: "border-amber-400", bgActive: "from-amber-50 to-yellow-50", textActive: "text-amber-800", shadowActive: "shadow-amber-200/50" },
  { id: "nunca_tomada" as const, label: "Nunca me la he tomado", sub: "Primera vez", icon: Ban, color: "violet", activeColor: "bg-violet-500", borderActive: "border-violet-400", bgActive: "from-violet-50 to-purple-50", textActive: "text-violet-800", shadowActive: "shadow-violet-200/50" },
]

export function DiabetesSelector({ value, onChange, label, required = false }: DiabetesSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-teal-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />

      <div className="relative space-y-4 bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
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

        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const isActive = value === opt.id
            const Icon = opt.icon
            return (
              <motion.button
                key={opt.id}
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onChange(opt.id)}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left ${
                  isActive
                    ? `${opt.borderActive} bg-gradient-to-br ${opt.bgActive} ${opt.textActive} shadow-lg ${opt.shadowActive}`
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-gradient-to-br from-${opt.color}-400/10 to-${opt.color === "violet" ? "purple" : opt.color}-400/10`}
                    />
                  )}
                </AnimatePresence>

                <div className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shrink-0 ${
                  isActive ? `${opt.activeColor} text-white shadow-md` : "bg-slate-100 text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" strokeWidth={3} />
                </div>
                <div className="relative min-w-0">
                  <span className="block text-sm font-bold truncate">{opt.label}</span>
                  <span className="block text-[10px] opacity-70 font-medium uppercase tracking-wider">
                    {isActive ? "Seleccionado" : opt.sub}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
