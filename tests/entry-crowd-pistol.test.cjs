const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js');
const fight=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8'),html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const part=(src,a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const cut=(a,b)=>part(fight,a,b),V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

test('end-of-reading arms a visible button without entering automatically; activation is single-shot',()=>{
 const elements=new Map(),timers=[];let bottom=true,entries=0;
 const $=id=>{if(!elements.has(id))elements.set(id,{hidden:false,disabled:true,textContent:'',classList:{toggle(){}},addEventListener(t,fn){this[t]=fn}});return elements.get(id)};
 const FATE={phase:'reading',touching:false};
 vm.runInNewContext(part(html,'function edgeHint(){','function edgeLift(')+part(html,'function scheduleEdge(){','const pullThreshold=')+part(html,"$('fate-go').addEventListener('click'",'window.__paljaLeave=')+';scheduleEdge();',{$,FATE,atEdge:()=>bottom,clearTimeout(){},setTimeout(fn){timers.push(fn);return timers.length},enterFromEdge(){entries++;FATE.phase='loading'},window:{scrollTo(){}},document:{documentElement:{scrollHeight:900}}});
 assert.equal(entries,0);assert.equal(timers.length,1);timers.shift()();assert.equal(FATE.phase,'armed');assert.equal($('fate-go').disabled,false);assert.equal(entries,0);
 $('fate-go').click();$('fate-go').click();assert.equal(entries,1);
 FATE.phase='armed';bottom=false;$('fate-go').click();assert.equal(entries,1);
});

function bubbles(width=390,height=844){
 let now=0;const G={time:0};
 const ctx=new Proxy({measureText:s=>({width:Array.from(s).length*11})},{get:(o,k)=>k in o?o[k]:(()=>{})});
 const canvas={width:0,height:0,getContext:()=>ctx};
 const camera=new THREE.PerspectiveCamera(50,width/height,.01,100);camera.position.z=5;camera.updateMatrixWorld();
 const scene=new THREE.Scene(),speaker=new THREE.Object3D();scene.add(speaker);speaker.position.y=.3;
 const scope={THREE,V3,ZERO3:V3(),G,clamp,PI:Math.PI,TAU:Math.PI*2,innerWidth:width,innerHeight:height,camera,vmCam:camera,performance:{now:()=>now},window:{devicePixelRatio:1},document:{},visibleChain:()=>true,typeSteps:text=>({total:.3,steps:Array.from(text).map(()=>({t:0,kind:'char'}))}),AUDIO:{speak:()=>({stop(){}}),whisper:()=>({stop(){}})},$:s=>s==='#speech'?canvas:s==='#fight .ftop'?{hidden:false,getBoundingClientRect:()=>({bottom:48})}:null};
 const BUB=vm.runInNewContext(cut('const LINES={','// 되살림 컷씬:')+cut('const VOICE={','/* 말풍선:')+cut('const ZERO3=V3();','/* 팔 붙잡기 장면')+';BUB',scope);
 return {BUB,G,speaker,scope,draw(){now+=16;G.time+=.016;BUB.draw()}};
}
test('reading follower speech stays still while its tail follows the moving speaker; new speech does not displace it',()=>{
 for(const [w,h] of [[390,844],[1280,800]]){
  const s=bubbles(w,h),b=s.BUB.say({obj:s.speaker,top:.1},'기본은 집에서\n배우는 건데.',4,{stable:true,whisper:true});s.draw();
  const pos=[b.x,b.y],tail=[b.tx,b.ty];
  for(let i=0;i<30;i++){s.speaker.position.x+=.013;s.speaker.position.y+=.002;s.draw();assert.deepEqual([b.x,b.y],pos)}
  assert.notDeepEqual([b.tx,b.ty],tail);
  const second=s.BUB.say({obj:s.speaker},'누군 편하게 사나?',4,{stable:true});s.draw();assert.deepEqual([b.x,b.y],pos);
  assert(Math.abs(second.x-b.x)>=second.m.rx+b.m.rx||Math.abs(second.y-b.y)>=second.m.ry+b.m.ry);
  s.scope.innerWidth=w-80;s.draw();assert(b.x-b.m.rx>=7);assert(b.x+b.m.rx<=w-80-7);
  s.speaker.position.x=100;s.draw();assert(b.until<=s.G.time,'leaving the screen retires the bubble');
  s.BUB.clear();assert.equal(s.BUB.count,0);
 }
});

test('the five approved murmurs rotate without repeats and gate fortune replies by the matching mark',()=>{
 const STARE={used:new Set(),exchange:null},crowd={visible:true},lastResult={paper:{marks:{}}},G={time:0};
 const scope={STARE,crowd,lastResult,G,V3,innerWidth:390,innerHeight:844,pick:a=>a[0],CAM:{pos:V3()},forPlaces(){},CROWD:{witness(){}},HEAD_Y:.763,camera:new THREE.PerspectiveCamera()};
 const api=vm.runInNewContext(cut('const LINES={','// 되살림 컷씬:')+cut(' function prepareWhispers(){',' function startWhispers(){')+';({prepareWhispers,LINES})',scope);
 assert.deepEqual(Array.from(api.LINES.whisper,w=>[w.aside,w.seen||w.say]).flat(),[
  '고졸인가?','사주에 공부 기운이 없잖아',
  '가정교육을 안 받았나?','부모복 없는 사주라 보고 배운 게 없지',
  '좆소 다니나?','직장복이 없는데 좋은 데를 다녀봤겠어?',
  '저런 것까지 가르쳐야 돼?','가난하고 못 배운 애들은 저런 데서 티가 확 난다니까',
  '딱 봐도 회사에서도 폐급이네.','평생 말단일 팔자잖아.'
 ]);
 assert(!('sympathy' in api.LINES));
 assert(api.LINES.whisper.filter(w=>w.mark).every(w=>w.say===''));
 for(let cycle=0;cycle<3;cycle++){
  const seen=new Set();
  for(let i=0;i<api.LINES.whisper.length;i++){
   STARE.exchange=null;api.prepareWhispers();const p=STARE.exchange.pair;
   assert(!seen.has(p));seen.add(p);STARE.used.add(p);assert.equal(STARE.exchange.say,p.say);
  }
 }
 for(const pair of api.LINES.whisper.filter(w=>w.mark)){
  STARE.used=new Set(api.LINES.whisper.filter(w=>w!==pair));STARE.exchange=null;lastResult.paper.marks={[pair.mark]:true};
  api.prepareWhispers();assert.equal(STARE.exchange.pair,pair);assert.equal(STARE.exchange.say,pair.seen);
 }
});

