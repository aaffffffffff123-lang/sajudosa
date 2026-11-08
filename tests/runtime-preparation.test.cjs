const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js'),source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const scope={THREE,V3,clamp,PI:Math.PI,TAU:Math.PI*2,col:c=>new THREE.Color(c),rnd:(a,b)=>(a+b)/2,document:{hidden:false},G:{running:false},setTimeout:()=>1,clearTimeout(){}};
const {FASTRAY,FLESH,SCULPT,SLICE}=vm.runInNewContext(slice('const FASTRAY=','/* ===== 3. 소리')+';({FASTRAY,FLESH,SCULPT,SLICE})',scope);
function flesh(g,options={}){return new FLESH.Flesh(new THREE.Mesh(g,new THREE.MeshBasicMaterial()),{center:V3(),maxAbs:.15,...options});}
function equal(a,b){assert.equal(a.length,b.length);assert(Buffer.from(a.buffer,a.byteOffset,a.byteLength).equals(Buffer.from(b.buffer,b.byteOffset,b.byteLength)));}

test('cached body preparation preserves geometry and keeps damage private across bodies',()=>{
 const source=new THREE.SphereGeometry(.4,44,32),options={center:V3(.01,-.02,.03),maxFrac:.41,maxAbs:.13};
 const plain=flesh(source.clone(),options),first=flesh(FLESH.clone(source),options),second=flesh(FLESH.clone(source),options);
 for(const name of ['pos','nor','rest','restN','cap','canon','cvStart','cvList','cfStart','cfList']){equal(plain[name],first[name]);equal(plain[name],second[name]);}
 const pristine=second.pos.slice(),rays=FASTRAY.grid(second.g).A.slice();
 first.dent(V3(0,0,.4),V3(0,0,-1),.12,.04,{bruise:.8});
 first.crater(V3(.08,0,.39),V3(0,0,-1),.07,.03,{minEdge:.01});
 assert(first.n>plain.n,'topology is actually subdivided');
 equal(second.pos,pristine);equal(FASTRAY.grid(second.g).A,rays);assert(second.dmg.every(x=>x===0));
 const later=flesh(FLESH.clone(source),options);equal(later.pos,pristine);equal(later.nor,plain.nor);equal(later.cap,plain.cap);
 const different=flesh(FLESH.clone(source),{...options,maxAbs:.01});assert(different.cap.every(v=>v<=.010001),'different deformation limits have separate templates');
 first.disposeWork();second.disposeWork();later.disposeWork();different.disposeWork();plain.disposeWork();
});

test('packed ray cells agree with exact triangle raycasting and copied grids stay independent',()=>{
 const g=new THREE.SphereGeometry(.4,48,36),grid=FASTRAY.grid(g),copy=FASTRAY.copy(grid),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld(true);
 let seed=39283;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<500;i++){
  const o=V3(random()*2-1,random()*2-1,random()*2-1).normalize().multiplyScalar(1.2),d=V3(random()*.8-.4,random()*.8-.4,random()*.8-.4).sub(o).normalize();
  const expected=new THREE.Raycaster(o,d,0,3).intersectObject(mesh)[0],out={normal:V3()},hit=FASTRAY.ray(grid,o,d,3,out);
  assert.equal(hit,!!expected);if(hit)assert(Math.abs(out.t-expected.distance)<1e-6);
 }
 const original=grid.A[0];copy.A[0]+=1;copy.mark[0]=912;copy.bb.min.x-=1;
 assert.equal(grid.A[0],original);assert.notEqual(grid.mark[0],copy.mark[0]);assert.notEqual(grid.bb.min.x,copy.bb.min.x);
 assert.equal(copy.cells[0],grid.cells[0],'immutable cell membership is reused');
});

test('sliced sculpting preserves all vertex, normal, UV and color values',()=>{
 const sdf=(x,y,z)=>SCULPT.ell(x,y,z,0,0,0,.22,.31,.19),options={smooth:2,tint:(x,y,z,c)=>c.setRGB(.5+x,.5+y,.5+z)};
 const direct=SCULPT.star(sdf,V3(),24,18,.4,options),job=SCULPT.starSteps(sdf,V3(),24,18,.4,options);let n=0,step;
 do{step=job.next();n++;}while(!step.done);assert(n>40,'work yields between small batches of vertices');
 for(const name of Object.keys(direct.attributes))equal(direct.attributes[name].array,step.value.attributes[name].array);
 equal(direct.index.array,step.value.index.array);
});


test('discard-only trimming preserves every retained vertex, attribute and triangle',()=>{
 const g=new THREE.SphereGeometry(.4,48,36),c=new Float32Array(g.attributes.position.count*3),dm=new Float32Array(g.attributes.position.count*4);
 for(let i=0;i<c.length;i++)c[i]=(i%19)/19;for(let i=0;i<dm.length;i++)dm[i]=(i%7)/7;
 g.setAttribute('color',new THREE.BufferAttribute(c,3));g.setAttribute('aDmg',new THREE.BufferAttribute(dm,4));
 for(const close of [false,true])for(const offset of [-.2,0,.15]){
  const n=V3(.2,1,.3).normalize(),both=SLICE.slice(g,n,offset,close),one=SLICE.slice(g,n,offset,close,true);
  assert.equal(one.cut,null);assert.equal(one.loops,both.loops);
  for(const name of Object.keys(both.keep.attributes))equal(one.keep.attributes[name].array,both.keep.attributes[name].array);
  equal(one.keep.index.array,both.keep.index.array);
 }
});
