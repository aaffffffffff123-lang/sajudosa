const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js');
const source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a);assert(i>=0,a);const j=source.indexOf(b,i);assert(j>i,b);return source.slice(i,j)};
// SCULPT 모듈만 떼어 실행한다(V3·TAU·PI·lerp만 있으면 된다)
const SCULPT=vm.runInNewContext(slice('const SCULPT=(()=>{','/* ===== 3. 소리 =====')+';SCULPT',
 {THREE,Math,V3:(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),TAU:Math.PI*2,PI:Math.PI,lerp:(a,b,t)=>a+(b-a)*t});

// 삼각형마다 (감는 방향으로 구한 면 법선)·(지오메트리가 들고 있는 꼭짓점 법선) 부호를 센다
function windingAgreement(g){
 const P=g.attributes.position,N=g.attributes.normal,I=g.index.array,T=I.length/3;
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),vn=new THREE.Vector3(),t=new THREE.Vector3();
 let out=0,inn=0;
 for(let k=0;k<T;k++){
  a.fromBufferAttribute(P,I[k*3]);b.fromBufferAttribute(P,I[k*3+1]);c.fromBufferAttribute(P,I[k*3+2]);
  n.subVectors(b,a).cross(t.subVectors(c,a));if(n.lengthSq()<1e-16)continue; // 끝점에 모인 퇴화 삼각형은 뺀다
  vn.fromBufferAttribute(N,I[k*3]).add(t.fromBufferAttribute(N,I[k*3+1])).add(t.fromBufferAttribute(N,I[k*3+2]));
  if(n.dot(vn)>0)out++;else inn++;
 }
 return {out,inn};
}
// 꼭짓점 법선이 관 축에서 바깥을 보는지(가운데 몸통 줄에서)
function normalsPointOutward(g,a,b){
 const P=g.attributes.position,N=g.attributes.normal,ax=new THREE.Vector3().subVectors(b,a).normalize();
 const p=new THREE.Vector3(),n=new THREE.Vector3(),rad=new THREE.Vector3();let bad=0;
 for(let i=0;i<P.count;i++){p.fromBufferAttribute(P,i).sub(a);rad.copy(p).addScaledVector(ax,-p.dot(ax));if(rad.length()<.01)continue;
  n.fromBufferAttribute(N,i);if(n.dot(rad)<0)bad++;}
 return bad;
}

test('SCULPT.tube winds its triangles so the outside is the front face, for every axis direction',()=>{
 const cases=[
  [new THREE.Vector3(0,.01,0),new THREE.Vector3(0,-.137,0)],   // 팔·다리(아래로)
  [new THREE.Vector3(0,-.04,.02),new THREE.Vector3(0,.125,.028)], // 목(위로)
  [new THREE.Vector3(0,0,0),new THREE.Vector3(.1,.03,-.05)],     // 비스듬히
 ];
 for(const [a,b] of cases){
  const g=SCULPT.tube(a,b,(t,ang)=>.1+.01*Math.sin(ang*3),24,8,{cap:3,capScale:.4});
  const w=windingAgreement(g);
  assert(w.inn===0,'inward-wound triangles: '+w.inn+' of '+(w.inn+w.out));
  assert.equal(normalsPointOutward(g,a,b),0,'vertex normals must point away from the axis');
 }
});
test('openA/openB leave that end without a cap and the body still winds outward',()=>{
 const a=new THREE.Vector3(0,.01,0),b=new THREE.Vector3(0,-.137,0),rs=24,ls=8,capN=3;
 const closed=SCULPT.tube(a,b,()=>.1,rs,ls,{cap:capN}),openB=SCULPT.tube(a,b,()=>.1,rs,ls,{cap:capN,openB:true}),openA=SCULPT.tube(a,b,()=>.1,rs,ls,{cap:capN,openA:true});
 const rowsOf=g=>g.attributes.position.count/(rs+1);
 assert.equal(rowsOf(closed),ls+1+capN*2);assert.equal(rowsOf(openB),ls+1+capN);assert.equal(rowsOf(openA),ls+1+capN);
 for(const g of [openA,openB]){const w=windingAgreement(g);assert(w.inn===0&&w.out>0);}
 // 뚫린 끝의 마지막 줄은 관 끝(b)에 그대로 있다
 const P=openB.attributes.position,last=(rowsOf(openB)-1)*(rs+1);
 assert(Math.abs(P.getY(last)-b.y)<1e-6);
});
test('the forearm sleeve is open at the wrist and has a lining cup drawn from the inside',()=>{
 const arms=slice(' _arms(){','_hand(wr,s,part){');
 assert(/farmLining/.test(arms),'sleeve lining mesh is attached to the forearm');
 const body=slice('G.farm=SCULPT.tube(','G.wrist=');
 assert(/openB:true/.test(body)&&/G\.farmLining=SCULPT\.tube\(/.test(body)&&/openA:true/.test(body));
});
