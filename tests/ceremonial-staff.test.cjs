const test=require('node:test'),assert=require('node:assert/strict');
const THREE=require('../three.min.js'),{create}=require('../ceremonial-staff.js');
const setup=()=>{const hits=[],staff=create(THREE,new THREE.Group(),{onImpact:p=>hits.push(p)});return {staff,hits};};
function advance(staff,duration,dt=1/60,fall=true){for(let t=0;t<duration-1e-9;t+=dt)staff.update(Math.min(dt,duration-t),fall);}
function lowest(staff){staff.root.updateMatrixWorld(true);let min=Infinity;const v=new THREE.Vector3();staff.root.traverse(m=>{if(!m.isMesh||m.material.transparent)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);min=Math.min(min,v.y);}});return min;}
test('falls once, stays down through revival, and resets for the next opponent',()=>{
 const {staff,hits}=setup();advance(staff,3,1/60,false);assert.equal(staff.state,'upright');assert.deepEqual(hits,[]);
 advance(staff,2);assert.equal(staff.state,'settled');assert.deepEqual(hits,[1,.38,.16]);const p=staff.root.position.clone(),q=staff.root.quaternion.clone();
 advance(staff,4,1/60,false);advance(staff,2);assert(staff.root.position.equals(p));assert(staff.root.quaternion.equals(q));assert.equal(hits.length,3);
 staff.reset();assert.equal(staff.state,'upright');assert(staff.root.position.z<0);advance(staff,2);assert.equal(hits.length,6);
});
test('actual staff geometry never passes through the floor during falling or bouncing',()=>{
 const {staff}=setup();for(let i=0;i<160;i++){staff.update(1/120,true);assert(Math.abs(lowest(staff)-.008)<1e-6);}
});
test('pause and hitstop cannot advance the prop or play its landing sound',()=>{
 const {staff,hits}=setup();staff.update(0,true);assert.equal(staff.state,'upright');staff.update(.5,true);const t=staff.elapsed,q=staff.root.quaternion.clone();
 for(let i=0;i<60;i++)staff.update(0,true);assert.equal(staff.elapsed,t);assert(staff.root.quaternion.equals(q));assert.equal(hits.length,0);
});
test('landing timing and position agree at 30, 60 and 120 fps',()=>{
 const runs=[30,60,120].map(fps=>{const h=setup();advance(h.staff,.9,1/fps);return h;});
 for(const h of runs){assert.deepEqual(h.hits,[1]);assert(h.staff.root.position.distanceTo(runs[0].staff.root.position)<1e-9);assert(h.staff.root.quaternion.angleTo(runs[0].staff.root.quaternion)<1e-7);}
});
test('crystal fits narrow portrait cameras and the upright shaft clears the throne',()=>{
 const {staff}=setup();staff.root.updateMatrixWorld(true);const vertices=[],v=new THREE.Vector3();staff.root.traverse(m=>{if(!m.isMesh||m.material.transparent)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)vertices.push(v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld).clone());});
 for(const [w,h]of [[360,640],[390,844],[844,390]]){const aspect=w/h,portrait=w<h,camera=new THREE.PerspectiveCamera(portrait?44:39,aspect,.01,40);camera.position.set(.12,1.58,-.62+(portrait?Math.max(2.55,1.7/aspect):3.05));camera.lookAt(0,1.08,-.62);camera.updateMatrixWorld(true);for(const p of vertices){if(p.y<1.4)continue;const q=p.clone().project(camera);assert(Math.abs(q.x)<.95&&Math.abs(q.y)<.95,`crystal cropped at ${w}x${h}`);}}
 // Existing stage: plinth, seat, right arm support, right arm cap and back panel.
 const boxes=[[[-.73,0,-1.33],[.73,.12,-.43]],[[-.65,.09,-1.2],[.65,.41,-.52]],[[.575,.425,-1.175],[.665,.755,-.525]],[[.555,.7575,-1.2],[.685,.8025,-.5]],[[-.71,.45,-1.235],[.71,1.91,-1.105]]];
 for(const p of vertices)for(const [lo,hi]of boxes)assert(!(p.x>lo[0]&&p.x<hi[0]&&p.y>lo[1]&&p.y<hi[1]&&p.z>lo[2]&&p.z<hi[2]),'staff intersects throne');
});
