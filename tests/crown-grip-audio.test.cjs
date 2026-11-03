const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js'),source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const scope={THREE,V3,PI:Math.PI,TAU:Math.PI*2,clamp,lerp,smooth:t=>{t=clamp(t,0,1);return t*t*(3-2*t)}};
const crown=vm.runInNewContext(slice('const SCULPT=','/* ===== 3. 소리')+slice('const HEADGEO=','/* ===== 6-0-2.')+slice('const CROWN_FIT=','class Emperor{')+';({HEADGEO,CROWN_FIT,update:{'+slice(' crownUpdate(dt){','\n});')+'}.crownUpdate})',scope);
function crownRig(){const cr=new THREE.Group();cr.position.set(0,.205,-.015);cr.rotation.x=-.05;return {crown:cr,crownRest:{p:cr.position.clone(),r:cr.rotation.clone()}};}
function deepest(geo,cr){
 const p=geo.attributes.position,ix=geo.index&&geo.index.array;let depth=0;
 for(let i=0;i<(ix?ix.length:p.count);i+=3){const vs=[0,1,2].map(k=>V3().fromBufferAttribute(p,ix?ix[i+k]:i+k));
  for(let a=0;a<=6;a++)for(let b=0;b<=6-a;b++){const q=vs[0].clone().multiplyScalar(a/6).addScaledVector(vs[1],b/6).addScaledVector(vs[2],1-(a+b)/6).applyQuaternion(cr.quaternion).add(cr.position);depth=Math.max(depth,-crown.HEADGEO.human(q.x,q.y,q.z),-crown.HEADGEO.hair(q.x,q.y,q.z));}
 }return depth;
}
test('tilted crown shell and lower rim stay outside the actual sculpted scalp',()=>{
 const E=crownRig(),old=new THREE.CylinderGeometry(.15,.166,.12,32);old.translate(0,.03,0);
 E.crown.rotation.set(-.05-1.1*.2,0,1.1*.45);E.crown.position.set(1.1*.035,.205-1.1*.012,-.015);
 assert(deepest(old,E.crown)>.03,'fixture reproduces the intersecting solid cap');
 const shell=new THREE.CylinderGeometry(.15,.166,.12,32,1,true);shell.translate(0,.03,0);
 const rim=new THREE.TorusGeometry(.181,.0055,6,56);rim.rotateX(Math.PI/2);rim.translate(0,-.033,0);
 const top=new THREE.CircleGeometry(.15,32);top.rotateX(-Math.PI/2);top.translate(0,.09,0);
 let worst=0,maxLift=0;
 for(let i=0;i<=24;i++){crown.CROWN_FIT.apply(E.crown,E.crownRest,i*1.15/24);maxLift=Math.max(maxLift,E.crown.position.y-.205);for(const g of [shell,rim,top])worst=Math.max(worst,deepest(g,E.crown));}
 assert(worst<.001,'crown intersects head by '+worst);assert(maxLift<.17,'crown lift stays within its radius while tipping onto one edge');
 crown.CROWN_FIT.apply(E.crown,E.crownRest,0);assert(Math.abs(E.crown.position.y-.205)<.01,'resting position only needs a small clearance correction');
});
test('crown recovery is frame-rate independent and never moves a detached crown',()=>{
 const ys=[];for(const fps of [30,60,120]){const E=crownRig();E.crownTilt=1.1;for(let i=0;i<fps*2;i++)crown.update.call(E,1/fps);ys.push(E.crown.position.y);assert(Math.abs(E.crownTilt-1.08)<1e-8);E.crownOn=false;const p=E.crown.position.clone(),q=E.crown.quaternion.clone();crown.update.call(E,1);assert(p.equals(E.crown.position));assert(q.equals(E.crown.quaternion));}assert(Math.max(...ys)-Math.min(...ys)<1e-8);
});
test('repeated knife hits dislodge the crown instead of tilting indefinitely',()=>{
 const hit=vm.runInNewContext('(function(){'+slice("  if(part==='crown'&&(sharp||gun))",'  // 막기')+'})',{part:'crown',sharp:true,gun:false,dir:V3(1,0,0),P:1,kind:'slash',out:{},AUDIO:{crown(){},voice(){}}});
 const E={kickBody(){},doFlinch(){},knockCrown(){this.crownOn=false}};for(let i=0;i<4;i++)hit.call(E);assert.equal(E.crownOn,false);
});

