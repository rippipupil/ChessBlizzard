import type { Course } from '../types';

// Marcador provisional: el curso completo lo escribe el equipo de contenido.
export const dragon: Course = {
  id: 'dragon',
  name: { es: 'Siciliana Dragón', en: 'Sicilian Dragon' },
  side: 'b',
  eco: '',
  vs: { es: '', en: '' },
  tagline: { es: '', en: '' },
  history: { es: '', en: '' },
  references: [],
  lines: [{ id: 'dragon-main', name: { es: 'Línea principal', en: 'Main line' }, moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6' }],
  puzzles: [],
  camps: [
    {
      id: 'base',
      name: { es: 'Campamento base', en: 'Base camp' },
      title: { es: '', en: '' },
      stages: [
        {
          id: 'main-line',
          type: 'line',
          title: { es: 'Línea principal', en: 'Main line' },
          subtitle: { es: '', en: '' },
          intro: { es: '', en: '' },
          lines: ['dragon-main'],
        },
      ],
    },
  ],
};
