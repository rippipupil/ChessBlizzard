import type { Course } from '../types';

// Siciliana Dragón: repertorio para negras contra 1.e4.
// Orden del repertorio: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6.
// Todas las líneas se han revisado con Stockfish (scripts/audit-content.ts, profundidad 16).

const DRAGON = '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6';
const YUGO = `${DRAGON} 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6`;
const TOPALOV = `${YUGO} 9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Nxd4 12.Bxd4 b5`;
const MODERN = `${YUGO} 9.O-O-O d5 10.exd5 Nxd5 11.Nxc6 bxc6`;

export const dragon: Course = {
  id: 'dragon',
  name: { es: 'Siciliana Dragón', en: 'Sicilian Dragon' },
  side: 'b',
  eco: 'B70–B79',
  vs: { es: 'Negras · contra 1.e4', en: 'Black · against 1.e4' },
  tagline: {
    es: 'Un alfil que escupe fuego por la gran diagonal y un contraataque por la columna c.',
    en: 'A bishop breathing fire down the long diagonal and a counter-attack on the c-file.',
  },
  history: { es: '', en: '' },
  references: [],

  lines: [
    {
      id: 'drag-main',
      name: { es: 'Yugoslavo · Variante Topalov', en: 'Yugoslav · Topalov Variation' },
      moves: `${TOPALOV} 13.Nd5 Nxd5 14.Bxg7 Kxg7 15.exd5 a5 16.a3 Kg8 17.h4 b4`,
    },
    {
      id: 'drag-bxa7',
      name: { es: 'Topalov · 13.Axa7', en: 'Topalov · 13.Bxa7' },
      moves: `${TOPALOV} 13.Bxa7 b4 14.Nd5 Nxd5 15.exd5 Qa5 16.Qe3 Ba4 17.Bd4 Bxb3 18.Qxb3 Rc7`,
    },
    {
      id: 'drag-soltis',
      name: { es: 'Variante Soltis · 10.h4 h5', en: 'Soltis Variation · 10.h4 h5' },
      moves: `${YUGO} 9.Bc4 Bd7 10.h4 h5 11.O-O-O Ne5 12.Bb3 Rc8 13.Bg5 Rc5 14.Kb1 b5 15.g4 a5 16.Bxf6 Bxf6 17.gxh5 a4 18.Bd5 e6`,
    },
    {
      id: 'drag-9ooo',
      name: { es: 'Yugoslavo · 9.0-0-0 d5 12.Ad4', en: 'Yugoslav · 9.O-O-O d5 12.Bd4' },
      moves: `${MODERN} 12.Bd4 Bxd4 13.Qxd4 Qb6 14.Na4 Qc7 15.Bc4 Rd8`,
    },
    {
      id: 'drag-9ooo-nxd5',
      name: { es: 'Yugoslavo · 9.0-0-0 d5 12.Cxd5', en: 'Yugoslav · 9.O-O-O d5 12.Nxd5' },
      moves: `${MODERN} 12.Nxd5 cxd5 13.Qxd5 Qc7 14.Qc5 Qb7 15.c3 Be6`,
    },
    {
      id: 'drag-9g4',
      name: { es: 'Yugoslavo · 9.g4', en: 'Yugoslav · 9.g4' },
      moves: `${YUGO} 9.g4 Be6 10.Nxe6 fxe6 11.O-O-O Ne5 12.Be2 Qc8`,
    },
    {
      id: 'drag-classical',
      name: { es: 'Variante Clásica · 6.Ae2', en: 'Classical Variation · 6.Be2' },
      moves: `${DRAGON} 6.Be2 Bg7 7.O-O O-O 8.Be3 Nc6 9.Nb3 Be6 10.f4 Qc8 11.h3 Rd8 12.Kh2 Bxb3 13.axb3 d5`,
    },
    {
      id: 'drag-levenfish',
      name: { es: 'Variante Levenfish · 6.f4', en: 'Levenfish Variation · 6.f4' },
      moves: `${DRAGON} 6.f4 Nc6 7.Nxc6 bxc6 8.e5 Nd7 9.exd6 exd6 10.Qd4 Nf6 11.Bd3 Bg7 12.Qe3+ Be6 13.f5 gxf5 14.Bxf5 O-O`,
    },
    {
      id: 'drag-fianchetto',
      name: { es: 'Fianchetto · 6.g3', en: 'Fianchetto · 6.g3' },
      moves: `${DRAGON} 6.g3 Nc6 7.Nde2 Bg7 8.Bg2 O-O 9.O-O Rb8 10.a4 a6 11.h3 b5 12.axb5 axb5`,
    },
    {
      id: 'drag-alapin',
      name: { es: 'Alapin · 2.c3', en: 'Alapin · 2.c3' },
      moves: '1.e4 c5 2.c3 d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3 Bg4 6.Be2 e6 7.O-O Nc6 8.h3 Bh5 9.Be3 cxd4 10.cxd4 Be7 11.Nc3 Qd6',
    },
    {
      id: 'drag-moscow',
      name: { es: 'Variante Moscú · 3.Ab5+', en: 'Moscow Variation · 3.Bb5+' },
      moves: '1.e4 c5 2.Nf3 d6 3.Bb5+ Bd7 4.Bxd7+ Qxd7 5.O-O Nc6 6.c3 Nf6 7.Re1 e6 8.d4 cxd4 9.cxd4 d5 10.e5 Ne4',
    },
    {
      id: 'drag-closed',
      name: { es: 'Siciliana Cerrada · 2.Cc3 y 3.g3', en: 'Closed Sicilian · 2.Nc3 and 3.g3' },
      moves: '1.e4 c5 2.Nc3 d6 3.g3 Nc6 4.Bg2 g6 5.d3 Bg7 6.Be3 Rb8 7.Qd2 b5 8.Nge2 b4 9.Nd1 e5',
    },
    {
      id: 'drag-grandprix',
      name: { es: 'Grand Prix · 2.Cc3 y 3.f4', en: 'Grand Prix · 2.Nc3 and 3.f4' },
      moves: '1.e4 c5 2.Nc3 d6 3.f4 Nc6 4.Nf3 g6 5.Bc4 Bg7 6.O-O e6 7.d3 Nge7 8.Qe1 O-O',
    },
    {
      id: 'drag-morra',
      name: { es: 'Gambito Smith-Morra · 2.d4 cxd4 3.c3', en: 'Smith-Morra Gambit · 2.d4 cxd4 3.c3' },
      moves: '1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O Nf6 8.Qe2 Be7 9.Rd1 e5 10.h3 O-O 11.Be3 Be6',
    },

    // --- Trampas y errores típicos ---
    {
      id: 'drag-trap-a7',
      name: { es: 'Trampa: 13.Axa7? b4 14.Ca4?', en: 'Trap: 13.Bxa7? b4 14.Na4?' },
      moves: `${TOPALOV} 13.Bxa7 b4 14.Na4 Bxa4 15.Bxa4 Qa5 16.Bb3 Qxa7`,
    },
    {
      id: 'drag-trap-qxa8',
      name: { es: 'Trampa: 14.Dxa8? Af5!', en: 'Trap: 14.Qxa8? Bf5!' },
      moves: `${MODERN} 12.Nxd5 cxd5 13.Qxd5 Qc7 14.Qxa8 Bf5 15.Qxf8+ Kxf8 16.Bd3 Qe5 17.Kd2 Bxd3 18.Kxd3 Qxb2`,
    },
    {
      id: 'drag-trap-ng4',
      name: { es: 'Error típico: 6...Cg4? 7.Ab5+!', en: 'Typical mistake: 6...Ng4? 7.Bb5+!' },
      practice: false,
      moves: `${DRAGON} 6.Be3 Ng4 7.Bb5+ Bd7 8.Qxg4 Bxb5 9.Ndxb5`,
    },
    {
      id: 'drag-trap-levenfish',
      name: { es: 'Error típico: 6.f4 Ag7?! 7.e5!', en: 'Typical mistake: 6.f4 Bg7?! 7.e5!' },
      practice: false,
      moves: `${DRAGON} 6.f4 Bg7 7.e5 dxe5 8.fxe5 Ng4 9.Bb5+ Nc6 10.Nxc6 bxc6 11.Bxc6+ Bd7 12.Bxa8 Qxa8`,
    },
  ],

  puzzles: [],

  camps: [
    {
      id: 'base',
      name: { es: 'Campamento base', en: 'Base camp' },
      title: { es: 'La gran diagonal', en: 'The long diagonal' },
      stages: [
        {
          id: 'main-line',
          type: 'line',
          title: { es: 'Línea principal', en: 'Main line' },
          subtitle: { es: 'Ataque Yugoslavo · Variante Topalov', en: 'Yugoslav Attack · Topalov Variation' },
          intro: {
            es: 'El Ataque Yugoslavo, la prueba más dura del Dragón, jugada a jugada y con el porqué de cada movimiento.',
            en: 'The Yugoslav Attack, the toughest test of the Dragon, move by move, with the reason behind each one.',
          },
          lines: ['drag-main'],
        },
        {
          id: 'main-practice',
          type: 'practice',
          title: { es: 'Practica la línea', en: 'Practise the line' },
          subtitle: { es: 'Juegas tú las negras', en: 'You play Black' },
          intro: {
            es: 'Juegas tú con negras la línea principal. Si fallas, te enseñamos la jugada y la repetirás más adelante.',
            en: 'You play the main line as Black. If you slip, we show you the move and you will repeat it later.',
          },
          lines: ['drag-main'],
        },
      ],
    },
    {
      id: 'camp1',
      name: { es: 'Campamento 1', en: 'Camp 1' },
      title: { es: 'Variantes y anti-sicilianas', en: 'Variations and anti-Sicilians' },
      stages: [
        {
          id: 'yugoslav-branches',
          type: 'branch',
          title: { es: 'El Yugoslavo: otros planes', en: 'The Yugoslav: other plans' },
          subtitle: { es: '13.Axa7, Soltis, 9.0-0-0 y 9.g4', en: '13.Bxa7, Soltis, 9.O-O-O and 9.g4' },
          intro: {
            es: 'El blanco no siempre sigue la línea principal. Aprende qué hacer si se come el peón de a7, si avanza h4 pronto, si enroca sin Ac4 o si lanza g4.',
            en: 'White does not always follow the main line. Learn what to do if he grabs the a7-pawn, pushes h4 early, castles without Bc4 or launches g4.',
          },
          lines: ['drag-bxa7', 'drag-soltis', 'drag-9ooo', 'drag-9ooo-nxd5', 'drag-9g4'],
        },
        {
          id: 'quiet-systems',
          type: 'branch',
          title: { es: '¿Y si no juega el Yugoslavo?', en: 'What if White avoids the Yugoslav?' },
          subtitle: { es: 'Clásica, Levenfish y fianchetto', en: 'Classical, Levenfish and fianchetto' },
          intro: {
            es: 'Tres sistemas en los que el blanco no enroca largo. El Dragón cambia de cara: menos carrera y más juego en el centro.',
            en: 'Three systems in which White does not castle long. The Dragon changes its face: less racing and more central play.',
          },
          lines: ['drag-classical', 'drag-levenfish', 'drag-fianchetto'],
        },
        {
          id: 'anti-sicilians',
          type: 'branch',
          title: { es: 'Anti-sicilianas', en: 'Anti-Sicilians' },
          subtitle: { es: '2.c3, 3.Ab5+, Cerrada, Grand Prix y Morra', en: '2.c3, 3.Bb5+, Closed, Grand Prix and Morra' },
          intro: {
            es: 'Muchos rivales evitan la Siciliana abierta desde la segunda jugada. Con estas cinco recetas sabrás qué hacer.',
            en: 'Many opponents avoid the Open Sicilian from move two. With these five recipes you will know what to do.',
          },
          lines: ['drag-alapin', 'drag-moscow', 'drag-closed', 'drag-grandprix', 'drag-morra'],
        },
      ],
    },
    {
      id: 'summit',
      name: { es: 'Cumbre', en: 'Summit' },
      title: { es: 'Táctica y examen', en: 'Tactics and exam' },
      stages: [
        {
          id: 'traps',
          type: 'trap',
          title: { es: 'Trampas', en: 'Traps' },
          subtitle: { es: 'Golpes para ti y errores que evitar', en: 'Blows for you and mistakes to avoid' },
          intro: {
            es: 'Dos trampas en las que cae el blanco con facilidad y dos errores que tú no debes cometer.',
            en: 'Two traps that White falls into easily and two mistakes you must not make.',
          },
          lines: ['drag-trap-a7', 'drag-trap-qxa8', 'drag-trap-ng4', 'drag-trap-levenfish'],
        },
        {
          id: 'puzzles',
          type: 'puzzles',
          title: { es: 'Puzzles', en: 'Puzzles' },
          subtitle: { es: 'Táctica del Dragón', en: 'Dragon tactics' },
          intro: { es: 'Posiciones reales de las líneas del curso con un golpe táctico escondido.', en: 'Real positions from the course lines with a hidden tactic.' },
          puzzles: [],
          passRatio: 0.7,
        },
        {
          id: 'sparring',
          type: 'sparring',
          title: { es: 'Sparring', en: 'Sparring' },
          subtitle: { es: 'Contra Stockfish', en: 'Against Stockfish' },
          intro: {
            es: 'Juega una partida completa contra Stockfish. Mientras el rival siga el libro, practicarás tu repertorio.',
            en: 'Play a full game against Stockfish. While your opponent follows the book, you practise your repertoire.',
          },
          lines: [
            'drag-main', 'drag-bxa7', 'drag-soltis', 'drag-9ooo', 'drag-9ooo-nxd5', 'drag-9g4',
            'drag-classical', 'drag-levenfish', 'drag-fianchetto',
            'drag-alapin', 'drag-moscow', 'drag-closed', 'drag-grandprix', 'drag-morra',
            'drag-trap-a7', 'drag-trap-qxa8',
          ],
        },
        {
          id: 'exam',
          type: 'exam',
          title: { es: 'Examen final', en: 'Final exam' },
          subtitle: { es: 'La cumbre', en: 'The summit' },
          intro: {
            es: 'Líneas sin ayudas y puzzles. Necesitas un 80% para conquistar la cumbre.',
            en: 'Lines without hints and puzzles. You need 80% to conquer the summit.',
          },
          lines: [
            'drag-main', 'drag-bxa7', 'drag-soltis', 'drag-9ooo', 'drag-9ooo-nxd5', 'drag-9g4',
            'drag-classical', 'drag-levenfish', 'drag-fianchetto',
            'drag-alapin', 'drag-moscow', 'drag-closed', 'drag-grandprix', 'drag-morra',
            'drag-trap-a7', 'drag-trap-qxa8',
          ],
          puzzles: [],
          passScore: 0.8,
        },
      ],
    },
  ],
};
