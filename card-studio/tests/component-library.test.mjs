import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLibrary,filterLibrary,insertLibraryEntries,setLayerHue} from '../src/component-library.js';
import {imageFilter,validateDocument} from '../src/studio-export.js';

const layer=(id,extra={})=>({id,name:id,type:'text',text:'Editable 2',font:'Georgia',fontSize:20,color:'#fff000',align:'center',x:10,y:20,w:100,h:40,rotation:0,opacity:1,visible:true,locked:false,...extra});
const doc={id:'test',name:'Test',group:'Cards',width:360,height:540,layers:[layer('existing')]};
const source={id:'source',name:'Cost pair',group:'Combat',width:200,height:100,layers:[layer('icon',{groupId:'cost',type:'image',src:'/assets/v2/ref-sigil.png',visible:false,locked:true}),layer('value',{groupId:'cost',x:70})]};

test('library exposes complete assemblies and visible standalone parts without mutating sources',()=>{
  const library=buildLibrary([source]);
  assert.equal(library[0].category,'Assemblies');
  assert.equal(library[0].layers[0].visible,false);
  assert.equal(library.find(e=>e.id==='part:source:icon').layers[0].visible,true);
  assert.equal(library.find(e=>e.id==='part:source:value').layers[0].type,'text');
  assert.equal(source.layers[0].visible,false);
  assert.equal(filterLibrary(library,'COST','Assemblies').length,1);
  assert.ok(filterLibrary(library,'spent','Reference art').length>=2);
});

test('multi-insert preserves relative positions, live text, group membership and unique ids',()=>{
  const assembly=buildLibrary([source])[0];
  const first=insertLibraryEntries(doc,[assembly,assembly],'fixed');
  assert.equal(first.ids.length,4);assert.equal(new Set(first.ids).size,4);
  const added=first.document.layers.slice(1);
  assert.equal(added[1].x-added[0].x,60);
  assert.equal(added[0].groupId,added[1].groupId);
  assert.notEqual(added[0].groupId,added[2].groupId);
  assert.equal(added[1].text,'Editable 2');
  assert.ok(added.every(l=>l.visible&&!l.locked));
  const second=insertLibraryEntries(first.document,[assembly],'fixed');
  assert.equal(new Set(second.document.layers.map(l=>l.id)).size,7);
  assert.equal(doc.layers.length,1);
  validateDocument(second.document);
});

test('large assembly insertion scales text and geometry together and caps total layers',()=>{
  const large={...source,width:1000,height:1000};
  const added=insertLibraryEntries(doc,[buildLibrary([large])[0]]).document.layers[1];
  assert.equal(added.w,28.799999999999997);
  assert.equal(added.fontSize,5.76);
  assert.throws(()=>insertLibraryEntries({...doc,layers:Array.from({length:149},(_,i)=>layer(String(i)))},[buildLibrary([source])[0]]),/150/);
});

test('hue changes selected or every part and survives JSON validation while preserving tint',()=>{
  const input={...doc,layers:[layer('one',{redTint:35,locked:true}),layer('two',{visible:false})]};
  const selected=setLayerHue(input,['one'],60);
  assert.equal(selected.layers[0].hue,60);assert.equal(selected.layers[1].hue,undefined);
  const all=setLayerHue(selected,null,-120),roundtrip=validateDocument(JSON.parse(JSON.stringify(all)));
  assert.ok(roundtrip.layers.every(l=>l.hue===-120));
  assert.equal(roundtrip.layers[0].redTint,35);
  assert.match(imageFilter(roundtrip.layers[0]),/sepia\(0.35\).*hue-rotate\(-120deg\)/);
  assert.equal(imageFilter(roundtrip.layers[1]),'hue-rotate(-120deg)');
  assert.equal(imageFilter({...roundtrip.layers[1],hue:0}),'none');
  assert.throws(()=>validateDocument({...doc,layers:[layer('bad',{hue:181})]}),/Hue/);
  assert.throws(()=>setLayerHue(input,null,NaN),/Hue/);
  assert.equal(setLayerHue(input,null,999).layers[0].hue,180);
});
