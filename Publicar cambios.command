#!/bin/bash
#
# Aequalend — Publicar cambios del formulario de LOs
# Doble clic en este archivo para subir tus cambios a producción.
#

# Ir a la carpeta donde está este script (la del proyecto)
cd "$(dirname "$0")"

echo ""
echo "═══════════════════════════════════════════════"
echo "   AEQUALEND — Publicar formulario de LOs"
echo "═══════════════════════════════════════════════"
echo ""

# ¿Hay cambios para publicar?
if [ -z "$(git status --porcelain)" ]; then
  echo "✓ No hay cambios nuevos. Todo está al día."
  echo ""
  echo "Presiona cualquier tecla para cerrar…"
  read -n 1 -s
  exit 0
fi

echo "📝 Cambios detectados:"
git status --short
echo ""

# Guardar y subir
echo "⏳ Subiendo cambios a GitHub…"
git add .
git commit -m "Actualización del formulario — $(date '+%Y-%m-%d %H:%M')"

if git push origin main; then
  echo ""
  echo "═══════════════════════════════════════════════"
  echo "   ✅ ¡LISTO! Cambios publicados."
  echo ""
  echo "   Netlify actualizará el sitio en ~30 segundos."
  echo "═══════════════════════════════════════════════"
else
  echo ""
  echo "❌ Hubo un problema al subir. Revisa tu conexión"
  echo "   o avísale a tu equipo técnico."
fi

echo ""
echo "Presiona cualquier tecla para cerrar…"
read -n 1 -s
