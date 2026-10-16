import type { Course } from '../types';

// Siciliana Dragón: repertorio para negras contra 1.e4.
// Orden del repertorio: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6.
// Contra el Ataque Yugoslavo con 9.Bc4, la línea principal es la Variante Topalov
// (11...Nxd4 y 12...b5), que evita las líneas críticas de 11...Ne5 12.Kb1. La Soltis
// (...h5 contra h4) llega por transposición con 10.h4 h5.
// Todas las líneas se han revisado con Stockfish (scripts/audit-content.ts, profundidad 16).

const DRAGON = '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6';
const YUGO = `${DRAGON} 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6`;
const TOPALOV = `${YUGO} 9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Nxd4 12.Bxd4 b5`;
const SOLTIS = `${YUGO} 9.Bc4 Bd7 10.h4 h5 11.O-O-O Ne5 12.Bb3 Rc8`;
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
  history: {
    es: 'El nombre lo puso el maestro ruso Fiódor Dus-Chotimirsky, astrónomo aficionado: contaba que en 1901 vio en los peones negros de d6, e7, f7, g6 y h7 la silueta de la constelación del Dragón. La forma moderna de la apertura se remonta a Louis Paulsen, hacia 1880. Su gran rival es el Ataque Yugoslavo ([Be3], f3, [Qd2] y enroque largo), que antes se llamaba Ataque Rauzer y tomó su nombre de los jugadores yugoslavos que lo analizaron a fondo. Fischer lo convirtió en un arma temible: al comentar su victoria contra Larsen en el Interzonal de Portoroz 1958 resumió el plan blanco en una frase famosa, abrir la columna h, sacrificar, sacrificar… y mate. Pero el Dragón sobrevivió: Kasparov lo sacó por sorpresa en el Mundial de 1995 contra Anand y ganó con él las partidas 11 y 13, y hoy lo defienden especialistas como el gran maestro inglés Gawain Jones.',
    en: 'The name was coined by the Russian master Fyodor Dus-Chotimirsky, an amateur astronomer: he said that in 1901 he saw in Black’s pawns on d6, e7, f7, g6 and h7 the outline of the constellation Draco, the Dragon. The modern form of the opening goes back to Louis Paulsen, around 1880. Its great rival is the Yugoslav Attack ([Be3], f3, [Qd2] and long castling), once called the Rauzer Attack, which took its name from the Yugoslav players who analysed it in depth. Fischer turned it into a fearsome weapon: annotating his win against Larsen at the 1958 Portorož Interzonal, he summed up White’s plan in a famous phrase: pry open the h-file, sac, sac… mate. But the Dragon survived: Kasparov used it as a surprise weapon in the 1995 World Championship against Anand and won games 11 and 13 with it, and today specialists such as the English grandmaster Gawain Jones defend it.',
  },
  references: [
    {
      kind: 'book',
      title: 'The Dragon · Volume One & Volume Two',
      author: 'Gawain Jones',
      year: 2015,
      note: {
        es: 'El repertorio moderno de referencia (Quality Chess). Contra el Yugoslavo se apoya en las variantes Topalov y Soltis, las mismas de este curso.',
        en: 'The modern reference repertoire (Quality Chess). Against the Yugoslav it relies on the Topalov and Soltis variations, the same ones as this course.',
      },
    },
    {
      kind: 'book',
      title: 'Winning with the Dragon',
      author: 'Chris Ward',
      year: 1994,
      note: {
        es: 'Un clásico de un gran especialista inglés: prefiere entender los planes a memorizar jugadas.',
        en: 'A classic by a great English specialist: it favours understanding the plans over memorising moves.',
      },
    },
    {
      kind: 'book',
      title: 'My 60 Memorable Games',
      author: 'Bobby Fischer',
      year: 1969,
      note: {
        es: 'Incluye su victoria contra Larsen con el Ataque Yugoslavo: conoce bien el plan de tu rival.',
        en: 'Includes his win against Larsen with the Yugoslav Attack: know your opponent’s plan well.',
      },
    },
    {
      kind: 'game',
      title: 'Fischer – Larsen, Portoroz 1958',
      year: 1958,
      note: {
        es: 'El Ataque Yugoslavo en su versión más famosa: columna h abierta, sacrificios y mate. Así ataca el blanco.',
        en: 'The Yugoslav Attack at its most famous: open h-file, sacrifices and mate. This is how White attacks.',
      },
    },
    {
      kind: 'game',
      title: 'Anand – Kasparov, Nueva York 1995',
      year: 1995,
      note: {
        es: 'Partida 11 del Mundial PCA: Kasparov estrena el Dragón y gana con negras. Un ejemplo de contraataque en el momento justo.',
        en: 'Game 11 of the PCA World Championship: Kasparov unveils the Dragon and wins with Black. Counter-attack at the right moment.',
      },
    },
    {
      kind: 'player',
      title: 'Gawain Jones',
      note: { es: 'El gran especialista actual del Dragón: sus partidas son un manual de la versión moderna.', en: 'Today’s leading Dragon specialist: his games are a manual of the modern version.' },
    },
    {
      kind: 'player',
      title: 'Veselin Topalov',
      note: { es: 'La variante de la línea principal lleva su nombre: [...Nxd4] y ...b5 contra el Yugoslavo.', en: 'The main-line variation bears his name: [...Nxd4] and ...b5 against the Yugoslav.' },
    },
  ],

  lines: [
    {
      id: 'drag-main',
      name: { es: 'Yugoslavo · Variante Topalov', en: 'Yugoslav · Topalov Variation' },
      moves: `${TOPALOV} 13.Nd5 Nxd5 14.Bxg7 Kxg7 15.exd5 a5 16.a3 Kg8 17.h4 b4`,
      notes: {
        '1...c5': {
          text: {
            es: 'La Siciliana: controlas d4 desde un lado y desequilibras la partida desde la primera jugada.',
            en: 'The Sicilian: you control d4 from the side and unbalance the game from move one.',
          },
          arrows: ['c5d4'],
        },
        '2...d6': {
          text: {
            es: 'Controlas e5 y preparas ...[Nf6] sin miedo a [e5]. También abres camino al alfil de c8.',
            en: 'You control e5 and prepare ...[Nf6] without fearing [e5]. You also open the way for the c8-bishop.',
          },
          arrows: ['d6e5'],
        },
        '3...cxd4': {
          text: {
            es: 'Cambias un peón de flanco por uno central. Te quedas con dos peones centrales (d6 y e7) contra uno, y con la columna c semiabierta.',
            en: 'You trade a wing pawn for a central one. You keep two central pawns (d6 and e7) against one, plus the half-open c-file.',
          },
        },
        '4...Nf6': {
          text: {
            es: 'Atacas e4 y obligas al blanco a defenderlo, casi siempre con [5.Nc3].',
            en: 'You attack e4 and force White to defend it, almost always with [5.Nc3].',
          },
          arrows: ['f6e4'],
        },
        '5...g6': {
          text: {
            es: '¡El Dragón! Preparas el fianchetto del alfil en g7. Fíjate en tus peones d6, e7, f7, g6 y h7: su forma recordó a la constelación del Dragón.',
            en: 'The Dragon! You prepare to fianchetto the bishop on g7. Look at your pawns on d6, e7, f7, g6 and h7: their shape recalled the constellation Draco.',
          },
          arrows: ['f8g7'],
          marks: ['d6', 'e7', 'f7', 'g6', 'h7'],
        },
        '6.Be3': {
          text: {
            es: 'Empieza el Ataque Yugoslavo: [Be3], [f3], [Qd2], enroque largo y después [h4], [g4] y [Bh6] para cambiar tu alfil de g7.',
            en: 'The Yugoslav Attack begins: [Be3], [f3], [Qd2], long castling and then [h4], [g4] and [Bh6] to trade off your g7-bishop.',
          },
          rival: ['f2f3', 'd1d2'],
        },
        '6...Bg7': {
          text: {
            es: 'El alma del Dragón: el alfil en la gran diagonal mira a d4 y, más allá, a b2, donde vivirá el rey blanco.',
            en: 'The soul of the Dragon: the bishop on the long diagonal eyes d4 and, beyond it, b2, where the white king will live.',
          },
          arrows: ['g7d4'],
        },
        '7.f3': {
          text: {
            es: 'El peón defiende e4 y, sobre todo, quita la casilla g4 a tu caballo: así ...[Ng4] ya no molesta al alfil de e3. Además prepara [g4].',
            en: 'The pawn defends e4 and, above all, takes the g4-square away from your knight, so ...[Ng4] no longer bothers the e3-bishop. It also prepares [g4].',
          },
          marks: ['g4'],
        },
        '7...O-O': {
          text: {
            es: 'Primero, el rey a salvo. El blanco enrocará largo: los reyes estarán en flancos opuestos.',
            en: 'King safety first. White will castle long: the kings will be on opposite wings.',
          },
        },
        '8.Qd2': {
          text: {
            es: 'La dama prepara el enroque largo y la maniobra [Bh6], que cambia tu mejor defensor.',
            en: 'The queen prepares long castling and the [Bh6] manoeuvre, which removes your best defender.',
          },
          rival: ['e3h6'],
        },
        '8...Nc6': {
          text: {
            es: 'Desarrollas y presionas d4. Tu caballo puede ir a e5 y c4, o cambiarse en d4.',
            en: 'You develop and pressure d4. Your knight can go to e5 and c4, or be traded on d4.',
          },
          arrows: ['c6d4'],
        },
        '9.Bc4': {
          text: {
            es: 'El alfil vigila d5 para impedir tu gran liberación, ...[d5], y apunta a tu rey por la diagonal a2-g8.',
            en: 'The bishop watches d5 to stop your great liberating break, ...[d5], and aims at your king along the a2-g8 diagonal.',
          },
          rival: ['c4f7'],
          marks: ['d5'],
        },
        '9...Bd7': {
          text: {
            es: 'Desarrollas el alfil y conectas las torres: la de a8 irá a c8, a la columna semiabierta.',
            en: 'You develop the bishop and connect the rooks: the a8-rook goes to c8, on the half-open file.',
          },
          arrows: ['a8c8'],
        },
        '10.O-O-O': {
          text: {
            es: 'Enroques opuestos: empieza la carrera. El blanco atacará con [h4]-[h5]; tú, por el flanco de dama.',
            en: 'Opposite castling: the race begins. White will attack with [h4]-[h5]; you, on the queenside.',
          },
          rival: ['h2h4', 'h4h5'],
        },
        '10...Rc8': {
          text: {
            es: 'La torre ocupa la columna c, detrás de tu caballo. Si el caballo se va con ...[Nxd4], la torre atacará al alfil de c4: esa es la amenaza, ...[Nxd4] y ...[Rxc4].',
            en: 'The rook takes the c-file, behind your knight. If the knight leaves with ...[Nxd4], the rook will hit the c4-bishop: that is the threat, ...[Nxd4] and ...[Rxc4].',
          },
          arrows: ['c8c4'],
        },
        '11.Bb3': {
          text: {
            es: 'El alfil se aparta a b3, donde sigue en la diagonal de tu rey.',
            en: 'The bishop steps back to b3, where it stays on your king’s diagonal.',
          },
        },
        '11...Nxd4': {
          text: {
            es: 'La Variante Topalov. Cambias el caballo central del blanco. Tras [12.Bxd4], su alfil queda en d4, enfrente del tuyo, y llega ...[b5]. Así evitas las líneas más críticas de [11...Ne5 12.Kb1].',
            en: 'The Topalov Variation. You trade White’s central knight. After [12.Bxd4] his bishop stands on d4, facing yours, and ...[b5] follows. This sidesteps the most critical lines of [11...Ne5 12.Kb1].',
          },
        },
        '12...b5': {
          text: {
            es: 'El peón b se lanza contra el rey blanco: ...[b4] echará al caballo de c3, que defiende e4 y d5. No se puede tomar: si [13.Nxb5?], [13...Bxb5] gana una pieza.',
            en: 'The b-pawn charges at the white king: ...[b4] will kick the c3-knight, which defends e4 and d5. It cannot be taken: if [13.Nxb5?], [13...Bxb5] wins a piece.',
          },
          arrows: ['b5b4'],
        },
        '13.Nd5': {
          text: {
            es: 'El blanco cambia caballos en d5 y después los alfiles de casillas negras. Así ...[b4] ya no encuentra caballo en c3.',
            en: 'White trades knights on d5 and then the dark-squared bishops. That way ...[b4] no longer finds a knight on c3.',
          },
          rival: ['d4g7'],
        },
        '13...Nxd5': {
          text: { es: 'Cambias. Menos piezas blancas significa menos ataque contra tu rey.', en: 'You trade. Fewer white pieces means less attack against your king.' },
        },
        '14...Kxg7': {
          text: {
            es: 'Tu alfil del Dragón ha desaparecido, pero el blanco también ha cambiado sus piezas de ataque.',
            en: 'Your Dragon bishop is gone, but White has also traded his attacking pieces.',
          },
        },
        '15.exd5': {
          text: {
            es: 'Nueva estructura: el blanco tiene un peón en d5 y atacará con [h4]-[h5]. Tú lanzarás tus peones a y b contra su enroque para abrir columnas.',
            en: 'New structure: White has a pawn on d5 and will attack with [h4]-[h5]. You will throw your a- and b-pawns at his king to open files.',
          },
          rival: ['h2h4', 'h4h5'],
        },
        '15...a5': {
          text: {
            es: 'Preparas ...[b4] con el apoyo del peón a. Tus peones abrirán líneas contra el rey blanco.',
            en: 'You prepare ...[b4] with the a-pawn’s support. Your pawns will open lines against the white king.',
          },
          arrows: ['b5b4', 'a5a4'],
        },
        '16.a3': { text: { es: 'El blanco frena ...[b4]… por ahora.', en: 'White slows down ...[b4]… for now.' } },
        '16...Kg8': {
          text: {
            es: 'Sin el alfil de g7, el rey está mejor en g8: sale de la gran diagonal, donde [Qd4+] sería un jaque molesto.',
            en: 'Without the g7-bishop the king is better on g8: it leaves the long diagonal, where [Qd4+] would be an annoying check.',
          },
        },
        '17.h4': { text: { es: 'El ataque blanco: [h5] y abrir la columna h.', en: 'White’s attack: [h5] and open the h-file.' }, rival: ['h4h5'] },
        '17...b4': {
          text: {
            es: '¡Golpe en el flanco! Si [18.axb4 axb4], la columna a se abre contra el rey blanco y tu peón de b4 lo incomoda. La posición está equilibrada y llena de vida.',
            en: 'Strike on the wing! If [18.axb4 axb4], the a-file opens against the white king and your b4-pawn harasses it. The position is balanced and full of life.',
          },
          arrows: ['b4a3'],
        },
      },
      summary: {
        es: 'Contra [9.Bc4]: ...[Bd7], ...[Rc8] y, cuando el alfil va a b3, ...[Nxd4] y ...[b5]. Si el blanco cambia los alfiles, tu rey vuelve a g8 y tus peones a y b abren líneas contra su rey.',
        en: 'Against [9.Bc4]: ...[Bd7], ...[Rc8] and, when the bishop goes to b3, ...[Nxd4] and ...[b5]. If White trades bishops, your king returns to g8 and your a- and b-pawns open lines against his king.',
      },
    },
    {
      id: 'drag-bxa7',
      name: { es: 'Topalov · 13.Axa7', en: 'Topalov · 13.Bxa7' },
      moves: `${TOPALOV} 13.Bxa7 b4 14.Nd5 Nxd5 15.exd5 Qa5 16.Qe3 Ba4 17.Bd4 Bxb3 18.Qxb3 Rc7`,
      notes: {
        '13.Bxa7': {
          text: {
            es: 'El blanco se come el peón de a7. Gana material, pero su alfil se va lejos del centro y te deja la columna a semiabierta.',
            en: 'White grabs the a7-pawn. He wins material, but his bishop wanders far from the centre and leaves you the half-open a-file.',
          },
        },
        '13...b4': {
          text: {
            es: '¡Fuera el caballo! Solo tiene dos casillas buenas, d5 y e2. En cualquier otra pierde material (lo verás en las trampas).',
            en: 'Kick the knight! It has only two good squares, d5 and e2. Anywhere else it loses material (you will see it in the traps).',
          },
          arrows: ['b4c3'],
          marks: ['d5', 'e2'],
        },
        '14.Nd5': { text: { es: 'La mejor: el caballo se cambia.', en: 'The best move: the knight gets traded.' } },
        '15...Qa5': {
          text: {
            es: 'La dama ataca el alfil de a7 y se suma al ataque por la columna a.',
            en: 'The queen hits the a7-bishop and joins the attack along the a-file.',
          },
          arrows: ['a5a7'],
        },
        '16.Qe3': { text: { es: 'La dama defiende el alfil por la diagonal e3-a7.', en: 'The queen defends the bishop along the e3-a7 diagonal.' }, rival: ['e3a7'] },
        '16...Ba4': {
          text: {
            es: 'Vas a cambiar el alfil de b3, el gran defensor del rey blanco. Sin él, las casillas blancas de su enroque quedan débiles.',
            en: 'You are going to trade the b3-bishop, the white king’s great defender. Without it, the light squares around his king become weak.',
          },
          arrows: ['a4b3'],
        },
        '17.Bd4': { text: { es: 'El alfil vuelve al centro para tapar tu gran diagonal.', en: 'The bishop returns to the centre to block your long diagonal.' }, rival: ['d4g7'] },
        '18...Rc7': {
          text: {
            es: 'La torre defiende e7 por la séptima fila y deja c8 para la otra torre: ...[Rfc8]. Tienes un peón menos, pero mucha actividad contra el rey blanco.',
            en: 'The rook defends e7 along the seventh rank and frees c8 for the other rook: ...[Rfc8]. You are a pawn down, but very active against the white king.',
          },
          arrows: ['f8c8'],
        },
      },
      summary: {
        es: 'Si el blanco come en a7, ...[b4] echa al caballo y abre líneas. La dama a a5 y el alfil a a4 para cambiar el alfil de b3: el rey blanco se queda sin defensores y tu actividad compensa el peón.',
        en: 'If White takes on a7, ...[b4] kicks the knight and opens lines. Queen to a5 and bishop to a4 to trade the b3-bishop: the white king loses its defenders and your activity makes up for the pawn.',
      },
    },
    {
      id: 'drag-soltis',
      name: { es: 'Variante Soltis · 10.h4 h5', en: 'Soltis Variation · 10.h4 h5' },
      moves: `${SOLTIS} 13.Bg5 Rc5 14.Kb1 b5 15.g4 a5 16.Bxf6 Bxf6 17.gxh5 a4`,
      notes: {
        '10.h4': {
          text: {
            es: 'El blanco empuja el peón h antes de enrocar: quiere [h5] cuanto antes para abrir la columna h.',
            en: 'White pushes the h-pawn before castling: he wants [h5] as soon as possible to open the h-file.',
          },
          rival: ['h4h5'],
        },
        '10...h5': {
          text: {
            es: '¡La idea Soltis! Frenas el peón blanco con el tuyo. Para abrir líneas, el blanco necesitará [g4], y eso le costará tiempo.',
            en: 'The Soltis idea! You stop the white pawn with your own. To open lines White will need [g4], and that costs him time.',
          },
          marks: ['h5'],
        },
        '11...Ne5': {
          text: {
            es: 'El caballo salta a e5 y ataca al alfil de c4. Desde e5 podrá ir a c4 o g4.',
            en: 'The knight jumps to e5 and hits the c4-bishop. From e5 it can go to c4 or g4.',
          },
          arrows: ['e5c4'],
        },
        '12...Rc8': {
          text: {
            es: 'Por otro orden de jugadas has llegado a la Variante Soltis, la de [12.h4 h5] tras [9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Ne5].',
            en: 'By a different move order you have reached the Soltis Variation, the one with [12.h4 h5] after [9.Bc4 Bd7 10.O-O-O Rc8 11.Bb3 Ne5].',
          },
        },
        '13.Bg5': {
          text: {
            es: 'El alfil ataca al caballo de f6, que defiende h5. El blanco prepara [Bxf6] y [g4] para romper tu muralla.',
            en: 'The bishop hits the f6-knight, which defends h5. White prepares [Bxf6] and [g4] to break your wall.',
          },
          rival: ['g5f6', 'g2g4'],
        },
        '13...Rc5': {
          text: {
            es: 'La torre en c5 es típica de la Soltis: apoya ...[b5] y, si el caballo se mueve, vigila la quinta fila. Y a veces ...[Rxc3] llega en el momento justo.',
            en: 'The rook on c5 is typical of the Soltis: it supports ...[b5] and, if the knight moves, watches the fifth rank. And sometimes ...[Rxc3] arrives at the right moment.',
          },
          arrows: ['b7b5'],
        },
        '14.Kb1': { text: { es: 'El rey se aparta de c1 por precaución.', en: 'The king steps away from c1 as a precaution.' } },
        '14...b5': {
          text: {
            es: 'Contraataque: ...[a5] y ...[a4] irán a por el alfil de b3.',
            en: 'Counter-attack: ...[a5] and ...[a4] will go after the b3-bishop.',
          },
          arrows: ['a7a5', 'a5a4'],
        },
        '15.g4': { text: { es: 'La ruptura blanca: [gxh5] abrirá la columna g.', en: 'White’s break: [gxh5] will open the g-file.' }, rival: ['g4h5'] },
        '15...a5': {
          text: {
            es: 'No pierdas tiempo defendiendo h5: en esta carrera, cada tempo cuenta. ...[a4] amenaza al alfil.',
            en: 'Do not waste time defending h5: in this race every tempo counts. ...[a4] threatens the bishop.',
          },
          arrows: ['a5a4'],
        },
        '16.Bxf6': { text: { es: 'El blanco elimina el caballo que defendía h5.', en: 'White removes the knight that defended h5.' } },
        '17.gxh5': { text: { es: 'Se abre la columna g. El blanco amenaza [hxg6].', en: 'The g-file opens. White threatens [hxg6].' }, rival: ['h5g6'] },
        '17...a4': {
          text: {
            es: 'Atacas el alfil de b3. Si [18.Bd5], [18...e6] lo echa de nuevo. Carrera pura: los dos reyes están en peligro.',
            en: 'You attack the b3-bishop. If [18.Bd5], [18...e6] kicks it again. A pure race: both kings are in danger.',
          },
          arrows: ['a4b3'],
        },
      },
      summary: {
        es: 'Contra [h4], ...[h5] frena el ataque: el blanco necesitará [g4] para abrir líneas. Mientras, tú ganas tiempo con ...[Rc5], ...[b5] y ...[a5]-[a4].',
        en: 'Against [h4], ...[h5] slows the attack: White will need [g4] to open lines. Meanwhile you gain time with ...[Rc5], ...[b5] and ...[a5]-[a4].',
      },
    },
    {
      id: 'drag-9ooo',
      name: { es: 'Yugoslavo · 9.0-0-0 d5 12.Ad4', en: 'Yugoslav · 9.O-O-O d5 12.Bd4' },
      moves: `${MODERN} 12.Bd4 Bxd4 13.Qxd4 Qb6 14.Na4 Qc7 15.Bc4 Rd8`,
      notes: {
        '9.O-O-O': {
          text: {
            es: 'El blanco enroca sin jugar [Bc4]. Ahora nadie vigila d5…',
            en: 'White castles without playing [Bc4]. Now nobody watches d5…',
          },
          marks: ['d5'],
        },
        '9...d5': {
          text: {
            es: '¡La gran liberación! Abres el centro mientras el rey blanco acaba de enrocar. Tus piezas cobran vida de inmediato.',
            en: 'The great liberation! You open the centre just as the white king has castled. Your pieces come to life at once.',
          },
          arrows: ['d5e4'],
        },
        '10...Nxd5': {
          text: {
            es: 'Recuperas el peón, y tus dos caballos presionan c3 y d4.',
            en: 'You regain the pawn, and your two knights pressure c3 and d4.',
          },
        },
        '11...bxc6': {
          text: {
            es: 'Tomas hacia el centro: el peón de c6 apoya d5 y la columna b se abre para tu torre, justo contra el rey blanco.',
            en: 'You capture towards the centre: the c6-pawn supports d5 and the b-file opens for your rook, right against the white king.',
          },
          arrows: ['a8b8'],
        },
        '12.Bd4': { text: { es: 'El blanco desafía a tu alfil de g7.', en: 'White challenges your g7-bishop.' }, rival: ['d4g7'] },
        '12...Bxd4': {
          text: {
            es: 'Cambias los alfiles: la dama blanca tendrá que tomar en d4 y ganarás tiempo con ...[Qb6].',
            en: 'You trade bishops: the white queen has to take on d4 and you gain time with ...[Qb6].',
          },
        },
        '13...Qb6': {
          text: {
            es: 'Ofreces cambiar damas. Si [14.Qxb6 axb6], el final está igualado y la columna a queda abierta para tu torre.',
            en: 'You offer a queen trade. If [14.Qxb6 axb6], the ending is equal and the a-file is open for your rook.',
          },
          arrows: ['b6d4'],
        },
        '14.Na4': { text: { es: 'El caballo ataca a tu dama y se dirige a c5.', en: 'The knight attacks your queen and heads for c5.' }, rival: ['a4c5'] },
        '14...Qc7': {
          text: {
            es: 'La dama se retira con una idea: desde c7 presiona h2 por la diagonal.',
            en: 'The queen retreats with a purpose: from c7 it pressures h2 along the diagonal.',
          },
          arrows: ['c7h2'],
        },
        '15.Bc4': { text: { es: 'El alfil presiona tu caballo de d5.', en: 'The bishop pressures your d5-knight.' }, rival: ['c4d5'] },
        '15...Rd8': {
          text: {
            es: 'La torre defiende el caballo y se coloca frente a la dama blanca: cualquier salto del caballo será un ataque a la descubierta. Tus piezas están activas y la posición, equilibrada.',
            en: 'The rook defends the knight and lines up against the white queen: any knight jump will be a discovered attack. Your pieces are active and the position is balanced.',
          },
          arrows: ['d8d4'],
        },
      },
      summary: {
        es: 'Si el blanco enroca sin [Bc4], ...[d5]! libera tu juego al instante. Tras los cambios en c6 y d4, tus piezas juegan contra su rey: columna b, dama en c7 y torre en d8.',
        en: 'If White castles without [Bc4], ...[d5]! frees your game at once. After the trades on c6 and d4 your pieces play against his king: b-file, queen on c7 and rook on d8.',
      },
    },
    {
      id: 'drag-9ooo-nxd5',
      name: { es: 'Yugoslavo · 9.0-0-0 d5 12.Cxd5', en: 'Yugoslav · 9.O-O-O d5 12.Nxd5' },
      moves: `${MODERN} 12.Nxd5 cxd5 13.Qxd5 Qc7 14.Qc5 Qb7 15.c3 Be6`,
      notes: {
        '12.Nxd5': {
          text: {
            es: 'El blanco va a por el peón de d5. Tras [12...cxd5 13.Qxd5] gana un peón… pero su dama se queda sola.',
            en: 'White goes for the d5-pawn. After [12...cxd5 13.Qxd5] he wins a pawn… but his queen is left alone.',
          },
        },
        '13.Qxd5': {
          text: {
            es: 'Un peón más para el blanco, pero las columnas b y c se abren delante de su rey y tu alfil de g7 apunta a b2.',
            en: 'A pawn up for White, but the b- and c-files open in front of his king and your g7-bishop aims at b2.',
          },
        },
        '13...Qc7': {
          text: {
            es: '¡Fuerte! Amenazas ...[Be6] con tiempo sobre la dama y ...[Rb8]. Si el blanco se come la torre con [14.Qxa8], responde [14...Bf5]: amenazas mate en c2 y el blanco tendrá que dar la dama por tus dos torres.',
            en: 'Strong! You threaten ...[Be6] with tempo on the queen, and ...[Rb8]. If White grabs the rook with [14.Qxa8], answer [14...Bf5]: you threaten mate on c2 and White will have to give up the queen for your two rooks.',
          },
          arrows: ['c8e6', 'a8b8'],
        },
        '14.Qc5': {
          text: {
            es: 'La mejor defensa: el blanco ofrece cambiar damas para apagar tu ataque.',
            en: 'The best defence: White offers a queen trade to put out your attack.',
          },
          rival: ['c5c7'],
        },
        '14...Qb7': {
          text: {
            es: '¡No cambies! Tras [14...Qxc5? 15.Bxc5] el blanco tendría un peón de más y una gran ventaja en el final. Desde b7, tu dama y tu alfil atacan b2 a la vez.',
            en: 'Do not trade! After [14...Qxc5? 15.Bxc5] White would be a pawn up with a big advantage in the ending. From b7 your queen and bishop hit b2 together.',
          },
          arrows: ['b7b2', 'g7b2'],
        },
        '15.c3': { text: { es: 'El blanco tapa la gran diagonal.', en: 'White blocks the long diagonal.' } },
        '15...Be6': {
          text: {
            es: 'Desarrollas atacando a2. Siguen ...[Rfc8] o ...[Rab8]: tienes compensación completa por el peón.',
            en: 'You develop with an attack on a2. Next come ...[Rfc8] or ...[Rab8]: you have full compensation for the pawn.',
          },
          arrows: ['e6a2'],
        },
      },
      summary: {
        es: 'Si el blanco gana el peón de d5, no te asustes: con ...[Qc7], ...[Qb7] y ...[Be6] atacas su rey por las columnas b y c y la gran diagonal. No cambies damas.',
        en: 'If White wins the d5-pawn, do not panic: with ...[Qc7], ...[Qb7] and ...[Be6] you attack his king along the b- and c-files and the long diagonal. Do not trade queens.',
      },
    },
    {
      id: 'drag-9g4',
      name: { es: 'Yugoslavo · 9.g4', en: 'Yugoslav · 9.g4' },
      moves: `${YUGO} 9.g4 Be6 10.Nxe6 fxe6 11.O-O-O Ne5 12.Be2 Qc8`,
      notes: {
        '9.g4': {
          text: {
            es: 'El blanco empuja el peón g de inmediato: quiere [g5] para echar a tu caballo de f6.',
            en: 'White pushes the g-pawn at once: he wants [g5] to kick your f6-knight.',
          },
          rival: ['g4g5'],
        },
        '9...Be6': {
          text: {
            es: 'Desarrollas el alfil, que mira a c4 y a2. Si el blanco lo cambia, ganarás la columna f.',
            en: 'You develop the bishop, which eyes c4 and a2. If White trades it, you will get the f-file.',
          },
        },
        '10.Nxe6': { text: { es: 'El blanco se lleva tu alfil: ahora tiene la pareja de alfiles.', en: 'White takes your bishop: now he has the bishop pair.' } },
        '10...fxe6': {
          text: {
            es: 'Tomas con el peón f: la columna f se abre para tu torre y el peón de e6 controla d5 y f5.',
            en: 'You take with the f-pawn: the f-file opens for your rook and the e6-pawn controls d5 and f5.',
          },
          marks: ['d5', 'f5'],
        },
        '11...Ne5': {
          text: {
            es: 'El caballo salta a e5: presiona f3 y amenaza ir a c4.',
            en: 'The knight jumps to e5: it pressures f3 and threatens to go to c4.',
          },
          arrows: ['e5c4', 'e5f3'],
        },
        '12.Be2': { text: { es: 'El alfil defiende f3 y vigila c4.', en: 'The bishop defends f3 and watches c4.' } },
        '12...Qc8': {
          text: {
            es: 'La dama se une a la columna c y apoya ...[Nc4], que atacaría b2 y e3. Tu caballo de e5 es fuerte y la posición está equilibrada.',
            en: 'The queen joins the c-file and supports ...[Nc4], which would hit b2 and e3. Your e5-knight is strong and the position is balanced.',
          },
          arrows: ['c8c3'],
        },
      },
      summary: {
        es: 'Contra [9.g4]: ...[Be6]. Si el blanco cambia en e6, la columna f se abre para tu torre y el peón de e6 vigila d5. Tu caballo va a e5 y c4, y tu dama presiona por la columna c.',
        en: 'Against [9.g4]: ...[Be6]. If White trades on e6, the f-file opens for your rook and the e6-pawn watches d5. Your knight goes to e5 and c4, and your queen presses on the c-file.',
      },
    },
    {
      id: 'drag-classical',
      name: { es: 'Variante Clásica · 6.Ae2', en: 'Classical Variation · 6.Be2' },
      moves: `${DRAGON} 6.Be2 Bg7 7.O-O O-O 8.Be3 Nc6 9.Nb3 Be6 10.f4 Qc8 11.h3 Rd8 12.Kh2 Bxb3 13.axb3 d5`,
      notes: {
        '6.Be2': {
          text: {
            es: 'La Variante Clásica: el blanco desarrolla con calma y enrocará corto. No habrá carrera de enroques opuestos.',
            en: 'The Classical Variation: White develops calmly and will castle short. There will be no opposite-castling race.',
          },
        },
        '8...Nc6': {
          text: {
            es: 'Si ahora [9.Qd2], [9...Ng4!] cambia el alfil de e3: sin un peón en f3, ese salto siempre está disponible.',
            en: 'If now [9.Qd2], [9...Ng4!] trades off the e3-bishop: with no pawn on f3, that jump is always available.',
          },
          arrows: ['f6g4'],
        },
        '9.Nb3': {
          text: {
            es: 'El caballo se retira para evitar cambios y vigilar c5 y d4.',
            en: 'The knight retreats to avoid exchanges and to watch c5 and d4.',
          },
        },
        '9...Be6': {
          text: {
            es: 'Desarrollas el alfil, que mira a c4 y b3. Tu plan es la ruptura central ...[d5].',
            en: 'You develop the bishop, which eyes c4 and b3. Your plan is the central break ...[d5].',
          },
          arrows: ['e6c4'],
        },
        '10.f4': { text: { es: 'El blanco gana espacio y amenaza [f5], que atacaría a tu alfil.', en: 'White gains space and threatens [f5], which would hit your bishop.' }, rival: ['f4f5'] },
        '10...Qc8': {
          text: {
            es: 'La dama deja d8 libre para la torre y prepara ...[Rd8] y ...[d5].',
            en: 'The queen vacates d8 for the rook and prepares ...[Rd8] and ...[d5].',
          },
          arrows: ['f8d8'],
        },
        '11.h3': { text: { es: 'Impide ...[Bg4] y ...[Ng4].', en: 'It prevents ...[Bg4] and ...[Ng4].' } },
        '11...Rd8': { text: { es: 'La torre apoya la ruptura ...[d5].', en: 'The rook supports the ...[d5] break.' }, arrows: ['d6d5'] },
        '12...Bxb3': {
          text: {
            es: 'Cambias el alfil antes de que [f5] lo eche y le dejas al blanco peones doblados en la columna b. Ahora ...[d5] llega con fuerza.',
            en: 'You trade the bishop before [f5] can kick it and leave White with doubled b-pawns. Now ...[d5] arrives with force.',
          },
        },
        '13...d5': {
          text: {
            es: '¡La ruptura! El centro se abre y tus piezas, bien colocadas en las columnas c y d, están listas. Si [14.e5?], [14...d4!] ataca a la vez el alfil de e3 y el caballo de c3.',
            en: 'The break! The centre opens and your pieces, well placed on the c- and d-files, are ready. If [14.e5?], [14...d4!] hits the e3-bishop and the c3-knight at the same time.',
          },
          arrows: ['d5e4'],
        },
      },
      summary: {
        es: 'Contra la Clásica no hay carrera: el blanco enroca corto y juega en el centro con [f4]. Tu receta: ...[Be6], ...[Qc8], ...[Rd8] y la ruptura ...[d5].',
        en: 'Against the Classical there is no race: White castles short and plays in the centre with [f4]. Your recipe: ...[Be6], ...[Qc8], ...[Rd8] and the ...[d5] break.',
      },
    },
    {
      id: 'drag-levenfish',
      name: { es: 'Variante Levenfish · 6.f4', en: 'Levenfish Variation · 6.f4' },
      moves: `${DRAGON} 6.f4 Nc6 7.Nxc6 bxc6 8.e5 Nd7 9.exd6 exd6 10.Qd4 Nf6 11.Bd3 Bg7 12.Qe3+ Be6 13.f5 gxf5 14.Bxf5 O-O`,
      notes: {
        '6.f4': {
          text: {
            es: 'La Levenfish: el blanco quiere [e5] cuanto antes para echar a tu caballo de f6.',
            en: 'The Levenfish: White wants [e5] as soon as possible to kick your f6-knight.',
          },
          rival: ['e4e5'],
        },
        '6...Nc6': {
          text: {
            es: '¡La buena! El caballo controla e5 y presiona d4. Con [6...Bg7?!] el blanco jugaría [7.e5!] (lo verás en las trampas).',
            en: 'The right move! The knight controls e5 and pressures d4. After [6...Bg7?!] White would play [7.e5!] (you will see it in the traps).',
          },
          arrows: ['c6e5'],
        },
        '7...bxc6': { text: { es: 'Tomas hacia el centro y abres la columna b.', en: 'You capture towards the centre and open the b-file.' } },
        '8.e5': { text: { es: 'El blanco insiste y ataca tu caballo.', en: 'White insists and attacks your knight.' }, rival: ['e5f6'] },
        '8...Nd7': {
          text: {
            es: 'El caballo se retira atacando e5. No [8...dxe5?]: tras [9.Qxd8+ Kxd8 10.fxe5] el final es mejor para el blanco.',
            en: 'The knight retreats while hitting e5. Not [8...dxe5?]: after [9.Qxd8+ Kxd8 10.fxe5] the ending favours White.',
          },
          arrows: ['d7e5'],
        },
        '9...exd6': { text: { es: 'El centro blanco ha desaparecido y la columna e está abierta.', en: 'White’s centre is gone and the e-file is open.' } },
        '10.Qd4': {
          text: {
            es: 'La dama ataca tu torre de h8 por la gran diagonal.',
            en: 'The queen attacks your h8-rook along the long diagonal.',
          },
          rival: ['d4h8'],
        },
        '10...Nf6': { text: { es: 'Tapas la diagonal y el caballo vuelve a su mejor casilla.', en: 'You block the diagonal and the knight returns to its best square.' } },
        '11...Bg7': { text: { es: 'Ahora sí, el alfil a la gran diagonal. Enseguida enrocas.', en: 'Now the bishop goes to the long diagonal. You will castle next.' } },
        '12...Be6': { text: { es: 'Tapas el jaque desarrollando una pieza.', en: 'You block the check while developing a piece.' } },
        '13.f5': { text: { es: 'El blanco ataca a tu alfil.', en: 'White attacks your bishop.' }, rival: ['f5e6'] },
        '13...gxf5': { text: { es: 'Tomas el peón en lugar de retirar el alfil: tras [14.Bxf5] el material está igualado y enrocas.', en: 'You take the pawn instead of retreating the bishop: after [14.Bxf5] material is level and you castle.' } },
        '14...O-O': {
          text: {
            es: 'Rey a salvo. Tu pareja de peones centrales c6-d6 y las columnas b y e te dan buen juego.',
            en: 'King safe. Your central c6-d6 pawns and the b- and e-files give you good play.',
          },
        },
      },
      summary: {
        es: 'Contra la Levenfish: [6...Nc6!], no [6...Bg7]. Tras [7.Nxc6 bxc6 8.e5 Nd7] deshaces el centro blanco; después ...[Nf6], ...[Bg7] y enroque.',
        en: 'Against the Levenfish: [6...Nc6!], not [6...Bg7]. After [7.Nxc6 bxc6 8.e5 Nd7] you dissolve White’s centre; then ...[Nf6], ...[Bg7] and castle.',
      },
    },
    {
      id: 'drag-fianchetto',
      name: { es: 'Fianchetto · 6.g3', en: 'Fianchetto · 6.g3' },
      moves: `${DRAGON} 6.g3 Nc6 7.Nde2 Bg7 8.Bg2 O-O 9.O-O Rb8 10.a4 a6 11.h3 b5 12.axb5 axb5`,
      notes: {
        '6.g3': {
          text: {
            es: 'El blanco también hace fianchetto: su alfil de g2 vigilará d5. Es un sistema tranquilo y posicional.',
            en: 'White fianchettoes too: his g2-bishop will watch d5. It is a quiet, positional system.',
          },
        },
        '6...Nc6': { text: { es: 'Desarrollas y presionas d4. El alfil irá a g7 enseguida.', en: 'You develop and pressure d4. The bishop goes to g7 next.' }, arrows: ['c6d4'] },
        '7.Nde2': { text: { es: 'El caballo se retira para evitar cambios.', en: 'The knight retreats to avoid exchanges.' } },
        '9...Rb8': {
          text: {
            es: 'Tu plan está en el flanco de dama: ...[b5] y ...[b4] para echar al caballo de c3.',
            en: 'Your plan is on the queenside: ...[b5] and ...[b4] to kick the c3-knight.',
          },
          arrows: ['b7b5'],
        },
        '10.a4': { text: { es: 'El blanco frena ...[b5].', en: 'White slows down ...[b5].' } },
        '10...a6': { text: { es: 'Preparas ...[b5] de todos modos.', en: 'You prepare ...[b5] anyway.' }, arrows: ['b7b5'] },
        '12...axb5': {
          text: {
            es: 'La columna a está abierta y tu peón b avanza: ...[b4] echará al caballo. Tienes un juego cómodo en el flanco de dama.',
            en: 'The a-file is open and your b-pawn advances: ...[b4] will kick the knight. You have comfortable queenside play.',
          },
          arrows: ['b5b4'],
        },
      },
      summary: {
        es: 'Contra el fianchetto no hay prisa: desarrollo, enroque y ...[Rb8], ...[a6], ...[b5]. Tu juego está en el flanco de dama.',
        en: 'Against the fianchetto there is no hurry: develop, castle and play ...[Rb8], ...[a6], ...[b5]. Your play is on the queenside.',
      },
    },
    {
      id: 'drag-alapin',
      name: { es: 'Alapin · 2.c3', en: 'Alapin · 2.c3' },
      moves: '1.e4 c5 2.c3 d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3 Bg4 6.Be2 e6 7.O-O Nc6 8.h3 Bh5 9.Be3 cxd4 10.cxd4 Be7 11.Nc3 Qd6',
      notes: {
        '2.c3': {
          text: {
            es: 'La Alapin: el blanco prepara [d4] para tomar después con el peón c. Así evita la Siciliana abierta y tu Dragón.',
            en: 'The Alapin: White prepares [d4] to recapture with the c-pawn. That way he avoids the Open Sicilian and your Dragon.',
          },
          rival: ['d2d4'],
        },
        '2...d5': {
          text: {
            es: 'Golpeas en el centro antes de que llegue [d4].',
            en: 'You strike in the centre before [d4] arrives.',
          },
          arrows: ['d5e4'],
        },
        '3...Qxd5': {
          text: {
            es: 'La dama está segura en d5: el peón de c3 le quita esa casilla al caballo blanco, así que [Nc3] no llega con tiempo.',
            en: 'The queen is safe on d5: the c3-pawn takes that square from the white knight, so [Nc3] cannot come with tempo.',
          },
        },
        '5...Bg4': {
          text: {
            es: 'Sacas el alfil antes de jugar ...[e6], para que no se quede encerrado detrás de tus peones.',
            en: 'You bring the bishop out before playing ...[e6], so it does not get locked in behind your pawns.',
          },
          arrows: ['g4f3'],
        },
        '6...e6': { text: { es: 'Ahora sí, ...[e6] abre el camino al alfil de f8.', en: 'Now ...[e6] opens the way for the f8-bishop.' } },
        '8...Bh5': { text: { es: 'El alfil sigue presionando al caballo de f3, el defensor de d4.', en: 'The bishop keeps pressing the f3-knight, the defender of d4.' } },
        '9...cxd4': {
          text: {
            es: 'Cambias para dejar al blanco con un peón aislado en d4.',
            en: 'You trade to leave White with an isolated pawn on d4.',
          },
        },
        '10.cxd4': { text: { es: 'El peón de d4 no tiene vecinos: será tu objetivo.', en: 'The d4-pawn has no neighbours: it will be your target.' }, marks: ['d4'] },
        '11.Nc3': { text: { es: 'El caballo ataca a tu dama.', en: 'The knight attacks your queen.' } },
        '11...Qd6': {
          text: {
            es: 'La dama se retira a una buena casilla. Después ...[O-O], ...[Rfd8] y presión sobre d4. La casilla d5, delante del peón aislado, es tuya.',
            en: 'The queen retreats to a good square. Then ...[O-O], ...[Rfd8] and pressure on d4. The d5-square, in front of the isolated pawn, is yours.',
          },
          marks: ['d5'],
        },
      },
      summary: {
        es: 'Contra la Alapin: ...[d5] de inmediato y desarrollo rápido con ...[Nf6], ...[Bg4], ...[e6] y ...[Nc6]. Tras ...[cxd4] el blanco tiene un peón aislado: bloquéalo en d5 y presiónalo.',
        en: 'Against the Alapin: ...[d5] at once and quick development with ...[Nf6], ...[Bg4], ...[e6] and ...[Nc6]. After ...[cxd4] White has an isolated pawn: blockade it on d5 and put pressure on it.',
      },
    },
    {
      id: 'drag-moscow',
      name: { es: 'Variante Moscú · 3.Ab5+', en: 'Moscow Variation · 3.Bb5+' },
      moves: '1.e4 c5 2.Nf3 d6 3.Bb5+ Bd7 4.Bxd7+ Qxd7 5.O-O Nc6 6.c3 Nf6 7.Re1 e6 8.d4 cxd4 9.cxd4 d5 10.e5 Ne4',
      notes: {
        '3.Bb5+': {
          text: {
            es: 'La Variante Moscú: el blanco evita la teoría de la Siciliana abierta, cambia alfiles y construirá un centro con [c3] y [d4].',
            en: 'The Moscow Variation: White avoids Open Sicilian theory, trades bishops and will build a centre with [c3] and [d4].',
          },
        },
        '3...Bd7': {
          text: {
            es: 'Tapas con el alfil y lo cambias: es el alfil que luego quedaría encerrado por tus peones.',
            en: 'You block with the bishop and trade it: it is the one that would later be hemmed in by your pawns.',
          },
        },
        '4...Qxd7': {
          text: {
            es: 'Tomas con la dama para que el caballo de b8 vaya a c6, su mejor casilla.',
            en: 'You take with the queen so that the b8-knight can go to c6, its best square.',
          },
        },
        '6.c3': { text: { es: 'El blanco prepara [d4].', en: 'White prepares [d4].' }, rival: ['d2d4'] },
        '7...e6': { text: { es: 'Preparas ...[d5]: golpearás en el centro.', en: 'You prepare ...[d5]: you will strike in the centre.' }, arrows: ['d6d5'] },
        '9...d5': {
          text: {
            es: '¡Golpe central! Es una estructura de Francesa, pero sin tu alfil malo: ya lo cambiaste en d7.',
            en: 'Central strike! It is a French-type structure, but without your bad bishop: you already traded it on d7.',
          },
          arrows: ['d5e4'],
        },
        '10...Ne4': {
          text: {
            es: 'El caballo se instala en e4, apoyado por d5. Después ...[Be7], ...[O-O] y la columna c para tus torres.',
            en: 'The knight settles on e4, supported by d5. Then ...[Be7], ...[O-O] and the c-file for your rooks.',
          },
          marks: ['e4'],
        },
      },
      summary: {
        es: 'Contra [3.Bb5+]: ...[Bd7], cambio de alfiles y ...[Qxd7]. Después ...[Nc6], ...[Nf6], ...[e6] y ...[d5]. El caballo en e4 y la columna c son tus bazas.',
        en: 'Against [3.Bb5+]: ...[Bd7], trade bishops and ...[Qxd7]. Then ...[Nc6], ...[Nf6], ...[e6] and ...[d5]. The knight on e4 and the c-file are your trumps.',
      },
    },
    {
      id: 'drag-closed',
      name: { es: 'Siciliana Cerrada · 2.Cc3 y 3.g3', en: 'Closed Sicilian · 2.Nc3 and 3.g3' },
      moves: '1.e4 c5 2.Nc3 d6 3.g3 Nc6 4.Bg2 g6 5.d3 Bg7 6.Be3 Rb8 7.Qd2 b5 8.Nge2 b4 9.Nd1 e5',
      notes: {
        '2...d6': {
          text: {
            es: 'Una jugada flexible: si el blanco sigue con [3.Nf3 Nf6 4.d4 cxd4 5.Nxd4 g6], ¡estás en el Dragón!',
            en: 'A flexible move: if White goes [3.Nf3 Nf6 4.d4 cxd4 5.Nxd4 g6], you are in the Dragon!',
          },
        },
        '3.g3': {
          text: {
            es: 'La Siciliana Cerrada: el blanco no juega [d4]. Prepara [Bg2], [d3] y, a menudo, un ataque en el flanco de rey con [f4].',
            en: 'The Closed Sicilian: White does not play [d4]. He prepares [Bg2], [d3] and often a kingside attack with [f4].',
          },
        },
        '5...Bg7': {
          text: { es: 'Fianchetto contra fianchetto. Tu alfil de g7 presiona por la gran diagonal.', en: 'Fianchetto against fianchetto. Your g7-bishop presses along the long diagonal.' },
          arrows: ['g7c3'],
        },
        '6.Be3': { text: { es: 'El blanco prepara [Qd2] y [Bh6] para cambiar tu alfil.', en: 'White prepares [Qd2] and [Bh6] to trade your bishop.' }, rival: ['e3h6'] },
        '6...Rb8': {
          text: {
            es: 'Tu plan está en el flanco de dama: ...[b5]-[b4] gana espacio y echa al caballo de c3.',
            en: 'Your plan is on the queenside: ...[b5]-[b4] gains space and kicks the c3-knight.',
          },
          arrows: ['b7b5'],
        },
        '8...b4': { text: { es: 'Fuera el caballo.', en: 'Out goes the knight.' }, arrows: ['b4c3'] },
        '9...e5': {
          text: {
            es: 'Ganas espacio en el centro y controlas d4 y f4: tu caballo podrá saltar a d4 y la ruptura blanca [f4] pierde fuerza.',
            en: 'You gain space in the centre and control d4 and f4: your knight can jump to d4 and White’s [f4] break loses power.',
          },
          marks: ['d4', 'f4'],
        },
      },
      summary: {
        es: 'Contra la Cerrada: fianchetto en g7 y juego en el flanco de dama con ...[Rb8], ...[b5] y ...[b4]. Y si el blanco cambia de idea con [3.Nf3] y [4.d4], llegas a tu Dragón.',
        en: 'Against the Closed: fianchetto on g7 and queenside play with ...[Rb8], ...[b5] and ...[b4]. And if White changes his mind with [3.Nf3] and [4.d4], you reach your Dragon.',
      },
    },
    {
      id: 'drag-grandprix',
      name: { es: 'Grand Prix · 2.Cc3 y 3.f4', en: 'Grand Prix · 2.Nc3 and 3.f4' },
      moves: '1.e4 c5 2.Nc3 d6 3.f4 Nc6 4.Nf3 g6 5.Bc4 Bg7 6.O-O e6 7.d3 Nge7 8.Qe1 O-O',
      notes: {
        '3.f4': {
          text: {
            es: 'El ataque Grand Prix: el blanco quiere [Nf3], [Bc4] o [Bb5], enroque y después [Qe1]-[Qh4] y [f5] contra tu rey.',
            en: 'The Grand Prix Attack: White wants [Nf3], [Bc4] or [Bb5], castling and then [Qe1]-[Qh4] and [f5] against your king.',
          },
          rival: ['f4f5'],
        },
        '4...g6': { text: { es: 'Tu fianchetto de siempre. Si [5.Bb5], [5...Bd7].', en: 'Your usual fianchetto. If [5.Bb5], [5...Bd7].' } },
        '5.Bc4': { text: { es: 'El alfil apunta a f7.', en: 'The bishop aims at f7.' }, rival: ['c4f7'] },
        '6...e6': {
          text: {
            es: 'Tapas la diagonal del alfil de c4 y preparas ...[Nge7] y ...[d5].',
            en: 'You block the c4-bishop’s diagonal and prepare ...[Nge7] and ...[d5].',
          },
        },
        '7...Nge7': {
          text: {
            es: 'El caballo va a e7: apoya ...[d5], no tapa a tu alfil de g7 y no puede ser atacado por [e5].',
            en: 'The knight goes to e7: it supports ...[d5], does not block your g7-bishop and cannot be hit by [e5].',
          },
          arrows: ['d6d5'],
        },
        '8.Qe1': { text: { es: 'La dama va camino de h4.', en: 'The queen is heading for h4.' }, rival: ['e1h4'] },
        '8...O-O': {
          text: {
            es: 'Rey a salvo. Ahora ...[d5] o ...[Nd4]: el mejor remedio contra un ataque en el flanco es jugar en el centro.',
            en: 'King safe. Now ...[d5] or ...[Nd4]: the best cure for a wing attack is play in the centre.',
          },
          arrows: ['d6d5'],
        },
      },
      summary: {
        es: 'Contra el Grand Prix: ...[Nc6], ...[g6], ...[Bg7] y, si el alfil va a c4, ...[e6] y ...[Nge7]. Prepara ...[d5]: un golpe en el centro es la mejor defensa.',
        en: 'Against the Grand Prix: ...[Nc6], ...[g6], ...[Bg7] and, if the bishop goes to c4, ...[e6] and ...[Nge7]. Prepare ...[d5]: a central strike is the best defence.',
      },
    },
    {
      id: 'drag-morra',
      name: { es: 'Gambito Smith-Morra · 2.d4 cxd4 3.c3', en: 'Smith-Morra Gambit · 2.d4 cxd4 3.c3' },
      moves: '1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O Nf6 8.Qe2 Be7 9.Rd1 e5 10.h3 O-O 11.Be3 Be6',
      notes: {
        '3.c3': {
          text: {
            es: 'El Smith-Morra: el blanco ofrece un peón a cambio de desarrollo rápido y columnas abiertas.',
            en: 'The Smith-Morra: White offers a pawn in exchange for quick development and open files.',
          },
        },
        '3...dxc3': { text: { es: 'Aceptas el peón. Tu tarea ahora: desarrollarte con cuidado.', en: 'You accept the pawn. Your task now: develop carefully.' } },
        '5...d6': { text: { es: 'Controlas e5 y abres camino al alfil de c8.', en: 'You control e5 and open the way for the c8-bishop.' } },
        '6...e6': {
          text: {
            es: 'Tapas la diagonal del alfil de c4 hacia f7: nada de sorpresas en tu flanco de rey.',
            en: 'You block the c4-bishop’s diagonal towards f7: no surprises on your kingside.',
          },
        },
        '8...Be7': { text: { es: 'Desarrollas y preparas el enroque.', en: 'You develop and prepare to castle.' } },
        '9.Rd1': { text: { es: 'La torre presiona tu peón de d6.', en: 'The rook pressures your d6-pawn.' }, rival: ['d1d6'] },
        '9...e5': {
          text: {
            es: 'Cierras el centro e impides la ruptura [e5]. Sin columnas abiertas, el peón de más empezará a notarse.',
            en: 'You close the centre and stop the [e5] break. Without open files, the extra pawn will start to count.',
          },
        },
        '10...O-O': { text: { es: 'Rey a salvo.', en: 'King safe.' } },
        '11...Be6': {
          text: {
            es: 'Cambias el alfil más peligroso del blanco. Tienes un peón de más y una posición sólida.',
            en: 'You trade White’s most dangerous bishop. You are a pawn up with a solid position.',
          },
          arrows: ['e6c4'],
        },
      },
      summary: {
        es: 'Contra el Smith-Morra: aceptas el peón y te desarrollas con ...[Nc6], ...[d6], ...[e6], ...[Nf6] y ...[Be7]. Con ...[e5] cierras el centro y con ...[Be6] cambias el alfil de c4.',
        en: 'Against the Smith-Morra: accept the pawn and develop with ...[Nc6], ...[d6], ...[e6], ...[Nf6] and ...[Be7]. With ...[e5] you close the centre and with ...[Be6] you trade the c4-bishop.',
      },
    },

    // --- Trampas y errores típicos ---
    {
      id: 'drag-trap-a7',
      name: { es: 'Trampa: 13.Axa7? b4 14.Ca4?', en: 'Trap: 13.Bxa7? b4 14.Na4?' },
      moves: `${TOPALOV} 13.Bxa7 b4 14.Na4 Bxa4 15.Bxa4 Qa5 16.Bb3 Qxa7`,
      notes: {
        '13.Bxa7': { text: { es: 'El blanco se come el peón de a7…', en: 'White grabs the a7-pawn…' } },
        '13...b4': {
          text: {
            es: '…y el caballo tiene que moverse. Solo d5 y e2 son buenas casillas.',
            en: '…and the knight has to move. Only d5 and e2 are good squares.',
          },
          arrows: ['b4c3'],
          marks: ['d5', 'e2'],
        },
        '14.Na4': {
          text: {
            es: '¡Error! Parece una casilla segura cerca del rey, pero el caballo de a4 solo está defendido por el alfil de b3.',
            en: 'A mistake! It looks like a safe square near the king, but the a4-knight is defended only by the b3-bishop.',
          },
        },
        '14...Bxa4': { text: { es: 'Te llevas el caballo.', en: 'You take the knight.' } },
        '15...Qa5': {
          text: {
            es: '¡Ataque doble! La dama ataca a la vez el alfil de a4 y el de a7.',
            en: 'Double attack! The queen hits the a4-bishop and the a7-bishop at the same time.',
          },
          arrows: ['a5a4', 'a5a7'],
        },
        '16...Qxa7': {
          text: {
            es: 'Ganas una pieza por un peón y la columna a está abierta contra el rey blanco.',
            en: 'You win a piece for a pawn, and the a-file is open against the white king.',
          },
        },
      },
      summary: {
        es: 'Tras [13.Bxa7 b4] el caballo blanco solo tiene d5 y e2. Si va a a4, ...[Bxa4] y ...[Qa5] ganan una pieza con un ataque doble.',
        en: 'After [13.Bxa7 b4] the white knight has only d5 and e2. If it goes to a4, ...[Bxa4] and ...[Qa5] win a piece with a double attack.',
      },
    },
    {
      id: 'drag-trap-rc8',
      name: { es: 'Trampa de la columna c: 11.h4?', en: 'c-file trap: 11.h4?' },
      moves: `${YUGO} 9.Bc4 Bd7 10.O-O-O Rc8 11.h4 Nxd4 12.Qxd4 Ng4 13.fxg4 Bxd4`,
      notes: {
        '11.h4': {
          text: {
            es: 'Es el plan natural del blanco ([h4]-[h5] contra tu rey), pero se olvida de que su alfil de c4 está en la columna de tu torre. Lo correcto era [11.Bb3].',
            en: 'It is White’s natural plan ([h4]-[h5] against your king), but it forgets that the c4-bishop stands on your rook’s file. The right move was [11.Bb3].',
          },
          rival: ['h4h5'],
        },
        '11...Nxd4': {
          text: {
            es: '¡Ahora! Si [12.Bxd4], [12...Rxc4] gana el alfil. Y si el blanco recupera con la dama…',
            en: 'Now! If [12.Bxd4], [12...Rxc4] wins the bishop. And if White recaptures with the queen…',
          },
          arrows: ['c8c4'],
        },
        '12...Ng4': {
          text: {
            es: '…el caballo destapa tu alfil de g7, que ataca a la dama de d4, y además amenaza el alfil de e3. Haga lo que haga, el blanco pierde mucho material.',
            en: '…the knight uncovers your g7-bishop, which hits the queen on d4, and also threatens the e3-bishop. Whatever White does, it will lose a lot of material.',
          },
          arrows: ['g7d4', 'g4e3'],
        },
        '13...Bxd4': {
          text: {
            es: 'Has ganado la dama a cambio de dos piezas menores: tu ventaja es decisiva.',
            en: 'You have won the queen for two minor pieces: your advantage is decisive.',
          },
        },
      },
      summary: {
        es: 'Con [...Rc8] amenazas [...Nxd4] seguido de [...Rxc4] o [...Ng4]. Por eso el blanco tiene que retirar el alfil a b3 antes de atacar.',
        en: 'With [...Rc8] you threaten [...Nxd4] followed by [...Rxc4] or [...Ng4]. That is why White must retreat the bishop to b3 before attacking.',
      },
    },
    {
      id: 'drag-trap-a4',
      name: { es: 'Trampa del alfil de b3: 16.h4?', en: 'b3-bishop trap: 16.h4?' },
      moves: `${TOPALOV} 13.Nd5 Nxd5 14.Bxg7 Kxg7 15.exd5 a5 16.h4 a4 17.Bxa4 bxa4`,
      notes: {
        '16.h4': {
          text: {
            es: '¡Error! El blanco sigue con su ataque, pero no le da una casilla a su alfil: en la línea principal juega [16.a3].',
            en: 'A mistake! White carries on with the attack but does not give the bishop a square: in the main line White plays [16.a3].',
          },
          rival: ['h4h5'],
        },
        '16...a4': {
          text: {
            es: 'El alfil de b3 no tiene adónde ir: a2 la ocupa su propio peón y c4 la controla tu peón de b5.',
            en: 'The b3-bishop has nowhere to go: its own pawn sits on a2 and your b5-pawn controls c4.',
          },
          marks: ['b3', 'a2', 'c4'],
        },
        '17...bxa4': {
          text: {
            es: 'Ganas una pieza por un peón, y la columna b se abre contra el rey blanco.',
            en: 'You win a piece for a pawn, and the b-file opens up against the white king.',
          },
        },
      },
      summary: {
        es: 'En la Topalov, cuando juegues [...a5], mira si el alfil de b3 tiene casilla: si no la tiene, [...a4] lo atrapa.',
        en: 'In the Topalov, when you play [...a5], check whether the b3-bishop has a square: if not, [...a4] traps it.',
      },
    },
    {
      id: 'drag-trap-ng4',
      name: { es: 'Error típico: 6...Cg4? 7.Ab5+!', en: 'Typical mistake: 6...Ng4? 7.Bb5+!' },
      practice: false,
      moves: `${DRAGON} 6.Be3 Ng4 7.Bb5+ Bd7 8.Qxg4 Bxb5 9.Ndxb5`,
      notes: {
        '6...Ng4': {
          text: {
            es: 'Así NO. Atacar al alfil de e3 parece lógico (por eso el blanco suele jugar [f3]), pero tu caballo de g4 solo lo defiende el alfil de c8.',
            en: 'Not like this. Hitting the e3-bishop looks logical (that is why White usually plays [f3]), but your g4-knight is defended only by the c8-bishop.',
          },
        },
        '7.Bb5+': {
          text: {
            es: '¡Jaque! Si tapas con [7...Bd7], ese alfil queda clavado contra tu rey y ya no defiende g4. La dama de d1 ya mira a g4.',
            en: 'Check! If you block with [7...Bd7], that bishop is pinned to your king and no longer defends g4. The d1-queen already eyes g4.',
          },
          rival: ['d1g4'],
        },
        '8.Qxg4': { text: { es: 'El caballo cae.', en: 'The knight falls.' } },
        '9.Ndxb5': {
          text: {
            es: 'El blanco tiene una pieza de más. Por eso, contra [6.Be3], juega [6...Bg7].',
            en: 'White is a piece up. That is why, against [6.Be3], you play [6...Bg7].',
          },
        },
      },
      summary: {
        es: 'Antes de jugar ...[Ng4], mira la diagonal d1-g4. Con el alfil de f1 todavía en casa, [Bb5+] y [Qxg4] ganan el caballo.',
        en: 'Before playing ...[Ng4], look at the d1-g4 diagonal. With the f1-bishop still at home, [Bb5+] and [Qxg4] win the knight.',
      },
    },
    {
      id: 'drag-trap-levenfish',
      name: { es: 'Error típico: 6.f4 Ag7?! 7.e5!', en: 'Typical mistake: 6.f4 Bg7?! 7.e5!' },
      practice: false,
      moves: `${DRAGON} 6.f4 Bg7 7.e5 dxe5 8.fxe5 Ng4 9.Bb5+ Nc6 10.Nxc6 bxc6 11.Bxc6+ Bd7 12.Bxa8 Qxa8`,
      notes: {
        '6...Bg7': {
          text: {
            es: 'Dudosa. Es la jugada del Dragón de siempre, pero contra [6.f4] deja que el blanco juegue [7.e5].',
            en: 'Dubious. It is the usual Dragon move, but against [6.f4] it lets White play [7.e5].',
          },
        },
        '7.e5': {
          text: {
            es: '¡Fuerte! El caballo de f6 tiene que moverse y las negras necesitan jugadas exactas.',
            en: 'Strong! The f6-knight must move and Black needs exact moves.',
          },
          rival: ['e5f6'],
        },
        '8...Ng4': {
          text: {
            es: 'El salto natural, atacando e5… pero pierde material.',
            en: 'The natural jump, hitting e5… but it loses material.',
          },
        },
        '9.Bb5+': {
          text: {
            es: 'El mismo truco de siempre: jaque en b5 y la dama de d1 mira a g4. Si [9...Bd7], [10.Qxg4].',
            en: 'The same old trick: check on b5 and the d1-queen eyes g4. If [9...Bd7], [10.Qxg4].',
          },
          rival: ['d1g4'],
        },
        '10.Nxc6': {
          text: {
            es: 'El caballo toma en c6 y la columna d se abre: la dama blanca ataca a la tuya.',
            en: 'The knight takes on c6 and the d-file opens: the white queen attacks yours.',
          },
        },
        '12.Bxa8': {
          text: {
            es: 'El blanco gana la calidad y un peón. Recuerda: contra [6.f4], primero [6...Nc6!].',
            en: 'White wins the exchange and a pawn. Remember: against [6.f4], first [6...Nc6!].',
          },
        },
      },
      summary: {
        es: 'Contra [6.f4] la jugada es [6...Nc6!], que controla e5. Con [6...Bg7?!], [7.e5!] te obliga a jugar con precisión y el natural [8...Ng4?] pierde material tras [9.Bb5+!].',
        en: 'Against [6.f4] the move is [6...Nc6!], which controls e5. After [6...Bg7?!], [7.e5!] forces you to play precisely, and the natural [8...Ng4?] loses material after [9.Bb5+!].',
      },
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
          id: 'ideas',
          type: 'ideas',
          title: { es: 'Ideas y planes', en: 'Ideas and plans' },
          subtitle: { es: 'El alfil de g7 y la columna c', en: 'The g7-bishop and the c-file' },
          intro: {
            es: 'Por qué se llama Dragón, el alfil de g7, la columna c, el sacrificio de calidad y la carrera de enroques opuestos.',
            en: 'Why it is called the Dragon, the g7-bishop, the c-file, the exchange sacrifice and the opposite-castling race.',
          },
          slides: [
            {
              title: { es: 'Un dragón entre las estrellas', en: 'A dragon among the stars' },
              text: {
                es: 'Tras [5...g6], tus peones de d6, e7, f7, g6 y h7 forman una figura que a un maestro ruso aficionado a la astronomía le recordó la constelación del Dragón. El nombre cuadra con el carácter de la apertura: afilada, agresiva y llena de fuego.',
                en: 'After [5...g6], your pawns on d6, e7, f7, g6 and h7 form a shape that reminded a Russian master, an amateur astronomer, of the constellation Draco. The name fits the opening’s character: sharp, aggressive and full of fire.',
              },
              moves: DRAGON,
              arrows: ['f8g7'],
              marks: ['d6', 'e7', 'f7', 'g6', 'h7'],
            },
            {
              title: { es: 'El alfil de g7', en: 'The g7-bishop' },
              text: {
                es: 'Es el alma del Dragón. Desde g7 mira a d4, c3 y b2: justo donde se esconde el rey blanco tras el enroque largo. Por eso el blanco quiere cambiarlo con [Bh6], y por eso no debes regalarlo nunca.',
                en: 'It is the soul of the Dragon. From g7 it eyes d4, c3 and b2: exactly where the white king hides after long castling. That is why White wants to trade it with [Bh6], and why you must never give it away.',
              },
              moves: `${YUGO} 9.Bc4 Bd7 10.O-O-O`,
              arrows: ['g7b2'],
              rival: ['e3h6'],
            },
            {
              title: { es: 'La columna c semiabierta', en: 'The half-open c-file' },
              text: {
                es: 'Al cambiar tu peón c por el de d4, la columna c queda abierta para ti. Tu torre en c8, detrás del caballo de c6, apunta a c4, c3 y c2, delante del rey blanco: en cuanto el caballo se mueva, la columna se abre. Con ...[Nxd4] y ...[b5] (la Variante Topalov), tus peones se suman al ataque.',
                en: 'By trading your c-pawn for the d4-pawn, the c-file is open for you. Your rook on c8, behind the c6-knight, aims at c4, c3 and c2, in front of the white king: as soon as the knight moves, the file opens. With ...[Nxd4] and ...[b5] (the Topalov Variation), your pawns join the attack.',
              },
              moves: `${YUGO} 9.Bc4 Bd7 10.O-O-O Rc8`,
              arrows: ['c8c4', 'b7b5'],
              marks: ['c3', 'c2'],
            },
            {
              title: { es: 'El sacrificio de calidad ...Txc3', en: 'The ...Rxc3 exchange sacrifice' },
              text: {
                es: 'Un golpe típico: das tu torre por el caballo de c3. Tras [bxc3], los peones del rey blanco quedan rotos, y tu dama y tu caballo entran por las casillas débiles. Aquí, tras [13.Bh6 Bxh6 14.Qxh6], ...[Rxc3]! es la mejor jugada.',
                en: 'A typical blow: you give your rook for the c3-knight. After [bxc3], the pawns around the white king are broken, and your queen and knight come in through the weak squares. Here, after [13.Bh6 Bxh6 14.Qxh6], ...[Rxc3]! is the best move.',
              },
              moves: `${SOLTIS} 13.Bh6 Bxh6 14.Qxh6`,
              arrows: ['c8c3'],
              marks: ['c3'],
            },
            {
              title: { es: 'Flancos opuestos: la carrera', en: 'Opposite wings: the race' },
              text: {
                es: 'Con los reyes en flancos opuestos, gana quien llega antes. Fischer resumió el plan blanco: abrir la columna h, sacrificar y dar mate. El tuyo: columna c, peones a y b contra su rey y el alfil de g7. Defiende solo lo imprescindible, como ...[h5] contra [h4], y cuenta los tiempos.',
                en: 'With the kings on opposite wings, whoever arrives first wins. Fischer summed up White’s plan: open the h-file, sacrifice and mate. Yours: the c-file, the a- and b-pawns against his king, and the g7-bishop. Defend only what is essential, like ...[h5] against [h4], and count the tempi.',
              },
              moves: `${TOPALOV} 13.Nd5 Nxd5 14.Bxg7 Kxg7 15.exd5 a5 16.a3 Kg8 17.h4`,
              arrows: ['b5b4', 'a5a4'],
              rival: ['h4h5'],
            },
            {
              title: { es: '...d5: la gran liberación', en: '...d5: the great liberation' },
              text: {
                es: 'Si consigues jugar ...[d5] sin perder material, el centro se abre y tus piezas cobran vida, justo cuando el rey blanco acaba de enrocar. Por eso el blanco juega [9.Bc4]: para vigilar d5. Si enroca sin el alfil, ...[d5]! iguala al instante.',
                en: 'If you manage to play ...[d5] without losing material, the centre opens and your pieces come to life, just as the white king has castled. That is why White plays [9.Bc4]: to watch d5. If he castles without the bishop, ...[d5]! equalises at once.',
              },
              moves: `${YUGO} 9.O-O-O`,
              arrows: ['d6d5'],
              marks: ['d5'],
            },
            {
              title: { es: 'Otros sistemas blancos', en: 'Other White systems' },
              text: {
                es: 'No todos los rivales jugarán el Yugoslavo. En el Campamento 1 verás la Clásica ([6.Be2]), la Levenfish ([6.f4]), el fianchetto ([6.g3]) y las anti-sicilianas: [2.c3], [3.Bb5+], la Cerrada, el Grand Prix y el Smith-Morra.',
                en: 'Not every opponent will play the Yugoslav. In Camp 1 you will see the Classical ([6.Be2]), the Levenfish ([6.f4]), the fianchetto ([6.g3]) and the anti-Sicilians: [2.c3], [3.Bb5+], the Closed, the Grand Prix and the Smith-Morra.',
              },
              moves: DRAGON,
            },
          ],
          quiz: [
            {
              kind: 'move',
              question: {
                es: 'El blanco ha enrocado largo sin jugar [Bc4]. ¿Cuál es tu gran liberación?',
                en: 'White has castled long without playing [Bc4]. What is your great liberating move?',
              },
              moves: `${YUGO} 9.O-O-O`,
              answers: ['d5'],
              explanation: {
                es: '[9...d5]! Nadie vigila d5. Tras [10.exd5 Nxd5] recuperas el peón y tus piezas atacan al rey blanco.',
                en: '[9...d5]! Nobody watches d5. After [10.exd5 Nxd5] you regain the pawn and your pieces attack the white king.',
              },
            },
            {
              kind: 'choice',
              question: { es: '¿Para qué juega el blanco [7.f3] en el Ataque Yugoslavo?', en: 'Why does White play [7.f3] in the Yugoslav Attack?' },
              moves: `${DRAGON} 6.Be3 Bg7 7.f3`,
              options: [
                { es: 'Para quitarle la casilla g4 a tu caballo y preparar el avance [g4]', en: 'To take the g4-square from your knight and prepare the [g4] advance' },
                { es: 'Para abrir la columna f a su torre', en: 'To open the f-file for his rook' },
                { es: 'Para preparar el enroque corto', en: 'To prepare short castling' },
              ],
              correct: 0,
              explanation: {
                es: 'Sin [f3], ...[Ng4] atacaría al alfil de e3. Además, el peón defiende e4 y apoya el avance [g4].',
                en: 'Without [f3], ...[Ng4] would hit the e3-bishop. The pawn also defends e4 and supports the [g4] advance.',
              },
            },
            {
              kind: 'move',
              question: { es: 'El blanco ha jugado [6.f4]. ¿Cuál es tu respuesta?', en: 'White has played [6.f4]. What is your reply?' },
              moves: `${DRAGON} 6.f4`,
              answers: ['Nc6'],
              explanation: {
                es: '[6...Nc6]! controla e5. Si [6...Bg7?!], el blanco juega [7.e5!] y tienes que defenderte con jugadas exactas.',
                en: '[6...Nc6]! controls e5. After [6...Bg7?!], White plays [7.e5!] and you have to defend with exact moves.',
              },
            },
            {
              kind: 'move',
              question: {
                es: 'El blanco ha cambiado tu alfil de g7. Encuentra el sacrificio típico del Dragón.',
                en: 'White has traded off your g7-bishop. Find the typical Dragon sacrifice.',
              },
              moves: `${SOLTIS} 13.Bh6 Bxh6 14.Qxh6`,
              answers: ['Rxc3'],
              explanation: {
                es: '[14...Rxc3]! Tras [15.bxc3] los peones del rey blanco quedan rotos y tu dama entra por a5. Una torre por un caballo… y por un rey expuesto.',
                en: '[14...Rxc3]! After [15.bxc3] the pawns around the white king are broken and your queen comes in via a5. A rook for a knight… and for an exposed king.',
              },
            },
            {
              kind: 'choice',
              question: { es: '¿Por qué el blanco juega [9.Bc4] en el Yugoslavo?', en: 'Why does White play [9.Bc4] in the Yugoslav?' },
              moves: `${YUGO} 9.Bc4`,
              options: [
                { es: 'Para defender el peón de e4', en: 'To defend the e4-pawn' },
                { es: 'Para vigilar d5 e impedir tu ...[d5]', en: 'To watch d5 and stop your ...[d5]' },
                { es: 'Para preparar el enroque corto', en: 'To prepare short castling' },
              ],
              correct: 1,
              explanation: {
                es: 'El alfil de c4 controla d5: así tu gran liberación ...[d5] no es posible. Además apunta a tu rey por la diagonal a2-g8.',
                en: 'The c4-bishop controls d5, so your great liberating ...[d5] is not possible. It also aims at your king along the a2-g8 diagonal.',
              },
            },
          ],
        },
        {
          id: 'main-line',
          type: 'line',
          title: { es: 'Línea principal', en: 'Main line' },
          subtitle: { es: 'Yugoslavo · Variante Topalov', en: 'Yugoslav · Topalov Variation' },
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
            es: 'Juegas tú con negras la Variante Topalov. Si fallas, te enseñamos la jugada y la repetirás más adelante.',
            en: 'You play the Topalov Variation as Black. If you slip, we show you the move and you will repeat it later.',
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
            es: 'El blanco no siempre sigue la línea principal. Aprende qué hacer si se come el peón de a7, si avanza pronto el peón h, si enroca largo sin sacar el alfil a c4 o si lanza el peón g.',
            en: 'White does not always follow the main line. Learn what to do if he grabs the a7-pawn, pushes the h-pawn early, castles long without putting his bishop on c4 or launches the g-pawn.',
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
            es: 'Dos trampas en las que el blanco cae con facilidad y dos errores que tú no debes cometer.',
            en: 'Two traps that White falls into easily and two mistakes you must not make.',
          },
          lines: ['drag-trap-a7', 'drag-trap-rc8', 'drag-trap-a4', 'drag-trap-ng4', 'drag-trap-levenfish'],
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
            'drag-trap-a7', 'drag-trap-rc8', 'drag-trap-a4',
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
            'drag-trap-a7', 'drag-trap-rc8', 'drag-trap-a4',
          ],
          puzzles: [],
          passScore: 0.8,
        },
      ],
    },
  ],
};
