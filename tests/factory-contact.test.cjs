const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('../three.min.js'),src=fs.readFileSync(require('node:path').join(__dirname,'../fight-free.js'),'utf8');
const code=src.slice(src.indexOf('function createHeapContact('),src.indexOf('function create(D){'));
const create=vm.runInNewContext(code+';createHeapContact',{performance});
if(!THREE.Object3D.prototype.removeFromParent)THREE.Object3D.prototype.removeFromParent=function(){this.parent?.remove(this);return this;};
function snapshot(geometries){
 const p=[],i=[];for(const g of geometries){const n=p.length/3;p.push(...g.attributes.position.array);i.push(...Array.from(g.index.array,x=>x+n));}
 const sn={p:new Float32Array(p),i:new Uint32Array(i),c:new Uint8Array(p.length)},bounds=new THREE.Box3(),v=new THREE.Vector3();
 for(let k=0;k<p.length;k+=3)bounds.expandByPoint(v.fromArray(p,k));return {sn,bounds};
}
function setup(capacity=280,clock=()=>0){const root=new THREE.Group(),contact=create(THREE,root,capacity,clock);return {root,contact};}
function drain(c){let n=0;while(c.pending&&n++<500)c.update();assert.equal(c.pending,0);}
function alphaAt(mesh,x,z,slot=0){
 const p=mesh.geometry.attributes.position.array,uv=mesh.geometry.attributes.uv.array,k=slot*18,u=slot*12;
 const fx=(x-p[k])/(p[k+6]-p[k]),fz=(z-p[k+2])/(p[k+5]-p[k+2]),image=mesh.material.map.image;
 const tx=Math.min(image.width-1,Math.floor((uv[u]+fx*(uv[u+4]-uv[u]))*image.width));
 const tz=Math.min(image.height-1,Math.floor((uv[u+1]+fz*(uv[u+3]-uv[u+1]))*image.height));
 return image.data[(tz*image.width+tx)*4+3];
}
test('contact follows separated feet without filling the empty floor between them',()=>{
 const h=setup(),{sn,bounds}=snapshot([new THREE.BoxGeometry(.18,.12,.4).translate(-.4,.072,0),new THREE.BoxGeometry(.18,.12,.4).translate(.4,.072,0)]);
 const before={p:sn.p.slice(),i:sn.i.slice(),c:sn.c.slice()};h.contact.add(1,sn,bounds);drain(h.contact);
 const mesh=h.root.children[0];assert(alphaAt(mesh,-.4,0)>140);assert(alphaAt(mesh,.4,0)>140);assert.equal(alphaAt(mesh,0,0),0);
 assert.deepEqual(sn,before,'stored body geometry and colors are unchanged');
 assert.equal(h.root.children.length,1);assert.equal(mesh.material.depthWrite,false);assert.equal(mesh.material.toneMapped,false);
 const p=mesh.geometry.attributes.position.array,a=new THREE.Vector3().fromArray(p),b=new THREE.Vector3().fromArray(p,3),c=new THREE.Vector3().fromArray(p,6);
 assert(b.sub(a).cross(c.sub(a)).y>0,'floor decal faces the camera above it');assert(Math.abs(a.y-.006)<1e-8);
});
test('lower surfaces cast a stronger contact shadow and the patch stays under asymmetric geometry',()=>{
 const h=setup(),low=snapshot([new THREE.BoxGeometry(.2,.2,.3).translate(-1,.112,-9)]),high=snapshot([new THREE.BoxGeometry(.2,.2,.3).translate(1,.512,-10)]);
 h.contact.add(1,low.sn,low.bounds);h.contact.add(2,high.sn,high.bounds);drain(h.contact);
 const mesh=h.root.children[0];assert(alphaAt(mesh,-1,-9,0)>alphaAt(mesh,1,-10,1)*5);
 for(const slot of [0,1]){
  const uv=mesh.geometry.attributes.uv.array,im=mesh.material.map.image,tx=Math.round(uv[slot*12]*im.width),tz=Math.round(uv[slot*12+1]*im.height);
  for(let k=0;k<32;k++)assert.equal(im.data[(tz*im.width+tx+k)*4+3],0,'transparent border prevents rectangular patches and atlas bleed');
 }
});
test('large meshes yield across frames; removing queued pieces prevents stale shadows',()=>{
 const h=setup(4),{sn,bounds}=snapshot([new THREE.SphereGeometry(.3,64,48).translate(0,.312,-4)]);
 h.contact.add(1,sn,bounds);h.contact.update();assert.equal(h.contact.pending,1,'bounded even with a coarse clock');
 h.contact.remove(1);drain(h.contact);assert.equal(h.contact.count,0);assert(h.root.children[0].geometry.attributes.position.array.every(x=>x===0));
 h.contact.add(2,sn,bounds);drain(h.contact);assert.equal(h.contact.count,1);assert(alphaAt(h.root.children[0],0,-4)>100);
});
test('hundreds of stored fragments share one draw and cleanup releases all shadow resources',()=>{
 const h=setup(),{sn,bounds}=snapshot([new THREE.BoxGeometry(.1,.1,.1).translate(0,.062,-2)]);
 for(let i=0;i<280;i++)h.contact.add(i,sn,bounds);drain(h.contact);assert.equal(h.root.children.length,1);assert.equal(h.contact.count,280);
 const mesh=h.root.children[0];assert.equal(mesh.geometry.attributes.position.count,280*6);assert.equal(mesh.material.map.image.data.byteLength,512*1024*4);
 h.contact.remove(0);h.contact.add(281,sn,bounds);drain(h.contact);assert.equal(h.contact.count,280);assert.equal(h.root.children[0],mesh);
 let released=0;for(const x of [mesh.geometry,mesh.material,mesh.material.map])x.addEventListener('dispose',()=>released++);
 h.contact.clear();assert.equal(released,3);assert.equal(h.root.children.length,0);assert.equal(h.contact.pending,0);assert.equal(h.contact.count,0);
 h.contact.add(1,sn,bounds);drain(h.contact);assert.equal(h.root.children.length,1);assert.notEqual(h.root.children[0],mesh);
});
