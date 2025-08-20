# Instrucciones para desplegar en Vercel

1. Haz login en Vercel y conecta tu repositorio (o sube el código manualmente).
2. En la configuración del proyecto en Vercel, selecciona:
   - **Framework Preset:** Create React App
   - **Build Command:** npm run build
   - **Output Directory:** build
3. Asegúrate de que el archivo `vercel.json` esté en la raíz del proyecto (ya está creado).
4. ¡Listo! Vercel detectará automáticamente el frontend y lo servirá como SPA.

Si usas variables de entorno, agrégalas en la sección "Environment Variables" de Vercel.
