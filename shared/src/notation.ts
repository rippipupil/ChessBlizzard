// Notación: el contenido se escribe en SAN inglés y se muestra en el idioma elegido.

export type NotationStyle = 'es' | 'en';

const ES_PIECES: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'A', N: 'C' };

/** Convierte una jugada SAN inglesa a la notación pedida ("Nbd7" -> "Cbd7", "O-O" -> "0-0"). */
export function localizeSan(san: string, style: NotationStyle): string {
  if (style === 'en') return san;
  if (san.startsWith('O-O')) return san.replace(/O/g, '0');
  return san.replace(/[KQRBN]/g, (p) => ES_PIECES[p] ?? p);
}

/** Traduce una cadena con números de jugada ("9...Nd7", "...Nd7", "1.e4 c5 2.Nf3"). */
export function localizeMoveText(text: string, style: NotationStyle): string {
  if (style === 'en') return text;
  return text
    .split(/(\s+)/)
    .map((tok) => {
      const m = tok.match(/^(\d+\.(?:\.\.)?|\.\.\.)?(.*)$/);
      if (!m) return tok;
      const [, num = '', rest] = m;
      return rest && /^(O-O|[KQRBN]|[a-h])/.test(rest) ? num + localizeSan(rest, style) : tok;
    })
    .join('');
}

export type TextSegment = { kind: 'text'; value: string } | { kind: 'move'; value: string };

/**
 * Parte un comentario en trozos de texto y de jugadas. Las jugadas van entre
 * corchetes: "Por eso [9...Nd7] deja libre el peón de f".
 */
export function parseRichText(text: string, style: NotationStyle): TextSegment[] {
  const out: TextSegment[] = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ kind: 'text', value: text.slice(last, m.index) });
    out.push({ kind: 'move', value: localizeMoveText(m[1], style) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', value: text.slice(last) });
  return out;
}

/** Texto plano (sin corchetes) con las jugadas ya traducidas. */
export function plainText(text: string, style: NotationStyle): string {
  return parseRichText(text, style)
    .map((s) => s.value)
    .join('');
}
