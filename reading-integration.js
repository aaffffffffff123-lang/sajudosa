/* 통합 풀이: 원고는 보존하고 선택된 조건 사이의 연결을 추가한다. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();else root.ReadingIntegration=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const normalize=t=>String(t||'').replace(/팔자/g,'운명').replace(/ 사주입니다/g,' 운명입니다').replace(/ 사주(?=[.!?]|$)/g,' 운명');
 // 주제·시기·대상이 모두 같을 때만 충돌이다. 유리함/불리함이 다른 영역이면 두 조건을 남긴다.
 function resolve(claims){
  const chosen=[],discarded=[];
  for(const c of claims){
   if(!c.evidence||!c.evidence.length)continue;
   const i=chosen.findIndex(x=>x.axis===c.axis&&x.scope===c.scope&&x.subject===c.subject&&x.direction!==c.direction);
   if(i<0){chosen.push(c);continue;}
   const prev=chosen[i];
   if(c.valence==='adverse'&&prev.valence!=='adverse'){discarded.push(prev);chosen[i]=c;}
   else if(prev.valence==='adverse'&&c.valence!=='adverse')discarded.push(c);
   else chosen.push(c);
  }
  return {chosen,discarded};
 }
 function choose(out,R,V5){
  const w=R.western;if(!w||!w.available||w.unknown||R.input&&R.input.unknown)return out;
  const planet=id=>(w.planets||[]).find(x=>x.id===id)||{};
  const hard=(a,b)=>(w.aspects||[]).find(x=>((x.a===a&&x.b===b)||(x.a===b&&x.b===a))&&[90,180].includes(x.angle)&&x.orb<=4);
  const gw=out.domains.find(x=>x.id==='gwiin'),j=planet('Jupiter'),a=hard('Jupiter','Saturn');
  // 귀인의 유무와 그 도움에 접근하기 어려운 조건을 같은 접근성 판정으로 비교한다.
  if(gw&&a&&[8,12].includes(j.house)){
   const native={source:'saju',axis:'access-to-help',scope:'natal',subject:'self',direction:gw.cause==='present'?'open':'restricted',valence:gw.cause==='present'?'support':'adverse',evidence:[gw.basis]};
   const star={source:'western',axis:native.axis,scope:native.scope,subject:native.subject,direction:'restricted',valence:'adverse',evidence:[{kind:'aspect',...a},{kind:'house',planet:'Jupiter',house:j.house}]};
   const decision=resolve([native,star]);
   if(decision.discarded.includes(native)){
    gw.originalSelection={cause:gw.cause,head:gw.head,detail:gw.detail,rule:gw.rule,fates:gw.fates.slice(),note:gw.note};
    Object.assign(gw,V5.gwiin.absent,{cause:'absent',fates:[V5.gwiin.absent.fate],note:{label:'도움을 얻기 전에 치르는 것',value:'먼저 갖춰야 하는 조건 · 부탁할 때 남는 빚 · 혼자 증명하는 시간'},selectionDecision:decision});
   }
  }
  return out;
 }
 const THREADS={
  work:{
   W4:['쌓은 일을 지키려 해도, 옮겨서 벗어나려 해도 다시 증명할 몫이 남습니다.','이곳에서 애쓴 기록을 다음 일터가 같은 값으로 받아 주지는 않습니다. 지금 일을 놓는 데 드는 품과 새로 인정받는 데 드는 품은 이어집니다.','당신은 해낸 일을 붙들고 있는 동안에도, 그 일을 떠난 뒤에도 다시 증명할 시간을 내야 하는 운명입니다.','옮긴 뒤 다시 증명할 것','이력서의 경력 · 새 일터의 기준'],
   W5:['끝낸 일의 경계가 퇴근 뒤까지 밀립니다.','맡은 일을 어디까지 끝내야 하는지 불분명하면, 퇴근 뒤에 묻는 말에도 그 끝을 다시 설명해야 합니다.','당신은 일을 마친 시간 뒤에도 연락에 답하며 그 일이 아직 자기 몫임을 확인해 주는 운명입니다.','퇴근 뒤에도 돌아오는 것','업무 연락 · 답하지 않은 이유의 설명'],
   W7:['일을 아는 만큼 넘겨줄 일까지 늘어납니다.','해내는 방법을 안다는 이유는 쉬게 해 줄 사정보다 다시 찾을 이유로 먼저 쓰입니다.','당신은 일을 해낸 뒤에도 남이 그 일을 해낼 때까지 설명할 몫을 내려놓지 못하는 운명입니다.','넘겨도 남는 설명','인수인계 · 쉬는 날의 질문'],
   W2:['힘들다는 말을 꺼낸 뒤에도 일이 남습니다.','이미 맡은 몫을 줄이려는 말에도 그 몫을 나누고 증명하는 일이 먼저 붙습니다.','당신은 감당하기 어렵다는 사정까지 일의 목록으로 만들어 제출해야 하는 운명입니다.','부담을 말한 뒤 더 하는 일','업무 목록 · 줄일 몫의 설명'],
   W6:['버틴 사정은 남고 줄어든 몫은 돌아오지 않습니다.','지금 일을 계속할 이유를 셀 때에는 그동안 포기한 몫도 따라옵니다. 그러나 그 사정은 다음에 받을 값을 정하는 쪽의 장부에는 없습니다.','당신은 어려울 때 견딘 몫을 돌려받기보다 다음에도 견딜 수 있는 사람으로 남는 운명입니다.','버틴 뒤에도 남는 차이','줄어든 보상 · 되돌아오지 않은 조건'],
   W1:['한 번 해낸 일이 다음 몫을 정합니다.','맡은 일을 끝내는 동안 보여 준 품은 다음에 일을 맡길 근거로 남습니다.','당신은 일을 끝낸 덕분에 같은 일을 다시 맡길 수 있는 사람으로 남는 운명입니다.','성과 뒤에 붙는 것','반복 배정 · 높아진 기본 기대'],
   W3:['성과를 낸 사람과 성과로 인정받는 사람이 갈립니다.','일을 제대로 해내려 쓴 수고가 보고되는 순간에는 그 일을 맡긴 사람의 관리 성과까지 됩니다.','당신은 결과를 만드는 수고를 내고 그 결과를 자기 이름으로 남길 몫은 따로 구해야 하는 운명입니다.','결과를 낸 뒤 남는 일','공로의 설명 · 담당자의 책임']
  },
  home:{
   housing:['말하지 못한 사정에 함께 살 비용까지 얹힙니다.','함께 사는 이야기를 꺼내면 마음만 확인하고 끝낼 수 없습니다. 집과 돈과 시간을 누가 얼마나 낼지 정해야 하니, 이미 말하기 어려웠던 사정도 구체적인 셈으로 꺼내야 합니다.','당신은 관계를 지키려고 삼킨 사정을 함께 살 비용 앞에서 다시 꺼내야 하는 운명입니다.','마음만으로 넘기지 못하는 것','집을 마련할 몫 · 결혼 비용 · 함께 살 시간'],
   work:['만날 마음을 생활 시간으로 증명해야 합니다.','서로의 마음을 확인해도 만날 시간을 따로 마련해야 합니다. 일이 차지한 시간까지 상대에게 설명하는 품이 관계 안에 남습니다.','당신은 마음을 전할 때마다 그 마음을 쓸 시간까지 마련해야 하는 운명입니다.','관계를 설명하게 만드는 것','미뤄진 약속 · 서로 다른 퇴근 시간'],
   departure:['가까워질 때도 떠날 때도 생활의 셈이 남습니다.','지금 관계의 문제를 풀지 못해 다른 길을 생각해도, 함께 쓰던 돈과 시간은 마음보다 늦게 갈라집니다.','당신은 마음의 끝을 정한 뒤에도 함께 묶어 둔 생활을 풀어낼 몫이 남는 운명입니다.','관계 뒤에도 남는 것','공동 비용 · 새로 마련할 생활'],
   giving:['맞춰 준 만큼 내 사정을 꺼내기 어려워집니다.','앞에서 넘겨 준 사정들이 쌓이면 다음에도 당신 쪽에서 맞출 것이라는 기대가 생깁니다.','당신은 관계를 지키려고 맞춰 준 몫을 나중에는 당연한 몫으로 요구받는 운명입니다.','내 쪽에서 먼저 줄이는 것','시간 · 표현할 서운함 · 선택의 폭'],
   meeting:['관계의 다음 선택에도 생활 조건이 따라옵니다.','지금 관계를 풀어 보거나 다른 인연을 찾는 일에도 나갈 시간과 소개받을 조건을 따로 마련해야 합니다.','당신은 마음을 정한 뒤에도 그 마음을 만남으로 옮길 조건부터 갖춰야 하는 운명입니다.','새 만남보다 먼저 필요한 것','비워 둔 시간 · 소개받을 조건']
  },
  body:{
   wear:['끝난 일의 긴장과 일하며 닳은 몸이 함께 남습니다.','일을 계속하려고 줄인 휴식은 마음과 몸에서 따로 값을 받습니다. 머릿속으로 일을 놓지 못한 시간에도 몸은 다음에 쓸 힘을 채우지 못합니다.','당신은 일을 마친 뒤에도 그 일의 걱정과 몸에 남은 값을 자기 시간으로 치르는 운명입니다.','일이 끝나도 남는 부담','긴장이 풀리지 않는 밤 · 회복에 드는 날과 돈'],
   proof:['쉬어야 할 사정까지 쉬지 못한 사람이 증명합니다.','쉬는 때를 뒤로 미루다 보면 쉬어야 하는 이유를 설명할 일도 커집니다. 회복하는 시간과 그 시간을 얻는 데 드는 품은 따로 셉니다.','당신은 쉬어야 할 때에도 쉬어야 하는 사정부터 증명하며 자기 시간을 쓰는 운명입니다.','휴식 전에 치르는 품','진료를 위한 시간 · 쉬어야 할 사정의 설명'],
   duty:['쉬지 못한 이유가 다음에도 쉬지 못할 이유가 됩니다.','이미 쉬는 몫을 줄여 버틴 사람에게는 다시 버텨 달라는 말도 쉽게 옵니다.','당신은 버틴 만큼 쉬게 되기보다 다음에도 버틸 사람으로 기억되는 운명입니다.','다음 휴식까지 미루는 것','빠진 몫의 부담 · 동료에게 남는 미안함']
  },
  family:{
   comparison:['가족에게 받은 출발의 차이가 내 생활의 차이로 남습니다.','앞에서 가족에게 감당할 몫을 세는 동안에도 다른 집이 먼저 마련해 준 조건과의 차이는 남습니다. 같은 수입을 얻어도 그 수입에서 먼저 나갈 항목까지 같지는 않습니다.','당신은 가족에게 감당할 몫을 치른 뒤의 결과만 다른 집에서 출발한 사람과 나란히 비교받는 운명입니다.','출발의 차이가 남는 곳','주거 비용 · 모을 수 있는 돈'],
   guidance:['가족에게서 먼저 본 길이 다음 선택에도 따라옵니다.','집에서 먼저 보고 익힌 길은 자신의 일을 고를 때도 기준이 됩니다. 다른 길을 준비할 때에는 생활을 마련하는 일에 그 길을 알아보는 품까지 더해야 합니다.','당신은 자기 생활을 마련하는 동안 다른 길을 알아볼 시간까지 함께 마련해야 하는 운명입니다.','새 길을 찾기 전에 필요한 것','진로를 알아볼 시간 · 먼저 가 본 사람의 안내'],
   expectation:['가족이 기대하는 몫은 지금의 생활비보다 오래된 셈을 따릅니다.','앞에서 가족에게 감당할 몫을 정할 때에도 지금의 형편만 셈하지는 않습니다. 부모가 기억하는 때의 기준까지 맞춰야 제때 제 몫을 한 자식으로 남습니다.','당신은 지금의 형편을 감당하면서 예전 기준으로 정한 가족의 기대까지 채워야 하는 운명입니다.','현재 형편과 함께 맞춰야 하는 것','부모가 기억하는 생활 수준 · 제때 갖추라는 기대'],
   generations:['부모에게 쓴 몫과 자식에게 남길 몫이 같은 돈에서 나갑니다.','내가 부모에게 보태는 돈과 아이에게 남기려는 돈은 다른 이름으로 같은 생활비에서 나갑니다. 한쪽을 먼저 치른 뒤에 다른 쪽을 마련할 때까지 가족의 시간은 기다려 주지 않습니다.','당신은 윗세대의 생활을 받치고 아랫세대의 출발을 마련하는 사이에 자기 몫을 뒤로 미루는 운명입니다.','세대 사이에서 먼저 나가는 것','부모의 생활과 돌봄 · 아이의 출발 비용'],
   received:['받은 지원에도 다음에 증명할 몫이 따라옵니다.','앞에서 받은 지원은 출발할 때의 몫입니다. 그 뒤의 주거비와 부양, 자식에게 남길 몫까지 모두 마련되었다는 뜻은 아닙니다. 받은 만큼 뒤의 생활도 잘 이어 가리라는 기대가 먼저 붙습니다.','당신은 받은 것을 지켰다는 증명과 다음 세대에 남길 몫을 함께 요구받는 운명입니다.','지원 뒤에도 남는 몫','자기 생활의 유지 · 가족의 기대 · 다음 세대의 출발'],
   obligation:['가족에게 보탠 몫이 내 생활의 순서를 바꿉니다.','집안에 먼저 필요한 것을 치르는 동안에도 자기 생활에 필요한 비용은 쌓입니다. 보탠 몫을 돌려 달라는 말보다 다음에 보탤 사정이 먼저 옵니다.','당신은 가족의 급한 사정을 넘기는 동안 자신의 다음 준비를 뒤로 미루는 운명입니다.','집안의 셈 뒤로 밀리는 것','독립 준비 · 내 노후 · 비워 둔 시간']
  },
  money:{
   burden:['남길 돈을 마련하는 동안에도 먼저 치를 값이 늘어납니다.','당장의 지출을 넘기는 일과 나중에 쓸 몫을 마련하는 일은 같은 수입을 나눠 씁니다. 하나를 먼저 치른 뒤 다른 하나까지 끝났다고 셀 수는 없습니다.','당신은 오늘 치른 값을 끝낸 뒤에도 다음에 치를 몫을 마련하러 다시 나서는 운명입니다.','수입보다 먼저 정해지는 몫','생활 유지비 · 준비 비용 · 약속한 상환']
  },
  gwiin:{
   help:['도움을 구할 때도 받은 뒤에도 내 몫이 남습니다.','혼자 해내기 어려워 구한 도움에도 누구에게 무엇을 돌려줄지 따지는 시간이 붙습니다.','당신은 도움으로 덜어 낸 일만큼 그 도움을 받을 조건과 갚을 몫을 다시 세는 운명입니다.','도움 앞뒤에 남는 것','받기 위한 증명 · 받은 뒤의 기대']
  },
  office:{
   authority:['위에서 받은 기준을 아래에 적용할 책임이 남습니다.','당신이 아래에 판단을 내리는 동안에도 그 판단을 허락하는 기준은 위에 남습니다. 위에서 정한 몫을 아래가 받아들이게 하는 일까지 당신의 성과로 셉니다.','당신은 자신도 바꾸지 못한 기준을 남에게 적용한 성과로 권한을 지키는 운명입니다.','위아래에서 함께 요구하는 것','기준의 준수 · 아래 사정의 거절'],
   pressure:['결정할 몫보다 설명할 책임이 먼저 옵니다.','정해진 조건을 받아 일하는 사람에게는 그 조건으로 결과를 내지 못한 이유까지 돌아옵니다.','당신은 정할 때 빠졌던 조건까지 결과를 설명하는 날에는 자기 책임으로 받는 운명입니다.','결정 뒤에 돌아오는 것','부족한 자원 · 결과에 대한 설명']
  }
 };
 function thread(d,out){
  const ids=d.poolIds||[];if(!ids.length)return null;
  const has=(...xs)=>xs.some(x=>ids.includes(x));
  if(d.id==='work')return ['W4','W5','W7','W2','W6','W1','W3'].find(x=>has(x));
  if(d.id==='home')return has('L3','L2','L8')?'housing':has('L7')?'departure':has('L4')?'work':has('L5')?'giving':'meeting';
  if(d.id==='body')return has('B6','B2')?'wear':has('B1','B5')?'proof':'duty';
  if(d.id==='family')return out.origin.key==='shown'&&has('F5','F6')?'received':['cut','care','shown','absent','absentPoor'].includes(d.cause)&&has('F1','F3','F4')?'generations':has('F1','F3','F4')?'obligation':has('F5')?'comparison':has('F6')?'guidance':'expectation';
  if(d.id==='office')return d.cause==='supported'?'authority':'pressure';
  return d.id==='money'?'burden':'help';
 }
 function finish(out,R){
  if(out.integration)return out;
  out.integration={sources:[],version:1};
  for(const d of out.domains){
   const key=thread(d,out),base=key&&THREADS[d.id][key];if(!base)continue;
   const t=base.slice(),ids=d.poolIds;
   if(d.id==='home'&&key==='housing'){
    t[4]=[ids.includes('L3')?'집을 마련할 몫':'',ids.includes('L2')?'결혼 비용':'',ids.includes('L8')?'함께 살 시간과 거리':''].filter(Boolean).join(' · ');
    if(!['연락은 끊깁니다','대화가 빨리 줄어듭니다','애매하게'].includes(d.cause)){t[0]='관계의 사정에 함께 살 비용까지 얹힙니다.';t[1]='관계에서 맞춰 온 사정은 함께 사는 조건을 정할 때에도 따라옵니다. 마음을 정한 뒤에는 집과 돈과 시간을 누가 얼마나 낼지 다시 정해야 합니다.';t[2]='당신은 마음을 맞춘 뒤에도 함께 살 조건을 자기 생활에서 더 마련해야 하는 운명입니다.';}
   }
   if(d.id==='body'&&key==='wear'&&d.ruleKey!=='checking'){t[0]='끝난 일의 값이 몸과 남은 시간에 붙습니다.';t[2]='당신은 일을 마친 뒤에도 몸에 남은 값을 자기 시간과 돈으로 치르는 운명입니다.';t[4]='회복에 드는 날과 돈';}
   if(d.id==='family'&&key==='received'&&['old','young'].includes(d.cause)){t[1]='앞에서 받은 지원은 출발할 때의 몫입니다. 그 뒤의 주거비와 가족의 부탁까지 모두 마련되었다는 뜻은 아닙니다. 받은 만큼 뒤의 생활도 잘 이어 가리라는 기대가 먼저 붙습니다.';t[2]='당신은 받은 것을 지켰다는 증명과 자기 생활을 마련할 몫을 함께 요구받는 운명입니다.';t[4]='자기 생활의 유지 · 가족의 기대';}
   if(d.id==='money')t[4]=ids.map(id=>({learning:'다음 준비에 드는 값',debt:'약속한 상환',effort:'돈으로 돌아오지 않은 수고',M2:'돈을 벌기 위해 내는 품',M6:'이동 전에 마련할 돈'}[id])).filter(Boolean).join(' · ');
   if(d.id==='body'&&key==='duty'&&ids.every(id=>id==='B7')){t[0]='몸을 챙길 시간도 일하고 남은 데서 냅니다.';t[1]='일을 위해 쓴 시간 뒤에서 자기 몸을 챙길 시간을 다시 찾아야 합니다. 생활을 이어 갈 힘을 마련하는 일도 쉬는 몫 안에 넣어 셉니다.';t[2]='당신은 일할 힘을 되찾는 일까지 일하고 남은 시간 안에서 해내야 하는 운명입니다.';t[4]='몸을 돌볼 시간 · 생활을 유지할 비용';}
   if(d.id==='gwiin'&&d.cause==='absent'){t[1]='어렵게 도움을 한 번 받게 되더라도 그 뒤에 누구에게 무엇을 돌려줄지 따지는 시간은 남습니다. 도움을 얻기 전의 증명과 얻은 뒤의 기대를 따로 치릅니다.';t[2]='당신은 도움을 구할 때에는 받을 조건을, 받게 된 뒤에는 갚을 몫을 먼저 세는 운명입니다.';}
   if(d.id==='body'&&key==='duty'&&ids.includes('B3')&&!ids.includes('B4'))t[4]='쉬고 돌아온 뒤 메울 일 · 쉰 만큼 뒤처졌다는 평가';
   d.integration={key,sourceIds:d.poolIds.slice(),astrologyIds:(d.westernAddedIds||[]).slice(),originalHead:d.head,originalClosing:d.closing.slice(),originalNote:d.note,summary:t[2]};
   const n=2;
   let bridge=t[1];
   // 한국어 원고만 표시한다. 검사·수면 이외의 몸 갈래에도 같은 부담의 원인을 연결한다.
   if(d.id==='body'&&key==='wear'&&d.ruleKey!=='checking')bridge='쉬는 간격을 뒤로 미루며 이어 온 일은 끝나도 몸에 남습니다. 일한 시간에서 빠진 회복은 나중의 자기 시간과 돈으로 채웁니다.';
   d.paragraphs.splice(n,0,bridge);
   if(d.id==='family'&&out.origin.key==='shown'){
    // 원래 문단을 남기면서 주거 지원과 진로 지원이 출발 지원과 동일한 뜻은 아님을 먼저 밝힌다.
    if(ids.includes('F5')){
     const i=d.paragraphs.findIndex(x=>x.startsWith('같은 해에 일을 시작한 친구'));
     if(i>=0)d.paragraphs.splice(i,0,'생활과 배움을 받쳐 준 도움과 따로 살 집까지 마련해 주는 도움은 크기가 다릅니다. 다른 집이 더 보태는 몫을 비교하는 때에는 앞에서 받은 지원도 충분한 몫으로 느껴지지 않습니다.');
    }
    if(ids.includes('F6')){
     const i=d.paragraphs.findIndex(x=>x.startsWith('부모가 하던 일은'));
     if(i>=0)d.paragraphs.splice(i,0,'배울 돈을 받았다는 사실과 내가 택할 분야의 길을 먼저 가 본 사람이 곁에 있다는 사실은 따로 셉니다. 받은 준비를 어디에 쓸지 정하는 일까지 대신해 주는 것은 아닙니다.');
    }
   }
   // 기존 머리말과 판정은 원고 그대로 남기고, 두 조건을 잇는 문장을 추가한다.
   const keepEnding=['money','gwiin','office'].includes(d.id);
   if(!keepEnding){d.head=t[0];d.paragraphs.unshift(d.integration.originalHead);}
   const closing=t[2];if(!d.closing.includes(closing))d.closing.splice(keepEnding?0:d.closing.length,0,closing);
   if(t[4]){if(d.note)d.note={...d.note,addition:{label:t[3],value:t[4]}};else d.note={label:t[3],value:t[4]};}
   out.integration.sources.push({domain:d.id,key,poolIds:d.poolIds.slice()});
  }
  if(out.opening){
   const o=out.opening;
   if(o.origin.length){const text={shown:'살림을 받쳐 준 몫과 그 집에서 배운 기준을 함께 지키려 하면, 받은 것을 잃지 않는 일이 다음 선택의 조건이 됩니다.',hidden:'집에서 익힌 기준대로 살고 싶어도 그 기준을 지탱할 돈을 꺼낼 수 없다면, 익숙한 생활의 값부터 자기 힘으로 마련해야 합니다.',absent:'자라며 익힌 방식은 남아 있어도 그 방식을 지탱할 살림은 직접 마련해야 합니다. 배운 순서대로 사는 데 드는 값도 당신 몫입니다.'}[out.origin.key];o.origin.push({id:'origin-connection-'+out.origin.key,text,evidence:[{kind:'origin',cause:out.origin.key},...o.origin[0].evidence]});}
   if(o.boss.length)o.boss.push({id:'boundary-connection',text:out.keys.boss==='low'||out.keys.boss==='absent'?'남이 직접 시키는 힘이 약해도 지켜 온 이름과 생활의 기준까지 사라지는 것은 아닙니다. 지시가 없는 날에도 스스로 끝낼 기준을 높이는 이유가 거기에 남습니다.':'밖에서 정한 기준을 맞추는 동안에는 그 기준에 맞게 익힌 생활도 함께 굳어집니다. 맡은 몫을 마친 뒤에도 제자리로 돌아가는 데에는 자기 시간이 듭니다.',evidence:o.boss[0].evidence});
   if(o.core.length){const domains=out.core.cause||'';let text;
    if(/change|clash|palace_hit/.test(domains))text='바뀐 조건에 익숙해지는 일과 그 변화에 익숙해지는 마음은 한 번에 끝나지 않습니다. 다음 변화가 오면 겨우 맞춘 생활과 그 마음을 함께 다시 옮깁니다.';
    else if(/speech|officer|checking|owl|resource_blocks/.test(domains))text='일을 마치는 것과 마음속에서 그 일을 끝내는 일이 갈라지면, 남에게 설명할 몫을 끝낸 뒤에도 스스로 확인할 몫이 남습니다.';
    else if(/wealth|reckoning|income/.test(domains))text='생활의 몫을 먼저 계산하는 반응이 익숙해질수록 내가 쓸 몫을 나중으로 미루는 일도 자연스러운 순서가 됩니다.';
    else if(/relation/.test(domains))text='가까운 사이에서 되풀이되는 반응은 다음에도 같은 말을 삼키거나 같은 기대를 품게 합니다. 지난번에 넘긴 사정이 다음 관계의 기준으로 남습니다.';
    else text='익숙한 반응으로 당장의 일을 넘기면 다음에도 그 방식부터 꺼내게 됩니다. 버티는 데 쓴 방식이 같은 몫을 다시 맡는 이유로 남습니다.';
    o.core.push({id:'core-connection-'+domains,text,evidence:[{kind:'core',cause:domains},...o.core[0].evidence]});
   }
  }
  // 원래 전체풀이의 마지막 판정은 그대로 두고, 실제 표시된 추가 원인 하나를 앞에서 받아 준다.
  const priority=['home','body','family','work','gwiin','office','money'];
  const d=priority.map(id=>out.domains.find(x=>x.id===id&&x.integration)).find(Boolean);
  const pieces=[];
  if(out.opening&&out.opening.origin.length)pieces.push(out.origin.key==='shown'?'집에서 받은 지원과 익힌 기준을 지키는 일도 당신이 앞으로 감당할 몫에 들어갑니다.':out.origin.key==='hidden'?'집에서 익힌 기준을 지킬 생활비는 손에 쥐지 못한 집안의 복과 별도로 마련해야 합니다.':'자라며 익힌 생활을 이어 가는 데 드는 값도 물려받을 몫 없이 직접 마련해야 합니다.');
  if(d)pieces.push(d.integration.summary.replace(/^당신은 /,'그 사이에서도 당신은 '));
  const parts=out.verdict.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[out.verdict];
  parts.splice(Math.max(1,parts.length-1),0,...pieces);out.verdict=parts.map(x=>x.trim()).join(' ');
  out.verdictIntegration={opening:out.opening&&out.opening.origin.map(x=>x.id)||[],domain:d?{id:d.id,poolIds:d.integration.sourceIds}:null};
  return out;
 }
 return {resolve,choose,finish,normalize,THREADS};
});
