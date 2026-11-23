// Silla Nórdica generada por código.
//
// Cada pieza es un THREE.Group con nombre (A_L, B_R, C, …) cuyo origen es el
// centro de la pieza en su posición final. Los agujeros se definen en
// coordenadas del mundo con la silla armada y se convierten a coordenadas
// locales de la pieza, así un tornillo o un marcador colgado de la pieza se
// mueve con ella (explosión, deslizamiento, giro del travesaño).
//
// Unidades: metros. Frente de la silla hacia +Z, piso en y = 0.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const PIEZAS = {
  A: { nombre: 'Pata trasera', cant: 2, desc: 'Pata alta que sostiene el respaldo. Tiene agujeros atrás y en el costado.' },
  B: { nombre: 'Pata delantera', cant: 2, desc: 'Pata corta. Recibe el travesaño lateral D y el frontal E.' },
  C: { nombre: 'Asiento', cant: 1, desc: 'Tabla de 46 × 40 cm. Se fija desde abajo con 4 tornillos cortos.' },
  D: { nombre: 'Travesaño lateral', cant: 2, desc: 'Une la pata delantera con la trasera. La lengüeta con agujeros va hacia adentro.' },
  E: { nombre: 'Travesaño frontal', cant: 1, desc: 'Une las dos patas delanteras.' },
  F: { nombre: 'Respaldo', cant: 1, desc: 'Tabla superior que une las dos patas traseras.' },
};

export const HERRAJES = {
  H1: { nombre: 'Perno largo', medida: 'M6 × 60 mm', cant: 8 },
  H2: { nombre: 'Tornillo corto', medida: '4 × 30 mm', cant: 4 },
  H3: { nombre: 'Tarugo de madera', medida: '8 × 30 mm', cant: 4 },
  LL: { nombre: 'Llave Allen', medida: '4 mm', cant: 1 },
};

const S = 0.036;            // sección de las patas
const X = 0.2;              // distancia del centro a cada pata en X
const Z = 0.19;             // distancia del centro a cada pata en Z

// Instancias: id, tipo, posición final y giro en Y.
export const INSTANCIAS = [
  { id: 'A_L', tipo: 'A', pos: [-X, 0.45, -Z] },
  { id: 'A_R', tipo: 'A', pos: [X, 0.45, -Z] },
  { id: 'B_L', tipo: 'B', pos: [-X, 0.2, Z] },
  { id: 'B_R', tipo: 'B', pos: [X, 0.2, Z] },
  { id: 'D_L', tipo: 'D', pos: [-X, 0.37, 0] },
  { id: 'D_R', tipo: 'D', pos: [X, 0.37, 0], rotY: Math.PI },
  { id: 'E', tipo: 'E', pos: [0, 0.33, Z] },
  { id: 'F', tipo: 'F', pos: [0, 0.79, -Z] },
  { id: 'C', tipo: 'C', pos: [0, 0.414, 0.03] },
];

// Desplazamiento para la vista explosionada y para la posición de espera
// (de donde parte la pieza cuando se desliza a su lugar).
export const EXPLOSION = {
  A_L: [-0.16, 0.04, -0.14], A_R: [0.16, 0.04, -0.14],
  B_L: [-0.16, 0, 0.14], B_R: [0.16, 0, 0.14],
  D_L: [-0.07, 0.02, 0], D_R: [0.07, 0.02, 0],
  E: [0, -0.02, 0.24], F: [0, 0.16, -0.2], C: [0, 0.24, 0.02],
};
export const ESPERA = {
  A_L: [0, 0.1, -0.38], A_R: [0, 0.1, -0.38],
  B_L: [-0.28, 0.04, 0.12], B_R: [0.28, 0.04, 0.12],
  D_L: [0.04, 0.2, 0.34], D_R: [-0.04, 0.2, 0.34],
  E: [0, 0.16, 0.32], F: [0, 0.3, -0.16], C: [0, 0.36, 0.02],
};

