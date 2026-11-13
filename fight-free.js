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
 *    떨어진 머리와 잘린 부위는 바닥으로 던져, 가까운 곳부터 방 끝까지 낮게 쌓는다. 그 뒤 새 천지신명이 손목이 사슬에 묶인 채 끌려 나온다
 *    (겁에 질려 두 발로 버티다 확 끌려와 선다. 비웃는 건 빈 방에 처음 서 있는 놈뿐이다).
 *  - 방: 옥좌 없는 어두운 도살장. 레일 두 줄이 내 바로 양옆에서 화면 안쪽으로 멀리 뻗고, 걸린 몸이 그 줄을 따라 늘어선다(줄마다 48구).
 *    줄 간격은 화면 비율에 맞춘다(세로로 긴 폰에서는 좁혀서 첫 칸부터 화면 안에 들어오게).
 *  - 이 모드에는 배경음악이 없다.
 *  - 「청소하기」(설정 창): 걸린 몸·머리·무더기·바닥 자국·기록을 전부 치우고 빈 방에서 다시 시작한다.
 *  - 걸린 몸·무더기 조각은 '그 순간 그 모습 그대로' 굳혀 둔다(본뜨기). 기록은 localStorage, 굳힌 모습은 IndexedDB에 남는다.
 *
 * 고칠 때 찾을 곳(아래 순서대로 들어 있다)
 *  1. 자세: HANG_POSE · freeHangPose(걸리는 몸) · freeWalkPose(걸어 나오는 새 놈: 끌려오는 놈 / 뒷짐 진 놈)
 *  2. 방과 배치: rowHalf·setRows·ROW_Z0·ROW_DZ·ROW_CAP(레일 줄) · heapSpot(바닥 조각 배치) · build()(벽·천장·형광등·바닥 때) · stage()(옥좌 치우기·안개·조명) · flicker(형광등 깜빡임)
 *  3. 기록: loadRecord · saveRecord
 *  4. 일반 모형: template · proxyBody · proxyHead (저장된 본이 없을 때만 쓴다)
 *  5. 본뜨기: newJob · jobMesh · jobFinish · snapMesh · DB
 *  6. 무더기: toHeap · heapLand · updateHeap
 *  7. 걸이·줄 세우기: makeHolder · layoutLine · ensureMesh(가까우면 자세히, 멀면 성기게)
 *  8. 「되살리기」·겁: revive · flinch · fear · scare(겁먹은 새 놈)
 *  9. 허리 끊기: waistSlash · bisect
 * 10. 「새 놈」 순서: T(시간표) · next · pierce · handover · arrive · seat · updateSeq · LEASH(끌고 오는 사슬)
 * 11. 「청소하기」: clean
 * 12. 매 프레임: updateItems · update · syncUI · camera3
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
 poseLerp(h.from,h.pose||HANG_POSE,u,out);
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
 // 도살장에 끌려오는 소: 손목이 사슬에 묶여 앞으로 당겨지고, 엉덩이를 뒤로 빼고 무릎을 굽힌 채 버틴다
 const w=E.walkIn,end=smooth(clamp(w.sit,0,1)),live=1-end,t=G.time,bk=smooth(clamp(w.balk,0,1));
 poseCopy(STAND,out);
 const moving=w.u>0&&w.u<1&&!w.frozen?1:0;
 out.sF+=(.2-.16*bk)*live;out.cF+=(.12-.1*bk)*live;out.nF-=.08*live;out.hF-=(.16+.1*bk)*live;
 out.LkB+=(.34+.3*bk)*live;out.RkB+=(.34+.3*bk)*live;out.LhF+=(.22+.24*bk)*live;out.RhF+=(.22+.24*bk)*live;out.py-=(.05+.05*bk)*live;
 // 발: 잰걸음으로 질질 끌려오다, 버틸 때는 두 발을 바닥에 박는다
 w.stepK=damp(w.stepK,moving*(1-bk),14,dt);w.phase+=dt*12.5*w.stepK;
 const a=Math.sin(w.phase)*.27*w.stepK;
 out.LhF+=a;out.RhF-=a;out.LkB+=Math.max(0,a)*1.1;out.RkB+=Math.max(0,-a)*1.1;out.py-=.016*w.stepK*Math.abs(Math.cos(w.phase));
 // 걸린 몸들 쪽으로 자꾸 고개가 돌아간다
 const look=Math.sin(t*5.2+E.flailSeed)*.5+.5;
 out.hT+=w.lookDir*(.5*look+.35*bk)*live;out.nT+=w.lookDir*.16*live;
 // 덜덜 떤다
 const q1=Math.sin(t*41),q2=Math.sin(t*33+1.3),q3=Math.sin(t*47+2.1),k=(1+.6*bk)*live;
 out.hT+=q1*.03*k;out.hR+=q2*.024*k;out.hF+=q3*.018*k;out.cT+=q2*.012*k;out.cR+=q1*.008*k;
 out.LkB+=Math.max(0,q3)*.1*k;out.RkB+=Math.max(0,-q3)*.1*k;
 out.tx=lerp(w.side*w.from,0,w.u)+q1*.004*k;out.tz=w.z;out.ty=0;out.rx=0;
 // 끌려가는 쪽으로 윗몸이 쏠리고, 버틸 때는 반대로 몸을 뒤로 젖힌다
 out.rz=w.side*(.1-.3*bk)*live;
 out.ry=-w.side*.5*live;
}
const FREE=(()=>{
 const root=grp(scene,null,'free-hall');root.visible=false;
 const iron=STD('#565b5a',{metalness:.7,roughness:.94,envMapIntensity:0});
 const ironD=STD('#2c3030',{metalness:.55,roughness:.96,envMapIntensity:0});
 const proxyMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,metalness:0});
 const capMat=STD('#101d30',{roughness:.94});
 // A broken-edged stain, lit by the room. No luminous, repeated blue circles.
 const poolTex=canvasTex(128,128,(g,w,h)=>{
  const r=rng(19513);g.clearRect(0,0,w,h);
  g.fillStyle='rgba(15,25,38,.9)';g.beginPath();
  for(let i=0;i<=64;i++){const a=i/64*TAU,d=43+7*Math.sin(a*3)+5*Math.sin(a*7+.8)+3*Math.sin(a*13);const x=64+Math.cos(a)*d,y=64+Math.sin(a)*d*.81;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();
  for(let i=0;i<23;i++){g.fillStyle='rgba(12,22,35,.65)';g.beginPath();g.ellipse(13+r()*102,15+r()*98,1+r()*3,1+r()*5,r()*TAU,0,TAU);g.fill();}
 });
 const poolMat=STD('#778392',{map:poolTex,transparent:true,depthWrite:false,roughness:.86,metalness:0,opacity:.85});
 const CHAIN=.57;
 // 방: 옥좌 없는 넓은 냉장실. 레일 네 줄이 화면 안쪽(−z)으로 멀리 뻗고, 걸린 몸은 그 레일을 따라 한 줄로 늘어선다(도축장 레일).
 // 새로 걸리는 몸이 맨 앞 칸으로 들어오면 그 줄 전체가 한 칸씩 안쪽으로 밀린다
 const HOOK_Y=2.15,RAIL_Y=HOOK_Y+CHAIN;
 // 레일은 내 바로 양옆 두 줄뿐이다. 가운데에서 한 줄까지의 거리는 화면 비율에 맞춘다(rowHalf): 세로로 긴 폰에서는 좁혀서 첫 칸의 몸이 화면 안에 다 들어오게
 const ROW_BASE=1.05,ROWX=[-ROW_BASE,ROW_BASE];
 const ROW_Z0=-2.0,ROW_DZ=.8,ROW_CAP=48,HALL_END=-46,HALL_W=2.5,CEIL=4.7,KEEP=ROWX.length*ROW_CAP;
 function rowHalf(){
  const a=innerWidth/Math.max(1,innerHeight),dist=(a<1?Math.max(2.55,1.7/a):3.05)+1.0-ROW_Z0; // 평소 구도에서 카메라~첫 칸 거리
  return clamp(dist*Math.tan(camera.fov*PI/360)*a-.47,.72,1.2);
 }
 const GEOS={
  chain:cylGeo(.011,.011,CHAIN,6),haul:cylGeo(.011,.011,7,6),trolley:new THREE.BoxGeometry(.09,.06,.12),
  hook:new THREE.TorusGeometry(.058,.0115,7,16,PI*1.3),shank:cylGeo(.0115,.0115,.1,6),tip:new THREE.ConeGeometry(.0115,.05,6),
  pool:new THREE.CircleGeometry(.34,24)};
 for(const k in GEOS)GEOS[k].userData.shared=true;
 const S={on:false,wipe:false,total:0,items:[],lines:ROWX.map(()=>[]),seq:null,reviving:false,railsOn:false,railDrop:null,ui:'',slides:[],jobs:[],gen:0,stageOn:false,tool:'',view:false,viewHidden:[]};
 const _v=V3(),_v2=V3(),_m=new THREE.Matrix4();

 /* ---- 방: 어두운 도살장 ---- */
 const rails=grp(root,null,'rails');rails.visible=false;
 const hall=grp(root,null,'hall');
 const bgCol=col('#0e1512');
 const railRow=[],lanes=[],wallGore=[];
 const TUBE_COL=col('#9ca88a'),tubeOn=new THREE.MeshBasicMaterial({color:TUBE_COL.clone(),fog:false}),tubeBad=new THREE.MeshBasicMaterial({color:TUBE_COL.clone(),fog:false});
 const dragMat=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:0}),goreMat=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:0});
 /* 조명: 빛은 등이 달린 자리에서만 나온다.
  *  lamp      족치는 자리 위의 등 하나. 여기만 환하고 그림자도 여기서만 진다(맞는 놈이 잘 보여야 한다)
  *  tubeLights 복도 안쪽, 켜져 있는 형광등 자리의 빛. 등에서 멀어지면 어두워져서 걸린 몸이 밝았다 어두웠다 하며 멀어진다(둘째가 껌뻑거리는 등)
  *  hallFill  천장에서 곧게 내려오는 아주 옅은 바탕빛. 평소엔 거의 없고, 「둘러보기」 때만 올려서 걸어 둔 몸이 끝까지 보이게 한다
  * 밝기를 손볼 곳: LAMP_I(족치는 자리) · TUBE_SPOTS(복도) · HEMI_I/FILL_I([평소, 둘러보기]) */
 const LAMP_I=1.55,HEMI_I=[.18,.22],FILL_I=[.12,.18];
 const TUBE_SPOTS=[[-2.7,1.15,9],[-11.1,.70,9],[-17.4,.65,10],[-30,.60,12]]; // [z, 세기, 닿는 거리]
 const hallFill=new THREE.DirectionalLight(col('#b9c8ad'),FILL_I[0]);
 hallFill.position.set(0,CEIL+6,-18);hallFill.target.position.set(0,0,-18);
 const lamp=new THREE.SpotLight(col("#f6f1d2"),LAMP_I,12,.76,.85,1);
 lamp.position.set(-.2,CEIL-.4,3.2);lamp.target.position.set(0,.9,1.1);
 lamp.castShadow=true;lamp.shadow.mapSize.set(MOBILE_GPU?512:1024,MOBILE_GPU?512:1024);lamp.shadow.camera.near=.8;lamp.shadow.camera.far=10;lamp.shadow.bias=-.0006;lamp.shadow.normalBias=.03;
 const tubeLights=TUBE_SPOTS.map(([z,i,d])=>{const l=new THREE.PointLight(col('#cfe0b8'),i,d,1.6);l.position.set(0,CEIL-.3,z);l.userData.base=i;return l;});
 let viewK=0,floorMat=null,floorKeep=null;
 (function build(){
  const merge=(list,mat,parent)=>{parent.updateMatrixWorld(true);const geo=mergeMeshes(list,new THREE.Matrix4());for(const m of list){m.removeFromParent();m.geometry.dispose();}
   const m=new THREE.Mesh(geo,mat);m.castShadow=false;m.receiveShadow=false;m.frustumCulled=false;parent.add(m);return m;};
  // 레일과 천장 걸이: 줄마다 한 덩어리로 만들고(가운데 기준) 줄 간격이 바뀌면 x만 옮긴다
  const L=3-HALL_END;
  for(let r=0;r<ROWX.length;r++){
   const g=grp(rails,null,'rail'+r),list=[];
   list.push(mk(new THREE.BoxGeometry(.07,.06,L),ironD,g,{p:[0,RAIL_Y+.06,3-L/2],cast:false}));
   for(let z=1;z>HALL_END;z-=4)list.push(mk(cylGeo(.016,.016,CEIL-RAIL_Y,6),ironD,g,{p:[0,(CEIL+RAIL_Y)/2+.06,z],cast:false}));
   merge(list,ironD,g);g.position.x=ROWX[r];railRow.push(g);
  }
  metalEnv(rails);
  // 벽: 누렇게 뜬 타일. 아래로 갈수록 때가 끼고, 녹물과 물때가 줄줄 흘러내린 자국이 있다(가로 6.4m마다 되풀이)
  const WALL_U=6.4;
  const wallDraw=(g,w,h)=>{
   const cols=16,rows=12,cw=w/cols,rh=h/rows;
   g.fillStyle='#4f5546';g.fillRect(0,0,w,h);
   for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const v=150+Math.random()*34|0;g.fillStyle=`rgb(${v+6},${v+8},${v-26})`;g.fillRect(i*cw+2,j*rh+2,cw-4,rh-4);
    if(Math.random()<.1){g.fillStyle=`rgba(46,50,36,${.2+Math.random()*.35})`;g.fillRect(i*cw+2,j*rh+2,cw-4,rh-4);}
    if(Math.random()<.035){g.fillStyle='#343a30';g.fillRect(i*cw+2,j*rh+2,cw-4,rh-4);} // 떨어져 나간 타일
   }
   let gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(16,20,14,.5)');gr.addColorStop(.22,'rgba(16,20,14,.1)');gr.addColorStop(.58,'rgba(26,22,12,.22)');gr.addColorStop(.86,'rgba(18,14,8,.62)');gr.addColorStop(1,'rgba(8,7,5,.9)');
   g.fillStyle=gr;g.fillRect(0,0,w,h);
   for(let n=0;n<34;n++){
    const x=Math.random()*w,y0=Math.random()*h*.55,len=h*(.18+Math.random()*.6),wd=3+Math.random()*16,rust=Math.random()<.6;
    const sg=g.createLinearGradient(0,y0,0,y0+len),c=rust?'96,52,18':'22,26,18',al=.22+Math.random()*.34;
    sg.addColorStop(0,`rgba(${c},0)`);sg.addColorStop(.12,`rgba(${c},${al})`);sg.addColorStop(1,`rgba(${c},0)`);
    g.fillStyle=sg;g.fillRect(x,y0,wd,len);
   }
   for(let n=0;n<60;n++){const x=Math.random()*w,y=h*(.55+Math.random()*.45),r=8+Math.random()*46;
    const rg=g.createRadialGradient(x,y,1,x,y,r);rg.addColorStop(0,'rgba(20,16,9,.4)');rg.addColorStop(1,'rgba(20,16,9,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,r*2,r*2);}
  };
  const zc=8-(8-HALL_END)/2,zl=8-HALL_END;
  const wallTex=canvasTex(1024,1024,wallDraw);wallTex.wrapS=THREE.RepeatWrapping;wallTex.repeat.set(zl/WALL_U,1);
  const endTex=wallTex.clone();endTex.needsUpdate=true;endTex.wrapS=THREE.RepeatWrapping;endTex.repeat.set(HALL_W*2/WALL_U,1);
  const wallMat=STD('#ffffff',{map:wallTex,roughness:.96}),endMat=STD('#ffffff',{map:endTex,roughness:.96}),ceilMat=STD('#3a4038',{roughness:.95});
  for(const sd of [-1,1])mk(new THREE.PlaneGeometry(zl,CEIL),wallMat,hall,{p:[sd*HALL_W,CEIL/2,zc],r:[0,-sd*PI/2,0],cast:false});
  mk(new THREE.PlaneGeometry(HALL_W*2,CEIL),endMat,hall,{p:[0,CEIL/2,HALL_END],cast:false});
  mk(new THREE.PlaneGeometry(HALL_W*2,zl),ceilMat,hall,{p:[0,CEIL,zc],r:[PI/2,0,0],cast:false,receive:false});
  // 바닥: 싸우는 자리의 돌바닥을 같은 무늬로 방 끝까지 잇는다
  const base=COMBAT_STAGE.root.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===30);
  if(base){const len=-7.5-HALL_END+2,geo=new THREE.PlaneGeometry(30,len),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++){uv.setX(i,uv.getX(i)*2);uv.setY(i,uv.getY(i)*len/15);}
   mk(geo,base.material,hall,{r:[-PI/2,0,0],p:[0,0,-7.5-len/2],cast:false});floorMat=base.material;}
  // 바닥 때: 족치는 자리만 등 아래처럼 밝게 남기고 둘레는 어둡게 덮는다. 가운데 통로에 배수구, 얼룩과 물 자국
  const GW=11,GL=30,GZ=-9; // 덮는 넓이(m)와 가운데 z
  const grime=canvasTex(512,1024,(g,w,h)=>{
   const X=x=>(x/GW+.5)*w,Z=z=>(z-(GZ-GL/2))/GL*h; // 캔버스 아래쪽이 카메라 쪽(+z)
   g.clearRect(0,0,w,h);g.fillStyle='rgba(6,8,6,.42)';g.fillRect(0,0,w,h);
   // 족치는 자리(0,1.0) 둘레를 지운다
   g.globalCompositeOperation='destination-out';
   g.save();g.translate(X(0),Z(1.0));g.scale(1,(h/GL)/(w/GW)*1.25);
   const R=w/GW*3.6,hg=g.createRadialGradient(0,0,R*.18,0,0,R);hg.addColorStop(0,'rgba(0,0,0,1)');hg.addColorStop(.55,'rgba(0,0,0,.72)');hg.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=hg;g.beginPath();g.arc(0,0,R,0,TAU);g.fill();g.restore();
   g.globalCompositeOperation='source-over';
   // 얼룩
   for(let n=0;n<150;n++){const x=Math.random()*w,y=Math.random()*h,r=6+Math.random()*34;
    const rg=g.createRadialGradient(x,y,1,x,y,r),c=Math.random()<.4?'58,34,14':'12,14,10';rg.addColorStop(0,`rgba(${c},${.16+Math.random()*.26})`);rg.addColorStop(1,`rgba(${c},0)`);
    g.fillStyle=rg;g.save();g.translate(x,y);g.scale(1,.5+Math.random());g.translate(-x,-y);g.fillRect(x-r,y-r*2,r*2,r*4);g.restore();}
   // 배수구(가운데 통로)와 거기로 모이는 물 자국
   const dx=X(0),dz=Z(-.75),ds=w/GW*.34;
   for(let n=0;n<9;n++){const a=rnd(0,TAU),len=ds*rnd(1.5,5);g.strokeStyle=`rgba(10,12,9,${rnd(.18,.4)})`;g.lineWidth=rnd(2,7);g.beginPath();g.moveTo(dx+Math.cos(a)*len,dz+Math.sin(a)*len*(h/GL)/(w/GW));g.lineTo(dx,dz);g.stroke();}
   g.fillStyle='rgba(8,9,7,.95)';g.fillRect(dx-ds/2,dz-ds*.3,ds,ds*.6);
   g.fillStyle='rgba(70,74,64,.9)';for(let k=0;k<5;k++)g.fillRect(dx-ds/2+ds*(.08+k*.18),dz-ds*.3+1,ds*.07,ds*.6-2);
  });
  const gm=mk(new THREE.PlaneGeometry(GW,GL),new THREE.MeshBasicMaterial({map:grime,transparent:true,depthWrite:false}),hall,{r:[-PI/2,0,0],p:[0,.0035,GZ],cast:false,receive:false});gm.renderOrder=-4;
  // 끌고 간 자국: 레일 밑으로 몸에서 떨어진 것이 길게 끌려 있다(피를 끄면 숨긴다)
  const drag=canvasTex(128,1024,(g,w,h)=>{
   g.clearRect(0,0,w,h);
   for(let n=0;n<16;n++){const x=w*(.5+rnd(-.3,.3)),wd=rnd(4,22),y0=h*rnd(0,.8),len=h*rnd(.1,.5);
    const sg=g.createLinearGradient(0,y0,0,y0+len),al=rnd(.25,.6);sg.addColorStop(0,'rgba(10,19,30,0)');sg.addColorStop(.5,`rgba(10,19,30,${al})`);sg.addColorStop(1,'rgba(7,14,23,0)');
    g.fillStyle=sg;g.fillRect(x-wd/2,y0,wd,len);}
   for(let n=0;n<70;n++){const x=w*(.5+rnd(-.42,.42)),y=h*Math.random(),r=rnd(1.5,7);g.fillStyle=`rgba(12,23,36,${rnd(.3,.7)})`;g.beginPath();g.ellipse(x,y,r,r*rnd(1,3),0,0,TAU);g.fill();}
  });
  dragMat.map=drag;
  for(let r=0;r<ROWX.length;r++){const m=mk(new THREE.PlaneGeometry(.95,22),dragMat,hall,{r:[-PI/2,0,0],p:[ROWX[r],.0045,-9.2],cast:false,receive:false});m.renderOrder=-3;lanes.push(m);}
  // 벽 아랫도리에 튀고 문질러진 자국(피를 끄면 숨긴다)
  const gore=canvasTex(1024,256,(g,w,h)=>{
   g.clearRect(0,0,w,h);
   for(let n=0;n<26;n++){const x=Math.random()*w,y=h*rnd(.25,.95),r=rnd(10,46);
    const rg=g.createRadialGradient(x,y,1,x,y,r);rg.addColorStop(0,`rgba(11,20,31,${rnd(.45,.8)})`);rg.addColorStop(.6,'rgba(9,16,26,.35)');rg.addColorStop(1,'rgba(9,16,26,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,r*2,r*2);
    for(let k=0;k<3;k++){const xx=x+rnd(-r,r)*.6,len=rnd(20,h-y+10),sg=g.createLinearGradient(0,y,0,y+len);sg.addColorStop(0,'rgba(11,20,31,.7)');sg.addColorStop(1,'rgba(11,20,31,0)');g.fillStyle=sg;g.fillRect(xx,y,rnd(2,5),len);}}
   // 손으로 짚고 끌린 자국
   for(let n=0;n<5;n++){const x=Math.random()*w,y=h*rnd(.4,.7),cx=rnd(15,40),cy=rnd(20,45),ex=rnd(40,95),ey=rnd(70,h*.5);g.lineCap='round';
    for(let f=0;f<4;f++){const o=f*8,gr=g.createLinearGradient(0,y,0,y+ey);gr.addColorStop(0,'rgba(11,22,34,.6)');gr.addColorStop(1,'rgba(11,22,34,0)');
     g.strokeStyle=gr;g.lineWidth=5-f*.5;g.beginPath();g.moveTo(x+o,y+(f%2)*4);g.quadraticCurveTo(x+o+cx,y+cy,x+o+ex,y+ey);g.stroke();}}
  });
  goreMat.map=gore;
  for(const sd of [-1,1]){const m=mk(new THREE.PlaneGeometry(16,2.3),goreMat,hall,{p:[sd*(HALL_W-.012),1.15,-5.5],r:[0,-sd*PI/2,0],cast:false,receive:false});m.renderOrder=-2;wallGore.push(m);}
  // 천장 형광등: 드문드문 켜져 있고(나간 자리는 비어 있다) 몇 개는 껌뻑거린다. 화면 안쪽으로 이어져 거리감을 준다
  const tOn=[],tBad=[];
  for(const x of [0,-(HALL_W-.3),HALL_W-.3]){let n=0;
   for(let z=x?-.5:1.5;z>HALL_END+1;z-=x?7.2:4.2){n++;
    const near=x===0&&z>-3;if(!near&&n%4===3)continue; // 나간 등
    (!near&&n%3===1?tBad:tOn).push(mk(new THREE.BoxGeometry(.11,.04,1.5),tubeOn,hall,{p:[x,CEIL-.05,z],cast:false,receive:false}));}}
  if(tOn.length)merge(tOn,tubeOn,hall);if(tBad.length)merge(tBad,tubeBad,hall);
  hall.add(hallFill,hallFill.target,lamp,lamp.target,...tubeLights);
 })();
 // 형광등 깜빡임: 몇 초에 한 번, 불량 등이 두어 번 껌뻑이고 그 등 밑의 빛도 같이 꺼졌다 켜진다(방 전체 밝기도 아주 살짝 따라 흔들린다)
 const FL={v:1,t:3,n:0};
 function flicker(dt){
  FL.t-=dt;
  if(FL.t<=0){
   if(FL.n>0){FL.n--;FL.v=FL.v>.6?rnd(.12,.45):1;FL.t=FL.n?rnd(.03,.1):rnd(2.5,7);if(!FL.n)FL.v=1;}
   else{FL.n=2*(1+(Math.random()*3|0));FL.t=0;}
  }
  tubeBad.color.copy(TUBE_COL).multiplyScalar(FL.v);tubeLights[1].intensity=tubeLights[1].userData.base*FL.v;
  viewK=damp(viewK,S.view?1:0,5,dt);hallFill.intensity=lerp(FILL_I[0],FILL_I[1],viewK);
  if(S.stageOn&&litKeep&&LIT.hemi)LIT.hemi.intensity=lerp(HEMI_I[0],HEMI_I[1],viewK)*(.95+.05*FL.v);
 }
 // 줄 간격을 바꾼다(화면 비율이 바뀌었을 때): 레일·걸린 몸·끌린 자국을 함께 옮긴다. 바닥 조각은 그대로 둔다
 function setRows(x){
  ROWX[0]=-x;ROWX[1]=x;
  railRow.forEach((g,r)=>{g.position.x=ROWX[r];});lanes.forEach((m,r)=>{m.position.x=ROWX[r];});
  for(let l=0;l<ROWX.length;l++)layoutLine(l,true);
 }
 // 옥좌·기둥·벽·현판·지팡이를 치우고, 안개·배경·조명을 어두운 도살장으로 바꾼다. 끄면 원래 궁전으로 되돌린다.
 // fight.js가 장면에 달아 둔 궁전 조명(key·fill·rim)은 이 방에서 끄고, 위에서 만든 등 빛(lamp·tubeLights)만 쓴다. 벽과 바닥은 거친 무광으로 맞춘다
 const LIT=(()=>{const o={hemi:null,key:null,fill:null,rim:null,bounce:null};
  for(const c of scene.children){
   if(c.isHemisphereLight){if(!o.hemi)o.hemi=c;}
   else if(c.isDirectionalLight){if(c.castShadow)o.key=o.key||c;else if(c.position.z<0)o.rim=o.rim||c;else o.fill=o.fill||c;}
   else if(c.isPointLight&&c.distance===4.5)o.bounce=o.bounce||c;
  }
  return o;})();
 let hidden=[],litKeep=null;
 function stage(on){
  if(on){
   const keep=o=>o===COMBAT_STAGE.contact||(o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry');
   for(const c of COMBAT_STAGE.root.children)if(!keep(c)&&c.visible){c.visible=false;hidden.push(c);}
   scene.background=bgCol;scene.fog=new THREE.Fog(bgCol.clone(),8,50);camera.far=65;camera.updateProjectionMatrix();
   const {hemi,key,fill,rim,bounce}=LIT;
   if(hemi&&key&&fill&&rim&&bounce){
    if(!litKeep)litKeep={hc:hemi.color.clone(),hg:hemi.groundColor.clone(),hi:hemi.intensity,kv:key.visible,fv:fill.visible,rv:rim.visible,bc:bounce.color.clone(),bp:bounce.position.clone(),bi:bounce.intensity};
    hemi.color.copy(col('#a8b2a4'));hemi.groundColor.copy(col('#30382d'));hemi.intensity=HEMI_I[0];
    key.visible=fill.visible=rim.visible=false;
    // 바닥에서 되비친 옅은 빛: 턱 밑·눈두덩이 새까맣게 죽지 않게 한다
    bounce.color.copy(col('#c2c7b4'));bounce.position.set(0,.3,2.5);bounce.intensity=.12;
   }
   if(floorMat&&floorKeep==null){floorKeep=floorMat.roughness;floorMat.roughness=.94;}
   viewK=0;
   if(G.E)factoryLook(G.E);
   S.stageOn=true;
   // 걸린 몸이 하나라도 있는 방에 들어선 놈은 처음부터 겁에 질려 있다
   if(S.items.length&&G.E)scare(G.E);
  }else{
   for(const c of hidden)c.visible=true;hidden=[];
   if(S.stageOn){scene.background=col('#151d1e');scene.fog=new THREE.Fog(col('#202725'),7,18);camera.far=40;camera.updateProjectionMatrix();}
   if(litKeep){const {hemi,key,fill,rim,bounce}=LIT,k=litKeep;litKeep=null;
    hemi.color.copy(k.hc);hemi.groundColor.copy(k.hg);hemi.intensity=k.hi;key.visible=k.kv;fill.visible=k.fv;rim.visible=k.rv;bounce.color.copy(k.bc);bounce.position.copy(k.bp);bounce.intensity=k.bi;}
   if(floorMat&&floorKeep!=null){floorMat.roughness=floorKeep;floorKeep=null;}
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
 function hangingPose(seed){
  const r=rng(seed),p=P();poseCopy(HANG_POSE,p);
  p.nF=.37+r()*.2;p.hF=.32+r()*.24;p.hR=(r()-.5)*.48;p.hT=(r()-.5)*.35;
  p.LsF=.02+r()*.15;p.RsF=.02+r()*.15;p.LsA=.06+r()*.13;p.RsA=.06+r()*.13;
  p.LeB=.06+r()*.2;p.ReB=.06+r()*.2;p.LwF=.24+r()*.22;p.RwF=.24+r()*.22;
  p.LkB=.08+r()*.22;p.RkB=.08+r()*.22;return p;
 }


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
 const snapMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,metalness:0,side:THREE.DoubleSide});
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
 // Only indexed vertices survive. Invisible/discarded vertices must not enlarge debris bounds.
 function packSnapshot(sn){
  const map=new Map(),p=[],c=[],idx=new Uint32Array(sn.i.length);
  for(let k=0;k<sn.i.length;k++){const i=sn.i[k];let j=map.get(i);if(j===undefined){j=map.size;map.set(i,j);p.push(sn.p[i*3],sn.p[i*3+1],sn.p[i*3+2]);c.push(sn.c[i*3],sn.c[i*3+1],sn.c[i*3+2]);}idx[k]=j;}
  return {p:new Float32Array(p),c:new Uint8Array(c),i:idx,v:3};
 }
 function newJob(src,space,cell,done){
  const meshes=[];
  src.traverse(o=>{
   if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;
   for(let n=o;n;n=n.parent){if(!n.visible||n.name==='halo'||n.userData.factoryDiscard)return;if(n===src)break;}
   meshes.push(o);
  });
  return {src,space,cell,done,meshes,i:0,pos:[],col:[],wt:[],idx:[],n:0};
 }
 const _sv=V3();
 function jobMesh(job,o,until=Infinity){
  let work=job.meshWork;
  if(!work){
   const mat=Array.isArray(o.material)?o.material[0]:o.material;if(!mat||mat.visible===false||!mat.color||!o.parent)return true;
   const blood=!!o.userData.bloodOverlay;
   if(mat.blending!==THREE.NormalBlending||mat.colorWrite===false||!blood&&mat.transparent&&mat.opacity<.5)return true;
   const f=o.userData.flesh;if(f&&f.bake)try{f.bake();}catch(_){}
   const g=o.geometry,A=g.attributes.position,U=g.attributes.uv,VC=mat.vertexColors?g.attributes.color:null;
   o.updateWorldMatrix(true,false);job.space.updateWorldMatrix(true,false);
   work=job.meshWork={g,A,U,VC,mat,td:U?texData(mat.map):null,m:new THREE.Matrix4().copy(job.space.matrixWorld).invert().multiply(o.matrixWorld),
    base:job.n,w:blood?4:1,alpha:new Uint8Array(A.count),v:0,t:0,vcScale:VC&&VC.normalized&&VC.array instanceof Uint8Array?1/255:1};
  }
  const {g,A,U,VC,mat,td,m,base,w,alpha,vcScale}=work,c=mat.color,P=job.pos,C=job.col,W=job.wt;
  while(work.v<A.count){const i=work.v++;
   _sv.fromBufferAttribute(A,i).applyMatrix4(m);P.push(_sv.x,_sv.y,_sv.z);
   let r=c.r,gg=c.g,b=c.b,opacity=mat.opacity;
   if(td){
    let u=U.getX(i)*td.rx+td.ox,v=U.getY(i)*td.ry+td.oy;u-=Math.floor(u);v-=Math.floor(v);if(td.flip)v=1-v;
    const k=(Math.min(td.h-1,v*td.h|0)*td.w+Math.min(td.w-1,u*td.w|0))*4,D=td.d;opacity*=D[k+3]/255;
    if(td.srgb){r*=LIN[D[k]];gg*=LIN[D[k+1]];b*=LIN[D[k+2]];}else{r*=D[k]/255;gg*=D[k+1]/255;b*=D[k+2]/255;}
   }
   if(VC){r*=VC.getX(i)*vcScale;gg*=VC.getY(i)*vcScale;b*=VC.getZ(i)*vcScale;}
   alpha[i]=opacity>=Math.max(.1,mat.alphaTest||0)?1:0;
   C.push(r,gg,b);W.push(alpha[i]?w:0);
   if(!(work.v&255)&&performance.now()>until)return false;
  }
  const I=job.idx,ia=g.index&&g.index.array,count=ia?ia.length:A.count;
  while(work.t+2<count){const i=work.t;work.t+=3;const a=ia?ia[i]:i,b=ia?ia[i+1]:i+1,c=ia?ia[i+2]:i+2;
   if(alpha[a]&&alpha[b]&&alpha[c])I.push(base+a,base+b,base+c);
   if(!(work.t%768)&&performance.now()>until)return false;
  }
  job.n+=A.count;job.meshWork=null;return true;
 }
 // 묶기도 나눠서 한다(한 번에 하면 휴대폰에서 0.1초 넘게 멈춘다). until 시각을 넘기면 멈췄다가 다음 프레임에 이어 한다
 function jobFinish(job,until){
  const F=job.fin||(job.fin={map:new Map(),np:[],nc:[],cnt:[],ws:[],remap:new Uint32Array(job.n),i:0,t:0,out:[]});
  const cell=job.cell,P=job.pos,C=job.col,W=job.wt,n=job.n,{map,np,nc,cnt,ws,remap}=F;
  while(F.i<n){
   const i=F.i++;if(!W[i])continue;const x=P[i*3],y=P[i*3+1],z=P[i*3+2];
   const k=((Math.round(x/cell)+2048)*4096+(Math.round(y/cell)+2048))*4096+(Math.round(z/cell)+2048);
   let j=map.get(k);if(j===undefined){j=cnt.length;map.set(k,j);np.push(0,0,0);nc.push(0,0,0);cnt.push(0);ws.push(0);}
   const w=W[i];np[j*3]+=x;np[j*3+1]+=y;np[j*3+2]+=z;nc[j*3]+=C[i*3]*w;nc[j*3+1]+=C[i*3+1]*w;nc[j*3+2]+=C[i*3+2]*w;cnt[j]++;ws[j]+=w;remap[i]=j;
   if(!(F.i&255)&&performance.now()>until)return null;
  }
  const I=job.idx,out=F.out;
  while(F.t<I.length){
   const t=F.t;F.t+=3;const a=remap[I[t]],b=remap[I[t+1]],c=remap[I[t+2]];if(a!==b&&b!==c&&a!==c)out.push(a,b,c);
   if(!(F.t%768)&&performance.now()>until)return null;
  }
  const m=cnt.length;
  if(!F.pos){F.pos=new Float32Array(m*3);F.col=new Uint8Array(m*3);F.ci=0;}
  const pos=F.pos,col=F.col;
  while(F.ci<m){const j=F.ci++;for(let a=0;a<3;a++){pos[j*3+a]=np[j*3+a]/cnt[j];col[j*3+a]=Math.round(255*clamp(nc[j*3+a]/ws[j],0,1));}
   if(!(F.ci&255)&&performance.now()>until)return null;
  }
  // Packing used to run in one unbounded pass after the timed work finished.
  // Keep the same index-order remapping, but yield during packing too.
  if(!F.pack)F.pack={map:new Int32Array(m).fill(-1),p:[],c:[],i:new Uint32Array(out.length),k:0};
  const packed=F.pack;
  while(packed.k<out.length){const k=packed.k++,i=out[k];let j=packed.map[i];
   if(j<0){j=packed.p.length/3;packed.map[i]=j;packed.p.push(pos[i*3],pos[i*3+1],pos[i*3+2]);packed.c.push(col[i*3],col[i*3+1],col[i*3+2]);}packed.i[k]=j;
   if(!(packed.k&511)&&performance.now()>until)return null;
  }
  job.fin=null;job.pos=job.col=job.wt=job.idx=null;TEXS.clear();
  return {p:new Float32Array(packed.p),c:new Uint8Array(packed.c),i:packed.i,v:3,waistSurface:1};
 }

 // Old snapshots welded the shoulder halo into nearby clothing. Its old dock
 // is fixed by HANG_POSE; fit the small random tilt and allow the broken wedge.
 // Keep the original IndexedDB snapshot intact: this is a display migration.
 function stripStoredHalo(sn){
  if(sn.v>=3)return sn;
  const P=sn.p,I=sn.i,n=P.length/3,near=[];
  for(let i=0;i<n;i++){const x=P[i*3],y=P[i*3+1]-.14823,z=P[i*3+2]-.33735,r=Math.hypot(x,y,z);if(r>.222&&r<.348)near.push([i,x,y,z]);}
  let best=0,nx=0,nz=1;
  const scoreTilt=x=>{
   const z=Math.sqrt(1-x*x-.42*.42);let score=0;
   for(const p of near){const d=Math.abs(p[1]*x+p[2]*.42+p[3]*z);if(d<.008)score+=1-d/.008;}
   if(score>best){best=score;nx=x;nz=z;}
  };
  for(let k=-12;k<=12;k++)scoreTilt(k*.02);
  const coarse=nx;for(let k=-5;k<=5;k++)scoreTilt(coarse+k*.002);
  if(best>45){
   const normal=V3(nx,.42,nz),axis=V3(1,0,0).cross(normal).normalize(),other=V3().crossVectors(normal,axis),bins=new Uint16Array(16),mark=new Uint8Array(n),v=V3();
   for(const p of near){v.set(p[1],p[2],p[3]);const d=v.dot(normal),r=Math.sqrt(Math.max(0,v.lengthSq()-d*d));if(Math.abs(d)<.013&&r>.222&&r<.348){mark[p[0]]=1;bins[Math.floor((Math.atan2(v.dot(other),v.dot(axis))+PI)/TAU*16)%16]++;}}
   if(Array.from(bins).filter(x=>x>=2).length>=11){
    const kept=[];for(let i=0;i<I.length;i+=3)if(!(mark[I[i]]&&mark[I[i+1]]&&mark[I[i+2]]))kept.push(I[i],I[i+1],I[i+2]);
    return {p:P,c:sn.c,i:new Uint32Array(kept),v:3};
   }
  }
  // Earlier saves can retain separate annuli. Restrict this fallback to thin,
  // hollow components so face ornaments and cut surfaces remain untouched.
  const parent=new Int32Array(n);for(let i=0;i<n;i++)parent[i]=i;
  const find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};
  for(let i=0;i<I.length;i+=3){const a=find(I[i]);parent[find(I[i+1])]=a;parent[find(I[i+2])]=a;}
  const groups=new Map();for(let i=0;i<n;i++){const k=find(i);let g=groups.get(k);if(!g)groups.set(k,g=[]);g.push(i);}
  const remove=new Set(),v=V3(),u=V3(),normal=V3(),center=V3(),axis=V3();
  for(const [key,ids] of groups){
   if(ids.length<36)continue;center.set(0,0,0);for(const i of ids)center.add(v.fromArray(P,i*3));center.multiplyScalar(1/ids.length);
   if(Math.abs(center.x)>.38||center.y<-.35||center.y>1.4)continue;
   // A radius at least 22 cm and a hollow center distinguish these from eyes/cut caps.
   let maxR=0,minR=Infinity;for(const i of ids){const d=v.fromArray(P,i*3).distanceTo(center);maxR=Math.max(maxR,d);minR=Math.min(minR,d);}
   if(maxR<.22||maxR>.49||minR<.15||maxR/minR>2.1)continue;
   v.fromArray(P,ids[0]*3).sub(center);normal.set(0,0,0);let area=0;
   for(const i of ids){u.fromArray(P,i*3).sub(center);axis.crossVectors(v,u);const a=axis.lengthSq();if(a>area){area=a;normal.copy(axis);}}
   normal.normalize();let thick=0;const bins=new Set();v.normalize();axis.crossVectors(normal,v).normalize();
   for(const i of ids){u.fromArray(P,i*3).sub(center);thick=Math.max(thick,Math.abs(u.dot(normal)));bins.add(Math.floor((Math.atan2(u.dot(axis),u.dot(v))+PI)/TAU*16)%16);}
   if(thick<.027&&bins.size>=13)remove.add(key);
  }
  const kept=[];for(let i=0;i<I.length;i+=3)if(!remove.has(find(I[i])))kept.push(I[i],I[i+1],I[i+2]);
  return {p:P,c:sn.c,i:new Uint32Array(kept),v:3};
 }
 // Saved meshes have lost their material IDs. A waist cap is still identifiable
 // as a broad planar fan with a central hub; clothes, limbs and small caps are
 // excluded. Recolor a copy only: positions, indices and the saved file survive.
 function repairStoredWaist(sn){
  if(sn.waistSurface)return sn;
  const P=sn.p,I=sn.i,planes=new Map(),a=V3(),b=V3(),c=V3(),ab=V3(),ac=V3(),normal=V3();
  for(let k=0;k<I.length;k+=3){
   a.fromArray(P,I[k]*3);b.fromArray(P,I[k+1]*3);c.fromArray(P,I[k+2]*3);normal.crossVectors(ab.subVectors(b,a),ac.subVectors(c,a));
   const area=normal.length()*.5;if(area<1e-8)continue;normal.normalize();
   const major=Math.abs(normal.x)>.7?normal.x:Math.abs(normal.y)>.7?normal.y:normal.z;if(major<0)normal.negate();
   const d=normal.dot(a),key=[normal.x,normal.y,normal.z,d].map((v,i)=>Math.round(v*(i===3?100:40))).join(',');
   let g=planes.get(key);if(!g)planes.set(key,g={area:0,ids:new Map(),normal:normal.clone()});g.area+=area;
   for(let j=0;j<3;j++)g.ids.set(I[k+j],(g.ids.get(I[k+j])||0)+1);
  }
  let color=null;
  for(const g of planes.values()){
   if(g.area<.12||g.area>.46||g.ids.size<24)continue;
   let hub=-1,degree=0;for(const [i,n] of g.ids)if(n>degree){hub=i;degree=n;}if(degree<14)continue;
   const center=V3().fromArray(P,hub*3);let maxR=0,minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
   for(const i of g.ids.keys()){a.fromArray(P,i*3);maxR=Math.max(maxR,a.distanceTo(center));minX=Math.min(minX,a.x);maxX=Math.max(maxX,a.x);minY=Math.min(minY,a.y);maxY=Math.max(maxY,a.y);minZ=Math.min(minZ,a.z);maxZ=Math.max(maxZ,a.z);}
   if(maxR<.22||maxR>.46||Math.hypot(center.x-(minX+maxX)/2,center.y-(minY+maxY)/2,center.z-(minZ+maxZ)/2)>.07)continue;
   if(!color)color=sn.c.slice();
   for(const i of g.ids.keys()){
    a.fromArray(P,i*3).sub(center);const grain=.5+.24*Math.sin(a.x*79+a.y*43)*Math.sin(a.z*67-a.x*31)+.15*Math.sin(a.z*23-a.y*37);
    color[i*3]=Math.round(4+grain*10);color[i*3+1]=Math.round(8+grain*14);color[i*3+2]=Math.round(12+grain*15);
   }
  }
  return {...sn,c:color||sn.c,waistSurface:1};
 }
 // Legacy geometry filtering runs off the render thread on browsers with workers.
 let haloWorker=null,haloTicket=0;
 const haloPending=new Map();
 function stopHaloWorker(){
  if(haloWorker)haloWorker.terminate();haloWorker=null;
  for(const job of haloPending.values())job.resolve(job.sn);haloPending.clear();
 }
 function migrateStoredHalo(sn){
  if(sn.v>=3&&sn.waistSurface)return Promise.resolve(sn);
  if(typeof Worker==='undefined')return new Promise(resolve=>setTimeout(()=>resolve(repairStoredWaist(stripStoredHalo(sn))),0));
  try{
   if(!haloWorker){
    const code='importScripts('+JSON.stringify(new URL('three.min.js',document.baseURI).href)+');const PI=Math.PI,TAU=PI*2,V3=(...a)=>new THREE.Vector3(...a);'+stripStoredHalo.toString()+';'+repairStoredWaist.toString()+';onmessage=e=>{const {id,sn}=e.data;try{postMessage({id,sn:repairStoredWaist(stripStoredHalo(sn))})}catch(_){postMessage({id,sn})}};';
    const url=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
    try{haloWorker=new Worker(url);}finally{URL.revokeObjectURL(url);}
    haloWorker.onmessage=e=>{const job=haloPending.get(e.data.id);if(job){haloPending.delete(e.data.id);job.resolve(e.data.sn);} };
    haloWorker.onerror=()=>stopHaloWorker();
   }
   return new Promise(resolve=>{const id=++haloTicket;haloPending.set(id,{resolve,sn});try{haloWorker.postMessage({id,sn});}catch(_){haloPending.delete(id);resolve(sn);}});
  }catch(_){stopHaloWorker();return Promise.resolve(sn);}
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
   if(job.i<job.meshes.length){if(jobMesh(job,job.meshes[job.i],until))job.i++;else break;continue;}
   const r=job.n?jobFinish(job,until):{};
   if(r===null)break; // 다음 프레임에 이어서
   S.jobs.shift();job.finished=true;if(job.done)job.done(job.n?r:null);
  }
 }
 const snapCell=()=>lite()>=2?.028:(MOBILE_GPU?.018:.014);
 /* 저장: 본뜬 몸·조각은 IndexedDB에 둔다(없거나 막혀 있으면 이번 판에서만 유지) */
 const DB=(()=>{
  let pr=null;
  const open=()=>pr||(pr=new Promise(res=>{try{const r=indexedDB.open('palja-free',1);r.onupgradeneeded=()=>{try{r.result.createObjectStore('snap');}catch(_){}};r.onsuccess=()=>res(r.result);r.onerror=r.onblocked=()=>res(null);}catch(_){res(null);}}));
  const tx=(mode,fn)=>open().then(db=>db?new Promise(res=>{try{const t=db.transaction('snap',mode),rq=fn(t.objectStore('snap'));t.oncomplete=()=>res(rq?rq.result:null);t.onerror=t.onabort=()=>res(null);}catch(_){res(null);}}):null);
  return {put:(k,v)=>tx('readwrite',st=>st.put(v,k)),get:k=>tx('readonly',st=>st.get(k)),del:k=>tx('readwrite',st=>st.delete(k)),clear:()=>tx('readwrite',st=>st.clear())};
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

 /* ---- 바닥 조각: 머리와 팔다리를 낮게 눕혀 가까운 바닥부터 방 끝까지 흩어 쌓는다 ---- */
 const HEAP_STORE='palja.heap',HEAP_VERSION=4,HEAP_MAX=280,HEAP_BAND=10,HEAP_STEP=1.45;
 const HEAP={list:[],fly:[],wait:[],seq:0,batches:new Map(),pending:new Map(),legacy:[]};
 function saveHeap(){
  const entries=new Map(HEAP.pending);for(const h of HEAP.list)entries.set(h.id,[h.id,h.side,HEAP_VERSION]);
  const l=[...entries.values()].sort((a,b)=>a[0]-b[0]).slice(-HEAP_MAX);
  try{localStorage.setItem(HEAP_STORE,JSON.stringify({v:HEAP_VERSION,q:HEAP.seq,l}));}catch(_){}
 }
 // 열 조각마다 조금씩 더 먼 바닥을 쓴다. 방향·간격을 흩뜨려 줄이나 두 개의 탑이 되지 않게 한다.
 // 방이 찬 뒤에는 오래된 조각의 자리를 다시 채운다(거리별 묶음으로 그려 오래 해도 부하가 늘지 않는다).
 function heapSpot(id,side){
  const k=(id-1)%HEAP_MAX,band=Math.floor(k/HEAP_BAND),r=rng(id*7919+23);
  return V3(side*(.18+r()*1.65),.012,-1.7-band*HEAP_STEP-r()*1.35);
 }
 // Read the actual surviving surface once when a piece is collected. A rotated
 // mesh bounding box contains empty corners, and cut meshes can retain unused
 // vertices: neither is a physical support point.
 function heapVertices(obj){
  obj.updateWorldMatrix(true,true);
  const inv=obj.matrixWorld.clone().invert(),rel=new THREE.Matrix4(),v=V3(),points=[];
  obj.traverse(o=>{
   if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;
   for(let n=o;n;n=n.parent){if(!n.visible||n.name==='halo'||n.userData.factoryDiscard)return;if(n===obj)break;}
   const mat=Array.isArray(o.material)?o.material[0]:o.material;
   if(!mat||mat.visible===false||!mat.color||mat.colorWrite===false||mat.blending!==THREE.NormalBlending||mat.transparent&&mat.opacity<.5)return;
   const flesh=o.userData.flesh;if(flesh&&flesh.bake)flesh.bake();
   const g=o.geometry,A=g.attributes.position,I=g.index,seen=I?new Uint8Array(A.count):null;
   const start=g.drawRange.start,end=Math.min(I?I.count:A.count,start+g.drawRange.count);
   rel.multiplyMatrices(inv,o.matrixWorld);
   for(let k=start;k<end;k++){
    const i=I?I.getX(k):k;if(seen){if(seen[i])continue;seen[i]=1;}
    v.fromBufferAttribute(A,i).applyMatrix4(rel);points.push(v.x,v.y,v.z);
   }
  });
  return new Float32Array(points);
 }
 function heapBounds(obj,points,q){
  const box=new THREE.Box3(),v=V3();
  for(let i=0;i<points.length;i+=3)box.expandByPoint(v.fromArray(points,i).multiply(obj.scale).applyQuaternion(q));
  return box;
 }
 function heapPose(obj,points,id,side){
  const box=heapBounds(obj,points,new THREE.Quaternion());
  const size=box.getSize(V3()),axis=size.x>size.y?(size.x>size.z?'x':'z'):(size.y>size.z?'y':'z');
  const r=rng(id*3571+61),a=r()*TAU,dir=V3(Math.cos(a),0,Math.sin(a)),along=V3();along[axis]=1;
  // 가장 긴 방향을 바닥에 눕힌 뒤 그 축으로 굴린다. 팔·다리가 서 있는 모양으로 굳지 않는다.
  const q=new THREE.Quaternion().setFromAxisAngle(dir,r()*TAU).multiply(new THREE.Quaternion().setFromUnitVectors(along,dir));
  const bounds=heapBounds(obj,points,q),center=bounds.getCenter(V3()),to=heapSpot(id,side);
  to.x=clamp(to.x,-HALL_W+.12+(bounds.max.x-bounds.min.x)/2,HALL_W-.12-(bounds.max.x-bounds.min.x)/2)-center.x;
  to.z-=center.z;to.y-=bounds.min.y;
  bounds.translate(to);
  // Box overlap alone is not contact: never lift a piece onto empty space
  // between the legs of another piece. Each discarded surface rests on the floor.
  return {to,q,bounds};
 }
 // 먼 조각은 여러 개를 메시 하나로 그린다. 개별 본은 저장·교체용으로만 남긴다.
 function heapBatchKey(bounds){return bounds.max.z>-6?-1:Math.floor((-bounds.min.z-1.7)/(HEAP_STEP*2));}
 function dirtyHeapBatch(key){if(key<0)return;let b=HEAP.batches.get(key);if(!b){b={mesh:null,dirty:true};HEAP.batches.set(key,b);}b.dirty=true;}
 function updateHeapBatches(){
  for(const [key,b] of HEAP.batches){if(!b.dirty)continue;
   const list=HEAP.list.filter(h=>h.batch===key).map(h=>h.mesh);
   if(b.mesh){b.mesh.removeFromParent();b.mesh.geometry.dispose();b.mesh=null;}
   if(list.length){
    root.updateMatrixWorld(true);
    const geo=mergeMeshes(list,new THREE.Matrix4()),colors=new Uint8Array(geo.attributes.position.count*3);
    // r128의 getX()는 normalized 색도 0~255로 반환한다. 저장된 바이트를 그대로 이어 밝기를 보존한다.
    let offset=0;for(const m of list){const c=m.geometry.attributes.color.array;colors.set(c,offset);offset+=c.length;}
    geo.setAttribute('color',new THREE.BufferAttribute(colors,3,true));geo.deleteAttribute('uv');
    b.mesh=new THREE.Mesh(geo,snapMat);b.mesh.castShadow=false;b.mesh.receiveShadow=false;root.add(b.mesh);
    for(const m of list)m.visible=false;
   }
   b.dirty=false;break; // 한 프레임에 거리 구간 하나만 갱신
  }
 }
 function heapAdd(id,side,sn){
  const mesh=snapMesh(sn);mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox.clone(),batch=heapBatchKey(bounds);
  root.add(mesh);HEAP.list.push({id,side,mesh,bounds,batch});HEAP.list.sort((a,b)=>a.id-b.id);dirtyHeapBatch(batch);
  while(HEAP.list.length>HEAP_MAX){const o=HEAP.list.shift();o.mesh.removeFromParent();o.mesh.geometry.dispose();dirtyHeapBatch(o.batch);DB.del('h'+o.id);}
 }
 function queueHeap(owner,b,delay=0){
  if(!S.on||!b||!b.obj||!b.obj.parent)return null;
  if(owner){owner.bits=(owner.bits||[]).filter(x=>x!==b);
   for(const key of ['severed','severedHeads','headPieces','looseEyes'])if(owner[key])owner[key]=owner[key].filter(o=>o!==b.obj);}
  b.twitch=null;b.bleed=null;scene.attach(b.obj);
  const id=++HEAP.seq,p=b.obj.position,side=Math.abs(p.x)>.15?Math.sign(p.x):id%2?1:-1;
  const points=heapVertices(b.obj);if(!points.length)return null;
  const target=heapPose(b.obj,points,id,side),distance=p.distanceTo(target.to);
  for(let i=S.slides.length-1;i>=0;i--)if(S.slides[i].obj===b.obj)S.slides.splice(i,1);
  return {id,obj:b.obj,owner,side,t:-delay,dur:clamp(.55+distance*.018,.6,1.3),from:p.clone(),to:target.to,bounds:target.bounds,q0:b.obj.quaternion.clone(),q1:target.q,big:b.r>.1};
 }
 // 머리도 다른 신체 조각과 같은 경로로 바닥으로 보낸다.
 function toHeap(owner,b,delay=0){const f=queueHeap(owner,b,delay);if(!f)return false;HEAP.fly.push(f);return true;}
 function overflow(owner,obj){
  if(!S.on||!owner.keepBits)return false;
  const b=(owner.bits||[]).find(x=>x.obj===obj);
  return b?toHeap(owner,b,0):false;
 }
 function heapLand(f){
  f.obj.position.copy(f.to);f.obj.quaternion.copy(f.q1);
  const id=f.id,w={obj:f.obj,owner:f.owner,side:f.side,id,bounds:f.bounds,job:null};
  const cell=f.to.z<-18?.085:f.to.z<-6?.05:(MOBILE_GPU||lite()>0)?.034:.027;
  w.job=newJob(f.obj,root,cell,sn=>{
   const k=HEAP.wait.indexOf(w);if(k>=0)HEAP.wait.splice(k,1);
   releaseObj(w.obj,w.owner);
   // Vertex clustering can move the lowest point upward. Re-seat the final
   // rendered snapshot as well, without changing its landing orientation.
   if(validSnap(sn)){sn=groundStoredPiece(sn,false);heapAdd(id,w.side,sn);DB.put('h'+id,sn);saveHeap();
    if(f.legacyItem){f.legacyItem.head=0;saveRecord();}}
  });
  HEAP.wait.push(w);S.jobs.unshift(w.job);
 }
 function updateHeap(dt){
  if(!S.seq&&HEAP.legacy.length)migrateHead(HEAP.legacy.shift());
  for(let i=HEAP.fly.length-1;i>=0;i--){
   const f=HEAP.fly[i];if(!f.obj.parent){HEAP.fly.splice(i,1);continue;}
   f.t+=dt;if(f.t<0)continue;
   if(!f.go){f.go=true;AUDIO.whoosh(f.big?.9:.6,'hook');}
   const u=clamp(f.t/f.dur,0,1),roll=smooth(u);
   f.obj.position.lerpVectors(f.from,f.to,u);f.obj.position.y+=Math.sin(u*PI)*(f.big?.55:.7);
   f.obj.quaternion.copy(f.q0).slerp(f.q1,roll);
   if(u>=1){HEAP.fly.splice(i,1);heapLand(f);AUDIO.slap(f.big?.8:.45,f.side*.5);if(f.big)AUDIO.squelch(.6);
    if(PREF.blood)BLOOD.spray(f.to,UP,f.big?10:5,{min:.4,max:1.4,spread:1.2});}
  }
  updateHeapBatches();
 }
 function flushHeap(){
  for(const f of HEAP.fly.splice(0)){if(f.obj.parent)heapLand(f);}
  for(const w of HEAP.wait.slice()){const k=S.jobs.indexOf(w.job);if(k>=0)S.jobs.splice(k,1);jobRun(w.job);}
 }
 function clearHeap(){
  for(const h of HEAP.list){h.mesh.removeFromParent();h.mesh.geometry.dispose();}
  for(const b of HEAP.batches.values())if(b.mesh){b.mesh.removeFromParent();b.mesh.geometry.dispose();}
  HEAP.batches.clear();HEAP.list.length=0;HEAP.fly.length=0;HEAP.wait.length=0;HEAP.pending.clear();HEAP.legacy.length=0;
 }
 function relocateLegacyHeap(sn,id,side){
  const b=new THREE.Box3();for(let i=0;i<sn.p.length;i+=3)b.expandByPoint(V3(sn.p[i],sn.p[i+1],sn.p[i+2]));
  const c=b.getCenter(V3()),to=heapSpot(id,side).sub(V3(c.x,b.min.y,c.z)),p=sn.p.slice();
  for(let i=0;i<p.length;i+=3){p[i]+=to.x;p[i+1]+=to.y;p[i+2]+=to.z;}
  return {...sn,p};
 }
 function groundStoredPiece(sn,lay=true){
  sn=packSnapshot(sn);
  const box=new THREE.Box3(),v=V3();for(let i=0;i<sn.p.length;i+=3)box.expandByPoint(v.fromArray(sn.p,i));
  const size=box.getSize(V3()),center=box.getCenter(V3()),q=new THREE.Quaternion();
  // Rotate rigidly, never rescale a cut surface or stretch the original vertices.
  if(lay&&size.y>Math.min(size.x,size.z)*1.2&&size.y>.2)q.setFromAxisAngle(size.x<size.z?V3(0,0,1):V3(1,0,0),PI/2);
  const p=sn.p.slice();let floor=Infinity;
  for(let i=0;i<p.length;i+=3){v.fromArray(p,i).sub(center).applyQuaternion(q);p[i]=v.x+center.x;p[i+1]=v.y;p[i+2]=v.z+center.z;floor=Math.min(floor,v.y);}
  for(let i=1;i<p.length;i+=3)p[i]+=.012-floor;
  return {...sn,p,v:3};
 }
 function migrateHeads(){
  // 기존 저장의 꼬챙이 머리도 버리지 않고 바닥으로 옮긴다. 성공한 것만 기록을 바꿔 다음 접속에 중복되지 않게 한다.
  HEAP.legacy=S.items.filter(it=>it.head===2);
 }
 function migrateHead(it){
  const obj=proxyHead(it.seed);root.add(obj);
  const f=queueHeap(null,{obj,r:.18},0);if(f){f.legacyItem=it;heapLand(f);}else releaseObj(obj,null);
 }
 function loadHeap(){
  let rec=null;try{rec=JSON.parse(localStorage.getItem(HEAP_STORE)||'null');}catch(_){}
  if(!rec||!Array.isArray(rec.l)){migrateHeads();return;}
  HEAP.seq=Math.max(HEAP.seq,Number.isSafeInteger(rec.q)?rec.q:0);
  const gen=S.gen;
  const entries=rec.l.slice(-HEAP_MAX).filter(e=>Array.isArray(e)&&Number.isSafeInteger(e[0])&&e[0]>0);
  for(const e of entries){HEAP.seq=Math.max(HEAP.seq,e[0]);HEAP.pending.set(e[0],[e[0],e[1],e[2]||rec.v||1]);}
  Promise.all(entries.map(async e=>{
   const id=e[0],side=e[1]<0?-1:1;let sn=await DB.get('h'+id);
   if(gen!==S.gen||!S.on)return;
   if(validSnap(sn)&&!HEAP.list.some(h=>h.id===id)){
    const version=e[2]||rec.v||1;
    if(version<HEAP_VERSION){if(version<2)sn=relocateLegacyHeap(sn,id,side);sn=groundStoredPiece(sn,version<3);await DB.put('h'+id,sn);if(gen!==S.gen||!S.on)return;}
    sn=await migrateStoredHalo(sn);if(gen!==S.gen||!S.on)return;
    heapAdd(id,side,sn);
   }
   HEAP.pending.delete(id);
  })).then(()=>{if(gen!==S.gen||!S.on)return;saveHeap();migrateHeads();});
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
 // 앞쪽 네 구는 상처·원래 재질을 유지한다. 프레임이 크게 떨어지는 최저 성능 단계만 두 구로 줄인다.
 const realCap=()=>lite()>=2?2:4;
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
  for(const it of reals.slice(0,Math.max(0,reals.length-realCap()))){if(it.snap)toProxy(it);else startSnap(it);}
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
  while(arr.length>ROW_CAP){const it=arr.pop();const i=S.items.indexOf(it);if(i>=0)S.items.splice(i,1);disposeItem(it);DB.del('b'+it.ord);}
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
  const holder=makeHolder(),pool=mk(GEOS.pool,poolMat,root,{r:[-PI/2,0,0],cast:false,receive:true});
  holder.userData.restYaw=(rng(seed+73)()-.5)*.22;pool.rotation.z=rng(seed+19)()*TAU;
  pool.renderOrder=1;pool.visible=false;root.add(holder);
  return {ord,look,seed,limbs,head,line:ord%ROWX.length,k:0,holder,pool,real:null,proxy:null,free:false,moving:false,
   pos:V3(),cur:V3(),swx:new Spring(15,1.5),swz:new Spring(15,1.5),ph:(seed%628)/100,poolK:0,fine:false,ready:true};
 }

 /* ---- 켜고 끄기 ---- */
 function clearAll(){
  setView(false);
  S.gen++;stopHaloWorker();
  // 아직 본뜨지 못한 실제 몸과 조각은 나가기 전에 마저 굳혀 저장한다(다음에 그 모습 그대로 걸려 있게)
  // (청소할 때는 남기지 않는다: 날아가는 중이거나 굳히기를 기다리는 조각도 그대로 버린다)
  if(S.on&&!S.wipe){for(const it of S.items)if(it.real&&!it.snap)try{finishSnap(it);}catch(_){}
   try{flushHeap();}catch(_){}}
  if(S.wipe){for(const f of HEAP.fly)if(f.obj.parent)try{releaseObj(f.obj,f.owner);}catch(_){}
   for(const w of HEAP.wait)if(w.obj.parent)try{releaseObj(w.obj,w.owner);}catch(_){}}
  for(const j of S.jobs)j.cancel=true;S.jobs.length=0;
  clearHeap();
  for(const it of S.items)disposeItem(it);
  S.items.length=0;for(const l of S.lines)l.length=0;
  if(S.seq&&S.seq.holder&&!S.seq.item)S.seq.holder.removeFromParent();
  S.seq=null;S.reviving=false;S.railDrop=null;S.slides.length=0;
  LEASH.hide();
 }
 function begin(){
  clearAll();
  const rec=loadRecord();S.total=rec.n;
  const gen=S.gen;
  rec.list.forEach((e,i)=>{
   const ord=S.total-rec.list.length+i,it=newItem(ord,e.l,e.s,e.p,e.h);it.waist=!!e.w;it.poolK=1;it.ready=false;
   S.items.push(it);S.lines[it.line].unshift(it);
   // 저장해 둔 그 몸의 본을 읽는다(있으면 그 모습으로, 없으면 일반 모형으로 건다)
   DB.get('b'+ord).then(async sn=>{if(gen!==S.gen)return;if(validSnap(sn)){it.snap=await migrateStoredHalo(sn);if(gen!==S.gen)return;}it.ready=true;});
  });
  setRows(rowHalf());
  S.on=true;root.visible=true;loadHeap();S.railsOn=S.items.length>0;rails.visible=S.railsOn;rails.position.y=0;
  S.ui='';S.tool='';cleanUI(true);syncUI();
 }
 function suspend(){
  if(AUDIO.factoryRoom)AUDIO.factoryRoom(false,false,0);
  if(!S.on&&!S.items.length){stage(false);cleanUI(false);return;}
  clearAll();S.on=false;root.visible=false;stage(false);
  $('#freeBar').hidden=true;$('#freeCount').hidden=true;S.ui='';cleanUI(false);
 }

 /* ---- 「청소하기」: 걸린 몸·머리·무더기·저장해 둔 기록을 전부 지운다. 바닥 자국과 지금 족치던 놈은 그 뒤 판을 새로 시작하면서 치워진다 ---- */
 function clean(){
  if(!S.on)return false;
  S.wipe=true;
  try{clearAll();}finally{S.wipe=false;}
  S.total=0;HEAP.seq=0;S.railsOn=false;rails.visible=false;
  try{localStorage.removeItem(HUNG_STORE);localStorage.removeItem(HEAP_STORE);}catch(_){}
  DB.clear();
  S.ui='';
  return true;
 }
 // 설정 창 「처음부터 다시」 밑에 버튼을 단다(이 모드에서만 보인다). 한 번 누르면 되묻고, 한 번 더 누르면 치운다
 const CLEAN_UI=(()=>{
  const reset=$('#resetFight');if(!reset)return null;
  const btn=document.createElement('button');btn.type='button';btn.id='freeClean';btn.className='btn soft';btn.hidden=true;
  const note=document.createElement('p');note.id='freeCleanNote';note.hidden=true;note.textContent='걸어 둔 몸과 바닥의 머리·신체 조각, 바닥 자국을 전부 치웁니다.';
  reset.insertAdjacentElement('afterend',btn);btn.insertAdjacentElement('afterend',note);
  let armed=false,timer=0;
  const label=()=>{btn.textContent=armed?'정말 다 치우기 · 되돌릴 수 없습니다':'청소하기';btn.classList.toggle('armed',armed);};
  const disarm=()=>{clearTimeout(timer);armed=false;label();};
  btn.addEventListener('click',()=>{
   if(!armed){armed=true;label();clearTimeout(timer);timer=setTimeout(disarm,4500);return;}
   disarm();
   if(!clean())return;
   reset.click(); // 설정 창을 닫고 빈 방에서 새 판을 시작한다(fight.js의 「처음부터 다시」와 같은 길)
   AUDIO.whoosh(1,'hook');AUDIO.railStop(.9);flash(.22);hint('싹 치웠습니다',2.6);
  });
  label();
  return {btn,note,disarm};
 })();
 function cleanUI(on){if(!CLEAN_UI)return;CLEAN_UI.btn.hidden=CLEAN_UI.note.hidden=!on;CLEAN_UI.disarm();}

 // 전체를 둘러볼 때만 싸우던 놈과 내 손을 잠시 치운다. 돌아오면 같은 상태로 이어 한다.
 function setView(on){
  on=!!on;if(on===S.view)return false;
  if(on&&(!S.on||!S.total||S.seq||G.inputLocked||G.paused))return false;
  clearPointers();clearCombatAccent();clearTalk();
  S.view=on;G.inputLocked=on;
  if(on){
   const E=G.E;
   S.viewHidden=[E&&E.root,E&&E.crown,E&&E.tablet,E&&E.tie,E&&E.halo&&E.halo.root,VM.root,COMBAT_STAGE.contact]
    .filter((o,i,a)=>o&&a.indexOf(o)===i).map(o=>({o,visible:o.visible}));
   for(const item of S.viewHidden)item.o.visible=false;
  }else{for(const item of S.viewHidden)item.o.visible=item.visible;S.viewHidden=[];}
  $('#fight').classList.toggle('free-view',on);$('#dock').hidden=on;
  $('#hint').classList.add('off');S.ui='';syncUI();focusCanvas();return true;
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
 // The bright palace cube map cannot reflect a dark factory. Apply once per
 // opponent; detached parts share these same materials and retain this finish.
 function factoryLook(E){
  if(E._factoryLook)return;E._factoryLook=true;
  for(const m of Object.values(E.M)){
   if(!m||!m.isMeshStandardMaterial)continue;
   m.userData.factoryMatte=true;m.envMap=null;m.envMapIntensity=0;
   if(m.userData.fleshU){m.userData.fleshU.uMatte.value=.86;m.userData.fleshU.uSSS.value=0;}
   m.roughness=Math.max(m.roughness,.86);m.metalness=Math.min(m.metalness,.22);
   if(m.emissive)m.emissiveIntensity=0;
   m.needsUpdate=true;
  }
  const h=E.halo;if(!h)return;h.factoryMatte=true;
  // Keep the rotating symbol and damage behavior, but make the ring receive
  // the room's light. No unlit glow disc or flame fringe survives a repaint.
  for(const [key,mesh] of [['zod',h.outer],['tri',h.inner],['plate',h.plate]]){
   const old=h.M[key],m=new THREE.MeshStandardMaterial({map:old.map,color:old.color.clone(),transparent:true,alphaTest:old.alphaTest,side:THREE.DoubleSide,roughness:.96,metalness:0});
   h.M[key]=mesh.material=m;E.disposables.push(m);
  }
  h.M.gold.userData.factoryMatte=true;h.M.gold.envMap=null;h.M.gold.envMapIntensity=0;h.M.gold.metalness=.18;h.M.gold.roughness=.94;h.M.gold.needsUpdate=true;
  E.haloPaint(h.bright);
 }
 // 되살린 놈은 내 손이 올라가기만 해도 움찔하며 얼굴을 가린다
 // 겁먹은 새 놈: 비웃지 않고, 돈다발도 없이, 처음부터 2단계(겁먹은 얼굴·눈물)로 선다
 function scare(E){
  E.dread=true;E.taunt=false;if(E.phase<2)E.setPhase(2);
  if(E.tabletHeld){E.tabletHeld=false;if(E.tabletMesh)E.tabletMesh.visible=false;if(E.tablet)E.tablet.removeFromParent();}
  E.setEmotion('scared');E.whimperT=G.time+rnd(.7,1.5);
 }
 function flinch(){
  const E=G.E;if(!S.on||!E||!(E.reviveCount>0||E.dread)||!combatActive(E)||E.combat.mode!=='stand'||E.guardCool>0||E.tabletHeld||E.headDestroyed)return;
  E.guardHold=Math.max(E.guardHold,.8);E.doFlinch('shock',.7);E.panic=Math.max(E.panic,.6);
 }
 function fear(E,dt){
  const b=E.combat;if(!b||!combatActive(E))return;
  const scared=E.reviveCount>0||!!E.dread;
  // 끌려온 놈: 맞기 전부터 겁에 질려 계속 떤다
  if(E.dread){E.taunt=false;if(E.phase<2)E.setPhase(2);if(b.mode==='stand')E.tremble=Math.max(E.tremble,1.25);}
  if(E.reviveCount>0){E.taunt=false;if(E.phase<3)E.setPhase(3);
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
 // Split the sealing triangles from the clothing mesh. Reusing its UVs pulls
 // the robe's gold stripes into a candy-wrapper fan, especially after baking.
 function finishWaistSurface(E,mesh,start){
  const g=mesh.geometry,I=g.index,A=g.attributes;
  if(!Number.isInteger(start)||!I||start>=I.count)return;
  const map=new Map(),p=[],n=[],colors=[],idx=[];
  const deep=new THREE.Color('#21313d').convertSRGBToLinear(),tissue=new THREE.Color('#52636a').convertSRGBToLinear(),safe=new THREE.Color('#39463b').convertSRGBToLinear(),c=new THREE.Color();
  for(let k=start;k<I.count;k++){
   const old=I.getX(k);let i=map.get(old);
   if(i===undefined){i=map.size;map.set(old,i);const x=A.position.getX(old),y=A.position.getY(old),z=A.position.getZ(old);
    p.push(x,y,z);n.push(A.normal.getX(old),A.normal.getY(old),A.normal.getZ(old));
    // Spatial mottling, independent of the rings used to triangulate the cut.
    const grain=.5+.23*Math.sin(x*79+z*43)*Math.sin(z*67-x*31)+.16*Math.sin(x*23-z*37);
    c.copy(PREF.blood?deep:safe);if(PREF.blood)c.lerp(tissue,grain);else c.multiplyScalar(.7+grain*.3);
    colors.push(c.r,c.g,c.b);
   }
   idx.push(i);
  }
  const face=new THREE.BufferGeometry();face.setAttribute('position',new THREE.Float32BufferAttribute(p,3));face.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));face.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));face.setIndex(idx);face.computeBoundingSphere();
  const mat=E.M.waistCut||(E.M.waistCut=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,metalness:0,side:THREE.DoubleSide}));
  if(!E.disposables.includes(mat))E.disposables.push(mat);E.disposables.push(face);
  const cap=new THREE.Mesh(face,mat);cap.name='waist-cut-surface';cap.receiveShadow=true;cap.userData.noHit=true;mesh.add(cap);
  g.setIndex(new THREE.BufferAttribute(I.array.slice(0,start),1));
  if(mesh.userData.flesh)mesh.userData.flesh.setGeometry(g,true);
 }
 // Once the waist is severed, the open coat tails sag against the legs.
 // Keeping the standing coat's flared cylinder makes the fragment look like a stool.
 function foldWaistCloth(E){
  const apron=E.apronB;if(!apron||apron.userData.waistFolded)return;
  const replaced=new Map();
  apron.traverse(m=>{
   if(!m.isMesh||!m.geometry)return;const old=m.geometry,p=old.parameters;
   if(!p||p.height==null||p.thetaLength==null)return;
   let g=replaced.get(old);
   if(!g){
    g=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,p.radialSegments,10,p.openEnded,p.thetaStart,p.thetaLength);
    const P=g.attributes.position;
    for(let i=0;i<P.count;i++){
     const x=P.getX(i),y=P.getY(i),z=P.getZ(i),t=clamp((p.height/2-y)/p.height,0,1),k=smooth(t),a=Math.atan2(x,z);
     P.setXYZ(i,x*(1-.36*k)+.012*k*Math.sin(a*5),y+.026*k*Math.sin(a*3+.7),z*(1-.68*k)+.018*k*Math.sin(a*7+.4));
    }
    if(old.attributes.aDmg)g.setAttribute('aDmg',new THREE.BufferAttribute(new Float32Array(P.count*4),4));
    g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();replaced.set(old,g);E.disposables.push(g);
   }
   m.geometry=g;
  });
  for(const old of replaced.keys())E.releaseGeometry(old);
  apron.userData.waistFolded=true;
 }
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
  // 3) _planeCut already seals both halves along the actual belly contour.
  // An enlarged circular limb cap obscured that cut with a separate round lid.
  finishWaistSurface(E,E.belly,cut.capStart[0]);finishWaistSurface(E,cut.piece,cut.capStart[1]);
  foldWaistCloth(E);
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
 // walkA까지 끌려오다 → walkB까지 버티고 → walkC에 확 끌려와 선다
 const T={hook:.2,pierce:.9,release:1.08,shove:1.3,haulDur:.55,walkDelay:.3,walkA:.6,walkB:1.0,walkC:1.5,sit:.35};
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
  E.hang={from,pose:hangingPose((S.total+1)*7919+E.lookIndex*137),u:0,x:clamp(b.x,-.55,.55),z:clamp(b.z,.95,1.45),lift:.3,sag:0,back:0,swing:0,swingZ:0,kick:E.headDestroyed&&!deityHasReptileVoice(E)?.55:1};
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
 function hideFactoryHalo(E){
  const h=E&&E.halo;if(!h)return;
  const r=h.root;r.userData.factoryDiscard=true;r.visible=false;r.removeFromParent();
  h.on=false;h.dark=1;h.goDark=true;h.fallAt=0;h.falling={t:0,loose:true};
  // No dropped ring or broken wedge remains in the room.
  E.bits=(E.bits||[]).filter(b=>{if(b.obj!==r&&b.sound!=='halo')return true;if(b.obj){b.obj.visible=false;b.obj.removeFromParent();if(b.obj!==r)releaseObj(b.obj,E);}return false;});
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
  hideFactoryHalo(E);
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
  S.total++;S.items.push(it);q.item=it;saveRecord();
  // 바닥 조각은 무더기로
  let n=heapBits(old,0);for(const o of S.items)if(o.real&&o.real!==old)n=heapBits(o.real,n);
  // 새 놈
  const E=new Emperor(G.result,PROGRESS.defeated+S.total);
  E.bloodRawBase=BLOOD.rawLost;E.holdRegrow=E.keepBits=true;E.idleT=1e9;E.sobT=1e9;
  wireEmperor(E);G.E=E;BLOOD.handover(E);scare(E);E.flailSeed=rnd(0,TAU);
  combatInit(E,false);factoryLook(E);E.combat.locked=true;E._combatScripted=true;
  if(lite()<2){metalEnv(E.root);metalEnv(E.crown);}
  E.walkIn={t:-T.walkDelay,u:0,sit:0,side:-side,from:innerWidth<innerHeight?1.5:1.75,z:1.0,stepK:0,phase:0,lookDir:side,frozen:false,balk:0,step:0,cue:0};
  E.root.visible=false;
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
  const E=q.E;E.walkIn=null;LEASH.release(E);
  combatInit(E,false);E.combat.x=0;E.combat.z=1.0;E.idleT=1.6;E.sobT=G.time+3;scare(E);E.panic=Math.max(E.panic,.8);
 }
 /* 끌고 오는 사슬: 두 손목을 어깨너비 쇠막대(형틀) 양 끝에 채우고, 막대 가운데에서 사슬이 몸 앞 위쪽으로 팽팽하게 뻗는다. 다 오면 풀려서 위로 딸려 올라간다 */
 const LEASH=(()=>{
  const g=grp(root,null,'leash');g.visible=false;
  const chain=mk(cylGeo(.012,.012,1,6),iron,g,{cast:false}),bar=mk(cylGeo(.026,.026,1,8),ironD,g,{cast:false});
  const cuffs=[0,1].map(()=>mk(cylGeo(.05,.05,.07,10),iron,g,{cast:false}));
  chain.frustumCulled=bar.frustumCulled=false;for(const c of cuffs)c.frustumCulled=false;metalEnv(g);
  const st={E:null,up:0},top=V3(),d=V3(),wL=V3(),wR=V3(),m=V3(),t=V3(),fd=V3(),pd=V3(),ax=V3(),lift=V3();
  function place(){
   const E=st.E,a=E.arms;a[0].wr.getWorldPosition(wL);a[1].wr.getWorldPosition(wR);
   m.addVectors(wL,wR).multiplyScalar(.5);
   // 풀린 뒤에는 막대째 천장 쪽으로 딸려 올라간다
   if(st.up>0){lift.subVectors(top,m).multiplyScalar(smooth(clamp(st.up,0,1)));m.add(lift);wL.add(lift);wR.add(lift);}
   ax.subVectors(wR,wL);const wide=Math.max(.05,ax.length());ax.multiplyScalar(1/wide);
   bar.position.copy(m);bar.quaternion.setFromUnitVectors(UP,ax);bar.scale.set(1,wide+.16,1);
   cuffs[0].position.copy(wL);cuffs[1].position.copy(wR);for(const c of cuffs)c.quaternion.copy(bar.quaternion);
   d.subVectors(top,m);const len=Math.max(.01,d.length());
   chain.position.copy(m).addScaledVector(d,.5);chain.quaternion.setFromUnitVectors(UP,d.multiplyScalar(1/len));chain.scale.set(1,len,1);
  }
  function pull(E){
   const w=E.walkIn;if(!w)return;
   st.E=E;st.up=0;g.visible=true;
   E.root.updateMatrixWorld(true);
   // 두 팔을 어깨높이에서 몸 앞으로 곧게 뻗는다(어깨 자리를 따라가므로 웅크리거나 몸을 젖혀도 얼굴·배에 파묻히지 않는다)
   const a=E.arms,ry=E.root.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry);
   a[0].sh.getWorldPosition(wL);a[1].sh.getWorldPosition(wR);
   const cx=(wL.x+wR.x)*.5,cy=(wL.y+wR.y)*.5,cz=(wL.z+wR.z)*.5;
   for(const sd of [-1,1]){
    t.set(cx+fx*.46+fz*sd*.24,cy+.05,cz+fz*.46-fx*sd*.24);E.root.worldToLocal(t);
    E.setIK(sd<0?'L':'R',{target:t,fd:fd.set(0,.25,1),pd:pd.set(0,-1,0),curl:.8,rate:16});
   }
   // 사슬은 몸이 향한 쪽 앞 위로 뻗는다
   top.set(cx+fx*2.0,3.7,cz+fz*2.0);
   place();
  }
  function release(E){if(st.E!==E||!g.visible)return;E.releaseIK('L',7);E.releaseIK('R',7);st.up=.001;AUDIO.chain(.8,7,.4);}
  function update(dt){
   if(!g.visible||st.up<=0)return;
   st.up+=dt/.32;if(st.up>=1||!st.E||!st.E.root.parent){hide();return;}
   place();
  }
  function hide(){g.visible=false;st.E=null;st.up=0;}
  return {pull,release,update,hide};
 })();
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
  // 새 놈: 손목이 묶여 끌려 나온다. 중간에 걸린 몸들을 보고 두 발로 버티다가, 사슬에 확 당겨져 자리에 선다
  const E=q.E,w=E.walkIn;
  if(w){
   w.t+=dt*q.speed;
   if(w.t>=0){
    const tw=w.t;
    if(!E.root.visible){E.root.visible=true;AUDIO.chain(.7,9,.7);}
    let u;
    if(tw<T.walkA)u=.72*tw/T.walkA;
    else if(tw<T.walkB)u=.72-.05*smooth((tw-T.walkA)/(T.walkB-T.walkA));
    else{const x=clamp((tw-T.walkB)/(T.walkC-T.walkB),0,1);u=.67+.33*(1-(1-x)*(1-x));}
    w.frozen=tw>=T.walkA&&tw<T.walkB;
    w.balk=damp(w.balk,w.frozen?1:0,w.frozen?16:9,dt);
    if(w.frozen&&w.cue<1){w.cue=1;E.setEmotion('shock');E.shockT=(T.walkB-T.walkA)/q.speed;E.voiceCool=0;AUDIO.voice('yelp',.9);AUDIO.chain(.9,4,.15);}
    if(tw>=T.walkB&&w.cue<2){w.cue=2;AUDIO.pull(.8);AUDIO.chain(1,6,.3);E.sp.chest.kick(4,0,0);E.sp.head.kick(-3,0,0);camHit({shake:.012});}
    w.u=clamp(u,0,1);
    const st=Math.floor(w.phase/PI);if(st!==w.step){w.step=st;if(w.stepK>.4)AUDIO.footstep(.45);}
    if(tw>=T.walkC){w.u=1;w.sit=(tw-T.walkC)/T.sit;if(w.sit>=1)seat(q);}
    if(E.walkIn)LEASH.pull(E);
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
    it.holder.rotation.set(it.swx.x*.05+Math.sin(time*.43+it.ph)*.0025,it.holder.userData.restYaw||0,it.swz.x*.05+Math.sin(time*.37+it.ph*1.7)*.002);
   }
   // 발밑에 고인 피: 다 밀려가 멈춘 뒤 천천히 번진다
   if(PREF.blood&&it.k<5){
    if(!it.moving)it.poolK=Math.min(1,it.poolK+dt*.12);
    it.pool.visible=it.poolK>.02;const s=.35+.65*it.poolK;
    it.pool.position.set(it.cur.x,.005,it.cur.z+.1);it.pool.scale.set(s*(.8+.3*Math.cos(it.ph)),s*(.6+.3*Math.sin(it.ph)),1);
   }else it.pool.visible=false;
  }

 }
 function update(dt){
  if(!S.on)return;
  if(S.railDrop){const r=S.railDrop;r.t+=dt/.7;const u=clamp(r.t,0,1);rails.position.y=5.2*(1-backOut(u,1.1));
   if(u>=1){rails.position.y=0;S.railDrop=null;AUDIO.railStop(1);camHit({shake:.02});}}
  for(const c of hidden)if(c.visible)c.visible=false;
  {const x=rowHalf();if(Math.abs(x-ROWX[1])>.004)setRows(x);}
  flicker(dt);
  if(AUDIO.factoryRoom)AUDIO.factoryRoom(!document.hidden&&!G.paused,S.items.length>0,dt);
  // 끌린 자국·벽에 튄 자국은 걸린 몸이 늘수록 짙어진다(빈 방은 깨끗하다). 피를 끄면 숨긴다
  {const on=!!PREF.blood,n=S.items.length;dragMat.opacity=.85*clamp(n/8,0,1);goreMat.opacity=.9*clamp((n-2)/12,0,1);
   for(const m of lanes)m.visible=on&&n>0;for(const m of wallGore)m.visible=on&&n>2;}
  updateItems(dt);
  // 겉모습 만들기는 프레임당 두 구씩, 가까운 칸(나중에 건 몸)부터
  {let n=0;for(let i=S.items.length-1;i>=0&&n<2;i--){const it=S.items[i];if(!it.real&&it.ready&&(!it.proxy||(it.fine&&it.k>=nearK()))){ensureMesh(it);n++;}}}
  updateHeap(dt);
  updateSeq(dt);LEASH.update(dt);
  if(!S.seq&&S.jobs.length)stepJobs(MOBILE_GPU?1.5:2.5);
  const E=G.E;
  if(E&&!S.seq){
   if(S.reviving&&!canRevive(E)&&!(E.regrowQ&&E.regrowQ.length)&&!E.regrowHead){S.reviving=false;E.holdRegrow=true;}
   if(!S.view)fear(E,dt);
  }
  // 성능 단계가 내려간 경우에도 이미 본뜬 몸부터만 정리해 한 프레임에 본뜨기가 몰리지 않게 한다.
  if(!S.seq){const reals=S.items.filter(it=>it.real);if(reals.length>realCap()&&reals[0].snap)toProxy(reals[0]);}
  syncUI();
 }
 function syncUI(){
  const E=G.E,show=S.on&&!S.seq&&(!G.inputLocked||S.view)&&!G.opening&&!G.paused;
  // 식칼을 처음 쥐면 허리 끊는 법을 알려 준다
  if(S.on&&G.tool!==S.tool){S.tool=G.tool;if(G.tool==='knife'&&E&&!E.bisected&&!G.inputLocked)hint('식칼: 배를 가로로 길게 다섯 번 그으면 허리가 끊깁니다',4.5);}
  const key=[show?1:0,canNext(E)?1:0,canRevive(E)&&!S.reviving?1:0,S.total,S.on?1:0,S.view?1:0].join();
  if(key===S.ui)return;S.ui=key;
  $('#freeBar').hidden=!show;
  $('#freeNext').disabled=S.view||!canNext(E);
  $('#freeRevive').disabled=S.view||!(canRevive(E)&&!S.reviving);
  $('#freeNext').hidden=$('#freeRevive').hidden=S.view;$('#freePhoto').hidden=!S.view;
  const view=$('#freeView');view.disabled=!S.total;view.textContent=S.view?'돌아가기':'둘러보기';view.setAttribute('aria-pressed',String(S.view));
  const c=$('#freeCount');c.hidden=!S.on||S.total<1;c.textContent='걸어 둔 천지신명 '+S.total.toLocaleString('ko-KR')+'놈';
 }
 // 거는 동안은 방 뒤쪽 레일까지 보이게 조금 물러선다. 끝나면 평소 구도로 돌아간다
 function camera3(dt){
  if(S.view){
   const aspect=innerWidth/Math.max(1,innerHeight),portrait=aspect<1;
   CAM.fovBase=portrait?52:46;
   const distance=Math.max(5.8,1.85/(Math.tan(CAM.fovBase*PI/360)*aspect));
   CAM.goalPos.set(0,3.55,ROW_Z0+distance);CAM.goalLook.set(0,1.65,-8);
   const k=1-Math.exp(-dt*4.5);CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
   return true;
  }
  const q=S.seq;if(!q)return false;
  const pr=innerWidth<innerHeight;
  // 손으로 들고 꿰는 동안은 평소 거리에서 조금 올려다보고(팔이 길게 늘어나지 않게), 끌려 올라간 뒤에 물러선다
  if(q.stage<3){const h=q.old.hang;CAM.goalPos.set(h.x*.5+.1,pr?1.72:1.7,h.z+(pr?3.9:3.3));CAM.goalLook.set(h.x*.6,pr?1.42:1.4,h.z-.2);}
  else{CAM.goalPos.set(0,pr?1.8:1.75,pr?6.0:5.4);CAM.goalLook.set(0,pr?1.55:1.5,-5);}
  const k=1-Math.exp(-dt*3.4);CAM.pos.lerp(CAM.goalPos,k);CAM.look.lerp(CAM.goalLook,k);
  return true;
 }
 // 이 모드에는 배경음악이 없다: fight.js가 매 프레임 부르는 음악 켜기를 이 모드 동안만 '끄기'로 바꿔 넘긴다
 if(typeof AUDIO.updateMusic==='function'){const um=AUDIO.updateMusic;AUDIO.updateMusic=function(wanted,quiet){return um.call(AUDIO,wanted&&!S.on,quiet);};}
 // 화면 둘레를 어둡게 누르고(도살장), 설정 창의 「청소하기」 버튼 모양을 잡는다
 {const st=document.createElement('style');st.textContent=
  '#fight.free-mode::after{background:radial-gradient(ellipse at 50% 44%,transparent 42%,rgba(2,6,4,.36) 100%)!important}'+
  '#fight.free-view::after{background:radial-gradient(ellipse at 50% 44%,transparent 55%,rgba(2,6,4,.2) 100%)!important}'+
  '#fight #freeClean{margin-top:10px}#fight #freeClean.armed{border-color:#b5553f;box-shadow:0 3px 0 #b5553f;color:#a3301c}'+
  '#fight #freeCleanNote{margin:8px 2px 0;font-size:12.5px;line-height:1.45;color:#686174}';
  document.head.appendChild(st);}
 $('#freeNext').addEventListener('click',()=>{AUDIO.unlock();if(next())AUDIO.ui();focusCanvas();});
 $('#freeRevive').addEventListener('click',()=>{AUDIO.unlock();revive();focusCanvas();});
 $('#freeView').addEventListener('click',()=>{AUDIO.unlock();if(setView(!S.view))AUDIO.ui();});
 return {begin,suspend,stage,update,next,revive,flinch,shoveContact,waistSlash,bisect,overflow,clean,scare,heap:HEAP,camera:camera3,setView,canNext,canRevive,get viewing(){return S.view;},get on(){return S.on;},get busy(){return !!S.seq;},get state(){return S;}};
})();
return {FREE,hangPose:freeHangPose,walkPose:freeWalkPose,FREE_FLOOR,FREE_DMG};
}
return {create};
});

