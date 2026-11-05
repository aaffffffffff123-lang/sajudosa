const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),THREE=require('../three.min.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t),V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);

test('music, effects and voice have separate dry and reverb gain paths',()=>{
 const nodes=[];
 const param=()=>({value:0,setTargetAtTime(v){this.value=v}});
 const node=()=>{const n={edges:[],gain:param(),connect(other){this.edges.push(other);return other},threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()};nodes.push(n);return n};
 class AC{constructor(){this.currentTime=0;this.sampleRate=10;this.destination=node()}createGain(){return node()}createDynamicsCompressor(){return node()}createConvolver(){return node()}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)}}createPeriodicWave(){return {}}}
 const scope={window:{AudioContext:AC},clamp,makeIR(){return {}},makeFallbackVoice(){},loadSoundBank(){},loadBackVoice(){},loadOpeningVoice(){},loadGreetingVoice(){},loadFirstHitVoice(){},loadVictoryVoice(){},loadQuipVoice(){},loadRetortVoice(){},loadMusic(){}};
 const api=vm.runInNewContext(slice(' let ctx=null,master,',' // 한 번만 받아')+slice(' function init(',' function unlock(')+slice(' function out(pan=0',' // 살짝 찌그러뜨려')+'let tts=null;({init,setVolumes,out,get context(){return ctx},get buses(){return {bus,vbus,mbus,verb,vverb,comp}}})',scope);
 const primed=new AC();api.setVolumes({music:.2,effects:.6,voice:0});api.init(primed);const {bus,vbus,mbus,verb,vverb,comp}=api.buses;
 assert.equal(api.context,primed,'use the context unlocked by the entry gesture');
 assert.equal(mbus.gain.value,.2);assert.equal(bus.gain.value,.6);assert.equal(vbus.gain.value,0);
 for(const b of [bus,vbus,mbus])assert.deepEqual(b.edges,[comp]);
 const voice=api.out(0,.5,true),effect=api.out(0,.5,false);
 assert(voice.edges.includes(vbus));assert(effect.edges.includes(bus));
 assert(voice.edges.some(n=>n.edges.includes(vverb)));assert(effect.edges.some(n=>n.edges.includes(verb)));
 assert(vverb.edges[0].edges.includes(vbus));assert(verb.edges[0].edges.includes(bus));
 api.setVolumes({music:0,voice:.4,effects:1});assert.equal(mbus.gain.value,0);assert.equal(vbus.gain.value,.4);assert.equal(bus.gain.value,1);
 api.setVolumes({music:Infinity,effects:-2,voice:9});assert.equal(mbus.gain.value,0);assert.equal(bus.gain.value,0);assert.equal(vbus.gain.value,1);
});

function inputs(tool='hand'){
 const events={},calls=[],part={},COMBAT={pointer:null},G={time:0,mode:'fight',tool,paused:false,inputLocked:false,E:{parts:[part],combat:{drag(){},release(cancel){calls.push(cancel?'cancel-grab':'release')}}}};
 const canvas={addEventListener:(k,fn)=>events[k]=fn,setPointerCapture(){},hasPointerCapture:()=>false,classList:{remove(){}}};
 const VM={fire:()=>calls.push('shot'),attack:k=>calls.push(k),slashStart:()=>calls.push('slash-start'),slashMove(){},slashEnd:()=>calls.push('slash-end'),grip(){}};
 const scope={G,COMBAT,canvas,VM,AUDIO:{unlock(){}},HOLD_GRAB_SECONDS:Number(source.match(/const HOLD_GRAB_SECONDS=([.\d]+)/)[1]),pickAt:()=>({obj:part,part:'chest'}),combatCancel(){},combatAttack:(x,y,k='jab')=>calls.push(k),combatGrab:p=>{p.grabbing=true;p.decided=true;COMBAT.pointer=p.id;calls.push('grab')},innerWidth:390,innerHeight:844,slashPath:()=>calls.push('slash-path'),finishLimb:()=>calls.push('finish-limb'),finishEar:()=>calls.push('finish-ear'),finishBody:()=>calls.push('finish-body')};
 const api=vm.runInNewContext(slice('const ptrs=new Map();','// 키보드(PC)')+';({pollPointers,clearPointers,ptrs})',scope);
 const event=(kind,x=100,y=100)=>events[kind]({type:kind,pointerId:1,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault(){}});
 return {G,calls,event,...api};
}
test('touch tap, swipe and deliberate hold produce exactly one intended hand action',()=>{
 let h=inputs();h.event('pointerdown');h.G.time=.3;h.pollPointers();assert.deepEqual(h.calls,[]);h.event('pointerup');assert.deepEqual(h.calls,['jab']);
 h=inputs();h.event('pointerdown');h.G.time=.12;h.event('pointermove',160,105);h.G.time=.5;h.pollPointers();h.event('pointerup');assert.deepEqual(h.calls,['hook']);
 h=inputs();h.event('pointerdown');h.G.time=.39;h.pollPointers();h.event('pointerup');assert.deepEqual(h.calls,['grab','release']);
 h=inputs();h.event('pointerdown');h.G.time=.2;h.event('pointercancel');assert.deepEqual(h.calls,[]);assert.equal(h.ptrs.size,0);
});
test('knife cancel never commits a pending cut; gun hold stops on release',()=>{
 let h=inputs('knife');h.event('pointerdown');h.event('pointermove',130,100);h.event('pointercancel');assert(!h.calls.some(s=>s.startsWith('finish-')));assert(h.calls.includes('slash-end'));
 h=inputs('knife');h.event('pointerdown');h.event('pointerup');assert.deepEqual(h.calls,['stab']);
 h=inputs('gun');h.event('pointerdown');h.G.time=.2;h.pollPointers();h.event('pointerup');h.G.time=1;h.pollPointers();assert.deepEqual(h.calls,['shot','shot']);
});
test('touches during the encounter cannot survive the unlock or block the next tap',()=>{
 for(const tool of ['hand','knife','gun']){
  const h=inputs(tool);h.G.inputLocked=true;h.G.opening=true;
  h.event('pointerdown');h.G.time=8;h.pollPointers();assert.equal(h.ptrs.size,0);assert.deepEqual(h.calls,[]);
  h.clearPointers();h.G.opening=false;h.G.inputLocked=false;
  h.event('pointerup');h.event('lostpointercapture');assert.deepEqual(h.calls,[]);
  h.event('pointerdown');h.event('pointerup');
  assert.deepEqual(h.calls,[tool==='hand'?'jab':tool==='knife'?'stab':'shot']);
 }
});

