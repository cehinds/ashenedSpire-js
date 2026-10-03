import React,{useEffect,useRef,useState} from 'react';

import {presets,initialDocuments,clone,clipPath} from './studio-data';

import {imageFilter,download,validateDocument,readPng,portableDocument,exportPng} from './studio-export';

import {bounds,selectionIds,transformLayers,snapMove,resizeBox,marqueeIds,alignLayers} from './studio-geometry';

import './styles.css';



function ImageLayer({layer:l}){

  const [size,setSize]=useState([2004,785]);

  const style=l.trim?{position:'absolute',width:size[0]/l.trim[2]*100+'%',height:size[1]/l.trim[3]*100+'%',left:-l.trim[0]/l.trim[2]*100+'%',top:-l.trim[1]/l.trim[3]*100+'%'}:{width:'100%',height:'100%'};

  return <span className="image-window" style={{filter:imageFilter(l)}}><img draggable="false" src={l.src} alt="" style={style} onLoad={e=>{const n=e.currentTarget;if(l.trim&&(size[0]!==n.naturalWidth||size[1]!==n.naturalHeight))setSize([n.naturalWidth,n.naturalHeight])}}/></span>

}

function Field({label,value,onChange,min,max,step=1}){return <label className="field"><span>{label}</span><input type="number" value={Number.isFinite(value)?Math.round(value*100)/100:0} min={min} max={max} step={step} onChange={e=>{const n=+e.target.value;if(Number.isFinite(n))onChange(Math.max(min??-10000,Math.min(max??10000,n)))}}/></label>}



