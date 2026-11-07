const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const THREE=require('../three.min.js'),source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)};
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){if(this.parent)this.parent.remove(this);return this;};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),sat=x=>Math.max(0,Math.min(1,x));
const ctx={THREE,V3,PI:Math.PI,TAU:Math.PI*2,lerp:(a,b,t)=>a+(b-a)*t,sat,clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),smooth:x=>{x=sat(x);return x*x*(3-2*x)},smoother:x=>{x=sat(x);return x*x*x*(x*(x*6-15)+10)},rnd:(a,b)=>(a+b)/2,isFleshMat:()=>false,ensureDmg:()=>{},PREF:{blood:true},FASTRAY:{grid:()=>{}},AUDIO:{boneOut(){},squelch(){},scaleSet(){},hiss(){}},BLOOD:{emit(){}}};
const api=vm.runInNewContext(
 slice('function mk(geo,','/* 굵기가 변하는 관')+slice('const _mgM=','/* 빠른 짧은 광선 검사')+
 slice('const SLICE=','/* ===== 3. 소리')+slice('const CUT_DETAIL=','/* 바지:')+
 slice('const HEADGEO=','const BELLY_C=')+slice('function eyeCapGeo(','\n}')+'\n}\n'+
 slice('const REP_TOOTH=','Object.assign(Emperor.prototype,')+
 slice('function deityHasReptileVoice(E){','const COMBAT_VOICE=')+
 'const methods={'+slice(' buildHeadRegrowth(r){',' // 파충류 얼굴:')+slice(' voiceHit(tool,part,P,cut){',' // 날아간 살점의 겉 색:')+slice('makeCutCap(parent,','limbCorners(root){')+slice('releaseGeometry(g){','// 바닥에 누운 팔다리')+'};\n({methods,CUT_DETAIL,HEADGEO,headGrowthMaterial,GEO,grp});',ctx);
