import type { Puzzle } from '../../types';

// Puzzles del curso, verificados con Stockfish (ver shared/scripts/generate-puzzles.ts).
//
// Todos salen de las líneas del curso: el rival se desvía con un error natural y el alumno
// (negras) tiene que castigarlo. Cada jugada del alumno es la única buena a profundidad 20.
export const kingsIndianPuzzles: Puzzle[] = [
  {
    id: 'kid-p1',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.d5 e6 8.Qd2 exd5 9.Bd3',
    solution: 'd4',
    theme: { es: 'Horquilla de peón', en: 'Pawn fork' },
    hint: {
      es: 'El blanco no ha recapturado en d5. ¿Qué pueden atacar tus peones?',
      en: 'White has not recaptured on d5. What can your pawns attack?',
    },
    explanation: {
      es: 'Tras [8...exd5] el blanco tenía que recuperar el peón en d5. Con [9.Bd3?] lo deja vivo y [9...d4!] ataca a la vez el alfil de e3 y el caballo de c3: una de las dos piezas cae. En la Sämisch con [...c5] y [...e6], si el blanco no toma en d5, empuja ese peón.',
      en: 'After [8...exd5] White had to win the pawn back on d5. With [9.Bd3?] it survives, and [9...d4!] hits the e3-bishop and the c3-knight at the same time: one of them falls. In the Sämisch with [...c5] and [...e6], if White does not take on d5, push that pawn.',
    },
    rating: 1000,
  },
  {
    id: 'kid-p2',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.Nge2 Nc6 8.d5 Ne5 9.a4',
    solution: 'Nxc4',
    theme: { es: 'Defensor bloqueado', en: 'Blocked defender' },
    hint: { es: '¿Qué pieza blanca podría defender el peón de c4?', en: 'Which white piece could defend the c4-pawn?' },
    explanation: {
      es: 'El caballo de e5 ataca c4, y el alfil de f1 no puede defenderlo porque el caballo de e2 le tapa la diagonal. Por eso en la línea del curso el blanco juega [9.Ng3]. Tras [9.a4?], [9...Nxc4] gana un peón limpio y además ataca el alfil de e3. Cuando el blanco juega [Nge2], fíjate en qué piezas se quedan encerradas.',
      en: 'The e5-knight attacks c4, and the f1-bishop cannot defend it because the e2-knight blocks its diagonal. That is why White plays [9.Ng3] in the course line. After [9.a4?], [9...Nxc4] wins a clean pawn and also hits the e3-bishop. When White plays [Nge2], look at which pieces get shut in.',
    },
    rating: 1050,
  },
  {
    id: 'kid-p3',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Be2 O-O 6.Bg5 c5 7.d5 h6 8.Be3 e6 9.Qd2 exd5 10.Nxd5',
    solution: 'Nxe4',
    theme: { es: 'Captura con ganancia de tiempo', en: 'Capture with tempo' },
    hint: { es: 'Al recapturar con el caballo, ¿qué peón se ha quedado sin defensa?', en: 'After the knight recaptures, which pawn is left without a defender?' },
    explanation: {
      es: 'El caballo de c3 defendía e4. Al recapturar con él, [10.Nxd5?] deja ese peón solo y [10...Nxe4!] lo gana atacando además a la dama de d2. Cuando la dama se aparte, [...Be6] presiona el caballo de d5, y el rey blanco sigue en el centro con la columna e abierta.',
      en: 'The c3-knight was defending e4. By recapturing with it, [10.Nxd5?] leaves that pawn alone, and [10...Nxe4!] wins it while hitting the queen on d2. Once the queen moves, [...Be6] pressures the d5-knight, and the white king is still in the centre on the open e-file.',
    },
    rating: 1200,
  },
  {
    id: 'kid-p4',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 a5 8.b4',
    solution: 'axb4',
    theme: { es: 'Atacar al defensor', en: 'Undermining the defender' },
    hint: { es: '¿Qué pieza blanca sostiene el peón de e4? Atácala.', en: 'Which white piece holds the e4-pawn? Attack it.' },
    explanation: {
      es: 'Tu [7...a5] estaba ahí justo para frenar [b4]. Tras [8.b4?] [8...axb4!] el peón ataca al caballo de c3, que es el único defensor de e4. Si el caballo se va, como en [9.Nb5], [9...Nxe4] se lleva el segundo peón. Cuando no puedas atacar un peón directamente, ataca a la pieza que lo defiende.',
      en: 'Your [7...a5] was there precisely to stop [b4]. After [8.b4?] [8...axb4!] the pawn hits the c3-knight, the only defender of e4. If the knight leaves, as in [9.Nb5], [9...Nxe4] collects a second pawn. When you cannot attack a pawn directly, attack the piece that defends it.',
    },
    rating: 1100,
  },
  {
    id: 'kid-p5',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 a5 8.Bg5 h6 9.Bh4 Na6 10.Nd2 Qe8 11.g3',
    solution: 'g5 Bxg5 hxg5',
    theme: { es: 'Pieza atrapada', en: 'Trapped piece' },
    hint: { es: 'Mira las casillas de retirada del alfil de h4.', en: 'Look at the retreat squares of the h4-bishop.' },
    explanation: {
      es: 'En el sistema Petrosian el alfil de h4 vigila tu caballo de f6, pero necesita la casilla g3 para volver. Tras [11.g3?] ya no la tiene: [11...g5!] lo deja sin salida, y si [12.Bxg5 hxg5] te llevas una pieza por un peón. Antes de jugar [...g5] en estas posiciones, comprueba siempre si el alfil puede retirarse a g3.',
      en: 'In the Petrosian System the h4-bishop eyes your f6-knight, but it needs the g3-square to get back. After [11.g3?] that square is gone: [11...g5!] leaves it with no way out, and after [12.Bxg5 hxg5] you have a piece for a pawn. Before playing [...g5] in these positions, always check whether the bishop can retreat to g3.',
    },
    rating: 1300,
  },
  {
    id: 'kid-p6',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Nf3 c5 7.d5 e6 8.Be2 exd5 9.cxd5 Re8 10.a4',
    solution: 'Nxe4 Nxe4 Rxe4',
    theme: { es: 'Contar atacantes y defensores', en: 'Counting attackers and defenders' },
    hint: { es: 'Cuenta cuántas veces atacas e4 y cuántas lo defiende el blanco.', en: 'Count how many times you attack e4 and how many times White defends it.' },
    explanation: {
      es: 'Con [9...Re8] atacas e4 dos veces (caballo y torre) y solo lo defiende el caballo de c3. Por eso el blanco tiene que jugar [10.Nd2] o [10.e5]. Tras [10.a4?], [10...Nxe4! 11.Nxe4 Rxe4] gana un peón central, y tu torre clava el alfil de e2 contra el rey, que todavía no ha enrocado.',
      en: 'With [9...Re8] you hit e4 twice (knight and rook) and only the c3-knight defends it. That is why White has to play [10.Nd2] or [10.e5]. After [10.a4?], [10...Nxe4! 11.Nxe4 Rxe4] wins a central pawn, and your rook pins the e2-bishop against the king, which has not castled yet.',
    },
    rating: 1350,
  },
  {
    id: 'kid-p7',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.dxc5 dxc5 8.Qxd8 Rxd8 9.Bxc5 Nc6 10.e5',
    solution: 'Nd7 Ba3 Ndxe5',
    theme: { es: 'Ataque doble', en: 'Double attack' },
    hint: {
      es: 'Retira el caballo atacado a una casilla desde la que ataque dos objetivos.',
      en: 'Retreat the attacked knight to a square from which it hits two targets.',
    },
    explanation: {
      es: 'En el gambito de la Sämisch el blanco ha ganado un peón, pero va retrasado en desarrollo. [10.e5?] echa a tu caballo, pero [10...Nd7!] ataca a la vez el alfil de c5 y el peón de e5, que también atacan el caballo de c6 y tu alfil de g7. Tras [11.Ba3 Ndxe5] recuperas el peón y tus piezas mandan en el centro.',
      en: 'In the Sämisch gambit White has won a pawn but is behind in development. [10.e5?] kicks your knight, but [10...Nd7!] hits the c5-bishop and the e5-pawn at the same time, and e5 is also attacked by the c6-knight and your g7-bishop. After [11.Ba3 Ndxe5] you regain the pawn and your pieces rule the centre.',
    },
    rating: 1450,
  },
  {
    id: 'kid-p8',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Nf3 c5 7.d5 e6 8.Be2 exd5 9.cxd5 Re8 10.Nd2 Na6 11.O-O Nc7 12.b3',
    solution: 'Nfxd5',
    theme: { es: 'Ataque a la descubierta', en: 'Discovered attack' },
    hint: { es: 'Si el caballo de f6 se mueve, ¿qué ve tu alfil de g7?', en: 'If the f6-knight moves, what does your g7-bishop see?' },
    explanation: {
      es: 'El caballo de f6 tapa la gran diagonal de tu alfil. Tras [12.b3?], el caballo de c3 ya no está protegido por un peón y detrás tiene la torre de a1. [12...Nfxd5!] gana el peón y abre la diagonal: el caballo de c3 queda atacado dos veces y, si se cambian los caballos, [13.Nxd5 Nxd5 14.exd5 Bxa1] te da la calidad. En la India de Rey, el alfil de g7 es tu mejor pieza: vigila siempre lo que hay en su diagonal.',
      en: 'The f6-knight blocks your bishop’s long diagonal. After [12.b3?] the c3-knight is no longer protected by a pawn, and the a1-rook stands behind it. [12...Nfxd5!] wins the pawn and opens the diagonal: the c3-knight is attacked twice, and if the knights are traded, [13.Nxd5 Nxd5 14.exd5 Bxa1] wins the exchange. In the King’s Indian the g7-bishop is your best piece: always check what stands on its diagonal.',
    },
    rating: 1600,
  },
  {
    id: 'kid-p9',
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.Bd3',
    solution: 'Ng4 fxg4 cxd4',
    theme: { es: 'Caballo envenenado', en: 'Poisoned knight' },
    hint: {
      es: '¿Quién defiende el peón de d4? Ataca a esa pieza, aunque parezca que regalas algo.',
      en: 'Who defends the d4-pawn? Attack that piece, even if it looks like you are giving something away.',
    },
    explanation: {
      es: 'Tras [6...c5] el peón de d4 lo defiende el alfil de e3; por eso lo normal es [7.Nge2], que lo refuerza. [7.Bd3?] no lo hace, y [7...Ng4!] ataca al defensor y abre la diagonal de tu alfil de g7 hacia d4. El caballo no se puede tomar: tras [8.fxg4 cxd4] el peón ataca a la vez el alfil de e3 y el caballo de c3, recuperas la pieza y el rey blanco queda sin el peón de f. Si el alfil se aparta, [8...cxd4] gana un peón.',
      en: 'After [6...c5] the d4-pawn is defended by the e3-bishop, which is why [7.Nge2], adding support, is normal. [7.Bd3?] does not help, and [7...Ng4!] attacks the defender and opens your g7-bishop’s diagonal towards d4. The knight cannot be taken: after [8.fxg4 cxd4] the pawn hits the e3-bishop and the c3-knight at once, you win the piece back and the white king has lost its f-pawn. If the bishop steps aside, [8...cxd4] wins a pawn.',
    },
    rating: 1850,
  },
  {
    id: 'kid-p10',
    moves:
      '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.b4 Nh5 10.Re1 f5 11.Ng5 Nf6 12.f3 Kh8 13.Be3 Nh5 14.c5 Bh6 15.exf5',
    solution: 'Nxf5',
    theme: { es: 'Defensor sobrecargado', en: 'Overloaded defender' },
    hint: { es: 'El alfil de e3 tiene un trabajo muy importante. Atácalo.', en: 'The e3-bishop has a very important job. Attack it.' },
    explanation: {
      es: 'Tu alfil de h6 ataca el caballo de g5, y solo lo defiende el alfil de e3. Tras [15.exf5?], recaptura con el caballo: [15...Nxf5!] ataca a ese alfil. Si se aparta (por ejemplo [16.Bf2]), [16...Bxg5] gana una pieza; si se queda, [...Nxe3] elimina al defensor y el caballo cae igual. Al recapturar, elige la pieza que crea una amenaza.',
      en: 'Your h6-bishop attacks the g5-knight, and only the e3-bishop defends it. After [15.exf5?], recapture with the knight: [15...Nxf5!] hits that bishop. If it steps away (for example [16.Bf2]), [16...Bxg5] wins a piece; if it stays, [...Nxe3] removes the defender and the knight falls anyway. When you recapture, pick the piece that creates a threat.',
    },
    rating: 1400,
  },
  {
    id: 'kid-p11',
    moves: '1.d4 Nf6 2.Nf3 g6 3.Bf4 Bg7 4.e3 d6 5.h3 O-O 6.Be2 Nbd7 7.O-O Qe8 8.Bh2 e5 9.c4 exd4 10.Qxd4',
    solution: 'Ne4 Qd3 Bxb2',
    theme: { es: 'Ataque a la descubierta', en: 'Discovered attack' },
    hint: {
      es: 'Tu caballo de f6 tapa la diagonal del alfil de g7. ¿Qué hay al final de esa diagonal?',
      en: 'Your f6-knight blocks the g7-bishop’s diagonal. What stands at the end of it?',
    },
    explanation: {
      es: 'Recapturar con la dama la pone en la gran diagonal de tu alfil, tapada solo por tu caballo de f6. [10...Ne4!] destapa el ataque: la dama tiene que irse (el caballo de e4 lo defiende tu dama de e8) y después [11...Bxb2] gana un peón y ataca la torre de a1, que no tiene adónde ir. Por eso contra el Londres preparas [...e5] con [...Qe8]: la dama también trabaja en la columna e.',
      en: 'Recapturing with the queen puts it on your bishop’s long diagonal, blocked only by your f6-knight. [10...Ne4!] uncovers the attack: the queen must move (your e8-queen defends the e4-knight) and then [11...Bxb2] wins a pawn and hits the a1-rook, which has nowhere to go. That is why against the London you prepare [...e5] with [...Qe8]: the queen works on the e-file too.',
    },
    rating: 1500,
  },
  {
    id: 'kid-p12',
    moves:
      '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3 f5 11.f3 f4 12.Bf2 g5 13.Nd3 Ng6 14.c5 Nf6 15.a4 h5 16.Nb5 g4 17.h4',
    solution: 'g3',
    theme: { es: 'Ruptura de peones', en: 'Pawn breakthrough' },
    hint: {
      es: 'Tus peones ya están junto al rey blanco. ¿Qué casilla ha dejado de vigilar el peón de h?',
      en: 'Your pawns are already next to the white king. Which square is the h-pawn no longer watching?',
    },
    explanation: {
      es: 'Es la carrera típica de la Mar del Plata, y [17.h4?] es un error: el peón de h ya no controla g3. [17...g3!] ataca el alfil de f2 y abre la puerta del rey blanco. Si [18.Bxg3 fxg3], la columna f se abre para tu torre; y si el blanco deja el alfil (por ejemplo [18.Qe1]), [18...gxf2+] se lo lleva. En la Mar del Plata, [...g3] suele ser el golpe que rompe el enroque blanco.',
      en: 'This is the typical Mar del Plata race, and [17.h4?] is a mistake: the h-pawn no longer controls g3. [17...g3!] hits the f2-bishop and opens the door to the white king. If [18.Bxg3 fxg3], the f-file opens for your rook; and if White leaves the bishop (for example [18.Qe1]), [18...gxf2+] takes it. In the Mar del Plata, [...g3] is usually the blow that breaks open White’s castle.',
    },
    rating: 1550,
  },
];
