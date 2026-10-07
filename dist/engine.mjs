export const stones = [
 ['Sapphire','Pipwick','#749ad9','This is almost symmetrical. Excellent.'],
 ['Ruby','Ruck','#d66979','I have secured the pillow.'],
 ['Emerald','Fennel','#58a38d','The leaf has submitted its report.'],
 ['Topaz','Glint','#e9b752','Please leave that square of sunshine there.'],
 ['Lake Superior agate','Peb','#c77b63','A scenic route. Very important.'],
 ['Moss agate','Bramble','#8da773','The boot is a garden now.'],
 ['Opal','Flicker','#b4a4dc','Not buffering. Considering.'],
 ["Tiger’s eye",'Sable','#bf9656','The stripe is escaping. I am supervising.'],
 ['Labradorite','Moth','#648ca6','Wait. This is my good angle.'],
 ['Skeletal Herkimer','Lintel','#b2c6ce','Load-bearing nonsense.']
];
export const quests = [
 {id:'landing',title:'Make a landing pad',text:'Put away three objects from one small surface. You choose which ones.',small:'Put away just one object instead.',reward:'Bottle-cap stool',icon:'🪑'},
 {id:'rescue',title:'Rescue a wandering object',text:'Return one non-food item to the place you want it to live.',reward:'Tiny collection shelf',icon:'📚'},
 {id:'prepare',title:'A favour for future you',text:'Place one item for a later activity where it will be easy to find.',reward:'Very important basket',icon:'🧺'}
];
export const dayKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
// Rejection sampling: ten equally weighted stones; no rarity or paid rerolls.
export function randomStone(draw=()=>crypto.getRandomValues(new Uint32Array(1))[0]) {
 const limit=2**32-(2**32%stones.length);
 for(let i=0;i<100;i++) {
  const value=draw();
  if(!Number.isInteger(value)||value<0||value>=2**32) throw new Error('Expected an unsigned 32-bit draw');
  if(value<limit) return value%stones.length;
 }
 throw new Error('Random source repeatedly returned rejected draws');
}
export const fresh = () => ({version:1,stone:6,stage:0,name:'',visits:[],lastVisit:0,garden:false,gifts:[],completed:[],active:null,quiet:false,motion:false,pinned:true});
export function restore(raw) {
 try {
  const x=JSON.parse(raw); if(x?.version!==1) return fresh();
  const s={...fresh(),...x};
  s.stone=Number.isInteger(x.stone)&&x.stone>=0&&x.stone<10?x.stone:6;
  s.stage=[0,1,2].includes(x.stage)?x.stage:0;
  s.name=typeof x.name==='string'?x.name.slice(0,32):'';
  for(const k of ['visits','gifts']) s[k]=Array.isArray(x[k])?[...new Set(x[k].filter(v=>typeof v==='string'))]:[];
  s.completed=Array.isArray(x.completed)?x.completed.filter(v=>v&&typeof v.id==='string'&&typeof v.day==='string'&&quests.some(q=>q.id===v.quest)):[];
  s.active=x.active&&typeof x.active.id==='string'&&quests.some(q=>q.id===x.active.quest)?x.active:null;
  return s;
 } catch {return fresh();}
}
export function visit(s,now=new Date()) {
 const day=dayKey(now); const next={...s,visits:[...s.visits]};
 // A moved-back clock cannot manufacture earlier visits or remove keepsakes.
 if(!next.visits.includes(day)&&(!next.visits.length||day>next.visits.at(-1))) next.visits.push(day);
 if(s.lastVisit&&now.getTime()-s.lastVisit>=3*86400000) next.garden=true;
 next.lastVisit=Math.max(Number(s.lastVisit)||0,now.getTime()); return next;
}
export function start(s,quest,id,small=false) {
 if(!quests.some(q=>q.id===quest)||s.stage!==2||s.active) return s;
 return {...s,active:{id,quest,small}};
}
export function confirm(s,day=dayKey()) {
 if(!s.active||s.completed.some(v=>v.id===s.active.id)) return s;
 return {...s,completed:[...s.completed,{...s.active,day}],active:null};
}
export const todayCount=(s,day=dayKey())=>new Set(s.completed.filter(v=>v.day===day).map(v=>v.id)).size;
export const owns=(s,id)=>s.completed.some(v=>v.quest===id);
// Only this explicit projection reaches a share card. Never export the full save.
export function postcard(s,includeName=false) {
 const stone=stones[s.stone]||stones[6];
 return {stone:stone[0],color:stone[2],name:includeName?String(s.name||stone[1]).slice(0,32):'A little someone',
  furnishings:quests.filter(q=>owns(s,q.id)).map(q=>q.reward),garden:Boolean(s.garden),
  star:s.gifts.length>0,badge:s.visits.length>=7&&s.pinned};
}
