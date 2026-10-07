import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomStone,stones} from '../dist/engine.mjs';
test('all ten specimen outcomes have equal integer buckets',()=>{
 const counts=Array(stones.length).fill(0);
 for(let i=0;i<1000;i++)counts[randomStone(()=>i)]++;
 assert.deepEqual(counts,Array(10).fill(100));
});
test('rejects remainder at upper end instead of skewing odds',()=>{
 const draws=[4294967295,4294967290,4294967289];
 assert.equal(randomStone(()=>draws.shift()),9);
});
test('zero draw and invalid sources handled explicitly',()=>{
 assert.equal(randomStone(()=>0),0);
 assert.throws(()=>randomStone(()=>-1));
 assert.throws(()=>randomStone(()=>4294967295));
});
