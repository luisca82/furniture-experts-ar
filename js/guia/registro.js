// Registro de intentos para las pruebas con usuarios.
// Cada intento guarda una fila por paso: tiempo, errores, errores críticos y pistas.
// Se acumula en localStorage y se exporta a CSV.

const CLAVE = 'fe_guia_intentos_v1';

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; }
}
function guardar(filas) {
  try { localStorage.setItem(CLAVE, JSON.stringify(filas)); } catch { /* modo privado */ }
}

export class Registro {
  constructor() { this.nuevoIntento(); }

  nuevoIntento() {
    this.intento = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    this.inicio = performance.now();
    this.pasos = {};       // n → { inicio, segundos, errores, criticos, pistas, detalle[] }
    this.faltantes = [];
    this.acabado = '';
  }

  entrarPaso(n) {
    const p = this.pasos[n] || (this.pasos[n] = { segundos: 0, errores: 0, criticos: 0, pistas: 0, detalle: [] });
    p.inicio = performance.now();
  }
  salirPaso(n) {
    const p = this.pasos[n];
    if (p && p.inicio) { p.segundos += (performance.now() - p.inicio) / 1000; p.inicio = 0; }
  }
  error(n, tipo, critico = false) {
    const p = this.pasos[n]; if (!p) return;
    p.errores++; if (critico) p.criticos++;
    p.detalle.push(tipo);
  }
  pista(n) { const p = this.pasos[n]; if (p) p.pistas++; }

  totales() {
    let errores = 0, criticos = 0, pistas = 0, segundos = 0;
    for (const p of Object.values(this.pasos)) { errores += p.errores; criticos += p.criticos; pistas += p.pistas; segundos += p.segundos; }
    return { errores, criticos, pistas, segundos, total: (performance.now() - this.inicio) / 1000 };
  }

  /** Guarda el intento terminado en el historial local. */
  cerrar(titulos) {
    const fecha = new Date().toISOString();
    const filas = leer();
    for (const [n, p] of Object.entries(this.pasos)) {
      filas.push({
        intento: this.intento, fecha, acabado: this.acabado, paso: n, titulo: titulos[n - 1] || '',
        segundos: p.segundos.toFixed(1), errores: p.errores, errores_criticos: p.criticos, pistas: p.pistas,
        detalle: p.detalle.join(' | '), faltantes: this.faltantes.join(' | '),
      });
    }
    guardar(filas);
  }

  static csv() {
    const filas = leer();
    const cols = ['intento', 'fecha', 'acabado', 'paso', 'titulo', 'segundos', 'errores', 'errores_criticos', 'pistas', 'detalle', 'faltantes'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [cols.join(','), ...filas.map((f) => cols.map((c) => esc(f[c])).join(','))].join('\n');
  }
}