test('followers only spray after the wall, with a bounded pool during sustained hits',()=>{
 const scene=new THREE.Scene(),root=new THREE.Group(),people=Array.from({length:6},(_,i)=>{const root=new THREE.Group(),head=new THREE.Group();root.position.set(i-3,0,0);head.position.y=1;root.add(head);scene.add(root);return {root,head}});
 const G={time:1,ended:false,inputLocked:false},rev={on:false};let sobs=0;
 const api=vm.runInNewContext(slice(" const state={mode:'hidden'",' function setMode(')+';({state,witnessHit,updateTears,tearMesh,tearDrops})',{THREE,V3,scene,root,people,G,rev,col:x=>new THREE.Color(x),UP:V3(0,1,0),rnd:(a,b)=>(a+b)/2,AUDIO:{crowdSob(){sobs++}}});
 api.witnessHit();api.updateTears(.016,G.time);assert.equal(api.tearMesh.count,0);
 api.state.watching=true;
 for(let i=0;i<1200;i++){G.time+=1/60;api.witnessHit(2);api.updateTears(1/60,G.time);assert(api.tearMesh.count<=108);}
 assert(api.tearMesh.count>24);assert(sobs<20,'sob voices have a cooldown');assert(api.tearDrops.every(d=>d.p.toArray().every(Number.isFinite)));
 rev.on=true;const until=api.state.cryUntil;G.time++;api.witnessHit();api.updateTears(.1,G.time);assert.equal(api.state.cryUntil,until);assert.equal(api.tearMesh.visible,false);
 rev.on=false;G.ended=true;api.updateTears(.1,G.time);assert.equal(api.tearMesh.visible,false);
});

test('submission reveals its choice at four seconds and rejects early activation',()=>{
 const G={time:3.99,mode:'submit',submitReadyAt:4},dock={hidden:true};
 const api=vm.runInNewContext(slice('function updateStory(){','function damageBar(')+slice('function startFightFromSubmit(){',"$('#submitFight').addEventListener")+';({updateStory,startFightFromSubmit})',{G,$:()=>dock});
 api.updateStory();assert.equal(dock.hidden,true);api.startFightFromSubmit();
 G.time=4;api.updateStory();assert.equal(dock.hidden,false);assert.equal(G.submitReadyAt,0);
});
test('low-quality ending keeps a visual omen when shadows are disabled',()=>{
 const shade={style:{}},G={time:.95},renderer={shadowMap:{enabled:false}},key={position:V3(1,6,2),target:{position:V3()},shadow:{camera:new THREE.OrthographicCamera(-1,1,1,-1)}},caster=new THREE.Mesh();caster.visible=false;let sounds=0;
 const scope={G,renderer,key,caster,$:()=>shade,OMEN:{delay:.2,dur:1.5},omenT0:0,active:false,eye:{lock:0},shadowSaved:null,omenSound:false,_od:V3(),_or:V3(),_ou:V3(),_ol:V3(),UP:V3(0,1,0),clamp,smooth,lerp,AUDIO:{omen(){sounds++}}};
 const update=vm.runInNewContext(slice(' function updateOmen(){',' let omenSound=false;')+';updateOmen',scope);update();assert(Number(shade.style.opacity)>0);assert.equal(sounds,1);update();assert.equal(sounds,1);renderer.shadowMap.enabled=true;update();assert.equal(shade.style.opacity,'0');
});