function makeRig(){
 const root=new THREE.Group(),neck=new THREE.Group();root.add(neck);const E={...api.methods,root,bones:{neck},goreMeshes:[],disposables:[],parts:[],flow:{},headGone:true,headDestroyed:true,headKind:'human',
  bone(name,parent,pos){const g=api.grp(parent,pos);g.userData.bone=name;this.bones[name]=g;return g},
  addFlesh(geo,mat,parent,o){const mesh=new THREE.Mesh(geo,mat);mesh.userData.part=o.part;parent.add(mesh);return mesh},resetHeadDamage(){this.jawGone=false},
  M:new Proxy({}, {get(t,k){return t[k]||(t[k]=new THREE.MeshStandardMaterial({color:k==='regBone'||k==='cutBone'?0xccc7ac:k==='rawFlesh'||k==='cutTissue'?0x2c466c:k==='cutDepth'?0x0d1b29:k==='cutMarrow'?0x1c3347:0x6a7e47,side:THREE.DoubleSide}));}})};
 return E;
}
test('cut cavity has depth and no rounded old mesh hides it on either side',()=>{
 for(const distal of [false,true]){
  const E=makeRig(),parent=api.grp(E.root),body=new THREE.Mesh(new THREE.SphereGeometry(.1,32,24),E.M.liz);parent.add(body);
  const next=api.grp(parent,[0,0,0]);next.userData.bone='next';const protectedMesh=new THREE.Mesh(new THREE.SphereGeometry(.03),E.M.liz);next.add(protectedMesh);const old=protectedMesh.geometry;
  const cap=E.makeCutCap(parent,V3(),new THREE.Quaternion(),.1,distal,E.M.liz,true),sign=distal?1:-1;
  const P=body.geometry.attributes.position;let furthest=-Infinity;for(let i=0;i<P.count;i++)furthest=Math.max(furthest,sign*P.getY(i));
  assert(furthest<=-.025+1e-6,'old sealed end is actually cut away');assert.equal(protectedMesh.geometry,old,'next articulated segment is not trimmed');
  const detail=cap.children.find(o=>o.userData.gore);cap.updateWorldMatrix(true,true);
  const ray=new THREE.Raycaster(V3(.0022,sign*.4,sign*.0032),V3(0,-sign,0));const hits=ray.intersectObject(detail,true);
  assert(hits.length,'visible bone canal has a backing surface');assert(hits[0].point.y*sign<-.015,'the canal is recessed, not a flat disk');
 }
});
test('head layers retain final proportions, advance in order, then release temporary meshes/materials',()=>{
 for(const blood of [true,false]){
  ctx.PREF.blood=blood;const E=makeRig();E.regrowHead={t:0,dur:2.4,built:false,goo:0};E.updateHeadRegrow(0);const r=E.regrowHead,base=E.repSkull.geometry;
  assert(E.repHead.scale.equals(V3(1,1,1)),'head never inflates from a miniature');
  E.updateHeadRegrow(.5);assert(r.boneMeshes[0].material.userData.headGrowth.value>r.rawMeshes[0].material.userData.headGrowth.value);
  assert(!E.repEyes[0].root.visible);assert.equal(r.boneMeshes[0].visible,blood);
  E.updateHeadRegrow(.65);assert(r.rawMeshes[0].material.userData.headGrowth.value>r.skin[0].m.userData.headGrowth.value);
  E.updateHeadRegrow(.95);assert(E.repEyes.every(e=>e.root.visible));
  assert(r.lids[0].position.y>0&&r.lids[1].position.y<0,'lids separate from the centre instead of shrinking into a band');
  assert(r.rawMeshes.every(m=>m.material.userData.headCovered.value>-.24),'covered flesh is clipped out rather than flickering through skin');
  E.updateHeadRegrow(.31);assert.equal(E.regrowHead,null);assert.equal(E.headGone,false);assert.equal(E.repSkull.geometry,base);
  assert.equal(E.repSkull.material,E.M.lizHead);assert.equal(E.disposables.filter(m=>m.userData&&m.userData.headGrowth).length,0);
  assert.equal(r.frame.parent,null);assert.equal(r.raw.parent,null);assert(r.lids.every(l=>!l.parent));assert.equal(E.goreMeshes.length,0);
 }
 ctx.PREF.blood=true;
});
test('head growth shader keeps the original material hook and uniform survives recompiles',()=>{
 const m=new THREE.MeshStandardMaterial();let calls=0;m.onBeforeCompile=()=>calls++;
 const reveal=api.headGrowthMaterial(m,-.07);const compile=()=>{const sh={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader};reveal.onBeforeCompile(sh);return sh;};
 const a=compile(),b=compile();assert.equal(calls,2);assert.equal(a.uniforms.uHeadGrowth,b.uniforms.uHeadGrowth);assert(a.fragmentShader.includes('discard;'));assert(a.vertexShader.includes('vHeadGrowth=position;'));
});

test('completed regrowth restores impact cries while the severed human face stays disabled',()=>{
 const E=makeRig(),played=[];ctx.G={time:20};ctx.AUDIO.voice=(name,k)=>played.push({name,k});
 E.state='stand';E.regrowHead={t:0,dur:2.4,built:false,goo:0};
 E.voiceHit('knife','neck',1,true);assert.equal(played.length,0,'no head before regrowth');
 E.updateHeadRegrow(0);E.updateHeadRegrow(1.2);
 E.voiceHit('knife','head',1,true);assert.equal(played.length,0,'unfinished head cannot cry');
 E.updateHeadRegrow(1.21);
 assert.equal(E.headKind,'rep');assert.equal(E.headGone,false);
 assert.equal(E.headDestroyed,true,'keep detached human-face animation disabled');
 for(const tool of ['hand','knife','gun']){
  ctx.G.time+=1;E.voiceHit(tool,'head',1,tool!=='hand');
  assert.equal(played.at(-1)?.name,'reptile');
 }
 assert.equal(played.length,3);
 E.headGone=true;ctx.G.time+=1;E.voiceHit('knife','neck',1,true);
 assert.equal(played.length,3,'severing the regrown head silences it again');
 E.regrowHead={t:0,dur:2.4,built:false,goo:0};E.updateHeadRegrow(0);E.updateHeadRegrow(2.41);
 ctx.G.time+=1;E.voiceHit('hand','chest',1,false);assert.equal(played.length,4);
 assert.equal(played.at(-1).name,'reptile');
});
