// Escena three.js compartida por el visor del producto y la guía.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function crearEscena(canvas, { fondo = null, sombras = true, fov = 38 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: fondo === null, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = sombras;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  if (fondo) scene.background = new THREE.Color(fondo);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.01, 200);
  camera.position.set(1.2, 1, 1.5);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.45, 0);
  controls.minDistance = 0.35;
  controls.maxDistance = 4;
  controls.maxPolarAngle = Math.PI * 0.62;

  // Luces: cielo suave + una luz principal con sombra.
  scene.add(new THREE.HemisphereLight('#ffffff', '#d9d4cc', 1.6));
  const sol = new THREE.DirectionalLight('#ffffff', 2.2);
  sol.position.set(1.6, 2.6, 1.4);
  sol.castShadow = sombras;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -1.2; sol.shadow.camera.right = 1.2;
  sol.shadow.camera.top = 1.2; sol.shadow.camera.bottom = -1.2;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.01;
  scene.add(sol);
  const relleno = new THREE.DirectionalLight('#dfe6ff', 0.6);
  relleno.position.set(-1.5, 1.2, -1);
  scene.add(relleno);

  // ---------------------------------------------------- animaciones
  const animaciones = new Set();
  function animar(duracion, fn, ease = easeInOut) {
    return new Promise((resolve) => {
      const a = { inicio: performance.now(), duracion: duracion * 1000, fn, ease, resolve };
      animaciones.add(a);
    });
  }
  function cancelarAnimaciones() {
    for (const a of animaciones) { a.fn(1); a.resolve(); }
    animaciones.clear();
  }

  function moverCamara(pos, obj, duracion = 1.1) {
    const p0 = camera.position.clone(), t0 = controls.target.clone();
    const p1 = new THREE.Vector3(...pos), t1 = new THREE.Vector3(...obj);
    return animar(duracion, (k) => {
      camera.position.lerpVectors(p0, p1, k);
      controls.target.lerpVectors(t0, t1, k);
    });
  }

  // ---------------------------------------------------- bucle
  const alCuadro = new Set();
  let activo = true;
  function redimensionar() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
    }
    // Corrimiento horizontal del centro de la vista (para no quedar tras un panel).
    const d = api.desplazamiento ? api.desplazamiento() : null;
    const dx = Math.round(d?.x || 0), dy = Math.round(d?.y || 0);
    const clave = `${dx},${dy},${w},${h}`;
    if (clave !== desplazado) {
      desplazado = clave;
      if (dx || dy) camera.setViewOffset(w, h, dx, dy, w, h); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
  }
  let desplazado = null;
  const reloj = new THREE.Clock();
  function bucle() {
    requestAnimationFrame(bucle);
    if (!activo) return;
    redimensionar();
    const ahora = performance.now();
    for (const a of animaciones) {
      const k = Math.min(1, (ahora - a.inicio) / a.duracion);
      a.fn(a.ease(k));
      if (k >= 1) { animaciones.delete(a); a.resolve(); }
    }
    const dt = reloj.getDelta();
    for (const f of alCuadro) f(dt, ahora);
    controls.update();
    renderer.render(scene, camera);
  }

  // ---------------------------------------------------- toque (clic sin arrastre)
  const raycaster = new THREE.Raycaster();
  function alTocar(fn) {
    let x0 = 0, y0 = 0;
    canvas.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
    canvas.addEventListener('pointerup', (e) => {
      if (Math.hypot(e.clientX - x0, e.clientY - y0) > 6) return;
      const r = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      fn(raycaster, e);
    });
  }

  function aPantalla(v3) {
    const v = v3.clone().project(camera);
    return { x: (v.x + 1) / 2 * canvas.clientWidth, y: (1 - v.y) / 2 * canvas.clientHeight, visible: v.z < 1 };
  }

  const api = {
    THREE, scene, camera, renderer, controls, sol,
    animar, cancelarAnimaciones, moverCamara, alTocar, aPantalla,
    alCuadro: (f) => alCuadro.add(f),
    pausar: (v) => { activo = !v; },
    desplazamiento: null,
  };
  bucle();
  return api;
}

/** Piso con sombra suave y alfombra, para cuando no hay entorno de Atlas. */
export function crearPiso({ color = '#ece7df', alfombra = true } = {}) {
  const g = new THREE.Group();
  g.name = 'piso';
  const piso = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color, roughness: 0.95 }));
  piso.rotation.x = -Math.PI / 2;
  piso.receiveShadow = true;
  g.add(piso);
  if (alfombra) {
    const a = new THREE.Mesh(new THREE.CircleGeometry(0.85, 64), new THREE.MeshStandardMaterial({ color: '#d7dbe6', roughness: 1 }));
    a.rotation.x = -Math.PI / 2;
    a.position.y = 0.002;
    a.receiveShadow = true;
    g.add(a);
  }
  return g;
}

/** Plano que solo recibe sombras (para el visor sobre fondo claro). */
export function crearAtrapaSombras(opacidad = 0.18) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: opacidad }));
  m.rotation.x = -Math.PI / 2;
  m.receiveShadow = true;
  return m;
}
