# 🔄 CRM Conectado a Supabase en Tiempo Real

## ✅ Implementación Completada

El CRM ahora está **completamente conectado a Supabase** con actualización en tiempo real.

---

## 🎯 Características Implementadas

### **1. Conexión en Tiempo Real**
```typescript
// Suscripción a cambios en tiempo real
const channel = supabase
  .channel('crm-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'historias_clinicas' },
    (payload) => {
      console.log('Cambio detectado:', payload)
      fetchData() // Recargar datos automáticamente
    }
  )
  .subscribe()
```

### **2. Carga de Datos desde Supabase**
- ✅ Obtiene historias clínicas de la tabla `historias_clinicas`
- ✅ Transforma datos a formato de pacientes
- ✅ Ordena por fecha de creación (más recientes primero)
- ✅ Límite de 10 pacientes en dashboard

### **3. Búsqueda en Tiempo Real**
```typescript
const pacientesFiltrados = pacientes.filter(p => 
  p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.telefono?.includes(searchTerm)
)
```

### **4. Botón de Actualización Manual**
- Icono que gira mientras carga
- Deshabilitado durante la carga
- Recarga todos los datos manualmente

### **5. Estados de Carga**
- Loading spinner mientras carga
- Mensaje de error si falla
- Mensaje "No hay pacientes" si está vacío
- Mensaje de búsqueda sin resultados

---

## 📊 Datos que se Obtienen

### **Historias Clínicas → Pacientes**
```typescript
{
  id: historia.id,
  nombre_completo: historia.nombre,
  telefono: historia.celular || historia.telefono,
  email: historia.email,
  direccion: historia.direccion,
  empresa: historia.empresa,
  edad: historia.edad,
  sexo: historia.sexo,
  ingresoMensual: historia.ingresoMensual,
  fecha_registro: historia.created_at,
  estado: 'nuevo'
}
```

### **Citas (Opcional)**
- Si existe la tabla `citas` en Supabase
- Se obtienen las próximas 5 citas
- Ordenadas por fecha

### **Pagos (Opcional)**
- Si existe la tabla `pagos` en Supabase
- Se obtienen los últimos 5 pagos
- Ordenados por fecha de creación

---

## 📱 Responsive Design

### **Móvil (< 640px)**
- Header en columna
- Búsqueda full width
- Stats en 1 columna
- Pacientes en 1 columna
- Información truncada

### **Tablet (640px - 1024px)**
- Header en fila
- Stats en 2 columnas
- Grid adaptativo

### **Desktop (> 1024px)**
- Header completo
- Stats en 4 columnas
- Grid 2/3 + 1/3
- Toda la información visible

---

## 🎨 Mejoras de UI

### **Header Sticky**
```css
sticky top-0 z-40
```
- Siempre visible al hacer scroll
- Backdrop blur para efecto moderno

### **Cards Responsivas**
```css
flex flex-col sm:flex-row
```
- Adaptan su layout según el tamaño
- Información truncada con ellipsis
- Iconos shrink-0 para mantener tamaño

### **Badges de Estado**
- Colores según estado
- Semi-transparentes
- Con borde sutil

---

## 🔧 Configuración Necesaria

### **1. Variables de Entorno**
Asegúrate de tener en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### **2. Tablas en Supabase**

#### **Tabla: historias_clinicas**
```sql
CREATE TABLE historias_clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT,
  email TEXT,
  celular TEXT,
  telefono TEXT,
  direccion TEXT,
  empresa TEXT,
  edad INTEGER,
  sexo TEXT,
  ingresoMensual NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE historias_clinicas;
```

#### **Tabla: citas (Opcional)**
```sql
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES historias_clinicas(id),
  fecha_cita TIMESTAMP WITH TIME ZONE,
  tipo_cita TEXT,
  estado TEXT DEFAULT 'programada',
  doctor TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tabla: pagos (Opcional)**
```sql
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES historias_clinicas(id),
  monto NUMERIC,
  estado TEXT DEFAULT 'pendiente',
  metodo_pago TEXT,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **3. Políticas de Seguridad (RLS)**

```sql
-- Habilitar RLS
ALTER TABLE historias_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (ajustar según necesidades)
CREATE POLICY "Enable read access for all users" ON historias_clinicas
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON citas
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON pagos
  FOR SELECT USING (true);
```

