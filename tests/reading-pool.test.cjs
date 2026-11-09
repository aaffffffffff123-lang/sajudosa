// 칸마다 붙는 문단 묶음(reading-pool.js) 검사. 2026-11-07 초안에서 정한 규칙을 지킨다.
// - 확정한 재물 원고(COPY)는 글자 하나 바꾸지 않는다.
// - 일·몸·짝과 관계·가족과 부양·귀인·관운은 원인별 [장면, 한 방]으로 시작하고, 한 방 끝에 그 칸의 원래 이치를 글자 그대로 품는다.
// - 문단은 사주·별자리 조건이 맞을 때만 붙고 후보와 화면 선택은 구분하고 중심 흐름에 연결되는 장면만 보여 준다.
// - 별자리는 문단을 고르는 조건이며 총평은 실제로 선택된 여러 칸의 원인을 잇는다. 본문에 별자리·사주 용어를 쓰지 않고 같은 문장을 두 번 쓰지 않는다.
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
// 후보 조건 검사는 후보 집합을 본다. 실제 본문 선택·길이·결론은 별도 검사한다.
function candidateView(view){return {...view,domains:view.domains.map(d=>({...d,poolIds:d.candidates.map(x=>x.id),westernAddedIds:d.candidates.filter(x=>x.western).map(x=>x.id),paragraphs:d.paragraphs.slice(0,2).concat(d.candidates.map(x=>x.text))}))};}
function readCandidates(...args){const row=read(...args);return {...row,view:candidateView(row.view)};}
const ALL=(()=>{let seed=20261107;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296;};const out=[];
 while(out.length<120){const y=1960+Math.floor(rnd()*45),m=1+Math.floor(rnd()*12),d=1+Math.floor(rnd()*28),h=Math.floor(rnd()*24),unknown=rnd()<.2,male=rnd()<.5,pk=rnd()<.5?'seoul':'busan';
  try{out.push(read(y,m,d,{h,unknown,male,pk}));}catch(e){}}
 // 드문 재물 갈래도 실제 명식으로 검사한다.
 out.push(read(1982,12,1,{h:21,mi:43,unknown:true}));
 return out;})();
const ids=Object.fromEntries(Object.entries(POOL).map(([k,list])=>[k,list.map(x=>x.id)]));

test('the conclusion connects displayed causes with traceable evidence and deterministic copy',()=>{
 const threads=new Set();let starChanges=0;
 for(const {result,view} of ALL){
  const ev=view.verdictEvidence;assert(ev);threads.add(ev.thread);
  assert(ev.domains.length>=3&&ev.domains.length<=4);
  assert(view.verdict.length>=100&&view.verdict.length<=320,view.verdict);
  assert(view.verdict.split(/(?<=\.)\s+/).length>=4);
  for(const x of ev.sources){
   if(x.domain==='origin'){assert.equal(x.cause,view.origin.key);continue;}
   const d=view.domains.find(d=>d.id===x.domain);assert(d,x.domain);
   if(x.poolId)assert(d.poolIds.includes(x.poolId),x.poolId);
   else assert.equal(d.cause,x.cause);
  }
  assert.equal(core.v5Reading(result,NOW).verdict,view.verdict);
  const noStars=core.v5Reading({...result,western:{available:false}},NOW);
  assert(noStars.verdictEvidence,'a complete conclusion also works without a birth time or stars');
  assert.equal(noStars.verdict,core.v5Reading({...result,western:{available:true,planets:[],aspects:[]}},NOW).verdict);
  if(noStars.verdict!==view.verdict)starChanges++;
  if(view.domains.find(d=>d.id==='office').cause==='supported')assert.equal(ev.thread,'keeping-authority');
 }
 assert(threads.size>=10,Array.from(threads).join(','));
 assert(starChanges>0,'astrology affects the displayed facts and hence the conclusion');
});

