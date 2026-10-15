// Busca jugadas escritas fuera de corchetes en los textos de los cursos.
// Esas jugadas no se traducen bien a la notación que elige el alumno.
//
//   npx tsx scripts/scan-bare-moves.ts
import { courses, type L10n } from '../src';

const EN = /(?:\b\d+\.(?:\.\.)?|\.\.\.|\b)(?:[KQRBN][a-h1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O(?:-O)?)(?![\w\]])/g;
const ES = /(?:\b\d+\.(?:\.\.)?|\.\.\.|\b)(?:[RDTAC][a-h1-8]?x?[a-h][1-8](?:=[DTAC])?[+#]?|0-0(?:-0)?)(?![\w\]])/g;

function outside(text: string): string {
  return text.replace(/\[[^\]]*\]/g, ' ');
}

let count = 0;
function check(where: string, t: L10n | undefined) {
  if (!t) return;
  const es = outside(t.es).match(ES) ?? [];
  const esEn = outside(t.es).match(EN) ?? [];
  const en = outside(t.en).match(EN) ?? [];
  const all = [...new Set([...es, ...esEn].map((m) => `es:${m}`)), ...new Set(en.map((m) => `en:${m}`))];
  if (all.length) {
    count += all.length;
    console.log(`${where}: ${all.join('  ')}`);
  }
}

for (const c of courses) {
  for (const l of c.lines) {
    for (const [k, n] of Object.entries(l.notes ?? {})) check(`${c.id} ${l.id} ${k}`, n.text);
    check(`${c.id} ${l.id} summary`, l.summary);
  }
  for (const camp of c.camps) {
    for (const s of camp.stages) {
      check(`${c.id} stage ${s.id} intro`, s.intro);
      if (s.type === 'ideas') {
        s.slides.forEach((sl, i) => check(`${c.id} slide ${i + 1}`, sl.text));
        s.quiz.forEach((q, i) => {
          check(`${c.id} quiz ${i + 1} question`, q.question);
          check(`${c.id} quiz ${i + 1} explanation`, q.explanation);
          if (q.kind === 'choice') q.options.forEach((o, j) => check(`${c.id} quiz ${i + 1} option ${j + 1}`, o));
        });
      }
    }
  }
  for (const p of c.puzzles) {
    check(`${c.id} ${p.id} hint`, p.hint);
    check(`${c.id} ${p.id} explanation`, p.explanation);
  }
  check(`${c.id} tagline`, c.tagline);
  check(`${c.id} history`, c.history);
}
console.log(`\n${count} jugada(s) fuera de corchetes`);
