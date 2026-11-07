// 칸마다 붙는 문단 묶음(reading-pool.js) 검사. 2026-11-07 초안에서 정한 규칙을 지킨다.
// - 확정한 재물 원고(COPY)는 글자 하나 바꾸지 않는다.
// - 일·몸·짝과 관계·가족과 부양·귀인·관운은 원인별 [장면, 한 방]으로 시작하고, 한 방 끝에 그 칸의 원래 이치를 글자 그대로 품는다.
// - 문단은 사주·별자리 조건이 맞을 때만 붙고 한 사람이 받는 문단 수에 상한을 두지 않는다.
// - 별자리는 문단을 고르는 조건으로만 쓴다. 본문에 별자리·사주 용어를 쓰지 않고 같은 문장을 두 번 쓰지 않는다.
// 이 검사가 깨지면 문장을 순하게 바꾸지 말고 조건과 제외 목록을 맞춘다.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const W=require('../western.js'),ReadingPool=require('../reading-pool.js');
const {COPY,LEAD,OPENING,POOL}=ReadingPool;
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a);return html.slice(i,j);};
const source=slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('/* ---------- 자리 문서(V5)','/* 현재 월운:')+slice('function buildResult(inp,sd){','function resetAll(){');
const core=vm.runInNewContext(source+';({buildResult,v5Reading,PLACES,V5,sentenceListV2})',{Date,Intl,Western:W,ReadingPool,console});
const NOW=Date.UTC(2026,10,7);
const places=Object.fromEntries(core.PLACES.flatMap(g=>g[1].map(p=>[p[0],{name:p[1],lon:p[2],lat:W.LATITUDES[p[0]],tz:p[3]||'KR',std:p[4]==null?9:p[4]}])));
function read(y,m,d,{h=12,mi=0,unknown=false,pk='seoul',male=true}={}){
 const date={y,m,d},inp={name:'',cal:'solar',date,time:{h,mi},unknown,placeKey:pk,place:places[pk],occurrence:0,male};
 const result=core.buildResult(inp,date);
 return {result,view:core.v5Reading(result,NOW)};
}
const ALL=(()=>{let seed=20261107;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296;};const out=[];
 while(out.length<120){const y=1960+Math.floor(rnd()*45),m=1+Math.floor(rnd()*12),d=1+Math.floor(rnd()*28),h=Math.floor(rnd()*24),unknown=rnd()<.2,male=rnd()<.5,pk=rnd()<.5?'seoul':'busan';
  try{out.push(read(y,m,d,{h,unknown,male,pk}));}catch(e){}}
 // 드문 재물 갈래도 실제 명식으로 검사한다.
 out.push(read(1982,12,1,{h:21,mi:43,unknown:true}));
 return out;})();
const ids=Object.fromEntries(Object.entries(POOL).map(([k,list])=>[k,list.map(x=>x.id)]));

// 조건 검사용 가짜 명식. 계산 엔진과 같은 모양의 값만 채운다.
const FAMILIES=['비겁','식상','재성','관성','인성'];
function fake({levels={},visible={},ten={},strength='중화',interactions=[],sinsal=[],planets=null,aspects=[],causes={},coreRule='',male=false,origin=null}={}){
 const a={families:Object.fromEntries(FAMILIES.map(f=>[f,{level:levels[f]||'normal',visible:visible[f]||0}])),visibleTen:ten,strength:{label:strength},interactions};
 const R={input:{male},reading:{a,sinsal},western:planets?{available:true,planets:planets.map(([id,house,sign])=>({id,house,sign:sign==null?null:sign})),aspects}:undefined};
 const out={origin:origin?{key:origin}:undefined,core:{cause:causes.core||'x',rule:coreRule},domains:['work','money','body','home','family','gwiin','office'].map(id=>({id,cause:causes[id]||(id==='gwiin'?'absent':id==='money'?'reserve':'base'),detail:id+' 장면',rule:id+' 이치',fates:['당신은 '+id+' 팔자입니다.']}))};
 ReadingPool.weave(out,R);
 return Object.fromEntries(out.domains.map(d=>[d.id,d]));
}

