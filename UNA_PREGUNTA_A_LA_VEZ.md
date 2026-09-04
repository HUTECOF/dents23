# 🎯 Una Pregunta a la Vez - Estilo Encuesta

## ✅ IMPLEMENTADO

El **Paso 2: Antecedentes Personales** ahora muestra **UNA SOLA pregunta a la vez** y avanza automáticamente cuando respondes, exactamente como la encuesta que me mostraste.

---

## 🎨 Cómo Funciona

### **Flujo de Preguntas**

```
┌─────────────────────────────────────┐
│  Pregunta 1 de 14          7%       │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░    │
├─────────────────────────────────────┤
│                                     │
│  ¿Es usted alérgico a algún        │
│     medicamento?                    │
│                                     │
│     👎 No        👍 Sí              │
│                                     │
└─────────────────────────────────────┘
        ↓ (Click en Sí)
┌─────────────────────────────────────┐
│  [Input aparece]                    │
│  ¿Cuál medicamento?                 │
│  [_______________]                  │
│  Presiona Enter para continuar      │
└─────────────────────────────────────┘
        ↓ (Enter)
┌─────────────────────────────────────┐
│  Pregunta 2 de 14          14%      │
│  ████████░░░░░░░░░░░░░░░░░░░░░░    │
├─────────────────────────────────────┤
│                                     │
│  ¿Su estado de salud lo            │
│     considera bueno?                │
│                                     │
│  😢 Mal  😐 Regular  😊 Excelente  │
│                                     │
└─────────────────────────────────────┘
```

---

## 📋 14 Preguntas Configuradas

### **Lista Completa**

1. ¿Es usted alérgico a algún medicamento? (👎👍 + input si es Sí)
2. ¿Su estado de salud lo considera bueno? (😢😐😊)
3. ¿Ha acudido al médico en el último año? (👎👍)
4. ¿Ha padecido alguna enfermedad en los últimos 6 meses? (👎👍)
5. ¿Padece de hipertensión? (👎👍)
6. ¿Está tomando algún medicamento actualmente? (👎👍)
7. ¿Padece diabetes? (👎👍)
8. ¿Tiene alteraciones renales? (👎👍)
9. ¿Ha padecido cáncer? (👎👍)
10. ¿Tiene tendencia al sangrado excesivo? (👎👍)
11. ¿Estás embarazada? (si aplica) (👎👍)
12. ¿Padeces epilepsia? (👎👍)
13. ¿Tomas medicamentos anticoagulantes? (👎👍)
14. ¿Tomas aspirinas regularmente? (👎👍)

---

## ✨ Características

### **1. Una Pregunta a la Vez**
- Solo se muestra UNA pregunta en pantalla
- Recuadro grande y centrado
- Sin distracciones

### **2. Avance Automático**
- Al hacer click en una respuesta
- Transición suave (300ms)
- Siguiente pregunta aparece automáticamente

### **3. Barra de Progreso**
```
Pregunta X de 14        XX%
████████████░░░░░░░░░░░░
```
- Muestra progreso en tiempo real
- Porcentaje actualizado
- Visual y motivador

### **4. Dos Tipos de Respuesta**

#### **Pulgares (Sí/No)**
```
👎 No        👍 Sí
[160px]     [160px]
```
- Botones gigantes
- Rojo (No) y Verde (Sí)
- Hover: crece y sube
- Click: se comprime

#### **Emojis (Mal/Regular/Excelente)**
```
😢 Mal  😐 Regular  😊 Excelente
[112px]  [112px]    [112px]
```
- 3 opciones visuales
- Colores: Rojo/Amarillo/Verde
- Hover: crece
- Click: se comprime

### **5. Input Condicional**
Si respondes "Sí" a la primera pregunta:
```
¿Cuál medicamento?
[___________________]
Presiona Enter para continuar
```
- Input aparece con animación
- Auto-focus
- Enter para continuar
- O click en el texto

---

## 🎨 Animaciones

### **Entrada de Pregunta**
```typescript
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
```
- Entra desde la derecha
- Sale hacia la izquierda
- Transición de 300ms

### **Hover en Botones**
```typescript
whileHover={{ scale: 1.05, y: -5 }}
```
- Crece 5%
- Sube 5px

### **Click en Botones**
```typescript
whileTap={{ scale: 0.95 }}
```
- Se comprime al hacer click