test('removing a displayed move or benefactor paragraph cannot leave that event in the conclusion',()=>{
 const Closing=require('../closing-reading.js');let checked=0;
 for(const {result,view} of ALL){
  const work=view.domains.find(d=>d.id==='work');
  if(['palace_clash','month_day_clash','backing'].includes(work.cause))continue;
  const out=structuredClone(view);
  for(const d of out.domains)d.poolIds=d.poolIds.filter(id=>!['W4','G4'].includes(id));
  Closing.compose(out,result);
  assert(!out.verdictEvidence.sources.some(x=>['W4','G4'].includes(x.poolId)));
  assert(!['moving-cost','moving-relationships','help-and-debt'].includes(out.verdictEvidence.thread));checked++;
 }
 assert(checked>20);
});

test('the optional name is literal and does not alter the selected reading',()=>{
 const Closing=require('../closing-reading.js'),{result,view}=ALL[0];
 const out=structuredClone(view);out.verdictFrame.subject='$& 님은';
 Closing.compose(out,result);
 assert.equal(out.verdict,view.verdict.replace(/^당신은/,()=>'$& 님은'));
 assert.deepEqual(out.verdictEvidence,view.verdictEvidence);
});

test('unknown birth time and family cases do not create children or a career break in a summary',()=>{
 for(const {view} of ALL){
  const family=view.domains.find(d=>d.id==='family');
  if(['old','young'].includes(family.cause))assert(!/아이|자식|교육비/.test(view.verdict),view.verdict);
  if(family.cause!=='cut')assert(!/경력은 끊기|경력도 끊기|돌아갈 일자리는 새로/.test(view.verdict),view.verdict);
  assert.equal(view.cautions.length,2);
  assert(!/지시받은 만큼만 하면/.test(view.cautions.join(' ')));
  if(view.origin.key!=='shown')assert(!/집안에서 받은 복/.test(view.cautions.join(' ')));
 }
});

