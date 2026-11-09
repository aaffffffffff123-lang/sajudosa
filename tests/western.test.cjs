const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ReadingPool=require('../reading-pool.js');
const W=require('../western.js'),A=require('../assets/astronomy.browser.min.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const slice=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i,a);return html.slice(i,j);};
const source=slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('/* ---------- 자리 문서(V5)','/* 현재 월운:')+slice('function buildResult(inp,sd){','function resetAll(){');
const NOW=Date.UTC(2026,10,6);
function api(extra={}){return vm.runInNewContext(source+';({buildResult,v5Reading,lunarToSolar,solarToLunar,PLACES,wallToUtc,tenGod})',{Date,Intl,Western:W,ReadingPool,console,...extra});}
const core=api();
const places=Object.fromEntries(core.PLACES.flatMap(g=>g[1].map(p=>[p[0],{name:p[1],lon:p[2],lat:W.LATITUDES[p[0]],tz:p[3]||'KR',std:p[4]==null?9:p[4]}])));
function read(y,m,d,{h=12,mi=0,unknown=false,pk='seoul',occurrence=0,male=true}={}){
  const date={y,m,d},inp={name:'',cal:'solar',date,time:{h,mi},unknown,placeKey:pk,place:places[pk],occurrence,male};
  const result=core.buildResult(inp,date);
  return {result,view:core.v5Reading(result,NOW)};
}
const money=v=>v.domains.find(d=>d.id==='money');
const near=(a,b,tolerance=.02)=>assert(Math.abs(a-b)<tolerance,`${a} vs ${b}`);

test('tropical longitudes at J2000 and angular wrap use real ephemerides',()=>{
  const c=W.compute({utc:Date.UTC(2000,0,1,12),lat:51.5074,lon:-.128});
  near(W.planet(c,'Sun').longitude,280.37,.02);near(W.planet(c,'Moon').longitude,223.32,.05);
  assert.equal(W.planet(c,'Sun').sign,9);assert.equal(W.planet(c,'Moon').sign,7);
  const aspects=W.findAspects([{id:'Sun',longitude:359},{id:'Moon',longitude:1},{id:'Mars',longitude:89},{id:'Saturn',longitude:179}]);
  assert(aspects.some(x=>x.a==='Sun'&&x.b==='Moon'&&x.angle===0&&x.orb===2));
  assert(aspects.some(x=>x.a==='Sun'&&x.b==='Mars'&&x.angle===90));
  assert(aspects.some(x=>x.a==='Sun'&&x.b==='Saturn'&&x.angle===180));
});

test('the ascendant is on the eastern horizon and is rising in both hemispheres',()=>{
  for(const [lat,lon] of [[35.1595,126.852],[51.5074,-.128],[-33.8688,151.209],[40.7128,-74.006]])for(const hour of [0,6,12,18]){
    const t=Date.UTC(2000,0,1,hour),asc=W.ascendant(t,lat,lon),time=A.MakeTime(new Date(t));
    const vec=A.RotateVector(A.Rotation_ECT_EQJ(time),new A.Vector(Math.cos(asc.longitude*Math.PI/180),Math.sin(asc.longitude*Math.PI/180),0,time));
    const eq=A.EquatorFromVector(vec),obs=new A.Observer(lat,lon,0);
    // Convert the fixed point back independently through equatorial-of-date before testing the horizon.
    const fixed=A.VectorFromSphere(new A.Spherical(eq.dec,eq.ra*15,1),time);
    function alt(dt){const date=A.MakeTime(new Date(t+dt)),v=A.RotateVector(A.Rotation_EQJ_EQD(date),fixed),s=A.EquatorFromVector(v);return A.Horizon(date,obs,s.ra,s.dec,null);}
    const at=alt(0);near(at.altitude,0,.0001);assert(at.azimuth>0&&at.azimuth<180);assert(alt(60000).altitude>0);
  }
});

test('all offered cities have coordinates and missing coordinates never create houses',()=>{
  for(const [key,p] of Object.entries(places)){assert(Number.isFinite(p.lat),key);assert(Math.abs(p.lat)<66,key);}
  const c=W.compute({utc:NOW,lon:127});assert.equal(c.asc,null);assert(c.planets.every(p=>p.house===null));
  assert.equal(W.ascendant(NOW,89,0),null);
});

test('unknown time exposes day-wide sign candidates and omits invented angles and degrees',()=>{
  const c=W.compute({utc:Date.UTC(2024,2,20,12),unknown:true,dayRange:[Date.UTC(2024,2,20),Date.UTC(2024,2,21)-1]});
  assert.equal(c.asc,null);assert.equal(c.utc,null);assert.equal(c.aspects.length,0);
  assert.equal(W.planet(c,'Sun').sign,null);assert.deepEqual(W.planet(c,'Sun').candidates,[0,11]);
  assert(c.planets.every(p=>p.house===null&&p.longitude===null));
  const output=W.render(c);assert.match(output,/양자리 \/ 물고기자리/);assert.match(output,/생시를 알아야 계산/);assert.doesNotMatch(output,/태양 · (양자리|물고기자리)<\/b>|상승궁 ·/);
});

test('same instant in different cities keeps planets fixed but changes houses',()=>{
  const london=read(2000,1,1,{h:12,pk:'london'}).result,seoul=read(2000,1,1,{h:21}).result;
  assert.equal(london.chart.t,seoul.chart.t);
  london.western.planets.forEach((p,i)=>near(p.longitude,seoul.western.planets[i].longitude,1e-9));
  assert.notEqual(london.western.asc.sign,seoul.western.asc.sign);
  assert.notEqual(london.chart.correction,seoul.chart.correction);
  assert.equal(london.western.utc,london.chart.t,'do not apply the saju solar-time correction a second time');
});

test('solar and lunar inputs resolve to the same real instant and natal reading',()=>{
  const {result}=read(2000,2,5,{h:9,mi:30});
  const lunar=core.solarToLunar(2000,2,5),solar=core.lunarToSolar(lunar.y,lunar.m,lunar.leap,lunar.d);
  const other=core.buildResult({...result.input,cal:'lunar',date:lunar},solar);
  assert.equal(other.chart.t,result.chart.t);assert.deepEqual(other.western,result.western);
});

test('repeated DST hours remain distinct, nonexistent hours fail, unknown days keep real length',()=>{
  const early=read(2024,11,3,{h:1,mi:30,pk:'newyork',occurrence:0}).result;
  const late=read(2024,11,3,{h:1,mi:30,pk:'newyork',occurrence:1}).result;
  assert.equal(late.western.utc-early.western.utc,3600000);
  assert(Math.abs(late.western.asc.longitude-early.western.asc.longitude)>5);
  assert.throws(()=>read(2024,3,10,{h:2,mi:30,pk:'newyork'}),/없던 시각/);
  for(const [m,d,hours] of [[3,10,23],[11,3,25]]){
    const {dayRange}=read(2024,m,d,{unknown:true,pk:'newyork'}).result.western;
    assert.equal(dayRange[1]-dayRange[0]+1,hours*3600000);
  }
  const korea=read(1988,5,8,{unknown:true}).result.western;
  assert.equal(korea.dayRange[1]-korea.dayRange[0]+1,23*3600000);
});

test('a fixed input produces fixed prose and keeps each money cause on its own opening',()=>{
  const kinds=new Set(),{COPY,LEAD}=ReadingPool;
  for(let m=1;m<=12;m++){
    const first=read(1980,m,15),again=read(1980,m,15),a=money(first.view),b=money(again.view);
    assert.deepEqual(first.result.western,again.result.western);assert.deepEqual(a,b);kinds.add(a.cause);
    const opening=a.cause==='comfort'?[COPY.living,COPY.spending]:LEAD[a.cause];
    assert.deepEqual(a.paragraphs.slice(0,2),opening,a.cause);
    assert(!a.paragraphs.includes(COPY.stability));assert(a.paragraphs.length<=3);assert.deepEqual(a.closing,a.fates);
    if(a.cause!=='comfort')assert(!a.paragraphs.includes(COPY.spending)&&!a.paragraphs.includes(COPY.living));
    assert.doesNotMatch(JSON.stringify(a.paragraphs),/하우스|별자리|목성|토성|화성|금성|수성|정인이/);
  }
  assert(kinds.size>=4);
});

test('missing astronomy asset leaves the original saju reading usable and tells the reader',()=>{
  const fallback=api({Western:undefined});
  const {result}=read(2000,1,1);const noStars=fallback.buildResult(result.input,result.solarDate);
  assert(noStars.reading.pillars.length===4);assert.equal(noStars.western,undefined);
  assert.equal(fallback.v5Reading(noStars,NOW).domains.length,7);
  assert.match(W.render({available:false,reason:'행성 계산 자료를 불러오지 못했습니다.'}),/불러오지 못했습니다/);
});

test('rendering keeps paragraph order, closes on the fate lines, and leaves no badge or expansion',()=>{
  class Node{constructor(tag){this.tag=tag;this.children=[];this.innerHTML='';this.textContent='';this.hidden=false;}append(...items){this.children.push(...items)}replaceChildren(...items){this.children=items}setAttribute(){} }
  const nodes={};
  const dollar=id=>nodes[id]||(nodes[id]=new Node('div'));
  const scope={Date,Intl,Western:W,ReadingPool,console,document:{getElementById:dollar,createElement:tag=>new Node(tag)},renderCurrentMonth(){}};
  const renderSource=source+slice('function icon(','/* ---------- 태어난 곳 ---------- */')+slice('function hourWord(','function syncTimeField(')+slice('function glyphHtml(','function monthWindowsHtml(')+slice('/* 사주 원국 접힌 표','function renderResult(R){')+slice('function renderResult(R){','function cycleAgeLabel(')+slice('function cycleAgeLabel(','/* ---------- 입력 받기 ---------- */');
  const render=vm.runInNewContext(renderSource+';({renderResult,buildResult,v5Reading})',scope);
  const {result}=read(2001,6,21,{unknown:true});
  render.renderResult(result);
  const full=core.v5Reading(result,NOW);
  for(const d of full.domains){
    const card=nodes.sections.children.find(n=>n.id==='sec-'+d.id);assert(card,d.id);
    let previous=-1;
    for(const line of [...d.paragraphs,...d.closing]){const offset=card.innerHTML.indexOf(line);assert(offset>previous,d.id+': '+line);previous=offset;}
    assert(!card.innerHTML.includes('<b>이치</b>')&&!card.innerHTML.includes('<b>근거</b>'),d.id);
    if(d.id==='money')assert(card.innerHTML.indexOf('note')>card.innerHTML.indexOf(d.closing.at(-1)));
  }
  for(const id of ['year-rule','cycle-ruling','fixed-note'])assert(!nodes[id]);
  assert.match(nodes['western-chart'].innerHTML,/태어난 시간을 몰라/);
  assert.match(nodes['saju-details'].innerHTML,/사주 원국 자세히 보기/);
  assert.doesNotMatch(JSON.stringify(nodes),/expansion/);
});

test('browser assets load in order and inline JavaScript remains valid',()=>{
  assert(html.indexOf('src="assets/astronomy.browser.min.js')<html.indexOf('src="western.js'));
  assert(html.indexOf('src="reading-pool.js')<html.indexOf('src="western.js'));
  assert(html.indexOf('src="western.js')<html.indexOf("'use strict';"));
  assert(!html.includes('reading-prose.js'));
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
  const context=vm.createContext({console});vm.runInContext(fs.readFileSync(path.join(__dirname,'../reading-pool.js'),'utf8'),context);assert.equal(typeof context.ReadingPool.weave,'function');
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/astronomy.browser.min.js'),'utf8'),context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../western.js'),'utf8'),context);
  assert.equal(typeof context.Western.compute,'function');assert(context.Western.compute({utc:NOW}).available);
});

