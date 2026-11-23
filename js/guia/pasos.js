// Secuencia de armado de la Silla Nórdica.
//
// aparecen  piezas que se muestran en su posición de espera al iniciar el paso
// colocan   piezas que se deslizan a su posición final durante el paso
// herraje   el único herraje correcto para el paso (H1, H2, H3 o LL)
// agujeros  ids de agujero (ver silla.js) donde va el herraje
// orientar  piezas que llegan giradas y el usuario debe enderezar (paso crítico)
// camara    posición y objetivo de la cámara para el paso

export const PASOS = [
  {
    titulo: 'Coloca los tarugos en los travesaños',
    texto: 'Toma los dos travesaños laterales D. Inserta un tarugo H3 en el agujero grande de cada extremo y empújalo hasta la mitad.',
    aparecen: ['D_L', 'D_R'],
    colocan: [],
    herraje: 'H3',
    agujeros: ['D_L_H3_1', 'D_L_H3_2', 'D_R_H3_1', 'D_R_H3_2'],
    camara: { pos: [0.95, 1.15, 1.7], obj: [0, 0.5, 0.3] },
  },
  {
    titulo: 'Une los travesaños D a las patas delanteras B',
    texto: 'Pon de pie las patas delanteras B. Acerca cada travesaño D con la lengüeta de agujeros pequeños hacia adentro de la silla, encaja los tarugos y fija con un perno largo H1 desde el frente de cada pata.',
    critico: true,
    aviso_critico: 'Si el travesaño queda con la lengüeta hacia afuera, en el paso 6 no podrás atornillar el asiento y tendrás que desarmar.',
    aparecen: ['B_L', 'B_R'],
    colocan: ['B_L', 'B_R', 'D_L', 'D_R'],
    orientar: ['D_L', 'D_R'],
    herraje: 'H1',
    agujeros: ['B_L_H1_1', 'B_R_H1_1'],
    camara: { pos: [1.23, 0.88, 1.48], obj: [0, 0.33, 0.06] },
  },
  {
    titulo: 'Coloca el travesaño frontal E',
    texto: 'Ubica el travesaño E entre las dos patas delanteras, un poco más abajo que los laterales. Fíjalo con un perno largo H1 desde el costado de cada pata.',
    aparecen: ['E'],
    colocan: ['E'],
    herraje: 'H1',
    agujeros: ['B_L_H1_2', 'B_R_H1_2'],
    camara: { pos: [-1.1, 0.62, 1.32], obj: [0, 0.32, 0.15] },
  },
  {
    titulo: 'Une las patas traseras A',
    texto: 'Encaja las patas traseras A en los tarugos libres de los travesaños D. Fíjalas con un perno largo H1 desde atrás de cada pata.',
    aparecen: ['A_L', 'A_R'],
    colocan: ['A_L', 'A_R'],
    herraje: 'H1',
    agujeros: ['A_L_H1_1', 'A_R_H1_1'],
    camara: { pos: [1.23, 0.98, -1.46], obj: [0, 0.42, -0.1] },
  },
  {
    titulo: 'Coloca el respaldo F',
    texto: 'Ubica el respaldo F entre las puntas de las patas traseras, con la curva hacia el frente. Fíjalo con un perno largo H1 desde el costado de cada pata.',
    aparecen: ['F'],
    colocan: ['F'],
    herraje: 'H1',
    agujeros: ['A_L_H1_2', 'A_R_H1_2'],
    camara: { pos: [-1.23, 1.21, -1.18], obj: [0, 0.72, -0.19] },
  },
  {
    titulo: 'Atornilla el asiento C desde abajo',
    texto: 'Apoya el asiento C sobre los travesaños. Desde abajo, pasa un tornillo corto H2 por cada agujero de las lengüetas hasta el asiento. Son 4 en total.',
    aparecen: ['C'],
    colocan: ['C'],
    herraje: 'H2',
    agujeros: ['D_L_H2_1', 'D_L_H2_2', 'D_R_H2_1', 'D_R_H2_2'],
    camara: { pos: [0, 0.03, 0.45], obj: [0, 0.38, 0] },
  },
  {
    titulo: 'Aprieta todos los pernos',
    texto: 'Con la llave Allen, da el apretón final a los 8 pernos largos. Luego pon la silla de pie y comprueba que no cojea.',
    aparecen: [],
    colocan: [],
    herraje: 'LL',
    agujeros: [],
    apretar: true,
    camara: { pos: [1.49, 1.1, 1.76], obj: [0, 0.45, 0] },
  },
];

export const CAMARA_INVENTARIO = { pos: [1.3, 1.05, 1.6], obj: [0, 0.45, 0] };
export const CAMARA_FIN = { pos: [1.2, 0.95, 1.5], obj: [0, 0.45, 0] };
