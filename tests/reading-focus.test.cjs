const test=require('node:test'),assert=require('node:assert/strict');
const api=require('./helpers/reading-api.cjs')();
const NOW=Date.UTC(2026,10,9),plain=x=>JSON.parse(JSON.stringify(x));
const samples=[];
for(let i=0;i<120;i++)samples.push(api.read({y:1960+i%45,m:1+i%12,d:1+i%28},{h:i%24,mi:20},i%5===0,i%3?'seoul':'busan',i%2===0));

test('a result follows at most three supplemental scenes and every selected scene has eligible evidence',()=>{
 let omitted=0,relocations=0;
 for(const {view:v} of samples){
  const supplementary=v.domains.filter(d=>d.id!=='gwiin');
  assert(supplementary.reduce((n,d)=>n+d.poolIds.length,0)<=3);
  for(const d of v.domains){
   assert(d.poolIds.length<=1);assert(d.paragraphs.length<=3);assert.equal(d.closing.length,1);
   for(const id of d.poolIds){
    const candidate=d.candidates.find(x=>x.id===id);assert(candidate);
    assert(d.paragraphs.some(p=>p.includes(candidate.text)),id);
   }
   assert(d.westernAddedIds.every(id=>d.poolIds.includes(id)));
   omitted+=d.candidates.length-d.poolIds.length;
   if(d.relocationCost){relocations++;assert(d.poolIds.includes('M6'));}
  }
 }
 assert(omitted>0);assert(relocations>0);
});

test('the final verdict and every refined domain ending cite only scenes actually displayed',()=>{
 const threads=new Set();
 for(const {view:v} of samples){
  threads.add(v.verdictEvidence.thread);assert.equal(v.focus.thread,v.verdictEvidence.thread);
  for(const source of v.verdictEvidence.sources){
   if(source.domain==='origin'){assert.equal(source.cause,v.origin.key);continue;}
   const d=v.domains.find(x=>x.id===source.domain);assert(d);
   if(source.poolId)assert(d.poolIds.includes(source.poolId));else assert.equal(source.cause,d.cause);
  }
  for(const d of v.domains)if(d.integration.closingSourceId)assert(d.poolIds.includes(d.integration.closingSourceId));
 }
 assert(threads.size>=6,'different connected life situations remain reachable');
});

test('helper scenes keep the actual presence or absence of help and vary by grounded conditions',()=>{
 const variants=new Set();
 for(const {view:v} of samples){
  const d=v.domains.find(x=>x.id==='gwiin');variants.add(d.head);
  if(d.cause==='absent')assert(!d.poolIds.some(id=>['G1','G4','G6'].includes(id)));
  else assert(!d.poolIds.some(id=>['G3','G5'].includes(id)));
  if(d.primaryPoolId){assert(d.poolIds.includes(d.primaryPoolId));assert.equal(d.paragraphs.length,2);}
 }
 assert(variants.size>=5);
});

test('child-related judgments remain conditional after the result is shortened',()=>{
 const familyCauses=new Set();
 for(const {view:v} of samples){
  const d=v.domains.find(x=>x.id==='family');familyCauses.add(d.cause);
  if(['shown','absent','absentPoor'].includes(d.cause))assert.match(d.closing[0],/^당신은 아이를 낳으면/);
  if(v.verdictEvidence.thread==='care-and-work')assert.match(v.verdict,/아이를 낳/);
 }
 assert(familyCauses.size>=5);assert(familyCauses.has('boundaries'));assert(familyCauses.has('later'));
 const v=api.read({y:2006,m:8,d:17},{h:12,mi:0},true,'seoul',false).view;
 assert(!/아이|출산|교육비/.test(v.verdict));assert.equal(v.domains.find(d=>d.id==='family').cause,'young');
});

test('selection is deterministic and does not mutate the chart or erase period evidence',()=>{
 for(const {result} of samples.slice(0,12)){
  const snapshot=JSON.stringify(result),v=api.v5Reading(result,NOW),again=api.v5Reading(result,NOW);
  assert.equal(JSON.stringify(result),snapshot);
  assert.deepEqual(plain(v.domains),plain(again.domains));assert.equal(v.verdict,again.verdict);
  v.years.forEach((y,i)=>{
   const raw=result.reading.years[i];assert.deepEqual(plain(y.evidence),plain(raw.evidence));
   y.months.forEach((m,j)=>{
    assert.equal(m.start,raw.months[j].start);assert.equal(m.end,raw.months[j].end);
    assert.deepEqual(plain(m.evidence),plain(raw.months[j].evidence));
   });
  });
 }
});
