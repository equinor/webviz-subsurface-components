"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[2648],{"./packages/subsurface-viewer/src/storybook/components/colorLegends/DiscreteLegend.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{DiscreteTemplate:function(){return DiscreteTemplate},__namedExportsOrder:function(){return __namedExportsOrder}});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@emerson-eps/color-tables/dist/index.js");__webpack_exports__.default={parameters:{storySource:{source:'import React from "react";\nimport { DiscreteColorLegend, colorTables } from "@emerson-eps/color-tables";\nexport default {\n  component: DiscreteColorLegend,\n  title: "SubsurfaceViewer/Components/ColorLegends/DiscreteColorLegend"\n};\nconst discreteData = {\n  Above_BCU: [[255, 13, 186, 255], 0],\n  ABOVE: [[255, 64, 53, 255], 1],\n  H12: [[247, 255, 164, 255], 2],\n  BELOW: [[73, 255, 35, 255], 14],\n  H3: [[255, 144, 1, 255], 11]\n};\nconst colorName = "Stratigraphy";\nconst dataObjectName = "Wells / ZONELOG";\nconst position = [16, 10];\nconst horizontal = false;\nconst Template = args => {\n  return /*#__PURE__*/React.createElement(DiscreteColorLegend, args);\n};\nexport const DiscreteTemplate = Template.bind({});\nDiscreteTemplate.args = {\n  discreteData,\n  dataObjectName,\n  position,\n  colorName,\n  colorTables,\n  horizontal\n};\nDiscreteTemplate.parameters = {\n  ...DiscreteTemplate.parameters,\n  docs: {\n    ...DiscreteTemplate.parameters?.docs,\n    source: {\n      originalSource: "args => {\\n  return <DiscreteColorLegend {...args} />;\\n}",\n      ...DiscreteTemplate.parameters?.docs?.source\n    }\n  }\n};',locationsMap:{"discrete-template":{startLoc:{col:17,line:18},endLoc:{col:1,line:20},startBody:{col:17,line:18},endBody:{col:1,line:20}}}}},component:_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_1__.Ri,title:"SubsurfaceViewer/Components/ColorLegends/DiscreteColorLegend"};const DiscreteTemplate=(args=>react__WEBPACK_IMPORTED_MODULE_0__.createElement(_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_1__.Ri,args)).bind({});DiscreteTemplate.args={discreteData:{Above_BCU:[[255,13,186,255],0],ABOVE:[[255,64,53,255],1],H12:[[247,255,164,255],2],BELOW:[[73,255,35,255],14],H3:[[255,144,1,255],11]},dataObjectName:"Wells / ZONELOG",position:[16,10],colorName:"Stratigraphy",colorTables:_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_1__.Su,horizontal:!1},DiscreteTemplate.parameters={...DiscreteTemplate.parameters,docs:{...DiscreteTemplate.parameters?.docs,source:{originalSource:"args => {\n  return <DiscreteColorLegend {...args} />;\n}",...DiscreteTemplate.parameters?.docs?.source}}};const __namedExportsOrder=["DiscreteTemplate"];try{DiscreteTemplate.displayName="DiscreteTemplate",DiscreteTemplate.__docgenInfo={description:"",displayName:"DiscreteTemplate",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/storybook/components/colorLegends/DiscreteLegend.stories.tsx#DiscreteTemplate"]={docgenInfo:DiscreteTemplate.__docgenInfo,name:"DiscreteTemplate",path:"packages/subsurface-viewer/src/storybook/components/colorLegends/DiscreteLegend.stories.tsx#DiscreteTemplate"})}catch(__react_docgen_typescript_loader_error){}}}]);