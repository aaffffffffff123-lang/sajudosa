const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../period-reading.js'),W=require('../western.js'),api=require('./helpers/reading-api.cjs')();
const DAY=86400000,NOW=Date.UTC(2026,10,8),plain=x=>JSON.parse(JSON.stringify(x));
const known=api.read({y:1991,m:3,d:13},{h:2,mi:0}),req=P.request(known.result,known.view,api.sajuYearBoundsV2),snapshot=JSON.stringify(req);
const data=P.compute(req);
test('real ephemeris reaches past, current year, next year, all 24 months and three displayed decades',()=>{
 assert(data.available);assert.equal(JSON.stringify(req),snapshot);assert.equal(req.periods.filter(x=>x.kind==='month').length,24);assert.equal(req.periods.filter(x=>x.kind==='decade').length,3);
 for(const p of req.periods){const xs=data.periods[p.id];assert(xs.length,p.id);for(const x of xs){assert(x.range.start>=p.start&&x.range.end<=p.end);assert(x.text.length>60);for(const e of x.evidence){assert(e.error<=e.orb+1e-4);const target=req.western.planets.find(p=>p.id===e.target);assert(Math.abs(P.distance(P.longitude(e.body,e.peak),target.longitude)-e.angle)<=e.orb+1e-4);}}}
});
test('each decade uses individual contacts from its early, middle and late portions, never a ten-year-long claim',()=>{
 for(const p of req.periods.filter(p=>p.kind==='decade')){const xs=data.periods[p.id];assert.equal(xs.length,3);assert.equal(new Set(xs.map(x=>Math.min(2,Math.floor((x.evidence[0].peak-p.start)/(p.end-p.start)*3)))).size,3);assert(xs.every(x=>x.range.end-x.range.start<p.end-p.start));}
});
test('monthly contacts use fast planets when grounded; actual solar-term boundaries stay unchanged',()=>{
 const months=req.periods.filter(x=>x.kind==='month');assert(months.some(p=>data.periods[p.id].some(x=>['Mercury','Venus','Mars'].includes(x.evidence[0].body))));
 const input=plain(known.view),oldYears=plain(input.years),v=P.apply(input,data);assert.equal(v.years.length,2);v.years.forEach((y,i)=>{assert.equal(y.periodStart,oldYears[i].periodStart);assert.equal(y.periodEnd,oldYears[i].periodEnd);y.months.forEach((m,j)=>{assert.equal(m.start,oldYears[i].months[j].start);assert.equal(m.end,oldYears[i].months[j].end);});});if(v.periodVerdictEvidence)assert(v.periodVerdictEvidence.length);assert.equal(v.verdict,known.view.verdict);
 assert(v.verdict.endsWith(known.view.verdict.match(/[^.!?]+[.!?]+$/)[0].trim()));
});
test('retrograde repeated windows retain individual actual contact evidence and dates',()=>{
 const examples=Object.values(data.periods).flat().filter(x=>x.recurrences.length);assert(examples.length);
 for(const x of examples)for(const e of x.recurrences){assert.equal(e.body,x.evidence[0].body);assert.equal(e.target,x.evidence[0].target);assert.equal(e.angle,x.evidence[0].angle);assert(e.period);assert(Math.abs(e.peak-x.evidence[0].peak)>20*DAY);}
});
test('narrow uncertain aspects and the zero-degree wrap are not skipped between samples',()=>{
 const origin=Date.UTC(2026,0,1),target={id:'Sun',longitude:0,uncertainty:1.15},range={start:origin,end:origin+3*DAY};
 const sampler={at:(_,t)=>((359.8+(t-origin)/DAY*2.2)%360+360)%360};
 const xs=P.scan('Mercury',target,range,sampler).filter(x=>x.angle===0);assert.equal(xs.length,1);assert(xs[0].start<origin&&xs[0].end>origin);assert(xs[0].error<.001);assert(xs[0].orb<.36);
});
test('unknown birth time uses no Moon, houses or ascendant and holds across all sampled birth times',()=>{
 const {result,view}=api.read({y:2002,m:4,d:20},{h:0,mi:0},true,'newyork');const request=P.request(result,view,api.sajuYearBoundsV2);request.periods=request.periods.filter(x=>x.kind==='year');
 const targets=P.natalTargets(result.western),d=P.compute(request);assert(targets.length);assert(targets.every(x=>x.id!=='Moon'&&x.house===null&&x.uncertainty>0));
 for(const x of Object.values(d.periods).flat()){assert.match(x.period,/무렵/);for(const e of x.evidence){assert(e.unknownBirthTime);assert.equal(e.targetHouse,null);for(let t=result.western.dayRange[0];t<=result.western.dayRange[1];t+=30*60000){const diff=Math.abs(P.distance(P.longitude(e.body,e.peak),P.longitude(e.target,t))-e.angle);assert(diff<=1.5+1e-4);}}}
 assert.deepEqual(P.natalTargets({available:false}),[]);assert.equal(P.compute({western:{available:false},periods:[]}).available,false);
});
test('real conflicting output claims pick the adverse system only within the actual overlapping interval',()=>{
 const native={title:'진행되는 해',text:'막혔던 일은 내놓게 됩니다. 설명은 남습니다.',evidence:[{id:'favorable:목:식상',effect:'막혔던 일은 내놓게 됩니다.',valence:'support'}]};
 const bad={id:'test',domain:'work',valence:'adverse',head:'진행이 늦어지는 때',period:'2026년 5월',range:{start:3,end:6},evidence:[{kind:'transit',angle:90}],text:'일정이 늦어집니다.'};
 const part=P.reconcile(native,[bad],0,10);assert.match(part.text,/2026년 5월의 범위 밖에서는/);assert(part.text.includes('설명은 남습니다.'));assert.equal(part.periodDecisions[0].winner,'western');assert.equal(part.originalPeriod.text,native.text);
 const whole=P.reconcile(native,[{...bad,range:{start:0,end:10}}],0,10);assert.equal(whole.text,'설명은 남습니다.');assert.equal(whole.title,bad.head);
 const adverse={title:'지연',text:'이미 만든 것을 중단해 제출이 늦어집니다.',evidence:[{id:'transit:owl_food',effect:'이미 만든 것을 중단해 제출이 늦어집니다.',valence:'adverse'}]};
 const picked=P.reconcile(adverse,[{...bad,valence:'support'}],0,10);assert.equal(picked.starPeriods.length,0);assert.equal(picked.text,adverse.text);assert.equal(picked.periodDecisions[0].winner,'saju');
 assert.equal(P.reconcile(native,[{...bad,domain:'money'}],0,10).text,native.text,'unrelated subject is not a contradiction');
});
test('support-only contacts remain supportive and gain no invented adverse contact',()=>{
 const p={kind:'month',start:0,end:10*DAY},event={body:'Jupiter',target:'Sun',targetHouse:10,angle:120,start:DAY,end:5*DAY,peak:3*DAY,error:0,orb:1.5,uncertainty:0};
 const xs=P.select([event],p);assert.equal(xs[0].valence,'support');assert.match(xs[0].head,/여지/);assert(!xs[0].evidence.some(e=>[90,180].includes(e.angle)));
});
test('a continuing exact contact is not recited as a new event in the next year',()=>{
 const v=P.apply(plain(known.view),data);for(const e of v.years[1].starPeriods.filter(e=>v.years[0].starPeriods.some(x=>x.id===e.id)))assert.match(e.text,/앞의 해에서 짚은/);
});