// 조건 검사용 가짜 명식. 계산 엔진과 같은 모양의 값만 채운다.
const FAMILIES=['비겁','식상','재성','관성','인성'];
function fake({levels={},visible={},ten={},strength='중화',interactions=[],sinsal=[],planets=null,aspects=[],causes={},coreRule='',male=false,origin=null}={}){
 const a={families:Object.fromEntries(FAMILIES.map(f=>[f,{level:levels[f]||'normal',visible:visible[f]||0}])),visibleTen:ten,strength:{label:strength},interactions};
 const R={input:{male},reading:{a,sinsal},western:planets?{available:true,planets:planets.map(([id,house,sign])=>({id,house,sign:sign==null?null:sign})),aspects}:undefined};
 const out={origin:origin?{key:origin}:undefined,core:{cause:causes.core||'x',rule:coreRule},domains:['work','money','body','home','family','gwiin','office'].map(id=>({id,cause:causes[id]||(id==='gwiin'?'absent':id==='money'?'reserve':'base'),detail:id+' 장면',rule:id+' 이치',fates:['당신은 '+id+' 팔자입니다.']}))};
 ReadingPool.weave(out,R);
 return Object.fromEntries(candidateView(out).domains.map(d=>[d.id,d]));
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
 assert.deepEqual(ids,{work:['W1','W2','W5','W7','W8','W9','W3','W6','W4'],money:['M3','M4','M5','learning','debt','effort','M1','M2','M6'],office:['O1','O4','O9','O2','O7','O5','O6','O3'],home:['L5','L9','L11','L4','L10','L3','L2','L8','L7','L1','L6'],family:['F2','F5','F3','F4','F1','F6'],body:['B3','B4','B1','B5','B7','B6','B2'],gwiin:['G1','G5','G7','G2','G6','G4','G3']});
 for(const {result,view} of ALL)for(const d of view.domains){
  const c=ReadingPool.context(result,view);
  const pool=d.poolIds.map(id=>{const x=POOL[d.id].find(x=>x.id===id);return (x.textFor&&x.textFor(c))||(x.originText&&x.originText[view.origin.key])||x.text;});
  assert.deepEqual(d.poolIds,ids[d.id].filter(id=>d.poolIds.includes(id)),d.id);
  assert(d.closing.length>=1,d.id);if(d.id!=='family')assert.deepEqual(d.closing,d.fates,d.id);
  if(d.lead){assert.deepEqual(d.paragraphs,[...d.lead,...pool]);
  }else if(d.id==='money'){
   const opening=d.cause==='comfort'?[COPY.living,COPY.spending]:LEAD[d.cause];
   assert.deepEqual(d.paragraphs,[...opening,...pool]);
  }else if(d.primaryPoolId){
   assert.deepEqual(d.paragraphs,[pool[0],ReadingPool.HELP[d.primaryPoolId][1]]);
  }else if(OPENING[d.id]){
   const o=OPENING[d.id];
   assert.deepEqual(d.paragraphs,[(o.followWork&&o.followWork[d.cause]||{})[c.cause('work')]||o.scene[d.cause]||o.scene.fallback||d.detail,o.blow[d.ruleKey||d.cause]||d.rule,...pool].filter(Boolean),d.id);
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
  if(!d.primaryPoolId)assert(d.paragraphs[1].endsWith(d.rule),d.id);
  if(d.lead)assert.equal(d.paragraphs[0],d.detail);else assert.notEqual(d.paragraphs[0],d.detail,d.id+':'+d.cause);
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
 assert(d.office.poolIds.includes('O1')&&!d.office.poolIds.includes('O5'));assert(d.work.poolIds.includes('W4'));assert(d.home.poolIds.includes('L3'));
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
 for(const id of ['O9','O7','O5','O6'])assert(d.office.poolIds.includes(id),id);assert(d.body.poolIds.includes('B5')&&d.body.poolIds.includes('B6'));
 d=fake({levels:{재성:'weak',관성:'weak'},strength:'신약',causes:{gwiin:'present'}});
 assert(d.body.poolIds.includes('B7'));assert(d.home.poolIds.includes('L8')&&d.home.poolIds.includes('L7'));assert(d.gwiin.poolIds.includes('G7'));
 assert(!fake({levels:{재성:'weak'},causes:{home:'생활을 합치는 날짜'}}).home.poolIds.includes('L7'));
 assert(fake({causes:{gwiin:'present'}}).gwiin.poolIds.includes('G6'));assert(!fake({causes:{gwiin:'absent'}}).gwiin.poolIds.includes('G6'));
 // 같은 배치라도 하우스가 없으면(생시 모름) 각도만으로 고른다.
 d=fake({planets:[['Mars',null,1],['Saturn',null,2]],aspects:[]});assert.deepEqual(d.work.poolIds,[]);
});

test('office pressure survives personal wealth and needs no prediction of a specific incident',()=>{
 const has=(opts,id)=>fake(opts).office.poolIds.includes(id);
 // 개인 재산과 회사가 내주는 자원은 별개다. 재물 강도만 바꿔도 책임의 장면은 사라지지 않는다.
 for(const 재성 of ['absent','weak','normal','strong','excess'])assert(has({levels:{관성:'strong',재성}},'O9'));
 assert(!has({levels:{재성:'weak'}},'O9'));
 // 규칙을 지키는 것과 서명으로 책임을 받는 것은 서로 다른 부담이다.
 for(const 인성 of ['absent','weak','normal','strong','excess']){
  const office=fake({ten:{정관:1},levels:{인성}}).office;
  assert(office.poolIds.includes('O2')&&office.poolIds.includes('O7'));
 }
 assert(has({levels:{인성:'strong'}},'O7'));
 assert(!has({levels:{인성:'strong',관성:'absent'}},'O7'));
 // 편관의 압박은 평소에도, 일이 잘못되거나 회사가 어려워졌을 때도 이어진다.
 for(const interactions of [[],[{kind:'형',positions:[0,2]}],[{kind:'충',positions:[0,2]}]]){
  const office=fake({ten:{편관:1},interactions}).office;
  assert(office.poolIds.includes('O5')&&office.poolIds.includes('O6'));
 }
 // 직장 압박 없이 다른 생활 영역의 충돌만 있는 경우까지 끌어오지는 않는다.
 assert(!has({interactions:[{kind:'형',positions:[0,2]}]},'O5'));
 assert(!has({sinsal:[{key:'baekho'}]},'O5'));
 assert(!has({levels:{관성:'absent'},sinsal:[{key:'baekho'}],interactions:[{kind:'파',positions:[1,3]}]},'O5'));
 assert(has({sinsal:[{key:'baekho'}],interactions:[{kind:'파',positions:[1,3]}]},'O5'));
 assert(!has({levels:{관성:'strong'},interactions:[{kind:'충',positions:[0,2]}]},'O6'));
 assert(!has({interactions:[{kind:'충',positions:[1,2]}]},'O6'));
 assert(has({levels:{관성:'strong'},interactions:[{kind:'충',positions:[1,2]}]},'O6'));
 // 실제 회귀 사례: 재성이 강하고 생시를 몰라도 예산·서명 부담을 보존한다.
 const example=readCandidates(1960,10,21,{unknown:true,pk:'busan',male:false});
 const c=ReadingPool.context(example.result,example.view);
 assert(c.hi('재성'));assert.equal(example.view.origin.key,'shown');
 const office=example.view.domains.find(d=>d.id==='office');
 assert.equal(office.cause,'hidden');
 for(const id of ['O9','O7'])assert(office.poolIds.includes(id),id);
 // 이 사례의 백호와 해·날 자리 충돌만으로 경위서·감축까지 복구하지 않는다.
 assert(!office.poolIds.includes('O5')&&!office.poolIds.includes('O6'));
 const pressured=readCandidates(2003,6,18,{h:1,mi:25,pk:'busan',male:false}).view.domains.find(d=>d.id==='office');
 for(const id of ['O9','O7','O5','O6'])assert(pressured.poolIds.includes(id),id);
});

test('leaving a helper requires the same movement evidence as the resume scene',()=>{
 const support={levels:{인성:'strong'},causes:{gwiin:'present'}};
 assert(!fake(support).gwiin.poolIds.includes('G4'));
 const moves=[
  {sinsal:[{key:'yeokma'}]},
  {interactions:[{kind:'충',positions:[0,1]}]},
  {interactions:[{kind:'충',positions:[2,3]}]},
  ...['Sun','Moon'].flatMap(a=>[90,180].map(angle=>({planets:[],aspects:[{a,b:'Uranus',angle}]})))
 ];
 for(const move of moves){
  const d=fake({...support,...move});
  assert(d.work.poolIds.includes('W4'));assert(d.gwiin.poolIds.includes('G4'));
  assert(!fake({...support,...move,causes:{gwiin:'absent'}}).gwiin.poolIds.includes('G4'));
 }
 for(const noMove of [{interactions:[{kind:'충',positions:[0,3]}]},...[0,60,120].map(angle=>({planets:[],aspects:[{a:'Sun',b:'Uranus',angle}]}))]){
  const d=fake({...support,...noMove});
  assert(!d.work.poolIds.includes('W4'));assert(!d.gwiin.poolIds.includes('G4'));
 }
 // 다른 문단과의 중복 때문에 이력서를 뺀 경우에도 귀인의 대가는 별개의 장면이다.
 const separate=fake({...support,sinsal:[{key:'yeokma'}],causes:{gwiin:'present',work:'palace_clash'}});
 assert(!separate.work.poolIds.includes('W4'));assert(separate.gwiin.poolIds.includes('G4'));
 // 이동이 없는 실제 입력에서도 기존의 도움·의무 문단은 남긴다.
 const example=readCandidates(2002,5,12,{h:13,mi:32,pk:'daejeon',male:false});
 const d=Object.fromEntries(example.view.domains.map(x=>[x.id,x]));
 assert(!ReadingPool.context(example.result,example.view).moveSignal);
 assert(!d.work.poolIds.includes('W4'));assert(!d.gwiin.poolIds.includes('G4'));
 for(const id of ['G1','G7','G2','G6'])assert(d.gwiin.poolIds.includes(id),id);
});

test('repetitive work needs activity or workload evidence beyond a wealth god',()=>{
 const has=opts=>fake(opts).body.poolIds.includes('B6');
 assert(!has({ten:{편재:1}}));
 assert(!has({ten:{편재:1},levels:{관성:'normal'}}));
 assert(has({ten:{편재:1},levels:{관성:'strong'}}));
 assert(!has({levels:{관성:'strong',재성:'strong'}}));
 assert(has({levels:{식상:'strong'}}));
 for(const house of [1,6])assert(has({planets:[['Mars',house]]}));
 assert(!has({planets:[['Mars',10]]}));
 const example=readCandidates(1991,7,10,{h:23,mi:37,pk:'busan',male:true});
 const body=example.view.domains.find(x=>x.id==='body');
 assert(!body.poolIds.includes('B6'));
 for(const id of ['B3','B4','B7'])assert(body.poolIds.includes(id),id);
});

test('learning pressure preserves family support and the approved manuscript for other origins',()=>{
 const support={visible:{인성:1}};
 const supported=fake({...support,origin:'shown'}).money;
 assert(supported.poolIds.includes('learning'));
 assert(supported.paragraphs.some(t=>t.includes('집에서 생활을 받쳐 준 동안 배운 것')&&t.includes('그다음은 당신이 증명할 몫')));
 assert(!supported.paragraphs.includes(COPY.learning));
 for(const origin of ['hidden','absent',null]){
  const other=fake({...support,origin}).money;
  assert.deepEqual(other.poolIds,supported.poolIds);
  assert(other.paragraphs.includes(COPY.learning));
  assert.equal(other.paragraphs.length,supported.paragraphs.length);
 }
 assert(!fake({origin:'shown'}).money.poolIds.includes('learning'));
 for(const money of ['paper','interrupted'])assert(!fake({...support,origin:'shown',causes:{money}}).money.poolIds.includes('learning'));
 const example=readCandidates(1956,1,4,{h:10,mi:33,pk:'gwangju',male:true}).view;
 assert.match(example.origin.rule,/생활을 받쳐 주고 배울 길/);
 assert.equal(example.origin.key,'shown');
 assert(example.domains.find(d=>d.id==='money').paragraphs.some(t=>t.includes('집에서 생활을 받쳐 준 동안 배운 것')));
});

test('occasional help connects to an absent-helper opening without inventing a patron',()=>{
 const support={levels:{인성:'strong'}};
 const absent=fake({...support,causes:{gwiin:'absent'}}).gwiin;
 assert(absent.poolIds.includes('G2'));
 assert(absent.paragraphs.some(t=>t.startsWith('어렵게 도움을 한 번 받아도')&&t.includes('작은 도움이라도 받은 것은 받은 것입니다')));
 assert(!absent.poolIds.some(id=>['G1','G4','G6'].includes(id)));
 const present=fake({...support,causes:{gwiin:'present'}}).gwiin;
 assert(present.paragraphs.includes(POOL.gwiin.find(x=>x.id==='G2').text));
 assert(!fake({causes:{gwiin:'absent'}}).gwiin.poolIds.includes('G2'));
 assert(!fake({...support,causes:{gwiin:'absent',work:'backing'}}).gwiin.poolIds.includes('G2'));
 const example=readCandidates(1982,3,29,{h:22,mi:43,pk:'daejeon',male:true}).view.domains.find(d=>d.id==='gwiin');
 assert.equal(example.cause,'absent');
 assert(example.paragraphs.some(t=>t.startsWith('어렵게 도움을 한 번 받아도')));
});

test('personal cash constraints explain staying through cuts rather than predict company finances',()=>{
 const original=POOL.work.find(x=>x.id==='W6').text;
 const short=fake({levels:{재성:'weak'}}).work;
 assert(short.poolIds.includes('W6'));
 assert(short.paragraphs.some(t=>t.includes('다른 일을 구하는 동안 쓸 돈이 없어')&&t.includes('값을 다시 올릴 의무는 없습니다')));
 assert(!short.paragraphs.includes(original));
 const stars={planets:[],aspects:[{a:'Jupiter',b:'Saturn',angle:90}]};
 const funded=fake({...stars,levels:{재성:'strong'}}).work;
 assert(funded.poolIds.includes('W6'));assert(funded.paragraphs.includes(original));
 assert(!funded.paragraphs.some(t=>t.includes('다른 일을 구하는 동안 쓸 돈이 없어')));
 assert(!fake({levels:{재성:'weak',관성:'absent'}}).work.poolIds.includes('W6'));
 const example=readCandidates(1981,12,12,{h:17,mi:39,pk:'seoul',male:true}).view.domains.find(d=>d.id==='work');
 assert(example.paragraphs.some(t=>t.includes('다른 일을 구하는 동안 쓸 돈이 없어')));
});

test('family obligations acknowledge earlier support without adding or suppressing scenes',()=>{
 const item=POOL.family.find(x=>x.id==='F3');
 const supported=fake({origin:'shown',ten:{겁재:1}}).family;
 assert(supported.paragraphs.includes(item.originText.shown));
 assert(!supported.paragraphs.includes(item.text));
 assert.match(item.originText.shown,/생활과 배움을 받쳐 준 덕/);
 assert.match(item.originText.shown,/받은 것을 돌려준 것으로/);
 for(const origin of ['hidden','absent',null]){
  const other=fake({origin,ten:{겁재:1}}).family;
  assert.equal(other.poolIds.filter(id=>id==='F3').length,1);
  assert.equal(other.paragraphs.length,other.poolIds.length+2);
  assert(other.paragraphs.includes(item.text));
  assert(!other.paragraphs.includes(item.originText.shown));
 }
 // 지원이 있다는 이유만으로 부양 문단을 새로 넣지는 않는다.
 assert(!fake({origin:'shown'}).family.poolIds.includes('F3'));
 const example=readCandidates(1975,8,1,{h:0,mi:36,pk:'daejeon',male:true}).view;
 assert.equal(example.origin.key,'shown');
 const selected=example.domains.find(d=>d.id==='family');
 assert(selected.lifeSelected);assert.equal(selected.paragraphs.length,2);assert.equal(selected.poolIds.length,0);
 assert(!selected.paragraphs.includes(item.originText.shown));
});

test('each refined office scene keeps an independent Western route tied to the relevant life area',()=>{
 const has=(opts,id)=>fake(opts).office.poolIds.includes(id);
 const tight={a:'Mars',b:'Jupiter',angle:90};
 assert(has({planets:[['Saturn',2],['Mars',6]]},'O9'));
 assert(!has({planets:[['Saturn',2],['Mars',4]]},'O9'));
 assert(has({planets:[['Mars',10],['Jupiter',1]],aspects:[tight]},'O9'));
 assert(!has({planets:[['Mars',4],['Jupiter',1]],aspects:[tight]},'O9'));
 const signature={a:'Mercury',b:'Saturn',angle:0};
 assert(has({planets:[['Mercury',6],['Saturn',3]],aspects:[signature]},'O7'));
 assert(!has({planets:[['Mercury',4],['Saturn',3]],aspects:[signature]},'O7'));
 const friction={a:'Mars',b:'Saturn',angle:180};
 assert(has({planets:[['Mars',6],['Saturn',12]],aspects:[friction]},'O5'));
 assert(!has({planets:[['Mars',4],['Saturn',12]],aspects:[friction]},'O5'));
 const restructure={a:'Saturn',b:'Uranus',angle:90};
 assert(has({planets:[['Saturn',10],['Uranus',1]],aspects:[restructure]},'O6'));
 assert(!has({planets:[['Saturn',8],['Uranus',1]],aspects:[restructure]},'O6'));
 assert(has({planets:[['Uranus',6],['Sun',3]],aspects:[{a:'Sun',b:'Uranus',angle:180}]},'O6'));
 // 생시 미상처럼 하우스가 없으면 직장 영역을 임의로 만들어 넣지 않는다.
 for(const id of ['O9','O7','O5','O6'])assert(!has({planets:[['Mars',null],['Saturn',null],['Mercury',null],['Uranus',null]],aspects:[tight,signature,friction,restructure]},id),id);
});

test('real Western charts can add an incident or workplace change without the old generic saju trigger',()=>{
 const incident=readCandidates(1989,5,18,{h:15,mi:8,pk:'daejeon',male:false});
 const ic=ReadingPool.context(incident.result,incident.view);
 assert.equal(ic.ten('편관'),0);assert(!ic.sin('baekho'));
 assert(incident.view.domains.find(d=>d.id==='office').poolIds.includes('O5'));
 const change=readCandidates(1975,10,22,{h:6,mi:52,pk:'busan',male:true});
 const cc=ReadingPool.context(change.result,change.view);
 assert.equal(cc.ten('편관'),0);assert(!cc.inter('충'));assert(![6,8].includes(cc.house('Saturn')));
 assert(change.view.domains.find(d=>d.id==='office').poolIds.includes('O6'));
 // 별자리 근거를 뺀 같은 명식에서는 새 장면이 사라진다.
 for(const [example,id] of [[incident,'O5'],[change,'O6']]){
  const withoutStars={...example.result,western:undefined};
  assert(!candidateView(core.v5Reading(withoutStars,NOW)).domains.find(d=>d.id==='office').poolIds.includes(id));
 }
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
  if(g.cause==='absent'){assert(!g.poolIds.some(id=>withHelper.includes(id)),g.poolIds.join());assert(g.candidates.some(x=>x.id==='G3'));}
 }
 const seen=new Set(ALL.map(({view})=>view.domains.find(d=>d.id==='gwiin').cause));assert(seen.has('present')&&seen.has('absent'));
});

