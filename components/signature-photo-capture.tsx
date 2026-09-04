"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Camera, Trash2, Upload, Pen } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SignaturePhotoCaptureProps {
  onSignatureChange: (signature: string) => void
  onPhotoChange: (photo: string) => void
  signatureValue?: string
  photoValue?: string
  signatureLabel?: string
  photoLabel?: string
}

export default function SignaturePhotoCapture({
  onSignatureChange,
  onPhotoChange,
  signatureValue,
  photoValue,
  signatureLabel = "Firma del Paciente",
  photoLabel = "Foto del Paciente"
}: SignaturePhotoCaptureProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Funciones para la firma
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      onSignatureChange(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureChange("")
  }

  // Funciones para la foto
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      onPhotoChange(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    onPhotoChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      
      {/* Captura de Firma */}
      <div className="space-y-3">
        <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
          <Pen className="w-4 h-4 text-medical-teal" />
          {signatureLabel} *
        </Label>
        <Card className="p-3 sm:p-4 space-y-3 neomorphic-inset">
          <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-white touch-none">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full cursor-crosshair touch-none"
              style={{ touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!signatureValue && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-xs sm:text-sm px-2 text-center">
                Firme aquí con el mouse o dedo
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            className="w-full text-xs sm:text-sm"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Limpiar Firma
          </Button>
        </Card>
      </div>

      {/* Captura de Foto */}
      <div className="space-y-3">
        <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
          <Camera className="w-4 h-4 text-medical-teal" />
          {photoLabel} *
        </Label>
        <Card className="p-3 sm:p-4 space-y-3 neomorphic-inset">
          <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/30 aspect-[4/3]">
            {photoValue ? (
              <img
                src={photoValue}
                alt="Foto del paciente"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground px-2">
                <Camera className="w-10 h-10 sm:w-12 sm:h-12 mb-2 opacity-50" />
                <span className="text-xs sm:text-sm text-center">Sube una foto del paciente</span>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-xs sm:text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {photoValue ? "Cambiar" : "Subir"} Foto
            </Button>
            {photoValue && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearPhoto}
                className="px-2 sm:px-3"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
