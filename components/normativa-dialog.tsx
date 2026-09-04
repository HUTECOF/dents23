"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface NormativaSection {
  title: string
  items: string[]
}

export interface NormativaData {
  id: string
  title: string
  subtitle: string
  fullTitle: string
  summary: string
  sections: NormativaSection[]
}

export const NORMATIVAS: NormativaData[] = [
  {
    id: "nom-004",
    title: "NOM-004-SSA3-2012",
    subtitle: "Del expediente clínico.",
    fullTitle: "NOM-004-SSA3-2012, Del expediente clínico",
    summary:
      "Publicada el 15 de octubre de 2012. Establece los criterios científicos, éticos, tecnológicos y administrativos obligatorios para la elaboración, integración, uso, manejo, archivo, conservación, propiedad, titularidad y confidencialidad del expediente clínico.",
    sections: [
      {
        title: "Objetivo",
        items: [
          "Establecer criterios obligatorios para elaboración, integración, uso, manejo, archivo, conservación, propiedad, titularidad y confidencialidad del expediente clínico.",
        ],
      },
      {
        title: "Campo de aplicación",
        items: [
          "Obligatoria para el personal de salud y los establecimientos prestadores de servicios de atención médica de los sectores público, social y privado, incluidos los consultorios.",
        ],
      },
      {
        title: "Datos generales del expediente",
        items: [
          "Tipo, nombre y domicilio del establecimiento e institución a la que pertenece.",
          "Razón o denominación social del propietario o concesionario.",
          "Nombre, sexo, edad y domicilio del paciente.",
          "Los demás datos que señalen las disposiciones sanitarias.",
        ],
      },
      {
        title: "Responsabilidades",
        items: [
          "El médico y otros profesionales de la salud están obligados a cumplir la norma de forma ética y profesional.",
          "Los expedientes clínicos son propiedad de la institución o del prestador de servicios médicos que los genera.",
          "El paciente tiene derechos de titularidad sobre la información para la protección de su salud y la confidencialidad de sus datos.",
          "Los datos personales no deben divulgarse sin consentimiento, salvo obligación legal.",
        ],
      },
      {
        title: "Contenido mínimo",
        items: [
          "Historia clínica: interrogatorio, antecedentes, exploración física, signos vitales, resultados de estudios, diagnóstico, tratamiento y pronóstico.",
          "Notas médicas, reportes y constancias de cada atención.",
          "Cartas de consentimiento informado.",
          "Registros con fecha, hora, nombre completo y firma de quien los elabora.",
        ],
      },
      {
        title: "Conservación y confidencialidad",
        items: [
          "Conservación mínima de 5 años a partir de la fecha del último acto médico.",
          "Manejo discreto de la información bajo secreto médico profesional.",
          "Entrega de información a terceros solo mediante solicitud escrita del paciente, tutor o representante legal.",
        ],
      },
    ],
  },
  {
    id: "nom-013",
    title: "NOM-013-SSA2-2015",
    subtitle: "Para la prevención y control de enfermedades bucales.",
    fullTitle: "NOM-013-SSA2-2015, Para la prevención y control de enfermedades bucales",
    summary:
      "Publicada el 23 de noviembre de 2016. Establece criterios y procedimientos para prevenir, detectar, diagnosticar y tratar las enfermedades bucales más frecuentes en el Sistema Nacional de Salud.",
    sections: [
      {
        title: "Objetivo",
        items: [
          "Homogeneizar los procedimientos para la prevención y control de enfermedades bucales.",
          "Definir estrategias, técnicas operativas, medidas de control y vigilancia epidemiológica.",
        ],
      },
      {
        title: "Aplicación",
        items: [
          "Personal de salud y establecimientos odontológicos de los sectores público, social y privado.",
          "Instituciones de formación de recursos humanos y gremios en estomatología.",
        ],
      },
      {
        title: "Disposiciones generales",
        items: [
          "Ejercicio de la estomatología requiere título y cédula profesional.",
          "Alumnos y pasantes pueden participar bajo supervisión de un estomatólogo.",
          "Atención con perspectiva de derechos humanos, no discriminación e inclusión.",
          "Confidencialidad y custodia del expediente clínico.",
          "Consultorios debidamente equipados, con materiales educativos y listas de emergencia.",
        ],
      },
      {
        title: "Acciones educativo-preventivas",
        items: [
          "Acciones dirigidas a la comunidad.",
          "Acciones dirigidas a la persona.",
          "Promoción de higiene bucal, uso de flúor, selladores de fosetas y fisuras, y control de caries.",
        ],
      },
      {
        title: "Enfermedades abordadas",
        items: [
          "Caries dental.",
          "Enfermedad periodontal.",
          "Maloclusiones.",
          "Fluorosis dental.",
          "Lesiones y cáncer bucal.",
        ],
      },
      {
        title: "Expediente y registro",
        items: [
          "Expediente clínico odontológico.",
          "Registro y notificación epidemiológica.",
          "Concordancia con la NOM-004 y demás normas aplicables.",
        ],
      },
    ],
  },
  {
    id: "lgs",
    title: "Ley General de Salud",
    subtitle: "Base del Sistema Nacional de Salud.",
    fullTitle: "Ley General de Salud",
    summary:
      "Reglamenta el derecho a la protección de la salud, establece las bases del Sistema Nacional de Salud y distribuye las competencias para la reglamentación sanitaria.",
    sections: [
      {
        title: "Artículos relevantes",
        items: [
          "Art. 1: Reglamenta el derecho a la protección de la salud; es de orden público e interés social.",
          "Art. 2: Finalidades del derecho a la salud (bienestar físico y mental, calidad de vida, prevención, enseñanza e investigación).",
          "Art. 3: Materia de salubridad general (organización, control y vigilancia de prestación de servicios y establecimientos de salud).",
          "Art. 13: Competencia de la Federación para dictar Normas Oficiales Mexicanas y verificar su cumplimiento.",
          "Art. 32: Atención médica es el conjunto de servicios para proteger, promover y restaurar la salud.",
          "Art. 34: Clasificación de servicios de salud según sus prestadores (públicos, privados y sociales).",
          "Art. 51 Bis 2: Derecho a decidir libremente sobre procedimientos; consentimiento informado; autorización por familiar o representante en urgencia; constancia en el expediente clínico.",
        ],
      },
      {
        title: "Relación con el expediente",
        items: [
          "Obliga a mantener expediente clínico y respetar su confidencialidad.",
          "Requiere consentimiento informado para procedimientos diagnósticos y terapéuticos.",
          "Salvo urgencia, toda intervención requiere autorización expresa del usuario.",
        ],
      },
    ],
  },
  {
    id: "rlgs",
    title: "Reglamento de la Ley General de Salud",
    subtitle: "Prestación de servicios de atención médica.",
    fullTitle: "Reglamento de la Ley General de Salud en materia de prestación de servicios de atención médica",
    summary:
      "Regula la operación de establecimientos para la atención médica y la actuación de los profesionales de la salud en la prestación de servicios.",
    sections: [
      {
        title: "Artículos relevantes",
        items: [
          "Art. 1: Aplicación en todo el territorio nacional; disposiciones de orden público e interés social.",
          "Art. 4: La Secretaría de Salud emitirá Normas Técnicas y Normas Oficiales Mexicanas para la atención médica.",
          "Art. 7: Definiciones de atención médica, servicio de atención médica y establecimiento para la atención médica.",
          "Art. 9: La atención médica debe llevarse a efecto conforme a principios científicos y éticos.",
          "Art. 18: Establecimientos deben contar con un responsable con título, certificado o diploma.",
          "Art. 21: Contar con personal suficiente e idóneo conforme a Normas Técnicas.",
          "Art. 25: Identificación del personal mediante gafete visible.",
          "Art. 27: Sanción a quienes ejerzan sin título profesional registrado.",
          "Art. 80: Autorización escrita y firmada del usuario para procedimientos médico-quirúrgicos; información clara de riesgos y beneficios.",
          "Art. 82: Contenido mínimo de la autorización: nombre, firma, testigos, procedimiento y explicación del mismo.",
          "Art. 83: Las autorizaciones se ajustarán a los modelos que señalen las Normas Oficiales Mexicanas.",
        ],
      },
      {
        title: "Relación con el expediente",
        items: [
          "Obliga al responsable a proporcionar resumen clínico cuando el usuario o su representante lo solicite.",
          "Requiere que las recetas contengan nombre, cédula, domicilio y firma del profesional.",
          "Sujeta las autorizaciones a las Normas Oficiales Mexicanas (NOM-004).",
        ],
      },
    ],
  },
]

export function NormativaDialog({
  normativa,
  className,
}: {
  normativa: NormativaData
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "shrink-0 bg-white/80 border-slate-300 text-slate-700 hover:bg-slate-100",
            className
          )}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Ver desglose
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto break-words p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-slate-800 flex items-start gap-2 break-words flex-wrap">
            <BookOpen className="w-5 h-5 shrink-0 mt-0.5" />
            {normativa.fullTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-slate-700">
          <p>{normativa.summary}</p>
          {normativa.sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-slate-800 mb-1">
                {section.title}
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {section.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
