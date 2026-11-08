const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../..');
module.exports=function(integrated=true){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const slice=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);if(i<0||j<i)throw Error(a);return html.slice(i,j)};
 const source=slice("'use strict';",'function icon(')+slice('const PLACES=','const PLACE_MAP=')+slice('/* ---------- 자리 문서(V5)','/* 현재 월운:')+slice('function buildResult(inp,sd){','function resetAll(){');
 const context={Date,Intl,console,Western:require('../../western.js'),ReadingPool:require('../../reading-pool.js'),OpeningReading:require('../../opening-reading.js')};
 if(integrated)Object.assign(context,{ReadingIntegration:require('../../reading-integration.js'),PeriodReading:require('../../period-reading.js')});
 const api=vm.runInNewContext(source+';({buildResult,v5Reading,V5,PLACES,sajuYearBoundsV2})',context);
 const places=Object.fromEntries(api.PLACES.flatMap(g=>g[1].map(p=>[p[0],{name:p[1],lon:p[2],lat:context.Western.LATITUDES[p[0]],tz:p[3]||'KR',std:p[4]==null?9:p[4]}])));
 api.read=(date,time={h:12,mi:0},unknown=false,pk='seoul',male=true)=>{const input={name:'검토',cal:'solar',date,time,unknown,male,place:places[pk],placeKey:pk,occurrence:0},result=api.buildResult(input,date);return {result,view:api.v5Reading(result,Date.UTC(2026,10,8))}};
 return api;
};
