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
      className="studio-question relative group min-w-0 max-w-full"
    >
      <div className="studio-question-surface relative min-w-0 max-w-full space-y-4 rounded-2xl p-3.5 sm:p-5 transition-all duration-300">
        {/* Question label with animated dot */}
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

        {/* Buttons */}
        <div
          className="grid w-full gap-2 sm:gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))" }}
        >
          {/* YES button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange("si")}
            className={`studio-choice studio-choice-yes relative flex min-w-0 w-full items-center gap-2 px-3 py-3 sm:py-4 rounded-xl transition-all duration-300 overflow-hidden ${
              value === "si"
                ? "studio-choice-active text-emerald-900"
                : "text-slate-500"
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

            <div className={`relative flex shrink-0 items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
              value === "si"
                ? "studio-choice-icon-active studio-choice-icon-yes text-white"
                : "studio-choice-icon bg-slate-100 text-slate-400"
            }`}>
              <Check className="w-5 h-5" strokeWidth={3} />
            </div>
            <div className="relative min-w-0 text-left">
              <span className="block text-lg font-bold">Sí</span>
              <span className="block break-words text-[9px] sm:text-[10px] opacity-70 font-medium uppercase tracking-normal sm:tracking-wider leading-tight">
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
            className={`studio-choice studio-choice-no relative flex min-w-0 w-full items-center gap-2 px-3 py-3 sm:py-4 rounded-xl transition-all duration-300 overflow-hidden ${
              value === "no"
                ? "studio-choice-active text-rose-900"
                : "text-slate-500"
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

            <div className={`relative flex shrink-0 items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
              value === "no"
                ? "studio-choice-icon-active studio-choice-icon-no text-white"
                : "studio-choice-icon studio-choice-icon-no-muted"
            }`}>
              <X className="w-5 h-5" strokeWidth={3} />
            </div>
            <div className="relative min-w-0 text-left">
              <span className="block text-lg font-bold">No</span>
              <span className="block break-words text-[9px] sm:text-[10px] opacity-70 font-medium uppercase tracking-normal sm:tracking-wider leading-tight">
                {value === "no" ? "Seleccionado" : "Presione para no"}
              </span>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