test('relocation costs get a scene exactly when the existing relocation fate is selected',()=>{
 let withMove=0,withoutMove=0;
 const cases=[...ALL,read(1984,8,16,{unknown:true,pk:'daejeon',male:false}),read(1984,8,16,{unknown:true,pk:'seoul',male:false})];
 for(const {view} of cases){
  const m=view.domains.find(d=>d.id==='money');
  const selected=m.closing.includes(core.V5.yeokma);
  assert.equal(m.relocationCost,selected);
  assert.equal(m.poolIds.includes('M6'),selected);
  assert.equal(m.paragraphs.some(t=>t.includes('새집 보증금')),selected);
  if(selected)withMove++;else withoutMove++;
 }
 assert(withMove>0&&withoutMove>0);
 // 역마만으로 지역 조건을 건너뛰어 문단을 붙이지 않는다.
 assert(!fake({sinsal:[{key:'yeokma'}]}).money.poolIds.includes('M6'));
});

test('relationship candidates retain their conditions and life-stage order before editorial selection',()=>{
 const long=readCandidates(1947,4,7,{h:9,mi:59,male:true}).view.domains.find(d=>d.id==='home');
 for(const id of ['L5','L10','L3','L2','L8','L7','L1','L6'])assert(long.poolIds.includes(id),id);
 const stages=[['L5','L9','L11','L4','L10'],['L3','L2','L8'],['L7'],['L1','L6']];
 for(const {view} of [...ALL.map(x=>({...x,view:candidateView(x.view)})),{view:{domains:[long]}}]){
  const d=view.domains.find(d=>d.id==='home'),o=OPENING.home;
  assert.equal(d.paragraphs[0],o.scene[d.cause]);
  assert.equal(d.paragraphs[1],o.blow[d.ruleKey]);
  let last=-1;
  for(const id of d.poolIds){const stage=stages.findIndex(s=>s.includes(id));assert(stage>=last,id);last=stage;}
  if(d.poolIds.includes('L7'))assert(d.paragraphs.some(t=>t.startsWith('관계를 끝내려 해도')));
  if(d.poolIds.includes('L1'))assert(d.paragraphs.some(t=>t.startsWith('다른 인연을 소개받으려 해도')));
  if(d.poolIds.includes('L6'))assert(d.paragraphs.some(t=>t.startsWith('다른 사람을 만나려 해도')));
 }
 // 일부 조건만 맞아도 만남/이별을 확정된 현재 상태로 선언하지 않는다.
 const onlyMeeting=fake({planets:[['Venus',6,1]],causes:{home:'생활 시간이 먼저'}}).home;
 assert(onlyMeeting.poolIds.includes('L6'));assert(!onlyMeeting.poolIds.includes('L7'));
 const onlyLeaving=fake({aspects:[{a:'Venus',b:'Uranus',angle:90}],planets:[],causes:{home:'애매하게'}}).home;
 assert(onlyLeaving.poolIds.includes('L7'));assert(!onlyLeaving.poolIds.includes('L6'));
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
 // 화면에 남긴 장면은 소수이며, 후보 전체를 되살리지 않는다.
 assert(hits/ALL.length<5,String(hits/ALL.length));
});

