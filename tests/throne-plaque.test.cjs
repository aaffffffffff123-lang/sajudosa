const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),plaque=require('../throne-plaque.js'),source=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const cut=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
test('walking arrives at the same framing used in combat; plaque lettering clears the top HUD',()=>{
 for(const [w,h] of [[360,640],[390,844],[412,915],[1280,800],[1440,900]]){
  const root=new THREE.Group(),p=plaque.create(THREE,root,()=>new THREE.Texture());p.layout(w,h);root.updateMatrixWorld(true);
  const b={x:0,z:-.62,mode:'seated'},E={root:new THREE.Group(),combat:b,pose:{rx:0}},G={mode:'fight',E};
  const CAM={frame:'stand',pos:V3(),look:V3(),goalPos:V3(),goalLook:V3()},WALK={p1:V3(),l1:V3()};
  const scope={THREE,PI:Math.PI,V3,lerp,clamp,G,CAM,WALK,COMBAT:{landKick:0},onCamUnit:null,innerWidth:w,innerHeight:h};
  const api=vm.runInNewContext(cut('function combatCamera(dt){','function combatAttack(')+cut('function walkGoal(){','function walkStart(')+';({combatCamera,walkGoal})',scope);
  api.walkGoal();api.combatCamera(1);assert(WALK.p1.distanceTo(CAM.goalPos)<1e-8);assert(WALK.l1.distanceTo(CAM.goalLook)<1e-8);assert.equal(WALK.f1,CAM.fovBase);
  const camera=new THREE.PerspectiveCamera(CAM.fovBase,w/h,.05,40);camera.position.copy(CAM.goalPos);camera.lookAt(CAM.goalLook);camera.updateMatrixWorld();
  // Letter ink bounds on the physical panel, not its decorative wooden frame.
  for(const x of [-.33,.33])for(const y of [-.211,.211]){
   const q=p.root.localToWorld(V3(x*p.SIZE.width,y,.081)).project(camera),px=(q.x+1)*w/2,py=(1-q.y)*h/2;
   assert(px>8&&px<w-8,'lettering stays inside the viewport');assert(py>52&&py<h*.4,`lettering meets HUD clearance at ${w}x${h}: ${py}`);
  }
  assert.equal(root.children.length,1);assert.equal(p.root.parent,root,'the plaque belongs to the hall, not the replaceable character');
 }
});
