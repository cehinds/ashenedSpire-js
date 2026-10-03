import approved from './approved-layouts.json' with { type: 'json' };
const trims={'base-card':[69,102,887,1327],'text-panel':[36,208,1703,474],'hanging-flag':[268,71,497,1402],energy:[297,128,716,1005],mana:[397,260,458,760],stamina:[242,292,775,691],menu:[128,307,997,662],armoury:[166,23,922,1192],intent:[56,27,1144,1185],'health-flask':[339,123,575,992],'mana-flask':[357,153,540,928],'health-fill':[20,283,2134,132]};
Object.assign(trims,{"ref-frame": [0, 45, 1230, 1167], "ref-orb": [78, 2, 1152, 1226], "ref-sigil": [25, 71, 1209, 1183], "ref-diamond": [73, 21, 1137, 1161], "ref-connector": [16, 103, 2142, 514], "ref-draw": [0, 53, 1183, 1213], "ref-plate": [0, 43, 2156, 681], "ref-potions": [0, 5, 1493, 1019], "ref-spent-cards": [0, 0, 1198, 1254], "ref-spent": [97, 21, 1117, 1233]});
const png=(id,name,asset,x,y,w,h,extra={})=>({id,name,type:'image',src:'/assets/v2/'+asset+'.png',trim:trims[asset],x,y,w,h,rotation:0,opacity:1,visible:true,locked:false,...extra});
const txt=(id,name,text,x,y,w,h,size=20,color='#f3e8c9',extra={})=>({id,name,type:'text',text,x,y,w,h,font:'Georgia',fontSize:size,fontWeight:'normal',align:'center',color,rotation:0,opacity:1,visible:true,locked:false,...extra});
const banner=(id,name,x,y,w,h)=>({...png(id,name,'unused',x,y,w,h),src:'/assets/turn-banner-reconstructed.png',trim:[47,307,1911,170]});
const resource=(v,value,x,y,size)=>{const groupId='cost-'+v,name=v==='energy'?'Action':v[0].toUpperCase()+v.slice(1);const icon=v==='energy'?'ref-sigil':v==='mana'?'ref-diamond':'ref-orb';return [ ...(v==='stamina'?[png(v+'-harness','Stamina harness','ref-frame',x,y,size,size,{groupId})]:[]),png(v+'-icon',name+' symbol',icon,x+(v==='stamina'?size*.17:0),y+(v==='stamina'?size*.17:0),size*(v==='stamina'?.66:1),size*(v==='stamina'?.66:1),{groupId}),txt(v+'-value',name+' value',value,x+size*.18,y+size*.32,size*.64,size*.39,size*.33,'#fff5d2',{groupId,fontWeight:'bold',outline:'#101508'})]};
const costs=()=>['energy','mana','stamina'].flatMap((v,i)=>resource(v,['1','0','2'][i],285,73+i*56,47));
const card=(id,name,asset,rules,tags)=>({id,name,group:'Cards',width:360,height:540,clipShape:'card',layers:[png('base','Base card','base-card',0,0,360,540,{locked:true}),png('art','Card artwork',asset,-75,15,510,510,{clip:true,artScale:100}),png('panel','Text box','text-panel',24,346,312,147),png('flag','Hanging flag','hanging-flag',12,46,51,143),txt('title','Title',name,55,29,269,44,27),txt('rules','Rules',rules,43,370,274,89,21,'#291f16',{align:'center'}),...costs(),txt('tags','Tags',tags,26,500,308,22,12,'#dec78f',{fontWeight:'bold'})]});
const button=(id,name,label=name,icon='intent')=>({id,name,group:'Footer',width:360,height:100,layers:[png('plate','Button plate','ref-plate',0,6,360,90),png('icon','Button symbol',icon,30,32,37,37),txt('label','Button label',label,80,32,252,37,22)]});
const defaults=[
card('gorefire','Gorefire Slash','gorefire-art','Deal 5 damage.\nApply 2 Bleed.','ATTACK · FIRE'),
card('guard','Iron Guard','guard-art','Gain 7 Block.\nStand your ground.','SKILL · DEFENCE'),
card('ember','Ember Burst','ember-art','Deal 8 fire damage.\nApply 1 Burn.','ATTACK · EMBER'),
{id:'health',name:'Health bar',group:'Combat',width:430,height:138,layers:[banner('track','Health track',0,39,430,49),png('fill','Health fill','health-fill',8,47,320,29),txt('name','Name','Wandering Soldier',15,6,400,30,22),txt('health','Health value','22 / 22',35,49,360,26,20),txt('poise','Poise value','Poise 0 / 8',25,100,380,26,17,'#cec4a9')]},
{id:'resources',name:'Cost symbols',group:'Combat',width:380,height:160,layers:[png('connector','Resource connector','ref-connector',26,62,328,38),...['energy','mana','stamina'].flatMap((v,i)=>resource(v,['1','2','3'][i],15+i*125,20,100))]},
...['Player Turn','Enemy Turn'].map((name,i)=>{const b=button(i?'enemy-turn':'player-turn',name,name.toUpperCase());b.layers[0]={...b.layers[0],redTint:35};return {...b,group:'Combat'}}),
{...button('intent','Enemy intent','3 × 2'),group:'Combat'},
{...button('armoury','Armoury','ARMOURY','armoury'),group:'Navigation'},
{...button('menu','Menu','MENU','menu'),group:'Navigation'},
button('end-turn','End Turn','END TURN'),
button('end-ready','End Turn · ready','END TURN'),
{id:'actions',name:'Actions',group:'Footer',width:180,height:130,layers:[...resource('energy','3',40,3,100),txt('capacity','Action capacity','/ 3',75,101,30,20,14)]},
button('draw','Draw pile','DRAW · 5'),button('discard','Discard / Exhaust','DISCARD 0 · EXHAUST 0'),
{id:'potions',name:'Potions',group:'Footer',width:300,height:130,layers:[banner('plate','Potion plate',0,16,300,90),png('health','Health potion symbol','health-flask',25,34,42,46),txt('health-value','Health potion count','3',76,45,35,36,25),png('mana','Mana potion symbol','mana-flask',161,34,42,46),txt('mana-value','Mana potion count','1',211,45,35,36,25)]},
button('exhaust','Exhaust pile','EXHAUST · 0'),
];
export const presets=[...defaults,approved['gorefire-stamina']].filter(Boolean).map(p=>{
 if(approved[p.id])return JSON.parse(JSON.stringify(approved[p.id]));
 if(p.group!=='Cards')return p;
 const base=JSON.parse(JSON.stringify(approved.gorefire));
 for(const id of ['art','title','rules','tags']){const target=base.layers.find(l=>l.id===id),source=p.layers.find(l=>l.id===id);if(id==='art')target.src=source.src;else target.text=source.text;}
 return {...base,id:p.id,name:p.name};
});
export const clone=v=>JSON.parse(JSON.stringify(v));
export const initialDocuments=()=>Object.fromEntries(presets.map(p=>[p.id,clone(p)]));
export const innerPolygon=[[.12,.04],[.88,.04],[.95,.11],[.95,.90],[.88,.966],[.12,.966],[.052,.90],[.052,.11]];
export const clipPath='polygon('+innerPolygon.map(([x,y])=>`${x*100}% ${y*100}%`).join(',')+')';
