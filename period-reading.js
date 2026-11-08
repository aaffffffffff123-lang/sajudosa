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
   return {id:e.body+'-'+e.target+'-'+e.angle+'-'+Math.round(e.peak/DAY),domain:e.domain,valence:e.valence,head:e.valence==='adverse'?c.head:c.label+'의 조건을 정리할 여지가 생기는 때',label:c.label,period:spanLabel(range.start,range.end)+(e.uncertainty>0?' 무렵':''),range,evidence:[evidence(e)],
    text,copyKey:e.domain+':'+e.valence+':'+e.target.charCodeAt(0)%2,ending:c.end,recurrences:same.map(x=>({...evidence(x),period:spanLabel(Math.max(x.start,period.start),Math.min(x.end,period.end))}))};
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
 // 같은 해석이 다른 해·대운에도 걸리면 원고를 재생하지 않고 재발 시점을 잇는다.
 const AGAIN={
  work:{adverse:['확인과 수정 때문에 마감이 다시 밀립니다.','일을 내놓기 전 확인과 설명에 다시 시간이 듭니다.'],support:['막혔던 일을 정리하고 제안을 통과시킬 여지가 다시 생깁니다.','익힌 방법으로 일을 풀고 다른 일에도 적용할 기회가 다시 옵니다.']},
  money:{adverse:['들어올 돈보다 치를 비용이 먼저 돌아오는 사정이 반복됩니다.','정해 둔 지출에서 줄일 항목을 다시 찾아야 합니다.'],support:['미뤘던 비용을 정리할 여지가 다시 생깁니다.','생활의 셈을 조정할 여유가 다시 생깁니다.']},
  body:{adverse:['일정과 회복할 시간을 함께 맞추기 어려운 때가 다시 옵니다.','하루 일정에 식사와 휴식이 밀리는 일이 반복됩니다.'],support:['흐트러진 생활의 순서를 다시 잡을 여지가 생깁니다.','몸과 생활을 돌볼 간격을 다시 마련하기 수월해집니다.']},
  home:{adverse:['서로 기대한 것과 내줄 수 있는 시간의 차이가 다시 드러납니다.','가까운 사람과 정해 둔 약속을 다시 확인하게 됩니다.'],support:['관계의 말을 꺼내고 함께할 조건을 맞출 여지가 다시 생깁니다.','멀어졌던 대화를 다시 잇기가 수월해집니다.']},
  family:{adverse:['집안의 기대와 내줄 수 있는 몫을 다시 맞춰야 합니다.','가족 안에서 맡아 온 일을 다시 나눌 필요가 생깁니다.'],support:['집안의 도움을 얻고 생활의 몫을 조정할 여지가 다시 생깁니다.','가족과 역할을 정리할 여유가 다시 생깁니다.']},
  office:{adverse:['결정할 권한보다 결과를 설명할 책임이 커지는 일이 반복됩니다.','기준과 평가를 다시 확인할 일이 늘어납니다.'],support:['판단을 맡거나 신임을 얻을 기회가 다시 옵니다.','절차 안에서 자기 판단을 인정받을 기회가 다시 옵니다.']},
  gwiin:{adverse:['도움을 받기 전에 갖춰야 할 조건이 다시 늘어납니다.','도움을 받은 뒤에도 자기 힘을 증명할 일이 다시 남습니다.'],support:['사람을 통해 길과 도움을 얻을 여지가 다시 생깁니다.','혼자 찾기 어려운 기회를 소개받을 여지가 다시 넓어집니다.']}
 };
 const sentenceList=t=>(String(t||'').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).map(x=>x.trim()).filter(Boolean);
 function shortWindow(r){
  const a=new Date(r.start+9*3600000),b=new Date(r.end-1+9*3600000),ay=a.getUTCFullYear(),by=b.getUTCFullYear(),am=a.getUTCMonth()+1,bm=b.getUTCMonth()+1;
  return ay===by?ay+'년 '+am+(am===bm?'월':'~'+bm+'월'):ay+'년 '+am+'월~'+by+'년 '+bm+'월';
 }
 function windowLead(ranges){
  const labels=[...new Set(ranges.map(shortWindow))];
  if(labels.length<3)return labels.join('과 ')+'에는 ';
  const first=new Date(ranges[0].start+9*3600000).getUTCFullYear(),last=new Date(ranges[ranges.length-1].end-1+9*3600000).getUTCFullYear();
  return (first===last?first+'년':first+'~'+last+'년 사이')+'에 몇 차례 ';
 }
 function narrative(p,{kind,base=p.text||'',start,end,seen=new Set(),pastify}={}){
  const groups=new Map(),native=[...new Set(sentenceList(base))];
  for(const e of p.starPeriods||[]){
   const key=e.copyKey||e.domain+':'+e.valence+':'+(e.originalText||e.text);
   let g=groups.get(key);if(!g){g={key,item:e,windows:[],sourceIds:[],evidence:[]};groups.set(key,g);}
   const windows=[e.range,...(e.recurrences||[])];
   for(const w of windows){const range={start:Math.max(w.start,start),end:Math.min(w.end,end)};if(range.end>range.start)g.windows.push(range);}
   g.sourceIds.push(e.id);g.evidence.push(...e.evidence,...(e.recurrences||[]));
  }
  const pieces=[],dates=[];
  for(const g of [...groups.values()].sort((a,b)=>Math.min(...a.windows.map(w=>w.start))-Math.min(...b.windows.map(w=>w.start)))){
   const e=g.item,ranges=mergeRanges(g.windows),lead=windowLead(ranges);
   const variant=Number(String(e.copyKey||'').split(':').pop());
   let detail=seen.has(g.key)&&AGAIN[e.domain]&&Number.isInteger(variant)?AGAIN[e.domain][e.valence][variant]:e.text;
   if(kind==='past'&&typeof pastify==='function')detail=pastify(detail);
   // 선택된 내용이 본문에 이미 있으면 기간만 붙이고 같은 문장을 되풀이하지 않는다.
   const sentences=sentenceList(detail),fresh=sentences.filter(x=>!native.includes(x));
   if(!fresh.length&&sentences.length){
    const i=native.indexOf(sentences[0]);if(i>=0)native[i]=lead+native[i];
   }else if(fresh.length)pieces.push({text:lead+fresh.join(' '),continued:seen.has(g.key)});
   seen.add(g.key);
   dates.push({label:e.label,ranges,periods:ranges.map(r=>spanLabel(r.start,r.end)+(e.evidence.some(x=>x.unknownBirthTime)?' 무렵':'')),sourceIds:g.sourceIds,evidence:g.evidence});
  }
  // 기본 흐름과 첫 시기 설명을 같은 문단에서 이어 읽고, 뒤의 시기는 다음 문단으로 잇는다.
  const first=pieces.shift(),paragraphs=[[native.join(' '),first&&first.text].filter(Boolean).join(' ')].filter(Boolean);
  for(const piece of pieces){
   // 이미 설명한 흐름의 재접촉은 별도 풀이처럼 문단을 다시 시작하지 않는다.
   if(piece.continued&&paragraphs.length)paragraphs[paragraphs.length-1]+=' '+piece.text;
   else paragraphs.push(piece.text);
  }
  return {paragraphs,dates};
 }
 function apply(out,data,pastify,now=Date.now()){
  if(!data||!data.available)return out;
  const get=id=>data.periods[id]||[],seen=new Set();
  out.past=out.past.map(p=>{
   const range=data.ranges['past:'+p.year],x=reconcile(p,get('past:'+p.year),range.start,range.end);
   if(typeof pastify==='function')x.starPeriods=x.starPeriods.map(e=>({...e,text:pastify(e.text)}));
   x.narrative=narrative(x,{kind:'past',...range,seen,pastify});return x;
  });
  out.years=out.years.map(y=>({...reconcile(y,get('year:'+y.year),y.periodStart,y.periodEnd),months:y.months.map(m=>reconcile(m,get('month:'+m.start),m.start,m.end))}));
  const current=out.years[0],next=out.years[1];
  if(current&&next){
   const ids=new Set(current.starPeriods.map(e=>e.id));
   next.starPeriods=next.starPeriods.map(e=>ids.has(e.id)?{...e,originalText:e.text,text:'앞의 해에서 짚은 '+e.label+'의 조건이 이 기간까지 이어집니다.',continued:true}:e);
  }
  for(const y of out.years){
   const base=/다시 겹치는 해$/.test(y.title||'')&&/^\d+년에 짚은 문제가 이 시기에도 이어집니다\.$/.test(y.text||'')?'':y.text;
   y.narrative=narrative(y,{kind:'year',base,start:y.periodStart,end:y.periodEnd,seen});
   // 화면에는 현재 월운만 나오므로 보이지 않는 달이 다음 본문을 지우지 않는다.
   const shown=y.months.find(m=>m.start<=now&&now<m.end);
   for(const m of y.months)m.narrative=narrative(m,{kind:'month',start:m.start,end:m.end,seen:m===shown?seen:new Set()});
  }
  out.luck.cycles=out.luck.cycles.map(x=>{
   // 다음 대운의 stage는 앞에서 이미 중복을 제거한 본문이다. c.text로 되돌리지 않는다.
   const c=reconcile({...x.c,text:x.now?x.c.text:x.stage},get('decade:'+x.c.i),x.c.start,x.c.end);
   c.narrative=narrative(c,{kind:'decade',start:c.start,end:c.end,seen});
   return {...x,c};
  });
  // 전체 풀이는 이미 선택된 분야들을 연결해 썼다. 별도 운명 판정을 다시 끼워 넣지 않는다.
  const relevant=new Set(out.verdictEvidence&&out.verdictEvidence.domains||[]);
  const upcoming=out.years.flatMap(y=>y.starPeriods).filter(e=>e.range.end>now&&relevant.has(e.domain));
  const dominant=upcoming.find(e=>e.valence==='adverse');
  if(dominant)out.periodVerdictEvidence=dominant.evidence;
  return out;
 }
 function prepare(req){
  if(typeof Worker==='undefined')return Promise.reject(new Error('별자리 시기 계산을 이 환경에서 시작하지 못했습니다.'));
  let cancel;const promise=new Promise((resolve,reject)=>{
   const worker=new Worker('period-worker.js?v=20261109-woven');let done=false;
   const finish=(fn,value)=>{if(done)return;done=true;clearTimeout(timer);worker.terminate();fn(value);};
   cancel=()=>finish(reject,new Error('풀이 계산이 취소되었습니다.'));
   const timer=setTimeout(()=>finish(reject,new Error('별자리 시기 계산 시간이 초과되었습니다.')),30000);
   worker.onmessage=e=>e.data.error?finish(reject,new Error(e.data.error)):finish(resolve,e.data);
   worker.onerror=e=>finish(reject,new Error(e.message||'별자리 시기 계산을 완료하지 못했습니다.'));
   worker.postMessage(req);
  });promise.cancel=()=>cancel&&cancel();return promise;
 }
 return {compute,request,apply,prepare,natalTargets,scan,select,reconcile,narrative,nativeAxis,resolveRanges:mergeRanges,longitude,distance,spanLabel,COPY};
});
