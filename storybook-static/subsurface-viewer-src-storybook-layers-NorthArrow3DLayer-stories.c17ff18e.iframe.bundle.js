"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[127],{"./packages/subsurface-viewer/src/storybook/layers/NorthArrow3DLayer.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{NorthArrow2dDarkMode:function(){return NorthArrow2dDarkMode},NorthArrow3d:function(){return NorthArrow3d},__namedExportsOrder:function(){return __namedExportsOrder}});var _SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./packages/subsurface-viewer/src/SubsurfaceViewer.tsx"),_sharedSettings__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/subsurface-viewer/src/storybook/sharedSettings.tsx");const stories={component:_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_0__.A,title:"SubsurfaceViewer / North Arrow Layer",args:{triggerHome:0}};__webpack_exports__.default=stories;const white=[255,255,255,255],defaultArgs={id:"map",bounds:_sharedSettings__WEBPACK_IMPORTED_MODULE_1__.D8,layers:[_sharedSettings__WEBPACK_IMPORTED_MODULE_1__.vq,_sharedSettings__WEBPACK_IMPORTED_MODULE_1__.un],views:_sharedSettings__WEBPACK_IMPORTED_MODULE_1__.Hf},NorthArrow3d={args:{...defaultArgs,views:_sharedSettings__WEBPACK_IMPORTED_MODULE_1__.Hf},parameters:{docs:{..._sharedSettings__WEBPACK_IMPORTED_MODULE_1__.dr.docs,description:{story:"Example using north arrow in 3D."}}}},NorthArrow2dDarkMode={args:{...defaultArgs,layers:[{..._sharedSettings__WEBPACK_IMPORTED_MODULE_1__.vq,labelColor:white,axisColor:white},{..._sharedSettings__WEBPACK_IMPORTED_MODULE_1__.un,color:white}],views:_sharedSettings__WEBPACK_IMPORTED_MODULE_1__.eD,scale:{visible:!0,cssStyle:{color:"white"}}},parameters:{docs:{..._sharedSettings__WEBPACK_IMPORTED_MODULE_1__.dr.docs,description:{story:"Example using north arrow in 2D Dark Mode."}},backgrounds:{default:"dark"}}},__namedExportsOrder=["NorthArrow3d","NorthArrow2dDarkMode"];NorthArrow3d.parameters={...NorthArrow3d.parameters,docs:{...NorthArrow3d.parameters?.docs,source:{originalSource:'{\n  args: {\n    ...defaultArgs,\n    views: default3DViews\n  },\n  parameters: {\n    docs: {\n      ...defaultStoryParameters.docs,\n      description: {\n        story: "Example using north arrow in 3D."\n      }\n    }\n  }\n}',...NorthArrow3d.parameters?.docs?.source}}},NorthArrow2dDarkMode.parameters={...NorthArrow2dDarkMode.parameters,docs:{...NorthArrow2dDarkMode.parameters?.docs,source:{originalSource:'{\n  args: {\n    ...defaultArgs,\n    layers: [{\n      ...huginAxes3DLayer,\n      labelColor: white,\n      axisColor: white\n    }, {\n      ...northArrowLayer,\n      color: white\n    }],\n    views: default2DViews,\n    scale: {\n      visible: true,\n      cssStyle: {\n        color: "white"\n      }\n    }\n  },\n  parameters: {\n    docs: {\n      ...defaultStoryParameters.docs,\n      description: {\n        story: "Example using north arrow in 2D Dark Mode."\n      }\n    },\n    backgrounds: {\n      default: "dark"\n    }\n  }\n}',...NorthArrow2dDarkMode.parameters?.docs?.source}}}},"./packages/subsurface-viewer/src/storybook/sharedSettings.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{C9:function(){return hugin25mDepthMapLayer},Cp:function(){return hugin3DBounds},D8:function(){return hugin2DBounds},FS:function(){return volveWellsResources},HU:function(){return hugin25mKhNetmapMapLayer},Hf:function(){return default3DViews},Ly:function(){return classes},OU:function(){return customLayerWithTextData},Or:function(){return EditedDataTemplate},RT:function(){return colormapLayer},Uz:function(){return volveWellsWithLogsLayer},XC:function(){return customLayerWithPolylineData},bL:function(){return Root},c8:function(){return volveWellsFromResourcesLayer},d6:function(){return hugin5mKhNetmapMapLayer},dr:function(){return defaultStoryParameters},eD:function(){return default2DViews},j1:function(){return mainStyle},kn:function(){return redAxes2DLayer},lC:function(){return hillshadingLayer},oS:function(){return subsufaceProps},rz:function(){return volveWellsLayer},un:function(){return northArrowLayer},vq:function(){return huginAxes3DLayer},wi:function(){return hugin25mKhNetmapMapLayerPng},xR:function(){return customLayerWithPolygonData},z6:function(){return customLayerWithPolygonDataProps},zJ:function(){return volveWellsBounds}});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_mui_material_styles__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@mui/material/styles/styled.js"),_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/subsurface-viewer/src/SubsurfaceViewer.tsx"),_example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../example-data/deckgl-map.json");function _extends(){return _extends=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var r in t)({}).hasOwnProperty.call(t,r)&&(n[r]=t[r])}return n},_extends.apply(null,arguments)}const defaultStoryParameters={docs:{inlineStories:!1,iframeHeight:500}},classes={main:"default-main"},mainStyle={[`& .${classes.main}`]:{width:750,height:500,top:"50%",left:"50%",transform:"translate(-50%, -50%)",border:"1px solid black",background:"azure",position:"absolute"}},Root=(0,_mui_material_styles__WEBPACK_IMPORTED_MODULE_3__.Ay)("div")(mainStyle),subsufaceProps=_example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__[0],colormapLayer={..._example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__[0].layers[0],id:"colormap-layer"},hillshadingLayer={..._example_data_deckgl_map_json__WEBPACK_IMPORTED_MODULE_2__[0].layers[1],id:"hillshading-layer"},redAxes2DLayer={"@@type":"Axes2DLayer",id:"axes-layer",marginH:80,marginV:30,isLeftRuler:!0,isRightRuler:!1,isBottomRuler:!0,isTopRuler:!1,backgroundColor:[155,0,0,255]},hugin2DOrigin=[432150,6475800],hugin2DBounds=[432150,6475800,439400,6481500],hugin3DBounds=[432150,6475800,-2e3,439400,6481500,-3500],huginAxes3DLayer={"@@type":"AxesLayer",id:"axes-layer2",bounds:[432150,6475800,2e3,439400,6481500,3500]},northArrowLayer={"@@type":"NorthArrow3DLayer",id:"north-arrow-layer"},volveWellsResources={resources:{wellsData:"./volve_wells.json"}},volveWellsFromResourcesLayer={"@@type":"WellsLayer",id:"volve-wells",data:"@@#resources.wellsData",ZIncreasingDownwards:!1},volveWellsLayer={"@@type":"WellsLayer",id:"volve-wells",data:"./volve_wells.json",ZIncreasingDownwards:!1},volveWellsBounds=[432150,6475800,439400,6481500],volveWellsWithLogsLayer={"@@type":"WellsLayer",id:"volve-wells-with-logs",data:"./volve_wells.json",logData:"./volve_logs.json",logrunName:"BLOCKING",logName:"ZONELOG",logColor:"Stratigraphy",ZIncreasingDownwards:!1},hugin25mDepthMapLayer={"@@type":"MapLayer",id:"hugin_depth",meshData:"hugin_depth_25_m.float32",frame:{origin:hugin2DOrigin,count:[291,229],increment:[25,25],rotDeg:0},propertiesData:"hugin_depth_25_m.float32",contours:[0,100],isContoursDepth:!0,gridLines:!1,smoothShading:!0,material:!0},hugin25mKhNetmapMapLayer={...hugin25mDepthMapLayer,id:"hugin_kh_netmap",propertiesData:"kh_netmap_25_m.float32",colorMapName:"Physics"},hugin25mKhNetmapMapLayerPng={...hugin25mDepthMapLayer,meshData:"hugin_depth_25_m.png",propertiesData:"kh_netmap_25_m.png",colorMapName:"Physics"},hugin5mKhNetmapMapLayer={"@@type":"MapLayer",id:"mesh-layer",meshUrl:"hugin_depth_5_m.float32",frame:{origin:hugin2DOrigin,count:[1451,1141],increment:[5,5],rotDeg:0},propertiesUrl:"kh_netmap_5_m.float32",contours:[0,100],colorMapName:"Physics"},default2DViews={layout:[1,1],viewports:[{id:"view_1",show3D:!1}]},default3DViews={layout:[1,1],viewports:[{id:"view_1",show3D:!0}]},customLayerWithPolylineData={"@@type":"GeoJsonLayer",id:"geojson-line-layer",name:"Line",data:{type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:{type:"LineString",coordinates:[[434e3,6477500],[435500,6477500]]}}]},getLineWidth:20,lineWidthMinPixels:2},customLayerWithPolygonDataProps={id:"geojson-layer",data:{type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:[[[434562,6477595],[434562,6478595],[435062,6478595],[435062,6477595],[434562,6477595]]]}},getLineWidth:1,lineWidthMinPixels:1,lineWidthMaxPixels:1,getLineColor:[0,0,0],getFillColor:[255,255,0],opacity:1},customLayerWithPolygonData={...customLayerWithPolygonDataProps,"@@type":"GeoJsonLayer"},customLayerWithTextData={"@@type":"TextLayer",id:"text-layer",name:"Text",data:[{name:"Custom GeoJson layer",coordinates:[434800,6478695]}],pickable:!0,getPosition:d=>d.coordinates,getText:d=>d.name,getColor:[255,0,0],getSize:16,getAngle:0,getTextAnchor:"middle",getAlignmentBaseline:"center"},EditedDataTemplate=args=>{const[editedData,setEditedData]=react__WEBPACK_IMPORTED_MODULE_0__.useState(args.editedData);return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{setEditedData(args.editedData)}),[args.editedData]),react__WEBPACK_IMPORTED_MODULE_0__.createElement(_SubsurfaceViewer__WEBPACK_IMPORTED_MODULE_1__.A,_extends({},args,{editedData:editedData,setProps:updatedProps=>{setEditedData(updatedProps.editedData)}}))};EditedDataTemplate.__docgenInfo={description:"",methods:[],displayName:"EditedDataTemplate",props:{layers:{required:!1,tsType:{name:"Array",elements:[{name:"union",raw:"| Record<string, unknown>\n| Layer\n| false\n| null\n| undefined",elements:[{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},{name:"Layer"},{name:"literal",value:"false"},{name:"null"},{name:"undefined"}]}],raw:"TLayerDefinition[]"},description:"Array of externally created layers or layer definition records or JSON strings.\nAdd '@@typedArraySupport' : true in a layer definition in order to\nuse typed arrays as inputs."},setProps:{required:!1,tsType:{name:"signature",type:"function",raw:"(data: Record<string, unknown>) => void",signature:{arguments:[{type:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},name:"data"}],return:{name:"void"}}},description:"@deprecated Used by layers to propagate state to component, eg. selected\nwells from the Wells layer. Use client code to handle layer state\ninstead."}},composes:["Omit"]}},"../example-data/deckgl-map.json":function(module){module.exports=JSON.parse('[{"id":"DeckGL-Map","coords":{"visible":true,"multiPicking":true,"pickDepth":10},"scale":{"visible":true,"incrementValue":100,"widthPerUnit":100,"cssStyle":{"left":10,"top":10}},"coordinateUnit":"m","resources":{"propertyMap":"propertyMap.png","depthMap":"propertyMap.png","wellsData":"volve_wells.json","logData":"volve_logs.json"},"bounds":[432205,6475078,437720,6481113],"layers":[{"@@type":"ColormapLayer","image":"@@#resources.propertyMap","rotDeg":0,"bounds":[432205,6475078,437720,6481113],"colorMapName":"Rainbow","valueRange":[2782,3513],"colorMapRange":[2782,3513]},{"@@type":"Hillshading2DLayer","bounds":[432205,6475078,437720,6481113],"valueRange":[2782,3513],"rotDeg":0,"image":"@@#resources.depthMap"},{"@@type":"WellsLayer","data":"@@#resources.wellsData","logData":"@@#resources.logData","logrunName":"BLOCKING","logName":"ZONELOG","logColor":"Stratigraphy"},{"@@type":"FaultPolygonsLayer","data":"fault_polygons.geojson"},{"@@type":"PieChartLayer","data":"piechart.json"},{"@@type":"NorthArrow3DLayer","visible":true},{"@@type":"DrawingLayer"}],"editedData":{},"views":{"layout":[1,1],"showLabel":false,"viewports":[{"id":"view_1","show3D":false,"layerIds":[]}]}}]')}}]);