test('the birth summary shows drawn sign cards like the pillars and one line for the sun and moon',()=>{
  const c=W.compute({utc:NOW,lat:37.5665,lon:126.978}),summary=W.render(c);
  const sun=W.planet(c,'Sun'),moon=W.planet(c,'Moon');
  assert.match(summary,/class="star-cards"/);assert.equal((summary.match(/class="pillar star-card/g)||[]).length,3);
  for(const i of [sun.sign,moon.sign,c.asc.sign])assert(summary.includes('href="#'+W.SIGN_ICONS[i]+'"'));
  assert(summary.includes('<b>태양 · '+W.SIGNS[sun.sign]+'</b>'+W.SUN[sun.sign].split('.')[0]+'.</li>'));
  assert(summary.includes('<b>달 · '+W.SIGNS[moon.sign]+'</b>'+W.MOON[moon.sign].split('.')[0]+'.</li>'));
  assert.match(summary,/<details class="chart-details natal-details">/);
  assert.equal(W.SIGN_ICONS.length,12);for(const id of W.SIGN_ICONS)assert(html.includes('<symbol id="'+id+'" viewBox="0 0 64 64">'),id);
  const screen=slice('<main id="result-screen"','</main>');
  assert(screen.indexOf('id="pillars"')<screen.indexOf('id="saju-details"'));
  assert(screen.indexOf('id="saju-details"')<screen.indexOf('id="western-chart"'));
  assert(screen.indexOf('id="western-chart"')<screen.indexOf('id="reading-portrait"'));
  assert(!screen.includes('id="western-reading"'));
});

test('the wheel plots real longitudes relative to the ascendant and keeps crowded labels apart',()=>{
  for(const clustered of [false,true]){
    const c=W.compute({utc:NOW,lat:37.5665,lon:126.978});
    if(clustered)c.planets.forEach((p,i)=>p.longitude=(359+i*.2)%360);
    const output=W.render(c,'summary'),labels=[];
    for(const p of c.planets){
      const group=output.match(new RegExp('<g data-planet="'+p.id+'">([\\s\\S]*?)</text></g>'));
      assert(group,p.id);
      const dot=group[1].match(/<circle[^>]+cx="([^"]+)" cy="([^"]+)"/);
      const angle=(180+c.asc.longitude-p.longitude)*Math.PI/180;
      near(+dot[1],180+104*Math.cos(angle),.006);near(+dot[2],180+104*Math.sin(angle),.006);
      const label=group[1].match(/<text[^>]+x="([^"]+)" y="([^"]+)"/);
      labels.push([+label[1],+label[2]]);
    }
    for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)assert(Math.hypot(labels[i][0]-labels[j][0],labels[i][1]-labels[j][1])>28.9);
  }
  const unknown=W.compute({utc:NOW,unknown:true,dayRange:[NOW,NOW+86400000-1]});
  assert.doesNotMatch(W.render(unknown,'summary'),/natal-wheel|data-planet/);
});
