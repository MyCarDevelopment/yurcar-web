export const STORAGE_KEY = 'yurcar.web.v1';
export const emptyData = () => ({version:1,vehicles:[],activeId:null,checks:[]});
export function validate(data) {
 if (!data || data.version !== 1 || !Array.isArray(data.vehicles) || data.vehicles.length > 10 || !Array.isArray(data.checks) || new Set(data.checks).size!==data.checks.length || data.checks.some(x => !Number.isInteger(x) || x < 0 || x >= (data.tripItems?.length??5))) throw Error('Неверный формат данных');
 if(data.tripItems!==undefined && (!Array.isArray(data.tripItems)||data.tripItems.length>30||data.tripItems.some(x=>typeof x!=='string'||!x.trim()||x.length>100)))throw Error('Проверьте список перед поездкой');
 const ids = new Set();
 for (const v of data.vehicles) {
  if (!v || typeof v.id !== 'string' || ids.has(v.id) || typeof v.brand !== 'string' || !v.brand.trim() || v.brand.length > 60 || typeof v.model !== 'string' || !v.model.trim() || v.model.length > 60) throw Error('Проверьте автомобили');
  ids.add(v.id);
  for(const key of ['generation','engine'])if(v[key]!==undefined&&(typeof v[key]!=='string'||v[key].length>100))throw Error('Проверьте паспорт автомобиля');
  for(const [key,values] of Object.entries({fuel:['UNKNOWN','PETROL','DIESEL','HYBRID','ELECTRIC','GAS'],gearbox:['UNKNOWN','MANUAL','AUTO','CVT','ROBOT','REDUCTION'],driving:['MIXED','SHORT','HIGHWAY','HEAVY']}))if(v[key]!==undefined&&!values.includes(v[key]))throw Error('Проверьте характеристики автомобиля');
  if (v.mileage !== null && (!Number.isInteger(v.mileage) || v.mileage < 0 || v.mileage > 9999999)) throw Error('Неверный пробег');
  if (v.year !== null && (!Number.isInteger(v.year) || v.year < 1900 || v.year > new Date().getFullYear()+1)) throw Error('Неверный год');
  for (const key of ['records','tasks']) {
   if (!Array.isArray(v[key]) || v[key].length > 200) throw Error('Слишком много записей');
   const entryIds = new Set();
   for (const e of v[key]) {
    if (!e || typeof e.id !== 'string' || entryIds.has(e.id) || typeof e.title !== 'string' || !e.title.trim() || e.title.length > 100 || typeof e.note !== 'string' || e.note.length > 500) throw Error('Неверная запись');
    entryIds.add(e.id);
    if (e.date !== null && (typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isFinite(Date.parse(e.date)) || new Date(e.date).toISOString().slice(0,10)!==e.date)) throw Error('Неверная дата');
    if (key === 'records' && !e.date) throw Error('У записи нужна дата');
    if (e.mileage !== null && (!Number.isInteger(e.mileage) || e.mileage < 0 || e.mileage > 9999999)) throw Error('Неверный пробег записи');
   }
  }
 }
 if (data.activeId !== null && !ids.has(data.activeId)) throw Error('Неверный активный автомобиль');
 return data;
}
export class LocalRepository {
 constructor(storage) { this.storage=storage; }
 async load() { const raw=this.storage.getItem(STORAGE_KEY); return raw ? validate(JSON.parse(raw)) : emptyData(); }
 async save(data) { validate(data); this.storage.setItem(STORAGE_KEY,JSON.stringify(data)); }
}
// Future API adapter must implement the same load/save interface; no fake synchronization.
export class ApiRepository {
 constructor(baseUrl,tokenProvider) { this.baseUrl=baseUrl; this.tokenProvider=tokenProvider; }
 async request(path,options={}) {
  const token=await this.tokenProvider();
  const response=await fetch(`${this.baseUrl}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}});
  if(!response.ok) throw Error(`Ошибка API: ${response.status}`);
  return response.status===204?null:response.json();
 }
 async load(){return validate(await this.request('/v1/garage'));}
 async save(data){return this.request('/v1/garage',{method:'PUT',body:JSON.stringify(validate(data))});}
}
export function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function due(task,vehicle){return Boolean((task.date && task.date<=today()) || (task.mileage!==null && vehicle.mileage!==null && vehicle.mileage>=task.mileage));}
