const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),path=require('node:path'),fight=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8'),free=fs.readFileSync(path.join(__dirname,'../fight-free.js'),'utf8');
const section=(src,a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sat=v=>clamp(v,0,1),smooth=v=>{v=sat(v);return v*v*(3-2*v)};
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){this.parent?.remove(this);return this};
function rig(pose=[0,0,0]){
 const scene=new THREE.Scene(),ctx={THREE,V3,scene,PI:Math.PI,TAU:Math.PI*2,clamp,sat,smooth,lerp:(a,b,t)=>a+(b-a)*t,smoother:smooth,rnd:(a,b)=>(a+b)/2,
 isFleshMat:()=>false,ensureDmg(){},FLESH:{clone:g=>g.clone()},_hdm1:new THREE.Matrix4(),G:{hitstop:0,slow:0},S:{slides:[]},PREF:{blood:true},
 AUDIO:new Proxy({},{get:()=>()=>{}}),BLOOD:new Proxy({},{get:()=>()=>{}}),CHUNKS:{burst(){}},camHit(){},flash(){},hint(){},deityHasReptileVoice:()=>false};
 const api=vm.runInNewContext(section(fight,'function mk(geo,','/* 여러 메시')+section(fight,'const SLICE=','/* ===== 3. 소리')+section(fight,'const BELLY_C=','/* 신발(흑화)')+
 section(free,' function waistTissueSample(',' // Saved meshes have lost')+section(free,' const WAIST_CUTS=',' /* ---- 「새 놈」')+';({BODYGEO,foldWaistCloth,bisect,methods:{'+section(fight,' _body(){',' /* 와이셔츠 깃')+','+section(fight,' _planeCut(f,',' sliceHead(nL,')+section(fight,' applyPose(p){',' setCurl(a,c){')+'}})',ctx);
 const mat=new THREE.MeshStandardMaterial({side:THREE.DoubleSide}),root=new THREE.Group();scene.add(root);root.rotation.set(...pose);root.position.set(.4,.1,-.3);
 const E={...api.methods,root,bones:{},parts:[],flow:{},fleshList:[],goreMeshes:[],disposables:[],legs:[],arms:[],detached:new Set(),headDestroyed:true,phase:3,M:new Proxy({},{get:(o,k)=>k==='waistCut'?o[k]:mat}),
 rootPos:V3(),sp:new Proxy({},{get:()=>({x:0,X:0,Y:0,Z:0})}),
 bone(name,parent,p){const g=new THREE.Group();g.position.fromArray(p);g.userData.bone=name;parent.add(g);this.bones[name]=g;return g;},
 addFlesh(g,m,parent,o){const mesh=new THREE.Mesh(g,m);mesh.userData.part=o.part;parent.add(mesh);const f={mesh,bake(){},disposeWork(){},setGeometry(geo){this.g=geo;this.pos=geo.attributes.position.array;this.n=geo.attributes.position.count}};f.setGeometry(g);mesh.userData.flesh=f;this.fleshList.push(f);return mesh;},
 _tie(){},releaseGeometry:g=>g.dispose(),limbCorners:()=>[],makeCutCap(){this.genericCaps=(this.genericCaps||0)+1;}};
 E._body();const BG=api.BODYGEO.build();E.bones.pelvis.add(new THREE.Mesh(BG.seat,mat));
 for(const [nm,sign] of [['L',-1],['R',1]]){
  const hip=E.bone('hip'+nm,E.bones.pelvis,[sign*.15,-.02,0]);hip.add(new THREE.Mesh(BG.hip,mat));
  const knee=E.bone('knee'+nm,hip,[0,-.28,0]);knee.add(new THREE.Mesh(BG.knee,mat));
  const ank=E.bone('ank'+nm,knee,[0,-.25,0]);ank.add(new THREE.Mesh(new THREE.BoxGeometry(.1,.08,.2),mat));E.legs.push({nm,s:sign,hip,knee,ank});
 }
 root.updateMatrixWorld(true);return {E,api,scene,ctx};
}
test('severed waist uses the original closed belly surface and keeps both legs',()=>{
 for(const pose of [[0,0,0],[.45,.3,-.2]]){
  const {E,api}=rig(pose),spine=E.bones.spine,plane=spine.localToWorld(V3(0,.09,0)),up=V3(0,1,0).transformDirection(spine.matrixWorld);
  assert(api.bisect(E));assert.equal(E.genericCaps||0,0,'no enlarged round limb cap over the waist');
  const lower=E.bits[0].obj,lowerBelly=lower.children.find(o=>o.isMesh&&o.geometry.attributes.aDmg);assert(lowerBelly);
  for(const leg of E.legs){assert(leg.hip.parent===lower);assert(leg.knee.parent===leg.hip);assert(leg.ank.parent===leg.knee);}
  for(const [mesh,side] of [[E.belly,-1],[lowerBelly,1]]){
   mesh.updateWorldMatrix(true,true);
   for(const x of [-.22,0,.22])for(const z of [-.08,.08,.20]){
    const target=spine.localToWorld(V3(x,.09,z)),origin=target.clone().addScaledVector(up,side*.025),dir=up.clone().multiplyScalar(-side);
    const hit=new THREE.Raycaster(origin,dir,0,.06).intersectObject(mesh.getObjectByName('waist-cut-surface'),false)[0];assert(hit,'sealed waist at '+x+','+z);
    const depth=-side*up.dot(hit.point.clone().sub(plane));assert(depth>=-2e-5&&depth<.027,'tissue stays just inside the actual cut');
   }
  }
 }
});
test('detached coat tails fold toward the legs while preserving their upper edge and materials',()=>{
 const {E,api}=rig(),outside=E.apronB.children[0],lining=E.apronB.children[1],old=outside.geometry,material=outside.material,top=[];
 for(let i=0;i<old.attributes.position.count;i++)if(Math.abs(old.attributes.position.getY(i)-.18)<1e-6)top.push(V3().fromBufferAttribute(old.attributes.position,i));
 api.bisect(E);const g=outside.geometry,P=g.attributes.position;assert.notEqual(g,old);assert.equal(lining.geometry,g);assert.equal(outside.material,material);
 for(const p of top){let nearest=Infinity;for(let i=0;i<P.count;i++)nearest=Math.min(nearest,p.distanceTo(V3().fromBufferAttribute(P,i)));assert(nearest<1e-6,'upper cloth seam remains attached');}
 let rear=0,foldMin=Infinity,foldMax=-Infinity;for(let i=0;i<P.count;i++)if(g.attributes.uv.getY(i)<1e-6){rear=Math.max(rear,Math.abs(P.getZ(i)));foldMin=Math.min(foldMin,P.getY(i));foldMax=Math.max(foldMax,P.getY(i));}
 assert(rear<.15,'hem no longer forms a rigid flared cylinder');assert(foldMax-foldMin>.03,'lower hem has cloth folds');
 api.foldWaistCloth(E);assert.equal(outside.geometry,g,'fold once without accumulating geometry');
});
test('the living upper body cannot animate detached coat tails after the waist cut',()=>{
 const {E,api}=rig(),p=new Proxy({LhF:1,RhF:1},{get:(o,k)=>o[k]||0});E.applyPose(p);const before=E.apronB.rotation.x;assert(before>.1);
 api.bisect(E);const apron=E.apronB,rotation=apron.rotation.clone();
 for(const flex of [-1,0,.8,1.3]){p.LhF=flex;p.RhF=flex;E.applyPose(p);assert(apron.rotation.equals(rotation));}
});
test('waist caps use matte tissue colors with no clothing UV and survive snapshot baking',()=>{
 const {E,api}=rig();api.bisect(E);
 const lower=E.bits[0].obj,lowerBelly=lower.children.find(o=>o.isMesh&&o.geometry.attributes.aDmg);
 for(const mesh of [E.belly,lowerBelly]){
  const cap=mesh.getObjectByName('waist-cut-surface');assert(cap);assert(cap.material.vertexColors);assert(cap.material.roughness>=.75);assert.equal(cap.material.metalness,0);
  assert(!cap.geometry.attributes.uv,'robe texture cannot be stretched across the cut');assert.equal(cap.material.map,null);
  assert.equal(cap.parent,mesh,'each cap follows its own half');
  const c=cap.geometry.attributes.color;let bone=0,meat=0;for(let i=0;i<c.count;i++){if(c.getX(i)>.3&&c.getY(i)>.25)bone++;if(c.getZ(i)>c.getX(i)*1.25&&c.getZ(i)>.05)meat++;}assert(bone>5&&meat>30,'bone, connective tissue and muscle remain distinct');
  const p=cap.geometry.attributes.position;assert(p.count<5000,'bounded cap geometry for repeated cuts');assert(E.goreMeshes.includes(cap));assert.equal(mesh.getObjectByName('waist-cut-safe').visible,false);let lo=Infinity,hi=-Infinity;for(let i=0;i<p.count;i++){lo=Math.min(lo,p.getY(i));hi=Math.max(hi,p.getY(i));}assert(hi-lo>.012,'physical relief, not a flat lid');
 }
 const bake=vm.runInNewContext(section(free,' const LIN=',' function snapMesh(')+';({newJob,jobMesh,jobFinish})',{THREE,V3,PI:Math.PI,TAU:Math.PI*2,_m:new THREE.Matrix4(),clamp,performance:{now:()=>0}});
 const cap=lowerBelly.getObjectByName('waist-cut-surface'),job=bake.newJob(cap,cap,.002,()=>{});
 for(const mesh of job.meshes)bake.jobMesh(job,mesh);const sn=bake.jobFinish(job,Infinity);assert(sn.i.length>100);assert.equal(sn.waistSurface,2);
 assert(sn.c.some(x=>x>80),'saved bone/fascia contrast survives baking');assert(sn.c.some(x=>x<15),'saved recesses remain dark');
});
test('legacy baked waist fans gain tissue relief while preserving the body and small props',()=>{
 const repair=vm.runInNewContext(section(free,' function waistTissueSample(',' // Legacy geometry filtering')+';repairStoredWaist',{THREE,V3});
 const bake=vm.runInNewContext(section(free,' const LIN=',' function snapMesh(')+';({newJob,jobMesh,jobFinish})',{THREE,V3,PI:Math.PI,TAU:Math.PI*2,_m:new THREE.Matrix4(),clamp,performance:{now:()=>0}});
 for(const pose of [[0,0,0],[.7,.4,-.2],[-1.1,.3,.9]]){
  const {E}=rig(pose),spine=E.bones.spine,p=spine.localToWorld(V3(0,.09,0)),normal=V3(0,-1,0).transformDirection(spine.matrixWorld),result=E._planeCut(E.belly.userData.flesh,normal,p);
  result.piece.material=new THREE.MeshStandardMaterial({color:0x98701e});
  const job=bake.newJob(result.piece,new THREE.Group(),.018,()=>{});for(const m of job.meshes)bake.jobMesh(job,m);const sn=bake.jobFinish(job,Infinity);delete sn.waistSurface;
  const saved=sn.c.slice(),after=repair(sn);assert.deepEqual(Array.from(after.p.slice(0,sn.p.length)),Array.from(sn.p),'original body vertices are retained');assert.deepEqual(sn.c,saved,'source colors are not overwritten');assert(after.p.length>sn.p.length,'old flat cap gains tissue relief');
  assert.notDeepEqual(after.c,sn.c,'the large radial waist cap is repaired');assert.equal(repair(after),after,'migration runs once');
 }
 const root=new THREE.Group();root.add(new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.21)),new THREE.Mesh(new THREE.SphereGeometry(.2,24,16)),new THREE.Mesh(new THREE.CircleGeometry(.15,32)));
 const job=bake.newJob(root,root,.01,()=>{});for(const m of job.meshes)bake.jobMesh(job,m);const sn=bake.jobFinish(job,Infinity);delete sn.waistSurface;assert.equal(repair(sn).c,sn.c,'shoes, heads and crown plates keep their colors');
});
