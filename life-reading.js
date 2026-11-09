/* 생활 장면의 편집. 나이와 성별은 실제 취업·혼인·출산 이력이 아니다.
 * 원국의 원인은 보존하고 현재 읽을 장면과 조건·시제를 고른다. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();else root.LifeReading=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const FAMILY={
  learning:{head:'하고 싶은 것을 말하기 전에 값을 알아봅니다.',
   scene:'해 보고 싶은 것이 생기면 배우는 곳보다 비용부터 찾아봅니다. 집에 말을 꺼내기 전에 더 싼 방법을 골라 놓습니다. 끝내 꺼내지 않은 이야기는 하고 싶지 않았던 일로 남습니다.',
   rule:'같은 기회를 골랐다고 같은 준비를 한 것은 아닙니다. 준비할 형편까지 갖추는 일도 준비에 드는 법입니다.',
   fate:'당신은 배워 보고 싶다는 말을 꺼내기 전에 집에서 감당할 값을 먼저 고르는 운명입니다.',note:['배움보다 먼저 살피는 것','수강료','준비물','부탁할 때의 형편'],
   summary:['새로 배울 것을 고를 때에도 집에서 치를 값부터 셉니다.','하고 싶다는 마음만으로 준비할 값을 덜어 줄 수는 없으니 그 차이는 배우려는 사람이 메워야 합니다.']},
  expectations:{head:'도움을 받는 동안 선택에도 허락이 붙습니다.',
   scene:'집에서 준비할 돈을 보태 주면 그 돈으로 어느 길을 갈지도 함께 묻습니다. 다른 길을 골라 보고 싶다는 말에는 지금까지 들인 돈 이야기가 돌아옵니다. 고를 수 있었던 길은 많아도 고른 뒤 설명할 사람은 당신입니다.',
   rule:'도와준 사람이 기대한 쓰임을 묻는 것은 당연합니다. 받은 것은 내 것이 되어도 받은 뜻까지 마음대로 바꿀 수는 없습니다.',
   fate:'당신은 집에서 받은 도움을 자기 선택의 근거로 삼으려다가 집안의 기대를 증명하는 데 쓰는 운명입니다.',note:['지원과 함께 따라오는 것','권하는 진로','그동안 들인 돈','선택을 설명할 의무'],
   summary:['집에서 보태 준 돈도 기대한 길을 가는 데 써야 말이 적습니다.','받은 덕에 고를 수 있었다면 고른 길이 받은 뜻에 맞는지도 보이는 것이 도리입니다.']},
  boundaries:{head:'먼저 해 준 일이 다음에도 당신 몫이 됩니다.',
   scene:'집안에 처리할 일이 생기면 지난번에 알아본 사람에게 다시 연락합니다. 한 번 해 봤으니 이번에는 쉽겠다는 말도 붙습니다. 서류를 찾고 전화를 돌린 시간은 따로 세지 않고 다음에 또 물어볼 사람의 이름만 남습니다.',
   rule:'집안일에 매번 품삯을 매길 수는 없습니다. 잘 아는 사람이 맡으면 모두의 수고가 줄어드니 당신에게 더 남는 품은 가족을 위한 몫으로 셉니다.',
   fate:'당신은 집안을 위해 한 번 알아본 일 덕분에 그다음에도 알아볼 사람으로 남는 운명입니다.',note:['먼저 알아본 뒤 돌아오는 것','집안의 문의','서류와 일정','다음 부탁'],
   summary:['집안에서는 한 번 처리해 준 일을 다음에도 당신에게 먼저 묻습니다.','잘 아는 사람이 맡아 덜어 준 품은 집안의 몫이니 당신에게 남은 수고까지 따로 셀 수는 없습니다.']},
  later:{head:'뒤로 미뤄 둔 내 몫은 저절로 마련되지 않습니다.',
   scene:'집안에 큰돈을 쓸 일이 생기면 나중에 나를 위해 남길 돈부터 다시 셉니다. 당장 급한 쪽에 보태고 나면 내 생활은 조금 더 아끼면 된다고 생각합니다. 다음에 돈이 필요할 때에도 지금 미룬 몫은 그대로 남아 있습니다.',
   rule:'가족을 위해 썼어도 쓴 돈은 남은 재산에 들지 않습니다. 나중을 미룬 뜻이 좋았다는 이유로 나중에 치를 값까지 줄지는 않습니다.',
   fate:'당신은 집안의 급한 일을 넘길 때마다 뒤로 미룬 자기 생활을 남은 돈으로 다시 맞추는 운명입니다.',note:['집안의 지출 뒤에 남는 것','앞으로의 생활비','몸을 돌볼 비용','다시 채울 여유'],
   summary:['집안에 보탤 일이 생기면 나중의 자기 생활을 위해 남길 돈부터 줄입니다.','가족에게 보탠 몫은 쓴 돈으로 남으니 당신이 뒤로 미룬 생활은 남은 돈에 맞춰야 합니다.']}
 };
 const bodyCost={
  checking:['잠을 줄인 다음 날에도 일정은 그대로입니다.','눈을 감고 있던 시간을 빼고 나면 실제로 잔 시간은 짧습니다. 아침 약속은 어제 잠든 때를 기다려 주지 않습니다. 평소만큼 해내려고 서두르면 밥을 먹을 틈부터 줄어듭니다.','늦게 놓은 걱정 때문에 줄어든 잠도 남에게는 제때 자지 않은 잠입니다. 몸을 돌볼 때까지 따로 정해 두지 못한 사정은 일정을 잡은 사람이 헤아릴 몫이 아닙니다.','당신은 마음을 놓지 못해 줄어든 잠을 다음 날의 끼니와 쉴 틈으로 메우는 운명입니다.'],
  self:['비워 둔 날에도 몸을 돌볼 차례는 늦습니다.','쉴 날에 미뤄 둔 일을 하나씩 마치면 식사 때가 지나 있습니다. 잠깐 앉아서 먹고 나면 곧 다음 약속에 나갈 시간입니다. 할 일은 줄었는데 몸이 쉬었다고 할 만한 때는 남지 않습니다.','스스로 채운 일정에는 덜어 달라고 할 사람이 없습니다. 제 뜻으로 맡은 일을 마쳤다면 그 사이 빠진 끼니와 휴식도 제 뜻으로 마련할 몫입니다.','당신은 비워 둔 시간을 스스로 채우고 그 틈에서 몸을 돌볼 때를 다시 찾는 운명입니다.'],
  night:['늦어진 잠은 다음 날의 시간을 먼저 씁니다.','늦게 잠든 다음 날에는 몸이 풀릴 무렵 벌써 하루의 반이 지나 있습니다. 밀린 일을 맞추려고 움직이면 제때 먹을 끼니부터 건너뜁니다. 일정을 끝낸 뒤에야 졸음이 돌아옵니다.','남들과 같은 때 시작하려면 모자란 잠은 당신이 견뎌야 합니다. 밤에 끝낸 일이 많았다는 사정으로 아침의 몫까지 덜어 주지는 않습니다.','당신은 늦게 끝낸 일의 값을 다음 날의 잠과 끼니에서 먼저 치르는 운명입니다.']
 };
 function setLead(d,copy){
  d.originalPresentation={head:d.head,fates:d.fates.slice(),note:d.note};
  Object.assign(d,{head:copy.head,detail:copy.scene,rule:copy.rule,fates:[copy.fate],lead:[copy.scene,copy.rule],summary:copy.summary});
  d.note={label:copy.note[0],value:copy.note.slice(1).join(' · ')};
 }
 function prepare(out,R){
  if(!Number.isFinite(out.age))return;
  const a=R.reading.a,age=out.age,ds=Object.fromEntries(out.domains.map(d=>[d.id,d]));
  const hi=f=>['strong','excess'].includes(a.families[f].level),low=f=>['weak','absent'].includes(a.families[f].level);
  const fail=id=>(a.structure.failure||[]).some(x=>x.id===id),f=ds.family,original=f.cause;
  const hour=R.reading.P[3],known=!!(hour&&hour.known),childWindow=age>=26&&age<50;
  const childOutput=known&&out.familySignals&&out.familySignals.hourOutput;
  const W=R.western&&R.western.available?R.western:null;
  const familyAspects=(W&&W.aspects||[]).filter(x=>((x.a==='Moon'&&x.b==='Saturn')||(x.b==='Moon'&&x.a==='Saturn'))&&[0,90,180].includes(x.angle));
  const familyHouses=(W&&W.planets||[]).filter(x=>x.id==='Saturn'&&x.house===4);
  const familyPressure=familyAspects.length+familyHouses.length>0;
  const workload=['officer_overload','killer_unchecked','weak_officer','wealth_weak_self','month_day_clash','weak_wealth'].includes(ds.work.cause);
  let key,reason;
  if(age<19){key=out.origin.key==='shown'?'expectations':'learning';reason='age:learning';}
  else if(childWindow&&R.input.male===false&&childOutput&&hi('식상')&&fail('hurt_officer')){key='cut';reason='child-hour:output:authority-conflict';}
  else if(childWindow&&childOutput&&hi('식상')&&workload&&(hi('관성')||familyPressure)){key='care';reason='child-hour:output:workload:family-pressure';}
  else if(age>=55){key=hi('비겁')?'boundaries':'later';reason=hi('비겁')?'peer:shared-family-work':'age:later-costs';}
  else if(out.origin.key==='shown'&&hi('인성')){key='expectations';reason='origin-support:resource';}
  else if(age<30){key='young';reason='age:independence';}
  else if((hi('인성')||familyPressure)&&low('재성')){key='old';reason=familyPressure?'family-pressure:limited-money':'resource:limited-money';}
  else if(age>=30&&age<55&&known&&out.familySignals.hourWealth&&['grow','reserve'].includes(ds.money.cause)){key='shown';reason='child-hour:wealth:reserved-money';}
  else if(age>=30&&childOutput&&hi('식상')&&(low('재성')||['poor','comfort'].includes(ds.money.cause))){key=out.origin.key==='absent'?'absentPoor':'absent';reason='child-hour:output:limited-inheritance';}
  else {key='boundaries';reason=hi('비겁')?'peer:shared-family-work':'family:repeated-obligation';}
  f.familySelection={originalCause:original,age,knownHour:known,reason,westernEvidence:[...familyAspects,...familyHouses]};f.cause=key;f.lifeSelected=true;f.followupDisabled=true;
  if(FAMILY[key])setLead(f,FAMILY[key]);
  else {
   // 기존의 조건부 원고를 재사용한다. 선택할 수 있는 원고는 index에서 함께 넘긴다.
   const copy=out.familyCopies&&out.familyCopies[key];
   if(copy)setLead(f,copy);
  }
  if(key==='young'){
   f.lead[0]='따로 살 집을 알아보면 지금 모을 수 있는 돈으로 몇 달이 걸릴지부터 셉니다. 그만큼 모으고 다시 찾아보면 보증금도 올라 있습니다. 먼저 나간 사람에게는 집을 고른 기억이 남고 당신에게는 더 모아야 할 날짜가 남습니다.';
   if(out.origin.key==='shown')f.lead[0]='집에서 독립할 돈을 보태 준다 해도 어디서 어떻게 살지는 함께 의논해야 합니다. 혼자 고르려던 집에 가족이 정한 조건이 하나씩 붙습니다. 그 조건을 벗어나려면 받은 도움을 빼고 비용을 다시 셉니다.';
   if(out.origin.key==='shown'){
    f.lead[1]='보태 준 사람이 돈의 쓰임을 확인하는 것은 당연합니다. 제 뜻대로 살 여유는 제 몫으로 마련한 뒤에 누리는 것이 순서입니다.';
    f.fates=['당신은 집에서 보태 준 돈으로 독립할 때에도 집안이 정한 조건을 함께 가져가는 운명입니다.'];
    f.summary=['독립할 집을 고르는 일에도 집에서 보태 준 돈의 조건이 따라옵니다.','도움을 받아 시작했다면 도와준 사람이 정한 쓰임도 지키는 것이 도리입니다.'];
   }
  }
  if(key==='old'){
   f.lead[0]='부모님 생활이나 치료에 보탤 일이 생기면 자기 생활비에서 먼저 나눕니다. 한 번으로 끝나지 않는 지출은 다음 달에도 같은 날 돌아옵니다. 내 노후에 모을 돈은 급한 일이 끝난 뒤로 잡지만 그 날짜는 자꾸 바뀝니다.';
   f.lead[1]='부모를 돕느라 미뤘어도 자신의 노후는 자신의 몫입니다. 받은 것을 돌려드리는 일과 나중에 쓸 것을 마련하는 일은 따로 셉니다.';
   f.fates=['당신은 부모에게 보탤 일이 생기면 자기 노후의 준비부터 늦추는 운명입니다.'];
   f.summary=['부모에게 보탤 일이 생기면 자기 노후를 위해 남길 돈부터 줄입니다.','부양할 몫을 먼저 치렀어도 자신의 노후는 남은 날에 마련하는 것이 순서입니다.'];
  }
  f.detail=f.lead[0];f.rule=f.lead[1];
  out.life={stage:age<19?'youth':age>=55?'later':'adult',familyReason:reason};
  // 공통 원인을 지우지 않고 몸 칸에서는 같은 행동 대신 잃어버린 휴식을 보여 준다.
  const checking=['checking','weak_officer','owl_food','resource_blocks_output'].includes(out.core.cause)||['weak_officer','owl_food','관성'].includes(ds.work.cause);
  const self=['diligence','peer_unchecked','strong_peer','self','outlet'].includes(out.core.cause)||['peer_unchecked','비겁','self','outlet'].includes(ds.work.cause);
  const night=['rhythm','climate'].includes(out.core.cause)||['climate_cold','climate_hot'].includes(ds.work.cause);
  if((ds.body.ruleKey==='checking'&&checking)||(ds.body.ruleKey==='self'&&self)||(ds.body.ruleKey==='night'&&night)){
   const [head,scene,rule,fate]=bodyCost[ds.body.ruleKey];
   setLead(ds.body,{head,scene,rule,fate,note:['몸에서 먼저 내주는 몫','모자란 잠','제때 먹을 끼니','회복할 시간']});
   ds.body.sceneRole='cost';ds.body.followupDisabled=true;
  }
  const follow=WORK_FOLLOW_CORE[ds.work.cause];
  if(follow&&out.core.cause===ds.work.cause){
   const [head,scene,rule,fate]=follow;
   setLead(ds.work,{head,scene,rule,fate,note:ds.work.note?[ds.work.note.label,...ds.work.note.value.split(' · ')]:['일에 남는 몫','다시 설명할 시간']});
   ds.work.sceneRole='consequence';
  }
  if(age>=19&&ds.work.cause==='wealth_breaks_resource'&&ds.money.cause==='interrupted'){
   setLead(ds.money,{head:'멈춘 준비에도 낸 돈은 돌아오지 않습니다.',
    scene:'일하러 가느라 듣지 못한 강의의 수강 기한이 끝납니다. 남겨 둔 교재를 다시 펴면 시험 범위가 달라져 있습니다. 전에는 배울 준비를 하느라 돈을 냈고 이제는 멈춰 있던 동안 바뀐 것을 따라잡으려고 돈을 냅니다.',
    rule:'파는 쪽은 약속한 동안 강의를 열어 두었습니다. 그동안 생계를 먼저 꾸려야 했다는 사정까지 낸 값에 들어 있지는 않습니다. 다시 배울 때의 준비는 다시 배우는 사람이 마련하는 법입니다.',
    fate:'당신은 생계를 위해 멈춘 준비로 돌아갈 때마다 이미 치른 값 위에 다시 시작할 값을 더 내는 운명입니다.',
    note:['준비를 멈춘 뒤에도 드는 돈','지나간 수강 기간','바뀐 교재','다시 낼 응시료']});
   ds.money.omitFollowups=['M3'];ds.money.sceneRole='sunk-cost';
   ds.money.fates.push(...ds.money.originalPresentation.fates.slice(1));
  }
  if(age<19)youth(out,ds);
  delete out.familyCopies;
 }
 const WORK_FOLLOW_CORE={
  weak_officer:['끝냈다는 말 뒤에도 답할 사람이 남습니다.','문제없이 끝냈다고 보고한 뒤에도 확인해 달라는 질문은 당신에게 옵니다. 빠뜨린 것이 있을까 봐 기록을 다시 꺼내 대답합니다. 끝난 일의 담당자라는 이유는 다음 질문에서도 사라지지 않습니다.','맡은 일을 가장 잘 아는 사람에게 묻는 것이 빠릅니다. 이미 끝냈다는 사정으로 아는 것을 설명할 몫까지 끝나는 것은 아닙니다.','당신은 일을 끝낸 뒤에도 그 일을 아는 사람으로 남아 답할 시간을 계속 내는 운명입니다.'],
  owl_food:['고쳐 낸 수고는 늦은 날짜에 가려집니다.','마지막 손질까지 마치고 내놓으면 왜 이제 왔느냐는 말을 먼저 듣습니다. 고친 부분을 설명할수록 처음부터 그렇게 했으면 됐다는 답이 돌아옵니다. 더 나아진 결과에도 늦어진 날짜는 그대로 붙습니다.','제대로 내는 일과 제때 내는 일은 따로 셉니다. 하나를 더 잘하려고 다른 하나를 넘긴 사정은 맡은 사람이 설명할 몫입니다.','당신은 고쳐서 나아진 것보다 고치느라 늦어진 날짜를 먼저 설명하는 운명입니다.'],
  resource_blocks_output:['준비한 사이에 열린 차례가 지나갑니다.','부족한 것을 하나 더 갖추고 공고를 다시 열면 접수는 끝나 있습니다. 다음 기회에는 기준이 조금 달라져 있습니다. 준비한 것이 사라진 것은 아니지만 지금 내놓을 곳은 또 찾아야 합니다.','기한은 준비가 끝난 사람을 받는 날입니다. 아직 갖출 것이 남은 사람에게 다음 기회를 기다리게 하는 것은 공평한 일입니다.','당신은 시작할 준비를 더 갖추는 동안 그 준비를 내놓을 차례를 다시 기다리는 운명입니다.'],
  peer_unchecked:['고쳐 준 뒤에는 마지막 책임도 넘어옵니다.','남에게 맡긴 것을 다시 고쳐 내면 마지막 파일에 당신 이름이 남습니다. 처음 맡았던 사람은 당신이 바꾼 부분부터 물어봅니다. 다음에 같은 일이 오면 어디까지 누구에게 맡겼는지보다 누가 끝냈는지가 먼저 기억납니다.','제 손으로 끝내겠다고 가져온 일은 끝낸 사람이 가장 잘 압니다. 마지막까지 고른 사람에게 다음 설명도 맡기는 것이 순서입니다.','당신은 남이 맡았던 일을 고쳐 끝낸 뒤 그 일의 마지막 책임까지 받는 운명입니다.']
 };
 const YOUTH_WORK={
  checking:['다 끝낸 뒤에야 고칠 곳이 보입니다.','다 했다고 내놓기 전에 한 번 더 읽습니다. 고칠 곳을 찾으면 그 앞부분도 다시 봅니다. 남들은 다음 것을 시작했는데 당신에게는 끝낸 것을 마칠 시간이 더 필요합니다.','제출할 때까지 고친 것은 모두 준비한 시간으로 셉니다. 실수하지 않으려고 더 쓴 시간을 결과 옆에 따로 적어 주지는 않습니다.','끝낸 것을 다시 살피느라 다음에 할 일을 시작할 때가 늦어집니다.'],
  voice:['방법을 말하면 그 일을 맡게 됩니다.','함께할 일을 정할 때 방법을 먼저 말합니다. 다들 괜찮다고 하면 설명한 사람이 직접 해 보게 됩니다. 생각해 둔 방법은 있어도 그 일에 쓸 시간은 따로 받지 못합니다.','해 볼 수 있다고 말한 사람에게 맡기는 것이 순서입니다. 말을 꺼내지 않은 사람까지 같은 몫을 낼 이유는 없습니다.','방법을 말한 뒤에는 그 방법을 끝까지 해낼 몫도 맡습니다.'],
  support:['준비한 만큼 곧바로 인정받지는 못합니다.','배워 둔 것을 보여 주려고 하면 직접 해 본 것을 묻습니다. 해 볼 기회를 구하면 먼저 잘하는 사람을 찾습니다. 더 준비해서 다시 오라는 말은 어느 쪽에서도 들을 수 있습니다.','배웠다는 것은 배울 때의 기록입니다. 맡길 만하다는 판단은 맡기는 사람이 내리니 준비한 사정만으로 차례를 앞당길 수는 없습니다.','준비한 것을 보여 주려다가 먼저 해 본 결과를 요구받습니다.'],
  burden:['정해진 몫을 맞추면 다음 몫이 옵니다.','기한에 맞춰 끝내고 나면 아직 손대지 못한 일을 도와달라는 말이 옵니다. 빨리 끝냈다는 이유로 남은 시간이 있는 사람이 됩니다. 다음에도 맞춰 내면 원래 그만큼 할 수 있었던 것으로 셉니다.','잘 끝낸 사람에게 맡기면 모두가 안심합니다. 그 안심을 만든 사람이 한 번 더 수고하는 것은 믿음을 받은 몫입니다.','맡은 것을 제때 끝낸 덕분에 남은 몫까지 부탁받습니다.'],
  shared:['함께 시작한 일도 끝에는 혼자 남습니다.','나누어 하던 일이 마음에 들지 않으면 직접 고칩니다. 다시 설명할 시간에 끝내는 편이 빠릅니다. 다음에 비슷한 일이 생기면 사람들은 당신이 손댈 때를 기다립니다.','같이 하자고 한 뒤에도 제 손으로 고쳤다면 마지막 모양은 고른 사람의 몫입니다. 남에게 맡기지 못한 사정까지 나누어 질 수는 없습니다.','남에게 맡긴 것을 직접 고치다가 다음에도 혼자 마칠 사람으로 남습니다.'],
  change:['함께할 사람이 바뀌면 처음부터 맞춥니다.','익숙해질 무렵 함께할 사람이나 정해진 방식이 바뀝니다. 앞에서 잘하던 방법을 설명해도 여기서는 이렇게 한다는 답이 돌아옵니다. 다시 익히는 동안에도 끝낼 날짜는 같습니다.','전에 해 본 것은 전의 방식으로 해 본 일입니다. 새로 정한 기준에 맞추는 시간은 새로 들어온 사람이 내는 법입니다.','익힌 방식이 있어도 함께할 조건이 바뀌면 처음부터 맞춥니다.']
 };
 function youth(out,ds){
  const w=ds.work,k=w.cause;
  const group=/checking|weak_officer|owl_food|resource_blocks_output|관성/.test(k)?'checking':/hurt_officer|speech|식상/.test(k)?'voice':/palace|clash/.test(k)?'change':/peer|self|비겁/.test(k)?'shared':/인성|backing|skill/.test(k)?'support':'burden';
  const [head,scene,rule,line]=YOUTH_WORK[group];
  const fate={checking:'끝낸 것을 다시 살피느라 다음 일을 시작할 시간을 먼저 쓰는',voice:'방법을 꺼낸 말 때문에 그 방법을 끝낼 몫까지 맡는',support:'준비한 것을 보여 주려다가 먼저 해 본 결과를 요구받는',burden:'제때 끝낸 덕분에 남은 몫까지 맡는',shared:'남에게 맡긴 것을 직접 고치다가 다음에도 혼자 마치는',change:'익힌 방식이 있어도 조건이 바뀌면 처음부터 맞추는'}[group];
  setLead(w,{head,scene,rule,fate:'당신은 '+fate+' 운명입니다.',summary:line,note:['맡은 일에서 먼저 쓰는 것','준비할 시간','다시 맞출 품']});
  if(out.age>=13&&out.portrait.length>2)out.portrait[2]={
   checking:'대충 알겠다는 생각으로 끝내기보다 스스로 납득해야 손을 놓는 편입니다.',
   voice:'남들이 그냥 넘기는 불편을 먼저 알아차립니다. 말하지 않은 채 두는 쪽이 더 신경 쓰입니다.',
   support:'무작정 시작하기보다 먼저 익혀 두어야 마음이 놓입니다. 모른 채 나서는 모습을 쉽게 보이고 싶지 않습니다.',
   burden:'주변에서 믿고 맡기면 어렵다는 말보다 해낼 방법부터 찾습니다.',
   shared:'다른 사람에게 맡겼어도 마음속에서는 자기 기준으로 맞춰 보고 있습니다.',
   change:'낯선 곳에서는 사람들이 움직이는 순서부터 살핍니다. 익숙해지고 나서야 자기 방식을 드러냅니다.'
  }[group];
  // 전업·수입·결혼 여부를 모르는 나이에 이미 직장인인 장면을 붙이지 않는다.
  const money=ds.money,cause=money.cause;
  const preparation=['paper','interrupted'].includes(cause),share=['share','holding'].includes(cause);
  setLead(money,preparation?{head:'더 준비할수록 필요한 것도 늘어납니다.',scene:'해 보고 싶은 것을 배우다 보면 책이나 도구를 하나 더 갖춰야 합니다. 그것을 마련하고 나면 다음에 필요한 것이 보입니다. 제대로 시작하려고 쓰는 돈은 시작하는 날보다 먼저 나갑니다.',rule:'준비물은 쓰기 전에 값을 치르는 법입니다. 열심히 해 보겠다는 뜻까지 미리 값으로 받아 주지는 않습니다.',fate:'당신은 잘해 볼 준비를 갖추는 동안 다음에 갖출 것의 값을 다시 세는 운명입니다.',summary:'더 잘할 준비에도 먼저 치를 값이 붙습니다.',note:['시작 전에 필요한 것','배울 비용','준비물','다음 도구']}:
   share?{head:'가까운 사이에서 쓴 돈은 돌려달라기 어렵습니다.',scene:'같이 쓰거나 같이 먹은 것의 작은 값을 먼저 냅니다. 얼마 되지 않으니 다음에 받자고 넘깁니다. 다시 같은 일이 생겨도 지난번 이야기를 꺼내는 쪽이 계산적인 사람이 될 것 같습니다.',rule:'먼저 내겠다고 한 돈은 그때의 뜻으로 받습니다. 가까운 사이를 지키려던 사정까지 나중 셈에 더할 수는 없습니다.',fate:'당신은 가까운 사이를 지키려고 넘긴 작은 값을 혼자 기억하는 운명입니다.',summary:'가까운 사이에서 넘긴 값도 당신이 쓸 돈에서는 빠집니다.',note:['그냥 넘긴 뒤 남는 것','먼저 낸 작은 값','미룬 정산']}:
   {head:'쓸 수 있는 돈 안에서 원하는 것을 고릅니다.',scene:'갖고 싶은 것의 값을 보고 나면 이번에 쓸 수 있는 돈을 셉니다. 하나를 고르면 다른 하나를 미룹니다. 남이 둘 다 가진 이유를 몰라도 당신이 고르지 못한 것은 취향의 차이로 보입니다.',rule:'누구에게나 같은 값을 받으니 고를 기회도 같다고 합니다. 그 값이 누구에게는 선택이고 누구에게는 포기가 되는 사정은 파는 사람이 셀 일이 아닙니다.',fate:'당신은 원하는 것을 고르기 전에 포기할 것부터 정하는 운명입니다.',summary:'고를 때에는 원하는 것보다 감당할 값이 먼저 보입니다.',note:['고르기 전에 정하는 것','쓸 수 있는 돈','다음으로 미룰 것']});
  if(money.relocationCost){money.natalRelocationCost=true;money.relocationCost=false;}
  const b=ds.body,body=bodyCost[b.ruleKey]||['다 끝낸 뒤에 쉬려고 하면 쉴 때가 늦습니다.','해야 할 것을 마치고 나면 잠들 시간이 가까워져 있습니다. 잠깐 하고 싶던 것을 꺼내면 내일 일어날 때가 먼저 걱정됩니다. 하루를 맞추고 남은 데서만 몸을 쉬게 합니다.','끝낸 몫이 많아도 하루가 더 길어지지는 않습니다. 몸을 돌볼 시간까지 마련하는 일은 그 몸을 쓰는 사람의 몫입니다.','당신은 할 일을 끝내고 남은 시간으로 몸을 돌보려다 쉬는 때부터 줄이는 운명입니다.'];
  setLead(b,{head:body[0],scene:body[1],rule:body[2],fate:body[3],note:['남은 시간에서 챙기는 것','잠','끼니','쉬는 틈']});
  const h=ds.home;
  if(!['연락은 끊깁니다','대화가 빨리 줄어듭니다','애매하게'].includes(h.cause))setLead(h,{head:'같이 있고 싶은 마음에도 맞출 조건이 있습니다.',scene:'친한 사람이 만나자고 하면 갈 수 있는 시간과 쓸 돈을 함께 셉니다. 이번에는 어렵다고 몇 번 말하고 나면 다음 약속은 당신이 없는 곳에서 먼저 잡힙니다. 같이 있고 싶었던 마음은 거절한 말 뒤에 남습니다.',rule:'마음을 알았어도 매번 한 사람의 형편에 약속을 맞출 수는 없습니다. 함께하지 못한 횟수는 사정이 달라도 같은 횟수로 남습니다.',fate:'당신은 가까이 있고 싶다는 마음을 시간과 돈으로 맞추는 동안 다음 약속에서 멀어지는 운명입니다.',note:['마음과 함께 맞춰야 하는 것','만날 시간','함께 쓸 돈']});
  const g=ds.gwiin;
  setLead(g,g.cause==='present'?{head:'도움을 받으면 고쳐야 할 것도 함께 듣습니다.',scene:'모르는 것을 알려 주는 사람이 생기면 그 사람에게 먼저 묻게 됩니다. 알려 주는 말 끝에는 당신이 바꾸면 좋겠다는 이야기도 따라옵니다. 필요한 답을 듣는 동안에는 듣고 싶지 않은 조언도 끊기 어렵습니다.',rule:'가르쳐 주는 말 가운데 필요한 것만 고르는 태도는 배우는 사람의 도리가 아닙니다. 도움을 받는 동안에는 듣는 품도 내야 합니다.',fate:'당신은 도움을 받으려고 물은 일 밖에서도 고쳐야 할 것을 듣는 운명입니다.',note:['도움과 함께 듣는 것','말투의 지적','다른 선택에 대한 조언']}:
   {head:'처음부터 아는 사람처럼 해야 합니다.',scene:'처음 해 보는 일에서 모르는 것을 물으면 어디까지 모르는지도 설명해야 합니다. 누군가는 집에서 미리 듣고 온 이야기를 당신은 틀린 뒤에 배웁니다. 먼저 배운 사정은 지워지고 잘하는 모습만 남습니다.',rule:'처음 배우는 사람에게 매번 처음부터 알려 줄 수는 없습니다. 남이 이미 아는 것이라면 당신도 알아 올 몫으로 셉니다.',fate:'당신은 처음 배울 것을 찾아 묻는 동안 준비가 덜 된 사람으로 먼저 기억되는 운명입니다.',note:['혼자 알아 와야 하는 것','처음 듣는 규칙','물어볼 사람']});
  const o=ds.office,op=o.cause;
  const speech=['challenge','mixed'].includes(op);
  setLead(o,op==='supported'?{head:'믿고 맡긴 일에는 믿음의 기준도 붙습니다.',scene:'다른 사람의 의견을 정리할 일을 맡으면 누구 말을 먼저 들어야 할지도 함께 배웁니다. 친구의 사정은 알겠지만 정해진 기준을 바꿀 수는 없습니다. 부탁을 받아 전하던 사람이 어느새 어렵다는 답을 전하는 쪽에 서 있습니다.',rule:'믿고 맡겼다면 맡긴 뜻에 맞게 해내는 것이 도리입니다. 다른 사람의 사정을 아는 것과 그 사정을 들어주는 것은 맡은 사람이 나누어 생각할 몫입니다.',fate:'당신은 믿고 맡긴 뜻을 지키려고 가까운 사람에게도 정해진 기준부터 전하는 운명입니다.',note:['믿음을 받으며 지킬 것','맡긴 사람의 기준','친구에게 전할 답']}:speech?{head:'맞는 말에도 꺼낼 순서가 있습니다.',scene:'이유가 맞지 않는 것을 물으면 누구에게 그렇게 말하느냐는 답이 돌아옵니다. 질문의 내용은 그대로인데 먼저 말투를 설명하게 됩니다. 다시 묻기 전에 이번에는 어떻게 말해야 할지부터 고릅니다.',rule:'규칙을 묻는 사람도 규칙 안에서 물어야 합니다. 말이 옳았다는 이유로 말할 순서까지 건너뛸 수는 없습니다.',fate:'당신은 질문에 대한 답을 듣기 전에 질문한 태도부터 인정받아야 하는 운명입니다.',note:['대답보다 먼저 요구하는 것','물어볼 순서','어른 앞에서의 말투']}:
   {head:'정할 때에는 빠져도 지킬 때에는 셉니다.',scene:'함께 지킬 규칙은 이미 정해져 있습니다. 내 사정에 맞지 않는다고 말하면 다른 사람도 지킨다는 답이 옵니다. 정할 때 묻지 않았던 당신의 뜻을 지킬 때에는 태도로 평가합니다.',rule:'모두에게 같은 규칙을 두었으니 각자의 사정까지 다른 값으로 셀 수는 없습니다. 정하는 사람과 지키는 사람은 맡은 일이 다른 법입니다.',fate:'당신은 정할 때 묻지 않았던 뜻까지 지키는 태도로 평가받는 운명입니다.',note:['내 뜻과 별개로 정해지는 것','정해진 순서','같이 적용하는 기준']});
  Object.values(ds).forEach(d=>{d.followupDisabled=true;});
  out.cautions=['정해진 순서를 먼저 익히세요. 몰라서 늦었다는 사정도 먼저 알아 온 사람과 같은 기준으로 셉니다.'];
 }
 function finish(out){
  if(!out.life||out.life.stage!=='youth')return out;
  const adapt=t=>String(t||'').replace(/자녀, 아랫사람, 장기 계획/g,'오래 잡은 계획').replace(/직장·부서·부모와 관련된/g,'함께하는 일과 집안의').replace(/직장, 부서, 업무 계약/g,'맡은 일의 범위와 약속').replace(/직장·부서/g,'맡은 일').replace(/직장의 지시와 규칙/g,'어른이 정한 순서와 규칙').replace(/직장|일터/g,'함께 일하는 곳').replace(/퇴근한 뒤|퇴근 후/g,'일정을 마친 뒤').replace(/퇴근/g,'일정이 끝나는').replace(/근무표/g,'정해진 일정').replace(/업무/g,'맡은 일');
  out.core.title=adapt(out.core.title);out.core.body=out.core.body.map(adapt);out.core.rule=adapt(out.core.rule);out.core.fate=adapt(out.core.fate);
  out.elements=out.elements.map(adapt);
  if(out.opening)for(const key of ['origin','boss','core'])for(const p of out.opening[key]||[])p.text=adapt(p.text);
  const periods=[...out.past,...out.years,...out.years.flatMap(y=>y.months||[]),...out.luck.cycles.map(x=>x.c)];
  for(const p of periods){p.title=adapt(p.title);p.text=adapt(p.text);if(p.narrative){p.narrative.paragraphs=p.narrative.paragraphs.map(adapt);p.narrative.dates.forEach(d=>{d.text=adapt(d.text);});}}
  out.luck.cycles.forEach(x=>{x.stage=adapt(x.stage);});
  return out;
 }
 return {prepare,finish,FAMILY,setLead};
});
