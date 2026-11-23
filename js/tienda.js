// Tienda de Furniture Experts: visor 3D del producto, acabados, carrito
// simulado, productos sugeridos y reseñas de demostración.

import * as THREE from 'three';
import { PRODUCTO, ACABADOS, SUGERIDOS, RESENAS, ICONOS, formatoQ } from './datos.js';
import { crearEscena, crearAtrapaSombras } from './guia/escena.js';
import { crearSilla, EXPLOSION } from './guia/silla.js';

const $ = (id) => document.getElementById(id);

// Estado compartido con la guía.
window.FE = { acabado: ACABADOS[0] };

// ================================================================== aviso flotante
let tAviso = 0;
function aviso(texto) {
  const t = $('toast');
  t.textContent = texto;
  t.classList.add('visible');
  clearTimeout(tAviso);
  tAviso = setTimeout(() => t.classList.remove('visible'), 2800);
}
window.addEventListener('aviso', (e) => aviso(e.detail));
document.querySelectorAll('[data-pronto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); aviso('Esta categoría llega pronto (demo).'); }));

// ================================================================== visor del producto
const esc = crearEscena($('canvasProducto'), { fov: 32 });
esc.controls.enableZoom = false;
esc.controls.enablePan = false;
esc.controls.autoRotate = true;
esc.controls.autoRotateSpeed = 1.2;
esc.controls.target.set(0, 0.42, 0);
esc.camera.position.set(1.25, 0.95, 1.6);
esc.scene.add(crearAtrapaSombras(0.16));
const silla = crearSilla(ACABADOS[0].color);
esc.scene.add(silla.grupo);

let explosion = 0;
function explotar(obj) {
  const desde = explosion;
  return esc.animar(0.9, (t) => {
    explosion = desde + (obj - desde) * t;
    for (const p of Object.values(silla.piezas)) {
      p.position.copy(p.userData.final).addScaledVector(new THREE.Vector3(...EXPLOSION[p.name]), explosion * 1.3);
    }
  });
}

const VISTAS = {
  giro: { pos: [1.25, 0.95, 1.6], obj: [0, 0.42, 0], rot: true },
  frente: { pos: [0, 0.6, 2.1], obj: [0, 0.42, 0] },
  lado: { pos: [2.1, 0.6, 0], obj: [0, 0.42, 0] },
  detalle: { pos: [0.55, 0.62, 0.62], obj: [-0.05, 0.4, 0.1] },
  explosion: { pos: [1.5, 1.15, 1.9], obj: [0, 0.45, 0], exp: true },
};
document.querySelectorAll('.vista').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.vista').forEach((x) => x.classList.toggle('activa', x === b));
  const v = VISTAS[b.dataset.vista];
  esc.controls.autoRotate = !!v.rot;
  explotar(v.exp ? 1 : 0);
  esc.moverCamara(v.pos, v.obj, 1);
}));
$('canvasProducto').addEventListener('pointerdown', () => { esc.controls.autoRotate = false; });

// Pausar el visor cuando no se ve (ahorra batería en celular).
new IntersectionObserver(([e]) => esc.pausar(!e.isIntersecting)).observe($('visorProducto'));
window.addEventListener('abrir-guia', () => esc.pausar(true));

// ================================================================== acabados
const muestras = $('muestras');
for (const a of ACABADOS) {
  const b = document.createElement('button');
  b.className = 'muestra';
  b.style.background = a.color;
  b.setAttribute('role', 'radio');
  b.setAttribute('aria-label', a.nombre);
  b.setAttribute('aria-checked', a === window.FE.acabado ? 'true' : 'false');
  b.addEventListener('click', () => elegirAcabado(a));
  muestras.append(b);
}
function elegirAcabado(a) {
  window.FE.acabado = a;
  [...muestras.children].forEach((b) => b.setAttribute('aria-checked', b.getAttribute('aria-label') === a.nombre ? 'true' : 'false'));
  $('nombreAcabado').textContent = a.nombre;
  silla.setColor(a.color);
  window.dispatchEvent(new CustomEvent('acabado', { detail: a }));
  pintarColorAR();
}

// ================================================================== carrito (simulado)
const carrito = [];
let cantidad = 1;
$('menos').addEventListener('click', () => { cantidad = Math.max(1, cantidad - 1); $('cantidad').textContent = cantidad; });
$('mas').addEventListener('click', () => { cantidad = Math.min(12, cantidad + 1); $('cantidad').textContent = cantidad; });

