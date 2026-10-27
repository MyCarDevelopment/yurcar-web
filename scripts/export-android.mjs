import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {resolve,join,extname,basename} from 'node:path';
const android=resolve(process.argv[2]||'..');
const base=join(android,'app/src/main/java/com/example/mycar');
const temp=resolve('.content-export');await mkdir(temp,{recursive:true});
const paths=['ui/guide/GuideContent.kt','ui/guide/ProvidedGuideContent.kt','ui/guide/GuideCollectionContent.kt','ui/guide/ArticleServiceLinks.kt','ui/atlas/AtlasContent.kt','ui/atlas/ExpandedAtlasContent.kt','ui/garage/GarageModels.kt','ui/garage/GarageCatalog.kt','ui/garage/GarageAdvice.kt','ui/services/ServiceCatalog.kt','ui/Story.kt','ui/home/CityStories.kt','ui/map/MapPlaces.kt','ui/sos/SosContent.kt'];
const resources=new Map();
const homeAssetNames=['home_guide_art_v1','home_services_art_v1','home_products_art_v1','home_fines_art_v1','home_community_art_v1','launcher_mark_v1','guide_anatomy_art_v1','polish_symptoms_art_v1','polish_location_art_v1','guide_diagnosis_art_v1','polish_urgency_art_v1','guide_care_art_v1','guide_tips_art_v1'];
for(const name of homeAssetNames)resources.set(name,resources.size+1);
for(const path of paths){const s=await readFile(join(base,path),'utf8');for(const m of s.matchAll(/R\.drawable\.(\w+)/g))if(!resources.has(m[1]))resources.set(m[1],resources.size+1);await writeFile(join(temp,basename(path)),s);}
let indicators=await readFile(join(base,'ui/indicators/IndicatorsScreen.kt'),'utf8');indicators='package com.example.mycar.ui.indicators\nimport com.example.mycar.R\n'+indicators.slice(indicators.indexOf('data class CategoryItem'),indicators.indexOf('@Composable')).replace('private val indicatorCategories','val indicatorCategories');
for(const m of indicators.matchAll(/R\.drawable\.(\w+)/g))if(!resources.has(m[1]))resources.set(m[1],resources.size+1);
await writeFile(join(temp,'IndicatorsContent.kt'),indicators);
await writeFile(join(temp,'R.kt'),'package com.example.mycar\nobject R { object drawable {\n'+[...resources].map(([n,i])=>`const val ${n} = ${i}`).join('\n')+'\n}}');
await writeFile(join(temp,'Export.kt'),`import com.google.gson.GsonBuilder
import com.example.mycar.ui.guide.*
import com.example.mycar.ui.atlas.*
import com.example.mycar.ui.garage.*
import com.example.mycar.ui.services.*
import com.example.mycar.ui.home.*
import com.example.mycar.ui.map.*
import com.example.mycar.ui.sos.*
import com.example.mycar.ui.indicators.*
fun main(args:Array<String>) {
 val advice=FuelType.entries.associate { fuel -> fuel.name to adviceFor(GarageVehicle(brand="Ваш",model="автомобиль",fuel=fuel)) }
 val payload=linkedMapOf<String,Any>(
 "articles" to guideArticles.map { mapOf("article" to it,"services" to relatedServiceCategories(it.id).map { c->c.id }) },
 "sections" to GuideSection.entries.map { mapOf("id" to it.name,"title" to it.title,"subtitle" to it.subtitle) },
 "urgencies" to GuideUrgency.entries.associate { it.name to it.label },
 "zones" to atlasZones,"parts" to atlasParts,"vehicles" to garageCatalog,
 "serviceCategories" to ServiceCategory.entries.map { mapOf("id" to it.id,"name" to it.name,"title" to it.title,"summary" to it.summary,"image" to it.imageRes) },
 "companies" to serviceCompanies,"places" to mapPlaces,"stories" to homeStories,"sos" to sosTopics,
 "indicators" to indicatorCategories,"advice" to advice,
 "extraAdvice" to adviceFor(GarageVehicle(brand="Ваш",model="автомобиль",driving=Driving.HEAVY)),
 "shortAdvice" to adviceFor(GarageVehicle(brand="Ваш",model="автомобиль",driving=Driving.SHORT)),
 "gearAdvice" to Gearbox.entries.associate { g->g.name to adviceFor(GarageVehicle(brand="Ваш",model="автомобиль",gearbox=g)).filter{it.id=="gearbox"} },
 "providers" to garageProviders,
 "brandResources" to garageCatalog.map{it.brand}.distinct().mapNotNull { b->resourcesFor(b)?.let{b to it} }.toMap())
 java.io.File(args[0]).writeText(GsonBuilder().serializeNulls().disableHtmlEscaping().create().toJson(payload))
}`);
await writeFile(join(temp,'resources.json'),JSON.stringify(Object.fromEntries([...resources].map(([n,i])=>[i,n]))));
if(process.argv.includes('--assets')){
 const folders=(await readdir(join(android,'app/src/main/res'))).filter(x=>x.startsWith('drawable'));
 const assets=new Map();for(const dir of folders)for(const file of await readdir(join(android,'app/src/main/res',dir)))if(!assets.has(basename(file,extname(file))))assets.set(basename(file,extname(file)),join(android,'app/src/main/res',dir,file));
 const payload=JSON.parse(await readFile(join(temp,'content.json'),'utf8'));const used=new Set();
 function collect(v){if(!v||typeof v!=='object')return;for(const [k,x]of Object.entries(v)){if(['photo','image','imageRes','contentImageRes','coverImageRes','iconRes'].includes(k)&&resources.has([...resources].find(([,i])=>i===x)?.[0]))used.add(x);else collect(x);}}collect(payload);
 for(const name of homeAssetNames)used.add(resources.get(name));
 const imageMap={};await mkdir('assets/android',{recursive:true});const bmp=[];
 for(const id of used){const name=[...resources].find(([,i])=>i===id)[0],file=assets.get(name);if(!file)throw Error('Missing Android asset '+name);const ext=extname(file);if(ext==='.xml'){continue;}if(ext==='.bmp'){bmp.push({source:file,target:resolve('assets/android',name+'.png')});imageMap[id]='./assets/android/'+name+'.png';}else{await copyFile(file,join('assets/android',name+ext));imageMap[id]='./assets/android/'+name+ext;}}
 await writeFile(join(temp,'bmp.json'),JSON.stringify(bmp));await writeFile('src/android-content.js','// Generated from Android source; run scripts/export-android.ps1 to refresh.\nexport const content = '+JSON.stringify({...payload,images:imageMap})+';\n');
 await mkdir('assets/documents',{recursive:true});const docs=[];for(const file of await readdir(join(android,'app/src/main/assets')))if(file.endsWith('.txt')){await copyFile(join(android,'app/src/main/assets',file),join('assets/documents',file));docs.push({id:basename(file,'.txt'),path:'./assets/documents/'+file,text:await readFile(join(android,'app/src/main/assets',file),'utf8')});}
 await writeFile('src/legal-content.js','export const documents = '+JSON.stringify(docs)+';\n');
 console.log(JSON.stringify({articles:payload.articles.length,parts:payload.parts.length,indicators:payload.indicators.length,companies:payload.companies.length,stories:payload.stories.length,models:payload.vehicles.length,images:used.size,documents:docs.length}));
}
