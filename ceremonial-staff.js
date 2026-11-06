/* 옥좌 곁의 나무 지팡이. 판정이나 전투 진행에는 관여하지 않는다. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.CeremonialStaff=factory();
})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const LAND=.78,END=1.18;
 function create(T,parent,{onImpact=()=>{}}={}){
  const root=new T.Group();root.name='ceremonial-staff';parent.add(root);
  const materials=[
   new T.MeshStandardMaterial({color:0x705039,roughness:.89}),
   new T.MeshStandardMaterial({color:0x38291f,roughness:.94}),
   new T.MeshStandardMaterial({color:0xb38a46,metalness:.65,roughness:.4})
  ],batches=materials.map(()=>[]);
  const vec=p=>new T.Vector3(...p);
  function tube(points,r,mat=0,segments=24,sides=7){
   const curve=new T.CatmullRomCurve3(points.map(vec));
   const g=new T.TubeGeometry(curve,segments,r,sides,false),p=g.attributes.position;
   for(let i=0;i<=segments;i++){
    const c=curve.getPointAt(i/segments),taper=1-.38*i/segments;
    for(let j=0;j<=sides;j++){
     const n=i*(sides+1)+j;
     p.setXYZ(n,c.x+(p.getX(n)-c.x)*taper,c.y+(p.getY(n)-c.y)*taper,c.z+(p.getZ(n)-c.z)*taper);
    }
   }
   g.computeVertexNormals();batches[mat].push(g);
  }
  tube([[0,.025,0],[-.025,.28,.01],[.015,.63,-.018],[-.02,.98,.016],[.025,1.3,0],[-.012,1.48,-.01],[.025,1.56,0]],.027,0,36,9);
  // Three uneven roots cradle the crystal; the ends stay rounded and wooden.
  tube([[-.015,1.34,0],[-.085,1.51,.025],[-.12,1.67,.025],[-.075,1.82,.01],[-.04,1.85,0]],.025);
  tube([[.012,1.39,0],[.1,1.52,.012],[.135,1.67,.01],[.11,1.77,-.01],[.075,1.8,-.025]],.024);
  tube([[0,1.42,-.01],[.025,1.54,-.09],[.035,1.73,-.095],[-.005,1.8,-.05]],.021);
  tube([[-.07,1.53,.03],[-.025,1.56,.085],[.055,1.57,.07],[.1,1.6,.025]],.015);
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2,dx=Math.cos(a)*.022,dz=Math.sin(a)*.022;
   tube([[dx,.12,dz],[dx-.021,.33,dz+.01],[dx+.014,.64,dz-.015],[dx-.017,.98,dz+.012],[dx+.022,1.29,dz],[dx-.008,1.46,dz]],.0019,1,30,4);
  }
  for(let i=0;i<3;i++){
   const g=new T.TorusGeometry(.027, .0035,5,16);g.rotateX(Math.PI/2);g.translate(-.014,.89+i*.042,.01);batches[2].push(g);
  }
  // Merge each material once, so the prop adds only six draw calls.
  for(let b=0;b<batches.length;b++){
   const geos=batches[b].map(g=>{const n=g.toNonIndexed();g.dispose();return n;});
   const count=geos.reduce((n,g)=>n+g.attributes.position.count,0),merged=new T.BufferGeometry();
   for(const name of ['position','normal']){
    const array=new Float32Array(count*3);let offset=0;
    for(const g of geos){array.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length;}
    merged.setAttribute(name,new T.BufferAttribute(array,3));
   }
   geos.forEach(g=>g.dispose());const mesh=new T.Mesh(merged,materials[b]);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);
  }
  const crystal=new T.Mesh(new T.OctahedronGeometry(.095,0),new T.MeshStandardMaterial({color:0xc1e5df,emissive:0x739da9,emissiveIntensity:.55,metalness:.18,roughness:.23,flatShading:true}));
  crystal.position.set(.015,1.663,0);crystal.scale.set(.78,1.4,.78);root.add(crystal);
  const heart=new T.Mesh(new T.OctahedronGeometry(.019,0),new T.MeshBasicMaterial({color:0xf0fbec}));heart.position.set(.015,1.67,.069);root.add(heart);
  const glow=new T.Mesh(new T.SphereGeometry(.105,12,8),new T.MeshBasicMaterial({color:0x8fb8e0,transparent:true,opacity:.07,depthWrite:false}));
  glow.position.copy(crystal.position);glow.scale.set(.83,1.27,.83);root.add(glow);
  const axis=new T.Vector3(1,0,-.22).normalize(),support=[];
  const upright=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(-.19,.97,-.17).normalize());
  const flat=new T.Quaternion().setFromAxisAngle(axis,Math.PI/2);
  root.updateMatrixWorld(true);
  // Support heights are derived from the actual wood and crystal geometry.
  for(const mesh of root.children){
   if(mesh===glow)continue;
   const p=mesh.geometry.attributes.position,v=new T.Vector3();mesh.updateMatrix();
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrix);support.push([v.x,v.y,v.z]);}
  }
  let state='upright',elapsed=0,contact=0;
  function pose(angle,slide=0){
   root.quaternion.copy(upright).slerp(flat,(angle-.09)/(Math.PI/2-.09));
   const q=root.quaternion,a=2*(q.x*q.y+q.z*q.w),b=1-2*(q.x*q.x+q.z*q.z),c=2*(q.y*q.z-q.x*q.w);
   let low=Infinity;
   for(const p of support)low=Math.min(low,a*p[0]+b*p[1]+c*p[2]);
   root.position.set(.76+slide*.04,.008-low,-.28+slide*.08);
  }
  function reset(){state='upright';elapsed=0;contact=0;pose(.09);}
  function update(dt,falling=false){
   if(!Number.isFinite(dt)||dt<=0)return;
   if(state==='upright'&&falling)state='falling';
   if(state!=='falling')return;
   elapsed=Math.min(END,elapsed+dt);
   let angle;
   if(elapsed<LAND){const p=elapsed/LAND;angle=.09+(Math.PI/2-.09)*p*p;}
   else if(elapsed<1.02)angle=Math.PI/2-.13*Math.sin(Math.PI*(elapsed-LAND)/.24);
   else angle=Math.PI/2-.045*Math.sin(Math.PI*(elapsed-1.02)/.16);
   pose(angle,Math.min(1,elapsed/LAND));
   const times=[LAND,1.02,END],powers=[1,.38,.16];
   while(contact<times.length&&elapsed+1e-8>=times[contact])onImpact(powers[contact++]);
   if(elapsed>=END)state='settled';
  }
  reset();
  return {root,reset,update,get state(){return state;},get elapsed(){return elapsed;}};
 }
 return {create};
});