function agregar(item) {
  const ya = carrito.find((c) => c.id === item.id && c.detalle === item.detalle);
  if (ya) ya.cant += item.cant; else carrito.push({ ...item });
  pintarCarrito();
  const c = $('contadorCarrito');
  c.classList.add('salta');
  setTimeout(() => c.classList.remove('salta'), 220);
}
$('agregar').addEventListener('click', () => {
  agregar({ id: PRODUCTO.id, nombre: PRODUCTO.nombre, detalle: window.FE.acabado.nombre, precio: PRODUCTO.precio, cant: cantidad, icono: 'silla' });
  aviso(`${cantidad} × ${PRODUCTO.nombre} (${window.FE.acabado.nombre}) agregada al carrito`);
});

function pintarCarrito() {
  $('contadorCarrito').textContent = carrito.reduce((s, c) => s + c.cant, 0);
  const cont = $('itemsCarrito');
  cont.innerHTML = carrito.length ? '' : '<p class="vacio">Tu carrito está vacío.</p>';
  carrito.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'item-carrito';
    el.innerHTML = `<div class="img">${ICONOS[c.icono]}</div>
      <div><strong>${c.nombre}</strong><span>${c.detalle ? c.detalle + ' · ' : ''}<span class="n">${c.cant} × ${formatoQ(c.precio)}</span></span></div>
      <button class="quitar">Quitar</button>`;
    el.querySelector('.quitar').addEventListener('click', () => { carrito.splice(i, 1); pintarCarrito(); });
    cont.append(el);
  });
  $('totalCarrito').textContent = formatoQ(carrito.reduce((s, c) => s + c.cant * c.precio, 0));
}
function abrirCajon(v) {
  $('cajon').classList.toggle('abierto', v);
  $('cajon').setAttribute('aria-hidden', v ? 'false' : 'true');
  $('velo').classList.toggle('visible', v);
}
$('btnCarrito').addEventListener('click', () => abrirCajon(true));
$('velo').addEventListener('click', () => abrirCajon(false));
document.querySelector('[data-cerrar="cajon"]').addEventListener('click', () => abrirCajon(false));
$('pagar').addEventListener('click', () => aviso('Demo: el pago no está disponible en este prototipo.'));
pintarCarrito();

// ================================================================== sugeridos
for (const s of SUGERIDOS) {
  const el = document.createElement('article');
  el.className = 'tarjeta sugerido';
  el.innerHTML = `<div class="img">${ICONOS[s.icono]}</div>
    <h3>${s.nombre}</h3>
    <p class="razon">${s.razon}</p>
    ${s.antes ? `<span class="ahorro">Ahorras ${formatoQ(s.antes - s.precio)}</span>` : ''}
    <div class="fila"><span class="n">${formatoQ(s.precio)}</span><button class="mini-agregar" aria-label="Agregar ${s.nombre}">+</button></div>`;
  const b = el.querySelector('.mini-agregar');
  b.addEventListener('click', () => {
    agregar({ id: s.id, nombre: s.nombre, precio: s.precio, cant: 1, icono: s.icono });
    b.classList.add('ok'); b.textContent = '✓';
    setTimeout(() => { b.classList.remove('ok'); b.textContent = '+'; }, 1400);
    aviso(`${s.nombre} agregado al carrito`);
  });
  $('sugeridos').append(el);
}

// ================================================================== reseñas (demo)
const CLAVE_RESENAS = 'fe_resenas_demo_v1';
const CLAVE_UTILES = 'fe_resenas_utiles_v1';
const leerLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const guardarLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

let propias = leerLS(CLAVE_RESENAS, []);
let marcadas = new Set(leerLS(CLAVE_UTILES, []));
let filtro = 'todas', filtroEstrellas = 0, orden = 'recientes';

const todas = () => [...propias, ...RESENAS];
const estrellasHTML = (n) => '★'.repeat(Math.round(n)) + `<span class="vacia">${'★'.repeat(5 - Math.round(n))}</span>`;
const fechaCorta = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'short', year: 'numeric' });
const fotoResena = (id) => {
  const tonos = ['#e9e1d6', '#dfe5f1', '#e6ece4'];
  const c = tonos[id.charCodeAt(id.length - 1) % 3];
  return `<svg viewBox="0 0 120 90"><rect width="120" height="90" fill="${c}"/><rect y="62" width="120" height="28" fill="#000" opacity=".06"/><g transform="translate(30 4) scale(.82)">${ICONOS.silla.replace(/<\/?svg[^>]*>/g, '')}</g></svg>`;
};

