const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const path=require('path'),repo=path.resolve(__dirname,'..');
const THREE=require(path.join(repo,'three.min.js'));
const source=fs.readFileSync(path.join(repo,'fight.js'),'utf8');
const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)},smoother=t=>{t=clamp(t,0,1);return t*t*t*(t*(6*t-15)+10)};
const context={THREE,V3,PI:Math.PI,TAU:Math.PI*2,clamp,lerp,smooth,smoother,_down:V3(0,-1,0)};
const api=vm.runInNewContext(slice('const SCULPT=','/* ===== 3. 소리')+slice('const BELLY_C=','/* 신발(흑화)')+slice('const ARM_CLEARANCE=','class Emperor{')+'\n({SCULPT,BODYGEO,ARM_CLEARANCE});',context);
const bone=(parent,p)=>{const b=new THREE.Group();b.position.set(...p);parent.add(b);return b;};
function rig(){
 const root=new THREE.Group(),pelvis=bone(root,[0,.62,0]),spine=bone(pelvis,[0,.06,0]),chest=bone(spine,[0,.24,-.01]),neck=bone(chest,[0,.265,0]),head=bone(neck,[0,.06,.03]),face=bone(head,[0,.215,0]);
 const belly=bone(spine,[0,0,0]),chestMesh=bone(chest,[0,0,0]);const E={root,bones:{pelvis,spine,chest,neck,head},belly,chestMesh,face,arms:[]};
 for(const s of [-1,1]){const sh=bone(chest,[s*.265,.19,-.01]),um=bone(sh,[0,-.118,0]),el=bone(um,[0,-.117,0]),fm=bone(el,[0,-.108,0]),wr=bone(fm,[0,-.107,0]);E.arms.push({s,nm:s<0?'L':'R',sh,um,el,fm,wr,L1:.235,L2:.215});}return E;
}
// 팔 중심선(어깨→팔꿈치 뒷반, 팔꿈치→손목)과 손(손바닥·손끝) 표본이 몸통·머리 겉면 안으로 들어간 깊이(+면 안쪽)
function depth(E,a){
 const ci=new THREE.Matrix4().copy(E.bones.chest.matrixWorld).invert(),S=a.sh.position.clone(),e=a.el.getWorldPosition(V3()).applyMatrix4(ci),w=a.wr.getWorldPosition(V3()).applyMatrix4(ci);
 const hq=a.sh.quaternion.clone().multiply(a.el.quaternion).multiply(a.wr.quaternion),hd=V3(0,-1,0).applyQuaternion(hq);
 const objects={belly:[E.belly,api.BODYGEO.belly],chest:[E.chestMesh,api.BODYGEO.chest],head:[E.face,(x,y,z)=>api.SCULPT.ell(x,y,z,0,-.005,.015,.218,.25,.245)]};
 const arm=[];for(let i=10;i<=20;i++)arm.push(S.clone().lerp(e,i/20));for(let i=0;i<=20;i++)arm.push(e.clone().lerp(w,i/20));
 const hand=[w.clone().addScaledVector(hd,.065),w.clone().addScaledVector(hd,.135)];
 const out={upper:S.distanceTo(e),lower:e.distanceTo(w),wrist:w.toArray()};
 for(const k in objects){const [mesh,sdf]=objects[k],m=new THREE.Matrix4().copy(mesh.matrixWorld).invert().multiply(E.bones.chest.matrixWorld);
  let d=-1,h=-1;for(const p of arm){const q=p.clone().applyMatrix4(m);d=Math.max(d,-sdf(q.x,q.y,q.z));}for(const p of hand){const q=p.clone().applyMatrix4(m);h=Math.max(h,-sdf(q.x,q.y,q.z));}
  out[k]=d;out[k+'Hand']=h;}
 return out;
}
const lengthsOk=(E)=>{for(const a of E.arms){const p=depth(E,a);assert(Math.abs(p.upper-.235)<1e-6&&Math.abs(p.lower-.215)<1e-6,'bone lengths are kept');}};
// 가슴 좌표의 팔꿈치·손목 위치로 어깨·팔꿈치 회전을 맞춘다(실제 게임에서 잰 자세를 그대로 재현하려고)
function poseTo(a,e,w){const S=a.sh.position,DOWN=V3(0,-1,0);const qU=new THREE.Quaternion().setFromUnitVectors(DOWN,V3().subVectors(e,S).normalize()),qL=new THREE.Quaternion().setFromUnitVectors(DOWN,V3().subVectors(w,e).normalize());a.sh.quaternion.copy(qU);a.el.quaternion.copy(qU.clone().invert().multiply(qL));a.wr.rotation.set(0,0,0);}
// 1. Legacy deep-belly pose must now be corrected, while preserving limb lengths.
{
 const E=rig();for(const a of E.arms)poseTo(a,V3(a.s*.195,.039,.156),V3(a.s*.104,-.091,.301));E.root.updateMatrixWorld(true);
 const before=E.arms.map(a=>[a.sh.quaternion.clone(),a.el.quaternion.clone(),a.wr.quaternion.clone()]),d0=E.arms.map(a=>depth(E,a));
 assert(d0.every(d=>d.belly>.04),'test pose must rest inside the soft belly');
 api.ARM_CLEARANCE.apply(E,1/60);
 E.root.updateMatrixWorld(true);lengthsOk(E);E.arms.forEach((a,i)=>{const d=depth(E,a);assert(d.belly<d0[i].belly,'soft-belly penetration is reduced');assert(d.belly<.025,'forearm stays outside the deep belly');});
 console.log('Legacy deep-belly pose is corrected',JSON.stringify(d0.map(d=>+d.belly.toFixed(3))));
}
// 2. 손을 얼굴 속에 집어넣는 자세: 머리 밖(허용 깊이)으로 밀려나고, 자세를 계속 유지해도 매 프레임 같은 자리다(떨림 없음)
{
 const E=rig();const pose=()=>{for(const a of E.arms)poseTo(a,V3(a.s*.315,.39,.10),V3(a.s*.117,.472,.085));};
 pose();E.root.updateMatrixWorld(true);const raw=E.arms.map(a=>depth(E,a));assert(raw.some(d=>d.head>.03||d.headHand>.03),'test pose must push a hand into the head');
 let prev=null,maxStep=0,settledStep=0;
 for(let f=0;f<240;f++){pose();E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,1/60);E.root.updateMatrixWorld(true);
  const w=E.arms.map(a=>a.wr.getWorldPosition(V3()));if(prev){const st=Math.max(...w.map((v,i)=>v.distanceTo(prev[i])));maxStep=Math.max(maxStep,st);if(f>180)settledStep=Math.max(settledStep,st);}prev=w;lengthsOk(E);}
 for(const a of E.arms){const d=depth(E,a);assert(d.head<.02+.004,'forearm centreline stays out of the head: '+d.head);assert(d.headHand<.03+.004,'palm and fingertips stay out of the head: '+d.headHand);}
 assert(settledStep<1e-4,'settled pose stays within 0.1 mm per frame (was '+settledStep+')');
 assert(maxStep<.08,'a hand that starts deep inside the head is pushed out over several frames, not in one (was '+maxStep+')');
 console.log('Hand-into-face pose: pushed out, no frame-to-frame jitter',JSON.stringify({maxStep:+maxStep.toFixed(4),settledStep}));
}
// 3. 팔을 천천히 얼굴로 들어 올려 가는 동안 손목이 프레임마다 뛰지 않는다(연속성)
{
 const E=rig();let prev=null,maxStep=0;
 for(let f=0;f<240;f++){const t=f/239;for(const a of E.arms)poseTo(a,V3(a.s*.195,.039,.156).lerp(V3(a.s*.315,.39,.10),t),V3(a.s*.104,-.091,.301).lerp(V3(a.s*.117,.472,.085),t));
  E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,1/60);E.root.updateMatrixWorld(true);lengthsOk(E);
  const w=E.arms.map(a=>a.wr.getWorldPosition(V3()));if(prev)maxStep=Math.max(maxStep,...w.map((v,i)=>v.distanceTo(prev[i])));prev=w;
  for(const a of E.arms){const d=depth(E,a);assert(d.head<.02+.02,'head is never entered deeply while raising the arms: '+d.head);}}
 assert(maxStep<.03,'continuous motion stays continuous (was '+maxStep+')');
 console.log('Raising arms into the face: continuous, head kept clear',maxStep.toFixed(4));
}
// 4. 손목이 소매 안쪽으로 접히지 않는다 / 떨어진 팔은 건드리지 않는다
{
 const E=rig();
 for(let frame=0;frame<60;frame++){
  for(const a of E.arms){a.sh.rotation.set(-1.1,0,a.s*.2);a.el.rotation.x=-1.4;a.wr.rotation.set(frame<30?2.4:-2.4,0,a.s*.7);}
  E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,1/60);E.root.updateMatrixWorld(true);
  for(const a of E.arms){const f=V3(0,-1,0).applyQuaternion(a.el.getWorldQuaternion(new THREE.Quaternion())),h=V3(0,-1,0).applyQuaternion(a.wr.getWorldQuaternion(new THREE.Quaternion()));assert(f.dot(h)>=Math.cos(.86),'palm cannot fold back into the sleeve');}
 }
 const detached=E.arms[0],held=detached.sh.quaternion.clone();detached.sh.userData.detached=true;
 api.ARM_CLEARANCE.apply(E,1/60);assert(detached.sh.quaternion.angleTo(held)<1e-7,'detached arm is not driven by the pose solver');
 console.log('Wrist bend and detached-arm checks passed');
}
const ikMethods=vm.runInNewContext(slice('function solveTwoBone(','/* 여러 메시')+slice('const _down=V3','/* ===== 6-4.')+'({'+slice(' solveArm(a,',' releaseIK(side,')+'})',context);
const IK=rig();Object.assign(IK,ikMethods);IK._ikFrame=1;IK._ikUse={L:0,R:0};IK.ik={L:{w:1,goal:1,target:V3(),fd:V3(0,1,0),pd:V3(0,0,-1)},R:{w:1,goal:1,target:V3(),fd:V3(0,1,0),pd:V3(0,0,-1)}};
const borrowed=V3(-.1,-.32,.08);IK.setIK('L',{target:V3(-.13,1.3,.5),pole:borrowed});borrowed.set(.1,-.32,.08);IK.setIK('R',{target:V3(.13,1.3,.5),pole:borrowed});borrowed.set(9,9,9);assert(IK.ik.L.pole.equals(V3(-.1,-.32,.08)));assert(IK.ik.R.pole.equals(V3(.1,-.32,.08)));
let ikStep=0,ikPrevious=null;
for(let i=0;i<150;i++){
 const target=i<50?V3(.13,1.3,.5):i<100?V3(.03,1.1,.3):V3(.55,1.45,.5);IK.setIK('R',{target,rate:12,fd:V3(0,1,.3),pd:V3(0,0,-1)});
 IK.root.updateMatrixWorld(true);IK.solveArm(IK.arms[1],IK.ik.R,1/60);IK.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(IK,1/60);IK.root.updateMatrixWorld(true);
 const w=IK.arms[1].wr.getWorldPosition(V3());assert(w.toArray().every(Number.isFinite));if(ikPrevious)ikStep=Math.max(ikStep,w.distanceTo(ikPrevious));ikPrevious=w;
 const p=depth(IK,IK.arms[1]);assert(Math.abs(p.upper-.235)<1e-6&&Math.abs(p.lower-.215)<1e-6);
}
// 손목이 한 프레임에 얼마나 움직이는지는 IK의 follow 보간(rate)이 정하는 것이고 밀어내기 솔버가 제한하지 않는다(예전 솔버의 초당 1.5m 제한이 바로 떨림의 원인이었다)
console.log('IK target/pole regression passed (max wrist step per frame '+ikStep.toFixed(4)+')');
// Re-run an identical base pose: no random elbow choice or left/right shared state.
const E=rig();for(const a of E.arms){a.sh.rotation.set(-1,0,a.s*.18);a.el.rotation.x=-1.45;}E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E);const once=E.arms.map(a=>a.wr.getWorldPosition(V3()));api.ARM_CLEARANCE.apply(E);E.arms.forEach((a,i)=>assert(a.wr.getWorldPosition(V3()).distanceTo(once[i])<1e-6));
// The 3D eye contact regression lives in encounter-ending.test.cjs (30/60/120 fps).
