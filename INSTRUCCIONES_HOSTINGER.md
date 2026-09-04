# 🚀 Instrucciones para Subir a Hostinger

## ✅ Archivos Generados

Tu aplicación ha sido exportada como **sitio estático HTML** en la carpeta `out/`

---

## 📁 Estructura de la Carpeta OUT

```
out/
├── index.html                    ← Página principal (redirect a formulario)
├── 404.html                      ← Página de error
├── dents23-logo.svg             ← Logo de Dent's 23
├── _next/                        ← Archivos JavaScript y CSS
│   ├── static/
│   └── ...
├── formulario-completo/          ← Formulario interactivo
│   └── index.html
├── contrato/                     ← Contrato de autorización
│   └── index.html
├── consentimiento/               ← Consentimiento informado
│   └── index.html
├── crm/                          ← Sistema CRM
│   ├── index.html
│   ├── citas/
│   ├── pacientes/
│   └── pagos/
└── historia-interactiva/         ← Formulario alternativo
    └── index.html
```

---

## 🌐 Cómo Subir a Hostinger

### **Método 1: File Manager (Recomendado)**

1. **Accede a tu Panel de Hostinger**
   - Ve a https://hpanel.hostinger.com
   - Inicia sesión con tu cuenta

2. **Abre el File Manager**
   - En tu hosting, busca "File Manager"
   - O ve a "Archivos" → "Administrador de archivos"

3. **Navega a public_html**
   ```
   /domains/tudominio.com/public_html/
   ```

4. **Limpia la carpeta (si es necesario)**
   - Elimina archivos existentes (index.html, etc.)
   - O crea una subcarpeta para tu app

5. **Sube los archivos**
   - Click en "Upload" o "Subir archivos"
   - Selecciona **TODA** la carpeta `out/`
   - O arrastra y suelta los archivos
   - Espera a que termine la carga

6. **Verifica la estructura**
   ```
   public_html/
   ├── index.html
   ├── _next/
   ├── formulario-completo/
   ├── contrato/
   └── ...
   ```

---

### **Método 2: FTP (Alternativo)**

1. **Obtén credenciales FTP**
   - En Hostinger: "FTP Accounts" o "Cuentas FTP"
   - Anota: Host, Usuario, Contraseña, Puerto

2. **Usa un cliente FTP**
   - FileZilla (recomendado): https://filezilla-project.org
   - Cyberduck: https://cyberduck.io
   - WinSCP (Windows): https://winscp.net

3. **Conecta por FTP**
   ```
   Host: ftp.tudominio.com
   Usuario: tu_usuario_ftp
   Contraseña: tu_contraseña
   Puerto: 21
   ```

4. **Sube los archivos**
   - Navega a `/public_html/`
   - Arrastra toda la carpeta `out/` al servidor
   - Espera a que termine

---

## 🔧 Configuración Importante

### **1. Archivo .htaccess (Opcional pero Recomendado)**

Crea un archivo `.htaccess` en `public_html/` con:

```apache
# Habilitar compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache de archivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Redirecciones limpias
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1.html [L]
```

### **2. Permisos de Archivos**

Asegúrate de que los permisos sean correctos:
- **Carpetas**: 755
- **Archivos**: 644

---

## 🌍 URLs de tu Sitio

Después de subir, tus páginas estarán disponibles en:

```
https://tudominio.com/                    → Página principal
https://tudominio.com/formulario-completo → Formulario interactivo
https://tudominio.com/contrato            → Contrato
https://tudominio.com/consentimiento      → Consentimiento
https://tudominio.com/crm                 → Sistema CRM
```

---

## ✅ Checklist de Verificación

Después de subir, verifica:

- [ ] `https://tudominio.com/` carga correctamente
- [ ] El logo se ve (dents23-logo.svg)
- [ ] El fondo teal con partículas aparece
- [ ] El formulario funciona (34 preguntas)
- [ ] Los botones responden
- [ ] Las animaciones funcionan
- [ ] El modal de aprobación aparece
- [ ] La navegación entre páginas funciona
- [ ] El CRM es accesible

---

## 🔄 Actualizar el Sitio

Cuando hagas cambios:

1. **Genera nueva exportación**
   ```bash
   npm run build
   ```

2. **Sube solo archivos modificados**
   - Reemplaza archivos en `public_html/`
   - O sube toda la carpeta `out/` de nuevo

3. **Limpia caché del navegador**
   - Ctrl + F5 (Windows)
   - Cmd + Shift + R (Mac)

---

## 🚨 Solución de Problemas

### **Problema: Página en blanco**
- Verifica que `index.html` esté en la raíz de `public_html/`
- Revisa que la carpeta `_next/` se haya subido completa

### **Problema: Archivos no cargan**
- Verifica permisos (755 para carpetas, 644 para archivos)
- Asegúrate de que `_next/static/` tenga todos los archivos

### **Problema: Logo no aparece**
- Verifica que `dents23-logo.svg` esté en la raíz
- Revisa la ruta en el navegador

### **Problema: Estilos no se aplican**
- Verifica que `_next/static/css/` tenga los archivos CSS
- Limpia caché del navegador

### **Problema: JavaScript no funciona**
- Verifica que `_next/static/chunks/` tenga los archivos JS
- Revisa la consola del navegador (F12)

---

## 📊 Tamaño Total

```
Carpeta out/: ~5-10 MB
Archivos: ~50-100 archivos
Tiempo de carga: 1-3 minutos (depende de conexión)
```

---

## 🎯 Comandos Útiles

### **Generar exportación**
```bash
npm run build
```

### **Probar localmente**
```bash
npm run dev
```

### **Ver carpeta out**
```bash
cd out
ls -la
```

### **Comprimir para subir**
```bash
cd out
zip -r dents23-export.zip .
```

---

## 📝 Notas Importantes

1. **Supabase**: Si usas Supabase, asegúrate de que las credenciales estén configuradas
2. **Variables de entorno**: No se incluyen en la exportación (son públicas)
3. **API Routes**: No funcionan en exportación estática (usa Supabase)
4. **Imágenes**: Todas están optimizadas (`unoptimized: true`)
5. **Rutas**: Todas tienen trailing slash (`/formulario-completo/`)

---

## 🎉 ¡Listo!

Tu sitio de Dent's 23 está listo para producción en Hostinger.

### **Características Incluidas**
- ✅ Formulario interactivo (34 preguntas)
- ✅ Aprobación de crédito con confetti
- ✅ Contrato de autorización
- ✅ Consentimiento informado
- ✅ Sistema CRM completo
- ✅ Diseño responsive
- ✅ Fondo teal con partículas
- ✅ Logo de Dent's 23
- ✅ Animaciones suaves

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los archivos en File Manager
3. Contacta soporte de Hostinger
4. Revisa este documento

**¡Tu sitio está listo para el mundo!** 🚀✨
