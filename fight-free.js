/* fight-free.js — 「원없이 족치기」 모드 (사주도사 족치기 화면의 따로 떨어진 모드)
 *
 * fight.js에서 떼어 낸 파일이다. fight.js가 자기 내부 도구(장면·천지신명 클래스·소리·피·손 등)를 create()에 넘겨 주고,
 * 여기서는 이 모드에만 필요한 것을 전부 만든다. 본편(추종자·되살림 컷씬·엔딩)은 이 파일을 모른다.
 * 불러오는 순서: three.min.js → fight-motion.js → ceremonial-staff.js → throne-plaque.js → fight-free.js → fight.js
 *
 * 무엇을 하는가
 *  - 죽지 않는 천지신명: 게이지 없이 맞을수록 무너지기만 한다. 잘린 팔다리·머리는 저절로 자라지 않는다.
 *  - 「되살리기」: 뼈 → 살 → 비늘로 다시 자란다(도마뱀). 되살린 놈은 겁을 먹는다.
 *  - 허리 끊기: 식칼로 배를 가로로 길게 다섯 번. 아랫도리는 조각으로 떨어지고 윗몸은 살아서 계속 맞는다.
 *  - 「새 놈」: 두 손으로 들어 올림 → 갈고리가 내려와 등에 꿰임 → 한 대 밀면 사슬이 끌어올려 레일에 건다.
 *    떨어진 머리는 장대에 꽂고, 바닥의 잘린 부위는 뒤쪽 무더기로 던진다. 그 뒤 새 천지신명이 뒷짐 지고 걸어 나온다.
 *  - 방: 옥좌 없는 넓은 냉장실. 레일 네 줄이 화면 안쪽으로 멀리 뻗고, 걸린 몸이 그 줄을 따라 늘어선다(줄마다 24구).
 *  - 걸린 몸·무더기 조각은 '그 순간 그 모습 그대로' 굳혀 둔다(본뜨기). 기록은 localStorage, 굳힌 모습은 IndexedDB에 남는다.
 *
 * 고칠 때 찾을 곳(아래 순서대로 들어 있다)
 *  1. 자세: HANG_POSE · freeHangPose(걸리는 몸) · freeWalkPose(걸어 나오는 새 놈)
 *  2. 방과 배치: ROWX·ROW_Z0·ROW_DZ·ROW_CAP(레일 줄) · SPIKES(머리 장대) · build()(벽·천장·형광등) · stage()(옥좌 치우기·안개)
 *  3. 기록: loadRecord · saveRecord
 *  4. 일반 모형: template · proxyBody · proxyHead (저장된 본이 없을 때만 쓴다)
 *  5. 본뜨기: newJob · jobMesh · jobFinish · snapMesh · DB
 *  6. 무더기: toHeap · heapLand · updateHeap
 *  7. 걸이·줄 세우기: makeHolder · layoutLine · ensureMesh(가까우면 자세히, 멀면 성기게)
 *  8. 「되살리기」: revive · flinch · fear
 *  9. 허리 끊기: waistSlash · bisect
 * 10. 「새 놈」 순서: T(시간표) · next · pierce · handover · arrive · seat · updateSeq
 * 11. 매 프레임: updateItems · update · syncUI · camera3
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FateFree=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
function create(D){
const {THREE,scene,camera,G,CAM,VM,AUDIO,BLOOD,CHUNKS,PROGRESS,PREF,OUTFITS,HINTS,GEO,HEADGEO,COMBAT_STAGE,Emperor,Spring,P,STAND,poseCopy,poseLerp,combatInit,combatActive,combatVoiceReset,wireEmperor,metalEnv,mk,grp,STD,col,cylGeo,sphereGeo,mergeMeshes,mirrorX,canvasTex,V3,rnd,clamp,lerp,smooth,damp,easeIn,backOut,PI,TAU,UP,$,hint,flash,camHit,clearPointers,clearCombatAccent,clearTalk,focusCanvas,deityHasReptileVoice,MOBILE_GPU}=D;
const lite=D.lite; // 성능 단계(0 보통 · 1~2 낮춤)는 fight.js가 실행 중에 바꾸므로 함수로 받는다
const HUNG_STORE='palja.hung';
const FREE_FLOOR=8;      // 원없이 족치기에서 버팀 값이 내려가는 바닥(죽지 않는다)
const FREE_DMG=.5;       // 본편보다 천천히 무너진다
// 갈고리에 걸려 늘어진 자세(뿌리 기준). 고개와 팔다리가 힘없이 처진다
const HANG_POSE=P({pF:.06,sF:.16,cF:.14,nF:.42,hF:.38,hR:.18,hT:.12,
 LsF:.14,RsF:.08,LsA:.16,RsA:.2,LeB:.16,ReB:.26,LwF:.2,RwF:.25,Lcurl:.5,Rcurl:.55,
 LhF:.14,RhF:.03,LhA:.05,RhA:.08,LkB:.3,RkB:.14,LaF:-.55,RaF:-.6});
function freeHangPose(E,out){
 const h=E.hang,u=smooth(h.u),t=G.time;
 poseLerp(h.from,HANG_POSE,u,out);
 out.tx=lerp(h.from.tx,h.x,u);out.tz=lerp(h.from.tz,h.z,u)-h.back;
 out.ty=lerp(h.from.ty,h.lift,u)-h.sag;
 out.rx=lerp(h.from.rx,.2,u)+h.swing;out.ry=lerp(h.from.ry,0,u);out.rz=lerp(h.from.rz,0,u)+h.swingZ;
 // 들려 올라가는 동안은 살아서 버둥댄다. 꿰이고 나면 잦아든다
 const k=h.kick*u;
 if(k>.01){
  const a=Math.sin(t*17+E.flailSeed),b=Math.sin(t*15+1.3+E.flailSeed);
  out.LhF+=a*.38*k;out.RhF-=b*.38*k;out.LkB+=Math.max(0,a)*.7*k;out.RkB+=Math.max(0,-b)*.7*k;
  out.LsF+=Math.sin(t*13)*.3*k;out.RsF-=Math.sin(t*14+.6)*.3*k;out.LeB+=Math.abs(a)*.4*k;out.ReB+=Math.abs(b)*.4*k;
  out.hT+=Math.sin(t*9)*.16*k;out.hF-=.3*k;out.nF-=.3*k;out.cT+=Math.sin(t*11)*.05*k;
 }
}
function freeWalkPose(E,out,dt){
 const w=E.walkIn,u=smooth(w.u),end=smooth(clamp(w.sit,0,1));
 poseCopy(STAND,out);
 // 거만: 가슴을 내밀고 턱을 들고 뒷짐을 진다
 out.cF-=.12;out.hF-=.1;out.sF-=.06;out.hR+=.05;
 out.LsF=-.46;out.RsF=-.46;out.LsA=.2;out.RsA=.2;out.LsT=-.55;out.RsT=-.55;out.LeB=1.0;out.ReB=1.0;out.Lcurl=.6;out.Rcurl=.6;
 const moving=w.u>0&&w.u<1&&!w.frozen?1:0;
 w.stepK=damp(w.stepK,moving,12,dt);w.phase+=dt*8.4*w.stepK;
 const a=Math.sin(w.phase)*.44*w.stepK;
 out.LhF+=a;out.RhF-=a;out.LkB+=Math.max(0,a)*1.25;out.RkB+=Math.max(0,-a)*1.25;out.py-=.022*w.stepK*Math.abs(Math.cos(w.phase));
 out.sT+=Math.sin(w.phase)*.05*w.stepK;
 // 뒤에 걸린 몸을 돌아보고 굳는다: 고개와 어깨가 그쪽으로 돌아간다
 const g=smooth(w.lookK);
 out.hT+=w.lookDir*.85*g;out.nT+=w.lookDir*.3*g;out.cT+=w.lookDir*.28*g;out.hF+=.02*g;out.cF+=.07*g;out.sF+=.03*g;
 // 다 와서는 뒷짐을 풀고 평소 선 자세로
 if(end>0)poseLerp(out,STAND,end,out);
 out.tx=lerp(w.side*w.from,0,u);out.tz=w.z;out.ty=0;out.rx=0;out.rz=0;
 out.ry=lerp(-w.side*1.2,0,smooth(clamp((w.u-.4)/.6,0,1)));
}
const FREE=(()=>{
 const root=grp(scene,null,'free-hall');root.visible=false;
 const iron=STD('#565b5a',{metalness:.7,roughness:.48,envMapIntensity:.5});
 const ironD=STD('#2c3030',{metalness:.55,roughness:.62,envMapIntensity:.4});
 const proxyMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:0});
 const capMat=STD('#17348c',{roughness:.35});
 const poolTex=canvasTex(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,6,64,64,62);r.addColorStop(0,'rgba(20,52,150,.95)');r.addColorStop(.62,'rgba(16,40,120,.85)');r.addColorStop(.86,'rgba(12,30,96,.4)');r.addColorStop(1,'rgba(12,30,96,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
 const poolMat=new THREE.MeshBasicMaterial({map:poolTex,transparent:true,depthWrite:false,opacity:.8});
 const CHAIN=.57;
 // 방: 옥좌 없는 넓은 냉장실. 레일 네 줄이 화면 안쪽(−z)으로 멀리 뻗고, 걸린 몸은 그 레일을 따라 한 줄로 늘어선다(도축장 레일).
 // 새로 걸리는 몸이 맨 앞 칸으로 들어오면 그 줄 전체가 한 칸씩 안쪽으로 밀린다
 const HOOK_Y=2.15,RAIL_Y=HOOK_Y+CHAIN;
 const ROWX=[-1.05,1.05,-2.15,2.15];
 const ROW_Z0=-2.0,ROW_DZ=.8,ROW_CAP=24,HALL_END=-46,HALL_W=5.4,CEIL=4.7,KEEP=ROWX.length*ROW_CAP;
 // 효수 장대: 안쪽 두 줄 사이 통로에 지그재그로, 멀수록 높게
 const SPIKES=[[-.5,2.0,-3.0],[.5,2.0,-3.0],[0,2.25,-3.9],[-.5,2.5,-4.8],[.5,2.5,-4.8],[0,2.75,-5.8],[-.5,3.0,-6.8],[.5,3.0,-6.8]];
 const GEOS={
  chain:cylGeo(.011,.011,CHAIN,6),haul:cylGeo(.011,.011,7,6),trolley:new THREE.BoxGeometry(.09,.06,.12),
  hook:new THREE.TorusGeometry(.058,.0115,7,16,PI*1.3),shank:cylGeo(.0115,.0115,.1,6),tip:new THREE.ConeGeometry(.0115,.05,6),
  pool:new THREE.CircleGeometry(.34,24),pole:cylGeo(.012,.022,1,8)};
 for(const k in GEOS)GEOS[k].userData.shared=true;
 const S={on:false,total:0,items:[],lines:[[],[],[],[]],heads:[],seq:null,reviving:false,railsOn:false,railDrop:null,ui:'',slides:[],jobs:[],gen:0,stageOn:false,tool:''};
 const _v=V3(),_v2=V3(),_m=new THREE.Matrix4();

 /* ---- 레일 ---- */
 const rails=grp(root,null,'rails');rails.visible=false;
 const hall=grp(root,null,'hall');
 const bgCol=col('#b4c0bd');
 (function build(){
  const merge=(list,mat,parent)=>{parent.updateMatrixWorld(true);const geo=mergeMeshes(list,new THREE.Matrix4());for(const m of list){m.removeFromParent();m.geometry.dispose();}
   const m=new THREE.Mesh(geo,mat);m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false;parent.add(m);return m;};
  // 레일과 천장 걸이
  const L=3-HALL_END,list=[];
  for(const x of ROWX){
   list.push(mk(new THREE.BoxGeometry(.07,.06,L),ironD,rails,{p:[x,RAIL_Y+.06,3-L/2],cast:false}));
   for(let z=1;z>HALL_END;z-=4)list.push(mk(cylGeo(.016,.016,CEIL-RAIL_Y,6),ironD,rails,{p:[x,(CEIL+RAIL_Y)/2+.06,z],cast:false}));
  }
  merge(list,ironD,rails);metalEnv(rails);
  // 벽(흰 타일)·천장·맨 끝 벽
  const tile=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#dfe6e3';g.fillRect(0,0,w,h);
   for(let j=0;j<4;j++)for(let i=0;i<4;i++){const n=214+Math.random()*22|0;g.fillStyle=`rgb(${n},${n+5},${n+3})`;g.fillRect(i*64+2,j*64+2,60,60);}
   g.strokeStyle='#9aa5a2';g.lineWidth=2;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.stroke();g.beginPath();g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke();}});
  const wallTex=tile.clone();wallTex.needsUpdate=true;wallTex.wrapS=wallTex.wrapT=THREE.RepeatWrapping;wallTex.repeat.set(L/1.6,CEIL/1.6);
  const endTex=tile.clone();endTex.needsUpdate=true;endTex.wrapS=endTex.wrapT=THREE.RepeatWrapping;endTex.repeat.set(HALL_W*2/1.6,CEIL/1.6);
  const wallMat=STD('#ffffff',{map:wallTex,roughness:.55}),endMat=STD('#ffffff',{map:endTex,roughness:.55}),ceilMat=STD('#aeb8b5',{roughness:.9});
  const zc=8-(8-HALL_END)/2,zl=8-HALL_END;
  wallTex.repeat.set(zl/1.6,CEIL/1.6);
  for(const sd of [-1,1])mk(new THREE.PlaneGeometry(zl,CEIL),wallMat,hall,{p:[sd*HALL_W,CEIL/2,zc],r:[0,-sd*PI/2,0],cast:false});
  mk(new THREE.PlaneGeometry(HALL_W*2,CEIL),endMat,hall,{p:[0,CEIL/2,HALL_END],cast:false});
  mk(new THREE.PlaneGeometry(HALL_W*2,zl),ceilMat,hall,{p:[0,CEIL,zc],r:[PI/2,0,0],cast:false,receive:false});
  // 바닥: 싸우는 자리의 돌바닥을 같은 무늬로 방 끝까지 잇는다
  const base=COMBAT_STAGE.root.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===30);
  if(base){const len=-7.5-HALL_END+2,geo=new THREE.PlaneGeometry(30,len),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++){uv.setX(i,uv.getX(i)*2);uv.setY(i,uv.getY(i)*len/15);}
   mk(geo,base.material,hall,{r:[-PI/2,0,0],p:[0,0,-7.5-len/2],cast:false});}
  // 천장 형광등: 줄 사이마다 화면 안쪽으로 이어진다(거리감)
  const tube=new THREE.MeshBasicMaterial({color:col('#f6fcff'),fog:false}),tl=[];
  for(const x of [-1.6,0,1.6,-3.6,3.6])for(let z=2.5;z>HALL_END+1;z-=3.2)tl.push(mk(new THREE.BoxGeometry(.11,.04,1.7),tube,hall,{p:[x,CEIL-.05,z],cast:false,receive:false}));
  merge(tl,tube,hall);
  hall.add(new THREE.HemisphereLight(col('#f4faff'),col('#8f9895'),.62));
 })();
 const spikeRoot=grp(root,null,'spikes');
 const spikeMesh=SPIKES.map(([x,y,z])=>{const h=y-.02,m=mk(GEOS.pole,ironD,spikeRoot,{p:[x,h/2,z],s:[1,h,1],cast:false});m.visible=false;return m;});
 metalEnv(spikeRoot);
 // 옥좌·기둥·벽·현판·지팡이를 치우고 안개와 배경을 밝은 냉장실로 바꾼다. 끄면 원래 궁전으로 되돌린다
 let hidden=[];
 function stage(on){
  if(on){
   const keep=o=>o===COMBAT_STAGE.contact||(o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry');
   for(const c of COMBAT_STAGE.root.children)if(!keep(c)&&c.visible){c.visible=false;hidden.push(c);}
   scene.background=bgCol;scene.fog=new THREE.Fog(bgCol.clone(),13,50);camera.far=60;camera.updateProjectionMatrix();S.stageOn=true;
  }else{
   for(const c of hidden)c.visible=true;hidden=[];
   if(S.stageOn){scene.background=col('#151d1e');scene.fog=new THREE.Fog(col('#202725'),7,18);camera.far=40;camera.updateProjectionMatrix();}
   S.stageOn=false;
  }
 }

 /* ---- 기록 ---- */
 function loadRecord(){
  let n=0,list=[];
  try{const r=JSON.parse(localStorage.getItem(HUNG_STORE)||'null');
   if(r&&Number.isSafeInteger(r.n)&&r.n>=0&&Array.isArray(r.list)){n=Math.min(r.n,999999);
    for(const e of r.list.slice(-KEEP)){if(!e||!Array.isArray(e.p)||e.p.length!==4)continue;
     list.push({l:(e.l|0)>>>0,s:(e.s|0)>>>0,p:e.p.map(v=>clamp(Number(v)||0,0,1)),h:[0,1,2].includes(e.h)?e.h:1,w:e.w?1:0});}
    n=Math.max(n,list.length);}
  }catch(_){}
  return {n,list};
 }
 function saveRecord(){
  const list=S.items.map(it=>({l:it.look,s:it.seed,p:it.limbs.map(v=>Math.round(v*100)/100),h:it.head,w:it.waist?1:0}));
  try{localStorage.setItem(HUNG_STORE,JSON.stringify({n:S.total,list}));}catch(_){}
 }
 function rng(seed){let s=(seed>>>0)||1;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}

 /* ---- 대역 모형(오래된 몸·머리): 색을 꼭짓점에 구워 한 덩어리로 그린다 ---- */
 function dimColor(hex,k=.62,gray=.35){const c=col(hex),l=c.r*.3+c.g*.59+c.b*.11;c.r=lerp(c.r,l,gray)*k;c.g=lerp(c.g,l,gray)*k;c.b=lerp(c.b,l,gray)*k;return c;}
 function bake(build){
  const tmp=new THREE.Group(),list=[];
  const add=(geo,c,p,s,r)=>{const m=new THREE.Mesh(geo);m.position.set(p[0],p[1],p[2]);if(s!=null){if(typeof s==='number')m.scale.setScalar(s);else m.scale.set(s[0],s[1],s[2]);}if(r)m.rotation.set(r[0],r[1],r[2]);m.userData.c=c;m.userData.own=!GEO_SHARED.has(geo);tmp.add(m);list.push(m);return m;};
  build(add,tmp);
  tmp.updateMatrixWorld(true);
  const geo=mergeMeshes(list,new THREE.Matrix4(),m=>m.userData.c);
  for(const m of list)if(m.userData.own)m.geometry.dispose();
  const mesh=new THREE.Mesh(geo,proxyMat);mesh.castShadow=false;mesh.receiveShadow=false;return mesh;
 }
 const GEO_SHARED=new Set();
 const sg=(n)=>{const g=sphereGeo(n);GEO_SHARED.add(g);return g;};
 /* 대역 몸: 진짜 천지신명 하나를 걸린 자세로 빚어 한 번만 본을 뜬다(뼈마디별 조각). 꼭짓점을 2cm 칸으로 묶어 삼각형 수를 1/10쯤으로 줄이고,
  * 재질 대신 '무슨 천인지'만 꼭짓점에 적어 둔다 → 차림(옷 색)·잘린 팔다리·머리 유무에 맞춰 조각을 골라 한 덩어리로 합친다 */
 const CLS={robe:0,belly:0,chest:0,hem:1,robeIn:2,lining:2,shirt:3,tie:4,trouser:5,skin:6,skinD:6,flesh:6,blush:6,lip:6,boot:7,sole:8,gold:9,goldD:9,red:9,hairF:10,hair:10,brow:10,mouth:10};
 const SHIRT=3,BLOODC=11,OTHER=12;
 const ARM=['shoulder','uarmMid','elbow','farmMid','wrist'],LEG=['hip','thighMid','knee','shinMid','ankle'];
 let TPL=null;
 function clusterPart(P0,C0,I0,cell){
  const map=new Map(),np=[],nc=[],cnt=[],remap=new Uint32Array(C0.length);
  for(let i=0;i<C0.length;i++){
   const x=P0[i*3],y=P0[i*3+1],z=P0[i*3+2];
   const k=(((Math.round(x/cell)+512)*1024+(Math.round(y/cell)+512))*1024+(Math.round(z/cell)+512))*16+C0[i];
   let j=map.get(k);if(j===undefined){j=nc.length;map.set(k,j);np.push(0,0,0);nc.push(C0[i]);cnt.push(0);}
   np[j*3]+=x;np[j*3+1]+=y;np[j*3+2]+=z;cnt[j]++;remap[i]=j;
  }
  for(let j=0;j<nc.length;j++){np[j*3]/=cnt[j];np[j*3+1]/=cnt[j];np[j*3+2]/=cnt[j];}
  const idx=[];
  for(let i=0;i<I0.length;i+=3){const a=remap[I0[i]],b=remap[I0[i+1]],c=remap[I0[i+2]];if(a!==b&&b!==c&&a!==c)idx.push(a,b,c);}
  return {pos:new Float32Array(np),cls:new Uint8Array(nc),idx:new Uint32Array(idx)};
 }
 function template(){
  if(TPL)return TPL;
  const E=new Emperor(null,0);E.root.visible=false;
  const pose=P();poseCopy(HANG_POSE,pose);pose.rx=.2;E.rootPos.set(0,0,0);E.applyPose(pose);E.root.updateMatrixWorld(true);
  const ap=attachPoint(E,V3()),keyOf=new Map();for(const k in E.M)if(E.M[k])keyOf.set(E.M[k],k);
  const skip=new Set([E.crown,E.halo&&E.halo.root,E.tablet,E.tabletMesh].filter(Boolean));
  const raw={},v=V3();
  E.root.traverse(o=>{
   if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;
   for(let n=o;n&&n!==E.root.parent;n=n.parent)if(!n.visible&&n!==E.root||skip.has(n))return;
   const mat=Array.isArray(o.material)?o.material[0]:o.material;if(!mat||!mat.isMeshStandardMaterial||mat.transparent)return;
   const key=keyOf.get(mat);let cls=CLS[key];if(cls==null)cls=OTHER;
   let seg=E.segOf(o);if(seg==='jaw')seg='head';if(/^(pelvis|spine|chest|neck)$/.test(seg))seg='torso';
   const part=raw[seg]||(raw[seg]={pos:[],cls:[],idx:[]}),g=o.geometry,A=g.attributes.position,base=part.cls.length;
   const front=key==='belly'||key==='chest';
   for(let i=0;i<A.count;i++){v.fromBufferAttribute(A,i).applyMatrix4(o.matrixWorld).sub(ap);part.pos.push(v.x,v.y,v.z);
    // 앞섶 가운데(셔츠가 보이는 자리)
    part.cls.push(front&&Math.abs(v.x)<.06&&v.z>.2?SHIRT:cls);}
   if(g.index){const ia=g.index.array;for(let i=0;i<ia.length;i++)part.idx.push(ia[i]+base);}
   else for(let i=0;i<A.count;i++)part.idx.push(base+i);
  });
  const parts={};let tris=0;
  for(const k in raw){parts[k]=clusterPart(raw[k].pos,raw[k].cls,raw[k].idx,k==='head'?.028:.04);tris+=parts[k].idx.length/3;}
  const joint={};for(const k in E.bones){E.bones[k].getWorldPosition(v);joint[k]=v.clone().sub(ap);}
  E.destroy();
  return TPL={parts,joint,tris};
 }
 function palette(look){
  const o=OUTFITS[look%OUTFITS.length];
  return [dimColor(o.cloth[1],.74,.25),dimColor(o.cloth[0],.74,.25),dimColor(o.inside,.8,.2),dimColor(o.shirt,.62,.3),dimColor('#a3322c',.7,.3),dimColor(o.pants,.85,.15),
   dimColor('#dcc3b4',.74,.3),col('#131316'),dimColor('#d8cfbb',.66,.2),dimColor(o.gold,.62,.3),col('#17120f'),col('#17348c'),dimColor('#8f8a80',.6,.3)];
 }
 function proxyBody(it){
  const T=template(),pal=palette(it.look),r=rng(it.seed*7919+it.ord*131+7),use=['torso'],caps=[];
  const chain=(names,sfx,f,rad)=>{const n=f>=1?5:f>=.85?4:f>=.6?3:f>=.4?2:f>=.15?1:0;
   for(let i=0;i<n;i++)use.push(names[i]+sfx);
   if(n<5){const a=T.joint[names[n]+sfx],b=T.joint[names[Math.max(0,n-1)]+sfx];caps.push({p:n?a:a.clone(),r:rad*(n>2?.75:1),d:n?a.clone().sub(b).normalize():V3(0,-1,0)});}};
  chain(ARM,'L',it.limbs[0],.07);chain(ARM,'R',it.limbs[1],.07);
  // 허리가 끊긴 몸: 다리 없이, 몸통도 허리선 위만 남긴다
  let wUp=null,wP=null;
  if(it.waist){wUp=T.joint.chest.clone().sub(T.joint.spine).normalize();wP=T.joint.spine.clone().addScaledVector(wUp,WAIST_Y);
   caps.push({p:wP.clone().add(V3(0,0,.05)),r:.3,d:wUp.clone().negate(),flat:true});}
  else{chain(LEG,'L',it.limbs[2],.1);chain(LEG,'R',it.limbs[3],.1);}
  if(it.head===1)use.push('head');else{const up=T.joint.head.clone().sub(T.joint.neck).normalize();caps.push({p:T.joint.head.clone().addScaledVector(up,.035),r:.1,d:up,neck:true});}
  let nv=0,ni=0;const list=use.map(k=>T.parts[k]).filter(Boolean);for(const p of list){nv+=p.cls.length;ni+=p.idx.length;}
  const pos=new Float32Array(nv*3),colA=new Float32Array(nv*3),idx=new Uint32Array(ni);let vo=0,io=0;
  // 흘러내린 피: 몸통 겉면의 몇 군데를 아래로 길게 물들인다(갈고리 박힌 등은 늘 젖어 있다)
  const stains=[{x:0,y:-.02,z:-.02,r:.13}];
  for(let i=0,n=2+Math.floor(r()*3);i<n;i++)stains.push({x:lerp(-.26,.26,r()),y:lerp(-.5,.02,r()),z:lerp(.25,.5,r()),r:lerp(.045,.085,r())});
  for(const c of caps)if(!c.flat)stains.push({x:c.p.x,y:c.p.y,z:c.p.z,r:c.r*(c.neck?1.7:1.25),round:true});
  for(const p of list){
   pos.set(p.pos,vo*3);
   for(let i=0;i<p.cls.length;i++){
    const x=p.pos[i*3],y=p.pos[i*3+1],z=p.pos[i*3+2];let c=pal[p.cls[i]];
    // 허리 단면 둘레는 피에 젖어 있다
    if(wUp&&p===T.parts.torso&&(x-wP.x)*wUp.x+(y-wP.y)*wUp.y+(z-wP.z)*wUp.z<.045)c=pal[BLOODC];
    else for(const s of stains){const dy=y-s.y,dx=x-s.x,dz=z-s.z,d=s.round?dx*dx+dy*dy+dz*dz:dx*dx+dz*dz*.5+(dy>0?dy*dy*6:dy*dy*.05);if(d<s.r*s.r){c=pal[BLOODC];break;}}
    colA[(vo+i)*3]=c.r;colA[(vo+i)*3+1]=c.g;colA[(vo+i)*3+2]=c.b;
   }
   if(wUp&&p===T.parts.torso){
    // 세 꼭짓점이 모두 허리선 아래인 삼각형은 버린다
    const up=i=>(p.pos[i*3]-wP.x)*wUp.x+(p.pos[i*3+1]-wP.y)*wUp.y+(p.pos[i*3+2]-wP.z)*wUp.z>-.01;
    for(let i=0;i<p.idx.length;i+=3){const a=p.idx[i],b=p.idx[i+1],c=p.idx[i+2];if(up(a)||up(b)||up(c)){idx[io++]=a+vo;idx[io++]=b+vo;idx[io++]=c+vo;}}
   }else{for(let i=0;i<p.idx.length;i++)idx[io+i]=p.idx[i]+vo;io+=p.idx.length;}
   vo+=p.cls.length;
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(colA,3));geo.setIndex(new THREE.BufferAttribute(io<idx.length?idx.slice(0,io):idx,1));
  geo.computeVertexNormals();geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,proxyMat);mesh.castShadow=false;mesh.receiveShadow=false;
  // 잘린 자리의 단면
  for(const c of caps){const m=mk(sg(10),capMat,mesh,{p:[c.p.x,c.p.y,c.p.z],s:[c.r,c.r*(c.flat?.12:.45),c.r],cast:false,receive:false});m.quaternion.setFromUnitVectors(UP,c.d);}
  return mesh;
 }
 function proxyHead(seed){
  // 실제 머리와 같은 빚은 지오메트리(두개골·귀·뒷머리)를 쓰고, 감은 눈·눈썹·콧수염·벌어진 입만 얹는다
  const r=rng(seed*31+5),HG=HEADGEO.build(),skin=dimColor('#e2b9a0',.86,.3),hair=col('#17120f'),blood=col('#16328a'),dark=col('#120d0d');
  for(const g of [HG.head,HG.hair,HG.ear])GEO_SHARED.add(g);
  const open=r()*.6;
  return bake(add=>{
   add(HG.head,skin,[0,.215,0]);
   add(HG.hair,hair,[0,.215,0]);
   add(HG.ear,skin,[.2,.237,-.012]);
   {const e=HG.ear.clone();mirrorX(e);add(e,skin,[-.2,.237,-.012]);}
   for(const sd of [-1,1]){
    add(sg(10),dark,[sd*.076,.266,.17],[.036,.007+open*.004,.016],[0,sd*.12,sd*.06]);
    add(sg(10),hair,[sd*.08,.312,.178],[.05,.011,.014],[0,sd*.2,-sd*(.12+r()*.2)]);
    add(sg(10),hair,[sd*.05,.158,.225],[.06,.017,.016],[0,sd*.3,-sd*.5]);
   }
   add(sg(10),dark,[0,.128,.2],[.045,.012+open*.02,.02]);
   add(sg(8),blood,[rnd(-.03,.03),.1,.19],[.016,.05,.012]);
   add(cylGeo(.082,.07,.05,12),blood,[0,.018,-.012]);
  });
 }

 /* ---- 본뜨기: 걸린 몸·잘린 조각을 '그 순간 그 모습 그대로' 굳힌다 ----
  * 실제 몸은 메시 170개·삼각형 20만 개에 재질·텍스처가 따로 붙어 있어 여러 구를 그대로 두기엔 무겁다.
  * 그래서 그 몸의 모든 메시(상처로 찌그러진 살, 잘린 단면, 묻은 피까지)를 지금 자세 그대로 읽어
  * 꼭짓점을 작은 칸으로 묶고, 재질 색 × 텍스처 색을 꼭짓점 색으로 구워 메시 하나로 만든다.
  * 일반 모형으로 갈아 끼우는 게 아니라 같은 몸을 가볍게 만든 것이라 실루엣·상처·잘린 자리·핏자국이 그대로 남는다.
  * 여러 프레임에 나눠 처리하고(프레임당 몇 ms), 결과는 IndexedDB에 넣어 다음에 들어와도 그 모습으로 걸려 있게 한다. */
 const snapMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,side:THREE.DoubleSide});
 const LIN=new Float32Array(256);for(let i=0;i<256;i++)LIN[i]=Math.pow(i/255,2.2);
 const TEXS=new Map();
 function texData(t){
  if(!t||!t.image)return null;
  let d=TEXS.get(t);if(d!==undefined)return d;
  try{const im=t.image,W=Math.min(256,im.width||0),H=Math.min(256,im.height||0);
   if(!W||!H)d=null;
   else{const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,W,H);
    d={w:W,h:H,d:g.getImageData(0,0,W,H).data,flip:t.flipY!==false,srgb:t.encoding===THREE.sRGBEncoding,rx:t.repeat.x,ry:t.repeat.y,ox:t.offset.x,oy:t.offset.y};}
  }catch(_){d=null;}
  TEXS.set(t,d);return d;
 }
 function newJob(src,space,cell,done){
  const meshes=[];
  src.traverse(o=>{
   if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;
   for(let n=o;n;n=n.parent){if(!n.visible)return;if(n===src)break;}
   meshes.push(o);
  });
  return {src,space,cell,done,meshes,i:0,pos:[],col:[],wt:[],idx:[],n:0};
 }
 const _sv=V3();
 function jobMesh(job,o){
  const mat=Array.isArray(o.material)?o.material[0]:o.material;if(!mat||mat.visible===false||!mat.color||!o.parent)return;
  const blood=!!o.userData.bloodOverlay;
  if(mat.blending!==THREE.NormalBlending||mat.colorWrite===false)return;
  if(!blood&&mat.transparent&&mat.opacity<.5)return;
  const f=o.userData.flesh;if(f&&f.bake)try{f.bake();}catch(_){}
  const g=o.geometry,A=g.attributes.position,U=g.attributes.uv,VC=mat.vertexColors?g.attributes.color:null,td=U?texData(mat.map):null,c=mat.color;
  o.updateWorldMatrix(true,false);job.space.updateWorldMatrix(true,false);
  _m.copy(job.space.matrixWorld).invert().multiply(o.matrixWorld);
  const base=job.n,w=blood?4:1,P=job.pos,C=job.col,W=job.wt;
  for(let i=0;i<A.count;i++){
   _sv.fromBufferAttribute(A,i).applyMatrix4(_m);P.push(_sv.x,_sv.y,_sv.z);
   let r=c.r,gg=c.g,b=c.b;
   if(td){
    let u=U.getX(i)*td.rx+td.ox,v=U.getY(i)*td.ry+td.oy;u-=Math.floor(u);v-=Math.floor(v);if(td.flip)v=1-v;
    const k=(Math.min(td.h-1,v*td.h|0)*td.w+Math.min(td.w-1,u*td.w|0))*4,D=td.d;
    if(td.srgb){r*=LIN[D[k]];gg*=LIN[D[k+1]];b*=LIN[D[k+2]];}else{r*=D[k]/255;gg*=D[k+1]/255;b*=D[k+2]/255;}
   }
   if(VC){r*=VC.getX(i);gg*=VC.getY(i);b*=VC.getZ(i);}
   C.push(r,gg,b);W.push(w);
  }
  const I=job.idx;
  if(g.index){const ia=g.index.array;for(let i=0;i<ia.length;i++)I.push(ia[i]+base);}
  else for(let i=0;i+2<A.count;i+=3)I.push(base+i,base+i+1,base+i+2);
  job.n+=A.count;
 }
 // 묶기도 나눠서 한다(한 번에 하면 휴대폰에서 0.1초 넘게 멈춘다). until 시각을 넘기면 멈췄다가 다음 프레임에 이어 한다
 function jobFinish(job,until){
  const F=job.fin||(job.fin={map:new Map(),np:[],nc:[],cnt:[],ws:[],remap:new Uint32Array(job.n),i:0,t:0,out:[]});
  const cell=job.cell,P=job.pos,C=job.col,W=job.wt,n=job.n,{map,np,nc,cnt,ws,remap}=F;
  while(F.i<n){
   const i=F.i++,x=P[i*3],y=P[i*3+1],z=P[i*3+2];
   const k=((Math.round(x/cell)+2048)*4096+(Math.round(y/cell)+2048))*4096+(Math.round(z/cell)+2048);
   let j=map.get(k);if(j===undefined){j=cnt.length;map.set(k,j);np.push(0,0,0);nc.push(0,0,0);cnt.push(0);ws.push(0);}
   const w=W[i];np[j*3]+=x;np[j*3+1]+=y;np[j*3+2]+=z;nc[j*3]+=C[i*3]*w;nc[j*3+1]+=C[i*3+1]*w;nc[j*3+2]+=C[i*3+2]*w;cnt[j]++;ws[j]+=w;remap[i]=j;
   if(!(i&2047)&&performance.now()>until)return null;
  }
  const I=job.idx,out=F.out;
  while(F.t<I.length){
   const t=F.t;F.t+=3;const a=remap[I[t]],b=remap[I[t+1]],c=remap[I[t+2]];if(a!==b&&b!==c&&a!==c)out.push(a,b,c);
   if(!(t&4095)&&performance.now()>until)return null;
  }
  const m=cnt.length,pos=new Float32Array(m*3),col=new Uint8Array(m*3);
  for(let j=0;j<m;j++)for(let a=0;a<3;a++){pos[j*3+a]=np[j*3+a]/cnt[j];col[j*3+a]=Math.round(255*clamp(nc[j*3+a]/ws[j],0,1));}
  job.fin=null;job.pos=job.col=job.wt=job.idx=null;TEXS.clear();
  return {p:pos,c:col,i:new Uint32Array(out)};
 }
 function snapMesh(sn){
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(sn.p,3));geo.setAttribute('color',new THREE.BufferAttribute(sn.c,3,true));geo.setIndex(new THREE.BufferAttribute(sn.i,1));
  geo.computeVertexNormals();geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,snapMat);mesh.castShadow=false;mesh.receiveShadow=false;return mesh;
 }
 const validSnap=sn=>!!sn&&sn.p instanceof Float32Array&&sn.c instanceof Uint8Array&&sn.i instanceof Uint32Array&&sn.p.length===sn.c.length&&sn.p.length>=9&&sn.i.length>=3;
 // 한 번에 끝까지(나갈 때·급할 때)
 function jobRun(job){while(job.i<job.meshes.length)jobMesh(job,job.meshes[job.i++]);const r=job.n?jobFinish(job,Infinity):null;job.finished=true;if(job.done)job.done(r);return r;}
 function stepJobs(ms){
  const until=performance.now()+ms;
  while(S.jobs.length&&performance.now()<until){
   const job=S.jobs[0];
   if(job.cancel){S.jobs.shift();continue;}
   if(job.i<job.meshes.length){jobMesh(job,job.meshes[job.i++]);continue;}
   const r=job.n?jobFinish(job,until):{};
   if(r===null)break; // 다음 프레임에 이어서
   S.jobs.shift();job.finished=true;if(job.done)job.done(job.n?r:null);
  }
 }
 const snapCell=()=>(MOBILE_GPU||lite()>0)?.028:.021;
 /* 저장: 본뜬 몸·조각은 IndexedDB에 둔다(없거나 막혀 있으면 이번 판에서만 유지) */
 const DB=(()=>{
  let pr=null;
  const open=()=>pr||(pr=new Promise(res=>{try{const r=indexedDB.open('palja-free',1);r.onupgradeneeded=()=>{try{r.result.createObjectStore('snap');}catch(_){}};r.onsuccess=()=>res(r.result);r.onerror=r.onblocked=()=>res(null);}catch(_){res(null);}}));
  const tx=(mode,fn)=>open().then(db=>db?new Promise(res=>{try{const t=db.transaction('snap',mode),rq=fn(t.objectStore('snap'));t.oncomplete=()=>res(rq?rq.result:null);t.onerror=t.onabort=()=>res(null);}catch(_){res(null);}}):null);
  return {put:(k,v)=>tx('readwrite',st=>st.put(v,k)),get:k=>tx('readonly',st=>st.get(k)),del:k=>tx('readwrite',st=>st.delete(k))};
 })();
 function disposeTree(obj){
  const shared=new Set(Object.values(GEO));
  obj.traverse(o=>{if(o.geometry&&!shared.has(o.geometry)&&!(o.geometry.userData&&o.geometry.userData.shared))o.geometry.dispose();});
 }
 function releaseObj(obj,owner){
  obj.removeFromParent();
  if(owner&&!owner._hungGone){try{BLOOD.forgetTree(obj);owner.releaseLoose(obj,owner.looseMaterials(obj));return;}catch(_){}}
  disposeTree(obj);
 }

 /* ---- 무더기: 잘린 부위는 사라지지 않고 뒤쪽 양옆에 쌓인다 ---- */
 const HEAP_STORE='palja.heap',HEAP_MAX=70,HEAP_C=[1.0,-2.7];
 const HEAP={list:[],fly:[],wait:[],seq:0};
 function saveHeap(){try{localStorage.setItem(HEAP_STORE,JSON.stringify({q:HEAP.seq,l:HEAP.list.map(h=>[h.id,h.side])}));}catch(_){}}
 function heapSpot(side){
  const n=HEAP.list.filter(h=>h.side===side).length+HEAP.fly.filter(f=>f.side===side).length+HEAP.wait.filter(f=>f.side===side).length;
  const a=rnd(0,TAU),r=.44*Math.sqrt(Math.random()),top=.55*(1-Math.exp(-n/11));
  return V3(side*HEAP_C[0]+Math.cos(a)*r,.07+top*Math.max(0,1-r/.5),HEAP_C[1]+Math.sin(a)*r*.8);
 }
 function heapAdd(id,side,sn){
  const mesh=snapMesh(sn);root.add(mesh);HEAP.list.push({id,side,mesh});
  while(HEAP.list.length>HEAP_MAX){const o=HEAP.list.shift();o.mesh.removeFromParent();o.mesh.geometry.dispose();DB.del('h'+o.id);}
 }
 // 바닥의 조각 하나를 무더기로 던진다
 function toHeap(owner,b,delay=0){
  if(!S.on||!b||!b.obj||!b.obj.parent)return false;
  owner.bits=(owner.bits||[]).filter(x=>x!==b);
  for(const key of ['severed','severedHeads','headPieces','looseEyes'])if(owner[key])owner[key]=owner[key].filter(o=>o!==b.obj);
  b.twitch=null;b.bleed=null;
  const p=b.obj.position,side=Math.abs(p.x)>.15?Math.sign(p.x):(HEAP.seq+HEAP.fly.length)%2?1:-1;
  for(let i=S.slides.length-1;i>=0;i--)if(S.slides[i].obj===b.obj)S.slides.splice(i,1);
  HEAP.fly.push({obj:b.obj,owner,side,t:-delay,dur:rnd(.5,.7),from:p.clone(),to:heapSpot(side),q0:b.obj.quaternion.clone(),
   q1:new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(-1.2,1.2),rnd(0,TAU),rnd(-1.4,1.4))),big:b.r>.1});
  return true;
 }
 // 한 몸에서 여섯 조각이 넘게 떨어져 나오면 가장 오래된 것부터 무더기로 보낸다(본편에서는 그냥 사라지던 것)
 function overflow(owner,obj){
  if(!S.on||!owner.keepBits)return false;
  const b=(owner.bits||[]).find(x=>x.obj===obj);
  return b?toHeap(owner,b,0):false;
 }
 function heapLand(f){
  f.obj.position.copy(f.to);f.obj.quaternion.copy(f.q1);
  const id=++HEAP.seq,w={obj:f.obj,owner:f.owner,side:f.side,id,job:null};
  w.job=newJob(f.obj,root,(MOBILE_GPU||lite()>0)?.034:.027,sn=>{
   const k=HEAP.wait.indexOf(w);if(k>=0)HEAP.wait.splice(k,1);
   releaseObj(w.obj,w.owner);
   if(validSnap(sn)){heapAdd(id,w.side,sn);DB.put('h'+id,sn);saveHeap();}
  });
  HEAP.wait.push(w);S.jobs.unshift(w.job);
 }
 function updateHeap(dt){
  for(let i=HEAP.fly.length-1;i>=0;i--){
   const f=HEAP.fly[i];if(!f.obj.parent){HEAP.fly.splice(i,1);continue;}
   f.t+=dt;if(f.t<0)continue;
   if(!f.go){f.go=true;AUDIO.whoosh(f.big?.9:.6,'hook');}
   const u=clamp(f.t/f.dur,0,1);
   f.obj.position.lerpVectors(f.from,f.to,u);f.obj.position.y+=Math.sin(u*PI)*(f.big?1.0:1.35);
   f.obj.quaternion.copy(f.q0).slerp(f.q1,u);
   if(u>=1){HEAP.fly.splice(i,1);heapLand(f);AUDIO.slap(f.big?.8:.45,f.side*.5);if(f.big)AUDIO.squelch(.6);
    if(PREF.blood)BLOOD.spray(f.to,UP,f.big?10:5,{min:.4,max:1.4,spread:1.2});}
  }
 }
 // 나가거나 다시 시작할 때: 날아가는 중이거나 아직 굳히지 않은 조각을 그 자리에서 마저 굳혀 남긴다
 function flushHeap(){
  for(const f of HEAP.fly.splice(0)){if(f.obj.parent)heapLand(f);}
  for(const w of HEAP.wait.slice()){const k=S.jobs.indexOf(w.job);if(k>=0)S.jobs.splice(k,1);jobRun(w.job);}
 }
 function clearHeap(){
  for(const h of HEAP.list){h.mesh.removeFromParent();h.mesh.geometry.dispose();}
  HEAP.list.length=0;HEAP.fly.length=0;HEAP.wait.length=0;
 }
 function loadHeap(){
  let rec=null;try{rec=JSON.parse(localStorage.getItem(HEAP_STORE)||'null');}catch(_){}
  if(!rec||!Array.isArray(rec.l))return;
  HEAP.seq=Math.max(HEAP.seq,Number.isSafeInteger(rec.q)?rec.q:0);
  const gen=S.gen;
  for(const e of rec.l.slice(-HEAP_MAX)){
   if(!Array.isArray(e)||!Number.isSafeInteger(e[0]))continue;
   const id=e[0],side=e[1]<0?-1:1;HEAP.seq=Math.max(HEAP.seq,id);
   DB.get('h'+id).then(sn=>{if(gen!==S.gen||!S.on||!validSnap(sn)||HEAP.list.some(h=>h.id===id))return;heapAdd(id,side,sn);HEAP.list.sort((a,b)=>a.id-b.id);});
  }
 }

 /* ---- 걸이(레일 바퀴 + 사슬 + 갈고리). 원점은 레일에 닿는 바퀴, 몸은 drop 밑에 매달린다 ---- */
 function makeHolder(){
  const h=new THREE.Group(),drop=grp(h,[0,-CHAIN,0]);
  mk(GEOS.trolley,ironD,h,{p:[0,.03,0],cast:false});
  mk(GEOS.chain,iron,h,{p:[0,-CHAIN/2,0],cast:false});
  const hk=grp(drop,[0,0,-.05]);
  mk(GEOS.shank,iron,hk,{p:[0,.05,0],cast:false});
  mk(GEOS.hook,iron,hk,{p:[0,-.058,.058],r:[0,-PI/2,-PI*.5],cast:false});
  mk(GEOS.tip,iron,hk,{p:[0,-.03,.132],r:[-.5,0,0],cast:false});
  h.userData.drop=drop;h.userData.hook=hk;
  if(lite()<2)metalEnv(h);
  return h;
 }
 function attachPoint(E,out){const c=E.bones.chest;c.updateWorldMatrix(true,false);return c.localToWorld(out.set(0,.13,-.2));}
 function limbFracs(E){
  const B=E.bones,cut=o=>!o||!!o.userData.detached||!o.parent;
  const frac=chain=>{const f=[0,.15,.4,.6,.85];for(let i=0;i<chain.length;i++)if(cut(chain[i]))return f[i];return 1;};
  return [...E.arms.map(a=>frac([a.sh,B['uarmMid'+a.nm],a.el,B['farmMid'+a.nm],a.wr])),...E.legs.map(l=>frac([l.hip,l.tm,l.knee,l.sm,l.ank]))];
 }
 // 걸린 몸은 피가 빠져 창백하고 어둡다(살아 있는 놈과 섞여 보이지 않게)
 function dimBody(E){
  for(const k in E.M){const m=E.M[k];if(!m||!m.color||m.userData.hungDim)continue;m.userData.hungDim=true;
   const c=m.color,l=c.r*.3+c.g*.59+c.b*.11;c.setRGB(lerp(c.r,l,.3)*.66,lerp(c.g,l,.3)*.68,lerp(c.b,l,.3)*.72);
   if(m.emissive&&m.emissiveIntensity)m.emissiveIntensity*=.25;}
 }
 // 실제 몸은 삼각형 20만 개·메시 170개짜리라 휴대폰에서는 가장 최근 한 구만 남긴다
 const realCap=()=>(MOBILE_GPU||lite()>0)?1:3;
 // 걸린 몸 본뜨기를 예약한다(레일에서 멈춘 뒤, 싸우는 동안 조금씩)
 function startSnap(it){
  if(!it.real||it.snap||it.job)return;
  it.job=newJob(it.real.root,it.holder.userData.drop,snapCell(),sn=>{it.job=null;if(validSnap(sn)){it.snap=sn;DB.put('b'+it.ord,sn);}});
  S.jobs.push(it.job);
 }
 function finishSnap(it){
  if(!it.real||it.snap)return;
  if(!it.job)startSnap(it);
  const job=it.job,k=S.jobs.indexOf(job);if(k>=0)S.jobs.splice(k,1);
  jobRun(job);
 }
 function gone(old){
  old._hungGone=true;
  for(const hd of S.heads)if(hd.owner===old)hd.owner=null;
 }
 // 실제 몸을 내리고, 같은 몸을 본뜬 가벼운 것으로 바꿔 건다(없으면 일반 모형)
 function toProxy(it){
  if(!it.real)return;
  finishSnap(it);
  const old=it.real;it.real=null;gone(old);
  old.clearBodyBits();for(const b of (old.bits||[]).slice())old.retireBit(b);old.bits=[];
  old.destroy();
  it.proxy=null;ensureMesh(it);
 }
 function trimReals(){
  const reals=S.items.filter(it=>it.real);
  while(reals.length>realCap())toProxy(reals.shift());
 }
 function disposeItem(it){
  if(it.job){it.job.cancel=true;it.job=null;}
  if(it.real){const old=it.real;it.real=null;gone(old);old.clearBodyBits();for(const b of (old.bits||[]).slice())old.retireBit(b);old.bits=[];old.destroy();}
  if(it.proxy){it.proxy.removeFromParent();it.proxy.geometry.dispose();it.proxy=null;}
  it.holder.removeFromParent();it.pool.removeFromParent();
 }

 /* ---- 줄 세우기 ---- */
 function slot(line,k,out){return out.set(ROWX[line],RAIL_Y,ROW_Z0-k*ROW_DZ);}
 // 가까운 몇 칸만 자세한 모습, 그 뒤는 같은 몸을 더 성기게 묶은 것(멀어서 차이가 안 보인다)
 const nearK=()=>(MOBILE_GPU||lite()>0)?3:6;
 function layoutLine(line,instant){
  const arr=S.lines[line];
  while(arr.length>ROW_CAP){const it=arr.pop();const i=S.items.indexOf(it);if(i>=0)S.items.splice(i,1);dropHeadOf(it);disposeItem(it);DB.del('b'+it.ord);}
  arr.forEach((it,k)=>{slot(line,k,it.pos);it.k=k;if(instant){it.cur.copy(it.pos);it.holder.position.copy(it.cur);}});
 }
 // 걸린 몸의 겉모습을 만든다: 가까우면 굳힌 그 모습(없으면 일반 모형), 멀면 그것을 성기게 다시 묶은 것
 function reCluster(P,C,I,cell,f255){
  const map=new Map(),np=[],nc=[],cnt=[],n=P.length/3,remap=new Uint32Array(n);
  for(let i=0;i<n;i++){
   const k=((Math.round(P[i*3]/cell)+2048)*4096+(Math.round(P[i*3+1]/cell)+2048))*4096+(Math.round(P[i*3+2]/cell)+2048);
   let j=map.get(k);if(j===undefined){j=cnt.length;map.set(k,j);np.push(0,0,0);nc.push(0,0,0);cnt.push(0);}
   for(let a=0;a<3;a++){np[j*3+a]+=P[i*3+a];nc[j*3+a]+=C[i*3+a];}cnt[j]++;remap[i]=j;
  }
  const m=cnt.length,pos=new Float32Array(m*3),colr=new Uint8Array(m*3),out=[];
  for(let j=0;j<m;j++)for(let a=0;a<3;a++){pos[j*3+a]=np[j*3+a]/cnt[j];colr[j*3+a]=Math.round(clamp(nc[j*3+a]/cnt[j]*f255,0,255));}
  for(let i=0;i<I.length;i+=3){const a=remap[I[i]],b=remap[I[i+1]],c=remap[I[i+2]];if(a!==b&&b!==c&&a!==c)out.push(a,b,c);}
  return {p:pos,c:colr,i:new Uint32Array(out)};
 }
 function dropMesh(it){if(it.proxy){it.proxy.removeFromParent();it.proxy.geometry.dispose();it.proxy=null;}}
 function ensureMesh(it){
  if(it.real)return;
  const fine=it.k<nearK();
  if(it.proxy&&(it.fine===fine||!it.fine))return; // 성긴 것은 다시 자세하게 만들지 않는다(줄은 안쪽으로만 밀린다)
  dropMesh(it);
  if(fine)it.proxy=it.snap?snapMesh(it.snap):proxyBody(it);
  else if(it.snap)it.proxy=snapMesh(reCluster(it.snap.p,it.snap.c,it.snap.i,it.k<12?.06:.09,1));
  else{const t=proxyBody(it),g=t.geometry;it.proxy=snapMesh(reCluster(g.attributes.position.array,g.attributes.color.array,g.index.array,it.k<12?.06:.09,255));g.dispose();}
  it.fine=fine;it.holder.userData.drop.add(it.proxy);
 }
 function newItem(ord,look,seed,limbs,head){
  const holder=makeHolder(),pool=mk(GEOS.pool,poolMat,root,{r:[-PI/2,0,0],cast:false,receive:false});
  pool.renderOrder=1;pool.visible=false;root.add(holder);
  return {ord,look,seed,limbs,head,line:ord%ROWX.length,k:0,holder,pool,real:null,proxy:null,free:false,moving:false,
   pos:V3(),cur:V3(),swx:new Spring(15,1.5),swz:new Spring(15,1.5),ph:(seed%628)/100,poolK:0,fine:false,ready:true};
 }

 /* ---- 머리 꼬챙이 ---- */
 function placeHead(hd){
  const [x,y,z]=SPIKES[hd.idx];
  hd.obj.position.set(x,y-.075,z);
  hd.obj.rotation.set(hd.rx,hd.ry,hd.rz);
  spikeMesh[hd.idx].visible=true;
 }
 function freeSpike(){
  const used=new Set(S.heads.map(h=>h.idx));
  for(let i=0;i<SPIKES.length;i++)if(!used.has(i))return i;
  // 다 찼으면 가장 오래된 머리를 내린다
  const old=S.heads.shift();removeHead(old);return old.idx;
 }
 function removeHead(hd){
  if(hd.proxy){hd.obj.removeFromParent();hd.obj.geometry.dispose();}
  else releaseObj(hd.obj,hd.owner);
 }
 function dropHeadOf(it){
  for(let i=S.heads.length-1;i>=0;i--)if(S.heads[i].item===it){const hd=S.heads[i];S.heads.splice(i,1);removeHead(hd);if(!S.heads.some(h=>h.idx===hd.idx))spikeMesh[hd.idx].visible=false;}
 }
 function addHead(it,obj,owner){
  const r=rng(it.seed+97),idx=freeSpike();
  const hd={item:it,idx,proxy:!obj,owner:owner||null,obj:obj||proxyHead(it.seed),rx:lerp(-.16,.12,r()),ry:lerp(-.45,.45,r()),rz:lerp(-.22,.22,r()),fly:null};
  if(obj)scene.attach(obj);else root.add(hd.obj);
  S.heads.push(hd);return hd;
 }

 /* ---- 켜고 끄기 ---- */
 function clearAll(){
  S.gen++;
  // 아직 본뜨지 못한 실제 몸과 조각은 나가기 전에 마저 굳혀 저장한다(다음에 그 모습 그대로 걸려 있게)
  if(S.on){for(const it of S.items)if(it.real&&!it.snap)try{finishSnap(it);}catch(_){}
   try{flushHeap();}catch(_){}}
  for(const j of S.jobs)j.cancel=true;S.jobs.length=0;
  clearHeap();
  for(const hd of S.heads)removeHead(hd);S.heads.length=0;
  for(const m of spikeMesh)m.visible=false;
  for(const it of S.items)disposeItem(it);
  S.items.length=0;for(const l of S.lines)l.length=0;
  if(S.seq&&S.seq.holder&&!S.seq.item)S.seq.holder.removeFromParent();
  S.seq=null;S.reviving=false;S.railDrop=null;S.slides.length=0;
 }
 function begin(){
  clearAll();
  const rec=loadRecord();S.total=rec.n;
  const gen=S.gen;
  rec.list.forEach((e,i)=>{
   const ord=S.total-rec.list.length+i,it=newItem(ord,e.l,e.s,e.p,e.h);it.waist=!!e.w;it.poolK=1;it.ready=false;
   S.items.push(it);S.lines[it.line].unshift(it);
   if(e.h===2)placeHead(addHead(it,null,null));
   // 저장해 둔 그 몸의 본을 읽는다(있으면 그 모습으로, 없으면 일반 모형으로 건다)
   DB.get('b'+ord).then(sn=>{if(gen!==S.gen)return;if(validSnap(sn))it.snap=sn;it.ready=true;});
  });
  for(let l=0;l<ROWX.length;l++)layoutLine(l,true);
  S.on=true;root.visible=true;loadHeap();S.railsOn=S.items.length>0;rails.visible=S.railsOn;rails.position.y=0;
  S.ui='';S.tool='';syncUI();
 }
 function suspend(){
  if(!S.on&&!S.items.length)return;
  clearAll();S.on=false;root.visible=false;stage(false);
  $('#freeBar').hidden=true;$('#freeCount').hidden=true;S.ui='';
 }

 /* ---- 「되살리기」 ---- */
 function canRevive(E){return !!E&&((E.regrowQ&&E.regrowQ.some(r=>!r.built))||(E.regrowHead&&!E.regrowHead.built));}
 function revive(){
  const E=G.E;if(!S.on||S.seq||G.inputLocked||G.paused||!canRevive(E)||S.reviving)return false;
  E.holdRegrow=false;S.reviving=true;E.reviveCount=(E.reviveCount||0)+1;E.taunt=false;
  // 곧바로 자라기 시작한다(팔다리마다 조금씩 엇갈려)
  let d=.12;for(const r of E.regrowQ)if(!r.built){r.t=Math.max(r.t,-d);d+=.16;}
  if(E.regrowHead&&!E.regrowHead.built)E.regrowHead.t=Math.max(E.regrowHead.t,-.1);
  // 여러 번 되살릴수록 버틸 힘이 줄어 더 빨리 무너진다
  const cap=Math.max(FREE_FLOOR+2,36-10*E.reviveCount);
  if(G.bar>cap){G.bar=G.shown=G.lag=cap;}
  if(E.phase<3)E.setPhase(3);
  if(E.combat)E.combat.setPoise(lerp(.55,1,clamp(G.bar/100,0,1)));
  AUDIO.boneOut(1);AUDIO.squelch(.8);
  if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([20,30,20]);}catch(_){}
  hint('다시 자라는 중 · 그대로 계속 족쳐도 됩니다',2.6);
  return true;
 }
 // 되살린 놈은 내 손이 올라가기만 해도 움찔하며 얼굴을 가린다
 function flinch(){
  const E=G.E;if(!S.on||!E||!(E.reviveCount>0)||!combatActive(E)||E.combat.mode!=='stand'||E.guardCool>0||E.tabletHeld||E.headDestroyed)return;
  E.guardHold=Math.max(E.guardHold,.8);E.doFlinch('shock',.7);E.panic=Math.max(E.panic,.6);
 }
 function fear(E,dt){
  const b=E.combat;if(!b||!combatActive(E))return;
  const scared=E.reviveCount>0;
  if(scared){E.taunt=false;if(E.phase<3)E.setPhase(3);
   // 자라는 도중부터 떤다(두 번째 되살림부터)
   if(S.reviving&&E.reviveCount>=2)E.panic=Math.max(E.panic,Math.min(1,.3*E.reviveCount));}
  // 겁먹으면 물러선다: 서 있으면 뒷걸음질, 누워 있으면 등으로 밀며 달아난다(옥좌 앞에서 막힌다)
  if((scared||E.phase>=3)&&!G.inputLocked&&b.z>.88){
   if(b.mode==='stand'&&b.idle>.3)b.vz=Math.min(b.vz,scared?-.55:-.32);
   else if(b.mode==='ground'&&b.idle>.45&&b.idle<1.2)b.vz=Math.min(b.vz,-.3);
  }
 }

 /* ---- 허리 끊기: 식칼로 배를 가로로 길게 다섯 번 그으면 허리가 끊긴다. 아랫도리는 조각으로 떨어지고 윗몸은 살아서 계속 맞는다 ---- */
 const WAIST_CUTS=5,WAIST_Y=.09;
 function waistSlash(info,extra){
  const E=G.E;if(!S.on||!E||E.bisected||E.hang||!combatActive(E)||!info||!extra||!extra.slashFrom||info.part!=='belly')return;
  const sp=E.bones.spine;sp.updateWorldMatrix(true,false);
  const a=sp.worldToLocal(extra.slashFrom.clone()),b=sp.worldToLocal(info.point.clone());
  if(b.y<-.16||b.y>.4)return;
  const dx=Math.abs(b.x-a.x),dy=Math.abs(b.y-a.y);if(dx<dy*1.2)return;
  // 한 번 긋는 동안 배 위를 가로로 지나간 길이를 모은다. 배 너비의 절반쯤 지나가야 한 번으로 친다
  const id=extra.strokeId==null?-1:extra.strokeId;
  const w=E.waist||(E.waist={n:0,id:null,len:0,done:false});
  if(w.id!==id){w.id=id;w.len=0;w.done=false;}
  if(w.done)return;
  w.len+=dx;if(w.len<.2)return;
  w.done=true;w.n++;
  AUDIO.rip(.9);AUDIO.squelch(.7);
  if(PREF.blood)BLOOD.spray(info.point,info.normal,12+w.n*3,{min:1,max:3.2,spread:1});
  E.panic=1;
  if(w.n>=WAIST_CUTS)bisect(E,info);
  else hint('허리 '+w.n+'/'+WAIST_CUTS+' · 배를 가로로 더 그으면 끊깁니다',1.6);
 }
 function bisect(E,info){
  const B=E.bones,spine=B.spine,pelvis=B.pelvis,f=E.belly&&E.belly.userData.flesh;
  if(!f||E.bisected)return false;
  spine.updateWorldMatrix(true,true);
  const q=spine.getWorldQuaternion(new THREE.Quaternion()),up=V3(0,1,0).applyQuaternion(q),nW=up.clone().negate();
  const pW=spine.localToWorld(V3(0,WAIST_Y,0));
  // 1) 배 살을 허리선에서 가른다(못 가르면 아무것도 건드리지 않는다)
  const cut=E._planeCut(f,nW,pW);
  if(cut.kind!=='split')return false;
  E.bisected=true;
  const piece=new THREE.Group();piece.position.copy(pW);piece.quaternion.copy(q);piece.userData.detached=true;scene.add(piece);piece.updateMatrixWorld(true);
  piece.attach(cut.piece);
  // 2) 허리선 아래 것들을 조각으로 옮긴다: 골반에 달린 옷자락·다리 전부, 척추에 달린 것 가운데 아래쪽에 있는 것
  BLOOD.clearSegment('spine');BLOOD.clearSegment('pelvis');
  const below=o=>{o.updateWorldMatrix(true,false);const c=o.isMesh&&o.geometry?(o.geometry.boundingSphere||(o.geometry.computeBoundingSphere(),o.geometry.boundingSphere)).center.clone().applyMatrix4(o.matrixWorld):o.getWorldPosition(V3());return nW.dot(c.sub(pW))>0;};
  const twitch=[];
  for(const c of pelvis.children.slice()){if(c===spine)continue;E._detachHeadTree(c,piece);}
  for(const c of spine.children.slice()){if(c===E.belly||c===B.chest||c.userData.bone)continue;if(below(c))E._detachHeadTree(c,piece);}
  for(const c of E.belly.children.slice()){if(below(c))E._detachHeadTree(c,piece);}
  piece.traverse(o=>{const bn=o.userData.bone;if(bn&&/^(hip|knee)/.test(bn))twitch.push({o,ax:'x',k:bn.startsWith('knee')?1:-1,f:rnd(6,10),a:rnd(.3,.55)});});
  for(const t of twitch){t.b=t.o.rotation[t.ax];t.ph=rnd(0,TAU);}
  for(const l of E.legs)E.detached.add(l.hip.userData.bone||('hip'+l.nm));
  // 3) 단면: 윗몸 아래쪽과 아랫도리 위쪽
  const capPos=V3(0,WAIST_Y,.055),R=.305;
  try{
   E.makeCutCap(spine,capPos,new THREE.Quaternion(),R,false,E.M.robe,false,.004,false);
   E.makeCutCap(piece,V3(0,0,.055),new THREE.Quaternion(),R,true,E.M.robe,false,.004,false);
  }catch(_){}
  // 4) 아랫도리는 바닥에 남는 조각. 다리는 한동안 버둥댄다
  const d=info&&info.dir?info.dir:V3(0,0,-1);
  E.bits=E.bits||[];
  // 아랫도리는 옆으로 나가떨어진다(카메라 앞에 남으면 윗몸을 가린다)
  const sd=(Math.abs(d.x)>.25?Math.sign(d.x):(Math.random()<.5?-1:1));
  E.bits.push({obj:piece,body:true,v:V3(sd*.6,.5,0),w:V3(rnd(-.6,.6),rnd(-.8,.8),-sd*rnd(1,2)),r:.16,bounce:.08,sound:'limb',corners:E.limbCorners(piece),
   twitch:{list:twitch,t:0,dur:rnd(5,7),hop:rnd(.3,.6)},bleed:{lp:V3(0,.02,.055),ln:V3(0,1,0),t:0,life:12}});
  // 발이 바닥에 닿아 있어 던져도 그 자리에 주저앉는다 → 바닥을 미끄러져 옆으로 밀려나게 직접 옮긴다
  S.slides.push({obj:piece,dx:sd*rnd(1.25,1.5),dz:-rnd(.35,.6),t:0,dur:.6,last:0,spin:-sd*rnd(.5,.9)});
  // 5) 윗몸: 쓰러지고 다시는 못 일어선다
  const b=E.combat;
  if(b){b.canRise=false;if(b.mode!=='ground'&&b.mode!=='fall')b.fall(d.x,-1,1.25);}
  E.taunt=false;if(E.phase<3)E.setPhase(3);
  const body=pW.clone().addScaledVector(nW,.01);
  BLOOD.addWound('spine',body,nW,{rate:.09,tau:70,artery:true,kind:'cut'});
  if(PREF.blood){
   BLOOD.spray(body,nW,44,{min:1.4,max:5,spread:1.3});BLOOD.spray(body,up,26,{min:1.2,max:4,spread:1.2});
   CHUNKS.burst(body,12,nW,.05,'cloth',{speed:2});CHUNKS.burst(body,8,up,.04,'flesh',{speed:1.6});
  }else BLOOD.spray(body,UP,16,{kind:'dust',max:1.5});
  AUDIO.chop(1.3);AUDIO.rip(1.2);AUDIO.squelch(1.1);AUDIO.spurt(1.3);AUDIO.crack(1);
  if(!E.headDestroyed||deityHasReptileVoice(E)){E.setEmotion('shock');E.shockT=1.4;E.voiceCool=0;AUDIO.voice('scream',1.5);}
  E.hitFlash=1;E.panic=1;
  camHit({shake:.065});G.hitstop=Math.max(G.hitstop,.17);G.slow=Math.max(G.slow,.45);flash(.2);
  if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([40,20,70]);}catch(_){}
  hint('허리가 끊겼습니다 · 윗몸은 아직 살아 있습니다',2.4);
  S.ui='';
  return true;
 }

 /* ---- 「새 놈」: 갈고리에 꿰어 걸고, 새 천지신명이 걸어 나온다 ---- */
 const T={hook:.2,pierce:.9,release:1.08,shove:1.3,haulDur:.55,walkDelay:.3,walk:1.05,sit:.35};
 function canNext(E){return !!E&&!E.taunt&&!E.hang&&!E.walkIn&&!!E.combat;}
 function next(){
  const E=G.E;if(!S.on||S.seq||G.inputLocked||G.paused||!canNext(E))return false;
  clearCombatAccent();clearTalk();
  G.inputLocked=true;clearPointers();$('#dock').hidden=true;$('#hint').classList.add('off');
  const b=E.combat,from=P();poseCopy(E.pose,from);
  b.locked=true;E._combatScripted=true;b.grab=null;
  E.endAct();E.guardHold=0;E.guard=0;E.releaseIK('L',14);E.releaseIK('R',14);E.taunt=false;
  if(E.tabletHeld)E.dropTablet(V3(rnd(-1.2,1.2),.7,.8));
  E.state='down';E.down={type:'floor',stay:1e9};E.stateT=0;
  E.hang={from,u:0,x:clamp(b.x,-.55,.55),z:clamp(b.z,.95,1.45),lift:.3,sag:0,back:0,swing:0,swingZ:0,kick:E.headDestroyed&&!deityHasReptileVoice(E)?.55:1};
  E.flailSeed=rnd(0,TAU);
  if(!E.headDestroyed||deityHasReptileVoice(E)){E.setEmotion('scared');E.shockT=1.2;AUDIO.voice('yelp',1);}
  S.seq={t:0,speed:S.total>0?1.3:1,old:E,holder:null,item:null,stage:0,sw:new Spring(26,3.2),swz:new Spring(22,3),E:null,cam:0};
  if(!S.railsOn){S.railsOn=true;rails.visible=true;rails.position.y=5.2;S.railDrop={t:0};AUDIO.chain(.9,9,.6);}
  AUDIO.pull(.7);
  S.reviving=false;
  syncUI();
  return true;
 }
 function shoveContact(){
  const q=S.seq;if(!q||q.stage!==2||q.contact!=null)return false;
  q.contact=q.t;AUDIO.slap(.95,.09);AUDIO.hit('hand','hook','chest',1.15,false);AUDIO.chain(.8,5,.3);
  camHit({shake:.022});G.hitstop=Math.max(G.hitstop,.045);
  q.sw.kick(-7.5);q.swz.kick(rnd(-1.6,1.6));
  if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate(22);}catch(_){}
  return true;
 }
 function pierce(q){
  const E=q.old,p=attachPoint(E,_v).clone(),front=E.bones.chest.localToWorld(V3(0,.1,.2));
  AUDIO.hookIn(1.1);AUDIO.spurt(1.1);AUDIO.chain(.7,4,.2);
  if(PREF.blood){
   // 옥좌 쪽(뒤)으로는 뿌리지 않는다: 옥좌에 묻은 자국은 그 앞에 선 몸 위로 비쳐 보인다
   BLOOD.spray(p,V3(rnd(-.5,.5),1,.25).normalize(),26,{min:1.1,max:3.4,spread:1.0});
   BLOOD.spray(front,V3(0,.1,1),14,{min:.8,max:2.4,spread:.8});
   CHUNKS.burst(p,5,V3(0,.4,-1),.035,'cloth',{speed:1.3});
  }else BLOOD.spray(p,UP,10,{kind:'dust',max:1.2});
  E.hitFlash=1;E.sp.chest.kick(5,rnd(-1.5,1.5),rnd(-1.5,1.5));E.sp.spine.kick(3,0,0);E.sp.head.kick(-4,0,0);
  if(!E.headDestroyed||deityHasReptileVoice(E)){E.setEmotion('shock');E.shockT=.9;E.voiceCool=0;AUDIO.voice('scream',1.3);}
  if(E.halo&&E.halo.on&&!E.halo.falling)E.haloDrop();
  camHit({shake:.04});G.hitstop=Math.max(G.hitstop,.09);flash(.14);
  q.sw.kick(3.2);
  if(PREF.vibe&&navigator.vibrate)try{navigator.vibrate([30,20,45]);}catch(_){}
 }
 // 바닥에 떨어진 팔다리·머리·아랫도리를 뒤쪽 무더기로 던진다(족치는 자리를 비운다). 작은 살점 부스러기는 둔다
 function heapBits(E,n0){
  let n=n0;
  const list=(E.bits||[]).filter(b=>!b.dead&&b.body&&b.sound!=='flake'&&b.obj&&b.obj.parent).sort((a,b)=>(b.r||0)-(a.r||0));
  for(const b of list){if(n>=16)break;if(toHeap(E,b,.05+n*.07))n++;}
  return n;
 }
 function handover(q){
  const old=q.old,holder=q.holder,side=Math.sign(ROWX[S.total%ROWX.length]);
  VM.grip(null,null);
  old.endAct();old.hitFlash=old.whiteFlash=old.reviveGlow=0;old.updateMaterials(0);
  if(!old.headGone){old.state='dead';old.shockT=0;old.setEmotion('ko');old.updateFace(1,G.time,true);}
  old.root.updateMatrixWorld(true);holder.updateMatrixWorld(true);holder.userData.drop.attach(old.root);
  old.root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  dimBody(old);
  const it=newItem(S.total,old.lookIndex,(Math.random()*1e9)>>>0,limbFracs(old),old.headGone?0:1);it.waist=!!old.bisected;
  it.holder.removeFromParent();it.holder=holder;it.real=old;it.free=true;it.cur.copy(holder.position);
  // 떨어진 머리(가장 최근 것)는 꼬챙이로
  if(old.headGone){
   const hb=(old.bits||[]).find(b=>!b.dead&&b.sound==='head'&&b.obj&&b.obj.parent&&(old.severedHeads||[]).includes(b.obj));
   if(hb){old.bits=old.bits.filter(b=>b!==hb);old.severedHeads=old.severedHeads.filter(o=>o!==hb.obj);
    const hd=addHead(it,hb.obj,old);it.head=2;
    const [x,y,z]=SPIKES[hd.idx];
    hd.fly={t:0,from:hb.obj.position.clone(),q0:hb.obj.quaternion.clone(),to:V3(x,y-.075,z),q1:new THREE.Quaternion().setFromEuler(new THREE.Euler(hd.rx,hd.ry,hd.rz))};}
  }
  S.total++;S.items.push(it);q.item=it;saveRecord();
  // 바닥 조각은 무더기로
  let n=heapBits(old,0);for(const o of S.items)if(o.real&&o.real!==old)n=heapBits(o.real,n);
  // 새 놈
  const E=new Emperor(G.result,PROGRESS.defeated+S.total);
  E.bloodRawBase=BLOOD.rawLost;E.holdRegrow=E.keepBits=true;E.taunt=true;E.setPhase(0);E.idleT=1e9;E.sobT=1e9;
  wireEmperor(E);G.E=E;BLOOD.handover(E);
  combatInit(E,false);E.combat.locked=true;E._combatScripted=true;
  if(lite()<2){metalEnv(E.root);metalEnv(E.crown);}
  const n3=S.items.length;
  E.walkIn={t:-T.walkDelay,u:0,sit:0,side:-side,from:1.75,z:1.0,stepK:0,phase:0,lookK:0,lookDir:side,frozen:false,
   pause:n3>=3?Math.min(1.15,.3+.1*(n3-2)):0,step:0};
  E.root.visible=false;E.tablet.visible=false;
  poseCopy(STAND,E.pose);E.pose.tx=-side*1.75;E.pose.tz=1.0;E.applyPose(E.pose);
  q.E=E;
  Object.assign(G,{bar:100,shown:100,lag:100,kd:0,lastHit:-99});
  combatVoiceReset();
  q.stage=3;q.haulT=0;q.h0=holder.position.clone();
  AUDIO.chain(1,10,.5);AUDIO.pull(.8);
  trimReals();
 }
 function arrive(q){
  const it=q.item,x=ROWX[it.line];
  if(it.holder.userData.haul){it.holder.userData.haul.removeFromParent();it.holder.userData.haul=null;}
  // 끌려 올라간 몸이 그 줄 레일 맨 앞(카메라 쪽)에서 미끄러져 들어오고, 걸려 있던 몸들은 한 칸씩 안쪽으로 밀린다
  it.free=false;it.cur.set(x,RAIL_Y,2.2);it.holder.position.copy(it.cur);it.holder.rotation.set(0,0,0);
  it.swx.reset(0);it.swz.reset(0);it.swx.kick(3.4);it.swz.kick(rnd(-1,1));it.moving=true;
  S.lines[it.line].unshift(it);layoutLine(it.line,false);
  S.lines[it.line].forEach((o,k)=>{if(o!==it){o.moving=true;if(k<8)o.swx.kick(-(1.8-k*.15));}});
  AUDIO.railRoll(.7,1);
  q.stage=4;
 }
 // 다 걸어 나오면 그 자리에 선다(옥좌는 없다)
 function seat(q){
  const E=q.E;E.walkIn=null;E.tablet.visible=true;
  combatInit(E,false);E.combat.x=0;E.combat.z=1.0;E.idleT=2.2;E.sobT=G.time+3;E.taunt=true;
 }
 function finish(){
  S.seq=null;G.inputLocked=false;$('#dock').hidden=false;
  hint(HINTS[G.tool],3);focusCanvas();syncUI();
 }
 function updateSeq(dt){
  const q=S.seq;if(!q)return;
  q.t+=dt*q.speed;const t=q.t;
  q.cam=Math.min(1,q.cam+dt*2.2);
  if(q.stage<3){
   const E=q.old,h=E.hang;
   h.u=clamp(t/.5,0,1);
   q.sw.step(dt);q.swz.step(dt);h.swing=q.sw.x*.05;h.swingZ=q.swz.x*.05;h.back=Math.max(0,-q.sw.x)*.06;
   E.root.updateMatrixWorld(true);
   if(t<T.release){const c=E.bones.chest.getWorldPosition(_v2).project(camera);VM.grip(clamp(c.x,-.8,.8),clamp(c.y,-.7,.8));}
   else VM.grip(null,null);
   if(t>=T.hook){
    if(!q.holder){q.holder=makeHolder();q.holder.userData.haul=mk(GEOS.haul,iron,q.holder,{p:[0,3.5,0],cast:false});root.add(q.holder);q.stage=1;AUDIO.chain(.8,7,.5);}
    const ap=attachPoint(E,_v),k=easeIn(clamp((t-T.hook)/(T.pierce-T.hook),0,1));
    q.holder.position.set(ap.x,ap.y+CHAIN+(1-k)*3.6,ap.z);
   }
   if(t>=T.pierce&&q.stage<2){q.stage=2;pierce(q);}
   if(q.stage>=2){h.kick=Math.max(0,h.kick-dt*2.4);h.sag=damp(h.sag,.07,9,dt);}
   if(t>=T.shove&&!q.shoved){
    q.shoved=true;
    const c=E.bones.chest.getWorldPosition(_v2).project(camera),L=G.inputLocked;
    G.inputLocked=false;VM.st.acts.length=0;
    const ok=VM.attack('hook',(c.x*.5+.5)*innerWidth,(-c.y*.5+.5)*innerHeight);
    G.inputLocked=L;if(!ok)shoveContact();
   }
   if((q.contact!=null&&t>=q.contact+.2)||t>=T.shove+.65){if(q.contact==null)shoveContact();handover(q);}
   return;
  }
  // 끌려 올라감 → 레일에 걸림
  const it=q.item;
  if(q.stage===3){
   q.haulT+=dt*q.speed;const u=q.haulT/T.haulDur,e=easeIn(u);
   it.cur.set(q.h0.x,q.h0.y+e*5.4,q.h0.z-e*1.6);it.holder.position.copy(it.cur);
   q.sw.step(dt);it.holder.rotation.x=q.sw.x*.05;
   if(u>=1)arrive(q);
  }
  // 새 놈 걸어 나오기
  const E=q.E,w=E.walkIn;
  if(w){
   w.t+=dt*q.speed;
   if(w.t>=0){
    if(!E.root.visible){E.root.visible=true;E.tablet.visible=true;}
    const mid=.5*T.walk,tw=w.t;
    let u;
    if(tw<mid)u=tw/T.walk;else if(tw<mid+w.pause)u=.5;else u=(tw-w.pause)/T.walk;
    w.frozen=w.pause>0&&tw>=mid&&tw<mid+w.pause;
    // 굳는 동안만 고개가 돌아가 있고, 다시 걷기 시작하면 고쳐 든다
    w.lookK=damp(w.lookK,w.frozen?1:0,w.frozen?14:7,dt);
    if(w.frozen&&!w.saw){w.saw=true;E.setEmotion('shock');E.shockT=w.pause/q.speed+.05;if(w.pause>.55)AUDIO.voice('gasp',.5);}
    w.u=clamp(u,0,1);
    const st=Math.floor(w.phase/PI);if(st!==w.step){w.step=st;if(w.stepK>.4)AUDIO.footstep(.7);}
    if(w.u>=1){w.sit=(tw-w.pause-T.walk)/T.sit;if(w.sit>=1)seat(q);}
   }
  }
  if(q.stage===4&&!E.walkIn&&!it.moving)finish();
 }

 function updateItems(dt){
  const time=G.time;
  for(let i=S.slides.length-1;i>=0;i--){
   const sl=S.slides[i];if(!sl.obj.parent){S.slides.splice(i,1);continue;}
   sl.t+=dt/sl.dur;const k=backOut(clamp(sl.t,0,1),.6),d=k-sl.last;sl.last=k;
   sl.obj.position.x+=sl.dx*d;sl.obj.position.z+=sl.dz*d;sl.obj.rotation.y+=sl.spin*d;
   if(sl.t>=1)S.slides.splice(i,1);
  }
  for(const it of S.items){
   if(it.real)it.real.updateBits(dt);
   if(it.free)continue;
   const dz=it.pos.z-it.cur.z;
   it.cur.z=damp(it.cur.z,it.pos.z,4.6,dt);it.cur.x=it.pos.x;it.cur.y=it.pos.y;
   if(it.moving&&Math.abs(dz)<.03){it.moving=false;it.cur.z=it.pos.z;if(it.k<8)it.swx.kick(-Math.sign(dz||1)*1.4);if(it.k===0)AUDIO.railStop(.8);}
   if(it.real&&!it.snap&&!it.job&&!it.moving&&!S.seq)startSnap(it);
   it.holder.position.copy(it.cur);
   if(it.k<10||it.moving){
    it.swx.step(dt);it.swz.step(dt);
    it.holder.rotation.set(it.swx.x*.05+Math.sin(time*.83+it.ph)*.014,0,it.swz.x*.05+Math.sin(time*.67+it.ph*1.7)*.012);
   }
   // 발밑에 고인 피: 다 밀려가 멈춘 뒤 천천히 번진다
   if(PREF.blood&&it.k<5){
    if(!it.moving)it.poolK=Math.min(1,it.poolK+dt*.12);
    it.pool.visible=it.poolK>.02;const s=.35+.65*it.poolK;
    it.pool.position.set(it.cur.x,.005,it.cur.z+.1);it.pool.scale.set(s,s*(.8+.2*Math.sin(it.ph)),1);
   }else it.pool.visible=false;
  }
  for(const hd of S.heads){
   const f=hd.fly;if(!f)continue;
   f.t+=dt/.5;const u=clamp(f.t,0,1);
   // 집어 올려 꼬챙이 위까지 가져간 다음 내리꽂는다
   if(u<.72){const k=smooth(u/.72);hd.obj.position.lerpVectors(f.from,_v.copy(f.to).setY(f.to.y+.34),k);hd.obj.position.y+=Math.sin(k*PI)*.35;hd.obj.quaternion.copy(f.q0).slerp(f.q1,k);}
   else{const k=easeIn((u-.72)/.28);hd.obj.position.set(f.to.x,f.to.y+.34*(1-k),f.to.z);hd.obj.quaternion.copy(f.q1);}
   if(u>=.72&&!f.shown){f.shown=true;spikeMesh[hd.idx].visible=true;}
   if(u>=1){hd.fly=null;placeHead(hd);AUDIO.chop(.8);AUDIO.squelch(.6);camHit({shake:.016});
    if(PREF.blood)BLOOD.spray(_v.set(SPIKES[hd.idx][0],SPIKES[hd.idx][1]-.06,SPIKES[hd.idx][2]+.05),V3(0,-.2,1),10,{min:.5,max:1.6,spread:.9});}
  }
 }
 function update(dt){
  if(!S.on)return;
  if(S.railDrop){const r=S.railDrop;r.t+=dt/.7;const u=clamp(r.t,0,1);rails.position.y=5.2*(1-backOut(u,1.1));
   if(u>=1){rails.position.y=0;S.railDrop=null;AUDIO.railStop(1);camHit({shake:.02});}}
  for(const c of hidden)if(c.visible)c.visible=false;
  updateItems(dt);
  {let n=0;for(const it of S.items){if(n>=2)break;if(!it.real&&it.ready&&(!it.proxy||(it.fine&&it.k>=nearK()))){ensureMesh(it);n++;}}}
  updateHeap(dt);
  updateSeq(dt);
  if(!S.seq&&S.jobs.length)stepJobs(5);
  const E=G.E;
  if(E&&!S.seq){
   if(S.reviving&&!canRevive(E)&&!(E.regrowQ&&E.regrowQ.length)&&!E.regrowHead){S.reviving=false;E.holdRegrow=true;}
   fear(E,dt);
  }
  syncUI();
 }
 function syncUI(){
  const E=G.E,show=S.on&&!S.seq&&!G.inputLocked&&!G.opening&&!G.paused;
  // 식칼을 처음 쥐면 허리 끊는 법을 알려 준다
  if(S.on&&G.tool!==S.tool){S.tool=G.tool;if(G.tool==='knife'&&E&&!E.bisected&&!G.inputLocked)hint('식칼: 배를 가로로 길게 다섯 번 그으면 허리가 끊깁니다',4.5);}
  const key=[show?1:0,canNext(E)?1:0,canRevive(E)&&!S.reviving?1:0,S.total,S.on?1:0].join();
  if(key===S.ui)return;S.ui=key;
  $('#freeBar').hidden=!show;
  $('#freeNext').disabled=!canNext(E);
  $('#freeRevive').disabled=!(canRevive(E)&&!S.reviving);
  const c=$('#freeCount');c.hidden=!S.on||S.total<1;c.textContent='걸어 둔 천지신명 '+S.total.toLocaleString('ko-KR')+'놈';
 }
 // 거는 동안은 방 뒤쪽 레일까지 보이게 조금 물러선다. 끝나면 평소 구도로 돌아간다
 function camera3(dt){
  const q=S.seq;if(!q)return false;
  const pr=innerWidth<innerHeight;
  // 손으로 들고 꿰는 동안은 평소 거리에서 조금 올려다보고(팔이 길게 늘어나지 않게), 끌려 올라간 뒤에 물러선다
  if(q.stage<3){const h=q.old.hang;CAM.goalPos.set(h.x*.5+.1,pr?1.72:1.7,h.z+(pr?3.9:3.3));CAM.goalLook.set(h.x*.6,pr?1.42:1.4,h.z-.2);}
  else{CAM.goalPos.set(0,pr?1.8:1.75,pr?6.0:5.4);CAM.goalLook.set(0,pr?1.55:1.5,-5);}
  const k=1-Math.exp(-dt*3.4);CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
  return true;
 }
 $('#freeNext').addEventListener('click',()=>{AUDIO.unlock();if(next())AUDIO.ui();focusCanvas();});
 $('#freeRevive').addEventListener('click',()=>{AUDIO.unlock();revive();focusCanvas();});
 return {begin,suspend,stage,update,next,revive,flinch,shoveContact,waistSlash,bisect,overflow,heap:HEAP,camera:camera3,canNext,canRevive,get on(){return S.on;},get busy(){return !!S.seq;},get state(){return S;}};
})();
return {FREE,hangPose:freeHangPose,walkPose:freeWalkPose,FREE_FLOOR,FREE_DMG};
}
return {create};
});
