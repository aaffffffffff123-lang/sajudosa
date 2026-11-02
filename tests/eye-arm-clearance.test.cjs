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
function penetration(E,a){
 const ci=new THREE.Matrix4().copy(E.bones.chest.matrixWorld).invert(),S=a.sh.position.clone(),e=a.el.getWorldPosition(V3()).applyMatrix4(ci),w=a.wr.getWorldPosition(V3()).applyMatrix4(ci);
 const objects=[[E.belly,api.BODYGEO.belly],[E.chestMesh,api.BODYGEO.chest],[E.face,(x,y,z)=>api.SCULPT.ell(x,y,z,0,-.005,.015,.218,.25,.245)]];
 const points=[];for(let i=9;i<=20;i++)points.push([S.clone().lerp(e,i/20),.108*smooth((i/20-.25)/.75)]);for(let i=1;i<=20;i++)points.push([e.clone().lerp(w,i/20),.116]);let deepest=0;
 for(const [mesh,sdf] of objects){const m=new THREE.Matrix4().copy(mesh.matrixWorld).invert().multiply(E.bones.chest.matrixWorld);for(const [p,r] of points){const q=p.clone().applyMatrix4(m);deepest=Math.max(deepest,r-sdf(q.x,q.y,q.z));}}
 return {deepest,upper:S.distanceTo(e),lower:e.distanceTo(w),wrist:w.toArray()};
}
const cases=[['rest',.12,.44,.42],['guard',1,.18,1.45],['face',1.5,.15,1.5],['raised',2.1,.12,1.7],['folded',.4,-.1,1.7],['ground',.12,1.2,.45],['brace',1.4,.3,.15],['hurt',.8,-.2,1.1]];
let failures=0;const results=[];
for(const [name,f,ab,eb] of cases){const E=rig();for(const a of E.arms){a.sh.rotation.set(-f,0,a.s*ab);a.el.rotation.x=-eb;}E.root.updateMatrixWorld(true);const before=E.arms.map(a=>penetration(E,a));const started=performance.now();api.ARM_CLEARANCE.apply(E);E.root.updateMatrixWorld(true);const after=E.arms.map(a=>penetration(E,a));for(const a of after){assert(Math.abs(a.upper-.235)<1e-6);assert(Math.abs(a.lower-.215)<1e-6);if(a.deepest>.014)failures++;}results.push({name,before:before.map(x=>+x.deepest.toFixed(4)),after:after.map(x=>+x.deepest.toFixed(4)),ms:+(performance.now()-started).toFixed(2)});}
assert.equal(failures,0,'named poses keep sleeves outside the torso');
let maxDepth=0,worst=null;const sweepStart=performance.now();
for(let i=0;i<240;i++){
 const E=rig(),t=i/239;E.bones.spine.rotation.set(.5*Math.sin(t*9),.12*Math.sin(t*7),0);E.bones.chest.rotation.x=.18*Math.sin(t*6);E.bones.head.rotation.set(.3*Math.sin(t*8),.4*Math.sin(t*5),.3*Math.sin(t*4));
 for(const a of E.arms){a.sh.rotation.set(-(.8+1.2*Math.sin(t*11+a.s*.2)),a.s*.3*Math.sin(t*6),a.s*(.45+.55*Math.sin(t*7)));a.el.rotation.x=-(.9+.85*Math.sin(t*13));}
 E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E);E.root.updateMatrixWorld(true);
 for(const a of E.arms){const p=penetration(E,a);if(p.deepest>maxDepth){maxDepth=p.deepest;worst={i,side:a.nm,...p};}if(p.deepest>.012)failures++;assert(Math.abs(p.upper-.235)<1e-6&&Math.abs(p.lower-.215)<1e-6);}
}
console.log('Sweep',JSON.stringify({maxDepth,worst,failures,ms:performance.now()-sweepStart}));
const moving=rig();let last=null,maxStep=0,stepAt=0,movingDepth=0;
for(let i=0;i<360;i++){
 const t=i/359;for(const a of moving.arms){a.sh.rotation.set(-(.8+1.0*Math.sin(t*5)),0,a.s*(.4+.35*Math.sin(t*7)));a.el.rotation.x=-(.85+.7*Math.sin(t*6));}
 moving.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(moving);moving.root.updateMatrixWorld(true);const p=moving.arms.map(a=>a.wr.getWorldPosition(V3()));moving.arms.forEach(a=>movingDepth=Math.max(movingDepth,penetration(moving,a).deepest));
 if(last)p.forEach((v,j)=>{const step=v.distanceTo(last[j]);if(step>maxStep){maxStep=step;stepAt=i;}});last=p;
}
console.log('Continuous motion',JSON.stringify({maxWristStep:maxStep,frame:stepAt,movingDepth}));
assert(maxStep<.03,'collision avoidance must not jump across the torso');
assert(movingDepth<.014,'animated sleeves must remain outside body colliders');
const ikMethods=vm.runInNewContext(slice('function solveTwoBone(','/* 여러 메시')+slice('const _down=V3','/* ===== 6-4.')+'({'+slice(' solveArm(a,',' releaseIK(side,')+'})',context);
const IK=rig();Object.assign(IK,ikMethods);IK._ikFrame=1;IK._ikUse={L:0,R:0};IK.ik={L:{w:1,goal:1,target:V3(),fd:V3(0,1,0),pd:V3(0,0,-1)},R:{w:1,goal:1,target:V3(),fd:V3(0,1,0),pd:V3(0,0,-1)}};
const borrowed=V3(-.1,-.32,.08);IK.setIK('L',{target:V3(-.13,1.3,.5),pole:borrowed});borrowed.set(.1,-.32,.08);IK.setIK('R',{target:V3(.13,1.3,.5),pole:borrowed});borrowed.set(9,9,9);assert(IK.ik.L.pole.equals(V3(-.1,-.32,.08)));assert(IK.ik.R.pole.equals(V3(.1,-.32,.08)));
let ikStep=0,ikPrevious=null;
for(let i=0;i<150;i++){
 const target=i<50?V3(.13,1.3,.5):i<100?V3(.03,1.1,.3):V3(.55,1.45,.5);IK.setIK('R',{target,rate:12,fd:V3(0,1,.3),pd:V3(0,0,-1)});
 IK.root.updateMatrixWorld(true);IK.solveArm(IK.arms[1],IK.ik.R,1/60);IK.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(IK);IK.root.updateMatrixWorld(true);
 const w=IK.arms[1].wr.getWorldPosition(V3());assert(w.toArray().every(Number.isFinite));if(ikPrevious)ikStep=Math.max(ikStep,w.distanceTo(ikPrevious));ikPrevious=w;
 const p=penetration(IK,IK.arms[1]);assert(Math.abs(p.upper-.235)<1e-6&&Math.abs(p.lower-.215)<1e-6);
}
assert(ikStep<.08,'changing IK actions must interpolate their targets');console.log('IK target/pole regression passed',ikStep);
// Re-run an identical base pose: no random elbow choice or left/right shared state.
const E=rig();for(const a of E.arms){a.sh.rotation.set(-1,0,a.s*.18);a.el.rotation.x=-1.45;}E.root.updateMatrixWorld(true);api.ARM_CLEARANCE.apply(E);const once=E.arms.map(a=>a.wr.getWorldPosition(V3()));api.ARM_CLEARANCE.apply(E);E.arms.forEach((a,i)=>assert(a.wr.getWorldPosition(V3()).distanceTo(once[i])<1e-6));
// The eye must move once, stop exactly at contact, then dilate monotonically.
for(const fps of [30,60,120]){
 let calls=0;const mat={uniforms:{uGaze:{value:new THREE.Vector2()},uPupil:{value:0},uGlow:{value:0}}};
 const eyeApi=vm.runInNewContext('const TILT=6.4;'+slice(' const T_SEE=TILT',' // 끝 구도:')+slice(' function updateEye(k,dt){',' function update(dt){')+';({eye,updateEye,T_SEE,T_DILATE,T_SHIFT})',{...context,mat,AUDIO:{gaze(){calls++}},caster:{visible:false},applyLights(){}});
 let y=-.048,p=.68;
 for(let i=0;i<=20*fps;i++){eyeApi.updateEye(i/fps,1/fps);const e=eyeApi.eye;assert(e.gaze.y>=y-1e-12&&e.gaze.y<=1e-12);assert(e.gaze.x===0);assert(e.pupil>=p-1e-12);if(i/fps<eyeApi.T_DILATE)assert(e.pupil===.68);if(i/fps>eyeApi.T_SEE+eyeApi.T_SHIFT)assert(e.gaze.length()===0);y=e.gaze.y;p=e.pupil;}
 assert.equal(calls,1);assert.equal(eyeApi.eye.pupil,1.08);
}
console.log('Eye: 30/60/120 fps monotonic gaze, fixed contact, delayed dilation passed');
if(failures)process.exitCode=1;
