// Guía de armado 3D de la Silla Nórdica · desarrollada por AR Innovation (ficticia).
//
// Flujo: inventario → 7 pasos → fin. Cada paso desliza sus piezas a su lugar,
// marca los agujeros y espera que el usuario elija el herraje correcto en la
// bandeja y toque cada agujero. El paso 2 es crítico: los travesaños llegan
// girados y no se puede avanzar si se confirman al revés.

import * as THREE from 'three';
import { crearEscena } from './escena.js';
import { cargarEntorno } from './entorno.js';
import { crearSilla, crearHerraje, orientarHerraje, construirPieza, crearMaterialMadera, PIEZAS, HERRAJES, EXPLOSION, ESPERA } from './silla.js';
import { PASOS, CAMARA_INVENTARIO, CAMARA_FIN } from './pasos.js';
import { Registro } from './registro.js';

const $ = (id) => document.getElementById(id);
const ACENTO = new THREE.Color('#2f4bd8');
const AMBAR = new THREE.Color('#d08a00');

const ui = {
  guia: $('guia'), canvas: $('canvasGuia'), progreso: $('progreso'),
  inv: $('panelInventario'), invGrid: $('invGrid'), invConteo: $('invConteo'), empezar: $('empezarArmado'), falta: $('faltaPieza'),
  paso: $('panelPaso'), pasoNum: $('pasoNum'), pasoTitulo: $('pasoTitulo'), pasoTexto: $('pasoTexto'), pasoUsa: $('pasoUsa'),
  criticoTag: $('criticoTag'), aviso: $('aviso'), orientacion: $('orientacion'),
  anterior: $('anterior'), siguiente: $('siguiente'), repetir: $('repetir'), pista: $('pista'),
  fin: $('panelFin'), finMetricas: $('finMetricas'), finTabla: $('finTabla'),
  bandeja: $('bandeja'), etiqueta: $('etiquetaPieza'), btnExplosion: $('btnExplosion'),
};

let esc = null, silla = null, registro = new Registro();
let modo = 'cerrada', n = 0, token = 0;
let herrajeSel = null, hechos = new Set(), completo = false, girados = new Set();
let explosion = 0, miniaturas = null;
const inventario = new Map();    // clave → 'ok' | 'falta'

// ================================================================== arranque
async function iniciar() {
  if (esc) return;
  esc = crearEscena(ui.canvas, { fondo: '#e9ebf0' });
  esc.controls.maxPolarAngle = Math.PI * 0.8;
  // Corre el centro de la vista para que la silla no quede detrás del panel:
  // a la izquierda en escritorio, hacia arriba en celular.
  esc.desplazamiento = () => {
    const panel = [ui.inv, ui.paso, ui.fin].find((x) => !x.hidden);
    if (!panel) return null;
    if (window.innerWidth > 900) return { x: (panel.offsetWidth + 16 - 250) / 2, y: 0 };
    const libre = panel.getBoundingClientRect().top - 110;          // espacio sobre el panel
    return { x: 0, y: (window.innerHeight - 220 - libre) / 2 };
  };
  await cargarEntorno(esc);
  silla = crearSilla(colorActual());
  esc.scene.add(silla.grupo);
  esc.alTocar(alTocar);

  // Pulso de los marcadores de agujero.
  esc.alCuadro((dt, t) => {
    const k = 1 + 0.25 * Math.sin(t / 220);
    for (const m of marcadores()) {
      const activo = herrajeSel === PASOS[n]?.herraje;
      m.userData.halo.scale.setScalar(activo ? k * 1.25 : k);
      m.userData.halo.material.opacity = activo ? 0.9 : 0.55;
    }
  });
  miniaturas = generarMiniaturas();
  construirProgreso();
}

function colorActual() {
  return window.FE?.acabado?.color || '#d2ad82';
}

// ================================================================== abrir / cerrar
async function abrir() {
  ui.guia.classList.add('abierta');
  ui.guia.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  await iniciar();
  esc.pausar(false);
  registro.nuevoIntento();
  registro.acabado = window.FE?.acabado?.nombre || 'Natural';
  inventario.clear();
  irInventario();
}
function cerrar() {
  if (modo === 'paso') registro.salirPaso(n + 1);
  ui.guia.classList.remove('abierta');
  ui.guia.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  esc?.pausar(true);
  esc && (esc.controls.autoRotate = false);
  modo = 'cerrada';
}
window.addEventListener('abrir-guia', abrir);
$('cerrarGuia').addEventListener('click', cerrar);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modo !== 'cerrada' && !document.querySelector('dialog[open]')) cerrar(); });
window.addEventListener('acabado', (e) => silla?.setColor(e.detail.color));

