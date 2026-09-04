# 🎯 SISTEMA DE PROGRESO PARA PROSPECTOS

## ✅ OBJETIVO

Mostrar en el CRM el progreso de cada prospecto, indicando en qué paso se quedó y permitir continuar el registro desde ahí.

---

## 📋 FLUJO COMPLETO

```
1. Historia Clínica (/)           → 25%
2. Formulario Completo (/formulario-completo) → 50%
3. Aprobación Crédito (automática) → 65%
4. Contrato (/contrato)           → 80%
5. Consentimiento (/consentimiento) → 100%
```

---

## 🗄️ PASO 1: EJECUTAR SQL EN SUPABASE

**Archivo:** `supabase-progreso-prospectos.sql`

### **Columnas agregadas a `historias_clinicas`:**
- `progreso_paso` - Último paso completado
- `progreso_porcentaje` - Porcentaje de completitud (0-100)
- `formulario_completo` - Boolean
- `aprobacion_credito` - Boolean
- `contrato_firmado` - Boolean
- `consentimiento_firmado` - Boolean
- `fecha_ultimo_paso` - Timestamp
- `url_continuar` - URL para continuar

### **Nueva tabla `progreso_registro`:**
Tracking detallado de cada paso con timestamps y datos JSON.

### **Funciones SQL creadas:**
1. `actualizar_progreso_prospecto(historia_id, paso_actual, completado)`
2. `get_prospectos_incompletos()` - Retorna prospectos con progreso < 100%

---

## 💻 PASO 2: COMPONENTE DE PROGRESO

**Archivo creado:** `components/progreso-prospecto.tsx`

### **Características:**
- ✅ Barra de progreso visual
- ✅ Lista de 5 pasos con íconos
- ✅ Estados: Completado (verde), Actual (teal), Pendiente (gris)
- ✅ Muestra días de inactividad
- ✅ Botón "Continuar Registro"
- ✅ Alerta si está inactivo > 7 días
- ✅ Animaciones con Framer Motion

### **Props:**
```typescript
{
  progresoPaso: string          // 'historia_clinica', 'contrato', etc.
  progresoPorcentaje: number    // 0-100
  urlContinuar?: string         // URL para continuar
  fechaUltimoPaso?: string      // Timestamp
  onContinuar?: () => void      // Callback
}
```

---

## 🔧 PASO 3: INTEGRAR EN PÁGINA DE PACIENTES

### **Actualizar `/app/crm/pacientes/page.tsx`:**

#### **1. Agregar import:**
```typescript
import { ProgresoProspecto } from "@/components/progreso-prospecto"
```

#### **2. Agregar estado para dialog:**
```typescript
const [isProgresoDialogOpen, setIsProgresoDialogOpen] = useState(false)
```

#### **3. Actualizar fetchData para obtener campos de progreso:**
```typescript
const { data: prospectosData, error: prospectosError } = await supabase
  .from('historias_clinicas')
  .select(`
    *,
    progreso_paso,
    progreso_porcentaje,
    url_continuar,
    fecha_ultimo_paso,
    formulario_completo,
    contrato_firmado,
    consentimiento_firmado
  `)
  .eq('convertido_paciente', false)
  .order('created_at', { ascending: false })
```

#### **4. Agregar botón "Ver Progreso" en cada prospecto:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    setSelectedPaciente(prospecto)
    setIsProgresoDialogOpen(true)
  }}
  className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-600"
>
  <Activity className="w-4 h-4 mr-1" />
  Ver Progreso
