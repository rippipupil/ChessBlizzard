import type { Puzzle } from '../../types';

// Puzzles del curso, verificados con Stockfish (ver shared/scripts/generate-puzzles.ts).
//
// Todos salen de las líneas del curso (o de su continuación natural): el rival se desvía con
// un error y el alumno (blancas) tiene que castigarlo. Cada jugada del alumno es la única
// buena a profundidad 20.
export const englishPuzzles: Puzzle[] = [
  {
    id: 'eng-p1',
    moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Be7',
    solution: 'Nxe5',
    theme: { es: 'Peón sin defensa', en: 'Undefended pawn' },
    hint: { es: '¿Está bien defendido el peón de e5?', en: 'Is the e5-pawn properly defended?' },
    explanation: {
      es: 'En este Dragón al revés, el peón de e5 es el blanco natural de tu caballo de f3: por eso el negro suele jugar [6...Nc6]. Tras [6...Be7?] nadie lo defiende y [7.Nxe5] lo gana. Además, el caballo ya no tapa la gran diagonal y tu alfil de g2 apunta a b7.',
      en: 'In this Reversed Dragon the e5-pawn is the natural target of your f3-knight, which is why Black usually plays [6...Nc6]. After [6...Be7?] nobody defends it and [7.Nxe5] wins it. And the knight no longer blocks the long diagonal, so your g2-bishop eyes b7.',
    },
    rating: 900,
  },
  {
    id: 'eng-p2',
    moves:
      '1.c4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.Nf3 e5 6.O-O Nge7 7.d3 O-O 8.a3 d6 9.Rb1 f5 10.Ne1 Rb8 11.Nc2 b6 12.b4 h6 13.Ne3 Kh7 14.Ned5 Ba6',
    solution: 'b5 Bb7 bxc6',
    theme: { es: 'Horquilla de peón', en: 'Pawn fork' },
    hint: { es: 'Un peón puede atacar dos piezas a la vez.', en: 'A pawn can attack two pieces at once.' },
    explanation: {
      es: 'Contra el Botvinnik del negro tu plan es [b4]-[b5] en el flanco de dama. Tras [14...Ba6?], el alfil y el caballo de c6 están justo en las dos casillas que ataca un peón en b5: [15.b5!] los ataca a la vez. El alfil se retira con [15...Bb7] y [16.bxc6] gana el caballo.',
      en: 'Against Black’s Botvinnik set-up your plan is [b4]-[b5] on the queenside. After [14...Ba6?] the bishop and the c6-knight stand on exactly the two squares a pawn on b5 attacks: [15.b5!] hits both. The bishop retreats with [15...Bb7] and [16.bxc6] wins the knight.',
    },
    rating: 1050,
  },
  {
    id: 'eng-p3',
    moves: '1.c4 Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 g6 5.Bg2 Nxc3 6.bxc3 Bd7',
    solution: 'Bxb7 Bc6 Bxa8',
    theme: { es: 'La gran diagonal', en: 'The long diagonal' },
    hint: { es: '¿Quién defendía el peón de b7 antes de [6...Bd7]?', en: 'Who was defending the b7-pawn before [6...Bd7]?' },
    explanation: {
      es: 'En la Anglo-Grünfeld tu alfil de g2 mira a lo largo de la gran diagonal hasta a8. El alfil de c8 defendía b7; tras [6...Bd7?] el peón se queda solo y [7.Bxb7] lo gana atacando además la torre. Si [7...Bc6], [8.Bxa8 Bxa8] te deja con una calidad y un peón de más.',
      en: 'In the Anglo-Grünfeld your g2-bishop looks all the way down the long diagonal to a8. The c8-bishop was defending b7; after [6...Bd7?] the pawn is left alone and [7.Bxb7] wins it while hitting the rook too. If [7...Bc6], [8.Bxa8 Bxa8] leaves you the exchange and a pawn up.',
    },
    rating: 1150,
  },
  {
    id: 'eng-p4',
    moves: '1.c4 e5 2.Nc3 Nf6 3.g3 Bb4 4.Bg2 d6',
    solution: 'Qa4+ Nc6 Bxc6+ bxc6 Qxb4',
    theme: { es: 'Eliminar al defensor', en: 'Removing the defender' },
    hint: { es: 'El alfil de b4 no está defendido. Busca un jaque que lo ataque.', en: 'The b4-bishop is undefended. Look for a check that attacks it.' },
    explanation: {
      es: 'Contra [3...Bb4] el alfil suele quedarse suelto en b4. Tras [4...d6?], [5.Qa4+!] da jaque y ataca el alfil a la vez. Si el negro tapa con [5...Nc6], ese caballo es el único defensor de b4: [6.Bxc6+ bxc6 7.Qxb4] lo elimina con jaque y gana la pieza.',
      en: 'Against [3...Bb4] the bishop often ends up loose on b4. After [4...d6?], [5.Qa4+!] gives check and hits the bishop at the same time. If Black blocks with [5...Nc6], that knight is the only defender of b4: [6.Bxc6+ bxc6 7.Qxb4] removes it with check and wins the piece.',
    },
    rating: 1250,
  },
  {
    id: 'eng-p5',
    moves: '1.c4 Nf6 2.Nc3 g6 3.g3 Bg7 4.Bg2 O-O 5.e4 d6 6.Nge2 b6',
    solution: 'e5 dxe5 Bxa8',
    theme: { es: 'Descubierta con un peón', en: 'Discovered attack by a pawn' },
    hint: { es: 'Tu propio peón de e4 tapa la diagonal de tu alfil de g2.', en: 'Your own e4-pawn is blocking your g2-bishop’s diagonal.' },
    explanation: {
      es: 'Con [6...b6?] la torre de a8 se queda en la gran diagonal, y lo único que tapa a tu alfil de g2 es tu propio peón de e4. [7.e5!] ataca el caballo de f6 y, a la vez, destapa el alfil: tras [7...dxe5 8.Bxa8] ganas la calidad. En el esquema con [e4], recuerda que el avance [e5] puede despertar a tu alfil.',
      en: 'With [6...b6?] the a8-rook is left on the long diagonal, and the only thing blocking your g2-bishop is your own e4-pawn. [7.e5!] attacks the f6-knight and uncovers the bishop at the same time: after [7...dxe5 8.Bxa8] you win the exchange. In the [e4] set-up, remember that the [e5] push can wake up your bishop.',
    },
    rating: 1350,
  },
  {
    id: 'eng-p6',
    moves:
      '1.c4 e5 2.Nc3 Nf6 3.g3 Bb4 4.Bg2 O-O 5.e4 Bxc3 6.bxc3 c6 7.Ne2 d5 8.cxd5 cxd5 9.exd5 Nxd5 10.O-O Nc6 11.d4 Bg4 12.f3 Bf5 13.g4 Bg6 14.dxe5 Kh8',
    solution: 'f4',
    theme: { es: 'Pieza atrapada', en: 'Trapped piece' },
    hint: {
      es: 'El alfil de g6 tiene muy pocas casillas. ¿Puedes quitarle las que le quedan?',
      en: 'The g6-bishop has very few squares. Can you take away the last ones?',
    },
    explanation: {
      es: 'Tras [13.g4] el alfil negro se ha refugiado en g6, pero tus peones lo rodean: el de g4 le quita h5 y f5. [15.f4!] amenaza [16.f5], y entonces el alfil no tendrá ninguna casilla, porque f7 y h7 están ocupadas por sus propios peones. El negro no tiene tiempo de abrirle una salida y tendrá que dar material.',
      en: 'After [13.g4] the black bishop has taken refuge on g6, but your pawns surround it: the g4-pawn takes away h5 and f5. [15.f4!] threatens [16.f5], and then the bishop will have no square at all, because its own pawns stand on f7 and h7. Black has no time to open an escape route and will have to give up material.',
    },
    rating: 1400,
  },
  {
    id: 'eng-p7',
    moves: '1.c4 e5 2.Nc3 Nf6 3.g3 Bb4 4.Bg2 d5',
    solution: 'Qa4+ Nc6 cxd5 Bxc3 dxc6',
    theme: { es: 'Clavada', en: 'Pin' },
    hint: {
      es: 'Da jaque con la dama y aprovecha que la pieza que tapa el jaque se queda clavada.',
      en: 'Give check with the queen and exploit the fact that the piece that blocks it gets pinned.',
    },
    explanation: {
      es: '[4...d5?] vuelve a dejar suelto el alfil de b4. [5.Qa4+!] da jaque y lo ataca; tras [5...Nc6] el caballo defiende b4, pero está clavado contra el rey. [6.cxd5!] ataca a ese caballo clavado, y tras [6...Bxc3 7.dxc6] te quedas con material de más y un peón muy fuerte en c6.',
      en: '[4...d5?] leaves the b4-bishop loose again. [5.Qa4+!] gives check and attacks it; after [5...Nc6] the knight defends b4, but it is pinned against the king. [6.cxd5!] attacks that pinned knight, and after [6...Bxc3 7.dxc6] you are up material with a very strong pawn on c6.',
    },
    rating: 1450,
  },
  {
    id: 'eng-p8',
    moves:
      '1.c4 Nf6 2.Nc3 e6 3.Nf3 d5 4.cxd5 exd5 5.d4 Be7 6.Bg5 c6 7.e3 Nbd7 8.Bd3 O-O 9.Qc2 Re8 10.O-O Nf8 11.Rab1 a5 12.a3 Ng6 13.Bxf6 Bxf6 14.h3 h5',
    solution: 'Bxg6 fxg6 Qxg6',
    theme: { es: 'Romper el enroque', en: 'Breaking the king’s shelter' },
    hint: { es: 'Tras [14...h5], ¿quién defiende el caballo de g6?', en: 'After [14...h5], who defends the g6-knight?' },
    explanation: {
      es: 'El caballo de g6 lo defendían los peones de f7 y h7. Con [14...h5?] solo queda el de f7, y [15.Bxg6! fxg6 16.Qxg6] gana un peón por la diagonal de tu dama y deja al rey negro sin protección. Tu dama y tu caballo de f3 están cerca, y el negro tendrá que defenderse mucho tiempo.',
      en: 'The g6-knight was defended by the f7- and h7-pawns. After [14...h5?] only the f7-pawn is left, and [15.Bxg6! fxg6 16.Qxg6] wins a pawn along your queen’s diagonal and strips the black king of its cover. Your queen and your f3-knight are close by, and Black will be defending for a long time.',
    },
    rating: 1550,
  },
  {
    id: 'eng-p9',
    moves: '1.c4 Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 g6 5.Bg2 Nxc3 6.bxc3 Bg7 7.Rb1 Nd7 8.Nf3 O-O 9.O-O b6',
    solution: 'Nd4',
    theme: { es: 'Casilla débil', en: 'Weak square' },
    hint: {
      es: 'Tu caballo de f3 tapa la gran diagonal. ¿Adónde puede ir para destaparla con una amenaza?',
      en: 'Your f3-knight blocks the long diagonal. Where can it go to uncover it with a threat?',
    },
    explanation: {
      es: 'Con [9...b6?] la torre de a8 queda en la gran diagonal y la casilla c6 pierde la protección del peón de b7. [10.Nd4!] destapa tu alfil de g2 contra la torre y amenaza [11.Nc6], que atacaría la dama y el peón de e7. El negro no puede atender a todo y queda claramente peor.',
      en: 'With [9...b6?] the a8-rook is left on the long diagonal and the c6-square loses the protection of the b7-pawn. [10.Nd4!] uncovers your g2-bishop against the rook and threatens [11.Nc6], hitting the queen and the e7-pawn. Black cannot deal with everything and ends up clearly worse.',
    },
    rating: 1650,
  },
  {
    id: 'eng-p10',
    moves: '1.c4 e6 2.Nc3 d5 3.cxd5 exd5 4.d4 Nf6 5.Bg5 Be7 6.e3 c6 7.Bd3 Nbd7 8.Qc2 O-O 9.Nf3 Re8 10.O-O c5',
    solution: 'dxc5 Nxc5 Bxf6 Bxf6 Bxh7+',
    theme: { es: 'Golpe en h7', en: 'The h7 strike' },
    hint: {
      es: 'Tu dama y tu alfil apuntan a h7. ¿Qué pieza negra lo defiende y cómo puedes quitarla de en medio?',
      en: 'Your queen and bishop aim at h7. Which black piece defends it, and how can you get rid of it?',
    },
    explanation: {
      es: 'Tu dama y tu alfil apuntan a h7, que solo defiende el caballo de f6. Tras [10...c5?], [11.dxc5!] gana un peón; si el negro lo recupera con [11...Nxc5], el caballo de d7 deja de apoyar a f6, y [12.Bxf6 Bxf6 13.Bxh7+] gana un peón con jaque y deja al rey negro al descubierto. Es un golpe típico de la estructura Carlsbad.',
      en: 'Your queen and bishop aim at h7, which only the f6-knight defends. After [10...c5?], [11.dxc5!] wins a pawn; if Black takes it back with [11...Nxc5], the d7-knight no longer supports f6, and [12.Bxf6 Bxf6 13.Bxh7+] wins a pawn with check and exposes the black king. It is a typical blow in the Carlsbad structure.',
    },
    rating: 1750,
  },
];
