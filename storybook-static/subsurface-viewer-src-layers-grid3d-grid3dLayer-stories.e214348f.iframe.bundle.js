"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[9141],{"./packages/subsurface-viewer/src/layers/grid3d/grid3dLayer.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{PolyhedralCells:function(){return PolyhedralCells},Simgrid:function(){return Simgrid},Simgrid2x:function(){return Simgrid2x},Simgrid4x:function(){return Simgrid4x},Simgrid8xIJonly:function(){return Simgrid8xIJonly},SimgridArrayInput:function(){return SimgridArrayInput},__namedExportsOrder:function(){return __namedExportsOrder},default:function(){return grid3dLayer_stories}});var react=__webpack_require__("./node_modules/react/index.js"),create=__webpack_require__("./node_modules/mathjs/lib/esm/core/create.js"),allFactoriesAny=__webpack_require__("./node_modules/mathjs/lib/esm/entry/allFactoriesAny.js"),SubsurfaceViewer=__webpack_require__("./packages/subsurface-viewer/src/SubsurfaceViewer.tsx"),TruncatedSnubCube=__webpack_require__("./packages/subsurface-viewer/src/layers/grid3d/test_data/TruncatedSnubCube.ts");const C0=(3-Math.sqrt(5))/4,C1=(Math.sqrt(5)-1)/4,C2=(1+Math.sqrt(5))/4,Points=[.5,0,C2,.5,0,-C2,-.5,0,C2,-.5,0,-C2,0,C2,.5,0,C2,-.5,0,-C2,.5,0,-C2,-.5,C2,.5,0,-C2,-.5,0,0,C0,.5,0,C0,-.5,0,-C0,.5,0,-C0,-.5,C1,C1,C1,C1,C1,-C1,-C1,-C1,C1,-C1,-C1,-C1,C0,.5,0,-C0,-.5,0];var grid3dLayer_stories={parameters:{storySource:{source:'import React from "react";\nimport { create, all } from "mathjs";\nimport SubsurfaceViewer, { TGrid3DColoringMode } from "../../SubsurfaceViewer";\nimport { Points as SnubCubePoints, Faces as SnubCubeFaces, VertexCount as SnubCubeVertexCount } from "./test_data/TruncatedSnubCube";\nimport { Points as ToroidPoints, Faces as ToroidFaces, VertexCount as ToroidVertexCount } from "./test_data/PentagonalToroid";\nexport default {\n  component: SubsurfaceViewer,\n  title: "SubsurfaceViewer/Grid3D Layer"\n};\nconst Template = args => /*#__PURE__*/React.createElement(SubsurfaceViewer, args);\nconst defaultProps = {\n  bounds: [456150, 5925800, 467400, 5939500],\n  views: {\n    layout: [1, 1],\n    viewports: [{\n      id: "view_1",\n      show3D: true\n    }]\n  }\n};\n\n// Grid 3d story\nconst grid3dLayer = {\n  "@@type": "Grid3DLayer",\n  id: "Grid3DLayer",\n  gridLines: true,\n  material: true,\n  colorMapName: "Rainbow",\n  ZIncreasingDownwards: false\n};\nconst axes = {\n  "@@type": "AxesLayer",\n  id: "axes-layer2",\n  bounds: [453150, 5925800, -2000, 469400, 5939500, 0],\n  ZIncreasingDownwards: false\n};\nconst parameters = {\n  docs: {\n    description: {\n      story: "Simgrid."\n    },\n    inlineStories: false,\n    iframeHeight: 500\n  }\n};\nexport const Simgrid = Template.bind({});\nSimgrid.args = {\n  ...defaultProps,\n  id: "grid-3d",\n  layers: [axes, {\n    ...grid3dLayer,\n    pointsData: "vtk-grid/Simgrid_points.json",\n    polysData: "vtk-grid/Simgrid_polys.json",\n    propertiesData: "vtk-grid/Simgrid_scalar.json",\n    pickable: true\n  }]\n};\nSimgrid.parameters = parameters;\nexport const SimgridArrayInput = Template.bind({});\nSimgridArrayInput.args = {\n  ...defaultProps,\n  id: "grid-3darray",\n  layers: [axes, {\n    ...grid3dLayer,\n    pointsData: [456063, 5935991, -1729, 456063, 5935991, -1731, 456138, 5935861.518843642, -1727.820068359375, 456138.5, 5935861.5, -1726.3526611328125, 456193.90625, 5936066, -1730.7259521484375, 456193.8825946293, 5936065.981075703, -1732.200439453125, 456268.9375, 5935936.5, -1726.6915283203125],\n    polysData: [4, 0, 1, 2, 3, 4, 0, 4, 5, 1, 4, 0, 3, 6, 4],\n    propertiesData: [0.2, 0.6, 0.8],\n    pickable: true\n  }]\n};\nSimgridArrayInput.parameters = parameters;\nexport const Simgrid2x = Template.bind({});\nSimgrid2x.args = {\n  ...defaultProps,\n  id: "grid-3d",\n  layers: [axes, {\n    ...grid3dLayer,\n    pointsData: "vtk-grid/Simgrid2x_points.json",\n    polysData: "vtk-grid/Simgrid2x_polys.json",\n    propertiesData: "vtk-grid/Simgrid2x_scalar.json",\n    pickable: true\n  }]\n};\nSimgrid2x.parameters = parameters;\nexport const Simgrid4x = Template.bind({});\nSimgrid4x.args = {\n  ...defaultProps,\n  id: "grid-3d",\n  layers: [axes, {\n    ...grid3dLayer,\n    ZIncreasingDownwards: false,\n    pointsData: "vtk-grid/Simgrid4x_points.json",\n    polysData: "vtk-grid/Simgrid4x_polys.json",\n    propertiesData: "vtk-grid/Simgrid4x_scalar.json",\n    pickable: true\n  }]\n};\nSimgrid4x.parameters = parameters;\nexport const Simgrid8xIJonly = Template.bind({});\nSimgrid8xIJonly.args = {\n  ...defaultProps,\n  id: "grid-3d",\n  layers: [axes, {\n    ...grid3dLayer,\n    pointsData: "vtk-grid/Simgrid8xIJonly_points.json",\n    polysData: "vtk-grid/Simgrid8xIJonly_polys.json",\n    propertiesData: "vtk-grid/Simgrid8xIJonly_scalar.json",\n    pickable: true\n  }]\n};\nSimgrid8xIJonly.parameters = parameters;\nconst math = create(all, {\n  randomSeed: "1984"\n});\nconst randomFunc = math?.random ? math.random : Math.random;\nexport const PolyhedralCells = Template.bind({});\nPolyhedralCells.args = {\n  bounds: [-25, -25, 50, 30],\n  views: {\n    layout: [1, 1],\n    viewports: [{\n      id: "view_1",\n      show3D: true\n    }]\n  },\n  id: "grid-3d-polyhedral-cell",\n  layers: [{\n    ...axes,\n    id: "polyhedral-cells-axes",\n    bounds: [-15, -15, -15, 40, 20, 15]\n  }, {\n    ...grid3dLayer,\n    id: "polyhedral1",\n    coloringMode: TGrid3DColoringMode.Y,\n    pickable: true,\n    pointsData: SnubCubePoints.map(v => 10 * v),\n    polysData: SnubCubeFaces,\n    propertiesData: Array(SnubCubeVertexCount).fill(0).map(() => randomFunc() * 50),\n    colorMapRange: [-8, 8],\n    colorMapClampColor: [200, 200, 200],\n    colorMapName: "Porosity"\n  }, {\n    ...grid3dLayer,\n    id: "polyhedral2",\n    pickable: true,\n    pointsData: ToroidPoints.map(v => 10 * v).map((v, index) => index % 3 === 0 ? v + 30 : v),\n    polysData: ToroidFaces,\n    propertiesData: Array(ToroidVertexCount).fill(0).map(() => randomFunc() * 10),\n    coloringMode: TGrid3DColoringMode.Property\n  }]\n};\nPolyhedralCells.parameters = parameters;',locationsMap:{simgrid:{startLoc:{col:17,line:10},endLoc:{col:81,line:10},startBody:{col:17,line:10},endBody:{col:81,line:10}},"simgrid-array-input":{startLoc:{col:17,line:10},endLoc:{col:81,line:10},startBody:{col:17,line:10},endBody:{col:81,line:10}},"simgrid-2-x":{startLoc:{col:17,line:10},endLoc:{col:81,line:10},startBody:{col:17,line:10},endBody:{col:81,line:10}},"simgrid-4-x":{startLoc:{col:17,line:10},endLoc:{col:81,line:10},startBody:{col:17,line:10},endBody:{col:81,line:10}},"simgrid-8-x-i-jonly":{startLoc:{col:17,line:10},endLoc:{col:81,line:10},startBody:{col:17,line:10},endBody:{col:81,line:10}},"polyhedral-cells":{startLoc:{col:17,line:10},endLoc:{col:81,line:10},startBody:{col:17,line:10},endBody:{col:81,line:10}}}}},component:SubsurfaceViewer.Z,title:"SubsurfaceViewer/Grid3D Layer"};const Template=args=>react.createElement(SubsurfaceViewer.Z,args),defaultProps={bounds:[456150,5925800,467400,5939500],views:{layout:[1,1],viewports:[{id:"view_1",show3D:!0}]}},grid3dLayer={"@@type":"Grid3DLayer",id:"Grid3DLayer",gridLines:!0,material:!0,colorMapName:"Rainbow",ZIncreasingDownwards:!1},axes={"@@type":"AxesLayer",id:"axes-layer2",bounds:[453150,5925800,-2e3,469400,5939500,0],ZIncreasingDownwards:!1},parameters={docs:{description:{story:"Simgrid."},inlineStories:!1,iframeHeight:500}},Simgrid=Template.bind({});Simgrid.args={...defaultProps,id:"grid-3d",layers:[axes,{...grid3dLayer,pointsData:"vtk-grid/Simgrid_points.json",polysData:"vtk-grid/Simgrid_polys.json",propertiesData:"vtk-grid/Simgrid_scalar.json",pickable:!0}]},Simgrid.parameters=parameters;const SimgridArrayInput=Template.bind({});SimgridArrayInput.args={...defaultProps,id:"grid-3darray",layers:[axes,{...grid3dLayer,pointsData:[456063,5935991,-1729,456063,5935991,-1731,456138,5935861.518843642,-1727.820068359375,456138.5,5935861.5,-1726.3526611328125,456193.90625,5936066,-1730.7259521484375,456193.8825946293,5936065.981075703,-1732.200439453125,456268.9375,5935936.5,-1726.6915283203125],polysData:[4,0,1,2,3,4,0,4,5,1,4,0,3,6,4],propertiesData:[.2,.6,.8],pickable:!0}]},SimgridArrayInput.parameters=parameters;const Simgrid2x=Template.bind({});Simgrid2x.args={...defaultProps,id:"grid-3d",layers:[axes,{...grid3dLayer,pointsData:"vtk-grid/Simgrid2x_points.json",polysData:"vtk-grid/Simgrid2x_polys.json",propertiesData:"vtk-grid/Simgrid2x_scalar.json",pickable:!0}]},Simgrid2x.parameters=parameters;const Simgrid4x=Template.bind({});Simgrid4x.args={...defaultProps,id:"grid-3d",layers:[axes,{...grid3dLayer,ZIncreasingDownwards:!1,pointsData:"vtk-grid/Simgrid4x_points.json",polysData:"vtk-grid/Simgrid4x_polys.json",propertiesData:"vtk-grid/Simgrid4x_scalar.json",pickable:!0}]},Simgrid4x.parameters=parameters;const Simgrid8xIJonly=Template.bind({});Simgrid8xIJonly.args={...defaultProps,id:"grid-3d",layers:[axes,{...grid3dLayer,pointsData:"vtk-grid/Simgrid8xIJonly_points.json",polysData:"vtk-grid/Simgrid8xIJonly_polys.json",propertiesData:"vtk-grid/Simgrid8xIJonly_scalar.json",pickable:!0}]},Simgrid8xIJonly.parameters=parameters;const math=(0,create.U)(allFactoriesAny.$,{randomSeed:"1984"}),randomFunc=math?.random?math.random:Math.random,PolyhedralCells=Template.bind({});PolyhedralCells.args={bounds:[-25,-25,50,30],views:{layout:[1,1],viewports:[{id:"view_1",show3D:!0}]},id:"grid-3d-polyhedral-cell",layers:[{...axes,id:"polyhedral-cells-axes",bounds:[-15,-15,-15,40,20,15]},{...grid3dLayer,id:"polyhedral1",coloringMode:SubsurfaceViewer.W.Y,pickable:!0,pointsData:TruncatedSnubCube.wo.map((v=>10*v)),polysData:TruncatedSnubCube.OQ,propertiesData:Array(TruncatedSnubCube.sr).fill(0).map((()=>50*randomFunc())),colorMapRange:[-8,8],colorMapClampColor:[200,200,200],colorMapName:"Porosity"},{...grid3dLayer,id:"polyhedral2",pickable:!0,pointsData:Points.map((v=>10*v)).map(((v,index)=>index%3==0?v+30:v)),polysData:[5,0,6,16,12,10,5,1,8,18,15,11,5,2,4,14,10,12,5,3,9,19,17,13,5,4,5,15,18,14,5,5,3,13,11,15,5,6,7,17,19,16,5,7,1,11,13,17,5,8,0,10,14,18,5,9,2,12,16,19,3,2,6,0,3,2,0,4,3,3,1,7,3,3,7,9,3,4,0,8,3,4,8,5,3,5,8,1,3,5,1,3,3,6,2,9,3,6,9,7],propertiesData:Array(80).fill(0).map((()=>10*randomFunc())),coloringMode:SubsurfaceViewer.W.Property}]},PolyhedralCells.parameters=parameters,Simgrid.parameters={...Simgrid.parameters,docs:{...Simgrid.parameters?.docs,source:{originalSource:"args => <SubsurfaceViewer {...args} />",...Simgrid.parameters?.docs?.source}}},SimgridArrayInput.parameters={...SimgridArrayInput.parameters,docs:{...SimgridArrayInput.parameters?.docs,source:{originalSource:"args => <SubsurfaceViewer {...args} />",...SimgridArrayInput.parameters?.docs?.source}}},Simgrid2x.parameters={...Simgrid2x.parameters,docs:{...Simgrid2x.parameters?.docs,source:{originalSource:"args => <SubsurfaceViewer {...args} />",...Simgrid2x.parameters?.docs?.source}}},Simgrid4x.parameters={...Simgrid4x.parameters,docs:{...Simgrid4x.parameters?.docs,source:{originalSource:"args => <SubsurfaceViewer {...args} />",...Simgrid4x.parameters?.docs?.source}}},Simgrid8xIJonly.parameters={...Simgrid8xIJonly.parameters,docs:{...Simgrid8xIJonly.parameters?.docs,source:{originalSource:"args => <SubsurfaceViewer {...args} />",...Simgrid8xIJonly.parameters?.docs?.source}}},PolyhedralCells.parameters={...PolyhedralCells.parameters,docs:{...PolyhedralCells.parameters?.docs,source:{originalSource:"args => <SubsurfaceViewer {...args} />",...PolyhedralCells.parameters?.docs?.source}}};const __namedExportsOrder=["Simgrid","SimgridArrayInput","Simgrid2x","Simgrid4x","Simgrid8xIJonly","PolyhedralCells"]},"./packages/subsurface-viewer/src/layers/grid3d/test_data/TruncatedSnubCube.ts":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{OQ:function(){return Faces},sr:function(){return VertexCount},wo:function(){return Points}});const C0=.03022517647727011,C1=.03630716729159513,C2=.040977806224636225,C3=.04564293957876494,C4=.051724930393089966,C5=.08744289047276839,C6=.08897531081303763,C7=.09641163211454777,C8=.10383500001768008,C9=.10536742035794933,C10=.2450214662773631,C11=.25213479294506524,C12=.25578852648697925,C13=.2594078935254808,C14=.266521220193183,C15=.30296894256435697,C16=.3107539819206035,C17=.3137398958061564,C18=.3166836571239303,C19=.32446869648017684,C20=.3415821603133315,C21=.3421516282996725,C22=.3496389843387572,C23=.35707936458297945,C24=.35764883256932045,C25=.3919404789469772,C26=.40221538330780837,C27=.40271740948195195,C28=.40316532850196596,C29=.4134402328627971,C30=.4223523523667726,C31=.4257635648947752,C32=.43136191452063516,C33=.43690230845586675,C34=.44031352098386933,C35=.4714793574054987,C36=.47546003791984226,C37=.4804922200139097,C38=.4854598455082518,C39=.4894405260225954,C40=.6319974061364817,C41=.6358614860540425,C42=.6398421665683861,C43=.6410027320851348,C44=.6420771755897583,C45=.6439380803776656,C46=.647947477795688,C47=.6499219360216627,C49=.6855579590791095,C48=.6519281583100315,C50=.6889691716071121,C51=.6930683858709402,C52=.697074482834414,C53=.7004856953624166,C54=.7657290432607724,C55=.7691698956742122,C56=.7697393636605533,C57=.7720413833524075,C58=.7732108302879603,C59=.7742763923737797,C60=.7747913160528183,C61=.7797391712489629,C62=.7803086392353038,C63=.7805887324654148,C64=.9227051570193641,C65=.9237364928727411,C66=.9244082055612856,C67=.9268980705658701,C68=.9274353460160546,C69=.9278480157600277,C70=.9303378807646123,C71=.9310095934531567,C72=.9320409293065338,Points=[C72,-C25,-C2,-C72,C25,-C2,C25,C72,-C2,-C25,-C72,-C2,C71,-C15,C12,-C71,C15,C12,C15,C71,C12,-C15,-C71,C12,C10,C70,-C17,-C10,-C70,-C17,C70,-C10,-C17,-C70,C10,-C17,C0,C69,C27,-C0,-C69,C27,C69,-C0,C27,-C69,C0,C27,C28,-C1,-C68,-C28,C1,-C68,C1,C28,-C68,-C1,-C28,-C68,C26,C3,C68,-C26,-C3,C68,C3,-C26,C68,-C3,C26,C68,C18,-C11,C68,-C18,C11,C68,C11,C18,C68,-C11,-C18,C68,C16,C13,-C68,-C16,-C13,-C68,C13,-C16,-C68,-C13,C16,-C68,C4,-C67,-C27,-C4,C67,-C27,C67,C4,-C27,-C67,-C4,-C27,C14,-C66,C17,-C14,C66,C17,C66,C14,C17,-C66,-C14,C17,C65,C19,-C12,-C65,-C19,-C12,C19,-C65,-C12,-C19,C65,-C12,C64,C29,C2,-C64,-C29,C2,C29,-C64,C2,-C29,C64,C2,C63,-C40,-C7,-C63,C40,-C7,C40,C63,-C7,-C40,-C63,-C7,C62,-C35,C32,-C62,C35,C32,C35,C62,C32,-C35,-C62,C32,C30,C61,-C37,-C30,-C61,-C37,C61,-C30,-C37,-C61,C30,-C37,C38,-C31,C60,-C38,C31,C60,C31,C38,C60,-C31,-C38,C60,C36,C33,-C60,-C36,-C33,-C60,C33,-C36,-C60,-C33,C36,-C60,C5,C59,C43,-C5,-C59,C43,C59,-C5,C43,-C59,C5,C43,C44,-C6,-C58,-C44,C6,-C58,C6,C44,-C58,-C6,-C44,-C58,C42,C8,C58,-C42,-C8,C58,C8,-C42,C58,-C8,C42,C58,C9,-C57,-C43,-C9,C57,-C43,C57,C9,-C43,-C57,-C9,-C43,C34,-C56,C37,-C34,C56,C37,C56,C34,C37,-C56,-C34,C37,C55,C39,-C32,-C55,-C39,-C32,C39,-C55,-C32,-C39,C55,-C32,C54,C47,C7,-C54,-C47,C7,C47,-C54,C7,-C47,C54,C7,C53,-C41,-C22,-C53,C41,-C22,C41,C53,-C22,-C41,-C53,-C22,C20,C52,C45,-C20,-C52,C45,C52,-C20,C45,-C52,C20,C45,C46,-C21,-C51,-C46,C21,-C51,C21,C46,-C51,-C21,-C46,-C51,C42,C23,C51,-C42,-C23,C51,C23,-C42,C51,-C23,C42,C51,C24,-C50,-C45,-C24,C50,-C45,C50,C24,-C45,-C50,-C24,-C45,C49,C48,C22,-C49,-C48,C22,C48,-C49,C22,-C48,C49,C22],Faces=[8,0,10,34,40,44,38,14,4,8,1,11,35,41,45,39,15,5,8,2,8,33,43,47,37,12,6,8,3,9,32,42,46,36,13,7,8,16,30,19,29,17,31,18,28,8,20,26,23,25,21,27,22,24,6,52,102,60,110,84,118,6,53,103,61,111,85,119,6,54,100,62,108,86,116,6,55,101,63,109,87,117,6,56,98,88,114,64,106,6,57,99,89,115,65,107,6,58,96,90,112,66,104,6,59,97,91,113,67,105,6,0,4,52,118,94,48,6,1,5,53,119,95,49,6,2,6,54,116,92,50,6,3,7,55,117,93,51,6,8,56,106,74,81,33,6,9,57,107,75,80,32,6,10,58,104,72,82,34,6,11,59,105,73,83,35,6,12,37,85,111,79,68,6,13,36,84,110,78,69,6,14,38,86,108,76,70,6,15,39,87,109,77,71,6,16,28,64,114,82,72,6,17,29,65,115,83,73,6,18,31,67,113,81,74,6,19,30,66,112,80,75,6,20,24,60,102,70,76,6,21,25,61,103,71,77,6,22,27,63,101,69,78,6,23,26,62,100,68,79,6,40,88,98,50,92,44,6,41,89,99,51,93,45,6,42,90,96,48,94,46,6,43,91,97,49,95,47,5,0,48,96,58,10,5,1,49,97,59,11,5,2,50,98,56,8,5,3,51,99,57,9,5,4,14,70,102,52,5,5,15,71,103,53,5,6,12,68,100,54,5,7,13,69,101,55,5,16,72,104,66,30,5,17,73,105,67,31,5,18,74,106,64,28,5,19,75,107,65,29,5,20,76,108,62,26,5,21,77,109,63,27,5,22,78,110,60,24,5,23,79,111,61,25,5,32,80,112,90,42,5,33,81,113,91,43,5,34,82,114,88,40,5,35,83,115,89,41,5,36,46,94,118,84,5,37,47,95,119,85,5,38,44,92,116,86,5,39,45,93,117,87],VertexCount=354}}]);