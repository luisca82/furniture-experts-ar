# Furniture Experts · Silla Nórdica con guía AR

Prototipo académico. **Furniture Experts** (la mueblería) y **AR Innovation** (la desarrolladora de la guía) son empresas ficticias. Los precios, los productos y las reseñas son de demostración.

## Cómo verlo

Hace falta un servidor local, porque los módulos JS no cargan desde `file://`:

```bash
cd sitio && python3 -m http.server 8765
```

Luego se abre http://localhost:8765. La página necesita internet para cargar las fuentes, three.js y model-viewer desde CDN.

## Qué hay

- **Página de producto:** visor 3D con vistas (giro, frente, lateral, detalle y piezas), acabados que cambian el material, carrito simulado, sección «Combina con» y reseñas simuladas con filtros. Las reseñas nuevas se guardan solo en el navegador.
- **Guía de armado** (botón «Cómo armarla»):
  - Inventario de piezas y herrajes, con la opción de pedir un repuesto (simulado).
  - 7 pasos: las piezas se deslizan a su lugar, se elige el herraje en la bandeja y se toca cada agujero.
  - Si se elige un herraje equivocado, aparece un aviso ámbar y el error queda registrado.
  - El paso 2 es crítico: los travesaños llegan girados y no se puede avanzar si se confirman al revés.
  - Al final se muestran el tiempo, los errores y las pistas, y se puede descargar un CSV con todos los intentos para las pruebas con usuarios.
- **AR:** `<model-viewer>` con `assets/silla.glb`. Usa WebXR o Scene Viewer en Android y Quick Look en iOS. En computadora solo se ve en 3D.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura de la tienda, la guía y los diálogos |
| `css/tokens.css` | Tokens visuales (adaptados de Condoal) |
| `css/sitio.css`, `css/guia.css` | Estilos |
| `js/datos.js` | Producto, acabados, sugeridos, reseñas e íconos |
| `js/tienda.js` | Visor, carrito, sugeridos, reseñas y AR |
| `js/guia/silla.js` | Silla generada por código: piezas, agujeros y herrajes |
| `js/guia/pasos.js` | La secuencia de armado (para editar textos, cámaras o pasos) |
| `js/guia/guia.js` | La lógica de la guía |
| `js/guia/escena.js` | Escena three.js compartida |
| `js/guia/entorno.js` | Sala de Atlas (`assets/sala.spz`) o, si no está, la sala simple |
| `js/guia/registro.js` | Registro de intentos y exportación a CSV |
| `herramientas/exportar_glb.mjs` | Vuelve a generar `assets/silla.glb` si cambia `silla.js` |

## Pendiente

- **Sala de Atlas:** generar `assets/sala.spz` y, si hace falta, `assets/sala.json` con `pos`, `rotY`, `escala` y `quat`. Mientras no exista, la guía usa una sala simple y en la consola aparece un 404 esperado.
- Probar la AR en celulares reales.
- Publicar en una URL estática (GitHub Pages, Netlify, etc.).
