const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const Motion=require('../fight-motion.js'),THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const section=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const throne=new THREE.Group();throne.position.z=-.86;throne.updateMatrixWorld(true);
const ctx={THREE,V3,PI:Math.PI,TAU:Math.PI*2,clamp,lerp,smooth,WORLD:{throne},COMBAT_STAGE:{root:{visible:true},throne},G:{mode:'fight',time:0},damp:(a,b,k,dt)=>lerp(a,b,1-Math.exp(-k*dt))};
for(let i=1;i<=6;i++)ctx['_bv'+i]=V3();
const api=vm.runInNewContext(section('const SCULPT=','/* ===== 3. 소리')+section('const BELLY_C=','/* 신발(흑화)')+section('const ARM_CLEARANCE=','class Emperor{')+section('function solveTwoBone(','/* 여러 메시')+section('const _down=V3','/* ===== 6-4.')+section("const POSE_KEYS=","Object.assign(Emperor.prototype,{")+section('function combatSeatPose(', 'function combatInit(')+section('function combatPose(', 'function combatFloor(')+';({BODYGEO,ARM_CLEARANCE,STAND,P,combatSeatPose,resetSeatedEncounter,combatPose,methods:{'+section(' applyPose(p){',' setCurl(a,')+section(' solveArm(a,',' placeTablet(){')+section(' updateActions(out,',' // 얼굴 좌표(face')+'}})',ctx);
const bone=(p,v)=>{const o=new THREE.Group();o.position.set(...v);p.add(o);return o};
function rig(){
 const root=new THREE.Group(),pelvis=bone(root,[0,.665,0]),spine=bone(pelvis,[0,.06,0]),chest=bone(spine,[0,.24,-.01]),neck=bone(chest,[0,.265,0]),head=bone(neck,[0,.06,.03]);
 root.position.z=-.62;spine.rotation.x=-.08;
 const E={root,bones:{pelvis,spine,chest,neck,head},belly:bone(spine,[0,0,0]),chestMesh:bone(chest,[0,0,0]),face:bone(head,[0,.215,0]),arms:[],ik:{},_ikFrame:0,_ikUse:{L:0,R:0},tabletHeld:false,combat:new Motion.Body(true),pose:{},rootPos:V3(),sp:{drop:{x:0}},apronF:new THREE.Group(),apronB:new THREE.Group(),belt:new THREE.Group(),rest:{L:{on:true},R:{on:true}},guard:0,guardHold:0,guardCool:0,armHurt:[0,0],state:'stand',breath:0,endAct(){this.act=null},_combatPoseSerial:-1,_combatFrom:{},_combatTarget:{}};
 Object.assign(E,api.methods);E.pose={...api.STAND};for(const k of ['pelvis','spine','chest','neck','head','belly','L','R','Lk','Rk'])E.sp[k]={X:0,Y:0,Z:0,x:0};
 for(const s of [-1,1]){const nm=s<0?'L':'R',sh=bone(chest,[s*.265,.19,.1]),um=bone(sh,[0,-.118,0]),el=bone(um,[0,-.117,0]),fm=bone(el,[0,-.108,0]),wr=bone(fm,[0,-.107,0]);E.arms.push({s,nm,sh,um,el,fm,wr,L1:.235,L2:.215});E.ik[nm]={w:0,goal:0,target:V3(),fd:V3(),pd:V3()};}
 E.legs=[];for(const s of [-1,1]){const nm=s<0?'L':'R',hip=bone(pelvis,[s*.135,-.02,0]),tm=bone(hip,[0,-.145,0]),knee=bone(tm,[0,-.145,0]),sm=bone(knee,[0,-.128,0]),ank=bone(sm,[0,-.127,0]);E.legs.push({s,nm,hip,tm,knee,sm,ank});}
 return E;
}
const geometry=api.BODYGEO.build(),regions=[];
for(const s of [-1,1]){
 regions.push(new THREE.Box3(V3(s*.62-.065,.7575,-1.2),V3(s*.62+.065,.8025,-.5)));
 regions.push(new THREE.Box3(V3(s*.62-.045,.425,-1.175),V3(s*.62+.045,.755,-.525)));

}
function penetration(E){let deepest=0;
 for(const a of E.arms)for(const [joint,key] of [[a.sh,'shoulder'],[a.um,'uarm'],[a.el,'elbow'],[a.fm,'farm'],[a.wr,'palm']]){
  const v=geometry[key].attributes.position;
  for(let i=0;i<v.count;i+=3){const p=V3().fromBufferAttribute(v,i).applyMatrix4(joint.matrixWorld);for(const b of regions)if(b.containsPoint(p))deepest=Math.max(deepest,Math.min(p.x-b.min.x,b.max.x-p.x,p.y-b.min.y,b.max.y-p.y,p.z-b.min.z,b.max.z-p.z));}
 }return deepest;
}
const chair=[new THREE.Box3(V3(-.56,.42,-1.14),V3(.56,.50,-.54)),new THREE.Box3(V3(-.65,.09,-1.20),V3(.65,.41,-.50))];
function legPenetration(E){let deepest=0;const samples=[[E.bones.pelvis,'seat']];
 for(const l of E.legs)samples.push([l.hip,'hip'],[l.tm,'thigh'],[l.knee,'knee'],[l.sm,'shin']);
 for(const [joint,key] of samples){const attr=geometry[key].attributes.position;for(let i=0;i<attr.count;i++){const p=V3().fromBufferAttribute(attr,i).applyMatrix4(joint.matrixWorld);for(const b of chair)if(b.containsPoint(p))deepest=Math.max(deepest,Math.min(p.x-b.min.x,b.max.x-p.x,p.y-b.min.y,b.max.y-p.y,p.z-b.min.z,b.max.z-p.z));}}
 return deepest;
}
let worst=0,worstLeg=0,maxStep=0,exitPenetration=0;
for(const fps of [30,60,120])for(const route of ['direct','submit','empty']){
 const E=rig(),dt=1/fps;E.tabletHeld=route!=='empty';
 // The old start pose has straight legs inside the cushion and front board.
 E.pose.tz=-.62;E.applyPose(E.pose);E.root.updateMatrixWorld(true);
 assert(legPenetration(E)>.04,'fixture reproduces the old chair penetration');
 if(route==='submit'){
  ctx.G.mode='submit';
  for(let i=0;i<fps;i++){
   E.updateActions(E.pose,dt,i/fps);E.applyPose(E.pose);E.root.updateMatrixWorld(true);
   for(const a of E.arms){E.ik[a.nm].w=1;E.solveArm(a,E.ik[a.nm],dt);}E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,dt);
  }
  assert(E.arms.every(a=>a.safeE&&E.ik[a.nm].follow),'submission leaves cached sermon poses');
 }
 ctx.G.mode='fight';api.resetSeatedEncounter(E);
 assert(E.arms.every(a=>!a.safeE&&!E.ik[a.nm].follow),'entry discards the old arm solution');
 let previous=null;
 for(let i=0;i<fps*3;i++){
  // Opening input lock intentionally freezes Body.age. The pose must already be seated.
  assert.equal(E.combat.age,0);api.combatPose(E,E.pose,dt,i/fps);E.applyPose(E.pose);E.root.updateMatrixWorld(true);
  for(const a of E.arms){const ik=E.ik[a.nm];ik.w=ctx.damp(ik.w,ik.goal,ik.rate,dt);E.solveArm(a,ik,dt);}
  E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,dt);E.root.updateMatrixWorld(true);
  worst=Math.max(worst,penetration(E));
  if(i===0||i===fps*3-1)worstLeg=Math.max(worstLeg,legPenetration(E));
  const wrists=E.arms.map(a=>a.wr.getWorldPosition(V3()));if(previous)wrists.forEach((p,j)=>maxStep=Math.max(maxStep,p.distanceTo(previous[j])));previous=wrists;
  for(const a of E.arms){
   const shoulder=a.sh.getWorldPosition(V3()),elbow=a.el.getWorldPosition(V3()),wrist=a.wr.getWorldPosition(V3());
   assert(Math.abs(shoulder.distanceTo(elbow)-.235)<1e-6);assert(Math.abs(elbow.distanceTo(wrist)-.215)<1e-6);
   if(route==='empty')assert(elbow.y<shoulder.y-.12,'resting elbows stay below shoulders instead of spreading horizontally');
  }
  for(const l of E.legs){const knee=l.knee.getWorldPosition(V3()),ank=l.ank.getWorldPosition(V3());assert(knee.y>ank.y+.24,'shins hang downward');assert(knee.z>-.4&&ank.z>-.4,'knees and shins stay in front of the chair');}
 }
 // Check the first-hit exit still brings the legs forward before unfolding them.
 E.standPose=out=>Object.assign(out,api.STAND);E.combat.hit({kind:'jab'});
 for(let i=0;i<fps*.6;i++){E.combat.step(dt);api.combatPose(E,E.pose,dt,3+i/fps);E.applyPose(E.pose);E.root.updateMatrixWorld(true);exitPenetration=Math.max(exitPenetration,legPenetration(E));}
 console.log(route,fps+'fps: locked entry and first-hit exit checked');
}
console.log({deepestArmrestIntersection:worst,deepestSeatIntersection:worstLeg,maxWristStep:maxStep,exitPenetration});
assert(worst<.003,'actual sleeves and palms must stay outside the active throne');
assert(worstLeg<.003,'actual trousers must stay above the seat and in front of the chair');
assert(exitPenetration<.015,'leaving the seat must not sink the legs into the cushion');
assert(maxStep<.07,'entry correction must not snap between frames');
assert.match(section('function combatInit(', 'function combatActive('),/if\(seated\)resetSeatedEncounter\(E\)/,'both entry routes initialize the seated pose');
// Extract the actual viewmodel orientation and check mirrored anatomy in camera space.
const orient=vm.runInNewContext(section(' const mTmp=new THREE.Matrix4(),xa=V3()', ' const ANCH=')+';orient',ctx);
const restCode=section(' function computeRest(){',' const H=');
for(const portrait of [true,false]){
 const rest={R:{p:V3(),q:new THREE.Quaternion()},L:{p:V3(),q:new THREE.Quaternion()}};
 vm.runInNewContext(restCode+'computeRest();',{...ctx,orient,rest,computeHeld(){},portrait:()=>portrait,dockY:()=>-.75,st:{tool:'hand'},at:(x,y,z,p)=>p.set(x,y,z)});
 for(const [side,s] of [['R',1],['L',-1]]){
  const handSign=Number(src.match(new RegExp(side+'\\.fist=fist\\('+side+'\\.hand,(-?1)\\)'))[1]);
  const thumbBase=V3(-handSign*.04,-.007,-.014).applyQuaternion(rest[side].q);
  assert(s*thumbBase.x<0,'the '+side+' thumb must face the center of the screen');
  assert(thumbBase.y>0,'the '+side+' thumb must roll upward into view');
 }
}
console.log('Both fists have inward thumbs in portrait and landscape.');

