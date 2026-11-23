// Exporta la silla armada a assets/silla.glb (para <model-viewer> y AR).
//
// Uso (necesita three@0.180.0 instalado junto a este script o en una carpeta padre):
//   npm i three@0.180.0
//   node exportar_glb.mjs <ruta/a/silla.js> <ruta/de/salida.glb>

import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// GLTFExporter usa FileReader para la salida binaria; Node no lo trae.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then((b) => { this.result = 'data:application/octet-stream;base64,' + Buffer.from(b).toString('base64'); this.onloadend?.(); }); }
};

const [, , rutaSilla, salida] = process.argv;
const { crearSilla } = await import(pathToFileURL(resolve(rutaSilla)).href);
const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');

const { grupo } = crearSilla('#d2ad82');
grupo.traverse((o) => { if (o.name === 'agujero') o.visible = false; });   // discos de agujero fuera del GLB
grupo.updateMatrixWorld(true);

const glb = await new GLTFExporter().parseAsync(grupo, { binary: true, onlyVisible: true });
writeFileSync(salida, Buffer.from(glb));
console.log(`OK -> ${salida} (${Math.round(glb.byteLength / 1024)} KB)`);