// ================================================================== estado de la escena
function marcadores() {
  const out = [];
  silla?.grupo.traverse((o) => { if (o.userData.marcador) out.push(o); });
  return out;
}
function limpiarHerrajes() {
  const quitar = [];
  silla.grupo.traverse((o) => { if (o.userData.esHerraje || o.userData.marcador) quitar.push(o); });
  quitar.forEach((o) => o.parent.remove(o));
}
function resaltar(ids, color = ACENTO) {
  // Contorno de color sobre la pieza (no se tiñe la madera).
  for (const p of Object.values(silla.piezas)) {
    const on = ids.includes(p.name);
    let borde = p.userData.borde;
    if (!borde && on) {
      borde = new THREE.Group();
      const mat = new THREE.LineBasicMaterial({ color: ACENTO, transparent: true, opacity: 0.95 });
      p.children.filter((c) => c.isMesh && c.name !== 'agujero').forEach((m) => {
        const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 35), mat);
        l.position.copy(m.position); l.quaternion.copy(m.quaternion); l.scale.copy(m.scale).multiplyScalar(1.002);
        borde.add(l);
      });
      borde.userData.mat = mat;
      p.add(borde);
      p.userData.borde = borde;
    }
    if (borde) { borde.visible = on; borde.userData.mat.color.copy(color); }
    p.userData.material.emissive.copy(on ? color : new THREE.Color(0));
    p.userData.material.emissiveIntensity = on ? 0.06 : 0;
  }
}
function colocarPieza(p, donde) {
  const f = p.userData.final;
  if (donde === 'final') p.position.copy(f);
  else p.position.copy(f).add(new THREE.Vector3(...ESPERA[p.name]));
  p.userData.donde = donde;
}
function ponerGiro(p, girado) {
  p.rotation.set(0, p.userData.rotY, girado ? Math.PI : 0);
}

/** Deja la escena como estaba justo antes del paso `k`. */
function prepararEstado(k) {
  esc.cancelarAnimaciones();
  limpiarHerrajes();
  girados.clear();
  explosion = 0;
  ui.btnExplosion.setAttribute('aria-pressed', 'false');
  for (const p of Object.values(silla.piezas)) {
    const colocada = PASOS.findIndex((s) => s.colocan.includes(p.name));
    const aparece = PASOS.findIndex((s) => s.aparecen.includes(p.name) || s.colocan.includes(p.name));
    ponerGiro(p, false);
    if (colocada !== -1 && colocada < k) { colocarPieza(p, 'final'); p.visible = true; }
    else if (aparece !== -1 && aparece <= k) { colocarPieza(p, 'espera'); p.visible = true; }
    else p.visible = false;
  }
  // Herrajes de los pasos ya hechos, sin animación.
  for (let i = 0; i < k; i++) for (const a of PASOS[i].agujeros) ponerHerraje(silla.agujeros[a], false);
  resaltar([]);
}

function ponerHerraje(ag, animado = true) {
  const p = silla.piezas[ag.pieza];
  const h = crearHerraje(ag.herraje);
  h.userData.esHerraje = true;
  orientarHerraje(h, ag.dir);
  const fin = ag.local.clone();
  p.add(h);
  if (!animado) { h.position.copy(fin); return Promise.resolve(); }
  const ini = fin.clone().addScaledVector(ag.dir, -(h.userData.largo + 0.07));
  const base = h.quaternion.clone();
  const giro = ag.herraje === 'H3' ? 0 : Math.PI * 6;
  return esc.animar(0.9, (t) => {
    h.position.lerpVectors(ini, fin, t);
    h.quaternion.copy(base).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), giro * t));
  });
}

