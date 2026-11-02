const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a);assert(i>=0,a);const j=source.indexOf(b,i);assert(j>i,b);return source.slice(i,j)};
function setup({voice=false}={}){
 const G={mode:'fight',time:0,tool:'hand',E:{face:{},setEmotion(){}},opening:false,inputLocked:false};
 const elements=new Map(),shown=[],calls={clears:0,focus:0,omen:0,beyond:0,again:0};
 const $=s=>{if(!elements.has(s))elements.set(s,{hidden:false,style:{},classList:{add(){},remove(){}}});return elements.get(s)};
 const BUB={cut(b){b.voice?.stop()},say(anchor,text,dur,options){const b={anchor,text,until:G.time+dur,voice:voice?{busy:true,started:true,stop(){this.busy=false}}:null};shown.push(b);return b}};
 const scope={G,$,BUB,VOICE:{player:{},boss:{}},HINTS:{hand:'tap'},typeTime:()=>.2,V3:()=>({}),hint(){},focusCanvas(){calls.focus++},clearPointers(){calls.clears++},BEYOND:{DUR:10.4,prepare:()=>true,omen(){calls.omen++},begin(){calls.beyond++}},showAgain(){calls.again++}};
 const script=slice('const LINES={','// 되살림 컷씬:')+slice('const TALK=','/* ---- 추임새:')+slice('function onDead(){','/* ---- 게이지 ---- */')+slice('function updateStory(){','function damageBar(');
 const api=vm.runInNewContext(script+';({startEncounter,updateTalk,talkBusy,clearTalk,firstStrikeLine,onDead,updateStory,TALK,LINES})',scope);
 function advance(seconds){for(let i=0;i<seconds*60;i++){G.time+=1/60;api.updateStory();api.updateTalk(1/60)}}
 return {...api,G,shown,calls,$,advance};
}
test('opening keeps controls locked through both lines, then unlocks once',()=>{
 const h=setup();h.startEncounter();assert(h.G.inputLocked);assert(h.$('#dock').hidden);
 h.advance(.5);assert.equal(h.shown[0].text,'넌 뭐야?');assert(h.G.inputLocked);
 h.advance(2.3);assert.equal(h.shown[1].text,'천지신명이시여...');assert(h.G.inputLocked);
 h.advance(2);assert(!h.G.inputLocked);assert(!h.$('#dock').hidden);assert.equal(h.calls.focus,1);
 h.advance(2);assert.equal(h.calls.focus,1);
 h.firstStrikeLine();h.advance(.1);assert.equal(h.shown.at(-1).text,'죽어!');
});
test('a playing greeting stays locked; unavailable speech eventually releases the lock',()=>{
 const h=setup({voice:true});h.startEncounter();h.advance(.5);h.shown[0].voice.stop();h.advance(2.3);
 const greeting=h.shown[1];assert.equal(greeting.text,'천지신명이시여...');
 h.advance(2);assert(h.G.inputLocked,'audio still playing');
 h.advance(2.5);assert(!h.G.inputLocked);assert(!greeting.voice.busy);
});
test('restart cancels old audio and starts the locked opening from the first line',()=>{
 const h=setup({voice:true});h.startEncounter();h.advance(.5);const old=h.shown[0];
 h.startEncounter();assert(!old.voice.busy);assert(h.G.inputLocked);h.advance(.5);
 assert.equal(h.shown.at(-1).text,'넌 뭐야?');assert.equal(h.calls.focus,0);
});
test('final victory is the player line, once, and completes before the sky reveal',()=>{
 const h=setup({voice:true});h.onDead();h.onDead();assert(h.G.ended);assert(h.G.inputLocked);
 h.advance(.5);assert.equal(h.shown.length,1);assert.equal(h.shown[0].text,'운명좁밥ㅋ');assert(h.shown[0].anchor.player);
 h.advance(3);assert.equal(h.calls.omen,0);assert.equal(h.calls.beyond,0,'do not interrupt the voice');
 h.advance(1.6);assert.equal(h.calls.omen,1);assert.equal(h.calls.beyond,0);
 h.advance(2);assert.equal(h.calls.beyond,1);h.advance(12);assert.equal(h.calls.again,1);
});
test('revival collapse does not trigger the final victory line',()=>{
 const h=setup();h.G.revival={};h.onDead();assert(!h.G.ended);assert.equal(h.TALK.q.length,0);
});
test('locked, paused, and non-combat inputs cannot start fist, knife, gun, or slash actions',()=>{
 const G={inputLocked:true,paused:false,mode:'fight'};
 const src=slice(' function attack(kind,sx,sy,info){',' function reload(){}')+slice(' function slashStart(sx,sy){',' function slashMove(');
 const api=vm.runInNewContext(src+';({attack,fire,slashStart})',{G});
 for(const state of [{inputLocked:true,paused:false,mode:'fight'},{inputLocked:false,paused:true,mode:'fight'},{inputLocked:false,paused:false,mode:'submit'}]){
  Object.assign(G,state);assert.equal(api.attack('jab',100,100),false);assert.equal(api.attack('stab',100,100),false);assert.equal(api.fire(100,100),false);assert.equal(api.slashStart(100,100),false);
 }
});
test('eye moves once, settles before dilation, and holds the original image without pulsing',()=>{
 const THREE=require('../three.min.js'),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const lerp=(a,b,t)=>a+(b-a)*t,smoother=t=>{t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)};
 for(const fps of [30,60,120]){
  let calls=0;const mat={uniforms:{uGaze:{value:new THREE.Vector2()},uPupil:{value:0},uGlow:{value:0}}};
  const api=vm.runInNewContext('const TILT=6.4;'+slice(' const T_SEE=TILT',' // 끝 구도:')+slice(' function updateEye(k,dt){',' function update(dt){')+';({eye,updateEye,T_SEE,T_DILATE,T_SHIFT})',{THREE,clamp,lerp,smoother,mat,AUDIO:{gaze(){calls++}},caster:{visible:false},applyLights(){}});
  let y=-.022,p=.86;
  for(let frame=0;frame<20*fps;frame++){
   const t=frame/fps;api.updateEye(t,1/fps);const eye=api.eye;
   assert(eye.gaze.y>=y-1e-12&&eye.gaze.y<=0);assert.equal(eye.gaze.x,0);assert(eye.pupil>=p-1e-12);
   if(t<api.T_SEE+api.T_SHIFT)assert.equal(calls,0);
   if(t<api.T_DILATE)assert.equal(eye.pupil,.86);
   if(t>=api.T_SEE+api.T_SHIFT)assert.equal(eye.gaze.length(),0);
   if(t>10){assert.equal(eye.pupil,1);assert.equal(eye.lock,1)}
   assert.equal(mat.uniforms.uGlow.value,0);y=eye.gaze.y;p=eye.pupil;
  }
  assert.equal(calls,1);
 }
});
