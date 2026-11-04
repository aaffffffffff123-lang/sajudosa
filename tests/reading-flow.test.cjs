// 풀이 화면(자리 문서 V5)의 방향을 지키는 검사.
// 방향은 사용자가 정했다(2026-11-04): 첫 글줄부터 꺾고, 내려갈수록 범위를 넓히고, 독한 줄은 전부 사주 조건에 묶는다.
// 이 검사가 깨지면 문장을 순하게 되돌리지 말고 조건과 근거를 맞춘다.
// 엔진 판정은 reading-evidence.test.cjs가 따로 검사한다. V5는 생활 설명을 가져오거나 풀어 쓰되 제목·팔자의 원인을 일치시킨다.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>{const i=html.indexOf(a);assert(i>=0,a);const j=html.indexOf(b,i);assert(j>i,b);return html.slice(i,j);};
const V5_SRC=slice('/* ---------- 자리 문서(V5)','/* 현재 월운:');
const api=vm.runInNewContext(slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+V5_SRC+slice('function currentMonthView(','const MONTH_VIEW=')+slice('function luckGraph(','/* ---------- 입력 받기 ---------- */')
 +';({computeChart,makeReading,modernizeReadingDisplay,v5Reading,currentMonthView,luckGraph,TEN_FAMILY,tenGod,HIDDEN,ELEMENTS,CONTROLLED_BY,STEMS,elementFamilyV2})',{Intl,Date});
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
const textsOf=v=>[...fatesOf(v),v.origin.fact,v.origin.rule,v.symbol,v.elementIntro,...Object.values(v.elementRoles),...v.elements,v.core.rule,...v.domains.flatMap(x=>[x.head,x.detail,x.rule]),...v.domains.map(x=>x.basis).filter(Boolean),
 v.yearRule,v.luck.end,...v.luck.cycles.map(x=>x.stage).filter(Boolean),...v.luck.ruling,v.verdict,v.fixedNote,...v.cautions,v.footNote,v.lastLine];
const fam=(r,stem)=>api.TEN_FAMILY[api.tenGod(r.a.dayStem,stem)];
const hi=(r,f)=>['strong','excess'].includes(r.a.families[f].level);
function bossOf(r){
 const me=api.STEMS[r.a.dayStem].el,boss=api.CONTROLLED_BY[me],ms=r.shares[me],bs=r.shares[boss];
 const key=bs===0?'absent':r.counts[boss]===0?'hidden':bs>=ms?'high':bs>=ms*0.6?'mid':'low';
 return {me,boss,ms,bs,key,officeLow:!r.fate.officer.present||key==='low'};
}

test('the screen widens its scope in order: family, self, work·money·body, partner, state, world, ruling, commands',()=>{
 const view=slice('<main id="result-screen"','</main>');
 const order=['id="pillars"','id="origin"','id="me-card"','id="elem-lines"','id="core-body"','id="past-hits"','id="sections"','id="years"','id="year-rule"','id="month-reading"',
  'id="luck-graph"','id="cycle-ruling"','id="verdict"','id="fixed-note"','id="caution"','id="foot-note"','id="last-line"','id="fight-fate"'];
 order.forEach((id,i)=>{assert(view.includes(id),id);if(i)assert(view.indexOf(order[i-1])<view.indexOf(id),id);});
 assert(!/id="judge"|자리 판정|id="countdown"/.test(view));
 for(const {v} of ALL)assert.equal(v.domains.map(x=>x.id).join(' '),'work money body home office');
});

test('the direction is written where the next editor sees it, and the screen copy comes only from v5Reading',()=>{
 const head=slice('/* ---------- 자리 문서(V5)','const V5=');
 for(const k of ['첫 글줄부터 꺾는다','사주 조건에 묶는다','이치 줄','당신은 …팔자입니다','사람마다 다르게'])assert(head.includes(k),k);
 const render=slice('function renderResult(R){','function cycleAgeLabel(');
 assert(render.includes('v5Reading(R'));
 assert(!/\br\.(sections|verdict|cautions|observations)\b/.test(render));
});

