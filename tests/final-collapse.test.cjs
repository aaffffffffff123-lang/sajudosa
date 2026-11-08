// 5%(되살림 직전)와 0%(끝)에 무너질 때 몸이 도로 솟지 않는다.
// 예전: 누워 있으면 다 일어선 뒤 다시 쓰러졌고, 무릎 꿇은 자세(slump)에서 다리를 펴며 주저앉을 때도 다리가 먼저 펴지면서
// 바닥에 받혀 골반이 5cm쯤 도로 솟았다가 내려앉았다(다시 일어났다가 쓰러지는 꼴).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),test=require('node:test');
const THREE=require('../three.min.js'),src=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const section=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);assert(i>=0&&j>i,a);return src.slice(i,j)};
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const sat=x=>clamp(x,0,1),smooth=t=>{t=sat(t);return t*t*(3-2*t)};
const ctx={THREE,V3,PI:Math.PI,TAU:Math.PI*2,clamp,lerp,sat,smooth,easeIn:t=>{t=sat(t);return t*t},easeOut3:t=>{t=sat(t);return 1-Math.pow(1-t,3)},
 backOut:(t,s=1.7)=>{t=sat(t)-1;return t*t*((s+1)*t+s)+1},G:{mode:'fight',time:0},AUDIO:{voice(){}},BELLY_C:V3(0,.16,.06),
 combatActive:E=>!!(E&&E.combat&&!E._combatScripted&&ctx.G.mode==='fight')};
const api=vm.runInNewContext(section("const POSE_KEYS=","Object.assign(Emperor.prototype,{")+section('const KD_POSE=','Object.assign(Emperor.prototype,{')+
 section('const COMBAT_POSE={','function combatSeatPose(')+';({P,poseCopy,STAND,POSES,KD_POSE,COMBAT_POSE,seqEval,methods:{'+section(' // o.lastTry:',' startRise(){')+section(' applyPose(p){',' setCurl(a,')+'}})',ctx);
const bone=(p,v)=>{const o=new THREE.Group();o.position.set(...v);p.add(o);return o};
function rig(){
 const root=new THREE.Group(),pelvis=bone(root,[0,.665,0]),spine=bone(pelvis,[0,.06,0]),chest=bone(spine,[0,.24,-.01]),neck=bone(chest,[0,.265,0]),head=bone(neck,[0,.06,.03]);
 const sp={drop:{x:0}};for(const k of ['pelvis','spine','chest','neck','head','belly','L','R'])sp[k]={X:0,Y:0,Z:0};for(const k of ['Lk','Rk'])sp[k]={x:0};
 const E={root,bones:{pelvis,spine,chest,neck,head},belly:new THREE.Group(),apronF:new THREE.Group(),apronB:new THREE.Group(),belt:new THREE.Group(),arms:[],legs:[],sp,
  rootPos:V3(),rootVel:V3(),pose:api.P(),endAct(){},releaseIK(){},tabletHeld:false,headGone:false,headDestroyed:false};
 Object.assign(E,api.methods);
 for(const s of [-1,1]){const nm=s<0?'L':'R',sh=bone(chest,[s*.265,.19,.1]),um=bone(sh,[0,-.118,0]),el=bone(um,[0,-.117,0]),fm=bone(el,[0,-.108,0]),wr=bone(fm,[0,-.107,0]);E.arms.push({s,nm,sh,um,el,fm,wr});}
 for(const s of [-1,1]){const nm=s<0?'L':'R',hip=bone(pelvis,[s*.135,-.02,0]),tm=bone(hip,[0,-.145,0]),knee=bone(tm,[0,-.145,0]),sm=bone(knee,[0,-.128,0]),ank=bone(sm,[0,-.127,0]);E.legs.push({s,nm,hip,tm,knee,sm,ank});}
 return E;
}
// combatFloor와 같은 받침: 발목·손목·골반·가슴·머리 가운데 가장 낮은 곳이 바닥(.018) 밑으로 가지 않게 몸을 들어 올린 뒤의 골반 높이
function flooredPelvis(E,pose){
 E.applyPose(pose);E.root.updateMatrixWorld(true);
 let min=Infinity;const v=V3();
 for(const l of E.legs){l.ank.getWorldPosition(v);min=Math.min(min,v.y-.063);}
 for(const a of E.arms){a.wr.getWorldPosition(v);min=Math.min(min,v.y-.06);}
 for(const [name,r] of [['pelvis',.15],['chest',.21],['head',.13]]){E.bones[name].getWorldPosition(v);min=Math.min(min,v.y-r);}
 return E.bones.pelvis.getWorldPosition(v).y+Math.max(0,.018-min);
}
function profile(seq,from=0){
 const E=rig(),out=[],pose=api.P();
 for(let t=from;t<=seq[seq.length-1].t+1e-9;t+=1/60){api.seqEval(seq,t,pose);out.push([t,flooredPelvis(E,pose),(pose.LkB+pose.RkB)/2]);}
 return out;
}
// 무너지기 시작한 뒤(commit) 골반이 2cm 넘게 도로 솟는 일이 없다
function worstRise(points,commit){let low=Infinity,worst=0;for(const [t,y] of points){if(t<commit)continue;low=Math.min(low,y);worst=Math.max(worst,y-low);}return worst;}
// 서 있는 꼴: 무릎이 펴졌는데(평균 굽힘 1rad 아래) 골반이 아직 높이(.4m 위) 떠 있는 순간. 무너지는 도중에 이게 나오면 다시 일어서는 것처럼 보인다
function standsBackUp(points,commit){return points.some(([t,y,knee])=>t>=commit&&knee<1&&y>.4);}
function fall(mode,lastTry){
 const E=rig();E.combat={mode,x:0,z:-.3,side:1,canRise:true,locked:false};E._combatScripted=false;
 const lying=mode==='ground';
 if(lying){api.poseCopy(api.COMBAT_POSE.ground,E.pose);}else api.poseCopy(api.STAND,E.pose);
 E.applyPose(E.pose);E.startFall('final',{lastTry});return E.down;
}