test('the approved money manuscript is kept word for word and every other money cause keeps its own rule',()=>{
 assert.equal(COPY.living,'당신에게 들어오는 재물은 생활비로 소진됩니다. 돈이 들어오고, 먹고 자고, 다시 돈을 벌러 나갑니다. 한 달을 일해서 한 달을 살고 나면 다음 달의 생활비가 다시 필요합니다. 지난달에 얼마나 애썼든 이번 달에 쓸 돈이 남아 있지 않으면 다시 벌어야 합니다.');
 assert.equal(COPY.spending,'당신은 편하게 살고 싶어서 큰돈을 쓰기보다, 오늘을 끝낼 힘이 없어 작은돈을 씁니다. 직접 할 일을 남에게 맡기고 잠깐 숨을 돌립니다. 그러나 지출을 셀 때는 그 돈으로 무엇을 견뎠는지까지 계산하지 않습니다. 쉬지 않으면 버틸 수 없었다는 것은 당신의 사정이고, 돈이 남지 않았다는 것은 당신의 결과입니다.');
 assert.equal(COPY.learning,'돈이 넉넉한 집에서 자란 사람은 당장 벌지 않아도 되는 동안 배웁니다. 실패해도 다시 준비하고, 좋은 기회를 기다립니다. 그렇게 얻은 자격과 안목은 그 사람의 능력이 됩니다. 당신에게 그런 시간이 없었더라도 갖추지 못한 것은 갖추지 못한 것입니다. 기회는 사정이 급한 사람보다 준비된 사람에게 주는 것이 옳습니다.');
 assert.equal(COPY.debt,'남의 돈을 빌려 쓰면 갚을 일이 남습니다. 돈을 내어 준 사람은 당신이 편해지기를 기다리는 사람이 아닙니다. 약속한 만큼 돌아오기를 기다리는 사람입니다. 급한 일을 넘겼다면 그다음부터는 갚을 일을 해야 합니다. 받은 날의 절박함은 돈을 받은 것으로 해결되었으니, 갚는 날까지 같은 사정으로 헤아려 달라고 할 수는 없습니다.');
 assert.equal(COPY.effort,'오래 애썼다는 사실만으로 더 많은 몫이 생기지는 않습니다. 같은 일을 더 힘들게 해냈다면, 그 차이는 당신이 견뎌야 했던 어려움이지 남이 더 값을 치러야 할 성과는 아닙니다. 고생을 알아주는 말과 돈을 더 주는 일은 별개입니다.');
 assert.equal(COPY.stability,'당신의 생활은 일을 그만두지 않는 동안 유지됩니다. 그 생활을 유지하는 데 힘을 다 썼다면, 그 밖의 것을 마련할 여력은 남지 않습니다. 같은 나이에 더 많이 이룬 사람과의 차이는 그대로 남습니다.');
 assert.equal(COPY.ending,'당신은 오늘을 덜 힘들게 넘기려고 쓴 돈을 내일의 품으로 메우는 팔자입니다.');
 assert.equal(core.V5.money.comfort.fate,COPY.ending);
 for(const k of ['learning','debt','effort'])assert.equal(POOL.money.find(x=>x.id===k).text,COPY[k]);
 assert.deepEqual(Object.keys(LEAD).sort(),Object.keys(core.V5.money).filter(k=>k!=='comfort').sort());
 for(const [k,[scene,blow]] of Object.entries(LEAD)){assert(scene.length>40&&blow.length>40,k);assert(blow.includes(core.sentenceListV2(core.V5.money[k].rule)[0]),k);}
});

