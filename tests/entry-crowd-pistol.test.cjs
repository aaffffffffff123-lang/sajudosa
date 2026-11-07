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

test('fortune conditions select complete approved pairs, never an opening line without its reply',()=>{
 const STARE={used:new Set(),exchange:null},crowd={visible:true},lastResult={paper:{marks:{}}},G={time:0};
 const scope={STARE,crowd,lastResult,G,V3,innerWidth:390,innerHeight:844,pick:a=>a[0],CAM:{pos:V3()},forPlaces(){},CROWD:{witness(){}},HEAD_Y:.763,camera:new THREE.PerspectiveCamera()};
 const api=vm.runInNewContext(cut('const LINES={','// 되살림 컷씬:')+cut(' function prepareWhispers(){',' function startWhispers(){')+';({prepareWhispers,LINES})',scope);
 assert.deepEqual(Array.from(api.LINES.whisper,w=>[w.aside,w.say]).flat(),[
  '고졸인가?','사주에 공부 기운이 없잖아',
  '가정교육을 안 받았나?','부모복 없는 사주라 보고 배운 게 없지',
  '좆소 다니나?','직장복이 없는데 좋은 데를 다녀봤겠어?',
  '저런 것까지 가르쳐야 돼?','가난하고 못 배운 애들은 저런 데서 티가 확 난다니까',
  '딱 봐도 회사에서도 폐급이네.','평생 말단일 팔자잖아.'
 ]);
 assert(!('sympathy' in api.LINES));
 for(const marks of [{},{noStudy:true},{noOfficer:true},{noStudy:true,noOfficer:true}]){
  lastResult.paper.marks=marks;STARE.used.clear();
  const eligible=api.LINES.whisper.filter(w=>!w.mark||marks[w.mark]);
  for(let cycle=0;cycle<3;cycle++){
   const seen=new Set();
   for(let i=0;i<eligible.length;i++){
    STARE.exchange=null;api.prepareWhispers();const e=STARE.exchange;
    assert(eligible.includes(e.pair));assert(!seen.has(e.pair));assert(e.say.length>0);
    assert.equal(e.say,e.pair.say);seen.add(e.pair);STARE.used.add(e.pair);
   }
  }
 }
 // A different reading may shrink the eligible pool while old used entries remain.
 lastResult.paper.marks={};STARE.exchange=null;api.prepareWhispers();
 assert.equal(STARE.exchange.pair.aside,'저런 것까지 가르쳐야 돼?');
 assert(STARE.exchange.say.length>0);
});

test('every approved pair plays both lines in order with real crowd positions across mobile and desktop views',()=>{
 const {LINES,VOICE,typeTime}=vm.runInNewContext(cut('const LINES={','// 되살림 컷씬:')+cut('const VOICE={','/* 말풍선:')+cut('const TYPE=','/* 스프링:')+';({LINES,VOICE,typeTime})');
 const placementCode=cut('  const placements=Array.from({length:6},()=>[]),dummy=new THREE.Object3D();','  const plain=new THREE.MeshStandardMaterial');
 const span=(text,pi)=>Math.max(1.5,typeTime(text,VOICE.crowd[pi].speed*1.08)+.68);
 const lerp=(a,b,t)=>a+(b-a)*t;
 for(const [width,height] of [[360,640],[390,844],[1280,800],[844,390]])for(const side of [-1,1])for(const pair of LINES.whisper)for(const fps of [20,60,120]){
  const places=vm.runInNewContext(placementCode+';placements',{THREE,PI:Math.PI}).flat();
  for(const v of places){v.cx=v.x;v.cy=0;v.delay=0;}
  const aspect=width/height,portrait=width<height,CAM={pos:V3(.12,1.55,6.8),look:V3(0,1.45,-.2)};
  const WALK={dur:4.35,on:true,t:0,p0:CAM.pos.clone(),l0:CAM.look.clone(),p1:V3(.12,1.58,-.62+(portrait?Math.max(2.55,1.7/aspect):3.05)),l1:V3(0,1.08,-.62),f0:portrait?52:46,f1:portrait?44:39};
  const camera=new THREE.PerspectiveCamera(WALK.f0,aspect,.01,100);camera.position.copy(CAM.pos);camera.lookAt(CAM.look);camera.updateMatrixWorld();
  const STARE={on:true,t0:0,talk:[],used:new Set(),exchange:null},G={time:0},said=[],witnessed=[];
  const scope={LINES,VOICE,STARE,G,WALK,CAM,camera,typeTime,clamp,lerp,V3,PI:Math.PI,HEAD_Y:.763,sat:x=>clamp(x,0,1),innerWidth:width,innerHeight:height,crowd:{visible:true},lastResult:{paper:{marks:{noStudy:true,noOfficer:true}}},
   Math:Object.assign(Object.create(Math),{random:()=>side===1?.75:.25}),pick:a=>a.find(w=>w===pair),forPlaces:fn=>places.forEach(fn),CROWD:{witness:v=>witnessed.push(v)},
   sayWhisper:(who,text)=>{const until=G.time+span(text,who.pi);said.push({text,at:G.time,until});return {until};}};
  const api=vm.runInNewContext(cut('function walkProgress(k){','function introCamera(dt){')+cut(' function walkSpeaker(',' function anchorOf(')+cut(' function updateWhispers(){',' // 매 프레임:')+cut(' function stareReset(){',' function forPlaces(')+';({startWhispers,planWhispers,updateWhispers,stareReset})',scope);
  api.startWhispers();assert(STARE.exchange.aside,'opening speaker must be visible');
  assert.equal(said[0].text,pair.aside);
  G.time=.32;api.planWhispers();
  assert.equal(STARE.talk.length,1,'the selected opening must always get its reply');
  assert.equal(witnessed.length,2);assert.notEqual(STARE.talk[0].who,STARE.exchange.aside);
  const reply=STARE.talk[0];assert.equal(reply.text,pair.say);
  assert(G.time+reply.at>=said[0].until+.1-1e-9);
  assert(reply.at+span(reply.text,reply.who.pi)+1/fps<WALK.dur*.96);
  const walkStarted=G.time;
  for(let at=0;at<=WALK.dur;at+=1/fps){WALK.t=at;G.time=walkStarted+at;api.updateWhispers();}
  assert.deepEqual(said.map(x=>x.text),[pair.aside,pair.say]);
  api.planWhispers();api.stareReset();api.updateWhispers();
  assert.equal(said.length,2);assert.equal(STARE.exchange,null);
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
