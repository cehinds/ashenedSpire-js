// The library reads the same editable presets as the canvas, so imported layouts
// and individual parts remain reusable without baking their text into artwork.
import {presets, clone} from './studio-data.js';

const extras = [
  ['energy','Lightning cost',[297,128,716,1005]],
  ['mana','Droplet mana',[397,260,458,760]],
  ['stamina','Boot stamina',[242,292,775,691]],
  ['ref-draw','Draw stack',[0,53,1183,1213]],
  ['ref-potions','Potion pair',[0,5,1493,1019]],
  ['ref-spent-cards','Spent cards',[0,0,1198,1254]],
  ['ref-spent','Spent symbol',[97,21,1117,1233]],
  ['turn-banner','Painted turn banner',[47,307,1911,170]],
];

export function buildLibrary(documents=presets){
  const entries=[],seen=new Set();
  for(const doc of documents){
    entries.push({id:'assembly:'+doc.id,name:doc.name,category:'Assemblies',section:doc.group,width:doc.width,height:doc.height,clipShape:doc.clipShape,layers:clone(doc.layers)});
    for(const layer of doc.layers){
      const key=layer.type==='image'?JSON.stringify([layer.src,layer.trim]):JSON.stringify([layer.name,layer.text]);
      if(seen.has(key))continue;seen.add(key);
      entries.push({id:'part:'+doc.id+':'+layer.id,name:layer.name,category:layer.type==='text'?'Text':'PNG parts',section:doc.group,width:layer.w,height:layer.h,layers:[{...clone(layer),x:0,y:0,rotation:0,clip:false,visible:true,locked:false,groupId:undefined}]});
    }
  }
  for(const [asset,name,trim] of extras){
    const src='/assets/v2/'+asset+'.png';
    if(entries.some(e=>e.layers.length===1&&e.layers[0].src===src))continue;
    const width=160,height=160*trim[3]/trim[2];
    entries.push({id:'reference:'+asset,name,category:'Reference art',section:'Illustrated assets',width,height,layers:[{id:asset,name,type:'image',src,trim,x:0,y:0,w:width,h:height,rotation:0,opacity:1,visible:true,locked:false}]});
  }
  return entries;
}

export function filterLibrary(entries,query='',category='All'){
  const q=query.toLowerCase().trim();
  return entries.filter(e=>(category==='All'||e.category===category)&&(!q||(e.name+' '+e.section+' '+e.category).toLowerCase().includes(q)));
}

let nextInsert=0;
export function insertLibraryEntries(doc,entries,token='library-'+Date.now()+'-'+(++nextInsert)){
  if(!entries.length)return {document:doc,ids:[]};
  const count=entries.reduce((n,e)=>n+e.layers.length,0);
  if(doc.layers.length+count>150)throw Error('A composition supports up to 150 layers. Choose fewer components.');
  const existing=new Set(doc.layers.map(l=>l.id)),added=[];
  entries.forEach((entry,entryIndex)=>{
    const scale=Math.min(1,doc.width*.8/entry.width,doc.height*.8/entry.height);
    const x=(doc.width-entry.width*scale)/2,y=(doc.height-entry.height*scale)/2;
    const groups=new Map();
    entry.layers.forEach((source,index)=>{
      let id=token+'-'+entryIndex+'-'+index;while(existing.has(id))id+='-copy';existing.add(id);
      if(source.groupId&&!groups.has(source.groupId))groups.set(source.groupId,id+'-group');
      const layer={...clone(source),id,x:x+source.x*scale,y:y+source.y*scale,w:source.w*scale,h:source.h*scale,locked:false,visible:true,groupId:source.groupId?groups.get(source.groupId):undefined};
      if(layer.fontSize)layer.fontSize*=scale;
      // A part added on its own must remain visible outside any original card mask.
      // Whole assemblies retain clipping when inserted into another card.
      layer.clip=entry.category==='Assemblies'&&doc.clipShape==='card'?!!source.clip:false;
      added.push(layer);
    });
  });
  return {document:{...doc,layers:[...doc.layers,...added]},ids:added.map(l=>l.id)};
}

export function setLayerHue(doc,ids,value){
  if(!Number.isFinite(value))throw Error('Hue must be a number.');
  const hue=Math.max(-180,Math.min(180,value)),selected=ids===null?null:new Set(ids);
  return {...doc,layers:doc.layers.map(l=>!selected||selected.has(l.id)?{...l,hue}:l)};
}
