/*! For license information please see subsurface-viewer-src-storybook-components-settings-NumericInput-stories.f3561d4f.iframe.bundle.js.LICENSE.txt */
"use strict";(self.webpackChunk_webviz_subsurface_components=self.webpackChunk_webviz_subsurface_components||[]).push([[5855],{"./node_modules/@emotion/is-prop-valid/dist/emotion-is-prop-valid.esm.js":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{Z:function(){return isPropValid}});var _emotion_memoize__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/@emotion/memoize/dist/emotion-memoize.esm.js"),reactPropsRegex=/^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|download|draggable|encType|enterKeyHint|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/,isPropValid=(0,_emotion_memoize__WEBPACK_IMPORTED_MODULE_0__.Z)((function(prop){return reactPropsRegex.test(prop)||111===prop.charCodeAt(0)&&110===prop.charCodeAt(1)&&prop.charCodeAt(2)<91}))},"./node_modules/@emotion/memoize/dist/emotion-memoize.esm.js":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){function memoize(fn){var cache=Object.create(null);return function(arg){return void 0===cache[arg]&&(cache[arg]=fn(arg)),cache[arg]}}__webpack_require__.d(__webpack_exports__,{Z:function(){return memoize}})},"./packages/subsurface-viewer/src/storybook/components/settings/NumericInput.stories.tsx":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{NumericInputStory:function(){return NumericInputStory},__namedExportsOrder:function(){return __namedExportsOrder},default:function(){return NumericInput_stories}});var react=__webpack_require__("./node_modules/react/index.js"),Label=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-core-react/dist/esm/components/Label/Label.js"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),templates_focus=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-utils/dist/esm/utils/templates/focus.mjs"),templates=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-utils/dist/esm/utils/templates/index.mjs");const typographyMixin=typography=>{const{fontFamily:fontFamily,fontSize:fontSize,fontWeight:fontWeight,lineHeight:lineHeight,letterSpacing:letterSpacing,fontFeature:fontFeature,textDecoration:textDecoration,textTransform:textTransform,fontStyle:fontStyle}=typography;return{fontFeatureSettings:fontFeature,fontFamily:fontFamily,fontSize:fontSize,fontWeight:fontWeight,letterSpacing:letterSpacing,lineHeight:lineHeight,textDecoration:textDecoration,textTransform:textTransform,fontStyle:fontStyle}};var useToken=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-utils/dist/esm/hooks/useToken.mjs"),esm=__webpack_require__("./node_modules/@equinor/eds-tokens/dist/esm/index.mjs"),mergeDeepRight=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-core-react/dist/esm/node_modules/.pnpm/ramda@0.29.1/node_modules/ramda/es/mergeDeepRight.js");const{colors:{ui:{background__light:{rgba:background}},text:{static_icons__default:static_icons__default,static_icons__tertiary:static_icons__tertiary},interactive:{disabled__text:disabled__text,primary__resting:primary__resting,danger__resting:danger__resting,danger__hover:danger__hover,warning__resting:warning__resting,warning__hover:warning__hover,success__resting:success__resting,success__hover:success__hover}},spacings:{comfortable:{small:small,x_small:x_small}},typography:typography,shape:shape}=esm.tokens,input={height:shape.straight.minHeight,width:"100%",background:background,spacings:{left:small,right:small,top:"6px",bottom:"6px"},typography:{...typography.input.text,color:static_icons__default.rgba},outline:{type:"outline",color:"transparent",width:"1px",style:"solid",offset:"0px"},entities:{placeholder:{typography:{color:static_icons__tertiary.rgba}},adornment:{typography:{...typography.input.label,color:static_icons__tertiary.rgba},spacings:{left:small,right:small},states:{disabled:{typography:{color:disabled__text.rgba}}}}},states:{disabled:{typography:{color:disabled__text.rgba}},readOnly:{background:"transparent",boxShadow:"none"},active:{},focus:{outline:{type:"outline",width:"2px",color:primary__resting.rgba,style:"solid",offset:"0px"}}},boxShadow:"inset 0px -1px 0px 0px "+static_icons__tertiary.rgba,modes:{compact:{height:shape._modes.compact.straight.minHeight,spacings:{left:x_small,right:x_small,top:x_small,bottom:x_small}}}},inputToken={input:input,error:(0,mergeDeepRight.Z)(input,{boxShadow:"none",outline:{color:danger__resting.rgba},states:{focus:{outline:{color:danger__hover.rgba}}},entities:{adornment:{typography:{...typography.input.label,color:danger__resting.rgba},states:{focus:{outline:{color:danger__hover.rgba}}}}}}),warning:(0,mergeDeepRight.Z)(input,{boxShadow:"none",outline:{color:warning__resting.rgba},states:{focus:{outline:{color:warning__hover.rgba}}},entities:{adornment:{typography:{...typography.input.label,color:warning__resting.rgba},states:{focus:{outline:{color:warning__hover.rgba}}}}}}),success:(0,mergeDeepRight.Z)(input,{boxShadow:"none",outline:{color:success__resting.rgba},states:{focus:{outline:{color:success__hover.rgba}}},entities:{adornment:{typography:{...typography.input.label,color:success__resting.rgba},states:{focus:{outline:{color:success__hover.rgba}}}}}})};var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js"),eds_context=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-core-react/dist/esm/components/EdsProvider/eds.context.js");const Container=styled_components_browser_esm.ZP.div.withConfig({displayName:"Input__Container",componentId:"sc-1ykv024-0"})((({$token:$token,disabled:disabled,readOnly:readOnly})=>{const{states:states,entities:entities}=$token;return(0,styled_components_browser_esm.iv)(["--eds-input-adornment-color:",";--eds-input-color:",";position:relative;height:",";width:",";display:flex;flex-direction:row;border:none;box-sizing:border-box;box-shadow:",";background:var(--eds-input-background,",");"," &:focus-within{--eds-input-adornment-color:",";box-shadow:none;","}"," "," & > input{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}"],entities.adornment.typography.color,$token.typography.color,$token.height,$token.width,$token.boxShadow,$token.background,(0,templates_focus.p)($token.outline),entities.adornment?.states.focus?.outline.color,(0,templates_focus.p)(states.focus.outline),disabled&&(0,styled_components_browser_esm.iv)(["--eds-input-adornment-color:",";--eds-input-color:",";cursor:not-allowed;box-shadow:none;"],states.disabled.typography.color,states.disabled.typography.color),readOnly&&(0,styled_components_browser_esm.iv)({background:states.readOnly.background,boxShadow:states.readOnly.boxShadow}))})),StyledInput=styled_components_browser_esm.ZP.input.withConfig({displayName:"Input__StyledInput",componentId:"sc-1ykv024-1"})((({$token:$token,$paddingLeft:$paddingLeft,$paddingRight:$paddingRight})=>(0,styled_components_browser_esm.iv)(["width:100%;border:none;background:transparent;"," "," outline:none;padding-left:",";padding-right:",";&::placeholder{color:",";}&:disabled{color:var(--eds-input-color);cursor:not-allowed;}"],(0,templates.SH)($token.spacings),typographyMixin($token.typography),$paddingLeft,$paddingRight,$token.entities.placeholder.typography.color))),Adornments=styled_components_browser_esm.ZP.div.withConfig({displayName:"Input__Adornments",componentId:"sc-1ykv024-2"})((({$token:$token})=>(0,styled_components_browser_esm.iv)(["position:absolute;top:",";bottom:",";display:flex;align-items:center;"," color:var(--eds-input-adornment-color);"],$token.spacings.top,$token.spacings.bottom,typographyMixin($token.entities.adornment.typography)))),LeftAdornments=(0,styled_components_browser_esm.ZP)(Adornments).withConfig({displayName:"Input__LeftAdornments",componentId:"sc-1ykv024-3"})((({$token:$token})=>(0,styled_components_browser_esm.iv)(["left:0;padding-left:",";"],$token.entities.adornment.spacings.left))),RightAdornments=(0,styled_components_browser_esm.ZP)(Adornments).withConfig({displayName:"Input__RightAdornments",componentId:"sc-1ykv024-4"})((({$token:$token})=>(0,styled_components_browser_esm.iv)(["right:0;padding-right:",";"],$token.entities.adornment.spacings.right))),Input=(0,react.forwardRef)((function Input({variant:variant,disabled:disabled=!1,type:type="text",leftAdornments:leftAdornments,rightAdornments:rightAdornments,readOnly:readOnly,className:className,style:style,leftAdornmentsProps:leftAdornmentsProps,rightAdornmentsProps:rightAdornmentsProps,leftAdornmentsWidth:leftAdornmentsWidth,rightAdornmentsWidth:rightAdornmentsWidth,...other},ref){const inputVariant=inputToken[variant]?inputToken[variant]:inputToken.input,{density:density}=(0,eds_context.q)(),_token=(0,useToken.d)({density:density},inputVariant)(),[rightAdornmentsRef,setRightAdornmentsRef]=(0,react.useState)(),[leftAdornmentsRef,setLeftAdornmentsRef]=(0,react.useState)(),token=(0,react.useCallback)((()=>{const _leftAdornmentsWidth=leftAdornmentsWidth||(leftAdornmentsRef?leftAdornmentsRef.clientWidth:0),_rightAdornmentsWidth=rightAdornmentsWidth||(rightAdornmentsRef?rightAdornmentsRef.clientWidth:0);return{..._token,spacings:{..._token.spacings,left:`${_leftAdornmentsWidth+parseInt(_token.spacings.left)}px`,right:`${_rightAdornmentsWidth+parseInt(_token.spacings.right)}px`}}}),[leftAdornmentsWidth,leftAdornmentsRef,rightAdornmentsWidth,rightAdornmentsRef,_token])(),inputProps={ref:ref,type:type,disabled:disabled,readOnly:readOnly,$token:token,style:{resize:"none"},...other},containerProps={disabled:disabled,readOnly:readOnly,className:className,style:style,$token:token},_leftAdornmentProps={...leftAdornmentsProps,ref:setLeftAdornmentsRef,$token:token},_rightAdornmentProps={...rightAdornmentsProps,ref:setRightAdornmentsRef,$token:token};return(0,jsx_runtime.jsxs)(Container,{...containerProps,children:[leftAdornments?(0,jsx_runtime.jsx)(LeftAdornments,{..._leftAdornmentProps,children:leftAdornments}):null,(0,jsx_runtime.jsx)(StyledInput,{$paddingLeft:token.spacings.left,$paddingRight:token.spacings.right,...inputProps}),rightAdornments?(0,jsx_runtime.jsx)(RightAdornments,{..._rightAdornmentProps,children:rightAdornments}):null]})})),NumericInput=react.memo((({label:label,value:value,min:min,max:max,step:step,onChange:onChange})=>react.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},react.createElement(Label._,{label:label,id:`${label}-input-label`,style:{paddingTop:5,paddingBottom:5,fontSize:15}}),react.createElement(Input,{id:`${label}-input`,type:"number",value:value,onChange:onChange,min:min,max:max,step:step,style:{fontSize:15,textAlign:"right",width:"3rem"}}))));NumericInput.defaultProps={min:0,step:1},NumericInput.displayName="NumericInput";var settings_NumericInput=NumericInput;try{NumericInput.displayName="NumericInput",NumericInput.__docgenInfo={description:"",displayName:"NumericInput",props:{label:{defaultValue:null,description:"Label for the component.",name:"label",required:!0,type:{name:"string"}},value:{defaultValue:null,description:"Initial state of the component.",name:"value",required:!0,type:{name:"number"}},min:{defaultValue:{value:"0"},description:"",name:"min",required:!1,type:{name:"number"}},max:{defaultValue:null,description:"",name:"max",required:!1,type:{name:"number"}},step:{defaultValue:{value:"1"},description:"",name:"step",required:!1,type:{name:"number"}},onChange:{defaultValue:null,description:"Callback to update the state of the component.",name:"onChange",required:!0,type:{name:"(e: ChangeEvent<HTMLInputElement>) => void"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["packages/subsurface-viewer/src/components/settings/NumericInput.tsx#NumericInput"]={docgenInfo:NumericInput.__docgenInfo,name:"NumericInput",path:"packages/subsurface-viewer/src/components/settings/NumericInput.tsx#NumericInput"})}catch(__react_docgen_typescript_loader_error){}var NumericInput_stories={parameters:{storySource:{source:'import NumericInput from "../../../components/settings/NumericInput";\nconst stories = {\n  component: NumericInput,\n  title: "SubsurfaceViewer/Components/Settings"\n};\nexport default stories;\nexport const NumericInputStory = {\n  name: "NumericInput",\n  args: {\n    label: "test",\n    value: 5\n  }\n};',locationsMap:{"numeric-input-story":{startLoc:{col:33,line:7},endLoc:{col:1,line:13},startBody:{col:33,line:7},endBody:{col:1,line:13}}}}},component:settings_NumericInput,title:"SubsurfaceViewer/Components/Settings"};const NumericInputStory={name:"NumericInput",args:{label:"test",value:5}};NumericInputStory.parameters={...NumericInputStory.parameters,docs:{...NumericInputStory.parameters?.docs,source:{originalSource:'{\n  name: "NumericInput",\n  args: {\n    label: "test",\n    value: 5\n  }\n}',...NumericInputStory.parameters?.docs?.source}}};const __namedExportsOrder=["NumericInputStory"]},"./node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js":function(module,__unused_webpack_exports,__webpack_require__){var reactIs=__webpack_require__("./node_modules/hoist-non-react-statics/node_modules/react-is/index.js"),REACT_STATICS={childContextTypes:!0,contextType:!0,contextTypes:!0,defaultProps:!0,displayName:!0,getDefaultProps:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,mixins:!0,propTypes:!0,type:!0},KNOWN_STATICS={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},MEMO_STATICS={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},TYPE_STATICS={};function getStatics(component){return reactIs.isMemo(component)?MEMO_STATICS:TYPE_STATICS[component.$$typeof]||REACT_STATICS}TYPE_STATICS[reactIs.ForwardRef]={$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},TYPE_STATICS[reactIs.Memo]=MEMO_STATICS;var defineProperty=Object.defineProperty,getOwnPropertyNames=Object.getOwnPropertyNames,getOwnPropertySymbols=Object.getOwnPropertySymbols,getOwnPropertyDescriptor=Object.getOwnPropertyDescriptor,getPrototypeOf=Object.getPrototypeOf,objectPrototype=Object.prototype;module.exports=function hoistNonReactStatics(targetComponent,sourceComponent,blacklist){if("string"!=typeof sourceComponent){if(objectPrototype){var inheritedComponent=getPrototypeOf(sourceComponent);inheritedComponent&&inheritedComponent!==objectPrototype&&hoistNonReactStatics(targetComponent,inheritedComponent,blacklist)}var keys=getOwnPropertyNames(sourceComponent);getOwnPropertySymbols&&(keys=keys.concat(getOwnPropertySymbols(sourceComponent)));for(var targetStatics=getStatics(targetComponent),sourceStatics=getStatics(sourceComponent),i=0;i<keys.length;++i){var key=keys[i];if(!(KNOWN_STATICS[key]||blacklist&&blacklist[key]||sourceStatics&&sourceStatics[key]||targetStatics&&targetStatics[key])){var descriptor=getOwnPropertyDescriptor(sourceComponent,key);try{defineProperty(targetComponent,key,descriptor)}catch(e){}}}}return targetComponent}},"./node_modules/hoist-non-react-statics/node_modules/react-is/cjs/react-is.production.min.js":function(__unused_webpack_module,exports){var b="function"==typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?Symbol.for("react.suspense_list"):60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.block"):60121,w=b?Symbol.for("react.fundamental"):60117,x=b?Symbol.for("react.responder"):60118,y=b?Symbol.for("react.scope"):60119;function z(a){if("object"==typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function A(a){return z(a)===m}exports.AsyncMode=l,exports.ConcurrentMode=m,exports.ContextConsumer=k,exports.ContextProvider=h,exports.Element=c,exports.ForwardRef=n,exports.Fragment=e,exports.Lazy=t,exports.Memo=r,exports.Portal=d,exports.Profiler=g,exports.StrictMode=f,exports.Suspense=p,exports.isAsyncMode=function(a){return A(a)||z(a)===l},exports.isConcurrentMode=A,exports.isContextConsumer=function(a){return z(a)===k},exports.isContextProvider=function(a){return z(a)===h},exports.isElement=function(a){return"object"==typeof a&&null!==a&&a.$$typeof===c},exports.isForwardRef=function(a){return z(a)===n},exports.isFragment=function(a){return z(a)===e},exports.isLazy=function(a){return z(a)===t},exports.isMemo=function(a){return z(a)===r},exports.isPortal=function(a){return z(a)===d},exports.isProfiler=function(a){return z(a)===g},exports.isStrictMode=function(a){return z(a)===f},exports.isSuspense=function(a){return z(a)===p},exports.isValidElementType=function(a){return"string"==typeof a||"function"==typeof a||a===e||a===m||a===g||a===f||a===p||a===q||"object"==typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===w||a.$$typeof===x||a.$$typeof===y||a.$$typeof===v)},exports.typeOf=z},"./node_modules/hoist-non-react-statics/node_modules/react-is/index.js":function(module,__unused_webpack_exports,__webpack_require__){module.exports=__webpack_require__("./node_modules/hoist-non-react-statics/node_modules/react-is/cjs/react-is.production.min.js")},"./node_modules/react/cjs/react-jsx-runtime.production.min.js":function(__unused_webpack_module,exports,__webpack_require__){var f=__webpack_require__("./node_modules/react/index.js"),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};function q(c,a,g){var b,d={},e=null,h=null;for(b in void 0!==g&&(e=""+g),void 0!==a.key&&(e=""+a.key),void 0!==a.ref&&(h=a.ref),a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l,exports.jsx=q,exports.jsxs=q},"./node_modules/react/jsx-runtime.js":function(module,__unused_webpack_exports,__webpack_require__){module.exports=__webpack_require__("./node_modules/react/cjs/react-jsx-runtime.production.min.js")},"./packages/subsurface-viewer/node_modules/@equinor/eds-core-react/dist/esm/components/Label/Label.js":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.d(__webpack_exports__,{_:function(){return Label}});var react=__webpack_require__("./node_modules/react/index.js"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),templates=__webpack_require__("./packages/subsurface-viewer/node_modules/@equinor/eds-utils/dist/esm/utils/templates/index.mjs"),esm=__webpack_require__("./node_modules/@equinor/eds-tokens/dist/esm/index.mjs");const{colors:colors,spacings:{comfortable:comfortable},typography:typography}=esm.tokens,label={background:colors.ui.background__light.rgba,typography:{...typography.input.label,color:colors.text.static_icons__tertiary.rgba},spacings:{left:comfortable.small,right:comfortable.small,top:"6px",bottom:"6px"},states:{disabled:{typography:{color:colors.interactive.disabled__text.rgba}}}};var jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const LabelBase=styled_components_browser_esm.ZP.label.withConfig({displayName:"Label__LabelBase",componentId:"sc-1gi2bcn-0"})(["display:flex;justify-content:space-between;position:relative;"," margin-left:",";margin-right:",";color:",";"],(0,templates.oc)(label.typography),label.spacings.left,label.spacings.right,(({$disabledText:$disabledText})=>$disabledText?label.states.disabled.typography.color:label.typography.color)),Text=styled_components_browser_esm.ZP.span.withConfig({displayName:"Label__Text",componentId:"sc-1gi2bcn-1"})(["margin:0;"]),Label=(0,react.forwardRef)((function Label(props,ref){const{label:label="",meta:meta,disabled:disabled=!1,...other}=props;return(0,jsx_runtime.jsxs)(LabelBase,{ref:ref,$disabledText:disabled,...other,children:[(0,jsx_runtime.jsx)(Text,{children:label}),meta&&(0,jsx_runtime.jsx)(Text,{children:meta})]})}))},"./packages/subsurface-viewer/node_modules/@equinor/eds-core-react/dist/esm/node_modules/.pnpm/ramda@0.29.1/node_modules/ramda/es/mergeDeepRight.js":function(__unused_webpack_module,__webpack_exports__,__webpack_require__){function _isPlaceholder(a){return null!=a&&"object"==typeof a&&!0===a["@@functional/placeholder"]}function _curry1(fn){return function f1(a){return 0===arguments.length||_isPlaceholder(a)?f1:fn.apply(this,arguments)}}function _curry2(fn){return function f2(a,b){switch(arguments.length){case 0:return f2;case 1:return _isPlaceholder(a)?f2:_curry1((function(_b){return fn(a,_b)}));default:return _isPlaceholder(a)&&_isPlaceholder(b)?f2:_isPlaceholder(a)?_curry1((function(_a){return fn(_a,b)})):_isPlaceholder(b)?_curry1((function(_b){return fn(a,_b)})):fn(a,b)}}}function _curry3(fn){return function f3(a,b,c){switch(arguments.length){case 0:return f3;case 1:return _isPlaceholder(a)?f3:_curry2((function(_b,_c){return fn(a,_b,_c)}));case 2:return _isPlaceholder(a)&&_isPlaceholder(b)?f3:_isPlaceholder(a)?_curry2((function(_a,_c){return fn(_a,b,_c)})):_isPlaceholder(b)?_curry2((function(_b,_c){return fn(a,_b,_c)})):_curry1((function(_c){return fn(a,b,_c)}));default:return _isPlaceholder(a)&&_isPlaceholder(b)&&_isPlaceholder(c)?f3:_isPlaceholder(a)&&_isPlaceholder(b)?_curry2((function(_a,_b){return fn(_a,_b,c)})):_isPlaceholder(a)&&_isPlaceholder(c)?_curry2((function(_a,_c){return fn(_a,b,_c)})):_isPlaceholder(b)&&_isPlaceholder(c)?_curry2((function(_b,_c){return fn(a,_b,_c)})):_isPlaceholder(a)?_curry1((function(_a){return fn(_a,b,c)})):_isPlaceholder(b)?_curry1((function(_b){return fn(a,_b,c)})):_isPlaceholder(c)?_curry1((function(_c){return fn(a,b,_c)})):fn(a,b,c)}}}function _isObject(x){return"[object Object]"===Object.prototype.toString.call(x)}function _has(prop,obj){return Object.prototype.hasOwnProperty.call(obj,prop)}__webpack_require__.d(__webpack_exports__,{Z:function(){return mergeDeepRight$1}});var mergeWithKey$1=_curry3((function mergeWithKey(fn,l,r){var k,result={};for(k in r=r||{},l=l||{})_has(k,l)&&(result[k]=_has(k,r)?fn(k,l[k],r[k]):l[k]);for(k in r)_has(k,r)&&!_has(k,result)&&(result[k]=r[k]);return result})),mergeDeepWithKey$1=_curry3((function mergeDeepWithKey(fn,lObj,rObj){return mergeWithKey$1((function(k,lVal,rVal){return _isObject(lVal)&&_isObject(rVal)?mergeDeepWithKey(fn,lVal,rVal):fn(k,lVal,rVal)}),lObj,rObj)})),mergeDeepRight$1=_curry2((function mergeDeepRight(lObj,rObj){return mergeDeepWithKey$1((function(k,lVal,rVal){return rVal}),lObj,rObj)}))}}]);