# 🚀 Configuración de Supabase

## ✅ Integración Completada

Tu aplicación ahora está integrada con Supabase para guardar todos los datos de los pacientes.

## 📋 Pasos para Configurar Supabase

### 1. Ejecutar el Script SQL

Ve a tu proyecto de Supabase:
1. Abre **SQL Editor** en el panel de Supabase
2. Copia y pega el contenido del archivo `supabase-schema.sql`
3. Haz clic en **Run** para ejecutar el script

Esto creará:
- ✅ Tabla `historias_clinicas`
- ✅ Tabla `contratos`
- ✅ Tabla `consentimientos`
- ✅ Bucket de Storage `pacientes` (para fotos y firmas)
- ✅ Índices para mejor rendimiento
- ✅ Políticas de seguridad (RLS)

### 2. Verificar las Credenciales

Las credenciales ya están configuradas en `lib/supabase.ts`:

```typescript
const supabaseUrl = 'https://bdgcokzyqvbzluxppxsa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### 3. Verificar Storage

1. Ve a **Storage** en Supabase
2. Verifica que el bucket `pacientes` se haya creado
3. Dentro del bucket habrá dos carpetas:
   - `firmas/` - Para las firmas digitales
   - `fotos/` - Para las fotos de los pacientes

## 🎯 Funcionalidades Implementadas

### Guardado Automático en Supabase

1. **Historia Clínica** → Se guarda en `historias_clinicas`
   - Sube la firma a `pacientes/firmas/`
   - Sube la foto a `pacientes/fotos/`
   - Guarda las URLs en la base de datos

2. **Contrato** → Se guarda en `contratos`
   - Se relaciona con la historia clínica mediante `historia_clinica_id`

3. **Consentimiento** → Se guarda en `consentimientos`
   - Se relaciona con la historia clínica mediante `historia_clinica_id`

### Estructura de Datos

```
historias_clinicas (tabla principal)
├── id (UUID)
├── created_at
├── datos personales (nombre, email, etc.)
├── antecedentes médicos
├── historia dental
├── firma_paciente_url (URL de Supabase Storage)
└── foto_paciente_url (URL de Supabase Storage)

contratos
├── id (UUID)
├── historia_clinica_id (FK)
└── datos del contrato

consentimientos
├── id (UUID)
├── historia_clinica_id (FK)
└── datos del consentimiento
```

## 🔍 Consultar Datos

### Ver todos los pacientes

```sql
SELECT * FROM historias_clinicas ORDER BY created_at DESC;
```

### Ver expediente completo de un paciente

```sql
SELECT 
  hc.*,
  c.*,
  con.*
FROM historias_clinicas hc
LEFT JOIN contratos c ON c.historia_clinica_id = hc.id
LEFT JOIN consentimientos con ON con.historia_clinica_id = hc.id
WHERE hc.id = 'UUID_DEL_PACIENTE';
```

## 🛠️ Funciones Helper Disponibles

En `lib/supabase-helpers.ts`:

- `saveHistoriaClinica(data)` - Guarda historia clínica y sube archivos
- `saveContrato(data, historiaClinicaId)` - Guarda contrato
- `saveConsentimiento(data, historiaClinicaId)` - Guarda consentimiento
- `getAllPacientes()` - Obtiene todos los pacientes
- `getExpedienteCompleto(historiaClinicaId)` - Obtiene expediente completo

## 📊 Flujo de Datos

```
1. Usuario llena Historia Clínica
   ↓
2. Se guarda en Supabase (historias_clinicas)
   ↓
3. Se obtiene el ID de la historia clínica
   ↓
4. Usuario llena Contrato
   ↓
5. Se guarda en Supabase (contratos) con el ID de la historia
   ↓
6. Usuario llena Consentimiento
   ↓
7. Se guarda en Supabase (consentimientos) con el ID de la historia
   ↓
8. Animación de verificación (15 segundos)
   ↓
9. Se genera y descarga el PDF
   ↓
10. Se limpian los datos locales
```

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acceso configuradas
- ✅ Storage público solo para lectura
- ✅ Las credenciales están en el código (considera usar variables de entorno en producción)

## 🚨 Importante

Para producción, considera:
1. Mover las credenciales a variables de entorno (`.env.local`)
2. Ajustar las políticas de RLS según tus necesidades
3. Implementar autenticación de usuarios
4. Configurar backups automáticos en Supabase

## ✅ Verificación

Para verificar que todo funciona:

1. Ejecuta `npm run dev`
2. Llena el formulario completo
3. Revisa la consola del navegador para ver los logs:
   - ✅ Historia clínica guardada en Supabase con ID: xxx
   - ✅ Contrato guardado en Supabase
   - ✅ Consentimiento guardado en Supabase
   - 🎉 Expediente completo guardado en Supabase!
4. Ve a Supabase y verifica que los datos estén en las tablas
5. Ve a Storage y verifica que las fotos y firmas se hayan subido

## 📝 Notas

- Los datos también se guardan en `localStorage` como respaldo
- Si Supabase falla, la aplicación continúa funcionando con localStorage
- El PDF se genera con todos los datos, independientemente de dónde estén guardados