### **Input Condicional**
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```
- Aparece desde abajo

---

## 🔄 Flujo Completo

### **Paso 1: Datos Personales**
- Formulario tradicional con todos los campos
- Botón "Siguiente" al final

### **Paso 2: Antecedentes Personales** ⭐ NUEVO
- **UNA pregunta a la vez**
- **14 preguntas en total**
- **Avance automático**
- Al completar → Avanza al Paso 3

### **Paso 3: Historia Clínica Dental**
- Formulario tradicional
- Botón "Siguiente" al final

### **Paso 4: Firma y Fotografía**
- Canvas de firma
- Upload de foto
- Botón "Enviar" al final

---

## 📊 Progreso Visual

```
Pregunta 1  →  7%   ████░░░░░░░░░░░░░░░░░░░░░░░░
Pregunta 2  →  14%  ████████░░░░░░░░░░░░░░░░░░░░
Pregunta 3  →  21%  ████████████░░░░░░░░░░░░░░░░
...
Pregunta 14 →  100% ████████████████████████████
```

Cada pregunta suma ~7% al progreso total.

---

## 🎯 Ventajas del Nuevo Sistema

### **Para el Paciente**
- ✅ **Menos abrumador** - Solo ve una pregunta
- ✅ **Más enfocado** - Atención en una cosa a la vez
- ✅ **Más rápido** - No hay que buscar dónde responder
- ✅ **Más divertido** - Interactivo y dinámico
- ✅ **Progreso claro** - Sabe cuánto falta

### **Para la Clínica**
- ✅ **Mayor completación** - Menos abandono
- ✅ **Datos más precisos** - Respuestas más pensadas
- ✅ **Experiencia moderna** - Diferenciación
- ✅ **Menos errores** - Una pregunta = más atención

---

## 🔧 Detalles Técnicos

### **Componente Creado**
```tsx
<AntecedentesInteractivos
  formData={formData}
  onComplete={(data) => {
    setFormData({ ...formData, ...data })
    nextStep()
  }}
/>
```

### **Estado Interno**
```typescript
const [paso, setPaso] = useState(0)
const [respuestas, setRespuestas] = useState({})
const [mostrarInput, setMostrarInput] = useState(false)
```

### **Lógica de Avance**
```typescript
const handleRespuesta = (valor: string) => {
  // Guardar respuesta
  setRespuestas({ ...respuestas, [id]: valor })
  
  // Si tiene input y respondió "si"
  if (tieneInput && valor === "si") {
    setMostrarInput(true)
  } else {
    // Avanzar automáticamente
    setTimeout(() => setPaso(paso + 1), 300)
  }
}
```

---

## 📱 Responsive

### **Móviles**
- Botones: 128x128px (pulgares) / 96x96px (emojis)
- Iconos: 64x64px (pulgares) / 56x56px (emojis)
- Texto: 2xl
- Padding: 8

### **Desktop**
- Botones: 160x160px (pulgares) / 112x112px (emojis)
- Iconos: 80x80px (pulgares) / 64x64px (emojis)
- Texto: 3xl-4xl
- Padding: 12

---

## ✅ Comparación

### **Antes (Todas las Preguntas)**
```
┌─────────────────────────────┐
│ ¿Alérgico?     ( ) Sí ( ) No│
│ ¿Salud buena?  ( ) Sí ( ) No│
│ ¿Médico?       ( ) Sí ( ) No│
│ ...                         │
│ [14 preguntas visibles]     │
│                             │
│ [Botón Siguiente]           │
└─────────────────────────────┘
```
- Abrumador
- Scroll largo
- Difícil de enfocar

### **Ahora (Una a la Vez)**
```
┌─────────────────────────────┐
│  Pregunta 1 de 14      7%   │
│  ████░░░░░░░░░░░░░░░░░░░░  │
├─────────────────────────────┤
│                             │
│  ¿Es usted alérgico a      │
│  algún medicamento?         │
│                             │
│     👎 No      👍 Sí        │
│                             │
└─────────────────────────────┘
```
- Enfocado ✅
- Sin scroll ✅
- Avance automático ✅
- Progreso visible ✅

---

## 🎉 Resultado Final

El **Paso 2** ahora es:
- ✅ **Interactivo** - Una pregunta a la vez
- ✅ **Automático** - Avanza solo
- ✅ **Visual** - Barra de progreso
- ✅ **Moderno** - Botones grandes
- ✅ **Rápido** - Sin clicks extra
- ✅ **Claro** - Sin distracciones

**¡Exactamente como la encuesta que me mostraste!** 🎯✨

---

## 🚀 Pruébalo Ahora

```bash
npm run dev
```

1. Ve a `http://localhost:3000/`
2. Completa el **Paso 1: Datos Personales**
3. Click en "Siguiente"
4. Verás el **Paso 2** con UNA pregunta a la vez
5. Responde y verás cómo avanza automáticamente
6. Completa las 14 preguntas
7. Automáticamente irás al **Paso 3**

**¡Disfruta la nueva experiencia tipo encuesta!** 🎊
