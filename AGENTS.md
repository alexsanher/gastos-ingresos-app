# AGENTS.md — Control de gastos e ingresos
Web estática para registrar gastos e ingresos del dia a dia. Poder mirar las estadisticas de los gastos por meses, categorias... Proyecto didáctico: el código debe poder entenderlo alguien que empieza a 
programar. 
## Stack y estructura - HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build. - `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos). - Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES 
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor. 
## Convenciones - Textos de la interfaz en español. - Código simple, nombres descriptivos y comentarios solo donde aporten. - Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil. 
## Datos - localStorage, clave `control-gastos-ingresos`: array de `{ date: "AAAA-MM-DD", topic, 
minutes }`. - Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario 
perderá sus sesiones. 
## Límites 
## Fechas (fácil equivocarse) - Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new 
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día. -
## Forma de trabajar - Haz solo lo que se pide: no añadas funcionalidades por tu cuenta. - Cambios pequeños y enfocados; no reescribas lo que ya funciona. - Al terminar, resume qué has cambiado y cualquier decisión que deba revisar. - 
✅
 Siempre: respetar las reglas de fechas, mantener los textos en español. - 
⚠
 Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados. - 
�
�
 Nunca: añadir dependencias, frameworks o un paso de build. 
## Verificación - No hay tests ni lint. Probar abriendo `index.html` en el navegador. - Para empezar de cero: DevTools → Application → Local Storage → borrar la clave 
`control-gastos-ingresos`