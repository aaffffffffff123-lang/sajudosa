/* 통합 풀이: 선택된 조건과 생활 장면을 보존하며 제목·판정·요약을 한 흐름으로 엮는다. */
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
   W4:['쌓은 일을 지키려 해도, 옮겨서 벗어나려 해도 다시 증명할 몫이 남습니다.','이곳에서 애쓴 기록을 다음 일터가 같은 값으로 받아 주지는 않습니다. 지금 일을 놓는 데 드는 품과 새로 인정받는 데 드는 품은 이어집니다.','당신은 해낸 일을 붙들고 있는 동안에도 그 일을 떠난 뒤에도 다시 증명할 시간을 내야 하는 운명입니다.','옮긴 뒤 다시 증명할 것','이력서의 경력 · 새 일터의 기준'],
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
 // 귀인의 유무는 그대로 두고, 다른 칸의 주된 처지와 맞물리는 도움의 값을 짚는다.
 // 실제 본문에 선택된 문단만 사용한다. 이름·생일 해시나 무작위 문장으로 갈라놓지 않는다.
 function helperClosing(d,out){
  const has=id=>(d.poolIds||[]).includes(id);
  const cause=id=>(out.domains.find(x=>x.id===id)||{}).cause;
  const present=d.cause==='present';
  const primary=has(d.primaryPoolId)?d.primaryPoolId:null;
  if(present&&has('G4')&&(['palace_clash','month_day_clash'].includes(cause('work'))||out.core&&out.core.cause==='change'))
   return ['G4','당신은 귀인의 도움으로 들어선 곳을 떠나려는 날 그동안 받은 도움의 값을 다시 요구받는 운명입니다.'];
  if(present&&has('G6')&&cause('office')==='supported')
   return ['G6','당신은 끌어 준 사람 덕에 얻은 기회를 지켜도 그 사람이 밀려나는 날에는 함께 밀려나는 운명입니다.'];
  if(has('G7')&&['poor','comfort'].includes(cause('money')))
   return ['G7',present?'당신은 귀인을 만나도 받은 도움을 갚을 몫부터 헤아리느라 필요한 만큼 기대지 못하는 운명입니다.':'당신은 어렵게 도움을 구하고도 갚을 부담 때문에 기대는 몫을 줄여 혼자 치를 시간을 더 내는 운명입니다.'];
  if(has('G2')&&['challenge','mixed'].includes(cause('office')))
   return ['G2',present?'당신은 도움받은 은혜를 지키려고 도와준 사람 앞에서 반대할 말부터 삼키는 운명입니다.':'당신은 어렵게 한 번 받은 도움 때문에 그 뒤로 도와준 사람 앞에서 하고 싶은 말까지 고르는 운명입니다.'];
  if(primary==='G4')return ['G4','당신은 더 좋은 길로 떠나려는 날에도 받은 도움의 값을 베푼 사람이 정하는 대로 치르는 운명입니다.'];
  if(primary==='G6')return ['G6','당신은 도움으로 얻은 기회를 지켜도 도와준 사람의 신임이 끝나는 날 함께 흔들리는 운명입니다.'];
  if(primary==='G7')return ['G7',present?'당신은 귀인을 만나도 갚을 수 있는 몫에 맞춰 부탁을 줄이는 운명입니다.':'당신은 갚을 부담을 먼저 세느라 필요한 도움보다 적게 구하고 남은 일을 혼자 치르는 운명입니다.'];
  if(primary==='G2')return ['G2','당신은 도움받은 일보다 오래 은혜를 지키느라 다른 생각을 말할 때까지 허락을 살피는 운명입니다.'];
  if(present&&has('G1'))
   return ['G1','당신은 소개받은 곳에서 자기 몫을 해내고도 소개한 사람의 체면까지 지키느라 떠날 때를 늦추는 운명입니다.'];
  if(!present&&has('G5'))
   return ['G5','당신은 소개받은 사람에게 먼저 돌아간 기회를 뒤늦게 공고에서 만나고도 같은 출발선에서 겨룬 것으로 평가받는 운명입니다.'];
  return null;
 }
 // 하나의 분야는 한 제목·한 판정으로 읽는다. 일의 보조 장면이 원래 원인을 덮지 않는다.
 function closingFor(d,key){
  const original=d.closing[0]||d.fates[0]||'';
  if(d.id==='body'&&key==='wear'&&d.ruleKey==='checking')return '당신은 끝낸 일의 걱정으로 쉴 시간을 내주고 그동안 닳은 몸을 돌볼 시간과 돈도 따로 마련하는 운명입니다.';
  if(d.id==='home'&&key==='housing'){
   if(d.ruleKey==='silence')return '당신은 서운한 마음도 꺼내지 못한 채 함께 살 비용과 시간을 맞춰야 해서 관계를 풀 이야기를 자꾸 뒤로 미루는 운명입니다.';
   if(d.ruleKey==='money')return '당신은 돈 때문에 벌어진 다툼을 화해로 끝내고도 함께 살 비용 앞에서 같은 말을 다시 꺼내는 운명입니다.';
  }
  return original;
 }
 function finish(out,R){
  if(out.integration)return out;
  out.integration={sources:[],version:2};
  for(const d of out.domains){
   const key=thread(d,out),t=key&&THREADS[d.id][key];
   const originals={head:d.head,closing:d.closing.slice(),note:d.note};
   // 출발 지원과 주거·진로 지원의 차이는 해당 장면에서 설명한다.
   if(d.id==='family'&&out.origin.key==='shown'){
    const contexts=[
     ['F5','같은 해에 일을 시작한 친구','생활과 배움을 받쳐 준 도움과 따로 살 집까지 마련해 주는 도움은 크기가 다릅니다.'],
     ['F6','부모가 하던 일은','배울 돈을 받았다는 사실과 내가 택할 분야의 길을 먼저 가 본 사람이 곁에 있다는 사실은 따로 셉니다.']
    ];
    for(const [id,start,context] of contexts)if(d.poolIds.includes(id)){
     const i=d.paragraphs.findIndex(x=>x.startsWith(start));
     if(i>=0)d.paragraphs[i]=context+' '+d.paragraphs[i];
    }
   }
   // 이사 비용을 두 번째 운명 판정으로 붙이지 않고 실제 지출 문단에 포함한다.
   if(d.id==='money'&&d.relocationCost&&d.closing.length>1){
    const text='일을 따라 옮길 때마다 이사비와 주거비가 먼저 나갑니다. 옮겨서 더 벌 돈도 벌기 전에 쓸 곳부터 정해집니다.';
    const i=d.poolIds.indexOf('M6');
    if(i<0)d.paragraphs.splice(Math.max(0,d.paragraphs.length-1),0,text);
   }
   const help=d.id==='gwiin'?helperClosing(d,out):null;
   const closing=help?help[1]:closingFor(d,key);
   d.closing=closing?[closing]:[];
   // 항목 목록은 첫 장면을 짧게 짚는다. 탈락한 후보의 주제를 다시 늘어놓지 않는다.
   if(d.note){
    const values=[...new Set(d.note.value.split(/\s*·\s*/).filter(Boolean))];
    d.note={label:d.note.label,value:values.slice(0,3).join(' · ')};
   }
   if(d.id==='money'&&d.poolIds.includes('M6')&&d.note)
    d.note.value=d.note.value.split(' · ').slice(0,2).concat('이사비와 주거비').join(' · ');
   d.integration={key,sourceIds:d.poolIds.slice(),astrologyIds:(d.westernAddedIds||[]).slice(),originalHead:originals.head,originalClosing:originals.closing,originalNote:originals.note,summary:closing,closingSourceId:help?help[0]:null};
   out.integration.sources.push({domain:d.id,key,poolIds:d.poolIds.slice()});
  }
  // ClosingReading이 이미 선택된 사주·별자리 문단을 한 생활 흐름으로 엮었다.
  // 여기에 별도 분야의 판정이나 같은 뜻의 연결 문장을 다시 삽입하지 않는다.
  return out;
 }
 return {resolve,choose,finish,normalize,THREADS};
});