test('each card follows its own order of paragraphs and closes on every fate line',()=>{
 for(const k of Object.keys(POOL))assert.equal(new Set(ids[k]).size,ids[k].length,k);
 assert.deepEqual(ids,{work:['W1','W2','W5','W7','W8','W9','W3','W6','W4'],money:['M3','M4','M5','learning','debt','effort','M1','M2'],office:['O1','O4','O9','O2','O7','O5','O6','O3'],home:['L1','L6','L5','L9','L11','L4','L10','L2','L3','L8','L7'],family:['F2','F5','F3','F4','F1','F6'],body:['B3','B4','B1','B5','B7','B6','B2'],gwiin:['G1','G5','G7','G2','G6','G4','G3']});
 for(const {view} of ALL)for(const d of view.domains){
  const pool=d.poolIds.map(id=>POOL[d.id].find(x=>x.id===id).text);
  assert.deepEqual(d.poolIds,ids[d.id].filter(id=>d.poolIds.includes(id)),d.id);
  assert.deepEqual(d.closing,d.fates,d.id);assert(d.closing.length>=1,d.id);
  if(d.id==='money'){
   const opening=d.cause==='comfort'?[COPY.living,COPY.spending]:LEAD[d.cause];
   assert.deepEqual(d.paragraphs,[...opening,...pool,COPY.stability]);
  }else if(OPENING[d.id]){
   const o=OPENING[d.id];
   assert.deepEqual(d.paragraphs,[o.scene[d.cause]||o.scene.fallback||d.detail,o.blow[d.ruleKey||d.cause]||d.rule,...pool].filter(Boolean),d.id);
  }else assert.deepEqual(d.paragraphs,[d.detail,d.rule,...pool].filter(Boolean),d.id);
 }
});

test('six cards open on a scene and a blow that carries the card rule word for word',()=>{
 const V5=core.V5;
 const rules={
  work:Object.fromEntries(Object.entries(V5.work).map(([k,x])=>[k,x.rule])),
  body:Object.fromEntries(Object.entries(V5.bodyRule)),
  home:Object.fromEntries(Object.entries(V5.pairRule).filter(([k])=>['house','money','silence','base'].includes(k))),
  family:Object.fromEntries(Object.entries(V5.familyScene).map(([k,x])=>[k,V5.pairRule[x.rule]||x.rule])),
  gwiin:Object.fromEntries(Object.entries(V5.gwiin).map(([k,x])=>[k,x.rule])),
  office:Object.fromEntries(Object.entries(V5.office).map(([k,x])=>[k,x.rule]))
 };
 assert.deepEqual(Object.keys(OPENING).sort(),Object.keys(rules).sort());
 for(const [id,m] of Object.entries(rules)){
  assert.deepEqual(Object.keys(OPENING[id].blow).sort(),Object.keys(m).sort(),id);
  for(const [k,rule] of Object.entries(m)){const blow=OPENING[id].blow[k];assert(blow.endsWith(rule),id+':'+k);assert(blow.length>rule.length+30,id+':'+k);}
 }
 // 장면은 원인마다 하나씩 있다. 몸은 머리줄 갈래마다, 짝은 관계 갈래마다.
 assert.deepEqual(Object.keys(OPENING.body.scene).sort(),[...V5.body.map(x=>x[0]),'fallback'].sort());
 assert.deepEqual(Object.keys(OPENING.home.scene).sort(),[...V5.love.map(x=>x.key)].sort());
 for(const id of ['work','family','gwiin','office'])assert.deepEqual(Object.keys(OPENING[id].scene).sort(),Object.keys(rules[id]).sort(),id);
 // 일 칸 한 방은 맡기는 쪽의 셈으로 시작한다(다른 칸이 쓰는 꺼내는 방식과 겹치지 않게).
 for(const [k,t] of Object.entries(OPENING.work.blow))assert.match(core.sentenceListV2(t)[0],/쪽에서|쪽은|쪽마다/,k);
 for(const m of Object.values(OPENING))for(const t of [...Object.values(m.scene),...Object.values(m.blow)])assert(core.sentenceListV2(t).length>=3,t);
 // 실제 명식에서도 장면 뒤에 원래 이치를 품은 한 방이 온다.
 const seen={};
 for(const {view} of ALL)for(const d of view.domains){
  if(!OPENING[d.id])continue;
  assert(d.paragraphs[1].endsWith(d.rule),d.id);
  assert.notEqual(d.paragraphs[0],d.detail,d.id+':'+d.cause);
  (seen[d.id]=seen[d.id]||new Set).add(d.ruleKey||d.cause);
 }
 for(const id of Object.keys(OPENING))assert(seen[id].size>=2,id);
});

