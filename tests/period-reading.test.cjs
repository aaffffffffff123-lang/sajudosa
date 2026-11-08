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
 const input=plain(known.view),oldYears=plain(input.years),v=P.apply(input,data);assert.equal(v.years.length,2);v.years.forEach((y,i)=>{assert.equal(y.periodStart,oldYears[i].periodStart);assert.equal(y.periodEnd,oldYears[i].periodEnd);y.months.forEach((m,j)=>{assert.equal(m.start,oldYears[i].months[j].start);assert.equal(m.end,oldYears[i].months[j].end);});});assert(v.periodVerdictEvidence.length);
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
