import type { Puzzle } from '../../types';

// Puzzles del curso, verificados con Stockfish (ver shared/scripts/generate-puzzles.ts).
//
// Todos salen de las líneas del curso: el rival se desvía con un error natural y el alumno
// (negras) tiene que castigarlo. Cada jugada del alumno es la única buena a profundidad 20.
export const dragonPuzzles: Puzzle[] = [
  {
    id: 'drag-p1',
    moves:
      '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.O-O-O d5 10.exd5 Nxd5 11.Nxc6 bxc6 12.Nxd5 cxd5 13.Qxd5 Qc7 14.Qc5 Qb7 15.c3 Be6 16.c4',
    solution: 'Qxb2#',
    theme: { es: 'Mate en una', en: 'Mate in one' },
    hint: {
      es: 'Tu dama y tu alfil de g7 apuntan a la misma casilla, al lado del rey blanco.',
      en: 'Your queen and your g7-bishop aim at the same square, right next to the white king.',
    },
    explanation: {
      es: 'Con [16.c4?] el peón deja de tapar la gran diagonal y tu alfil de g7 vuelve a ver b2. [16...Qxb2#] es mate: la dama está protegida por el alfil y el rey de c1 no tiene casillas. En esta línea, el peón de c3 es el escudo del rey blanco: si se mueve, mira siempre b2.',
      en: 'With [16.c4?] the pawn stops blocking the long diagonal and your g7-bishop sees b2 again. [16...Qxb2#] is mate: the queen is protected by the bishop and the king on c1 has no squares. In this line the c3-pawn is the white king’s shield: if it moves, always look at b2.',
    },
    rating: 900,
  },
  {
    id: 'drag-p2',
    moves: '1.e4 c5 2.c3 d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3 Bg4 6.Bg5',
    solution: 'Bxf3 Qxf3 Qxg5',
    theme: { es: 'Eliminar al defensor', en: 'Removing the defender' },
    hint: { es: '¿Qué pieza blanca defiende el alfil de g5?', en: 'Which white piece defends the g5-bishop?' },
    explanation: {
      es: 'En la Alapin tu dama ya está en d5, en la quinta fila. [6.Bg5?] pone el alfil en esa misma fila, defendido solo por el caballo de f3. [6...Bxf3!] elimina al defensor y, tanto si [7.Qxf3] como si [7.gxf3], [7...Qxg5] gana una pieza.',
      en: 'In the Alapin your queen is already on d5, on the fifth rank. [6.Bg5?] puts the bishop on that same rank, defended only by the f3-knight. [6...Bxf3!] removes the defender, and whether [7.Qxf3] or [7.gxf3], [7...Qxg5] wins a piece.',
    },
    rating: 1100,
  },
  {
    id: 'drag-p3',
    moves:
      '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be2 Bg7 7.O-O O-O 8.Be3 Nc6 9.Nb3 Be6 10.f4 Qc8 11.h3 Rd8 12.Kh2 Bxb3 13.axb3 d5 14.e5',
    solution: 'd4',
    theme: { es: 'Horquilla de peón', en: 'Pawn fork' },
    hint: { es: 'Tu caballo está atacado, pero tu peón de d5 tiene una jugada más fuerte.', en: 'Your knight is attacked, but your d5-pawn has a stronger move.' },
    explanation: {
      es: 'Tras tu ruptura [13...d5], el blanco ataca el caballo con [14.e5?], pero no hace falta retirarlo: [14...d4!] ataca a la vez el caballo de c3 y el alfil de e3, y si [15.exf6], [15...dxc3] recupera la pieza y te deja con ventaja. En la Clásica, la ruptura [...d5] es tu mejor arma.',
      en: 'After your [13...d5] break, White hits the knight with [14.e5?], but there is no need to retreat it: [14...d4!] attacks the c3-knight and the e3-bishop at once, and after [15.exf6], [15...dxc3] wins the piece back and leaves you better. In the Classical, the [...d5] break is your best weapon.',
    },
    rating: 1200,
  },
  {
    id: 'drag-p4',
    moves: '1.e4 c5 2.Nc3 d6 3.g3 Nc6 4.Bg2 g6 5.d3 Bg7 6.Be3 Rb8 7.Qd2 b5 8.Nge2 b4 9.Na4',
    solution: 'Qa5 Nxc5 dxc5',
    theme: { es: 'Caballo atrapado', en: 'Trapped knight' },
    hint: { es: 'El caballo de a4 está en la banda y casi sin casillas.', en: 'The a4-knight is on the edge of the board with almost no squares.' },
    explanation: {
      es: 'Tu [8...b4] echa al caballo de c3, y la casilla buena era [9.Nd1]. En a4 el caballo no tiene salida: tus peones controlan b6 y c3. [9...Qa5!] lo ataca y no hay forma de defenderlo; al blanco solo le queda [10.Nxc5 dxc5], una pieza por un peón. Caballo en la banda, caballo en peligro.',
      en: 'Your [8...b4] kicks the c3-knight, and the right square was [9.Nd1]. On a4 the knight has no way out: your pawns control b6 and c3. [9...Qa5!] attacks it and there is no way to defend it; all White has left is [10.Nxc5 dxc5], a piece for a pawn. A knight on the rim is a knight in danger.',
    },
    rating: 1250,
  },
  {
    id: 'drag-p5',
    moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.g4 Be6 10.Nxe6 fxe6 11.f4',
    solution: 'Nxg4 Bh3 Nxe3',
    theme: { es: 'Peón desprotegido', en: 'Loose pawn' },
    hint: { es: 'El peón de f3 defendía a su compañero de g4. ¿Y ahora?', en: 'The f3-pawn used to defend its neighbour on g4. And now?' },
    explanation: {
      es: 'Con el peón en f3, el de g4 estaba protegido. Tras [11.f4?] ya no lo está, y [11...Nxg4!] lo gana atacando además el alfil de e3. Si [12.Bh3], [12...Nxe3 13.Qxe3] te deja con un peón de más, sin el alfil blanco de casillas negras y con tu torre de f8 presionando por la columna f.',
      en: 'With the pawn on f3, the g4-pawn was protected. After [11.f4?] it no longer is, and [11...Nxg4!] wins it while also hitting the e3-bishop. If [12.Bh3], [12...Nxe3 13.Qxe3] leaves you a pawn up, with White’s dark-squared bishop gone and your f8-rook pressing down the f-file.',
    },
    rating: 1300,
  },
  {
    id: 'drag-p6',
    moves: '1.e4 c5 2.Nc3 d6 3.f4 Nc6 4.Nf3 g6 5.Bc4 Bg7 6.O-O e6 7.d3 Nge7 8.Be3',
    solution: 'd5',
    theme: { es: 'Golpe en el centro', en: 'Central strike' },
    hint: { es: 'Los alfiles de c4 y e3 están mal colocados frente a tus peones centrales.', en: 'The c4- and e3-bishops are badly placed against your central pawns.' },
    explanation: {
      es: 'Contra el Grand Prix, la ruptura [...d5] es tu mejor defensa, y [8.Be3?] la hace todavía más fuerte. [8...d5!] ataca el alfil de c4 y amenaza [...d4], que atacaría a la vez el alfil de e3 y el caballo de c3. Si [9.Bxc5], [9...dxc4] gana una pieza por un peón; y tras [9.exd5 exd5] el alfil sigue atacado y la amenaza [...d4] sigue en pie: el blanco pierde material.',
      en: 'Against the Grand Prix, the [...d5] break is your best defence, and [8.Be3?] makes it even stronger. [8...d5!] hits the c4-bishop and threatens [...d4], which would attack the e3-bishop and the c3-knight at once. If [9.Bxc5], [9...dxc4] wins a piece for a pawn; and after [9.exd5 exd5] the bishop is still attacked and the [...d4] threat remains: White loses material.',
    },
    rating: 1350,
  },
  {
    id: 'drag-p7',
    moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.O-O-O d5 10.exd5 Nxd5 11.Nxc6 bxc6 12.h4',
    solution: 'Bxc3 bxc3 Qa5',
    theme: { es: 'Destruir el enroque', en: 'Wrecking the king’s cover' },
    hint: { es: 'El caballo de c3 es el mejor defensor del rey blanco. ¿Puedes eliminarlo?', en: 'The c3-knight is the white king’s best defender. Can you get rid of it?' },
    explanation: {
      es: 'En esta línea el blanco tenía que jugar [12.Bd4] para cambiar tu alfil de g7. Tras [12.h4?], [12...Bxc3!] destroza los peones de su enroque: después de [13.bxc3 Qa5], tu dama ataca c3 y a2 y tu caballo de d5 se suma al ataque. El rey blanco ya no tiene dónde esconderse.',
      en: 'In this line White had to play [12.Bd4] to trade off your g7-bishop. After [12.h4?], [12...Bxc3!] wrecks the pawns in front of his king: after [13.bxc3 Qa5] your queen hits c3 and a2, and your d5-knight joins the attack. The white king has nowhere left to hide.',
    },
    rating: 1400,
  },
  {
    id: 'drag-p8',
    moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.O-O-O d5 10.exd5 Nxd5 11.g4',
    solution: 'Nxe3 Nxc6 Qxd2+ Rxd2 bxc6',
    theme: { es: 'Jugada intermedia', en: 'In-between move' },
    hint: { es: 'Cambia en e3 y, antes de recapturar en c6, busca un jaque.', en: 'Trade on e3 and, before recapturing on c6, look for a check.' },
    explanation: {
      es: 'Tras [10...Nxd5] el blanco debía cambiar en c6. Con [11.g4?], [11...Nxe3!] se lleva el alfil (y si [12.Qxe3], [12...Nxd4] gana una pieza). Si [12.Nxc6], no recaptures todavía: [12...Qxd2+!] cambia las damas con jaque y solo después [13.Rxd2 bxc6] recupera el caballo. Has ganado una pieza.',
      en: 'After [10...Nxd5] White had to trade on c6. After [11.g4?], [11...Nxe3!] takes the bishop (and if [12.Qxe3], [12...Nxd4] wins a piece). If [12.Nxc6], do not recapture yet: [12...Qxd2+!] trades queens with check, and only then [13.Rxd2 bxc6] wins the knight back. You are a piece up.',
    },
    rating: 1550,
  },
  {
    id: 'drag-p9',
    moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.O-O-O d5 10.exd5 Nxd5 11.Qe1',
    solution: 'Nxe3 Nxc6 Bxc3 Qxe3 Bxb2+',
    theme: { es: 'Desviación', en: 'Deflection' },
    hint: {
      es: 'Cambia en e3 y, antes de recapturar en c6, encadena jugadas que ganen tiempo.',
      en: 'Trade on e3 and, before recapturing on c6, chain together moves that gain time.',
    },
    explanation: {
      es: '[11.Qe1?] aparta la dama de la columna d. [11...Nxe3!] se lleva el alfil y, si [12.Nxc6], no recaptures: [12...Bxc3!] ataca a la dama, y tras [13.Qxe3 Bxb2+!] el rey tiene que dejar de defender la torre de d1, que cae con [...Qxd1]. En estas posiciones abiertas, encadenar amenazas vale más que recuperar material enseguida.',
      en: '[11.Qe1?] takes the queen off the d-file. [11...Nxe3!] grabs the bishop and, if [12.Nxc6], do not recapture: [12...Bxc3!] hits the queen, and after [13.Qxe3 Bxb2+!] the king has to stop defending the d1-rook, which falls to [...Qxd1]. In these open positions, chaining threats is worth more than winning material back at once.',
    },
    rating: 1700,
  },
  {
    id: 'drag-p10',
    moves:
      '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Nxd4 12.Bxd4 b5 13.Bxa7 b4 14.Nd5 Nxd5 15.exd5 Qa5 16.Be3',
    solution: 'Rc3',
    theme: { es: 'Sacrificio de calidad en c3', en: 'The exchange sacrifice on c3' },
    hint: {
      es: 'Tu torre puede atacar dos piezas desde c3. ¿Qué pasa si el blanco la toma?',
      en: 'Your rook can hit two pieces from c3. What happens if White takes it?',
    },
    explanation: {
      es: '[16...Rc3!] ataca a la vez los alfiles de b3 y e3. Si [17.bxc3 bxc3], el peón ataca a la dama y abre la columna b: si la dama se aparta, la tuya entra por a3 o a2 con un ataque decisivo, así que el blanco tendría que entregarla. Por eso es mejor para él no tomar la torre, pero entonces [...Rxb3] elimina el alfil que protege a su rey. El sacrificio en c3 es el golpe más típico del Dragón.',
      en: '[16...Rc3!] hits the b3- and e3-bishops at the same time. If [17.bxc3 bxc3], the pawn attacks the queen and opens the b-file: if the queen steps away, yours comes in via a3 or a2 with a decisive attack, so White would have to give it up. That is why it is better for White not to take the rook, but then [...Rxb3] removes the bishop that shields his king. The sacrifice on c3 is the most typical blow in the Dragon.',
    },
    rating: 1800,
  },
];
