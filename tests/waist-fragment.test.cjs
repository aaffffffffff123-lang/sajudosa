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
 section(free,' const WAIST_CUTS=',' /* ---- 「새 놈」')+';({BODYGEO,foldWaistCloth,bisect,methods:{'+section(fight,' _body(){',' /* 와이셔츠 깃')+','+section(fight,' _planeCut(f,',' sliceHead(nL,')+section(fight,' applyPose(p){',' setCurl(a,c){')+'}})',ctx);
 const mat=new THREE.MeshStandardMaterial({side:THREE.DoubleSide}),root=new THREE.Group();scene.add(root);root.rotation.set(...pose);root.position.set(.4,.1,-.3);
 const E={...api.methods,root,bones:{},parts:[],flow:{},fleshList:[],disposables:[],legs:[],arms:[],detached:new Set(),headDestroyed:true,phase:3,M:new Proxy({},{get:()=>mat}),
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
   mesh.updateWorldMatrix(true,false);
   for(const x of [-.22,0,.22])for(const z of [-.08,.08,.20]){
    const target=spine.localToWorld(V3(x,.09,z)),origin=target.clone().addScaledVector(up,side*.025),dir=up.clone().multiplyScalar(-side);
    const hit=new THREE.Raycaster(origin,dir,0,.06).intersectObject(mesh)[0];assert(hit,'sealed waist at '+x+','+z);
    assert(Math.abs(up.dot(hit.point.clone().sub(plane)))<2e-5,'cap lies on the actual severing plane');
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