test('standing collapse sits down before the legs slide out',()=>{
 const d=fall('stand',false),points=profile(d.seq);
 const rise=worstRise(points,1.05);
 assert(rise<.02,'pelvis rises '+rise.toFixed(3)+' m after the knees give out');
 assert(!standsBackUp(points,1.05),'the knees straighten only after the seat is on the floor');
 const end=points[points.length-1][1];assert(end<.32,'ends sitting on the floor, pelvis at '+end.toFixed(3));
});

test('a deity lying down at 5% tries once to get up and slumps instead of standing first',()=>{
 const d=fall('ground',true),points=profile(d.seq);
 const top=Math.max(...points.map(p=>p[1])),stand=flooredPelvis(rig(),api.STAND);
 assert(top<stand-.15,'never rises near standing height ('+top.toFixed(3)+' vs '+stand.toFixed(3)+')');
 const strainEnd=d.seq.find(k=>k.pose&&k.t>.9&&k.t<1).t,rise=worstRise(points,strainEnd);
 assert(rise<.02,'pelvis rises '+rise.toFixed(3)+' m after the arms give out');
 assert(!standsBackUp(points,0),'the legs never straighten under a raised pelvis');
 assert(d.shake&&d.shake.t0<strainEnd&&d.shake.t1>strainEnd-.2,'the arms tremble while straining');
 const end=points[points.length-1][1];assert(end<.32,'ends sitting on the floor');
 assert(d.events.some(e=>Math.abs(e.t-1.47)<.1),'the floor impact lands when he sits down');
});

test('the old kneel-to-sit path really did stand back up, so the check above is meaningful',()=>{
 const K=api.KD_POSE,seq=[{t:0,pose:api.STAND},{t:.5,pose:K.buckle,ease:'out'},{t:1.05,pose:K.slump,ease:'in'},{t:1.8,pose:api.POSES.final,ease:'in'},{t:2.4,pose:api.POSES.final}];
 assert(standsBackUp(profile(seq),1.05));
});
