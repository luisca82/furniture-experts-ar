// Datos de demostración de Furniture Experts (empresa ficticia).
// Precios, productos y reseñas son inventados para el prototipo académico.

export const PRODUCTO = {
  id: 'silla-nordica',
  nombre: 'Silla Nórdica',
  precio: 895,
};

// Acabados de la madera: cambian el material del modelo 3D.
export const ACABADOS = [
  { id: 'natural', nombre: 'Natural', color: '#d2ad82' },
  { id: 'nogal', nombre: 'Nogal', color: '#7b5236' },
  { id: 'negro', nombre: 'Negro mate', color: '#2e2e30' },
];

// Siluetas simples dibujadas por nosotros (sin fotos de terceros).
const t = '#14161a', m = '#c9a47c', s = '#e4e7ee';
export const ICONOS = {
  silla: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="92" rx="30" ry="3" fill="${s}"/><rect x="31" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="64" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="33" y="20" width="34" height="12" rx="4" fill="${m}"/><path d="M26 54h48l-4 8H30z" fill="${t}" opacity=".85"/><rect x="28" y="62" width="5" height="28" rx="2" fill="${m}"/><rect x="67" y="62" width="5" height="28" rx="2" fill="${m}"/></svg>`,
  mesa: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="88" rx="42" ry="3" fill="${s}"/><rect x="6" y="34" width="88" height="7" rx="3" fill="${m}"/><rect x="14" y="41" width="5" height="45" rx="2" fill="${m}"/><rect x="81" y="41" width="5" height="45" rx="2" fill="${m}"/><rect x="19" y="44" width="62" height="4" rx="2" fill="${t}" opacity=".18"/></svg>`,
  cojin: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="80" rx="36" ry="4" fill="${s}"/><path d="M14 56c0-10 8-14 36-14s36 4 36 14-8 18-36 18-36-8-36-18z" fill="#c7cfe6"/><path d="M22 58c8 4 48 4 56 0" stroke="#fff" stroke-width="2" opacity=".7"/><circle cx="50" cy="58" r="3" fill="#8f9bc2"/></svg>`,
  lampara: `<svg viewBox="0 0 100 100" fill="none"><rect x="49" y="4" width="2" height="34" fill="${t}"/><path d="M28 62c0-14 10-24 22-24s22 10 22 24z" fill="${t}"/><ellipse cx="50" cy="62" rx="22" ry="3" fill="${m}"/><ellipse cx="50" cy="70" rx="10" ry="4" fill="#f6e3b0" opacity=".9"/></svg>`,
  banca: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="84" rx="44" ry="3" fill="${s}"/><rect x="6" y="46" width="88" height="8" rx="3" fill="${m}"/><rect x="12" y="54" width="5" height="28" rx="2" fill="${m}"/><rect x="83" y="54" width="5" height="28" rx="2" fill="${m}"/><rect x="17" y="66" width="66" height="4" rx="2" fill="${m}" opacity=".7"/></svg>`,
  set: `<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="86" rx="46" ry="3" fill="${s}"/><g transform="translate(-12 38) scale(.52)"><rect x="31" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="64" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="33" y="20" width="34" height="12" rx="4" fill="${m}"/><path d="M26 54h48l-4 8H30z" fill="${t}" opacity=".85"/><rect x="28" y="62" width="5" height="28" rx="2" fill="${m}"/><rect x="67" y="62" width="5" height="28" rx="2" fill="${m}"/></g><g transform="translate(11 38) scale(.52)"><rect x="31" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="64" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="33" y="20" width="34" height="12" rx="4" fill="${m}"/><path d="M26 54h48l-4 8H30z" fill="${t}" opacity=".85"/><rect x="28" y="62" width="5" height="28" rx="2" fill="${m}"/><rect x="67" y="62" width="5" height="28" rx="2" fill="${m}"/></g><g transform="translate(34 38) scale(.52)"><rect x="31" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="64" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="33" y="20" width="34" height="12" rx="4" fill="${m}"/><path d="M26 54h48l-4 8H30z" fill="${t}" opacity=".85"/><rect x="28" y="62" width="5" height="28" rx="2" fill="${m}"/><rect x="67" y="62" width="5" height="28" rx="2" fill="${m}"/></g><g transform="translate(57 38) scale(.52)"><rect x="31" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="64" y="14" width="5" height="76" rx="2" fill="${m}"/><rect x="33" y="20" width="34" height="12" rx="4" fill="${m}"/><path d="M26 54h48l-4 8H30z" fill="${t}" opacity=".85"/><rect x="28" y="62" width="5" height="28" rx="2" fill="${m}"/><rect x="67" y="62" width="5" height="28" rx="2" fill="${m}"/></g></svg>`,
};

