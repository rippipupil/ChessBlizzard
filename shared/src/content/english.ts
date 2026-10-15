import type { Course } from '../types';

// Marcador provisional: el curso completo lo escribe el equipo de contenido.
export const english: Course = {
  id: 'english',
  name: { es: 'Inglesa', en: 'English Opening' },
  side: 'w',
  eco: '',
  vs: { es: '', en: '' },
  tagline: { es: '', en: '' },
  history: { es: '', en: '' },
  references: [],
  lines: [{ id: 'english-main', name: { es: 'Línea principal', en: 'Main line' }, moves: '1.c4 e5 2.Nc3 Nf6 3.g3' }],
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
          lines: ['english-main'],
        },
      ],
    },
  ],
};
