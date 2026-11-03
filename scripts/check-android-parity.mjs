import {readFile} from 'node:fs/promises';import {resolve,join} from 'node:path';import {createHash} from 'node:crypto';import {content} from '../src/android-content.js';
const base=join(resolve(process.argv[2]||'..'),'app/src/main/java/com/example/mycar'),changed=[];
for(const [file,expected] of Object.entries(content.sourceHashes)){try{const actual=createHash('sha256').update(await readFile(join(base,file))).digest('hex');if(actual!==expected)changed.push(file);}catch{changed.push(file+' (не найден)');}}
if(changed.length){console.error('Повторите экспорт Android. Изменились исходники:\n'+changed.join('\n'));process.exitCode=1;}else console.log('Экспорт соответствует '+Object.keys(content.sourceHashes).length+' текущим Android-исходникам.');
