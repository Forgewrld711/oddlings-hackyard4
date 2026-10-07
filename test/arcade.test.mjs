import test from 'node:test';
import assert from 'node:assert/strict';
import {runner,hop,stepRunner,pairs,flipPair,turnPairs} from '../dist/arcade-engine.mjs';
test('runner moves only while running and caps long frame gaps',()=>{
 const ready=runner();assert.equal(stepRunner(ready,1),ready);
 const live={...ready,mode:'running'};assert.equal(stepRunner(live,100).x,839);
 assert.equal(stepRunner({...live,mode:'paused'},1).x,850);
 assert.equal(stepRunner(live,NaN).x,850);
});
test('jump cannot stack in mid-air; safely returns to ground',()=>{
 let s=stepRunner(hop({...runner(),mode:'running'}),.02);
 assert.ok(s.y>0);assert.equal(hop(s),s);
 for(let i=0;i<55;i++)s=stepRunner(s,.02);
 assert.equal(s.y,0);assert.equal(s.velocity,0);
});
test('collision stops this wander only; sufficient height clears obstacle',()=>{
 const near={...runner(),mode:'running',x:120};
 assert.equal(stepRunner(near,.01).mode,'bumped');
 assert.equal(stepRunner({...near,y:80},.01).mode,'running');
});
test('eight cleared objects finish; counters do not advance after finishing',()=>{
 const s=stepRunner({...runner(),mode:'running',x:20,cleared:7},.01);
 assert.equal(s.cleared,8);assert.equal(s.mode,'finished');assert.equal(stepRunner(s,1),s);
});
test('matching deck has exactly three pairs and no timer',()=>{
 const s=pairs(()=>.4);assert.deepEqual([...s.deck].sort(),[0,0,1,1,2,2]);
 assert.deepEqual(Object.keys(s).sort(),['deck','matched','open']);
 assert.throws(()=>pairs(()=>1));
});
test('mismatch waits for explicit turn-over and preserves existing matches',()=>{
 const s={deck:[0,1,0,1,2,2],open:[],matched:[4,5]};
 const mismatch=flipPair(flipPair(s,0),1);
 assert.deepEqual(mismatch.open,[0,1]);assert.equal(flipPair(mismatch,2),mismatch);
 assert.deepEqual(turnPairs(mismatch).matched,[4,5]);assert.deepEqual(turnPairs(mismatch).open,[]);
});
test('matching cards stays matched; duplicate and invalid flips are harmless',()=>{
 const s={deck:[0,0,1,1,2,2],open:[],matched:[]};let next=flipPair(s,0);
 assert.equal(flipPair(next,0),next);next=flipPair(next,1);
 assert.deepEqual(next.matched,[0,1]);assert.deepEqual(next.open,[]);
 assert.equal(flipPair(next,-1),next);assert.equal(flipPair(next,9),next);assert.equal(flipPair(next,0),next);
});