test('a paragraph appears only when its saju or star condition holds',()=>{
 // 아무 조건도 없는 고른 명식: 늘 열려 있는 문단만 붙는다.
 let d=fake();
 assert.deepEqual(d.work.poolIds,[]);assert.deepEqual(d.money.poolIds,['M1']);assert.deepEqual(d.office.poolIds,[]);
 assert.deepEqual(d.home.poolIds,[]);assert.deepEqual(d.family.poolIds,['F4']);assert.deepEqual(d.body.poolIds,[]);assert.deepEqual(d.gwiin.poolIds,['G3']);
 // 사주 조건
 d=fake({levels:{관성:'strong',비겁:'weak'},strength:'신약'});
 for(const id of ['W1','W2','W5'])assert(d.work.poolIds.includes(id),id);
 assert(d.body.poolIds.includes('B1')&&d.body.poolIds.includes('B2'));assert(d.home.poolIds.includes('L4'));assert(d.office.poolIds.includes('O3'));
 d=fake({ten:{정관:1,편관:1,겁재:1,편재:1}});
 assert(d.office.poolIds.includes('O2')&&d.office.poolIds.includes('O5'));assert(d.money.poolIds.includes('debt'));assert(d.family.poolIds.includes('F3'));assert(d.home.poolIds.includes('L2'));
 d=fake({interactions:[{kind:'형',positions:[0,3]},{kind:'충',positions:[1,2]}],sinsal:[{key:'yeokma'},{key:'baekho'}]});
 assert(d.office.poolIds.includes('O1')&&d.office.poolIds.includes('O5'));assert(d.work.poolIds.includes('W4'));assert(d.home.poolIds.includes('L3'));
 // 별자리 조건: 배치만 바꿔도 같은 문단이 붙는다.
 d=fake({planets:[['Sun',10,0],['Moon',4,3],['Mercury',6,5],['Venus',10,7],['Mars',6,1],['Jupiter',9,8],['Saturn',9,2]],aspects:[{a:'Mars',b:'Saturn',angle:90},{a:'Jupiter',b:'Saturn',angle:180}]});
 assert(d.money.poolIds.includes('learning')&&d.money.poolIds.includes('effort'));
 for(const id of ['W1','W5','W7','W6'])assert(d.work.poolIds.includes(id),id);
 assert(d.office.poolIds.includes('O1')&&d.office.poolIds.includes('O4'));assert(d.family.poolIds.includes('F1'));
 assert(d.body.poolIds.includes('B3'));assert(d.home.poolIds.includes('L2'));assert(d.gwiin.poolIds.includes('G2'));
 // 새로 붙은 문단: 성별에 따라 보는 글자가 다르고, 집안 판정도 조건이 된다.
 assert(fake({male:true,levels:{재성:'weak'}}).home.poolIds.includes('L6'));assert(!fake({male:false,levels:{재성:'weak'}}).home.poolIds.includes('L6'));
 assert(fake({male:false,levels:{관성:'weak'}}).home.poolIds.includes('L6'));assert(!fake({male:true,levels:{관성:'weak'}}).home.poolIds.includes('L6'));
 assert(fake({origin:'absent'}).family.poolIds.includes('F5')&&fake({origin:'absent'}).family.poolIds.includes('F6'));
 assert(!fake({origin:'absent',causes:{family:'absentPoor'}}).family.poolIds.includes('F5'));assert(!fake({origin:'shown'}).family.poolIds.includes('F5'));
 assert(fake({origin:'hidden',levels:{재성:'weak'}}).family.poolIds.includes('F5'));
 d=fake({ten:{정관:1,편관:1,편재:1},levels:{관성:'strong'}});
 for(const id of ['O9','O7','O6'])assert(d.office.poolIds.includes(id),id);assert(d.body.poolIds.includes('B5')&&d.body.poolIds.includes('B6'));
 d=fake({levels:{재성:'weak',관성:'weak'},strength:'신약',causes:{gwiin:'present'}});
 assert(d.body.poolIds.includes('B7'));assert(d.home.poolIds.includes('L8')&&d.home.poolIds.includes('L7'));assert(d.gwiin.poolIds.includes('G7'));
 assert(!fake({levels:{재성:'weak'},causes:{home:'생활을 합치는 날짜'}}).home.poolIds.includes('L7'));
 assert(fake({causes:{gwiin:'present'}}).gwiin.poolIds.includes('G6'));assert(!fake({causes:{gwiin:'absent'}}).gwiin.poolIds.includes('G6'));
 // 같은 배치라도 하우스가 없으면(생시 모름) 각도만으로 고른다.
 d=fake({planets:[['Mars',null,1],['Saturn',null,2]],aspects:[]});assert.deepEqual(d.work.poolIds,[]);
});

