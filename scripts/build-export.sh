#!/bin/bash

echo "🚀 Iniciando build de producción..."

# Ejecutar el build de Next.js
npm run build

echo "📦 Creando carpeta out..."

# Crear carpeta out si no existe
mkdir -p out

# Copiar archivos del build
echo "📋 Copiando archivos..."
cp -r .next/static out/_next/
cp -r public/* out/ 2>/dev/null || true

# Crear archivo de información
cat > out/README.txt << EOF
===========================================
   CLINICA FORM - BUILD DE PRODUCCIÓN
===========================================

Fecha de build: $(date)

INSTRUCCIONES PARA DESPLEGAR:

1. Sube todo el contenido de esta carpeta a tu servidor
2. Configura tu servidor web (Apache/Nginx) para servir archivos estáticos
3. Asegúrate de que las variables de entorno de Supabase estén configuradas

ARCHIVOS INCLUIDOS:
- _next/static/: Archivos estáticos de Next.js
- public/: Archivos públicos (imágenes, etc.)

NOTA: Esta aplicación requiere Node.js para ejecutarse.
Para producción, usa: npm start

===========================================
EOF

echo "✅ Build completado!"
echo "📁 Carpeta 'out' creada con éxito"
echo ""
echo "Para desplegar, ejecuta:"
echo "  npm start"
echo ""
