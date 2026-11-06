/* 사주도사 · 서양 출생차트
 * Astronomy Engine: 지구 중심, 날짜 기준 열대황도 / Whole Sign houses.
 * 사주의 진태양시 보정값을 행성 계산에 다시 더하지 않는다.
 * 문구는 조건에 묶인 고정 원고다. 호출마다 재작성하거나 임의로 섞지 않는다.
 */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./assets/astronomy.browser.min.js'));
  else root.Western=factory(root.Astronomy);
})(typeof globalThis!=='undefined'?globalThis:this,function(A){
  'use strict';
  const RAD=Math.PI/180,HOUR=3600000;
  const SIGNS=['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리','천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'];
  const BODIES=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const NAMES={Sun:'태양',Moon:'달',Mercury:'수성',Venus:'금성',Mars:'화성',Jupiter:'목성',Saturn:'토성',Uranus:'천왕성',Neptune:'해왕성',Pluto:'명왕성'};
  const ASPECTS=[{angle:0,name:'합',orb:6},{angle:60,name:'육각',orb:4},{angle:90,name:'사각',orb:6},{angle:120,name:'삼각',orb:6},{angle:180,name:'대립',orb:6}];
  // 도시 중심의 위도. 출생지 목록의 경도와 같은 도시 기준으로 계산한다.
  const LATITUDES={seoul:37.5665,incheon:37.4563,suwon:37.2636,seongnam:37.4200,goyang:37.6584,uijeongbu:37.7381,
    chuncheon:37.8813,wonju:37.3422,gangneung:37.7519,sokcho:38.2070,daejeon:36.3504,sejong:36.4800,cheongju:36.6424,chungju:36.9910,cheonan:36.8151,
    gwangju:35.1595,jeonju:35.8242,gunsan:35.9677,mokpo:34.8118,yeosu:34.7604,suncheon:34.9506,busan:35.1796,daegu:35.8714,ulsan:35.5384,
    pohang:36.0190,gyeongju:35.8562,andong:36.5684,gumi:36.1195,changwon:35.2280,jinju:35.1800,gimhae:35.2285,tongyeong:34.8544,ulleung:37.4845,
    jeju:33.4996,seogwipo:33.2541,pyongyang:39.0392,kaesong:37.9708,hamhung:39.9183,tokyo:35.6895,osaka:34.6937,fukuoka:33.5904,sapporo:43.0618,
    beijing:39.9042,shanghai:31.2304,shenyang:41.8057,yanji:42.8913,qingdao:36.0671,hongkong:22.3193,taipei:25.0330,hanoi:21.0285,hochiminh:10.8231,
    bangkok:13.7563,manila:14.5995,singapore:1.3521,kualalumpur:3.1390,jakarta:-6.2088,newyork:40.7128,washington:38.9072,atlanta:33.7490,chicago:41.8781,
    dallas:32.7767,houston:29.7604,denver:39.7392,losangeles:34.0522,sanfrancisco:37.7749,seattle:47.6062,honolulu:21.3069,toronto:43.6532,vancouver:49.2827,
    london:51.5074,paris:48.8566,berlin:52.5200,frankfurt:50.1109,moscow:55.7558,dubai:25.2048,saopaulo:-23.5505,sydney:-33.8688,melbourne:-37.8136,brisbane:-27.4698,auckland:-36.8485};
  const norm=n=>((n%360)+360)%360;
  const distance=(a,b)=>Math.abs(norm(a-b+180)-180);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const longitude=(body,t)=>norm(A.Ecliptic(A.GeoVector(body,new Date(t),true)).elon);
  function ascendant(t,lat,lon){
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>=66)return null;
    const time=A.MakeTime(new Date(t)),observer=new A.Observer(lat,lon,0);
    const rotation=A.CombineRotation(A.Rotation_ECT_EQD(time),A.Rotation_EQD_HOR(time,observer));
    const x=A.RotateVector(rotation,new A.Vector(1,0,0,time)),y=A.RotateVector(rotation,new A.Vector(0,1,0,time));
    let result=norm(Math.atan2(-x.z,y.z)/RAD);
    const v=A.RotateVector(rotation,new A.Vector(Math.cos(result*RAD),Math.sin(result*RAD),0,time));
    // Astronomy Engine의 지평 좌표에서 y 양수는 서쪽이다.
    if(v.y>0)result=norm(result+180);
    return {longitude:result,sign:Math.floor(result/30)};
  }
  function findAspects(planets){
    const out=[];
    for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){
      const p=planets[i],q=planets[j],angle=distance(p.longitude,q.longitude);
      const hit=ASPECTS.find(a=>Math.abs(angle-a.angle)<=a.orb);
      if(hit)out.push({a:p.id,b:q.id,angle:hit.angle,name:hit.name,separation:angle,orb:Math.abs(angle-hit.angle)});
    }
    return out.sort((a,b)=>a.orb-b.orb||BODIES.indexOf(a.a)-BODIES.indexOf(b.a)||BODIES.indexOf(a.b)-BODIES.indexOf(b.b));
  }
  function compute(options){
    if(!A||typeof A.GeoVector!=='function')return {available:false,reason:'행성 계산 자료를 불러오지 못했습니다.'};
    if(!Number.isFinite(options.utc))throw new Error('서양 출생차트의 시각을 확인해 주세요.');
    const unknown=!!options.unknown;
    const asc=unknown?null:ascendant(options.utc,options.lat,options.lon);
    let samples=[options.utc];
    if(unknown){
      const range=options.dayRange;
      if(!range||!Number.isFinite(range[0])||!Number.isFinite(range[1])||range[1]<range[0])throw new Error('태어난 날의 시각 범위를 확인해 주세요.');
      samples=[range[0]];
      for(let t=range[0]+HOUR/2;t<range[1];t+=HOUR/2)samples.push(t);
      samples.push(range[1]);
    }
    const planets=BODIES.map(id=>{
      const values=samples.map(t=>longitude(id,t)),signs=new Set(values.map(v=>Math.floor(v/30)));
      // 시각 미상의 별자리 경계는 보수적으로 처리한다. 표본 사이의 작은 역행·정지도 확정하지 않는다.
      if(unknown)values.forEach(v=>{const degree=v%30,margin=id==='Moon'?.18:id==='Sun'?.015:.04;if(degree<margin)signs.add((Math.floor(v/30)+11)%12);if(degree>30-margin)signs.add((Math.floor(v/30)+1)%12);});
      const candidates=[...signs].sort((a,b)=>a-b),sign=candidates.length===1?candidates[0]:null,lng=unknown?null:values[0];
      return {id,name:NAMES[id],longitude:lng,sign,candidates,house:asc&&sign!=null?(sign-asc.sign+12)%12+1:null};
    });
    return {available:true,unknown,utc:unknown?null:options.utc,dayRange:unknown?options.dayRange:null,asc,planets,aspects:unknown?[]:findAspects(planets),method:'tropical-whole-sign'};
  }
  const planet=(c,id)=>c.planets.find(p=>p.id===id);
  const aspect=(c,a,b,angle)=>c.aspects.find(x=>((x.a===a&&x.b===b)||(x.a===b&&x.b===a))&&(angle==null||x.angle===angle));
  const house=(c,n)=>c.planets.filter(p=>p.house===n);
  function position(p){return p.sign==null?p.candidates.map(i=>SIGNS[i]).join(' / '):SIGNS[p.sign];}
  function degree(lon){const n=Math.floor(norm(lon)%30*60);return Math.floor(n/60)+'° '+String(n%60).padStart(2,'0')+'′';}
  function joined(list){return list.map(p=>p.name).join('·');}
  function particle(word,closed,open){return word+((word.charCodeAt(word.length-1)-44032)%28?closed:open);}
  function placement(c,n,meaning){const ps=house(c,n);return ps.length?meaning+'을 보는 '+n+'하우스에 '+joined(ps)+'이 놓입니다.':'';}
  function aspectText(x){return NAMES[x.a]+'·'+NAMES[x.b]+' '+x.name;}

  // 태양은 지향, 달은 익숙한 반응. 두 체계를 같은 오행으로 억지 환산하지 않는다.
  const SUN=[
    '생각을 오래 묵히기보다 먼저 시작해서 방향을 잡습니다. 결정권이 남에게 넘어가면 일의 크기보다 기다리는 시간이 더 거슬립니다.',
    '이미 손에 익은 방식과 쌓아 둔 것을 기준으로 움직입니다. 바꿀 이유가 충분해도 지금 가진 것을 내려놓는 데에는 시간이 걸립니다.',
    '하나를 익히는 동안 다음 질문이 생깁니다. 설명하고 비교하는 속도가 빨라서 시작한 일보다 머릿속에 열린 일이 많습니다.',
    '누가 내 편인지, 어디까지 마음을 써도 되는지 먼저 살핍니다. 한 번 자기 사람으로 들인 뒤에는 끝난 일도 오래 기억합니다.',
    '무슨 일을 맡았는지만큼 그 일에서 어떤 사람으로 보이는지도 중요합니다. 공을 들인 부분을 남이 알아보지 못하면 쉽게 넘기기 어렵습니다.',
    '크게 잘됐다는 말보다 어디가 덜 맞는지가 먼저 보입니다. 손대면 나아질 부분을 찾는 동안 끝낼 기준도 조금씩 높아집니다.',
    '혼자 옳다고 생각하는 것과 상대가 받아들일 수 있는 말을 함께 따집니다. 결정을 내린 뒤에도 남겨 둔 다른 선택을 돌아봅니다.',
    '겉으로 나온 말보다 그 말을 하게 된 이유를 붙듭니다. 대충 납득하고 넘어가기 어려워 이미 끝난 대화도 혼자 다시 짚습니다.',
    '지금 하는 일이 어디로 이어지는지 알아야 오래 붙잡습니다. 반복되는 절차보다 그 절차가 필요한 이유에 먼저 질문을 던집니다.',
    '하고 싶은 일을 이루는 데 필요한 순서와 시간을 셉니다. 즐거웠는지보다 무엇이 남았는지로 하루를 평가하기 쉽습니다.',
    '여럿이 따르는 방식에도 자기 기준을 따로 댑니다. 납득하지 못한 규칙을 오래 수행하면 일보다 그 규칙에 마음이 걸립니다.',
    '말로 정리되기 전의 분위기와 감정을 먼저 받아들입니다. 어디까지가 자기 마음이고 어디부터가 남에게서 옮아온 것인지 뒤늦게 가립니다.'
  ];
  const MOON=[
    '마음이 움직이면 반응도 먼저 나옵니다. 가라앉은 뒤에는 끝난 감정을 상대가 계속 붙잡고 있는 일이 답답합니다.',
    '먹고 쉬고 머무는 방식이 일정해야 마음이 놓입니다. 익숙한 생활이 흔들리면 작은 변화도 평소보다 크게 느껴집니다.',
    '마음에 걸리는 일을 말이나 검색으로 풀어 놓습니다. 설명을 찾는 동안에는 감정이 정리된 것처럼 느끼기도 합니다.',
    '익숙한 사람과 장소에 마음을 맡깁니다. 가까운 사람의 짧은 말 한마디가 낯선 사람의 긴 평가보다 오래 남습니다.',
    '내가 애쓴 것을 알아주는 반응에 마음이 움직입니다. 아무렇지 않은 척해도 무심히 넘어간 대목은 기억해 둡니다.',
    '마음이 어수선하면 정리할 일부터 찾습니다. 해결할 항목이 없어지고도 불편함이 남으면 무엇을 빠뜨렸는지 다시 살핍니다.',
    '상대의 표정과 말투를 보며 자기 반응을 조절합니다. 다툼을 끝낸 뒤에도 어느 쪽이 더 양보했는지는 마음에 남습니다.',
    '가까워질수록 쉽게 꺼낼 수 없는 감정도 커집니다. 말하지 않은 것을 상대가 알아주길 기다리다가 더 깊이 숨기기도 합니다.',
    '답답한 마음이 들면 다른 일정과 다른 장소를 찾습니다. 잠깐 벗어나 있는 동안 미뤄 둔 문제는 돌아올 때 다시 만납니다.',
    '감정을 설명하기 전에 해야 할 일을 정리합니다. 도움을 청할 때도 힘들다는 말보다 처리할 항목을 먼저 꺼냅니다.',
    '감정에 휩쓸릴수록 한 발 떨어져 이유를 따집니다. 설명할 수 있게 된 마음과 실제로 가라앉은 마음이 늘 같지는 않습니다.',
    '분위기를 바꾸는 작은 자극에도 마음이 오래 머뭅니다. 혼자 있는 시간이 생겨도 다른 사람에게서 받은 감정이 곧바로 사라지지는 않습니다.'
  ];
  // 확정 원고. 대응하는 사주 유형과 출생차트 조건이 있을 때만 채택한다.
  const COPY={
    living:'당신에게 들어오는 재물은 생활비로 소진됩니다. 돈이 들어오고, 먹고 자고, 다시 돈을 벌러 나갑니다. 한 달을 일해서 한 달을 살고 나면 다음 달의 생활비가 다시 필요합니다. 지난달에 얼마나 애썼든 이번 달에 쓸 돈이 남아 있지 않으면 다시 벌어야 합니다.',
    spending:'당신은 편하게 살고 싶어서 큰돈을 쓰기보다, 오늘을 끝낼 힘이 없어 작은돈을 씁니다. 직접 할 일을 남에게 맡기고 잠깐 숨을 돌립니다. 그러나 지출을 셀 때는 그 돈으로 무엇을 견뎠는지까지 계산하지 않습니다. 쉬지 않으면 버틸 수 없었다는 것은 당신의 사정이고, 돈이 남지 않았다는 것은 당신의 결과입니다.',
    learning:'돈이 넉넉한 집에서 자란 사람은 당장 벌지 않아도 되는 동안 배웁니다. 실패해도 다시 준비하고, 좋은 기회를 기다립니다. 그렇게 얻은 자격과 안목은 그 사람의 능력이 됩니다. 당신에게 그런 시간이 없었더라도 갖추지 못한 것은 갖추지 못한 것입니다. 기회는 사정이 급한 사람보다 준비된 사람에게 주는 것이 옳습니다.',
    debt:'남의 돈을 빌려 쓰면 갚을 일이 남습니다. 돈을 내어 준 사람은 당신이 편해지기를 기다리는 사람이 아닙니다. 약속한 만큼 돌아오기를 기다리는 사람입니다. 급한 일을 넘겼다면 그다음부터는 갚을 일을 해야 합니다. 받은 날의 절박함은 돈을 받은 것으로 해결되었으니, 갚는 날까지 같은 사정으로 헤아려 달라고 할 수는 없습니다.',
    effort:'오래 애썼다는 사실만으로 더 많은 몫이 생기지는 않습니다. 같은 일을 더 힘들게 해냈다면, 그 차이는 당신이 견뎌야 했던 어려움이지 남이 더 값을 치러야 할 성과는 아닙니다. 고생을 알아주는 말과 돈을 더 주는 일은 별개입니다.',
    stability:'당신의 생활은 일을 그만두지 않는 동안 유지됩니다. 그 생활을 유지하는 데 힘을 다 썼다면, 그 밖의 것을 마련할 여력은 남지 않습니다. 같은 나이에 더 많이 이룬 사람과의 차이는 그대로 남습니다.',
    ending:'당신은 오늘을 덜 힘들게 넘기려고 쓴 돈을 내일의 품으로 메우는 팔자입니다.'
  };
  function moneyAnchor(c){
    if(planet(c,'Moon').house===2&&planet(c,'Saturn').house===2&&aspect(c,'Moon','Saturn',0))return '서양 출생차트에서는 자신의 수입과 재산을 보는 두 번째 하우스에 달과 토성이 함께 놓입니다. 생활의 필요를 따라 움직이는 달 곁에, 한계를 정하고 지출을 따지는 토성이 붙어 있습니다. 돈을 얻는 일과 돈 때문에 마음을 놓는 일이 쉽게 함께 오지 않는 배치입니다.';
    const p=house(c,2);
    if(p.length){
      const more=p.some(x=>x.id==='Jupiter')?'목성은 수입과 자원을 넓히는 쪽으로 읽습니다. 들어올 돈의 폭이 넓어져도 그중 얼마를 남길지는 지출과 함께 보아야 합니다.':
        p.some(x=>x.id==='Venus')?'금성은 돈을 끌어들이는 방식과 돈으로 누리는 취향에 함께 놓입니다. 벌 때의 매력과 쓸 때의 만족을 따로 보지 않습니다.':
        p.some(x=>x.id==='Saturn')?'토성은 모으고 지키는 일에 조건과 시간이 붙는 것으로 읽습니다. 잔액을 확인한 뒤에도 그 돈이 버텨야 할 기간을 함께 셉니다.':
        p.some(x=>x.id==='Moon')?'달은 생활의 필요와 마음의 안정을 함께 봅니다. 필요한 돈의 기준도 그날그날의 생활을 따라 움직입니다.':
        p.some(x=>x.id==='Mars')?'화성은 직접 움직여 자원을 확보하려는 힘으로 읽습니다. 버는 일에 쓰는 힘과 지출을 늘리는 속도를 함께 살핍니다.':'돈을 마련하고 소유를 유지하는 일이 이 배치의 관심사입니다. 수입의 규모와 지켜야 할 생활의 크기를 함께 봅니다.';
      return placement(c,2,'자신의 수입과 재산')+' '+more;
    }
    const v=planet(c,'Venus');
    return v.sign==null?'':('금성은 '+SIGNS[v.sign]+'에 있습니다. 점성술에서 금성은 끌리는 것과 값을 치르고 누리고 싶은 것을 함께 봅니다. 돈의 풀이에서는 들어오는 액수와 함께 무엇에 지갑을 여는지를 살핍니다.');
  }
  function sharedAnchor(c){
    if(planet(c,'Jupiter').house!==8)return '';
    let text='타인의 자금과 공동 재산을 보는 여덟 번째 하우스에는 목성이 있습니다. ';
    if(aspect(c,'Jupiter','Saturn',180))text+='그 목성은 '+(planet(c,'Saturn').house===2?'당신의 재물 자리에 있는 ':'')+'토성과 거의 정면으로 마주합니다. ';
    return text+'다룰 수 있는 돈의 규모가 커지는 것과, 그 돈을 자기 뜻대로 쓸 수 있는 것은 따로 보아야 합니다. 돈과 함께 들어오는 조건도 당신의 생활에 자리를 잡습니다.';
  }
  function workAnchor(c,r){
    const mars=planet(c,'Mars'),square=aspect(c,'Sun','Mars',90);
    if(mars.house===6&&square){
      return '일상의 노동을 보는 여섯 번째 하우스에는 화성이 있고, 태양과 사각을 이룹니다. 해야 할 일을 처리하는 데 쓰는 힘과, 자신을 위해 남겨 둘 힘이 부딪힙니다.'+(r.a.structure.god==='상관'?' 사주에서도 월지의 상관은 방법을 찾고 결과를 만들어 내는 데 힘을 쓰게 합니다. 다만 힘을 썼다는 사실과 그 힘에 매겨지는 값은 다릅니다.':'');
    }
    const daily=placement(c,6,'매일 반복하는 일과 맡은 업무');
    if(daily)return daily+' 이 배치는 일상의 일을 어떤 방식으로 감당하는지 살핍니다. 해야 할 일을 처리하는 능력과 그 일의 조건을 정하는 권한은 따로 보아야 합니다.';
    if(square)return '태양과 화성이 사각을 이룹니다. 자신이 원하는 방향과 실제 행동에 쓰는 힘 사이의 마찰을 봅니다. 움직인 양이 그대로 원하는 결과가 되지는 않습니다.';
    const easy=aspect(c,'Sun','Mars',120)||aspect(c,'Sun','Mars',60);
    if(easy)return '태양과 화성이 '+easy.name+'을 이룹니다. 뜻을 행동으로 옮기는 흐름이 비교적 매끄럽습니다. 할 수 있는 일이 늘어나면 맡는 일의 범위도 함께 넓어집니다.';
    return '';
  }
  function wealthIntro(r){
    const days=['갑목','을목','병화','정화','무토','기토','경금','신금','임수','계수'],elements=['흙','흙','쇠','쇠','물','물','나무','나무','불','불'];
    const index='甲乙丙丁戊己庚辛壬癸'.indexOf(r.a.dayStem),element=elements[index],w=r.fate.wealth;
    let text=days[index]+' 일간인 당신에게 재물은 '+element+'의 기운입니다.';
    if(w&&w.present&&!w.visible.length){
      const positions=[...new Set(w.hidden.map(p=>p.pos))].sort().map(i=>['해','달','날','시간'][i]);
      const locations=positions.length===2?particle(positions[0],'과','와')+' '+positions[1]:positions.join('·');
      text+=' 그 '+particle(element,'은','는')+' 태어난 '+locations+'의 아래 글자에 들어 있습니다.';
    }else if(w&&w.fact)text+=' '+w.fact;
    return text;
  }
  function weave(out,R,evidence){
    const c=R.western;if(!c||!c.available)return out;
    const r=R.reading,money=out.domains.find(d=>d.id==='money'),work=out.domains.find(d=>d.id==='work');
    const moneyText=moneyAnchor(c),shared=sharedAnchor(c),labor=workAnchor(c,r);
    // 기존 사주의 원인 분기를 유지한다. 서양의 길한 배치를 흉한 배치로 바꾸지 않는다.
    if(money.cause==='comfort'){
      const paragraphs=[];
      paragraphs.push(wealthIntro(r)+(moneyText?' '+moneyText:''));
      paragraphs.push(COPY.living,COPY.spending);
      const count=evidence&&evidence.jeongin||0;
      if(count>=2){paragraphs.push('당신 명식에는 배움과 문서, 자격을 보는 정인이 '+['','한','두','세'][count]+' 번 드러납니다. 무엇을 알고 있는지뿐 아니라, 그것을 무엇으로 인정받았는지가 거듭 평가의 기준이 됩니다.',COPY.learning);}
      if(shared)paragraphs.push(shared,COPY.debt);
      if(labor)paragraphs.push(labor,COPY.effort);
      paragraphs.push(COPY.stability);
      money.paragraphs=paragraphs;money.closing=COPY.ending;
      // 지역 이동에 관한 기존 추가 판정은 그 근거와 함께 앞에서 읽고, 합의한 마지막 문장은 끝에 둔다.
      if(money.fates.length>1)money.paragraphs.push(...money.fates.slice(1));
    }else{
      money.western=[moneyText,shared].filter(Boolean);
      if(labor)work.western=[labor];
    }
    const home=out.domains.find(d=>d.id==='home'),partner=placement(c,7,'짝과 일대일 관계');
    if(partner)home.western=[partner+' 가까운 관계에서 드러나는 요구와 약속을 봅니다. 마음이 맞는지와 함께 생활을 어떻게 나눌지가 관계 안으로 들어옵니다.'];
    const family=out.domains.find(d=>d.id==='family'),roots=placement(c,4,'집과 가족의 바탕');
    if(roots)family.western=[roots+' 태어나면서 주어진 생활의 기반과 익숙해진 관계를 봅니다. 독립한 뒤에도 그곳에서 배운 기준을 가지고 다음 생활을 꾸립니다.'];
    const office=out.domains.find(d=>d.id==='office'),career=placement(c,10,'사회적 지위와 공적인 역할');
    if(career)office.western=[career+' 밖에서 어떤 역할로 평가받는지를 봅니다. 역할이 커질수록 결과를 설명해야 하는 범위도 넓어집니다.'];
    return out;
  }

  function emblem(kind){
    const paths=kind==='Sun'?'<circle cx="16" cy="16" r="5"/><path d="M16 2v5m0 18v5M2 16h5m18 0h5M6 6l4 4m12 12 4 4M6 26l4-4M22 10l4-4"/>':kind==='Moon'?'<path d="M24 24A12 12 0 1 1 18 3a10 10 0 0 0 6 21Z"/>':'<path d="M3 24h26M6 21a10 10 0 0 1 20 0M16 4v13m-5-8 5-5 5 5"/>';
    return '<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+paths+'</svg>';
  }
  function render(c){
    if(!c||!c.available)return '<p class="pnote">'+esc(c&&c.reason||'서양 출생차트를 불러오지 못했습니다.')+' 다시 접속하면 함께 확인할 수 있습니다.</p>';
    const sun=planet(c,'Sun'),moon=planet(c,'Moon'),asc=c.asc;
    const card=(kind,label,p,small)=>'<div class="natal-key">'+emblem(kind)+'<span>'+label+'</span><strong>'+esc(p?position(p):c.unknown?'시간 필요':'정보 확인')+'</strong><small>'+small+'</small></div>';
    let html='<div class="natal-keys">'+card('Sun','태양',sun,'내가 향하는 쪽')+card('Moon','달',moon,'익숙한 마음의 반응')+card('Asc','상승궁',asc?{sign:asc.sign}:null,asc?'세상에 드러나는 태도':c.unknown?'생시를 알아야 계산':'출생지 좌표 필요')+'</div>';
    const lines=[];
    if(sun.sign!=null)lines.push('<p><b>태양 · '+SIGNS[sun.sign]+'</b>'+SUN[sun.sign]+'</p>');
    if(moon.sign!=null)lines.push('<p><b>달 · '+SIGNS[moon.sign]+'</b>'+MOON[moon.sign]+'</p>');
    html+='<div class="natal-reading">'+lines.join('')+'</div>';
    if(c.unknown)html+='<p class="natal-note">태어난 시간을 몰라 상승궁과 하우스, 행성 사이 각도는 풀지 않았습니다. 그날 별자리가 바뀔 수 있는 행성은 두 후보를 함께 표시합니다.</p>';
    html+='<details class="natal-details"><summary>내 출생차트 자세히 보기</summary><div class="natal-table-wrap"><table><caption class="sr-only">행성의 별자리와 하우스</caption><thead><tr><th scope="col">행성</th><th scope="col">별자리'+(c.unknown?'':' · 도수')+'</th><th scope="col">하우스</th></tr></thead><tbody>';
    html+=c.planets.map(p=>'<tr><th scope="row">'+p.name+'</th><td>'+esc(position(p))+(p.longitude!=null?' <span>'+degree(p.longitude)+'</span>':'')+'</td><td>'+(p.house||'—')+'</td></tr>').join('');
    html+='</tbody></table></div>';
    if(asc)html+='<p class="natal-note">상승궁 · '+SIGNS[asc.sign]+' '+degree(asc.longitude)+'</p>';
    if(c.aspects.length)html+='<ul class="natal-aspects">'+c.aspects.map(x=>'<li><span>'+aspectText(x)+'</span><small>'+x.angle+'° · 오차 '+x.orb.toFixed(1)+'°</small></li>').join('')+'</ul>';
    html+='<p class="natal-method">열대황도 · 홀사인 하우스<br>출생지의 당시 표준시·서머타임을 반영합니다. 사주의 진태양시 보정과는 별도로 계산합니다. 하우스는 삶의 영역을 나누는 12칸이며, 비어 있는 칸이 그 영역의 부재를 뜻하지는 않습니다.</p></details>';
    return html;
  }
  return {compute,render,weave,ascendant,findAspects,LATITUDES,SIGNS,COPY,aspect,planet};
});
