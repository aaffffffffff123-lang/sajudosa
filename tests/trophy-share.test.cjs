const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const code=source.slice(source.indexOf('function trophyLayout('),source.indexOf('// 끝: 누적 처치 수'));
function setup(count=7){
 const elements=new Map(),calls={draws:[],texts:[],images:0,revoked:[],download:0,holds:[]};
 class Element{constructor(id){this.id=id;this.hidden=false;this.disabled=false;this.listeners={};this.isConnected=true;this.textContent='';this.attrs={};}addEventListener(k,f){this.listeners[k]=f}click(){if(this.id==='#trophySave')calls.download++;return this.listeners.click?.({target:this})}focus(){document.activeElement=this}removeAttribute(k){delete this[k]}getClientRects(){return this.hidden?[]:[{}]}querySelectorAll(){return [...elements.values()]}}
 const $=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 $('#trophyModal').hidden=true;$('#again').hidden=false;
 const ctx=new Proxy({fillText(text){calls.texts.push(text)},drawImage(...args){calls.draws.push(args)},createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}},{get(t,p){return p in t?t[p]:()=>{}},set(t,p,v){t[p]=v;return true}});
 const document={activeElement:$('#trophyBtn'),createElement(){return {width:0,height:0,getContext:()=>ctx,toBlob(cb){queueMicrotask(()=>cb(new Blob(['PNG'],{type:'image/png'})))}}}};
 class Image{set src(value){calls.images++;this.url=value;queueMicrotask(()=>calls.failImages?this.onerror():this.onload())}}
 const G={paused:false,ended:true},PROGRESS={defeated:count};let urlId=0;
 const navigator={};const URL={createObjectURL:()=>`blob:${++urlId}`,revokeObjectURL:u=>calls.revoked.push(u)};
 const api=vm.runInNewContext(code+';({trophyLayout,TROPHIES})',{$,G,PROGRESS,document,navigator,Image,URL,Blob,File,requestAnimationFrame:f=>queueMicrotask(f),setTimeout,clearTimeout,console,performance,TAU:Math.PI*2,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),clearPointers(){},AUDIO:{hold:x=>calls.holds.push(x)},last:0});
 const flush=()=>new Promise(r=>setImmediate(r));
 return {$,calls,G,PROGRESS,navigator,document,...api,flush,async open(){ $('#trophyBtn').click();await flush()}};
}
test('every defeated boss has one trophy, including paginated totals',()=>{
 const h=setup();for(const count of [0,1,2,7,25,120,121,999999]){
  const pages=h.trophyLayout(count).pages;let rendered=0;
  for(let p=0;p<pages;p++){const l=h.trophyLayout(count,p);assert(l.heads.length<=120);rendered+=l.heads.length;assert.equal(new Set(l.heads.map(h=>h.ordinal)).size,l.heads.length);for(const x of l.heads){assert(x.ordinal>=l.start&&x.ordinal<l.start+l.n);assert(Number.isFinite(x.x+x.y+x.size));assert(x.x>0&&x.x<1080);assert(x.y>270&&x.y<1085)}}
  assert.equal(rendered,count);
 }
 assert.equal(h.trophyLayout(-9).n,0);assert.equal(h.trophyLayout(NaN).n,0);assert.equal(h.trophyLayout(121,999).page,1);
});
test('sharing stays unavailable before the completed reveal and before a final kill',async()=>{
 const h=setup();h.$('#again').hidden=true;await h.open();assert(h.$('#trophyModal').hidden);assert.equal(h.calls.images,0);
 h.$('#again').hidden=false;h.G.ended=false;await h.open();assert(h.$('#trophyModal').hidden);
 h.G.ended=true;h.PROGRESS.defeated=0;await h.open();assert(h.$('#trophyModal').hidden);
});
test('the card contains the exact count; close releases its blob and restores focus/pause',async()=>{
 const h=setup();await h.open();assert.equal(h.calls.draws.length,7);assert.deepEqual(h.calls.texts,['족친 천지신명','7명']);assert.equal(h.calls.images,6);assert(h.G.paused);assert(!h.$('#trophyShare').disabled);assert.match(h.$('#trophyImage').alt,/머리 7개/);assert.equal(h.$('#trophySave').download,'족친천지신명_7명.png');
 h.$('#trophyClose').click();assert(!h.G.paused);assert(h.$('#trophyModal').hidden);assert.deepEqual(h.calls.revoked,['blob:1']);assert.equal(h.document.activeElement,h.$('#trophyBtn'));
 await h.open();assert.equal(h.calls.images,6,'reuse the six decoded portraits');h.TROPHIES.close(false);
});
test('closing during creation cannot reopen the panel or attach a stale image',async()=>{
 const h=setup();h.$('#trophyBtn').click();h.$('#trophyClose').click();await h.flush();assert(h.$('#trophyModal').hidden);assert.equal(h.$('#trophyImage').src,undefined);assert.equal(h.calls.images,0);
});
test('failed asset loading remains closable and can be retried',async()=>{
 const h=setup();h.calls.failImages=true;await h.open();assert.match(h.$('#trophyStatus').textContent,/만들지 못했어요/);assert(h.$('#trophyShare').disabled);
 h.$('#trophyClose').click();h.calls.failImages=false;await h.open();assert(!h.$('#trophyShare').disabled);h.TROPHIES.close(false);
});
test('unsupported native sharing downloads the PNG; cancellation does not',async()=>{
 const h=setup();await h.open();await h.$('#trophyShare').click();assert.equal(h.calls.download,1);
 h.navigator.canShare=()=>true;let sent;h.navigator.share=async data=>{sent=data;throw Object.assign(new Error('cancel'),{name:'AbortError'})};h.$('#trophyStatus').textContent='';
 await h.$('#trophyShare').click();assert.equal(h.calls.download,1);assert.equal(sent.files[0].type,'image/png');assert.match(sent.text,/7명/);assert.equal(h.$('#trophyStatus').textContent,'');assert(!h.$('#trophyShare').disabled);h.TROPHIES.close(false);
});
test('paging preserves the total, shows the remaining head, and revokes the previous image',async()=>{
 const h=setup(121);await h.open();assert.equal(h.calls.draws.length,120);assert(!h.$('#trophyPages').hidden);assert(h.$('#trophyPrev').disabled);
 h.$('#trophyNext').click();await h.flush();assert.equal(h.calls.draws.length,121);assert.equal(h.$('#trophyPageLabel').textContent,'2 / 2');assert(h.$('#trophyNext').disabled);assert.match(h.$('#trophyImage').alt,/121명.*머리 1개/);assert.deepEqual(h.calls.revoked,['blob:1']);h.TROPHIES.close(false);
});
