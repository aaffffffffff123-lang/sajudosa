const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const code=source.slice(source.indexOf('const TROPHY_FIELD='),source.indexOf('// 끝: 누적 처치 수'));
function setup(count=7){
 const elements=new Map(),calls={draws:[],texts:[],images:0,portraits:[],revoked:[],download:0,holds:[],resets:0,reads:0};
 class Element{constructor(id){this.id=id;this.hidden=false;this.disabled=false;this.listeners={};this.isConnected=true;this.textContent='';this.attrs={};}addEventListener(k,f){this.listeners[k]=f}click(){if(this.id==='#trophySave')calls.download++;return this.listeners.click?.({target:this})}focus(){document.activeElement=this}removeAttribute(k){delete this[k]}getClientRects(){return this.hidden?[]:[{}]}querySelectorAll(){return [...elements.values()]}}
 const $=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)};
 $('#trophyModal').hidden=true;$('#again').hidden=false;
 const ctx=new Proxy({fillText(text){calls.texts.push(text)},drawImage(...args){if(args[0]&&args[0].trophyHead)calls.draws.push(args)},createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}},getImageData(x,y,w,h){calls.reads++;return {data:new Uint8ClampedArray(w*h*4)}}},{get(t,p){return p in t?t[p]:()=>{}},set(t,p,v){t[p]=v;return true}});
 const document={activeElement:$('#trophyBtn'),createElement(){return {width:0,height:0,getContext:()=>ctx,toBlob(cb){queueMicrotask(()=>cb(new Blob(['PNG'],{type:'image/png'})))}}}};
 class Image{set src(value){calls.images++;this.url=value;queueMicrotask(()=>calls.failImages?this.onerror():this.onload())}}
 const G={paused:false,ended:true},PROGRESS={defeated:count,reset(){calls.resets++;if(calls.failReset)return false;this.defeated=0;return true}};let urlId=0;
 const navigator={};const URL={createObjectURL:()=>`blob:${++urlId}`,revokeObjectURL:u=>calls.revoked.push(u)};
 const api=vm.runInNewContext(code+';({trophyLayout,TROPHIES})',{$,G,PROGRESS,PREF:{deform:true},document,navigator,Image,URL,Blob,File,requestAnimationFrame:f=>queueMicrotask(f),setTimeout,clearTimeout,console,performance,TAU:Math.PI*2,trophyPortrait:spec=>{calls.images++;calls.portraits.push(spec);return {url:'portrait-'+JSON.stringify(spec),anchors:{neck:[.5,.85],top:[.5,.05],mouth:[.5,.55],eyes:[[.42,.38],[.56,.38]],gouged:spec.eyes==='gouged',jawGone:spec.jaw==='gone',tongue:!!spec.tongue}}},updateDefeatCount(){},clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),clearPointers(){},AUDIO:{hold:x=>calls.holds.push(x)},last:0});
 const flush=()=>new Promise(r=>setImmediate(r));
 return {$,calls,G,PROGRESS,navigator,document,...api,flush,async open(){ $('#trophyBtn').click();await flush()}};
}
test('every defeated boss has one trophy, including paginated totals',()=>{
 const h=setup();for(const count of [0,1,2,7,8,9,25,120,121,2000,2001,4321]){
  const pages=h.trophyLayout(count).pages;let rendered=0;
  for(let p=0;p<pages;p++){const l=h.trophyLayout(count,p),real=l.heads.filter(x=>!x.empty);assert(real.length<=2000);rendered+=real.length;assert.equal(new Set(real.map(h=>h.ordinal)).size,real.length);
   // 빈 장대는 아직 몇 놈 안 됐을 때만 선다(머리 수와 합쳐 열 개)
   assert.equal(l.heads.length-real.length,l.n<10?Math.max(0,l.heads.length-real.length):0);if(l.n>=10)assert.equal(l.heads.length,real.length);
   // 모두 지평선 아래 들판에, 화면 안에, 장대 발은 머리 아래에
   for(const x of l.heads){if(!x.empty)assert(x.ordinal>=l.start&&x.ordinal<l.start+l.n);assert(Number.isFinite(x.x+x.y+x.size+x.footY+x.z));assert(x.x>0&&x.x<1080);assert(x.y>l.horizon&&x.y<1100);assert(x.footY>x.y&&x.footY<=1340);assert(x.size>4)}
   // 가장 최근에 족친 놈은 마지막 장 맨 앞에 한 놈만(눈을 뜨고 나를 본다)
   const last=p===pages-1&&l.n>0;assert.equal(real.filter(x=>x.hero).length,last?1:0);if(last){const hero=real.find(x=>x.hero);assert.equal(hero.ordinal,count-1);assert.equal(hero.row,0);}}
  assert.equal(rendered,count);
 }
 assert.equal(h.trophyLayout(999999).pages,500);assert.equal(h.trophyLayout(999999,499).n,1999);assert.equal(h.trophyLayout(999999,499).heads.filter(x=>x.hero).length,1);
 assert.equal(h.trophyLayout(-9).n,0);assert.equal(h.trophyLayout(NaN).n,0);assert.equal(h.trophyLayout(2001,999).page,1);
});
test('more kills raise and pull back the camera, so a big record looks different instead of piling up on the horizon',()=>{
 const h=setup();
 // 8놈까지는 예전 머리 높이 장면 그대로(지평선 640, 맨 앞 머리 540px 남짓이 770 근처)
 for(const n of [0,1,5,8]){const l=h.trophyLayout(n);assert.equal(l.camera.e,0);assert.equal(Math.round(l.horizon),640);const hero=l.heads.find(x=>x.hero);if(n){assert(Math.abs(hero.y-770)<=20);assert(Math.abs(hero.size-540)<=40);}}
 let prev=null;
 for(const n of [8,9,12,20,40,80,160,400,1000,2000]){
  const l=h.trophyLayout(n),hero=l.heads.find(x=>x.hero);
  if(prev){assert(l.horizon<prev.horizon,'the camera tilts further down as the count grows ('+n+')');assert(hero.z>prev.z,'and pulls back ('+n+')');assert(l.rows>=prev.rows);}
  prev={horizon:l.horizon,z:hero.z,rows:l.rows};
 }
 const hz=n=>h.trophyLayout(n).horizon;
 assert(hz(20)-hz(100)>=50&&hz(100)-hz(400)>=50&&hz(400)-hz(2000)>=80,'each jump in the count changes the picture by tens of pixels');
 // 2000놈이면 화면 폭을 다 채운 들판이 지평선 가까이까지 이어지고, 맨 앞 머리는 아래 숫자 위에 온다
 const big=h.trophyLayout(2000),xs=big.heads.map(x=>x.x),front=big.heads.find(x=>x.hero);
 assert(Math.min(...xs)<60&&Math.max(...xs)>1020);assert(big.heads[0].y-big.horizon<120);assert(big.rows>=60);assert(front.y+front.size/2<1150);
});
test('the record stays unavailable before the completed reveal and before a final kill',async()=>{
 const h=setup();h.$('#again').hidden=true;await h.open();assert(h.$('#trophyModal').hidden);assert.equal(h.calls.images,0);
 h.$('#again').hidden=false;h.G.ended=false;await h.open();assert(h.$('#trophyModal').hidden);
 h.G.ended=true;h.PROGRESS.defeated=0;await h.open();assert(!h.$('#trophyModal').hidden);assert(h.$('#trophyReset').hidden);h.TROPHIES.close(false);
});
test('the card contains the exact count; close releases its blob and restores focus/pause',async()=>{
 const h=setup();await h.open();assert.equal(h.calls.draws.length,7);assert.equal(h.calls.reads,0,'a few heads keep the eye-level scene without distance haze');assert.equal(h.calls.texts.join(''),'족친천지신명7놈','no 梟首 seal');assert.equal(h.calls.images,8,'field + one portrait per outfit + the front head (no sky eye picture)');assert(h.G.paused);
 assert.equal(h.calls.portraits.filter(s=>s.eyes==='stare'&&s.tongue).length,1,'only the newest head stares out with its tongue hanging');assert(!h.$('#trophySave').hidden);assert.match(h.$('#trophyImage').alt,/머리 7개/);assert.equal(h.$('#trophySave').download,'족친천지신명_7놈.png');
 h.$('#trophyClose').click();assert(!h.G.paused);assert(h.$('#trophyModal').hidden);assert.deepEqual(h.calls.revoked,['blob:1']);assert.equal(h.document.activeElement,h.$('#trophyBtn'));
 await h.open();assert.equal(h.calls.images,8,'reuse the field and portraits');h.TROPHIES.close(false);
});
test('closing during creation cannot reopen the panel or attach a stale image',async()=>{
 const h=setup();h.$('#trophyBtn').click();h.$('#trophyClose').click();await h.flush();assert(h.$('#trophyModal').hidden);assert.equal(h.$('#trophyImage').src,undefined);assert.equal(h.calls.images,0);
});
test('failed asset loading remains closable and can be retried',async()=>{
 const h=setup();h.calls.failImages=true;await h.open();assert.match(h.$('#trophyStatus').textContent,/만들지 못했어요/);assert(h.$('#trophySave').hidden);
 h.$('#trophyClose').click();h.calls.failImages=false;await h.open();assert(!h.$('#trophySave').hidden);h.TROPHIES.close(false);
});
test('the record offers a PNG download without any native sharing action',async()=>{
 const h=setup();h.navigator.canShare=h.navigator.share=()=>assert.fail('native sharing must not be used');
 await h.open();const save=h.$('#trophySave');assert(!save.hidden);assert.match(save.href,/^blob:/);assert.equal(save.download,'족친천지신명_7놈.png');
 await save.click();assert.equal(h.calls.download,1);assert.equal(h.$('#trophyStatus').textContent,'');
 assert.doesNotMatch(source,/trophyShare|navigator\.(?:canShare|share)|족친 기록 공유/);h.TROPHIES.close(false);
});
test('paging preserves the total, shows the remaining head, and revokes the previous image',async()=>{
 const h=setup(2001);await h.open();assert.equal(h.calls.draws.length,2000);assert.equal(h.calls.reads,1,'the far field fades into the night air');assert(!h.$('#trophyPages').hidden);assert(h.$('#trophyPrev').disabled);
 h.$('#trophyNext').click();await h.flush();assert.equal(h.calls.draws.length,2001);assert.equal(h.$('#trophyPageLabel').textContent,'2 / 2');assert(h.$('#trophyNext').disabled);assert.match(h.$('#trophyImage').alt,/2001놈.*머리 1개/);assert.deepEqual(h.calls.revoked,['blob:1']);h.TROPHIES.close(false);
});

