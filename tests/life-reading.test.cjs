const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const api=require('./helpers/reading-api.cjs')();
const dom=(v,id)=>v.domains.find(d=>d.id===id),child=new Set(['care','cut','shown','absent','absentPoor']);
const fixtures=[
 ['absent',1972,1,1,0,true],['boundaries',1975,4,22,3,false],
 ['expectations',1980,9,1,8,true],['old',1981,10,8,9,false],
 ['absentPoor',1988,5,1,16,true],['young',1997,2,8,1,false],
 ['shown',1983,11,15,22,true],['cut',1984,12,22,23,false],
 ['care',1982,9,1,8,true],['learning',2012,8,17,14,false],['later',1958,8,17,14,false]
].map(([expected,y,m,d,h,male])=>({expected,...api.read({y,m,d},{h,mi:30},false,'seoul',male)}));

test('every authored family situation is reached by a real chart with one scene and one conditional judgment',()=>{
 for(const {expected,result,view:v} of fixtures){
  const d=dom(v,'family');assert.equal(d.cause,expected);
  assert.equal(d.paragraphs.length,2);assert.equal(d.closing.length,1);assert.equal(d.poolIds.length,0);
  assert.equal(d.familySelection.knownHour,true);
  if(child.has(expected)){
   assert(v.age>=26&&v.age<55);
   assert.match(d.paragraphs[0],/아이.{0,20}면/);
   assert.match(d.closing[0],/^당신은 아이를 낳으면/);
   if(v.verdictEvidence.domains.includes('family'))assert.match(v.verdict,/(?:아이|자식).{0,40}면/);
  }else assert(!/아이를 낳|아이에게|자식에게|교육비/.test(d.paragraphs.join(' ')+v.verdict));
 }
});

test('care applies to either sex and career loss needs the narrower conflict evidence',()=>{
 const male=fixtures.find(x=>x.expected==='care');
 const input=male.result.input;
 const female=api.read(input.date,input.time,false,'seoul',false).view;
 assert.equal(dom(female,'family').cause,'care');
 const cut=fixtures.find(x=>x.expected==='cut');
 assert(cut.view.familySignals.hourOutput);
 assert(cut.result.reading.a.structure.failure.some(x=>x.id==='hurt_officer'));
 const copy=structuredClone(cut.result);copy.reading.a.structure.failure=copy.reading.a.structure.failure.filter(x=>x.id!=='hurt_officer');
 assert.notEqual(dom(api.v5Reading(copy,Date.UTC(2026,10,8)),'family').cause,'cut');
 const unknown=api.read(cut.result.input.date,cut.result.input.time,true,'seoul',false).view;
 assert(!child.has(dom(unknown,'family').cause));
});

test('a known hour never forces a child scene on a teenager or an older reader',()=>{
 for(const y of [2012,2006,1958])for(const male of [true,false])for(const unknown of [true,false]){
  const v=api.read({y,m:8,d:17},{h:14,mi:0},unknown,'seoul',male).view;
  assert(!child.has(dom(v,'family').cause));
  assert(!/아이를 낳|아이를 돌보|아이에게/.test(v.verdict));
 }
});

test('youth scenes and portrait do not invent an adult employment or marriage history',()=>{
 for(let i=0;i<12;i++){
  const {result,view:v}=api.read({y:2010+i%5,m:i+1,d:1+i*2},{h:i*2,mi:30},i%3===0,'busan',i%2===0);
  const passages=[...v.portrait,...v.core.body,...v.domains.flatMap(d=>[d.head,...d.paragraphs,...d.closing]),v.verdict,...v.cautions];
  assert(!/세금계산서|퇴근|양가|출산|아이를 낳|월급|회식|배우자/.test(passages.join(' ')),passages.join('\n'));
  assert.equal(v.life.stage,'youth');assert.equal(v.verdictEvidence.thread,'learning-and-choice');
  assert(v.domains.every(d=>d.poolIds.length===0));assert(!dom(v,'money').relocationCost);
  for(const id of ['work','money','family'])assert(v.verdictEvidence.sources.some(s=>s.domain===id));
  const snapshot=JSON.stringify(result);api.v5Reading(result,Date.UTC(2026,10,8));assert.equal(JSON.stringify(result),snapshot);
 }
});

test('life-stage changes on the actual Korean birthday rather than New Year',()=>{
 const {result}=api.read({y:2007,m:11,d:9});
 const before=api.v5Reading(result,Date.UTC(2026,10,8,14,59));
 const after=api.v5Reading(result,Date.UTC(2026,10,8,15,0));
 assert.equal(before.age,18);assert.equal(before.life.stage,'youth');
 assert.equal(after.age,19);assert.equal(after.life.stage,'adult');
});

test('a repeated preparation cause advances from interrupted work to non-refundable costs',()=>{
 const v=api.read({y:1990,m:3,d:13},{h:2,mi:0},false,'seoul',false).view;
 const w=dom(v,'work'),m=dom(v,'money');
 assert.equal(w.cause,'wealth_breaks_resource');assert.equal(m.cause,'interrupted');
 assert.equal(m.sceneRole,'sunk-cost');assert.match(m.paragraphs[0],/수강 기한이 끝/);
 assert(!m.poolIds.includes('M3'));assert.match(m.closing[0],/이미 치른 값 위에/);
 assert.equal(m.integration.originalClosing[0],m.closing[0]);
});

test('the main path introduces one past reading and defers minor periods without losing date details',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 const view=html.slice(html.indexOf('<main id="result-screen"'),html.indexOf('</main>',html.indexOf('<main id="result-screen"')));
 assert(view.indexOf('id="reading-portrait"')<view.indexOf('id="past-hits"'));
 assert(view.indexOf('id="past-hits"')<view.indexOf('id="fate-card"'));
 assert(view.indexOf('id="luck-current"')<view.indexOf('<details class="timeline-more"'));
 const detail=view.slice(view.indexOf('<details class="timeline-more"'),view.indexOf('</details>',view.indexOf('<details class="timeline-more"')));
 for(const id of ['month-reading','luck-list','past-more'])assert(detail.includes('id="'+id+'"'));
 assert.match(html,/위는 수월함 · 아래는 마찰/);
 const P=require('../period-reading.js'),row=fixtures.find(x=>x.expected==='care');
 const req=P.request(row.result,row.view,api.sajuYearBoundsV2),data=P.compute(req);
 const snapshot=JSON.stringify(data),v=P.apply(structuredClone(row.view),data);
 assert.equal(JSON.stringify(data),snapshot);
 for(const y of v.years){assert(y.narrative);assert(y.months.every(m=>m.narrative&&Array.isArray(m.narrative.dates)));}
 for(const p of [...v.past,...v.years,...v.luck.cycles.map(x=>x.c)])assert.deepEqual(p.narrative.dates.flatMap(d=>d.sourceIds).sort(),p.starPeriods.map(x=>x.id).sort());
});
