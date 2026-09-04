# 🔐 Credenciales de Acceso al CRM

## Sistema de Autenticación Implementado

El CRM ahora cuenta con un sistema de autenticación para proteger el acceso a la información de pacientes.

### 📋 Credenciales de Acceso

**Usuario:** `Dr Erick Mancilla`  
**Contraseña:** `dents23`

### 🔗 Acceso al Sistema

**URL de Login:** `/crm/login`

Para acceder al CRM, los usuarios deben:
1. Navegar a `/crm/login`
2. Ingresar las credenciales
3. El sistema validará y redirigirá al dashboard

### 🛡️ Páginas Protegidas

Las siguientes páginas requieren autenticación:
- `/crm` - Dashboard principal
- `/crm/pacientes` - Gestión de pacientes y prospectos
- `/crm/citas` - Gestión de citas y seguimientos
- `/crm/pagos` - Gestión de pagos y planes de pago

### 🔄 Sesión

- La sesión se guarda en `localStorage`
- El usuario permanece autenticado hasta que cierre sesión
- Botón "Cerrar Sesión" disponible en todas las páginas del CRM

### 👤 Información del Usuario

El nombre del usuario autenticado se muestra en el header del CRM con:
- Avatar con iniciales
- Nombre completo
- Rol: Administrador

### 🔧 Archivos Relacionados

- `/app/crm/login/page.tsx` - Página de login
- `/lib/auth-helpers.ts` - Funciones de autenticación
- Todas las páginas del CRM incluyen verificación de autenticación

### 📝 Notas de Seguridad

⚠️ **IMPORTANTE:** Las credenciales actuales son para desarrollo. En producción se debe:
1. Implementar autenticación con base de datos
2. Usar hash de contraseñas
3. Implementar tokens JWT o similar
4. Agregar sistema de roles y permisos
5. Implementar recuperación de contraseña
6. Agregar autenticación de dos factores (opcional)

---

**Última actualización:** Noviembre 2024  
**Sistema:** Dents23 CRM - Sistema de Gestión Dental