test('a paragraph that would repeat its card opening is left out',()=>{
 const strong={levels:{관성:'strong',인성:'strong'},visible:{인성:1},planets:[['Moon',4,3],['Saturn',9,2]],aspects:[{a:'Mars',b:'Saturn',angle:90}]};
 // 첫머리 원인이 같은 얘기면 그 문단을 뺀다.
 for(const cause of ['officer_overload','income','skill','palace_punish','killer_unchecked','비겁'])assert(!fake({...strong,causes:{work:cause}}).work.poolIds.includes('W1'),cause);
 assert(!fake({...strong,coreRule:'혼자 해낸 일은 다음에도 혼자 할 수 있는 일로 칩니다.'}).work.poolIds.includes('W1'));
 for(const cause of ['interrupted','paper'])assert(!fake({...strong,causes:{money:cause}}).money.poolIds.includes('learning'),cause);
 assert(!fake({...strong,causes:{work:'wealth_breaks_resource'}}).money.poolIds.includes('learning'));
 for(const id of ['effort','M1','M2'])assert(!fake({...strong,planets:[['Mars',6,1],['Saturn',2,2]],causes:{work:'weak_wealth'}}).money.poolIds.includes(id),id);
 assert(!fake({...strong,causes:{money:'poor'}}).money.poolIds.includes('M1'));
 assert(!fake({...strong,causes:{family:'young'},interactions:[{kind:'충',positions:[2,3]}]}).home.poolIds.includes('L3'));
 assert(!fake({...strong,causes:{work:'peer_unchecked'}}).work.poolIds.includes('W7'));
 assert(!fake({...strong,causes:{work:'비겁'}}).work.poolIds.includes('W7'));
 assert(!fake({...strong,visible:{인성:1,식상:1},causes:{work:'hurt_officer'}}).work.poolIds.includes('W3'));
 assert(fake({...strong,visible:{인성:1,식상:1}}).work.poolIds.includes('W3'));
 assert(!fake({...strong,causes:{work:'palace_clash'},sinsal:[{key:'yeokma'}]}).work.poolIds.includes('W4'));
 assert(!fake({...strong,causes:{core:'change'},sinsal:[{key:'yeokma'}]}).work.poolIds.includes('W4'));
 assert(!fake({...strong,causes:{work:'backing'}}).gwiin.poolIds.includes('G2'));
});

test('the helper card never mixes paragraphs for people with and without a helper letter',()=>{
 const withHelper=['G1','G4'],without=['G3','G5'];
 for(const {view} of ALL){
  const g=view.domains.find(d=>d.id==='gwiin');
  if(g.cause==='present')assert(!g.poolIds.some(id=>without.includes(id)),g.poolIds.join());
  if(g.cause==='absent'){assert(!g.poolIds.some(id=>withHelper.includes(id)),g.poolIds.join());assert(g.poolIds.includes('G3'));}
 }
 const seen=new Set(ALL.map(({view})=>view.domains.find(d=>d.id==='gwiin').cause));assert(seen.has('present')&&seen.has('absent'));
});

