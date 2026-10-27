import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const path of ['index.html','styles.css','manifest.webmanifest','sw.js','src','assets','.nojekyll'])await cp(path,`dist/${path}`,{recursive:true});
console.log('Готово: dist/');