test('periods read as one narrative with chronological windows and no repeated introductions',()=>{
 const v=P.apply(plain(known.view),data,undefined,NOW);
 const periods=[...v.past,...v.years,...v.years.flatMap(y=>y.months),...v.luck.cycles.map(x=>x.c)];
 for(const p of periods){
  assert(p.narrative);const text=p.narrative.paragraphs.join(' ');
  assert(!/이 10년 중에|같은 조건이 다시 겹치는 때가 있어|그때는 .*때였습니다/.test(text),text);
  const sentences=text.match(/[^.!?]+[.!?]+/g)||[];assert.equal(new Set(sentences.map(x=>x.trim())).size,sentences.length);
  for(const d of p.narrative.dates){assert(d.sourceIds.length);assert(d.evidence.length);assert(d.ranges.every((r,i)=>r.end>r.start&&(!i||r.start>=d.ranges[i-1].end)));}
  const ids=p.narrative.dates.flatMap(x=>x.sourceIds);assert.deepEqual(ids.slice().sort(),p.starPeriods.map(x=>x.id).sort());
 }
 const original=known.view.luck.cycles;
 v.luck.cycles.forEach((x,i)=>assert.equal(x.stage,original[i].stage,'a deduplicated decade must not restore its original text'));
});

test('one dated topic is shown while every contact and recurrence remains in details',()=>{
 const e={id:'one',copyKey:'work:adverse:1',domain:'work',valence:'adverse',label:'일과 평가',range:{start:Date.UTC(2026,0,1),end:Date.UTC(2026,1,1)},text:P.COPY.work.bad[1],evidence:[{kind:'transit'}],recurrences:[{start:Date.UTC(2026,5,1),end:Date.UTC(2026,6,1)}]};
 const seen=new Map(),opts={kind:'year',start:Date.UTC(2026,0,1),end:Date.UTC(2027,0,1),seen};
 const first=P.narrative({text:'맡은 일을 마칩니다.',starPeriods:[e]},opts);
 const second=P.narrative({text:'새 조건을 맞춥니다.',starPeriods:[e,{...e,id:'two'}]},opts);
 assert.match(first.paragraphs[0],/^맡은 일을 마칩니다. 2026년 1월/);
 assert.equal(second.paragraphs[0],'새 조건을 맞춥니다.');
 assert.equal(second.dates.length,1);assert.equal(second.dates[0].ranges.length,2);assert.equal(second.dates[0].sourceIds.length,2);
 assert.equal(second.dates[0].text,P.COPY.work.bad[1]);
});