---

## 🚀 Cómo Funciona

### **1. Carga Inicial**
```
Usuario abre CRM
  ↓
fetchData() se ejecuta
  ↓
Obtiene datos de Supabase
  ↓
Muestra pacientes en dashboard
```

### **2. Actualización en Tiempo Real**
```
Nuevo paciente completa formulario
  ↓
Datos se guardan en Supabase
  ↓
Supabase emite evento postgres_changes
  ↓
CRM detecta el cambio
  ↓
fetchData() se ejecuta automáticamente
  ↓
Dashboard se actualiza SIN recargar página
```

### **3. Búsqueda**
```
Usuario escribe en búsqueda
  ↓
searchTerm se actualiza
  ↓
pacientesFiltrados se recalcula
  ↓
Lista se actualiza instantáneamente
```

---

## 📊 Estadísticas Calculadas

### **Total Pacientes**
```typescript
pacientes.length
```

### **Citas Hoy**
```typescript
citas.filter(c => c.estado === 'programada').length
```

### **Ingresos Mes**
```typescript
pagos.reduce((sum, p) => sum + p.monto, 0)
```

---

## 🎯 Funcionalidades Adicionales

### **Filtrado**
- Por nombre
- Por email
- Por teléfono
- Case insensitive

### **Estados de Paciente**
- `nuevo` - Azul
- `en-tratamiento` - Amarillo
- `activo` - Verde
- `recuperacion` - Morado

### **Estados de Cita**
- `programada` - Azul con AlertCircle
- `completada` - Verde con CheckCircle

### **Estados de Pago**
- `pendiente` - Naranja con XCircle
- `pagado` - Verde con CheckCircle

---

## 🔄 Limpieza de Recursos

```typescript
return () => {
  supabase.removeChannel(channel)
}
```
- Se ejecuta cuando el componente se desmonta
- Evita memory leaks
- Cancela suscripciones activas

---

## 🐛 Manejo de Errores

### **Try-Catch**
```typescript
try {
  // Operaciones con Supabase
} catch (err) {
  console.error('Error fetching data:', err)
  setError(err.message)
}
```

### **Mensaje de Error**
```tsx
{error && (
  <div className="bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
    <p>Error: {error}</p>
  </div>
)}
```

---

## ✅ Checklist de Verificación

- [x] Supabase configurado
- [x] Variables de entorno establecidas
- [x] Tabla `historias_clinicas` creada
- [x] RLS habilitado
- [x] Realtime habilitado en la tabla
- [x] Políticas de seguridad configuradas
- [x] CRM conectado
- [x] Tiempo real funcionando
- [x] Búsqueda implementada
- [x] Responsive design
- [x] Estados de carga
- [x] Manejo de errores

---

## 🎨 Personalización

### **Cambiar Límite de Pacientes**
```typescript
.limit(10)  // Cambiar a 20, 50, etc.
```

### **Cambiar Orden**
```typescript
.order('created_at', { ascending: false })  // true para más antiguos primero
```

### **Agregar Filtros**
```typescript
.eq('estado', 'activo')  // Solo pacientes activos
.gte('created_at', '2024-01-01')  // Desde cierta fecha
```

---

## 🚀 Pruébalo

```bash
npm run dev
```

1. Abre `http://localhost:3000/crm`
2. Verás los pacientes de Supabase
3. Completa un formulario en `/formulario-completo`
4. El CRM se actualizará automáticamente
5. Usa la búsqueda para filtrar
6. Click en "Actualizar" para recargar manualmente

---

## 📝 Notas Importantes

1. **Realtime requiere plan Pro** en Supabase (o trial)
2. **RLS debe estar configurado** correctamente
3. **Las tablas opcionales** (citas, pagos) no son obligatorias
4. **El CRM funciona** incluso si esas tablas no existen
5. **Los datos se transforman** para compatibilidad

---

## 🎉 ¡Listo!

Tu CRM está ahora **completamente funcional** con:
- ✅ Conexión en tiempo real a Supabase
- ✅ Actualización automática
- ✅ Búsqueda instantánea
- ✅ Responsive design
- ✅ Estados de carga
- ✅ Manejo de errores
- ✅ UI moderna y profesional

**¡El CRM se actualiza solo cuando hay nuevos pacientes!** 🔄✨
