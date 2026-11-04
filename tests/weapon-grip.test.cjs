// Exercise the actual hand geometry and animation without WebGL or texture drawing.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),vm=require('vm'),path=require('path');
const dir=path.join(__dirname,'..'),THREE=require(dir+'/three.min.js');
const poses=[];
let src=fs.readFileSync(dir+'/fight.js','utf8').replace('function buildHand(s,P,Mx){','function buildHand(s,P,Mx){poses.push({s,P,Mx});').replace('return {root,st,grip,','return {rig:{R,L,knifeGrip,gunGrip},root,st,grip,');
const slice=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,sat=t=>clamp(t,0,1),smooth=t=>{t=sat(t);return t*t*(3-2*t)},scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,390/780,.01,6);camera.updateMatrixWorld();
const ctx={THREE,poses,console,V3,UP:V3(0,1,0),PI:Math.PI,TAU:Math.PI*2,clamp,lerp,sat,smooth,smoother:t=>{t=sat(t);return t*t*t*(t*(t*6-15)+10)},easeOut:t=>1-(1-sat(t))**2,easeOut3:t=>1-(1-sat(t))**3,easeIn:t=>sat(t)**2,damp:(a,b,l,dt)=>lerp(a,b,1-Math.exp(-l*dt)),rnd:(a,b)=>(a+b)/2,STD:(c,o={})=>new THREE.MeshStandardMaterial({color:c,...o}),col:c=>new THREE.Color(c),vmScene:scene,vmCam:camera,camera,renderer:{},innerWidth:390,innerHeight:780,mergeChildren(){},measureDock:()=>({top:ctx.innerHeight-70}),G:{mode:'fight',inputLocked:false,paused:false,time:10},COMBAT:{},PREF:{blood:true},grabLayout:()=>({fx:.6,fy:-.3,fd:.6}),AUDIO:{whoosh(){},gunshot(){}},pickAt:()=>null,_fz:V3(0,0,1),_aimRest:V3(-.04,.12,-1).normalize(),$:(s)=>s==='#tools'?{offsetParent:true,getBoundingClientRect:()=>({top:690})}:null};
ctx.canvasTex=()=>new THREE.Texture();
const api=vm.runInNewContext(slice('function ensureDmg(', 'function tubeGeo(')+slice('const SCULPT=','/* ===== 3. 소리')+slice('const VM=(()=>{','onCamUnit=VM.setScale;')+';VM',ctx);
const weapons=poses.filter(p=>p.P.wristHand);
test('weapon grips have a right-handed anatomical frame and attached, opposing thumbs',()=>{
 assert.equal(weapons.length,2);
 for(const [i,{s,Mx,P}] of weapons.entries()){
  const p=v=>v.applyMatrix4(Mx),index=p(V3(-.033*s,.012,.025)),little=p(V3(.033*s,.01,.02)),wrist=p(V3(0,-.004,-.038)),dorsal=V3(0,1,0).transformDirection(Mx);
  const across=index.clone().sub(little),forward=index.clone().add(little).multiplyScalar(.5).sub(wrist);
  assert(V3().crossVectors(across,forward).dot(dorsal)<0,'right-handed index, wrist and dorsal frame');
  assert(Math.abs(Mx.determinant()-1)<1e-8,'proper rotation preserves outward surface normals');
  const root=V3(...P.thumb[0]),thenar=p(V3(-s*.031,-.012,-.008));
  assert(root.distanceTo(thenar)<.03,'thumb root joins the palm mound');
  if(i===0){assert(index.z>little.z);assert(Math.max(...P.thumb.map((p,j)=>p[2]+P.thumbR[j]))<.054,'thumb stays behind the blade');}
  else{assert(index.y>little.y);assert(index.x<0);assert(P.thumb.at(-1)[0]>0,'thumb opposes the trigger finger');assert(P.fingers[0].pts[0][0]<0);}
 }
});
test('wrists stay connected through swaps, stabs, slashes and recoil in both aspect ratios',()=>{
 for(const [w,h] of [[390,780],[844,390]]){
  ctx.innerWidth=w;ctx.innerHeight=h;camera.aspect=w/h;camera.updateProjectionMatrix();
  for(const tool of ['knife','gun','hand','knife','gun']){
   api.reset();api.setTool(tool);api.setScale(.4);api.st.swapT=1;api.computeRest();
   if(tool==='hand')continue;
   const grip=api.rig[tool==='knife'?'knifeGrip':'gunGrip'];
   const verify=()=>{const hand=api.rig.R.hand;hand.updateMatrix();const wrist=grip.userData.wrist.clone().applyMatrix4(hand.matrix);assert(wrist.distanceTo(api.rig.R.arm.g.position)<1e-9);assert(hand.matrix.elements.every(Number.isFinite));assert(!api.rig.L.hand.visible);assert.equal(api.rig.knifeGrip.visible,tool==='knife');assert.equal(api.rig.gunGrip.visible,tool==='gun');};
   api.update(0,false,0);verify();
   if(tool==='knife')api.attack('stab',w*.5,h*.35);else api.fire(w*.5,h*.35);
   for(let i=0;i<36;i++){api.update(1/60,false,1/60);verify();}
   if(tool==='knife'){api.slashStart(w*.7,h*.4);for(let i=0;i<6;i++){api.slashMove(w*(.7-i*.08),h*.4);api.update(1/60,false,1/60);verify();}api.slashEnd();}
  }
 }
});

