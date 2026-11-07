// 풀이 화면(자리 문서 V5)의 방향을 지키는 검사.
// 첫 문단에서 독자의 모습을 짚고, 집안 판정부터 범위를 넓힌다. 독한 줄은 사주 조건에 묶는다.
// 이 검사가 깨지면 문장을 순하게 되돌리지 말고 조건과 근거를 맞춘다.
// 엔진 판정은 reading-evidence.test.cjs가 따로 검사한다. V5는 생활 설명을 가져오거나 풀어 쓰되 제목·팔자의 원인을 일치시킨다.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ReadingPool=require('../reading-pool.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>{const i=html.indexOf(a);assert(i>=0,a);const j=html.indexOf(b,i);assert(j>i,b);return html.slice(i,j);};
const V5_SRC=slice('/* ---------- 자리 문서(V5)','/* 현재 월운:');
const api=vm.runInNewContext(slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+V5_SRC+slice('function currentMonthView(','const MONTH_VIEW=')+slice('function luckGraph(','/* ---------- 입력 받기 ---------- */')
 +';({computeChart,makeReading,modernizeReadingDisplay,v5Reading,currentMonthView,luckGraph,TEN_FAMILY,tenGod,HIDDEN,ELEMENTS,CONTROLLED_BY,STEMS,elementFamilyV2,sentenceListV2,pastReadingText})',{Intl,Date,ReadingPool});
const NOW=Date.UTC(2026,10,4),THIS_YEAR=2026;
const PLACE={seoul:{name:'서울',lon:126.978,tz:'KR',std:9},busan:{name:'부산',lon:129.07,tz:'KR',std:9}};
function make(y,m,d,{h=12,mi=0,unknown=false,male=true,pk='seoul',name=''}={}){
 const place=PLACE[pk],input={name,cal:'solar',date:{y,m,d},time:{h,mi},unknown,male,place,placeKey:pk};
 const r=api.modernizeReadingDisplay(api.makeReading(api.computeChart({y,m,d,h:unknown?12:h,mi,unknown,male,place}),input,NOW));
 return {r,v:api.v5Reading({input,reading:r,solarDate:{y,m,d}},NOW),y,male,unknown};
}
// 고정된 씨앗으로 여러 사주를 고른다
const ALL=(()=>{let seed=20261104;const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return seed/4294967296;};const out=[];
 while(out.length<160){const y=1958+Math.floor(rnd()*50),m=1+Math.floor(rnd()*12),d=1+Math.floor(rnd()*28),h=Math.floor(rnd()*24),male=rnd()<.5,unknown=rnd()<.2,pk=rnd()<.5?'seoul':'busan';
  out.push(make(y,m,d,{h,unknown,male,pk}));}
 return out;})();
const dom=(v,id)=>v.domains.find(x=>x.id===id);
const fatesOf=v=>[v.origin.fate,v.core.fate,...v.domains.flatMap(x=>x.fates)];
const textsOf=v=>[...fatesOf(v),v.origin.fact,v.origin.rule,v.symbol,v.elementIntro,...Object.values(v.elementRoles),...v.elements,v.core.rule,...v.domains.flatMap(x=>[x.head,x.detail,...(x.rule?[x.rule]:[])]),...v.domains.map(x=>x.basis).filter(Boolean),
 v.yearRule,...v.luck.cycles.map(x=>x.stage).filter(Boolean),...v.luck.ruling,v.verdict,v.fixedNote,...v.cautions,v.footNote,v.lastLine];
const fam=(r,stem)=>api.TEN_FAMILY[api.tenGod(r.a.dayStem,stem)];
const hi=(r,f)=>['strong','excess'].includes(r.a.families[f].level);
function bossOf(r){
 const me=api.STEMS[r.a.dayStem].el,boss=api.CONTROLLED_BY[me],ms=r.shares[me],bs=r.shares[boss];
 const key=bs===0?'absent':r.counts[boss]===0?'hidden':bs>=ms?'high':bs>=ms*0.6?'mid':'low';
 return {me,boss,ms,bs,key,officeLow:!r.fate.officer.present||key==='low'};
}

