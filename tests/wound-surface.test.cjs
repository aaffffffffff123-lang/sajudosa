const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight.js'),'utf8');
const cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){this.parent?.remove(this);return this};
function decalsRig(){
 const bone=new THREE.Group(),skin=new THREE.Mesh(new THREE.SphereGeometry(.2,32,24),new THREE.MeshBasicMaterial());bone.add(skin);skin.userData.seg='head';bone.updateMatrixWorld(true);
 const E={bones:{head:bone},flow:{head:[skin]}},ctx={THREE,V3,E,PREF:{blood:true},PI:Math.PI,TAU:2*Math.PI,rnd:(a,b)=>(a+b)/2,
 _inv:b=>b.matrixWorld.clone().invert(),DM:new Proxy({},{get:()=>new THREE.MeshBasicMaterial()}),DORDER:{},DLIFT:{},
 project(p,n,reach,meshes){const hits=new THREE.Raycaster(p.clone().addScaledVector(n,reach),n.clone().negate(),0,reach*2.4).intersectObjects(meshes||[skin]);return hits.length?{point:hits[0].point,normal:hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld),obj:hits[0].object,seg:hits[0].object.userData.seg}:null}};
 Object.assign(ctx,{rims:[],lumps:[],wounds:[],rivs:[],drips:[],beads:[],bankList:[],banks:{}});
 const api=vm.runInNewContext(cut('const SLICE=','/* ===== 2-3. 조각칼')+cut(' const decals=[],_dd=',' /* ---- 벌어진 상처의 입체 테두리 ---- */')+cut(' function clearPlane(seg,',' // 이 부위에 흘러내린')+cut(' const _ov=V3(),',' return {spray,emit,startRiv')+';({decal,decals,clearPlane,deformOverlays})',ctx);
 return {...api,bone,skin,ctx};
}
test('a slash outside the body creates no floating decal',()=>{const h=decalsRig();assert(h.decal('cut','head',V3(.6,0,.2),V3(0,0,1),.04,{aspect:3,angle:0})===null);assert.equal(h.decals.length,0)});
test('a slash crossing the silhouette keeps only vertices on the same skin surface',()=>{
 const h=decalsRig(),m=h.decal('cut','head',V3(.16,0,.17),V3(0,0,1),.03,{aspect:4,angle:0,grid:12,rows:4});assert(m);
 for(const i of m.geometry.index.array){const p=V3().fromBufferAttribute(m.geometry.attributes.position,i);assert(p.length()<.203,'no projected guess in empty space: '+p.toArray());assert(p.z>0);}
});
test('another moving body part is not borrowed as support for a head wound',()=>{
 const h=decalsRig(),arm=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());arm.position.z=.2;arm.userData.seg='shoulderL';arm.updateMatrixWorld(true);
 h.ctx.E.flow.head=[];h.ctx.project=(p,n,reach,meshes)=>meshes?.length?{point:p,normal:n,seg:'shoulderL',obj:arm}:null;
 assert(h.decal('cut','head',V3(),V3(0,0,1),.03,{meshes:[arm]})===null);
});
test('a later skull cut trims a crossing scar even when its centre stays on the head',()=>{
 const h=decalsRig(),m=h.decal('cut','head',V3(-.02,0,.2),V3(0,0,1),.03,{aspect:4,angle:0,grid:12});assert(m);
 h.clearPlane('head',V3(1,0,0),0);assert(h.decals.includes(m));
 let min=Infinity,max=-Infinity;for(const i of m.geometry.index.array){const x=m.geometry.attributes.position.getX(i);min=Math.min(min,x);max=Math.max(max,x);}
 assert(min<-.06);assert(max<1e-6,'no scar remains above the removed side');
});
test('a dent moves only the affected end of a long scar',()=>{
 const h=decalsRig(),scar=h.decal('cut','head',V3(0,0,.2),V3(0,0,1),.04,{aspect:3,angle:0,grid:12});assert(scar);
 const P=scar.geometry.attributes.position,before=Array.from(P.array);h.deformOverlays(h.bone,v=>{if(v.x<=0)return false;v.z-=.01;return true;});
 let moved=0,fixed=0;for(const i of new Set(scar.geometry.index.array)){const dz=P.getZ(i)-before[i*3+2];if(before[i*3]>0){assert(Math.abs(dz+.01)<1e-7);moved++;}else{assert.equal(dz,0);fixed++;}}
 assert(moved&&fixed);
});
test('unrelated scars skip all vertex queries during a local hit',()=>{
 const h=decalsRig(),m=h.decal('cut','head',V3(0,0,.2),V3(0,0,1),.03,{aspect:3,angle:0});assert(m);const before=m.geometry.attributes.position.array.slice();let queries=0;
 h.deformOverlays(h.bone,v=>{queries++;v.z-=.01;return true;},new THREE.Box3(V3(1,1,1),V3(2,2,2)));
 assert.equal(queries,0);assert.deepEqual(m.geometry.attributes.position.array,before);
 const original=m.geometry;h.clearPlane('head',V3(1,0,0),.4);assert.equal(m.geometry,original,'an unchanged decal is not rebuilt on a distant head cut');
});
function brainRig(){
 const scene=new THREE.Scene(),ctx={THREE,V3,scene,PI:Math.PI,TAU:Math.PI*2,clamp,lerp:(a,b,t)=>a+(b-a)*t,col:c=>new THREE.Color(c),PREF:{blood:true},isFleshMat:()=>false,ensureDmg(){},_dfv2:V3(),_dfv3:V3()};
 const api=vm.runInNewContext(cut('function mk(geo,','/* 여러 메시')+cut('const SLICE=','/* ===== 2-3. 조각칼')+';({SLICE,methods:({'+cut(' clipBrainCap(nW,pW,piece){',' blowTop(pt,n,dir){')+cut(' _follow(f){','\n});\n/* ===== 6-4-3.')+'})})',ctx);
 const F=new THREE.Group(),skull=new THREE.Mesh(new THREE.SphereGeometry(1,48,32).scale(.22,.28,.12),new THREE.MeshBasicMaterial());F.add(skull);
 const n=V3(0,1,.25).normalize(),p=V3(0,.13,.16),res=api.SLICE.slice(skull.geometry,n,n.dot(p));skull.geometry=res.keep;
 skull.userData.flesh={mesh:skull,g:res.keep,pos:res.keep.attributes.position.array,n:res.keep.attributes.position.count,paint(){},cutSurface:{n,contours:res.contours}};
 const E={skull,headKind:'human',M:{brain:new THREE.MeshStandardMaterial(),socket:new THREE.MeshStandardMaterial()},disposables:[],goreMeshes:[],bones:{},segOf:()=>null,releaseGeometry:g=>g.dispose()};
 scene.add(F);Object.assign(E,api.methods);E.capBrain(F,n,p);F.updateMatrixWorld(true);return {E,F,skull,n,p,api,scene};
}
test('the exposed brain and dark border fit inside the actual oval skull cut',()=>{
 const {E,skull,n,p}=brainRig();assert(E.brainCap);
 const gap=E.brainCap.children[1];assert(gap);
 for(let i=0;i<gap.geometry.attributes.position.count;i++){
  const v=V3().fromBufferAttribute(gap.geometry.attributes.position,i);gap.localToWorld(v);skull.worldToLocal(v);
  assert((v.x/.22)**2+(v.y/.28)**2+(v.z/.12)**2<1.02,'dark border projects outside skull: '+v.toArray());
  assert(Math.abs(n.dot(v)-n.dot(p))<.003,'border sits on the same cut plane');
 }
 for(let i=0;i<gap.geometry.attributes.normal.count;i++)assert(gap.geometry.attributes.normal.getY(i)>.9,'rim faces out of the cut');
});
test('exposed brain follows a rotated skull and subsequent local dents',()=>{
 const {E,F,skull}=brainRig();assert(E.brainCap.parent===skull);F.position.set(2,1,-3);F.rotation.set(.3,.6,-.2);F.updateMatrixWorld(true);
 const meshes=E.brainCap.children,points=meshes.map(m=>{const v=V3().fromBufferAttribute(m.geometry.attributes.position,0);return skull.worldToLocal(m.localToWorld(v));});
 E._follow({mesh:skull,last:{vs:[0,1],p:[-1,-1,-1,1,1,1]},deltaAt(x,y,z,out){out.set(.01,0,0)}});
 meshes.forEach((m,i)=>{const v=skull.worldToLocal(m.localToWorld(V3().fromBufferAttribute(m.geometry.attributes.position,0)));assert(v.distanceTo(points[i].clone().add(V3(.01,0,0)))<1e-7);});
});
test('a hit below the exposed brain does not query or rebuild its vertices',()=>{
 const {E,skull}=brainRig();let queries=0;const before=E.brainCap.children.map(m=>m.geometry.attributes.position.version);
 E._follow({mesh:skull,last:{vs:[0,1],p:[-.02,-.2,-.02,.02,-.16,.02]},deltaAt(x,y,z,out){queries++;out.set(.01,0,0)}});
 assert.equal(queries,0);E.brainCap.children.forEach((m,i)=>assert.equal(m.geometry.attributes.position.version,before[i]));
});
test('a later side cut splits both the exposed brain and its border on the skull plane',()=>{
 const {E,scene,F}=brainRig();F.position.set(1,.7,-2);F.rotation.set(.2,.4,-.3);F.updateMatrixWorld(true);
 const normal=V3(1,0,0).transformDirection(F.matrixWorld),point=F.localToWorld(V3()),piece=new THREE.Group();scene.add(piece);piece.position.copy(point);
 E.clipBrainCap(normal,point,piece);assert.equal(piece.children.length,2);
 for(const [root,sign] of [[E.brainCap,-1],[piece,1]])root.traverse(m=>{if(!m.isMesh)return;m.updateWorldMatrix(true,false);for(const i of m.geometry.index.array){const p=m.localToWorld(V3().fromBufferAttribute(m.geometry.attributes.position,i));assert(sign*normal.dot(p.sub(point))>=-2e-6,'brain and border respect the same cut plane');}});
});
function strokeRig(){
 const root=new THREE.Group(),obj=new THREE.Mesh(new THREE.SphereGeometry(.2),new THREE.MeshBasicMaterial());root.add(obj);obj.userData.seg='head';
 const hits=[],ctx={THREE,V3,UP:V3(0,1,0),G:{time:0,tool:'knife'},pickAt:()=>ctx.next,resolveHit:(tool,kind,info,side,extra)=>hits.push({to:info.point.clone(),from:extra.slashFrom.clone()})};
 const api=vm.runInNewContext(cut('function limbKey(part){','/* ---- 입력 ---- */')+';({slashSample,finishBody})',ctx);
 return {...api,obj,ctx,hits,hit(x){obj.updateWorldMatrix(true,false);ctx.next={obj,part:'head',point:obj.localToWorld(V3(x,0,.2)),normal:V3(0,0,1).transformDirection(obj.matrixWorld)};}};
}
test('knife samples remain attached to the face while it recoils between hits',()=>{
 const h=strokeRig(),p={};h.hit(-.06);h.slashSample(p,0,0);h.obj.position.x=.5;h.obj.rotation.y=.4;h.ctx.G.time=.2;h.hit(.06);h.slashSample(p,1,0);
 assert.equal(h.hits.length,1);assert(Math.abs(h.hits[0].to.distanceTo(h.hits[0].from)-.12)<1e-7);
 assert(h.hits[0].from.distanceTo(h.obj.localToWorld(V3(-.06,0,.2)))<1e-7);
});
test('a short stroke flushed on leaving the face follows its current pose',()=>{
 const h=strokeRig(),p={};h.hit(-.02);h.slashSample(p,0,0);h.hit(.02);h.ctx.G.time=.02;h.slashSample(p,1,0);
 h.obj.position.x=.8;h.obj.rotation.y=.5;h.ctx.next=null;h.slashSample(p,2,0);
 assert.equal(h.hits.length,1);assert(Math.abs(h.hits[0].to.distanceTo(h.hits[0].from)-.04)<1e-7);assert(h.hits[0].from.x>.8);
});
