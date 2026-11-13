const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8'),cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),sat=x=>clamp(x,0,1),scene=new THREE.Scene(),silent=new Proxy({},{get:()=>()=>{}});
const ctx={THREE,V3,scene,PI:Math.PI,TAU:Math.PI*2,clamp,sat,lerp:(a,b,t)=>a+(b-a)*t,smooth:x=>{x=sat(x);return x*x*(3-2*x)},rnd:(a,b)=>(a+b)/2,col:c=>new THREE.Color(c),
 PREF:{blood:true},isFleshMat:()=>false,ensureDmg(){},_hdm1:new THREE.Matrix4(),BLOOD:silent,CHUNKS:silent,AUDIO:silent,FX:silent};
const api=vm.runInNewContext(cut('function mk(geo,','/* 여러 메시')+cut('const SLICE=','/* ===== 3. 소리')+cut('const HEADGEO=','const BELLY_C=')+
 ';({HEADGEO,methods:{'+cut(' _planeCut(f,',' // 머리에 붙어 있던 메시')+cut(' capBrain(F,nL,pL){',' blowSide(side,')+'}})',ctx),heads=api.HEADGEO.build();
function openHead(kind,hitY,blood=true){
 ctx.PREF.blood=blood;const face=new THREE.Group();scene.add(face);face.rotation.x=.4;
 const skull=new THREE.Mesh(heads[kind==='human'?'head':'rep'].clone(),new THREE.MeshStandardMaterial());face.add(skull);
 const f={mesh:skull,bake(){},paint(){},setGeometry(g){this.g=g;this.pos=g.attributes.position.array;this.n=g.attributes.position.count}};f.setGeometry(skull.geometry);skull.userData.flesh=f;
 const E={...api.methods,skull,repSkull:skull,headKind:kind,headLost:{},crownOn:false,headFrame:()=>face,disposables:[],goreMeshes:[],rootVel:V3(),sp:{head:{kick(){}}},dizzy:0,
 M:{brain:new THREE.MeshStandardMaterial(),socket:new THREE.MeshStandardMaterial({side:THREE.DoubleSide})},releaseGeometry:g=>g.dispose(),screenSplat(){},setEmotion(){},chunkKind:()=> 'flesh',
 sliceHead(n,p){face.updateWorldMatrix(true,true);const worldN=n.clone().transformDirection(face.matrixWorld),worldP=face.localToWorld(p.clone());
  const res=this._planeCut(f,worldN,worldP);return res.piece||new THREE.Group();}};
 face.updateMatrixWorld(true);assert(E.blowTop(face.localToWorld(V3(0,hitY,kind==='human'?.2:.12)),V3(0,0,1),V3(0,0,-1)));face.updateMatrixWorld(true);
 return {E,face,skull,f};
}
test('high human forehead hits open the real skull and expose a broad brain, like the reptilian head',()=>{
 for(const kind of ['human','rep'])for(const hitY of [.12,.17,.23,.3]){
  const {E,skull}=openHead(kind,hitY);assert(E.brainCap,kind+' hit at '+hitY+' must cut the skull, not just its hair');
  const [brain,gap]=E.brainCap.children,brainSize=new THREE.Box3().setFromObject(brain).getSize(V3()),rimSize=new THREE.Box3().setFromObject(gap).getSize(V3());
  assert(brainSize.x>(kind==='human'?.17:.15),kind+' brain remains clearly exposed: '+brainSize.x);assert(brainSize.x/rimSize.x>(kind==='human'?.77:.70),'brain fills the opening');
  const normal=V3(0,1,0).transformDirection(E.brainCap.matrixWorld),center=E.brainCap.getWorldPosition(V3());
  for(const x of [-.045,0,.045]){
   const target=center.clone().add(V3(x,0,0)),hit=new THREE.Raycaster(target.clone().addScaledVector(normal,.4),normal.clone().negate(),0,.6).intersectObjects([skull,brain,gap])[0];
   assert(hit?.object===brain,'the closed skin cap cannot hide the exposed brain');
  }
 }
});
test('blood-off mode keeps the human cut sealed and hides the exposed organ',()=>{
 const {E,skull}=openHead('human',.23,false);assert(E.brainCap);assert(E.brainCap.children.every(m=>!m.visible));
 const n=V3(0,1,0).transformDirection(E.brainCap.matrixWorld),c=E.brainCap.getWorldPosition(V3());
 assert(new THREE.Raycaster(c.clone().addScaledVector(n,.4),n.clone().negate(),0,.6).intersectObject(skull).length);
});