test('active supplemental candidates remain reachable without reviving retired family follow-ups',()=>{
 const count={};for(const {view} of ALL)for(const d of view.domains)for(const {id} of d.candidates)count[id]=(count[id]||0)+1;
 for(const [k,list] of Object.entries(ids).filter(([k])=>k!=='family'))for(const id of list){assert(count[id]>0,k+':'+id);if(id!=='G3')assert(count[id]<ALL.length,k+':'+id);}
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




test('child conditions survive every displayed family summary and cannot enter unrelated cases',()=>{
 const child=new Set(['cut','care','shown','absent','absentPoor']);let checked=0;
 for(const {view} of ALL){
  const family=view.domains.find(d=>d.id==='family');
  if(!child.has(family.cause)){assert(!/아이|자식|교육비/.test(view.verdict));continue;}
  if(!view.verdictEvidence.domains.includes('family'))continue;
  const first=core.sentenceListV2(view.verdict).find(t=>/아이|자식|교육비/.test(t));
  assert(first,view.verdict);assert.match(first,/(?:아이|자식).{0,40}면/,view.verdict);checked++;
 }
 assert(checked>0);
 const young=read(2006,1,1,{male:false}).view;
 assert(!/아이|자식|교육비/.test(young.verdict));
 assert.notEqual(young.verdictEvidence.thread,'care-and-work');
});

test('authority continues an already shown work scene without changing its cause or judgment',()=>{
 for(const [office,work,detail] of [['hidden','order','경위서'],['mixed','mixed_officer','서명']]){
  const related=fake({causes:{office,work}}).office;
  const unrelated=fake({causes:{office,work:'skill'}}).office;
  assert.equal(related.cause,office);assert.equal(unrelated.cause,office);
  assert(related.paragraphs[0].includes(detail));
  assert.equal(unrelated.paragraphs[0],OPENING.office.scene[office]);
  assert.notEqual(related.paragraphs[0],unrelated.paragraphs[0]);
  assert.deepEqual(related.poolIds,unrelated.poolIds);
  assert.deepEqual(related.closing,unrelated.closing);
 }
});