test('a period without native copy distinguishes actual overlap, continuation and later recurrence',()=>{
 const day=d=>Date.UTC(2026,0,d),seen=new Map();
 const e={id:'contact',copyKey:'work:adverse:1',domain:'work',valence:'adverse',label:'일과 평가',range:{start:day(1),end:day(20)},text:P.COPY.work.bad[1],evidence:[{kind:'transit'}],recurrences:[]};
 const n=(event,kind='year')=>P.narrative({starPeriods:[event]},{kind,start:day(1),end:day(100),seen}).paragraphs.join(' ');
 assert(n(e).includes(P.COPY.work.bad[1].split('. ')[0]));
 assert.match(n({...e,range:{start:day(3),end:day(6)}},'month'),/겹치는/);
 assert.match(n({...e,continued:true,range:{start:day(20),end:day(30)}}),/이어지는/);
 const later=n({...e,id:'later',range:{start:day(50),end:day(60)}});
 assert.match(later,/2026년 2월.*다시 나타나는/);assert(!/더 커|쌓|악화|앞서 짚은/.test(later));
});

test('new topics are limited to one per period without erasing other meanings, polarity or dates',()=>{
 const start=Date.UTC(2026,0,1),end=Date.UTC(2027,0,1),seen=new Map();
 const event=(domain,valence='adverse')=>({id:domain+valence,copyKey:domain+':'+valence+':0',domain,valence,label:P.COPY[domain].label,range:{start,end},text:P.COPY[domain][valence==='adverse'?'bad':'good'][0],evidence:[{kind:'transit',domain}],recurrences:[]});
 const old=[event('office'),event('money')],opts={kind:'year',start,end,seen};
 P.narrative({starPeriods:old},opts);
 const current=P.narrative({text:'이 해의 조건을 맞춥니다.',starPeriods:[...old,event('body'),event('money','support')]},opts),text=current.paragraphs.join(' ');
 assert(!text.includes('앞서 짚은'));assert.equal(current.focusIds.length,1);
 assert.equal(current.dates.length,4);assert.equal(current.dates.flatMap(d=>d.evidence).length,4);
 assert(current.dates.some(d=>d.text===P.COPY.money.good[0]));
 assert(current.dates.some(d=>d.text===P.COPY.money.bad[0]));
 assert((text.match(/\./g)||[]).length<=2);
});

test('hidden months cannot consume a new explanation intended for the following year',()=>{
 const year=known.view.years[0],next=known.view.years[1],hidden=year.months.find(m=>m.end<NOW),start=next.periodStart,end=next.periodEnd;
 assert(hidden);
 const event={id:'new-family-topic',copyKey:'family:adverse:0',domain:'family',valence:'adverse',label:P.COPY.family.label,range:{start:hidden.start,end},text:P.COPY.family.bad[0],evidence:[{kind:'transit'}],recurrences:[]};
 const artificial={available:true,periods:{['month:'+hidden.start]:[event],['year:'+next.year]:[event]},ranges:data.ranges};
 const result=P.apply(plain(known.view),artificial,undefined,NOW);
 assert(result.years[1].narrative.paragraphs.join(' ').includes(P.COPY.family.bad[0].split('. ')[0]));
 assert.equal(result.years[1].narrative.dates[0].ranges[0].start,start);
});
