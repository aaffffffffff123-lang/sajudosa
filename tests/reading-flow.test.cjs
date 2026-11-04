const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
const api=vm.runInNewContext(slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('const READING_FLOW=','/* 다음 나쁜 달까지')+slice('function luckGraph(', '/* ---------- 입력 받기 ---------- */')+';({computeChart,makeReading,modernizeReadingDisplay,flowNature,flowDomains,flowAssignment,flowCycles,luckGraph,READING_FLOW})',{Intl,Date});
const place={name:'서울',lon:126.978,tz:'KR',std:9};
function read(y,m,d,unknown=false,male=true){
 const input={name:'',cal:'solar',date:{y,m,d},time:{h:12,mi:0},unknown,male,place,placeKey:'seoul'};
 return api.modernizeReadingDisplay(api.makeReading(api.computeChart({y,m,d,h:12,mi:0,unknown,male,place}),input,Date.UTC(2026,10,4)));
}
test('the reading reaches personal observations and changing fortunes before the final assignment',()=>{
 const view=slice('<main id="result-screen"','</main>');
 const order=['id="pillars"','id="core-body"','id="sections"','id="years"','id="luck-graph"','id="judge"','id="verdict"','id="last-line"','id="fight-fate"'];
 order.forEach((id,i)=>{assert(view.includes(id),id);if(i)assert(view.indexOf(order[i-1])<view.indexOf(id),id);});
 assert(!/좋아지는 해|지금이 꼭대기|100명이/.test(view));
});
test('early observations do not inherit the narrator’s late verdict or socioeconomic inventions',()=>{
 for(const d of [[1970,9,15],[1971,10,15],[1972,3,15],[1980,4,15],[1990,1,1],[2001,6,21]])for(const unknown of [true,false])for(const male of [true,false]){
  const r=read(...d,unknown,male),n=api.flowNature(r),domains=api.flowDomains(r);
  assert(n.body.length);assert.equal(domains.length,4);
  assert(!/허락|거절|윗자리|아랫자리|하위|그릇|평생|사정으로/.test(JSON.stringify(n)));
  assert(!/물려받을 것 없이|서른에 가진|직원이 다섯|나라에 내고|집값이 먼저|경력이 끊기|기록할 여유/.test(JSON.stringify(domains)));
  for(const s of domains){assert(s.head);assert(s.body.length);assert(s.pressure);assert(!/undefined|NaN/.test(JSON.stringify(s)));}
  assert(api.flowAssignment(r).role);assert(api.flowAssignment(r).reason);
  assert.equal(api.flowCycles(r).cycles.length,Math.min(3,r.luck.cycles.length-Math.max(0,r.luck.current)));
 }
});
test('favorable charts retain visible strengths before expectations become demands',()=>{
 const r=read(1971,10,15),w=api.flowDomains(r)[0];
 assert.equal(r.fate.support.group,'backing');assert.match(w.body.join(' '),/책임과 배움이 서로 이어져/);assert.match(w.pressure,/다음 기대/);
 assert.match(api.flowAssignment(r).reason,/더 맡는 것이 순리/);
 const income=api.flowDomains(read(1970,11,15))[1];assert.match(income.head,/수입으로 이어질 조건/);assert.match(income.pressure,/앞으로도 그만큼/);
});
test('missing visible wealth does not hide wealth in secondary hidden stems',()=>{
 const r=read(1980,4,15),m=api.flowDomains(r)[1];
 assert(r.fate.wealth.present);assert.match(m.note.value,/아래 글자 안에 숨어/);
 assert(!/돈을 앞세워 풀리는 구조로 보기는 어렵|물려받을 것 없이/.test(JSON.stringify(m)));
});
test('adult work and household history is never assigned to childhood',()=>{
 for(const year of [1970,1990,2001,2015])for(const male of [true,false]){
  const r=read(year,1,1,true,male);
  assert(r.pastHits.every(x=>x.year>=year+19&&x.year<2026));
  if(year+19>=2026)assert.equal(r.pastHits.length,0);
 }
});
test('the graph follows changing scores, including a better future, instead of forcing a decline',()=>{
 const cycles=[{i:0,age:20,startYear:2020,score:30},{i:1,age:30,startYear:2030,score:80},{i:2,age:40,startYear:2040,score:10}];
 const svg=api.luckGraph({current:0},cycles,1),ys=Array.from(svg.matchAll(/<circle cx="[^"]+" cy="([^"]+)"/g),m=>+m[1]);
 assert.equal(ys.length,3);assert(ys[1]>ys[0]);assert(ys[2]<ys[0]);assert(!svg.includes('지금이 꼭대기'));
});
