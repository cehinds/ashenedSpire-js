import {innerPolygon} from './studio-data.js';
export function imageFilter(l){const amount=(l.redTint||0)/100;const base=amount?`sepia(${amount}) saturate(${1+amount}) hue-rotate(320deg) drop-shadow(0 0 ${1+amount}px rgba(140,35,25,${amount*.8}))`:l.filter||'';const hue=Number.isFinite(l.hue)?Math.max(-180,Math.min(180,l.hue)):0;return [base==='none'?'':base,hue?`hue-rotate(${hue}deg)`:''].filter(Boolean).join(' ')||'none'}
export function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export function validateDocument(v){if(!v||typeof v!=='object'||!Array.isArray(v.layers)||v.layers.length>150)throw Error('Choose a card studio JSON document.');for(const k of ['width','height'])if(!Number.isFinite(v[k])||v[k]<10||v[k]>4000)throw Error('Document dimensions must be between 10 and 4000.');for(const l of v.layers){if(!['image','text'].includes(l.type))throw Error('Unsupported layer type.');for(const k of ['x','y','w','h','rotation','opacity'])if(!Number.isFinite(l[k]))throw Error('Layer dimensions are invalid.');if(l.w<1||l.h<1||l.w>10000||l.h>10000)throw Error('Layer size is invalid.');if(l.hue!==undefined&&(!Number.isFinite(l.hue)||l.hue < -180||l.hue > 180))throw Error('Hue must be between -180 and 180.');if(l.redTint!==undefined&&(!Number.isFinite(l.redTint)||l.redTint<0||l.redTint>100))throw Error('Red tint must be between 0 and 100.');if(l.type==='image'&&!/^\/(assets)\/|^data:image\/png;base64,/.test(l.src))throw Error('Images must be local assets or embedded PNG files.');if(l.type==='text'&&(typeof l.text!=='string'||l.text.length>10000))throw Error('Text is invalid.')}return v}
export function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('One image could not be loaded.'));img.src=src})}
export async function readPng(file){if(!file||file.size>12*1024*1024)throw Error('Choose a PNG smaller than 12 MB.');const bytes=new Uint8Array(await file.arrayBuffer());if(![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))throw Error('Choose a PNG image.');return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
export async function portableDocument(doc){const out=structuredClone(doc);for(const l of out.layers){if(l.type!=='image'||l.src.startsWith('data:'))continue;const response=await fetch(l.src);if(!response.ok)throw Error('An image asset is not ready.');const blob=await response.blob();l.src=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(blob)})}return out}
function wrap(ctx,text,max){return text.split('\n').flatMap(line=>{if(!line)return [''];let result=[],current='';for(const word of line.split(' ')){const next=current?current+' '+word:word;if(current&&ctx.measureText(next).width>max){result.push(current);current=word}else current=next}return [...result,current]})}
export function documentBounds(doc){
 let left=0,top=0,right=doc.width,bottom=doc.height;
 for(const l of doc.layers){
  if(!l.visible||l.clip)continue;
  const rad=l.rotation*Math.PI/180,c=Math.abs(Math.cos(rad)),s=Math.abs(Math.sin(rad));
  const w=l.w*c+l.h*s,h=l.w*s+l.h*c,cx=l.x+l.w/2,cy=l.y+l.h/2;
  left=Math.min(left,cx-w/2);top=Math.min(top,cy-h/2);right=Math.max(right,cx+w/2);bottom=Math.max(bottom,cy+h/2);
 }
 return {x:Math.floor(left)-2,y:Math.floor(top)-2,w:Math.ceil(right)-Math.floor(left)+4,h:Math.ceil(bottom)-Math.floor(top)+4};
}
export function fitTextLayout(ctx,l){
 const max=l.maxFontSize||l.fontSize,min=Math.min(max,l.minFontSize||max*.7),limit=l.maxLines||(l.id==='rules'?2:1);
 const measure=size=>{ctx.font=`${l.fontWeight||'normal'} ${size}px ${l.font}`;return wrap(ctx,l.text,l.w)};
 const fits=size=>{const lines=measure(size);return lines.length<=limit&&lines.length*size*1.25<=l.h&&lines.every(line=>ctx.measureText(line).width<=l.w)};
 let fontSize=max;
 if(l.autoFit!==false&&!fits(max)){let lo=min,hi=max;for(let i=0;i<8;i++){const mid=(lo+hi)/2;if(fits(mid))lo=mid;else hi=mid}fontSize=lo}
 let lines=measure(fontSize),truncated=lines.length>limit;
 lines=lines.slice(0,limit);
 if(truncated){let last=lines[lines.length-1];while(last&&ctx.measureText(last+'…').width>l.w)last=last.slice(0,-1);lines[lines.length-1]=last.trimEnd()+'…'}
 return {fontSize,lines,lineHeight:fontSize*1.25,y:l.verticalAlign==='top'?0:Math.max(0,(l.h-lines.length*fontSize*1.25)/2)};
}
export async function exportPng(doc){
 await document.fonts.ready;
 const canvas=document.createElement('canvas'),b=documentBounds(doc);
 canvas.width=b.w*2;canvas.height=b.h*2;
 const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.translate(-b.x,-b.y);
 for(const l of doc.layers){
  if(!l.visible)continue;ctx.save();
  if(l.clip&&doc.clipShape==='card'){ctx.beginPath();innerPolygon.forEach(([x,y],i)=>i?ctx.lineTo(x*doc.width,y*doc.height):ctx.moveTo(x*doc.width,y*doc.height));ctx.closePath();ctx.clip()}
  ctx.globalAlpha=l.opacity;ctx.translate(l.x+l.w/2,l.y+l.h/2);ctx.rotate(l.rotation*Math.PI/180);ctx.translate(-l.w/2,-l.h/2);ctx.filter=imageFilter(l);
  if(l.type==='image'){
   const img=await loadImage(l.src);
   if(l.trim)ctx.drawImage(img,...l.trim,0,0,l.w,l.h);
   else if(l.fit==='contain'||l.id==='art'){const scale=Math.min(l.w/img.naturalWidth,l.h/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;ctx.drawImage(img,(l.w-w)/2,(l.h-h)/2,w,h)}
   else ctx.drawImage(img,0,0,l.w,l.h);
  }else{
   const text=fitTextLayout(ctx,l);ctx.fillStyle=l.color;ctx.font=`${l.fontWeight||'normal'} ${text.fontSize}px ${l.font}`;ctx.textBaseline='top';ctx.textAlign=l.align||'center';
   const x=l.align==='left'?0:l.align==='right'?l.w:l.w/2;
   text.lines.forEach((line,i)=>{const y=text.y+i*text.lineHeight;if(l.outline){ctx.strokeStyle=l.outline;ctx.lineWidth=2;ctx.lineJoin='round';ctx.strokeText(line,x,y)}ctx.fillText(line,x,y)});
  }
  ctx.restore();
 }
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Export failed.')),'image/png'));
}
