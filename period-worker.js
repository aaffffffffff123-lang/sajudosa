'use strict';
importScripts('assets/astronomy.browser.min.js','period-reading.js?v=20261109-woven');
onmessage=function(e){try{postMessage(PeriodReading.compute(e.data));}catch(error){postMessage({error:error.message||String(error)});}};
