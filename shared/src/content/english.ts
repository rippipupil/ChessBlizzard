import type { Course } from '../types';

// Apertura Inglesa: repertorio para blancas con 1.c4 y el esquema Nc3 + g3 + Bg2
// (estilo Botvinnik / "Siciliana invertida"). La coherencia se mide por posición:
// varias líneas transponen entre sí (ver eng-nf6-e6 y la diapositiva "Cómo transponer").

export const english: Course = {
  id: 'english',
  name: { es: 'Apertura Inglesa', en: 'English Opening' },
  side: 'w',
  eco: 'A10–A39',
  vs: { es: 'Blancas · 1.c4', en: 'White · 1.c4' },
  tagline: {
    es: 'Una Siciliana con un tiempo de más: controla d5 desde el flanco y deja que el alfil de g2 haga el resto.',
    en: 'A Sicilian with an extra tempo: control d5 from the wing and let the g2-bishop do the rest.',
  },
  history: {
    es: 'La Inglesa debe su nombre a Howard Staunton, el mejor jugador inglés de su época, que la empleó en el match que ganó en París en 1843 a Saint-Amant y en el torneo de Londres de 1851. Durante décadas se consideró una rareza y no se popularizó hasta el siglo XX, con las ideas hipermodernas. Mijaíl Botvinnik popularizó el esquema con peones en c4 y e4, el alfil en g2 y el caballo de rey en e2, que hoy lleva su nombre, y Bobby Fischer sorprendió a Spassky con 1.c4 en la sexta partida del Campeonato del Mundo de 1972. Hoy es un arma habitual de la élite: Carlsen la jugó en el Mundial de 2018 contra Caruana.',
    en: 'The English owes its name to Howard Staunton, the leading English player of his time, who used it in the match he won against Saint-Amant in Paris in 1843 and at the London 1851 tournament. For decades it was considered a curiosity, and it only became popular in the 20th century with the hypermodern ideas. Mikhail Botvinnik popularised the set-up with pawns on c4 and e4, the bishop on g2 and the king’s knight on e2, which now bears his name, and Bobby Fischer surprised Spassky with 1.c4 in game six of the 1972 World Championship. Today it is a regular weapon of the elite: Carlsen played it in the 2018 World Championship against Caruana.',
  },
  references: [
    { kind: 'book', title: 'Grandmaster Repertoire 3: The English Opening, Volume One', author: 'Mihail Marin', year: 2009, note: { es: 'Contra 1...e5, con el fianchetto del alfil de rey (Marin usa el orden 2.g3). Muy bien explicado.', en: 'Against 1...e5, with the king’s-bishop fianchetto (Marin uses the 2.g3 move order). Very well explained.' } },
    { kind: 'book', title: 'Grandmaster Repertoire 4: The English Opening, Volume Two', author: 'Mihail Marin', year: 2010, note: { es: 'Las demás defensas (los sistemas indios, 1...e6, 1...c6…), salvo 1...e5 y 1...c5.', en: 'The other defences (the Indian set-ups, 1...e6, 1...c6…), except 1...e5 and 1...c5.' } },
    { kind: 'book', title: 'Grandmaster Repertoire 5: The English Opening, Volume Three', author: 'Mihail Marin', year: 2010, note: { es: 'La Simétrica 1...c5 a fondo.', en: 'The Symmetrical 1...c5 in depth.' } },
    { kind: 'book', title: 'Starting Out: The English', author: 'Neil McDonald', year: 2003, note: { es: 'Introducción clara a las ideas y planes, pensada para jugadores de club.', en: 'A clear introduction to the ideas and plans, aimed at club players.' } },
    { kind: 'book', title: 'Mastering the Chess Openings, Volume 3', author: 'John Watson', year: 2008, note: { es: 'Todo el volumen está dedicado a 1.c4, con mucha atención a las estructuras invertidas.', en: 'The whole volume is devoted to 1.c4, with close attention to reversed structures.' } },
    { kind: 'book', title: 'Chess Structures: A Grandmaster Guide', author: 'Mauricio Flores Rios', year: 2015, note: { es: 'Para entender las estructuras del curso: la Carlsbad, el bind de Maroczy y el Dragón.', en: 'To understand the course structures: the Carlsbad, the Maroczy Bind and the Dragon.' } },
    { kind: 'player', title: 'Mikhail Botvinnik', note: { es: 'Estudia sus partidas con el esquema que lleva su nombre: peones en c4 y e4, fianchetto y caballo en e2.', en: 'Study his games with the set-up that bears his name: pawns on c4 and e4, a fianchetto and the knight on e2.' } },
    { kind: 'player', title: 'Ulf Andersson', note: { es: 'Un maestro de la Simétrica y de las posiciones de presión lenta que nacen de ella.', en: 'A master of the Symmetrical and of the slow-pressure positions that arise from it.' } },
    { kind: 'player', title: 'Magnus Carlsen', note: { es: 'Juega 1.c4 con frecuencia, también en partidas de Campeonato del Mundo.', en: 'He plays 1.c4 often, including in World Championship games.' } },
  ],

  lines: [
    {
      id: 'eng-main',
      name: { es: 'Dragón al revés · 9.a3 y 10.b4', en: 'Reversed Dragon · 9.a3 and 10.b4' },
      moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 Be6 10.b4 a5 11.b5 Nd4 12.Bb2 f6 13.Nxd4 exd4 14.Na4',
      notes: {
        '1.c4': {
          text: {
            es: 'La Inglesa: el peón de c controla d5 desde el flanco. No ocupas el centro con peones; lo dominas con piezas y con este peón.',
            en: 'The English: the c-pawn controls d5 from the wing. You do not occupy the centre with pawns; you dominate it with pieces and with this pawn.',
          },
          arrows: ['c4d5'],
          marks: ['d5'],
        },
        '1...e5': {
          text: {
            es: 'La respuesta más directa. Es una Siciliana con los colores cambiados… y tú tienes un tiempo de más.',
            en: 'The most direct reply. It is a Sicilian with colours reversed… and you have an extra tempo.',
          },
        },
        '2.Nc3': {
          text: { es: 'Segundo golpe a d5. El caballo también vigila e4.', en: 'A second hit on d5. The knight also watches e4.' },
          arrows: ['c3d5'],
        },
        '2...Nf6': { text: { es: 'El negro desarrolla y prepara ...d5.', en: 'Black develops and prepares ...d5.' }, rival: ['d7d5'] },
        '3.g3': {
          text: {
            es: 'Preparas el fianchetto: el alfil irá a g2, a la gran diagonal h1-a8.',
            en: 'You prepare the fianchetto: the bishop goes to g2, on the long h1-a8 diagonal.',
          },
          arrows: ['f1g2'],
        },
        '3...d5': {
          text: {
            es: 'El negro ocupa el centro, como harías tú en una Siciliana Abierta. Ahora cambias y su caballo quedará en d5, delante de tu alfil.',
            en: 'Black takes the centre, just as you would in an Open Sicilian. Now you exchange, and his knight will stand on d5, right in front of your bishop.',
          },
        },
        '4.cxd5': {
          text: {
            es: 'Cambias un peón de flanco por un peón central: es el cambio típico de la Siciliana.',
            en: 'You trade a wing pawn for a central pawn: the typical Sicilian exchange.',
          },
        },
        '5.Bg2': {
          text: {
            es: 'El alfil ya presiona d5 y, detrás, b7. Es tu pieza más importante: el «alfil del Dragón».',
            en: 'The bishop already presses on d5 and, behind it, on b7. It is your most important piece: the “Dragon bishop”.',
          },
          arrows: ['g2b7'],
        },
        '5...Nb6': {
          text: {
            es: 'El caballo se aparta de la diagonal. Si se quedara en d5, siempre tendría que vigilar los golpes con [Nxd5] y el alfil de g2.',
            en: 'The knight steps off the diagonal. If it stayed on d5, it would always have to watch out for tricks with [Nxd5] and the g2-bishop.',
          },
        },
        '6.Nf3': {
          text: {
            es: 'Desarrollas y atacas e5. Ojo: el caballo tapa la diagonal del alfil; cuando salte (por ejemplo con [Nxd4]), el alfil de g2 volverá a ver todo el flanco de dama.',
            en: 'You develop and attack e5. Note: the knight blocks the bishop’s diagonal; when it jumps away (for example with [Nxd4]), the g2-bishop sees the whole queenside again.',
          },
          arrows: ['f3e5'],
        },
        '6...Nc6': {
          text: {
            es: 'Defiende e5. Recuerda este caballo: tu plan con b4-b5 consiste en echarlo.',
            en: 'It defends e5. Remember this knight: your b4-b5 plan is all about kicking it away.',
          },
          marks: ['c6'],
        },
        '7.O-O': { text: { es: 'Rey a salvo. Ahora, el plan en el flanco de dama.', en: 'King safe. Now for the queenside plan.' } },
        '8.d3': {
          text: {
            es: 'Una jugada modesta pero útil: controla e4 y c4, abre la diagonal del alfil de c1 y no le da objetivos al negro.',
            en: 'A modest but useful move: it controls e4 and c4, opens the c1-bishop’s diagonal and gives Black no targets.',
          },
          marks: ['e4', 'c4'],
        },
        '9.a3': {
          text: {
            es: 'Prepara b4. Si juegas [9.b4?] directamente, el caballo de c6 y el alfil de e7 atacan el peón y lo pierdes. Primero a3 (o [Rb1]).',
            en: 'It prepares b4. If you play [9.b4?] at once, the c6-knight and the e7-bishop attack the pawn and you lose it. First a3 (or [Rb1]).',
          },
          arrows: ['b2b4'],
          marks: ['b4'],
        },
        '9...Be6': {
          text: {
            es: 'El negro desarrolla el alfil y vigila c4 y d5. Sus ideas: ...a5, ...[Nd4] o ...f6.',
            en: 'Black develops the bishop and watches c4 and d5. His ideas: ...a5, ...[Nd4] or ...f6.',
          },
        },
        '10.b4': {
          text: {
            es: 'Ganas espacio y amenazas b5, que echa al caballo de c6, el defensor de e5.',
            en: 'You gain space and threaten b5, which kicks the c6-knight, the defender of e5.',
          },
          arrows: ['b4b5'],
          marks: ['e5'],
        },
        '10...a5': {
          text: { es: 'El negro pregunta al peón. No cambies en a5: avanza.', en: 'Black questions the pawn. Do not take on a5: push on.' },
        },
        '11.b5': {
          text: {
            es: '¡Fuera! El caballo de c6 tiene que irse y e5 se queda sin su defensor.',
            en: 'Out you go! The c6-knight has to leave and e5 loses its defender.',
          },
          arrows: ['b5c6'],
        },
        '11...Nd4': {
          text: {
            es: 'La mejor casilla: desde d4 el caballo molesta y se ofrece a cambiarse por tu caballo de f3.',
            en: 'The best square: from d4 the knight is annoying and offers to trade itself for your f3-knight.',
          },
        },
        '12.Bb2': {
          text: {
            es: 'El segundo alfil va a la otra gran diagonal. De momento lo tapa tu caballo de c3, pero en cuanto ese caballo salte apuntará a d4 y e5. Tus dos alfiles miran al centro y al flanco de dama negro.',
            en: 'The second bishop goes to the other long diagonal. For now your c3-knight blocks it, but as soon as that knight jumps it will aim at d4 and e5. Both your bishops look at the centre and Black’s queenside.',
          },
          arrows: ['b2d4'],
        },
        '12...f6': {
          text: {
            es: 'El negro refuerza e5 con un peón. Si [12...Nxf3+ 13.Bxf3], te quedas con la pareja de alfiles; cuidado entonces con [13...Bd5?], que verás en las trampas.',
            en: 'Black reinforces e5 with a pawn. If [12...Nxf3+ 13.Bxf3], you keep the bishop pair; then watch out for [13...Bd5?], which you will see in the traps.',
          },
        },
        '13.Nxd4': {
          text: {
            es: 'Cambias el caballo central. Tras [13...exd4], el peón de d4 queda adelantado delante de tu alfil de b2 y la diagonal del alfil de g2 se abre otra vez.',
            en: 'You trade off the central knight. After [13...exd4], the d4-pawn stands exposed in front of your b2-bishop, and the g2-bishop’s diagonal opens again.',
          },
          arrows: ['g2b7'],
        },
        '14.Na4': {
          text: {
            es: 'El caballo va a c5 o cambia el de b6, y libera la diagonal del alfil de b2 contra d4. Si [14...Nxa4?], [15.Qxa4!] ataca d4 por la cuarta fila y el alfil de g2 ataca b7: el negro pierde un peón.',
            en: 'The knight heads for c5 or trades the b6-knight, and it clears the b2-bishop’s diagonal against d4. If [14...Nxa4?], [15.Qxa4!] hits d4 along the fourth rank and the g2-bishop hits b7: Black loses a pawn.',
          },
          arrows: ['a4c5', 'b2d4'],
          marks: ['d4', 'b7'],
        },
      },
      summary: {
        es: 'El Dragón al revés: el alfil de g2 domina la gran diagonal y tú atacas en el flanco de dama con a3, b4 y b5 para echar al caballo de c6. Después, [Bb2], [Nxd4] y [Na4]: presión sobre d4, c7 y b7.',
        en: 'The Reversed Dragon: the g2-bishop rules the long diagonal and you attack on the queenside with a3, b4 and b5 to kick the c6-knight. Then [Bb2], [Nxd4] and [Na4]: pressure on d4, c7 and b7.',
      },
    },

    // --- Campamento 1: otras ideas contra 1...e5 ---
    {
      id: 'eng-bb4',
      name: { es: '3...Ab4 · 5.e4', en: '3...Bb4 · 5.e4' },
      moves: '1.c4 e5 2.Nc3 Nf6 3.g3 Bb4 4.Bg2 O-O 5.e4 Bxc3 6.bxc3 c6 7.Ne2 d5 8.cxd5 cxd5 9.exd5 Nxd5 10.O-O Nc6 11.d4',
      notes: {
        '3...Bb4': {
          text: {
            es: 'El negro clava el caballo de c3 y amenaza cambiarlo para debilitar tu control de d5 y e4.',
            en: 'Black pins the c3-knight and threatens to trade it to weaken your grip on d5 and e4.',
          },
          rival: ['b4c3'],
        },
        '4.Bg2': {
          text: {
            es: 'Sigues con tu esquema. La clavada no es peligrosa: si el negro cambia en c3, te quedas con la pareja de alfiles.',
            en: 'You stick to your set-up. The pin is not dangerous: if Black takes on c3, you get the bishop pair.',
          },
        },
        '5.e4': {
          text: {
            es: 'El esquema de Botvinnik: con e4 controlas d5 con un peón más y el alfil de b4 ya no muerde nada. El caballo de g1 irá a e2, donde no tapa ni al alfil de g2 ni al peón f.',
            en: 'Botvinnik’s set-up: with e4 you control d5 with one more pawn, and the b4-bishop bites on nothing. The g1-knight goes to e2, where it blocks neither the g2-bishop nor the f-pawn.',
          },
          arrows: ['g1e2'],
          marks: ['d5'],
        },
        '5...Bxc3': { text: { es: 'El negro cambia para doblarte los peones de c.', en: 'Black trades to double your c-pawns.' } },
        '6.bxc3': {
          text: {
            es: 'Recaptura hacia el centro. A cambio de los peones doblados tienes los dos alfiles y la columna b. El peón de e4 sigue defendido por el alfil de g2: si [6...Nxe4?], [7.Bxe4] y el negro pierde una pieza.',
            en: 'Recapture towards the centre. In return for the doubled pawns you have the two bishops and the b-file. The e4-pawn is still defended by the g2-bishop: if [6...Nxe4?], [7.Bxe4] and Black loses a piece.',
          },
          arrows: ['g2e4'],
        },
        '6...c6': {
          text: {
            es: 'Prepara ...d5 para abrir el centro mientras tu rey sigue sin enrocar.',
            en: 'It prepares ...d5 to open the centre while your king has not castled yet.',
          },
          rival: ['d7d5'],
        },
        '7.Ne2': {
          text: { es: 'Desarrollas y preparas el enroque. Desde e2 el caballo vigila d4 y f4.', en: 'You develop and prepare to castle. From e2 the knight watches d4 and f4.' },
        },
        '8.cxd5': {
          text: {
            es: 'Cambias el peón doblado: así desaparece tu problema de estructura.',
            en: 'You trade off the doubled pawn: that way your structural problem disappears.',
          },
        },
        '9.exd5': { text: { es: 'Y el centro se abre. Tus alfiles quieren líneas abiertas.', en: 'And the centre opens. Your bishops want open lines.' } },
        '10.O-O': {
          text: {
            es: 'Primero el rey. El caballo de d5 parece fuerte, pero tu alfil de g2 no le quita el ojo de encima.',
            en: 'King first. The d5-knight looks strong, but your g2-bishop never takes its eye off it.',
          },
          arrows: ['g2d5'],
        },
        '11.d4': {
          text: {
            es: 'Rompes el centro y abres líneas para tus alfiles: el de c1 irá a b2 o a3, y la dama a b3 o d2. La posición está equilibrada, pero tus alfiles tienen mucho futuro.',
            en: 'You break in the centre and open lines for your bishops: the c1-bishop goes to b2 or a3, and the queen to b3 or d2. The position is balanced, but your bishops have a bright future.',
          },
          arrows: ['c1a3'],
        },
      },
      summary: {
        es: 'Contra [3...Bb4]: [5.e4] y [7.Ne2], sin miedo a los peones doblados. Tras el cambio en c3 tienes la pareja de alfiles: abre el centro con d4.',
        en: 'Against [3...Bb4]: [5.e4] and [7.Ne2], with no fear of doubled pawns. After the trade on c3 you have the bishop pair: open the centre with d4.',
      },
    },
    {
      id: 'eng-closed',
      name: { es: 'Inglesa Cerrada · 2...Cc6 y ...g6', en: 'Closed English · 2...Nc6 and ...g6' },
      moves: '1.c4 e5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.Rb1 a5 7.a3 Nge7 8.b4 axb4 9.axb4 O-O 10.b5 Nd4 11.e3 Ne6 12.Nge2',
      notes: {
        '2...Nc6': {
          text: {
            es: 'El negro elige un esquema más cerrado. Si juega [3...Nf6], sigue con [4.Bg2]: tras [4...d5 5.cxd5 Nxd5 6.Nf3] vuelves a la línea principal.',
            en: 'Black chooses a more closed set-up. If he plays [3...Nf6], continue with [4.Bg2]: after [4...d5 5.cxd5 Nxd5 6.Nf3] you are back in the main line.',
          },
        },
        '3...g6': {
          text: {
            es: 'El negro también hace fianchetto: es la Inglesa Cerrada, el espejo de la Siciliana Cerrada.',
            en: 'Black fianchettoes too: this is the Closed English, the mirror image of the Closed Sicilian.',
          },
        },
        '5.d3': {
          text: {
            es: 'Controlas e4 y abres la diagonal del alfil de c1. El caballo de g1 espera: según el plan del negro irá a e2 o a f3.',
            en: 'You control e4 and open the c1-bishop’s diagonal. The g1-knight waits: depending on Black’s plan it goes to e2 or f3.',
          },
        },
        '6.Rb1': {
          text: {
            es: 'La torre prepara b4-b5 por la columna b. Así no necesitas a3 para apoyar b4… salvo que el negro lo frene con ...a5.',
            en: 'The rook prepares b4-b5 along the b-file. That way you do not need a3 to support b4… unless Black slows it down with ...a5.',
          },
          arrows: ['b2b4'],
        },
        '6...a5': { text: { es: 'El negro frena b4. Ahora sí hace falta a3.', en: 'Black slows down b4. Now you do need a3.' }, rival: ['a5b4'] },
        '7.a3': {
          text: {
            es: '¡No juegues [7.b4?] todavía! Tras [7...axb4] no puedes recuperar el peón. Con a3, b4 ya va apoyado.',
            en: 'Do not play [7.b4?] yet! After [7...axb4] you cannot win the pawn back. With a3, b4 is supported.',
          },
          arrows: ['b2b4'],
        },
        '7...Nge7': {
          text: {
            es: 'El caballo va a e7 para no tapar el peón f: el negro piensa en ...f5.',
            en: 'The knight goes to e7 so as not to block the f-pawn: Black is thinking of ...f5.',
          },
          rival: ['f7f5'],
        },
        '8.b4': { text: { es: 'Ahora sí. El plan es b5 para echar al caballo de c6.', en: 'Now it works. The plan is b5 to kick the c6-knight.' }, arrows: ['b4b5'] },
        '9.axb4': {
          text: {
            es: 'Recapturas. La columna a se abre, pero tu juego está en la columna b: la torre de b1 y el peón de b4 apuntan a b5.',
            en: 'You recapture. The a-file opens, but your play is on the b-file: the b1-rook and the b4-pawn aim at b5.',
          },
        },
        '10.b5': {
          text: {
            es: 'Echas al caballo, que ya no podrá defender e5 ni vigilar d4 desde c6.',
            en: 'You kick the knight, which can no longer defend e5 or watch d4 from c6.',
          },
          arrows: ['b5c6'],
        },
        '10...Nd4': { text: { es: 'Igual que en la línea principal, el caballo salta a d4.', en: 'Just as in the main line, the knight jumps to d4.' } },
        '11.e3': {
          text: {
            es: 'Echas al caballo de d4. Por eso tu caballo de g1 no está en f3: desde e2 controlará d4 y f4.',
            en: 'You kick the d4-knight. That is why your g1-knight is not on f3: from e2 it will control d4 and f4.',
          },
          arrows: ['e3d4'],
        },
        '12.Nge2': {
          text: {
            es: 'Desarrollo completo: enroque, [Bb2] o [Ba3] y presión en la columna b. Si el negro juega ...f5, puedes responder con f4 para frenar su ataque.',
            en: 'Development complete: castling, [Bb2] or [Ba3] and pressure on the b-file. If Black plays ...f5, you can answer with f4 to stop his attack.',
          },
          arrows: ['f2f4'],
        },
      },
      summary: {
        es: 'En la Cerrada no tengas prisa: d3, [Rb1], a3 (si el negro juega ...a5) y b4-b5. El caballo de g1 va a e2 para apoyar e3 y f4.',
        en: 'In the Closed English, no hurry: d3, [Rb1], a3 (if Black plays ...a5) and b4-b5. The g1-knight goes to e2 to support e3 and f4.',
      },
    },
    {
      id: 'eng-a5',
      name: { es: 'Dragón al revés · 9...a5', en: 'Reversed Dragon · 9...a5' },
      moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 a5 10.Be3 Be6 11.Na4 Nxa4 12.Qxa4 Bd7 13.Qb3',
      notes: {
        '9...a5': {
          text: {
            es: 'El negro impide b4. No insistas: cambia de plan y juega por la columna c y las casillas negras.',
            en: 'Black stops b4. Do not insist: switch plans and play on the c-file and the dark squares.',
          },
          rival: ['a5b4'],
        },
        '10.Be3': {
          text: {
            es: 'El alfil ataca al caballo de b6 y vigila c5. Si el negro no hace nada, [Bxb6] le dejaría peones doblados.',
            en: 'The bishop hits the b6-knight and eyes c5. If Black does nothing, [Bxb6] would leave him with doubled pawns.',
          },
          arrows: ['e3b6'],
        },
        '11.Na4': {
          text: {
            es: 'El caballo cambia el de b6 o salta a c5, donde atacaría e6 y b7.',
            en: 'The knight trades the b6-knight or jumps to c5, where it would hit e6 and b7.',
          },
          arrows: ['a4c5'],
        },
        '12.Qxa4': {
          text: {
            es: 'La dama sale con fuerza: desde a4 presiona a5 y c6, y puede pasar a b3, b5 o c4.',
            en: 'The queen comes out with force: from a4 it presses on a5 and c6, and it can switch to b3, b5 or c4.',
          },
        },
        '12...Bd7': {
          text: {
            es: 'El negro protege c6 y prepara ...[Nd4], que destaparía el ataque del alfil de d7 sobre tu dama.',
            en: 'Black protects c6 and prepares ...[Nd4], which would uncover the d7-bishop’s attack on your queen.',
          },
          rival: ['c6d4'],
        },
        '13.Qb3': {
          text: {
            es: 'La dama se aparta con tempo: ataca b7, que no tiene defensor. Tu plan: [Rfc1], [Qc4] o [Bc5] y presión sobre c7 y b7.',
            en: 'The queen steps away with tempo: it attacks b7, which has no defender. Your plan: [Rfc1], [Qc4] or [Bc5] and pressure on c7 and b7.',
          },
          arrows: ['b3b7'],
        },
      },
      summary: {
        es: 'Si el negro frena b4 con [9...a5], cambia de plan: [Be3], [Na4] y la columna c. Las casillas negras (c5 y b6) son tuyas.',
        en: 'If Black stops b4 with [9...a5], switch plans: [Be3], [Na4] and the c-file. The dark squares (c5 and b6) are yours.',
      },
    },

    // --- Campamento 1: la Simétrica ---
    {
      id: 'eng-sym',
      name: { es: 'Simétrica · Cuatro Caballos con d4', en: 'Symmetrical · Four Knights with d4' },
      moves: '1.c4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.Nf3 Nf6 6.O-O O-O 7.d4 cxd4 8.Nxd4 Nxd4 9.Qxd4 d6 10.Qd3 Bf5 11.e4 Be6 12.Bd2',
      notes: {
        '1...c5': {
          text: {
            es: 'La Simétrica: el negro copia tu jugada. Aquí no hay Siciliana invertida, pero tu esquema es el mismo: [Nc3], g3 y [Bg2].',
            en: 'The Symmetrical: Black copies your move. There is no reversed Sicilian here, but your set-up is the same: [Nc3], g3 and [Bg2].',
          },
        },
        '3...g6': {
          text: {
            es: 'Simetría total: los dos bandos ponen el alfil en la gran diagonal.',
            en: 'Total symmetry: both sides put their bishop on the long diagonal.',
          },
        },
        '5.Nf3': {
          text: {
            es: 'Aquí el caballo va a f3 porque quieres romper con d4.',
            en: 'Here the knight goes to f3 because you want to break with d4.',
          },
          arrows: ['d2d4'],
        },
        '7.d4': {
          text: {
            es: 'La ruptura central. Con tu tiempo de más, abres el centro antes que el negro.',
            en: 'The central break. With your extra tempo, you open the centre before Black does.',
          },
          arrows: ['d4c5'],
        },
        '9.Qxd4': {
          text: {
            es: 'Tu dama queda en la diagonal del alfil de g7: si el caballo de f6 se mueve, la ataca. No la dejes ahí mucho tiempo.',
            en: 'Your queen now stands on the g7-bishop’s diagonal: if the f6-knight moves, it is attacked. Do not leave it there for long.',
          },
          rival: ['g7d4'],
        },
        '9...d6': {
          text: {
            es: 'El negro abre su alfil de c8 y mantiene preparado el descubierto: cualquier salto del caballo de f6 atacaría tu dama.',
            en: 'Black opens his c8-bishop and keeps the discovery ready: any jump of the f6-knight would attack your queen.',
          },
        },
        '10.Qd3': {
          text: {
            es: 'La dama se aparta de la diagonal, defiende c4 y vigila d5 y e4.',
            en: 'The queen steps off the diagonal, defends c4 and watches d5 and e4.',
          },
          marks: ['d5'],
        },
        '10...Bf5': { text: { es: 'El negro ataca tu dama con tempo…', en: 'Black attacks your queen with tempo…' } },
        '11.e4': {
          text: {
            es: '…pero el tiempo lo ganas tú: el peón echa al alfil y forma el bind de Maroczy (c4 y e4), que controla d5 y frena ...b5 y ...d5. Ojo: [11...Nxe4??] pierde una pieza, porque e4 está defendido tres veces.',
            en: '…but you are the one who gains time: the pawn kicks the bishop and forms the Maroczy Bind (c4 and e4), which controls d5 and holds back ...b5 and ...d5. Note: [11...Nxe4??] loses a piece, because e4 is defended three times.',
          },
          marks: ['d5', 'b5'],
        },
        '12.Bd2': {
          text: {
            es: 'Desarrollas y conectas las torres. Después, [Rac1], b3 y [Rfd1]: tienes más espacio y el negro no tiene rupturas fáciles.',
            en: 'You develop and connect the rooks. Then [Rac1], b3 and [Rfd1]: you have more space and Black has no easy breaks.',
          },
        },
      },
      summary: {
        es: 'Contra la Simétrica, rompe con d4 cuando el negro haya enrocado. Tras los cambios en d4, saca la dama de la diagonal del alfil de g7 ([Qd3]) y monta el bind de Maroczy con e4.',
        en: 'Against the Symmetrical, break with d4 once Black has castled. After the trades on d4, take the queen off the g7-bishop’s diagonal ([Qd3]) and set up the Maroczy Bind with e4.',
      },
    },
    {
      id: 'eng-rubinstein',
      name: { es: 'Simétrica · Rubinstein con ...Cc7', en: 'Symmetrical · Rubinstein with ...Nc7' },
      moves: '1.c4 c5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nc7 6.Nf3 Nc6 7.O-O e5 8.d3 Be7 9.Nd2 O-O 10.Nc4 f6 11.f4 exf4 12.Bxf4',
      notes: {
        '3...d5': { text: { es: 'El negro busca espacio en el centro.', en: 'Black seeks space in the centre.' } },
        '5.Bg2': {
          text: { es: 'Otra vez el alfil contra el caballo de d5.', en: 'Once again the bishop against the d5-knight.' },
          arrows: ['g2d5'],
        },
        '5...Nc7': {
          text: {
            es: 'El sistema Rubinstein: el caballo se retira a c7, desde donde vigila d5 y b5 y apoya ...e5. El negro monta un bind de Maroczy al revés (c5 y e5).',
            en: 'The Rubinstein system: the knight retreats to c7, where it watches d5 and b5 and supports ...e5. Black builds a reversed Maroczy Bind (c5 and e5).',
          },
        },
        '7...e5': {
          text: {
            es: 'El negro tiene mucho espacio, pero d5 y d4 quedan débiles y su desarrollo va lento.',
            en: 'Black has lots of space, but d5 and d4 are weak and his development is slow.',
          },
          marks: ['d4', 'd5'],
        },
        '8.d3': { text: { es: 'Controlas e4 y c4 y abres el alfil de c1.', en: 'You control e4 and c4 and open the c1-bishop.' } },
        '9.Nd2': {
          text: {
            es: 'El caballo va a c4, donde ataca e5. Además, al salir de f3 destapa el alfil de g2 contra c6 y deja libre el peón f.',
            en: 'The knight heads for c4, where it hits e5. Also, by leaving f3 it uncovers the g2-bishop against c6 and frees the f-pawn.',
          },
          arrows: ['d2c4', 'f2f4'],
        },
        '10.Nc4': {
          text: {
            es: 'Atacas e5. La amenaza es [Bxc6] y [Nxe5]: si cae el caballo de c6, e5 se queda sin defensa.',
            en: 'You attack e5. The threat is [Bxc6] and [Nxe5]: once the c6-knight falls, e5 is undefended.',
          },
          arrows: ['c4e5'],
        },
        '10...f6': {
          text: {
            es: 'El negro refuerza e5 con un peón, pero debilita la diagonal g1-a7 y la casilla e6.',
            en: 'Black reinforces e5 with a pawn, but weakens the g1-a7 diagonal and the e6-square.',
          },
          marks: ['e6'],
        },
        '11.f4': {
          text: {
            es: '¡Ataca la cadena! Abres la columna f para tu torre y das más juego a tus piezas.',
            en: 'Hit the chain! You open the f-file for your rook and give your pieces more play.',
          },
          arrows: ['f4e5'],
        },
        '12.Bxf4': {
          text: {
            es: 'El alfil ataca al caballo de c7. La posición está equilibrada, pero tú tienes la columna f y el alfil de g2 libre; el negro tiene que vigilar e6 y d5.',
            en: 'The bishop hits the c7-knight. The position is balanced, but you have the f-file and a free g2-bishop; Black has to watch e6 and d5.',
          },
          arrows: ['f4c7'],
        },
      },
      summary: {
        es: 'Contra el Rubinstein (...[Nc7] y ...e5): [Nd2]-c4 contra e5 y la ruptura f4. El alfil de g2 y la columna f son tus armas.',
        en: 'Against the Rubinstein (...[Nc7] and ...e5): [Nd2]-c4 against e5 and the f4 break. The g2-bishop and the f-file are your weapons.',
      },
    },
    {
      id: 'eng-sym-e5',
      name: { es: 'Simétrica · el Botvinnik del negro', en: 'Symmetrical · Black’s Botvinnik set-up' },
      moves: '1.c4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.Nf3 e5 6.O-O Nge7 7.d3 O-O 8.a3 d6 9.Rb1 f5 10.Ne1 Rb8 11.Nc2 b6 12.b4',
      notes: {
        '5...e5': {
          text: {
            es: 'El negro monta él mismo el esquema Botvinnik: peones en c5 y e5 que controlan d4. Ahora la ruptura d4 ya no es posible.',
            en: 'Black adopts the Botvinnik set-up himself: pawns on c5 and e5 controlling d4. Now the d4 break is no longer possible.',
          },
          marks: ['d4'],
        },
        '6...Nge7': {
          text: {
            es: 'El caballo va a e7 para no tapar el peón f: el negro quiere ...f5.',
            en: 'The knight goes to e7 so as not to block the f-pawn: Black wants ...f5.',
          },
          rival: ['f7f5'],
        },
        '8.a3': {
          text: {
            es: 'Tu plan es el de siempre: a3, [Rb1] y b4 para abrir el flanco de dama, donde el negro tiene menos piezas.',
            en: 'Your plan is the usual one: a3, [Rb1] and b4 to open the queenside, where Black has fewer pieces.',
          },
          arrows: ['b2b4'],
        },
        '9.Rb1': {
          text: {
            es: 'La torre se coloca detrás del peón b: cuando se abra la columna, presionará b7.',
            en: 'The rook gets behind the b-pawn: when the file opens, it will press on b7.',
          },
        },
        '9...f5': {
          text: {
            es: 'El negro gana espacio en el flanco de rey y prepara ...f4 o ...h6 y ...g5.',
            en: 'Black gains space on the kingside and prepares ...f4 or ...h6 and ...g5.',
          },
          rival: ['f5f4'],
        },
        '10.Ne1': {
          text: {
            es: 'La maniobra clave: el caballo va a c2 para apoyar b4 y después a e3 y d5. Además destapa el alfil de g2.',
            en: 'The key manoeuvre: the knight heads for c2 to support b4, and later e3 and d5. It also uncovers the g2-bishop.',
          },
          arrows: ['e1c2'],
        },
        '10...Rb8': { text: { es: 'El negro protege b7 por adelantado y prepara ...b6.', en: 'Black protects b7 in advance and prepares ...b6.' } },
        '11.Nc2': {
          text: {
            es: 'Ahora b4 va apoyado dos veces (a3 y el caballo). Más adelante, el caballo puede ir a e3 y d5.',
            en: 'Now b4 is supported twice (a3 and the knight). Later the knight can go to e3 and d5.',
          },
          arrows: ['c2e3', 'e3d5'],
        },
        '11...b6': {
          text: {
            es: 'El negro refuerza c5 para no tener que cambiar en b4.',
            en: 'Black reinforces c5 so that he does not have to take on b4.',
          },
        },
        '12.b4': {
          text: {
            es: '¡Ya está! Si el negro cambia, abres la columna b para tu torre; si no, [bxc5] o b5 le crean debilidades. Tu caballo irá a e3 y d5.',
            en: 'There it is! If Black exchanges, you open the b-file for your rook; if not, [bxc5] or b5 creates weaknesses. Your knight heads for e3 and d5.',
          },
          arrows: ['b4c5'],
        },
      },
      summary: {
        es: 'Contra el Botvinnik del negro (c5 y e5) no hay ruptura d4: juega a3, [Rb1], [Ne1]-c2 y b4. El caballo terminará en d5.',
        en: 'Against Black’s Botvinnik set-up (c5 and e5) there is no d4 break: play a3, [Rb1], [Ne1]-c2 and b4. The knight will end up on d5.',
      },
    },

    // --- Campamento 1: contra 1...Nf6 ---
    {
      id: 'eng-kid',
      name: { es: 'India de Rey · e4 y Cge2', en: 'King’s Indian set-up · e4 and Nge2' },
      moves: '1.c4 Nf6 2.Nc3 g6 3.g3 Bg7 4.Bg2 O-O 5.e4 d6 6.Nge2 e5 7.O-O Nc6 8.d3 Nh5 9.Be3 f5 10.exf5 gxf5 11.f4',
      notes: {
        '1...Nf6': {
          text: {
            es: 'La respuesta más flexible. Mantén tu esquema: [Nc3], g3 y [Bg2]. Si [2...e5], estás en la línea principal.',
            en: 'The most flexible reply. Keep your set-up: [Nc3], g3 and [Bg2]. If [2...e5], you are in the main line.',
          },
        },
        '2...g6': {
          text: {
            es: 'El negro quiere una India de Rey. No hace falta jugar d4: tu esquema de fianchetto funciona igual de bien.',
            en: 'Black wants a King’s Indian. You do not need d4: your fianchetto set-up works just as well.',
          },
        },
        '5.e4': {
          text: {
            es: 'El sistema Botvinnik: con c4 y e4 controlas d5 y frenas la ruptura ...d5. El precio es la casilla d4, que tendrás que vigilar.',
            en: 'The Botvinnik system: with c4 and e4 you control d5 and stop the ...d5 break. The price is the d4-square, which you will have to watch.',
          },
          marks: ['d5', 'd4'],
        },
        '6.Nge2': {
          text: {
            es: 'El caballo va a e2 y no a f3: así deja libre el peón f para jugar f4 más adelante.',
            en: 'The knight goes to e2, not f3: that way it leaves the f-pawn free to play f4 later.',
          },
          arrows: ['f2f4'],
        },
        '6...e5': {
          text: {
            es: 'El negro fija el centro. Su plan típico: ...[Nc6], ...[Nh5] y ...f5.',
            en: 'Black fixes the centre. His typical plan: ...[Nc6], ...[Nh5] and ...f5.',
          },
          rival: ['f7f5'],
        },
        '8.d3': {
          text: {
            es: 'Una cadena sólida c4-d3-e4. Tus planes: b4 en el flanco de dama o f4 en el de rey.',
            en: 'A solid c4-d3-e4 chain. Your plans: b4 on the queenside or f4 on the kingside.',
          },
        },
        '8...Nh5': {
          text: { es: 'El caballo deja paso al peón f y vigila f4.', en: 'The knight makes way for the f-pawn and eyes f4.' },
          rival: ['f7f5'],
        },
        '9.Be3': {
          text: {
            es: 'Desarrollas y vigilas d4 y c5. La dama podrá ir a d2.',
            en: 'You develop and watch d4 and c5. The queen can go to d2.',
          },
          marks: ['d4'],
        },
        '9...f5': { text: { es: 'El negro ataca e4, como en una India de Rey clásica.', en: 'Black hits e4, as in a classical King’s Indian.' } },
        '10.exf5': {
          text: {
            es: 'Cambias en f5 y abres la gran diagonal de tu alfil de g2, que ahora apunta al caballo de c6 y, detrás, a b7.',
            en: 'You take on f5 and open your g2-bishop’s long diagonal: now it aims at the c6-knight and, behind it, at b7.',
          },
          arrows: ['g2c6'],
        },
        '10...gxf5': {
          text: {
            es: 'El negro recupera con el peón para controlar e4, pero su rey queda más expuesto.',
            en: 'Black recaptures with the pawn to control e4, but his king is more exposed.',
          },
        },
        '11.f4': {
          text: {
            es: '¡Frena la avalancha! f4 impide ...f4 y ataca e5. Si el negro cambia en f4, tus piezas llegan al centro; si no, [fxe5] abre la columna f.',
            en: 'Stop the avalanche! f4 prevents ...f4 and attacks e5. If Black takes on f4, your pieces reach the centre; if not, [fxe5] opens the f-file.',
          },
          arrows: ['f4e5'],
        },
      },
      summary: {
        es: 'Contra la India de Rey: el esquema Botvinnik (e4 y [Nge2]). Si el negro rompe con ...f5, cambia en f5 y responde con f4: la diagonal del alfil de g2 se abre y el centro negro se debilita.',
        en: 'Against the King’s Indian: the Botvinnik set-up (e4 and [Nge2]). If Black breaks with ...f5, take on f5 and answer with f4: the g2-bishop’s diagonal opens and Black’s centre weakens.',
      },
    },
    {
      id: 'eng-grunfeld',
      name: { es: 'Anglo-Grünfeld · 4.g3', en: 'Anglo-Grünfeld · 4.g3' },
      moves: '1.c4 Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 g6 5.Bg2 Nxc3 6.bxc3 Bg7 7.Rb1 Nd7 8.Nf3 O-O 9.O-O',
      notes: {
        '2...d5': {
          text: {
            es: 'El negro juega al estilo Grünfeld. Con cxd5 y g3, el alfil de g2 tendrá un blanco claro en d5.',
            en: 'Black plays Grünfeld-style. With cxd5 and g3, the g2-bishop will have a clear target on d5.',
          },
        },
        '4.g3': {
          text: {
            es: 'El mismo esquema de siempre. Si [4...e5], vuelves a estar en la línea principal.',
            en: 'The same old set-up. If [4...e5], you are back in the main line.',
          },
        },
        '5.Bg2': {
          text: {
            es: 'El alfil ataca al caballo de d5, que ahora tiene que decidir.',
            en: 'The bishop attacks the d5-knight, which now has to make a decision.',
          },
          arrows: ['g2d5'],
        },
        '5...Nxc3': {
          text: {
            es: 'El negro cambia los caballos. A cambio, recibes el centro y la columna b.',
            en: 'Black trades knights. In return, you get the centre and the b-file.',
          },
        },
        '6.bxc3': {
          text: {
            es: 'Recapturas hacia el centro: el peón de c3 apoyará d4.',
            en: 'You recapture towards the centre: the c3-pawn will support d4.',
          },
        },
        '7.Rb1': {
          text: {
            es: 'Presión sobre b7: lo atacan la torre y el alfil de g2. El negro tiene que ocuparse de él antes de desarrollar el alfil de c8.',
            en: 'Pressure on b7: it is attacked by the rook and the g2-bishop. Black has to deal with it before developing the c8-bishop.',
          },
          arrows: ['b1b7', 'g2b7'],
        },
        '7...Nd7': {
          text: {
            es: 'El negro no defiende b7… porque está envenenado: [8.Bxb7? Bxb7 9.Rxb7 Nb6!] y la torre queda encerrada; luego ...[Qc8] la atrapa. No te lo comas.',
            en: 'Black does not defend b7… because it is poisoned: [8.Bxb7? Bxb7 9.Rxb7 Nb6!] and the rook is shut in; then ...[Qc8] traps it. Do not grab it.',
          },
          rival: ['d7b6'],
        },
        '8.Nf3': { text: { es: 'Desarrollas con calma y preparas el enroque.', en: 'You develop calmly and prepare to castle.' } },
        '9.O-O': {
          text: {
            es: 'Tienes el centro y la columna b. Tus planes: d4, [Qb3] o [Qa4], y el alfil de c1 a a3 o, cuando hayas jugado d4, a f4. El negro buscará ...c5 y ...[Nb6].',
            en: 'You have the centre and the b-file. Your plans: d4, [Qb3] or [Qa4], and the c1-bishop to a3 or, once you have played d4, to f4. Black will aim for ...c5 and ...[Nb6].',
          },
          arrows: ['d2d4'],
        },
      },
      summary: {
        es: 'Contra la Anglo-Grünfeld: cxd5, g3 y [Bg2]. Tras el cambio en c3, la torre de b1 presiona b7, pero no te comas el peón si un caballo puede encerrar tu torre.',
        en: 'Against the Anglo-Grünfeld: cxd5, g3 and [Bg2]. After the trade on c3, the b1-rook presses on b7, but do not grab the pawn if a knight can shut your rook in.',
      },
    },

    // --- Campamento 1: 1...e6 y la estructura Carlsbad ---
    {
      id: 'eng-carlsbad',
      name: { es: '1...e6 · Carlsbad y ataque de minorías', en: '1...e6 · Carlsbad and minority attack' },
      moves: '1.c4 e6 2.Nc3 d5 3.cxd5 exd5 4.d4 Nf6 5.Bg5 Be7 6.e3 c6 7.Bd3 Nbd7 8.Qc2 O-O 9.Nf3 Re8 10.O-O Nf8 11.Rab1 Ng6 12.b4',
      notes: {
        '1...e6': {
          text: {
            es: 'El negro prepara ...d5 con apoyo. Contra esto cambias de estructura: cxd5 y d4.',
            en: 'Black prepares ...d5 with support. Against this you change the structure: cxd5 and d4.',
          },
        },
        '3.cxd5': {
          text: {
            es: 'Cambias en d5. Cuando el negro recaptura con el peón, aparece la estructura Carlsbad.',
            en: 'You exchange on d5. When Black recaptures with the pawn, the Carlsbad structure appears.',
          },
        },
        '4.d4': {
          text: {
            es: 'Nace la Carlsbad: en el flanco de dama tienes dos peones (a y b) contra tres del negro (a, b y c). Parece raro, pero tu plan será atacar con esa minoría: b4-b5.',
            en: 'The Carlsbad is born: on the queenside you have two pawns (a and b) against Black’s three (a, b and c). It seems odd, but your plan is to attack with that minority: b4-b5.',
          },
          marks: ['d5'],
        },
        '5.Bg5': {
          text: { es: 'Clavas el caballo de f6, que defiende d5.', en: 'You pin the f6-knight, which defends d5.' },
          arrows: ['g5f6'],
        },
        '6.e3': {
          text: {
            es: 'Abres el alfil de f1, que irá a d3, su mejor diagonal en esta estructura.',
            en: 'You open the f1-bishop, which goes to d3, its best diagonal in this structure.',
          },
          arrows: ['f1d3'],
        },
        '6...c6': {
          text: {
            es: 'El negro apoya d5. Ese peón de c6 será el objetivo de tu b5.',
            en: 'Black supports d5. That c6-pawn will be the target of your b5.',
          },
          marks: ['c6'],
        },
        '7.Bd3': {
          text: {
            es: 'El alfil apunta a h7 y vigila f5, la casilla donde el negro querría poner su alfil de c8.',
            en: 'The bishop aims at h7 and watches f5, the square where Black would like to put his c8-bishop.',
          },
          marks: ['f5'],
        },
        '8.Qc2': {
          text: {
            es: 'La dama refuerza el control de f5 y e4 y también apunta a h7.',
            en: 'The queen reinforces control of f5 and e4 and also aims at h7.',
          },
        },
        '10...Nf8': {
          text: {
            es: 'El caballo negro va a g6 o e6 para defender su flanco de rey.',
            en: 'The black knight heads for g6 or e6 to defend the kingside.',
          },
        },
        '11.Rab1': {
          text: {
            es: 'La torre se coloca detrás del peón b: empieza el ataque de minorías.',
            en: 'The rook gets behind the b-pawn: the minority attack begins.',
          },
          arrows: ['b2b4'],
        },
        '12.b4': {
          text: {
            es: 'El plan es b5: si el negro cambia en b5, su peón de d5 queda aislado; si te deja cambiar en c6, le queda un peón retrasado en c6, en la columna c abierta.',
            en: 'The plan is b5: if Black takes on b5, his d5-pawn becomes isolated; if he lets you take on c6, he is left with a backward c6-pawn on the open c-file.',
          },
          arrows: ['b4b5'],
          marks: ['c6', 'd5'],
        },
      },
      summary: {
        es: 'La estructura Carlsbad: [Bd3], [Qc2], [Nf3], enroque corto, [Rab1] y b4-b5, el ataque de minorías. El objetivo es dejarle al negro un peón débil en c6 o en d5.',
        en: 'The Carlsbad structure: [Bd3], [Qc2], [Nf3], short castling, [Rab1] and b4-b5, the minority attack. The goal is to leave Black with a weak pawn on c6 or d5.',
      },
    },
    {
      id: 'eng-nf6-e6',
      name: { es: '1...Cf6 2.Cc3 e6 · Carlsbad por transposición', en: '1...Nf6 2.Nc3 e6 · Carlsbad by transposition' },
      moves: '1.c4 Nf6 2.Nc3 e6 3.Nf3 d5 4.cxd5 exd5 5.d4 Be7 6.Bg5 c6 7.e3 Nbd7 8.Bd3 O-O 9.Qc2 Re8 10.O-O Nf8 11.Rab1 a5 12.a3',
      notes: {
        '2...e6': {
          text: {
            es: 'El negro prepara ...d5 o ...[Bb4]. [3.Nf3] es la jugada más flexible: si el negro juega ...d5, cambiarás en d5 y jugarás d4.',
            en: 'Black prepares ...d5 or ...[Bb4]. [3.Nf3] is the most flexible move: if Black plays ...d5, you will take on d5 and play d4.',
          },
        },
        '3.Nf3': {
          text: {
            es: 'Desarrollas y esperas. Con el caballo en f3, eliges tú el momento de jugar d4.',
            en: 'You develop and wait. With the knight on f3, you choose the moment to play d4.',
          },
        },
        '4.cxd5': { text: { es: 'El mismo cambio que contra [1...e6].', en: 'The same exchange as against [1...e6].' } },
        '5.d4': {
          text: {
            es: 'Y ya tienes la estructura Carlsbad, con el caballo en f3 un poco antes.',
            en: 'And you have the Carlsbad structure, with the knight on f3 a little earlier.',
          },
          marks: ['d5'],
        },
        '6.Bg5': { text: { es: 'La clavada de siempre.', en: 'The usual pin.' }, arrows: ['g5f6'] },
        '9.Qc2': {
          text: {
            es: '¡Transposición! Es exactamente la misma posición de la línea de [1...e6], a la que se llega por otro orden de jugadas.',
            en: 'Transposition! This is exactly the same position as in the [1...e6] line, reached by a different move order.',
          },
        },
        '11.Rab1': { text: { es: 'Preparas b4.', en: 'You prepare b4.' }, arrows: ['b2b4'] },
        '11...a5': {
          text: {
            es: 'El negro frena b4 con ...a5, como en otras líneas del curso.',
            en: 'Black slows down b4 with ...a5, as in other lines of the course.',
          },
          rival: ['a5b4'],
        },
        '12.a3': {
          text: {
            es: 'La respuesta de siempre: a3 y b4 de todos modos. Si el negro cambia en b4, las columnas a y b se abren para tus torres.',
            en: 'The usual answer: a3 and b4 anyway. If Black takes on b4, the a- and b-files open for your rooks.',
          },
          arrows: ['b2b4'],
        },
      },
      summary: {
        es: 'Contra [1...Nf6 2.Nc3 e6]: [3.Nf3] y, si el negro juega ...d5, cxd5 y d4. Llegas a la misma estructura Carlsbad y al mismo plan: [Rab1], a3 y b4.',
        en: 'Against [1...Nf6 2.Nc3 e6]: [3.Nf3] and, if Black plays ...d5, cxd5 and d4. You reach the same Carlsbad structure and the same plan: [Rab1], a3 and b4.',
      },
    },

    // --- Cumbre: trampas y errores ---
    {
      id: 'eng-trap-bd5',
      name: { es: 'Trampa del Dragón al revés: 13...Ad5?', en: 'Reversed Dragon trap: 13...Bd5?' },
      moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 Be6 10.b4 a5 11.b5 Nd4 12.Bb2 Nxf3+ 13.Bxf3 Bd5 14.Nxd5 Nxd5 15.Bxe5',
      notes: {
        '12...Nxf3+': {
          text: { es: 'El negro cambia el caballo de d4 por tu caballo de f3.', en: 'Black trades the d4-knight for your f3-knight.' },
        },
        '13.Bxf3': {
          text: {
            es: 'Recaptura con el alfil: tienes la pareja de alfiles. Fíjate en e5: ya no lo defiende ningún caballo, y tu alfil de b2 lo apunta a través del caballo de c3.',
            en: 'Recapture with the bishop: you have the bishop pair. Look at e5: no knight defends it any more, and your b2-bishop aims at it through the c3-knight.',
          },
          arrows: ['b2e5'],
          marks: ['e5'],
        },
        '13...Bd5': {
          text: {
            es: 'Parece lógico: el negro quiere cambiar tu alfil de f3. Pero es un error.',
            en: 'It looks logical: Black wants to trade off your f3-bishop. But it is a mistake.',
          },
        },
        '14.Nxd5': {
          text: {
            es: '¡Cambias el alfil y el caballo de c3 sale del camino! Ahora el alfil de b2 ve e5.',
            en: 'You take the bishop, and the c3-knight gets out of the way! Now the b2-bishop sees e5.',
          },
          arrows: ['b2e5'],
        },
        '14...Nxd5': { text: { es: 'Obligado: si no, el negro tiene una pieza menos.', en: 'Forced: otherwise Black is simply a piece down.' } },
        '15.Bxe5': {
          text: {
            es: 'Ganas un peón y tus dos alfiles dominan el tablero. El caballo de d5 está atacado por el alfil de f3 y casi no tiene casillas: [Qb3] o e4 lo pondrán en apuros.',
            en: 'You win a pawn and your two bishops dominate the board. The d5-knight is attacked by the f3-bishop and has almost no squares: [Qb3] or e4 will put it in trouble.',
          },
          arrows: ['f3d5'],
        },
      },
      summary: {
        es: 'Cuando el negro cambia en f3, el peón de e5 se queda sin defensa y tu alfil de b2 lo apunta a través del caballo de c3. Si el negro juega [13...Bd5?], [14.Nxd5] abre la diagonal y [15.Bxe5] gana un peón.',
        en: 'When Black trades on f3, the e5-pawn is left without a defender and your b2-bishop aims at it through the c3-knight. If Black plays [13...Bd5?], [14.Nxd5] opens the diagonal and [15.Bxe5] wins a pawn.',
      },
    },
    {
      id: 'eng-trap-e4',
      name: { es: 'Trampa de la gran diagonal: 6...Cxe4?', en: 'Long-diagonal trap: 6...Nxe4?' },
      moves: '1.c4 e5 2.Nc3 Nf6 3.g3 Bb4 4.Bg2 O-O 5.e4 Bxc3 6.bxc3 Nxe4 7.Bxe4',
      notes: {
        '5.e4': {
          text: { es: 'El esquema de Botvinnik, como en la línea de [3...Bb4].', en: 'Botvinnik’s set-up, as in the [3...Bb4] line.' },
        },
        '5...Bxc3': { text: { es: 'El negro elimina el caballo que defendía e4…', en: 'Black removes the knight that defended e4…' } },
        '6.bxc3': {
          text: {
            es: '…y el peón de e4 parece indefenso. Pero no lo está: el alfil de g2 lo protege por la gran diagonal.',
            en: '…and the e4-pawn looks defenceless. But it is not: the g2-bishop protects it along the long diagonal.',
          },
          arrows: ['g2e4'],
        },
        '6...Nxe4': { text: { es: '¡Error! El negro ha contado mal.', en: 'A mistake! Black has miscounted.' } },
        '7.Bxe4': {
          text: {
            es: 'Una pieza a cambio de un peón. Aunque el negro ataque al alfil con ...d5 o ...f5, sigues con una pieza de más. Recuerda: el alfil de g2 no solo ataca; también defiende casillas clave como e4 y d5, y protegerá a tu rey cuando enroques.',
            en: 'A piece for a pawn. Even if Black hits the bishop with ...d5 or ...f5, you stay a piece up. Remember: the g2-bishop does not only attack; it also defends key squares such as e4 and d5, and it will shield your king once you castle.',
          },
        },
      },
      summary: {
        es: 'Tras [5...Bxc3 6.bxc3], el peón de e4 sigue defendido por el alfil de g2. Si el negro lo toma, [7.Bxe4] gana una pieza.',
        en: 'After [5...Bxc3 6.bxc3], the e4-pawn is still defended by the g2-bishop. If Black takes it, [7.Bxe4] wins a piece.',
      },
    },
    {
      id: 'eng-err-b4',
      name: { es: 'Error típico: b4 sin preparar', en: 'Typical mistake: b4 without preparation' },
      practice: false,
      moves: '1.c4 e5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.Rb1 a5 7.b4 axb4',
      notes: {
        '6...a5': {
          text: { es: 'El negro vigila b4 con su peón de a.', en: 'Black watches b4 with his a-pawn.' },
          rival: ['a5b4'],
        },
        '7.b4': {
          text: {
            es: 'Así NO. Parece el plan de siempre, pero sin a3 el peón de b4 no tiene apoyo.',
            en: 'Not like this. It looks like the usual plan, but without a3 the b4-pawn has no support.',
          },
        },
        '7...axb4': {
          text: {
            es: 'Y no puedes recuperarlo: si [8.Rxb4??], [8...Nxb4] y pierdes la torre. Un peón menos sin compensación. Por eso, contra ...a5: primero a3, después b4.',
            en: 'And you cannot win it back: if [8.Rxb4??], [8...Nxb4] and you lose the rook. A pawn down with no compensation. That is why, against ...a5: first a3, then b4.',
          },
          rival: ['c6b4'],
        },
      },
      summary: {
        es: 'Si el negro ha jugado ...a5, prepara b4 con a3. Sin a3, el peón de b4 se pierde.',
        en: 'If Black has played ...a5, prepare b4 with a3. Without a3, the b4-pawn is lost.',
      },
    },
    {
      id: 'eng-err-elephant',
      name: { es: 'Error típico: la trampa del Elefante', en: 'Typical mistake: the Elephant Trap' },
      practice: false,
      moves: '1.c4 e6 2.Nc3 d5 3.cxd5 exd5 4.d4 Nf6 5.Bg5 Nbd7 6.Nxd5 Nxd5 7.Bxd8 Bb4+ 8.Qd2 Bxd2+ 9.Kxd2 Kxd8',
      notes: {
        '5...Nbd7': {
          text: {
            es: 'Parece que el caballo de f6 está clavado y que d5 cae. Es una trampa famosa: la trampa del Elefante.',
            en: 'It looks as if the f6-knight is pinned and d5 is falling. It is a famous trap: the Elephant Trap.',
          },
        },
        '6.Nxd5': {
          text: {
            es: '¡Error! Lo correcto es [6.e3], como en la línea de la Carlsbad.',
            en: 'A mistake! The right move is [6.e3], as in the Carlsbad line.',
          },
        },
        '6...Nxd5': {
          text: {
            es: '¡El negro entrega su dama! La clavada era falsa.',
            en: 'Black gives up his queen! The pin was fake.',
          },
        },
        '7...Bb4+': {
          text: {
            es: 'El jaque es la clave: solo puedes taparlo con la dama.',
            en: 'The check is the point: you can only block it with the queen.',
          },
          rival: ['b4d2'],
        },
        '9...Kxd8': {
          text: {
            es: 'Cuenta el material: el negro ha recuperado la dama y tiene una pieza de más. Ten cuidado con las clavadas que no son de verdad.',
            en: 'Count the material: Black has won the queen back and is a piece up. Beware of pins that are not real pins.',
          },
        },
      },
      summary: {
        es: 'La clavada del caballo de f6 es falsa: si [6.Nxd5??], [6...Nxd5!] y el jaque [7...Bb4+] recupera la dama. Pierdes una pieza.',
        en: 'The pin on the f6-knight is fake: if [6.Nxd5??], [6...Nxd5!] and the [7...Bb4+] check wins the queen back. You lose a piece.',
      },
    },
  ],

  puzzles: [],

  camps: [
    {
      id: 'base',
      name: { es: 'Campamento base', en: 'Base camp' },
      title: { es: 'Un Dragón al revés', en: 'A Reversed Dragon' },
      stages: [
        {
          id: 'ideas',
          type: 'ideas',
          title: { es: 'Ideas y planes', en: 'Ideas and plans' },
          subtitle: { es: 'La gran diagonal y b4-b5', en: 'The long diagonal and b4-b5' },
          intro: {
            es: 'Por qué 1.c4 es una Siciliana con un tiempo de más, el alfil de g2 y el plan en el flanco de dama.',
            en: 'Why 1.c4 is a Sicilian with an extra tempo, the g2-bishop and the queenside plan.',
          },
          slides: [
            {
              title: { es: 'Una Siciliana con un tiempo de más', en: 'A Sicilian with an extra tempo' },
              text: {
                es: 'Tras [1...e5] tienes una Siciliana con los colores cambiados: tu peón de c lucha por d5 igual que el ...c5 negro lucha por d4. La diferencia es que tú juegas primero: tienes un tiempo de más para tus planes.',
                en: 'After [1...e5] you have a Sicilian with colours reversed: your c-pawn fights for d5 just as Black’s ...c5 fights for d4. The difference is that you move first: you have an extra tempo for your plans.',
              },
              moves: '1.c4 e5',
              arrows: ['c4d5'],
              marks: ['d5'],
            },
            {
              title: { es: 'Controlar d5 desde el flanco', en: 'Controlling d5 from the wing' },
              text: {
                es: 'No necesitas un peón en d4 o e4 para mandar en el centro. El peón de c4, el caballo de c3 y pronto el alfil de g2 apuntan a d5. Si el negro ocupa d5, cambias con [cxd5] y su caballo queda expuesto en el centro.',
                en: 'You do not need a pawn on d4 or e4 to control the centre. The c4-pawn, the c3-knight and soon the g2-bishop all aim at d5. If Black occupies d5, you exchange with [cxd5] and his knight is left exposed in the centre.',
              },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5',
              arrows: ['c4d5', 'c3d5'],
              marks: ['d5'],
            },
            {
              title: { es: 'La gran diagonal', en: 'The long diagonal' },
              text: {
                es: 'El alfil de g2 es el alma del repertorio. Desde la gran diagonal presiona d5, c6 y b7, protege a tu rey y defiende e4. Muchas de tus jugadas buscan abrirle el camino: por eso el caballo de f3 salta a menudo a d4, d2 o e1.',
                en: 'The g2-bishop is the soul of the repertoire. From the long diagonal it presses on d5, c6 and b7, shields your king and defends e4. Many of your moves aim to clear its path: that is why the f3-knight often jumps to d4, d2 or e1.',
              },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2',
              arrows: ['g2b7'],
              marks: ['d5', 'c6', 'b7'],
            },
            {
              title: { es: 'Un Dragón al revés', en: 'A Reversed Dragon' },
              text: {
                es: 'Compara con la Siciliana Dragón: allí el negro tiene el alfil en g7 y ataca por la columna c. Aquí eres tú quien tiene el alfil en g2 y la columna c semiabierta, con c7 como objetivo. El negro juega como el blanco de una Siciliana Abierta, pero con un tiempo menos. Tu juego está en el flanco de dama.',
                en: 'Compare with the Sicilian Dragon: there Black has the bishop on g7 and attacks down the c-file. Here it is you who has the bishop on g2 and the half-open c-file, with c7 as a target. Black plays like White in an Open Sicilian, but a tempo down. Your play is on the queenside.',
              },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O',
              arrows: ['g2b7'],
              marks: ['c7'],
            },
            {
              title: { es: 'El plan a3, b4 y b5', en: 'The a3, b4 and b5 plan' },
              text: {
                es: 'El plan clásico: a3 prepara b4, y b4-b5 echa al caballo de c6, que defiende e5 y vigila d4. Sin ese caballo, el centro negro se debilita y tus piezas entran por a4, c5 y la columna c. [Rb1] cumple la misma función que a3.',
                en: 'The classic plan: a3 prepares b4, and b4-b5 kicks the c6-knight, which defends e5 and watches d4. Without that knight, Black’s centre weakens and your pieces come in via a4, c5 and the c-file. [Rb1] does the same job as a3.',
              },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 Be6 10.b4',
              arrows: ['b4b5'],
              marks: ['c6', 'e5'],
            },
            {
              title: { es: 'Después de b5: presión, no prisa', en: 'After b5: pressure, not haste' },
              text: {
                es: 'Tras b5 llegan los golpes: [Bb2] contra d4 y e5, el cambio [Nxd4] para abrir la diagonal del alfil de g2 y los saltos [Na4] o [Ne4] hacia c5. Con [Rc1] y [Qc2] presionas c7. No tengas prisa: es un juego de presión lenta.',
                en: 'After b5 the blows come: [Bb2] against d4 and e5, the [Nxd4] exchange to open the g2-bishop’s diagonal, and the [Na4] or [Ne4] jumps towards c5. With [Rc1] and [Qc2] you press c7. No hurry: it is a game of slow pressure.',
              },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 Be6 10.b4 a5 11.b5 Nd4 12.Bb2 f6 13.Nxd4 exd4 14.Na4',
              arrows: ['a4c5', 'b2d4'],
              marks: ['c7', 'd4'],
            },
            {
              title: { es: 'Cómo transponer', en: 'How to transpose' },
              text: {
                es: 'Tu repertorio se mide por posiciones, no por órdenes de jugadas. Con [1...Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 e5] llegas exactamente a la línea principal, y con [1...Nf6 2.Nc3 e5] también. Juega siempre la misma jugada en la misma posición: [Nc3], g3 y [Bg2] casi contra todo.',
                en: 'Your repertoire is measured by positions, not by move orders. With [1...Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 e5] you reach exactly the main line, and with [1...Nf6 2.Nc3 e5] too. Always play the same move in the same position: [Nc3], g3 and [Bg2] against almost everything.',
              },
              moves: '1.c4 Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 e5',
              marks: ['d5'],
            },
          ],
          quiz: [
            {
              kind: 'move',
              question: { es: 'El negro acaba de recapturar en d5. ¿Qué pieza pones en la gran diagonal?', en: 'Black has just recaptured on d5. Which piece do you put on the long diagonal?' },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5',
              answers: ['Bg2'],
              explanation: {
                es: '[5.Bg2]: el alfil presiona d5 y, detrás, b7. Es la pieza clave de todo el repertorio.',
                en: '[5.Bg2]: the bishop presses on d5 and, behind it, on b7. It is the key piece of the whole repertoire.',
              },
            },
            {
              kind: 'choice',
              question: { es: '¿Por qué juegas 9.a3 antes de b4?', en: 'Why do you play 9.a3 before b4?' },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O',
              options: [
                { es: 'Para que b4 no se pierda: el caballo de c6 y el alfil de e7 atacan esa casilla', en: 'So that b4 is not lost: the c6-knight and the e7-bishop attack that square' },
                { es: 'Para sacar la torre por a2', en: 'To bring the rook out via a2' },
                { es: 'Para impedir [...Bg4]', en: 'To prevent [...Bg4]' },
              ],
              correct: 0,
              explanation: {
                es: 'Con [9.b4?] el negro toma en b4 y gana un peón. Con a3 (o [Rb1]) el peón queda defendido y b4-b5 se convierte en una amenaza seria.',
                en: 'After [9.b4?] Black takes on b4 and wins a pawn. With a3 (or [Rb1]) the pawn is protected and b4-b5 becomes a real threat.',
              },
            },
            {
              kind: 'move',
              question: { es: 'Sigue con tu plan en el flanco de dama.', en: 'Carry on with your queenside plan.' },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 Be6',
              answers: ['b4'],
              explanation: {
                es: '[10.b4] gana espacio y prepara b5 para echar al caballo de c6.',
                en: '[10.b4] gains space and prepares b5 to kick the c6-knight.',
              },
            },
            {
              kind: 'move',
              question: { es: 'El negro ha jugado 10...a5. ¿Cómo sigues?', en: 'Black has played 10...a5. How do you continue?' },
              moves: '1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Nb6 6.Nf3 Nc6 7.O-O Be7 8.d3 O-O 9.a3 Be6 10.b4 a5',
              answers: ['b5'],
              explanation: {
                es: '[11.b5] echa al caballo de c6: e5 pierde su defensor y lo normal es que el caballo salte a d4.',
                en: '[11.b5] kicks the c6-knight: e5 loses its defender, and the knight usually jumps to d4.',
              },
            },
            {
              kind: 'choice',
              question: { es: 'Llegas a esta posición con [1...Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 e5]. ¿Qué es?', en: 'You reach this position via [1...Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 e5]. What is it?' },
              moves: '1.c4 Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.g3 e5',
              options: [
                { es: 'La línea principal (Dragón al revés) por otro orden de jugadas', en: 'The main line (Reversed Dragon) by a different move order' },
                { es: 'Una Grünfeld en la que hay que jugar d4', en: 'A Grünfeld in which you must play d4' },
                { es: 'Una posición nueva que hay que estudiar aparte', en: 'A new position that needs separate study' },
              ],
              correct: 0,
              explanation: {
                es: 'Es la misma posición que tras [1...e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5]: juega [5.Bg2] y sigue con tu plan.',
                en: 'It is the same position as after [1...e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5]: play [5.Bg2] and carry on with your plan.',
              },
            },
          ],
        },
        {
          id: 'main-line',
          type: 'line',
          title: { es: 'Línea principal', en: 'Main line' },
          subtitle: { es: 'Dragón al revés · 9.a3 y 10.b4', en: 'Reversed Dragon · 9.a3 and 10.b4' },
          intro: {
            es: 'La línea más importante del repertorio, jugada a jugada y con el porqué de cada movimiento.',
            en: 'The most important line of the repertoire, move by move, with the reason behind each one.',
          },
          lines: ['eng-main'],
        },
        {
          id: 'main-practice',
          type: 'practice',
          title: { es: 'Practica la línea', en: 'Practise the line' },
          subtitle: { es: 'Juegas tú las blancas', en: 'You play White' },
          intro: {
            es: 'Juegas tú con blancas el Dragón al revés. Si fallas, te enseñamos la jugada y la repetirás más adelante.',
            en: 'You play the Reversed Dragon as White. If you slip, we show you the move and you will repeat it later.',
          },
          lines: ['eng-main'],
        },
      ],
    },
    {
      id: 'camp1',
      name: { es: 'Campamento 1', en: 'Camp 1' },
      title: { es: 'Las respuestas negras', en: 'Black’s replies' },
      stages: [
        {
          id: 'vs-e5',
          type: 'branch',
          title: { es: 'Otras ideas contra 1...e5', en: 'Other ideas against 1...e5' },
          subtitle: { es: '3...Ab4, la Cerrada y 9...a5', en: '3...Bb4, the Closed and 9...a5' },
          intro: {
            es: 'No todos los rivales irán al Dragón al revés. Aprende qué hacer contra la clavada en c3, contra el fianchetto negro y cuando el negro frena tu b4.',
            en: 'Not every opponent will enter the Reversed Dragon. Learn what to do against the pin on c3, against Black’s fianchetto and when Black stops your b4.',
          },
          lines: ['eng-bb4', 'eng-closed', 'eng-a5'],
        },
        {
          id: 'symmetrical',
          type: 'branch',
          title: { es: 'La Simétrica: 1...c5', en: 'The Symmetrical: 1...c5' },
          subtitle: { es: 'd4, Rubinstein y el Botvinnik del negro', en: 'd4, the Rubinstein and Black’s Botvinnik' },
          intro: {
            es: 'El negro copia tu primera jugada. Tu esquema no cambia, pero el plan depende de dónde ponga el negro sus peones.',
            en: 'Black copies your first move. Your set-up does not change, but the plan depends on where Black puts his pawns.',
          },
          lines: ['eng-sym', 'eng-rubinstein', 'eng-sym-e5'],
        },
        {
          id: 'anglo-indian',
          type: 'branch',
          title: { es: 'Contra 1...Cf6', en: 'Against 1...Nf6' },
          subtitle: { es: 'India de Rey y Anglo-Grünfeld', en: 'King’s Indian and Anglo-Grünfeld' },
          intro: {
            es: 'Contra los esquemas indios no hace falta jugar d4: el esquema Botvinnik y el alfil de g2 bastan.',
            en: 'Against the Indian set-ups you do not need d4: the Botvinnik set-up and the g2-bishop are enough.',
          },
          lines: ['eng-kid', 'eng-grunfeld'],
        },
        {
          id: 'carlsbad',
          type: 'branch',
          title: { es: '1...e6 y la estructura Carlsbad', en: '1...e6 and the Carlsbad structure' },
          subtitle: { es: 'El ataque de minorías', en: 'The minority attack' },
          intro: {
            es: 'Contra ...e6 y ...d5 cambias de estructura: cxd5 y d4. Dos órdenes de jugadas, un mismo plan: b4-b5.',
            en: 'Against ...e6 and ...d5 you change the structure: cxd5 and d4. Two move orders, one plan: b4-b5.',
          },
          lines: ['eng-carlsbad', 'eng-nf6-e6'],
        },
      ],
    },
    {
      id: 'summit',
      name: { es: 'Cumbre', en: 'Summit' },
      title: { es: 'Planes y examen', en: 'Plans and exam' },
      stages: [
        {
          id: 'traps',
          type: 'trap',
          title: { es: 'Trampas', en: 'Traps' },
          subtitle: { es: 'La gran diagonal y los errores típicos', en: 'The long diagonal and typical mistakes' },
          intro: {
            es: 'Dos trampas en las que cae el negro cuando olvida tus alfiles y dos errores que tú no debes cometer.',
            en: 'Two traps Black falls into when he forgets about your bishops, and two mistakes you must not make.',
          },
          lines: ['eng-trap-bd5', 'eng-trap-e4', 'eng-err-b4', 'eng-err-elephant'],
        },
        {
          id: 'puzzles',
          type: 'puzzles',
          title: { es: 'Puzzles', en: 'Puzzles' },
          subtitle: { es: 'Táctica de la Inglesa', en: 'English Opening tactics' },
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
          lines: ['eng-main', 'eng-bb4', 'eng-closed', 'eng-a5', 'eng-sym', 'eng-rubinstein', 'eng-sym-e5', 'eng-kid', 'eng-grunfeld', 'eng-carlsbad', 'eng-nf6-e6', 'eng-trap-bd5', 'eng-trap-e4'],
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
          lines: ['eng-main', 'eng-bb4', 'eng-closed', 'eng-a5', 'eng-sym', 'eng-rubinstein', 'eng-sym-e5', 'eng-kid', 'eng-grunfeld', 'eng-carlsbad', 'eng-nf6-e6', 'eng-trap-bd5', 'eng-trap-e4'],
          puzzles: [],
          passScore: 0.8,
        },
      ],
    },
  ],
};
