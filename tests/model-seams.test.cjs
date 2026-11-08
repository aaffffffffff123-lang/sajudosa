const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const section=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){this.parent?.remove(this);return this};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sat=v=>clamp(v,0,1),lerp=(a,b,t)=>a+(b-a)*t;
const ctx={THREE,V3,PI:Math.PI,TAU:2*Math.PI,lerp,clamp,sat,smooth:x=>{x=sat(x);return x*x*(3-2*x)},smoother:x=>{x=sat(x);return x*x*x*(x*(x*6-15)+10)},PREF:{blood:true},isFleshMat:()=>false,ensureDmg:()=>{},FLESH:{clone:g=>g.clone()},rnd:(a,b)=>(a+b)/2};
const api=vm.runInNewContext(section('function mk(geo,','/* 여러 메시')+section('const _mgM=','/* 빠른 짧은 광선 검사')+section('const SLICE=','/* ===== 3. 소리')+section('const BELLY_C=','/* 신발(흑화)')+section('const CUT_DETAIL=','/* 바지:')+section('const CUT_CANDS=','const REGROW=')+section('const ARM_CHAIN=','Object.assign(Emperor.prototype,')+section('function closeTrophyEye(','function trophyPortrait(')+';({BODYGEO,LIZ_DIM,closeTrophyEye,methods:{'+section('replaceLimbCap(joint,','limbCorners(root){')+section('openCutCap(r){','onRegrown(r){')+section('\nlizSeg(name,',' /* ===== 파충류 눈:')+section(' _hand(wr,',' _legs(){')+','+section(' setCurl(a,',' /* ---- 팔 IK:')+'}})',ctx);
const BG=api.BODYGEO.build();
function rig(){return {root:new THREE.Group(),goreMeshes:[],disposables:[],M:new Proxy({}, {get(t,k){return t[k]||(t[k]=new THREE.MeshStandardMaterial({color:k==='mouth'?0x080606:0x748655}));}}),releaseGeometry(){},releaseLoose(){},addFlesh(g,m,p,o){const mesh=new THREE.Mesh(g,m);p.add(mesh);return mesh},...api.methods};}
const cuts=[['uarmMid','shoulder',-.118,.1,.05],['farmMid','elbow',-.108,.1,.043],['wrist','farm',-.107,.04,.034],['thighMid','hip',-.145,.121,.078],['shinMid','knee',-.128,.092,.058],['ankle','shin',-.127,.086,.055]];
function visibleMeshes(root){const meshes=[];root.traverse(o=>{if(!o.isMesh)return;for(let n=o;n;n=n.parent)if(!n.visible)return;meshes.push(o)});return meshes;}
test('all six cut joints stay sealed through regrowth, both sides, blood off/on and rotated falls',()=>{
 let rays=0;
 for(const [base,shape,y,r,inner] of cuts)for(const side of ['L','R'])for(const blood of [false,true])for(const pose of [[0,0,0],[1.4,.8,-.6]]){
  ctx.PREF.blood=blood;const E=rig(),parent=new THREE.Group();E.root.add(parent);E.root.rotation.set(...pose);
  const shell=new THREE.Mesh(BG[shape].clone(),E.M.robe);parent.add(shell);
  const pos=V3(0,y,0),cap=E.makeCutCap(parent,pos,new THREE.Quaternion(),r,false,E.M.robe,false,0,base!=='wrist');
  const newBone=new THREE.Group();newBone.position.copy(pos);parent.add(newBone);E.lizSeg(base,newBone,side==='L'?-1:1,side);
  E.openCutCap({cap,base});E.root.updateMatrixWorld(true);const meshes=visibleMeshes(E.root);
  // Radial rays across the old gap: they must hit the sleeve, collar or skin.
  // Wrist is an intentionally open sleeve, so check its skin-to-hand connection.
  for(const dy of [-r*.22,-r*.12,-r*.04,r*.01])for(let i=0;i<24;i++){
   if(base==='wrist'&&dy<0)continue;
   const a=(i+.37)*Math.PI*2/24,p=V3(Math.cos(a)*.3,y-dy,Math.sin(a)*.3),n=V3(-Math.cos(a),0,-Math.sin(a));
   const origin=parent.localToWorld(p),direction=n.transformDirection(parent.matrixWorld),hits=new THREE.Raycaster(origin,direction,0,.6).intersectObjects(meshes);
   assert(hits.length,`${base}${side} blood=${blood} pose=${pose} open band at ${dy}, angle=${i}`);rays++;
  }
  assert(cap.children.some(o=>o.userData.cutRim),'original cut lip survives regrowth');
  const count=cap.children.length;E.openCutCap({cap,base});assert.equal(cap.children.length,count,'opening the same cut twice adds no geometry');
 }
 console.log('Sealed cut-joint rays:',rays);
});
test('closed trophy lids cover the whole eye opening; only a fine seam is dark',()=>{
 const E=rig(),owned=new Set();
 for(const s of [-1,1]){
  const socket=new THREE.Group();E.root.add(socket);socket.position.x=s*.074;
  const cavity=new THREE.Mesh(new THREE.SphereGeometry(.035),E.M.mouth);socket.add(cavity);
  const eye={socket,eg:new THREE.Group(),mem:new THREE.Group()};const lid=api.closeTrophyEye(eye,E.M,owned);E.root.updateMatrixWorld(true);
  for(const x of [-.025,-.012,0,.012,.025])for(const y of [-.016,-.009,.006,.014,.02]){
   if((x/.035)**2+(y/.022)**2>.9)continue;
   const hits=new THREE.Raycaster(V3(s*.074+x,y,1),V3(0,0,-1)).intersectObjects(visibleMeshes(socket));
   assert(hits.length&&hits[0].object===lid,`skin must cover socket at ${x},${y}`);
  }
  assert.equal(cavity.visible,false);assert.equal(eye.eg.visible,false);assert.equal(eye.mem.visible,false);
 }
});
test('money grip exposes four separate curled fingers on the palm side',()=>{
 const E=rig(),wr=new THREE.Group();E.root.add(wr);const hand=E._hand(wr,1,'handR'),a={wr,hand,s:1,nm:'R'};E.tabletHeld=true;E.setCurl(a,.8);E.root.updateMatrixWorld(true);
 const meshes=visibleMeshes(E.root);
 for(const F of hand.fingers){
  const fingertip=F.f2.localToWorld(V3(0,-.02,0));
  const hits=new THREE.Raycaster(fingertip.clone().add(V3(-.3,0,0)),V3(1,0,0)).intersectObjects(meshes);
  assert(hits.length&&F.f.getObjectById(hits[0].object.id),'each curled finger is visible ahead of the palm');
  assert(fingertip.x<-.033,'fingertips wrap in front of the note stack');
 }
 E.tabletHeld=false;E.setCurl(a,0);assert(hand.fingers.every(f=>f.f.rotation.z===0&&f.f2.rotation.z===0),'released hand returns to ordinary pose');
});