function crearMarcador(ag) {
  const p = silla.piezas[ag.pieza];
  const g = new THREE.Group();
  g.userData = { marcador: true, agujero: ag.id };
  const normal = ag.dir.clone().negate();
  g.position.copy(ag.local).addScaledVector(normal, 0.004);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.009, 0.013, 32), new THREE.MeshBasicMaterial({ color: ACENTO, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
  const punto = new THREE.Mesh(new THREE.CircleGeometry(0.005, 24), new THREE.MeshBasicMaterial({ color: ACENTO, side: THREE.DoubleSide }));
  const toque = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  toque.userData.agujero = ag.id;
  punto.userData.agujero = ag.id;
  halo.userData.agujero = ag.id;
  g.userData.halo = halo;
  g.add(halo, punto, toque);
  p.add(g);
}

// ================================================================== progreso
function construirProgreso() {
  ui.progreso.innerHTML = '';
  const li = document.createElement('li');
  li.dataset.i = 'inv'; li.innerHTML = '<span class="n">✓</span><em>Piezas</em>';
  ui.progreso.append(li);
  PASOS.forEach((p, i) => {
    const el = document.createElement('li');
    el.dataset.i = i;
    el.innerHTML = `<span class="n">${i + 1}</span><em>${p.titulo}</em>`;
    ui.progreso.append(el);
  });
}
function pintarProgreso() {
  for (const el of ui.progreso.children) {
    const i = el.dataset.i === 'inv' ? -1 : +el.dataset.i;
    const actual = modo === 'inventario' ? -1 : modo === 'fin' ? 99 : n;
    el.className = i < actual || (i === actual && completo) ? 'hecho' : i === actual ? 'actual' : '';
    if (el.dataset.i === 'inv') el.firstChild.textContent = modo === 'inventario' ? '•' : '✓';
  }
}

function mostrarPanel(cual) {
  ui.inv.hidden = cual !== 'inv';
  ui.paso.hidden = cual !== 'paso';
  ui.fin.hidden = cual !== 'fin';
  ui.bandeja.hidden = cual !== 'paso';
  ui.guia.dataset.modo = cual;
}

// ================================================================== inventario
const ITEMS_INV = [
  ...Object.entries(PIEZAS).map(([k, v]) => ({ clave: k, tipo: 'pieza', ...v })),
  ...Object.entries(HERRAJES).map(([k, v]) => ({ clave: k, tipo: 'herraje', ...v })),
];

function irInventario() {
  token++;
  modo = 'inventario';
  completo = false;
  esc.controls.autoRotate = false;
  mostrarPanel('inv');
  // Silla completa explosionada como "contenido de la caja".
  prepararEstado(PASOS.length);
  for (const p of Object.values(silla.piezas)) { p.visible = true; colocarPieza(p, 'final'); }
  limpiarHerrajes();
  aplicarExplosion(1, false);
  esc.moverCamara(CAMARA_INVENTARIO.pos, CAMARA_INVENTARIO.obj);
  ui.invGrid.innerHTML = '';
  for (const it of ITEMS_INV) {
    const b = document.createElement('button');
    b.className = 'inv-item';
    b.dataset.clave = it.clave;
    b.innerHTML = `
      <img src="${miniaturas[it.clave]}" alt="">
      <span class="inv-cod n">${it.clave}</span>
      <span class="inv-nom">${it.nombre}${it.medida ? `<small class="n">${it.medida}</small>` : ''}</span>
      <span class="inv-cant n">× ${it.cant}</span>
      <span class="inv-estado" aria-hidden="true"></span>`;
    b.setAttribute('aria-pressed', 'false');
    b.title = it.desc || `${it.nombre} ${it.medida || ''}`;
    b.addEventListener('click', () => {
      const ahora = inventario.get(it.clave);
      if (ahora === 'ok') inventario.delete(it.clave); else inventario.set(it.clave, 'ok');
      pintarInventario();
      if (it.tipo === 'pieza') resaltar(Object.keys(silla.piezas).filter((id) => id.startsWith(it.clave)));
    });
    ui.invGrid.append(b);
  }
  pintarInventario();
  pintarProgreso();
}

function pintarInventario() {
  let listos = 0;
  for (const b of ui.invGrid.children) {
    const est = inventario.get(b.dataset.clave);
    b.dataset.estado = est || '';
    b.setAttribute('aria-pressed', est === 'ok' ? 'true' : 'false');
    b.querySelector('.inv-estado').textContent = est === 'ok' ? '✓' : est === 'falta' ? 'Pedida' : '';
    if (est) listos++;
  }
  ui.invConteo.textContent = `${listos} de ${ITEMS_INV.length} revisados`;
  ui.empezar.disabled = listos < ITEMS_INV.length;
}

ui.falta.addEventListener('click', () => {
  const pendientes = ITEMS_INV.filter((it) => inventario.get(it.clave) !== 'ok');
  const dlg = document.createElement('dialog');
  dlg.className = 'dialogo';
  dlg.innerHTML = `<form method="dialog">
    <h3>¿Qué pieza falta?</h3>
    <p class="texto-3 chico">Te enviamos el repuesto sin costo. (Demo: no se envía nada.)</p>
    <label>Pieza o herraje
      <select name="pieza">${(pendientes.length ? pendientes : ITEMS_INV).map((it) => `<option value="${it.clave}">${it.clave} · ${it.nombre}</option>`).join('')}</select>
    </label>
    <div class="dialogo-acciones"><button class="btn secundario" value="cancel">Cancelar</button><button class="btn primario" value="ok">Pedir repuesto</button></div>
  </form>`;
  document.body.append(dlg);
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'ok') {
      const clave = dlg.querySelector('select').value;
      inventario.set(clave, 'falta');
      registro.faltantes.push(clave);
      pintarInventario();
      window.dispatchEvent(new CustomEvent('aviso', { detail: `Repuesto ${clave} solicitado (demo). Puedes seguir armando mientras llega.` }));
    }
    dlg.remove();
  });
  dlg.showModal();
});
ui.empezar.addEventListener('click', () => irPaso(0));

