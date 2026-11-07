/* 추종자의 수군거림: 화면에 실제로 나온 풀이를 차별의 근거로 갖다 붙인다.
 * 부족한 집안의 기회를 개인의 수준으로 깎아내리고, 받은 복은 자기들만 당연하게 여긴다.
 * 한 묶음 = 옆사람의 말 / 앞사람의 답 / 다른 사람의 맞장구. 셋째 말도 같은 처지를 겨눈다.
 * needs의 각 줄은 AND, 한 줄 안의 표지는 OR. 숨긴 문단이나 계산되지 않은 생시는 근거가 아니다.
 * 사주·별자리를 다시 계산하지 않고 v5Reading이 최종 선택한 갈래·문단만 받는다.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.CrowdLines=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const groups=[
    {id:'origin-empty',topic:'origin',needs:[['origin:absent']],lines:[
      ['집에서 해 준 게 없나 봐.','물려받을 복이 없다잖아.','집안은 못 속이지.'],
      ['왜 저렇게 아등바등해?','평생 제 손으로 벌어야 한대.','다들 그렇게 살진 않는데.'],
      ['부모는 뭐 하던 사람이래?','물려줄 게 없는 집이라잖아.','어쩐지 티가 나더라.']
    ]},
    {id:'origin-hidden',topic:'origin',needs:[['origin:hidden']],lines:[
      ['집안은 괜찮다던데?','집안복을 제 몫으론 못 챙긴대.','그것도 능력이지.'],
      ['집에서 좀 받으면 되잖아.','집안복은 있어도 손엔 안 온대.','자기 몫도 못 챙기네.']
    ]},
    {id:'origin-backed',topic:'origin',needs:[['origin:shown']],lines:[
      ['집에서 다 해 줬다며?','집안복은 타고났잖아.','받고도 저러네.'],
      ['제 힘으로 여기까지 왔대?','물려받을 복이 있다잖아.','집안 덕을 제 실력인 줄.'],
      ['더 뭘 해 달라는 거야?','집안복은 챙겨 태어났네.','복에 겨운 거지.']
    ]},
    {id:'home-learning',topic:'learning',needs:[['mark:noStudy']],lines:[
      ['가정교육을 못 받았나?','집에서 배울 복이 없잖아.','보고 배운 게 있어야지.'],
      ['저런 것도 모르나?','집에서 배울 게 없었다잖아.','그 집은 다 저런가 봐.']
    ]},
    {id:'study-stopped',topic:'learning',needs:[['adult'],['money:interrupted','work:wealth_breaks_resource']],lines:[
      ['고졸인가?','벌어먹느라 배울 틈이 없대.','어쩐지 기본이 없더라.'],
      ['공부는 하다 말았나?','배울 때마다 돈에 막힌대.','끝낸 것도 없으면서.']
    ]},
    {id:'study-gap',topic:'learning',needs:[['adult'],['pool:learning'],['origin:absent','origin:hidden']],lines:[
      ['고졸인가?','배울 여유도 집안복이지.','앉혀 놔도 따라오겠어?'],
      ['이런 데는 처음인가 봐.','집에서 배울 틈이 없었다잖아.','기본부터 알려 줘야겠네.']
    ]},
    {id:'study-funded',topic:'learning',needs:[['adult'],['pool:learning'],['origin:shown']],lines:[
      ['그렇게 배워 놓고 저래?','배울 돈은 집에서 댔다잖아.','돈 들인 보람이 없네.']
    ]},
    {id:'small-comfort',topic:'money',needs:[['money:comfort']],lines:[
      ['없다면서 쓸 건 다 쓰네.','쉬려고 쓴 돈을 일로 갚는대.','그러니 돈이 남겠어?'],
      ['형편에 편한 건 알아서.','쉴 돈도 벌어서 메운대.','그럴 돈은 있고?']
    ]},
    {id:'living-only',topic:'money',needs:[['money:poor']],lines:[
      ['모아 놓은 돈도 없나 봐.','먹고살 돈밖에 안 남는대.','벌어서 다 어디 썼대?'],
      ['돈 얘기에 예민하네.','먹고살 돈만 돌고 돈대.','그런 집은 늘 그래.']
    ]},
    {id:'underpaid',topic:'money',needs:[['adult'],['money:outflow']],lines:[
      ['싼 일만 맡나 봐.','일하고도 돈부터 사정한대.','그 값이면 쓸 만하겠네.'],
      ['몸값이 그 정도래?','값 깎아야 일 얻는 팔자래.','비싸게는 누가 쓰겠어.']
    ]},
    {id:'fixed-cost',topic:'money',needs:[['money:burden','money:reserve']],lines:[
      ['통장에 돈은 있나?','들어올 돈도 다 나갈 거래.','없는 거나 마찬가지네.']
    ]},
    {id:'shared-cost',topic:'money',needs:[['money:share']],lines:[
      ['몇 푼 갖고 저러는 거야?','남한테 쓰고 못 돌려받는대.','쓸 때는 좋다고 쓰더니.']
    ]},
    {id:'sunk-cost',topic:'money',needs:[['money:holding']],lines:[
      ['아직도 그걸 붙들고 있어?','쓴 돈 아까워 못 놓는다잖아.','없는 사람이 더 그래.']
    ]},
    {id:'paid-preparation',topic:'learning',needs:[['adult'],['money:paper']],lines:[
      ['자격증만 모으나 봐.','벌 준비에 번 돈을 다 쓴대.','쓸 줄은 알고 사나.']
    ]},
    {id:'small-payments',topic:'money',needs:[['money:recurring']],lines:[
      ['돈이 없다더니 또 쓰네.','푼돈 나가서 못 모은대.','그 정도 셈도 못 하나.']
    ]},
    {id:'higher-spending',topic:'money',needs:[['money:grow']],lines:[
      ['좀 번다고 씀씀이 봐.','재물운이 벌어도 남질 않네.','잠깐 버는 걸 믿더라.']
    ]},
    {id:'debt',topic:'money',needs:[['pool:debt']],lines:[
      ['남의 돈 빌려 쓴다며?','갚을 몫은 쟤한테 남는다잖아.','빌릴 땐 좋았겠지.'],
      ['돈 빌릴 데는 있고?','갚을 몫부터 정해져 있대.','우리한텐 말 안 꺼내겠지.']
    ]},
    {id:'labor',topic:'work',needs:[['adult'],['pool:B6','work:weak_wealth']],lines:[
      ['몸 쓰는 일 하나 봐.','몸 써서 벌 팔자라잖아.','머리 쓰는 건 안 되나 봐.'],
      ['손 봐. 일 많이 했네.','몸 닳도록 일한다잖아.','누군 그런 일도 해야지.']
    ]},
    {id:'extra-work',topic:'work',needs:[['adult'],['pool:W1','work:officer_overload','work:strong_peer','work:self','work:비겁']],lines:[
      ['시키면 다 하나 봐.','끝내면 또 쟤한테 맡긴대.','그럼 계속 시키면 되지.'],
      ['혼자 다 한다고?','일복만 자꾸 붙는다잖아.','그런 사람 하나 있으면 편해.']
    ]},
    {id:'dirty-work',topic:'work',needs:[['adult'],['work:killer_unchecked','work:palace_punish','work:skill']],lines:[
      ['궂은일은 쟤 시키면 되겠네.','궂은일 도맡을 팔자라잖아.','한번 잘하나 보자.']
    ]},
    {id:'uncredited',topic:'work',needs:[['adult'],['pool:W3']],lines:[
      ['자기가 다 했다고?','이름은 윗사람한테 간대.','시키는 대로 한 거면서.']
    ]},
    {id:'moving-work',topic:'work',needs:[['adult'],['pool:W4','work:palace_clash','work:month_day_clash']],lines:[
      ['한곳에 못 붙어 있나?','옮길 때마다 다시 배운대.','경력은 뭘로 쳐 달래.'],
      ['해 봤다는 데만 많네.','가면 또 처음부터 증명한대.','제대로 배운 덴 있고?']
    ]},
    {id:'preparation',topic:'learning',needs:[['adult'],['work:인성','work:resource_blocks_output']],lines:[
      ['아직도 준비만 한대?','준비하다 기회 놓치는 팔자래.','해 놓은 건 없고.']
    ]},
    {id:'targets',topic:'work',needs:[['adult'],['work:income']],lines:[
      ['한 번 잘했다고 저러나?','한 번 해내면 계속 해야 한대.','다음에도 하나 보자.']
    ]},
    {id:'no-officer',topic:'office',needs:[['adult'],['mark:noOfficer']],lines:[
      ['좆소 다니나?','관이 아예 없다잖아.','큰 데서 뭘 배웠겠어.'],
      ['윗사람 어려운 줄 모르네.','관운이 비어 있다잖아.','어디서 배워 먹었대?']
    ]},
    {id:'weak-office',topic:'office',needs:[['office:weak']],lines:[
      ['쟤가 뭘 정한다고?','관운이 약하다잖아.','정해 주면 따를 것이지.']
    ]},
    {id:'hidden-office',topic:'office',needs:[['office:hidden']],lines:[
      ['쟤한테 결정권은 있고?','윗사람 허락만 기다린대.','끼어들 데를 알아야지.']
    ]},
    {id:'obedient-office',topic:'office',needs:[['office:regular','work:order']],lines:[
      ['시키는 대로는 잘한다며?','말 잘 들어야 대접받는대.','그거나 계속 잘하지.']
    ]},
    {id:'pressure-office',topic:'office',needs:[['office:pressure']],lines:[
      ['거절할 형편은 되고?','급한 일은 다 쟤 몫이래.','쓸 데가 있으니 부르지.']
    ]},
    {id:'mixed-office',topic:'office',needs:[['office:mixed']],lines:[
      ['어딜 가도 혼난다며?','관살이 섞였다잖아.','알아서 맞췄어야지.']
    ]},
    {id:'challenge-office',topic:'office',needs:[['office:challenge']],lines:[
      ['윗사람한테 저러는 것 봐.','상관견관이라잖아.','그래서 위에 못 두는 거야.'],
      ['제가 뭘 안다고 나서?','맞는 말 해도 찍히는 사주래.','말할 자격부터 갖춰야지.']
    ]},
    {id:'supported-office',topic:'office',needs:[['office:supported']],lines:[
      ['자리 하나 맡더니 다 됐나?','관운 좀 받쳐 준다잖아.','자기 위는 안 보이나 봐.'],
      ['사람 좀 부린다고 저러네.','받은 자리 지켜야 한다잖아.','맡겨 준 일이나 하지.']
    ]},
    {id:'rules',topic:'office',needs:[['pool:O2']],lines:[
      ['쟤까지 봐 달라는 거야?','정한 대로 따를 팔자라잖아.','자기가 우리랑 같나.']
    ]},
    {id:'no-helper',topic:'gwiin',needs:[['gwiin:absent']],lines:[
      ['저런 것도 가르쳐 줘야 돼?','알려 줄 귀인이 없다잖아.','기본도 없는 사람을.'],
      ['아는 사람도 없나 봐.','도와줄 귀인은 안 보인대.','그럴 만하니까 없겠지.'],
      ['누가 데려온 사람이야?','소개해 줄 사람도 없대.','아무나 들어오는구나.']
    ]},
    {id:'helped',topic:'gwiin',needs:[['gwiin:present']],lines:[
      ['누가 끌어 줬다며?','귀인이 있어서 온 거잖아.','고마운 줄은 알아야지.'],
      ['알려 주면 듣기나 하지.','도움에는 가르침도 붙는대.','가르쳐 주는 게 어디야.']
    ]},
    {id:'recruitment',topic:'gwiin',needs:[['adult'],['pool:G5']],lines:[
      ['공고 보고 온 거야?','뽑힐 사람은 따로 있다잖아.','내정된 사람도 모르고.'],
      ['소개도 없이 지원했대?','남 뽑는 절차나 채워 준대.','서류는 누가 봐 준대?']
    ]},
    {id:'housing',topic:'home',needs:[['adult'],['home:생활을 합치는 날짜','pool:L3','pool:F5']],lines:[
      ['집 하나 못 구한대?','집 마련하다 날짜 늦어진대.','그럼 혼자 살아야지.'],
      ['임대 사나?','집 마련도 뜻대로 안 된대.','형편은 못 숨긴다니까.']
    ]},
    {id:'introductions',topic:'home',needs:[['adult'],['pool:L1']],lines:[
      ['쟤를 누구한테 소개해?','집안이랑 직장부터 본다잖아.','해 주고 욕먹을 일 있나.']
    ]},
    {id:'parents-cost',topic:'family',needs:[['adult'],['family:old','pool:F3']],lines:[
      ['부모까지 먹여 살린대?','집안 부양하느라 제 건 없대.','집안이 짐이네.']
    ]},
    {id:'passed-poverty',topic:'family',needs:[['family:absentPoor']],lines:[
      ['저 집 애도 똑같겠네.','가난도 대물림이라잖아.','집안이 어디 가겠어.'],
      ['자식한테는 뭘 해 준대?','가난 말곤 남길 게 없대.','그 집도 대대로 그러겠지.']
    ]},
    {id:'child-cost',topic:'family',needs:[['family:shown']],lines:[
      ['애한테 다 쓰고 뭘 남긴대?','교육비로 노후까지 쓴대.','그 정도도 못 해 주나.']
    ]},
    {id:'care-work',topic:'family',needs:[['adult'],['family:cut','family:care']],lines:[
      ['사람 쓰면 되잖아.','돌봄까지 제 몫이라네.','우리 집은 다 사람 쓰는데.']
    ]},
    {id:'worn-out',topic:'body',needs:[['adult'],['pool:B2']],lines:[
      ['아직도 쓸 만하겠어?','몸 닳으면 젊은 애 쓴다잖아.','젊은 사람은 얼마든지 있어.']
    ]},
    {id:'rest',topic:'body',needs:[['adult'],['pool:B3']],lines:[
      ['쉴 건 다 쉬겠다고?','쉬는 만큼 뒤처진다잖아.','쉬어도 되는 사람인가.']
    ]}
  ];
  // 별자리만으로 실제 추가된 문단일 때만 별자리를 입에 올린다.
  const western={
    'labor-0':{ids:['B6'],say:'별자리에도 몸 써서 번다네.'},
    'extra-work-0':{ids:['W1'],say:'별자리에도 일복은 많다네.'},
    'rest-0':{ids:['B3'],say:'별자리에도 쉴 복은 없네.'}
  };
  const entries=groups.flatMap(g=>g.lines.map((line,i)=>({id:g.id+'-'+i,topic:g.topic,needs:g.needs,
    aside:line[0],say:line[1],end:line[2],who:['origin','money','work','body'].includes(g.topic)?0:1,
    western:western[g.id+'-'+i]||null})));

  function fromReading(view,age){
    const tags=[],west=[];
    if(!view)return {version:1,tags,westernIds:west};
    if(Number.isFinite(age)&&age>=20)tags.push('adult');
    if(view.origin&&view.origin.key)tags.push('origin:'+view.origin.key);
    for(const key of ['noStudy','noOfficer'])if(view.marks&&view.marks[key]===true)tags.push('mark:'+key);
    for(const d of view.domains||[]){
      // 화면에 전달한 완성 본문만 받고, 탈락한 후보 문단은 근거로 쓰지 않는다.
      if(d.displayed!==true&&!(d.paragraphs&&d.paragraphs.length)&&!d.detail)continue;
      if(d.cause)tags.push(d.id+':'+d.cause);
      for(const id of d.poolIds||[])tags.push('pool:'+id);
      for(const id of d.westernAddedIds||[])if((d.poolIds||[]).includes(id))west.push(id);
    }
    return {version:1,tags:Array.from(new Set(tags)),westernIds:Array.from(new Set(west))};
  }
  function eligible(snapshot){
    if(!snapshot||snapshot.version!==1||!Array.isArray(snapshot.tags))return [];
    const tags=new Set(snapshot.tags);
    return entries.filter(e=>e.needs.every(any=>any.some(tag=>tags.has(tag))));
  }
  function choose(snapshot,used=new Set(),random=Math.random){
    const all=eligible(snapshot);if(!all.length)return null;
    let pool=all.filter(e=>!used.has(e.id));
    if(!pool.length){used.clear();pool=all;}
    // 대사가 많은 주제 하나가 다른 풀이를 덮지 않게 주제를 먼저 고른다.
    const topics=Array.from(new Set(pool.map(e=>e.topic)));
    const pick=a=>a[Math.min(a.length-1,Math.max(0,Math.floor(random()*a.length)))];
    const topic=pick(topics),entry=pick(pool.filter(e=>e.topic===topic));
    const fromStars=entry.western&&entry.western.ids.some(id=>(snapshot.westernIds||[]).includes(id));
    return Object.assign({},entry,{say:fromStars?entry.western.say:entry.say});
  }
  return {entries,fromReading,eligible,choose};
});