test('collar grip keeps the wrist aligned across screen sizes, drag locations and hand scales',()=>{
 const ctx={...scope,vmCam:{aspect:1},innerWidth:390,innerHeight:844};
 const api=vm.runInNewContext(slice(' const TAN=Math.tan(THREE.MathUtils.degToRad(30));\n function ndc',' // 도구칸 위쪽')+';({poseCollarGrip,at,ANCH})',ctx);
 let worst=0;
 for(const aspect of [390/844,844/390,16/9])for(const scale of [.45,.7,1])for(const x of [-.8,0,.8])for(const y of [-.75,0,.75]){
  ctx.vmCam.aspect=aspect;const h={p:V3(),q:new THREE.Quaternion(),anch:api.ANCH.L,scale};api.poseCollarGrip(h,x,y);
  const wrist=V3(0,-.005,-.1).multiplyScalar(scale).applyQuaternion(h.q).add(h.p),fwd=V3(0,0,1).applyQuaternion(h.q),arm=wrist.clone().sub(h.anch).normalize();
  worst=Math.max(worst,Math.acos(clamp(fwd.dot(arm),-1,1)));
  const contact=V3(-.014,-.028,.046).multiplyScalar(scale).applyQuaternion(h.q).add(h.p);assert(contact.distanceTo(api.at(x-.025,y+.015,.8))<1e-8);
  assert(h.p.toArray().concat(h.q.toArray()).every(Number.isFinite));
 }
 assert(worst<.08,'wrist bends by '+worst+' radians');
});

test('revival keeps both authored cheers and their vowel-based speech voices',()=>{
 const calls=[],people=Array.from({length:6},()=>({head:{},goal:{}})),VOICE={crowd:Array.from({length:6},(_,i)=>({pitch:400+i*30}))};
 const cheer=vm.runInNewContext(slice(' function cheer(){',' function sides(){')+';cheer',{people,VOICE,V3,stance(){},mood(){},LINES:{cheer:[[1,'살아나셨다!',0],[4,'천지신명님 만세!',.45]]},later:(t,f)=>f(),BUB:{say:(a,text,d,o)=>calls.push({text,voice:o.voice})},AUDIO:{}});
 cheer();assert.deepEqual(calls.map(c=>c.text),['살아나셨다!','천지신명님 만세!']);assert.equal(calls[0].voice,VOICE.crowd[1]);assert.equal(calls[1].voice,VOICE.crowd[4]);
});
test('rapid hits fade the previous deity cry and never queue or double the actor',()=>{
 const sources=[],live=new Set(),reactionLive=[],ctx={currentTime:1,createBufferSource(){const s={playbackRate:{},connect(){},disconnect(){},stop(t){this.stopped=t}};sources.push(s);return s},createGain(){return {gain:{value:0,cancelScheduledValues(){},setTargetAtTime(){}},connect(){},disconnect(){}}}};
 const play=vm.runInNewContext(slice(' function playReaction(name,k){',' let lastV=')+';playReaction',{ctx,SFX:{'v:grunt':[{},{}]},fallbackVoice:null,reactionBags:{},reactionLast:{},reactionLive,live,clamp,R:(a,b)=>(a+b)/2,vbus:{},startClip(s,c,t){s.started=t}});
 for(let i=0;i<20;i++){ctx.currentTime+=.2;play('grunt',1);assert.equal(reactionLive.length,1);if(i)assert(sources[i-1].stopped<=ctx.currentTime+.035);}
 for(const s of sources)s.onended();assert.equal(live.size,0);assert.equal(reactionLive.length,0);
});
