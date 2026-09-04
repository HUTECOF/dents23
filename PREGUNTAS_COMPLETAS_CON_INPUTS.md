# 📋 Preguntas Completas con Inputs Adicionales

## ✅ IMPLEMENTADO

He actualizado todas las preguntas del formulario para que cuando el usuario responda **"Sí"** a ciertas preguntas, aparezca un campo de texto adicional para obtener más información.

---

## 🎯 Preguntas con Input Adicional

### **ANTECEDENTES PERSONALES**

1. **¿Es usted alérgico a algún medicamento?**
   - Si responde **Sí** → Input: "¿Cuál medicamento?"

2. **¿Ha padecido alguna enfermedad en los últimos 6 meses?**
   - Si responde **Sí** → Input: "¿Qué enfermedad?"

3. **¿Hipertensión arterial?**
   - Si responde **Sí** → Input: "mmhg Normal 120/80mmhg Límite para atender 140/90mmhg"

4. **¿Está tomando algún medicamento?**
   - Si responde **Sí** → Input: "¿Cuál medicamento?"

5. **¿Padece o ha padecido alguna enfermedad infecciosa?**
   - Si responde **Sí** → Input: "Sida, Hepatitis, Herpes, Paratoiditis, Varicela, Tuberculosis"

6. **¿Padece diabetes o ha desayunado?**
   - Si responde **Sí** → Input: "Último resultado de nivel de glucosa y hace cuánto"

7. **¿Se encuentra embarazada, cuántas semanas?**
   - Si responde **Sí** → Input: "¿Cuántas semanas? ¿Lagrado?"

8. **¿Toma usted aspirinas? ¿Con qué frecuencia?**
   - Si responde **Sí** → Input: "¿Con qué frecuencia?"

### **HISTORIA CLÍNICA DENTAL**

9. **¿Presenta dolor dental actualmente? ¿Con qué frecuencia?**
   - Si responde **Sí** → Input: "¿Con qué frecuencia?"

10. **¿Le han anestesiado? ¿Ha presentado alguna reacción alérgica a la anestesia?**
    - Si responde **Sí** → Input: "¿Qué tipo de reacción?"

11. **¿Ha sufrido alguna complicación durante su visita dental?**
    - Si responde **Sí** → Input: "¿Qué complicación?"

12. **¿Padece o ha padecido alguna enfermedad que no se haya mencionado en este cuestionario?**
    - Si responde **Sí** → Input: "¿Cuál enfermedad?"

---

## 🎨 Cómo Funciona

### **Flujo de Interacción**

```
┌─────────────────────────────────────┐
│  ¿Es usted alérgico a algún        │
│     medicamento?                    │
│                                     │
│     👎 No        👍 Sí              │
└─────────────────────────────────────┘
        ↓ (Usuario hace click en Sí)
┌─────────────────────────────────────┐
│  ¿Cuál medicamento?                 │
│                                     │
│  [_____________________________]    │
│                                     │
│  [Botón: Continuar →]               │
│  Presiona Enter para continuar      │
└─────────────────────────────────────┘
        ↓ (Usuario escribe y presiona Enter)
┌─────────────────────────────────────┐
│  Siguiente pregunta...              │
└─────────────────────────────────────┘
```

### **Código Implementado**

```typescript
// Ejemplo de pregunta con input
{
  id: "alergico",
  pregunta: "¿Es usted alérgico a algún medicamento?",
  tipo: "pulgar",
  tieneInput: true,
  inputId: "alergicoCual",
  inputPlaceholder: "¿Cuál medicamento?"
}
```

### **Lógica de Manejo**

```typescript
const handleRespuesta = (valor: string) => {
  const nuevasRespuestas = {
    ...respuestas,
    [preguntaActual.id]: valor
  }
  setRespuestas(nuevasRespuestas)

  // Si la pregunta tiene input y respondió "si"
  if (preguntaActual.tieneInput && valor === "si") {
    setMostrarInput(true)  // Muestra el input
  } else {
    avanzarPregunta(nuevasRespuestas)  // Avanza directamente
  }
}
```

