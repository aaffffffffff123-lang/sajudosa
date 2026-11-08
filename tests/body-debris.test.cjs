const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const THREE=require('../three.min.js'),source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j);};
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){if(this.parent)this.parent.remove(this);return this;};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const forgotten=[],GEO={},scope={THREE,V3,clamp,GEO,PI:Math.PI,TAU:Math.PI*2,rnd:(a,b)=>(a+b)/2,
 _bv6:V3(),_hq1:new THREE.Quaternion(),_he:new THREE.Euler(),PREF:{blood:true},isFleshMat:()=>false,ensureDmg(){},
 BLOOD:{forgetTree:o=>forgotten.push(o),emit(){}},AUDIO:new Proxy({}, {get:()=>()=>{}})};
const methods=vm.runInNewContext(slice('const _mgM=','/* 빠른 짧은 광선 검사')+
 '({'+slice('limbCorners(root){','detachLimb(joint,')+slice('releaseGeometry(g){',' crownUpdate(dt){')+'})',scope);
function rig(){
 const scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);const bones={};
 for(const [name,p] of Object.entries({pelvis:[0,.25,.5],spine:[0,.25,.1],chest:[0,.25,-.3],neck:[0,.25,-.55],head:[0,.25,-.7]})){
  const b=new THREE.Group();b.position.set(...p);root.add(b);bones[name]=b;
 }
 return {...methods,scene,root,bones,bits:[],disposables:[],goreMeshes:[],severed:[],severedHeads:[],headPieces:[],looseEyes:[]};
}
function bit(E,{x=0,z=0,y=.06,body=true,life,limb=false,material}={}){
 const obj=new THREE.Group(),geo=new THREE.BoxGeometry(limb?.1:.12,limb?.5:.12,.12),mat=material||new THREE.MeshStandardMaterial();
 const mesh=new THREE.Mesh(geo,mat);obj.add(mesh);obj.position.set(x,y,z);E.scene.add(obj);
 const b={obj,body,v:V3(),w:V3(),r:.06,bounce:.16,rest:true,ttl:life,sound:limb?'limb':'head'};
 if(limb)b.twitch={t:0,dur:7,hop:100,list:[]};
 b.corners=E.limbCorners(obj);E.bits.push(b);return b;
}
function frames(E,seconds,hz=60){for(let n=0;n<seconds*hz;n++)E.updateBits(1/hz);}

