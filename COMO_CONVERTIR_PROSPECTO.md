# 🔄 Cómo Convertir Prospecto a Paciente

## ✅ PROBLEMA RESUELTO

Se agregó el componente `Toaster` de sonner al layout principal para mostrar notificaciones.

---

## 📋 PASOS PARA CONVERTIR UN PROSPECTO

### **1. Asegúrate de tener el SQL ejecutado**

Primero, verifica que ejecutaste `supabase-schema-final.sql` en Supabase:

```sql
-- Esta función debe existir en tu base de datos
CREATE OR REPLACE FUNCTION convertir_prospecto_a_paciente(historia_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  nuevo_paciente_id UUID;
  historia RECORD;
BEGIN
  -- Obtener datos de la historia clínica
  SELECT * INTO historia
  FROM historias_clinicas
  WHERE id = historia_id;

  -- Verificar que existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Historia clínica no encontrada';
  END IF;

  -- Verificar que no esté ya convertido
  IF historia.convertido_paciente THEN
    RAISE EXCEPTION 'Este prospecto ya fue convertido a paciente';
  END IF;

  -- Crear el paciente
  INSERT INTO pacientes (
    historia_clinica_id,
    nombre_completo,
    telefono,
    email,
    fecha_nacimiento,
    edad,
    sexo,
    direccion,
    empresa,
    ocupacion,
    antiguedad,
    ingreso_mensual,
    estado,
    prioridad
  ) VALUES (
    historia.id,
    historia.nombre,
    COALESCE(historia.celular, historia.telefono),
    historia.email,
    historia.fecha,
    historia.edad,
    historia.sexo,
    historia.direccion,
    historia.empresa,
    historia.ocupacion,
    historia.antiguedad,
    historia.ingreso_mensual,
    'activo',
    'media'
  )
  RETURNING id INTO nuevo_paciente_id;

  -- Actualizar la historia clínica
  UPDATE historias_clinicas
  SET 
    estado_prospecto = 'paciente',
    convertido_paciente = TRUE,
    fecha_conversion = NOW()
  WHERE id = historia_id;

  RETURN nuevo_paciente_id;
END;
$$;
```

### **2. Verificar que la función existe**

En Supabase SQL Editor, ejecuta:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'convertir_prospecto_a_paciente';
```

Debe retornar 1 fila.

### **3. Usar la función en el CRM**

#### **Opción A: Desde la UI**

1. Ir a `/crm/pacientes`
2. Click en pestaña **"Prospectos"**
3. Encontrar el prospecto que quieres convertir
4. Click en botón **"Convertir"** (verde con ícono de check)
5. Confirmar en el dialog
6. ¡Listo! Verás una notificación de éxito

#### **Opción B: Desde código**

```typescript
import { supabase } from '@/lib/supabase'

const convertirProspecto = async (historiaClinicaId: string) => {
  const { data, error } = await supabase
    .rpc('convertir_prospecto_a_paciente', { 
      historia_id: historiaClinicaId 
    })

  if (error) {
    console.error('Error:', error)
    return null
  }

  console.log('Nuevo paciente ID:', data)
  return data // Retorna el ID del nuevo paciente
}
```

---

## 🔍 TROUBLESHOOTING

### **Error: "function convertir_prospecto_a_paciente does not exist"**

**Solución:** Ejecuta el SQL `supabase-schema-final.sql` en Supabase.

### **Error: "Este prospecto ya fue convertido a paciente"**

**Solución:** Este prospecto ya es paciente. Búscalo en la pestaña "Pacientes".

### **Error: "Historia clínica no encontrada"**

**Solución:** Verifica que el ID de la historia clínica sea correcto.

### **No aparece notificación**

**Solución:** Ya está resuelto. El `Toaster` de sonner ahora está en el layout.

### **El prospecto no aparece en la lista**

**Solución:** 
1. Verifica que la historia clínica tenga `convertido_paciente = FALSE`
2. Refresca la página
3. Verifica en Supabase que el registro existe:

```sql
SELECT id, nombre, convertido_paciente, estado_prospecto
FROM historias_clinicas
WHERE convertido_paciente = FALSE;
```

---

## ✅ VERIFICAR QUE FUNCIONÓ

### **1. En la UI**

- El prospecto desaparece de la pestaña "Prospectos"
- Aparece en la pestaña "Pacientes"
- Verás una notificación verde: "¡Prospecto convertido a paciente exitosamente!"

### **2. En Supabase**

```sql
-- Ver el nuevo paciente
SELECT * FROM pacientes 
WHERE historia_clinica_id = 'TU_HISTORIA_ID';

-- Ver que la historia se actualizó
SELECT id, nombre, convertido_paciente, estado_prospecto, fecha_conversion
FROM historias_clinicas
WHERE id = 'TU_HISTORIA_ID';
```

Debe mostrar:
- `convertido_paciente`: `true`
- `estado_prospecto`: `'paciente'`
- `fecha_conversion`: fecha y hora actual

---

## 🎯 FLUJO COMPLETO

```
┌─────────────────────────────────────┐
│ 1. Usuario llena Historia Clínica  │
│    - Formulario en /                │
│    - Se guarda en historias_clinicas│
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 2. Aparece como PROSPECTO           │
│    - /crm/pacientes (Prospectos)    │
│    - convertido_paciente = FALSE    │
│    - estado_prospecto = 'prospecto' │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 3. Personal decide convertir        │
│    - Click en "Convertir"           │
│    - Dialog de confirmación         │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 4. Función SQL se ejecuta           │
│    - Crea registro en pacientes     │
│    - Actualiza historia_clinica     │
│    - Retorna ID del nuevo paciente  │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 5. Ahora es PACIENTE ACTIVO         │
│    - Aparece en pestaña Pacientes   │
│    - estado = 'activo'              │
│    - Puede tener citas, pagos, etc. │
└─────────────────────────────────────┘
```

---

## 📊 DATOS QUE SE COPIAN

Cuando conviertes un prospecto, estos datos se copian automáticamente:

✅ Nombre completo
✅ Teléfono (celular o teléfono fijo)
✅ Email
✅ Fecha de nacimiento
✅ Edad
✅ Sexo
✅ Dirección
✅ Empresa
✅ Ocupación
✅ Antigüedad
✅ Ingreso mensual

**Valores por defecto:**
- `estado`: 'activo'
- `prioridad`: 'media'

---

## 🚀 ¡LISTO!

Ahora puedes convertir prospectos a pacientes sin problemas. Las notificaciones funcionarán correctamente gracias al `Toaster` que agregamos al layout.

**Recuerda:**
- Ejecutar el SQL primero
- Refrescar la página si no ves cambios
- Verificar en Supabase si tienes dudas
