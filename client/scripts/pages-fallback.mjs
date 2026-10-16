// Retoques de la versión para GitHub Pages, después de `vite build --mode pages`:
//  - 404.html, copia de index.html: GitHub Pages no conoce las rutas de la app, así que al
//    abrir o recargar /ChessBlizzard/curso/... sirve 404.html y la app muestra esa ruta.
//  - .nojekyll: GitHub Pages publica los archivos tal cual, sin pasarlos por Jekyll.
import { copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), '');
console.log('dist listo para GitHub Pages (404.html y .nojekyll)');
