import jsPDF from "jspdf"

export const generatePatientPDF = (data: any) => {
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = 20

  // Función para verificar espacio y agregar página si es necesario
  const checkPageBreak = (spaceNeeded: number = 15) => {
    if (yPosition + spaceNeeded > pageHeight - 20) {
      pdf.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Función auxiliar para agregar texto
  const addText = (text: string, size: number = 10, isBold: boolean = false, x: number = margin) => {
    checkPageBreak(size / 2 + 5)
    pdf.setFontSize(size)
    pdf.setFont("helvetica", isBold ? "bold" : "normal")
    pdf.text(text, x, yPosition)
    yPosition += size / 2 + 4
  }

  // Función para agregar texto largo con saltos de línea automáticos
  const addWrappedText = (text: string, size: number = 9, maxWidth: number = contentWidth) => {
    pdf.setFontSize(size)
    pdf.setFont("helvetica", "normal")
    const lines = pdf.splitTextToSize(text, maxWidth)
    
    lines.forEach((line: string) => {
      checkPageBreak(size / 2 + 4)
      pdf.text(line, margin, yPosition)
      yPosition += size / 2 + 3
    })
    yPosition += 2 // Espacio extra después del párrafo
  }

  // Función para agregar línea separadora
  const addLine = () => {
    checkPageBreak(5)
    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.5)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 6
  }

  // Función para agregar sección con título
  const addSection = (title: string, color: number[] = [8, 145, 178]) => {
    checkPageBreak(15)
    yPosition += 3
    pdf.setFillColor(color[0], color[1], color[2])
    pdf.roundedRect(margin, yPosition - 6, contentWidth, 10, 2, 2, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(11)
    pdf.setFont("helvetica", "bold")
    pdf.text(title, margin + 3, yPosition)
    pdf.setTextColor(0, 0, 0)
    yPosition += 8
  }

  // Función para agregar cuadro de información
  const addInfoBox = (title: string, content: string, bgColor: number[] = [245, 245, 245]) => {
    const boxHeight = 30
    checkPageBreak(boxHeight + 5)
    
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2])
    pdf.roundedRect(margin, yPosition, contentWidth, boxHeight, 2, 2, "F")
    
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "bold")
    pdf.text(title, margin + 3, yPosition + 5)
    
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    const lines = pdf.splitTextToSize(content, contentWidth - 10)
    let textY = yPosition + 10
    lines.forEach((line: string) => {
      pdf.text(line, margin + 3, textY)
      textY += 4
    })
    
    yPosition += boxHeight + 5
  }

  // Encabezado
  pdf.setFillColor(8, 145, 178) // Cyan de Dent's 23
  pdf.rect(0, 0, pageWidth, 40, "F")
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.text("Dent's 23", pageWidth / 2, 20, { align: "center" })
  
  pdf.setFontSize(10)
  pdf.setTextColor(15, 76, 117)
  pdf.text('We Serve People', pageWidth / 2, 28, { align: 'center' })
  
  pdf.setFontSize(12)
  pdf.setTextColor(100, 100, 100)
  pdf.text('Historia Clínica Dental Completa', pageWidth / 2, 36, { align: 'center' })
  pdf.setTextColor(0, 0, 0)
  yPosition = 40

  // Fecha de generación
  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generado: ${new Date().toLocaleString("es-MX")}`, pageWidth - 20, yPosition, { align: "right" })
  yPosition += 10

  // ==================== HISTORIA CLÍNICA ====================
  if (data.historiaClinica) {
    const hc = data.historiaClinica
    
    addSection("HISTORIA CLÍNICA DENTAL")
    
    // Datos Personales
    addText("DATOS PERSONALES", 11, true)
    addText(`Nombre: ${hc.nombre || "N/A"}`)
    addText(`Empresa: ${hc.empresa || "N/A"}`)
    addText(`Antigüedad: ${hc.antiguedad || "N/A"}`)
    addText(`Fecha: ${hc.fecha || "N/A"}`)
    addText(`Ocupación: ${hc.ocupacion || "N/A"}`)
    addText(`Dirección: ${hc.direccion || "N/A"}`)
    addText(`Edad: ${hc.edad || "N/A"} años`)
    addText(`Sexo: ${hc.sexo || "N/A"}`)
    addText(`Email: ${hc.email || "N/A"}`)
    addText(`Celular: ${hc.celular || "N/A"}`)
    addText(`Teléfono: ${hc.telefono || "N/A"}`)
    addText(`Recomendado por: ${hc.recomendadoPor || "N/A"}`)
    
    addLine()
    
    // Antecedentes Personales
    addText("ANTECEDENTES PERSONALES", 11, true)
    addText(`¿Alérgico a medicamentos?: ${hc.alergico === "si" ? "Sí" : "No"}`)
    if (hc.alergicoCual) addText(`  Cuál: ${hc.alergicoCual}`)
    addText(`¿Estado de salud bueno?: ${hc.saludBuena === "si" ? "Sí" : "No"}`)
    addText(`¿Acudió al médico último año?: ${hc.medicoUltimoAnio === "si" ? "Sí" : "No"}`)
    addText(`¿Enfermedad últimos 6 meses?: ${hc.enfermedadUltimos6Meses === "si" ? "Sí" : "No"}`)
    if (hc.enfermedadCuales) addText(`  Cuáles: ${hc.enfermedadCuales}`)
    addText(`¿Hipertensión arterial?: ${hc.hipertension === "si" ? "Sí" : "No"}`)
    if (hc.hipertensionValor) addText(`  Valor: ${hc.hipertensionValor}`)
    addText(`¿Tomando medicamentos?: ${hc.tomandoMedicamento === "si" ? "Sí" : "No"}`)
    if (hc.medicamentoCual) addText(`  Cuál: ${hc.medicamentoCual}`)
    addText(`¿Enfermedad infecciosa?: ${hc.enfermedadInfecciosa === "si" ? "Sí" : "No"}`)
    addText(`¿Diabetes?: ${hc.diabetes === "si" ? "Sí" : "No"}`)
    if (hc.diabetesResultado) addText(`  Resultado: ${hc.diabetesResultado}`)
    addText(`¿Alteraciones renales?: ${hc.alteracionesRenales === "si" ? "Sí" : "No"}`)
    addText(`¿Cáncer/quimio/radio?: ${hc.cancer === "si" ? "Sí" : "No"}`)
    addText(`¿Sangrado excesivo?: ${hc.sangradoExcesivo === "si" ? "Sí" : "No"}`)
    addText(`¿Embarazada?: ${hc.embarazada === "si" ? "Sí" : "No"}`)
    if (hc.embarazadaMeses) addText(`  Detalles: ${hc.embarazadaMeses}`)
    addText(`¿Epilepsia?: ${hc.epilepsia === "si" ? "Sí" : "No"}`)
    addText(`¿Anticoagulantes?: ${hc.medicamentosAnticoagulantes === "si" ? "Sí" : "No"}`)
    addText(`¿Toma aspirinas?: ${hc.aspirinas === "si" ? "Sí" : "No"}`)
    if (hc.aspirinasFrec) addText(`  Frecuencia: ${hc.aspirinasFrec}`)
    
    if (hc.notasAntecedentes) {
      addText("Notas adicionales:", 10, true)
      addText(hc.notasAntecedentes)
    }
    
    addLine()
    
    // Historia Clínica Dental
    addText("HISTORIA CLÍNICA DENTAL", 11, true)
    addText(`Última visita al dentista: ${hc.ultimaVisitaDentista === "si" ? "Reciente" : "Hace tiempo"}`)
    addText(`¿Dolor dental actual?: ${hc.dolorDental === "si" ? "Sí" : "No"}`)
    if (hc.dolorFrec) addText(`  Frecuencia: ${hc.dolorFrec}`)
    addText(`¿Lo han anestesiado?: ${hc.anestesia === "si" ? "Sí" : "No"}`)
    addText(`¿Reacción alérgica a anestesia?: ${hc.reaccionAlergicaAnestesia === "si" ? "Sí" : "No"}`)
    addText(`¿Complicación en visita dental?: ${hc.complicacionVisitaDental === "si" ? "Sí" : "No"}`)
    addText(`¿Impedimento para anestesia?: ${hc.impedimentoAnestesia === "si" ? "Sí" : "No"}`)
    addText(`¿Otra enfermedad no mencionada?: ${hc.otraEnfermedad === "si" ? "Sí" : "No"}`)
    
    // Firma y foto
    if (hc.firmaAntecedentes) {
      addText(`Firma: ${hc.firmaAntecedentes}`, 10, true)
    }

    // Agregar foto si existe
    if (hc.fotoPaciente) {
      pdf.addPage()
      yPosition = 20
      addText("FOTOGRAFÍA DEL PACIENTE", 12, true)
      try {
        pdf.addImage(hc.fotoPaciente, "JPEG", 20, yPosition, 80, 60)
        yPosition += 70
      } catch (e) {
        addText("Error al cargar la foto")
      }
    }

    // Agregar firma si existe
    if (hc.firmaPaciente) {
      if (yPosition > pageHeight - 80) {
        pdf.addPage()
        yPosition = 20
      }
      addText("FIRMA DEL PACIENTE", 12, true)
      try {
        pdf.addImage(hc.firmaPaciente, "PNG", 20, yPosition, 80, 40)
        yPosition += 50
      } catch (e) {
        addText("Error al cargar la firma")
      }
    }
  }

  // ==================== CONTRATO ====================
  if (data.contrato) {
    pdf.addPage()
    yPosition = margin
    
    const contrato = data.contrato
    
    addSection("AUTORIZACIÓN DE DESCUENTOS PARA TRATAMIENTO DENTAL", [8, 145, 178])
    
    addText("Estimado paciente: lea detenidamente este documento y, en caso de estar de acuerdo, fírmalo.", 9)
    yPosition += 3
    
    // Información del Colaborador
    addSection("INFORMACIÓN DEL COLABORADOR", [100, 100, 100])
    addText(`Nombre: ${contrato.colaboradorNombre || "N/A"}`, 9)
    addText(`Fecha: ${contrato.fechaAutorizacion || "N/A"}`, 9)
    addText(`Empresa: ${contrato.empresa || "N/A"}`, 9)
    addText(`Nómina: ${contrato.numeroNomina || "N/A"}`, 9)
    addText(`Antigüedad: ${contrato.antiguedad || "N/A"} años`, 9)
    addText(`Área: ${contrato.area || "N/A"}`, 9)
    
    yPosition += 3
    
    // Información del Tratamiento
    addSection("DIAGNÓSTICO Y TRATAMIENTO", [100, 100, 100])
    addText(`Diagnóstico: ${contrato.diagnostico || "N/A"}`, 9)
    addText(`Tratamiento: ${contrato.tratamiento || "N/A"}`, 9)
    addText(`Costo Total: $${contrato.costoTotal || "0.00"}`, 9)
    addText(`Pago Semanal: $${contrato.pagoSemanal || "0.00"}`, 9)
    addText(`Número de Semanas: ${contrato.numeroSemanas || "N/A"}`, 9)
    
    yPosition += 5
    
    // AUTORIZACIÓN - Cuadro amarillo
    const textoAutorizacion = "AUTORIZACIÓN: Con este documento faculto y autorizo a la empresa DENT'S 23 para que descuente el importe del crédito que se indica en el apartado con la Dra. Humbertina Huerta Heredia en la cantidad correspondiente. No incluye ACUERDO QUE NO HABRÁ CANCELACIÓN ALGUNA DE TRATAMIENTOS DENTALES Y MUCHO MENOS REEMBOLSO MONETARIOS PARCIALES O TOTALES, SOLAMENTE PODRÁ TRANSFERIR EL SALDO DE TRATAMIENTO A OTRO PACIENTE, estas condiciones están mencionadas. Nota: La empresa será responsable del pago en caso de que el colaborador termine su relación laboral."
    
    addInfoBox("AUTORIZACIÓN", textoAutorizacion, [255, 243, 205])
    
    // CONSENTIMIENTO INFORMADO - Cuadro cyan
    const textoConsentimiento = "Se hace saber al paciente o a sus padres o tutores que la Dra. Humbertina Huerta Heredia no es médica profesional. No obstante, la Dra. Humbertina Huerta Heredia se compromete a realizar los tratamientos odontológicos con la mayor profesionalidad, con el máximo cuidado y con las medidas profesionales Nº 013-SSA2-2006 y Nº 013-SSA2-1994 y el reglamento de la secretaría de salubridad del estado de Guanajuato No. 1793."
    
    addInfoBox("CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS ODONTOLÓGICOS", textoConsentimiento, [207, 242, 255])
    
    // AUTORIZACIÓN EXPRESA - Cuadro morado
    const textoExpresa = "DEL MES: __________ DEL AÑO: __________ EN LA CIUDAD DE LEÓN GUANAJUATO. Estoy de acuerdo que no hay cancelación ni reembolso por ningún motivo. Estoy de acuerdo que si cancelo habrá una penalización de: $" + (contrato.penalizacionMonto || "______")
    
    addInfoBox("AUTORIZACIÓN EXPRESA DE USA", textoExpresa, [243, 232, 255])
    
    yPosition += 3
    
    // CONFIRMACIONES
    addSection("CONFIRMACIÓN DE LECTURA Y ACEPTACIÓN", [220, 38, 38])
    pdf.setTextColor(220, 38, 38)
    addText(`✓ He leído y autorizo los descuentos semanales: ${contrato.autorizaDeducciones ? "SÍ" : "NO"}`, 9, true)
    addText(`✓ Acepto que NO HABRÁ CANCELACIÓN ni reembolso: ${contrato.aceptaNoCancelacion ? "SÍ" : "NO"}`, 9, true)
    pdf.setTextColor(0, 0, 0)
    
    yPosition += 5
    addLine()
    
    // Firma
    addText("FIRMA DEL CONTRATO", 10, true)
    addText(`Firma: ${contrato.firmaPaciente || "N/A"}`, 9)
    addText(`Fecha: ${contrato.fechaFirma || "N/A"}`, 9)
    addText(`Ciudad: ${contrato.ciudadFirma || "N/A"}`, 9)
  }

  // ==================== CONSENTIMIENTO INFORMADO ====================
  if (data.consentimiento) {
    pdf.addPage()
    yPosition = 20
    
    const consentimiento = data.consentimiento
    
    addSection("CONSENTIMIENTO INFORMADO")
    
    addText(`Paciente: ${consentimiento.nombrePaciente || "N/A"}`)
    addText(`Representante/Tutor: ${consentimiento.representanteTutor || "N/A"}`)
    addText(`Doctor asignado: ${consentimiento.doctorAsignado || "N/A"}`)
    addText(`Procedimiento: ${consentimiento.procedimiento || "N/A"}`)
    
    addLine()
    
    addText("CONSENTIMIENTO", 11, true)
    pdf.setFontSize(8)
    const consentText = `El paciente ha sido informado sobre los riesgos y beneficios del procedimiento odontológico. 
Acepta que no todas las citas será atendido por los doctores titulares y que la responsabilidad 
del tratamiento será del médico tratante. Se han explicado las posibles complicaciones y riesgos 
asociados al procedimiento.`
    
    const splitText = pdf.splitTextToSize(consentText, pageWidth - 40)
    pdf.text(splitText, 20, yPosition)
    yPosition += splitText.length * 4
    
    addLine()
    
    pdf.setFontSize(10)
    addText(`Firma del paciente: ${consentimiento.firmaPaciente || "N/A"}`)
    addText(`Nombre: ${consentimiento.nombrePacienteFirma || "N/A"}`)
    addText(`Fecha: ${consentimiento.fechaAutorizacion || "N/A"}`)
    addText(`Ciudad: ${consentimiento.ciudadAutorizacion || "N/A"}`)
  }

  // Pie de página en todas las páginas
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Página ${i} de ${totalPages} - Documento confidencial`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
  }

  // Guardar PDF
  const fileName = `Expediente_${data.historiaClinica?.nombre?.replace(/\s+/g, "_") || "Paciente"}_${new Date().getTime()}.pdf`
  pdf.save(fileName)
}
