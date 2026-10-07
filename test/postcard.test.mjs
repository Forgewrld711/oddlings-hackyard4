import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,postcard} from '../dist/engine.mjs';
test('postcard exports only a visual allowlist, with nickname hidden by default',()=>{
 const s={...fresh(),name:'PRIVATE NAME',email:'SECRET EMAIL',active:{text:'PRIVATE TASK'},reminders:['PRIVATE MED'],completed:[{quest:'landing',day:'PRIVATE DATE'}]};
 const p=postcard(s);
 assert.deepEqual(Object.keys(p),['stone','color','name','furnishings','garden','star','badge']);
 assert.equal(p.name,'A little someone');assert.deepEqual(p.furnishings,['Bottle-cap stool']);
 assert.doesNotMatch(JSON.stringify(p),/PRIVATE|SECRET/);
});
test('nickname is included only on explicit opt-in and bounded',()=>{
 assert.equal(postcard({...fresh(),name:'Flicker'},true).name,'Flicker');
 assert.equal(postcard({...fresh(),name:'x'.repeat(99)},true).name.length,32);
});
