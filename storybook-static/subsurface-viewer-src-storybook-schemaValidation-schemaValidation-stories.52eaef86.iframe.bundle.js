"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[8779],{"./packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{ColorTableValidation:function(){return ColorTableValidation},FaultPolygonsValidation:function(){return FaultPolygonsValidation},GridLayerValidation:function(){return GridLayerValidation},PieLayerValidation:function(){return PieLayerValidation},WellsLayerValidation:function(){return WellsLayerValidation},__namedExportsOrder:function(){return __namedExportsOrder},default:function(){return schemaValidation_stories}});var react=__webpack_require__("./node_modules/react/index.js"),SubsurfaceViewer=__webpack_require__("./packages/subsurface-viewer/src/SubsurfaceViewer.tsx");var deckgl_map=__webpack_require__("../example-data/deckgl-map.json"),schemaValidation_stories={parameters:{storySource:{source:'import React from "react";\nimport SubsurfaceViewer from "../../SubsurfaceViewer";\nimport { sampleLogData, sampleWellsData, samplePieData, sampleGridData, sampleColorTable, sampleFaultPolygonsData } from "./sampleData";\nimport exampleData from "../../../../../../example-data/deckgl-map.json";\nexport default {\n  component: SubsurfaceViewer,\n  title: "SubsurfaceViewer/SchemaValidation"\n};\n\n// Template for when edited data needs to be captured.\nconst StoryTemplate = args => {\n  return /*#__PURE__*/React.createElement(SubsurfaceViewer, args);\n};\nexport const WellsLayerValidation = StoryTemplate.bind();\nWellsLayerValidation.args = {\n  ...exampleData[0],\n  layers: [{\n    ...exampleData[0].layers[4],\n    data: sampleWellsData,\n    logData: sampleLogData\n  }, {\n    ...exampleData[0].layers[6]\n  }],\n  legend: {\n    visible: false\n  },\n  checkDatafileSchema: true\n};\nexport const PieLayerValidation = StoryTemplate.bind();\nPieLayerValidation.args = {\n  ...exampleData[0],\n  layers: [{\n    "@@type": "PieChartLayer",\n    data: samplePieData\n  }],\n  checkDatafileSchema: true\n};\nexport const GridLayerValidation = StoryTemplate.bind();\nGridLayerValidation.args = {\n  ...exampleData[0],\n  layers: [{\n    ...exampleData[0].layers[2],\n    data: sampleGridData,\n    visible: true\n  }],\n  checkDatafileSchema: true\n};\nexport const FaultPolygonsValidation = StoryTemplate.bind();\nFaultPolygonsValidation.args = {\n  ...exampleData[0],\n  layers: [{\n    "@@type": "FaultPolygonsLayer",\n    data: sampleFaultPolygonsData\n  }],\n  checkDatafileSchema: true\n};\nexport const ColorTableValidation = StoryTemplate.bind();\nColorTableValidation.args = {\n  ...exampleData[0],\n  layers: [{\n    ...exampleData[0].layers[4],\n    logColor: "Colors_set_5",\n    logRadius: 15\n  }],\n  colorTables: sampleColorTable,\n  checkDatafileSchema: true\n};\nWellsLayerValidation.parameters = {\n  ...WellsLayerValidation.parameters,\n  docs: {\n    ...WellsLayerValidation.parameters?.docs,\n    source: {\n      originalSource: "args => {\\n  return <SubsurfaceViewer {...args} />;\\n}",\n      ...WellsLayerValidation.parameters?.docs?.source\n    }\n  }\n};\nPieLayerValidation.parameters = {\n  ...PieLayerValidation.parameters,\n  docs: {\n    ...PieLayerValidation.parameters?.docs,\n    source: {\n      originalSource: "args => {\\n  return <SubsurfaceViewer {...args} />;\\n}",\n      ...PieLayerValidation.parameters?.docs?.source\n    }\n  }\n};\nGridLayerValidation.parameters = {\n  ...GridLayerValidation.parameters,\n  docs: {\n    ...GridLayerValidation.parameters?.docs,\n    source: {\n      originalSource: "args => {\\n  return <SubsurfaceViewer {...args} />;\\n}",\n      ...GridLayerValidation.parameters?.docs?.source\n    }\n  }\n};\nFaultPolygonsValidation.parameters = {\n  ...FaultPolygonsValidation.parameters,\n  docs: {\n    ...FaultPolygonsValidation.parameters?.docs,\n    source: {\n      originalSource: "args => {\\n  return <SubsurfaceViewer {...args} />;\\n}",\n      ...FaultPolygonsValidation.parameters?.docs?.source\n    }\n  }\n};\nColorTableValidation.parameters = {\n  ...ColorTableValidation.parameters,\n  docs: {\n    ...ColorTableValidation.parameters?.docs,\n    source: {\n      originalSource: "args => {\\n  return <SubsurfaceViewer {...args} />;\\n}",\n      ...ColorTableValidation.parameters?.docs?.source\n    }\n  }\n};',locationsMap:{"wells-layer-validation":{startLoc:{col:22,line:11},endLoc:{col:1,line:13},startBody:{col:22,line:11},endBody:{col:1,line:13}},"pie-layer-validation":{startLoc:{col:22,line:11},endLoc:{col:1,line:13},startBody:{col:22,line:11},endBody:{col:1,line:13}},"grid-layer-validation":{startLoc:{col:22,line:11},endLoc:{col:1,line:13},startBody:{col:22,line:11},endBody:{col:1,line:13}},"fault-polygons-validation":{startLoc:{col:22,line:11},endLoc:{col:1,line:13},startBody:{col:22,line:11},endBody:{col:1,line:13}},"color-table-validation":{startLoc:{col:22,line:11},endLoc:{col:1,line:13},startBody:{col:22,line:11},endBody:{col:1,line:13}}}}},component:SubsurfaceViewer.Z,title:"SubsurfaceViewer/SchemaValidation"};const StoryTemplate=args=>react.createElement(SubsurfaceViewer.Z,args),WellsLayerValidation=StoryTemplate.bind();WellsLayerValidation.args={...deckgl_map[0],layers:[{...deckgl_map[0].layers[4],data:{type:"FeatureCollection",features:[{type:"Feature",geometry:{_wrongType:"GeometryCollection",geometries:[{type:"Point",coordinates:[437506.854656,6477887.47091]},{type:"LineString",coordinates:[[437506.85465554806,6477887.47091465,25],[437505.96268892975,6477887.532817844,-83.9951103268622],[437505.8497621946,6477887.5323076015,-97.94448791185415]]}]},properties:{name:"15/9-19 A",color:[28,255,12,255],md:[[0,109,122.94999694824219]]}}]},logData:[{header:{name:"EcoScope Data",well:"35/12-6S",source:"Converted from LIS by Log Studio 4.87 - Petroware AS",operator:"Logtek Petroleum",startIndex:2907,endIndex:2908,step:1},curves:[{_wrongName:"MD",description:"Measured depth",quantity:"length",unit:"m",valueType:"float",dimensions:1},{name:"A40H",description:"Attenuation resistivity 40 inch",quantity:"electrical resistivity",unit:"ohm.m",valueType:"float",dimensions:1}],data:[[2907,29.955],[2908,27.733]]}]},{...deckgl_map[0].layers[6]}],legend:{visible:!1},checkDatafileSchema:!0};const PieLayerValidation=StoryTemplate.bind();PieLayerValidation.args={...deckgl_map[0],layers:[{"@@type":"PieChartLayer",data:{pies:[{x:433600,y:6477600,R:100,fractions:[{value:99,idx:0},{value:"65",idx:1},{value:67,idx:2}]}],properties:[{color:[255,0,0],label:"oil"},{color:[0,0,255],label:"water"},{color:[0,255,0],label:"gas"}]}}],checkDatafileSchema:!0};const GridLayerValidation=StoryTemplate.bind();GridLayerValidation.args={...deckgl_map[0],layers:[{...deckgl_map[0].layers[2],data:[{i:0,j:11,z:3306.64,cs:[[432156.53,6477273.01,-3306.64],[432206.44,6477273.93,-3303.06],[432205.61,6477323.14,-3315.68],[432156.53,6477322.75,-3320.86]],vs:[0,1,0]},{i:0,j:12,z:3320.86,cs:[[432156.53,6477322.75,-3320.86],[432205.61,6477323.14,-3315.68],[432205.27,6477372.91,-3320.22],[432156.53,6477372.51,-3326.91]],vs:1}],visible:!0}],checkDatafileSchema:!0};const FaultPolygonsValidation=StoryTemplate.bind();FaultPolygonsValidation.args={...deckgl_map[0],layers:[{"@@type":"FaultPolygonsLayer",data:{type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Polygon",coordinates:[[[434562,6477595],[434562,6478595]]]},properties:{name:"Top_Hugin:F_52",color:[0,0,0,255]}}]}}],checkDatafileSchema:!0};const ColorTableValidation=StoryTemplate.bind();ColorTableValidation.args={...deckgl_map[0],layers:[{...deckgl_map[0].layers[4],logColor:"Colors_set_5",logRadius:15}],colorTables:[{name:"Physics",discrete:!1,description:"Full options color table",colorNaN:[255,255,255],colorBelow:[255,0,0],colorAbove:[0,0,255],colors:[[0,255,0,0],[.5,0,255,0],[1,0,0,255]]},{name:"Rainbow",discrete:"false",colors:[[0,255,0,0],[1,182,0,182]]},{name:"Colors_set_5",discrete:!0,colors:[[0,244,237,255],[1,255,171,178]]}],checkDatafileSchema:!0},WellsLayerValidation.parameters={...WellsLayerValidation.parameters,docs:{...WellsLayerValidation.parameters?.docs,source:{originalSource:"args => {\n  return <SubsurfaceViewer {...args} />;\n}",...WellsLayerValidation.parameters?.docs?.source}}},PieLayerValidation.parameters={...PieLayerValidation.parameters,docs:{...PieLayerValidation.parameters?.docs,source:{originalSource:"args => {\n  return <SubsurfaceViewer {...args} />;\n}",...PieLayerValidation.parameters?.docs?.source}}},GridLayerValidation.parameters={...GridLayerValidation.parameters,docs:{...GridLayerValidation.parameters?.docs,source:{originalSource:"args => {\n  return <SubsurfaceViewer {...args} />;\n}",...GridLayerValidation.parameters?.docs?.source}}},FaultPolygonsValidation.parameters={...FaultPolygonsValidation.parameters,docs:{...FaultPolygonsValidation.parameters?.docs,source:{originalSource:"args => {\n  return <SubsurfaceViewer {...args} />;\n}",...FaultPolygonsValidation.parameters?.docs?.source}}},ColorTableValidation.parameters={...ColorTableValidation.parameters,docs:{...ColorTableValidation.parameters?.docs,source:{originalSource:"args => {\n  return <SubsurfaceViewer {...args} />;\n}",...ColorTableValidation.parameters?.docs?.source}}};const __namedExportsOrder=["WellsLayerValidation","PieLayerValidation","GridLayerValidation","FaultPolygonsValidation","ColorTableValidation"];try{WellsLayerValidation.displayName="WellsLayerValidation",WellsLayerValidation.__docgenInfo={description:"",displayName:"WellsLayerValidation",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#WellsLayerValidation"]={docgenInfo:WellsLayerValidation.__docgenInfo,name:"WellsLayerValidation",path:"packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#WellsLayerValidation"})}catch(__react_docgen_typescript_loader_error){}try{PieLayerValidation.displayName="PieLayerValidation",PieLayerValidation.__docgenInfo={description:"",displayName:"PieLayerValidation",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#PieLayerValidation"]={docgenInfo:PieLayerValidation.__docgenInfo,name:"PieLayerValidation",path:"packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#PieLayerValidation"})}catch(__react_docgen_typescript_loader_error){}try{GridLayerValidation.displayName="GridLayerValidation",GridLayerValidation.__docgenInfo={description:"",displayName:"GridLayerValidation",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#GridLayerValidation"]={docgenInfo:GridLayerValidation.__docgenInfo,name:"GridLayerValidation",path:"packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#GridLayerValidation"})}catch(__react_docgen_typescript_loader_error){}try{FaultPolygonsValidation.displayName="FaultPolygonsValidation",FaultPolygonsValidation.__docgenInfo={description:"",displayName:"FaultPolygonsValidation",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#FaultPolygonsValidation"]={docgenInfo:FaultPolygonsValidation.__docgenInfo,name:"FaultPolygonsValidation",path:"packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#FaultPolygonsValidation"})}catch(__react_docgen_typescript_loader_error){}try{ColorTableValidation.displayName="ColorTableValidation",ColorTableValidation.__docgenInfo={description:"",displayName:"ColorTableValidation",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#ColorTableValidation"]={docgenInfo:ColorTableValidation.__docgenInfo,name:"ColorTableValidation",path:"packages/subsurface-viewer/src/storybook/schemaValidation/schemaValidation.stories.tsx#ColorTableValidation"})}catch(__react_docgen_typescript_loader_error){}},"../example-data/deckgl-map.json":function(module){module.exports=JSON.parse('[{"id":"DeckGL-Map","coords":{"visible":true,"multiPicking":true,"pickDepth":10},"scale":{"visible":true,"incrementValue":100,"widthPerUnit":100,"cssStyle":{"left":10,"top":10}},"legend":{"visible":true,"cssStyle":{"right":10,"top":10},"horizontal":false},"toolbar":{"visible":true},"coordinateUnit":"m","resources":{"propertyMap":"propertyMap.png","depthMap":"propertyMap.png","wellsData":"volve_wells.json","logData":"volve_logs.json"},"bounds":[432205,6475078,437720,6481113],"layers":[{"@@type":"ColormapLayer","image":"@@#resources.propertyMap","rotDeg":0,"bounds":[432205,6475078,437720,6481113],"colorMapName":"Rainbow","valueRange":[2782,3513],"colorMapRange":[2782,3513]},{"@@type":"Hillshading2DLayer","bounds":[432205,6475078,437720,6481113],"valueRange":[2782,3513],"rotDeg":0,"image":"@@#resources.depthMap"},{"@@type":"Map3DLayer","bounds":[432205,6475078,437720,6481113],"meshMaxError":5,"mesh":"hugin_depth_25_m_normalized_margin.png","meshValueRange":[2782,3513],"propertyTexture":"kh_netmap_25_m_normalized_margin.png","propertyValueRange":[2782,3513],"rotDeg":0,"contours":[0,50],"isContoursDepth":true,"colorMapName":"Physics","colorMapRange":[2782,3513],"visible":false},{"@@type":"WellsLayer","data":"@@#resources.wellsData","logData":"@@#resources.logData","logrunName":"BLOCKING","logName":"ZONELOG","logColor":"Stratigraphy"},{"@@type":"FaultPolygonsLayer","data":"fault_polygons.geojson"},{"@@type":"PieChartLayer","data":"piechart.json"},{"@@type":"NorthArrow3DLayer","visible":true},{"@@type":"DrawingLayer"}],"editedData":{},"views":{"layout":[1,1],"showLabel":false,"viewports":[{"id":"view_1","show3D":false,"layerIds":[]}]}}]')}}]);