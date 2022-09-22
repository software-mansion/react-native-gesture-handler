"use strict";(self.webpackChunkreact_native_gesture_handler_docs=self.webpackChunkreact_native_gesture_handler_docs||[]).push([[3508],{3905:function(e,t,n){n.d(t,{Zo:function(){return d},kt:function(){return h}});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=a.createContext({}),c=function(e){var t=a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},d=function(e){var t=c(e.components);return a.createElement(o.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},p=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),p=c(n),h=r,m=p["".concat(o,".").concat(h)]||p[h]||u[h]||i;return n?a.createElement(m,s(s({ref:t},d),{},{components:n})):a.createElement(m,s({ref:t},d))}));function h(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,s=new Array(i);s[0]=p;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l.mdxType="string"==typeof e?e:r,s[1]=l;for(var c=2;c<i;c++)s[c]=n[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,n)}p.displayName="MDXCreateElement"},35448:function(e,t,n){n.r(t),n.d(t,{assets:function(){return o},contentTitle:function(){return s},default:function(){return u},frontMatter:function(){return i},metadata:function(){return l},toc:function(){return c}});var a=n(83117),r=(n(67294),n(3905));const i={id:"state",title:"Handler State",sidebar_label:"Handler State"},s=void 0,l={unversionedId:"gesture-handlers/basics/state",id:"gesture-handlers/basics/state",title:"Handler State",description:'As described in "About Gesture Handlers", gesture handlers can be treated as "state machines".',source:"@site/docs/gesture-handlers/basics/state.md",sourceDirName:"gesture-handlers/basics",slug:"/gesture-handlers/basics/state",permalink:"/react-native-gesture-handler/docs/next/gesture-handlers/basics/state",draft:!1,tags:[],version:"current",frontMatter:{id:"state",title:"Handler State",sidebar_label:"Handler State"}},o={},c=[{value:"Accessing state",id:"accessing-state",level:2},{value:"State flows",id:"state-flows",level:2},{value:"States",id:"states",level:2},{value:"UNDETERMINED",id:"undetermined",level:3},{value:"FAILED",id:"failed",level:3},{value:"BEGAN",id:"began",level:3},{value:"CANCELLED",id:"cancelled",level:3},{value:"ACTIVE",id:"active",level:3},{value:"END",id:"end",level:3}],d={toc:c};function u(e){let{components:t,...n}=e;return(0,r.kt)("wrapper",(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("p",null,"As described in ",(0,r.kt)("a",{parentName:"p",href:"/react-native-gesture-handler/docs/next/gesture-handlers/basics/about-handlers"},'"About Gesture Handlers"'),", gesture handlers can be treated as ",(0,r.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Finite-state_machine"},'"state machines"'),".\nAt any given time, each handler instance has an assigned state that can change when new touch events occur or can be forced to change by the touch system in certain circumstances."),(0,r.kt)("p",null,"A gesture handler can be in one of the six possible states:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#undetermined"},"UNDETERMINED")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#failed"},"FAILED")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#began"},"BEGAN")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#cancelled"},"CANCELLED")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#active"},"ACTIVE")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"#end"},"END"))),(0,r.kt)("p",null,"Each state has its own description below."),(0,r.kt)("h2",{id:"accessing-state"},"Accessing state"),(0,r.kt)("p",null,"We can monitor a handler's state changes by using the ",(0,r.kt)("a",{parentName:"p",href:"/react-native-gesture-handler/docs/next/gesture-handlers/api/common-gh#onhandlerstatechange"},(0,r.kt)("inlineCode",{parentName:"a"},"onHandlerStateChange"))," callback and the destructured ",(0,r.kt)("inlineCode",{parentName:"p"},"nativeEvent")," argument passed to it.\nThis can be done by comparing the ",(0,r.kt)("inlineCode",{parentName:"p"},"nativeEvent"),"'s ",(0,r.kt)("a",{parentName:"p",href:"/react-native-gesture-handler/docs/next/gesture-handlers/api/common-gh#state"},(0,r.kt)("inlineCode",{parentName:"a"},"state"))," attribute to one of the constants exported under the ",(0,r.kt)("inlineCode",{parentName:"p"},"State")," object (see example below)."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre"},"import { State, LongPressGestureHandler } from 'react-native-gesture-handler';\n\nclass Demo extends Component {\n  _handleStateChange = ({ nativeEvent }) => {\n    if (nativeEvent.state === State.ACTIVE) {\n      Alert.alert('Longpress');\n    }\n  };\n  render() {\n    return (\n      <LongPressGestureHandler onHandlerStateChange={this._handleStateChange}>\n        <Text style={styles.buttonText}>Longpress me</Text>\n      </LongPressGestureHandler>\n    );\n  }\n}\n")),(0,r.kt)("h2",{id:"state-flows"},"State flows"),(0,r.kt)("p",null,"The most typical flow of state is when a gesture handler picks up on an initial touch event then recognizes it then acknowledges its ending then resets itself back to the initial state."),(0,r.kt)("p",null,"The flow looks as follows (longer arrows represent that there are possibly more touch events received before the state changes):"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#undetermined"},(0,r.kt)("inlineCode",{parentName:"a"},"UNDETERMINED"))," -> ",(0,r.kt)("a",{parentName:"p",href:"#began"},(0,r.kt)("inlineCode",{parentName:"a"},"BEGAN"))," ------\x3e ",(0,r.kt)("a",{parentName:"p",href:"#active"},(0,r.kt)("inlineCode",{parentName:"a"},"ACTIVE"))," ------\x3e ",(0,r.kt)("a",{parentName:"p",href:"#end"},(0,r.kt)("inlineCode",{parentName:"a"},"END"))," -> ",(0,r.kt)("a",{parentName:"p",href:"#undetermined"},(0,r.kt)("inlineCode",{parentName:"a"},"UNDETERMINED"))),(0,r.kt)("p",null,"Another possible flow is when a handler receives touches that cause a recognition failure:"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#undetermined"},(0,r.kt)("inlineCode",{parentName:"a"},"UNDETERMINED"))," -> ",(0,r.kt)("a",{parentName:"p",href:"#began"},(0,r.kt)("inlineCode",{parentName:"a"},"BEGAN"))," ------\x3e ",(0,r.kt)("a",{parentName:"p",href:"#failed"},(0,r.kt)("inlineCode",{parentName:"a"},"FAILED"))," -> ",(0,r.kt)("a",{parentName:"p",href:"#undetermined"},(0,r.kt)("inlineCode",{parentName:"a"},"UNDETERMINED"))),(0,r.kt)("p",null,"At last, when a handler does properly recognize the gesture but then is interrupted by the touch system. In that case, the gesture recognition is canceled and the flow looks as follows:"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"#undetermined"},(0,r.kt)("inlineCode",{parentName:"a"},"UNDETERMINED"))," -> ",(0,r.kt)("a",{parentName:"p",href:"#began"},(0,r.kt)("inlineCode",{parentName:"a"},"BEGAN"))," ------\x3e ",(0,r.kt)("a",{parentName:"p",href:"#active"},(0,r.kt)("inlineCode",{parentName:"a"},"ACTIVE"))," ------\x3e ",(0,r.kt)("a",{parentName:"p",href:"#cancelled"},(0,r.kt)("inlineCode",{parentName:"a"},"CANCELLED"))," -> ",(0,r.kt)("a",{parentName:"p",href:"#undetermined"},(0,r.kt)("inlineCode",{parentName:"a"},"UNDETERMINED"))),(0,r.kt)("h2",{id:"states"},"States"),(0,r.kt)("p",null,"The section below describes all possible handler states:"),(0,r.kt)("h3",{id:"undetermined"},"UNDETERMINED"),(0,r.kt)("p",null,"This is the initial state of each handler and it goes into this state after it's done recognizing a gesture."),(0,r.kt)("h3",{id:"failed"},"FAILED"),(0,r.kt)("p",null,"A handler received some touches but for some reason didn't recognize them. For example, if a finger travels more distance than a defined ",(0,r.kt)("inlineCode",{parentName:"p"},"maxDist")," property allows, then the handler won't become active but will fail instead. Afterwards, it's state will be reset to ",(0,r.kt)("inlineCode",{parentName:"p"},"UNDETERMINED"),"."),(0,r.kt)("h3",{id:"began"},"BEGAN"),(0,r.kt)("p",null,"Handler has started receiving touch stream but hasn't yet received enough data to either ",(0,r.kt)("a",{parentName:"p",href:"#failed"},"fail")," or ",(0,r.kt)("a",{parentName:"p",href:"#active"},"activate"),"."),(0,r.kt)("h3",{id:"cancelled"},"CANCELLED"),(0,r.kt)("p",null,"The gesture recognizer has received a signal (possibly new touches or a command from the touch system controller) resulting in the cancellation of a continuous gesture. The gesture's state will become ",(0,r.kt)("inlineCode",{parentName:"p"},"CANCELLED")," until it is finally reset to the initial state, ",(0,r.kt)("inlineCode",{parentName:"p"},"UNDETERMINED"),"."),(0,r.kt)("h3",{id:"active"},"ACTIVE"),(0,r.kt)("p",null,"Handler has recognized a gesture. It will become and stay in the ",(0,r.kt)("inlineCode",{parentName:"p"},"ACTIVE")," state until the gesture finishes (e.g. when user lifts the finger) or gets cancelled by the touch system. Under normal circumstances the state will then turn into ",(0,r.kt)("inlineCode",{parentName:"p"},"END"),". In the case that a gesture is cancelled by the touch system, its state would then become ",(0,r.kt)("inlineCode",{parentName:"p"},"CANCELLED"),".\nLearn about ",(0,r.kt)("a",{parentName:"p",href:"about-handlers#discrete-vs-continuous"},"discrete and continuous handlers here")," to understand how long a handler can be kept in the ",(0,r.kt)("inlineCode",{parentName:"p"},"ACTIVE")," state."),(0,r.kt)("h3",{id:"end"},"END"),(0,r.kt)("p",null,"The gesture recognizer has received touches signalling the end of a gesture. Its state will become ",(0,r.kt)("inlineCode",{parentName:"p"},"END")," until it is reset to ",(0,r.kt)("inlineCode",{parentName:"p"},"UNDETERMINED"),"."))}u.isMDXComponent=!0}}]);