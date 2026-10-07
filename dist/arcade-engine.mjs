// Session-only play. This module has no room state, storage, currency or network access.
export const oddObjects = [
 {name:'Stray sock',symbol:'🧦',width:30,height:28},
 {name:'Ball with places to be',symbol:'⚽',width:30,height:30},
 {name:'Very small dog',symbol:'🐕',width:38,height:29},
 {name:'Indoor moon',symbol:'🌙',width:33,height:34}
];
export const runner = () => ({mode:'ready',y:0,velocity:0,x:850,cleared:0,object:0});
export function hop(s){return s.mode==='running'&&s.y===0?{...s,velocity:465}:s;}
export function stepRunner(s,seconds){
 if(s.mode!=='running')return s;
 const dt=Math.min(.05,Math.max(0,Number.isFinite(seconds)?seconds:0));
 const velocity=s.velocity-1100*dt,y=Math.max(0,s.y+velocity*dt),x=s.x-220*dt;
 let next={...s,x,y,velocity:y===0?0:velocity};
 const obstacle=oddObjects[s.object%oddObjects.length];
 // Slightly inset hitboxes; horizontal overlap matters only below the object's top.
 if(x+obstacle.width-5>111&&x+5<145&&y<obstacle.height-6)return {...next,mode:'bumped'};
 if(x+obstacle.width<100){
  const cleared=s.cleared+1;
  next={...next,cleared,object:s.object+1,x:850,mode:cleared>=8?'finished':'running'};
 }
 return next;
}
export const pairSymbols=[{name:'Sock',symbol:'🧦'},{name:'Moon',symbol:'🌙'},{name:'Oddling',symbol:'✳'}];
export function pairs(draw=Math.random){
 const deck=[0,0,1,1,2,2];
 for(let i=deck.length-1;i>0;i--){const n=draw();if(!Number.isFinite(n)||n<0||n>=1)throw new Error('Invalid shuffle draw');const j=Math.floor(n*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 return {deck,open:[],matched:[]};
}
export function flipPair(s,index){
 if(!Number.isInteger(index)||index<0||index>=6||s.open.length===2||s.open.includes(index)||s.matched.includes(index))return s;
 const open=[...s.open,index];
 if(open.length===2&&s.deck[open[0]]===s.deck[open[1]])return {...s,open:[],matched:[...s.matched,...open]};
 return {...s,open};
}
export function turnPairs(s){return s.open.length===2?{...s,open:[]}:s;}
