/* The ending's private, client-only reading album. No recalculation or upload. */
(function(root){
'use strict';
const SITE='aaffffffffff123-lang.github.io/sajudosa/';
const clean=s=>String(s||'').replace(/[ \t\r\n]+/g,' ').trim();
const skip='svg,button,details,[hidden],[aria-hidden="true"],.seal,.fate-seal,.portrait-seal,.portrait-ribbon,.graph';
function textOf(node){
 if(node.nodeType===3)return node.nodeValue;
 if(node.nodeType!==1||node.matches(skip))return '';
 if(node.tagName==='BR')return ' ';
 return [...node.childNodes].map(textOf).join(node.matches('.note,.pillar,.pl,.glyph,.tags,.share-leg,.portrait-symbol,.none-card,.star-lines li')?' ':'');
}
function capture(screen,name){
 const sections=[];
 const escaped=String(name||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const anonymize=t=>escaped?clean(t).replace(new RegExp(escaped+'\\s*님','g'),'당신'):clean(t);
 function blocks(node){
  const out=[];
  function visit(n){
   if(n.nodeType!==1||n.matches(skip)||n.matches('h2,.portrait-title'))return;
   if(n.matches('p,h3,h4,.tl-when,.flag,.tl-note,.portrait-symbol,.cycle-ruling,.none-card,.pillar,.share-leg,.star-lines li')){
    const text=anonymize(textOf(n));if(text)out.push({text,kind:n.matches('h3,h4,.tl-when')?'heading':n.matches('.fate,.vq,.fate-end')?'closing':n.matches('.tl-note,.pnote,.flag')?'note':'body'});return;
   }
   if(!n.children.length){const text=anonymize(textOf(n));if(text)out.push({text,kind:n.matches('.flag,small')?'note':'body'});return;}
   for(const child of n.childNodes){
    if(child.nodeType===3){const text=anonymize(child.nodeValue);if(text)out.push({text,kind:'body'});}else visit(child);
   }
  }
  visit(node);return out;
 }
 function add(id,title,nodes){
  const body=nodes.filter(Boolean).flatMap(blocks);
  if(body.length)sections.push({id,title,blocks:body});
 }
 const q=s=>screen.querySelector(s);
 add('birth','당신이 태어난 때',[q('#pillars'),q('#pillar-note'),q('#share-leg'),q('#western-chart')]);
 add('portrait','당신을 보니',[q('#reading-portrait')]);
 add('fate','타고난 운명',[q('#fate-card')]);
 for(const n of screen.querySelectorAll('#sections > section'))add(n.id,clean(textOf(n.querySelector('h2'))),[n]);
 add('time','지나온 해와 앞날',[q('#time-block')]);
 add('verdict','전체 풀이',[q('.verdict'),q('.fate-end')]);
 return {version:1,sections};
}
const TYPE={body:{size:42,line:63,weight:400},heading:{size:44,line:64,weight:700},closing:{size:44,line:65,weight:700},note:{size:32,line:48,weight:400}};
function font(kind,family){const t=TYPE[kind]||TYPE.body;return t.weight+' '+t.size+'px '+family;}
function wrap(text,measure,width){
 const lines=[];let line='';
 for(const ch of Array.from(text)){
  const next=line+ch;
  if(line&&measure(next)>width&&!/^[.,!?。！？、，:;…」』”’)]$/.test(ch)){lines.push(line.trimEnd());line=ch.trimStart();}else line=next;
 }
 if(line)lines.push(line.trimEnd());return lines;
}
function paginate(section,measure){
 const pages=[];let page={title:section.title,id:section.id,items:[]},y=238;
 const end=1184,width=912;
 const next=()=>{if(page.items.length)pages.push(page);page={title:section.title,id:section.id,items:[]};y=238;};
 for(const block of section.blocks){
  const kind=TYPE[block.kind]?block.kind:'body',type=TYPE[kind],lines=wrap(block.text,t=>measure(t,kind),width);
  const height=lines.length*type.line+24;
  // Preserve whole paragraphs whenever they can fit on a fresh card.
  if(y>238&&height<=end-238&&y+height>end)next();
  for(let i=0;i<lines.length;i++){
   if(y+type.line>end)next();
   // Keep a subheading with at least one line of its following paragraph.
   if(kind==='heading'&&i===0&&y>238&&y+height+TYPE.body.line>end)next();
   page.items.push({text:lines[i],kind,y});y+=type.line;
  }
  y+=24;
 }
 if(page.items.length)pages.push(page);
 return pages.map((p,i)=>({...p,part:i+1,parts:pages.length}));
}
function plainText(snapshot,selected){
 return ['사주도사',...snapshot.sections.filter(s=>!selected||selected.has(s.id)).map(s=>s.title+'\n\n'+s.blocks.map(b=>b.text).join('\n\n')),SITE].join('\n\n');
}
// Store-only ZIP: individual PNGs, UTF-8 filenames, no third-party dependency.
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
async function zipFiles(files){
 const chunks=[],central=[];let offset=0,total=0;
 const make=(size)=>{const a=new Uint8Array(size);return [a,new DataView(a.buffer)];};
 for(const file of files){
  const bytes=new Uint8Array(await file.blob.arrayBuffer()),name=new TextEncoder().encode(file.name),crc=crc32(bytes);
  const [a,v]=make(30+name.length);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,0x21,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);a.set(name,30);
  const [c,d]=make(46+name.length);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint16(14,0x21,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);c.set(name,46);
  chunks.push(a,bytes);central.push(c);offset+=a.length+bytes.length;total+=c.length;
 }
 const [end,v]=make(22);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,total,true);v.setUint32(16,offset,true);
 return new Blob([...chunks,...central,end],{type:'application/zip'});
}
if(typeof module!=='undefined'&&module.exports)module.exports={wrap,paginate,plainText,zipFiles,capture};
if(!root.document)return;
const document=root.document;
let panel=null,snapshot=null,selected=new Set(),pages=[],pageIndex=0,urls=[],files=[],ticket=0,onClose=null,focusBack=null,family='sans-serif',zipUrl='',background=[];
const $=id=>document.getElementById('reading-'+id);
function element(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function install(){
 if(panel)return;
 const css=document.createElement('style');css.textContent=`
 #reading-album{position:fixed;inset:0;z-index:150;background:#0e0c13d9;display:flex;align-items:center;justify-content:center;padding:12px;overscroll-behavior:contain;color:#30263a;font-family:'IBM Plex Sans KR',sans-serif}
 #reading-album[hidden],#reading-album [hidden]{display:none!important}
 #reading-album *{box-sizing:border-box}
 #reading-album .ra-sheet{width:min(100%,520px);max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);display:flex;flex-direction:column;background:#faf5e8;border:1px solid #c9baa0;border-radius:18px;overflow:hidden;box-shadow:0 18px 70px #0007}
 #reading-album .ra-top{display:flex;align-items:center;justify-content:space-between;padding:13px 17px 9px;flex:none;border-bottom:1px solid #ded3bc}
 #reading-album h2{font-size:17px;line-height:1.4;margin:0}
 #reading-album button,#reading-album a{font:inherit;touch-action:manipulation}
 #reading-close{width:42px;height:42px;border:0;background:none;color:#51425b;font-size:28px!important;cursor:pointer}
 #reading-album .ra-scroll{overflow:auto;overscroll-behavior:contain;padding:18px;min-height:0}
 #reading-album .ra-description{font-size:13px;line-height:1.7;color:#66596b;margin:0 0 17px}
 #reading-album .ra-selection-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:12px;font-weight:700}
 #reading-select-all{min-height:40px;border:1px solid #bcb0c4;background:#fff9ed;border-radius:7px;padding:7px 12px;font-size:12px!important;color:#55405e}
 #reading-choices{display:grid;grid-template-columns:1fr 1fr;gap:8px;border:0;padding:0;margin:0}
 #reading-choices label{display:flex;align-items:center;gap:9px;padding:12px 10px;min-height:50px;border:1px solid #d5c9b9;border-radius:9px;background:#fffaf0;font-size:12px;line-height:1.45;cursor:pointer}
 #reading-choices label:has(input:checked){background:#eee4f0;border-color:#8b6b98}
 #reading-choices input{width:18px;height:18px;flex:none;accent-color:#684477;margin:0}
 #reading-album .ra-actions{display:flex;gap:8px;margin-top:17px}
 #reading-album .ra-button{display:flex;justify-content:center;align-items:center;min-height:46px;border:1px solid #b7a5bd;border-radius:9px;background:#fffaf2;color:#5a3c67;padding:10px 14px;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer;text-align:center}
 #reading-album .ra-actions>*{flex:1}
 #reading-album .ra-primary{background:#664176;color:#fff;border-color:#664176}
 #reading-album button:disabled{opacity:.4;cursor:default}
 #reading-status{font-size:12px;line-height:1.6;min-height:20px;margin:12px 0 0;color:#675773}
 #reading-album .ra-privacy{font-size:10px;line-height:1.6;color:#82727b;margin:14px 0 0}
 #reading-album .ra-pager{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px}
 #reading-album .ra-pager button{width:46px;min-height:42px;border:1px solid #c6b7cb;border-radius:8px;background:#fffaf2;color:#5a3c67;font-size:20px}
 #reading-page-label{font-size:12px;text-align:center;line-height:1.5}
 #reading-image{display:block;width:100%;height:auto;border:1px solid #d5c9b9;border-radius:3px;-webkit-touch-callout:default;user-select:auto}
 #reading-album .ra-hint{font-size:11px;color:#78697f;text-align:center;margin:8px 0;line-height:1.6}
 #reading-edit{background:none;border:0;color:#71577b;text-decoration:underline;min-height:42px;padding:8px 0;font-size:12px}
 #reading-zip{width:100%;margin-top:9px;font-size:12px!important}
 #reading-copy-fallback{width:100%;height:170px;margin-top:10px;font:13px/1.6 sans-serif;color:#352b3c;background:#fffaf2;border:1px solid #c6b7cb;border-radius:6px;padding:10px}
 #reading-album :focus-visible{outline:3px solid #9975aa;outline-offset:3px}
 @media(max-width:360px){#reading-album .ra-scroll{padding:13px}#reading-choices label{font-size:11px;padding:10px 7px}}
 `;document.head.append(css);
 panel=element('div');panel.id='reading-album';panel.hidden=true;
 panel.innerHTML='<section class="ra-sheet" role="dialog" aria-modal="true" aria-labelledby="reading-title"><header class="ra-top"><h2 id="reading-title">운세풀이 저장</h2><button type="button" id="reading-close" aria-label="운세풀이 저장 닫기">×</button></header><div class="ra-scroll"><div id="reading-picker"><p class="ra-description">간직하고 싶은 풀이를 골라 주세요.<br>읽었던 문장 그대로 이미지에 담습니다.</p><div class="ra-selection-head"><span id="reading-selection-count"></span><button type="button" id="reading-select-all">전부 선택</button></div><fieldset id="reading-choices" aria-label="저장할 풀이"></fieldset><div class="ra-actions"><button type="button" class="ra-button ra-primary" id="reading-create">이미지 만들기</button><button type="button" class="ra-button" id="reading-copy">텍스트 복사</button></div><p class="ra-privacy">이름·생년월일은 이미지와 복사한 글에 포함되지 않습니다.</p></div><div id="reading-gallery" hidden><nav class="ra-pager" aria-label="풀이 이미지 페이지"><button type="button" id="reading-prev" aria-label="이전 풀이 이미지">←</button><span id="reading-page-label"></span><button type="button" id="reading-next" aria-label="다음 풀이 이미지">→</button></nav><img id="reading-image" alt="운세풀이 이미지"><p class="ra-hint">이미지를 길게 눌러 저장할 수도 있어요.</p><a class="ra-button ra-primary" id="reading-download">이 이미지 저장</a><a class="ra-button" id="reading-zip">선택한 이미지 묶음 저장 (.zip)</a><button type="button" id="reading-edit">풀이 다시 고르기</button></div><p id="reading-status" role="status" aria-live="polite"></p><textarea id="reading-copy-fallback" aria-label="복사할 운세풀이" readonly hidden></textarea></div></section>';
 document.body.append(panel);
 $('close').onclick=()=>close();panel.addEventListener('click',e=>{if(e.target===panel)close();});
 panel.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
  if(e.key==='Tab'){const nodes=[...panel.querySelectorAll('button:not(:disabled),a[href],input,textarea')].filter(n=>n.getClientRects().length),first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 });
 $('select-all').onclick=()=>{selected=selected.size===snapshot.sections.length?new Set():new Set(snapshot.sections.map(s=>s.id));for(const n of $('choices').querySelectorAll('input'))n.checked=selected.has(n.value);selectionChanged();};
 $('create').onclick=generate;$('copy').onclick=copy;
 $('prev').onclick=()=>showPage(pageIndex-1);$('next').onclick=()=>showPage(pageIndex+1);
 $('edit').onclick=()=>{ticket++;release();$('gallery').hidden=true;$('picker').hidden=false;$('status').textContent='';selectionChanged();$('create').focus();};
}
function release(){for(const u of urls)URL.revokeObjectURL(u);urls=[];files=[];pages=[];if(zipUrl)URL.revokeObjectURL(zipUrl);zipUrl='';if(panel){$('image').removeAttribute('src');$('download').removeAttribute('href');$('zip').removeAttribute('href');}}
function close(focus=true){
 if(!panel||panel.hidden)return;ticket++;release();panel.hidden=true;snapshot=null;selected.clear();$('choices').replaceChildren();$('copy-fallback').value='';
 for(const [node,inert,hidden] of background){node.inert=inert;if(hidden===null)node.removeAttribute('aria-hidden');else node.setAttribute('aria-hidden',hidden);}background=[];
 const cb=onClose;onClose=null;if(cb)cb();if(focus&&focusBack&&focusBack.isConnected)focusBack.focus({preventScroll:true});focusBack=null;
}
function open(data,done){
 if(!data||!Array.isArray(data.sections)||!data.sections.length)return false;
 install();if(!panel.hidden)return false;
 ticket++;snapshot=data;onClose=done;focusBack=document.activeElement;selected=new Set([data.sections.find(s=>s.id==='verdict')?.id||data.sections[0].id]);
 $('choices').replaceChildren();
 for(const section of data.sections){const label=element('label'),input=element('input');input.type='checkbox';input.value=section.id;input.checked=selected.has(section.id);input.onchange=()=>{input.checked?selected.add(section.id):selected.delete(section.id);selectionChanged();};label.append(input,element('span','',section.title));$('choices').append(label);}
 $('picker').hidden=false;$('gallery').hidden=true;$('copy-fallback').hidden=true;$('select-all').disabled=false;$('status').textContent='';panel.hidden=false;selectionChanged();$('close').focus({preventScroll:true});
 background=[...document.querySelectorAll('#input-screen,#loading-screen,#result-screen,#fight,#arcadeFace')].map(node=>[node,node.inert,node.getAttribute('aria-hidden')]);
 for(const [node] of background){node.inert=true;node.setAttribute('aria-hidden','true');}return true;
}
function selectionChanged(){const n=selected.size;$('selection-count').textContent=n+'개 선택';$('create').disabled=$('copy').disabled=!n;$('select-all').textContent=n===snapshot.sections.length?'선택 해제':'전부 선택';}
async function loadFonts(text){
 family='sans-serif';if(!document.fonts)return;
 let timer;
 try{const ok=await Promise.race([Promise.all([400,700].map(w=>document.fonts.load(w+' 42px "IBM Plex Sans KR"',text))).then(r=>r.every(a=>a.length&&a.every(f=>f.status==='loaded'))),new Promise(r=>{timer=setTimeout(()=>r(false),4500);})]);if(ok)family='"IBM Plex Sans KR",sans-serif';}catch(_){}finally{clearTimeout(timer);}
}
function drawCard(page,index,total){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const g=canvas.getContext('2d');
 g.fillStyle='#faf5e8';g.fillRect(0,0,1080,1350);
 g.strokeStyle='#d8c9b2';g.lineWidth=2;g.strokeRect(32,32,1016,1286);
 g.fillStyle='#775383';g.font='700 26px '+family;g.fillText('사주도사',84,99);
 g.textAlign='right';g.fillStyle='#8e7e8d';g.font='400 24px '+family;g.fillText(String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),996,99);g.textAlign='left';
 const title=page.title+(page.parts>1?'  '+page.part+'/'+page.parts:'');
 g.fillStyle='#34233e';g.font='700 60px '+family;g.fillText(title,84,181,912);
 g.strokeStyle='#b59cbb';g.lineWidth=2;g.beginPath();g.moveTo(84,209);g.lineTo(996,209);g.stroke();
 g.textBaseline='top';
 for(const item of page.items){g.fillStyle=item.kind==='closing'?'#684475':item.kind==='note'?'#776c79':'#392e40';g.font=font(item.kind,family);g.fillText(item.text,84,item.y);}
 g.textBaseline='alphabetic';g.strokeStyle='#dfd2bf';g.beginPath();g.moveTo(84,1232);g.lineTo(996,1232);g.stroke();
 g.font='400 22px '+family;g.fillStyle='#8a7a87';g.fillText(SITE,84,1278);
 return canvas;
}
const nextPaint=()=>new Promise(r=>{const timer=setTimeout(r,80);requestAnimationFrame(()=>{clearTimeout(timer);r();});});
async function generate(){
 if(!snapshot||!selected.size)return;const job=++ticket;release();$('create').disabled=true;$('copy').disabled=true;$('select-all').disabled=true;
 for(const n of $('choices').querySelectorAll('input'))n.disabled=true;
 $('copy-fallback').hidden=true;$('status').textContent='이미지를 만들고 있어요…';
 try{
  const chosen=snapshot.sections.filter(s=>selected.has(s.id));await loadFonts(chosen.map(s=>s.title+s.blocks.map(b=>b.text).join('')).join(''));
  if(job!==ticket)return;
  const ctx=document.createElement('canvas').getContext('2d');pages=chosen.flatMap(s=>paginate(s,(text,kind)=>{ctx.font=font(kind,family);return ctx.measureText(text).width;}));
  const count=pages.length;
  for(let i=0;i<count;i++){
   if(job!==ticket)return;$('status').textContent='이미지 '+(i+1)+' / '+count+'장 만드는 중…';await nextPaint();if(job!==ticket)return;
   const canvas=drawCard(pages[i],i,count),blob=await new Promise((r,j)=>canvas.toBlob(b=>b?r(b):j(new Error('PNG')),'image/png'));canvas.width=canvas.height=1;
   if(job!==ticket)return;
   files.push({name:'사주도사_'+String(i+1).padStart(2,'0')+'_'+pages[i].title.replace(/[^가-힣a-zA-Z0-9]/g,'_')+'.png',blob});urls.push(URL.createObjectURL(blob));
  }
  if(count>1){const bundle=await zipFiles(files);if(job!==ticket)return;zipUrl=URL.createObjectURL(bundle);$('zip').href=zipUrl;$('zip').download='사주도사_풀이_'+count+'장.zip';}
  $('picker').hidden=true;$('gallery').hidden=false;$('status').textContent='';$('zip').hidden=count<2;showPage(0);$('download').focus({preventScroll:true});
 }catch(e){if(job===ticket){release();$('status').textContent='이미지를 만들지 못했어요. 다시 눌러 주세요.';console.warn('Reading export',e);}}
 finally{if(job===ticket){$('select-all').disabled=false;for(const n of $('choices').querySelectorAll('input'))n.disabled=false;selectionChanged();}}
}
function showPage(i){
 pageIndex=Math.max(0,Math.min(pages.length-1,i));const p=pages[pageIndex];if(!p)return;
 $('image').src=urls[pageIndex];$('image').alt=p.title+' 풀이 '+p.part+' / '+p.parts;
 $('page-label').textContent=(pageIndex+1)+' / '+pages.length+'장 · '+p.title;
 $('prev').disabled=pageIndex===0;$('next').disabled=pageIndex===pages.length-1;
 $('download').href=urls[pageIndex];$('download').download=files[pageIndex].name;$('download').textContent='이 이미지 저장 ('+(pageIndex+1)+'/'+pages.length+')';
}
async function copy(){
 if(!snapshot)return;const job=ticket,text=plainText(snapshot,selected);$('copy-fallback').hidden=true;
 try{if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('clipboard');await navigator.clipboard.writeText(text);if(job===ticket)$('status').textContent='선택한 풀이를 복사했어요.';}
 catch(_){if(job!==ticket)return;const area=$('copy-fallback');area.value=text;area.hidden=false;area.focus();area.select();$('status').textContent='아래 글을 길게 눌러 복사해 주세요.';}
}
root.PaljaReadingExport={capture,open,close};
})(typeof window!=='undefined'?window:globalThis);