// ================================================================== pasos
async function irPaso(k) {
  if (modo === 'paso') registro.salirPaso(n + 1);
  const mio = ++token;
  modo = 'paso';
  n = k;
  herrajeSel = null;
  hechos = new Set();
  completo = false;
  esc.controls.autoRotate = false;
  const paso = PASOS[k];
  registro.entrarPaso(k + 1);
  mostrarPanel('paso');
  prepararEstado(k);

  ui.pasoNum.textContent = `Paso ${k + 1} de ${PASOS.length}`;
  ui.pasoTitulo.textContent = paso.titulo;
  ui.pasoTexto.textContent = paso.texto;
  ui.criticoTag.hidden = !paso.critico;
  ui.siguiente.disabled = true;
  ui.siguiente.textContent = k === PASOS.length - 1 ? 'Terminar ✓' : 'Siguiente →';
  ui.anterior.textContent = k === 0 ? '← Piezas' : '← Anterior';
  ocultarAviso();
  pintarUsa(paso);
  pintarBandeja();
  pintarProgreso();

  const camara = esc.moverCamara(paso.camara.pos, paso.camara.obj);

  if (paso.orientar) {
    for (const id of paso.orientar) { ponerGiro(silla.piezas[id], true); girados.add(id); }
    resaltar(paso.orientar, AMBAR);
    ui.orientacion.hidden = false;
    ui.bandeja.classList.add('bloqueada');
    mostrarAviso('atencion', '<strong>Revisa la orientación antes de unir.</strong> La lengüeta con agujeros pequeños debe quedar hacia adentro, mirando al centro de la silla.');
    await camara;
    return;
  }
  ui.orientacion.hidden = true;
  ui.bandeja.classList.remove('bloqueada');
  await camara;
  if (mio !== token) return;
  await animarPaso(mio);
}

