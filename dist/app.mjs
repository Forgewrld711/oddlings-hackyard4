import {stones,quests,dayKey,fresh,restore,visit,start,confirm,todayCount,owns,randomStone,postcard,completionLabel,companionLine} from './engine.mjs';
import {keepsakeSvg,drawKeepsake} from './keepsakes.mjs';
import {mountArcade} from './arcade.mjs';
const $=id=>document.getElementById(id), key='oddlings:v1';
let storage=true, state; try{state=visit(restore(localStorage.getItem(key)));}catch{state=visit(fresh());storage=false;}
let demo=false, realState=null, small=false, check=false, petReply='',realReply='';
function save(){if(!demo&&storage){try{localStorage.setItem(key,JSON.stringify(state));}catch{storage=false;}}}
function announce(text){$('status').textContent=text;}
function update(next,text){state=next;save();render();if(text)announce(text);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const [stone,name,color,line]=stones[state.stone], petName=state.name||name;
 document.documentElement.style.setProperty('--gem',color);
 document.body.classList.toggle('still',state.motion);
 $('pet').className='pet '+(state.stage===1?'half':state.stage===2?'hatched':'');
 $('arrival').hidden=state.stage!==0;$('hatching').hidden=state.stage!==1;$('resident').hidden=state.stage!==2;
 $('room-title').textContent=`SPECIMEN ${String(state.stone+1).padStart(2,'0')} / ${stone.toUpperCase()}`;
 $('room-caption').textContent=state.stage===0?'Something in there is looking back.':state.stage===1?'Two eyes. One very small situation.':state.quiet?'Quiet company. Nothing required.':state.garden?'I tried gardening.':`${petName} is making itself extremely at home.`;
 $('stone-description').textContent=`${state.stone+1} / ${stone}`;
 $('specimens').innerHTML=stones.map((s,i)=>`<button style="--swatch:${s[2]}" aria-label="Choose specimen ${i+1}: ${escape(s[0])}" aria-pressed="${state.stone===i}" data-stone="${i}">${i+1}</button>`).join('');
 $('hatch-line').textContent=`“I am ${name}. ${line}”`;
 $('pet-name').textContent=petName;$('pet-line').textContent=companionLine(state,petReply);
 if(document.activeElement!==$('nickname'))$('nickname').value=petName;
 $('board-name').textContent=state.stage===2?petName:'Future roommate';
 $('badges').textContent=state.visits.length>=7&&state.pinned?'✳ AT HOME':state.gifts.length?'✧ YAY':'';
 $('balloons').innerHTML=Array.from({length:Math.min(state.visits.length,7)},()=>'<span class="balloon"></span>').join('');
 $('furniture').innerHTML=quests.filter(q=>owns(state,q.id)).map(q=>`<span role="img" title="${q.reward}" aria-label="${q.reward}">${keepsakeSvg(q.id)}</span>`).join('');
 $('garden').hidden=!state.garden;
 $('pet-play').hidden=state.stage!==2;
 $('quiet').checked=state.quiet;$('motion').checked=state.motion;
 $('demo-banner').hidden=!demo;$('demo').hidden=demo;$('exit-demo').hidden=!demo;
 const given=state.gifts.includes(dayKey());$('gift').disabled=given;$('gift').textContent=given?'A star, already yours':'Open my gift ↗';
 $('gift-note').textContent=given?'✧ A crooked little star. Keep it.':'';
 $('visit-text').textContent=`${Math.min(state.visits.length,7)} of 7 welcome visits. Different days, not consecutive. Nothing resets.`;
 $('pin').hidden=state.visits.length<7;$('pin').textContent=state.pinned?'Put badge away':'Pin At Home badge';$('party').hidden=state.visits.length<7;
 if(state.stage===2)renderQuest();
 if(!storage)announce('Browser storage unavailable. This room will last only for this open session.');
}
function renderQuest(){
 const area=$('quest-area');
 if(!state.active){
  area.innerHTML=`<p class="eyebrow">${demo?'SIMULATED DEMO CHOICES':'ONE SMALL REAL-WORLD THING'}</p><h3>A room begins with a little room.</h3><p>No countdown. Choose what fits, or just hang out.</p>${quests.map(q=>`<button class="quest-choice" data-quest="${q.id}">${q.title}<span>${q.icon}</span></button>`).join('')}<p>${state.completed.length?`${completionLabel(state.completed.length,demo)}. Your furnishings stay.`:'Your pet is here whether you do a chore or not.'}</p>`;
 } else {
  const q=quests.find(q=>q.id===state.active.quest);
  area.innerHTML=`<p class="eyebrow">${demo?'SIMULATED DEMO TASK':'YOUR REAL-WORLD QUEST'}</p><h3>${q.title}</h3><p>${state.active.small?q.small:q.text}</p>${q.id==='landing'?`<label class="small-choice"><input id="small-task" type="checkbox" ${state.active.small?'checked':''}> Make it one object instead</label>`:''}<p>Room keepsake: ${q.reward.toLowerCase()}.</p><label class="confirmation"><input id="confirm-check" type="checkbox" ${check?'checked':''}>${demo?'Simulate this completion in the demo only.':'I actually did this in my world. This is my own report.'}</label><button class="primary" id="confirm" ${check?'':'disabled'}>${demo?'Simulate furnishing':'Done — make a little home'} ↗</button><button class="text-button" id="skip">Not now — put this task away</button>`;
 }
 $('celebration').innerHTML='<button id="share">Make a share postcard ↗</button>'+(todayCount(state)>=3?'<button id="confetti">Three little things. Release the confetti ✳</button>':'');
}
$('specimens').addEventListener('click',e=>{const b=e.target.closest('[data-stone]');if(b&&state.stage===0){const index=Number(b.dataset.stone);update({...state,stone:index});$('pull-result').textContent='Your pick. You can hatch this one or pull a mystery stone.';$('random').textContent='✳ Can’t choose? Pull a mystery stone';$('specimens').querySelector(`[data-stone="${index}"]`).focus();}});
$('random').onclick=()=>{
 if(state.stage!==0)return;
 try {
  const index=randomStone();update({...state,stone:index});
  $('pull-result').textContent=`You pulled ${stones[index][0]} — specimen ${index+1}. A tiny roommate is waiting. Keep it, choose another number, or pull again.`;
  $('random').textContent='✳ Pull another mystery stone';
  $('pet').classList.remove('pulled');void $('pet').offsetWidth;$('pet').classList.add('pulled');
 } catch { $('pull-result').textContent='The drawer stuck. You can still choose any number yourself.'; }
};
$('hatch').onclick=()=>{update({...state,stage:1},'The stone cracked. Your roommate introduced itself.');$('finish-hatch').focus();};
$('finish-hatch').onclick=()=>{update({...state,stage:2,name:stones[state.stone][1]},'Your Oddling is home. Choose a task or just play.');$('nickname').focus();};
$('rename-form').onsubmit=e=>{e.preventDefault();const name=$('nickname').value.trim().slice(0,32)||stones[state.stone][1];petReply=`${name}. Yes, that is me.`;update({...state,name},'Name on the door saved.');};
$('quest-area').addEventListener('click',e=>{
 const b=e.target.closest('[data-quest]');if(b){check=false;small=false;update(start(state,b.dataset.quest,crypto.randomUUID()));$('confirm-check').focus();}
 if(e.target.id==='skip'){check=false;update({...state,active:null},'Task put away. Nothing lost.');$('quest-area').querySelector('[data-quest]').focus();}
 if(e.target.id==='confirm'&&check&&state.active){const q=quests.find(q=>q.id===state.active.quest);check=false;petReply='Excellent. The furniture is load-bearing.';update(confirm(state),`${q.reward} added. Completion ${demo?'simulated':'self-reported'}.`);$('quest-area').querySelector('[data-quest]').focus();}
});
$('quest-area').addEventListener('change',e=>{
 if(e.target.id==='confirm-check'){check=e.target.checked;$('confirm').disabled=!check;}
 if(e.target.id==='small-task'){state={...state,active:{...state.active,small:e.target.checked}};check=false;save();renderQuest();}
});
$('light').oninput=e=>document.documentElement.style.setProperty('--light',`${e.target.value}%`);
$('room').addEventListener('pointermove',e=>{if(state.motion||matchMedia('(prefers-reduced-motion: reduce)').matches||e.pointerType==='touch')return;const r=$('room').getBoundingClientRect();const p=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));$('light').value=p;document.documentElement.style.setProperty('--light',`${p}%`);});
$('pet-play').onclick=()=>{const line=state.quiet?'A small wave.':stones[state.stone][3];$('room-caption').textContent=line;announce(line);};
$('gift').onclick=()=>{if(state.gifts.includes(dayKey()))return;update({...state,gifts:[...state.gifts,dayKey()]},'Today’s star is yours. No chores required.');};
$('settings').onclick=()=>{const open=$('preferences').hidden;$('preferences').hidden=!open;$('settings').setAttribute('aria-expanded',String(open));};
$('quiet').onchange=e=>update({...state,quiet:e.target.checked});$('motion').onchange=e=>update({...state,motion:e.target.checked});
$('pin').onclick=()=>update({...state,pinned:!state.pinned},'Badge display updated. You still own it.');
function confetti(){
 $('room').classList.add('party');$('particles').replaceChildren();
 if(!state.motion&&!matchMedia('(prefers-reduced-motion: reduce)').matches){for(let i=0;i<30;i++){const s=document.createElement('span');s.textContent=i%4?'✦':'✋';s.style.left=`${Math.random()*95}%`;s.style.animationDelay=`${Math.random()*.5}s`;$('particles').append(s);}setTimeout(()=>$('particles').replaceChildren(),3500);}
 $('room-caption').textContent='I inspected the lever. The lever won.';announce('A crown and a celebration. No sound.');
}
$('celebration').onclick=e=>{if(e.target.id==='confetti'&&todayCount(state)>=3)confetti();if(e.target.id==='share'){ $('share-name').checked=false;$('share-feedback').textContent='';drawPostcard();$('share-dialog').showModal();}};
function drawPostcard(){
 const p=postcard(state,$('share-name').checked), c=$('share-canvas').getContext('2d');
 c.clearRect(0,0,1200,900);c.fillStyle='#f5f0e7';c.fillRect(0,0,1200,900);
 function box(x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
 function text(s,x,y,size=24,color='#29382f'){c.fillStyle=color;c.font=`${size}px Georgia,serif`;c.fillText(s,x,y);}
 box(50,125,1100,650,28,'#e6dfcb');box(50,590,1100,185,0,'#d7cbb0');
 box(120,195,175,220,[85,85,6,6],'#f7f4df');box(135,212,145,185,[70,70,0,0],'#bfced0');
 c.fillStyle='#f7f4df';c.fillRect(202,213,10,185);c.fillRect(135,295,145,10);
 box(830,200,250,150,8,'#d1bea0');box(840,210,230,130,5,'#f0e5cd');
 c.save();c.beginPath();c.rect(850,210,210,130);c.clip();
 // Fit the optional nickname without letting it escape the name board.
 let size=28;c.font=`${size}px Georgia`;while(c.measureText(p.name).width>205&&size>12){size--;c.font=`${size}px Georgia`;}
 text(p.name,853,265,size);text(p.badge?'✳ AT HOME':p.star?'✧ YAY':'A LITTLE HOME',865,315,22);c.restore();
 c.fillStyle='#b4bea0';c.beginPath();c.ellipse(590,677,255,60,0,0,Math.PI*2);c.fill();
 const g=c.createRadialGradient(560,400,5,600,550,190);g.addColorStop(0,'#fffdf6');g.addColorStop(.45,p.color);g.addColorStop(1,'#707568');
 box(470,385,245,260,95,g);
 c.strokeStyle='#ffffff77';c.lineWidth=3;c.beginPath();c.moveTo(500,415);c.lineTo(650,438);c.lineTo(704,555);c.lineTo(560,603);c.closePath();c.stroke();
 for(const x of [536,639]){c.fillStyle='#ddc499';c.beginPath();c.ellipse(x,505,33,41,0,0,Math.PI*2);c.fill();c.fillStyle='#182b29';c.beginPath();c.ellipse(x,505,27,35,0,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x-10,491,9,0,Math.PI*2);c.fill();}
 c.strokeStyle='#4a4741';c.lineWidth=4;c.beginPath();c.arc(587,549,15,0,Math.PI);c.stroke();
 box(460,615,74,40,20,p.color);box(650,615,74,40,20,p.color);
 box(150,565,60,85,8,'#c98b68');c.strokeStyle='#708856';c.lineWidth=13;c.beginPath();c.moveTo(180,566);c.lineTo(180,445);c.stroke();
 for(const [x,y,r] of [[153,495,-.6],[208,465,.6],[155,451,-.6]]){c.fillStyle='#819565';c.beginPath();c.ellipse(x,y,35,14,r,0,Math.PI*2);c.fill();}
 if(p.furnishings.includes('Bottle-cap stool'))drawKeepsake(c,'landing',800,620);
 if(p.furnishings.includes('Tiny collection shelf'))drawKeepsake(c,'rescue',943,502);
 if(p.furnishings.includes('Very important basket'))drawKeepsake(c,'prepare',950,635);
 if(p.garden)text('❧   ❧',290,655,42,'#708856');
 text('✳ oddlings',65,82,42);text('FIELD CLUB / A TINY ROOMMATE',770,78,19);
 text('Thought it was just a rock. It had other plans.',65,835,26);text('#oddling',980,835,27);
 if(demo)text('DEMO ROOM',70,160,18);
 $('share-canvas').setAttribute('aria-label',`${p.stone} Oddling, ${p.name}, with ${p.furnishings.length} furnishings. ${demo?'Demo room.':''}`);
}
$('share-name').onchange=drawPostcard;
$('close-share').onclick=()=>{$('share-dialog').close();$('share').focus();};
$('download-card').onclick=()=>{$('share-canvas').toBlob(blob=>{if(!blob){$('share-feedback').textContent='Could not create PNG. Please try again.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='oddling-postcard.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);$('share-feedback').textContent='PNG download requested. Nothing was uploaded.';},'image/png');};
$('copy-caption').onclick=async()=>{try{await navigator.clipboard.writeText($('share-caption').textContent);$('share-feedback').textContent='Caption copied. Share it wherever you choose.';}catch{$('share-feedback').textContent='Clipboard unavailable. Select the caption above and copy it manually.';}};
$('party').onclick=()=>{$('balloons').replaceChildren();confetti();};
$('demo').onclick=()=>{realState=state;realReply=petReply;petReply='';demo=true;check=false;state=visit(fresh());$('room').classList.remove('party');$('pull-result').textContent='Ten stones. Equal chances. Free pulls. You still decide when to hatch.';render();announce('Separate demo room. Real progress is untouched.');};
$('exit-demo').onclick=()=>{demo=false;check=false;state=realState;realState=null;petReply=realReply;realReply='';$('room').classList.remove('party');$('particles').replaceChildren();render();announce('Back in your real room.');};
save();render();
mountArcade(()=>({name:state.name||stones[state.stone][1],color:stones[state.stone][2],still:state.motion}));
// Refresh the local-day visit only while the page is visibly in use.
document.addEventListener('visibilitychange',()=>{if(!document.hidden)update(visit(state));});
