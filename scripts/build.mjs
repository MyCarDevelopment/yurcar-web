import {cp,mkdir,rm,readdir,readFile,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist');
for(const path of ['index.html','styles.css','android.css','manifest.webmanifest','sw.js','src','assets','.nojekyll'])await cp(path,`dist/${path}`,{recursive:true});
async function files(dir){const rows=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+entry.name;if(entry.isDirectory())rows.push(...await files(path));else if(entry.name!=='sw.js')rows.push('./'+path.slice(5));}return rows;}
const worker=await readFile('sw.js','utf8');
await writeFile('dist/sw.js',worker.replace(/const FILES=.*?;/s,'const FILES='+JSON.stringify(['./',...await files('dist')])+';'));
console.log('Готово: dist/');
