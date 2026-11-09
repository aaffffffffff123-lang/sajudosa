/* 전체 풀이: 이미 화면에 나온 원인들을 하나의 생활 흐름으로 잇는다.
 * 새 사건이나 별자리 전용 결론을 만들지 않는다. 후보마다 실제 본문 근거를
 * 기록하고, 핵심 원인과 겹치는 연결을 고른다. 같은 입력은 같은 결론을 낸다.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.ClosingReading=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const WORK={
    hurt_officer:'더 나은 방법을 찾고도 시킨 방법으로 다시 일을 마칩니다.',
    mixed_officer:'서로 다른 지시를 맞추고도 마지막에는 당신 이름으로 경위를 설명합니다.',
    officer_overload:'잘 끝냈다는 말을 들을 때마다 다음에 맡을 일이 늘어납니다.',
    killer_unchecked:'급한 일을 먼저 살피다가 그 일을 끝낼 사람으로 남습니다.',
    owl_food:'다 만든 것을 다시 고치는 동안 약속한 날짜부터 늦어집니다.',
    wealth_weak_self:'돈 되는 일을 마친 뒤에도 응대와 정산에 남은 기운을 씁니다.',
    peer_robs_wealth:'함께한 일을 끝낸 뒤에야 당신에게 남을 몫이 줄었다는 것을 압니다.',
    wealth_breaks_resource:'준비하던 일을 멈추고 당장 쓸 생활비부터 법니다.',
    resource_blocks_output:'시작할 준비를 하나 더 갖추는 동안 신청할 날짜를 넘깁니다.',
    peer_unchecked:'남에게 맡겼던 일까지 다시 가져와 당신 손으로 끝냅니다.',
    weak_wealth:'남길 돈을 늘리려고 쉬려던 날에도 일을 받습니다.',
    weak_officer:'아무도 다시 보라고 하지 않은 일을 쉬는 시간까지 확인합니다.',
    strong_peer:'빠진 사람 몫을 메워 그 사람이 없어도 일이 끝난다는 것을 보여 줍니다.',
    month_day_clash:'일자리를 따라 옮길 때마다 잠과 약속과 집안일을 다시 맞춥니다.',
    palace_clash:'경력을 쌓아도 일터가 바뀌면 새 규칙부터 익힙니다.',
    palace_punish:'한 번 끝낸 궂은 일 때문에 다음에도 같은 역할로 불립니다.',
    palace_self:'익숙한 방법을 한 번 더 써 보다가 바꿀 시간을 늦춥니다.',
    climate_hot:'오늘 일을 끝내려고 내일 쓸 힘까지 당겨 씁니다.',
    climate_cold:'늦게 손에 붙은 일을 끝내려고 잠들 시간을 뒤로 미룹니다.',
    income:'한 번 이룬 성과를 다음에도 맞춰야 할 목표로 받습니다.',
    skill:'꼬인 일을 풀어낸 뒤에는 남이 망쳐 놓은 일까지 맡습니다.',
    speech:'옳은 말을 꺼내려고 듣는 사람이 요구한 근거와 형식부터 갖춥니다.',
    backing:'받은 도움을 떠올리느라 무리한 부탁 앞에서도 거절할 말을 줄입니다.',
    self:'부탁하고 기다릴 품을 아끼려다 남에게 맡길 일까지 직접 끝냅니다.',
    outlet:'빈 날에 해 볼 일을 꺼내 놓고 그 일을 마치는 데 휴일을 씁니다.',
    order:'할 수 있는 일이 있어도 허락을 기다리며 정해진 순서를 지킵니다.',
    관성:'맡은 일을 잘 끝내고도 빠뜨린 것이 없는지 다시 살핍니다.',
    재성:'돈 될 일을 넘기지 못해 앞의 일이 끝나기 전에 다음 일까지 받습니다.',
    식상:'해 보겠다고 맡은 일을 끝내느라 쉬려던 날까지 씁니다.',
    비겁:'설명할 시간에 직접 끝내다가 일이 몰려도 넘길 사람을 남기지 못합니다.',
    인성:'배우고 준비하는 데 쓴 시간을 경력으로 인정받으려다 먼저 해 본 일을 요구받습니다.'
  };
  const MONEY={
    comfort:'그날을 덜 힘들게 넘기려고 쓴 돈은 다음 일로 메웁니다.',
    outflow:'그렇게 끝낸 일도 낮춰 정한 값과 뒤로 미룬 청구 때문에 바로 생활비가 되지는 않습니다.',
    burden:'그렇게 번 돈이 들어오면 이미 약속한 고정비부터 빠져나갑니다.',
    share:'그렇게 번 돈에서도 가까운 사람에게 대신 낸 몫은 정산하지 못한 채 남습니다.',
    holding:'그렇게 번 돈을 이미 쓴 돈이 아까워 멈추지 못한 곳에 다시 보탭니다.',
    interrupted:'다시 배워서 벌려고 낸 돈을 건지기 전에 생활비를 벌 시간이 돌아옵니다.',
    paper:'그렇게 번 돈으로 더 잘 벌 준비를 갖추고 부족한 것을 사려고 다시 법니다.',
    reserve:'그렇게 들어올 돈에도 먼저 치를 생활비의 이름이 붙어 있습니다.',
    recurring:'그렇게 번 돈에서 작아서 넘겼던 지출이 거듭 빠져나갑니다.',
    poor:'그렇게 번 돈도 이번 달을 넘기는 데 쓰고 다음 달은 다시 벌어 시작합니다.',
    grow:'더 벌게 된 돈은 그동안 미뤄 둔 지출과 넓어진 생활에 먼저 쓰입니다.'
  };
  const FAMILY={
    absentPoor:['아이를 낳으면 그렇게 생활을 지탱하는 데 쓴 돈은 아이에게 남지 않습니다.','부모가 맨손으로 시작했다는 사정으로 자식이 마련할 몫을 덜어 줄 수는 없습니다.'],
    absent:['아이를 낳으면 그렇게 당신의 생활을 이어 가는 동안 아이에게 남길 몫은 뒤로 밀립니다.','자식에게 물려줄 것은 부모가 쓰고 남긴 돈이니 당신이 얼마나 애썼는지는 셈에 들지 않습니다.'],
    shown:['아이를 키우게 되면 교육비와 독립할 돈을 보탠 뒤에야 당신의 노후를 셉니다.','자식이 제때 시작할 몫을 먼저 냈으니 늦어진 준비는 당신의 남은 날로 메워야 합니다.'],
    old:['부모의 노후에 보탤 돈까지 내고 나면 당신의 노후는 다시 뒤로 밀립니다.','부양할 차례가 먼저 왔으니 늦어진 준비는 당신의 남은 날로 메우는 것이 순서입니다.'],
    young:['따로 살 돈을 모으는 동안 나가 살 집의 값도 다시 계산합니다.','독립할 뜻이 얼마나 오래되었든 집은 값을 마련한 날부터 내어 주는 법입니다.'],
    care:['아이를 낳고 일을 이어 가면 일이 끝난 뒤에도 돌봄이 남습니다.','같은 하루에서 둘을 해냈어도 일터와 집에서는 제 몫 하나씩 한 것으로 셉니다.'],
    cut:['아이를 돌보려고 일을 비우면 그동안 이어 온 경력도 끊깁니다.','돌봄에 쓴 날은 일한 날에서 빠지니 돌아갈 일자리도 새로 구하는 것이 순서입니다.']
  };
  const BODY={
    checking:'마음을 놓으려고 끝난 일을 다시 살피는 동안 쉴 시간도 줄어듭니다.',
    self:'빈 시간을 다시 일로 채워 몸을 돌볼 때를 뒤로 미룹니다.',
    night:'늦게 끝낸 일 때문에 잠을 뒤로 미루고 다음 일정을 맞춥니다.',
    weak:'몸을 돌보려면 치료할 돈과 쉬는 동안 쓸 생활비를 함께 마련해야 합니다.',
    strong:'아직 버틸 만한 몸은 그만큼 더 쓰이고 쉬는 순서는 뒤로 갑니다.'
  };
  function compose(out,R){
    if(!out.verdictFrame)return out;
    const d=Object.fromEntries(out.domains.map(x=>[x.id,x])),key=id=>d[id]&&d[id].cause;
    const w=key('work'),m=key('money'),f=key('family'),o=key('office'),h=key('home');
    const has=(id,poolId)=>!!d[id]&&(d[id].poolIds||[]).includes(poolId);
    const ref=(domain,poolId)=>poolId?{domain,poolId}:{domain,cause:key(domain)};
    const work=WORK[w],family=FAMILY[f],body=BODY[d.body&&d.body.ruleKey];
    // Every production cause has copy. Partial fixtures and a missing external script
    // retain the existing complete verdict rather than producing undefined fragments.
    if(!work||!MONEY[m]||!family||!body)return out;
    const candidates=[];
    function add(id,priority,refs,sentences){
      // Presence in the displayed pool is the only way an extra paragraph enters the conclusion.
      if(refs.some(x=>x.poolId&&!has(x.domain,x.poolId)))return;
      const domains=new Set(refs.map(x=>x.domain));
      const coreMatch=refs.some(x=>x.cause===out.core.cause);
      candidates.push({id,score:priority+(coreMatch?2:0),refs,domains:[...domains],sentences});
    }
    const start='당신은 '+work;
    // The basic life cycle itself connects work -> spent income -> the next dependent.
    add('living',0,[ref('work'),ref('money'),ref('family')],[start,MONEY[m],...family]);
    if(m==='comfort')add('spent-rest',5,[ref('work'),ref('money'),ref('family')],[start,MONEY[m],...family]);
    if(['interrupted','paper'].includes(m)||w==='wealth_breaks_resource'){
      const paid=['interrupted','paper'].includes(m);
      const origins={
        absent:'당신은 집에서 받을 생활비가 없어 더 배울 때도 당장 벌 일을 먼저 잡습니다.',
        hidden:'당신은 집안에 복이 있다는 말을 들어도 배울 동안 쓸 돈은 손에 쥐지 못합니다.',
        shown:'당신은 집에서 받은 밑천을 지키면서 더 잘 벌 준비까지 갖추려 합니다.'
      };
      add('preparation',8,[{domain:'origin',cause:out.origin.key},ref('work'),ref('money'),...(paid&&has('money','M3')?[ref('money','M3')]:[])],[start+' '+origins[out.origin.key].replace(/^당신은 /,''),
        paid?'배움에 돈을 내놓고도 그 돈을 건지기 전에 생활비를 벌러 나갑니다.':'생활비를 벌고 돌아오면 멈춰 둔 준비부터 다시 시작합니다.',
        paid&&has('money','M3')?'일하러 간 날에도 수강 기간은 줄어드니 다음에는 같은 준비에 돈과 시간을 다시 냅니다.':'준비를 마친 사람과 겨루는 날에는 그 사이 벌어야 했던 생활비가 자격에 보태지지 않습니다.',
        '살기 위해 일한 날도 배우지 못한 날로 남으니 갖추지 못한 것은 당신이 마저 갖추는 것이 순서입니다.']);
    }
    if(f==='cut'||f==='care')add('care-and-work',7,[ref('work'),ref('family'),ref('body')],[start,
      f==='cut'?'아이를 낳아 돌볼 시간까지 맞출 수 없으면 일하는 시간을 당신이 비웁니다.':'아이를 낳고 일을 이어 가면 일에 내준 시간 뒤로 돌봄까지 들어오고 몸을 돌볼 때는 다시 밀립니다.',
      f==='cut'?'아이를 돌보느라 비운 동안 경력은 끊기고 돌아갈 일자리는 새로 구해야 합니다.':d.body.ruleKey==='weak'?'몸이 아파 쉬려 해도 치료비와 그동안 쓸 생활비는 그 일에서 마련해야 합니다.':d.body.ruleKey==='checking'?'집에서도 끝낸 일을 놓지 못해 아이를 돌보며 쉬려던 시간까지 일의 걱정을 가져옵니다.':'일터와 집에서 해야 할 일을 모두 끝내고 나서야 쉴 차례가 옵니다.',
      f==='cut'?'집에서는 아이를 돌본 날이어도 일터에서는 일하지 않은 날이니 돌아온 사람에게 처음부터 증명을 받는 것이 순서입니다.':family[1]]);
    if(o==='supported'){
      const aid=key('gwiin')==='present';
      add('keeping-authority',12,[ref('work'),ref('office'),ref(aid?'gwiin':'family')],[start,
        '그 일을 이어 가며 판단할 권한을 얻으면 예전의 당신처럼 사정을 봐달라는 사람을 만나게 됩니다.',
        aid?'당신을 끌어 준 사람의 신임도 지켜야 하니 아래의 사정에는 정해진 기준부터 안내합니다.':family[0]+' 그 몫을 치르는 동안에도 맡은 권한은 지켜야 합니다.',
        '그 기준을 지키는 사람으로 인정받았으니 권한을 얻은 뒤에도 지켜야 믿고 맡긴 뜻에 맞습니다.']);
    }
    if(w==='backing'||has('gwiin','G4')){
      const leaving=has('gwiin','G4');
      add('help-and-debt',9,[ref('work'),ref('gwiin',leaving?'G4':undefined),ref('office')],[start,
        leaving?'더 나은 일터로 가려는 날에도 도와준 사람은 그동안의 은혜부터 셉니다.':'무리한 부탁도 받은 은혜와 함께 들으면 당신 사정부터 내세우기 어렵습니다.',
        o==='hidden'?'그 부탁을 맡아도 정할 권한은 없고 허락을 기다린 경과까지 당신이 설명합니다.':o==='challenge'?'사정을 설명하려고 꺼낸 말도 도움을 받은 사람이 대드는 말로 들립니다.':o==='mixed'?'한 사람의 은혜를 갚으려고 따른 지시도 다른 사람 앞에서는 당신이 설명할 일이 됩니다.':o==='pressure'?'받아들인 부탁에는 기한과 책임이 붙고 무리한 사정은 맡은 당신이 감당합니다.':o==='regular'?'부탁을 받아들일수록 믿을 만한 사람이 되지만 한 번 거절할 때는 그동안의 성실함까지 다시 평가받습니다.':'사정을 알아줄 사람을 찾아도 마지막에는 정해진 조건에 당신을 맞춥니다.',
        '일한 값은 받았으니, 도와준 은혜는 따로 갚아야 합니다.']);
    }
    const moving=['palace_clash','month_day_clash'].includes(w)||has('work','W4');
    if(moving&&d.money.relocationCost)add('moving-cost',9,[ref('work',has('work','W4')?'W4':undefined),ref('money'),ref('family')],[
      start+' 그 일터를 옮기면 쌓은 경력도 새로 증명해야 합니다.',
      '옮겨서 늘어날 돈은 이사비와 주거비로 먼저 나가고 새 생활을 꾸릴 품도 당신이 냅니다.',
      ...family]);
    if(moving&&(h==='생활을 다시 짜는'||h==='생활 시간이 먼저'||has('home','L4')))add('moving-relationships',8,[ref('work',has('work','W4')?'W4':undefined),ref('home',has('home','L4')?'L4':undefined),ref('body')],[
      start+' 일터를 옮기면 그렇게 해낸 일도 새로 증명해야 합니다.',
      d.body.ruleKey==='checking'?'끝낸 일을 다시 살피는 시간까지 내고 나면 가까운 사람과 약속할 틈도 줄어듭니다.':d.body.ruleKey==='night'?'늦게 끝낸 일에 맞춰 잠을 미루면 가까운 사람이 쉬는 때와 당신이 쉬는 때도 어긋납니다.':d.body.ruleKey==='self'?'빈 시간에도 남은 일을 꺼내면 쉬는 날에 만나자던 약속까지 다시 미룹니다.':d.body.ruleKey==='weak'?'몸을 돌볼 날과 그동안 쓸 생활비까지 마련하느라 가까운 사람과 만날 시간도 따로 내야 합니다.':'그 시간에 맞춰 잠과 약속을 밀어 놓으면 가까운 사람과 만날 틈부터 줄어듭니다.',
      has('home','L4')?'일을 지키려고 미룬 만남도 상대에게는 마음이 식은 일로 남습니다.':'일터에 맞춰 낸 시간만큼 가까운 사람은 당신을 더 기다립니다.',
      '일터에서 제때 한 몫과 인연 앞에서 비운 시간은 따로 세는 법이니 한쪽을 지킨 것으로 다른 쪽까지 다한 셈은 되지 않습니다.']);
    if((h==='생활을 합치는 날짜'||has('home','L3'))&&f==='young')add('house-and-start',8,[ref('home',has('home','L3')?'L3':undefined),ref('money'),ref('family')],[
      '당신은 함께 살 사람을 만나고도 집을 마련할 돈부터 기다립니다.',MONEY[m].replace(/^그렇게 /,'일해서 '),
      '모은 돈을 셀 때마다 독립할 비용도 늘고 함께 시작할 날짜는 다시 뒤로 갑니다.',
      '마음을 정한 날부터 집을 내어 줄 수는 없으니 그동안 기다릴 마음까지 두 사람이 마련해야 합니다.']);
    if(m==='share'&&(h==='같은 얘기를'||has('home','L5')||['연락은 끊깁니다','대화가 빨리 줄어듭니다','애매하게'].includes(h)))add('yielding-relationships',7,[ref('money'),ref('home',has('home','L5')?'L5':undefined),ref('family')],[
      '당신은 가까운 사이를 지키려고 대신 낸 돈의 정산을 미루고 서운한 말도 삼킵니다.',
      h==='같은 얘기를'?'돈 문제로 화해해도 다음 달에 같은 셈이 남아 다시 다툽니다.':'상대에게는 지나간 일이 되고 당신에게는 꺼내기 더 어려운 일이 쌓입니다.',
      family[0],
      '먼저 넘겨준 몫은 그때의 뜻으로 받는 법이니 사이를 지키려고 참았다는 사정은 나중 셈에 들지 않습니다.']);
    if(['hidden','mixed','challenge','pressure'].includes(o)&&['hurt_officer','mixed_officer','order','speech'].includes(w)){
      const help=has('gwiin','G2');
      add('responsibility-without-say',8,[ref('work'),ref('office'),ref(help?'gwiin':'body',help?'G2':undefined)],[start,
        o==='hidden'?'그렇게 맞추는 동안에도 결정할 권한은 없고 기다린 시간까지 당신의 책임으로 남습니다.':o==='mixed'?'한쪽의 뜻에 맞춘 결과를 다른 쪽 앞에서 설명하며 당신이 판단한 이유를 다시 댑니다.':'말한 내용보다 정해진 순서를 따랐는지가 먼저 평가에 남습니다.',
        help?'도와준 사람에게 이 사정을 말하려 해도 받은 은혜 때문에 반대할 말부터 고릅니다.':d.body.ruleKey==='weak'?'그 경과를 맞추느라 몸을 써도 아파서 쉴 때의 생활비와 치료비는 당신이 마련합니다.':d.body.ruleKey==='checking'?'허락받아 끝낸 뒤에도 빠뜨린 것이 없는지 당신이 다시 살피느라 쉴 때까지 내줍니다.':'그 절차를 맞추는 데 쓴 품도 당신 몸에서 나가고 몸을 돌볼 때는 일 뒤로 밀립니다.',
        '정하는 사람이 따로 있다는 것은 맡은 사람이 제 몫을 덜 해도 된다는 뜻이 아니니 허락을 받는 품까지 당신 일로 셉니다.']);
    }
    if(['weak_officer','owl_food','관성','peer_unchecked'].includes(w)&&d.body.ruleKey==='checking')add('checking-and-rest',6,[ref('work'),ref('body'),ref('money')],[start,
      '마음을 놓고 쉬려고 한 번 더 확인하지만 끝낼수록 쉬려던 시간이 먼저 끝납니다.',MONEY[m],
      '마음을 놓으려고 더 살핀 것은 당신 뜻이니 그동안 나간 생활비까지 일을 맡긴 사람이 치를 까닭은 없습니다.']);
    if(has('work','W5')&&has('body','B7'))add('unpaid-time',7,[ref('work','W5'),ref('body','B7'),ref('money')],[start,
      '퇴근 뒤 연락까지 받아도 근무표에 남지 않고 몸을 돌볼 시간은 그만큼 줄어듭니다.',MONEY[m],
      '일터에서는 정해진 시간을 다 치렀으니 남은 시간에 몸과 생활을 돌보는 것까지 당신 몫입니다.']);
    if(has('gwiin','G5')&&has('money','learning')&&out.origin.key!=='shown')add('unequal-start',7,[{domain:'origin',cause:out.origin.key},ref('money','learning'),ref('gwiin','G5'),ref('work')],[
      out.origin.key==='absent'?'당신은 생활비부터 벌어야 해서 오래 배울 시간을 따로 마련합니다.':'당신은 집안의 복을 손에 쥐지 못한 채 배울 동안 쓸 돈부터 마련합니다.',
      '그렇게 준비해서 공고를 보고 나서면 먼저 배운 사람과 먼저 소개받은 사람이 같은 기회 앞에 서 있습니다.',
      '당신이 그 앞까지 오는 데 쓴 날도 일과 자격으로 보여 줄 수 있는 만큼만 남습니다.',
      '같은 기준으로 고르는 데 각자 준비한 사정까지 달리 쳐 줄 수는 없으니 늦게 갖춘 몫은 당신이 더 증명해야 합니다.']);
    // No sign-specific bonus or fixed home/work priority. Prefer the strongest connected
    // cause; stable sort resolves equal scores without birth-name or random selection.
    candidates.sort((a,b)=>b.score-a.score);
    const chosen=candidates[0];
    chosen.sentences[0]=chosen.sentences[0].replace(/^당신은/,()=>out.verdictFrame.subject);
    out.verdict=chosen.sentences.join(' ');
    out.verdictEvidence={thread:chosen.id,domains:chosen.domains,sources:chosen.refs};
    return out;
  }
  return {compose};
});
