// Entorno de la guía.
//
// Si existe assets/sala.spz (generada con World Labs Atlas), se carga con
// Spark como fondo inmersivo. Su posición, giro y escala se ajustan en
// assets/sala.json, por ejemplo:
//   { "pos": [0, 0, 0], "rotY": 0, "escala": 1, "quat": [1, 0, 0, 0] }
// Si no existe o falla, se arma una sala simple con piso y dos paredes.

import * as THREE from 'three';
import { crearPiso } from './escena.js';

function salaSimple() {
  const g = new THREE.Group();
  g.name = 'salaSimple';
  g.add(crearPiso());
  const mPared = new THREE.MeshStandardMaterial({ color: '#f1f2f5', roughness: 1 });
  const fondo = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), mPared);
  fondo.position.set(0, 1.5, -1.6);
  fondo.receiveShadow = true;
  const lado = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), mPared);
  lado.position.set(-1.9, 1.5, 0);
  lado.rotation.y = Math.PI / 2;
  lado.receiveShadow = true;
  const zocalo = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 0.02), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
  zocalo.position.set(0, 0.04, -1.59);
  // Una ventana luminosa para dar contexto de "sala".
  const ventana = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshBasicMaterial({ color: '#fbfcff' }));
  ventana.position.set(-1.89, 1.4, -0.3);
  ventana.rotation.y = Math.PI / 2;
  const marco = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.38), new THREE.MeshStandardMaterial({ color: '#dfe2ea' }));
  marco.position.set(-1.895, 1.4, -0.3);
  marco.rotation.y = Math.PI / 2;
  g.add(fondo, lado, zocalo, marco, ventana);
  return g;
}

export async function cargarEntorno(esc) {
  const { scene, renderer } = esc;
  let conf = null;
  try {
    const r = await fetch('assets/sala.spz', { method: 'HEAD' });
    if (r.ok) {
      try { conf = await (await fetch('assets/sala.json')).json(); } catch { conf = {}; }
    }
  } catch { /* sin servidor o sin archivo */ }

  if (conf) {
    try {
      const { SparkRenderer, SplatMesh } = await import('@sparkjsdev/spark');
      scene.add(new SparkRenderer({ renderer }));
      const sala = new SplatMesh({ url: 'assets/sala.spz' });
      if (conf.quat) sala.quaternion.set(...conf.quat);
      if (conf.rotY) sala.rotateY(conf.rotY);
      if (conf.pos) sala.position.set(...conf.pos);
      if (conf.escala) sala.scale.setScalar(conf.escala);
      scene.add(sala);
      // Piso invisible que solo recibe la sombra de la silla.
      const sombra = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.ShadowMaterial({ opacity: 0.25 }));
      sombra.rotation.x = -Math.PI / 2;
      sombra.receiveShadow = true;
      scene.add(sombra);
      return 'atlas';
    } catch (e) {
      console.warn('No se pudo cargar la sala de Atlas; se usa la sala simple.', e);
    }
  }
  scene.background = new THREE.Color('#e9ebf0');
  scene.add(salaSimple());
  return 'simple';
}
