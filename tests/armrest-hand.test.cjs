const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const section=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const throne=new THREE.Group();throne.position.z=-.86;throne.updateMatrixWorld(true);
const ctx={THREE,V3,PI:Math.PI,TAU:Math.PI*2,clamp,lerp,smooth,WORLD:{throne}};
const api=vm.runInNewContext(section('const SCULPT=','/* ===== 3. 소리')+section('const BELLY_C=','/* 신발(흑화)')+section('const ARM_CLEARANCE=','class Emperor{')+section('function solveTwoBone(','/* 여러 메시')+section('const _down=V3','/* ===== 6-4.')+';({BODYGEO,ARM_CLEARANCE,methods:{'+section(' solveArm(a,',' releaseIK(side,')+'}})',ctx);
const bone=(p,v)=>{const o=new THREE.Group();o.position.set(...v);p.add(o);return o};
function rig(){
 const root=new THREE.Group(),pelvis=bone(root,[0,.54,0]),spine=bone(pelvis,[0,.06,0]),chest=bone(spine,[0,.24,-.01]),neck=bone(chest,[0,.265,0]),head=bone(neck,[0,.06,.03]);
 root.position.z=-.62;spine.rotation.x=-.08;
 const E={root,bones:{pelvis,spine,chest,neck,head},belly:bone(spine,[0,0,0]),chestMesh:bone(chest,[0,0,0]),face:bone(head,[0,.215,0]),arms:[],ik:{},_ikFrame:0,_ikUse:{L:0,R:0},tabletHeld:false,combat:{mode:"seat"},updateActions(){}};
 Object.assign(E,api.methods);
 for(const s of [-1,1]){const nm=s<0?'L':'R',sh=bone(chest,[s*.265,.19,.1]),um=bone(sh,[0,-.118,0]),el=bone(um,[0,-.117,0]),fm=bone(el,[0,-.108,0]),wr=bone(fm,[0,-.107,0]);E.arms.push({s,nm,sh,um,el,fm,wr,L1:.235,L2:.215});E.ik[nm]={w:0,goal:0,target:V3(),fd:V3(),pd:V3()};}
 return E;
}
const pose=vm.runInNewContext('('+src.match(/throne:P\((\{[^\n]+?\})\),/)[1]+')');
const seatCode=section('poseCopy(POSES.throne,T);'," }else if(b.mode==='stand')");
const geometry=api.BODYGEO.build(),regions=[];
for(const s of [-1,1]){
 regions.push(new THREE.Box3(V3(s*.6-.06,.7475,-1.15),V3(s*.6+.06,.7925,-.53)));
 regions.push(new THREE.Box3(V3(s*.6-.045,.45,-1.12),V3(s*.6+.045,.75,-.56)));
 regions.push(new THREE.Box3(V3(s*.6-.026,.68,-.6),V3(s*.6+.026,.84,-.44)));
}
function penetration(E){let deepest=0;
 for(const a of E.arms)for(const [joint,key] of [[a.sh,'shoulder'],[a.um,'uarm'],[a.el,'elbow'],[a.fm,'farm'],[a.wr,'palm']]){
  const v=geometry[key].attributes.position;
  for(let i=0;i<v.count;i+=3){const p=V3().fromBufferAttribute(v,i).applyMatrix4(joint.matrixWorld);for(const b of regions)if(b.containsPoint(p))deepest=Math.max(deepest,Math.min(p.x-b.min.x,b.max.x-p.x,p.y-b.min.y,b.max.y-p.y,p.z-b.min.z,b.max.z-p.z));}
 }return deepest;
}
let worst=0,maxStep=0;
for(const fps of [30,60,120]){
 const E=rig(),T={...pose},scope={...ctx,E,T,POSES:{throne:pose},poseCopy:(a,b)=>Object.assign(b,a),dt:1/fps,time:0,_bv1:V3(),_bv2:V3(),_bv3:V3(),_bv4:V3()};let previous=null;
 for(let i=0;i<fps*2;i++){
  scope.time=i/fps;vm.runInNewContext(seatCode,scope);
  for(const a of E.arms){a.sh.rotation.set(-T[a.nm+'sF'],0,a.s*T[a.nm+'sA']);a.el.rotation.x=-T[a.nm+'eB'];a.wr.rotation.set(0,0,0);E.ik[a.nm].w=lerp(E.ik[a.nm].w,1,1-Math.exp(-8/fps));}
  E.root.updateMatrixWorld(true);for(const a of E.arms)E.solveArm(a,E.ik[a.nm],1/fps);E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,1/fps);E.root.updateMatrixWorld(true);
  worst=Math.max(worst,penetration(E));const wrists=E.arms.map(a=>a.wr.getWorldPosition(V3()));if(previous)wrists.forEach((p,j)=>maxStep=Math.max(maxStep,p.distanceTo(previous[j])));previous=wrists;
  for(const a of E.arms){assert(Math.abs(a.sh.getWorldPosition(V3()).distanceTo(a.el.getWorldPosition(V3()))-.235)<1e-6);assert(Math.abs(a.el.getWorldPosition(V3()).distanceTo(a.wr.getWorldPosition(V3()))-.215)<1e-6);}
 }
 // Standing up moves the chair relative to the chest, even when local joint angles do not change.
 for(let i=0;i<30;i++){E.root.position.z+=.045;E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E,1/fps);E.root.updateMatrixWorld(true);worst=Math.max(worst,penetration(E));}
 console.log('Seated armrest pose',fps,'fps',previous.map(v=>v.toArray()));
}
console.log({deepestArmrestIntersection:worst,maxWristStep:maxStep});
assert(worst<.003,'actual sleeve and palm surfaces must stay outside the throne');
assert(maxStep<.07,'armrest correction must not snap between poses');
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
