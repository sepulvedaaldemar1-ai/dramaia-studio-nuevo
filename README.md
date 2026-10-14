# DramaIA Studio — reconstrucción limpia

Aplicación web estática y funciones serverless de Vercel; no requiere instalar un framework.

## Despliegue
1. Crea un repositorio NUEVO en GitHub y sube todos los archivos de esta carpeta.
2. En Vercel, importa ese repositorio.
3. En Settings → Environment Variables, crea `GEMINI_API_KEY` con la clave real de Gemini.
4. Opcional: `GEMINI_MODEL` = `gemini-2.5-flash`.
5. Despliega y prueba primero Generar historia; después Generar storyboard.

## Endpoints
- POST /api/generate-story
- POST /api/generate-storyboard

Los borradores se guardan en localStorage del navegador. Esta primera versión genera guiones y prompts visuales, no imágenes ni videos. La clave nunca debe estar en el HTML ni en GitHub.