test('resting fragments leave the fallen torso gradually without moving the body, across frame rates',()=>{
 for(const hz of [30,60,120]){
  const E=rig(),b=bit(E),body=E.root.position.clone();
  E.prepareBodyBit(b);b.bodyAge=1;const first=b.obj.position.clone();E.updateBits(1/hz);
  assert(b.obj.position.distanceTo(first)<.10,'no instantaneous teleport');
  frames(E,1,hz);
  assert(Math.abs(b.obj.position.x)>.25,'fragment moves to the side of the body');
  assert(E.root.position.equals(body),'contact never changes the opponent or combat rules');
  const settled=b.obj.position.clone();frames(E,1,hz);
  assert(b.obj.position.distanceTo(settled)<.015,'no continued drift after separation');
  assert(b.obj.position.toArray().every(Number.isFinite));
 }
});
test('airborne, distant and non-body items keep their existing paths',()=>{
 const E=rig(),air=bit(E,{y:2}),far=bit(E,{x:2}),money=bit(E,{body:false});
 for(const b of [air,far]){E.prepareBodyBit(b);b.bodyAge=1;}
 const before=[air,far,money].map(b=>b.obj.position.clone());frames(E,.5);
 [air,far,money].forEach((b,i)=>assert(b.obj.position.equals(before[i])));
 const launch=bit(E,{x:-.3,y:1});launch.rest=false;launch.v.set(-.2,1,0);E.prepareBodyBit(launch);
 assert(launch.v.x<-.2,'severed limb receives an outward bias');assert.equal(launch.v.y,1,'vertical launch is preserved');
});
test('contact geometry follows moving bones and excludes a detached or regrowing limb',()=>{
 const E=rig(),a=new THREE.Group(),b=new THREE.Group();E.root.add(a,b);a.position.set(2,.2,0);b.position.set(2,.2,.5);
 E.bones.shoulderL=a;E.bones.elbowL=b;E.prepareBodyContacts();const c=E._bodyContacts.find(c=>c.a==='shoulderL');
 assert(c.on);assert.equal(c.p.x,2);a.position.x=3;E.prepareBodyContacts();assert.equal(c.p.x,3);
 b.userData.detached=true;E.prepareBodyContacts();assert(!c.on);
 const fresh=new THREE.Group();fresh.position.set(3,.2,.5);E.root.add(fresh);E.bones.elbowL=fresh;E.prepareBodyContacts();assert(c.on);
});
test('twitching finishes before a private fade, then geometry and tracking references are released',()=>{
 const E=rig(),live=new THREE.MeshStandardMaterial(),b=bit(E,{x:3,y:.26,limb:true,material:live});
 E.severed.push(b.obj);let disposed=0;live.addEventListener('dispose',()=>disposed++);
 frames(E,8.5);assert(b.obj.parent,'piece remains after its full seven-second twitch');assert.equal(live.opacity,1);assert(!b.fadeMats);
 frames(E,1);assert(b.fadeMats&&b.fadeMats.every(f=>f.m.opacity<1));assert.equal(live.opacity,1);assert(!live.transparent);
 frames(E,1);assert(!b.obj.parent);assert(!E.severed.includes(b.obj));assert.equal(E.disposables.length,0);assert.equal(disposed,0,'shared live material survives');
 assert(forgotten.includes(b.obj),'attached blood references are removed');
});
test('fading preserves custom shaders, material arrays and opacity of shared live materials',()=>{
 const E=rig(),m=new THREE.MeshStandardMaterial({opacity:.7}),b=bit(E,{material:m});
 const hook=()=>{},key=()=>'custom';m.onBeforeCompile=hook;m.customProgramCacheKey=key;
 const mesh=b.obj.children[0];mesh.material=[m,m];E.fadeBodyBit(b,.4);
 assert.equal(mesh.material[0],mesh.material[1]);assert.notEqual(mesh.material[0],m);
 assert.equal(mesh.material[0].onBeforeCompile,hook);assert.equal(mesh.material[0].customProgramCacheKey,key);
 assert(Math.abs(mesh.material[0].opacity-.28)<1e-9);assert.equal(m.opacity,.7);assert.equal(E.disposables.length,1);
 E.fadeBodyBit(b,.2);assert.equal(E.disposables.length,1,'no per-frame material allocation');
 E.retireBit(b);assert.equal(E.disposables.length,0);
});
test('revival clears fading and fresh body pieces plus tethers, preserving props and shared geometry',()=>{
 const E=rig(),a=bit(E),b=bit(E,{x:1}),prop=bit(E,{body:false}),shared=new THREE.BoxGeometry(.1,.1,.1);
 GEO.debrisTest=shared;b.obj.children[0].geometry=shared;let sharedDisposed=0;shared.addEventListener('dispose',()=>sharedDisposed++);
 E.fadeBodyBit(a,.3);E.severed=[a.obj,b.obj];E.headPieces=[a.obj];E.looseEyes=[b.obj];E.dangles=[{piv:a.obj.children[0]}];
 const tube=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial());E.scene.add(tube);let tubeDisposed=0;tube.geometry.addEventListener('dispose',()=>tubeDisposed++);
 E.tethers=[{bit:b,from:E.bones.head,tube:{mesh:tube,geo:tube.geometry}}];
 E.clearBodyBits();E.clearBodyBits();
 assert.deepEqual(E.bits,[prop]);assert(prop.obj.parent);assert(!a.obj.parent&&!b.obj.parent&&!tube.parent);
 assert.equal(E.severed.length+E.headPieces.length+E.looseEyes.length+E.dangles.length+E.tethers.length,0);
 assert.equal(E.disposables.length,0);assert.equal(tubeDisposed,1);assert.equal(sharedDisposed,0);delete GEO.debrisTest;
});
test('repeated creation and expiration leave no live fragments or owned fade materials',()=>{
 const E=rig();for(let round=0;round<5;round++){
  for(let i=0;i<24;i++)bit(E,{x:2+i*.05,life:.3});frames(E,1.6);E.updateBits(0);
  assert.equal(E.bits.length,0);assert.equal(E.disposables.length,0);assert.equal(E.scene.children.length,1);
 }
});
test('the actual revival swap preserves stage blood and money while replacing the body',()=>{
 const E=rig(),fragment=bit(E),halo=bit(E,{body:false}),money=new THREE.Group();E.scene.add(money);E.lookIndex=2;E.combat={x:.7,z:.9};
 E.endAct=()=>{};E.updateMaterials=()=>{};let cleared=0,rebound=0;const G={E,result:{},retired:[]};
 const ctx={G,CHUNKS:{clear(){cleared++}},BLOOD:{rawLost:2.3,rebindKeepStage(){rebound++}},
  Emperor:class{constructor(r,index){this.lookIndex=index;this.root=new THREE.Group();this.tabletHeld=false}setPhase(){}},
  wireEmperor(){},combatInit(e){e.combat={}},CROWD:{rev:{}},lite:2};
 vm.runInNewContext(slice('function replaceEmperorForRevival(){','function finishRevival(){')+'replaceEmperorForRevival();',ctx);
 assert(!fragment.obj.parent);assert(!halo.obj.parent,'the old halo and other worn props leave with the old body');assert.equal(E.bits.length,0);assert(money.parent,'loose stage objects are untouched');assert(!E.root.parent);
 assert.equal(cleared,1);assert.equal(rebound,1);assert.equal(G.E.bloodRawBase,2.3);assert.equal(G.E.combat.x,.7);assert.equal(G.E.combat.z,.9);
 assert.equal(G.E.lookIndex,2);assert.equal(G.E.reviveGlow,1.7);assert.equal(G.retired[0],E);
});
