"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[9056],{"./packages/subsurface-viewer/src/storybook/components/DistanceScale.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{DarkMode:function(){return DarkMode},LightMode:function(){return LightMode},__namedExportsOrder:function(){return __namedExportsOrder}});const stories={component:__webpack_require__("./packages/subsurface-viewer/src/components/DistanceScale.tsx").q,title:"SubsurfaceViewer / Components / DistanceScale"};__webpack_exports__.default=stories;const LightMode={},DarkMode={args:{style:{color:"white"}},parameters:{backgrounds:{default:"dark"}}},__namedExportsOrder=["LightMode","DarkMode"];LightMode.parameters={...LightMode.parameters,docs:{...LightMode.parameters?.docs,source:{originalSource:"{}",...LightMode.parameters?.docs?.source}}},DarkMode.parameters={...DarkMode.parameters,docs:{...DarkMode.parameters?.docs,source:{originalSource:'{\n  args: {\n    style: darkModeStyle\n  },\n  parameters: {\n    backgrounds: {\n      default: "dark"\n    }\n  }\n}',...DarkMode.parameters?.docs?.source}}}},"./packages/subsurface-viewer/src/components/DistanceScale.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{q:function(){return DistanceScale}});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),convert_units__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/convert-units/lib/index.js"),convert_units__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(convert_units__WEBPACK_IMPORTED_MODULE_1__);const DistanceScale=({zoom:zoom=-3,incrementValue:incrementValue=100,widthPerUnit:widthPerUnit=100,style:style,scaleUnit:scaleUnit="m"})=>{if(!(zoom&&widthPerUnit&&incrementValue&&scaleUnit))return null;if(!convert_units__WEBPACK_IMPORTED_MODULE_1___default()().possibilities().includes(scaleUnit))return null;const widthInUnits=widthPerUnit/Math.pow(2,zoom),scaleValue=widthInUnits<incrementValue?Math.round(widthInUnits):(num=widthInUnits,step=incrementValue,Math.floor(num/step+.5)*step);var num,step;const convertedUnit=convert_units__WEBPACK_IMPORTED_MODULE_1___default()(scaleValue).from(scaleUnit).toBest().unit,convertedValue=convert_units__WEBPACK_IMPORTED_MODULE_1___default()(scaleValue).from(scaleUnit).toBest().val,scaleRulerStyle={width:scaleValue*Math.pow(2,zoom),height:"4px",border:"2px solid",borderTop:"none",display:"inline-block",marginLeft:"3px"};return react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{position:"absolute",...style}},react__WEBPACK_IMPORTED_MODULE_0__.createElement("label",{style:{...style}},convertedValue.toFixed(0),convertedUnit),react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:scaleRulerStyle}))};DistanceScale.__docgenInfo={description:"",methods:[],displayName:"DistanceScale",props:{zoom:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"-3",computed:!1}},incrementValue:{required:!1,tsType:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}]},description:"",defaultValue:{value:"100",computed:!1}},widthPerUnit:{required:!1,tsType:{name:"union",raw:"number | null",elements:[{name:"number"},{name:"null"}]},description:"",defaultValue:{value:"100",computed:!1}},style:{required:!1,tsType:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},description:""},scaleUnit:{required:!1,tsType:{name:"Unit"},description:"",defaultValue:{value:'"m"',computed:!1}}}}}}]);