export const SUGERIDOS = [
  { id: 'mesa-fresno', nombre: 'Mesa de comedor Fresno', precio: 2450, icono: 'mesa', razon: 'La misma madera y altura ideal para la silla' },
  { id: 'cojin-lino', nombre: 'Cojín de lino para silla', precio: 145, icono: 'cojin', razon: 'A la medida del asiento de 46 cm' },
  { id: 'lampara-domo', nombre: 'Lámpara colgante Domo', precio: 520, icono: 'lampara', razon: 'Para iluminar la mesa del comedor' },
  { id: 'banca-fresno', nombre: 'Banca Fresno 120 cm', precio: 1150, icono: 'banca', razon: 'Combínala con dos sillas en la mesa' },
  { id: 'set-4', nombre: 'Set de 4 Sillas Nórdicas', precio: 3290, antes: 3580, icono: 'set', razon: 'Ahorra al comprar el juego completo' },
];

// Reseñas ficticias para simular la funcionalidad.
export const RESENAS = [
  { id: 'r1', nombre: 'Andrea M.', ciudad: 'Ciudad de Guatemala', estrellas: 5, fecha: '2026-11-12', titulo: 'La armé sola en 12 minutos', texto: 'Nunca había armado un mueble sin pedir ayuda. La guía 3D me marcaba en qué agujero iba cada tornillo y me avisó cuando tomé el perno equivocado.', armado: true, foto: true, utiles: 24 },
  { id: 'r2', nombre: 'Jorge L.', ciudad: 'Quetzaltenango', estrellas: 4, fecha: '2026-11-03', titulo: 'Bonita y firme', texto: 'La madera se ve muy bien en acabado nogal. Le quito una estrella porque la caja llegó golpeada, aunque las piezas venían bien.', armado: false, foto: false, utiles: 9 },
  { id: 'r3', nombre: 'Lucía R.', ciudad: 'Antigua Guatemala', estrellas: 5, fecha: '2026-10-28', titulo: 'El aviso del travesaño me salvó', texto: 'Iba a poner los travesaños al revés y la guía no me dejó seguir. Con el manual de papel de otra silla me pasó y tuve que desarmar todo.', armado: true, foto: false, utiles: 31 },
  { id: 'r4', nombre: 'Carlos P.', ciudad: 'Mixco', estrellas: 3, fecha: '2026-10-19', titulo: 'Cómoda, pero el cojín es necesario', texto: 'Para comidas largas el asiento se siente duro. Con el cojín de lino quedó perfecta. El armado fue fácil.', armado: true, foto: true, utiles: 6 },
  { id: 'r5', nombre: 'María José S.', ciudad: 'Escuintla', estrellas: 5, fecha: '2026-10-07', titulo: 'Compré el set de cuatro', texto: 'Armé las cuatro en una tarde. Después de la primera ya no necesitaba la guía, pero me gustó que se pueda ver la silla en el comedor con AR antes de comprar.', armado: true, foto: true, utiles: 18 },
  { id: 'r6', nombre: 'Diego H.', ciudad: 'Cobán', estrellas: 4, fecha: '2026-09-22', titulo: 'Buena relación calidad-precio', texto: 'Se siente sólida y no rechina. El acabado natural es más claro que en la foto, pero me gustó igual.', armado: false, foto: false, utiles: 4 },
  { id: 'r7', nombre: 'Sofía G.', ciudad: 'Villa Nueva', estrellas: 2, fecha: '2026-09-10', titulo: 'Me faltó un tornillo', texto: 'Venía un perno largo menos. Lo reporté desde la misma guía y me lo enviaron en dos días, pero tuve que esperar para terminar.', armado: true, foto: false, utiles: 12 },
  { id: 'r8', nombre: 'Rodrigo A.', ciudad: 'Huehuetenango', estrellas: 5, fecha: '2026-08-30', titulo: 'Ideal para el comedor', texto: 'La combiné con la mesa Fresno y se ven muy bien juntas. La recomiendo.', armado: false, foto: true, utiles: 7 },
];

export const formatoQ = (n) => 'Q ' + n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