test('intro resize and weapon return settle at exactly the same fist transform',()=>{
 const dock={hidden:false,style:{},getBoundingClientRect:()=>({left:10,width:220})};
 const tools={get offsetParent(){return dock.hidden?null:dock},getBoundingClientRect:()=>({top:ctx.innerHeight-72,height:58})};
 ctx.$=s=>s==='#dock'?dock:s==='#tools'?tools:null;
 ctx.measureDock=vm.runInNewContext('let dockBox=null;'+slice('function measureDock(){','// 설계자가 들어가야')+';measureDock',ctx);
 const snapshot=()=>{api.st.time=0;api.update(0,false,0);return ['R','L'].map(s=>({p:api.rig[s].hand.position.clone(),q:api.rig[s].hand.quaternion.clone(),scale:api.rig[s].hand.scale.clone()}));};
 for(const [w,h] of [[360,640],[390,780],[412,915],[844,390]])for(const repeat of [0,1]){
  ctx.innerWidth=390;ctx.innerHeight=780;camera.aspect=.5;api.reset();dock.hidden=false;api.setTool('hand');api.lowerHands();dock.hidden=true;
  // Mobile browser chrome changes viewport height while the dialogue keeps the dock hidden.
  ctx.innerWidth=w;ctx.innerHeight=h;camera.aspect=w/h;camera.updateProjectionMatrix();api.computeRest();
  assert(dock.hidden,'measuring must not show the controls');
  api.raiseHands();for(let i=0;i<36;i++)api.update(1/60,false,1/60);
  assert.equal(api.st.guardLift,1);const raised=snapshot();
  dock.hidden=false;api.computeRest();const unlocked=snapshot();
  api.setTool('knife');api.update(.3,false,.3);api.setTool('gun');api.update(.3,false,.3);api.setTool('hand');api.update(.3,false,.3);const returned=snapshot();
  for(let i=0;i<2;i++)for(const actual of [unlocked[i],returned[i]]){
   assert(raised[i].p.distanceTo(actual.p)<1e-9,'initial, unlocked and returned hand positions match');
   assert(raised[i].q.angleTo(actual.q)<1e-7);assert(raised[i].scale.distanceTo(actual.scale)<1e-9);
  }
 }
});

test('weapon mesh surfaces and normals remain finite after smoothing',()=>{
 for(const grip of [api.rig.knifeGrip,api.rig.gunGrip])grip.traverse(o=>{
  if(!o.isMesh)return;
  for(const key of ['position','normal'])assert([...o.geometry.attributes[key].array].every(Number.isFinite),key);
  const n=o.geometry.attributes.normal,used=new Set(o.geometry.index?o.geometry.index.array:Array.from({length:n.count},(_,i)=>i));
  for(const i of used){const len=V3().fromBufferAttribute(n,i).length();assert(len>.85&&len<1.15,'valid unit normals');}
 });
});