test('a personal portrait opens the reading before the family verdict and wider judgments',()=>{
 const view=slice('<main id="result-screen"','</main>');
 // 2026-11-07 구성: 태어난 때(사주·막대·별자리) → 당신을 보니 → 타고난 팔자(집안 → 부리는 기운 → 성향) → 일곱 칸 → 지나온 해와 앞날 → 전체 풀이
 const order=['id="runhead"','id="pillars"','id="share-leg"','id="saju-details"','id="western-chart"','id="reading-portrait"','id="portrait-symbol"','id="fate-card"','id="origin"','id="boss-line"','id="core-body"','id="sections"',
  'id="time-block"','id="past-hits"','id="years"','id="month-reading"','id="year-next"','id="luck-graph"','id="luck-list"','id="year-rule"','id="cycle-ruling"','id="verdict"','id="fixed-note"','id="caution"','id="foot-note"','id="last-line"','id="fate-go"'];
 order.forEach((id,i)=>{assert(view.includes(id),id);if(i)assert(view.indexOf(order[i-1])<view.indexOf(id),id);});
 for(const gone of ['id="me-card"','id="elements"','id="elem-lines"','id="past-block"','나를 나타내는 상징','타고난 다섯 가지 비율','올해와 내년','10년 단위 흐름'])assert(!view.includes(gone),gone);
 for(const label of ['>당신이 태어난 때<','>타고난 운명<','>지나온 해와 앞날<','>전체 풀이<'])assert(view.includes(label),label);
 // 숨은 상징은 자리를 옮겨도 남는다: 오행 별 문양은 다섯 기운 막대 옆, 뱀 문양은 연표 이름표 옆
 assert(/class="elem-strip"/.test(view)&&/\.elem-strip::after\{background-image:/.test(html.replace(/\.sym-pent>\.sec-label::after,/,'')));
 assert(/class="block timeline sym-oro"/.test(view));
 assert(!/id="judge"|자리 판정|id="countdown"/.test(view));
 for(const {v} of ALL)assert.equal(v.domains.map(x=>x.id).join(' '),'work money body home family gwiin office');
});

test('the dark-secret reveal survives the new layout: markers, running head, emblem triangles and hidden symbols',()=>{
 // 이름표 표시: 일까지 네모, 돈부터 세모, 일곱 칸 뒤(연표·전체 풀이)는 눈 달린 세모
 assert(/#sec-money \.sec-label::before,#sec-money~\.reading \.sec-label::before,#sections~section \.sec-label::before\{[^}]*var\(--mk-tri\)/.test(html));
 assert(/#sections~section \.sec-label::before\{background-image:var\(--mk-eye\)\}/.test(html));
 // 상단 머릿말도 같은 문양과 같은 규칙을 쓴다
 assert(/\.runhead\[data-mark="tri"\] \.rh-mark[^{]*\{[^}]*var\(--mk-tri\)/.test(html)&&/\.runhead\[data-mark="eye"\] \.rh-mark\{background-image:var\(--mk-eye\)\}/.test(html));
 const rh=slice('function runheadMark(el){','function runheadName(el){');
 assert(/return 'eye'/.test(rh)&&/return 'tri'/.test(rh)&&/return 'sq'/.test(rh)&&rh.indexOf("'eye'")<rh.indexOf("'tri'"));
 // 칸 그림 일곱 개. 돈·가족·귀인·관운 그림에는 세모가 숨어 있고 귀인·관운에는 눈이 있다
 const sym=id=>{const m=html.match(new RegExp('<symbol id="'+id+'"[\\s\\S]*?</symbol>'));assert(m,id);return m[0];};
 for(const id of ['s-work','s-money','s-body','s-home','s-family','s-gwiin','s-office'])sym(id);
 for(const id of ['s-money','s-family','s-gwiin','s-office'])assert(/<path d="M[\d.]+ [\d.]+l[\d.]+ [\d.]+h-[\d.]+z"|<path d="M[\d.]+ [\d.]+l[\d.]+ [\d.]+H[\d.]+z"/.test(sym(id)),id);
 for(const id of ['s-work','s-body','s-home'])assert(!/z" fill="none" stroke="#e0402a"/.test(sym(id)),id);
 for(const id of ['s-gwiin','s-office'])assert(/q[\d.]+-[\d.]+ [\d.]+ 0q/.test(sym(id)),id+' eye');
 // 숨은 상징: 오행 별 문양(막대 옆)과 뱀 문양(연표 이름표 옆), 마지막 문장 뒤 세모 눈
 assert(/\.sym-pent>\.sec-label::after,\.elem-strip::after\{background-image:/.test(html));
 assert(/\.sym-oro>\.sec-label::after\{background-image:/.test(html)&&/id="time-block"/.test(html));
 assert(/\.fate-end::before\{/.test(html)&&/--doomEye/.test(html));
 // 짙어지는 배경은 판정 카드(.core)에서 시작해 전체 풀이(.verdict)에서 끝난다
 assert(/querySelector\('#result-screen \.core'\)/.test(html)&&/<section class="block core" id="fate-card">/.test(html));
});

test('the direction is written where the next editor sees it, and the screen copy comes only from v5Reading',()=>{
 const head=slice('/* ---------- 자리 문서(V5)','const V5=');
 for(const k of ['집안 판정부터 꺾고','사주·별자리 조건에 묶는다','상한을 두지 않는다','이치를 문단 안에 둔다','이름표를 따로 붙이지 않는다','당신은 …팔자입니다','사람마다 다르게'])assert(head.includes(k),k);
 const render=slice('function renderResult(R){','function cycleAgeLabel(');
 assert(render.includes('v5Reading(R'));
 assert(!/\br\.(sections|verdict|cautions|observations)\b/.test(render));
});

test('the family verdict that follows the opening still uses only the ancestor and parent pillars',()=>{
 const seen=new Set;
 for(const {r,v} of ALL){
  const P=r.P.slice(0,2).filter(p=>p&&p.known);
  const want=P.some(p=>fam(r,p.stem)==='재성')?'shown':P.some(p=>(api.HIDDEN[p.branch]||[]).some(h=>fam(r,h[0])==='재성'))?'hidden':'absent';
  seen.add(want);
  assert.equal(v.origin.key,want);assert.match(v.origin.fate,/^당신은 /);
  assert.equal(/물려받을 것 없이/.test(JSON.stringify(v)),want==='absent');
  assert.match(v.origin.fact,{shown:/위 글자에 재물 기운이 드러나/,hidden:/아래 글자 속에 숨어/,absent:/어디에도 재물 기운이 없습니다/}[want]);
 }
 assert.equal(seen.size,3);
});

test('the opening follows the natal pattern, keeps body details conditional, and treats children separately',()=>{
 const scenes=new Map(),balanced=ALL.filter(({r})=>r.a.strength.label==='중화');
 for(const {r,v} of ALL){
  const {god,exposed}=r.a.structure,key=god+':'+exposed;
  assert.equal(v.portrait.length,3);
  assert(v.portrait.every(p=>typeof p==='string'&&p.length>=65&&!/팔자|복은 집에서|undefined/.test(p)));
  if(scenes.has(key))assert.equal(v.portrait[0],scenes.get(key));
  scenes.set(key,v.portrait[0]);
 }
 assert(new Set(scenes.values()).size>=18);
 assert(balanced.length>0);
 for(const {v} of balanced)assert.doesNotMatch(v.portrait[1],/푸근한 편|턱선이|키순으로|한쪽 다리|눈썹이|호리호리/);
 const child=make(2021,3,12,{unknown:true}).v;
 assert.equal(child.portrait.length,3);
 assert(child.portrait.every(p=>p.length>=65));
 assert.doesNotMatch(child.portrait.join(' '),/어릴 때|아이였습니다|했었습니다/);
 assert.deepEqual(make(1990,1,1,{unknown:true,male:false,name:'가명'}).v.portrait,make(1990,1,1,{unknown:true}).v.portrait);
});

test('two charts with the same opening trait lead into their own work scene and ruling',()=>{
 const first=make(1990,1,1,{unknown:true}).v;
 const second=make(1994,7,15,{pk:'busan',h:12,male:false}).v;
 assert.equal(first.portrait[0],second.portrait[0]);
 assert.notEqual(first.portrait[2],second.portrait[2]);
 const correction=dom(first,'work'),extraWork=dom(second,'work');
 assert.equal(correction.cause,'hurt_officer');
 assert.match(first.portrait[2],/출구|지도/);
 assert.match(correction.rule,/방법을 정한 사람/);assert.match(correction.head,/시키지 않은 방법/);
 assert.equal(extraWork.cause,'officer_overload');
 assert.match(second.portrait[2],/다음 여행/);
 assert.match(extraWork.rule,/이번에도.*맡기/);
 const payCases=ALL.map(({v})=>dom(v,'work')).filter(work=>work.rule.includes('먼저 재물을 내놓은 대가'));
 assert(payCases.length>0);
 for(const work of payCases)assert.match(work.head,/품삯/);
});

test('wealth hidden in secondary stems is never read as an empty inheritance',()=>{
 const {r,v}=make(1980,4,15);
 assert.equal(r.pillars.map(p=>p.gz).join(' '),'庚申 庚辰 戊午 戊午');assert(r.fate.wealth.present);
 assert.equal(v.origin.key,'hidden');assert.match(dom(v,'money').basis,/아래 글자 안에 숨어/);
 assert(!/물려받을 것 없이/.test(JSON.stringify(v)));
 const none=make(1970,9,15);assert.equal(none.r.fate.wealth.present,false);
 assert.equal(none.v.origin.key,'absent');assert.match(none.v.origin.fate,/물려받을 것 없이/);
});

test('every element explains its role for this day master, not a fixed personality type',()=>{
 const names={비겁:'내 뜻·사람',식상:'말·결과물',재성:'돈·살림',관성:'기준·책임',인성:'배움·받침'};
 for(const {r,v} of ALL){
  assert.equal(Object.keys(v.elementRoles).length,5);
  for(const k of Object.keys(r.shares))assert.equal(v.elementRoles[k],names[api.elementFamilyV2(r.a,k)]);
  assert(!/나무은|쇠은|평생 남에게서 빌려/.test(v.elements[0]));
 }
 const water=ALL.find(x=>x.r.a.dayEl==='수'),wood=ALL.find(x=>x.r.a.dayEl==='목');
 assert(water&&wood);assert.equal(water.v.elementRoles.화,'돈·살림');assert.equal(wood.v.elementRoles.화,'말·결과물');
 const notWeak=ALL.filter(({r})=>{const el=Object.keys(r.shares).sort((a,b)=>r.shares[a]-r.shares[b])[0];return Object.values(r.counts).every(n=>n>0)&&!['weak','absent'].includes(r.a.families[api.elementFamilyV2(r.a,el)].level);});
 assert(notWeak.length);for(const {v} of notWeak){assert.match(v.elements[0],/여기서 .+입니다\.$/);assert(!/비중이 작아도 없는 힘|아래 생활 풀이에 드러납니다/.test(v.elements[0]));}
});

test('small comforts retain their own cause and a rule without taking over other money cases',()=>{
 const m=dom(make(2001,6,21,{unknown:true,male:false}).v,'money');
 assert.equal(m.cause,'comfort');assert.match(m.head,/작은 편의/);assert.match(m.detail,/한 달 치/);assert.match(m.note.value,/편의·작은 보상/);
 assert.match(m.fates[0],/오늘.*내일/);assert.match(m.rule,/남의 수고.*값을 치러야/);
 const money=ALL.map(({v})=>dom(v,'money')),kinds=new Set(money.map(x=>x.cause));
 for(const key of ['comfort','burden','share','holding','paper','reserve'])assert(kinds.has(key),key);
 assert(money.filter(x=>x.cause==='comfort').length<ALL.length/2);
 for(const m of money){assert(m.detail&&m.note.value);assert(!/세금과 회비와 윗사람/.test(m.fates.join(' ')));}
});

test('an actual money conflict takes priority over a generic consumption habit',()=>{
 const cases={wealth_weak_self:['burden',/고정비·관리/],weak_wealth:['burden',/고정비·관리/],peer_robs_wealth:['share',/정산/],wealth_breaks_resource:['interrupted',/준비/],peer_unchecked:['holding',/정리/],strong_peer:['holding',/정리/]};
 let checked=0;
 for(const {r,v} of ALL){const f=r.ziping.findings.find(x=>(x.domains||[]).includes('money'));if(!f||!cases[f.key])continue;
  const m=dom(v,'money'),[key,note]=cases[f.key];assert.equal(m.cause,key);assert.match(m.note.value,note);checked++;
 }
 assert(checked>20);
});

test('self-driven overwork stays self-driven in the displayed fate',()=>{
 const expected={'내일 확인해도':/마음 편히 쉬려고/,'빈 시간이 생기면':/누가 시키지 않아도/,'쉬는 간격 없이':/흐름이 끊기는 게 아까워/,'집에 와서도':/끝낸 일의 걱정/,'불편을 넘기며':/아직 할 만하다고/};
 let n=0;for(const {r,v} of ALL){const o=r.observations.find(x=>x.id==='body'),d=dom(v,'body');
  for(const [prefix,want] of Object.entries(expected))if(o.body[0].includes(prefix)){assert.match(d.fates[0],want);assert(!/요구를 받아|눈치를 보며|쉬겠다는 말을 꺼내지/.test(d.fates[0]));n++;}
 }
 assert(n>30);
});

test('quiet withdrawal is not rewritten as overwork or lack of money',()=>{
 const home=dom(make(1970,9,15).v,'home');assert.match(home.head,/싸운 적이 없어도/);assert.match(home.detail,/답장을 늦춥니다/);
 assert.match(home.fates[0],/서운한 마음을 꺼내.*답장을 미루다가/);assert(!/일하다가|형편이 안 돼서/.test(home.fates[0]));
 const core=make(1990,1,1,{unknown:true}).v.core;assert.match(core.title,/맞는 말을/);assert.match(core.fate,/맞는 말을 하고 손해/);
});

test('element balance stays consistent while office follows the specific structure',()=>{
 for(const {r,v} of ALL){
  const b=bossOf(r),office=dom(v,'office'),work=dom(v,'work');
  assert.equal(work.fates.length,1);assert(!/직원이|작은 회사를 전전/.test(work.fates.join(' ')));
  assert.match(v.elements[1],{absent:/확인한 글자에는 그 기운이 없어/,hidden:/겉에 드러나지 않은 기운/,high:b.bs===b.ms?/비중이 같습니다/:/당신보다 세고/,mid:/힘이 비슷해서/,low:/부리는 기운이 약해서/}[b.key]);
  if(b.key==='high'&&b.bs===b.ms)assert(!/당신보다 세고|센 기운이 약한 기운/.test(v.elements[1]));
  assert.equal(office.cause,v.keys.officeCase);assert(office.basis.startsWith(r.fate.officer.fact));
  assert.equal(work.rule==='해 보겠다고 한 말은 약속으로 남고, 그 말을 지키느라 쓴 휴일은 기록에 남지 않습니다.',work.cause==='식상');
  // 관운 칸의 V5 문장(제목·장면·팔자·이치)은 투표·항의 구호를 쓰지 않는다. 선거는 2026-11-07 초안에서 확정한 O3 문단 한 곳에서만 말한다.
  const officeCopy=[office.head,office.detail,office.rule,...office.fates].join(' ');
  assert(office.evidenceIds.length);assert(!/표 한 장|투표|선거|항의가 끝날 때까지 월급/.test(officeCopy));
  assert(office.paragraphs.filter(t=>/선거/.test(t)).every(t=>t===ReadingPool.POOL.office.find(x=>x.id==='O3').text));
 }
});

test('seven office cases select different predicaments from real chart evidence',()=>{
 const fixtures=[
  ['weak',1978,10,1,{h:3,mi:30}],['hidden',1960,1,22,{h:6,mi:30,male:false}],
  ['regular',1971,1,10,{unknown:true}],['pressure',2004,12,7,{h:13,mi:30}],
  ['mixed',2002,9,21,{h:16,mi:30}],['challenge',1974,5,2,{h:1,mi:30}],
  ['supported',1984,2,5,{h:7,mi:30}]
 ];
 const seen=new Set;
 for(const [key,y,m,d,opts] of fixtures){
  const {r,v}=make(y,m,d,opts),office=dom(v,'office');assert.equal(office.cause,key);
  seen.add(office.fates[0]);assert(office.head&&office.detail&&office.rule&&office.basis);
  if(key==='mixed'){assert(r.a.structure.failure.some(f=>f.id==='mixed_officer'));assert(r.a.structure.success.includes('관인상생'));}
  if(key==='challenge')assert(r.a.structure.failure.some(f=>f.id==='hurt_officer'));
  if(key==='hidden'){assert(r.fate.officer.hidden.length);assert.equal(r.fate.officer.visible.length,0);assert(!['weak','absent'].includes(r.a.families.관성.level));}
  if(key==='supported'){assert(r.a.structure.success.includes('관인상생'));assert(!['신약','극약'].includes(r.a.strength.label));assert.match(office.fates[0],/얻은 권한을 지키려고/);assert.match(v.cautions[2],/사람을 쓸 때는 처음부터 손발이 맞는 이를/);assert(!/정할 권한까지 바라면/.test(v.cautions.join(' ')));}
 }
 assert.equal(seen.size,7);
});

test('resolved officer combinations are not narrated as unresolved mixed demands',()=>{
 let supported=0,weak=0;
 for(const {r,v} of ALL){
  const office=dom(v,'office'),fail=r.a.structure.failure;
  if(office.cause==='mixed')assert(fail.some(f=>f.id==='mixed_officer'));
  if(office.cause==='challenge')assert(fail.some(f=>f.id==='hurt_officer'));
  if(office.cause==='supported'){
   supported++;assert(r.fate.officer.visible.length);
   assert(office.evidenceIds.some(e=>e.startsWith('success:')));
   assert(!fail.some(f=>['mixed_officer','hurt_officer','officer_overload','killer_unchecked'].includes(f.id)));
   assert(!['신약','극약'].includes(r.a.strength.label));
  }
  if(office.cause==='weak'){weak++;assert(['weak','absent'].includes(r.a.families.관성.level));}
 }
 assert(supported>0&&weak>0);
});

test('life-stage lines appear only when the chart and the person allow them',()=>{
 for(const {r,v,y,male,unknown} of ALL){
  const home=dom(v,'family').fates.join(' '),office=dom(v,'office').fates.join(' ');
  const parentWork=!male&&hi(r,'식상'),workConflict=r.a.structure.failure.some(x=>x.id==='hurt_officer');
  assert.equal(/경력이 끊기/.test(home),parentWork&&workConflict);
  assert.equal(/일하는 몫에 돌보는 몫까지/.test(home),parentWork&&!workConflict);
  assert.equal(dom(v,'office').fates.length,1);
  assert(!/나라에 내준 시간|관재수/.test(office));
  if(unknown)assert(!/아이의 교육비와 독립할 돈|아이에게 물려줄 돈|자식에게 그대로/.test(home));
  assert(!/집값이 다 오른 뒤에 태어나/.test(dom(v,'home').fates.join(' ')));
 }
});

test('element absence includes hidden stems and uses the same facts as the percentage bar',()=>{
 const examples=[make(1990,1,1,{unknown:true}),make(1980,4,29),make(2001,6,21,{unknown:true,male:false})];
 for(const {r,v,unknown} of examples.concat(ALL)){
  const keys=Object.keys(r.shares),hidden=keys.filter(k=>r.counts[k]===0&&r.shares[k]>0),absent=keys.filter(k=>r.shares[k]===0),line=v.elements[0];
  const names=ks=>ks.map(k=>api.ELEMENTS[k].name).join('·');
  if(hidden.length)assert(line.includes(names(hidden)+' 기운은 아래 글자 속에만 있습니다.'),line);
  if(absent.length){assert(line.includes(names(absent)+' 기운이 없습니다.'),line);assert(line.includes(unknown?'태어난 시간을 뺀 여섯 글자에는':'당신의 여덟 글자에는'),line);}
  else assert(!line.includes('기운이 없습니다.'),line);
  const b=bossOf(r);assert.equal(/겉에 드러나지 않은 기운/.test(v.elements[1]),r.counts[b.boss]===0&&b.bs>0);
 }
 assert.match(examples[0].v.elements[0],/쇠 기운은 아래 글자 속에만/);
 assert.match(examples[1].v.elements[0],/나무 기운은 아래 글자 속에만/);
 assert.match(examples[2].v.elements[0],/흙 기운은 아래 글자 속에만.*물 기운이 없습니다/);
});

test('unknown time omits hour-pillar claims while retaining family copy supported by known pillars',()=>{
 for(const {v} of [make(1990,1,1,{unknown:true}),make(2001,6,21,{unknown:true,male:false}),...ALL.filter(x=>x.unknown)]){
  const home=dom(v,'family'),future=v.luck.cycles.map(x=>x.stage).join(' ');
  assert(!/아이의 교육비와 독립할 돈|아이에게 물려줄 돈|자식에게 그대로|당신의 말년은 아이의 자리에/.test(home.fates.join(' ')+' '+future));
 }
 const example=make(2001,6,21,{unknown:true,male:false});
 assert(hi(example.r,'식상'));
 assert.match(dom(example.v,'family').fates.join(' '),/아이를 낳으면 일하는 몫에 돌보는 몫까지/);
 assert.match(dom(example.v,'family').rule,/아이를 키우는 몫은 일하는 몫에서 빼 주지 않습니다/);
});

test('productive expression keeps both responsibilities while career loss requires an unresolved work conflict',()=>{
 const supported=make(1985,9,14,{h:14,male:false}),home=dom(supported.v,'family');
 assert(supported.r.a.structure.success.includes('식상생재'));
 assert.equal(supported.r.a.structure.failure.length,0);
 assert.match(home.fates.join(' '),/일하는 몫에 돌보는 몫까지/);
 assert(!/경력이 끊기|돌아갈 일자리/.test(home.fates.join(' ')));
 assert.match(home.rule,/둘 다 감당해야/);
 const conflicts=ALL.filter(x=>!x.male&&hi(x.r,'식상')&&x.r.a.structure.failure.some(f=>f.id==='hurt_officer'));
 assert(conflicts.length>0);
 for(const {v} of conflicts){assert.match(dom(v,'family').fates.join(' '),/경력이 끊기/);assert.match(dom(v,'family').rule,/비운 쪽은 처음부터/);}
});

test('every fate line is one sentence in the agreed form and no line uses the banned contrast',()=>{
 for(const {v} of ALL){
  for(const f of fatesOf(v))assert.match(f,/^당신은 [^,]+팔자입니다\.$/,f);
  assert.match(v.verdict,/^(당신은|\S+ 님은) [^,]+운명입니다\.$/);
  for(const t of textsOf(v)){assert.equal(typeof t,'string');assert(t.length);assert(!/이지,|가 아니라|이 아니라|이지 [^.]*아닙니다/.test(t),t);}
  assert(!/undefined|NaN/.test(JSON.stringify(v)));
 }
 assert.match(make(1991,7,9,{h:14,mi:30,name:'민수'}).v.verdict,/^민수 님은 /);
});

test('every life domain keeps a distinct rule and uses the common reading order',()=>{
 for(const {v} of ALL){assert(v.origin.rule&&v.core.rule&&v.yearRule);for(const d of v.domains){assert(d.rule,d.id);assert(!d.fates.includes(d.rule));}}
 const render=slice('function renderResult(R){','function cycleAgeLabel(');
 assert(!/sec.id==='money'/.test(render));
 // 장면과 이치는 같은 문단 줄에 놓고 이름표 없이 읽는다. 팔자 줄이 맨 뒤, 돈이 새는 곳 메모는 그 아래에 둔다.
 assert(/woven-paragraph[\s\S]*woven-closing[\s\S]*\+note/.test(render));
 assert(!render.includes('<b>이치</b>'));assert(!/<b>근거<\/b>|western-link|expansion/.test(render));
 for(const {v} of ALL)for(const d of v.domains){
  // 돈을 뺀 여섯 칸은 둘째 문단(한 방) 끝에 이치를 품는다. 돈은 유형별 한 방이 대신한다.
  if(d.id!=='money'){assert.equal(d.paragraphs.filter(t=>t.endsWith(d.rule)).length,1,d.id);assert(d.paragraphs[1].endsWith(d.rule),d.id);}
  assert.deepEqual(d.closing,d.fates);
  assert(d.closing.every(t=>!d.paragraphs.includes(t)),d.id);
 }
 for(const k of ['복은 집에서 내려옵니다','센 기운이 약한 기운을 부리는 것이 다섯 기운의 순리',
  '계약한 비용은 약속한 날에 치르는 법','먼저 재물을 내놓은 대가','나라 사이에서도 큰 기운이 작은 기운을 누르는',
  '지시받은 만큼만 하면 탈이 없습니다','남의 결정에 따라 사는 사람은 운을 묻습니다'])assert(V5_SRC.includes(k),k);
});

test('readings differ from person to person and only the agreed lines are shared',()=>{
 const n=ALL.length,count=f=>{const m=new Map;for(const x of ALL){const k=f(x.v);m.set(k,(m.get(k)||0)+1);}return m;};
 const slots={origin:v=>v.origin.fate,symbol:v=>v.symbol,boss:v=>v.elements[1].replace(/^.*?입니다\. /,''),mind:v=>v.core.fate,
  work:v=>dom(v,'work').fates[0],money:v=>dom(v,'money').fates[0],body:v=>dom(v,'body').fates[0],home:v=>dom(v,'home').fates[0],office:v=>dom(v,'office').fates[0],
  workRule:v=>dom(v,'work').rule,moneyRule:v=>dom(v,'money').rule,bodyRule:v=>dom(v,'body').rule,homeRule:v=>dom(v,'home').rule,officeRule:v=>dom(v,'office').rule,
  yearRule:v=>v.yearRule,ruling:v=>v.luck.rulingKey,caution0:v=>v.cautions[0],caution2:v=>v.cautions[2]};
 for(const [k,f] of Object.entries(slots)){const m=count(f);assert(m.size>=2,k);assert(Math.max(...m.values())/n<=0.75,k);}
 const verdicts=count(v=>v.verdict);assert(verdicts.size>=n*0.5,String(verdicts.size));assert(Math.max(...verdicts.values())/n<=0.05);
 for(const f of [v=>v.cautions[1],v=>v.footNote,v=>v.lastLine,v=>v.fixedNote])assert.equal(count(f).size,1);
});

test('subjects stay explicit and each card keeps its own cause',()=>{
 const core=make(1991,3,13,{h:2,mi:30}).v.core;
 assert.equal(core.cause,'speech');assert.match(core.title,/옳은 말/);
 assert.match(core.body.join(' '),/어떻게 말했는지/);assert.match(core.fate,/말한 방식까지 인정/);
 assert(!/확인하다가|퇴근하지 못/.test(core.fate));
 const money=ALL.map(({v})=>dom(v,'money'));
 for(const m of money)assert(!/받는 자리|기다릴 돈이 있는 자리|일하는 자리|재물 자리가/.test(JSON.stringify(m)));
 for(const {v} of ALL){
  assert.equal(dom(v,'home').fates.length,1);assert.equal(dom(v,'family').fates.length,1);
  assert(!/아이에게|자식에게|노후|부양|경력이 끊기/.test(dom(v,'home').fates.join(' ')));
  assert(!/세상을 바꾸러|기다릴 돈이 있는|남들이 서른에|마흔이 넘어서도|직원이 다섯/.test(JSON.stringify(v)));
  assert(!Object.hasOwn(v.luck,'end'));
 }
 assert(!slice('function renderResult(R){','function cycleAgeLabel(').includes('v.luck.end'));
});

test('supported core traits keep the matching cause instead of the largest element',()=>{
 let n=0,groups=new Set;
 for(const {r,v} of ALL)if(r.dominant.key==='supported_structure'){
  assert.equal(v.core.cause,r.fate.support.group);groups.add(v.core.cause);n++;
 }
 assert(n>10);assert(groups.size>=3);
});

test('the ten-year ruling follows the computed scores',()=>{
 for(const {v} of ALL){
  const cur=v.luck.cycles.find(x=>x.now),later=v.luck.cycles.filter(x=>!x.now&&(!cur||x.c.i>cur.c.i));
  assert.equal(v.luck.rulingKey==='peak',!!cur&&later.length>0&&later.every(x=>x.c.score>cur.c.score));
  if(v.luck.rulingKey==='support')assert(later.some(x=>(x.c.evidence||[]).some(e=>e.valence==='support')));
  // 앞에서 이미 나온 문장만 덜어 낸다. 남은 문장은 그 흐름의 계산된 문장이다.
  for(const x of later){const own=api.sentenceListV2(x.c.text);assert(api.sentenceListV2(x.stage).every(t=>own.includes(t)),x.stage);}
 }
});

test('past years come from the computation, adult years only, each year once',()=>{
 for(const {v,y} of ALL){
  const ys=v.past.map(x=>x.year);assert.equal(new Set(ys).size,ys.length);
  for(const x of v.past){assert(x.year>=y+19&&x.year<THIS_YEAR);assert(!/겹치는 해$/.test(x.title));}
 }
});

test('adult work and household history is never assigned to childhood',()=>{
 for(const year of [1970,1990,2001,2015])for(const male of [true,false]){
  const {r}=make(year,1,1,{unknown:true,male});
  assert(r.pastHits.every(x=>x.year>=year+19&&x.year<THIS_YEAR));
  if(year+19>=THIS_YEAR)assert.equal(r.pastHits.length,0);
 }
});

test('the graph follows changing scores, including a better future, instead of forcing a decline',()=>{
 const cycles=[{i:0,age:20,startYear:2020,score:30},{i:1,age:30,startYear:2030,score:80},{i:2,age:40,startYear:2040,score:10}];
 const svg=api.luckGraph({current:0},cycles,1),ys=Array.from(svg.matchAll(/<circle cx="[^"]+" cy="([^"]+)"/g),m=>+m[1]);
 assert.equal(ys.length,3);assert(ys[1]>ys[0]);assert(ys[2]<ys[0]);
});

test('current month changes at the solar-term boundary and retains its own explanation',()=>{
 const {r}=make(1991,3,13,{h:2,mi:30}),months=r.years.flatMap(y=>y.months);
 const current=months.find(m=>m.start<=NOW&&NOW<m.end);
 const shown=api.currentMonthView(r.years,NOW);
 assert.equal(shown.title,current.title);assert.equal(shown.text,current.text);
 assert(current.text);assert.match(shown.period,/2026년/);assert.match(shown.transition,/입동/);
 assert.equal(api.currentMonthView(r.years,current.end-1).title,current.title);
 const next=months.find(m=>m.start===current.end),changed=api.currentMonthView(r.years,current.end);
 assert.equal(changed.title,next.title);assert.equal(changed.text,next.text);assert.equal(changed.end,next.end);
 const january=months.find(m=>new Date(m.start+9*3600000).getUTCFullYear()!==new Date(m.end+9*3600000).getUTCFullYear());
 assert(january);assert.match(api.currentMonthView(r.years,january.start).period,/2026년.*2027년/);
 assert.equal(api.currentMonthView([],NOW),null);
 assert.equal(api.currentMonthView(r.years,months[months.length-1].end),null);
 // The current month is shown even when it was not selected as one of the year's worst.
 const ordinary=months.find(m=>!r.years.some(y=>y.worstMonths.includes(m)));
 assert(ordinary);assert.equal(api.currentMonthView(r.years,ordinary.start).end,ordinary.end);
});



test('family support claims distinguish inherited money from inherited learning',()=>{
 const covered=new Set();
 for(const {r,v} of ALL){
  const learning=r.P.slice(0,2).filter(p=>p&&p.known).some(p=>fam(r,p.stem)==='인성'||(api.HIDDEN[p.branch]||[]).some(h=>fam(r,h[0])==='인성'));
  covered.add(v.origin.key+':'+learning);
  if(v.origin.key==='shown')assert.equal(v.origin.rule.includes('배울 길도 열어'),learning);
  if(v.origin.key==='absent')assert.equal(v.origin.rule.includes('배우고 익힐 바탕이 있어도'),learning);
 }
 for(const key of ['shown','absent'])for(const learning of [true,false])assert(covered.has(key+':'+learning));
});

test('crowd officer absence includes hidden stems and never assumes an unknown birth hour',()=>{
 let absent=0,hidden=0;
 for(const {r,v,unknown} of ALL){
  const P=r.P.filter(p=>p&&p.known);
  const present=P.some(p=>fam(r,p.stem)==='관성'||(api.HIDDEN[p.branch]||[]).some(h=>fam(r,h[0])==='관성'));
  assert.equal(v.marks.noOfficer,!unknown&&P.length===4&&!present);
  if(v.marks.noOfficer)absent++;
  if(!unknown&&present&&!P.some(p=>fam(r,p.stem)==='관성')){hidden++;assert(!v.marks.noOfficer);}
 }
 assert(absent>0);assert(hidden>0);
});

test('past, this year, the current month and the ten-year flow never repeat a sentence',()=>{
 let same=0;
 for(const {v} of ALL){
  const month=v.years.flatMap(y=>y.months||[]).find(m=>m.start<=NOW&&NOW<m.end);
  const cur=v.luck.cycles.find(x=>x.now);
  const texts=[...v.past.map(x=>x.text),...v.years.map(x=>x.text),month&&month.text,cur&&cur.c.text,...v.luck.cycles.filter(x=>!x.now).map(x=>x.stage)].filter(Boolean);
  const seen=new Set;
  for(const t of texts)for(const s of api.sentenceListV2(t)){assert(!seen.has(s),s);seen.add(s);}
  for(const y of v.years){
   const p=v.past.find(x=>y.text===x.year+'년과 같은 일이 다시 옵니다.');
   if(p){same++;assert(p.text);}
   assert(!('expansion' in y));
  }
  assert(v.past.every(x=>!('expansion' in x)));
 }
 assert(same>0,'a year that repeats a past year points back to it');
});

test('role and job lines name what changes instead of a vague 자리',()=>{
 for(const vague of ['그 자리를 벗어나지','돌아갈 자리는','담당이나 자리가'])assert(!V5_SRC.includes(vague),vague);
 for(const plain of ['남들이 피하는 역할을 한 번 맡고 나면 다음에도 그 역할로 불리는 팔자입니다.','돌아갈 일자리는 남아 있지 않은','담당이나 부서가 바뀔 때마다'])assert(V5_SRC.includes(plain),plain);
});
