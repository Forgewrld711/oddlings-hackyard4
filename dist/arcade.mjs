import {oddObjects,runner,hop,stepRunner,pairs,flipPair,turnPairs,pairSymbols} from './arcade-engine.mjs';
export function mountArcade(profile){
 const $=id=>document.getElementById(id), dialog=$('arcade-dialog'),canvas=$('hops-canvas'),c=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let run=runner(),cards=pairs(),frame=0,last=0,opener=null,game='';
 const still=()=>profile().still||reduced.matches;
 const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
 function paint(){
  const p=profile(),ground=237,o=oddObjects[run.object%oddObjects.length];
  c.clearRect(0,0,900,300);c.fillStyle='#e7eada';c.fillRect(0,0,900,300);
  c.fillStyle='#f4f0df';c.beginPath();c.arc(740,75,38,0,Math.PI*2);c.fill();
  c.fillStyle='#8b9c75';c.font='19px Georgia';c.fillText('THE HALLWAY OF UNATTENDED OBJECTS',28,38);
  c.fillStyle='#d6c9ae';c.fillRect(0,ground,900,63);c.strokeStyle='#ada58d';c.beginPath();c.moveTo(0,ground);c.lineTo(900,ground);c.stroke();
  c.fillStyle='#53634525';c.beginPath();c.ellipse(130,244,28,7,0,0,Math.PI*2);c.fill();
  const y=ground-48-run.y,g=c.createLinearGradient(106,y,150,y+46);g.addColorStop(0,'#fff9ed');g.addColorStop(1,p.color);
  c.fillStyle=g;c.beginPath();c.roundRect(106,y,48,48,17);c.fill();
  c.fillStyle='#29382f';for(const x of [119,139]){c.beginPath();c.arc(x,y+20,4,0,Math.PI*2);c.fill();}
  c.strokeStyle='#29382f';c.beginPath();c.arc(129,y+28,6,0,Math.PI);c.stroke();
  c.font='34px "Segoe UI Emoji",sans-serif';c.fillText(o.symbol,run.x,ground-2);
  c.fillStyle='#536345';c.font='17px Georgia';c.fillText(`${run.cleared} / 8 odd objects · no room rewards required`,28,280);
  canvas.setAttribute('aria-label',`Pocket Hops. ${p.name} has passed ${run.cleared} of eight objects. Next: ${o.name}. Space or Up jumps; P pauses.`);
 }
 function controls(message){
  $('hops-status').textContent=message;
  $('hops-start').textContent=run.mode==='ready'?'Start a wander':'Fresh wander';
  $('hops-start').disabled=still();$('hops-jump').disabled=run.mode!=='running';
  $('hops-pause').disabled=!['running','paused'].includes(run.mode);$('hops-pause').textContent=run.mode==='paused'?'Resume':'Pause';
 }
 function pause(message='Wander paused. Nothing lost.'){
  if(run.mode!=='running')return;stop();run={...run,mode:'paused'};controls(message);paint();
 }
 function tick(now){
  if(!dialog.open||game!=='hops'||run.mode!=='running')return;
  if(still()){pause('Still scenes are on. Try Odd Pairs, or turn off reduced motion before another wander.');return;}
  const before=run.cleared;run=stepRunner(run,last?(now-last)/1000:0);last=now;paint();
  if(run.mode==='bumped'){stop();controls('An odd object claimed the hallway. Your room is unchanged. Fresh wander whenever you like.');}
  else if(run.mode==='finished'){stop();controls('Eight odd objects navigated. Extremely professional nonsense. Play again or just rest.');}
  else{if(run.cleared!==before)$('hops-status').textContent=`${run.cleared} odd objects passed. Next: ${oddObjects[run.object%4].name}.`;frame=requestAnimationFrame(tick);}
 }
 function launch(){
  if(still()){controls('Still scenes are on. Odd Pairs is the no-motion option.');return;}
  stop();run={...runner(),mode:'running'};controls('Wandering. Jump over the odd objects; pause whenever.');paint();frame=requestAnimationFrame(tick);canvas.focus();
 }
 function togglePause(){
  if(run.mode==='running')pause();
  else if(run.mode==='paused'&&!still()){run={...run,mode:'running'};controls('Wander resumed.');last=0;frame=requestAnimationFrame(tick);}
 }
 function drawPairs(){
  $('pairs-board').replaceChildren();
  cards.deck.forEach((value,i)=>{
   const matched=cards.matched.includes(i),face=matched||cards.open.includes(i),item=pairSymbols[value],b=document.createElement('button');
   b.className='pair-card';b.dataset.index=i;b.dataset.face=face;b.dataset.match=matched;
   b.disabled=matched||cards.open.includes(i)||(cards.open.length===2&&!face);
   b.setAttribute('aria-label',face?`Card ${i+1}: ${item.name}${matched?', matched':''}`:`Turn over card ${i+1}`);
   const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');icon.textContent=face?item.symbol:'✧';
   const label=document.createElement('small');label.textContent=face?(matched?`${item.name} · matched`:item.name):`Card ${i+1}`;
   b.append(icon,label);$('pairs-board').append(b);
  });
  $('pairs-turn').hidden=cards.open.length!==2;
  const count=cards.matched.length/2;
  $('pairs-status').textContent=count===3?'All three pairs found. No clock was harmed in the making of this game.':cards.open.length===2?'Different little things. Turn them over whenever you are ready.':`${count} of 3 pairs found. ${cards.open.length?'Choose one more card.':'Pick any card.'}`;
 }
 function open(kind,source){
  stop();opener=source;game=kind;$('hops-game').hidden=kind!=='hops';$('pairs-game').hidden=kind!=='pairs';
  $('arcade-game-title').textContent=kind==='hops'?'Pocket Hops.':'Odd Pairs.';
  $('arcade-description').textContent=kind==='hops'?'For passing time, waiting, or fun. A tiny roommate meets a hallway full of nonsense.':'For passing time, waiting, or fun. Find the socks, moons and Oddlings that belong together.';
  if(kind==='hops'){run=runner();paint();controls(still()?'Still scenes are on. Try Odd Pairs for a game without movement.':'Ready for a little nonsense?');}
  else{cards=pairs();drawPairs();}
  if(!dialog.open)dialog.showModal();$('close-arcade').focus();
 }
 $('open-hops').onclick=()=>open('hops',$('open-hops'));$('open-pairs').onclick=()=>open('pairs',$('open-pairs'));
 $('switch-pairs').onclick=()=>open('pairs',opener);
 $('close-arcade').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{stop();game='';opener?.focus();});
 $('hops-start').onclick=launch;$('hops-jump').onclick=()=>{run=hop(run);};$('hops-pause').onclick=togglePause;
 canvas.addEventListener('pointerdown',()=>{run=hop(run);});
 canvas.addEventListener('keydown',e=>{if(['Space','ArrowUp','KeyP'].includes(e.code)){e.preventDefault();if(e.code==='KeyP')togglePause();else if(!e.repeat)run=hop(run);}});
 $('pairs-board').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(!b)return;const i=Number(b.dataset.index),before=cards.matched.length;cards=flipPair(cards,i);drawPairs();
  if(cards.open.length===2)$('pairs-turn').focus();else if(cards.matched.length===6)$('pairs-reset').focus();else if(cards.matched.length!==before)$('pairs-board').querySelector('button:not(:disabled)')?.focus();else ($('pairs-board').querySelector(`[data-index="${i+1}"]:not(:disabled)`)||$('pairs-board').querySelector('button:not(:disabled)'))?.focus();
 });
 $('pairs-turn').onclick=()=>{cards=turnPairs(cards);drawPairs();$('pairs-board').querySelector('button:not(:disabled)')?.focus();};
 $('pairs-reset').onclick=()=>{cards=pairs();drawPairs();$('pairs-board').querySelector('button')?.focus();};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause('Paused while you were away. Resume when you feel like it.');});
 window.addEventListener('blur',()=>pause());reduced.addEventListener('change',()=>{if(reduced.matches)pause('Reduced motion is on. Odd Pairs is a still alternative.');});
}