// The money grip must remain readable from the player's camera throughout a fan cycle.
const gripTools=vm.runInNewContext(section('function mk(geo,','/* 여러 메시')+section('function banknoteStack(){','/* ===== 6-0.')+';({banknoteStack,methods:{'+section(' _hand(wr,',' _legs(){')+','+section(' setCurl(a,',' /* ---- 팔 IK:')+section(' placeTablet(){',' dropTablet(force){')+'}})',{...ctx,BODYGEO:api.BODYGEO,FLESH:{clone:g=>g.clone()},isFleshMat:()=>false,ensureDmg:()=>{},_av1:V3(),_aq1:new THREE.Quaternion()});
{
 const E=rig();Object.assign(E,gripTools.methods);E.tabletHeld=true;E.M=new Proxy({}, {get(t,k){return t[k]||(t[k]=new THREE.MeshStandardMaterial({color:0xb19d82}));}});
 E.addFlesh=(g,m,p)=>{const mesh=new THREE.Mesh(g,m);p.add(mesh);return mesh};
 for(const a of E.arms){a.hand=E._hand(a.wr,a.s,'hand'+a.nm);for(const [joint,key] of [[a.sh,'shoulder'],[a.um,'uarm'],[a.el,'elbow'],[a.fm,'farm']])joint.add(new THREE.Mesh(geometry[key],E.M.robe));}
 E.tablet=new THREE.Group();E.tablet.add(new THREE.Mesh(gripTools.banknoteStack(),new THREE.MeshStandardMaterial({side:THREE.DoubleSide})));const scene=new THREE.Scene();scene.add(E.root,E.tablet);ctx.G.mode='fight';api.resetSeatedEncounter(E);
 let worstVisible=4,mostVisible=0;
 for(let frame=0;frame<180;frame++){
  const dt=1/60;ctx.G.time=frame*dt;api.combatPose(E,E.pose,dt,ctx.G.time);E.applyPose(E.pose);E.root.updateMatrixWorld(true);
  for(const a of E.arms){const ik=E.ik[a.nm];ik.w=ctx.damp(ik.w,ik.goal,ik.rate,dt);E.solveArm(a,ik,dt);E.setCurl(a,.5);}
  E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,dt);E.root.updateMatrixWorld(true);E.placeTablet();scene.updateMatrixWorld(true);
  if(frame%6)continue;
  const a=E.arms[1],eye=V3(0,1.15,2.8);let visible=0;
  for(const F of a.hand.fingers){let seen=false;for(const y of [-.008,-.02]){const target=F.f2.localToWorld(V3(0,y,0)),ray=new THREE.Raycaster(eye,target.sub(eye).normalize());const hits=ray.intersectObject(scene,true);if(hits.length&&F.f.getObjectById(hits[0].object.id))seen=true;}if(seen)visible++;}
  worstVisible=Math.min(worstVisible,visible);mostVisible=Math.max(mostVisible,visible);
  const local=E.arms[1].wr.worldToLocal(E.tablet.getWorldPosition(V3()));assert(local.distanceTo(V3(-.028,-.085,.045-.06*.8))<1e-7,'note stack stays fixed inside the fist');
 }
 assert(worstVisible>=3,'at least three fingers remain visible through fanning, got '+worstVisible);assert.equal(mostVisible,4,'all four fingers are distinguishable');
 // 부채 자루를 쥔 주먹: 엄지가 위, 새끼손가락이 아래. 지폐는 엄지 쪽으로 빠져나와 위로 서고 앞면이 나를 본다
 // (예전에는 새끼손가락 쪽으로 빠져나와서 지폐를 세우려니 주먹이 거꾸로 뒤집혀 있었다)
 {
  const a=E.arms[1],q=E.tablet.getWorldQuaternion(new THREE.Quaternion());
  const thumb=a.hand.thumb.t.getWorldPosition(V3()),index=a.hand.fingers[0].f.getWorldPosition(V3()),pinky=a.hand.fingers[3].f.getWorldPosition(V3());
  assert(thumb.y>pinky.y+.03&&index.y>pinky.y+.03,'thumb and index on top, little finger at the bottom');
  const up=V3(0,1,0).applyQuaternion(q),thumbSide=V3(0,0,1).transformDirection(a.wr.matrixWorld),face=V3(0,0,1).applyQuaternion(q);
  assert(up.y>.7,'the bills stand up out of the fist: '+up.toArray());assert(up.dot(thumbSide)>.99,'the bills leave the fist past the thumb');
  assert(face.z>.6,'the bill faces look toward the player: '+face.toArray());
 }
 console.log('Money grip visible fingers through fan cycle:',{worstVisible,mostVisible});
}

