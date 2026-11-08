/* 출생차트와 실제 행성 이동 비교. 사주의 절기 구간은 바꾸지 않는다. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory(require('./assets/astronomy.browser.min.js'));
 else root.PeriodReading=factory(root.Astronomy);
})(typeof globalThis!=='undefined'?globalThis:this,function(A){
 'use strict';
 const DAY=86400000,ANGLES=[0,60,90,120,180],SLOW=['Jupiter','Saturn','Uranus','Neptune','Pluto'],FAST=['Mercury','Venus','Mars'];
 const norm=x=>(x%360+360)%360,signed=x=>norm(x+180)-180;
 const distance=(x,y)=>Math.abs(signed(x-y));
 const longitude=(id,t)=>norm(A.Ecliptic(A.GeoVector(id,new Date(t),true)).elon);
 const spanLabel=(start,end)=>{const f=t=>{const d=new Date(t+9*3600000);return d.getUTCFullYear()+'년 '+(d.getUTCMonth()+1)+'월 '+d.getUTCDate()+'일';};return f(start)+' ~ '+f(end-1);};
 function natalTargets(w){
  if(!w||!w.available)return [];
  const ids=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'];
  if(!w.unknown)return (w.planets||[]).filter(p=>ids.includes(p.id)&&Number.isFinite(p.longitude)).map(p=>({...p,uncertainty:0}));
  // 하루 전체의 위치를 계산하여 좁은 각도 조건이 하루 내내 유지되는 대상만 남긴다.
  if(!w.dayRange||w.dayRange.length!==2)return [];
  return ids.filter(id=>id!=='Moon').map(id=>{
   const values=[];for(let t=w.dayRange[0];t<w.dayRange[1];t+=3*3600000)values.push(longitude(id,t));values.push(longitude(id,w.dayRange[1]));
   const center=longitude(id,(w.dayRange[0]+w.dayRange[1])/2),uncertainty=Math.max(...values.map(v=>distance(v,center)))+.03;
   return {id,longitude:center,uncertainty,house:null};
  }).filter(x=>x.uncertainty<1.2);
 }
 function mergeRanges(ranges){
  const out=[];for(const r of ranges.slice().sort((a,b)=>a.start-b.start)){
   if(!Number.isFinite(r.start)||!Number.isFinite(r.end)||r.end<=r.start)continue;
   const last=out[out.length-1];if(last&&r.start<=last.end)last.end=Math.max(last.end,r.end);else out.push({start:r.start,end:r.end});
  }return out;
 }
 function makeSampler(){const cache=new Map();return {at:(id,t)=>{const key=id+':'+t;if(!cache.has(key))cache.set(key,longitude(id,t));return cache.get(key);},size:()=>cache.size};}
 function boundary(fn,a,b,insideA){for(let i=0;i<22&&b-a>60000;i++){const m=(a+b)/2;if((fn(m)<=0)===insideA)a=m;else b=m;}return (a+b)/2;}
 function scan(body,target,range,sampler){
  const orb=1.5-target.uncertainty;if(orb<=.25)return [];
  const speed={Mercury:2.3,Venus:1.4,Mars:.85,Jupiter:.25,Saturn:.13,Uranus:.07,Neptune:.04,Pluto:.05}[body];
  const step=Math.min(FAST.includes(body)?1:body==='Jupiter'?3:7,orb/speed)*DAY,events=[];
  const start=range.start-40*DAY,end=range.end+40*DAY;
  for(const angle of ANGLES){
   const separation=t=>distance(sampler.at(body,t),target.longitude),fn=t=>Math.abs(separation(t)-angle)-orb;
   let prev=start,pv=fn(prev),active=pv<=0?{start,clippedStart:true,points:[{t:start,error:pv+orb}]}:null;
   for(let t=Math.min(start+step,end);prev<end;t=Math.min(t+step,end)){
    const v=fn(t),inside=v<=0;
    if(!active&&inside){active={start:boundary(fn,prev,t,false),clippedStart:false,points:[]};}
    if(active){active.points.push({t,error:v+orb});
     if(!inside){active.end=boundary(fn,prev,t,true);events.push(active);active=null;}
    }
    prev=t;pv=v;
   }
   if(active){active.end=end;active.clippedEnd=true;events.push(active);}
   for(const e of events.filter(e=>!e.body)){
    const points=e.points.filter(x=>x.t>=e.start&&x.t<=e.end);
    if(!points.length)points.push({t:(e.start+e.end)/2,error:Math.abs(separation((e.start+e.end)/2)-angle)});
    const best=points.reduce((a,b)=>a.error<b.error?a:b);let lo=Math.max(e.start,best.t-step),hi=Math.min(e.end,best.t+step);
    for(let i=0;i<22&&hi-lo>60000;i++){const l=lo+(hi-lo)/3,r=hi-(hi-lo)/3;if(Math.abs(separation(l)-angle)<Math.abs(separation(r)-angle))hi=r;else lo=l;}
    const peak=(lo+hi)/2;
    Object.assign(e,{body,target:target.id,targetHouse:target.house||null,angle,orb,error:Math.abs(separation(peak)-angle),peak,uncertainty:target.uncertainty});delete e.points;
   }
  }
  return events.filter(e=>e.end>range.start&&e.start<range.end);
 }
 function theme(e){
  const h=e.targetHouse;
  if([2,8].includes(h))return 'money';if(h===4)return 'family';if([5,7].includes(h))return 'home';
  if([1,6,12].includes(h)&&['Sun','Moon','Mars'].includes(e.target))return 'body';
  if(h===10)return 'office';if(h===11&&e.target==='Jupiter')return 'gwiin';
  return {Sun:'work',Moon:'body',Mercury:'work',Venus:'home',Mars:'work',Jupiter:'money',Saturn:'office'}[e.target]||'work';
 }
 const COPY={
  work:{label:'일과 평가',bad:['정해진 일을 내놓는 때가 확인과 수정 때문에 늦어집니다. 끝내기로 한 날짜를 넘긴 사정도 그 일을 맡은 사람이 설명합니다.','일을 내놓기 전에 다시 확인할 몫이 생겨 진행이 더뎌집니다. 기다리고 다시 설명한 시간도 다음 마감에서 빠지지 않습니다.'],good:['막혔던 일을 정리하거나 제안한 것을 받아들일 여지가 생깁니다. 통과한 방식은 다음에도 해낼 수 있다는 기준으로 남습니다.','그동안 익힌 것을 써서 일을 풀기가 수월해집니다. 해결한 뒤에는 그 방법을 다른 일에도 적용해 달라는 요구가 붙습니다.'],head:'끝낸 일을 다시 설명할 몫이 커지는 때',end:'일을 해낸 뒤에도 그 일을 인정받는 데 쓸 시간을 따로 내게 됩니다.'},
  money:{label:'돈과 생활비',bad:['들어올 돈을 기다리는 일정과 먼저 치를 비용이 어긋나기 쉽습니다. 지출을 늦추려면 생활에서 무엇을 미룰지 먼저 정해야 합니다.','이미 정해 둔 지출을 다시 계산할 일이 생깁니다. 줄일 수 있는 항목을 찾는 동안에도 약속한 날의 비용은 먼저 돌아옵니다.'],good:['돈을 마련하거나 비용을 정리할 여지가 넓어집니다. 마련한 몫은 그동안 미뤘던 생활의 항목부터 채우게 됩니다.','생활의 셈을 조정할 여유가 생깁니다. 그 여유를 계속 누리려면 넓힌 생활에 맞는 수입도 이어 가야 합니다.'],head:'쓸 돈의 순서를 다시 정해야 하는 때',end:'이번에 넘긴 비용 뒤에도 다음에 치를 생활의 몫은 남습니다.'},
  body:{label:'몸과 생활 리듬',bad:['계획한 일과 회복할 시간을 함께 맞추기 어려워집니다. 한쪽 일정을 지키려고 줄인 잠과 휴식은 다른 날의 여유에서 다시 마련해야 합니다.','하루의 순서가 흐트러지면 식사와 쉬는 시간이 먼저 밀립니다. 끝낸 일의 수만큼 몸을 돌본 시간을 인정해 주는 사람은 없습니다.'],good:['흐트러진 생활의 순서를 다시 잡을 여지가 생깁니다. 일정이 돌아간다는 이유로 새 일을 더 넣으면 마련한 회복 시간도 다시 줄어듭니다.','몸과 생활을 돌볼 간격을 확보하기가 수월해집니다. 그 간격이 생긴 뒤에도 다른 사람의 일정은 그대로 돌아갑니다.'],head:'일정과 회복의 몫을 다시 나눌 때',end:'일정을 맞춘 뒤에도 쉬는 시간을 되찾는 일은 자기 몫으로 남습니다.'},
  home:{label:'짝과 관계',bad:['서로 기대한 것과 실제로 내줄 수 있는 시간의 차이가 드러납니다. 마음을 설명한 뒤에도 누가 무엇을 얼마나 맞출지는 다시 정해야 합니다.','가까운 사람과 이미 정한 약속을 다시 확인할 일이 생깁니다. 말을 꺼내지 않고 넘긴 사정은 다음 약속에서도 같은 조건으로 남습니다.'],good:['관계의 말을 꺼내거나 서로의 조건을 맞출 여지가 생깁니다. 가까워진 만큼 함께 정할 생활의 몫도 구체적으로 늘어납니다.','멀어졌던 대화를 다시 잇기가 수월해집니다. 마음이 풀린 뒤에도 두 사람이 쓸 시간과 비용은 따로 마련해야 합니다.'],head:'관계의 기대와 생활 조건을 다시 맞출 때',end:'마음을 확인하는 일과 함께 살 조건을 마련하는 일은 따로 남습니다.'},
  family:{label:'집안과 부양',bad:['집안의 기대와 내가 내줄 수 있는 몫 사이를 다시 조정하게 됩니다. 가족의 사정을 넘기는 데 쓴 돈과 시간은 내 준비에서 먼저 빠집니다.','가족 안에서 당연하게 맡아 온 일을 다시 나눌 필요가 커집니다. 지금까지 해 왔다는 이유는 앞으로도 당신 몫이라는 말로 돌아옵니다.'],good:['집안에서 도움을 얻거나 생활의 몫을 조정할 여지가 생깁니다. 받은 도움은 나중에 가족의 부탁을 판단할 때 함께 떠오릅니다.','가족과 역할을 정리할 여유가 생깁니다. 한번 맡기로 한 몫은 사정이 달라진 뒤에도 원래 하던 일로 남기 쉽습니다.'],head:'집안의 기대와 내 몫을 다시 셀 때',end:'가족의 급한 몫을 치르는 동안에도 자신의 다음 준비는 기다리고 있습니다.'},
  office:{label:'권한과 책임',bad:['내가 결정할 수 있는 범위보다 설명해야 할 책임이 커집니다. 허락을 기다린 시간까지 결과를 내놓는 날에는 당신 일정에 들어갑니다.','기준과 평가를 다시 확인해야 할 일이 늘어납니다. 조건을 정한 사람과 그 조건에 맞춰 결과를 내야 하는 사람의 몫은 다르게 셉니다.'],good:['판단을 맡거나 신임을 얻을 여지가 생깁니다. 권한을 받은 뒤에는 같은 기준을 다른 사람에게도 적용해야 믿고 맡긴 뜻에 맞습니다.','정해진 절차 안에서 자기 판단을 인정받기가 수월해집니다. 그 인정을 지킬 몫도 다음 판단부터 함께 붙습니다.'],head:'결정할 범위보다 책임이 먼저 늘어나는 때',end:'조건을 정할 때의 권한보다 결과를 설명할 때의 책임이 오래 남습니다.'},
  gwiin:{label:'도움과 인연',bad:['도움을 구할 때 먼저 갖춰야 할 조건이 늘어납니다. 부탁을 받아 줄 사람을 찾는 동안에도 해야 할 일의 기한은 그대로 갑니다.','받은 도움과 별개로 내 힘을 다시 보여 줘야 할 일이 생깁니다. 소개해 준 사람의 이름이 끝까지 일을 대신해 주지는 않습니다.'],good:['사람을 통해 길을 얻거나 필요한 도움을 받을 여지가 생깁니다. 도움을 받는 동안에는 도와준 사람의 기대도 함께 살피게 됩니다.','혼자 찾기 어려웠던 기회를 소개받을 여지가 넓어집니다. 소개한 사람의 체면을 지킬 일도 그 기회의 조건으로 남습니다.'],head:'도움을 받을 조건부터 갖춰야 하는 때',end:'도움으로 줄어든 일 뒤에도 그 도움에 답할 몫은 남습니다.'}
 };
 function valence(e){return [90,180].includes(e.angle)||e.angle===0&&['Saturn','Mars','Uranus','Neptune','Pluto'].includes(e.body)?'adverse':'support';}
 const ACTOR={
  Saturn:{adverse:'책임과 제한이 맞물리는 동안에는',support:'기준과 순서를 갖추기 수월한 동안에는'},
  Jupiter:{adverse:'넓히려는 일과 감당할 몫이 어긋나는 동안에는',support:'선택할 기회가 넓어지는 동안에는'},
  Uranus:{adverse:'익숙한 순서에 변화가 끼어드는 동안에는',support:'다른 방식을 시도할 여지가 생기는 동안에는'},
  Neptune:{adverse:'기대와 실제 조건의 경계가 흐려지는 동안에는',support:'다른 사람의 사정을 받아들이기 수월한 동안에는'},
  Pluto:{adverse:'이미 정한 몫과 결정권을 다시 따지는 동안에는',support:'오래 유지한 방식을 재정리할 여지가 생기는 동안에는'},
  Mars:{adverse:'당장 움직여야 할 일과 맞춰야 할 조건이 겹치는 동안에는',support:'미뤄 둔 일을 실행하기 수월한 동안에는'},
  Mercury:{adverse:'말과 일정의 확인이 거듭되는 동안에는',support:'말과 자료를 정리하기 수월한 동안에는'},
  Venus:{adverse:'마음이 가는 것과 내줄 몫이 어긋나는 동안에는',support:'관계와 생활의 조건을 조정할 여지가 생기는 동안에는'}
 };
 function evidence(e){return {kind:'transit',body:e.body,target:e.target,angle:e.angle,orb:e.orb,error:e.error,start:e.start,end:e.end,peak:e.peak,unknownBirthTime:e.uncertainty>0,targetHouse:e.targetHouse};}
 // '좋다/나쁘다'만으로 충돌시키지 않는다. 실제 문장의 대상과 방향이 같은 경우만 비교한다.
 function nativeAxis(e){
  const t=e.effect||'';
  if(/막혔던 일은 내놓|막힌 결과를 내놓|막힌 결과나 압박은 풀리|검토와 준비의 막힘은 줄/.test(t))return {axis:'output-progress',valence:'support'};
  if(/중단해 제출|내놓고 고치는 일이|준비는 길어지고 날짜는/.test(t))return {axis:'output-progress',valence:'adverse'};
  if(/직접 받던 압박은 줄/.test(t))return {axis:'responsibility-pressure',valence:'support'};
  if(/맡은 책임을 줄이지 못하고/.test(t))return {axis:'responsibility-pressure',valence:'adverse'};
  return null;
 }
 function eventAxis(e){return e.domain==='work'?'output-progress':e.domain==='office'?'responsibility-pressure':null;}
 function reconcile(p,items,start,end){
  const kept=[],decisions=[];let text=p.text||'',title=p.title;
  for(const item of items){
   const axis=eventAxis(item),opposite=(p.evidence||[]).filter(e=>{const c=nativeAxis(e);return c&&c.axis===axis&&c.valence!==item.valence;});
   if(!axis||!opposite.length){kept.push(item);continue;}
   const nativeBad=opposite.find(e=>nativeAxis(e).valence==='adverse');
   if(item.valence==='support'&&nativeBad){decisions.push({axis,winner:'saju',evidence:[nativeBad,...item.evidence],range:item.range});continue;}
   // 새 문장이 적용되는 실제 겹침 구간에서만 불리한 판정을 쓴다. 긴 기간 전체로 확대하지 않는다.
   const overridden=[];
   for(const e of opposite){for(const sentence of (e.effect.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(x=>x.trim())){
    if(!nativeAxis({effect:sentence})||!text.includes(sentence))continue;
    overridden.push(sentence);
    if(item.range.start<=start&&item.range.end>=end)text=text.replace(sentence,'');
    else text=text.replace(sentence,item.period+'의 범위 밖에서는 '+sentence);
   }}
   if(overridden.length&&item.range.start<=start&&item.range.end>=end)title=item.head;
   decisions.push({axis,winner:'western',evidence:[...opposite,...item.evidence],range:item.range,overridden});kept.push(item);
  }
  return {...p,text:text.trim(),title,starPeriods:kept,periodDecisions:decisions,originalPeriod:{text:p.text,title:p.title}};
 }
 function select(events,period){
  const overlap=events.filter(e=>e.end>period.start&&e.start<period.end);
  const sorted=overlap.map(e=>({...e,domain:theme(e),valence:valence(e),weight:(valence(e)==='adverse'?12:0)+(period.kind==='month'?(FAST.includes(e.body)?6:0):(SLOW.includes(e.body)?5:0))+(e.error<.15?2:0)+Math.min(4,(Math.min(e.end,period.end)-Math.max(e.start,period.start))/DAY/30)})).sort((a,b)=>b.weight-a.weight||a.peak-b.peak||a.body.localeCompare(b.body)||a.target.localeCompare(b.target));
  const selected=[];
  if(period.kind==='decade'){
   // 10년 전체에 한 시점의 접촉을 덮어쓰지 않고, 앞·중간·뒤에서 실제 접촉을 고른다.
   for(let part=0;part<3;part++){const lo=period.start+(period.end-period.start)*part/3,hi=period.start+(period.end-period.start)*(part+1)/3;const e=sorted.find(e=>e.peak>=lo&&e.peak<hi&&!selected.some(x=>x.domain===e.domain));if(e)selected.push(e);}
  }else for(const e of sorted){if(selected.some(x=>x.domain===e.domain))continue;selected.push(e);if(selected.length===(period.kind==='month'?1:2))break;}
  return selected.sort((a,b)=>a.peak-b.peak).map((e,i)=>{
   const c=COPY[e.domain],range={start:Math.max(e.start,period.start),end:Math.min(e.end,period.end)},text=c[e.valence==='adverse'?'bad':'good'][e.target.charCodeAt(0)%2];
   const same=overlap.filter(x=>x.body===e.body&&x.target===e.target&&x.angle===e.angle&&Math.abs(x.peak-e.peak)>20*DAY);
   const prefix=period.kind==='past'?'그때는 ':period.kind==='decade'?'이 10년 중에 ':period.kind==='month'?'이 달에는 ':'';
   const actor=ACTOR[e.body][e.valence].replace(/동안에는$/,period.kind==='past'?'때였습니다.':'때입니다.');
   return {id:e.body+'-'+e.target+'-'+e.angle+'-'+Math.round(e.peak/DAY),domain:e.domain,valence:e.valence,head:e.valence==='adverse'?c.head:c.label+'의 조건을 정리할 여지가 생기는 때',label:c.label,period:spanLabel(range.start,range.end)+(e.uncertainty>0?' 무렵':''),range,evidence:[evidence(e)],
    text:prefix+actor+' '+text+(same.length?' 같은 조건이 다시 겹치는 때가 있어 한 번 정리한 일을 재차 확인하게 됩니다.':''),ending:c.end,recurrences:same.map(x=>({...evidence(x),period:spanLabel(Math.max(x.start,period.start),Math.min(x.end,period.end))}))};
  });
 }
 function compute(req){
  const targets=natalTargets(req.western),periods=req.periods||[];
  if(!targets.length)return {available:false,reason:'출생차트에서 확실하게 비교할 위치를 찾지 못했습니다.',periods:{}};
  const sample=makeSampler(),all=[];
  const ranges=mergeRanges(periods.filter(p=>p.kind!=='month'));
  for(const range of ranges)for(const body of SLOW)for(const target of targets)all.push(...scan(body,target,range,sample));
  const months=periods.filter(p=>p.kind==='month');
  for(const range of mergeRanges(months))for(const body of FAST)for(const target of targets)all.push(...scan(body,target,range,sample));
  const unique=new Map();for(const e of all){const key=e.body+':'+e.target+':'+e.angle+':'+Math.round(e.peak/DAY);if(!unique.has(key))unique.set(key,e);}
  const events=[...unique.values()],out={};for(const p of periods)out[p.id]=select(events.filter(e=>p.kind==='month'||SLOW.includes(e.body)),p);
  return {available:true,unknown:!!req.western.unknown,periods:out,ranges:Object.fromEntries(periods.map(p=>[p.id,{start:p.start,end:p.end}])),samples:sample.size(),events:events.length};
 }
 function request(R,v,bounds){
  const periods=[];
  for(const p of v.past){const b=bounds(p.year);periods.push({id:'past:'+p.year,kind:'past',start:b.start,end:b.end});}
  for(const y of v.years){periods.push({id:'year:'+y.year,kind:'year',start:y.periodStart,end:y.periodEnd});for(const m of y.months||[])periods.push({id:'month:'+m.start,kind:'month',start:m.start,end:m.end});}
  for(const x of v.luck.cycles)periods.push({id:'decade:'+x.c.i,kind:'decade',start:x.c.start,end:x.c.end});
  return {western:R.western,periods};
 }
 function apply(out,data,pastify,now=Date.now()){
  if(!data||!data.available)return out;
  const get=id=>data.periods[id]||[];
  out.past=out.past.map(p=>{const x=reconcile(p,get('past:'+p.year),data.ranges['past:'+p.year].start,data.ranges['past:'+p.year].end);if(typeof pastify==='function')x.starPeriods=x.starPeriods.map(e=>({...e,text:pastify(e.text)}));return x;});
  out.years=out.years.map(y=>({...reconcile(y,get('year:'+y.year),y.periodStart,y.periodEnd),months:y.months.map(m=>reconcile(m,get('month:'+m.start),m.start,m.end))}));
  out.luck.cycles=out.luck.cycles.map(x=>{const c=reconcile(x.c,get('decade:'+x.c.i),x.c.start,x.c.end);return {...x,c,stage:x.now?x.stage:c.text};});
  const current=out.years[0],next=out.years[1];
  if(current&&next){const same=next.starPeriods.find(e=>current.starPeriods.some(p=>p.id===e.id));if(same)next.starPeriods=next.starPeriods.map(e=>e.id===same.id?{...e,originalText:e.text,text:'앞의 해에서 짚은 '+e.label+'의 조건이 이 기간까지 이어집니다. '+e.ending}:e);}
  const upcoming=[...(current?current.starPeriods:[]),...(next?next.starPeriods:[])].filter(x=>x.range.end>now);
  const dominant=upcoming.find(x=>x.valence==='adverse');
  if(dominant){const parts=out.verdict.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[out.verdict];parts.splice(Math.max(1,parts.length-1),0,'다가오는 흐름에서도 '+dominant.label+'의 몫을 다시 맞출 때가 겹칩니다. '+dominant.ending);out.verdict=parts.map(x=>x.trim()).join(' ');out.periodVerdictEvidence=dominant.evidence;}
  return out;
 }
 function prepare(req){
  if(typeof Worker==='undefined')return Promise.reject(new Error('별자리 시기 계산을 이 환경에서 시작하지 못했습니다.'));
  let cancel;const promise=new Promise((resolve,reject)=>{
   const worker=new Worker('period-worker.js?v=20261108-integrated');let done=false;
   const finish=(fn,value)=>{if(done)return;done=true;clearTimeout(timer);worker.terminate();fn(value);};
   cancel=()=>finish(reject,new Error('풀이 계산이 취소되었습니다.'));
   const timer=setTimeout(()=>finish(reject,new Error('별자리 시기 계산 시간이 초과되었습니다.')),30000);
   worker.onmessage=e=>e.data.error?finish(reject,new Error(e.data.error)):finish(resolve,e.data);
   worker.onerror=e=>finish(reject,new Error(e.message||'별자리 시기 계산을 완료하지 못했습니다.'));
   worker.postMessage(req);
  });promise.cancel=()=>cancel&&cancel();return promise;
 }
 return {compute,request,apply,prepare,natalTargets,scan,select,reconcile,nativeAxis,resolveRanges:mergeRanges,longitude,distance,spanLabel,COPY};
});
