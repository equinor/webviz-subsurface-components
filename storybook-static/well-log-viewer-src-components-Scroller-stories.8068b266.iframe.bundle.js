/*! For license information please see well-log-viewer-src-components-Scroller-stories.8068b266.iframe.bundle.js.LICENSE.txt */
"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[6877],{"./packages/well-log-viewer/src/components/Scroller.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:function(){return Default},__namedExportsOrder:function(){return __namedExportsOrder}});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_Scroller__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/well-log-viewer/src/components/Scroller.tsx");__webpack_exports__.default={component:_Scroller__WEBPACK_IMPORTED_MODULE_1__.Z,title:"WellLogViewer/Components/Scroller",parameters:{storySource:{source:'import React from "react";\nimport Scroller from "./Scroller";\nconst ComponentCode = "const infoRef = React.useRef(); \\r\\n" + "const setInfo = function (info) { \\r\\n" + "    if (infoRef.current) infoRef.current.innerHTML = info; \\r\\n" + "}; \\r\\n" + "return ( \\r\\n" + \'    <div style={{ height: "92vh" }}> \\r\\n\' + "        <Scroller \\r\\n" + "            ref={(el) => { \\r\\n" + "                el.zoom(10, 10); \\r\\n" + "                el.scrollTo(0.2, 0.2); \\r\\n" + "            }} \\r\\n" + "            onScroll={(x, y) => { \\r\\n" + "                setInfo( \\r\\n" + \'                    "Scroll position X=" + \\r\\n\' + "                        x.toFixed(2) + \\r\\n" + \'                        ", Y=" + \\r\\n\' + "                        y.toFixed(2) \\r\\n" + "                ); \\r\\n" + "            }} \\r\\n" + "        > \\r\\n" + "            <div ref={infoRef}></div> \\r\\n" + "        </Scroller> \\r\\n" + "    </div> \\r\\n" + "); \\r\\n";\nexport default {\n  component: Scroller,\n  title: "WellLogViewer/Components/Scroller",\n  parameters: {\n    docs: {\n      description: {\n        component: "Auxiliary component to create scrolbars."\n      }\n    },\n    componentSource: {\n      code: ComponentCode,\n      language: "javascript"\n    }\n  },\n  argTypes: {\n    onScroll: {\n      description: "Callback with new scroll positions"\n    }\n  }\n};\nconst Template = args => {\n  const infoRef = React.useRef();\n  const setInfo = function (info) {\n    if (infoRef.current) infoRef.current.innerHTML = info;\n  };\n  return /*#__PURE__*/React.createElement("div", {\n    style: {\n      height: "92vh"\n    }\n  }, /*#__PURE__*/React.createElement(Scroller, {\n    ref: el => {\n      el.zoom(10, 10);\n      el.scrollTo(0.2, 0.2);\n    },\n    onScroll: (x, y) => {\n      setInfo("Scroll position X=" + x.toFixed(2) + ", Y=" + y.toFixed(2));\n      args.onScroll(x, y); // for storybook addon Actions Tab\n    }\n  }, /*#__PURE__*/React.createElement("div", {\n    ref: infoRef\n  })));\n};\nexport const Default = Template.bind({});\nDefault.args = {};',locationsMap:{default:{startLoc:{col:17,line:24},endLoc:{col:1,line:45},startBody:{col:17,line:24},endBody:{col:1,line:45}}}},docs:{description:{component:"Auxiliary component to create scrolbars."}},componentSource:{code:'const infoRef = React.useRef(); \r\nconst setInfo = function (info) { \r\n    if (infoRef.current) infoRef.current.innerHTML = info; \r\n}; \r\nreturn ( \r\n    <div style={{ height: "92vh" }}> \r\n        <Scroller \r\n            ref={(el) => { \r\n                el.zoom(10, 10); \r\n                el.scrollTo(0.2, 0.2); \r\n            }} \r\n            onScroll={(x, y) => { \r\n                setInfo( \r\n                    "Scroll position X=" + \r\n                        x.toFixed(2) + \r\n                        ", Y=" + \r\n                        y.toFixed(2) \r\n                ); \r\n            }} \r\n        > \r\n            <div ref={infoRef}></div> \r\n        </Scroller> \r\n    </div> \r\n); \r\n',language:"javascript"}},argTypes:{onScroll:{description:"Callback with new scroll positions"}}};const Default=(args=>{const infoRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef();return react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{style:{height:"92vh"}},react__WEBPACK_IMPORTED_MODULE_0__.createElement(_Scroller__WEBPACK_IMPORTED_MODULE_1__.Z,{ref:el=>{el.zoom(10,10),el.scrollTo(.2,.2)},onScroll:(x,y)=>{var info;info="Scroll position X="+x.toFixed(2)+", Y="+y.toFixed(2),infoRef.current&&(infoRef.current.innerHTML=info),args.onScroll(x,y)}},react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{ref:infoRef})))}).bind({});Default.args={},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'args => {\n  const infoRef = React.useRef();\n  const setInfo = function (info) {\n    if (infoRef.current) infoRef.current.innerHTML = info;\n  };\n  return <div style={{\n    height: "92vh"\n  }}>\n            <Scroller ref={el => {\n      el.zoom(10, 10);\n      el.scrollTo(0.2, 0.2);\n    }} onScroll={(x, y) => {\n      setInfo("Scroll position X=" + x.toFixed(2) + ", Y=" + y.toFixed(2));\n      args.onScroll(x, y); // for storybook addon Actions Tab\n    }}>\n                <div ref={infoRef}></div>\n            </Scroller>\n        </div>;\n}',...Default.parameters?.docs?.source}}};const __namedExportsOrder=["Default"];try{Default.displayName="Default",Default.__docgenInfo={description:"",displayName:"Default",props:{}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/well-log-viewer/src/components/Scroller.stories.tsx#Default"]={docgenInfo:Default.__docgenInfo,name:"Default",path:"packages/well-log-viewer/src/components/Scroller.stories.tsx#Default"})}catch(__react_docgen_typescript_loader_error){}},"./packages/well-log-viewer/src/components/Scroller.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");class Scroller extends react__WEBPACK_IMPORTED_MODULE_0__.Component{constructor(props){super(props),this.scroller=null,this.scrollable=null,this.content=null,this.resizeObserver=new ResizeObserver((entries=>{const entry=entries[0];if(entry&&entry.target){const Width=entry.target.offsetWidth,Height=entry.target.offsetHeight;if(this.content){const{vertical:vertical,horizontal:horizontal}=function getScrollbarSizes(){const outer=document.createElement("div");outer.style.visibility="hidden",outer.style.overflow="scroll",document.body.appendChild(outer);const vertical=outer.offsetWidth-outer.clientWidth,horizontal=outer.offsetHeight-outer.clientHeight;return document.body.removeChild(outer),{vertical:vertical,horizontal:horizontal}}();this.content.style.width=Width-vertical+"px",this.content.style.height=Height-horizontal+"px"}}})),this.onScroll=this.onScroll.bind(this)}componentDidMount(){this.scroller&&this.resizeObserver.observe(this.scroller)}componentWillUnmount(){this.scroller&&this.resizeObserver.unobserve(this.scroller)}getScrollX(){const elOuter=this.scroller;if(!elOuter)return 0;const scrollWidth=elOuter.scrollWidth-elOuter.clientWidth;return scrollWidth?elOuter.scrollLeft/scrollWidth:0}getScrollY(){const elOuter=this.scroller;if(!elOuter)return 0;const scrollHeight=elOuter.scrollHeight-elOuter.clientHeight;return scrollHeight?elOuter.scrollTop/scrollHeight:0}getScrollPos(vertical){return vertical?this.getScrollY():this.getScrollX()}onScroll(){this.scroller&&this.props.onScroll&&this.props.onScroll(this.getScrollX(),this.getScrollY())}scrollTo(x,y){x<0?x=0:x>1&&(x=1),y<0?y=0:y>1&&(y=1);const elOuter=this.scroller;if(!elOuter)return!1;const scrollLeft=Math.round(x*(elOuter.scrollWidth-elOuter.clientWidth)),scrollTop=Math.round(y*(elOuter.scrollHeight-elOuter.clientHeight));return(elOuter.scrollLeft!==scrollLeft||elOuter.scrollTop!==scrollTop)&&(elOuter.scrollTo(scrollLeft,scrollTop),!0)}zoom(xZoom,yZoom){const elOuter=this.scroller;if(!elOuter)return!1;const elInner=this.scrollable;if(!elInner)return!1;const widthInner=Math.round(elOuter.clientWidth*xZoom)+"px",heightInner=Math.round(elOuter.clientHeight*yZoom)+"px";return(elInner.style.width!==widthInner||elInner.style.height!==heightInner)&&(elInner.style.width=widthInner,elInner.style.height=heightInner,!0)}render(){return react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{ref:el=>this.scroller=el,style:{overflow:"scroll",width:"100%",height:"100%"},onScroll:this.onScroll},react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{ref:el=>this.scrollable=el},react__WEBPACK_IMPORTED_MODULE_0__.createElement("div",{ref:el=>this.content=el,style:{position:"absolute"}},this.props.children)))}}Scroller.displayName="Scroller",__webpack_exports__.Z=Scroller;try{Scroller.displayName="Scroller",Scroller.__docgenInfo={description:"",displayName:"Scroller",props:{onScroll:{defaultValue:null,description:"callback with new scroll positions",name:"onScroll",required:!1,type:{name:"((x: number, y: number) => void)"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/well-log-viewer/src/components/Scroller.tsx#Scroller"]={docgenInfo:Scroller.__docgenInfo,name:"Scroller",path:"packages/well-log-viewer/src/components/Scroller.tsx#Scroller"})}catch(__react_docgen_typescript_loader_error){}}}]);