function pintarResumen() {
  const lista = todas();
  const prom = lista.reduce((s, r) => s + r.estrellas, 0) / lista.length;
  $('promedio').textContent = prom.toFixed(1);
  $('estrellasProm').innerHTML = estrellasHTML(prom);
  $('estrellasMini').innerHTML = estrellasHTML(prom);
  $('totalResenas').textContent = `${lista.length} reseñas`;
  $('resumenMini').textContent = `${prom.toFixed(1)} · ${lista.length} reseñas`;
  const barras = $('barras');
  barras.innerHTML = '';
  for (let e = 5; e >= 1; e--) {
    const c = lista.filter((r) => r.estrellas === e).length;
    const b = document.createElement('button');
    b.className = 'barra-fila' + (filtroEstrellas === e ? ' activa' : '');
    b.innerHTML = `<span class="n">${e} ★</span><span class="pista"><span class="relleno" style="width:${(c / lista.length) * 100}%"></span></span><span class="n">${c}</span>`;
    b.setAttribute('aria-label', `Filtrar reseñas de ${e} estrellas`);
    b.addEventListener('click', () => { filtroEstrellas = filtroEstrellas === e ? 0 : e; pintarResumen(); pintarResenas(); });
    barras.append(b);
  }
}

function pintarResenas() {
  let lista = todas();
  if (filtro === 'armado') lista = lista.filter((r) => r.armado);
  if (filtro === 'foto') lista = lista.filter((r) => r.foto);
  if (filtroEstrellas) lista = lista.filter((r) => r.estrellas === filtroEstrellas);
  const util = (r) => r.utiles + (marcadas.has(r.id) ? 1 : 0);
  lista.sort({
    recientes: (a, b) => b.fecha.localeCompare(a.fecha),
    utiles: (a, b) => util(b) - util(a),
    altas: (a, b) => b.estrellas - a.estrellas || b.fecha.localeCompare(a.fecha),
    bajas: (a, b) => a.estrellas - b.estrellas || b.fecha.localeCompare(a.fecha),
  }[orden]);
  const cont = $('listaResenas');
  cont.innerHTML = lista.length ? '' : '<div class="tarjeta vacio">No hay reseñas con ese filtro.</div>';
  for (const r of lista) {
    const el = document.createElement('article');
    el.className = 'tarjeta resena' + (r.propia ? ' nueva' : '');
    el.innerHTML = `
      <div class="resena-cab">
        <span class="avatar">${r.nombre.trim()[0].toUpperCase()}</span>
        <div class="resena-quien"><strong></strong><span>${r.ciudad ? r.ciudad + ' · ' : ''}${fechaCorta(r.fecha)}</span></div>
        <span class="estrellas" aria-label="${r.estrellas} de 5">${estrellasHTML(r.estrellas)}</span>
      </div>
      <h3></h3>
      <p></p>
      ${r.foto ? `<div class="foto">${fotoResena(r.id)}</div>` : ''}
      <div class="etiquetas">
        ${r.propia ? '<span class="etq">Tu reseña (demo)</span>' : '<span class="etq verificada">Compra verificada</span>'}
        ${r.armado ? '<span class="etq guia">Usó la guía 3D</span>' : ''}
      </div>
      <div class="util">¿Te fue útil? <button class="${marcadas.has(r.id) ? 'marcado' : ''}">👍 Sí · <span class="n">${util(r)}</span></button></div>`;
    // Texto del usuario siempre como texto, nunca como HTML.
    el.querySelector('.resena-quien strong').textContent = r.nombre;
    el.querySelector('h3').textContent = r.titulo;
    el.querySelector('p').textContent = r.texto;
    el.querySelector('.util button').addEventListener('click', () => {
      marcadas.has(r.id) ? marcadas.delete(r.id) : marcadas.add(r.id);
      guardarLS(CLAVE_UTILES, [...marcadas]);
      pintarResenas();
    });
    cont.append(el);
  }
}

document.querySelectorAll('.filtro').forEach((b) => b.addEventListener('click', () => {
  filtro = b.dataset.filtro;
  document.querySelectorAll('.filtro').forEach((x) => x.classList.toggle('activo', x === b));
  pintarResenas();
}));
$('orden').addEventListener('change', (e) => { orden = e.target.value; pintarResenas(); });

