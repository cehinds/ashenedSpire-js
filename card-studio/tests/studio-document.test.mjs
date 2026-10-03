import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {presets,clone} from '../src/studio-data.js';
import {validateDocument,portableDocument,readPng} from '../src/studio-export.js';

globalThis.FileReader=class{readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onload?.()}).catch(e=>this.onerror?.(e))}};
globalThis.fetch=async url=>{const b=readFileSync(new URL('../public'+url,import.meta.url));return {ok:true,blob:async()=>new Blob([b],{type:'image/png'})}};

test('all 18 component documents validate and reference actual PNG assets',()=>{
  assert.equal(presets.length,18);
  for(const p of presets){assert.equal(validateDocument(p),p);assert.ok(p.layers.length>0);assert.equal(new Set(p.layers.map(l=>l.id)).size,p.layers.length);assert.ok(p.layers.every(l=>['text','image'].includes(l.type)));for(const l of p.layers.filter(l=>l.type==='image')){const bytes=readFileSync(new URL('../public'+l.src,import.meta.url));assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);}}
});
test('portable JSON round trip retains edits, layer ordering and exact PNG bytes',async()=>{
  const input=clone(presets[0]);input.layers.find(l=>l.id==='title').text='Portable card check';input.layers.find(l=>l.id==='rules').text='Deal 12 damage.\nApply 4 Bleed.';input.layers.find(l=>l.id==='mana-value').text='3';input.layers.find(l=>l.id==='art').x=-91;
  const portable=await portableDocument(input),roundtrip=validateDocument(JSON.parse(JSON.stringify(portable)));
  assert.equal(roundtrip.layers.find(l=>l.id==='mana-value').text,'3');assert.equal(roundtrip.layers.find(l=>l.id==='art').x,-91);assert.deepEqual(roundtrip.layers.map(l=>l.id),input.layers.map(l=>l.id));
  for(const l of roundtrip.layers.filter(l=>l.type==='image')){const original=input.layers.find(o=>o.id===l.id);assert.ok(l.src.startsWith('data:image/png;base64,'));assert.deepEqual(Buffer.from(l.src.split(',')[1],'base64'),readFileSync(new URL('../public'+original.src,import.meta.url)));}
});
test('import rejects malformed dimensions, unsupported sources and non-PNG uploads',async()=>{
  let d=clone(presets[0]);d.layers[0].w=-1;assert.throws(()=>validateDocument(d),/size/);d=clone(presets[0]);d.layers[0].src='javascript:alert(1)';assert.throws(()=>validateDocument(d),/Images/);await assert.rejects(readPng(new Blob(['<svg/>'],{type:'image/png'})),/PNG/);const bytes=readFileSync(new URL('../public/assets/v2/mana.png',import.meta.url));const value=await readPng(new Blob([bytes],{type:'image/png'}));assert.ok(value.startsWith('data:image/png;base64,'));
});
