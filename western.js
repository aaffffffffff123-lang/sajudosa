/* 사주도사 · 서양 출생차트
 * Astronomy Engine: 지구 중심, 날짜 기준 열대황도 / Whole Sign houses.
 * 사주의 진태양시 보정값을 행성 계산에 다시 더하지 않는다.
 * 여기서는 계산과 맨 위 별자리 카드·접힌 출생차트만 그린다. 본문 문단은 reading-pool.js가 별자리를 조건으로만 써서 고른다.
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
  function position(p){return p.sign==null?p.candidates.map(i=>SIGNS[i]).join(' / '):SIGNS[p.sign];}
  function degree(lon){const n=Math.floor(norm(lon)%30*60);return Math.floor(n/60)+'° '+String(n%60).padStart(2,'0')+'′';}
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
  // 맨 위 카드의 12궁 그림. 십이지 그림(z-*)과 같은 결로 index.html의 w-* 심볼에 그려 두었다.
  const SIGN_ICONS=['w-aries','w-taurus','w-gemini','w-cancer','w-leo','w-virgo','w-libra','w-scorpio','w-sagittarius','w-capricorn','w-aquarius','w-pisces'];
  const firstSentence=t=>(String(t).match(/^[^.]+\./)||[t])[0];
  // 천지신명의 후광과 같은 선으로 그린 12궁. 글꼴/이모지에 의존하지 않는다.
  const ZODIAC_PATHS=["M0 0.9C0 -0.1 -0.15 -0.85 -0.5 -0.85C-0.9 -0.85 -0.95 -0.25 -0.62 -0.22M0 0.9C0 -0.1 0.15 -0.85 0.5 -0.85C0.9 -0.85 0.95 -0.25 0.62 -0.22","M0.42 0.32L0.42 0.32A0.42 0.42 0 1 1 -0.42 0.32A0.42 0.42 0 1 1 0.42 0.32M-0.9 -0.85C-0.65 -0.05 0.65 -0.05 0.9 -0.85","M-0.85 -0.82Q0 -0.55 0.85 -0.82M-0.85 0.82Q0 0.55 0.85 0.82M-0.38 -0.68L-0.38 0.68M0.38 -0.68L0.38 0.68","M-0.25 -0.28L-0.25 -0.28A0.22 0.22 0 1 1 -0.69 -0.28A0.22 0.22 0 1 1 -0.25 -0.28M-0.47 -0.5C0.1 -0.82 0.7 -0.62 0.85 -0.25M0.69 0.28L0.69 0.28A0.22 0.22 0 1 1 0.25 0.28A0.22 0.22 0 1 1 0.69 0.28M0.47 0.5C-0.1 0.82 -0.7 0.62 -0.85 0.25","M-0.22 0.32L-0.22 0.32A0.25 0.25 0 1 1 -0.72 0.32A0.25 0.25 0 1 1 -0.22 0.32M-0.3 0.14C-0.45 -0.95 0.6 -0.95 0.4 -0.05C0.25 0.55 0.45 0.9 0.85 0.62","M-0.85 -0.55L-0.85 0.78M-0.85 -0.3C-0.7 -0.85 -0.3 -0.75 -0.3 -0.3L-0.3 0.78M-0.3 -0.3C-0.15 -0.85 0.25 -0.75 0.25 -0.3L0.25 0.45C0.25 0.95 0.85 0.75 0.75 0.25C0.65 -0.1 0.15 0.35 0.05 0.9","M-0.85 0.62L0.85 0.62M-0.85 0.2L-0.38 0.2C-0.62 -0.75 0.62 -0.75 0.38 0.2L0.85 0.2","M-0.85 -0.55L-0.85 0.78M-0.85 -0.3C-0.7 -0.85 -0.3 -0.75 -0.3 -0.3L-0.3 0.78M-0.3 -0.3C-0.15 -0.85 0.25 -0.75 0.25 -0.3L0.25 0.5Q0.3 0.82 0.75 0.78M0.5 0.55L0.8 0.78L0.52 0.98","M-0.78 0.8L0.78 -0.78M0.08 -0.8L0.8 -0.8L0.8 -0.08M-0.5 -0.05L0.05 0.5","M-0.9 -0.6L-0.55 0.55L-0.2 -0.55C-0.05 0.9 0.85 0.85 0.7 0.3C0.55 -0.15 0.1 0.25 0.25 0.7Q0.3 0.95 0 0.95","M-0.9 -0.18L-0.5 -0.5L-0.1 -0.18L0.3 -0.5L0.7 -0.18L0.92 -0.36M-0.9 0.42L-0.5 0.1L-0.1 0.42L0.3 0.1L0.7 0.42L0.92 0.24","M-0.75 -0.88C-0.15 -0.4 -0.15 0.4 -0.75 0.88M0.75 -0.88C0.15 -0.4 0.15 0.4 0.75 0.88M-0.55 0L0.55 0"];
  function wheel(c){
    // 생시를 모르면 정확한 도수·각도를 꾸며 그리지 않는다.
    if(c.unknown||!c.planets.every(p=>Number.isFinite(p.longitude)))return '';
    const anchor=c.asc?c.asc.longitude:0,xy=(longitude,r)=>{
      const a=(180+anchor-longitude)*RAD;return [180+r*Math.cos(a),180+r*Math.sin(a)];
    },num=n=>n.toFixed(2),attrs=p=>'cx="'+num(p[0])+'" cy="'+num(p[1])+'"',
    line=(a,b,cls)=>'<path class="'+cls+'" d="M'+a.map(num).join(' ')+'L'+b.map(num).join(' ')+'"/>',
    circle=(r,cls)=>'<circle class="'+cls+'" cx="180" cy="180" r="'+r+'"/>';
    let svg='<figure class="natal-wheel"><svg viewBox="0 0 360 360" role="img" aria-label="태어난 순간의 행성 배치. 각 행성의 별자리와 도수는 아래 표에서 확인할 수 있습니다.">';
    svg+=circle(168,'wheel-band')+circle(139,'wheel-paper');
    svg+='<g fill="none" stroke-width=".8">'+circle(168,'wheel-gold')+circle(139,'wheel-gold')+circle(109,'wheel-fine');
    for(let i=0;i<72;i++)svg+=line(xy(i*5,i%6===0?139:164),xy(i*5,168),i%6===0?'wheel-gold':'wheel-fine');
    if(c.asc)for(let i=0;i<12;i++){
      const longitude=c.asc.sign*30+i*30;
      svg+=line(xy(longitude,109),xy(longitude,139),'wheel-fine');
    }
    svg+='</g><g fill="none" stroke="currentColor" stroke-width=".17" stroke-linecap="round" stroke-linejoin="round">';
    ZODIAC_PATHS.forEach((d,i)=>{const p=xy(i*30+15,153);svg+='<path d="'+d+'" transform="translate('+p.map(num).join(' ')+') scale(8)"><title>'+SIGNS[i]+'</title></path>';});
    svg+='</g>';
    if(c.asc)for(let i=0;i<12;i++){
      const p=xy(c.asc.sign*30+i*30+15,124);
      svg+='<text class="wheel-house" x="'+num(p[0])+'" y="'+num(p[1]+3.5)+'" text-anchor="middle">'+(i+1)+'</text>';
    }
    svg+='<g fill="none" stroke-width=".8">';
    for(const a of c.aspects)svg+=line(xy(planet(c,a.a).longitude,104),xy(planet(c,a.b).longitude,104),'wheel-aspect'+([90,180].includes(a.angle)?' tense':''));
    svg+='</g>';
    const placed=[],offsets=[0];
    for(let angle=8;angle<=176;angle+=8)offsets.push(angle,-angle);
    for(const p of c.planets){
      const point=xy(p.longitude,104);let label=null;
      // 별이 몰려도 점은 실제 위치를 지키고, 이름만 인출선 끝으로 비켜 쓴다.
      for(const offset of offsets){
        for(const r of [82,61,40]){
          const candidate=xy(p.longitude+offset,r);
          if(placed.every(q=>Math.hypot(q[0]-candidate[0],q[1]-candidate[1])>29)){label=candidate;break;}
        }
        if(label)break;
      }
      label=label||xy(p.longitude,20);placed.push(label);
      svg+='<g data-planet="'+p.id+'"><title>'+p.name+' · '+position(p)+' '+degree(p.longitude)+'</title>';
      svg+='<g fill="none" stroke-width=".65">'+line(point,label,'wheel-fine')+'</g>';
      svg+='<circle class="wheel-point'+(['Sun','Moon'].includes(p.id)?' luminary':'')+'" '+attrs(point)+' r="3.4"/>';
      svg+='<text class="wheel-body" x="'+num(label[0])+'" y="'+num(label[1]+3.5)+'" text-anchor="middle">'+p.name+'</text></g>';
    }
    if(c.asc)svg+='<path d="M7 180h20" class="wheel-gold" fill="none"/><text class="wheel-asc" x="9" y="174">ASC</text>';
    svg+='</svg><figcaption>점은 행성의 실제 위치, 안쪽 선은 행성 사이의 각도입니다.'+(c.asc?'<br>숫자는 삶의 영역을 나눈 12하우스입니다.':'')+'</figcaption></figure>';
    return svg;
  }
  // 사주 네 기둥과 같은 카드로 태양·달·상승궁을 보여 주고, 확정된 태양·달만 한 줄씩 풀어 준다.
  function render(c){
    if(!c||!c.available)return '<p class="pnote">'+esc(c&&c.reason||'서양 출생차트를 불러오지 못했습니다.')+' 다시 접속하면 함께 확인할 수 있습니다.</p>';
    const sun=planet(c,'Sun'),moon=planet(c,'Moon'),asc=c.asc;
    const card=(label,small,p,missing)=>{
      let body;
      if(p&&p.sign!=null)body='<div class="glyph"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#'+SIGN_ICONS[p.sign]+'"/></svg><span class="nm">'+SIGNS[p.sign]+'</span></div>';
      else if(p&&p.candidates&&p.candidates.length)body='<div class="glyph"><span class="qmark">?</span><span class="nm two">'+p.candidates.map(i=>SIGNS[i]).join('<br>')+'</span></div><div class="why">그날 별자리가 바뀜</div>';
      else body='<div class="glyph"><span class="qmark">?</span><span class="nm">모름</span></div><div class="why">'+missing+'</div>';
      return '<div class="pillar star-card'+(p&&p.sign!=null?'':' unknown')+'"><div class="pl">'+label+'<small>'+small+'</small></div>'+body+'</div>';
    };
    let html='<div class="star-cards">'+card('태양','내가 향하는 쪽',sun)+card('달','마음의 반응',moon)
      +card('상승궁','드러나는 태도',asc?{sign:asc.sign}:null,c.unknown?'생시를 알아야 계산':'출생지 좌표 필요')+'</div>';
    const lines=[];
    if(sun.sign!=null)lines.push('<li><b>태양 · '+SIGNS[sun.sign]+'</b>'+firstSentence(SUN[sun.sign])+'</li>');
    if(moon.sign!=null)lines.push('<li><b>달 · '+SIGNS[moon.sign]+'</b>'+firstSentence(MOON[moon.sign])+'</li>');
    if(lines.length)html+='<ul class="star-lines">'+lines.join('')+'</ul>';
    if(c.unknown)html+='<p class="natal-note">태어난 시간을 몰라 상승궁과 하우스, 행성 사이 각도는 풀지 않았습니다. 그날 별자리가 바뀔 수 있는 행성은 두 후보를 함께 표시합니다.</p>';
    html+='<details class="chart-details natal-details"><summary>내 출생차트 자세히 보기</summary>'+wheel(c)+'<div class="natal-table-wrap"><table><caption class="sr-only">행성의 별자리와 하우스</caption><thead><tr><th scope="col">행성</th><th scope="col">별자리'+(c.unknown?'':' · 도수')+'</th><th scope="col">하우스</th></tr></thead><tbody>';
    html+=c.planets.map(p=>'<tr><th scope="row">'+p.name+'</th><td>'+esc(position(p))+(p.longitude!=null?' <span>'+degree(p.longitude)+'</span>':'')+'</td><td>'+(p.house||'—')+'</td></tr>').join('');
    html+='</tbody></table></div>';
    if(asc)html+='<p class="natal-note">상승궁 · '+SIGNS[asc.sign]+' '+degree(asc.longitude)+'</p>';
    if(c.aspects.length)html+='<ul class="natal-aspects">'+c.aspects.map(x=>'<li><span>'+aspectText(x)+'</span><small>'+x.angle+'° · 오차 '+x.orb.toFixed(1)+'°</small></li>').join('')+'</ul>';
    html+='<p class="natal-method">열대황도 · 홀사인 하우스<br>출생지의 당시 표준시·서머타임을 반영합니다. 사주의 진태양시 보정과는 별도로 계산합니다. 하우스는 삶의 영역을 나누는 12칸이며, 비어 있는 칸이 그 영역의 부재를 뜻하지는 않습니다.<br>풀이 본문은 이 배치를 문단을 고르는 조건으로만 씁니다.</p></details>';
    return html;
  }
  return {compute,render,ascendant,findAspects,LATITUDES,SIGNS,SIGN_ICONS,SUN,MOON,aspect,planet};
});
