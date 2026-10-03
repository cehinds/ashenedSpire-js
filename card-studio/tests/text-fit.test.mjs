import test from 'node:test';
import assert from 'node:assert/strict';
import {fitTextLayout,documentBounds} from '../src/studio-export.js';
import {presets} from '../src/studio-data.js';
const ctx={font:'',measureText(value){return {width:value.length*Number(this.font.match(/([\d.]+)px/)[1])*.5}}};
test('long rules retain a readable floor and two centered lines with ellipsis',()=>{
 const layer={id:'rules',text:'First row\nSecond row\nThird row\nFourth row\nFifth row\nSixth row\nSeventh row',w:300,h:110,font:'Georgia',fontSize:41,minFontSize:30,maxFontSize:41,maxLines:2};
 const fit=fitTextLayout(ctx,layer);assert.equal(fit.fontSize,30);assert.equal(fit.lines.length,2);assert.match(fit.lines[1],/…$/);assert.ok(fit.y>0);
 const short=fitTextLayout(ctx,{...layer,text:'Deal 5 damage.\nApply 2 Bleed.'});assert.equal(short.fontSize,41);assert.equal(short.lines.length,2);
});
test('PNG bounds contain the complete visible pennants but ignore clipped oversized art',()=>{
 for(const id of ['gorefire','gorefire-stamina']){
  const doc=presets.find(p=>p.id===id),b=documentBounds(doc),flag=doc.layers.find(l=>l.id==='flag');
  assert.ok(b.x<flag.x);assert.ok(b.y<flag.y);assert.ok(b.w>=doc.width-b.x);assert.ok(b.h>=doc.height-b.y);
 }
});