// The hand turns to the orientation the IK asks for. ARM_CLEARANCE once passed the same quaternion as both the
// target and the result of slerpQuaternions, which froze every hand in its first pose: after the money dropped the
// wrist kept the money grip, and only the 49° unbend nudged it toward the forearm.
{
 const E=rig(),a=E.arms[1],ik=E.ik.R,dt=1/60,q=new THREE.Quaternion();
 const step=(fd,pd)=>{ik.goal=1;ik.w=1;ik.target.set(.28,1.0,.4);ik.fd.copy(fd);ik.pd.copy(pd);ik.space='root';ik.rate=30;
  E.root.updateMatrixWorld(true);E.solveArm(a,ik,dt);E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,dt);E.root.updateMatrixWorld(true);};
 const grip=[V3(-.8,.1,.35).normalize(),V3(.05,.12,1).normalize()],rest=[V3(-.75,-.45,.5).normalize(),V3(-.35,-.35,-.87).normalize()];
 for(let f=0;f<90;f++)step(...grip);
 for(let f=0;f<90;f++)step(...rest);
 a.wr.getWorldQuaternion(q);
 const fingers=V3(0,-1,0).applyQuaternion(q),palm=V3(-a.s,0,0).applyQuaternion(q);
 const forearm=a.wr.getWorldPosition(V3()).sub(a.el.getWorldPosition(V3())).normalize();
 const bend=Math.acos(clamp(fingers.dot(forearm),-1,1));
 assert(palm.angleTo(rest[1])<.35,'the palm turns to the resting direction, got '+palm.toArray().map(v=>v.toFixed(2)));
 assert(bend<.86,'the wrist never folds past the unbend limit');
 console.log('Hand follows the IK after the grip:',{palmError:+palm.angleTo(rest[1]).toFixed(3),fingerError:+fingers.angleTo(rest[0]).toFixed(3),wristBend:+bend.toFixed(3)});
}