async function animarPaso(mio) {
  const paso = PASOS[n];
  const mov = [...new Set([...paso.aparecen, ...paso.colocan])];
  resaltar(mov);
  // Deslizar a su lugar las piezas que se colocan en este paso.
  const piezas = paso.colocan.map((id) => silla.piezas[id]);
  if (piezas.length) {
    const flechas = piezas.map((p) => flecha(p));
    const inicios = piezas.map((p) => p.userData.final.clone().add(new THREE.Vector3(...ESPERA[p.name])));
    piezas.forEach((p, i) => p.position.copy(inicios[i]));
    await esc.animar(0.35, () => {});
    if (mio !== token) { flechas.forEach((f) => f.removeFromParent()); return; }
    await esc.animar(1.3, (t) => piezas.forEach((p, i) => p.position.lerpVectors(inicios[i], p.userData.final, t)));
    flechas.forEach((f) => f.removeFromParent());
    piezas.forEach((p) => (p.userData.donde = 'final'));
    if (mio !== token) return;
  }
  // Marcar los agujeros pendientes.
  marcadores().forEach((m) => m.removeFromParent());
  for (const a of paso.agujeros) if (!hechos.has(a)) crearMarcador(silla.agujeros[a]);
  if (!completo && !herrajeSel) {
    const h = HERRAJES[paso.herraje];
    mostrarAviso('info', paso.apretar
      ? `Elige la <strong>${h.nombre}</strong> en la bandeja para apretar los pernos.`
      : `Elige el herraje <strong class="n">${paso.herraje}</strong> en la bandeja y toca cada agujero marcado.`);
  }
}

function flecha(p) {
  const desde = p.userData.final.clone().add(new THREE.Vector3(...ESPERA[p.name]));
  const hasta = p.userData.final.clone();
  const dir = hasta.clone().sub(desde);
  const largo = dir.length();
  const a = new THREE.ArrowHelper(dir.normalize(), desde, Math.max(0.05, largo - 0.02), ACENTO.getHex(), 0.045, 0.026);
  a.line.material.linewidth = 2;
  esc.scene.add(a);
  return a;
}

function pintarUsa(paso) {
  const piezas = [...new Set([...paso.aparecen, ...paso.colocan])].map((id) => id[0]);
  const conteo = {};
  piezas.forEach((t) => (conteo[t] = (conteo[t] || 0) + 1));
  const h = HERRAJES[paso.herraje];
  const cant = paso.apretar ? 1 : paso.agujeros.length;
  ui.pasoUsa.innerHTML = [
    ...Object.entries(conteo).map(([t, c]) => `<span class="chip-usa"><b class="n">${t}</b>${PIEZAS[t].nombre}<i class="n">×${c}</i></span>`),
    `<span class="chip-usa herraje"><b class="n">${paso.herraje}</b>${h.nombre}<i class="n">×${cant}</i></span>`,
  ].join('');
}

function usados(tipo) {
  let u = 0;
  for (let i = 0; i < n; i++) if (PASOS[i].herraje === tipo) u += PASOS[i].agujeros.length;
  if (PASOS[n]?.herraje === tipo) u += hechos.size;
  return u;
}

function pintarBandeja() {
  ui.bandeja.innerHTML = '<span class="bandeja-tit">Bandeja de herrajes</span>';
  for (const [k, h] of Object.entries(HERRAJES)) {
    const b = document.createElement('button');
    b.className = 'chip-herraje';
    b.dataset.herraje = k;
    const quedan = k === 'LL' ? 1 : h.cant - usados(k);
    b.innerHTML = `<img src="${miniaturas[k]}" alt=""><span><b class="n">${k}</b> ${h.nombre}<small class="n">${h.medida} · quedan ${quedan}</small></span>`;
    b.setAttribute('aria-pressed', herrajeSel === k ? 'true' : 'false');
    b.addEventListener('click', () => elegirHerraje(k));
    ui.bandeja.append(b);
  }
}

const EXPLICA = {
  H1: 'El H1 es el perno largo de 60 mm.',
  H2: 'El H2 es el tornillo corto de 30 mm.',
  H3: 'El H3 es el tarugo de madera.',
  LL: 'La llave Allen se usa al final para apretar.',
};

async function elegirHerraje(k) {
  if (modo !== 'paso' || completo || ui.bandeja.classList.contains('bloqueada')) return;
  const paso = PASOS[n];
  if (k !== paso.herraje) {
    registro.error(n + 1, `herraje ${k} en vez de ${paso.herraje}`);
    herrajeSel = null;
    pintarBandeja();
    const chip = ui.bandeja.querySelector(`[data-herraje="${k}"]`);
    chip?.classList.add('mal');
    setTimeout(() => chip?.classList.remove('mal'), 700);
    mostrarAviso('atencion', `<strong>Ese no va aquí.</strong> ${EXPLICA[k]} Vuelve a leer qué herraje pide este paso.`);
    return;
  }
  herrajeSel = k;
  pintarBandeja();
  if (paso.apretar) {
    mostrarAviso('info', 'Apretando los 8 pernos…');
    await apretarTodo();
    completar();
    return;
  }
  mostrarAviso('info', `Bien, <strong class="n">${k}</strong>. Ahora toca cada agujero marcado (${paso.agujeros.length - hechos.size} pendientes).`);
}

