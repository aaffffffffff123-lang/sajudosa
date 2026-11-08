const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js');
const source=fs.readFileSync(process.env.TROPHY_SOURCE||path.join(__dirname,'../fight.js'),'utf8');
const bundle=fs.readFileSync(path.join(__dirname,'../three.min.js'),'utf8');
const start=source.indexOf(' const target=new THREE.WebGLRenderTarget(512,512,');
const end=source.indexOf('\n/* 족친 기록 배치:',start);
const portraitExport='(function(){'+source.slice(start,end)+')';

// Exercise the viewport/target setters from the shipped Three.js itself. Only
// the GL state sink is replaced, so screen-DPR multiplication stays real.
function rendererAt(dpr,priorTarget){
 const method=(name,next)=>{const a=bundle.indexOf('this.'+name+'=function'),b=bundle.indexOf(',this.'+next+'=',a);assert(a>=0&&b>a);return bundle.slice(a,b)+';';};
 const factory=`(function(){
  let P=DPR,N=new THREE.Vector4(0,0,390,844),B=new THREE.Vector4(2,3,380,830),T=new THREE.Vector4(),A=new THREE.Vector4(),z=true,L=true,_=null,v=0,y=0;
  const state={viewport:new THREE.Vector4(),scissor:new THREE.Vector4(),scissorTest:true};
  const q={viewport:a=>state.viewport.copy(a),scissor:a=>state.scissor.copy(a),setScissorTest:b=>state.scissorTest=b,bindFramebuffer(){}};
  const Z={get:()=>({__webglFramebuffer:{}})},J={setupRenderTarget(){}},pt={};
  ${method('setViewport','getScissor')}
  ${method('setScissor','getScissorTest')}
  ${method('setScissorTest','setOpaqueSort')}
  ${method('setRenderTarget','readRenderTargetPixels')}
  this.getViewport=a=>a.copy(N);this.getScissor=a=>a.copy(B);this.getScissorTest=()=>z;this.getRenderTarget=()=>_;
  this.state=state;return this;
 })`;
 const r=vm.runInNewContext(factory,{THREE,DPR:dpr}).call({});
 r.setRenderTarget(priorTarget);
 r.toneMappingExposure=1.04;r.autoClear=false;
 let color=new THREE.Color('#123456'),alpha=.6;
 r.getClearColor=c=>c.copy(color);r.getClearAlpha=()=>alpha;r.setClearColor=(c,a)=>{color.set(c);alpha=a;};r.clear=()=>{};
 return r;
}
function render(dpr,priorTarget=null,fail=false){
 const renderer=rendererAt(dpr,priorTarget),before={viewport:renderer.state.viewport.clone(),scissor:renderer.state.scissor.clone(),scissorTest:renderer.state.scissorTest};
 const anchors={neck:[.5,.85],stake:[.5,.67]},rendered=[];let pixels;
 renderer.render=()=>{rendered.push(renderer.state.viewport.clone());if(fail)throw Error('render failed');};
 renderer.readRenderTargetPixels=(target,x,y,w,h,data)=>{
  const v=renderer.state.viewport;
  for(const a of Object.values(anchors)){
   const px=Math.floor(v.x+a[0]*v.z),py=Math.floor(v.y+(1-a[1])*v.w);
   if(px>=0&&px<w&&py>=0&&py<h){const i=(py*w+px)*4;data[i]=255;data[i+3]=255;}
  }
 };
 const document={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:d=>pixels=d.data})})};
 const fn=vm.runInNewContext(portraitExport,{THREE,renderer,stage:{},view:{},anchors,face:{},owned:new Set(),materials:[],model:{disposables:[]},document,Uint8Array});
 let result,error;try{result=fn();}catch(e){error=e;}
 return {renderer,before,rendered,pixels,result,error};
}
test('portrait pixels and neck anchors coincide at desktop and mobile render ratios',()=>{
 for(const dpr of [1,1.2,1.25,1.5,1.6,2]){
  const r=render(dpr);assert.ifError(r.error);
  assert.deepEqual(r.rendered[0].toArray(),[0,0,512,512],'physical portrait viewport at DPR '+dpr);
  for(const a of Object.values(r.result.anchors)){
   const x=Math.floor(a[0]*512),y=511-Math.floor((1-a[1])*512);
   assert.equal(r.pixels[(y*512+x)*4+3],255,'rendered neck point must land on its exported anchor at DPR '+dpr);
  }
 }
});
test('portrait creation restores the game viewport, scissor, clear state and exposure',()=>{
 for(const dpr of [1.2,1.6])for(const fail of [false,true])for(const offscreen of [false,true]){
  const target=offscreen?new THREE.WebGLRenderTarget(256,128):null;
  if(target){target.viewport.set(4,6,240,110);target.scissor.set(8,10,220,90);target.scissorTest=true;}
  const r=render(dpr,target,fail);if(fail)assert.match(r.error.message,/render failed/);else assert.ifError(r.error);
  assert.equal(r.renderer.getRenderTarget(),target);
  assert(r.renderer.state.viewport.equals(r.before.viewport));assert(r.renderer.state.scissor.equals(r.before.scissor));assert.equal(r.renderer.state.scissorTest,r.before.scissorTest);
  assert.equal(r.renderer.getClearColor(new THREE.Color()).getHexString(),'123456');assert.equal(r.renderer.getClearAlpha(),.6);
  assert.equal(r.renderer.toneMappingExposure,1.04);assert.equal(r.renderer.autoClear,false);
 }
});
