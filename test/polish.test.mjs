import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completionLabel,companionLine,fresh,start,quests} from '../dist/engine.mjs';
import {keepsakes,keepsakeSvg,drawKeepsake} from '../dist/keepsakes.mjs';
test('completion copy handles one chore and demo singular',()=>{
 assert.equal(completionLabel(1),'1 self-reported chore');
 assert.equal(completionLabel(2),'2 self-reported chores');
 assert.equal(completionLabel(1,true),'1 simulated completion');
 assert.equal(completionLabel(3,true),'3 simulated completions');
});
test('starting a task does not replace the current companion reply',()=>{
 const s={...fresh(),stone:5,stage:2,name:'Moss Boss'},reply='Moss Boss. Yes, that is me.';
 assert.equal(companionLine(start(s,'landing','test'),reply),reply);
 assert.equal(companionLine({...s,quiet:true},reply),'Happy to sit here.');
});
test('room SVG and postcard canvas use identical keepsake geometry',()=>{
 for(const q of quests){
  const spec=keepsakes[q.id],svg=keepsakeSvg(q.id),drawn=[];
  const c={beginPath(){},roundRect(...args){drawn.push(args);},fill(){}};
  drawKeepsake(c,q.id,0,0);
  assert.deepEqual(drawn,spec.rects.map(r=>r.slice(0,5)));
  assert.equal((svg.match(/<rect /g)||[]).length,spec.rects.length);
  assert.ok(svg.includes(`viewBox="0 0 ${spec.width} ${spec.height}"`));
 }
 assert.equal(keepsakeSvg('unknown'),'');
});