// Agujeros en el mundo con la silla armada.
// pos = punto en la superficie · dir = sentido en que entra el herraje.
const AGUJEROS_MUNDO = [
  // Paso 1 · tarugos en los extremos de los travesaños D
  ['D_L', 'H3', [-X, 0.355, 0.172], [0, 0, -1]],
  ['D_L', 'H3', [-X, 0.355, -0.172], [0, 0, 1]],
  ['D_R', 'H3', [X, 0.355, 0.172], [0, 0, -1]],
  ['D_R', 'H3', [X, 0.355, -0.172], [0, 0, 1]],
  // Paso 2 · pernos desde el frente de las patas B hacia D
  ['B_L', 'H1', [-X, 0.375, Z + S / 2], [0, 0, -1]],
  ['B_R', 'H1', [X, 0.375, Z + S / 2], [0, 0, -1]],
  // Paso 3 · pernos desde el costado de las patas B hacia E
  ['B_L', 'H1', [-X - S / 2, 0.33, Z], [1, 0, 0]],
  ['B_R', 'H1', [X + S / 2, 0.33, Z], [-1, 0, 0]],
  // Paso 4 · pernos desde atrás de las patas A hacia D
  ['A_L', 'H1', [-X, 0.375, -Z - S / 2], [0, 0, 1]],
  ['A_R', 'H1', [X, 0.375, -Z - S / 2], [0, 0, 1]],
  // Paso 5 · pernos desde el costado de las patas A hacia el respaldo F
  ['A_L', 'H1', [-X - S / 2, 0.79, -Z], [1, 0, 0]],
  ['A_R', 'H1', [X + S / 2, 0.79, -Z], [-1, 0, 0]],
  // Paso 6 · tornillos desde abajo de la lengüeta de D hacia el asiento C
  ['D_L', 'H2', [-0.18, 0.382, 0.09], [0, 1, 0]],
  ['D_L', 'H2', [-0.18, 0.382, -0.09], [0, 1, 0]],
  ['D_R', 'H2', [0.18, 0.382, 0.09], [0, 1, 0]],
  ['D_R', 'H2', [0.18, 0.382, -0.09], [0, 1, 0]],
];

// ------------------------------------------------------------ materiales
export function crearMaterialMadera(color = '#d2ad82') {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0 });
  m.name = 'madera';
  return m;
}
const MAT_METAL = new THREE.MeshStandardMaterial({ color: '#5d626d', roughness: 0.35, metalness: 0.85, name: 'metal' });
const MAT_AGUJERO = new THREE.MeshBasicMaterial({ color: '#2b2118', name: 'agujero' });
const MAT_TARUGO = new THREE.MeshStandardMaterial({ color: '#e2c79d', roughness: 0.8, name: 'tarugo' });

// ------------------------------------------------------------ geometría de cada tipo
function malla(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Construye el contenido de una pieza (centrado en su origen). */
export function construirPieza(tipo, mat) {
  const g = new THREE.Group();
  switch (tipo) {
    case 'A': g.add(malla(new RoundedBoxGeometry(S, 0.9, S, 2, 0.006), mat)); break;
    case 'B': g.add(malla(new RoundedBoxGeometry(S, 0.4, S, 2, 0.006), mat)); break;
    case 'C': g.add(malla(new RoundedBoxGeometry(0.46, 0.028, 0.4, 3, 0.011), mat)); break;
    case 'E': g.add(malla(new RoundedBoxGeometry(0.364, 0.06, 0.022, 2, 0.005), mat)); break;
    case 'F': {
      // Respaldo levemente curvo: tabla extruida sobre un arco.
      const forma = new THREE.Shape();
      const w = 0.182, r = 1.0, prof = 0.02;
      const curva = (x) => r - Math.sqrt(r * r - x * x);
      forma.moveTo(-w, curva(-w));
      for (let i = -w; i <= w + 1e-6; i += w / 12) forma.lineTo(i, curva(i));
      for (let i = w; i >= -w - 1e-6; i -= w / 12) forma.lineTo(i, curva(i) + prof);
      forma.closePath();
      const geo = new THREE.ExtrudeGeometry(forma, { depth: 0.11, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 });
      geo.rotateX(Math.PI / 2);          // borde curvado hacia adelante
      geo.translate(0, 0.055, -0.017);
      g.add(malla(geo, mat));
      break;
    }
    case 'D': {
      g.add(malla(new RoundedBoxGeometry(0.022, 0.06, 0.344, 2, 0.005), mat));
      const lengueta = malla(new THREE.BoxGeometry(0.018, 0.018, 0.3), mat);
      lengueta.position.set(0.02, 0.021, 0);   // lado +X = "adentro" para D_L
      lengueta.name = 'lengueta';
      g.add(lengueta);
      break;
    }
  }
  return g;
}

/** Herraje con el vástago hacia -Y desde el origen (la cabeza queda en y ≥ 0). */
export function crearHerraje(tipo) {
  const g = new THREE.Group();
  g.userData.tipo = tipo;
  if (tipo === 'H1') {
    const cab = malla(new THREE.CylinderGeometry(0.0075, 0.0075, 0.004, 20), MAT_METAL); cab.position.y = 0.002;
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.0012, 6), MAT_AGUJERO); hex.position.y = 0.0041;
    const vas = malla(new THREE.CylinderGeometry(0.003, 0.003, 0.06, 12), MAT_METAL); vas.position.y = -0.03;
    g.add(cab, hex, vas); g.userData.largo = 0.06;
  } else if (tipo === 'H2') {
    const cab = malla(new THREE.CylinderGeometry(0.005, 0.0035, 0.0025, 16), MAT_METAL); cab.position.y = 0.00125;
    const vas = malla(new THREE.CylinderGeometry(0.002, 0.0012, 0.03, 10), MAT_METAL); vas.position.y = -0.015;
    g.add(cab, vas); g.userData.largo = 0.03;
  } else if (tipo === 'H3') {
    const t = malla(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 14), MAT_TARUGO);
    g.add(t); g.userData.largo = 0.015;
  } else if (tipo === 'LL') {
    const a = malla(new THREE.BoxGeometry(0.004, 0.08, 0.004), MAT_METAL); a.position.y = -0.04;
    const b = malla(new THREE.BoxGeometry(0.025, 0.004, 0.004), MAT_METAL); b.position.x = 0.0105;
    g.add(a, b); g.userData.largo = 0.08;
  }
  return g;
}

