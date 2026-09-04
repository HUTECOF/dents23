"use client"

import { HistoriaClinicaInteractiva } from "@/components/historia-clinica-interactiva"
import { patientDataStore } from "@/lib/patient-data-store"
import { saveHistoriaClinica } from "@/lib/supabase-helpers"
import { useRouter } from "next/navigation"

export default function HistoriaInteractivaPage() {
  const router = useRouter()

  const handleComplete = async (datos: Record<string, string>) => {
    console.log("Datos completados:", datos)

    // Mapear respuestas al formato esperado
    const formData = {
      empresa: datos.empresa || "",
      antiguedad: datos.antiguedad || "",
      fecha: datos.fecha || "",
      nombre: datos.nombre || "",
      ocupacion: datos.ocupacion || "",
      direccion: datos.direccion || "",
      edad: datos.edad || "",
      sexo: "masculino", // Por defecto
      email: datos.email || "",
      celular: datos.celular || "",
      telefono: datos.telefono || "",
      recomendadoPor: "",
      
      // Antecedentes
      alergico: datos.alergico || "",
      alergicoCual: "",
      saludBuena: datos.saludBuena || "",
      medicoUltimoAnio: datos.medicoUltimoAnio || "",
      enfermedadUltimos6Meses: datos.enfermedadUltimos6Meses || "",
      enfermedadCuales: "",
      hipertension: datos.hipertension || "",
      hipertensionValor: "",
      tomandoMedicamento: datos.tomandoMedicamento || "",
      medicamentoCual: "",
      enfermedadInfecciosa: "",
      diabetes: datos.diabetes || "",
      diabetesResultado: "",
      alteracionesRenales: datos.alteracionesRenales || "",
      cancer: datos.cancer || "",
      sangradoExcesivo: datos.sangradoExcesivo || "",
      embarazada: datos.embarazada || "",
      embarazadaMeses: "",
      epilepsia: datos.epilepsia || "",
      medicamentosAnticoagulantes: datos.medicamentosAnticoagulantes || "",
      aspirinas: datos.aspirinas || "",
      aspirinasFrec: "",
      notasAntecedentes: "",
      firmaAntecedentes: "",
      
      // Historia Dental
      ultimaVisitaDentista: datos.ultimaVisitaDentista || "",
      dolorDental: datos.dolorDental || "",
      dolorFrec: "",
      anestesia: datos.anestesia || "",
      reaccionAlergicaAnestesia: datos.reaccionAlergicaAnestesia || "",
      complicacionVisitaDental: datos.complicacionVisitaDental || "",
      impedimentoAnestesia: datos.impedimentoAnestesia || "",
      otraEnfermedad: "",
      
      // Firma y Foto (se agregarán después)
      firmaPaciente: "",
      fotoPaciente: ""
    }

    // Guardar en Supabase
    const savedHistoria = await saveHistoriaClinica(formData)
    
    if (savedHistoria) {
      patientDataStore.setHistoriaClinica(formData, savedHistoria.id)
      console.log("✅ Historia clínica guardada en Supabase")
    } else {
      patientDataStore.setHistoriaClinica(formData)
      console.log("⚠️ Guardado solo en localStorage")
    }

    // Redirigir al contrato
    router.push('/contrato')
  }

  return <HistoriaClinicaInteractiva onComplete={handleComplete} />
}