async function apretarTodo() {
  const pernos = [];
  silla.grupo.traverse((o) => { if (o.userData.esHerraje && o.userData.tipo === 'H1') pernos.push(o); });
  const base = pernos.map((p) => p.quaternion.clone());
  const eje = new THREE.Vector3(0, 1, 0);
  await esc.animar(1.6, (t) => pernos.forEach((p, i) => p.quaternion.copy(base[i]).multiply(new THREE.Quaternion().setFromAxisAngle(eje, Math.PI * 4 * t))));
}

function completar() {
  completo = true;
  herrajeSel = null;
  resaltar([]);
  marcadores().forEach((m) => m.removeFromParent());
  pintarBandeja();
  ui.siguiente.disabled = false;
  pintarProgreso();
  mostrarAviso('favor', n === PASOS.length - 1 ? '<strong>¡Último paso listo!</strong> Toca «Terminar».' : '<strong>Paso completado.</strong> Puedes seguir al siguiente.');
}

// ---------------------------------------------------------------- toques en 3D
function alTocar(ray) {
  if (modo === 'cerrada') return;
  const objetos = [];
  silla.grupo.traverse((o) => { if (o.isMesh && o.parent?.visible !== false) objetos.push(o); });
  const hits = ray.intersectObjects(objetos, false).filter((h) => esVisible(h.object));
  // Agujeros primero (tienen un área de toque más grande).
  const hitAg = hits.find((h) => h.object.userData.agujero);
  if (hitAg && modo === 'paso') return tocarAgujero(hitAg.object.userData.agujero);
  const hitPieza = hits.find((h) => h.object.userData.pieza);
  if (hitPieza) return mostrarEtiqueta(silla.piezas[hitPieza.object.userData.pieza]);
  ui.etiqueta.hidden = true;
}
function esVisible(o) {
  for (let x = o; x; x = x.parent) if (!x.visible) return false;
  return true;
}

async function tocarAgujero(id) {
  const paso = PASOS[n];
  if (hechos.has(id) || completo) return;
  if (herrajeSel !== paso.herraje) {
    mostrarAviso('atencion', '<strong>Primero elige el herraje</strong> en la bandeja de abajo.');
    ui.bandeja.classList.add('llama');
    setTimeout(() => ui.bandeja.classList.remove('llama'), 900);
    return;
  }
  hechos.add(id);
  marcadores().filter((m) => m.userData.agujero === id).forEach((m) => m.removeFromParent());
  pintarBandeja();
  const mio = token;
  await ponerHerraje(silla.agujeros[id]);
  if (mio !== token) return;
  const quedan = paso.agujeros.length - hechos.size;
  if (quedan === 0) completar();
  else mostrarAviso('info', `Bien. Faltan <strong class="n">${quedan}</strong>.`);
}

let tEtiqueta = 0;
function mostrarEtiqueta(p) {
  const t = PIEZAS[p.userData.tipo];
  const pos = new THREE.Vector3();
  p.getWorldPosition(pos);
  const s = esc.aPantalla(pos);
  ui.etiqueta.innerHTML = `<b class="n">${p.userData.tipo}</b> ${t.nombre}<small>${t.desc}</small>`;
  ui.etiqueta.style.left = `${s.x}px`;
  ui.etiqueta.style.top = `${s.y}px`;
  ui.etiqueta.hidden = false;
  clearTimeout(tEtiqueta);
  tEtiqueta = setTimeout(() => (ui.etiqueta.hidden = true), 3500);
}