test('reset cancel preserves totals; confirmation clears only the count and redraws an empty field',async()=>{
 const h=setup(7);await h.open();h.$('#trophyReset').click();assert(!h.$('#trophyResetConfirm').hidden);h.$('#trophyResetNo').click();assert.equal(h.PROGRESS.defeated,7);assert.equal(h.calls.resets,0);
 h.$('#trophyReset').click();h.$('#trophyResetYes').click();await h.flush();assert.equal(h.PROGRESS.defeated,0);assert.equal(h.calls.resets,1);assert(h.$('#trophyReset').hidden);assert.match(h.$('#trophyImage').alt,/머리 0개/);assert.equal(h.$('#trophySave').download,'족친천지신명_0놈.png');h.TROPHIES.close(false);
});
test('a failed persistent reset leaves the prior record intact',async()=>{
 const h=setup(47);await h.open();h.calls.failReset=true;h.$('#trophyReset').click();h.$('#trophyResetYes').click();assert.equal(h.PROGRESS.defeated,47);assert.match(h.$('#trophyStatus').textContent,/지우지 못했어요/);h.TROPHIES.close(false);
});

test('the card has no eye in the sky, no crows and no 梟首 seal',async()=>{
 const card=source.slice(source.indexOf('const TROPHY_CARD='),source.indexOf('// 끝: 누적 처치 수'));
 assert.doesNotMatch(card,/fate-beyond|drawCrows|perchedCrow|eyeLid|animateSky|梟|'noto'/);
 assert.doesNotMatch(source,/id="trophySky"/);
 const h=setup(3);await h.open();
 assert.equal(h.calls.texts.join(''),'족친천지신명3놈');assert.match(h.$('#trophyImage').alt,/밤 들판/);assert.doesNotMatch(h.$('#trophyImage').alt,/눈/);
 h.TROPHIES.close(false);
});
