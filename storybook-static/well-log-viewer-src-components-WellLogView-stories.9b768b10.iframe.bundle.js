"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[2299],{"./packages/well-log-viewer/src/components/WellLogView.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:function(){return Default},Discrete:function(){return Discrete},__namedExportsOrder:function(){return __namedExportsOrder}});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_WellLogView__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/well-log-viewer/src/components/WellLogView.tsx"),_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@emerson-eps/color-tables/dist/index.js"),_example_data_L898MUD_json__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../example-data/L898MUD.json"),_example_data_volve_logs_json__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../example-data/volve_logs.json"),_utils_axes__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./packages/well-log-viewer/src/utils/axes.ts");function _extends(){return _extends=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var r in t)({}).hasOwnProperty.call(t,r)&&(n[r]=t[r])}return n},_extends.apply(null,arguments)}const welllogDefault=_example_data_L898MUD_json__WEBPACK_IMPORTED_MODULE_3__[0],welllogDiscrete=_example_data_volve_logs_json__WEBPACK_IMPORTED_MODULE_4__[0],stories={component:_WellLogView__WEBPACK_IMPORTED_MODULE_1__.Ay,title:"WellLogViewer/Components/WellLogView",parameters:{docs:{description:{component:"WellLogView is a basic react component to wrap [videx-wellog](https://github.com/equinor/videx-wellog) library for drawing well log data"}},componentSource:{code:'<WellLogView id="WellLogView" \r\n    horizontal=false \r\n    welllog={require("../../../../../example-data/L898MUD.json")[0]} \r\n    template={require("../../../../../example-data/welllog_template_1.json")} \r\n    colorTables={colorTables} \r\n/>',language:"javascript"}},argTypes:{..._WellLogView__WEBPACK_IMPORTED_MODULE_1__.uB,id:{description:"The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app."}}};__webpack_exports__.default=stories;const Template=args=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{height:"92vh"}},react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{width:"100%",height:"100%"}},react__WEBPACK_IMPORTED_MODULE_0__.createElement(_WellLogView__WEBPACK_IMPORTED_MODULE_1__.Ay,_extends({id:"WellLogView"},args)))),Default={args:{id:"Well-Log-View",horizontal:!1,welllog:welllogDefault,template:__webpack_require__("../example-data/welllog_template_1.json"),viewTitle:react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",null,react__WEBPACK_IMPORTED_MODULE_0__.createElement("i",null,"Well")," ",react__WEBPACK_IMPORTED_MODULE_0__.createElement("b",null,welllogDefault.header.well)),colorTables:_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_2__.$d,axisTitles:_utils_axes__WEBPACK_IMPORTED_MODULE_5__.x,axisMnemos:_utils_axes__WEBPACK_IMPORTED_MODULE_5__.N},render:args=>react__WEBPACK_IMPORTED_MODULE_0__.createElement(Template,args)},Discrete={args:{id:"Well-Log-View-Discrete",horizontal:!1,welllog:welllogDiscrete,template:__webpack_require__("../example-data/welllog_template_2.json"),viewTitle:"Well '"+welllogDiscrete.header.well+"'",colorTables:_emerson_eps_color_tables__WEBPACK_IMPORTED_MODULE_2__.$d,axisTitles:_utils_axes__WEBPACK_IMPORTED_MODULE_5__.x,axisMnemos:_utils_axes__WEBPACK_IMPORTED_MODULE_5__.N,options:{checkDatafileSchema:!0}},render:args=>react__WEBPACK_IMPORTED_MODULE_0__.createElement(Template,args)},__namedExportsOrder=["Default","Discrete"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'{\n  args: {\n    id: "Well-Log-View",\n    horizontal: false,\n    welllog: welllogDefault,\n    // TODO: Fix this the next time the file is edited.\n    // eslint-disable-next-line @typescript-eslint/no-require-imports\n    template: require("../../../../../example-data/welllog_template_1.json"),\n    viewTitle: <div>\n                <i>Well</i> <b>{welllogDefault.header.well}</b>\n            </div>,\n    colorTables: colorTables,\n    axisTitles: axisTitles,\n    axisMnemos: axisMnemos\n  },\n  render: args => <Template {...args} />\n}',...Default.parameters?.docs?.source}}},Discrete.parameters={...Discrete.parameters,docs:{...Discrete.parameters?.docs,source:{originalSource:'{\n  args: {\n    id: "Well-Log-View-Discrete",\n    horizontal: false,\n    welllog: welllogDiscrete,\n    // TODO: Fix this the next time the file is edited.\n    // eslint-disable-next-line @typescript-eslint/no-require-imports\n    template: require("../../../../../example-data/welllog_template_2.json"),\n    viewTitle: "Well \'" + welllogDiscrete.header.well + "\'",\n    colorTables: colorTables,\n    axisTitles: axisTitles,\n    axisMnemos: axisMnemos,\n    options: {\n      checkDatafileSchema: true\n    }\n  },\n  render: args => <Template {...args} />\n}',...Discrete.parameters?.docs?.source}}}}}]);