---

## 📊 Preguntas Actualizadas del Documento

Basándome en las imágenes de los documentos físicos, he actualizado:

### **Antecedentes Personales**
- ✅ Alergias → Input de medicamento
- ✅ Enfermedades → Input de cuál enfermedad
- ✅ Hipertensión → Input de niveles mmhg
- ✅ Medicamentos → Input de cuál medicamento
- ✅ Enfermedades infecciosas → Input de tipo
- ✅ Diabetes → Input de glucosa y tiempo
- ✅ Embarazo → Input de semanas
- ✅ Aspirinas → Input de frecuencia

### **Historia Dental**
- ✅ Última visita → Input de fecha
- ✅ Dolor dental → Input de frecuencia
- ✅ Anestesia → Input de reacción
- ✅ Complicaciones → Input de cuál
- ✅ Otras enfermedades → Input de cuál

---

## 🎯 Preguntas Sin Input Adicional

Estas preguntas solo requieren Sí/No:

- ¿Su estado de salud lo considera bueno? (Emoji)
- ¿Ha acudido al médico en el último año?
- ¿Alteraciones renales? ¿Diálisis?
- ¿Cáncer? ¿Quimioterapia?
- ¿Sangrado excesivo? ¿Hemorragias?
- ¿Leucemia? ¿Hemofilia?
- ¿Ataques de epilepsia?
- ¿Medicamentos anticoagulantes?

---

## 💰 Preguntas Financieras

Agregadas al final antes de firma:

1. **Monto total del tratamiento** (número)
2. **Número de cuotas** (3, 6, 9, 12 meses)
3. **Monto por cuota** (número)
4. **Fecha del primer pago** (date)

---

## ✨ Características

### **Input Adicional**
- ✅ Aparece solo cuando responde "Sí"
- ✅ Auto-focus en el campo
- ✅ Enter para continuar
- ✅ Botón "Continuar" visible
- ✅ Placeholder descriptivo
- ✅ Animación suave de entrada

### **Validación**
- ✅ Guarda ambas respuestas (Sí/No + texto)
- ✅ Permite continuar sin llenar (opcional)
- ✅ Enter funciona para avanzar

### **Diseño**
- ✅ Input grande centrado
- ✅ Texto de ayuda
- ✅ Botón cyan
- ✅ Transición suave

---

## 📋 Total de Preguntas

- **Datos Personales**: 13 preguntas
- **Antecedentes**: 16 preguntas (8 con input adicional)
- **Historia Dental**: 5 preguntas (4 con input adicional)
- **Financiero**: 4 preguntas
- **Firma y Foto**: 1 paso

**Total: 39 preguntas** (12 con inputs adicionales)

---

## 🎨 Ejemplo Visual

```
Pregunta Principal:
┌─────────────────────────────────────┐
│  ¿Está tomando algún medicamento?   │
│                                     │
│     👎 No        👍 Sí              │
│   [160px]       [160px]             │
└─────────────────────────────────────┘

Si responde Sí:
┌─────────────────────────────────────┐
│  ¿Cuál medicamento?                 │
│                                     │
│  [_____________________________]    │
│  (Input grande, centrado, h-16)     │
│                                     │
│  [Continuar →]                      │
│  Presiona Enter para continuar      │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [x] Preguntas de alergias con input
- [x] Preguntas de enfermedades con input
- [x] Preguntas de medicamentos con input
- [x] Preguntas de hipertensión con input
- [x] Preguntas de diabetes con input
- [x] Preguntas de embarazo con input
- [x] Preguntas de aspirinas con input
- [x] Preguntas dentales con input
- [x] Lógica de mostrar/ocultar input
- [x] Guardado de ambas respuestas
- [x] Enter para continuar
- [x] Animaciones suaves
- [x] Compilación exitosa

---

## 🚀 Pruébalo

```bash
npm run dev
```

Ahora cuando respondas "Sí" a preguntas específicas, aparecerá un campo de texto para que proporciones más información! 📝✨

**¡Formulario completo con inputs condicionales basado en los documentos físicos!** 🎯