// ---------------------------------------------------------------- orientación (paso crítico)
$('girarPieza').addEventListener('click', async () => {
  const paso = PASOS[n];
  const piezas = paso.orientar.map((id) => silla.piezas[id]);
  const desde = piezas.map((p) => p.rotation.z);
  await esc.animar(0.6, (t) => piezas.forEach((p, i) => (p.rotation.z = desde[i] + Math.PI * t)));
  piezas.forEach((p) => {
    p.rotation.z = Math.round(p.rotation.z / Math.PI) % 2 ? Math.PI : 0;
    if (p.rotation.z) girados.add(p.name); else girados.delete(p.name);
  });
  resaltar(paso.orientar, girados.size ? AMBAR : ACENTO);
  mostrarAviso(girados.size ? 'atencion' : 'info', girados.size
    ? 'La lengüeta sigue quedando <strong>hacia afuera</strong>. Gíralos de nuevo.'
    : 'Ahora la lengüeta mira <strong>hacia adentro</strong>. Si te parece bien, confirma.');
});
$('confirmarOrientacion').addEventListener('click', async () => {
  const paso = PASOS[n];
  if (girados.size) {
    registro.error(n + 1, 'travesaño D al revés', true);
    mostrarAviso('peligro', `<strong>Paso crítico · no puedes continuar.</strong> ${paso.aviso_critico} Gira los travesaños antes de unirlos.`);
    const piezas = paso.orientar.map((id) => silla.piezas[id]);
    const x0 = piezas.map((p) => p.position.x);
    await esc.animar(0.45, (t) => piezas.forEach((p, i) => (p.position.x = x0[i] + Math.sin(t * Math.PI * 6) * 0.012 * (1 - t))));
    return;
  }
  ui.orientacion.hidden = true;
  ui.bandeja.classList.remove('bloqueada');
  ocultarAviso();
  await animarPaso(token);
});

// ---------------------------------------------------------------- navegación
ui.siguiente.addEventListener('click', () => (n === PASOS.length - 1 ? irFin() : irPaso(n + 1)));
ui.anterior.addEventListener('click', () => (n === 0 ? (registro.salirPaso(1), irInventario()) : irPaso(n - 1)));
ui.repetir.addEventListener('click', async () => {
  const paso = PASOS[n];
  if (!ui.orientacion.hidden) return;
  const mio = token;
  await esc.moverCamara(paso.camara.pos, paso.camara.obj, 0.6);
  if (mio === token) animarPaso(mio);
});
ui.pista.addEventListener('click', () => {
  if (modo !== 'paso' || completo) return;
  const paso = PASOS[n];
  registro.pista(n + 1);
  const h = HERRAJES[paso.herraje];
  const chip = ui.bandeja.querySelector(`[data-herraje="${paso.herraje}"]`);
  chip?.classList.add('pista');
  setTimeout(() => chip?.classList.remove('pista'), 2400);
  esc.moverCamara(paso.camara.pos, paso.camara.obj, 0.7);
  const texto = paso.orientar && !ui.orientacion.hidden
    ? 'Busca la tira delgada pegada al travesaño: debe quedar del lado de la silla, no hacia afuera. Usa «Girar».'
    : paso.apretar
      ? `Usa la <strong>${h.nombre}</strong> (${h.medida}).`
      : `Usa <strong class="n">${paso.agujeros.length} × ${paso.herraje}</strong>, ${h.nombre.toLowerCase()} de ${h.medida}. Los agujeros están marcados en azul.`;
  mostrarAviso('atencion', `<strong>Pista:</strong> ${texto}`);
});

// ---------------------------------------------------------------- vista
function aplicarExplosion(objetivo, animado = true) {
  const desde = explosion;
  const fn = (t) => {
    explosion = desde + (objetivo - desde) * t;
    for (const p of Object.values(silla.piezas)) {
      if (p.userData.donde !== 'final') continue;
      p.position.copy(p.userData.final).addScaledVector(new THREE.Vector3(...EXPLOSION[p.name]), explosion);
    }
  };
  ui.btnExplosion.setAttribute('aria-pressed', objetivo > 0 ? 'true' : 'false');
  if (!animado) return fn(1);
  return esc.animar(0.8, fn);
}
ui.btnExplosion.addEventListener('click', () => aplicarExplosion(explosion > 0.5 ? 0 : 1));
$('btnCentrar').addEventListener('click', () => {
  const c = modo === 'paso' ? PASOS[n].camara : modo === 'fin' ? CAMARA_FIN : CAMARA_INVENTARIO;
  esc.moverCamara(c.pos, c.obj, 0.8);
});

