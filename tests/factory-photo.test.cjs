const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const THREE=require('../three.min.js'),source=fs.readFileSync(path.join(__dirname,'../fight.js'),'utf8');
const slice=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);assert(i>=0&&j>i,a);return source.slice(i,j)};
function rendererRig(fail=false){
 const before={target:{name:'previous'},viewport:new THREE.Vector4(3,4,5,6),scissor:new THREE.Vector4(7,8,9,10),test:true,auto:false,xr:true};
 const state={...before,viewport:before.viewport.clone(),scissor:before.scissor.clone()},calls={disposed:0,renders:0};
 class Target{constructor(w,h){this.width=w;this.height=h;this.texture={}}dispose(){calls.disposed++}}
 const renderer={xr:{enabled:true},getSize:v=>v.set(2,2),getRenderTarget:()=>state.target,getViewport:v=>v.copy(state.viewport),getScissor:v=>v.copy(state.scissor),getScissorTest:()=>state.test,
 get autoClear(){return state.auto},set autoClear(v){state.auto=v},setRenderTarget:v=>state.target=v,setViewport:(...v)=>state.viewport=v.length===1?v[0].clone():new THREE.Vector4(...v),setScissor:v=>state.scissor=v.clone(),setScissorTest:v=>state.test=v,clear(){},render(){calls.renders++},
 readRenderTargetPixels(t,x,y,w,h,p){if(fail)throw Error('read failed');for(let i=0;i<h;i++)p.fill(i+1,i*w*4,(i+1)*w*4);}};
 const doc={createElement:()=>({getContext:()=>({createImageData:(w,h)=>({data:new Uint8Array(w*h*4)}),putImageData:d=>calls.image=d.data}),toBlob:cb=>cb(new Blob(['PNG']))})};
 const capture=vm.runInNewContext(slice('function captureFactoryPhoto(){','const FACTORY_PHOTO=')+';captureFactoryPhoto',{THREE:{...THREE,WebGLRenderTarget:Target},renderer,scene:{},camera:{},document:doc,Uint8Array});
 return {capture,state,before,renderer,calls};
}
test('photo is upright and restores the existing renderer without resizing the gameplay canvas',async()=>{
 const h=rendererRig();await h.capture();assert.equal(h.calls.disposed,1);assert.equal(h.calls.renders,1);assert.equal(h.calls.image[0],3);assert.equal(h.calls.image.at(-1),1);
 assert.deepEqual(h.state,h.before);assert(h.renderer.xr.enabled);
});
test('a failed capture still restores render target, viewport, scissor and XR state',()=>{
 const h=rendererRig(true);assert.throws(h.capture,/read failed/);assert.deepEqual(h.state,h.before);assert(h.renderer.xr.enabled);assert.equal(h.calls.disposed,1);
});
function modalRig(){
 const elements=new Map(),calls={captures:0,revoked:[],holds:[],errors:[]};let resolveCapture=null;
 const document={activeElement:null};
 class Element{constructor(){this.hidden=true;this.isConnected=true;this.handlers={}}addEventListener(k,f){this.handlers[k]=f}click(){return this.handlers.click?.({target:this})}focus(){document.activeElement=this}removeAttribute(k){delete this[k]}getClientRects(){return this.hidden?[]:[{}]}querySelectorAll(){return [...elements.values()]}}
 const $=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
 const G={paused:false,free:true},FREE={viewing:true,busy:false,state:{total:42}},frames=[];
 const scope={G,FREE,$,document,requestAnimationFrame:f=>frames.push(f),clearPointers(){},AUDIO:{hold:v=>calls.holds.push(v)},performance,last:0,console:{warn:()=>{}},URL:{createObjectURL:()=> 'blob:factory',revokeObjectURL:u=>calls.revoked.push(u)},
 setFightModal:(m,v)=>m.hidden=!v,captureFactoryPhoto(){calls.captures++;return new Promise((resolve,reject)=>{resolveCapture={resolve,reject}})}};
 const api=vm.runInNewContext(slice('const FACTORY_PHOTO=','document.addEventListener(\'visibilitychange\'')+';FACTORY_PHOTO',scope);
 const flush=async()=>{for(let i=0;i<8;i++){while(frames.length)frames.shift()();await Promise.resolve()}};
 return {$,G,FREE,calls,document,api,flush,get pending(){return resolveCapture}};
}
test('overview photo opens, pauses, exports the exact count, then resumes and releases its URL',async()=>{
 const h=modalRig();h.$('#freePhoto').focus();h.$('#freePhoto').click();assert(h.G.paused);assert(!h.$('#factoryPhotoModal').hidden);await h.flush();assert.equal(h.calls.captures,1);
 h.pending.resolve(new Blob(['png']));await h.flush();assert.equal(h.$('#factoryPhotoSave').download,'천지신명_정육공장_42놈.png');assert.equal(h.$('#factoryPhotoImage').src,'blob:factory');assert(!h.$('#factoryPhotoSave').hidden);
 h.$('#factoryPhotoClose').click();assert(!h.G.paused);assert(h.$('#factoryPhotoModal').hidden);assert.equal(h.document.activeElement,h.$('#freePhoto'));assert.deepEqual(h.calls.revoked,['blob:factory']);assert.deepEqual(h.calls.holds,[true,false]);
});
test('close or restart while a PNG is being encoded never attaches a stale image',async()=>{
 const h=modalRig();h.$('#freePhoto').click();await h.flush();h.api.close(false);h.pending.resolve(new Blob(['png']));await h.flush();assert(h.$('#factoryPhotoModal').hidden);assert.equal(h.$('#factoryPhotoImage').src,undefined);assert(!h.G.paused);
});
test('capture failure remains closable and export cannot open during combat, hanging, or pause',async()=>{
 const h=modalRig();h.$('#freePhoto').click();await h.flush();h.pending.reject(Error('lost context'));await h.flush();assert.match(h.$('#factoryPhotoStatus').textContent,/만들지 못/);h.$('#factoryPhotoClose').click();assert(!h.G.paused);
 for(const setting of [{free:false},{paused:true}]){const h=modalRig();Object.assign(h.G,setting);h.$('#freePhoto').click();assert(h.$('#factoryPhotoModal').hidden)}
 for(const setting of [{viewing:false},{busy:true}]){const h=modalRig();Object.assign(h.FREE,setting);h.$('#freePhoto').click();assert(h.$('#factoryPhotoModal').hidden)}
});