/** Orienta un herraje para que entre en `dir` (local de la pieza). */
export function orientarHerraje(h, dir) {
  h.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
}

// ------------------------------------------------------------ silla completa
export function crearSilla(color) {
  const grupo = new THREE.Group();
  grupo.name = 'SillaNordica';
  const materiales = [];
  const piezas = {};

  for (const inst of INSTANCIAS) {
    const mat = crearMaterialMadera(color);
    materiales.push(mat);
    const p = construirPieza(inst.tipo, mat);
    p.name = inst.id;
    p.userData = { id: inst.id, tipo: inst.tipo, final: new THREE.Vector3(...inst.pos), rotY: inst.rotY || 0, material: mat };
    p.position.fromArray(inst.pos);
    p.rotation.y = inst.rotY || 0;
    p.traverse((o) => { if (o.isMesh) o.userData.pieza = inst.id; });
    piezas[inst.id] = p;
    grupo.add(p);
  }

  // Convertir agujeros a coordenadas locales de su pieza (silla armada).
  grupo.updateMatrixWorld(true);
  const agujeros = {};
  const cuenta = {};
  for (const [pid, herraje, pos, dir] of AGUJEROS_MUNDO) {
    const p = piezas[pid];
    const k = (cuenta[pid + herraje] = (cuenta[pid + herraje] || 0) + 1);
    const id = `${pid}_${herraje}_${k}`;
    const local = p.worldToLocal(new THREE.Vector3(...pos));
    const dirLocal = new THREE.Vector3(...dir).applyQuaternion(p.quaternion.clone().invert());
    agujeros[id] = { id, pieza: pid, herraje, local, dir: dirLocal };

    // Marca visual del agujero (disco oscuro apenas fuera de la superficie).
    {
      const radio = herraje === 'H2' ? 0.0028 : herraje === 'H3' ? 0.0045 : 0.0042;
      const disco = new THREE.Mesh(new THREE.CircleGeometry(radio, 16), MAT_AGUJERO);
      disco.position.copy(local).addScaledVector(dirLocal, -0.0006);
      disco.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dirLocal.clone().negate());
      disco.name = 'agujero';
      p.add(disco);
    }
  }

  return {
    grupo, piezas, agujeros, materiales,
    setColor(hex) { materiales.forEach((m) => m.color.set(hex)); },
  };
}

/** Pieza suelta (para miniaturas del inventario). */
export function crearPiezaSuelta(tipo, color) {
  const g = construirPieza(tipo, crearMaterialMadera(color));
  return g;
}
