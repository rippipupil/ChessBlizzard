import type { Course } from '../types';

// India de Rey: repertorio para negras contra 1.d4.

export const kingsIndian: Course = {
  id: 'kings-indian',
  name: { es: 'India de Rey', en: "King's Indian" },
  side: 'b',
  eco: 'E60–E99',
  vs: { es: 'Negras · contra 1.d4', en: 'Black · against 1.d4' },
  tagline: {
    es: 'Deja que las blancas construyan el centro… y luego atácalo y ve a por su rey.',
    en: 'Let White build the centre… then strike at it and go for the king.',
  },
  history: {
    es: 'Durante años se consideró una defensa dudosa: ceder el centro parecía una locura. A finales de los años 40, Bronstein, Boleslavsky y Geller demostraron que las negras pueden dejar avanzar los peones blancos para atacarlos después con ...e5 o ...c5. Fischer y Kasparov la convirtieron en su arma contra 1.d4, y hoy la siguen jugando especialistas como Radjabov o Nakamura.',
    en: 'For years it was considered dubious: giving up the centre looked crazy. In the late 1940s Bronstein, Boleslavsky and Geller showed that Black can let the white pawns advance and attack them later with ...e5 or ...c5. Fischer and Kasparov made it their weapon against 1.d4, and specialists such as Radjabov and Nakamura still play it today.',
  },
  references: [
    { kind: 'book', title: "The King's Indian: A Complete Black Repertoire", author: 'Victor Bologan', note: { es: 'Repertorio completo y muy explicado, ideal después de este curso.', en: 'A complete, well-explained repertoire, ideal after this course.' } },
    { kind: 'book', title: "Starting Out: The King's Indian", author: 'Joe Gallagher', note: { es: 'Introducción clara a las ideas y estructuras típicas.', en: 'A clear introduction to the typical ideas and structures.' } },
    { kind: 'book', title: "Understanding the King's Indian", author: 'Mikhail Golubev', note: { es: 'Para entender el porqué de cada plan.', en: 'To understand the why behind every plan.' } },
    { kind: 'book', title: 'Pawn Structure Chess', author: 'Andrew Soltis', note: { es: 'Las cadenas de peones y cómo atacarlas: la base de la Mar del Plata.', en: 'Pawn chains and how to attack them: the basis of the Mar del Plata.' } },
    { kind: 'book', title: 'My System', author: 'Aron Nimzowitsch', note: { es: 'El concepto clásico de atacar la base de la cadena de peones.', en: 'The classic idea of attacking the base of a pawn chain.' } },
    { kind: 'player', title: 'Garry Kasparov', note: { es: 'Estudia sus partidas con la India de Rey de los años 80 y 90.', en: 'Study his King’s Indian games from the 1980s and 1990s.' } },
    { kind: 'player', title: 'Teimour Radjabov', note: { es: 'El gran especialista moderno de la Mar del Plata.', en: 'The great modern Mar del Plata specialist.' } },
  ],

  lines: [
    {
      id: 'kid-main',
      name: { es: 'Mar del Plata · 9.Ce1', en: 'Mar del Plata · 9.Ne1' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3 f5 11.f3 f4 12.Bf2 g5 13.Nd3 Ng6 14.c5 Nf6',
      notes: {
        '1...Nf6': {
          text: {
            es: 'Desarrollas un caballo y controlas e4. Todavía no muestras tu plan: según lo que haga el blanco, la partida será una India de Rey.',
            en: 'You develop a knight and control e4. You do not show your plan yet: depending on White’s moves, this becomes a King’s Indian.',
          },
        },
        '2...g6': {
          text: {
            es: 'Preparas el fianchetto: el alfil irá a g7, a la gran diagonal, apuntando al centro blanco.',
            en: 'You prepare the fianchetto: the bishop goes to g7, on the long diagonal, aiming at White’s centre.',
          },
          arrows: ['f8g7'],
        },
        '3...Bg7': {
          text: { es: 'El alfil ya mira a d4 y a todo el flanco de dama blanco.', en: 'The bishop already eyes d4 and White’s whole queenside.' },
          arrows: ['g7d4'],
        },
        '4.e4': {
          text: {
            es: 'El blanco ocupa el centro con dos peones. Es justo lo que la India de Rey permite: un centro grande es también un objetivo grande.',
            en: 'White occupies the centre with two pawns. This is exactly what the King’s Indian allows: a big centre is also a big target.',
          },
          rival: ['e4e5', 'd4d5'],
        },
        '4...d6': {
          text: {
            es: 'Frenas e4-e5 y preparas tu golpe central: ...e5.',
            en: 'You stop e4-e5 and prepare your central strike: ...e5.',
          },
          arrows: ['e7e5'],
        },
        '5...O-O': {
          text: {
            es: 'Enroca antes de ...e5. Si juegas ...e5 ya, tras [dxe5 dxe5 Qxd8+] pierdes el enroque y el peón de e5 queda colgando.',
            en: 'Castle before ...e5. If you play ...e5 at once, after [dxe5 dxe5 Qxd8+] you lose castling rights and the e5-pawn hangs.',
          },
        },
        '6...e5': {
          text: {
            es: '¡El golpe! Atacas d4 y obligas al blanco a decidir: mantener la tensión, cambiar en e5 o cerrar el centro con d5.',
            en: 'The strike! You attack d4 and force White to decide: keep the tension, exchange on e5 or close the centre with d5.',
          },
          arrows: ['e5d4'],
        },
        '7...Nc6': {
          text: {
            es: 'Más presión sobre d4. Ahora el blanco casi siempre cierra el centro.',
            en: 'More pressure on d4. Now White almost always closes the centre.',
          },
          arrows: ['c6d4'],
        },
        '8.d5': {
          text: {
            es: 'Centro cerrado: cadena blanca d5-e4 contra la tuya d6-e5. A partir de aquí cada bando ataca por un flanco.',
            en: 'Closed centre: White’s d5-e4 chain against your d6-e5. From now on each side attacks on one wing.',
          },
          marks: ['d5', 'e4', 'd6', 'e5'],
        },
        '8...Ne7': {
          text: {
            es: 'El caballo se aparta del camino del peón f y se acerca al flanco de rey: luego irá a g6.',
            en: 'The knight steps out of the f-pawn’s way and heads for the kingside: later it goes to g6.',
          },
          arrows: ['e7g6'],
        },
        '9.Ne1': {
          text: {
            es: 'El caballo blanco va a d3 para apoyar c4-c5, la ruptura blanca en el flanco de dama.',
            en: 'White’s knight heads for d3 to support c4-c5, White’s queenside break.',
          },
          rival: ['e1d3', 'c4c5'],
        },
        '9...Nd7': {
          text: {
            es: 'El caballo deja libre el peón de f. También se juega [9...Ne8]: la idea es la misma.',
            en: 'The knight frees the f-pawn. [9...Ne8] is also played: the idea is the same.',
          },
          arrows: ['f7f5'],
        },
        '10...f5': {
          text: {
            es: 'Atacas la base de la cadena blanca (e4). Es la idea clásica de Nimzowitsch: las cadenas se atacan por la base.',
            en: 'You attack the base of White’s chain (e4). It is Nimzowitsch’s classic idea: attack a pawn chain at its base.',
          },
          arrows: ['f5e4'],
        },
        '11...f4': {
          text: {
            es: 'Ganas espacio y echas al alfil de e3. Tu plan ahora: ...g5, ...g4 y abrir líneas contra el rey blanco.',
            en: 'You gain space and kick the e3-bishop. Your plan now: ...g5, ...g4 and open lines against the white king.',
          },
          arrows: ['g7g5', 'g5g4'],
        },
        '12...g5': {
          text: {
            es: 'La avalancha de peones arranca. El blanco tiene que darse prisa en el otro flanco.',
            en: 'The pawn avalanche begins. White has to hurry on the other wing.',
          },
          arrows: ['g5g4'],
          rival: ['c4c5'],
        },
        '14.c5': {
          text: {
            es: 'El blanco abre la columna c. Es una carrera: quien llegue antes al rey contrario suele ganar.',
            en: 'White opens the c-file. It is a race: whoever reaches the enemy king first usually wins.',
          },
          rival: ['c5d6'],
        },
        '14...Nf6': {
          text: {
            es: 'El caballo vuelve a f6 para apoyar ...g4. Más adelante, [...Rf7] y [...Bf8] defienden c7 y d6 sin frenar el ataque.',
            en: 'The knight returns to f6 to support ...g4. Later, [...Rf7] and [...Bf8] defend c7 and d6 without slowing the attack.',
          },
          arrows: ['g5g4'],
        },
      },
      summary: {
        es: 'Esta es la Mar del Plata: centro cerrado, tú atacas al rey con los peones f y g, el blanco en el flanco de dama con c5. Recuerda el orden: [...Ne7], [...Nd7], ...f5, ...f4, ...g5.',
        en: 'This is the Mar del Plata: closed centre, you attack the king with the f- and g-pawns, White attacks on the queenside with c5. Remember the order: [...Ne7], [...Nd7], ...f5, ...f4, ...g5.',
      },
    },
    {
      id: 'kid-bayonet',
      name: { es: 'Ataque Bayoneta · 9.b4', en: 'Bayonet Attack · 9.b4' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.b4 Nh5 10.Re1 f5 11.Ng5 Nf6 12.f3 Kh8',
      notes: {
        '9.b4': {
          text: {
            es: 'La Bayoneta, popularizada por Kramnik: el blanco gana tiempo en el flanco de dama antes de que empiece tu ataque.',
            en: 'The Bayonet, popularised by Kramnik: White gains time on the queenside before your attack starts.',
          },
          rival: ['b4b5', 'c4c5'],
        },
        '9...Nh5': {
          text: {
            es: 'Con b4 ya no hay caballo en e1, así que [...Nd7] sería lento. El caballo va a h5: deja salir al peón f y amenaza [...Nf4].',
            en: 'With b4 there is no knight on e1, so [...Nd7] would be slow. The knight goes to h5: it frees the f-pawn and threatens [...Nf4].',
          },
          arrows: ['f7f5', 'h5f4'],
        },
        '10.Re1': {
          text: {
            es: 'La torre deja f1 al alfil, que así cubre g2 y h3 si llega [...Nf4].',
            en: 'The rook vacates f1 for the bishop, which then covers g2 and h3 if [...Nf4] arrives.',
          },
        },
        '10...f5': { text: { es: 'Tu ruptura de siempre.', en: 'Your usual break.' }, arrows: ['f5e4'] },
        '11.Ng5': {
          text: {
            es: 'El caballo salta a g5 para ir a e6, una casilla muy molesta para ti.',
            en: 'The knight jumps to g5 heading for e6, a very annoying square for you.',
          },
          rival: ['g5e6'],
        },
        '11...Nf6': {
          text: {
            es: 'Vuelves para controlar e4 y g4. [Bxg5] no es necesario: el caballo de g5 no tiene una buena retirada.',
            en: 'You come back to control e4 and g4. [Bxg5] is not needed: the g5-knight has no good retreat.',
          },
        },
        '12...Kh8': {
          text: {
            es: 'El rey sale de la diagonal g8-a2, donde un alfil blanco en c4 o un caballo en e6 darían jaques molestos.',
            en: 'The king steps off the g8-a2 diagonal, where a white bishop on c4 or a knight on e6 would give annoying checks.',
          },
        },
      },
      summary: {
        es: 'Contra la Bayoneta el caballo va a h5, no a d7. Después de ...f5 y [...Nf6], el rey a h8 y prepara ...h6 para echar al caballo de g5.',
        en: 'Against the Bayonet the knight goes to h5, not d7. After ...f5 and [...Nf6], king to h8 and prepare ...h6 to kick the g5-knight.',
      },
    },
    {
      id: 'kid-nd2',
      name: { es: 'Mar del Plata · 9.Cd2', en: 'Mar del Plata · 9.Nd2' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Nd2 a5 10.a3 Nd7 11.Rb1 f5 12.b4 Kh8',
      notes: {
        '9.Nd2': {
          text: {
            es: 'El caballo va a c4 o apoya b4. El blanco quiere abrir el flanco de dama cuanto antes.',
            en: 'The knight heads for c4 or supports b4. White wants to open the queenside as fast as possible.',
          },
          rival: ['b2b4', 'c4c5'],
        },
        '9...a5': {
          text: {
            es: 'Frenas b4. Así ganas el tiempo que necesitas para empezar tu ataque con ...f5.',
            en: 'You slow down b4. That gains the time you need to start your attack with ...f5.',
          },
          rival: ['b2b4'],
        },
        '10...Nd7': { text: { es: 'Liberas el peón f: el plan de siempre.', en: 'You free the f-pawn: the usual plan.' }, arrows: ['f7f5'] },
        '11.Rb1': { text: { es: 'El blanco prepara b4 a pesar de todo.', en: 'White prepares b4 anyway.' }, rival: ['b2b4'] },
        '12...Kh8': {
          text: {
            es: 'Como en la Bayoneta, el rey se pone a salvo antes de que se abra el juego. Luego [...Ng8] y [...Ngf6] refuerzan e4.',
            en: 'As in the Bayonet, the king gets safe before the game opens up. Then [...Ng8] and [...Ngf6] reinforce the pressure on e4.',
          },
        },
      },
      summary: {
        es: 'Contra [9.Nd2]: primero ...a5 para frenar b4, después [...Nd7] y ...f5 como siempre.',
        en: 'Against [9.Nd2]: first ...a5 to slow b4, then [...Nd7] and ...f5 as always.',
      },
    },
    {
      id: 'kid-gligoric',
      name: { es: 'Gligoric · 8.Ae3', en: 'Gligoric · 8.Be3' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.Be3 Ng4 9.Bg5 f6 10.Bh4 g5 11.Bg3 Nh6',
      notes: {
        '8.Be3': {
          text: {
            es: 'El blanco mantiene la tensión: no cierra el centro todavía y desarrolla el alfil.',
            en: 'White keeps the tension: no closing of the centre yet, the bishop develops.',
          },
        },
        '8...Ng4': {
          text: {
            es: 'Atacas el alfil de e3. Si el blanco lo deja, cambias el caballo por el alfil y te quedas con la pareja de alfiles.',
            en: 'You hit the e3-bishop. If White allows it, you trade knight for bishop and keep the bishop pair.',
          },
          arrows: ['g4e3'],
        },
        '9...f6': { text: { es: 'Echas al alfil de g5 ganando tiempo.', en: 'You kick the g5-bishop with tempo.' }, arrows: ['f6g5'] },
        '10...g5': { text: { es: 'Más tiempo: el alfil tiene que retroceder otra vez.', en: 'More tempo: the bishop has to retreat again.' } },
        '11...Nh6': {
          text: {
            es: 'El caballo se recoloca. Si el blanco cierra con d5, [...Ne7] y ...f5 te dan el ataque típico, con los peones de g ya avanzados.',
            en: 'The knight regroups. If White closes with d5, [...Ne7] and ...f5 give you the typical attack, with the g-pawn already advanced.',
          },
          arrows: ['h6f7'],
        },
      },
      summary: {
        es: 'Contra [8.Be3], [...Ng4] gana tiempos contra el alfil. Tus peones de f y g avanzan antes de lo normal.',
        en: 'Against [8.Be3], [...Ng4] gains time against the bishop. Your f- and g-pawns advance earlier than usual.',
      },
    },
    {
      id: 'kid-petrosian',
      name: { es: 'Sistema Petrosian · 7.d5', en: 'Petrosian System · 7.d5' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 a5 8.Bg5 h6 9.Bh4 Na6 10.Nd2 Qe8 11.O-O Nh7',
      notes: {
        '7.d5': {
          text: {
            es: 'Petrosian cerraba el centro de inmediato para clavar tu caballo con [Bg5]. Así ...f5 cuesta más.',
            en: 'Petrosian closed the centre at once to pin your knight with [Bg5]. That makes ...f5 harder.',
          },
        },
        '7...a5': {
          text: {
            es: 'Primero frenas b4 y aseguras la casilla c5 para tu caballo.',
            en: 'First you slow down b4 and secure the c5-square for your knight.',
          },
          marks: ['c5'],
        },
        '8...h6': { text: { es: 'Preguntas al alfil.', en: 'You question the bishop.' } },
        '9...Na6': {
          text: {
            es: 'El caballo va a c5, desde donde ataca e4. Desde a6 también puede ir a b4.',
            en: 'The knight heads for c5, where it hits e4. From a6 it can also go to b4.',
          },
          arrows: ['a6c5'],
        },
        '10...Qe8': {
          text: {
            es: 'Rompes la clavada del caballo de f6. Ahora [...Nh7] y ...f5 son posibles.',
            en: 'You break the pin on the f6-knight. Now [...Nh7] and ...f5 are possible.',
          },
        },
        '11...Nh7': {
          text: {
            es: 'El caballo se aparta y libera el peón f. Tu plan: ...f5, casi siempre con ...h5 o [...Bd7] preparándolo.',
            en: 'The knight steps away and frees the f-pawn. Your plan: ...f5, usually prepared with ...h5 or [...Bd7].',
          },
          arrows: ['f7f5'],
        },
      },
      summary: {
        es: 'Contra el Petrosian: ...a5, ...h6, [...Na6], la dama a e8 para deshacer la clavada y después ...f5.',
        en: 'Against the Petrosian: ...a5, ...h6, [...Na6], queen to e8 to undo the pin, and then ...f5.',
      },
    },
    {
      id: 'kid-exchange',
      name: { es: 'Variante del Cambio · 7.dxe5', en: 'Exchange Variation · 7.dxe5' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.dxe5 dxe5 8.Qxd8 Rxd8 9.Bg5 Re8 10.Nd5 Nxd5 11.cxd5 c6 12.Bc4 cxd5 13.Bxd5 Nd7',
      notes: {
        '7.dxe5': {
          text: {
            es: 'El blanco cambia las damas buscando un final tranquilo. Muchos lo eligen para evitar tus ataques.',
            en: 'White trades queens hoping for a quiet ending. Many choose it to avoid your attacks.',
          },
        },
        '8...Rxd8': {
          text: {
            es: 'Por esto enrocaste antes de ...e5: recapturas con la torre y tu rey está seguro. Ojo: si el blanco toma [9.Nxe5], [9...Nxe4!] recupera el peón y la posición queda igualada.',
            en: 'This is why you castled before ...e5: you recapture with the rook and your king is safe. Careful: if White grabs [9.Nxe5], [9...Nxe4!] wins the pawn back and the position is level.',
          },
        },
        '9.Bg5': { text: { es: 'Clava el caballo y presiona d8.', en: 'Pins the knight and pressures d8.' } },
        '9...Re8': { text: { es: 'La torre defiende e5 y se aparta de la columna d, donde el blanco tiene juego.', en: 'The rook defends e5 and steps off the d-file, where White has play.' } },
        '10.Nd5': { text: { es: 'Amenaza [Nxf6+] y [Nxc7].', en: 'Threatens [Nxf6+] and [Nxc7].' }, rival: ['d5c7'] },
        '11...c6': { text: { es: 'Atacas el peón de d5 de inmediato.', en: 'You attack the d5-pawn at once.' }, arrows: ['c6d5'] },
        '13...Nd7': {
          text: {
            es: 'Posición igualada. El alfil de g7 es fuerte y tu caballo irá a c5 o f6. En los finales de la India de Rey, la casilla d4 es oro.',
            en: 'Equal position. The g7-bishop is strong and your knight goes to c5 or f6. In King’s Indian endings, the d4-square is gold.',
          },
          arrows: ['d7c5'],
        },
      },
      summary: {
        es: 'El Cambio no da ventaja si recuerdas dos cosas: enrocar antes de ...e5 y no temer al final. Tus piezas son activas.',
        en: 'The Exchange gives no edge if you remember two things: castle before ...e5 and do not fear the ending. Your pieces are active.',
      },
    },
    {
      id: 'kid-samisch',
      name: { es: 'Sämisch · 6...c5 7.d5', en: 'Sämisch · 6...c5 7.d5' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.d5 e6 8.Qd2 exd5 9.cxd5 a6 10.a4 Re8 11.Nge2 Nbd7 12.Ng3 h5 13.Be2 h4',
      notes: {
        '5.f3': {
          text: {
            es: 'La Sämisch (por Friedrich Sämisch): el blanco refuerza e4, prepara [Be3] y [Qd2] y a menudo enroca largo para lanzar g4 y h4 contra tu rey.',
            en: 'The Sämisch (after Friedrich Sämisch): White reinforces e4, prepares [Be3] and [Qd2], and often castles long to launch g4 and h4 at your king.',
          },
          rival: ['g2g4', 'h2h4'],
        },
        '6...c5': {
          text: {
            es: 'Contra la Sämisch, el golpe bueno es ...c5, no ...e5. El peón de f3 le quita al caballo blanco su casilla natural y el centro blanco aún no está listo.',
            en: 'Against the Sämisch, the right strike is ...c5, not ...e5. The f3-pawn takes away the white knight’s natural square and White’s centre is not ready yet.',
          },
          arrows: ['c5d4'],
        },
        '7.d5': { text: { es: 'El blanco cierra y se lleva una estructura de Benoni.', en: 'White closes the centre and we get a Benoni structure.' } },
        '7...e6': {
          text: {
            es: 'Abres la columna e: con el centro abierto, tus piezas son más activas que las blancas.',
            en: 'You open the e-file: with the centre open, your pieces are more active than White’s.',
          },
          arrows: ['e6d5'],
        },
        '9...a6': {
          text: {
            es: 'Preparas ...b5 para ganar espacio en el flanco de dama, donde tienes mayoría de peones.',
            en: 'You prepare ...b5 to gain space on the queenside, where you have a pawn majority.',
          },
          arrows: ['b7b5'],
        },
        '10...Re8': { text: { es: 'Presión en la columna e y en el peón de e4.', en: 'Pressure along the e-file and on the e4-pawn.' }, arrows: ['e8e4'] },
        '11...Nbd7': { text: { es: 'El caballo va a e5, la mejor casilla de la estructura Benoni.', en: 'The knight heads for e5, the best square in the Benoni structure.' }, arrows: ['d7e5'] },
        '12...h5': {
          text: {
            es: 'Un recurso típico: ...h5-h4 echa al caballo de g3 y frena el ataque blanco con g4.',
            en: 'A typical resource: ...h5-h4 kicks the g3-knight and slows White’s g4 attack.',
          },
          arrows: ['h5h4'],
          rival: ['g2g4'],
        },
        '13...h4': {
          text: {
            es: 'El caballo tiene que retroceder. Ahora [...Nh7], [...Ne5] y ...b5 completan tu plan.',
            en: 'The knight has to retreat. Now [...Nh7], [...Ne5] and ...b5 complete your plan.',
          },
          arrows: ['b7b5'],
        },
      },
      summary: {
        es: 'Regla de este curso: contra el blanco clásico ([Nf3] y [Be2]), ...e5. Contra f3, f4 o [Bg5], ...c5. Aquí obtienes una Benoni con juego activo.',
        en: 'Rule of this course: against the classical set-up ([Nf3] and [Be2]), ...e5. Against f3, f4 or [Bg5], ...c5. Here you get an active Benoni.',
      },
    },
    {
      id: 'kid-samisch-gambit',
      name: { es: 'Gambito de la Sämisch · 7.dxc5', en: 'Sämisch Gambit · 7.dxc5' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.dxc5 dxc5 8.Qxd8 Rxd8 9.Bxc5 Nc6 10.Nd5 Nd7 11.Nxe7+ Nxe7 12.Bxe7 Bxb2 13.Rd1 Re8',
      notes: {
        '7.dxc5': {
          text: {
            es: 'El blanco acepta el peón. Es el «gambito de la Sämisch»: das un peón a cambio de desarrollo y de las casillas negras.',
            en: 'White takes the pawn. This is the "Sämisch gambit": you give a pawn for development and the dark squares.',
          },
        },
        '9...Nc6': {
          text: {
            es: 'Tu compensación: desarrollo rápido, la gran diagonal del alfil de g7 y la casilla d4. El peón de c5 suele volver.',
            en: 'Your compensation: fast development, the long diagonal of the g7-bishop and the d4-square. The c5-pawn usually comes back.',
          },
          arrows: ['g7b2', 'c6d4'],
        },
        '10.Nd5': { text: { es: 'Amenaza [Nxe7+] y [Nc7].', en: 'Threatens [Nxe7+] and [Nc7].' }, rival: ['d5e7', 'd5c7'] },
        '10...Nd7': {
          text: {
            es: 'Atacas el alfil de c5 y abres la diagonal del alfil de g7 hacia b2.',
            en: 'You hit the c5-bishop and open the g7-bishop’s diagonal towards b2.',
          },
          arrows: ['g7b2'],
        },
        '12...Bxb2': {
          text: {
            es: 'Recuperas el peón y tu alfil se come el flanco de dama. La posición queda igualada.',
            en: 'You win the pawn back and your bishop eats into the queenside. The position is level.',
          },
        },
        '13...Re8': { text: { es: 'La torre sale de la clavada y ataca el alfil de e7.', en: 'The rook escapes the pin and attacks the e7-bishop.' } },
      },
      summary: {
        es: 'Si el blanco toma en c5, no tengas miedo: ...dxc5, cambio de damas y [...Nc6] dan buen juego.',
        en: 'If White takes on c5, do not worry: ...dxc5, the queen trade and [...Nc6] give good play.',
      },
    },
    {
      id: 'kid-samisch-nge2',
      name: { es: 'Sämisch · 7.Cge2', en: 'Sämisch · 7.Nge2' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c5 7.Nge2 Nc6 8.d5 Ne5 9.Ng3 e6 10.Be2 exd5 11.cxd5 h5',
      notes: {
        '7.Nge2': { text: { es: 'El blanco mantiene la tensión y defiende d4 con el caballo.', en: 'White keeps the tension and defends d4 with the knight.' } },
        '7...Nc6': { text: { es: 'Más presión sobre d4.', en: 'More pressure on d4.' }, arrows: ['c6d4'] },
        '8...Ne5': { text: { es: 'El caballo se instala en e5, desde donde ataca c4 y f3.', en: 'The knight settles on e5, from where it hits c4 and f3.' }, arrows: ['e5c4'] },
        '9...e6': { text: { es: 'Abres el centro como en la Benoni.', en: 'You open the centre as in the Benoni.' }, arrows: ['e6d5'] },
        '11...h5': {
          text: {
            es: 'Otra vez ...h5: amenazas ...h4 para echar al caballo de g3 y quitarle el control de e4.',
            en: '...h5 again: you threaten ...h4 to kick the g3-knight and take away its control of e4.',
          },
          arrows: ['h5h4'],
        },
      },
      summary: {
        es: 'Contra [7.Nge2]: [...Nc6], [...Ne5] y abrir con ...e6. El avance ...h5-h4 molesta al caballo de g3.',
        en: 'Against [7.Nge2]: [...Nc6], [...Ne5] and open with ...e6. The ...h5-h4 push harasses the g3-knight.',
      },
    },
    {
      id: 'kid-fourpawns',
      name: { es: 'Ataque de los Cuatro Peones · 5.f4', en: 'Four Pawns Attack · 5.f4' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Nf3 c5 7.d5 e6 8.Be2 exd5 9.cxd5 Re8 10.Nd2 Na6 11.O-O Nc7',
      notes: {
        '5.f4': {
          text: {
            es: 'El blanco pone cuatro peones en el centro. Es lo más ambicioso… y lo más fácil de atacar.',
            en: 'White puts four pawns in the centre. It is the most ambitious set-up… and the easiest to attack.',
          },
          rival: ['e4e5'],
        },
        '6...c5': {
          text: {
            es: 'Contra los cuatro peones, la ruptura buena es ...c5: golpea d4 antes de que el blanco consolide.',
            en: 'Against the four pawns, the right break is ...c5: hit d4 before White consolidates.',
          },
          arrows: ['c5d4'],
        },
        '7...e6': {
          text: {
            es: 'Abres el centro. Con los peones blancos tan avanzados, las líneas abiertas favorecen tus piezas.',
            en: 'You open the centre. With White’s pawns so far forward, open lines favour your pieces.',
          },
          arrows: ['e6d5'],
        },
        '9...Re8': {
          text: {
            es: 'La torre presiona e4. Ojo con [10.e5]: es la variante más afilada y conviene estudiarla más adelante.',
            en: 'The rook pressures e4. Watch out for [10.e5]: it is the sharpest line and worth studying later.',
          },
          arrows: ['e8e4'],
        },
        '10...Na6': {
          text: { es: 'El caballo va a c7, desde donde apoya ...b5.', en: 'The knight heads for c7, from where it supports ...b5.' },
          arrows: ['a6c7'],
        },
        '11...Nc7': {
          text: {
            es: 'Tu plan es ...a6, [...Rb8] y ...b5: una mayoría de peones en el flanco de dama, como en una Benoni.',
            en: 'Your plan is ...a6, [...Rb8] and ...b5: a queenside pawn majority, as in a Benoni.',
          },
          arrows: ['b7b5'],
        },
      },
      summary: {
        es: 'Contra los Cuatro Peones: ...c5 y ...e6 para abrir el centro. Presiona e4 con la torre y avanza ...b5.',
        en: 'Against the Four Pawns: ...c5 and ...e6 to open the centre. Pressure e4 with the rook and push ...b5.',
      },
    },
    {
      id: 'kid-averbakh',
      name: { es: 'Averbakh · 6.Ag5', en: 'Averbakh · 6.Bg5' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Be2 O-O 6.Bg5 c5 7.d5 h6 8.Be3 e6 9.Qd2 exd5 10.exd5 Kh7',
      notes: {
        '6.Bg5': {
          text: {
            es: 'El sistema Averbakh: el alfil en g5 frena ...e5 (el caballo de f6 está clavado y no defiende bien).',
            en: 'The Averbakh system: the bishop on g5 discourages ...e5 (the f6-knight is pinned and defends poorly).',
          },
        },
        '6...c5': {
          text: {
            es: 'Como contra los Cuatro Peones, golpeas por el otro lado.',
            en: 'As against the Four Pawns, you strike from the other side.',
          },
          arrows: ['c5d4'],
        },
        '7...h6': { text: { es: 'Echas al alfil antes de abrir el centro.', en: 'You kick the bishop before opening the centre.' } },
        '9...exd5': { text: { es: 'Abres la columna e para tus torres.', en: 'You open the e-file for your rooks.' } },
        '10...Kh7': {
          text: {
            es: 'Defiendes h6: así el blanco no tiene trucos con [Bxh6]. Luego [...Re8], [...Bf5] y [...Ne4] activan tus piezas.',
            en: 'You defend h6, so White has no [Bxh6] tricks. Then [...Re8], [...Bf5] and [...Ne4] activate your pieces.',
          },
        },
      },
      summary: {
        es: 'Contra el Averbakh: ...c5, ...h6 y abrir el centro. Rey a h7 para que h6 no sea un objetivo.',
        en: 'Against the Averbakh: ...c5, ...h6 and open the centre. King to h7 so that h6 is not a target.',
      },
    },
    {
      id: 'kid-fianchetto',
      name: { es: 'Fianchetto · 4.g3', en: 'Fianchetto · 4.g3' },
      moves: '1.d4 Nf6 2.c4 g6 3.Nf3 Bg7 4.g3 O-O 5.Bg2 d6 6.O-O Nbd7 7.Nc3 e5 8.e4 c6 9.h3 exd4 10.Nxd4 Re8 11.Re1 a5 12.Be3 Nc5',
      notes: {
        '4.g3': {
          text: {
            es: 'El blanco también hace fianchetto. Es un sistema tranquilo: su rey estará muy seguro y la Mar del Plata no funciona igual.',
            en: 'White fianchettoes too. It is a quiet system: his king is very safe and the Mar del Plata plan does not work the same way.',
          },
        },
        '6...Nbd7': { text: { es: 'Preparas ...e5 con el caballo detrás.', en: 'You prepare ...e5 with the knight behind it.' }, arrows: ['e7e5'] },
        '8...c6': { text: { es: 'Controlas d5 y preparas [...Qb6] o ...a5.', en: 'You control d5 and prepare [...Qb6] or ...a5.' }, marks: ['d5'] },
        '9...exd4': {
          text: {
            es: 'Aquí cambias en d4: con el centro abierto, el peón de e4 será tu objetivo.',
            en: 'Here you exchange on d4: with the centre open, the e4-pawn becomes your target.',
          },
        },
        '10...Re8': { text: { es: 'Presión sobre e4.', en: 'Pressure on e4.' }, arrows: ['e8e4'] },
        '11...a5': { text: { es: 'Ganas espacio y aseguras c5 para el caballo.', en: 'You gain space and secure c5 for the knight.' }, marks: ['c5'] },
        '12...Nc5': {
          text: {
            es: 'El caballo ataca e4 desde una casilla estable. Tu juego es activo y el centro blanco está bajo presión.',
            en: 'The knight hits e4 from a stable square. Your play is active and White’s centre is under pressure.',
          },
          arrows: ['c5e4'],
        },
      },
      summary: {
        es: 'Contra el fianchetto: [...Nbd7], ...e5, ...c6 y, si el blanco no aclara, cambias en d4 para presionar e4.',
        en: 'Against the fianchetto: [...Nbd7], ...e5, ...c6 and, if White does not clarify, take on d4 to pressure e4.',
      },
    },
    {
      id: 'kid-london',
      name: { es: 'Sistema Londres · 3.Af4', en: 'London System · 3.Bf4' },
      moves: '1.d4 Nf6 2.Nf3 g6 3.Bf4 Bg7 4.e3 d6 5.h3 O-O 6.Be2 Nbd7 7.O-O Qe8 8.Bh2 e5',
      notes: {
        '3.Bf4': {
          text: {
            es: 'El Londres: un sistema sólido y muy popular en clubes. El alfil sale antes de e3.',
            en: 'The London: a solid system, very popular at club level. The bishop comes out before e3.',
          },
        },
        '4...d6': {
          text: {
            es: 'La misma estructura de siempre. Tu objetivo sigue siendo ...e5.',
            en: 'The same structure as always. Your goal is still ...e5.',
          },
          arrows: ['e7e5'],
        },
        '7...Qe8': {
          text: {
            es: 'La dama apoya ...e5. Si juegas ...e5 directamente, tras [dxe5 dxe5 Nxe5] pierdes un peón.',
            en: 'The queen supports ...e5. If you play ...e5 directly, after [dxe5 dxe5 Nxe5] you lose a pawn.',
          },
          arrows: ['e7e5'],
        },
        '8...e5': {
          text: {
            es: 'Ahora sí: e5 está defendido y el alfil de h2 muerde granito. Tienes una India de Rey cómoda.',
            en: 'Now it works: e5 is defended and the h2-bishop bites on granite. You have a comfortable King’s Indian.',
          },
        },
      },
      summary: {
        es: 'Contra el Londres: el mismo esquema, pero prepara ...e5 con [...Nbd7] y [...Qe8] antes de jugarlo.',
        en: 'Against the London: same set-up, but prepare ...e5 with [...Nbd7] and [...Qe8] before playing it.',
      },
    },

    // --- Trampas ---
    {
      id: 'kid-trap-early-e5',
      name: { es: 'Error típico: ...e5 sin enrocar', en: 'Typical mistake: ...e5 before castling' },
      practice: false,
      moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 e5 6.dxe5 dxe5 7.Qxd8+ Kxd8 8.Nxe5',
      notes: {
        '5...e5': {
          text: {
            es: 'Así NO. Parece la jugada de siempre, pero tu rey sigue en el centro.',
            en: 'Not like this. It looks like the usual move, but your king is still in the centre.',
          },
        },
        '7.Qxd8+': { text: { es: 'Jaque: tienes que tomar con el rey.', en: 'Check: you have to take with the king.' } },
        '8.Nxe5': {
          text: {
            es: 'El blanco gana un peón y tu rey ya no puede enrocar. Por eso siempre: primero [...O-O] y después ...e5.',
            en: 'White wins a pawn and your king can no longer castle. That is why it is always: first [...O-O], then ...e5.',
          },
        },
      },
      summary: {
        es: 'Regla de oro de la India de Rey: enroca antes de jugar ...e5.',
        en: 'Golden rule of the King’s Indian: castle before playing ...e5.',
      },
    },
  ],

  puzzles: [],

  camps: [
    {
      id: 'base',
      name: { es: 'Campamento base', en: 'Base camp' },
      title: { es: 'La estructura', en: 'The structure' },
      stages: [
        {
          id: 'ideas',
          type: 'ideas',
          title: { es: 'Ideas y planes', en: 'Ideas and plans' },
          subtitle: { es: 'Centro cerrado y ...f5', en: 'Closed centre and ...f5' },
          intro: {
            es: 'Por qué se cede el centro, el golpe ...e5 y la carrera de flancos.',
            en: 'Why you give up the centre, the ...e5 strike and the race on opposite wings.',
          },
          slides: [
            {
              title: { es: 'Una defensa hipermoderna', en: 'A hypermodern defence' },
              text: {
                es: 'En la India de Rey no ocupas el centro con peones: lo controlas desde lejos con el caballo de f6 y el alfil de g7. El blanco levanta un centro grande con c4, d4 y e4. Tu idea es atacarlo después, cuando tus piezas estén listas.',
                en: 'In the King’s Indian you do not occupy the centre with pawns: you control it from afar with the f6-knight and the g7-bishop. White builds a big centre with c4, d4 and e4. Your idea is to attack it later, when your pieces are ready.',
              },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6',
              arrows: ['g7d4'],
              marks: ['c4', 'd4', 'e4'],
            },
            {
              title: { es: 'El golpe ...e5', en: 'The ...e5 strike' },
              text: {
                es: 'Primero enrocas y después juegas ...e5, atacando d4. El blanco tiene que decidir: cambiar, mantener la tensión o avanzar d5. Casi todas las posiciones de este curso nacen de esa decisión.',
                en: 'First you castle and then play ...e5, hitting d4. White has to decide: exchange, keep the tension or push d5. Almost every position in this course comes from that decision.',
              },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5',
              arrows: ['e5d4'],
            },
            {
              title: { es: 'Centro cerrado: cada uno a su flanco', en: 'Closed centre: each side to its wing' },
              text: {
                es: 'Cuando el blanco juega d5, el centro se bloquea. Regla práctica: ataca por el lado hacia el que apuntan tus peones. Tu cadena d6-e5 apunta al flanco de rey, así que tu ruptura es ...f5. La del blanco, c4-c5.',
                en: 'When White plays d5, the centre locks. Rule of thumb: attack on the side your pawns point to. Your d6-e5 chain points to the kingside, so your break is ...f5. White’s is c4-c5.',
              },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7',
              arrows: ['f7f5'],
              rival: ['c4c5'],
            },
            {
              title: { es: 'Atacar la base de la cadena', en: 'Attack the base of the chain' },
              text: {
                es: 'La cadena blanca d5-e4 tiene su base en e4: si la debilitas, todo el centro se tambalea. Por eso ...f5 es tan fuerte. Después, con ...f4, ...g5 y ...g4, abres líneas contra el rey.',
                en: 'White’s d5-e4 chain has its base on e4: weaken it and the whole centre wobbles. That is why ...f5 is so strong. Then, with ...f4, ...g5 and ...g4, you open lines against the king.',
              },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3 f5',
              arrows: ['f5e4'],
              marks: ['e4'],
            },
            {
              title: { es: 'La carrera', en: 'The race' },
              text: {
                es: 'Mientras tus peones avanzan hacia el rey blanco, el blanco abre la columna c. Defiende lo justo ([...Rf7] cubre c7, [...Bf8] cubre d6) y no pierdas tiempo: en esta estructura, el ataque al rey suele valer más que un peón del flanco de dama.',
                en: 'While your pawns advance towards the white king, White opens the c-file. Defend just enough ([...Rf7] covers c7, [...Bf8] covers d6) and do not waste time: in this structure, attacking the king is usually worth more than a queenside pawn.',
              },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3 f5 11.f3 f4 12.Bf2 g5 13.Nd3 Ng6 14.c5 Nf6',
              arrows: ['g5g4'],
              rival: ['c5d6'],
            },
            {
              title: { es: 'Otros sistemas blancos', en: 'Other White systems' },
              text: {
                es: 'No todos los rivales irán a la Mar del Plata. En el Campamento 1 verás la Sämisch (f3), los Cuatro Peones (f4), el Averbakh ([Bg5]), el fianchetto (g3) y el Londres ([Bf4]). La regla: contra el esquema clásico con [Nf3] y [Be2], golpea con ...e5; contra f3, f4 o [Bg5], que debilitan las casillas negras, golpea con ...c5.',
                en: 'Not every opponent will enter the Mar del Plata. In Camp 1 you will see the Sämisch (f3), the Four Pawns (f4), the Averbakh ([Bg5]), the fianchetto (g3) and the London ([Bf4]). The rule: against the classical set-up with [Nf3] and [Be2], strike with ...e5; against f3, f4 or [Bg5], which weaken the dark squares, strike with ...c5.',
              },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6',
            },
          ],
          quiz: [
            {
              kind: 'move',
              question: { es: 'Juegas con negras. ¿Qué jugada debes hacer antes de ...e5?', en: 'You are Black. Which move must you play before ...e5?' },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3',
              answers: ['O-O'],
              explanation: {
                es: 'Enroca primero. Si juegas [5...e5?], tras [6.dxe5 dxe5 7.Qxd8+ Kxd8 8.Nxe5] pierdes un peón y el enroque.',
                en: 'Castle first. If you play [5...e5?], after [6.dxe5 dxe5 7.Qxd8+ Kxd8 8.Nxe5] you lose a pawn and castling rights.',
              },
            },
            {
              kind: 'choice',
              question: { es: 'El centro está cerrado (d5 contra e5). ¿Por dónde atacas con negras?', en: 'The centre is closed (d5 against e5). Where do you attack as Black?' },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7',
              options: [
                { es: 'Por el flanco de dama, con ...c6 y ...b5', en: 'On the queenside, with ...c6 and ...b5' },
                { es: 'Por el flanco de rey, con ...f5', en: 'On the kingside, with ...f5' },
                { es: 'Por el centro, con ...c6 y ...cxd5', en: 'In the centre, with ...c6 and ...cxd5' },
              ],
              correct: 1,
              explanation: {
                es: 'Tus peones d6-e5 apuntan al flanco de rey: allí está tu ataque, con ...f5, ...f4 y ...g5.',
                en: 'Your d6-e5 pawns point to the kingside: that is where your attack is, with ...f5, ...f4 and ...g5.',
              },
            },
            {
              kind: 'move',
              question: { es: 'El blanco ha jugado [9.Ne1]. Prepara tu ruptura.', en: 'White has played [9.Ne1]. Prepare your break.' },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1',
              answers: ['Nd7', 'Ne8'],
              explanation: {
                es: 'El caballo de f6 se aparta para que el peón f pueda avanzar a f5. [9...Nd7] y [9...Ne8] persiguen lo mismo.',
                en: 'The f6-knight steps aside so the f-pawn can advance to f5. [9...Nd7] and [9...Ne8] pursue the same idea.',
              },
            },
            {
              kind: 'choice',
              question: { es: '¿Qué ruptura busca el blanco en la Mar del Plata?', en: 'Which break does White look for in the Mar del Plata?' },
              moves: '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.Be3 f5',
              options: [
                { es: 'c4-c5', en: 'c4-c5' },
                { es: 'f2-f4', en: 'f2-f4' },
                { es: 'g2-g4', en: 'g2-g4' },
              ],
              correct: 0,
              explanation: {
                es: 'c4-c5 ataca la base de tu cadena (d6). Es el espejo de tu ...f5.',
                en: 'c4-c5 attacks the base of your chain (d6). It mirrors your ...f5.',
              },
            },
          ],
        },
        {
          id: 'main-line',
          type: 'line',
          title: { es: 'Línea principal', en: 'Main line' },
          subtitle: { es: 'Mar del Plata · 9.Ce1', en: 'Mar del Plata · 9.Ne1' },
          intro: {
            es: 'La variante más famosa de la India de Rey, jugada a jugada y con el porqué de cada movimiento.',
            en: 'The most famous line of the King’s Indian, move by move, with the reason behind each one.',
          },
          lines: ['kid-main'],
        },
        {
          id: 'main-practice',
          type: 'practice',
          title: { es: 'Practica la línea', en: 'Practise the line' },
          subtitle: { es: 'Juegas tú las negras', en: 'You play Black' },
          intro: {
            es: 'Juegas tú con negras la Mar del Plata. Si fallas, te enseñamos la jugada y la repetirás más adelante.',
            en: 'You play the Mar del Plata as Black. If you slip, we show you the move and you will repeat it later.',
          },
          lines: ['kid-main'],
        },
      ],
    },
    {
      id: 'camp1',
      name: { es: 'Campamento 1', en: 'Camp 1' },
      title: { es: 'Las alternativas blancas', en: 'White’s alternatives' },
      stages: [
        {
          id: 'classical-deviations',
          type: 'branch',
          title: { es: '¿Y si 7.d5, 7.dxe5 u 8.Ae3?', en: 'What if 7.d5, 7.dxe5 or 8.Be3?' },
          subtitle: { es: 'Petrosian, Cambio y Gligoric', en: 'Petrosian, Exchange and Gligoric' },
          intro: {
            es: 'El blanco puede salirse de la Mar del Plata antes. Aprende qué hacer en cada caso.',
            en: 'White can leave the Mar del Plata earlier. Learn what to do in each case.',
          },
          lines: ['kid-petrosian', 'kid-exchange', 'kid-gligoric'],
        },
        {
          id: 'mdp-deviations',
          type: 'branch',
          title: { es: '¿Y si 9.b4 o 9.Cd2?', en: 'What if 9.b4 or 9.Nd2?' },
          subtitle: { es: 'Bayoneta y 9.Cd2', en: 'Bayonet and 9.Nd2' },
          intro: {
            es: 'Las dos alternativas modernas a [9.Ne1]: el blanco corre por el flanco de dama.',
            en: 'The two modern alternatives to [9.Ne1]: White races on the queenside.',
          },
          lines: ['kid-bayonet', 'kid-nd2'],
        },
        {
          id: 'f3-f4-systems',
          type: 'branch',
          title: { es: '¿Y si 5.f3 o 5.f4?', en: 'What if 5.f3 or 5.f4?' },
          subtitle: { es: 'Sämisch y Cuatro Peones', en: 'Sämisch and Four Pawns' },
          intro: {
            es: 'Los sistemas más agresivos: el blanco refuerza su centro con el peón f.',
            en: 'The most aggressive systems: White reinforces his centre with the f-pawn.',
          },
          lines: ['kid-samisch', 'kid-samisch-gambit', 'kid-samisch-nge2', 'kid-fourpawns'],
        },
        {
          id: 'quiet-systems',
          type: 'branch',
          title: { es: '¿Y si juega tranquilo?', en: 'What if White plays quietly?' },
          subtitle: { es: 'Averbakh, fianchetto y Londres', en: 'Averbakh, fianchetto and London' },
          intro: {
            es: 'Sistemas con menos teoría que buscan frenar tus planes. Ajusta el orden de jugadas y estarás cómodo.',
            en: 'Systems with less theory that try to slow your plans down. Adjust your move order and you will be comfortable.',
          },
          lines: ['kid-averbakh', 'kid-fianchetto', 'kid-london'],
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
          subtitle: { es: 'Golpes tácticos y errores típicos', en: 'Tactical blows and typical mistakes' },
          intro: {
            es: 'Trampas que puedes ponerle a tu rival y errores que tú no debes cometer.',
            en: 'Traps you can set for your opponent and mistakes you must not make.',
          },
          lines: ['kid-trap-early-e5'],
        },
        {
          id: 'puzzles',
          type: 'puzzles',
          title: { es: 'Puzzles', en: 'Puzzles' },
          subtitle: { es: 'Táctica de la India de Rey', en: 'King’s Indian tactics' },
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
          lines: ['kid-main', 'kid-bayonet', 'kid-nd2', 'kid-gligoric', 'kid-petrosian', 'kid-exchange', 'kid-samisch', 'kid-samisch-gambit', 'kid-samisch-nge2', 'kid-fourpawns', 'kid-averbakh', 'kid-fianchetto', 'kid-london'],
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
          lines: ['kid-main', 'kid-bayonet', 'kid-nd2', 'kid-gligoric', 'kid-petrosian', 'kid-exchange', 'kid-samisch', 'kid-samisch-gambit', 'kid-samisch-nge2', 'kid-fourpawns', 'kid-averbakh', 'kid-fianchetto', 'kid-london'],
          puzzles: [],
          passScore: 0.8,
        },
      ],
    },
  ],
};