export default function App(){

  const [documents,setDocuments]=useState(initialDocuments),[active,setActive]=useState('gorefire'),[selected,setSelected]=useState('art'),[zoom,setZoom]=useState(1),[notice,setNotice]=useState(''),[viewport,setViewport]=useState(window.innerWidth),[history,setHistory]=useState([]),[future,setFuture]=useState([]),[busy,setBusy]=useState(false),[guides,setGuides]=useState(true);

  const [exportResult,setExportResult]=useState(null);

  const [selection,setSelection]=useState(['art']),[snap,setSnap]=useState(true),[grid,setGrid]=useState(false),[spacing,setSpacing]=useState(10),[marquee,setMarquee]=useState(null),[snapGuides,setSnapGuides]=useState([]),[context,setContext]=useState(null);

  const [solo,setSolo]=useState(false);

  function prepareExport(blob,name){if(exportResult)URL.revokeObjectURL(exportResult.url);setExportResult({url:URL.createObjectURL(blob),name,type:blob.type});setNotice(name+' is ready')}

  const [viewportHeight,setViewportHeight]=useState(window.innerHeight);

  const doc=documents[active],layer=doc.layers.find(l=>l.id===selected),canvasRef=useRef(null),drag=useRef(null),fileRef=useRef(null),jsonRef=useRef(null),addRef=useRef(null);

  const selectedLayers=doc.layers.filter(l=>selection.includes(l.id)),selectionBox=bounds(selectedLayers),canTransform=selectedLayers.length>0&&!selectedLayers.some(l=>l.locked);

  useEffect(()=>{const fn=()=>{setViewport(window.innerWidth);setViewportHeight(window.innerHeight)};window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[]);

  useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(id)},[notice]);

  const scale=Math.min(viewport<700?(viewport-54)/doc.width:viewport<1150?1.05:Math.min(1.4,(viewport-620)/doc.width),Math.max(240,viewportHeight-(viewport>1150?430:viewport<700?460:320))/doc.height)*zoom;

  function zoomSelection(){
    if(!selectionBox)return;
    const stage=canvasRef.current.closest('.stage'),baseScale=scale/zoom;
    setZoom(Math.max(.4,Math.min(4,Math.min((stage.clientWidth-50)/selectionBox.w,(stage.clientHeight-50)/selectionBox.h)/baseScale)));
    requestAnimationFrame(()=>requestAnimationFrame(()=>canvasRef.current.querySelector('.selection-box')?.scrollIntoView({block:'center',inline:'center',behavior:'instant'})));
  }

  function remember(){setHistory(h=>[...h.slice(-39),clone(doc)]);setFuture([])}

  function updateDoc(next,record=true){if(record)remember();setDocuments(d=>({...d,[active]:typeof next==='function'?next(d[active]):next}))}

  function patch(id,values,record=true){updateDoc(d=>({...d,layers:d.layers.map(l=>l.id===id?{...l,...values}:l)}),record)}

  function selectLayer(id,event={},individual=false){const ids=selectionIds(doc.layers,id,individual);setSelected(id);setSelection(event.shiftKey?(ids.every(v=>selection.includes(v))?selection.filter(v=>!ids.includes(v)):[...new Set([...selection,...ids])]):ids);setContext(null)}

  function choose(id){setSelection([documents[id].layers.find(l=>l.id==='art')?.id||documents[id].layers[0]?.id]);setContext(null);setActive(id);setSelected(documents[id].layers.find(l=>l.id==='art')?.id||documents[id].layers[0]?.id);setHistory([]);setFuture([]);setZoom(1);setSolo(false)}

  function undo(){if(!history.length)return;const v=history.at(-1);setFuture(f=>[clone(doc),...f]);setHistory(h=>h.slice(0,-1));setDocuments(d=>({...d,[active]:v}));setNotice('Undone')}

  function redo(){if(!future.length)return;setHistory(h=>[...h,clone(doc)]);setDocuments(d=>({...d,[active]:future[0]}));setFuture(f=>f.slice(1));setNotice('Redone')}

  function moveLayer(delta){const next=[...doc.layers];if(delta>0){for(let i=next.length-2;i>=0;i--)if(selection.includes(next[i].id)&&!selection.includes(next[i+1].id))[next[i],next[i+1]]=[next[i+1],next[i]]}else for(let i=1;i<next.length;i++)if(selection.includes(next[i].id)&&!selection.includes(next[i-1].id))[next[i],next[i-1]]=[next[i-1],next[i]];updateDoc({...doc,layers:next});setContext(null)}

  function beginDrag(e,ids,kind='move',handle){canvasRef.current?.focus({preventScroll:true});const ls=doc.layers.filter(l=>ids.includes(l.id));if(!ls.length||ls.some(l=>l.locked))return;remember();drag.current={kind,handle,ids,layers:clone(doc.layers),box:bounds(ls),startX:e.clientX,startY:e.clientY,scale:canvasRef.current.getBoundingClientRect().width/doc.width};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault()}

  function pointerDown(e,l){e.stopPropagation();if(e.button!==0)return;setContext(null);const ids=e.shiftKey?(selectionIds(doc.layers,l.id).every(v=>selection.includes(v))?selection.filter(v=>!selectionIds(doc.layers,l.id).includes(v)):[...new Set([...selection,...selectionIds(doc.layers,l.id)])]):selection.includes(l.id)?selection:selectionIds(doc.layers,l.id);setSelected(l.id);setSelection(ids);if(!e.shiftKey)beginDrag(e,ids)}

  function startMarquee(e){if(e.button!==0)return;canvasRef.current?.focus({preventScroll:true});setContext(null);const rect=canvasRef.current.getBoundingClientRect(),x=(e.clientX-rect.left)/scale,y=(e.clientY-rect.top)/scale;drag.current={kind:'marquee',x,y,startX:e.clientX,startY:e.clientY,scale,prior:e.shiftKey?selection:[]};setMarquee({x,y,w:0,h:0});if(!e.shiftKey){setSelection([]);setSelected(null)}e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault()}

  function pointerMove(e){const d=drag.current;if(!d)return;const dx=(e.clientX-d.startX)/d.scale,dy=(e.clientY-d.startY)/d.scale;if(d.kind==='marquee'){setMarquee({x:Math.min(d.x,d.x+dx),y:Math.min(d.y,d.y+dy),w:Math.abs(dx),h:Math.abs(dy)});return}let to;if(d.kind==='resize'){to=resizeBox(d.box,d.handle,dx,dy,e.shiftKey,snap?spacing:0)}else{const result=snapMove(d.box,dx,dy,{enabled:snap&&!e.altKey,spacing,threshold:5/d.scale,width:doc.width,height:doc.height,others:doc.layers.filter(l=>!d.ids.includes(l.id)&&l.visible)});setSnapGuides(result.guides);to={...d.box,x:d.box.x+result.dx,y:d.box.y+result.dy}}updateDoc(v=>({...v,layers:transformLayers(d.layers,d.ids,d.box,to)}),false)}

  function finishDrag(){const d=drag.current;if(d?.kind==='marquee'&&marquee){const ids=[...new Set([...d.prior,...marqueeIds(doc.layers,marquee).flatMap(id=>selectionIds(doc.layers,id))])];setSelection(ids);setSelected(ids.at(-1)||null)}drag.current=null;setMarquee(null);setSnapGuides([])}

  function group(){if(selection.length<2)return;const groupId='group-'+Date.now();updateDoc(d=>({...d,layers:d.layers.map(l=>selection.includes(l.id)?{...l,groupId}:l)}));setContext(null);setNotice('Grouped '+selection.length+' layers. Double-click a part to edit it separately.')}

  function ungroup(){const groups=new Set(selectedLayers.map(l=>l.groupId).filter(Boolean));updateDoc(d=>({...d,layers:d.layers.map(l=>groups.has(l.groupId)?{...l,groupId:undefined}:l)}));setContext(null)}

  function remove(){updateDoc(d=>({...d,layers:d.layers.filter(l=>!selection.includes(l.id)||l.locked)}));setSelection([]);setSelected(null);setContext(null)}

  function lockSelection(value){updateDoc(d=>({...d,layers:d.layers.map(l=>selection.includes(l.id)?{...l,locked:value}:l)}));setContext(null)}

  function align(mode){if(!canTransform)return;updateDoc(d=>({...d,layers:alignLayers(d.layers,selection,mode)}));setContext(null)}

  function transformSelection(values){if(!canTransform)return;updateDoc(d=>({...d,layers:transformLayers(d.layers,selection,selectionBox,{...selectionBox,...values})}))}

  function keyMove(e){if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return}if(mod&&e.key.toLowerCase()==='g'){e.preventDefault();e.shiftKey?ungroup():group();return}if(e.key==='Escape'){setContext(null);setSelection([]);setSelected(null);return}if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();remove();return}if(!canTransform||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const step=e.shiftKey?10:1;transformSelection({x:selectionBox.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),y:selectionBox.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)})}

  function openContext(e,l){e.preventDefault();e.stopPropagation();if(l&&!selection.includes(l.id))selectLayer(l.id);setContext({x:Math.min(e.clientX,window.innerWidth-215),y:Math.min(e.clientY,window.innerHeight-400)})}

  async function action(fn){setBusy(true);try{await fn()}catch(e){setNotice(e.message||'That action could not finish.')}finally{setBusy(false)}}

  function save(){try{localStorage.setItem('ashen-card-studio-v2',JSON.stringify({documents,active}));setNotice('Saved in this browser')}catch{setNotice('Browser storage is full. Export JSON to keep this document.')}}

  function load(){try{const saved=JSON.parse(localStorage.getItem('ashen-card-studio-v2'));if(!saved)throw Error('No local save yet.');for(const d of Object.values(saved.documents))validateDocument(d);setDocuments(saved.documents);setActive(saved.active);setSelected(saved.documents[saved.active].layers[0]?.id);setSelection([saved.documents[saved.active].layers[0]?.id]);setHistory([]);setFuture([]);setNotice('Local save loaded')}catch(e){setNotice(e.message)}}

  async function importJson(file){if(!file)return;if(file.size>80*1024*1024)throw Error('JSON is too large.');const v=validateDocument(JSON.parse(await file.text()));updateDoc({...v,id:active});setSelected(v.layers[0]?.id);setSelection([v.layers[0]?.id]);setNotice('JSON document imported')}

  async function replaceImage(file,adding=false){if(!file)return;const src=await readPng(file);if(adding){const id='image-'+Date.now();updateDoc(d=>({...d,layers:[...d.layers,{id,name:file.name.replace(/\.png$/i,''),type:'image',src,x:40,y:40,w:180,h:180,rotation:0,opacity:1,visible:true,locked:false}]}));setSelected(id);setSelection([id])}else patch(selected,{src,trim:undefined});setNotice('PNG loaded')}

  function addText(){const id='text-'+Date.now();updateDoc(d=>({...d,layers:[...d.layers,{id,name:'New text',type:'text',text:'New text',x:50,y:80,w:260,h:50,font:'Georgia',fontSize:24,fontWeight:'normal',align:'center',color:'#f3e8c9',rotation:0,opacity:1,visible:true,locked:false}]}));setSelected(id);setSelection([id])}

  function duplicate(){if(!selection.length)return;const stamp=Date.now(),groups={};const copies=selectedLayers.map(l=>{if(l.groupId&&!groups[l.groupId])groups[l.groupId]=l.groupId+'-'+stamp;return {...clone(l),id:l.id+'-'+stamp,name:l.name+' copy',x:l.x+12,y:l.y+12,locked:false,groupId:l.groupId?groups[l.groupId]:undefined}});updateDoc(d=>({...d,layers:[...d.layers,...copies]}));setSelection(copies.map(l=>l.id));setSelected(copies.at(-1).id);setContext(null)}

  function scaleArt(value){const factor=value/(layer.artScale||100),w=layer.w*factor,h=layer.h*factor;patch(selected,{artScale:value,w,h,x:layer.x-(w-layer.w)/2,y:layer.y-(h-layer.h)/2})}

  return <div className="studio" onKeyDown={keyMove} onPointerDown={()=>context&&setContext(null)}>

    <header><div className="brand"><span>ASHEN SPIRE</span><h1>Card studio</h1></div><div className="header-actions"><a href="/wireframe.html" target="_blank">Wireframe</a><button onClick={save}>Save</button><button onClick={load}>Load</button><button onClick={()=>jsonRef.current.click()}>Import JSON</button><button disabled={busy} onClick={()=>action(async()=>{const p=await portableDocument(doc);prepareExport(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),doc.id+'.json')})}>Export JSON</button><button className="primary" disabled={busy} onClick={()=>action(async()=>{prepareExport(await exportPng(doc),doc.id+'.png')})}>{busy?'Working…':'Export PNG'}</button></div></header>

    <div className="workspace">

      <aside className="layers-panel"><label className="component-picker">Component<select value={active} onChange={e=>choose(e.target.value)}>{presets.map(p=><option key={p.id} value={p.id}>{p.group} — {p.name}</option>)}</select></label><div className="section-title"><h2>Layers</h2><span>Front to back</span></div><div className="layer-list">{[...doc.layers].reverse().map(l=><div key={l.id} className={'layer-row '+(selection.includes(l.id)?'selected':'')}><button className="layer-select" onClick={e=>selectLayer(l.id,e,true)}><span className="layer-thumb">{l.type==='image'?<ImageLayer layer={l}/>:<span>Aa</span>}</span><span>{l.name}<small>{l.groupId?'Grouped  /  ':''}{l.type==='image'?'PNG image':'Editable text'}</small></span></button><div className="layer-toggles"><label title="Visibility"><input aria-label={'Show '+l.name} type="checkbox" checked={l.visible} onChange={e=>patch(l.id,{visible:e.target.checked})}/></label><button aria-label={(l.locked?'Unlock ':'Lock ')+l.name} className={l.locked?'is-locked':''} onClick={()=>patch(l.id,{locked:!l.locked})}>{l.locked?'Locked':'Lock'}</button></div></div>)}</div><div className="layer-tools"><button disabled={selection.length<2} onClick={group}>Group</button><button disabled={!selectedLayers.some(l=>l.groupId)} onClick={ungroup}>Ungroup</button><button onClick={addText}>Add text</button><button onClick={()=>addRef.current.click()}>Add PNG</button><button onClick={()=>moveLayer(1)} disabled={!layer}>Forward</button><button onClick={()=>moveLayer(-1)} disabled={!layer}>Backward</button></div></aside>

      <main><label className="mobile-picker">Component<select value={active} onChange={e=>choose(e.target.value)}>{presets.map(p=><option key={p.id} value={p.id}>{p.group} — {p.name}</option>)}</select></label><div className="canvas-heading"><div><span className="eyebrow">{doc.group} / EDITABLE COMPOSITION</span><h2>{doc.name}</h2></div><div className="history"><button disabled={!history.length} onClick={undo}>Undo</button><button disabled={!future.length} onClick={redo}>Redo</button></div></div><div className="canvas-tools"><label>Zoom <input aria-label="Canvas zoom" type="range" min=".4" max="4" step=".05" value={zoom} onChange={e=>setZoom(+e.target.value)}/><span>{Math.round(zoom*100)}%</span></label><label><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)}/> Selection outline</label><label><input type="checkbox" checked={snap} onChange={e=>setSnap(e.target.checked)}/>Snap</label><label><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/>Grid</label><label>Grid <input className="grid-spacing" aria-label="Grid spacing" type="number" min="2" max="100" value={spacing} onChange={e=>setSpacing(Math.max(2,Math.min(100,+e.target.value||10)))}/></label><button onClick={()=>setZoom(1)}>Fit</button><button disabled={!selectionBox} onClick={zoomSelection}>Zoom selection</button><button disabled={!layer} aria-pressed={solo} onClick={()=>setSolo(v=>!v)}>Solo selected</button><button disabled={!solo} onClick={()=>setSolo(false)}>Show all</button></div><div className="stage" onPointerDown={startMarquee} onPointerMove={pointerMove} onPointerUp={finishDrag} onPointerCancel={finishDrag} onContextMenu={e=>openContext(e)}><div className="canvas-holder" style={{width:doc.width*scale,height:doc.height*scale}}><div className="canvas" ref={canvasRef} tabIndex="0" aria-label="Editable component canvas" style={{width:doc.width,height:doc.height,transform:`scale(${scale})`,backgroundImage:grid?"linear-gradient(#92a97522 1px, transparent 1px),linear-gradient(90deg,#92a97522 1px,transparent 1px)":undefined,backgroundSize:`${spacing}px ${spacing}px`}}>{doc.layers.map(l=>l.visible&&(!solo||selection.includes(l.id))&&<div key={l.id} className="layer-plane" style={l.clip&&doc.clipShape==='card'?{clipPath,overflow:'hidden'}:{}}><div className={'canvas-layer '+(selection.includes(l.id)&&guides?'chosen':'')+(l.locked?' locked':'')} aria-label={l.name} role="group" onPointerDown={e=>pointerDown(e,l)} onDoubleClick={e=>{e.stopPropagation();selectLayer(l.id,{},true)}} onContextMenu={e=>openContext(e,l)} style={{left:l.x,top:l.y,width:l.w,height:l.h,transform:`rotate(${l.rotation}deg)`,opacity:l.opacity}}>{l.type==='image'?<ImageLayer layer={l}/>:<div className="canvas-text" style={{fontFamily:l.font,fontSize:l.fontSize,fontWeight:l.fontWeight,textAlign:l.align,color:l.color,textShadow:l.outline?`-1px -1px 0 ${l.outline},1px -1px 0 ${l.outline},-1px 1px 0 ${l.outline},1px 1px 0 ${l.outline}`:undefined}}>{l.text}</div>}</div></div>)}{guides&&selectionBox&&!solo&&<div className="selection-box" style={{left:selectionBox.x,top:selectionBox.y,width:selectionBox.w,height:selectionBox.h}}>{canTransform&&['nw','ne','sw','se'].map(h=><button key={h} className={'resize-handle '+h} aria-label={'Resize '+h} onPointerDown={e=>{e.stopPropagation();beginDrag(e,selection,'resize',h)}} />)}</div>}{snapGuides.map((g,i)=><div key={i} className={'snap-guide '+g.axis} style={g.axis==='x'?{left:g.value}:{top:g.value}}/>)}{marquee&&<div className="marquee" style={{left:marquee.x,top:marquee.y,width:marquee.w,height:marquee.h}}/>}</div></div></div><div className="canvas-caption"><span>{doc.width} × {doc.height} · transparent composition</span><span>Drag to move · arrow keys to nudge</span></div><section className="component-strip"><div className="section-title"><h3>Components</h3><span>Select a part to edit</span></div><div>{doc.layers.map(l=><button key={l.id} onClick={e=>selectLayer(l.id,e,true)} className={selection.includes(l.id)?'selected':''}><span className="strip-preview">{l.type==='image'?<ImageLayer layer={l}/>:<span style={{fontFamily:l.font}}>Aa</span>}</span><span>{l.name}</span></button>)}</div></section></main>

      <aside className="inspector"><div className="section-title"><h2>{selection.length>1?selection.length+' selected':layer?'Selected layer':'Select a layer'}</h2></div>{selection.length>1&&selectionBox&&<section className="multi-properties"><p className="hint">Move or resize the selection together. Double-click a canvas part or select its layer row to edit it alone.</p><div className="properties">{['x','y','w','h'].map(k=><Field key={k} label={{x:'Group X',y:'Group Y',w:'Group width',h:'Group height'}[k]} value={selectionBox[k]} min={k==='w'||k==='h'?5:undefined} onChange={v=>transformSelection({[k]:v})}/>)}</div><div className="alignment-tools"><button onClick={group}>Group</button><button onClick={ungroup}>Ungroup</button><button onClick={()=>align('center-x')}>Center X</button><button onClick={()=>align('center-y')}>Center Y</button><button disabled={selection.length<3} onClick={()=>align('distribute-x')}>Distribute X</button><button disabled={selection.length<3} onClick={()=>align('distribute-y')}>Distribute Y</button></div></section>}{layer&&selection.length===1?<><label className="text-field">Name<input value={layer.name} onChange={e=>patch(selected,{name:e.target.value})}/></label><div className="properties"><Field label="X" value={layer.x} onChange={x=>patch(selected,{x})}/><Field label="Y" value={layer.y} onChange={y=>patch(selected,{y})}/><Field label="Width" value={layer.w} min={1} max={4000} onChange={w=>patch(selected,{w})}/><Field label="Height" value={layer.h} min={1} max={4000} onChange={h=>patch(selected,{h})}/><Field label="Rotation" value={layer.rotation} min={-360} max={360} onChange={rotation=>patch(selected,{rotation})}/><Field label="Opacity %" value={layer.opacity*100} min={0} max={100} onChange={v=>patch(selected,{opacity:v/100})}/></div>{layer.type==='text'?<><label className="text-field">Text<textarea aria-label="Layer text" rows="4" value={layer.text} onChange={e=>patch(selected,{text:e.target.value})}/></label><label className="text-field">Font<select value={layer.font} onChange={e=>patch(selected,{font:e.target.value})}>{['Georgia','Arial','Times New Roman','Trebuchet MS','Verdana','Courier New'].map(f=><option key={f}>{f}</option>)}</select></label><div className="properties"><Field label="Font size" value={layer.fontSize} min={8} max={160} onChange={fontSize=>patch(selected,{fontSize})}/><label className="field"><span>Color</span><input aria-label="Text color" type="color" value={layer.color} onChange={e=>patch(selected,{color:e.target.value})}/></label></div><label className="text-field">Alignment<select value={layer.align} onChange={e=>patch(selected,{align:e.target.value})}>{['left','center','right'].map(v=><option key={v}>{v}</option>)}</select></label><label className="check"><input type="checkbox" checked={layer.fontWeight==='bold'} onChange={e=>patch(selected,{fontWeight:e.target.checked?'bold':'normal'})}/>Bold text</label></>:<><div className="image-actions"><button onClick={()=>fileRef.current.click()}>Replace PNG</button><a href={layer.src} download={layer.name+'.png'}>Download PNG</a></div>{['player-turn','enemy-turn'].includes(active)&&layer.id==='plate'&&<label className="range-field">Red hue  /  {layer.redTint||0}%<input aria-label="Banner red hue" type="range" min="0" max="100" value={layer.redTint||0} onChange={e=>patch(selected,{redTint:+e.target.value})}/></label>}{doc.clipShape==='card'&&<label className="check"><input type="checkbox" checked={!!layer.clip} onChange={e=>patch(selected,{clip:e.target.checked})}/>Clip to card inner shape</label>}{layer.id==='art'&&<><label className="range-field">Artwork scale · {Math.round(layer.artScale||100)}%<input aria-label="Artwork scale" type="range" min="40" max="250" value={layer.artScale||100} onChange={e=>scaleArt(+e.target.value)}/></label><p className="hint">The image is larger than the card. Move it freely; everything outside the inner silhouette stays hidden.</p></>}</>}<div className="inspector-actions"><button onClick={duplicate}>Duplicate layer</button><button onClick={remove}>Remove layer</button></div></>:<p className="hint">Choose a canvas part, layer row or bottom thumbnail. Every word and value can be edited.</p>}<div className="document-actions"><button onClick={()=>{updateDoc(clone(presets.find(p=>p.id===active)));setNotice('Preset restored')}}>Reset component</button><p>PNG artwork and editable text stay separate. Save keeps all components in this browser; JSON exports the current component with embedded PNG assets.</p></div></aside>

    </div><input ref={fileRef} className="file-input" type="file" accept="image/png" onChange={e=>{action(()=>replaceImage(e.target.files[0]));e.target.value=''}}/><input ref={addRef} className="file-input" type="file" accept="image/png" onChange={e=>{action(()=>replaceImage(e.target.files[0],true));e.target.value=''}}/><input ref={jsonRef} className="file-input" type="file" accept="application/json,.json" onChange={e=>{action(()=>importJson(e.target.files[0]));e.target.value=''}}/>{exportResult&&<div className="export-backdrop"><section className="export-dialog" role="dialog" aria-label="Export ready"><div className="section-title"><h2>Export ready</h2><button onClick={()=>setExportResult(null)}>Close</button></div><p>{exportResult.name}</p>{exportResult.type==='image/png'?<div className="export-preview"><img src={exportResult.url} alt="Composed PNG preview"/></div>:<p>Portable document with embedded PNG layers and editable text.</p>}<a className="download-result" href={exportResult.url} download={exportResult.name}>Download {exportResult.type==='image/png'?'PNG':'JSON'}</a></section></div>}{context&&<div className="context-menu" role="menu" aria-label="Selection actions" style={{left:context.x,top:Math.max(8,context.y)}} onPointerDown={e=>e.stopPropagation()}><span>{selection.length} selected</span><button role="menuitem" disabled={selection.length<2} onClick={group}>Group <kbd>Ctrl G</kbd></button><button role="menuitem" disabled={!selectedLayers.some(l=>l.groupId)} onClick={ungroup}>Ungroup <kbd>Ctrl Shift G</kbd></button><button role="menuitem" onClick={duplicate}>Duplicate</button><button role="menuitem" onClick={remove}>Delete unlocked</button><button role="menuitem" onClick={()=>lockSelection(true)}>Lock</button><button role="menuitem" onClick={()=>lockSelection(false)}>Unlock</button><button role="menuitem" onClick={()=>moveLayer(1)}>Bring forward</button><button role="menuitem" onClick={()=>moveLayer(-1)}>Send backward</button><button role="menuitem" onClick={()=>align('center-x')}>Align centers horizontally</button><button role="menuitem" onClick={()=>align('center-y')}>Align centers vertically</button><button role="menuitem" disabled={selection.length<3} onClick={()=>align('distribute-x')}>Distribute horizontally</button><button role="menuitem" disabled={selection.length<3} onClick={()=>align('distribute-y')}>Distribute vertically</button></div>}{notice&&<div className="toast" role="status">{notice}</div>}

  </div>

}