test('approved replies wait until the first whisper is read, finish before arrival, and cancel with the scene',()=>{
 const {LINES,VOICE,typeTime}=vm.runInNewContext(cut('const LINES={','// 되살림 컷씬:')+cut('const VOICE={','/* 말풍선:')+cut('const TYPE=','/* 스프링:')+';({LINES,VOICE,typeTime})');
 const span=(text,pi)=>Math.max(1.5,typeTime(text,VOICE.crowd[pi].speed*1.08)+.68);
 for(const pair of LINES.whisper)for(const say of [pair.say,...(pair.seen?[pair.seen]:[])])for(const fps of [20,60,120]){
  const aside={pi:pair.who,delay:0},speaker={pi:1-pair.who},said=[],witnessed=[];
  const STARE={on:true,t0:0,talk:[],used:new Set(),exchange:{pair,side:1,aside,say}},G={time:0},WALK={dur:4.35,on:true,t:0};
  const scope={LINES,VOICE,STARE,G,WALK,typeTime,clamp,prepareWhispers(){},CROWD:{witness:v=>witnessed.push(v)},walkSpeaker:()=>speaker,
   sayWhisper:(who,text)=>{const until=G.time+span(text,who.pi);said.push({text,at:G.time,until});return {until};}};
  const api=vm.runInNewContext(cut(' function startWhispers(){',' function anchorOf(')+cut(' function updateWhispers(){',' // 매 프레임:')+cut(' function stareReset(){',' function forPlaces(')+';({startWhispers,planWhispers,updateWhispers,stareReset})',scope);
  api.startWhispers();G.time=.32;api.planWhispers();
  assert.equal(STARE.talk.length,say?1:0);assert.equal(witnessed.length,say?1:0);
  if(say){
   const reply=STARE.talk[0];assert.equal(reply.text,say);
   assert(G.time+reply.at>=said[0].until+.1-1e-9);
   assert(reply.at+span(say,speaker.pi)+1/fps<WALK.dur*.96);
  }
  const walkStarted=G.time;
  for(let t=0;t<=WALK.dur;t+=1/fps){WALK.t=t;G.time=walkStarted+t;api.updateWhispers();}
  assert.deepEqual(said.map(x=>x.text),say?[pair.aside,say]:[pair.aside]);
  api.planWhispers();api.stareReset();api.updateWhispers();
  assert.equal(said.length,say?2:1);assert.equal(STARE.exchange,null);
 }
});

test('even a 50 ms frame draws a newly fired flash before retiring it',()=>{
 for(const fps of [20,24,30,60,120]){
  const st={flash:.035},seen=[];
  const afterRender=vm.runInNewContext(cut(' function afterRender(dt){'," setTool('hand');")+';afterRender',{st});
  const scope={renderer:{clear(){},clearDepth(){},render(){seen.push(st.flash>0)}},BEYOND:{active:false},scene:{},camera:{},vmScene:{},vmCam:{layers:{set(){}}},COMBAT_STAGE:{boot:{visible:false}},FX:{scene:{}},BUB:{draw(){}},VM:{afterRender},gunLT:.035};
  const render=vm.runInNewContext(cut('function render(dt=0){','function frame(now){')+';render',scope);
  render(1/fps);assert(seen[0]);assert.equal(st.flash,Math.max(0,.035-1/fps));
  for(let i=0;i<10;i++)render(1/fps);assert.equal(st.flash,0);assert.equal(scope.gunLT,0);
 }
});

test('the new pistol bank wins even when the old sound bank finishes later',async()=>{
 let finishOld;const old=new Promise(r=>finishOld=r),fresh={duration:2,sampleRate:44100},SFX={};
 const ctx={decodeAudioData:async bytes=>bytes==='new'?fresh:{duration:5,sampleRate:24000}};
 const scope={ctx,SFX,bankLoad:null,bankBuffer:null,pistolDownload:Promise.resolve('new'),bankDownload:old};
 const load=vm.runInNewContext(cut(' function loadSoundBank(){',' function startClip(')+';loadSoundBank',scope);
 const done=load();await new Promise(r=>setImmediate(r));assert.equal(SFX.shot.length,4);assert.equal(SFX.shot[0].buffer,fresh);
 finishOld([{sampleRate:24000,clips:{shot:[[0,1000]],face:[[24000,2400]]}},'old']);await done;
 assert.equal(SFX.shot[0].buffer,fresh);assert.equal(SFX.face.length,1);
});
