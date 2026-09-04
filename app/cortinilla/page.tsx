"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  AlertCircle,
  ChevronRight,
  Stethoscope,
} from "lucide-react"
import { NormativaDialog, NORMATIVAS } from "@/components/normativa-dialog"

export default function CortinillaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#0891B2] to-[#0E7490] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-200">
            <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
            Dent&apos;s 23
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Expediente clínico digital</p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* Aviso importante */}
          <Card className="border-2 border-green-200 bg-green-50/80 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-green-500 rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h2 className="text-lg font-bold text-green-900 mb-2">
                    Aviso importante
                  </h2>
                  <div className="space-y-4 text-sm text-slate-700 break-words">
                    <p>
                      La presente historia clínica, el consentimiento informado y los documentos de autorización de tratamiento se elaboran de conformidad con las normas y disposiciones legales aplicables en materia de salud en México.
                    </p>
                    <ul className="space-y-3 list-disc pl-4 sm:pl-5">
                      {NORMATIVAS.map((normativa) => (
                        <li key={normativa.id} className="py-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 w-full">
                            <span className="w-full sm:flex-1 sm:w-auto min-w-0">
                              <strong>{normativa.title}</strong> — {normativa.subtitle}
                            </span>
                            <NormativaDialog
                              normativa={normativa}
                              className="w-full sm:w-auto"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p>
                      El paciente se obliga a proporcionar información verídica y completa. El personal médico se compromete a resguardar la confidencialidad de los datos conforme a la normatividad aplicable.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso de privacidad */}
          <Card className="border-2 border-blue-200 bg-blue-50/80 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-xl shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h2 className="text-lg font-bold text-blue-900 mb-2">
                    Aviso de privacidad
                  </h2>
                  <div className="space-y-4 text-sm text-slate-700 break-words">
                    <p>
                      <strong>DENT&apos;S 23</strong>, con domicilio en la ciudad de León, Guanajuato, es el responsable del tratamiento de los datos personales recabados.
                    </p>
                    <p>
                      Sus datos serán utilizados para:
                    </p>
                    <ul className="space-y-2 list-disc pl-4 sm:pl-5">
                      <li>Elaboración del expediente clínico.</li>
                      <li>Diagnóstico y tratamiento dental.</li>
                      <li>Seguimiento médico, citas y recordatorios.</li>
                      <li>Facturación y gestión de pagos.</li>
                      <li>Interconsultas o derivaciones necesarias.</li>
                    </ul>
                    <p>
                      No se transferirán datos a terceros sin su consentimiento, salvo obligaciones legales. Puede ejercer sus derechos ARCO enviando solicitud al correo o domicilio del consultorio.
                    </p>
                    <p>
                      Al continuar, usted acepta el tratamiento de sus datos personales conforme al presente aviso.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link href="/historia-clinica" className="w-full">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#0891B2] to-[#0E7490] hover:from-[#0E7490] hover:to-[#155E75] text-white text-lg py-6 rounded-full shadow-lg shadow-cyan-200/50"
            >
              Continuar al expediente
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-slate-400">
            Al continuar, acepta los avisos y la política de privacidad.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
