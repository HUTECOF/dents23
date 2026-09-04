"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Check, AlertCircle } from "lucide-react"

interface ModernInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  icon?: React.ReactNode
  validate?: (value: string) => boolean
  errorMessage?: string
}

export function ModernInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  icon,
  validate,
  errorMessage
}: ModernInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  
  const isValid = validate ? validate(value) : true
  const showError = isTouched && !isValid && value.length > 0
  const showSuccess = isTouched && isValid && value.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2 relative"
    >
      <Label 
        htmlFor={id}
        className={`text-sm font-medium transition-colors duration-200 ${
          isFocused ? 'text-medical-teal' : 'text-foreground'
        }`}
      >
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-medical-teal transition-colors duration-200">
            {icon}
          </div>
        )}
        
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false)
              setIsTouched(true)
            }}
            placeholder={placeholder}
            className={`
              neomorphic-inset transition-all duration-300
              ${icon ? 'pl-10' : ''}
              ${showError ? 'border-destructive focus:border-destructive' : ''}
              ${showSuccess ? 'border-green-500 focus:border-green-500' : ''}
              ${isFocused ? 'shadow-lg shadow-medical-teal/20 border-medical-teal' : ''}
              hover:border-medical-teal/50
            `}
          />
        </motion.div>

        {/* Success/Error Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {showSuccess && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
          {showError && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <AlertCircle className="w-5 h-5 text-destructive" />
            </motion.div>
          )}
        </div>

        {/* Animated underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-medical-teal to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? '100%' : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Error Message */}
      {showError && errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </motion.p>
      )}

      {/* Character count for text inputs */}
      {type === "text" && value.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground text-right"
        >
          {value.length} caracteres
        </motion.p>
      )}
    </motion.div>
  )
}