// Formulario de reseña nueva
const dlg = $('dlgResena');
let estrellasNueva = 5;
const selector = $('selectorEstrellas');
for (let i = 1; i <= 5; i++) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = '★';
  b.setAttribute('role', 'radio');
  b.setAttribute('aria-label', `${i} estrellas`);
  b.addEventListener('click', () => { estrellasNueva = i; pintarSelector(); });
  selector.append(b);
}
function pintarSelector() {
  [...selector.children].forEach((b, i) => { b.classList.toggle('on', i < estrellasNueva); b.setAttribute('aria-checked', i + 1 === estrellasNueva ? 'true' : 'false'); });
}
pintarSelector();
$('escribirResena').addEventListener('click', () => { $('formResena').reset(); estrellasNueva = 5; pintarSelector(); dlg.showModal(); });
$('cancelarResena').addEventListener('click', () => dlg.close());
$('formResena').addEventListener('submit', (e) => {
  const f = new FormData(e.target);
  const nueva = {
    id: 'p' + Date.now(), propia: true, nombre: f.get('nombre').trim(), ciudad: '',
    estrellas: estrellasNueva, fecha: new Date().toISOString().slice(0, 10),
    titulo: f.get('titulo').trim(), texto: f.get('texto').trim(), armado: f.get('armado') === 'on', foto: false, utiles: 0,
  };
  propias = [nueva, ...propias];
  guardarLS(CLAVE_RESENAS, propias);
  filtro = 'todas'; filtroEstrellas = 0; orden = 'recientes';
  document.querySelectorAll('.filtro').forEach((x) => x.classList.toggle('activo', x.dataset.filtro === 'todas'));
  $('orden').value = 'recientes';
  pintarResumen();
  pintarResenas();
  aviso('¡Gracias! Tu reseña se publicó (solo en este navegador).');
});
pintarResumen();
pintarResenas();

// ================================================================== guía y AR
['abrirGuia', 'abrirGuia2'].forEach((id) => $(id).addEventListener('click', () => window.dispatchEvent(new Event('abrir-guia'))));

const dlgAR = $('dlgAR');
const mv = $('mv');
function pintarColorAR() {
  const m = mv.model?.materials?.filter((x) => x.name === 'madera');
  if (!m?.length) return;
  const c = new THREE.Color(window.FE.acabado.color);   // sRGB → lineal, como en three
  m.forEach((x) => x.pbrMetallicRoughness.setBaseColorFactor([c.r, c.g, c.b, 1]));
}
mv.addEventListener('load', pintarColorAR);
function abrirAR() { dlgAR.showModal(); pintarColorAR(); }
$('abrirAR').addEventListener('click', abrirAR);
window.addEventListener('abrir-ar', abrirAR);
$('cerrarAR').addEventListener('click', () => dlgAR.close());

// Figura de la sección «Cómo armarla»: una tableta con la guía en acción.
$('figuraArmado').innerHTML = `
<svg viewBox="0 0 420 300" fill="none" role="img" aria-label="Ilustración de la guía 3D en una tableta">
  <rect x="20" y="16" width="380" height="268" rx="26" fill="#14161a"/>
  <rect x="34" y="30" width="352" height="240" rx="14" fill="#e9ebf0"/>
  <rect x="34" y="200" width="352" height="70" fill="#dfe2ea"/>
  <g transform="translate(118 46)">
    <rect x="22" y="0" width="9" height="150" rx="3" fill="#d2ad82"/>
    <rect x="104" y="0" width="9" height="150" rx="3" fill="#d2ad82"/>
    <rect x="26" y="12" width="84" height="22" rx="6" fill="#d2ad82"/>
    <path d="M10 84h116l-8 14H18z" fill="#c09670"/>
    <rect x="14" y="96" width="9" height="56" rx="3" fill="#d2ad82"/>
    <rect x="114" y="96" width="9" height="56" rx="3" fill="#d2ad82"/>
    <rect x="20" y="108" width="98" height="10" rx="3" fill="#2f4bd8" opacity=".9"/>
    <circle cx="18" cy="113" r="9" stroke="#2f4bd8" stroke-width="3" fill="#fff"/>
    <circle cx="118" cy="113" r="9" stroke="#2f4bd8" stroke-width="3" fill="#fff"/>
    <path d="M68 150v-22" stroke="#2f4bd8" stroke-width="3" stroke-dasharray="4 4"/>
    <path d="m61 132 7-8 7 8" stroke="#2f4bd8" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  <rect x="246" y="44" width="126" height="78" rx="12" fill="#fff"/>
  <text x="258" y="64" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="600" fill="#2f4bd8">PASO 3 DE 7</text>
  <text x="258" y="82" font-family="Instrument Sans, sans-serif" font-size="12" font-weight="700" fill="#14161a">Travesaño frontal E</text>
  <rect x="258" y="92" width="44" height="18" rx="9" fill="#e8ecfb"/>
  <text x="266" y="105" font-family="IBM Plex Mono, monospace" font-size="10" font-weight="600" fill="#2f4bd8">H1 ×2</text>
  <rect x="110" y="232" width="200" height="28" rx="12" fill="#fff"/>
  <rect x="118" y="238" width="44" height="16" rx="6" fill="#e8ecfb" stroke="#2f4bd8"/>
  <rect x="168" y="238" width="44" height="16" rx="6" fill="#f7f8fa"/>
  <rect x="218" y="238" width="44" height="16" rx="6" fill="#f7f8fa"/>
  <rect x="268" y="238" width="34" height="16" rx="6" fill="#f7f8fa"/>
</svg>`;