test('the first prose line strikes at once and follows the wealth in the ancestor and parent pillars',()=>{
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
 assert(notWeak.length);for(const {v} of notWeak)assert.match(v.elements[0],/비중이 작아도 없는 힘은 아닙니다/);
});

test('small comforts retain the chosen line without turning every money problem into that habit',()=>{
 const m=dom(make(2001,6,21,{unknown:true,male:false}).v,'money');
 assert.equal(m.cause,'comfort');assert.match(m.head,/작은 편의/);assert.match(m.detail,/한 달 치/);assert.match(m.note.value,/편의·작은 보상/);
 assert.equal(m.fates[0],'당신은 오늘을 덜 힘들게 넘기려고 쓴 돈을 내일의 품으로 메우는 팔자입니다.');
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

test('officer strength is one value shared by the element line, work, office and commands',()=>{
 for(const {r,v} of ALL){
  const b=bossOf(r),office=dom(v,'office'),work=dom(v,'work');
  assert.equal(/표 한 장/.test(office.fates.join(' ')),b.officeLow);
  assert.equal(/직원이 다섯 명도 안 되는/.test(work.fates.join(' ')),b.officeLow);
  assert.match(v.elements[1],{absent:/확인한 글자에는 그 기운이 없어/,hidden:/겉에 드러나지 않은 기운/,high:/당신보다 세고/,mid:/힘이 비슷해서/,low:/부리는 기운이 약해서/}[b.key]);
  if(r.fate.officer.present)assert(office.basis.includes(api.ELEMENTS[b.boss].name+' '+Math.round(b.bs*100)+'%'),office.basis);
 }
});

test('life-stage lines appear only when the chart and the person allow them',()=>{
 for(const {r,v,y,male,unknown} of ALL){
  const age=THIS_YEAR-y,home=dom(v,'home').fates.join(' '),office=dom(v,'office').fates.join(' ');
  const parentWork=!male&&hi(r,'식상'),workConflict=r.a.structure.failure.some(x=>x.id==='hurt_officer');
  assert.equal(/경력이 끊기/.test(home),parentWork&&workConflict);
  assert.equal(/일하는 몫에 돌보는 몫까지/.test(home),parentWork&&!workConflict);
  assert.equal(/나라에 내준 시간/.test(office),male&&age>=22&&r.fate.officer.present);
  assert.equal(/관재수/.test(office),r.a.interactions.some(x=>['형','자형'].includes(x.kind)));
  if(unknown)assert(!/아이의 자리를 사 주느라|아이에게 넘길 몫|자식에게 그대로/.test(home));
  if(/집값이 다 오른 뒤에 태어나/.test(home))assert(y>=1985);
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
  const home=dom(v,'home'),future=v.luck.cycles.map(x=>x.stage).join(' ');
  assert(!/아이의 자리를 사 주느라|아이에게 넘길 몫|자식에게 그대로|당신의 말년은 아이의 자리에/.test(home.fates.join(' ')+' '+future));
 }
 const example=make(2001,6,21,{unknown:true,male:false});
 assert(hi(example.r,'식상'));
 assert.match(dom(example.v,'home').fates.join(' '),/아이를 낳으면 일하는 몫에 돌보는 몫까지/);
 assert.match(dom(example.v,'home').rule,/아이를 키우는 몫은 일하는 몫에서 빼 주지 않습니다/);
});

test('productive expression keeps both responsibilities while career loss requires an unresolved work conflict',()=>{
 const supported=make(1985,9,14,{h:14,male:false}),home=dom(supported.v,'home');
 assert(supported.r.a.structure.success.includes('식상생재'));
 assert.equal(supported.r.a.structure.failure.length,0);
 assert.match(home.fates.join(' '),/일하는 몫에 돌보는 몫까지/);
 assert(!/경력이 끊기|돌아갈 자리/.test(home.fates.join(' ')));
 assert.match(home.rule,/둘 다 감당해야/);
 const conflicts=ALL.filter(x=>!x.male&&hi(x.r,'식상')&&x.r.a.structure.failure.some(f=>f.id==='hurt_officer'));
 assert(conflicts.length>0);
 for(const {v} of conflicts){assert.match(dom(v,'home').fates.join(' '),/경력이 끊기/);assert.match(dom(v,'home').rule,/비우는 쪽은 처음부터/);}
});

test('every fate line is one sentence in the agreed form and no line uses the banned contrast',()=>{
 for(const {v} of ALL){
  for(const f of fatesOf(v))assert.match(f,/^당신은 [^,]+팔자입니다\.$/,f);
  assert.match(v.verdict,/^(당신은|\S+ 님은) [^,]+팔자입니다\.$/);
  for(const t of textsOf(v)){assert.equal(typeof t,'string');assert(t.length);assert(!/이지,|가 아니라|이 아니라|이지 [^.]*아닙니다/.test(t),t);}
  assert(!/undefined|NaN/.test(JSON.stringify(v)));
 }
 assert.match(make(1991,7,9,{h:14,mi:30,name:'민수'}).v.verdict,/^민수 님은 /);
});

test('every section keeps one rule line that states the injustice as the natural order',()=>{
 for(const {v} of ALL){assert(v.origin.rule&&v.core.rule&&v.yearRule);for(const d of v.domains)assert(d.rule,d.id);}
 for(const k of ['복은 집에서 내려옵니다','재물은 재물이 있는 자리로 모입니다','돈이 돈을 버는 것이 재물의 이치','센 기운이 약한 기운을 부리는 것이 다섯 기운의 순리',
  '정해진 날에 표를 넣는 것으로 나랏일과 이어지고','관재수','나라 사이에서도 큰 기운이 작은 기운을 누르는','자리에 맞게 살면 탈이 없습니다','운을 묻는 것은 아래 자리의 일'])assert(V5_SRC.includes(k),k);
});

test('readings differ from person to person and only the agreed lines are shared',()=>{
 const n=ALL.length,count=f=>{const m=new Map;for(const x of ALL){const k=f(x.v);m.set(k,(m.get(k)||0)+1);}return m;};
 const slots={origin:v=>v.origin.fate,symbol:v=>v.symbol,boss:v=>v.elements[1].replace(/^.*?입니다\. /,''),mind:v=>v.core.fate,
  work:v=>dom(v,'work').fates[0],money:v=>dom(v,'money').fates[0],body:v=>dom(v,'body').fates[0],home:v=>dom(v,'home').fates[0],office:v=>dom(v,'office').fates[0],
  workRule:v=>dom(v,'work').rule,moneyRule:v=>dom(v,'money').rule,bodyRule:v=>dom(v,'body').rule,homeRule:v=>dom(v,'home').rule,officeRule:v=>dom(v,'office').rule,
  yearRule:v=>v.yearRule,ruling:v=>v.luck.rulingKey,caution0:v=>v.cautions[0],caution2:v=>v.cautions[2]};
 for(const [k,f] of Object.entries(slots)){const m=count(f);assert(m.size>=2,k);assert(Math.max(...m.values())/n<=0.75,k);}
 const verdicts=count(v=>v.verdict);assert(verdicts.size>=n*0.5,String(verdicts.size));assert(Math.max(...verdicts.values())/n<=0.05);
 for(const f of [v=>v.cautions[1],v=>v.luck.end,v=>v.footNote,v=>v.lastLine,v=>v.fixedNote])assert.equal(count(f).size,1);
});

test('the ten-year ruling follows the computed scores',()=>{
 for(const {v} of ALL){
  const cur=v.luck.cycles.find(x=>x.now),later=v.luck.cycles.filter(x=>!x.now&&(!cur||x.c.i>cur.c.i));
  assert.equal(v.luck.rulingKey==='peak',!!cur&&later.length>0&&later.every(x=>x.c.score>cur.c.score));
  if(v.luck.rulingKey==='support')assert(later.some(x=>(x.c.evidence||[]).some(e=>e.valence==='support')));
  for(const x of later){assert(x.stage);assert.equal(x.stage,x.c.text);}
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