test('repeated cuts preserve the original clothing radius, material and cut position',()=>{
 for(const [base,shape,y,r,inner] of cuts)for(const side of ['L','R']){
  const E=rig(),parent=new THREE.Group();E.root.add(parent);parent.add(new THREE.Mesh(BG[shape].clone(),E.M.robe));
  let cap=E.replaceLimbCap(base+side,parent,V3(0,y,0),new THREE.Quaternion(),r,E.M.robe,false,.003,base!=='wrist');
  const pos=cap.position.clone();E.openCutCap({cap,base});
  for(let repeat=0;repeat<4;repeat++){
   const old=cap;cap=E.replaceLimbCap(base+side,parent,V3(0,y,0),new THREE.Quaternion(),inner,E.M.liz,true,0,base!=='wrist');
   assert.equal(cap.userData.cap.r,r);assert.equal(cap.userData.cap.outer,E.M.robe);assert(cap.position.equals(pos));assert.equal(old.parent,null);
   E.openCutCap({cap,base});assert(cap.children.some(o=>o.userData.cutRim));
  }
 }
});
test('both rings lie around their fingers instead of standing across them',()=>{
 for(const s of [-1,1]){
  const E=rig(),wr=new THREE.Group();E.root.add(wr);const hand=E._hand(wr,s,s<0?'handL':'handR');E.root.updateMatrixWorld(true);
  let rings=0;
  for(const i of [2,3]){
   const finger=hand.fingers[i].f;
   for(const m of finger.children){
    if(!(m.geometry instanceof THREE.TorusGeometry))continue;rings++;
    // 고리 구멍의 축(토러스 z축)이 손가락이 뻗는 축(손가락 y축)과 나란해야 손가락을 감싼다
    const axis=V3(0,0,1).applyQuaternion(m.quaternion);
    assert(Math.abs(axis.dot(V3(0,1,0)))>.99,'ring hole axis follows the finger: '+axis.toArray());
    // 손가락 굵기(.0118)보다 고리가 조금 커서 살에 반쯤 묻힌 띠로 보인다
    const r=m.geometry.parameters.radius,t=m.geometry.parameters.tube;assert(r>.0105&&r-t<.0105);
   }
  }
  assert.equal(rings,2);
 }
});