</Button>
```

#### **5. Agregar Dialog de Progreso:**
```typescript
<Dialog open={isProgresoDialogOpen} onOpenChange={setIsProgresoDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Progreso del Registro</DialogTitle>
      <DialogDescription>
        {selectedPaciente?.nombre || 'Prospecto'}
      </DialogDescription>
    </DialogHeader>

    {selectedPaciente && (
      <ProgresoProspecto
        progresoPaso={selectedPaciente.progreso_paso || 'historia_clinica'}
        progresoPorcentaje={selectedPaciente.progreso_porcentaje || 25}
        urlContinuar={selectedPaciente.url_continuar}
        fechaUltimoPaso={selectedPaciente.fecha_ultimo_paso}
        onContinuar={() => {
          if (selectedPaciente.url_continuar) {
            window.open(selectedPaciente.url_continuar, '_blank')
          }
        }}
      />
    )}
  </DialogContent>
</Dialog>
```

---

## 📊 PASO 4: ACTUALIZAR PROGRESO EN CADA PASO

### **En cada página del flujo, agregar llamada a función:**

#### **Historia Clínica (`/app/historia-clinica.tsx`):**
```typescript
// Después de guardar
await supabase.rpc('actualizar_progreso_prospecto', {
  historia_id: historiaId,
  paso_actual: 'historia_clinica',
  completado: true
})
```

#### **Formulario Completo (`/app/formulario-completo/page.tsx`):**
```typescript
// Al completar todas las preguntas
await supabase.rpc('actualizar_progreso_prospecto', {
  historia_id: historiaId,
  paso_actual: 'formulario_completo',
  completado: true
})
```

#### **Aprobación Crédito (automático):**
```typescript
// Después de mostrar aprobación
await supabase.rpc('actualizar_progreso_prospecto', {
  historia_id: historiaId,
  paso_actual: 'aprobacion_credito',
  completado: true
})
```

#### **Contrato (`/app/contrato/page.tsx`):**
```typescript
// Al enviar contrato
await supabase.rpc('actualizar_progreso_prospecto', {
  historia_id: historiaId,
  paso_actual: 'contrato',
  completado: true
})
```

#### **Consentimiento (`/app/consentimiento/page.tsx`):**
```typescript
// Al enviar consentimiento
await supabase.rpc('actualizar_progreso_prospecto', {
  historia_id: historiaId,
  paso_actual: 'consentimiento',
  completado: true
})
```

---

## 🎨 PASO 5: INDICADORES VISUALES EN LISTA

### **Agregar badge de progreso en cada prospecto:**

```typescript
{selectedView === 'prospectos' && (
  <div className="flex items-center gap-2">
    <Badge 
      variant="outline" 
      className={`
        ${prospecto.progreso_porcentaje === 100 ? 'bg-green-50 text-green-600 border-green-200' : ''}
        ${prospecto.progreso_porcentaje >= 50 && prospecto.progreso_porcentaje < 100 ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
        ${prospecto.progreso_porcentaje < 50 ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
      `}
    >
      {prospecto.progreso_porcentaje}% Completado
    </Badge>
    
    {prospecto.progreso_porcentaje < 100 && (
      <span className="text-xs text-muted-foreground">
        Último paso: {getNombrePaso(prospecto.progreso_paso)}
      </span>
    )}
  </div>
)}
```

### **Función helper:**
```typescript
const getNombrePaso = (paso: string) => {
  const nombres: Record<string, string> = {
    'historia_clinica': 'Historia Clínica',
    'formulario_completo': 'Formulario',
    'aprobacion_credito': 'Aprobación',
    'contrato': 'Contrato',
    'consentimiento': 'Consentimiento',
  }
  return nombres[paso] || paso
}
```

---

## 🔍 PASO 6: FILTROS ADICIONALES

### **Agregar filtros por progreso:**

```typescript
<Select value={filterProgreso} onValueChange={setFilterProgreso}>
  <SelectTrigger>
    <SelectValue placeholder="Filtrar por progreso" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="todos">Todos</SelectItem>
    <SelectItem value="incompleto">Incompletos (< 100%)</SelectItem>
    <SelectItem value="bajo">Bajo progreso (< 50%)</SelectItem>
    <SelectItem value="medio">Medio progreso (50-80%)</SelectItem>
    <SelectItem value="alto">Alto progreso (> 80%)</SelectItem>
    <SelectItem value="completo">Completos (100%)</SelectItem>
  </SelectContent>
</Select>
```

---

## 📈 PASO 7: DASHBOARD DE PROSPECTOS

### **Agregar estadísticas en dashboard:**

```typescript
const statsProspectos = [
  {
    title: "Prospectos Activos",
    value: prospectos.length,
    icon: Users,
  },
  {
    title: "Progreso Bajo",
    value: prospectos.filter(p => p.progreso_porcentaje < 50).length,
    icon: AlertCircle,
    color: "text-amber-500",
  },
  {
    title: "Casi Completos",
    value: prospectos.filter(p => p.progreso_porcentaje >= 80 && p.progreso_porcentaje < 100).length,
    icon: TrendingUp,
    color: "text-blue-500",
  },
  {
    title: "Listos para Convertir",
    value: prospectos.filter(p => p.progreso_porcentaje === 100).length,
    icon: CheckCircle,
    color: "text-green-500",
  },
]
```

---

## 🚀 PASO 8: FUNCIONALIDAD "CONTINUAR"

### **Permitir continuar desde donde se quedó:**

```typescript
const handleContinuarRegistro = (prospecto: any) => {
  // Guardar ID en localStorage para recuperar datos
  localStorage.setItem('prospecto_continuar_id', prospecto.id)
  
  // Redirigir a la URL correspondiente
  if (prospecto.url_continuar) {
    window.location.href = prospecto.url_continuar
  }
}
```

### **En cada página, recuperar datos si existe ID:**

```typescript
useEffect(() => {
  const prospectoId = localStorage.getItem('prospecto_continuar_id')
  if (prospectoId) {
    // Cargar datos del prospecto
    cargarDatosProspecto(prospectoId)
    // Limpiar localStorage
    localStorage.removeItem('prospecto_continuar_id')
  }
}, [])
```

---

## ✅ RESULTADO FINAL

### **En el CRM verás:**

1. **Lista de Prospectos con:**
   - Badge de progreso (25%, 50%, 80%, 100%)
   - Último paso completado
   - Días de inactividad
   - Botón "Ver Progreso"

2. **Dialog de Progreso con:**
   - Barra de progreso visual
   - Lista de 5 pasos con estados
   - Botón "Continuar Registro"
   - Alertas de inactividad

3. **Filtros por:**
   - Progreso (bajo, medio, alto, completo)
   - Días de inactividad
   - Estado del prospecto

4. **Estadísticas:**
   - Prospectos activos
   - Progreso bajo (< 50%)
   - Casi completos (80-99%)
   - Listos para convertir (100%)

---

## 🎯 BENEFICIOS

✅ **Visibilidad total** del estado de cada prospecto
✅ **Seguimiento** de prospectos abandonados
✅ **Recuperación** de registros incompletos
✅ **Métricas** de conversión por paso
✅ **Experiencia mejorada** para el usuario
✅ **Eficiencia** del equipo de ventas

---

## 📝 NOTAS IMPORTANTES

1. **Ejecutar SQL primero** antes de usar el sistema
2. **Actualizar cada página** del flujo para registrar progreso
3. **Probar flujo completo** para verificar tracking
4. **Monitorear prospectos** inactivos regularmente
5. **Hacer seguimiento** a prospectos con progreso > 80%

---

## 🔄 PRÓXIMOS PASOS OPCIONALES

- [ ] Notificaciones automáticas por email/SMS
- [ ] Recordatorios para prospectos inactivos
- [ ] Análisis de abandono por paso
- [ ] A/B testing de flujo
- [ ] Integración con WhatsApp para seguimiento

**¡Sistema de progreso listo para implementar!** 🚀✨
