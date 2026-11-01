/* Deterministic contact / balance simulation. No DOM, rendering, or timers.
 * 맷집: 한 대에 깎이는 균형(balance)은 작고, 다 깎이면 바로 넘어지지 않고 잠깐 비틀거린(stagger) 뒤 넘어진다.
 * 일어나는 동안 맞아도 바로 다시 넘어지지 않는다(여러 대가 쌓여야 다시 쓰러진다).
 * poise(최대 균형)는 바깥에서 게이지에 맞춰 줄여 준다: 처음엔 많이 버티고, 지칠수록 덜 버틴다. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FateMotion=api;
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const TIMING=Object.freeze({stagger:.62,fall:.52,recoverAfter:1.25,rise:1.35});
 // 한 대에 깎이는 균형(힘 1 기준). 맨주먹 잽(힘 1.15)이면 .035: 처음(poise 1)엔 서른 대 가까이 맞아야 비틀거리고, 훅만 치면 열 대쯤
 const COST={jab:.027,hook:.06,upper:.072,shove:.11,shot:.05,stab:.055,slash:.011,stomp:0};
 const RISE_LIMIT=.3;    // 일어나는 동안 이만큼 쌓이면 다시 쓰러진다(잽 아홉 대 또는 훅 세 대)
 const STAGGER_LIMIT=.09; // 비틀거리는 동안 이만큼 맞으면 바로 넘어진다(훅·어퍼 한 방 또는 잽 세 대)
 class Body {
  constructor(seated=true){
   this.x=0;this.z=seated?-.62:.25;this.yaw=0;this.vx=0;this.vz=0;
   this.mode=seated?'seat':'stand';this.age=0;this.idle=10;
   this.poise=1;this.balance=1;this.side=1;this.roll=0;this.compression=0;
   this.grab=null;this.events=[];this.serial=0;this.locked=false;
   this.downs=0;this.stepDistance=0;this.recovery=0;this.canRise=true;this.exit=null;
   this.riseHit=0;this.staggerHit=0;this.staggerDir={x:0,z:-1};this.lean=0;
  }
  change(mode){if(this.mode===mode)return;this.mode=mode;this.age=0;this.serial++;}
  setPoise(p){this.poise=clamp(p,.3,1);this.balance=Math.min(this.balance,this.poise);}
  fall(dx=0,dz=-1,force=1){
   if(this.locked)return;
   this.grab=null;this.side=Math.abs(dx)>.08?Math.sign(dx):this.side;
   this.roll=clamp(dx,-1,1)*.42;
   this.vx+=dx*force*.65;this.vz+=dz*force*.5;
   if(this.mode!=='fall'&&this.mode!=='ground'){this.change('fall');this.downs++;}
   this.idle=0;this.recovery=0;this.balance=0;this.riseHit=0;this.staggerHit=0;
  }
  // 균형이 다 깎임: 바로 넘어지지 않고 비틀거린다
  stagger(dx,dz){
   if(this.locked)return;
   this.staggerDir={x:clamp(dx,-1,1),z:dz<0?-1:1};this.staggerHit=0;this.lean=0;
   this.side=Math.abs(dx)>.08?Math.sign(dx):this.side;
   this.change('stagger');this.idle=0;this.balance=0;
  }
  hit({kind='jab',dx=0,dz=-1,power=1,blocked=false}={}){
   if(this.locked)return;
   this.idle=0;this.recovery=0;
   const k=blocked?.35:1;
   if(this.mode==='seat'){
    this.exit={z:this.z,t:0};this.change('stand');this.vz=.3;this.balance=this.poise;
   }
   if(this.mode==='ground'||this.mode==='fall'){
    this.compression=clamp(this.compression+.12*power,0,.22);
    this.vx+=dx*.13*power;this.vz+=dz*.09*power;
    this.roll=clamp(this.roll+dx*.12,-.65,.65);
    this.yaw+=dx*.035;
    return;
   }
   if(this.mode==='grab'){this.compression=.1;return;}
   const cost=(COST[kind]==null?COST.jab:COST[kind])*power*k;
   if(this.mode==='stagger'){
    // 비틀거리는 중에 센 한 방(또는 몇 대)을 더 맞으면 그 방향으로 넘어진다
    this.staggerHit+=cost;this.vx+=dx*.25*power*k;this.vz+=dz*.2*power*k;
    if(this.staggerHit>=STAGGER_LIMIT)this.fall(dx,dz,power);
    return;
   }
   if(this.mode==='rise'){
    // 일어나는 동안은 휘청이기만 하고, 여러 대가 쌓여야 다시 쓰러진다
    this.riseHit+=cost;this.compression=clamp(this.compression+.08*power,0,.22);
    this.vx+=dx*.12*power*k;this.vz+=dz*.1*power*k;
    if(this.riseHit>=RISE_LIMIT)this.fall(dx,dz,.6);
    return;
   }
   this.balance-=cost;
   this.vx+=dx*.5*power*k;this.vz+=dz*.43*power*k;
   this.yaw=clamp(this.yaw+dx*.12*power,-.65,.65);
   if(this.balance<=0)this.stagger(dx,dz);
  }
  beginGrab(){
   if(this.locked||this.mode==='fall')return false;
   const low=this.mode==='ground'||this.mode==='rise';
   if(this.mode==='seat')this.exit={z:this.z,t:0};
   this.grab={x:this.x,z:this.z,yaw:this.yaw,low,lift:low?0:1,dx:0,dy:0};
   this.vx=this.vz=0;this.idle=0;this.change('grab');return true;
  }
  drag(dx,dy){
   const g=this.grab;if(!g||this.locked)return;
   g.dx=clamp(dx,-1.5,1.5);g.dy=clamp(dy,-1.5,1.5);
   g.lift=clamp((g.low?0:1)-dy*2.7,0,1);
   this.x=clamp(g.x+dx*1.45,-1.18,1.18);
   if(!this.exit)this.z=clamp(g.z+Math.max(0,-dy)*.7+.12,.85,2.0);
   this.yaw=clamp(g.yaw-dx*.55,-.85,.85);
  }
  release(cancel=false){
   const g=this.grab;if(!g)return false;
   this.grab=null;this.idle=0;
   const throwing=!cancel&&(Math.abs(g.dx)>.23||g.dy>.23);
   if(throwing){
    this.change('stand');this.fall(g.dx*2.4,g.dy>.23?.75:-.8,1.4);
    this.events.push({type:'throw',power:1.4});
   }else if(g.lift>.65){this.change('stand');this.balance=this.poise*.65;}
   else{this.change('ground');this.balance=0;}
   return throwing;
  }
  step(dt){
   if(!Number.isFinite(dt)||dt<=0||this.locked)return;
   let remaining=Math.min(dt,.2);
   while(remaining>1e-8){const h=Math.min(remaining,1/60);this.integrate(h);remaining-=h;}
  }
  integrate(dt){
   this.age+=dt;this.idle+=dt;
   this.compression*=Math.exp(-dt*12);
   if(this.exit){const e=this.exit;e.t=Math.min(1,e.t+dt/.48);const u=e.t*e.t*(3-2*e.t);this.z=e.z+(.92-e.z)*u;if(e.t>=1){this.exit=null;this.vz=0;}}
   if(this.mode!=='grab'){
    const px=this.x,pz=this.z;
    this.x+=this.vx*dt;this.z+=this.vz*dt;
    const drag=this.mode==='ground'?7.5:4;
    this.vx*=Math.exp(-dt*drag);this.vz*=Math.exp(-dt*drag);
    const xmin=-1.18,xmax=1.18,zmin=this.mode==='seat'||this.exit?-.7:.85,zmax=2.0;
    // Keep the body in front of the throne; grounded limbs need room too.
    for(const [p,v,lo,hi] of [['x','vx',xmin,xmax],['z','vz',zmin,zmax]]){
     if(this[p]<lo||this[p]>hi){
      const speed=Math.abs(this[v]);this[p]=clamp(this[p],lo,hi);this[v]*=-.16;
      if(speed>.5)this.events.push({type:'boundary',power:Math.min(1.5,speed)});
     }
    }
    this.stepDistance+=Math.hypot(this.x-px,this.z-pz);
   }
   if(this.mode==='stagger'){
    // 비틀거림: 맞은 방향으로 조금 밀리다가 끝에 넘어진다
    this.lean=Math.min(1,this.age/TIMING.stagger);
    if(this.age>=TIMING.stagger)this.fall(this.staggerDir.x*.6,this.staggerDir.z,.9);
   }else if(this.mode==='fall'&&this.age>=TIMING.fall){
    this.change('ground');this.events.push({type:'land',power:1});
   }else if(this.mode==='ground'){
    if(this.idle>.65)this.recovery=Math.min(1,this.recovery+dt*1.5);
    if(this.idle>TIMING.recoverAfter&&this.canRise){this.change('rise');this.riseHit=0;this.events.push({type:'rise'});}
   }else if(this.mode==='rise'&&this.age>TIMING.rise){this.change('stand');this.balance=this.poise*.8;}
   // 서서 잠깐 안 맞으면 균형이 돌아온다(지칠수록 돌아오는 한도가 낮다)
   if(this.mode==='stand'&&this.idle>.5)this.balance=Math.min(this.poise,this.balance+dt*.3);
  }
  drain(){const events=this.events;this.events=[];return events;}
 }
 return {Body,TIMING,COST};
});
