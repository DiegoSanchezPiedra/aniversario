# Nuestro cuarto aniversario · Una aventura para dos

Web estática (HTML, CSS y JavaScript, sin dependencias ni compilación) para la escapada del sábado 28 de noviembre de 2026.

## Ver la web en tu ordenador

Abre `index.html` con el navegador. Para probarla igual que publicada:

```bash
python3 -m http.server 8000
# y abre http://localhost:8000
```

## Publicarla

Sube la carpeta completa (sin `.impeccable/`, que solo sirvió para el diseño) a cualquiera de estos servicios:

- **Netlify Drop**: entra en https://app.netlify.com/drop y arrastra la carpeta.
- **GitHub Pages**: sube los archivos a un repositorio y activa Pages en *Settings → Pages*.
- **Vercel**: `npx vercel` dentro de la carpeta.

## Personalizar (`js/config.js`)

| Ajuste | Qué hace |
|---|---|
| `nombres` | Cómo os llama la web (portada, álbum y dedicatoria). |
| `inicio` | Día en que empezasteis (cuenta los días juntos). |
| `viaje` | Día de la escapada (cuenta atrás y marca «Ahora» ese día). |
| `firma` | Firma bajo «Te quiero.» Vacía = sin firma. |
| `cancion` | Canción que se publica con la web (opcional, nunca empieza sola). |

### Música

En el botón «Música» (abajo a la derecha): «Elegir canción» carga un archivo de audio de tu dispositivo (MP3, M4A, OGG, WAV…). Solo suena al pulsar reproducir. La última canción elegida se recuerda en ese navegador, pero no se reproduce sola. Si cambias `cancion` en `config.js`, la web vuelve a usar esa.

Si quieres que la canción vaya incluida al publicar, copia el archivo en `assets/musica/` y pon su ruta en `cancion`. Usa música de la que tengas derechos para publicarla.

## Imprimir o guardar en PDF

Botón «Imprimir o guardar en PDF» → en el diálogo del navegador elige «Guardar como PDF». La versión impresa es un itinerario limpio con horas, paradas y nombres de los lugares.

## Lo que hay que confirmar antes del viaje

- **Sushi Fu Japonés (Platja d'Aro)**: mesa para el sábado 28 a las 21:00. La web lo marca como pendiente.
- Los tiempos de trayecto entre paradas no están calculados: consúltalos en Google Maps (botón «La ruta del día en Google Maps»).

## Créditos

Fotografías de Wikimedia Commons con licencias CC BY / CC BY-SA. Los autores aparecen en «Créditos de las fotografías», al final de la web. Tipografías: Bodoni Moda, Alegreya y La Belle Aurore (Google Fonts).
