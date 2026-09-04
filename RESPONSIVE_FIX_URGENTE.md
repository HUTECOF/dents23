# 🚨 FIX URGENTE - CRM Responsive

## ❌ Problema Detectado

El archivo `/app/crm/citas/page.tsx` está **corrupto** y necesita ser restaurado.

---

## ✅ Solución Rápida

### **Opción 1: Restaurar desde backup**
Si tienes un backup del archivo, restáuralo.

### **Opción 2: Revertir cambios**
```bash
# Si tienes git
git checkout app/crm/citas/page.tsx

# Si no tienes git, descarga el archivo original
```

### **Opción 3: Aplicar cambios manualmente**

---

## 📱 Cambios Necesarios para Responsive

### **1. Header (línea ~233)**

**Cambiar:**
```tsx
<div className="flex h-16 items-center px-6">
```

**Por:**
```tsx
<div className="flex flex-col gap-3 px-4 sm:px-6 py-3 sm:py-0 sm:flex-row sm:h-16 sm:items-center">
```

### **2. Botones de Vista (línea ~252)**

**Cambiar:**
```tsx
<Button
  variant={selectedView === "citas" ? "default" : "ghost"}
  size="sm"
  onClick={() => setSelectedView("citas")}
  className={selectedView === "citas" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}
>
  <CalendarIcon className="w-4 h-4 mr-2" />
  Citas
</Button>
```

**Por:**
```tsx
<Button
  variant={selectedView === "citas" ? "default" : "ghost"}
  size="sm"
  onClick={() => setSelectedView("citas")}
  className={`flex-1 sm:flex-none ${selectedView === "citas" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
>
  <CalendarIcon className="w-4 h-4 sm:mr-2" />
  <span className="hidden sm:inline">Citas</span>
</Button>
```

### **3. Input de Búsqueda (línea ~273)**

**Cambiar:**
```tsx
<Input
  placeholder={selectedView === "citas" ? "Buscar citas..." : "Buscar seguimientos..."}
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="pl-10 w-80 bg-background/50"
/>
```

**Por:**
```tsx
<Input
  placeholder="Buscar..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="pl-10 w-full sm:w-64 bg-background/50"
/>
```

### **4. Grid de Stats (línea ~309)**

**Cambiar:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
```

**Por:**
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
```

### **5. Cards de Citas (línea ~448)**

**Cambiar:**
```tsx
className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors"
```

**Por:**
```tsx
className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors gap-3"
```

### **6. Contenido de Citas**

**Cambiar:**
```tsx
<div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-full bg-medical-teal/10 flex items-center justify-center">
    <Calendar className="w-6 h-6 text-medical-teal" />
  </div>
  <div className="flex-1">
    <h3 className="font-medium">{cita.paciente_nombre}</h3>
```

**Por:**
```tsx
<div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
  </div>
  <div className="flex-1 min-w-0">
    <h3 className="font-medium truncate">{cita.paciente_nombre}</h3>
```

### **7. Info de Citas**

**Cambiar:**
```tsx
<div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
```

**Por:**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs sm:text-sm text-muted-foreground mt-1">
```

### **8. Badges y Botones**

**Cambiar:**
```tsx
<div className="flex items-center gap-3">
  <Badge className={getEstadoBadge(cita.estado)}>
    {getEstadoIcon(cita.estado)}
    <span className="ml-1">{cita.estado}</span>
  </Badge>
```

**Por:**
```tsx
<div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
  <Badge className={getEstadoBadge(cita.estado)}>
    {getEstadoIcon(cita.estado)}
    <span className="ml-1 text-xs">{cita.estado}</span>
  </Badge>
```

---

## 🎯 Clases Responsive Clave

### **Flex Direction**
- `flex-col sm:flex-row` - Columna en móvil, fila en desktop
- `sm:items-center` - Centrar en desktop

### **Spacing**
- `gap-3 sm:gap-4` - Menos espacio en móvil
- `p-3 sm:p-4` - Menos padding en móvil
- `px-4 sm:px-6` - Menos padding horizontal en móvil

### **Sizing**
- `w-full sm:w-64` - Full width en móvil, fijo en desktop
- `w-10 sm:w-12` - Más pequeño en móvil
- `text-xs sm:text-sm` - Texto más pequeño en móvil

### **Visibility**
- `hidden sm:inline` - Ocultar en móvil
- `hidden sm:block` - Ocultar en móvil
- `sm:hidden` - Ocultar en desktop

### **Truncate**
- `truncate` - Cortar texto largo
- `line-clamp-2` - Máximo 2 líneas
- `min-w-0` - Permitir shrink
- `shrink-0` - No permitir shrink

---

## 🔧 Aplicar Todos los Cambios

1. **Abre** `/app/crm/citas/page.tsx`
2. **Busca** cada sección mencionada
3. **Reemplaza** con el código responsive
4. **Guarda** el archivo
5. **Compila**: `npm run build`

---

## ✅ Checklist

- [ ] Header responsive
- [ ] Botones de vista responsive
- [ ] Búsqueda responsive
- [ ] Grid de stats 2 columnas en móvil
- [ ] Cards de citas responsive
- [ ] Texto truncado
- [ ] Badges más pequeños
- [ ] Padding reducido en móvil
- [ ] Gaps reducidos en móvil

---

## 🚀 Resultado Esperado

### **Móvil (< 640px)**
- Header en columna
- Botones solo con iconos
- Búsqueda full width
- Stats en 2 columnas
- Citas en columna
- Texto truncado

### **Tablet (640px - 1024px)**
- Header en fila
- Botones con texto
- Stats en 2 columnas
- Citas en fila

### **Desktop (> 1024px)**
- Todo en fila
- Stats en 4 columnas
- Máximo espacio

---

## 📝 Nota Importante

El archivo actual está **corrupto** debido a un error en la edición.
**DEBES restaurarlo primero** antes de aplicar los cambios responsive.

Si no tienes backup, puedes:
1. Copiar el contenido de otro archivo similar
2. Reescribir las secciones problemáticas
3. O contactar para obtener el archivo completo

---

## 🎯 Prioridad

**ALTA** - El CRM no funciona sin este archivo correcto.

Aplica los cambios en orden y verifica después de cada uno.
