!function(){"use strict";var deferred,leafPrototypes,getProto,inProgress,__webpack_modules__={},__webpack_module_cache__={};function __webpack_require__(moduleId){var cachedModule=__webpack_module_cache__[moduleId];if(void 0!==cachedModule)return cachedModule.exports;var module=__webpack_module_cache__[moduleId]={id:moduleId,loaded:!1,exports:{}};return __webpack_modules__[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.loaded=!0,module.exports}__webpack_require__.m=__webpack_modules__,__webpack_require__.amdD=function(){throw new Error("define cannot be used indirect")},__webpack_require__.amdO={},deferred=[],__webpack_require__.O=function(result,chunkIds,fn,priority){if(!chunkIds){var notFulfilled=1/0;for(i=0;i<deferred.length;i++){chunkIds=deferred[i][0],fn=deferred[i][1],priority=deferred[i][2];for(var fulfilled=!0,j=0;j<chunkIds.length;j++)(!1&priority||notFulfilled>=priority)&&Object.keys(__webpack_require__.O).every((function(key){return __webpack_require__.O[key](chunkIds[j])}))?chunkIds.splice(j--,1):(fulfilled=!1,priority<notFulfilled&&(notFulfilled=priority));if(fulfilled){deferred.splice(i--,1);var r=fn();void 0!==r&&(result=r)}}return result}priority=priority||0;for(var i=deferred.length;i>0&&deferred[i-1][2]>priority;i--)deferred[i]=deferred[i-1];deferred[i]=[chunkIds,fn,priority]},__webpack_require__.n=function(module){var getter=module&&module.__esModule?function(){return module.default}:function(){return module};return __webpack_require__.d(getter,{a:getter}),getter},getProto=Object.getPrototypeOf?function(obj){return Object.getPrototypeOf(obj)}:function(obj){return obj.__proto__},__webpack_require__.t=function(value,mode){if(1&mode&&(value=this(value)),8&mode)return value;if("object"==typeof value&&value){if(4&mode&&value.__esModule)return value;if(16&mode&&"function"==typeof value.then)return value}var ns=Object.create(null);__webpack_require__.r(ns);var def={};leafPrototypes=leafPrototypes||[null,getProto({}),getProto([]),getProto(getProto)];for(var current=2&mode&&value;"object"==typeof current&&!~leafPrototypes.indexOf(current);current=getProto(current))Object.getOwnPropertyNames(current).forEach((function(key){def[key]=function(){return value[key]}}));return def.default=function(){return value},__webpack_require__.d(ns,def),ns},__webpack_require__.d=function(exports,definition){for(var key in definition)__webpack_require__.o(definition,key)&&!__webpack_require__.o(exports,key)&&Object.defineProperty(exports,key,{enumerable:!0,get:definition[key]})},__webpack_require__.f={},__webpack_require__.e=function(chunkId){return Promise.all(Object.keys(__webpack_require__.f).reduce((function(promises,key){return __webpack_require__.f[key](chunkId,promises),promises}),[]))},__webpack_require__.u=function(chunkId){return({763:"subsurface-viewer-src-storybook-components-InfoCard-stories",785:"subsurface-viewer-src-storybook-components-DistanceScale-stories",1151:"subsurface-viewer-src-storybook-layers-TriangleLayer-stories",1214:"well-log-viewer-src-SyncLogViewer-stories",1418:"subsurface-viewer-src-storybook-layers-MapLayerColormap-stories",1670:"subsurface-viewer-src-storybook-components-colorLegends-IndividualScaleForMap-stories",1798:"subsurface-viewer-src-storybook-layers-Hillshading2DLayer-stories",1923:"subsurface-viewer-src-storybook-components-colorLegends-ContinuousLegend-stories",2578:"subsurface-viewer-src-storybook-examples-CameraControlExamples-stories",2648:"subsurface-viewer-src-storybook-components-colorLegends-DiscreteLegend-stories",3297:"subsurface-viewer-src-storybook-layers-BoxSelectionLayer-stories",3429:"well-log-viewer-src-components-WellLogViewWithScroller-stories",4062:"subsurface-viewer-src-storybook-examples-RenderingExamples-stories",4136:"subsurface-viewer-src-storybook-layers-Grid3DLayer-stories",4196:"subsurface-viewer-src-storybook-layers-IntersectionLayer-stories",4708:"subsurface-viewer-src-storybook-components-colorLegends-SingleScaleForMap-stories",5119:"well-log-viewer-src-components-ScaleSelector-stories",5127:"subsurface-viewer-src-storybook-layers-PointsLayer-stories",5143:"subsurface-viewer-src-storybook-examples-miscExamples-stories",5388:"subsurface-viewer-src-storybook-components-settings-ToggleButton-stories",5407:"well-completions-plot-src-WellCompletionsPlot-stories",5490:"well-log-viewer-src-components-WellLogView-stories",5855:"subsurface-viewer-src-storybook-components-settings-NumericInput-stories",6019:"group-tree-plot-src-storybook-GroupTreePlot-stories",6348:"subsurface-viewer-src-storybook-layers-WellMarkersLayer-stories",6602:"subsurface-viewer-src-storybook-layers-PolylinesLayer-stories",6658:"well-log-viewer-src-Intro-mdx",6749:"well-log-viewer-src-components-ZoomSlider-stories",6877:"well-log-viewer-src-components-Scroller-stories",7767:"subsurface-viewer-src-storybook-examples-MultiViewExamples-stories",7893:"subsurface-viewer-src-storybook-layers-MapLayer-stories",8062:"subsurface-viewer-src-storybook-layers-Axes2DLayer-stories",8480:"well-log-viewer-src-WellLogViewer-stories",8779:"subsurface-viewer-src-storybook-schemaValidation-schemaValidation-stories",8956:"subsurface-viewer-src-storybook-examples-TooltipExamples-stories",9020:"subsurface-viewer-src-storybook-layers-WellsLayer-stories",9106:"subsurface-viewer-src-storybook-layers-AxesLayer-stories",9457:"subsurface-viewer-src-storybook-extensions-SideProjectionExtension-stories",9893:"subsurface-viewer-src-storybook-layers-NorthArrow3DLayer-stories"}[chunkId]||chunkId)+"."+{679:"e2459ad8",763:"61c279b5",785:"c355840b",982:"74074280",1151:"a028c753",1205:"f2395099",1214:"1ae3161f",1308:"29c72c32",1418:"eb877576",1581:"ba31def4",1670:"5802d44f",1715:"794845d2",1798:"9b5b51fa",1923:"b82a6021",2117:"168fb347",2292:"1412e9c4",2481:"e531c8f5",2578:"53bd16f1",2648:"eb7ba70a",2843:"7673fe39",3297:"5746fded",3381:"65db800c",3429:"f1174a6a",3448:"caf42281",3770:"d65cb434",3899:"b00e7fde",4062:"a59e12dc",4136:"5abce21f",4196:"530af01f",4408:"9933b3ff",4417:"1fbb543e",4553:"d03a4d89",4581:"0024a2c9",4708:"f462516f",4720:"a4020d7e",4830:"0759a07e",5119:"ccd087af",5127:"702878b4",5143:"666c0715",5161:"f3283745",5388:"d491b9ac",5407:"e69b7deb",5490:"863998f5",5568:"c41f1502",5855:"1ca81fcd",6019:"ddf0b992",6086:"9cc5e4f5",6348:"cb810eea",6602:"b2b81785",6658:"d6756848",6749:"9c94e638",6877:"668cfc79",7395:"a9f4a722",7625:"835e84ed",7767:"fc6d6277",7806:"6484b6ae",7893:"31fce483",8062:"54ecfec3",8480:"9aead8c6",8779:"34d77cdb",8796:"674706a3",8813:"6be39a6b",8956:"f42ee405",9020:"23ac79fc",9079:"b20377d9",9106:"203eaab8",9277:"52c7ef30",9433:"4cd53f16",9457:"e94c5a88",9686:"11306af2",9888:"2467bc12",9893:"e937bd3a",9939:"ebd7ef1c"}[chunkId]+".iframe.bundle.js"},__webpack_require__.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),__webpack_require__.hmd=function(module){return(module=Object.create(module)).children||(module.children=[]),Object.defineProperty(module,"exports",{enumerable:!0,set:function(){throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+module.id)}}),module},__webpack_require__.o=function(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop)},inProgress={},__webpack_require__.l=function(url,done,key,chunkId){if(inProgress[url])inProgress[url].push(done);else{var script,needAttach;if(void 0!==key)for(var scripts=document.getElementsByTagName("script"),i=0;i<scripts.length;i++){var s=scripts[i];if(s.getAttribute("src")==url||s.getAttribute("data-webpack")=="@webviz/subsurface-components:"+key){script=s;break}}script||(needAttach=!0,(script=document.createElement("script")).charset="utf-8",script.timeout=120,__webpack_require__.nc&&script.setAttribute("nonce",__webpack_require__.nc),script.setAttribute("data-webpack","@webviz/subsurface-components:"+key),script.src=url),inProgress[url]=[done];var onScriptComplete=function(prev,event){script.onerror=script.onload=null,clearTimeout(timeout);var doneFns=inProgress[url];if(delete inProgress[url],script.parentNode&&script.parentNode.removeChild(script),doneFns&&doneFns.forEach((function(fn){return fn(event)})),prev)return prev(event)},timeout=setTimeout(onScriptComplete.bind(null,void 0,{type:"timeout",target:script}),12e4);script.onerror=onScriptComplete.bind(null,script.onerror),script.onload=onScriptComplete.bind(null,script.onload),needAttach&&document.head.appendChild(script)}},__webpack_require__.r=function(exports){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(exports,"__esModule",{value:!0})},__webpack_require__.nmd=function(module){return module.paths=[],module.children||(module.children=[]),module},__webpack_require__.p="",function(){var installedChunks={1303:0};__webpack_require__.f.j=function(chunkId,promises){var installedChunkData=__webpack_require__.o(installedChunks,chunkId)?installedChunks[chunkId]:void 0;if(0!==installedChunkData)if(installedChunkData)promises.push(installedChunkData[2]);else if(1303!=chunkId){var promise=new Promise((function(resolve,reject){installedChunkData=installedChunks[chunkId]=[resolve,reject]}));promises.push(installedChunkData[2]=promise);var url=__webpack_require__.p+__webpack_require__.u(chunkId),error=new Error;__webpack_require__.l(url,(function(event){if(__webpack_require__.o(installedChunks,chunkId)&&(0!==(installedChunkData=installedChunks[chunkId])&&(installedChunks[chunkId]=void 0),installedChunkData)){var errorType=event&&("load"===event.type?"missing":event.type),realSrc=event&&event.target&&event.target.src;error.message="Loading chunk "+chunkId+" failed.\n("+errorType+": "+realSrc+")",error.name="ChunkLoadError",error.type=errorType,error.request=realSrc,installedChunkData[1](error)}}),"chunk-"+chunkId,chunkId)}else installedChunks[chunkId]=0},__webpack_require__.O.j=function(chunkId){return 0===installedChunks[chunkId]};var webpackJsonpCallback=function(parentChunkLoadingFunction,data){var moduleId,chunkId,chunkIds=data[0],moreModules=data[1],runtime=data[2],i=0;if(chunkIds.some((function(id){return 0!==installedChunks[id]}))){for(moduleId in moreModules)__webpack_require__.o(moreModules,moduleId)&&(__webpack_require__.m[moduleId]=moreModules[moduleId]);if(runtime)var result=runtime(__webpack_require__)}for(parentChunkLoadingFunction&&parentChunkLoadingFunction(data);i<chunkIds.length;i++)chunkId=chunkIds[i],__webpack_require__.o(installedChunks,chunkId)&&installedChunks[chunkId]&&installedChunks[chunkId][0](),installedChunks[chunkId]=0;return __webpack_require__.O(result)},chunkLoadingGlobal=self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[];chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null,0)),chunkLoadingGlobal.push=webpackJsonpCallback.bind(null,chunkLoadingGlobal.push.bind(chunkLoadingGlobal))}(),__webpack_require__.nc=void 0}();