// ---------------------------------------------------------------- avisos del panel
function mostrarAviso(tipo, html) {
  ui.aviso.className = `aviso ${tipo}`;
  ui.aviso.innerHTML = html;
  ui.aviso.hidden = false;
}
function ocultarAviso() { ui.aviso.hidden = true; }

// ================================================================== fin
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

function irFin() {
  registro.salirPaso(n + 1);
  token++;
  modo = 'fin';
  mostrarPanel('fin');
  prepararEstado(PASOS.length);
  aplicarExplosion(0, false);
  esc.moverCamara(CAMARA_FIN.pos, CAMARA_FIN.obj).then(() => { if (modo === 'fin') esc.controls.autoRotate = true; });
  esc.controls.autoRotateSpeed = 1.6;
  const t = registro.totales();
  registro.cerrar(PASOS.map((p) => p.titulo));
  ui.finMetricas.innerHTML = `
    <div><span class="n">${fmt(t.total)}</span><small>tiempo total</small></div>
    <div class="${t.errores ? 'ambar' : 'verde'}"><span class="n">${t.errores}</span><small>errores</small></div>
    <div class="${t.criticos ? 'rojo' : 'verde'}"><span class="n">${t.criticos}</span><small>errores críticos</small></div>
    <div><span class="n">${t.pistas}</span><small>pistas</small></div>`;
  ui.finTabla.innerHTML = '<thead><tr><th>Paso</th><th>Tiempo</th><th>Errores</th><th>Pistas</th></tr></thead><tbody>' +
    PASOS.map((p, i) => {
      const r = registro.pasos[i + 1] || { segundos: 0, errores: 0, pistas: 0 };
      return `<tr><td><span class="n">${i + 1}</span> ${p.titulo}</td><td class="n">${fmt(r.segundos)}</td><td class="n ${r.errores ? 'ambar' : ''}">${r.errores}</td><td class="n">${r.pistas}</td></tr>`;
    }).join('') + '</tbody>';
  pintarProgreso();
}

$('exportarCSV').addEventListener('click', () => {
  const blob = new Blob(['﻿' + Registro.csv()], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'registro-guia-silla-nordica.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$('reiniciarGuia').addEventListener('click', () => {
  registro.nuevoIntento();
  registro.acabado = window.FE?.acabado?.nombre || 'Natural';
  inventario.clear();
  irInventario();
});
$('finAR').addEventListener('click', () => window.dispatchEvent(new Event('abrir-ar')));

// Gancho para pruebas automáticas (no lo usa la interfaz).
window.__guia = { tocarAgujero, estado: () => ({ modo, paso: n + 1, completo, herrajeSel, hechos: [...hechos], girados: [...girados] }), pasos: PASOS };

// ================================================================== miniaturas
function generarMiniaturas() {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(160, 160);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight('#ffffff', '#cfcac2', 2.2));
  const d = new THREE.DirectionalLight('#ffffff', 1.8); d.position.set(1, 2, 1.5); sc.add(d);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.001, 20);
  const out = {};
  const foto = (obj, clave, giro = [0.5, 0.7, 0]) => {
    obj.rotation.set(...giro);
    sc.add(obj);
    const caja = new THREE.Box3().setFromObject(obj);
    const centro = caja.getCenter(new THREE.Vector3());
    const tam = caja.getSize(new THREE.Vector3()).length();
    cam.position.copy(centro).add(new THREE.Vector3(0.35, 0.25, 1).normalize().multiplyScalar(tam * 1.9));
    cam.lookAt(centro);
    r.render(sc, cam);
    out[clave] = r.domElement.toDataURL('image/png');
    sc.remove(obj);
  };
  const mat = crearMaterialMadera(colorActual());
  const giros = { A: [0.25, 0.6, 0.9], B: [0.25, 0.6, 0.9], C: [0.6, 0.5, 0], D: [0.3, 0.9, 0], E: [0.4, 0.4, 0.2], F: [0.3, 0.3, 0] };
  for (const t of Object.keys(PIEZAS)) foto(construirPieza(t, mat), t, giros[t]);
  for (const t of Object.keys(HERRAJES)) foto(crearHerraje(t), t, t === 'LL' ? [0.3, 0.5, 0.5] : [0.5, 0.3, 0.7]);
  r.dispose();
  return out;
}
