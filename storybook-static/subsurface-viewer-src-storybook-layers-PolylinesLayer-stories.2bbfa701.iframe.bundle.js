"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[6602],{"./packages/subsurface-viewer/src/storybook/layers/PolylinesLayer.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{HugePolylinesLayer:function(){return HugePolylinesLayer},SmallPolylinesLayer:function(){return SmallPolylinesLayer},__namedExportsOrder:function(){return __namedExportsOrder}});var mathjs__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/mathjs/lib/esm/core/create.js"),mathjs__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/mathjs/lib/esm/entry/allFactoriesAny.js"),_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./packages/subsurface-viewer/src/SubsurfaceViewer.tsx"),_layers_polylines_polylinesLayer__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/subsurface-viewer/src/layers/polylines/polylinesLayer.ts"),_layers_axes_axesLayer__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./packages/subsurface-viewer/src/layers/axes/axesLayer.ts"),_sharedSettings__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./packages/subsurface-viewer/src/storybook/sharedSettings.tsx");const stories={parameters:{storySource:{source:'import { create, all } from "mathjs";\nimport SubsurfaceViewer from "../../SubsurfaceViewer";\nimport { default as PolylinesLayer } from "../../layers/polylines/polylinesLayer";\nimport { default as AxesLayer } from "../../layers/axes/axesLayer";\nimport { default3DViews, defaultStoryParameters } from "../sharedSettings";\nconst stories = {\n  component: SubsurfaceViewer,\n  title: "SubsurfaceViewer / Polylines Layer",\n  args: {\n    // Add a reset button for all the stories.\n    // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/\n    triggerHome: 0\n  }\n};\nexport default stories;\n\n// Small example using polylinesLayer.\nconst smallPolylinesLayer = new PolylinesLayer({\n  id: "small_polylines_layer",\n  \n  polylinePoints: [0, 0, 0, 10, 0, 0, 10, 0, 10, -5, -5, 4, 0, -8, 6, 5, 10, 8],\n  \n  startIndices: [0, 3],\n  polylinesClosed: [true, false],\n  color: [0, 200, 100],\n  widthUnits: "pixels",\n  linesWidth: 10,\n  ZIncreasingDownwards: true\n});\nconst smallAxesLayer = new AxesLayer({\n  id: "small_axes_layer",\n  bounds: [-10, -10, 0, 20, 10, 10]\n});\nexport const SmallPolylinesLayer = {\n  args: {\n    id: "map",\n    layers: [smallAxesLayer, smallPolylinesLayer],\n    bounds: [-10, -10, 17, 10],\n    views: default3DViews\n  },\n  parameters: {\n    docs: {\n      ...defaultStoryParameters.docs,\n      description: {\n        story: "Polyline nodes are given as native javascript array."\n      }\n    }\n  }\n};\nconst sideSize = 10000;\nconst pointsCount = 100000;\nconst math = create(all, {\n  randomSeed: "1234"\n});\nconst randomFunc = (() => {\n  if (math.random) {\n    return () => {\n      return math.random(sideSize);\n    };\n  }\n  return () => Math.random() * sideSize;\n})();\nconst hugePolylinesLayer = new PolylinesLayer({\n  id: "huge_polylines-layer",\n  polylinePoints: Array(pointsCount * 3).fill(0).map(() => randomFunc()),\n  startIndices: [0],\n  color: [0, 100, 100, 40],\n  widthUnits: "pixels",\n  linesWidth: 1,\n  ZIncreasingDownwards: true\n});\nconst hugeAxesLayer = new AxesLayer({\n  id: "huge_axes_layer",\n  bounds: [0, 0, 0, sideSize, sideSize, sideSize]\n});\nexport const HugePolylinesLayer = {\n  args: {\n    id: "map",\n    layers: [hugeAxesLayer, hugePolylinesLayer],\n    bounds: [0, 0, sideSize, sideSize],\n    views: default3DViews\n  },\n  parameters: {\n    docs: {\n      ...defaultStoryParameters.docs,\n      description: {\n        story: "Polyline nodes are randomly generated in runtime and given as native javascript array."\n      }\n    }\n  }\n};',locationsMap:{"small-polylines-layer":{startLoc:{col:35,line:34},endLoc:{col:1,line:49},startBody:{col:35,line:34},endBody:{col:1,line:49}},"huge-polylines-layer":{startLoc:{col:34,line:76},endLoc:{col:1,line:91},startBody:{col:34,line:76},endBody:{col:1,line:91}}}}},component:_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_0__.Z,title:"SubsurfaceViewer / Polylines Layer",args:{triggerHome:0}};__webpack_exports__.default=stories;const smallPolylinesLayer=new _layers_polylines_polylinesLayer__WEBPACK_IMPORTED_MODULE_1__.Z({id:"small_polylines_layer",polylinePoints:[0,0,0,10,0,0,10,0,10,-5,-5,4,0,-8,6,5,10,8],startIndices:[0,3],polylinesClosed:[!0,!1],color:[0,200,100],widthUnits:"pixels",linesWidth:10,ZIncreasingDownwards:!0}),SmallPolylinesLayer={args:{id:"map",layers:[new _layers_axes_axesLayer__WEBPACK_IMPORTED_MODULE_2__.Z({id:"small_axes_layer",bounds:[-10,-10,0,20,10,10]}),smallPolylinesLayer],bounds:[-10,-10,17,10],views:_sharedSettings__WEBPACK_IMPORTED_MODULE_3__.Pl},parameters:{docs:{..._sharedSettings__WEBPACK_IMPORTED_MODULE_3__.R4.docs,description:{story:"Polyline nodes are given as native javascript array."}}}},math=(0,mathjs__WEBPACK_IMPORTED_MODULE_4__.U)(mathjs__WEBPACK_IMPORTED_MODULE_5__.$,{randomSeed:"1234"}),randomFunc=math.random?()=>math.random(1e4):()=>1e4*Math.random(),hugePolylinesLayer=new _layers_polylines_polylinesLayer__WEBPACK_IMPORTED_MODULE_1__.Z({id:"huge_polylines-layer",polylinePoints:Array(3e5).fill(0).map((()=>randomFunc())),startIndices:[0],color:[0,100,100,40],widthUnits:"pixels",linesWidth:1,ZIncreasingDownwards:!0}),HugePolylinesLayer={args:{id:"map",layers:[new _layers_axes_axesLayer__WEBPACK_IMPORTED_MODULE_2__.Z({id:"huge_axes_layer",bounds:[0,0,0,1e4,1e4,1e4]}),hugePolylinesLayer],bounds:[0,0,1e4,1e4],views:_sharedSettings__WEBPACK_IMPORTED_MODULE_3__.Pl},parameters:{docs:{..._sharedSettings__WEBPACK_IMPORTED_MODULE_3__.R4.docs,description:{story:"Polyline nodes are randomly generated in runtime and given as native javascript array."}}}};SmallPolylinesLayer.parameters={...SmallPolylinesLayer.parameters,docs:{...SmallPolylinesLayer.parameters?.docs,source:{originalSource:'{\n  args: {\n    id: "map",\n    layers: [smallAxesLayer, smallPolylinesLayer],\n    bounds: [-10, -10, 17, 10],\n    views: default3DViews\n  },\n  parameters: {\n    docs: {\n      ...defaultStoryParameters.docs,\n      description: {\n        story: "Polyline nodes are given as native javascript array."\n      }\n    }\n  }\n}',...SmallPolylinesLayer.parameters?.docs?.source}}},HugePolylinesLayer.parameters={...HugePolylinesLayer.parameters,docs:{...HugePolylinesLayer.parameters?.docs,source:{originalSource:'{\n  args: {\n    id: "map",\n    layers: [hugeAxesLayer, hugePolylinesLayer],\n    bounds: [0, 0, sideSize, sideSize],\n    views: default3DViews\n  },\n  parameters: {\n    docs: {\n      ...defaultStoryParameters.docs,\n      description: {\n        story: "Polyline nodes are randomly generated in runtime and given as native javascript array."\n      }\n    }\n  }\n}',...HugePolylinesLayer.parameters?.docs?.source}}};const __namedExportsOrder=["SmallPolylinesLayer","HugePolylinesLayer"]},"./packages/subsurface-viewer/src/storybook/sharedSettings.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{BX:function(){return EditedDataTemplate},D$:function(){return northArrowLayer},DW:function(){return customLayerWithPolygonDataProps},Dh:function(){return hillshadingLayer},HV:function(){return mainStyle},Jl:function(){return hugin2DBounds},M1:function(){return customLayerWithPolylineData},M8:function(){return volveWellsResources},Ng:function(){return customLayerWithTextData},On:function(){return volveWellsWithLogsLayer},Pl:function(){return default3DViews},QH:function(){return huginAxes3DLayer},R4:function(){return defaultStoryParameters},Rd:function(){return customLayerWithPolygonData},Sh:function(){return classes},Wj:function(){return colormapLayer},as:function(){return hugin25mDepthMapLayer},cs:function(){return hugin5mKhNetmapMapLayer},e1:function(){return hugin25mKhNetmapMapLayerPng},ex:function(){return volveWellsLayer},fC:function(){return Root},iH:function(){return redAxes2DLayer},vj:function(){return subsufaceProps},vz:function(){return hugin25mKhNetmapMapLayer},y8:function(){return volveWellsFromResourcesLayer},yP:function(){return hugin3DBounds},z:function(){return volveWellsBounds},zs:function(){return default2DViews}});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_mui_material_styles__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@mui/material/styles/styled.js"),_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/subsurface-viewer/src/SubsurfaceViewer.tsx"),_example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../example-data/deckgl-map.json");function _extends(){return _extends=Object.assign?Object.assign.bind():function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target},_extends.apply(this,arguments)}const defaultStoryParameters={docs:{inlineStories:!1,iframeHeight:500}},classes={main:"default-main"},mainStyle={[`& .${classes.main}`]:{width:750,height:500,top:"50%",left:"50%",transform:"translate(-50%, -50%)",border:"1px solid black",background:"azure",position:"absolute"}},Root=(0,_mui_material_styles__WEBPACK_IMPORTED_MODULE_3__.ZP)("div")(mainStyle),subsufaceProps=_example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__[0],colormapLayer={..._example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__[0].layers[0],id:"colormap-layer"},hillshadingLayer={..._example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__[0].layers[1],id:"hillshading-layer"},redAxes2DLayer={"@@type":"Axes2DLayer",id:"axes-layer",marginH:80,marginV:30,isLeftRuler:!0,isRightRuler:!1,isBottomRuler:!0,isTopRuler:!1,backgroundColor:[155,0,0,255]},hugin2DOrigin=[432150,6475800],hugin2DBounds=[432150,6475800,439400,6481500],hugin3DBounds=[432150,6475800,-2e3,439400,6481500,-3500],huginAxes3DLayer={"@@type":"AxesLayer",id:"axes-layer2",bounds:[432150,6475800,2e3,439400,6481500,3500]},northArrowLayer={"@@type":"NorthArrow3DLayer",id:"north-arrow-layer"},volveWellsResources={resources:{wellsData:"./volve_wells.json"}},volveWellsFromResourcesLayer={"@@type":"WellsLayer",id:"volve-wells",data:"@@#resources.wellsData",ZIncreasingDownwards:!1},volveWellsLayer={"@@type":"WellsLayer",id:"volve-wells",data:"./volve_wells.json",ZIncreasingDownwards:!1},volveWellsBounds=[432150,6475800,439400,6481500],volveWellsWithLogsLayer={"@@type":"WellsLayer",id:"volve-wells-with-logs",data:"./volve_wells.json",logData:"./volve_logs.json",logrunName:"BLOCKING",logName:"ZONELOG",logColor:"Stratigraphy",ZIncreasingDownwards:!1},hugin25mDepthMapLayer={"@@type":"MapLayer",id:"hugin_depth",meshData:"hugin_depth_25_m.float32",frame:{origin:hugin2DOrigin,count:[291,229],increment:[25,25],rotDeg:0},propertiesData:"hugin_depth_25_m.float32",contours:[0,100],isContoursDepth:!0,gridLines:!1,smoothShading:!0,material:!0},hugin25mKhNetmapMapLayer={...hugin25mDepthMapLayer,id:"hugin_kh_netmap",propertiesData:"kh_netmap_25_m.float32",colorMapName:"Physics"},hugin25mKhNetmapMapLayerPng={...hugin25mDepthMapLayer,meshData:"hugin_depth_25_m.png",propertiesData:"kh_netmap_25_m.png",colorMapName:"Physics"},hugin5mKhNetmapMapLayer={"@@type":"MapLayer",id:"mesh-layer",meshUrl:"hugin_depth_5_m.float32",frame:{origin:hugin2DOrigin,count:[1451,1141],increment:[5,5],rotDeg:0},propertiesUrl:"kh_netmap_5_m.float32",contours:[0,100],colorMapName:"Physics"},default2DViews={layout:[1,1],viewports:[{id:"view_1",show3D:!1}]},default3DViews={layout:[1,1],viewports:[{id:"view_1",show3D:!0}]},customLayerWithPolylineData={"@@type":"GeoJsonLayer",id:"geojson-line-layer",name:"Line",data:{type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:{type:"LineString",coordinates:[[434e3,6477500],[435500,6477500]]}}]},getLineWidth:20,lineWidthMinPixels:2},customLayerWithPolygonDataProps={id:"geojson-layer",data:{type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:[[[434562,6477595],[434562,6478595],[435062,6478595],[435062,6477595],[434562,6477595]]]}},getLineWidth:20,lineWidthMinPixels:2,getLineColor:[0,255,255],getFillColor:[0,255,0],opacity:.3},customLayerWithPolygonData={...customLayerWithPolygonDataProps,"@@type":"GeoJsonLayer"},customLayerWithTextData={"@@type":"TextLayer",id:"text-layer",name:"Text",data:[{name:"Custom GeoJson layer",coordinates:[434800,6478695]}],pickable:!0,getPosition:d=>d.coordinates,getText:d=>d.name,getColor:[255,0,0],getSize:16,getAngle:0,getTextAnchor:"middle",getAlignmentBaseline:"center"},EditedDataTemplate=args=>{const[editedData,setEditedData]=react__WEBPACK_IMPORTED_MODULE_0__.useState(args.editedData);return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{setEditedData(args.editedData)}),[args.editedData]),react__WEBPACK_IMPORTED_MODULE_0__.createElement(_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_1__.Z,_extends({},args,{editedData:editedData,setProps:updatedProps=>{setEditedData(updatedProps.editedData)}}))};try{Root.displayName="Root",Root.__docgenInfo={description:"",displayName:"Root",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/sharedSettings.tsx#Root"]={docgenInfo:Root.__docgenInfo,name:"Root",path:"packages/subsurface-viewer/src/storybook/sharedSettings.tsx#Root"})}catch(__react_docgen_typescript_loader_error){}try{EditedDataTemplate.displayName="EditedDataTemplate",EditedDataTemplate.__docgenInfo={description:"",displayName:"EditedDataTemplate",props:{id:{defaultValue:null,description:"",name:"id",required:!0,type:{name:"string"}},resources:{defaultValue:null,description:"",name:"resources",required:!1,type:{name:"Record<string, unknown>"}},layers:{defaultValue:null,description:"",name:"layers",required:!1,type:{name:"Record<string, unknown>[] | LayersList"}},bounds:{defaultValue:null,description:"",name:"bounds",required:!1,type:{name:"[number, number, number, number] | BoundsAccessor"}},cameraPosition:{defaultValue:null,description:"",name:"cameraPosition",required:!1,type:{name:"ViewStateType"}},triggerHome:{defaultValue:null,description:"",name:"triggerHome",required:!1,type:{name:"number"}},views:{defaultValue:null,description:"",name:"views",required:!1,type:{name:"ViewsType"}},coords:{defaultValue:null,description:"",name:"coords",required:!1,type:{name:"{ visible?: boolean | null; multiPicking?: boolean | null; pickDepth?: number | null | undefined; } | undefined"}},scale:{defaultValue:null,description:"",name:"scale",required:!1,type:{name:"{ visible?: boolean | null; incrementValue?: number | null; widthPerUnit?: number | null | undefined; cssStyle?: Record<string, unknown> | null | undefined; } | undefined"}},coordinateUnit:{defaultValue:null,description:"",name:"coordinateUnit",required:!1,type:{name:"enum",value:[{value:'"m"'},{value:'"mm"'},{value:'"cm"'},{value:'"km"'},{value:'"in"'},{value:'"ft-us"'},{value:'"ft"'},{value:'"yd"'},{value:'"mi"'},{value:'"mm2"'},{value:'"cm2"'},{value:'"m2"'},{value:'"ha"'},{value:'"km2"'},{value:'"in2"'},{value:'"ft2"'},{value:'"ac"'},{value:'"mi2"'},{value:'"mcg"'},{value:'"mg"'},{value:'"g"'},{value:'"kg"'},{value:'"oz"'},{value:'"lb"'},{value:'"mt"'},{value:'"t"'},{value:'"mm3"'},{value:'"cm3"'},{value:'"ml"'},{value:'"l"'},{value:'"kl"'},{value:'"m3"'},{value:'"km3"'},{value:'"tsp"'},{value:'"Tbs"'},{value:'"in3"'},{value:'"fl-oz"'},{value:'"cup"'},{value:'"pnt"'},{value:'"qt"'},{value:'"gal"'},{value:'"ft3"'},{value:'"yd3"'},{value:'"mm3/s"'},{value:'"cm3/s"'},{value:'"ml/s"'},{value:'"cl/s"'},{value:'"dl/s"'},{value:'"l/s"'},{value:'"l/min"'},{value:'"l/h"'},{value:'"kl/s"'},{value:'"kl/min"'},{value:'"kl/h"'},{value:'"m3/s"'},{value:'"m3/min"'},{value:'"m3/h"'},{value:'"km3/s"'},{value:'"tsp/s"'},{value:'"Tbs/s"'},{value:'"in3/s"'},{value:'"in3/min"'},{value:'"in3/h"'},{value:'"fl-oz/s"'},{value:'"fl-oz/min"'},{value:'"fl-oz/h"'},{value:'"cup/s"'},{value:'"pnt/s"'},{value:'"pnt/min"'},{value:'"pnt/h"'},{value:'"qt/s"'},{value:'"gal/s"'},{value:'"gal/min"'},{value:'"gal/h"'},{value:'"ft3/s"'},{value:'"ft3/min"'},{value:'"ft3/h"'},{value:'"yd3/s"'},{value:'"yd3/min"'},{value:'"yd3/h"'},{value:'"C"'},{value:'"F"'},{value:'"K"'},{value:'"R"'},{value:'"ns"'},{value:'"mu"'},{value:'"ms"'},{value:'"s"'},{value:'"min"'},{value:'"h"'},{value:'"d"'},{value:'"week"'},{value:'"month"'},{value:'"year"'},{value:'"Hz"'},{value:'"mHz"'},{value:'"kHz"'},{value:'"MHz"'},{value:'"GHz"'},{value:'"THz"'},{value:'"rpm"'},{value:'"deg/s"'},{value:'"rad/s"'},{value:'"m/s"'},{value:'"km/h"'},{value:'"m/h"'},{value:'"knot"'},{value:'"ft/s"'},{value:'"s/m"'},{value:'"min/km"'},{value:'"s/ft"'},{value:'"min/mi"'},{value:'"Pa"'},{value:'"hPa"'},{value:'"kPa"'},{value:'"MPa"'},{value:'"bar"'},{value:'"torr"'},{value:'"psi"'},{value:'"ksi"'},{value:'"b"'},{value:'"Kb"'},{value:'"Mb"'},{value:'"Gb"'},{value:'"Tb"'},{value:'"B"'},{value:'"KB"'},{value:'"MB"'},{value:'"GB"'},{value:'"TB"'},{value:'"lx"'},{value:'"ft-cd"'},{value:'"ppm"'},{value:'"ppb"'},{value:'"ppt"'},{value:'"ppq"'},{value:'"V"'},{value:'"mV"'},{value:'"kV"'},{value:'"A"'},{value:'"mA"'},{value:'"kA"'},{value:'"W"'},{value:'"mW"'},{value:'"kW"'},{value:'"MW"'},{value:'"GW"'},{value:'"VA"'},{value:'"mVA"'},{value:'"kVA"'},{value:'"MVA"'},{value:'"GVA"'},{value:'"VAR"'},{value:'"mVAR"'},{value:'"kVAR"'},{value:'"MVAR"'},{value:'"GVAR"'},{value:'"Wh"'},{value:'"mWh"'},{value:'"kWh"'},{value:'"MWh"'},{value:'"GWh"'},{value:'"J"'},{value:'"kJ"'},{value:'"VARh"'},{value:'"mVARh"'},{value:'"kVARh"'},{value:'"MVARh"'},{value:'"GVARH"'},{value:'"deg"'},{value:'"rad"'},{value:'"grad"'},{value:'"arcmin"'},{value:'"arcsec"'}]}},colorTables:{defaultValue:null,description:"",name:"colorTables",required:!1,type:{name:"colorTablesArray"}},editedData:{defaultValue:null,description:"",name:"editedData",required:!1,type:{name:"Record<string, unknown>"}},setProps:{defaultValue:null,description:"",name:"setProps",required:!1,type:{name:"((data: Record<string, unknown>) => void)"}},checkDatafileSchema:{defaultValue:null,description:"Validate JSON datafile against schema",name:"checkDatafileSchema",required:!1,type:{name:"boolean"}},onMouseEvent:{defaultValue:null,description:"For get mouse events",name:"onMouseEvent",required:!1,type:{name:"((event: MapMouseEvent) => void)"}},getCameraPosition:{defaultValue:null,description:"",name:"getCameraPosition",required:!1,type:{name:"((input: ViewStateType) => void)"}},onRenderingProgress:{defaultValue:null,description:"Will be called while layers are processed to rendered data.\n@param progress vlaue between 0 and 100.",name:"onRenderingProgress",required:!1,type:{name:"((progress: number) => void)"}},onDragStart:{defaultValue:null,description:"",name:"onDragStart",required:!1,type:{name:"((info: PickingInfo, event: MjolnirGestureEvent) => void)"}},onDragEnd:{defaultValue:null,description:"",name:"onDragEnd",required:!1,type:{name:"((info: PickingInfo, event: MjolnirGestureEvent) => void)"}},triggerResetMultipleWells:{defaultValue:null,description:"",name:"triggerResetMultipleWells",required:!1,type:{name:"number"}},selection:{defaultValue:null,description:"Range selection of the current well",name:"selection",required:!1,type:{name:"{ well: string; selection: [number, number | undefined] | undefined; } | undefined"}},getTooltip:{defaultValue:null,description:"Override default tooltip with a callback.",name:"getTooltip",required:!1,type:{name:"TooltipCallback"}},lights:{defaultValue:null,description:"",name:"lights",required:!1,type:{name:"LightsType"}},typedArraySupport:{defaultValue:null,description:"If set to true allows to use typed arrays in layer description JS objects.",name:"typedArraySupport",required:!1,type:{name:"boolean"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/sharedSettings.tsx#EditedDataTemplate"]={docgenInfo:EditedDataTemplate.__docgenInfo,name:"EditedDataTemplate",path:"packages/subsurface-viewer/src/storybook/sharedSettings.tsx#EditedDataTemplate"})}catch(__react_docgen_typescript_loader_error){}},"../example-data/deckgl-map.json":function(module){module.exports=JSON.parse('[{"id":"DeckGL-Map","coords":{"visible":true,"multiPicking":true,"pickDepth":10},"scale":{"visible":true,"incrementValue":100,"widthPerUnit":100,"cssStyle":{"left":10,"top":10}},"coordinateUnit":"m","resources":{"propertyMap":"propertyMap.png","depthMap":"propertyMap.png","wellsData":"volve_wells.json","logData":"volve_logs.json"},"bounds":[432205,6475078,437720,6481113],"layers":[{"@@type":"ColormapLayer","image":"@@#resources.propertyMap","rotDeg":0,"bounds":[432205,6475078,437720,6481113],"colorMapName":"Rainbow","valueRange":[2782,3513],"colorMapRange":[2782,3513]},{"@@type":"Hillshading2DLayer","bounds":[432205,6475078,437720,6481113],"valueRange":[2782,3513],"rotDeg":0,"image":"@@#resources.depthMap"},{"@@type":"WellsLayer","data":"@@#resources.wellsData","logData":"@@#resources.logData","logrunName":"BLOCKING","logName":"ZONELOG","logColor":"Stratigraphy"},{"@@type":"FaultPolygonsLayer","data":"fault_polygons.geojson"},{"@@type":"PieChartLayer","data":"piechart.json"},{"@@type":"NorthArrow3DLayer","visible":true},{"@@type":"DrawingLayer"}],"editedData":{},"views":{"layout":[1,1],"showLabel":false,"viewports":[{"id":"view_1","show3D":false,"layerIds":[]}]}}]')}}]);