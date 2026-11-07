/* 天地神明: a permanent hall fitting, shared by every incumbent.
 * Glyph outlines: Noto Serif CJK KR Bold, SIL OFL 1.1 (assets/Noto-CJK-OFL.txt).
 * Four baked vector outlines avoid missing CJK fonts or delayed font swaps. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.ThronePlaque=factory();
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const GLYPHS=[{"path": "M802 531 733 444H534C543 525 545 614 547 710H930C943 710 954 715 957 725C910 770 830 827 830 827L760 739H47L54 710H414C414 614 414 526 406 444H86L93 415H403C379 217 299 59 30 -73L39 -88C389 24 494 185 529 405C558 234 635 26 868 -90C877 -24 912 7 971 19L972 30C702 119 583 264 544 415H900C914 415 925 420 928 430C881 474 802 531 802 531Z", "bounds": [30, -90, 972, 827]}, {"path": "M787 620 706 591V804C732 808 739 818 741 832L597 846V551L509 519V721C534 725 543 736 545 749L397 765V478L280 436L299 412L397 448V64C397 -34 441 -54 563 -54H701C924 -54 977 -34 977 21C977 43 965 56 928 70L924 212H913C892 144 872 93 860 74C850 64 839 60 823 59C802 56 761 55 710 55H575C524 55 509 65 509 95V489L597 521V114H616C658 114 706 138 706 148V275C727 267 739 259 747 245C757 230 758 204 758 170C800 170 836 180 862 204C904 240 913 312 916 578C936 581 948 587 955 595L853 679L796 623ZM706 560 805 596C803 390 798 313 782 296C776 290 770 287 757 287C744 287 721 289 706 290ZM20 141 79 7C90 12 100 23 103 36C231 124 321 199 381 252L377 262L250 214V509H368C381 509 391 514 393 525C364 563 306 622 306 622L257 538H250V784C277 789 285 799 287 813L140 826V538H34L42 509H140V177C90 160 47 148 20 141Z", "bounds": [20, -54, 977, 846]}, {"path": "M60 434V299C60 213 58 99 29 16L42 6C125 83 141 207 143 297V397C166 400 174 410 176 422ZM323 436V77H336C368 77 406 99 406 109V402C427 406 434 414 436 425ZM54 765 62 736H395C409 736 420 741 423 752C383 789 316 841 316 841L258 765ZM561 413H636V239H561ZM561 441V612H636V441ZM825 413V239H747V413ZM825 441H747V612H825ZM636 848V640H572L458 684V137H476C529 137 561 157 561 164V211H636V-89H658C700 -89 747 -62 747 -49V211H825V153H844C897 153 932 173 932 179V603C954 607 964 614 971 623L872 699L820 640H747V805C774 809 781 819 784 833ZM29 552 37 523H180V-86H199C252 -86 283 -65 283 -59V523H423C437 523 447 528 450 539C411 576 345 632 345 632L286 552Z", "bounds": [29, -89, 971, 848]}, {"path": "M809 747V548H621V747ZM510 775V455C510 246 481 65 291 -79L301 -88C512 4 585 143 610 290H809V61C809 45 804 38 785 38C759 38 633 46 633 46V32C690 22 717 10 736 -8C754 -25 761 -52 765 -89C904 -76 921 -30 921 48V728C942 732 956 741 963 749L851 836L799 775H638L510 821ZM809 520V318H614C619 364 621 410 621 456V520ZM182 728H308V509H182ZM73 757V94H92C147 94 182 122 182 130V230H308V144H326C366 144 417 172 418 181V709C438 714 453 722 459 731L351 815L298 757H194L73 803ZM182 481H308V259H182Z", "bounds": [73, -89, 963, 836]}];
 const SIZE={width:2.45,height:.68,y:2.7,z:-4.45};
 function draw(g,w,h){
  g.save();g.scale(w/2048,h/512);
  const ground=g.createLinearGradient(0,0,0,512);
  ground.addColorStop(0,'#281614');ground.addColorStop(.45,'#130f0f');ground.addColorStop(1,'#281814');
  g.fillStyle=ground;g.fillRect(0,0,2048,512);
  // Subtle horizontal wood grain, deterministic and only drawn once.
  for(let i=0;i<75;i++){
   const y=12+i*6.7;g.strokeStyle=i%3?'rgba(118,69,39,.12)':'rgba(7,4,3,.22)';g.lineWidth=i%4?1:2;
   g.beginPath();g.moveTo(0,y);g.bezierCurveTo(560,y+Math.sin(i)*8,1440,y-Math.cos(i)*7,2048,y);g.stroke();
  }
  g.strokeStyle='#92703e';g.lineWidth=3;g.strokeRect(30,28,1988,456);
  g.strokeStyle='#53422c';g.lineWidth=1.5;g.strokeRect(44,42,1960,428);
  // Small star maps sit inside the end panels, leaving the title dominant.
  const maps=[[[79,294],[125,224],[181,239],[223,155],[269,174],[314,116]],[[1728,359],[1772,302],[1840,318],[1880,226],[1955,204],[1923,136]]];
  for(const pts of maps){
   g.strokeStyle='#867346';g.lineWidth=2;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
   pts.forEach(([x,y],i)=>{g.fillStyle=i%2?'#b8a06a':'#e5ca88';g.beginPath();g.arc(x,y,i%2?3:5,0,Math.PI*2);g.fill();});
  }
  // A restrained sun and crescent join the star maps without another zodiac wheel.
  g.strokeStyle='#af8f51';g.lineWidth=2;g.beginPath();g.arc(187,350,22,0,Math.PI*2);g.stroke();
  for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(187+Math.cos(a)*29,350+Math.sin(a)*29);g.lineTo(187+Math.cos(a)*35,350+Math.sin(a)*35);g.stroke();}
  g.beginPath();g.arc(1833,151,23,.4,Math.PI*1.7);g.bezierCurveTo(1822,170,1831,177,1854,160);g.stroke();
  const gold=g.createLinearGradient(0,95,0,420);gold.addColorStop(0,'#f2d994');gold.addColorStop(.5,'#d6b66a');gold.addColorStop(1,'#a77c3b');
  GLYPHS.forEach((glyph,i)=>{
   const [x0,y0,x1,y1]=glyph.bounds,scale=318/(y1-y0);
   const x=520+i*336-(x1+x0)*scale/2,y=256+(y1+y0)*scale/2;
   const p=new Path2D(glyph.path);
   g.save();g.translate(x+2.5,y+4);g.scale(scale,-scale);g.fillStyle='#090605';g.fill(p);g.restore();
   g.save();g.translate(x,y);g.scale(scale,-scale);g.fillStyle=gold;g.fill(p);g.restore();
  });
  g.restore();
 }
 function create(T,parent,canvasTex){
  const root=new T.Group();root.name='throne-plaque';root.position.set(-.08,SIZE.y,SIZE.z);parent.add(root);
  const wood=new T.MeshStandardMaterial({color:0x271714,roughness:.64});
  const edge=new T.MeshStandardMaterial({color:0xa08248,metalness:.62,roughness:.48});
  function box(w,h,d,mat,x,y,z){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;}
  box(SIZE.width+.09,SIZE.height+.08,.14,wood,0,0,0);
  for(const s of [-1,1]){
   box(SIZE.width+.1,.024,.048,edge,0,s*(SIZE.height/2+.024),.09);
   box(.024,SIZE.height+.07,.048,edge,s*(SIZE.width/2+.038),0,.09);
  }
  const tex=canvasTex(2048,512,draw);
  const face=new T.Mesh(new T.PlaneGeometry(SIZE.width,SIZE.height),new T.MeshStandardMaterial({map:tex,roughness:.7,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.13}));
  face.position.z=.081;root.add(face);return {root,face,SIZE,layout(w,h){root.position.y=h/w>=1.95?2.7:2.57;}};
 }
 return {create,draw,SIZE};
});
