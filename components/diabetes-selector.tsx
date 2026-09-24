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
      className="studio-question relative group min-w-0 max-w-full"
    >
      <div className="studio-question-surface relative min-w-0 max-w-full space-y-4 rounded-2xl p-3.5 sm:p-5 transition-all duration-300">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="studio-question-dot w-2 h-2 rounded-full"
          />
          <label className="text-sm font-semibold text-slate-700 leading-relaxed">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>

        <div
          className="grid w-full gap-2 sm:gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 10rem), 1fr))" }}
        >
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
                className={`studio-choice ${opt.id === "no" ? "studio-choice-no" : ""} relative flex min-w-0 w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden text-left ${
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
                  isActive
                    ? `${opt.activeColor} text-white shadow-md`
                    : opt.id === "no"
                    ? "studio-choice-icon-no-muted"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" strokeWidth={3} />
                </div>
                <div className="relative min-w-0">
                  <span className="block text-sm font-bold truncate">{opt.label}</span>
                  <span className="block truncate text-[9px] sm:text-[10px] opacity-70 font-medium uppercase tracking-normal sm:tracking-wider">
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