test('follow-on scenes respect the selected situation even without houses or extra matches',()=>{
 const d=fake({causes:{work:'비겁',money:'paper',home:'대화가 빨리 줄어듭니다'}});
 assert(d.work.poolIds.includes('W8'));
 assert(!d.work.poolIds.includes('W7')); // 이미 혼자 맡는 이야기 대신 넘긴 뒤의 장면
 assert(d.money.poolIds.includes('M3'));
 assert(!d.money.poolIds.includes('learning')); // 기존 중복 제외를 풀어서 채우지 않는다
 assert(d.home.poolIds.includes('L9'));
 const combined=fake({causes:{work:'재성',money:'burden',home:'생활 시간이 먼저'}});
 assert(combined.work.poolIds.includes('W9'));
 assert(combined.money.poolIds.includes('M4'));
 assert(combined.home.poolIds.includes('L10'));
 assert(!combined.home.poolIds.includes('L4'));
 // 강한 조건을 전부 넣어도 다른 유형에만 맞는 장면은 붙이지 않는다.
 const other=fake({levels:{비겁:'strong',식상:'strong',재성:'strong',관성:'strong',인성:'strong'},causes:{work:'income',money:'comfort',home:'생활을 합치는 날짜'}});
 assert(!other.work.poolIds.some(id=>['W8','W9'].includes(id)));
 assert(!other.money.poolIds.some(id=>['M3','M4','M5'].includes(id)));
 assert(!other.home.poolIds.some(id=>['L9','L10','L11'].includes(id)));
 assert(fake({causes:{home:'애매하게'}}).home.poolIds.includes('L11'));
 const rare=read(1982,12,1,{h:21,mi:43,unknown:true});
 const money=rare.view.domains.find(x=>x.id==='money');
 assert.equal(money.cause,'grow');assert(money.poolIds.includes('M5'));
 assert.equal(rare.result.western.unknown,true);
});

test('the body names no star placement or saju term and never repeats a sentence',()=>{
 const jargon=/하우스|별자리|상승궁|금성|목성|토성|화성|수성|천왕성|해왕성|명왕성|정인|편인|정관|편관|식신|상관|정재|편재|비견|겁재|인성|관성|재성|식상|비겁|일간|월지|일지|시지|연지|천간|신살|역마|도화|백호/;
 let hits=0;
 for(const {view} of ALL){
  const lines=[view.origin.rule,...view.core.body,view.core.rule];
  for(const d of view.domains){
   for(const t of [d.head,...d.paragraphs,...d.closing])assert(!jargon.test(t),d.id+': '+t);
   lines.push(d.head,...d.paragraphs,...d.closing);hits+=d.poolIds.length;
  }
  const seen=new Set;
  for(const t of lines)for(const s of core.sentenceListV2(t)){assert(!seen.has(s),s);seen.add(s);}
 }
 // 상한이 없으니 한 사람이 평균 열 개 넘는 문단을 받는다.
 assert(hits/ALL.length>10,String(hits/ALL.length));
});

test('every paragraph is reachable and none goes to everyone',()=>{
 const count={};for(const {view} of ALL)for(const d of view.domains)for(const id of d.poolIds)count[id]=(count[id]||0)+1;
 for(const [k,list] of Object.entries(ids))for(const id of list){assert(count[id]>0,k+':'+id);if(id!=='G3')assert(count[id]<ALL.length,k+':'+id);}
});

test('readings without a birth time or without the star chart still get their paragraphs',()=>{
 const unknown=read(1985,8,20,{unknown:true,pk:'busan'});
 assert(unknown.result.western.unknown);
 assert(unknown.view.domains.some(d=>d.poolIds.length));
 const withoutStars=structuredClone(unknown.result);delete withoutStars.western;
 const view=core.v5Reading(withoutStars,NOW);
 assert.equal(view.domains.length,7);assert(view.domains.every(d=>Array.isArray(d.paragraphs)&&d.closing.length));
 const failed=structuredClone(unknown.result);failed.western={available:false,reason:'x'};
 assert(core.v5Reading(failed,NOW).domains.every(d=>Array.isArray(d.paragraphs)));
});

