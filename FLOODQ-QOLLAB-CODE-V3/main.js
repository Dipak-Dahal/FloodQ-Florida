// FloodQ Florida on Qollab: all of the page's JavaScript in one file.
//
// Qollab puts index.html in its page, loads main.css, loads Python, NumPy, SciPy and Qiskit in the
// browser, then runs this file. The Python engine (floodq/engine.py) is imported by its dotted
// name; it builds the storm model and the Qiskit circuits and sends them to the backend you pick
// in Select QPU. The JavaScript below comes in six parts, then the start:
//   1. Leaflet   the map library
//   2. sound     the storm sound, the siren and the spoken alerts
//   3. fx        map drawing
//   4. planner   shortest paths with road closures
//   5. routes    the route-selection circuit's emulation and training
//   6. app       the page itself
import * as engine from 'floodq.engine';

// ===============================================================================================
// 1. Leaflet 1.9.4, the map library (BSD-2-Clause; the licence is in LICENSE). It runs with
//    exports, module and define hidden, so it always sets window.L, and with a stand-in for
//    navigator (see below).
// ===============================================================================================
// Qollab's sandbox gives scripts a navigator without some of its fields (navigator.platform is
// undefined there), and Leaflet reads them as it loads. So Leaflet sees a stand-in with the same
// values, and an empty string wherever the sandbox has none.
var leafletNavigator = (function () {
  var n = null;
  try { n = typeof navigator !== 'undefined' ? navigator : null; } catch (e) { n = null; }
  var text = function (k) { try { return n && typeof n[k] === 'string' ? n[k] : ''; } catch (e) { return ''; } };
  var geo = null;
  try { geo = n && n.geolocation ? n.geolocation : null; } catch (e) { geo = null; }
  return { userAgent: text('userAgent'), platform: text('platform'), vendor: text('vendor'), geolocation: geo };
})();
try { if (!window.devicePixelRatio) window.devicePixelRatio = 1; } catch (e) { /* read-only here */ }
(function (exports, module, define, navigator) {
/* @preserve
 * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).leaflet={})}(this,function(t){"use strict";function l(t){for(var e,i,n=1,o=arguments.length;n<o;n++)for(e in i=arguments[n])t[e]=i[e];return t}var R=Object.create||function(t){return N.prototype=t,new N};function N(){}function a(t,e){var i,n=Array.prototype.slice;return t.bind?t.bind.apply(t,n.call(arguments,1)):(i=n.call(arguments,2),function(){return t.apply(e,i.length?i.concat(n.call(arguments)):arguments)})}var D=0;function h(t){return"_leaflet_id"in t||(t._leaflet_id=++D),t._leaflet_id}function j(t,e,i){var n,o,s=function(){n=!1,o&&(r.apply(i,o),o=!1)},r=function(){n?o=arguments:(t.apply(i,arguments),setTimeout(s,e),n=!0)};return r}function H(t,e,i){var n=e[1],e=e[0],o=n-e;return t===n&&i?t:((t-e)%o+o)%o+e}function u(){return!1}function i(t,e){return!1===e?t:(e=Math.pow(10,void 0===e?6:e),Math.round(t*e)/e)}function W(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function F(t){return W(t).split(/\s+/)}function c(t,e){for(var i in Object.prototype.hasOwnProperty.call(t,"options")||(t.options=t.options?R(t.options):{}),e)t.options[i]=e[i];return t.options}function U(t,e,i){var n,o=[];for(n in t)o.push(encodeURIComponent(i?n.toUpperCase():n)+"="+encodeURIComponent(t[n]));return(e&&-1!==e.indexOf("?")?"&":"?")+o.join("&")}var V=/\{ *([\w_ -]+) *\}/g;function q(t,i){return t.replace(V,function(t,e){e=i[e];if(void 0===e)throw new Error("No value provided for variable "+t);return e="function"==typeof e?e(i):e})}var d=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};function G(t,e){for(var i=0;i<t.length;i++)if(t[i]===e)return i;return-1}var K="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";function Y(t){return window["webkit"+t]||window["moz"+t]||window["ms"+t]}var X=0;function J(t){var e=+new Date,i=Math.max(0,16-(e-X));return X=e+i,window.setTimeout(t,i)}var $=window.requestAnimationFrame||Y("RequestAnimationFrame")||J,Q=window.cancelAnimationFrame||Y("CancelAnimationFrame")||Y("CancelRequestAnimationFrame")||function(t){window.clearTimeout(t)};function x(t,e,i){if(!i||$!==J)return $.call(window,a(t,e));t.call(e)}function r(t){t&&Q.call(window,t)}var tt={__proto__:null,extend:l,create:R,bind:a,get lastId(){return D},stamp:h,throttle:j,wrapNum:H,falseFn:u,formatNum:i,trim:W,splitWords:F,setOptions:c,getParamString:U,template:q,isArray:d,indexOf:G,emptyImageUrl:K,requestFn:$,cancelFn:Q,requestAnimFrame:x,cancelAnimFrame:r};function et(){}et.extend=function(t){function e(){c(this),this.initialize&&this.initialize.apply(this,arguments),this.callInitHooks()}var i,n=e.__super__=this.prototype,o=R(n);for(i in(o.constructor=e).prototype=o,this)Object.prototype.hasOwnProperty.call(this,i)&&"prototype"!==i&&"__super__"!==i&&(e[i]=this[i]);if(t.statics&&l(e,t.statics),t.includes){var s=t.includes;if("undefined"!=typeof L&&L&&L.Mixin){s=d(s)?s:[s];for(var r=0;r<s.length;r++)s[r]===L.Mixin.Events&&console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",(new Error).stack)}l.apply(null,[o].concat(t.includes))}return l(o,t),delete o.statics,delete o.includes,o.options&&(o.options=n.options?R(n.options):{},l(o.options,t.options)),o._initHooks=[],o.callInitHooks=function(){if(!this._initHooksCalled){n.callInitHooks&&n.callInitHooks.call(this),this._initHooksCalled=!0;for(var t=0,e=o._initHooks.length;t<e;t++)o._initHooks[t].call(this)}},e},et.include=function(t){var e=this.prototype.options;return l(this.prototype,t),t.options&&(this.prototype.options=e,this.mergeOptions(t.options)),this},et.mergeOptions=function(t){return l(this.prototype.options,t),this},et.addInitHook=function(t){var e=Array.prototype.slice.call(arguments,1),i="function"==typeof t?t:function(){this[t].apply(this,e)};return this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(i),this};var e={on:function(t,e,i){if("object"==typeof t)for(var n in t)this._on(n,t[n],e);else for(var o=0,s=(t=F(t)).length;o<s;o++)this._on(t[o],e,i);return this},off:function(t,e,i){if(arguments.length)if("object"==typeof t)for(var n in t)this._off(n,t[n],e);else{t=F(t);for(var o=1===arguments.length,s=0,r=t.length;s<r;s++)o?this._off(t[s]):this._off(t[s],e,i)}else delete this._events;return this},_on:function(t,e,i,n){"function"!=typeof e?console.warn("wrong listener type: "+typeof e):!1===this._listens(t,e,i)&&(e={fn:e,ctx:i=i===this?void 0:i},n&&(e.once=!0),this._events=this._events||{},this._events[t]=this._events[t]||[],this._events[t].push(e))},_off:function(t,e,i){var n,o,s;if(this._events&&(n=this._events[t]))if(1===arguments.length){if(this._firingCount)for(o=0,s=n.length;o<s;o++)n[o].fn=u;delete this._events[t]}else"function"!=typeof e?console.warn("wrong listener type: "+typeof e):!1!==(e=this._listens(t,e,i))&&(i=n[e],this._firingCount&&(i.fn=u,this._events[t]=n=n.slice()),n.splice(e,1))},fire:function(t,e,i){if(this.listens(t,i)){var n=l({},e,{type:t,target:this,sourceTarget:e&&e.sourceTarget||this});if(this._events){var o=this._events[t];if(o){this._firingCount=this._firingCount+1||1;for(var s=0,r=o.length;s<r;s++){var a=o[s],h=a.fn;a.once&&this.off(t,h,a.ctx),h.call(a.ctx||this,n)}this._firingCount--}}i&&this._propagateEvent(n)}return this},listens:function(t,e,i,n){"string"!=typeof t&&console.warn('"string" type argument expected');var o=e,s=("function"!=typeof e&&(n=!!e,i=o=void 0),this._events&&this._events[t]);if(s&&s.length&&!1!==this._listens(t,o,i))return!0;if(n)for(var r in this._eventParents)if(this._eventParents[r].listens(t,e,i,n))return!0;return!1},_listens:function(t,e,i){if(this._events){var n=this._events[t]||[];if(!e)return!!n.length;i===this&&(i=void 0);for(var o=0,s=n.length;o<s;o++)if(n[o].fn===e&&n[o].ctx===i)return o}return!1},once:function(t,e,i){if("object"==typeof t)for(var n in t)this._on(n,t[n],e,!0);else for(var o=0,s=(t=F(t)).length;o<s;o++)this._on(t[o],e,i,!0);return this},addEventParent:function(t){return this._eventParents=this._eventParents||{},this._eventParents[h(t)]=t,this},removeEventParent:function(t){return this._eventParents&&delete this._eventParents[h(t)],this},_propagateEvent:function(t){for(var e in this._eventParents)this._eventParents[e].fire(t.type,l({layer:t.target,propagatedFrom:t.target},t),!0)}},it=(e.addEventListener=e.on,e.removeEventListener=e.clearAllEventListeners=e.off,e.addOneTimeEventListener=e.once,e.fireEvent=e.fire,e.hasEventListeners=e.listens,et.extend(e));function p(t,e,i){this.x=i?Math.round(t):t,this.y=i?Math.round(e):e}var nt=Math.trunc||function(t){return 0<t?Math.floor(t):Math.ceil(t)};function m(t,e,i){return t instanceof p?t:d(t)?new p(t[0],t[1]):null==t?t:"object"==typeof t&&"x"in t&&"y"in t?new p(t.x,t.y):new p(t,e,i)}function f(t,e){if(t)for(var i=e?[t,e]:t,n=0,o=i.length;n<o;n++)this.extend(i[n])}function _(t,e){return!t||t instanceof f?t:new f(t,e)}function s(t,e){if(t)for(var i=e?[t,e]:t,n=0,o=i.length;n<o;n++)this.extend(i[n])}function g(t,e){return t instanceof s?t:new s(t,e)}function v(t,e,i){if(isNaN(t)||isNaN(e))throw new Error("Invalid LatLng object: ("+t+", "+e+")");this.lat=+t,this.lng=+e,void 0!==i&&(this.alt=+i)}function w(t,e,i){return t instanceof v?t:d(t)&&"object"!=typeof t[0]?3===t.length?new v(t[0],t[1],t[2]):2===t.length?new v(t[0],t[1]):null:null==t?t:"object"==typeof t&&"lat"in t?new v(t.lat,"lng"in t?t.lng:t.lon,t.alt):void 0===e?null:new v(t,e,i)}p.prototype={clone:function(){return new p(this.x,this.y)},add:function(t){return this.clone()._add(m(t))},_add:function(t){return this.x+=t.x,this.y+=t.y,this},subtract:function(t){return this.clone()._subtract(m(t))},_subtract:function(t){return this.x-=t.x,this.y-=t.y,this},divideBy:function(t){return this.clone()._divideBy(t)},_divideBy:function(t){return this.x/=t,this.y/=t,this},multiplyBy:function(t){return this.clone()._multiplyBy(t)},_multiplyBy:function(t){return this.x*=t,this.y*=t,this},scaleBy:function(t){return new p(this.x*t.x,this.y*t.y)},unscaleBy:function(t){return new p(this.x/t.x,this.y/t.y)},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.clone()._ceil()},_ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},trunc:function(){return this.clone()._trunc()},_trunc:function(){return this.x=nt(this.x),this.y=nt(this.y),this},distanceTo:function(t){var e=(t=m(t)).x-this.x,t=t.y-this.y;return Math.sqrt(e*e+t*t)},equals:function(t){return(t=m(t)).x===this.x&&t.y===this.y},contains:function(t){return t=m(t),Math.abs(t.x)<=Math.abs(this.x)&&Math.abs(t.y)<=Math.abs(this.y)},toString:function(){return"Point("+i(this.x)+", "+i(this.y)+")"}},f.prototype={extend:function(t){var e,i;if(t){if(t instanceof p||"number"==typeof t[0]||"x"in t)e=i=m(t);else if(e=(t=_(t)).min,i=t.max,!e||!i)return this;this.min||this.max?(this.min.x=Math.min(e.x,this.min.x),this.max.x=Math.max(i.x,this.max.x),this.min.y=Math.min(e.y,this.min.y),this.max.y=Math.max(i.y,this.max.y)):(this.min=e.clone(),this.max=i.clone())}return this},getCenter:function(t){return m((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,t)},getBottomLeft:function(){return m(this.min.x,this.max.y)},getTopRight:function(){return m(this.max.x,this.min.y)},getTopLeft:function(){return this.min},getBottomRight:function(){return this.max},getSize:function(){return this.max.subtract(this.min)},contains:function(t){var e,i;return(t=("number"==typeof t[0]||t instanceof p?m:_)(t))instanceof f?(e=t.min,i=t.max):e=i=t,e.x>=this.min.x&&i.x<=this.max.x&&e.y>=this.min.y&&i.y<=this.max.y},intersects:function(t){t=_(t);var e=this.min,i=this.max,n=t.min,t=t.max,o=t.x>=e.x&&n.x<=i.x,t=t.y>=e.y&&n.y<=i.y;return o&&t},overlaps:function(t){t=_(t);var e=this.min,i=this.max,n=t.min,t=t.max,o=t.x>e.x&&n.x<i.x,t=t.y>e.y&&n.y<i.y;return o&&t},isValid:function(){return!(!this.min||!this.max)},pad:function(t){var e=this.min,i=this.max,n=Math.abs(e.x-i.x)*t,t=Math.abs(e.y-i.y)*t;return _(m(e.x-n,e.y-t),m(i.x+n,i.y+t))},equals:function(t){return!!t&&(t=_(t),this.min.equals(t.getTopLeft())&&this.max.equals(t.getBottomRight()))}},s.prototype={extend:function(t){var e,i,n=this._southWest,o=this._northEast;if(t instanceof v)i=e=t;else{if(!(t instanceof s))return t?this.extend(w(t)||g(t)):this;if(e=t._southWest,i=t._northEast,!e||!i)return this}return n||o?(n.lat=Math.min(e.lat,n.lat),n.lng=Math.min(e.lng,n.lng),o.lat=Math.max(i.lat,o.lat),o.lng=Math.max(i.lng,o.lng)):(this._southWest=new v(e.lat,e.lng),this._northEast=new v(i.lat,i.lng)),this},pad:function(t){var e=this._southWest,i=this._northEast,n=Math.abs(e.lat-i.lat)*t,t=Math.abs(e.lng-i.lng)*t;return new s(new v(e.lat-n,e.lng-t),new v(i.lat+n,i.lng+t))},getCenter:function(){return new v((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new v(this.getNorth(),this.getWest())},getSouthEast:function(){return new v(this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(t){t=("number"==typeof t[0]||t instanceof v||"lat"in t?w:g)(t);var e,i,n=this._southWest,o=this._northEast;return t instanceof s?(e=t.getSouthWest(),i=t.getNorthEast()):e=i=t,e.lat>=n.lat&&i.lat<=o.lat&&e.lng>=n.lng&&i.lng<=o.lng},intersects:function(t){t=g(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),t=t.getNorthEast(),o=t.lat>=e.lat&&n.lat<=i.lat,t=t.lng>=e.lng&&n.lng<=i.lng;return o&&t},overlaps:function(t){t=g(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),t=t.getNorthEast(),o=t.lat>e.lat&&n.lat<i.lat,t=t.lng>e.lng&&n.lng<i.lng;return o&&t},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(t,e){return!!t&&(t=g(t),this._southWest.equals(t.getSouthWest(),e)&&this._northEast.equals(t.getNorthEast(),e))},isValid:function(){return!(!this._southWest||!this._northEast)}};var ot={latLngToPoint:function(t,e){t=this.projection.project(t),e=this.scale(e);return this.transformation._transform(t,e)},pointToLatLng:function(t,e){e=this.scale(e),t=this.transformation.untransform(t,e);return this.projection.unproject(t)},project:function(t){return this.projection.project(t)},unproject:function(t){return this.projection.unproject(t)},scale:function(t){return 256*Math.pow(2,t)},zoom:function(t){return Math.log(t/256)/Math.LN2},getProjectedBounds:function(t){var e;return this.infinite?null:(e=this.projection.bounds,t=this.scale(t),new f(this.transformation.transform(e.min,t),this.transformation.transform(e.max,t)))},infinite:!(v.prototype={equals:function(t,e){return!!t&&(t=w(t),Math.max(Math.abs(this.lat-t.lat),Math.abs(this.lng-t.lng))<=(void 0===e?1e-9:e))},toString:function(t){return"LatLng("+i(this.lat,t)+", "+i(this.lng,t)+")"},distanceTo:function(t){return st.distance(this,w(t))},wrap:function(){return st.wrapLatLng(this)},toBounds:function(t){var t=180*t/40075017,e=t/Math.cos(Math.PI/180*this.lat);return g([this.lat-t,this.lng-e],[this.lat+t,this.lng+e])},clone:function(){return new v(this.lat,this.lng,this.alt)}}),wrapLatLng:function(t){var e=this.wrapLng?H(t.lng,this.wrapLng,!0):t.lng;return new v(this.wrapLat?H(t.lat,this.wrapLat,!0):t.lat,e,t.alt)},wrapLatLngBounds:function(t){var e=t.getCenter(),i=this.wrapLatLng(e),n=e.lat-i.lat,e=e.lng-i.lng;return 0==n&&0==e?t:(i=t.getSouthWest(),t=t.getNorthEast(),new s(new v(i.lat-n,i.lng-e),new v(t.lat-n,t.lng-e)))}},st=l({},ot,{wrapLng:[-180,180],R:6371e3,distance:function(t,e){var i=Math.PI/180,n=t.lat*i,o=e.lat*i,s=Math.sin((e.lat-t.lat)*i/2),e=Math.sin((e.lng-t.lng)*i/2),t=s*s+Math.cos(n)*Math.cos(o)*e*e,i=2*Math.atan2(Math.sqrt(t),Math.sqrt(1-t));return this.R*i}}),rt=6378137,rt={R:rt,MAX_LATITUDE:85.0511287798,project:function(t){var e=Math.PI/180,i=this.MAX_LATITUDE,i=Math.max(Math.min(i,t.lat),-i),i=Math.sin(i*e);return new p(this.R*t.lng*e,this.R*Math.log((1+i)/(1-i))/2)},unproject:function(t){var e=180/Math.PI;return new v((2*Math.atan(Math.exp(t.y/this.R))-Math.PI/2)*e,t.x*e/this.R)},bounds:new f([-(rt=rt*Math.PI),-rt],[rt,rt])};function at(t,e,i,n){d(t)?(this._a=t[0],this._b=t[1],this._c=t[2],this._d=t[3]):(this._a=t,this._b=e,this._c=i,this._d=n)}function ht(t,e,i,n){return new at(t,e,i,n)}at.prototype={transform:function(t,e){return this._transform(t.clone(),e)},_transform:function(t,e){return t.x=(e=e||1)*(this._a*t.x+this._b),t.y=e*(this._c*t.y+this._d),t},untransform:function(t,e){return new p((t.x/(e=e||1)-this._b)/this._a,(t.y/e-this._d)/this._c)}};var lt=l({},st,{code:"EPSG:3857",projection:rt,transformation:ht(lt=.5/(Math.PI*rt.R),.5,-lt,.5)}),ut=l({},lt,{code:"EPSG:900913"});function ct(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function dt(t,e){for(var i,n,o,s,r="",a=0,h=t.length;a<h;a++){for(i=0,n=(o=t[a]).length;i<n;i++)r+=(i?"L":"M")+(s=o[i]).x+" "+s.y;r+=e?b.svg?"z":"x":""}return r||"M0 0"}var _t=document.documentElement.style,pt="ActiveXObject"in window,mt=pt&&!document.addEventListener,n="msLaunchUri"in navigator&&!("documentMode"in document),ft=y("webkit"),gt=y("android"),vt=y("android 2")||y("android 3"),yt=parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1],10),yt=gt&&y("Google")&&yt<537&&!("AudioNode"in window),xt=!!window.opera,wt=!n&&y("chrome"),bt=y("gecko")&&!ft&&!xt&&!pt,Pt=!wt&&y("safari"),Lt=y("phantom"),o="OTransition"in _t,Tt=0===navigator.platform.indexOf("Win"),Mt=pt&&"transition"in _t,zt="WebKitCSSMatrix"in window&&"m11"in new window.WebKitCSSMatrix&&!vt,_t="MozPerspective"in _t,Ct=!window.L_DISABLE_3D&&(Mt||zt||_t)&&!o&&!Lt,Zt="undefined"!=typeof orientation||y("mobile"),St=Zt&&ft,Et=Zt&&zt,kt=!window.PointerEvent&&window.MSPointerEvent,Ot=!(!window.PointerEvent&&!kt),At="ontouchstart"in window||!!window.TouchEvent,Bt=!window.L_NO_TOUCH&&(At||Ot),It=Zt&&xt,Rt=Zt&&bt,Nt=1<(window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI),Dt=function(){var t=!1;try{var e=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("testPassiveEventSupport",u,e),window.removeEventListener("testPassiveEventSupport",u,e)}catch(t){}return t}(),jt=!!document.createElement("canvas").getContext,Ht=!(!document.createElementNS||!ct("svg").createSVGRect),Wt=!!Ht&&((Wt=document.createElement("div")).innerHTML="<svg/>","http://www.w3.org/2000/svg"===(Wt.firstChild&&Wt.firstChild.namespaceURI));function y(t){return 0<=navigator.userAgent.toLowerCase().indexOf(t)}var b={ie:pt,ielt9:mt,edge:n,webkit:ft,android:gt,android23:vt,androidStock:yt,opera:xt,chrome:wt,gecko:bt,safari:Pt,phantom:Lt,opera12:o,win:Tt,ie3d:Mt,webkit3d:zt,gecko3d:_t,any3d:Ct,mobile:Zt,mobileWebkit:St,mobileWebkit3d:Et,msPointer:kt,pointer:Ot,touch:Bt,touchNative:At,mobileOpera:It,mobileGecko:Rt,retina:Nt,passiveEvents:Dt,canvas:jt,svg:Ht,vml:!Ht&&function(){try{var t=document.createElement("div"),e=(t.innerHTML='<v:shape adj="1"/>',t.firstChild);return e.style.behavior="url(#default#VML)",e&&"object"==typeof e.adj}catch(t){return!1}}(),inlineSvg:Wt,mac:0===navigator.platform.indexOf("Mac"),linux:0===navigator.platform.indexOf("Linux")},Ft=b.msPointer?"MSPointerDown":"pointerdown",Ut=b.msPointer?"MSPointerMove":"pointermove",Vt=b.msPointer?"MSPointerUp":"pointerup",qt=b.msPointer?"MSPointerCancel":"pointercancel",Gt={touchstart:Ft,touchmove:Ut,touchend:Vt,touchcancel:qt},Kt={touchstart:function(t,e){e.MSPOINTER_TYPE_TOUCH&&e.pointerType===e.MSPOINTER_TYPE_TOUCH&&O(e);ee(t,e)},touchmove:ee,touchend:ee,touchcancel:ee},Yt={},Xt=!1;function Jt(t,e,i){return"touchstart"!==e||Xt||(document.addEventListener(Ft,$t,!0),document.addEventListener(Ut,Qt,!0),document.addEventListener(Vt,te,!0),document.addEventListener(qt,te,!0),Xt=!0),Kt[e]?(i=Kt[e].bind(this,i),t.addEventListener(Gt[e],i,!1),i):(console.warn("wrong event specified:",e),u)}function $t(t){Yt[t.pointerId]=t}function Qt(t){Yt[t.pointerId]&&(Yt[t.pointerId]=t)}function te(t){delete Yt[t.pointerId]}function ee(t,e){if(e.pointerType!==(e.MSPOINTER_TYPE_MOUSE||"mouse")){for(var i in e.touches=[],Yt)e.touches.push(Yt[i]);e.changedTouches=[e],t(e)}}var ie=200;function ne(t,i){t.addEventListener("dblclick",i);var n,o=0;function e(t){var e;1!==t.detail?n=t.detail:"mouse"===t.pointerType||t.sourceCapabilities&&!t.sourceCapabilities.firesTouchEvents||((e=Ne(t)).some(function(t){return t instanceof HTMLLabelElement&&t.attributes.for})&&!e.some(function(t){return t instanceof HTMLInputElement||t instanceof HTMLSelectElement})||((e=Date.now())-o<=ie?2===++n&&i(function(t){var e,i,n={};for(i in t)e=t[i],n[i]=e&&e.bind?e.bind(t):e;return(t=n).type="dblclick",n.detail=2,n.isTrusted=!1,n._simulated=!0,n}(t)):n=1,o=e))}return t.addEventListener("click",e),{dblclick:i,simDblclick:e}}var oe,se,re,ae,he,le,ue=we(["transform","webkitTransform","OTransform","MozTransform","msTransform"]),ce=we(["webkitTransition","transition","OTransition","MozTransition","msTransition"]),de="webkitTransition"===ce||"OTransition"===ce?ce+"End":"transitionend";function _e(t){return"string"==typeof t?document.getElementById(t):t}function pe(t,e){var i=t.style[e]||t.currentStyle&&t.currentStyle[e];return"auto"===(i=i&&"auto"!==i||!document.defaultView?i:(t=document.defaultView.getComputedStyle(t,null))?t[e]:null)?null:i}function P(t,e,i){t=document.createElement(t);return t.className=e||"",i&&i.appendChild(t),t}function T(t){var e=t.parentNode;e&&e.removeChild(t)}function me(t){for(;t.firstChild;)t.removeChild(t.firstChild)}function fe(t){var e=t.parentNode;e&&e.lastChild!==t&&e.appendChild(t)}function ge(t){var e=t.parentNode;e&&e.firstChild!==t&&e.insertBefore(t,e.firstChild)}function ve(t,e){return void 0!==t.classList?t.classList.contains(e):0<(t=xe(t)).length&&new RegExp("(^|\\s)"+e+"(\\s|$)").test(t)}function M(t,e){var i;if(void 0!==t.classList)for(var n=F(e),o=0,s=n.length;o<s;o++)t.classList.add(n[o]);else ve(t,e)||ye(t,((i=xe(t))?i+" ":"")+e)}function z(t,e){void 0!==t.classList?t.classList.remove(e):ye(t,W((" "+xe(t)+" ").replace(" "+e+" "," ")))}function ye(t,e){void 0===t.className.baseVal?t.className=e:t.className.baseVal=e}function xe(t){return void 0===(t=t.correspondingElement?t.correspondingElement:t).className.baseVal?t.className:t.className.baseVal}function C(t,e){if("opacity"in t.style)t.style.opacity=e;else if("filter"in t.style){var i=!1,n="DXImageTransform.Microsoft.Alpha";try{i=t.filters.item(n)}catch(t){if(1===e)return}e=Math.round(100*e),i?(i.Enabled=100!==e,i.Opacity=e):t.style.filter+=" progid:"+n+"(opacity="+e+")"}}function we(t){for(var e=document.documentElement.style,i=0;i<t.length;i++)if(t[i]in e)return t[i];return!1}function be(t,e,i){e=e||new p(0,0);t.style[ue]=(b.ie3d?"translate("+e.x+"px,"+e.y+"px)":"translate3d("+e.x+"px,"+e.y+"px,0)")+(i?" scale("+i+")":"")}function Z(t,e){t._leaflet_pos=e,b.any3d?be(t,e):(t.style.left=e.x+"px",t.style.top=e.y+"px")}function Pe(t){return t._leaflet_pos||new p(0,0)}function Le(){S(window,"dragstart",O)}function Te(){k(window,"dragstart",O)}function Me(t){for(;-1===t.tabIndex;)t=t.parentNode;t.style&&(ze(),le=(he=t).style.outlineStyle,t.style.outlineStyle="none",S(window,"keydown",ze))}function ze(){he&&(he.style.outlineStyle=le,le=he=void 0,k(window,"keydown",ze))}function Ce(t){for(;!((t=t.parentNode).offsetWidth&&t.offsetHeight||t===document.body););return t}function Ze(t){var e=t.getBoundingClientRect();return{x:e.width/t.offsetWidth||1,y:e.height/t.offsetHeight||1,boundingClientRect:e}}ae="onselectstart"in document?(re=function(){S(window,"selectstart",O)},function(){k(window,"selectstart",O)}):(se=we(["userSelect","WebkitUserSelect","OUserSelect","MozUserSelect","msUserSelect"]),re=function(){var t;se&&(t=document.documentElement.style,oe=t[se],t[se]="none")},function(){se&&(document.documentElement.style[se]=oe,oe=void 0)});pt={__proto__:null,TRANSFORM:ue,TRANSITION:ce,TRANSITION_END:de,get:_e,getStyle:pe,create:P,remove:T,empty:me,toFront:fe,toBack:ge,hasClass:ve,addClass:M,removeClass:z,setClass:ye,getClass:xe,setOpacity:C,testProp:we,setTransform:be,setPosition:Z,getPosition:Pe,get disableTextSelection(){return re},get enableTextSelection(){return ae},disableImageDrag:Le,enableImageDrag:Te,preventOutline:Me,restoreOutline:ze,getSizedParentNode:Ce,getScale:Ze};function S(t,e,i,n){if(e&&"object"==typeof e)for(var o in e)ke(t,o,e[o],i);else for(var s=0,r=(e=F(e)).length;s<r;s++)ke(t,e[s],i,n);return this}var E="_leaflet_events";function k(t,e,i,n){if(1===arguments.length)Se(t),delete t[E];else if(e&&"object"==typeof e)for(var o in e)Oe(t,o,e[o],i);else if(e=F(e),2===arguments.length)Se(t,function(t){return-1!==G(e,t)});else for(var s=0,r=e.length;s<r;s++)Oe(t,e[s],i,n);return this}function Se(t,e){for(var i in t[E]){var n=i.split(/\d/)[0];e&&!e(n)||Oe(t,n,null,null,i)}}var Ee={mouseenter:"mouseover",mouseleave:"mouseout",wheel:!("onwheel"in window)&&"mousewheel"};function ke(e,t,i,n){var o,s,r=t+h(i)+(n?"_"+h(n):"");e[E]&&e[E][r]||(s=o=function(t){return i.call(n||e,t||window.event)},!b.touchNative&&b.pointer&&0===t.indexOf("touch")?o=Jt(e,t,o):b.touch&&"dblclick"===t?o=ne(e,o):"addEventListener"in e?"touchstart"===t||"touchmove"===t||"wheel"===t||"mousewheel"===t?e.addEventListener(Ee[t]||t,o,!!b.passiveEvents&&{passive:!1}):"mouseenter"===t||"mouseleave"===t?e.addEventListener(Ee[t],o=function(t){t=t||window.event,We(e,t)&&s(t)},!1):e.addEventListener(t,s,!1):e.attachEvent("on"+t,o),e[E]=e[E]||{},e[E][r]=o)}function Oe(t,e,i,n,o){o=o||e+h(i)+(n?"_"+h(n):"");var s,r,i=t[E]&&t[E][o];i&&(!b.touchNative&&b.pointer&&0===e.indexOf("touch")?(n=t,r=i,Gt[s=e]?n.removeEventListener(Gt[s],r,!1):console.warn("wrong event specified:",s)):b.touch&&"dblclick"===e?(n=i,(r=t).removeEventListener("dblclick",n.dblclick),r.removeEventListener("click",n.simDblclick)):"removeEventListener"in t?t.removeEventListener(Ee[e]||e,i,!1):t.detachEvent("on"+e,i),t[E][o]=null)}function Ae(t){return t.stopPropagation?t.stopPropagation():t.originalEvent?t.originalEvent._stopped=!0:t.cancelBubble=!0,this}function Be(t){return ke(t,"wheel",Ae),this}function Ie(t){return S(t,"mousedown touchstart dblclick contextmenu",Ae),t._leaflet_disable_click=!0,this}function O(t){return t.preventDefault?t.preventDefault():t.returnValue=!1,this}function Re(t){return O(t),Ae(t),this}function Ne(t){if(t.composedPath)return t.composedPath();for(var e=[],i=t.target;i;)e.push(i),i=i.parentNode;return e}function De(t,e){var i,n;return e?(n=(i=Ze(e)).boundingClientRect,new p((t.clientX-n.left)/i.x-e.clientLeft,(t.clientY-n.top)/i.y-e.clientTop)):new p(t.clientX,t.clientY)}var je=b.linux&&b.chrome?window.devicePixelRatio:b.mac?3*window.devicePixelRatio:0<window.devicePixelRatio?2*window.devicePixelRatio:1;function He(t){return b.edge?t.wheelDeltaY/2:t.deltaY&&0===t.deltaMode?-t.deltaY/je:t.deltaY&&1===t.deltaMode?20*-t.deltaY:t.deltaY&&2===t.deltaMode?60*-t.deltaY:t.deltaX||t.deltaZ?0:t.wheelDelta?(t.wheelDeltaY||t.wheelDelta)/2:t.detail&&Math.abs(t.detail)<32765?20*-t.detail:t.detail?t.detail/-32765*60:0}function We(t,e){var i=e.relatedTarget;if(!i)return!0;try{for(;i&&i!==t;)i=i.parentNode}catch(t){return!1}return i!==t}var mt={__proto__:null,on:S,off:k,stopPropagation:Ae,disableScrollPropagation:Be,disableClickPropagation:Ie,preventDefault:O,stop:Re,getPropagationPath:Ne,getMousePosition:De,getWheelDelta:He,isExternalTarget:We,addListener:S,removeListener:k},Fe=it.extend({run:function(t,e,i,n){this.stop(),this._el=t,this._inProgress=!0,this._duration=i||.25,this._easeOutPower=1/Math.max(n||.5,.2),this._startPos=Pe(t),this._offset=e.subtract(this._startPos),this._startTime=+new Date,this.fire("start"),this._animate()},stop:function(){this._inProgress&&(this._step(!0),this._complete())},_animate:function(){this._animId=x(this._animate,this),this._step()},_step:function(t){var e=+new Date-this._startTime,i=1e3*this._duration;e<i?this._runFrame(this._easeOut(e/i),t):(this._runFrame(1),this._complete())},_runFrame:function(t,e){t=this._startPos.add(this._offset.multiplyBy(t));e&&t._round(),Z(this._el,t),this.fire("step")},_complete:function(){r(this._animId),this._inProgress=!1,this.fire("end")},_easeOut:function(t){return 1-Math.pow(1-t,this._easeOutPower)}}),A=it.extend({options:{crs:lt,center:void 0,zoom:void 0,minZoom:void 0,maxZoom:void 0,layers:[],maxBounds:void 0,renderer:void 0,zoomAnimation:!0,zoomAnimationThreshold:4,fadeAnimation:!0,markerZoomAnimation:!0,transform3DLimit:8388608,zoomSnap:1,zoomDelta:1,trackResize:!0},initialize:function(t,e){e=c(this,e),this._handlers=[],this._layers={},this._zoomBoundLayers={},this._sizeChanged=!0,this._initContainer(t),this._initLayout(),this._onResize=a(this._onResize,this),this._initEvents(),e.maxBounds&&this.setMaxBounds(e.maxBounds),void 0!==e.zoom&&(this._zoom=this._limitZoom(e.zoom)),e.center&&void 0!==e.zoom&&this.setView(w(e.center),e.zoom,{reset:!0}),this.callInitHooks(),this._zoomAnimated=ce&&b.any3d&&!b.mobileOpera&&this.options.zoomAnimation,this._zoomAnimated&&(this._createAnimProxy(),S(this._proxy,de,this._catchTransitionEnd,this)),this._addLayers(this.options.layers)},setView:function(t,e,i){if((e=void 0===e?this._zoom:this._limitZoom(e),t=this._limitCenter(w(t),e,this.options.maxBounds),i=i||{},this._stop(),this._loaded&&!i.reset&&!0!==i)&&(void 0!==i.animate&&(i.zoom=l({animate:i.animate},i.zoom),i.pan=l({animate:i.animate,duration:i.duration},i.pan)),this._zoom!==e?this._tryAnimatedZoom&&this._tryAnimatedZoom(t,e,i.zoom):this._tryAnimatedPan(t,i.pan)))return clearTimeout(this._sizeTimer),this;return this._resetView(t,e,i.pan&&i.pan.noMoveStart),this},setZoom:function(t,e){return this._loaded?this.setView(this.getCenter(),t,{zoom:e}):(this._zoom=t,this)},zoomIn:function(t,e){return t=t||(b.any3d?this.options.zoomDelta:1),this.setZoom(this._zoom+t,e)},zoomOut:function(t,e){return t=t||(b.any3d?this.options.zoomDelta:1),this.setZoom(this._zoom-t,e)},setZoomAround:function(t,e,i){var n=this.getZoomScale(e),o=this.getSize().divideBy(2),t=(t instanceof p?t:this.latLngToContainerPoint(t)).subtract(o).multiplyBy(1-1/n),n=this.containerPointToLatLng(o.add(t));return this.setView(n,e,{zoom:i})},_getBoundsCenterZoom:function(t,e){e=e||{},t=t.getBounds?t.getBounds():g(t);var i=m(e.paddingTopLeft||e.padding||[0,0]),n=m(e.paddingBottomRight||e.padding||[0,0]),o=this.getBoundsZoom(t,!1,i.add(n));return(o="number"==typeof e.maxZoom?Math.min(e.maxZoom,o):o)===1/0?{center:t.getCenter(),zoom:o}:(e=n.subtract(i).divideBy(2),n=this.project(t.getSouthWest(),o),i=this.project(t.getNorthEast(),o),{center:this.unproject(n.add(i).divideBy(2).add(e),o),zoom:o})},fitBounds:function(t,e){if((t=g(t)).isValid())return t=this._getBoundsCenterZoom(t,e),this.setView(t.center,t.zoom,e);throw new Error("Bounds are not valid.")},fitWorld:function(t){return this.fitBounds([[-90,-180],[90,180]],t)},panTo:function(t,e){return this.setView(t,this._zoom,{pan:e})},panBy:function(t,e){var i;return e=e||{},(t=m(t).round()).x||t.y?(!0===e.animate||this.getSize().contains(t)?(this._panAnim||(this._panAnim=new Fe,this._panAnim.on({step:this._onPanTransitionStep,end:this._onPanTransitionEnd},this)),e.noMoveStart||this.fire("movestart"),!1!==e.animate?(M(this._mapPane,"leaflet-pan-anim"),i=this._getMapPanePos().subtract(t).round(),this._panAnim.run(this._mapPane,i,e.duration||.25,e.easeLinearity)):(this._rawPanBy(t),this.fire("move").fire("moveend"))):this._resetView(this.unproject(this.project(this.getCenter()).add(t)),this.getZoom()),this):this.fire("moveend")},flyTo:function(n,o,t){if(!1===(t=t||{}).animate||!b.any3d)return this.setView(n,o,t);this._stop();var s=this.project(this.getCenter()),r=this.project(n),e=this.getSize(),a=this._zoom,h=(n=w(n),o=void 0===o?a:o,Math.max(e.x,e.y)),i=h*this.getZoomScale(a,o),l=r.distanceTo(s)||1,u=1.42,c=u*u;function d(t){t=(i*i-h*h+(t?-1:1)*c*c*l*l)/(2*(t?i:h)*c*l),t=Math.sqrt(t*t+1)-t;return t<1e-9?-18:Math.log(t)}function _(t){return(Math.exp(t)-Math.exp(-t))/2}function p(t){return(Math.exp(t)+Math.exp(-t))/2}var m=d(0);function f(t){return h*(p(m)*(_(t=m+u*t)/p(t))-_(m))/c}var g=Date.now(),v=(d(1)-m)/u,y=t.duration?1e3*t.duration:1e3*v*.8;return this._moveStart(!0,t.noMoveStart),function t(){var e=(Date.now()-g)/y,i=(1-Math.pow(1-e,1.5))*v;e<=1?(this._flyToFrame=x(t,this),this._move(this.unproject(s.add(r.subtract(s).multiplyBy(f(i)/l)),a),this.getScaleZoom(h/(e=i,h*(p(m)/p(m+u*e))),a),{flyTo:!0})):this._move(n,o)._moveEnd(!0)}.call(this),this},flyToBounds:function(t,e){t=this._getBoundsCenterZoom(t,e);return this.flyTo(t.center,t.zoom,e)},setMaxBounds:function(t){return t=g(t),this.listens("moveend",this._panInsideMaxBounds)&&this.off("moveend",this._panInsideMaxBounds),t.isValid()?(this.options.maxBounds=t,this._loaded&&this._panInsideMaxBounds(),this.on("moveend",this._panInsideMaxBounds)):(this.options.maxBounds=null,this)},setMinZoom:function(t){var e=this.options.minZoom;return this.options.minZoom=t,this._loaded&&e!==t&&(this.fire("zoomlevelschange"),this.getZoom()<this.options.minZoom)?this.setZoom(t):this},setMaxZoom:function(t){var e=this.options.maxZoom;return this.options.maxZoom=t,this._loaded&&e!==t&&(this.fire("zoomlevelschange"),this.getZoom()>this.options.maxZoom)?this.setZoom(t):this},panInsideBounds:function(t,e){this._enforcingBounds=!0;var i=this.getCenter(),t=this._limitCenter(i,this._zoom,g(t));return i.equals(t)||this.panTo(t,e),this._enforcingBounds=!1,this},panInside:function(t,e){var i=m((e=e||{}).paddingTopLeft||e.padding||[0,0]),n=m(e.paddingBottomRight||e.padding||[0,0]),o=this.project(this.getCenter()),t=this.project(t),s=this.getPixelBounds(),i=_([s.min.add(i),s.max.subtract(n)]),s=i.getSize();return i.contains(t)||(this._enforcingBounds=!0,n=t.subtract(i.getCenter()),i=i.extend(t).getSize().subtract(s),o.x+=n.x<0?-i.x:i.x,o.y+=n.y<0?-i.y:i.y,this.panTo(this.unproject(o),e),this._enforcingBounds=!1),this},invalidateSize:function(t){if(!this._loaded)return this;t=l({animate:!1,pan:!0},!0===t?{animate:!0}:t);var e=this.getSize(),i=(this._sizeChanged=!0,this._lastCenter=null,this.getSize()),n=e.divideBy(2).round(),o=i.divideBy(2).round(),n=n.subtract(o);return n.x||n.y?(t.animate&&t.pan?this.panBy(n):(t.pan&&this._rawPanBy(n),this.fire("move"),t.debounceMoveend?(clearTimeout(this._sizeTimer),this._sizeTimer=setTimeout(a(this.fire,this,"moveend"),200)):this.fire("moveend")),this.fire("resize",{oldSize:e,newSize:i})):this},stop:function(){return this.setZoom(this._limitZoom(this._zoom)),this.options.zoomSnap||this.fire("viewreset"),this._stop()},locate:function(t){var e,i;return t=this._locateOptions=l({timeout:1e4,watch:!1},t),"geolocation"in navigator?(e=a(this._handleGeolocationResponse,this),i=a(this._handleGeolocationError,this),t.watch?this._locationWatchId=navigator.geolocation.watchPosition(e,i,t):navigator.geolocation.getCurrentPosition(e,i,t)):this._handleGeolocationError({code:0,message:"Geolocation not supported."}),this},stopLocate:function(){return navigator.geolocation&&navigator.geolocation.clearWatch&&navigator.geolocation.clearWatch(this._locationWatchId),this._locateOptions&&(this._locateOptions.setView=!1),this},_handleGeolocationError:function(t){var e;this._container._leaflet_id&&(e=t.code,t=t.message||(1===e?"permission denied":2===e?"position unavailable":"timeout"),this._locateOptions.setView&&!this._loaded&&this.fitWorld(),this.fire("locationerror",{code:e,message:"Geolocation error: "+t+"."}))},_handleGeolocationResponse:function(t){if(this._container._leaflet_id){var e,i,n=new v(t.coords.latitude,t.coords.longitude),o=n.toBounds(2*t.coords.accuracy),s=this._locateOptions,r=(s.setView&&(e=this.getBoundsZoom(o),this.setView(n,s.maxZoom?Math.min(e,s.maxZoom):e)),{latlng:n,bounds:o,timestamp:t.timestamp});for(i in t.coords)"number"==typeof t.coords[i]&&(r[i]=t.coords[i]);this.fire("locationfound",r)}},addHandler:function(t,e){return e&&(e=this[t]=new e(this),this._handlers.push(e),this.options[t]&&e.enable()),this},remove:function(){if(this._initEvents(!0),this.options.maxBounds&&this.off("moveend",this._panInsideMaxBounds),this._containerId!==this._container._leaflet_id)throw new Error("Map container is being reused by another instance");try{delete this._container._leaflet_id,delete this._containerId}catch(t){this._container._leaflet_id=void 0,this._containerId=void 0}for(var t in void 0!==this._locationWatchId&&this.stopLocate(),this._stop(),T(this._mapPane),this._clearControlPos&&this._clearControlPos(),this._resizeRequest&&(r(this._resizeRequest),this._resizeRequest=null),this._clearHandlers(),this._loaded&&this.fire("unload"),this._layers)this._layers[t].remove();for(t in this._panes)T(this._panes[t]);return this._layers=[],this._panes=[],delete this._mapPane,delete this._renderer,this},createPane:function(t,e){e=P("div","leaflet-pane"+(t?" leaflet-"+t.replace("Pane","")+"-pane":""),e||this._mapPane);return t&&(this._panes[t]=e),e},getCenter:function(){return this._checkIfLoaded(),this._lastCenter&&!this._moved()?this._lastCenter.clone():this.layerPointToLatLng(this._getCenterLayerPoint())},getZoom:function(){return this._zoom},getBounds:function(){var t=this.getPixelBounds();return new s(this.unproject(t.getBottomLeft()),this.unproject(t.getTopRight()))},getMinZoom:function(){return void 0===this.options.minZoom?this._layersMinZoom||0:this.options.minZoom},getMaxZoom:function(){return void 0===this.options.maxZoom?void 0===this._layersMaxZoom?1/0:this._layersMaxZoom:this.options.maxZoom},getBoundsZoom:function(t,e,i){t=g(t),i=m(i||[0,0]);var n=this.getZoom()||0,o=this.getMinZoom(),s=this.getMaxZoom(),r=t.getNorthWest(),t=t.getSouthEast(),i=this.getSize().subtract(i),t=_(this.project(t,n),this.project(r,n)).getSize(),r=b.any3d?this.options.zoomSnap:1,a=i.x/t.x,i=i.y/t.y,t=e?Math.max(a,i):Math.min(a,i),n=this.getScaleZoom(t,n);return r&&(n=Math.round(n/(r/100))*(r/100),n=e?Math.ceil(n/r)*r:Math.floor(n/r)*r),Math.max(o,Math.min(s,n))},getSize:function(){return this._size&&!this._sizeChanged||(this._size=new p(this._container.clientWidth||0,this._container.clientHeight||0),this._sizeChanged=!1),this._size.clone()},getPixelBounds:function(t,e){t=this._getTopLeftPoint(t,e);return new f(t,t.add(this.getSize()))},getPixelOrigin:function(){return this._checkIfLoaded(),this._pixelOrigin},getPixelWorldBounds:function(t){return this.options.crs.getProjectedBounds(void 0===t?this.getZoom():t)},getPane:function(t){return"string"==typeof t?this._panes[t]:t},getPanes:function(){return this._panes},getContainer:function(){return this._container},getZoomScale:function(t,e){var i=this.options.crs;return e=void 0===e?this._zoom:e,i.scale(t)/i.scale(e)},getScaleZoom:function(t,e){var i=this.options.crs,t=(e=void 0===e?this._zoom:e,i.zoom(t*i.scale(e)));return isNaN(t)?1/0:t},project:function(t,e){return e=void 0===e?this._zoom:e,this.options.crs.latLngToPoint(w(t),e)},unproject:function(t,e){return e=void 0===e?this._zoom:e,this.options.crs.pointToLatLng(m(t),e)},layerPointToLatLng:function(t){t=m(t).add(this.getPixelOrigin());return this.unproject(t)},latLngToLayerPoint:function(t){return this.project(w(t))._round()._subtract(this.getPixelOrigin())},wrapLatLng:function(t){return this.options.crs.wrapLatLng(w(t))},wrapLatLngBounds:function(t){return this.options.crs.wrapLatLngBounds(g(t))},distance:function(t,e){return this.options.crs.distance(w(t),w(e))},containerPointToLayerPoint:function(t){return m(t).subtract(this._getMapPanePos())},layerPointToContainerPoint:function(t){return m(t).add(this._getMapPanePos())},containerPointToLatLng:function(t){t=this.containerPointToLayerPoint(m(t));return this.layerPointToLatLng(t)},latLngToContainerPoint:function(t){return this.layerPointToContainerPoint(this.latLngToLayerPoint(w(t)))},mouseEventToContainerPoint:function(t){return De(t,this._container)},mouseEventToLayerPoint:function(t){return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t))},mouseEventToLatLng:function(t){return this.layerPointToLatLng(this.mouseEventToLayerPoint(t))},_initContainer:function(t){t=this._container=_e(t);if(!t)throw new Error("Map container not found.");if(t._leaflet_id)throw new Error("Map container is already initialized.");S(t,"scroll",this._onScroll,this),this._containerId=h(t)},_initLayout:function(){var t=this._container,e=(this._fadeAnimated=this.options.fadeAnimation&&b.any3d,M(t,"leaflet-container"+(b.touch?" leaflet-touch":"")+(b.retina?" leaflet-retina":"")+(b.ielt9?" leaflet-oldie":"")+(b.safari?" leaflet-safari":"")+(this._fadeAnimated?" leaflet-fade-anim":"")),pe(t,"position"));"absolute"!==e&&"relative"!==e&&"fixed"!==e&&"sticky"!==e&&(t.style.position="relative"),this._initPanes(),this._initControlPos&&this._initControlPos()},_initPanes:function(){var t=this._panes={};this._paneRenderers={},this._mapPane=this.createPane("mapPane",this._container),Z(this._mapPane,new p(0,0)),this.createPane("tilePane"),this.createPane("overlayPane"),this.createPane("shadowPane"),this.createPane("markerPane"),this.createPane("tooltipPane"),this.createPane("popupPane"),this.options.markerZoomAnimation||(M(t.markerPane,"leaflet-zoom-hide"),M(t.shadowPane,"leaflet-zoom-hide"))},_resetView:function(t,e,i){Z(this._mapPane,new p(0,0));var n=!this._loaded,o=(this._loaded=!0,e=this._limitZoom(e),this.fire("viewprereset"),this._zoom!==e);this._moveStart(o,i)._move(t,e)._moveEnd(o),this.fire("viewreset"),n&&this.fire("load")},_moveStart:function(t,e){return t&&this.fire("zoomstart"),e||this.fire("movestart"),this},_move:function(t,e,i,n){void 0===e&&(e=this._zoom);var o=this._zoom!==e;return this._zoom=e,this._lastCenter=t,this._pixelOrigin=this._getNewPixelOrigin(t),n?i&&i.pinch&&this.fire("zoom",i):((o||i&&i.pinch)&&this.fire("zoom",i),this.fire("move",i)),this},_moveEnd:function(t){return t&&this.fire("zoomend"),this.fire("moveend")},_stop:function(){return r(this._flyToFrame),this._panAnim&&this._panAnim.stop(),this},_rawPanBy:function(t){Z(this._mapPane,this._getMapPanePos().subtract(t))},_getZoomSpan:function(){return this.getMaxZoom()-this.getMinZoom()},_panInsideMaxBounds:function(){this._enforcingBounds||this.panInsideBounds(this.options.maxBounds)},_checkIfLoaded:function(){if(!this._loaded)throw new Error("Set map center and zoom first.")},_initEvents:function(t){this._targets={};var e=t?k:S;e((this._targets[h(this._container)]=this)._container,"click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup",this._handleDOMEvent,this),this.options.trackResize&&e(window,"resize",this._onResize,this),b.any3d&&this.options.transform3DLimit&&(t?this.off:this.on).call(this,"moveend",this._onMoveEnd)},_onResize:function(){r(this._resizeRequest),this._resizeRequest=x(function(){this.invalidateSize({debounceMoveend:!0})},this)},_onScroll:function(){this._container.scrollTop=0,this._container.scrollLeft=0},_onMoveEnd:function(){var t=this._getMapPanePos();Math.max(Math.abs(t.x),Math.abs(t.y))>=this.options.transform3DLimit&&this._resetView(this.getCenter(),this.getZoom())},_findEventTargets:function(t,e){for(var i,n=[],o="mouseout"===e||"mouseover"===e,s=t.target||t.srcElement,r=!1;s;){if((i=this._targets[h(s)])&&("click"===e||"preclick"===e)&&this._draggableMoved(i)){r=!0;break}if(i&&i.listens(e,!0)){if(o&&!We(s,t))break;if(n.push(i),o)break}if(s===this._container)break;s=s.parentNode}return n=n.length||r||o||!this.listens(e,!0)?n:[this]},_isClickDisabled:function(t){for(;t&&t!==this._container;){if(t._leaflet_disable_click)return!0;t=t.parentNode}},_handleDOMEvent:function(t){var e,i=t.target||t.srcElement;!this._loaded||i._leaflet_disable_events||"click"===t.type&&this._isClickDisabled(i)||("mousedown"===(e=t.type)&&Me(i),this._fireDOMEvent(t,e))},_mouseEvents:["click","dblclick","mouseover","mouseout","contextmenu"],_fireDOMEvent:function(t,e,i){"click"===t.type&&((a=l({},t)).type="preclick",this._fireDOMEvent(a,a.type,i));var n=this._findEventTargets(t,e);if(i){for(var o=[],s=0;s<i.length;s++)i[s].listens(e,!0)&&o.push(i[s]);n=o.concat(n)}if(n.length){"contextmenu"===e&&O(t);var r,a=n[0],h={originalEvent:t};for("keypress"!==t.type&&"keydown"!==t.type&&"keyup"!==t.type&&(r=a.getLatLng&&(!a._radius||a._radius<=10),h.containerPoint=r?this.latLngToContainerPoint(a.getLatLng()):this.mouseEventToContainerPoint(t),h.layerPoint=this.containerPointToLayerPoint(h.containerPoint),h.latlng=r?a.getLatLng():this.layerPointToLatLng(h.layerPoint)),s=0;s<n.length;s++)if(n[s].fire(e,h,!0),h.originalEvent._stopped||!1===n[s].options.bubblingMouseEvents&&-1!==G(this._mouseEvents,e))return}},_draggableMoved:function(t){return(t=t.dragging&&t.dragging.enabled()?t:this).dragging&&t.dragging.moved()||this.boxZoom&&this.boxZoom.moved()},_clearHandlers:function(){for(var t=0,e=this._handlers.length;t<e;t++)this._handlers[t].disable()},whenReady:function(t,e){return this._loaded?t.call(e||this,{target:this}):this.on("load",t,e),this},_getMapPanePos:function(){return Pe(this._mapPane)||new p(0,0)},_moved:function(){var t=this._getMapPanePos();return t&&!t.equals([0,0])},_getTopLeftPoint:function(t,e){return(t&&void 0!==e?this._getNewPixelOrigin(t,e):this.getPixelOrigin()).subtract(this._getMapPanePos())},_getNewPixelOrigin:function(t,e){var i=this.getSize()._divideBy(2);return this.project(t,e)._subtract(i)._add(this._getMapPanePos())._round()},_latLngToNewLayerPoint:function(t,e,i){i=this._getNewPixelOrigin(i,e);return this.project(t,e)._subtract(i)},_latLngBoundsToNewLayerBounds:function(t,e,i){i=this._getNewPixelOrigin(i,e);return _([this.project(t.getSouthWest(),e)._subtract(i),this.project(t.getNorthWest(),e)._subtract(i),this.project(t.getSouthEast(),e)._subtract(i),this.project(t.getNorthEast(),e)._subtract(i)])},_getCenterLayerPoint:function(){return this.containerPointToLayerPoint(this.getSize()._divideBy(2))},_getCenterOffset:function(t){return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint())},_limitCenter:function(t,e,i){var n,o;return!i||(n=this.project(t,e),o=this.getSize().divideBy(2),o=new f(n.subtract(o),n.add(o)),o=this._getBoundsOffset(o,i,e),Math.abs(o.x)<=1&&Math.abs(o.y)<=1)?t:this.unproject(n.add(o),e)},_limitOffset:function(t,e){var i;return e?(i=new f((i=this.getPixelBounds()).min.add(t),i.max.add(t)),t.add(this._getBoundsOffset(i,e))):t},_getBoundsOffset:function(t,e,i){e=_(this.project(e.getNorthEast(),i),this.project(e.getSouthWest(),i)),i=e.min.subtract(t.min),e=e.max.subtract(t.max);return new p(this._rebound(i.x,-e.x),this._rebound(i.y,-e.y))},_rebound:function(t,e){return 0<t+e?Math.round(t-e)/2:Math.max(0,Math.ceil(t))-Math.max(0,Math.floor(e))},_limitZoom:function(t){var e=this.getMinZoom(),i=this.getMaxZoom(),n=b.any3d?this.options.zoomSnap:1;return n&&(t=Math.round(t/n)*n),Math.max(e,Math.min(i,t))},_onPanTransitionStep:function(){this.fire("move")},_onPanTransitionEnd:function(){z(this._mapPane,"leaflet-pan-anim"),this.fire("moveend")},_tryAnimatedPan:function(t,e){t=this._getCenterOffset(t)._trunc();return!(!0!==(e&&e.animate)&&!this.getSize().contains(t))&&(this.panBy(t,e),!0)},_createAnimProxy:function(){var t=this._proxy=P("div","leaflet-proxy leaflet-zoom-animated");this._panes.mapPane.appendChild(t),this.on("zoomanim",function(t){var e=ue,i=this._proxy.style[e];be(this._proxy,this.project(t.center,t.zoom),this.getZoomScale(t.zoom,1)),i===this._proxy.style[e]&&this._animatingZoom&&this._onZoomTransitionEnd()},this),this.on("load moveend",this._animMoveEnd,this),this._on("unload",this._destroyAnimProxy,this)},_destroyAnimProxy:function(){T(this._proxy),this.off("load moveend",this._animMoveEnd,this),delete this._proxy},_animMoveEnd:function(){var t=this.getCenter(),e=this.getZoom();be(this._proxy,this.project(t,e),this.getZoomScale(e,1))},_catchTransitionEnd:function(t){this._animatingZoom&&0<=t.propertyName.indexOf("transform")&&this._onZoomTransitionEnd()},_nothingToAnimate:function(){return!this._container.getElementsByClassName("leaflet-zoom-animated").length},_tryAnimatedZoom:function(t,e,i){if(!this._animatingZoom){if(i=i||{},!this._zoomAnimated||!1===i.animate||this._nothingToAnimate()||Math.abs(e-this._zoom)>this.options.zoomAnimationThreshold)return!1;var n=this.getZoomScale(e),n=this._getCenterOffset(t)._divideBy(1-1/n);if(!0!==i.animate&&!this.getSize().contains(n))return!1;x(function(){this._moveStart(!0,i.noMoveStart||!1)._animateZoom(t,e,!0)},this)}return!0},_animateZoom:function(t,e,i,n){this._mapPane&&(i&&(this._animatingZoom=!0,this._animateToCenter=t,this._animateToZoom=e,M(this._mapPane,"leaflet-zoom-anim")),this.fire("zoomanim",{center:t,zoom:e,noUpdate:n}),this._tempFireZoomEvent||(this._tempFireZoomEvent=this._zoom!==this._animateToZoom),this._move(this._animateToCenter,this._animateToZoom,void 0,!0),setTimeout(a(this._onZoomTransitionEnd,this),250))},_onZoomTransitionEnd:function(){this._animatingZoom&&(this._mapPane&&z(this._mapPane,"leaflet-zoom-anim"),this._animatingZoom=!1,this._move(this._animateToCenter,this._animateToZoom,void 0,!0),this._tempFireZoomEvent&&this.fire("zoom"),delete this._tempFireZoomEvent,this.fire("move"),this._moveEnd(!0))}});function Ue(t){return new B(t)}var B=et.extend({options:{position:"topright"},initialize:function(t){c(this,t)},getPosition:function(){return this.options.position},setPosition:function(t){var e=this._map;return e&&e.removeControl(this),this.options.position=t,e&&e.addControl(this),this},getContainer:function(){return this._container},addTo:function(t){this.remove(),this._map=t;var e=this._container=this.onAdd(t),i=this.getPosition(),t=t._controlCorners[i];return M(e,"leaflet-control"),-1!==i.indexOf("bottom")?t.insertBefore(e,t.firstChild):t.appendChild(e),this._map.on("unload",this.remove,this),this},remove:function(){return this._map&&(T(this._container),this.onRemove&&this.onRemove(this._map),this._map.off("unload",this.remove,this),this._map=null),this},_refocusOnMap:function(t){this._map&&t&&0<t.screenX&&0<t.screenY&&this._map.getContainer().focus()}}),Ve=(A.include({addControl:function(t){return t.addTo(this),this},removeControl:function(t){return t.remove(),this},_initControlPos:function(){var i=this._controlCorners={},n="leaflet-",o=this._controlContainer=P("div",n+"control-container",this._container);function t(t,e){i[t+e]=P("div",n+t+" "+n+e,o)}t("top","left"),t("top","right"),t("bottom","left"),t("bottom","right")},_clearControlPos:function(){for(var t in this._controlCorners)T(this._controlCorners[t]);T(this._controlContainer),delete this._controlCorners,delete this._controlContainer}}),B.extend({options:{collapsed:!0,position:"topright",autoZIndex:!0,hideSingleBase:!1,sortLayers:!1,sortFunction:function(t,e,i,n){return i<n?-1:n<i?1:0}},initialize:function(t,e,i){for(var n in c(this,i),this._layerControlInputs=[],this._layers=[],this._lastZIndex=0,this._handlingClick=!1,this._preventClick=!1,t)this._addLayer(t[n],n);for(n in e)this._addLayer(e[n],n,!0)},onAdd:function(t){this._initLayout(),this._update(),(this._map=t).on("zoomend",this._checkDisabledLayers,this);for(var e=0;e<this._layers.length;e++)this._layers[e].layer.on("add remove",this._onLayerChange,this);return this._container},addTo:function(t){return B.prototype.addTo.call(this,t),this._expandIfNotCollapsed()},onRemove:function(){this._map.off("zoomend",this._checkDisabledLayers,this);for(var t=0;t<this._layers.length;t++)this._layers[t].layer.off("add remove",this._onLayerChange,this)},addBaseLayer:function(t,e){return this._addLayer(t,e),this._map?this._update():this},addOverlay:function(t,e){return this._addLayer(t,e,!0),this._map?this._update():this},removeLayer:function(t){t.off("add remove",this._onLayerChange,this);t=this._getLayer(h(t));return t&&this._layers.splice(this._layers.indexOf(t),1),this._map?this._update():this},expand:function(){M(this._container,"leaflet-control-layers-expanded"),this._section.style.height=null;var t=this._map.getSize().y-(this._container.offsetTop+50);return t<this._section.clientHeight?(M(this._section,"leaflet-control-layers-scrollbar"),this._section.style.height=t+"px"):z(this._section,"leaflet-control-layers-scrollbar"),this._checkDisabledLayers(),this},collapse:function(){return z(this._container,"leaflet-control-layers-expanded"),this},_initLayout:function(){var t="leaflet-control-layers",e=this._container=P("div",t),i=this.options.collapsed,n=(e.setAttribute("aria-haspopup",!0),Ie(e),Be(e),this._section=P("section",t+"-list")),o=(i&&(this._map.on("click",this.collapse,this),S(e,{mouseenter:this._expandSafely,mouseleave:this.collapse},this)),this._layersLink=P("a",t+"-toggle",e));o.href="#",o.title="Layers",o.setAttribute("role","button"),S(o,{keydown:function(t){13===t.keyCode&&this._expandSafely()},click:function(t){O(t),this._expandSafely()}},this),i||this.expand(),this._baseLayersList=P("div",t+"-base",n),this._separator=P("div",t+"-separator",n),this._overlaysList=P("div",t+"-overlays",n),e.appendChild(n)},_getLayer:function(t){for(var e=0;e<this._layers.length;e++)if(this._layers[e]&&h(this._layers[e].layer)===t)return this._layers[e]},_addLayer:function(t,e,i){this._map&&t.on("add remove",this._onLayerChange,this),this._layers.push({layer:t,name:e,overlay:i}),this.options.sortLayers&&this._layers.sort(a(function(t,e){return this.options.sortFunction(t.layer,e.layer,t.name,e.name)},this)),this.options.autoZIndex&&t.setZIndex&&(this._lastZIndex++,t.setZIndex(this._lastZIndex)),this._expandIfNotCollapsed()},_update:function(){if(this._container){me(this._baseLayersList),me(this._overlaysList),this._layerControlInputs=[];for(var t,e,i,n=0,o=0;o<this._layers.length;o++)i=this._layers[o],this._addItem(i),e=e||i.overlay,t=t||!i.overlay,n+=i.overlay?0:1;this.options.hideSingleBase&&(this._baseLayersList.style.display=(t=t&&1<n)?"":"none"),this._separator.style.display=e&&t?"":"none"}return this},_onLayerChange:function(t){this._handlingClick||this._update();var e=this._getLayer(h(t.target)),t=e.overlay?"add"===t.type?"overlayadd":"overlayremove":"add"===t.type?"baselayerchange":null;t&&this._map.fire(t,e)},_createRadioElement:function(t,e){t='<input type="radio" class="leaflet-control-layers-selector" name="'+t+'"'+(e?' checked="checked"':"")+"/>",e=document.createElement("div");return e.innerHTML=t,e.firstChild},_addItem:function(t){var e,i=document.createElement("label"),n=this._map.hasLayer(t.layer),n=(t.overlay?((e=document.createElement("input")).type="checkbox",e.className="leaflet-control-layers-selector",e.defaultChecked=n):e=this._createRadioElement("leaflet-base-layers_"+h(this),n),this._layerControlInputs.push(e),e.layerId=h(t.layer),S(e,"click",this._onInputClick,this),document.createElement("span")),o=(n.innerHTML=" "+t.name,document.createElement("span"));return i.appendChild(o),o.appendChild(e),o.appendChild(n),(t.overlay?this._overlaysList:this._baseLayersList).appendChild(i),this._checkDisabledLayers(),i},_onInputClick:function(){if(!this._preventClick){var t,e,i=this._layerControlInputs,n=[],o=[];this._handlingClick=!0;for(var s=i.length-1;0<=s;s--)t=i[s],e=this._getLayer(t.layerId).layer,t.checked?n.push(e):t.checked||o.push(e);for(s=0;s<o.length;s++)this._map.hasLayer(o[s])&&this._map.removeLayer(o[s]);for(s=0;s<n.length;s++)this._map.hasLayer(n[s])||this._map.addLayer(n[s]);this._handlingClick=!1,this._refocusOnMap()}},_checkDisabledLayers:function(){for(var t,e,i=this._layerControlInputs,n=this._map.getZoom(),o=i.length-1;0<=o;o--)t=i[o],e=this._getLayer(t.layerId).layer,t.disabled=void 0!==e.options.minZoom&&n<e.options.minZoom||void 0!==e.options.maxZoom&&n>e.options.maxZoom},_expandIfNotCollapsed:function(){return this._map&&!this.options.collapsed&&this.expand(),this},_expandSafely:function(){var t=this._section,e=(this._preventClick=!0,S(t,"click",O),this.expand(),this);setTimeout(function(){k(t,"click",O),e._preventClick=!1})}})),qe=B.extend({options:{position:"topleft",zoomInText:'<span aria-hidden="true">+</span>',zoomInTitle:"Zoom in",zoomOutText:'<span aria-hidden="true">&#x2212;</span>',zoomOutTitle:"Zoom out"},onAdd:function(t){var e="leaflet-control-zoom",i=P("div",e+" leaflet-bar"),n=this.options;return this._zoomInButton=this._createButton(n.zoomInText,n.zoomInTitle,e+"-in",i,this._zoomIn),this._zoomOutButton=this._createButton(n.zoomOutText,n.zoomOutTitle,e+"-out",i,this._zoomOut),this._updateDisabled(),t.on("zoomend zoomlevelschange",this._updateDisabled,this),i},onRemove:function(t){t.off("zoomend zoomlevelschange",this._updateDisabled,this)},disable:function(){return this._disabled=!0,this._updateDisabled(),this},enable:function(){return this._disabled=!1,this._updateDisabled(),this},_zoomIn:function(t){!this._disabled&&this._map._zoom<this._map.getMaxZoom()&&this._map.zoomIn(this._map.options.zoomDelta*(t.shiftKey?3:1))},_zoomOut:function(t){!this._disabled&&this._map._zoom>this._map.getMinZoom()&&this._map.zoomOut(this._map.options.zoomDelta*(t.shiftKey?3:1))},_createButton:function(t,e,i,n,o){i=P("a",i,n);return i.innerHTML=t,i.href="#",i.title=e,i.setAttribute("role","button"),i.setAttribute("aria-label",e),Ie(i),S(i,"click",Re),S(i,"click",o,this),S(i,"click",this._refocusOnMap,this),i},_updateDisabled:function(){var t=this._map,e="leaflet-disabled";z(this._zoomInButton,e),z(this._zoomOutButton,e),this._zoomInButton.setAttribute("aria-disabled","false"),this._zoomOutButton.setAttribute("aria-disabled","false"),!this._disabled&&t._zoom!==t.getMinZoom()||(M(this._zoomOutButton,e),this._zoomOutButton.setAttribute("aria-disabled","true")),!this._disabled&&t._zoom!==t.getMaxZoom()||(M(this._zoomInButton,e),this._zoomInButton.setAttribute("aria-disabled","true"))}}),Ge=(A.mergeOptions({zoomControl:!0}),A.addInitHook(function(){this.options.zoomControl&&(this.zoomControl=new qe,this.addControl(this.zoomControl))}),B.extend({options:{position:"bottomleft",maxWidth:100,metric:!0,imperial:!0},onAdd:function(t){var e="leaflet-control-scale",i=P("div",e),n=this.options;return this._addScales(n,e+"-line",i),t.on(n.updateWhenIdle?"moveend":"move",this._update,this),t.whenReady(this._update,this),i},onRemove:function(t){t.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScales:function(t,e,i){t.metric&&(this._mScale=P("div",e,i)),t.imperial&&(this._iScale=P("div",e,i))},_update:function(){var t=this._map,e=t.getSize().y/2,t=t.distance(t.containerPointToLatLng([0,e]),t.containerPointToLatLng([this.options.maxWidth,e]));this._updateScales(t)},_updateScales:function(t){this.options.metric&&t&&this._updateMetric(t),this.options.imperial&&t&&this._updateImperial(t)},_updateMetric:function(t){var e=this._getRoundNum(t);this._updateScale(this._mScale,e<1e3?e+" m":e/1e3+" km",e/t)},_updateImperial:function(t){var e,i,t=3.2808399*t;5280<t?(i=this._getRoundNum(e=t/5280),this._updateScale(this._iScale,i+" mi",i/e)):(i=this._getRoundNum(t),this._updateScale(this._iScale,i+" ft",i/t))},_updateScale:function(t,e,i){t.style.width=Math.round(this.options.maxWidth*i)+"px",t.innerHTML=e},_getRoundNum:function(t){var e=Math.pow(10,(Math.floor(t)+"").length-1),t=t/e;return e*(t=10<=t?10:5<=t?5:3<=t?3:2<=t?2:1)}})),Ke=B.extend({options:{position:"bottomright",prefix:'<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">'+(b.inlineSvg?'<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg> ':"")+"Leaflet</a>"},initialize:function(t){c(this,t),this._attributions={}},onAdd:function(t){for(var e in(t.attributionControl=this)._container=P("div","leaflet-control-attribution"),Ie(this._container),t._layers)t._layers[e].getAttribution&&this.addAttribution(t._layers[e].getAttribution());return this._update(),t.on("layeradd",this._addAttribution,this),this._container},onRemove:function(t){t.off("layeradd",this._addAttribution,this)},_addAttribution:function(t){t.layer.getAttribution&&(this.addAttribution(t.layer.getAttribution()),t.layer.once("remove",function(){this.removeAttribution(t.layer.getAttribution())},this))},setPrefix:function(t){return this.options.prefix=t,this._update(),this},addAttribution:function(t){return t&&(this._attributions[t]||(this._attributions[t]=0),this._attributions[t]++,this._update()),this},removeAttribution:function(t){return t&&this._attributions[t]&&(this._attributions[t]--,this._update()),this},_update:function(){if(this._map){var t,e=[];for(t in this._attributions)this._attributions[t]&&e.push(t);var i=[];this.options.prefix&&i.push(this.options.prefix),e.length&&i.push(e.join(", ")),this._container.innerHTML=i.join(' <span aria-hidden="true">|</span> ')}}}),n=(A.mergeOptions({attributionControl:!0}),A.addInitHook(function(){this.options.attributionControl&&(new Ke).addTo(this)}),B.Layers=Ve,B.Zoom=qe,B.Scale=Ge,B.Attribution=Ke,Ue.layers=function(t,e,i){return new Ve(t,e,i)},Ue.zoom=function(t){return new qe(t)},Ue.scale=function(t){return new Ge(t)},Ue.attribution=function(t){return new Ke(t)},et.extend({initialize:function(t){this._map=t},enable:function(){return this._enabled||(this._enabled=!0,this.addHooks()),this},disable:function(){return this._enabled&&(this._enabled=!1,this.removeHooks()),this},enabled:function(){return!!this._enabled}})),ft=(n.addTo=function(t,e){return t.addHandler(e,this),this},{Events:e}),Ye=b.touch?"touchstart mousedown":"mousedown",Xe=it.extend({options:{clickTolerance:3},initialize:function(t,e,i,n){c(this,n),this._element=t,this._dragStartTarget=e||t,this._preventOutline=i},enable:function(){this._enabled||(S(this._dragStartTarget,Ye,this._onDown,this),this._enabled=!0)},disable:function(){this._enabled&&(Xe._dragging===this&&this.finishDrag(!0),k(this._dragStartTarget,Ye,this._onDown,this),this._enabled=!1,this._moved=!1)},_onDown:function(t){var e,i;this._enabled&&(this._moved=!1,ve(this._element,"leaflet-zoom-anim")||(t.touches&&1!==t.touches.length?Xe._dragging===this&&this.finishDrag():Xe._dragging||t.shiftKey||1!==t.which&&1!==t.button&&!t.touches||((Xe._dragging=this)._preventOutline&&Me(this._element),Le(),re(),this._moving||(this.fire("down"),i=t.touches?t.touches[0]:t,e=Ce(this._element),this._startPoint=new p(i.clientX,i.clientY),this._startPos=Pe(this._element),this._parentScale=Ze(e),i="mousedown"===t.type,S(document,i?"mousemove":"touchmove",this._onMove,this),S(document,i?"mouseup":"touchend touchcancel",this._onUp,this)))))},_onMove:function(t){var e;this._enabled&&(t.touches&&1<t.touches.length?this._moved=!0:!(e=new p((e=t.touches&&1===t.touches.length?t.touches[0]:t).clientX,e.clientY)._subtract(this._startPoint)).x&&!e.y||Math.abs(e.x)+Math.abs(e.y)<this.options.clickTolerance||(e.x/=this._parentScale.x,e.y/=this._parentScale.y,O(t),this._moved||(this.fire("dragstart"),this._moved=!0,M(document.body,"leaflet-dragging"),this._lastTarget=t.target||t.srcElement,window.SVGElementInstance&&this._lastTarget instanceof window.SVGElementInstance&&(this._lastTarget=this._lastTarget.correspondingUseElement),M(this._lastTarget,"leaflet-drag-target")),this._newPos=this._startPos.add(e),this._moving=!0,this._lastEvent=t,this._updatePosition()))},_updatePosition:function(){var t={originalEvent:this._lastEvent};this.fire("predrag",t),Z(this._element,this._newPos),this.fire("drag",t)},_onUp:function(){this._enabled&&this.finishDrag()},finishDrag:function(t){z(document.body,"leaflet-dragging"),this._lastTarget&&(z(this._lastTarget,"leaflet-drag-target"),this._lastTarget=null),k(document,"mousemove touchmove",this._onMove,this),k(document,"mouseup touchend touchcancel",this._onUp,this),Te(),ae();var e=this._moved&&this._moving;this._moving=!1,Xe._dragging=!1,e&&this.fire("dragend",{noInertia:t,distance:this._newPos.distanceTo(this._startPos)})}});function Je(t,e,i){for(var n,o,s,r,a,h,l,u=[1,4,2,8],c=0,d=t.length;c<d;c++)t[c]._code=si(t[c],e);for(s=0;s<4;s++){for(h=u[s],n=[],c=0,o=(d=t.length)-1;c<d;o=c++)r=t[c],a=t[o],r._code&h?a._code&h||((l=oi(a,r,h,e,i))._code=si(l,e),n.push(l)):(a._code&h&&((l=oi(a,r,h,e,i))._code=si(l,e),n.push(l)),n.push(r));t=n}return t}function $e(t,e){var i,n,o,s,r,a,h;if(!t||0===t.length)throw new Error("latlngs not passed");I(t)||(console.warn("latlngs are not flat! Only the first ring will be used"),t=t[0]);for(var l=w([0,0]),u=g(t),c=(u.getNorthWest().distanceTo(u.getSouthWest())*u.getNorthEast().distanceTo(u.getNorthWest())<1700&&(l=Qe(t)),t.length),d=[],_=0;_<c;_++){var p=w(t[_]);d.push(e.project(w([p.lat-l.lat,p.lng-l.lng])))}for(_=r=a=h=0,i=c-1;_<c;i=_++)n=d[_],o=d[i],s=n.y*o.x-o.y*n.x,a+=(n.x+o.x)*s,h+=(n.y+o.y)*s,r+=3*s;u=0===r?d[0]:[a/r,h/r],u=e.unproject(m(u));return w([u.lat+l.lat,u.lng+l.lng])}function Qe(t){for(var e=0,i=0,n=0,o=0;o<t.length;o++){var s=w(t[o]);e+=s.lat,i+=s.lng,n++}return w([e/n,i/n])}var ti,gt={__proto__:null,clipPolygon:Je,polygonCenter:$e,centroid:Qe};function ei(t,e){if(e&&t.length){var i=t=function(t,e){for(var i=[t[0]],n=1,o=0,s=t.length;n<s;n++)(function(t,e){var i=e.x-t.x,e=e.y-t.y;return i*i+e*e})(t[n],t[o])>e&&(i.push(t[n]),o=n);o<s-1&&i.push(t[s-1]);return i}(t,e=e*e),n=i.length,o=new(typeof Uint8Array!=void 0+""?Uint8Array:Array)(n);o[0]=o[n-1]=1,function t(e,i,n,o,s){var r,a,h,l=0;for(a=o+1;a<=s-1;a++)h=ri(e[a],e[o],e[s],!0),l<h&&(r=a,l=h);n<l&&(i[r]=1,t(e,i,n,o,r),t(e,i,n,r,s))}(i,o,e,0,n-1);var s,r=[];for(s=0;s<n;s++)o[s]&&r.push(i[s]);return r}return t.slice()}function ii(t,e,i){return Math.sqrt(ri(t,e,i,!0))}function ni(t,e,i,n,o){var s,r,a,h=n?ti:si(t,i),l=si(e,i);for(ti=l;;){if(!(h|l))return[t,e];if(h&l)return!1;a=si(r=oi(t,e,s=h||l,i,o),i),s===h?(t=r,h=a):(e=r,l=a)}}function oi(t,e,i,n,o){var s,r,a=e.x-t.x,e=e.y-t.y,h=n.min,n=n.max;return 8&i?(s=t.x+a*(n.y-t.y)/e,r=n.y):4&i?(s=t.x+a*(h.y-t.y)/e,r=h.y):2&i?(s=n.x,r=t.y+e*(n.x-t.x)/a):1&i&&(s=h.x,r=t.y+e*(h.x-t.x)/a),new p(s,r,o)}function si(t,e){var i=0;return t.x<e.min.x?i|=1:t.x>e.max.x&&(i|=2),t.y<e.min.y?i|=4:t.y>e.max.y&&(i|=8),i}function ri(t,e,i,n){var o=e.x,e=e.y,s=i.x-o,r=i.y-e,a=s*s+r*r;return 0<a&&(1<(a=((t.x-o)*s+(t.y-e)*r)/a)?(o=i.x,e=i.y):0<a&&(o+=s*a,e+=r*a)),s=t.x-o,r=t.y-e,n?s*s+r*r:new p(o,e)}function I(t){return!d(t[0])||"object"!=typeof t[0][0]&&void 0!==t[0][0]}function ai(t){return console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead."),I(t)}function hi(t,e){var i,n,o,s,r,a;if(!t||0===t.length)throw new Error("latlngs not passed");I(t)||(console.warn("latlngs are not flat! Only the first ring will be used"),t=t[0]);for(var h=w([0,0]),l=g(t),u=(l.getNorthWest().distanceTo(l.getSouthWest())*l.getNorthEast().distanceTo(l.getNorthWest())<1700&&(h=Qe(t)),t.length),c=[],d=0;d<u;d++){var _=w(t[d]);c.push(e.project(w([_.lat-h.lat,_.lng-h.lng])))}for(i=d=0;d<u-1;d++)i+=c[d].distanceTo(c[d+1])/2;if(0===i)a=c[0];else for(n=d=0;d<u-1;d++)if(o=c[d],s=c[d+1],i<(n+=r=o.distanceTo(s))){a=[s.x-(r=(n-i)/r)*(s.x-o.x),s.y-r*(s.y-o.y)];break}l=e.unproject(m(a));return w([l.lat+h.lat,l.lng+h.lng])}var vt={__proto__:null,simplify:ei,pointToSegmentDistance:ii,closestPointOnSegment:function(t,e,i){return ri(t,e,i)},clipSegment:ni,_getEdgeIntersection:oi,_getBitCode:si,_sqClosestPointOnSegment:ri,isFlat:I,_flat:ai,polylineCenter:hi},yt={project:function(t){return new p(t.lng,t.lat)},unproject:function(t){return new v(t.y,t.x)},bounds:new f([-180,-90],[180,90])},xt={R:6378137,R_MINOR:6356752.314245179,bounds:new f([-20037508.34279,-15496570.73972],[20037508.34279,18764656.23138]),project:function(t){var e=Math.PI/180,i=this.R,n=t.lat*e,o=this.R_MINOR/i,o=Math.sqrt(1-o*o),s=o*Math.sin(n),s=Math.tan(Math.PI/4-n/2)/Math.pow((1-s)/(1+s),o/2),n=-i*Math.log(Math.max(s,1e-10));return new p(t.lng*e*i,n)},unproject:function(t){for(var e,i=180/Math.PI,n=this.R,o=this.R_MINOR/n,s=Math.sqrt(1-o*o),r=Math.exp(-t.y/n),a=Math.PI/2-2*Math.atan(r),h=0,l=.1;h<15&&1e-7<Math.abs(l);h++)e=s*Math.sin(a),e=Math.pow((1-e)/(1+e),s/2),a+=l=Math.PI/2-2*Math.atan(r*e)-a;return new v(a*i,t.x*i/n)}},wt={__proto__:null,LonLat:yt,Mercator:xt,SphericalMercator:rt},Pt=l({},st,{code:"EPSG:3395",projection:xt,transformation:ht(bt=.5/(Math.PI*xt.R),.5,-bt,.5)}),li=l({},st,{code:"EPSG:4326",projection:yt,transformation:ht(1/180,1,-1/180,.5)}),Lt=l({},ot,{projection:yt,transformation:ht(1,0,-1,0),scale:function(t){return Math.pow(2,t)},zoom:function(t){return Math.log(t)/Math.LN2},distance:function(t,e){var i=e.lng-t.lng,e=e.lat-t.lat;return Math.sqrt(i*i+e*e)},infinite:!0}),o=(ot.Earth=st,ot.EPSG3395=Pt,ot.EPSG3857=lt,ot.EPSG900913=ut,ot.EPSG4326=li,ot.Simple=Lt,it.extend({options:{pane:"overlayPane",attribution:null,bubblingMouseEvents:!0},addTo:function(t){return t.addLayer(this),this},remove:function(){return this.removeFrom(this._map||this._mapToAdd)},removeFrom:function(t){return t&&t.removeLayer(this),this},getPane:function(t){return this._map.getPane(t?this.options[t]||t:this.options.pane)},addInteractiveTarget:function(t){return this._map._targets[h(t)]=this},removeInteractiveTarget:function(t){return delete this._map._targets[h(t)],this},getAttribution:function(){return this.options.attribution},_layerAdd:function(t){var e,i=t.target;i.hasLayer(this)&&(this._map=i,this._zoomAnimated=i._zoomAnimated,this.getEvents&&(e=this.getEvents(),i.on(e,this),this.once("remove",function(){i.off(e,this)},this)),this.onAdd(i),this.fire("add"),i.fire("layeradd",{layer:this}))}})),ui=(A.include({addLayer:function(t){var e;if(t._layerAdd)return e=h(t),this._layers[e]||((this._layers[e]=t)._mapToAdd=this,t.beforeAdd&&t.beforeAdd(this),this.whenReady(t._layerAdd,t)),this;throw new Error("The provided object is not a Layer.")},removeLayer:function(t){var e=h(t);return this._layers[e]&&(this._loaded&&t.onRemove(this),delete this._layers[e],this._loaded&&(this.fire("layerremove",{layer:t}),t.fire("remove")),t._map=t._mapToAdd=null),this},hasLayer:function(t){return h(t)in this._layers},eachLayer:function(t,e){for(var i in this._layers)t.call(e,this._layers[i]);return this},_addLayers:function(t){for(var e=0,i=(t=t?d(t)?t:[t]:[]).length;e<i;e++)this.addLayer(t[e])},_addZoomLimit:function(t){isNaN(t.options.maxZoom)&&isNaN(t.options.minZoom)||(this._zoomBoundLayers[h(t)]=t,this._updateZoomLevels())},_removeZoomLimit:function(t){t=h(t);this._zoomBoundLayers[t]&&(delete this._zoomBoundLayers[t],this._updateZoomLevels())},_updateZoomLevels:function(){var t,e=1/0,i=-1/0,n=this._getZoomSpan();for(t in this._zoomBoundLayers)var o=this._zoomBoundLayers[t].options,e=void 0===o.minZoom?e:Math.min(e,o.minZoom),i=void 0===o.maxZoom?i:Math.max(i,o.maxZoom);this._layersMaxZoom=i===-1/0?void 0:i,this._layersMinZoom=e===1/0?void 0:e,n!==this._getZoomSpan()&&this.fire("zoomlevelschange"),void 0===this.options.maxZoom&&this._layersMaxZoom&&this.getZoom()>this._layersMaxZoom&&this.setZoom(this._layersMaxZoom),void 0===this.options.minZoom&&this._layersMinZoom&&this.getZoom()<this._layersMinZoom&&this.setZoom(this._layersMinZoom)}}),o.extend({initialize:function(t,e){var i,n;if(c(this,e),this._layers={},t)for(i=0,n=t.length;i<n;i++)this.addLayer(t[i])},addLayer:function(t){var e=this.getLayerId(t);return this._layers[e]=t,this._map&&this._map.addLayer(t),this},removeLayer:function(t){t=t in this._layers?t:this.getLayerId(t);return this._map&&this._layers[t]&&this._map.removeLayer(this._layers[t]),delete this._layers[t],this},hasLayer:function(t){return("number"==typeof t?t:this.getLayerId(t))in this._layers},clearLayers:function(){return this.eachLayer(this.removeLayer,this)},invoke:function(t){var e,i,n=Array.prototype.slice.call(arguments,1);for(e in this._layers)(i=this._layers[e])[t]&&i[t].apply(i,n);return this},onAdd:function(t){this.eachLayer(t.addLayer,t)},onRemove:function(t){this.eachLayer(t.removeLayer,t)},eachLayer:function(t,e){for(var i in this._layers)t.call(e,this._layers[i]);return this},getLayer:function(t){return this._layers[t]},getLayers:function(){var t=[];return this.eachLayer(t.push,t),t},setZIndex:function(t){return this.invoke("setZIndex",t)},getLayerId:h})),ci=ui.extend({addLayer:function(t){return this.hasLayer(t)?this:(t.addEventParent(this),ui.prototype.addLayer.call(this,t),this.fire("layeradd",{layer:t}))},removeLayer:function(t){return this.hasLayer(t)?((t=t in this._layers?this._layers[t]:t).removeEventParent(this),ui.prototype.removeLayer.call(this,t),this.fire("layerremove",{layer:t})):this},setStyle:function(t){return this.invoke("setStyle",t)},bringToFront:function(){return this.invoke("bringToFront")},bringToBack:function(){return this.invoke("bringToBack")},getBounds:function(){var t,e=new s;for(t in this._layers){var i=this._layers[t];e.extend(i.getBounds?i.getBounds():i.getLatLng())}return e}}),di=et.extend({options:{popupAnchor:[0,0],tooltipAnchor:[0,0],crossOrigin:!1},initialize:function(t){c(this,t)},createIcon:function(t){return this._createIcon("icon",t)},createShadow:function(t){return this._createIcon("shadow",t)},_createIcon:function(t,e){var i=this._getIconUrl(t);if(i)return i=this._createImg(i,e&&"IMG"===e.tagName?e:null),this._setIconStyles(i,t),!this.options.crossOrigin&&""!==this.options.crossOrigin||(i.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),i;if("icon"===t)throw new Error("iconUrl not set in Icon options (see the docs).");return null},_setIconStyles:function(t,e){var i=this.options,n=i[e+"Size"],n=m(n="number"==typeof n?[n,n]:n),o=m("shadow"===e&&i.shadowAnchor||i.iconAnchor||n&&n.divideBy(2,!0));t.className="leaflet-marker-"+e+" "+(i.className||""),o&&(t.style.marginLeft=-o.x+"px",t.style.marginTop=-o.y+"px"),n&&(t.style.width=n.x+"px",t.style.height=n.y+"px")},_createImg:function(t,e){return(e=e||document.createElement("img")).src=t,e},_getIconUrl:function(t){return b.retina&&this.options[t+"RetinaUrl"]||this.options[t+"Url"]}});var _i=di.extend({options:{iconUrl:"marker-icon.png",iconRetinaUrl:"marker-icon-2x.png",shadowUrl:"marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],tooltipAnchor:[16,-28],shadowSize:[41,41]},_getIconUrl:function(t){return"string"!=typeof _i.imagePath&&(_i.imagePath=this._detectIconPath()),(this.options.imagePath||_i.imagePath)+di.prototype._getIconUrl.call(this,t)},_stripUrl:function(t){function e(t,e,i){return(e=e.exec(t))&&e[i]}return(t=e(t,/^url\((['"])?(.+)\1\)$/,2))&&e(t,/^(.*)marker-icon\.png$/,1)},_detectIconPath:function(){var t=P("div","leaflet-default-icon-path",document.body),e=pe(t,"background-image")||pe(t,"backgroundImage");return document.body.removeChild(t),(e=this._stripUrl(e))?e:(t=document.querySelector('link[href$="leaflet.css"]'))?t.href.substring(0,t.href.length-"leaflet.css".length-1):""}}),pi=n.extend({initialize:function(t){this._marker=t},addHooks:function(){var t=this._marker._icon;this._draggable||(this._draggable=new Xe(t,t,!0)),this._draggable.on({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).enable(),M(t,"leaflet-marker-draggable")},removeHooks:function(){this._draggable.off({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).disable(),this._marker._icon&&z(this._marker._icon,"leaflet-marker-draggable")},moved:function(){return this._draggable&&this._draggable._moved},_adjustPan:function(t){var e=this._marker,i=e._map,n=this._marker.options.autoPanSpeed,o=this._marker.options.autoPanPadding,s=Pe(e._icon),r=i.getPixelBounds(),a=i.getPixelOrigin(),a=_(r.min._subtract(a).add(o),r.max._subtract(a).subtract(o));a.contains(s)||(o=m((Math.max(a.max.x,s.x)-a.max.x)/(r.max.x-a.max.x)-(Math.min(a.min.x,s.x)-a.min.x)/(r.min.x-a.min.x),(Math.max(a.max.y,s.y)-a.max.y)/(r.max.y-a.max.y)-(Math.min(a.min.y,s.y)-a.min.y)/(r.min.y-a.min.y)).multiplyBy(n),i.panBy(o,{animate:!1}),this._draggable._newPos._add(o),this._draggable._startPos._add(o),Z(e._icon,this._draggable._newPos),this._onDrag(t),this._panRequest=x(this._adjustPan.bind(this,t)))},_onDragStart:function(){this._oldLatLng=this._marker.getLatLng(),this._marker.closePopup&&this._marker.closePopup(),this._marker.fire("movestart").fire("dragstart")},_onPreDrag:function(t){this._marker.options.autoPan&&(r(this._panRequest),this._panRequest=x(this._adjustPan.bind(this,t)))},_onDrag:function(t){var e=this._marker,i=e._shadow,n=Pe(e._icon),o=e._map.layerPointToLatLng(n);i&&Z(i,n),e._latlng=o,t.latlng=o,t.oldLatLng=this._oldLatLng,e.fire("move",t).fire("drag",t)},_onDragEnd:function(t){r(this._panRequest),delete this._oldLatLng,this._marker.fire("moveend").fire("dragend",t)}}),mi=o.extend({options:{icon:new _i,interactive:!0,keyboard:!0,title:"",alt:"Marker",zIndexOffset:0,opacity:1,riseOnHover:!1,riseOffset:250,pane:"markerPane",shadowPane:"shadowPane",bubblingMouseEvents:!1,autoPanOnFocus:!0,draggable:!1,autoPan:!1,autoPanPadding:[50,50],autoPanSpeed:10},initialize:function(t,e){c(this,e),this._latlng=w(t)},onAdd:function(t){this._zoomAnimated=this._zoomAnimated&&t.options.markerZoomAnimation,this._zoomAnimated&&t.on("zoomanim",this._animateZoom,this),this._initIcon(),this.update()},onRemove:function(t){this.dragging&&this.dragging.enabled()&&(this.options.draggable=!0,this.dragging.removeHooks()),delete this.dragging,this._zoomAnimated&&t.off("zoomanim",this._animateZoom,this),this._removeIcon(),this._removeShadow()},getEvents:function(){return{zoom:this.update,viewreset:this.update}},getLatLng:function(){return this._latlng},setLatLng:function(t){var e=this._latlng;return this._latlng=w(t),this.update(),this.fire("move",{oldLatLng:e,latlng:this._latlng})},setZIndexOffset:function(t){return this.options.zIndexOffset=t,this.update()},getIcon:function(){return this.options.icon},setIcon:function(t){return this.options.icon=t,this._map&&(this._initIcon(),this.update()),this._popup&&this.bindPopup(this._popup,this._popup.options),this},getElement:function(){return this._icon},update:function(){var t;return this._icon&&this._map&&(t=this._map.latLngToLayerPoint(this._latlng).round(),this._setPos(t)),this},_initIcon:function(){var t=this.options,e="leaflet-zoom-"+(this._zoomAnimated?"animated":"hide"),i=t.icon.createIcon(this._icon),n=!1,i=(i!==this._icon&&(this._icon&&this._removeIcon(),n=!0,t.title&&(i.title=t.title),"IMG"===i.tagName&&(i.alt=t.alt||"")),M(i,e),t.keyboard&&(i.tabIndex="0",i.setAttribute("role","button")),this._icon=i,t.riseOnHover&&this.on({mouseover:this._bringToFront,mouseout:this._resetZIndex}),this.options.autoPanOnFocus&&S(i,"focus",this._panOnFocus,this),t.icon.createShadow(this._shadow)),o=!1;i!==this._shadow&&(this._removeShadow(),o=!0),i&&(M(i,e),i.alt=""),this._shadow=i,t.opacity<1&&this._updateOpacity(),n&&this.getPane().appendChild(this._icon),this._initInteraction(),i&&o&&this.getPane(t.shadowPane).appendChild(this._shadow)},_removeIcon:function(){this.options.riseOnHover&&this.off({mouseover:this._bringToFront,mouseout:this._resetZIndex}),this.options.autoPanOnFocus&&k(this._icon,"focus",this._panOnFocus,this),T(this._icon),this.removeInteractiveTarget(this._icon),this._icon=null},_removeShadow:function(){this._shadow&&T(this._shadow),this._shadow=null},_setPos:function(t){this._icon&&Z(this._icon,t),this._shadow&&Z(this._shadow,t),this._zIndex=t.y+this.options.zIndexOffset,this._resetZIndex()},_updateZIndex:function(t){this._icon&&(this._icon.style.zIndex=this._zIndex+t)},_animateZoom:function(t){t=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPos(t)},_initInteraction:function(){var t;this.options.interactive&&(M(this._icon,"leaflet-interactive"),this.addInteractiveTarget(this._icon),pi&&(t=this.options.draggable,this.dragging&&(t=this.dragging.enabled(),this.dragging.disable()),this.dragging=new pi(this),t&&this.dragging.enable()))},setOpacity:function(t){return this.options.opacity=t,this._map&&this._updateOpacity(),this},_updateOpacity:function(){var t=this.options.opacity;this._icon&&C(this._icon,t),this._shadow&&C(this._shadow,t)},_bringToFront:function(){this._updateZIndex(this.options.riseOffset)},_resetZIndex:function(){this._updateZIndex(0)},_panOnFocus:function(){var t,e,i=this._map;i&&(t=(e=this.options.icon.options).iconSize?m(e.iconSize):m(0,0),e=e.iconAnchor?m(e.iconAnchor):m(0,0),i.panInside(this._latlng,{paddingTopLeft:e,paddingBottomRight:t.subtract(e)}))},_getPopupAnchor:function(){return this.options.icon.options.popupAnchor},_getTooltipAnchor:function(){return this.options.icon.options.tooltipAnchor}});var fi=o.extend({options:{stroke:!0,color:"#3388ff",weight:3,opacity:1,lineCap:"round",lineJoin:"round",dashArray:null,dashOffset:null,fill:!1,fillColor:null,fillOpacity:.2,fillRule:"evenodd",interactive:!0,bubblingMouseEvents:!0},beforeAdd:function(t){this._renderer=t.getRenderer(this)},onAdd:function(){this._renderer._initPath(this),this._reset(),this._renderer._addPath(this)},onRemove:function(){this._renderer._removePath(this)},redraw:function(){return this._map&&this._renderer._updatePath(this),this},setStyle:function(t){return c(this,t),this._renderer&&(this._renderer._updateStyle(this),this.options.stroke&&t&&Object.prototype.hasOwnProperty.call(t,"weight")&&this._updateBounds()),this},bringToFront:function(){return this._renderer&&this._renderer._bringToFront(this),this},bringToBack:function(){return this._renderer&&this._renderer._bringToBack(this),this},getElement:function(){return this._path},_reset:function(){this._project(),this._update()},_clickTolerance:function(){return(this.options.stroke?this.options.weight/2:0)+(this._renderer.options.tolerance||0)}}),gi=fi.extend({options:{fill:!0,radius:10},initialize:function(t,e){c(this,e),this._latlng=w(t),this._radius=this.options.radius},setLatLng:function(t){var e=this._latlng;return this._latlng=w(t),this.redraw(),this.fire("move",{oldLatLng:e,latlng:this._latlng})},getLatLng:function(){return this._latlng},setRadius:function(t){return this.options.radius=this._radius=t,this.redraw()},getRadius:function(){return this._radius},setStyle:function(t){var e=t&&t.radius||this._radius;return fi.prototype.setStyle.call(this,t),this.setRadius(e),this},_project:function(){this._point=this._map.latLngToLayerPoint(this._latlng),this._updateBounds()},_updateBounds:function(){var t=this._radius,e=this._radiusY||t,i=this._clickTolerance(),t=[t+i,e+i];this._pxBounds=new f(this._point.subtract(t),this._point.add(t))},_update:function(){this._map&&this._updatePath()},_updatePath:function(){this._renderer._updateCircle(this)},_empty:function(){return this._radius&&!this._renderer._bounds.intersects(this._pxBounds)},_containsPoint:function(t){return t.distanceTo(this._point)<=this._radius+this._clickTolerance()}});var vi=gi.extend({initialize:function(t,e,i){if(c(this,e="number"==typeof e?l({},i,{radius:e}):e),this._latlng=w(t),isNaN(this.options.radius))throw new Error("Circle radius cannot be NaN");this._mRadius=this.options.radius},setRadius:function(t){return this._mRadius=t,this.redraw()},getRadius:function(){return this._mRadius},getBounds:function(){var t=[this._radius,this._radiusY||this._radius];return new s(this._map.layerPointToLatLng(this._point.subtract(t)),this._map.layerPointToLatLng(this._point.add(t)))},setStyle:fi.prototype.setStyle,_project:function(){var t,e,i,n,o,s=this._latlng.lng,r=this._latlng.lat,a=this._map,h=a.options.crs;h.distance===st.distance?(n=Math.PI/180,o=this._mRadius/st.R/n,t=a.project([r+o,s]),e=a.project([r-o,s]),e=t.add(e).divideBy(2),i=a.unproject(e).lat,n=Math.acos((Math.cos(o*n)-Math.sin(r*n)*Math.sin(i*n))/(Math.cos(r*n)*Math.cos(i*n)))/n,!isNaN(n)&&0!==n||(n=o/Math.cos(Math.PI/180*r)),this._point=e.subtract(a.getPixelOrigin()),this._radius=isNaN(n)?0:e.x-a.project([i,s-n]).x,this._radiusY=e.y-t.y):(o=h.unproject(h.project(this._latlng).subtract([this._mRadius,0])),this._point=a.latLngToLayerPoint(this._latlng),this._radius=this._point.x-a.latLngToLayerPoint(o).x),this._updateBounds()}});var yi=fi.extend({options:{smoothFactor:1,noClip:!1},initialize:function(t,e){c(this,e),this._setLatLngs(t)},getLatLngs:function(){return this._latlngs},setLatLngs:function(t){return this._setLatLngs(t),this.redraw()},isEmpty:function(){return!this._latlngs.length},closestLayerPoint:function(t){for(var e=1/0,i=null,n=ri,o=0,s=this._parts.length;o<s;o++)for(var r=this._parts[o],a=1,h=r.length;a<h;a++){var l,u,c=n(t,l=r[a-1],u=r[a],!0);c<e&&(e=c,i=n(t,l,u))}return i&&(i.distance=Math.sqrt(e)),i},getCenter:function(){if(this._map)return hi(this._defaultShape(),this._map.options.crs);throw new Error("Must add layer to map before using getCenter()")},getBounds:function(){return this._bounds},addLatLng:function(t,e){return e=e||this._defaultShape(),t=w(t),e.push(t),this._bounds.extend(t),this.redraw()},_setLatLngs:function(t){this._bounds=new s,this._latlngs=this._convertLatLngs(t)},_defaultShape:function(){return I(this._latlngs)?this._latlngs:this._latlngs[0]},_convertLatLngs:function(t){for(var e=[],i=I(t),n=0,o=t.length;n<o;n++)i?(e[n]=w(t[n]),this._bounds.extend(e[n])):e[n]=this._convertLatLngs(t[n]);return e},_project:function(){var t=new f;this._rings=[],this._projectLatlngs(this._latlngs,this._rings,t),this._bounds.isValid()&&t.isValid()&&(this._rawPxBounds=t,this._updateBounds())},_updateBounds:function(){var t=this._clickTolerance(),t=new p(t,t);this._rawPxBounds&&(this._pxBounds=new f([this._rawPxBounds.min.subtract(t),this._rawPxBounds.max.add(t)]))},_projectLatlngs:function(t,e,i){var n,o,s=t[0]instanceof v,r=t.length;if(s){for(o=[],n=0;n<r;n++)o[n]=this._map.latLngToLayerPoint(t[n]),i.extend(o[n]);e.push(o)}else for(n=0;n<r;n++)this._projectLatlngs(t[n],e,i)},_clipPoints:function(){var t=this._renderer._bounds;if(this._parts=[],this._pxBounds&&this._pxBounds.intersects(t))if(this.options.noClip)this._parts=this._rings;else for(var e,i,n,o,s=this._parts,r=0,a=0,h=this._rings.length;r<h;r++)for(e=0,i=(o=this._rings[r]).length;e<i-1;e++)(n=ni(o[e],o[e+1],t,e,!0))&&(s[a]=s[a]||[],s[a].push(n[0]),n[1]===o[e+1]&&e!==i-2||(s[a].push(n[1]),a++))},_simplifyPoints:function(){for(var t=this._parts,e=this.options.smoothFactor,i=0,n=t.length;i<n;i++)t[i]=ei(t[i],e)},_update:function(){this._map&&(this._clipPoints(),this._simplifyPoints(),this._updatePath())},_updatePath:function(){this._renderer._updatePoly(this)},_containsPoint:function(t,e){var i,n,o,s,r,a,h=this._clickTolerance();if(this._pxBounds&&this._pxBounds.contains(t))for(i=0,s=this._parts.length;i<s;i++)for(n=0,o=(r=(a=this._parts[i]).length)-1;n<r;o=n++)if((e||0!==n)&&ii(t,a[o],a[n])<=h)return!0;return!1}});yi._flat=ai;var xi=yi.extend({options:{fill:!0},isEmpty:function(){return!this._latlngs.length||!this._latlngs[0].length},getCenter:function(){if(this._map)return $e(this._defaultShape(),this._map.options.crs);throw new Error("Must add layer to map before using getCenter()")},_convertLatLngs:function(t){var t=yi.prototype._convertLatLngs.call(this,t),e=t.length;return 2<=e&&t[0]instanceof v&&t[0].equals(t[e-1])&&t.pop(),t},_setLatLngs:function(t){yi.prototype._setLatLngs.call(this,t),I(this._latlngs)&&(this._latlngs=[this._latlngs])},_defaultShape:function(){return(I(this._latlngs[0])?this._latlngs:this._latlngs[0])[0]},_clipPoints:function(){var t=this._renderer._bounds,e=this.options.weight,e=new p(e,e),t=new f(t.min.subtract(e),t.max.add(e));if(this._parts=[],this._pxBounds&&this._pxBounds.intersects(t))if(this.options.noClip)this._parts=this._rings;else for(var i,n=0,o=this._rings.length;n<o;n++)(i=Je(this._rings[n],t,!0)).length&&this._parts.push(i)},_updatePath:function(){this._renderer._updatePoly(this,!0)},_containsPoint:function(t){var e,i,n,o,s,r,a,h,l=!1;if(!this._pxBounds||!this._pxBounds.contains(t))return!1;for(o=0,a=this._parts.length;o<a;o++)for(s=0,r=(h=(e=this._parts[o]).length)-1;s<h;r=s++)i=e[s],n=e[r],i.y>t.y!=n.y>t.y&&t.x<(n.x-i.x)*(t.y-i.y)/(n.y-i.y)+i.x&&(l=!l);return l||yi.prototype._containsPoint.call(this,t,!0)}});var wi=ci.extend({initialize:function(t,e){c(this,e),this._layers={},t&&this.addData(t)},addData:function(t){var e,i,n,o=d(t)?t:t.features;if(o){for(e=0,i=o.length;e<i;e++)((n=o[e]).geometries||n.geometry||n.features||n.coordinates)&&this.addData(n);return this}var s,r=this.options;return(!r.filter||r.filter(t))&&(s=bi(t,r))?(s.feature=Zi(t),s.defaultOptions=s.options,this.resetStyle(s),r.onEachFeature&&r.onEachFeature(t,s),this.addLayer(s)):this},resetStyle:function(t){return void 0===t?this.eachLayer(this.resetStyle,this):(t.options=l({},t.defaultOptions),this._setLayerStyle(t,this.options.style),this)},setStyle:function(e){return this.eachLayer(function(t){this._setLayerStyle(t,e)},this)},_setLayerStyle:function(t,e){t.setStyle&&("function"==typeof e&&(e=e(t.feature)),t.setStyle(e))}});function bi(t,e){var i,n,o,s,r="Feature"===t.type?t.geometry:t,a=r?r.coordinates:null,h=[],l=e&&e.pointToLayer,u=e&&e.coordsToLatLng||Li;if(!a&&!r)return null;switch(r.type){case"Point":return Pi(l,t,i=u(a),e);case"MultiPoint":for(o=0,s=a.length;o<s;o++)i=u(a[o]),h.push(Pi(l,t,i,e));return new ci(h);case"LineString":case"MultiLineString":return n=Ti(a,"LineString"===r.type?0:1,u),new yi(n,e);case"Polygon":case"MultiPolygon":return n=Ti(a,"Polygon"===r.type?1:2,u),new xi(n,e);case"GeometryCollection":for(o=0,s=r.geometries.length;o<s;o++){var c=bi({geometry:r.geometries[o],type:"Feature",properties:t.properties},e);c&&h.push(c)}return new ci(h);case"FeatureCollection":for(o=0,s=r.features.length;o<s;o++){var d=bi(r.features[o],e);d&&h.push(d)}return new ci(h);default:throw new Error("Invalid GeoJSON object.")}}function Pi(t,e,i,n){return t?t(e,i):new mi(i,n&&n.markersInheritOptions&&n)}function Li(t){return new v(t[1],t[0],t[2])}function Ti(t,e,i){for(var n,o=[],s=0,r=t.length;s<r;s++)n=e?Ti(t[s],e-1,i):(i||Li)(t[s]),o.push(n);return o}function Mi(t,e){return void 0!==(t=w(t)).alt?[i(t.lng,e),i(t.lat,e),i(t.alt,e)]:[i(t.lng,e),i(t.lat,e)]}function zi(t,e,i,n){for(var o=[],s=0,r=t.length;s<r;s++)o.push(e?zi(t[s],I(t[s])?0:e-1,i,n):Mi(t[s],n));return!e&&i&&0<o.length&&o.push(o[0].slice()),o}function Ci(t,e){return t.feature?l({},t.feature,{geometry:e}):Zi(e)}function Zi(t){return"Feature"===t.type||"FeatureCollection"===t.type?t:{type:"Feature",properties:{},geometry:t}}Tt={toGeoJSON:function(t){return Ci(this,{type:"Point",coordinates:Mi(this.getLatLng(),t)})}};function Si(t,e){return new wi(t,e)}mi.include(Tt),vi.include(Tt),gi.include(Tt),yi.include({toGeoJSON:function(t){var e=!I(this._latlngs);return Ci(this,{type:(e?"Multi":"")+"LineString",coordinates:zi(this._latlngs,e?1:0,!1,t)})}}),xi.include({toGeoJSON:function(t){var e=!I(this._latlngs),i=e&&!I(this._latlngs[0]),t=zi(this._latlngs,i?2:e?1:0,!0,t);return Ci(this,{type:(i?"Multi":"")+"Polygon",coordinates:t=e?t:[t]})}}),ui.include({toMultiPoint:function(e){var i=[];return this.eachLayer(function(t){i.push(t.toGeoJSON(e).geometry.coordinates)}),Ci(this,{type:"MultiPoint",coordinates:i})},toGeoJSON:function(e){var i,n,t=this.feature&&this.feature.geometry&&this.feature.geometry.type;return"MultiPoint"===t?this.toMultiPoint(e):(i="GeometryCollection"===t,n=[],this.eachLayer(function(t){t.toGeoJSON&&(t=t.toGeoJSON(e),i?n.push(t.geometry):"FeatureCollection"===(t=Zi(t)).type?n.push.apply(n,t.features):n.push(t))}),i?Ci(this,{geometries:n,type:"GeometryCollection"}):{type:"FeatureCollection",features:n})}});var Mt=Si,Ei=o.extend({options:{opacity:1,alt:"",interactive:!1,crossOrigin:!1,errorOverlayUrl:"",zIndex:1,className:""},initialize:function(t,e,i){this._url=t,this._bounds=g(e),c(this,i)},onAdd:function(){this._image||(this._initImage(),this.options.opacity<1&&this._updateOpacity()),this.options.interactive&&(M(this._image,"leaflet-interactive"),this.addInteractiveTarget(this._image)),this.getPane().appendChild(this._image),this._reset()},onRemove:function(){T(this._image),this.options.interactive&&this.removeInteractiveTarget(this._image)},setOpacity:function(t){return this.options.opacity=t,this._image&&this._updateOpacity(),this},setStyle:function(t){return t.opacity&&this.setOpacity(t.opacity),this},bringToFront:function(){return this._map&&fe(this._image),this},bringToBack:function(){return this._map&&ge(this._image),this},setUrl:function(t){return this._url=t,this._image&&(this._image.src=t),this},setBounds:function(t){return this._bounds=g(t),this._map&&this._reset(),this},getEvents:function(){var t={zoom:this._reset,viewreset:this._reset};return this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},getBounds:function(){return this._bounds},getElement:function(){return this._image},_initImage:function(){var t="IMG"===this._url.tagName,e=this._image=t?this._url:P("img");M(e,"leaflet-image-layer"),this._zoomAnimated&&M(e,"leaflet-zoom-animated"),this.options.className&&M(e,this.options.className),e.onselectstart=u,e.onmousemove=u,e.onload=a(this.fire,this,"load"),e.onerror=a(this._overlayOnError,this,"error"),!this.options.crossOrigin&&""!==this.options.crossOrigin||(e.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),this.options.zIndex&&this._updateZIndex(),t?this._url=e.src:(e.src=this._url,e.alt=this.options.alt)},_animateZoom:function(t){var e=this._map.getZoomScale(t.zoom),t=this._map._latLngBoundsToNewLayerBounds(this._bounds,t.zoom,t.center).min;be(this._image,t,e)},_reset:function(){var t=this._image,e=new f(this._map.latLngToLayerPoint(this._bounds.getNorthWest()),this._map.latLngToLayerPoint(this._bounds.getSouthEast())),i=e.getSize();Z(t,e.min),t.style.width=i.x+"px",t.style.height=i.y+"px"},_updateOpacity:function(){C(this._image,this.options.opacity)},_updateZIndex:function(){this._image&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._image.style.zIndex=this.options.zIndex)},_overlayOnError:function(){this.fire("error");var t=this.options.errorOverlayUrl;t&&this._url!==t&&(this._url=t,this._image.src=t)},getCenter:function(){return this._bounds.getCenter()}}),ki=Ei.extend({options:{autoplay:!0,loop:!0,keepAspectRatio:!0,muted:!1,playsInline:!0},_initImage:function(){var t="VIDEO"===this._url.tagName,e=this._image=t?this._url:P("video");if(M(e,"leaflet-image-layer"),this._zoomAnimated&&M(e,"leaflet-zoom-animated"),this.options.className&&M(e,this.options.className),e.onselectstart=u,e.onmousemove=u,e.onloadeddata=a(this.fire,this,"load"),t){for(var i=e.getElementsByTagName("source"),n=[],o=0;o<i.length;o++)n.push(i[o].src);this._url=0<i.length?n:[e.src]}else{d(this._url)||(this._url=[this._url]),!this.options.keepAspectRatio&&Object.prototype.hasOwnProperty.call(e.style,"objectFit")&&(e.style.objectFit="fill"),e.autoplay=!!this.options.autoplay,e.loop=!!this.options.loop,e.muted=!!this.options.muted,e.playsInline=!!this.options.playsInline;for(var s=0;s<this._url.length;s++){var r=P("source");r.src=this._url[s],e.appendChild(r)}}}});var Oi=Ei.extend({_initImage:function(){var t=this._image=this._url;M(t,"leaflet-image-layer"),this._zoomAnimated&&M(t,"leaflet-zoom-animated"),this.options.className&&M(t,this.options.className),t.onselectstart=u,t.onmousemove=u}});var Ai=o.extend({options:{interactive:!1,offset:[0,0],className:"",pane:void 0,content:""},initialize:function(t,e){t&&(t instanceof v||d(t))?(this._latlng=w(t),c(this,e)):(c(this,t),this._source=e),this.options.content&&(this._content=this.options.content)},openOn:function(t){return(t=arguments.length?t:this._source._map).hasLayer(this)||t.addLayer(this),this},close:function(){return this._map&&this._map.removeLayer(this),this},toggle:function(t){return this._map?this.close():(arguments.length?this._source=t:t=this._source,this._prepareOpen(),this.openOn(t._map)),this},onAdd:function(t){this._zoomAnimated=t._zoomAnimated,this._container||this._initLayout(),t._fadeAnimated&&C(this._container,0),clearTimeout(this._removeTimeout),this.getPane().appendChild(this._container),this.update(),t._fadeAnimated&&C(this._container,1),this.bringToFront(),this.options.interactive&&(M(this._container,"leaflet-interactive"),this.addInteractiveTarget(this._container))},onRemove:function(t){t._fadeAnimated?(C(this._container,0),this._removeTimeout=setTimeout(a(T,void 0,this._container),200)):T(this._container),this.options.interactive&&(z(this._container,"leaflet-interactive"),this.removeInteractiveTarget(this._container))},getLatLng:function(){return this._latlng},setLatLng:function(t){return this._latlng=w(t),this._map&&(this._updatePosition(),this._adjustPan()),this},getContent:function(){return this._content},setContent:function(t){return this._content=t,this.update(),this},getElement:function(){return this._container},update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updateLayout(),this._updatePosition(),this._container.style.visibility="",this._adjustPan())},getEvents:function(){var t={zoom:this._updatePosition,viewreset:this._updatePosition};return this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},isOpen:function(){return!!this._map&&this._map.hasLayer(this)},bringToFront:function(){return this._map&&fe(this._container),this},bringToBack:function(){return this._map&&ge(this._container),this},_prepareOpen:function(t){if(!(i=this._source)._map)return!1;if(i instanceof ci){var e,i=null,n=this._source._layers;for(e in n)if(n[e]._map){i=n[e];break}if(!i)return!1;this._source=i}if(!t)if(i.getCenter)t=i.getCenter();else if(i.getLatLng)t=i.getLatLng();else{if(!i.getBounds)throw new Error("Unable to get source layer LatLng.");t=i.getBounds().getCenter()}return this.setLatLng(t),this._map&&this.update(),!0},_updateContent:function(){if(this._content){var t=this._contentNode,e="function"==typeof this._content?this._content(this._source||this):this._content;if("string"==typeof e)t.innerHTML=e;else{for(;t.hasChildNodes();)t.removeChild(t.firstChild);t.appendChild(e)}this.fire("contentupdate")}},_updatePosition:function(){var t,e,i;this._map&&(e=this._map.latLngToLayerPoint(this._latlng),t=m(this.options.offset),i=this._getAnchor(),this._zoomAnimated?Z(this._container,e.add(i)):t=t.add(e).add(i),e=this._containerBottom=-t.y,i=this._containerLeft=-Math.round(this._containerWidth/2)+t.x,this._container.style.bottom=e+"px",this._container.style.left=i+"px")},_getAnchor:function(){return[0,0]}}),Bi=(A.include({_initOverlay:function(t,e,i,n){var o=e;return o instanceof t||(o=new t(n).setContent(e)),i&&o.setLatLng(i),o}}),o.include({_initOverlay:function(t,e,i,n){var o=i;return o instanceof t?(c(o,n),o._source=this):(o=e&&!n?e:new t(n,this)).setContent(i),o}}),Ai.extend({options:{pane:"popupPane",offset:[0,7],maxWidth:300,minWidth:50,maxHeight:null,autoPan:!0,autoPanPaddingTopLeft:null,autoPanPaddingBottomRight:null,autoPanPadding:[5,5],keepInView:!1,closeButton:!0,autoClose:!0,closeOnEscapeKey:!0,className:""},openOn:function(t){return!(t=arguments.length?t:this._source._map).hasLayer(this)&&t._popup&&t._popup.options.autoClose&&t.removeLayer(t._popup),t._popup=this,Ai.prototype.openOn.call(this,t)},onAdd:function(t){Ai.prototype.onAdd.call(this,t),t.fire("popupopen",{popup:this}),this._source&&(this._source.fire("popupopen",{popup:this},!0),this._source instanceof fi||this._source.on("preclick",Ae))},onRemove:function(t){Ai.prototype.onRemove.call(this,t),t.fire("popupclose",{popup:this}),this._source&&(this._source.fire("popupclose",{popup:this},!0),this._source instanceof fi||this._source.off("preclick",Ae))},getEvents:function(){var t=Ai.prototype.getEvents.call(this);return(void 0!==this.options.closeOnClick?this.options.closeOnClick:this._map.options.closePopupOnClick)&&(t.preclick=this.close),this.options.keepInView&&(t.moveend=this._adjustPan),t},_initLayout:function(){var t="leaflet-popup",e=this._container=P("div",t+" "+(this.options.className||"")+" leaflet-zoom-animated"),i=this._wrapper=P("div",t+"-content-wrapper",e);this._contentNode=P("div",t+"-content",i),Ie(e),Be(this._contentNode),S(e,"contextmenu",Ae),this._tipContainer=P("div",t+"-tip-container",e),this._tip=P("div",t+"-tip",this._tipContainer),this.options.closeButton&&((i=this._closeButton=P("a",t+"-close-button",e)).setAttribute("role","button"),i.setAttribute("aria-label","Close popup"),i.href="#close",i.innerHTML='<span aria-hidden="true">&#215;</span>',S(i,"click",function(t){O(t),this.close()},this))},_updateLayout:function(){var t=this._contentNode,e=t.style,i=(e.width="",e.whiteSpace="nowrap",t.offsetWidth),i=Math.min(i,this.options.maxWidth),i=(i=Math.max(i,this.options.minWidth),e.width=i+1+"px",e.whiteSpace="",e.height="",t.offsetHeight),n=this.options.maxHeight,o="leaflet-popup-scrolled";(n&&n<i?(e.height=n+"px",M):z)(t,o),this._containerWidth=this._container.offsetWidth},_animateZoom:function(t){var t=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center),e=this._getAnchor();Z(this._container,t.add(e))},_adjustPan:function(){var t,e,i,n,o,s,r,a;this.options.autoPan&&(this._map._panAnim&&this._map._panAnim.stop(),this._autopanning?this._autopanning=!1:(t=this._map,e=parseInt(pe(this._container,"marginBottom"),10)||0,e=this._container.offsetHeight+e,a=this._containerWidth,(i=new p(this._containerLeft,-e-this._containerBottom))._add(Pe(this._container)),i=t.layerPointToContainerPoint(i),o=m(this.options.autoPanPadding),n=m(this.options.autoPanPaddingTopLeft||o),o=m(this.options.autoPanPaddingBottomRight||o),s=t.getSize(),r=0,i.x+a+o.x>s.x&&(r=i.x+a-s.x+o.x),i.x-r-n.x<(a=0)&&(r=i.x-n.x),i.y+e+o.y>s.y&&(a=i.y+e-s.y+o.y),i.y-a-n.y<0&&(a=i.y-n.y),(r||a)&&(this.options.keepInView&&(this._autopanning=!0),t.fire("autopanstart").panBy([r,a]))))},_getAnchor:function(){return m(this._source&&this._source._getPopupAnchor?this._source._getPopupAnchor():[0,0])}})),Ii=(A.mergeOptions({closePopupOnClick:!0}),A.include({openPopup:function(t,e,i){return this._initOverlay(Bi,t,e,i).openOn(this),this},closePopup:function(t){return(t=arguments.length?t:this._popup)&&t.close(),this}}),o.include({bindPopup:function(t,e){return this._popup=this._initOverlay(Bi,this._popup,t,e),this._popupHandlersAdded||(this.on({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!0),this},unbindPopup:function(){return this._popup&&(this.off({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!1,this._popup=null),this},openPopup:function(t){return this._popup&&(this instanceof ci||(this._popup._source=this),this._popup._prepareOpen(t||this._latlng)&&this._popup.openOn(this._map)),this},closePopup:function(){return this._popup&&this._popup.close(),this},togglePopup:function(){return this._popup&&this._popup.toggle(this),this},isPopupOpen:function(){return!!this._popup&&this._popup.isOpen()},setPopupContent:function(t){return this._popup&&this._popup.setContent(t),this},getPopup:function(){return this._popup},_openPopup:function(t){var e;this._popup&&this._map&&(Re(t),e=t.layer||t.target,this._popup._source!==e||e instanceof fi?(this._popup._source=e,this.openPopup(t.latlng)):this._map.hasLayer(this._popup)?this.closePopup():this.openPopup(t.latlng))},_movePopup:function(t){this._popup.setLatLng(t.latlng)},_onKeyPress:function(t){13===t.originalEvent.keyCode&&this._openPopup(t)}}),Ai.extend({options:{pane:"tooltipPane",offset:[0,0],direction:"auto",permanent:!1,sticky:!1,opacity:.9},onAdd:function(t){Ai.prototype.onAdd.call(this,t),this.setOpacity(this.options.opacity),t.fire("tooltipopen",{tooltip:this}),this._source&&(this.addEventParent(this._source),this._source.fire("tooltipopen",{tooltip:this},!0))},onRemove:function(t){Ai.prototype.onRemove.call(this,t),t.fire("tooltipclose",{tooltip:this}),this._source&&(this.removeEventParent(this._source),this._source.fire("tooltipclose",{tooltip:this},!0))},getEvents:function(){var t=Ai.prototype.getEvents.call(this);return this.options.permanent||(t.preclick=this.close),t},_initLayout:function(){var t="leaflet-tooltip "+(this.options.className||"")+" leaflet-zoom-"+(this._zoomAnimated?"animated":"hide");this._contentNode=this._container=P("div",t),this._container.setAttribute("role","tooltip"),this._container.setAttribute("id","leaflet-tooltip-"+h(this))},_updateLayout:function(){},_adjustPan:function(){},_setPosition:function(t){var e,i=this._map,n=this._container,o=i.latLngToContainerPoint(i.getCenter()),i=i.layerPointToContainerPoint(t),s=this.options.direction,r=n.offsetWidth,a=n.offsetHeight,h=m(this.options.offset),l=this._getAnchor(),i="top"===s?(e=r/2,a):"bottom"===s?(e=r/2,0):(e="center"===s?r/2:"right"===s?0:"left"===s?r:i.x<o.x?(s="right",0):(s="left",r+2*(h.x+l.x)),a/2);t=t.subtract(m(e,i,!0)).add(h).add(l),z(n,"leaflet-tooltip-right"),z(n,"leaflet-tooltip-left"),z(n,"leaflet-tooltip-top"),z(n,"leaflet-tooltip-bottom"),M(n,"leaflet-tooltip-"+s),Z(n,t)},_updatePosition:function(){var t=this._map.latLngToLayerPoint(this._latlng);this._setPosition(t)},setOpacity:function(t){this.options.opacity=t,this._container&&C(this._container,t)},_animateZoom:function(t){t=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center);this._setPosition(t)},_getAnchor:function(){return m(this._source&&this._source._getTooltipAnchor&&!this.options.sticky?this._source._getTooltipAnchor():[0,0])}})),Ri=(A.include({openTooltip:function(t,e,i){return this._initOverlay(Ii,t,e,i).openOn(this),this},closeTooltip:function(t){return t.close(),this}}),o.include({bindTooltip:function(t,e){return this._tooltip&&this.isTooltipOpen()&&this.unbindTooltip(),this._tooltip=this._initOverlay(Ii,this._tooltip,t,e),this._initTooltipInteractions(),this._tooltip.options.permanent&&this._map&&this._map.hasLayer(this)&&this.openTooltip(),this},unbindTooltip:function(){return this._tooltip&&(this._initTooltipInteractions(!0),this.closeTooltip(),this._tooltip=null),this},_initTooltipInteractions:function(t){var e,i;!t&&this._tooltipHandlersAdded||(e=t?"off":"on",i={remove:this.closeTooltip,move:this._moveTooltip},this._tooltip.options.permanent?i.add=this._openTooltip:(i.mouseover=this._openTooltip,i.mouseout=this.closeTooltip,i.click=this._openTooltip,this._map?this._addFocusListeners():i.add=this._addFocusListeners),this._tooltip.options.sticky&&(i.mousemove=this._moveTooltip),this[e](i),this._tooltipHandlersAdded=!t)},openTooltip:function(t){return this._tooltip&&(this instanceof ci||(this._tooltip._source=this),this._tooltip._prepareOpen(t)&&(this._tooltip.openOn(this._map),this.getElement?this._setAriaDescribedByOnLayer(this):this.eachLayer&&this.eachLayer(this._setAriaDescribedByOnLayer,this))),this},closeTooltip:function(){if(this._tooltip)return this._tooltip.close()},toggleTooltip:function(){return this._tooltip&&this._tooltip.toggle(this),this},isTooltipOpen:function(){return this._tooltip.isOpen()},setTooltipContent:function(t){return this._tooltip&&this._tooltip.setContent(t),this},getTooltip:function(){return this._tooltip},_addFocusListeners:function(){this.getElement?this._addFocusListenersOnLayer(this):this.eachLayer&&this.eachLayer(this._addFocusListenersOnLayer,this)},_addFocusListenersOnLayer:function(t){var e="function"==typeof t.getElement&&t.getElement();e&&(S(e,"focus",function(){this._tooltip._source=t,this.openTooltip()},this),S(e,"blur",this.closeTooltip,this))},_setAriaDescribedByOnLayer:function(t){t="function"==typeof t.getElement&&t.getElement();t&&t.setAttribute("aria-describedby",this._tooltip._container.id)},_openTooltip:function(t){var e;this._tooltip&&this._map&&(this._map.dragging&&this._map.dragging.moving()&&!this._openOnceFlag?(this._openOnceFlag=!0,(e=this)._map.once("moveend",function(){e._openOnceFlag=!1,e._openTooltip(t)})):(this._tooltip._source=t.layer||t.target,this.openTooltip(this._tooltip.options.sticky?t.latlng:void 0)))},_moveTooltip:function(t){var e=t.latlng;this._tooltip.options.sticky&&t.originalEvent&&(t=this._map.mouseEventToContainerPoint(t.originalEvent),t=this._map.containerPointToLayerPoint(t),e=this._map.layerPointToLatLng(t)),this._tooltip.setLatLng(e)}}),di.extend({options:{iconSize:[12,12],html:!1,bgPos:null,className:"leaflet-div-icon"},createIcon:function(t){var t=t&&"DIV"===t.tagName?t:document.createElement("div"),e=this.options;return e.html instanceof Element?(me(t),t.appendChild(e.html)):t.innerHTML=!1!==e.html?e.html:"",e.bgPos&&(e=m(e.bgPos),t.style.backgroundPosition=-e.x+"px "+-e.y+"px"),this._setIconStyles(t,"icon"),t},createShadow:function(){return null}}));di.Default=_i;var Ni=o.extend({options:{tileSize:256,opacity:1,updateWhenIdle:b.mobile,updateWhenZooming:!0,updateInterval:200,zIndex:1,bounds:null,minZoom:0,maxZoom:void 0,maxNativeZoom:void 0,minNativeZoom:void 0,noWrap:!1,pane:"tilePane",className:"",keepBuffer:2},initialize:function(t){c(this,t)},onAdd:function(){this._initContainer(),this._levels={},this._tiles={},this._resetView()},beforeAdd:function(t){t._addZoomLimit(this)},onRemove:function(t){this._removeAllTiles(),T(this._container),t._removeZoomLimit(this),this._container=null,this._tileZoom=void 0},bringToFront:function(){return this._map&&(fe(this._container),this._setAutoZIndex(Math.max)),this},bringToBack:function(){return this._map&&(ge(this._container),this._setAutoZIndex(Math.min)),this},getContainer:function(){return this._container},setOpacity:function(t){return this.options.opacity=t,this._updateOpacity(),this},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},isLoading:function(){return this._loading},redraw:function(){var t;return this._map&&(this._removeAllTiles(),(t=this._clampZoom(this._map.getZoom()))!==this._tileZoom&&(this._tileZoom=t,this._updateLevels()),this._update()),this},getEvents:function(){var t={viewprereset:this._invalidateAll,viewreset:this._resetView,zoom:this._resetView,moveend:this._onMoveEnd};return this.options.updateWhenIdle||(this._onMove||(this._onMove=j(this._onMoveEnd,this.options.updateInterval,this)),t.move=this._onMove),this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},createTile:function(){return document.createElement("div")},getTileSize:function(){var t=this.options.tileSize;return t instanceof p?t:new p(t,t)},_updateZIndex:function(){this._container&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._container.style.zIndex=this.options.zIndex)},_setAutoZIndex:function(t){for(var e,i=this.getPane().children,n=-t(-1/0,1/0),o=0,s=i.length;o<s;o++)e=i[o].style.zIndex,i[o]!==this._container&&e&&(n=t(n,+e));isFinite(n)&&(this.options.zIndex=n+t(-1,1),this._updateZIndex())},_updateOpacity:function(){if(this._map&&!b.ielt9){C(this._container,this.options.opacity);var t,e=+new Date,i=!1,n=!1;for(t in this._tiles){var o,s=this._tiles[t];s.current&&s.loaded&&(o=Math.min(1,(e-s.loaded)/200),C(s.el,o),o<1?i=!0:(s.active?n=!0:this._onOpaqueTile(s),s.active=!0))}n&&!this._noPrune&&this._pruneTiles(),i&&(r(this._fadeFrame),this._fadeFrame=x(this._updateOpacity,this))}},_onOpaqueTile:u,_initContainer:function(){this._container||(this._container=P("div","leaflet-layer "+(this.options.className||"")),this._updateZIndex(),this.options.opacity<1&&this._updateOpacity(),this.getPane().appendChild(this._container))},_updateLevels:function(){var t=this._tileZoom,e=this.options.maxZoom;if(void 0!==t){for(var i in this._levels)i=Number(i),this._levels[i].el.children.length||i===t?(this._levels[i].el.style.zIndex=e-Math.abs(t-i),this._onUpdateLevel(i)):(T(this._levels[i].el),this._removeTilesAtZoom(i),this._onRemoveLevel(i),delete this._levels[i]);var n=this._levels[t],o=this._map;return n||((n=this._levels[t]={}).el=P("div","leaflet-tile-container leaflet-zoom-animated",this._container),n.el.style.zIndex=e,n.origin=o.project(o.unproject(o.getPixelOrigin()),t).round(),n.zoom=t,this._setZoomTransform(n,o.getCenter(),o.getZoom()),u(n.el.offsetWidth),this._onCreateLevel(n)),this._level=n}},_onUpdateLevel:u,_onRemoveLevel:u,_onCreateLevel:u,_pruneTiles:function(){if(this._map){var t,e,i,n=this._map.getZoom();if(n>this.options.maxZoom||n<this.options.minZoom)this._removeAllTiles();else{for(t in this._tiles)(i=this._tiles[t]).retain=i.current;for(t in this._tiles)(i=this._tiles[t]).current&&!i.active&&(e=i.coords,this._retainParent(e.x,e.y,e.z,e.z-5)||this._retainChildren(e.x,e.y,e.z,e.z+2));for(t in this._tiles)this._tiles[t].retain||this._removeTile(t)}}},_removeTilesAtZoom:function(t){for(var e in this._tiles)this._tiles[e].coords.z===t&&this._removeTile(e)},_removeAllTiles:function(){for(var t in this._tiles)this._removeTile(t)},_invalidateAll:function(){for(var t in this._levels)T(this._levels[t].el),this._onRemoveLevel(Number(t)),delete this._levels[t];this._removeAllTiles(),this._tileZoom=void 0},_retainParent:function(t,e,i,n){var t=Math.floor(t/2),e=Math.floor(e/2),i=i-1,o=new p(+t,+e),o=(o.z=i,this._tileCoordsToKey(o)),o=this._tiles[o];return o&&o.active?o.retain=!0:(o&&o.loaded&&(o.retain=!0),n<i&&this._retainParent(t,e,i,n))},_retainChildren:function(t,e,i,n){for(var o=2*t;o<2*t+2;o++)for(var s=2*e;s<2*e+2;s++){var r=new p(o,s),r=(r.z=i+1,this._tileCoordsToKey(r)),r=this._tiles[r];r&&r.active?r.retain=!0:(r&&r.loaded&&(r.retain=!0),i+1<n&&this._retainChildren(o,s,i+1,n))}},_resetView:function(t){t=t&&(t.pinch||t.flyTo);this._setView(this._map.getCenter(),this._map.getZoom(),t,t)},_animateZoom:function(t){this._setView(t.center,t.zoom,!0,t.noUpdate)},_clampZoom:function(t){var e=this.options;return void 0!==e.minNativeZoom&&t<e.minNativeZoom?e.minNativeZoom:void 0!==e.maxNativeZoom&&e.maxNativeZoom<t?e.maxNativeZoom:t},_setView:function(t,e,i,n){var o=Math.round(e),o=void 0!==this.options.maxZoom&&o>this.options.maxZoom||void 0!==this.options.minZoom&&o<this.options.minZoom?void 0:this._clampZoom(o),s=this.options.updateWhenZooming&&o!==this._tileZoom;n&&!s||(this._tileZoom=o,this._abortLoading&&this._abortLoading(),this._updateLevels(),this._resetGrid(),void 0!==o&&this._update(t),i||this._pruneTiles(),this._noPrune=!!i),this._setZoomTransforms(t,e)},_setZoomTransforms:function(t,e){for(var i in this._levels)this._setZoomTransform(this._levels[i],t,e)},_setZoomTransform:function(t,e,i){var n=this._map.getZoomScale(i,t.zoom),e=t.origin.multiplyBy(n).subtract(this._map._getNewPixelOrigin(e,i)).round();b.any3d?be(t.el,e,n):Z(t.el,e)},_resetGrid:function(){var t=this._map,e=t.options.crs,i=this._tileSize=this.getTileSize(),n=this._tileZoom,o=this._map.getPixelWorldBounds(this._tileZoom);o&&(this._globalTileRange=this._pxBoundsToTileRange(o)),this._wrapX=e.wrapLng&&!this.options.noWrap&&[Math.floor(t.project([0,e.wrapLng[0]],n).x/i.x),Math.ceil(t.project([0,e.wrapLng[1]],n).x/i.y)],this._wrapY=e.wrapLat&&!this.options.noWrap&&[Math.floor(t.project([e.wrapLat[0],0],n).y/i.x),Math.ceil(t.project([e.wrapLat[1],0],n).y/i.y)]},_onMoveEnd:function(){this._map&&!this._map._animatingZoom&&this._update()},_getTiledPixelBounds:function(t){var e=this._map,i=e._animatingZoom?Math.max(e._animateToZoom,e.getZoom()):e.getZoom(),i=e.getZoomScale(i,this._tileZoom),t=e.project(t,this._tileZoom).floor(),e=e.getSize().divideBy(2*i);return new f(t.subtract(e),t.add(e))},_update:function(t){var e=this._map;if(e){var i=this._clampZoom(e.getZoom());if(void 0===t&&(t=e.getCenter()),void 0!==this._tileZoom){var n,e=this._getTiledPixelBounds(t),o=this._pxBoundsToTileRange(e),s=o.getCenter(),r=[],e=this.options.keepBuffer,a=new f(o.getBottomLeft().subtract([e,-e]),o.getTopRight().add([e,-e]));if(!(isFinite(o.min.x)&&isFinite(o.min.y)&&isFinite(o.max.x)&&isFinite(o.max.y)))throw new Error("Attempted to load an infinite number of tiles");for(n in this._tiles){var h=this._tiles[n].coords;h.z===this._tileZoom&&a.contains(new p(h.x,h.y))||(this._tiles[n].current=!1)}if(1<Math.abs(i-this._tileZoom))this._setView(t,i);else{for(var l=o.min.y;l<=o.max.y;l++)for(var u=o.min.x;u<=o.max.x;u++){var c,d=new p(u,l);d.z=this._tileZoom,this._isValidTile(d)&&((c=this._tiles[this._tileCoordsToKey(d)])?c.current=!0:r.push(d))}if(r.sort(function(t,e){return t.distanceTo(s)-e.distanceTo(s)}),0!==r.length){this._loading||(this._loading=!0,this.fire("loading"));for(var _=document.createDocumentFragment(),u=0;u<r.length;u++)this._addTile(r[u],_);this._level.el.appendChild(_)}}}}},_isValidTile:function(t){var e=this._map.options.crs;if(!e.infinite){var i=this._globalTileRange;if(!e.wrapLng&&(t.x<i.min.x||t.x>i.max.x)||!e.wrapLat&&(t.y<i.min.y||t.y>i.max.y))return!1}return!this.options.bounds||(e=this._tileCoordsToBounds(t),g(this.options.bounds).overlaps(e))},_keyToBounds:function(t){return this._tileCoordsToBounds(this._keyToTileCoords(t))},_tileCoordsToNwSe:function(t){var e=this._map,i=this.getTileSize(),n=t.scaleBy(i),i=n.add(i);return[e.unproject(n,t.z),e.unproject(i,t.z)]},_tileCoordsToBounds:function(t){t=this._tileCoordsToNwSe(t),t=new s(t[0],t[1]);return t=this.options.noWrap?t:this._map.wrapLatLngBounds(t)},_tileCoordsToKey:function(t){return t.x+":"+t.y+":"+t.z},_keyToTileCoords:function(t){var t=t.split(":"),e=new p(+t[0],+t[1]);return e.z=+t[2],e},_removeTile:function(t){var e=this._tiles[t];e&&(T(e.el),delete this._tiles[t],this.fire("tileunload",{tile:e.el,coords:this._keyToTileCoords(t)}))},_initTile:function(t){M(t,"leaflet-tile");var e=this.getTileSize();t.style.width=e.x+"px",t.style.height=e.y+"px",t.onselectstart=u,t.onmousemove=u,b.ielt9&&this.options.opacity<1&&C(t,this.options.opacity)},_addTile:function(t,e){var i=this._getTilePos(t),n=this._tileCoordsToKey(t),o=this.createTile(this._wrapCoords(t),a(this._tileReady,this,t));this._initTile(o),this.createTile.length<2&&x(a(this._tileReady,this,t,null,o)),Z(o,i),this._tiles[n]={el:o,coords:t,current:!0},e.appendChild(o),this.fire("tileloadstart",{tile:o,coords:t})},_tileReady:function(t,e,i){e&&this.fire("tileerror",{error:e,tile:i,coords:t});var n=this._tileCoordsToKey(t);(i=this._tiles[n])&&(i.loaded=+new Date,this._map._fadeAnimated?(C(i.el,0),r(this._fadeFrame),this._fadeFrame=x(this._updateOpacity,this)):(i.active=!0,this._pruneTiles()),e||(M(i.el,"leaflet-tile-loaded"),this.fire("tileload",{tile:i.el,coords:t})),this._noTilesToLoad()&&(this._loading=!1,this.fire("load"),b.ielt9||!this._map._fadeAnimated?x(this._pruneTiles,this):setTimeout(a(this._pruneTiles,this),250)))},_getTilePos:function(t){return t.scaleBy(this.getTileSize()).subtract(this._level.origin)},_wrapCoords:function(t){var e=new p(this._wrapX?H(t.x,this._wrapX):t.x,this._wrapY?H(t.y,this._wrapY):t.y);return e.z=t.z,e},_pxBoundsToTileRange:function(t){var e=this.getTileSize();return new f(t.min.unscaleBy(e).floor(),t.max.unscaleBy(e).ceil().subtract([1,1]))},_noTilesToLoad:function(){for(var t in this._tiles)if(!this._tiles[t].loaded)return!1;return!0}});var Di=Ni.extend({options:{minZoom:0,maxZoom:18,subdomains:"abc",errorTileUrl:"",zoomOffset:0,tms:!1,zoomReverse:!1,detectRetina:!1,crossOrigin:!1,referrerPolicy:!1},initialize:function(t,e){this._url=t,(e=c(this,e)).detectRetina&&b.retina&&0<e.maxZoom?(e.tileSize=Math.floor(e.tileSize/2),e.zoomReverse?(e.zoomOffset--,e.minZoom=Math.min(e.maxZoom,e.minZoom+1)):(e.zoomOffset++,e.maxZoom=Math.max(e.minZoom,e.maxZoom-1)),e.minZoom=Math.max(0,e.minZoom)):e.zoomReverse?e.minZoom=Math.min(e.maxZoom,e.minZoom):e.maxZoom=Math.max(e.minZoom,e.maxZoom),"string"==typeof e.subdomains&&(e.subdomains=e.subdomains.split("")),this.on("tileunload",this._onTileRemove)},setUrl:function(t,e){return this._url===t&&void 0===e&&(e=!0),this._url=t,e||this.redraw(),this},createTile:function(t,e){var i=document.createElement("img");return S(i,"load",a(this._tileOnLoad,this,e,i)),S(i,"error",a(this._tileOnError,this,e,i)),!this.options.crossOrigin&&""!==this.options.crossOrigin||(i.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),"string"==typeof this.options.referrerPolicy&&(i.referrerPolicy=this.options.referrerPolicy),i.alt="",i.src=this.getTileUrl(t),i},getTileUrl:function(t){var e={r:b.retina?"@2x":"",s:this._getSubdomain(t),x:t.x,y:t.y,z:this._getZoomForUrl()};return this._map&&!this._map.options.crs.infinite&&(t=this._globalTileRange.max.y-t.y,this.options.tms&&(e.y=t),e["-y"]=t),q(this._url,l(e,this.options))},_tileOnLoad:function(t,e){b.ielt9?setTimeout(a(t,this,null,e),0):t(null,e)},_tileOnError:function(t,e,i){var n=this.options.errorTileUrl;n&&e.getAttribute("src")!==n&&(e.src=n),t(i,e)},_onTileRemove:function(t){t.tile.onload=null},_getZoomForUrl:function(){var t=this._tileZoom,e=this.options.maxZoom;return(t=this.options.zoomReverse?e-t:t)+this.options.zoomOffset},_getSubdomain:function(t){t=Math.abs(t.x+t.y)%this.options.subdomains.length;return this.options.subdomains[t]},_abortLoading:function(){var t,e,i;for(t in this._tiles)this._tiles[t].coords.z!==this._tileZoom&&((i=this._tiles[t].el).onload=u,i.onerror=u,i.complete||(i.src=K,e=this._tiles[t].coords,T(i),delete this._tiles[t],this.fire("tileabort",{tile:i,coords:e})))},_removeTile:function(t){var e=this._tiles[t];if(e)return e.el.setAttribute("src",K),Ni.prototype._removeTile.call(this,t)},_tileReady:function(t,e,i){if(this._map&&(!i||i.getAttribute("src")!==K))return Ni.prototype._tileReady.call(this,t,e,i)}});function ji(t,e){return new Di(t,e)}var Hi=Di.extend({defaultWmsParams:{service:"WMS",request:"GetMap",layers:"",styles:"",format:"image/jpeg",transparent:!1,version:"1.1.1"},options:{crs:null,uppercase:!1},initialize:function(t,e){this._url=t;var i,n=l({},this.defaultWmsParams);for(i in e)i in this.options||(n[i]=e[i]);var t=(e=c(this,e)).detectRetina&&b.retina?2:1,o=this.getTileSize();n.width=o.x*t,n.height=o.y*t,this.wmsParams=n},onAdd:function(t){this._crs=this.options.crs||t.options.crs,this._wmsVersion=parseFloat(this.wmsParams.version);var e=1.3<=this._wmsVersion?"crs":"srs";this.wmsParams[e]=this._crs.code,Di.prototype.onAdd.call(this,t)},getTileUrl:function(t){var e=this._tileCoordsToNwSe(t),i=this._crs,i=_(i.project(e[0]),i.project(e[1])),e=i.min,i=i.max,e=(1.3<=this._wmsVersion&&this._crs===li?[e.y,e.x,i.y,i.x]:[e.x,e.y,i.x,i.y]).join(","),i=Di.prototype.getTileUrl.call(this,t);return i+U(this.wmsParams,i,this.options.uppercase)+(this.options.uppercase?"&BBOX=":"&bbox=")+e},setParams:function(t,e){return l(this.wmsParams,t),e||this.redraw(),this}});Di.WMS=Hi,ji.wms=function(t,e){return new Hi(t,e)};var Wi=o.extend({options:{padding:.1},initialize:function(t){c(this,t),h(this),this._layers=this._layers||{}},onAdd:function(){this._container||(this._initContainer(),M(this._container,"leaflet-zoom-animated")),this.getPane().appendChild(this._container),this._update(),this.on("update",this._updatePaths,this)},onRemove:function(){this.off("update",this._updatePaths,this),this._destroyContainer()},getEvents:function(){var t={viewreset:this._reset,zoom:this._onZoom,moveend:this._update,zoomend:this._onZoomEnd};return this._zoomAnimated&&(t.zoomanim=this._onAnimZoom),t},_onAnimZoom:function(t){this._updateTransform(t.center,t.zoom)},_onZoom:function(){this._updateTransform(this._map.getCenter(),this._map.getZoom())},_updateTransform:function(t,e){var i=this._map.getZoomScale(e,this._zoom),n=this._map.getSize().multiplyBy(.5+this.options.padding),o=this._map.project(this._center,e),n=n.multiplyBy(-i).add(o).subtract(this._map._getNewPixelOrigin(t,e));b.any3d?be(this._container,n,i):Z(this._container,n)},_reset:function(){for(var t in this._update(),this._updateTransform(this._center,this._zoom),this._layers)this._layers[t]._reset()},_onZoomEnd:function(){for(var t in this._layers)this._layers[t]._project()},_updatePaths:function(){for(var t in this._layers)this._layers[t]._update()},_update:function(){var t=this.options.padding,e=this._map.getSize(),i=this._map.containerPointToLayerPoint(e.multiplyBy(-t)).round();this._bounds=new f(i,i.add(e.multiplyBy(1+2*t)).round()),this._center=this._map.getCenter(),this._zoom=this._map.getZoom()}}),Fi=Wi.extend({options:{tolerance:0},getEvents:function(){var t=Wi.prototype.getEvents.call(this);return t.viewprereset=this._onViewPreReset,t},_onViewPreReset:function(){this._postponeUpdatePaths=!0},onAdd:function(){Wi.prototype.onAdd.call(this),this._draw()},_initContainer:function(){var t=this._container=document.createElement("canvas");S(t,"mousemove",this._onMouseMove,this),S(t,"click dblclick mousedown mouseup contextmenu",this._onClick,this),S(t,"mouseout",this._handleMouseOut,this),t._leaflet_disable_events=!0,this._ctx=t.getContext("2d")},_destroyContainer:function(){r(this._redrawRequest),delete this._ctx,T(this._container),k(this._container),delete this._container},_updatePaths:function(){if(!this._postponeUpdatePaths){for(var t in this._redrawBounds=null,this._layers)this._layers[t]._update();this._redraw()}},_update:function(){var t,e,i,n;this._map._animatingZoom&&this._bounds||(Wi.prototype._update.call(this),t=this._bounds,e=this._container,i=t.getSize(),n=b.retina?2:1,Z(e,t.min),e.width=n*i.x,e.height=n*i.y,e.style.width=i.x+"px",e.style.height=i.y+"px",b.retina&&this._ctx.scale(2,2),this._ctx.translate(-t.min.x,-t.min.y),this.fire("update"))},_reset:function(){Wi.prototype._reset.call(this),this._postponeUpdatePaths&&(this._postponeUpdatePaths=!1,this._updatePaths())},_initPath:function(t){this._updateDashArray(t);t=(this._layers[h(t)]=t)._order={layer:t,prev:this._drawLast,next:null};this._drawLast&&(this._drawLast.next=t),this._drawLast=t,this._drawFirst=this._drawFirst||this._drawLast},_addPath:function(t){this._requestRedraw(t)},_removePath:function(t){var e=t._order,i=e.next,e=e.prev;i?i.prev=e:this._drawLast=e,e?e.next=i:this._drawFirst=i,delete t._order,delete this._layers[h(t)],this._requestRedraw(t)},_updatePath:function(t){this._extendRedrawBounds(t),t._project(),t._update(),this._requestRedraw(t)},_updateStyle:function(t){this._updateDashArray(t),this._requestRedraw(t)},_updateDashArray:function(t){if("string"==typeof t.options.dashArray){for(var e,i=t.options.dashArray.split(/[, ]+/),n=[],o=0;o<i.length;o++){if(e=Number(i[o]),isNaN(e))return;n.push(e)}t.options._dashArray=n}else t.options._dashArray=t.options.dashArray},_requestRedraw:function(t){this._map&&(this._extendRedrawBounds(t),this._redrawRequest=this._redrawRequest||x(this._redraw,this))},_extendRedrawBounds:function(t){var e;t._pxBounds&&(e=(t.options.weight||0)+1,this._redrawBounds=this._redrawBounds||new f,this._redrawBounds.extend(t._pxBounds.min.subtract([e,e])),this._redrawBounds.extend(t._pxBounds.max.add([e,e])))},_redraw:function(){this._redrawRequest=null,this._redrawBounds&&(this._redrawBounds.min._floor(),this._redrawBounds.max._ceil()),this._clear(),this._draw(),this._redrawBounds=null},_clear:function(){var t,e=this._redrawBounds;e?(t=e.getSize(),this._ctx.clearRect(e.min.x,e.min.y,t.x,t.y)):(this._ctx.save(),this._ctx.setTransform(1,0,0,1,0,0),this._ctx.clearRect(0,0,this._container.width,this._container.height),this._ctx.restore())},_draw:function(){var t,e,i=this._redrawBounds;this._ctx.save(),i&&(e=i.getSize(),this._ctx.beginPath(),this._ctx.rect(i.min.x,i.min.y,e.x,e.y),this._ctx.clip()),this._drawing=!0;for(var n=this._drawFirst;n;n=n.next)t=n.layer,(!i||t._pxBounds&&t._pxBounds.intersects(i))&&t._updatePath();this._drawing=!1,this._ctx.restore()},_updatePoly:function(t,e){if(this._drawing){var i,n,o,s,r=t._parts,a=r.length,h=this._ctx;if(a){for(h.beginPath(),i=0;i<a;i++){for(n=0,o=r[i].length;n<o;n++)s=r[i][n],h[n?"lineTo":"moveTo"](s.x,s.y);e&&h.closePath()}this._fillStroke(h,t)}}},_updateCircle:function(t){var e,i,n,o;this._drawing&&!t._empty()&&(e=t._point,i=this._ctx,n=Math.max(Math.round(t._radius),1),1!=(o=(Math.max(Math.round(t._radiusY),1)||n)/n)&&(i.save(),i.scale(1,o)),i.beginPath(),i.arc(e.x,e.y/o,n,0,2*Math.PI,!1),1!=o&&i.restore(),this._fillStroke(i,t))},_fillStroke:function(t,e){var i=e.options;i.fill&&(t.globalAlpha=i.fillOpacity,t.fillStyle=i.fillColor||i.color,t.fill(i.fillRule||"evenodd")),i.stroke&&0!==i.weight&&(t.setLineDash&&t.setLineDash(e.options&&e.options._dashArray||[]),t.globalAlpha=i.opacity,t.lineWidth=i.weight,t.strokeStyle=i.color,t.lineCap=i.lineCap,t.lineJoin=i.lineJoin,t.stroke())},_onClick:function(t){for(var e,i,n=this._map.mouseEventToLayerPoint(t),o=this._drawFirst;o;o=o.next)(e=o.layer).options.interactive&&e._containsPoint(n)&&(("click"===t.type||"preclick"===t.type)&&this._map._draggableMoved(e)||(i=e));this._fireEvent(!!i&&[i],t)},_onMouseMove:function(t){var e;!this._map||this._map.dragging.moving()||this._map._animatingZoom||(e=this._map.mouseEventToLayerPoint(t),this._handleMouseHover(t,e))},_handleMouseOut:function(t){var e=this._hoveredLayer;e&&(z(this._container,"leaflet-interactive"),this._fireEvent([e],t,"mouseout"),this._hoveredLayer=null,this._mouseHoverThrottled=!1)},_handleMouseHover:function(t,e){if(!this._mouseHoverThrottled){for(var i,n,o=this._drawFirst;o;o=o.next)(i=o.layer).options.interactive&&i._containsPoint(e)&&(n=i);n!==this._hoveredLayer&&(this._handleMouseOut(t),n&&(M(this._container,"leaflet-interactive"),this._fireEvent([n],t,"mouseover"),this._hoveredLayer=n)),this._fireEvent(!!this._hoveredLayer&&[this._hoveredLayer],t),this._mouseHoverThrottled=!0,setTimeout(a(function(){this._mouseHoverThrottled=!1},this),32)}},_fireEvent:function(t,e,i){this._map._fireDOMEvent(e,i||e.type,t)},_bringToFront:function(t){var e,i,n=t._order;n&&(e=n.next,i=n.prev,e&&((e.prev=i)?i.next=e:e&&(this._drawFirst=e),n.prev=this._drawLast,(this._drawLast.next=n).next=null,this._drawLast=n,this._requestRedraw(t)))},_bringToBack:function(t){var e,i,n=t._order;n&&(e=n.next,(i=n.prev)&&((i.next=e)?e.prev=i:i&&(this._drawLast=i),n.prev=null,n.next=this._drawFirst,this._drawFirst.prev=n,this._drawFirst=n,this._requestRedraw(t)))}});function Ui(t){return b.canvas?new Fi(t):null}var Vi=function(){try{return document.namespaces.add("lvml","urn:schemas-microsoft-com:vml"),function(t){return document.createElement("<lvml:"+t+' class="lvml">')}}catch(t){}return function(t){return document.createElement("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')}}(),zt={_initContainer:function(){this._container=P("div","leaflet-vml-container")},_update:function(){this._map._animatingZoom||(Wi.prototype._update.call(this),this.fire("update"))},_initPath:function(t){var e=t._container=Vi("shape");M(e,"leaflet-vml-shape "+(this.options.className||"")),e.coordsize="1 1",t._path=Vi("path"),e.appendChild(t._path),this._updateStyle(t),this._layers[h(t)]=t},_addPath:function(t){var e=t._container;this._container.appendChild(e),t.options.interactive&&t.addInteractiveTarget(e)},_removePath:function(t){var e=t._container;T(e),t.removeInteractiveTarget(e),delete this._layers[h(t)]},_updateStyle:function(t){var e=t._stroke,i=t._fill,n=t.options,o=t._container;o.stroked=!!n.stroke,o.filled=!!n.fill,n.stroke?(e=e||(t._stroke=Vi("stroke")),o.appendChild(e),e.weight=n.weight+"px",e.color=n.color,e.opacity=n.opacity,n.dashArray?e.dashStyle=d(n.dashArray)?n.dashArray.join(" "):n.dashArray.replace(/( *, *)/g," "):e.dashStyle="",e.endcap=n.lineCap.replace("butt","flat"),e.joinstyle=n.lineJoin):e&&(o.removeChild(e),t._stroke=null),n.fill?(i=i||(t._fill=Vi("fill")),o.appendChild(i),i.color=n.fillColor||n.color,i.opacity=n.fillOpacity):i&&(o.removeChild(i),t._fill=null)},_updateCircle:function(t){var e=t._point.round(),i=Math.round(t._radius),n=Math.round(t._radiusY||i);this._setPath(t,t._empty()?"M0 0":"AL "+e.x+","+e.y+" "+i+","+n+" 0,23592600")},_setPath:function(t,e){t._path.v=e},_bringToFront:function(t){fe(t._container)},_bringToBack:function(t){ge(t._container)}},qi=b.vml?Vi:ct,Gi=Wi.extend({_initContainer:function(){this._container=qi("svg"),this._container.setAttribute("pointer-events","none"),this._rootGroup=qi("g"),this._container.appendChild(this._rootGroup)},_destroyContainer:function(){T(this._container),k(this._container),delete this._container,delete this._rootGroup,delete this._svgSize},_update:function(){var t,e,i;this._map._animatingZoom&&this._bounds||(Wi.prototype._update.call(this),e=(t=this._bounds).getSize(),i=this._container,this._svgSize&&this._svgSize.equals(e)||(this._svgSize=e,i.setAttribute("width",e.x),i.setAttribute("height",e.y)),Z(i,t.min),i.setAttribute("viewBox",[t.min.x,t.min.y,e.x,e.y].join(" ")),this.fire("update"))},_initPath:function(t){var e=t._path=qi("path");t.options.className&&M(e,t.options.className),t.options.interactive&&M(e,"leaflet-interactive"),this._updateStyle(t),this._layers[h(t)]=t},_addPath:function(t){this._rootGroup||this._initContainer(),this._rootGroup.appendChild(t._path),t.addInteractiveTarget(t._path)},_removePath:function(t){T(t._path),t.removeInteractiveTarget(t._path),delete this._layers[h(t)]},_updatePath:function(t){t._project(),t._update()},_updateStyle:function(t){var e=t._path,t=t.options;e&&(t.stroke?(e.setAttribute("stroke",t.color),e.setAttribute("stroke-opacity",t.opacity),e.setAttribute("stroke-width",t.weight),e.setAttribute("stroke-linecap",t.lineCap),e.setAttribute("stroke-linejoin",t.lineJoin),t.dashArray?e.setAttribute("stroke-dasharray",t.dashArray):e.removeAttribute("stroke-dasharray"),t.dashOffset?e.setAttribute("stroke-dashoffset",t.dashOffset):e.removeAttribute("stroke-dashoffset")):e.setAttribute("stroke","none"),t.fill?(e.setAttribute("fill",t.fillColor||t.color),e.setAttribute("fill-opacity",t.fillOpacity),e.setAttribute("fill-rule",t.fillRule||"evenodd")):e.setAttribute("fill","none"))},_updatePoly:function(t,e){this._setPath(t,dt(t._parts,e))},_updateCircle:function(t){var e=t._point,i=Math.max(Math.round(t._radius),1),n="a"+i+","+(Math.max(Math.round(t._radiusY),1)||i)+" 0 1,0 ",e=t._empty()?"M0 0":"M"+(e.x-i)+","+e.y+n+2*i+",0 "+n+2*-i+",0 ";this._setPath(t,e)},_setPath:function(t,e){t._path.setAttribute("d",e)},_bringToFront:function(t){fe(t._path)},_bringToBack:function(t){ge(t._path)}});function Ki(t){return b.svg||b.vml?new Gi(t):null}b.vml&&Gi.include(zt),A.include({getRenderer:function(t){t=(t=t.options.renderer||this._getPaneRenderer(t.options.pane)||this.options.renderer||this._renderer)||(this._renderer=this._createRenderer());return this.hasLayer(t)||this.addLayer(t),t},_getPaneRenderer:function(t){var e;return"overlayPane"!==t&&void 0!==t&&(void 0===(e=this._paneRenderers[t])&&(e=this._createRenderer({pane:t}),this._paneRenderers[t]=e),e)},_createRenderer:function(t){return this.options.preferCanvas&&Ui(t)||Ki(t)}});var Yi=xi.extend({initialize:function(t,e){xi.prototype.initialize.call(this,this._boundsToLatLngs(t),e)},setBounds:function(t){return this.setLatLngs(this._boundsToLatLngs(t))},_boundsToLatLngs:function(t){return[(t=g(t)).getSouthWest(),t.getNorthWest(),t.getNorthEast(),t.getSouthEast()]}});Gi.create=qi,Gi.pointsToPath=dt,wi.geometryToLayer=bi,wi.coordsToLatLng=Li,wi.coordsToLatLngs=Ti,wi.latLngToCoords=Mi,wi.latLngsToCoords=zi,wi.getFeature=Ci,wi.asFeature=Zi,A.mergeOptions({boxZoom:!0});var _t=n.extend({initialize:function(t){this._map=t,this._container=t._container,this._pane=t._panes.overlayPane,this._resetStateTimeout=0,t.on("unload",this._destroy,this)},addHooks:function(){S(this._container,"mousedown",this._onMouseDown,this)},removeHooks:function(){k(this._container,"mousedown",this._onMouseDown,this)},moved:function(){return this._moved},_destroy:function(){T(this._pane),delete this._pane},_resetState:function(){this._resetStateTimeout=0,this._moved=!1},_clearDeferredResetState:function(){0!==this._resetStateTimeout&&(clearTimeout(this._resetStateTimeout),this._resetStateTimeout=0)},_onMouseDown:function(t){if(!t.shiftKey||1!==t.which&&1!==t.button)return!1;this._clearDeferredResetState(),this._resetState(),re(),Le(),this._startPoint=this._map.mouseEventToContainerPoint(t),S(document,{contextmenu:Re,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseMove:function(t){this._moved||(this._moved=!0,this._box=P("div","leaflet-zoom-box",this._container),M(this._container,"leaflet-crosshair"),this._map.fire("boxzoomstart")),this._point=this._map.mouseEventToContainerPoint(t);var t=new f(this._point,this._startPoint),e=t.getSize();Z(this._box,t.min),this._box.style.width=e.x+"px",this._box.style.height=e.y+"px"},_finish:function(){this._moved&&(T(this._box),z(this._container,"leaflet-crosshair")),ae(),Te(),k(document,{contextmenu:Re,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseUp:function(t){1!==t.which&&1!==t.button||(this._finish(),this._moved&&(this._clearDeferredResetState(),this._resetStateTimeout=setTimeout(a(this._resetState,this),0),t=new s(this._map.containerPointToLatLng(this._startPoint),this._map.containerPointToLatLng(this._point)),this._map.fitBounds(t).fire("boxzoomend",{boxZoomBounds:t})))},_onKeyDown:function(t){27===t.keyCode&&(this._finish(),this._clearDeferredResetState(),this._resetState())}}),Ct=(A.addInitHook("addHandler","boxZoom",_t),A.mergeOptions({doubleClickZoom:!0}),n.extend({addHooks:function(){this._map.on("dblclick",this._onDoubleClick,this)},removeHooks:function(){this._map.off("dblclick",this._onDoubleClick,this)},_onDoubleClick:function(t){var e=this._map,i=e.getZoom(),n=e.options.zoomDelta,i=t.originalEvent.shiftKey?i-n:i+n;"center"===e.options.doubleClickZoom?e.setZoom(i):e.setZoomAround(t.containerPoint,i)}})),Zt=(A.addInitHook("addHandler","doubleClickZoom",Ct),A.mergeOptions({dragging:!0,inertia:!0,inertiaDeceleration:3400,inertiaMaxSpeed:1/0,easeLinearity:.2,worldCopyJump:!1,maxBoundsViscosity:0}),n.extend({addHooks:function(){var t;this._draggable||(t=this._map,this._draggable=new Xe(t._mapPane,t._container),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this),this._draggable.on("predrag",this._onPreDragLimit,this),t.options.worldCopyJump&&(this._draggable.on("predrag",this._onPreDragWrap,this),t.on("zoomend",this._onZoomEnd,this),t.whenReady(this._onZoomEnd,this))),M(this._map._container,"leaflet-grab leaflet-touch-drag"),this._draggable.enable(),this._positions=[],this._times=[]},removeHooks:function(){z(this._map._container,"leaflet-grab"),z(this._map._container,"leaflet-touch-drag"),this._draggable.disable()},moved:function(){return this._draggable&&this._draggable._moved},moving:function(){return this._draggable&&this._draggable._moving},_onDragStart:function(){var t,e=this._map;e._stop(),this._map.options.maxBounds&&this._map.options.maxBoundsViscosity?(t=g(this._map.options.maxBounds),this._offsetLimit=_(this._map.latLngToContainerPoint(t.getNorthWest()).multiplyBy(-1),this._map.latLngToContainerPoint(t.getSouthEast()).multiplyBy(-1).add(this._map.getSize())),this._viscosity=Math.min(1,Math.max(0,this._map.options.maxBoundsViscosity))):this._offsetLimit=null,e.fire("movestart").fire("dragstart"),e.options.inertia&&(this._positions=[],this._times=[])},_onDrag:function(t){var e,i;this._map.options.inertia&&(e=this._lastTime=+new Date,i=this._lastPos=this._draggable._absPos||this._draggable._newPos,this._positions.push(i),this._times.push(e),this._prunePositions(e)),this._map.fire("move",t).fire("drag",t)},_prunePositions:function(t){for(;1<this._positions.length&&50<t-this._times[0];)this._positions.shift(),this._times.shift()},_onZoomEnd:function(){var t=this._map.getSize().divideBy(2),e=this._map.latLngToLayerPoint([0,0]);this._initialWorldOffset=e.subtract(t).x,this._worldWidth=this._map.getPixelWorldBounds().getSize().x},_viscousLimit:function(t,e){return t-(t-e)*this._viscosity},_onPreDragLimit:function(){var t,e;this._viscosity&&this._offsetLimit&&(t=this._draggable._newPos.subtract(this._draggable._startPos),e=this._offsetLimit,t.x<e.min.x&&(t.x=this._viscousLimit(t.x,e.min.x)),t.y<e.min.y&&(t.y=this._viscousLimit(t.y,e.min.y)),t.x>e.max.x&&(t.x=this._viscousLimit(t.x,e.max.x)),t.y>e.max.y&&(t.y=this._viscousLimit(t.y,e.max.y)),this._draggable._newPos=this._draggable._startPos.add(t))},_onPreDragWrap:function(){var t=this._worldWidth,e=Math.round(t/2),i=this._initialWorldOffset,n=this._draggable._newPos.x,o=(n-e+i)%t+e-i,n=(n+e+i)%t-e-i,t=Math.abs(o+i)<Math.abs(n+i)?o:n;this._draggable._absPos=this._draggable._newPos.clone(),this._draggable._newPos.x=t},_onDragEnd:function(t){var e,i,n,o,s=this._map,r=s.options,a=!r.inertia||t.noInertia||this._times.length<2;s.fire("dragend",t),!a&&(this._prunePositions(+new Date),t=this._lastPos.subtract(this._positions[0]),a=(this._lastTime-this._times[0])/1e3,e=r.easeLinearity,a=(t=t.multiplyBy(e/a)).distanceTo([0,0]),i=Math.min(r.inertiaMaxSpeed,a),t=t.multiplyBy(i/a),n=i/(r.inertiaDeceleration*e),(o=t.multiplyBy(-n/2).round()).x||o.y)?(o=s._limitOffset(o,s.options.maxBounds),x(function(){s.panBy(o,{duration:n,easeLinearity:e,noMoveStart:!0,animate:!0})})):s.fire("moveend")}})),St=(A.addInitHook("addHandler","dragging",Zt),A.mergeOptions({keyboard:!0,keyboardPanDelta:80}),n.extend({keyCodes:{left:[37],right:[39],down:[40],up:[38],zoomIn:[187,107,61,171],zoomOut:[189,109,54,173]},initialize:function(t){this._map=t,this._setPanDelta(t.options.keyboardPanDelta),this._setZoomDelta(t.options.zoomDelta)},addHooks:function(){var t=this._map._container;t.tabIndex<=0&&(t.tabIndex="0"),S(t,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.on({focus:this._addHooks,blur:this._removeHooks},this)},removeHooks:function(){this._removeHooks(),k(this._map._container,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.off({focus:this._addHooks,blur:this._removeHooks},this)},_onMouseDown:function(){var t,e,i;this._focused||(i=document.body,t=document.documentElement,e=i.scrollTop||t.scrollTop,i=i.scrollLeft||t.scrollLeft,this._map._container.focus(),window.scrollTo(i,e))},_onFocus:function(){this._focused=!0,this._map.fire("focus")},_onBlur:function(){this._focused=!1,this._map.fire("blur")},_setPanDelta:function(t){for(var e=this._panKeys={},i=this.keyCodes,n=0,o=i.left.length;n<o;n++)e[i.left[n]]=[-1*t,0];for(n=0,o=i.right.length;n<o;n++)e[i.right[n]]=[t,0];for(n=0,o=i.down.length;n<o;n++)e[i.down[n]]=[0,t];for(n=0,o=i.up.length;n<o;n++)e[i.up[n]]=[0,-1*t]},_setZoomDelta:function(t){for(var e=this._zoomKeys={},i=this.keyCodes,n=0,o=i.zoomIn.length;n<o;n++)e[i.zoomIn[n]]=t;for(n=0,o=i.zoomOut.length;n<o;n++)e[i.zoomOut[n]]=-t},_addHooks:function(){S(document,"keydown",this._onKeyDown,this)},_removeHooks:function(){k(document,"keydown",this._onKeyDown,this)},_onKeyDown:function(t){if(!(t.altKey||t.ctrlKey||t.metaKey)){var e,i,n=t.keyCode,o=this._map;if(n in this._panKeys)o._panAnim&&o._panAnim._inProgress||(i=this._panKeys[n],t.shiftKey&&(i=m(i).multiplyBy(3)),o.options.maxBounds&&(i=o._limitOffset(m(i),o.options.maxBounds)),o.options.worldCopyJump?(e=o.wrapLatLng(o.unproject(o.project(o.getCenter()).add(i))),o.panTo(e)):o.panBy(i));else if(n in this._zoomKeys)o.setZoom(o.getZoom()+(t.shiftKey?3:1)*this._zoomKeys[n]);else{if(27!==n||!o._popup||!o._popup.options.closeOnEscapeKey)return;o.closePopup()}Re(t)}}})),Et=(A.addInitHook("addHandler","keyboard",St),A.mergeOptions({scrollWheelZoom:!0,wheelDebounceTime:40,wheelPxPerZoomLevel:60}),n.extend({addHooks:function(){S(this._map._container,"wheel",this._onWheelScroll,this),this._delta=0},removeHooks:function(){k(this._map._container,"wheel",this._onWheelScroll,this)},_onWheelScroll:function(t){var e=He(t),i=this._map.options.wheelDebounceTime,e=(this._delta+=e,this._lastMousePos=this._map.mouseEventToContainerPoint(t),this._startTime||(this._startTime=+new Date),Math.max(i-(+new Date-this._startTime),0));clearTimeout(this._timer),this._timer=setTimeout(a(this._performZoom,this),e),Re(t)},_performZoom:function(){var t=this._map,e=t.getZoom(),i=this._map.options.zoomSnap||0,n=(t._stop(),this._delta/(4*this._map.options.wheelPxPerZoomLevel)),n=4*Math.log(2/(1+Math.exp(-Math.abs(n))))/Math.LN2,i=i?Math.ceil(n/i)*i:n,n=t._limitZoom(e+(0<this._delta?i:-i))-e;this._delta=0,this._startTime=null,n&&("center"===t.options.scrollWheelZoom?t.setZoom(e+n):t.setZoomAround(this._lastMousePos,e+n))}})),kt=(A.addInitHook("addHandler","scrollWheelZoom",Et),A.mergeOptions({tapHold:b.touchNative&&b.safari&&b.mobile,tapTolerance:15}),n.extend({addHooks:function(){S(this._map._container,"touchstart",this._onDown,this)},removeHooks:function(){k(this._map._container,"touchstart",this._onDown,this)},_onDown:function(t){var e;clearTimeout(this._holdTimeout),1===t.touches.length&&(e=t.touches[0],this._startPos=this._newPos=new p(e.clientX,e.clientY),this._holdTimeout=setTimeout(a(function(){this._cancel(),this._isTapValid()&&(S(document,"touchend",O),S(document,"touchend touchcancel",this._cancelClickPrevent),this._simulateEvent("contextmenu",e))},this),600),S(document,"touchend touchcancel contextmenu",this._cancel,this),S(document,"touchmove",this._onMove,this))},_cancelClickPrevent:function t(){k(document,"touchend",O),k(document,"touchend touchcancel",t)},_cancel:function(){clearTimeout(this._holdTimeout),k(document,"touchend touchcancel contextmenu",this._cancel,this),k(document,"touchmove",this._onMove,this)},_onMove:function(t){t=t.touches[0];this._newPos=new p(t.clientX,t.clientY)},_isTapValid:function(){return this._newPos.distanceTo(this._startPos)<=this._map.options.tapTolerance},_simulateEvent:function(t,e){t=new MouseEvent(t,{bubbles:!0,cancelable:!0,view:window,screenX:e.screenX,screenY:e.screenY,clientX:e.clientX,clientY:e.clientY});t._simulated=!0,e.target.dispatchEvent(t)}})),Ot=(A.addInitHook("addHandler","tapHold",kt),A.mergeOptions({touchZoom:b.touch,bounceAtZoomLimits:!0}),n.extend({addHooks:function(){M(this._map._container,"leaflet-touch-zoom"),S(this._map._container,"touchstart",this._onTouchStart,this)},removeHooks:function(){z(this._map._container,"leaflet-touch-zoom"),k(this._map._container,"touchstart",this._onTouchStart,this)},_onTouchStart:function(t){var e,i,n=this._map;!t.touches||2!==t.touches.length||n._animatingZoom||this._zooming||(e=n.mouseEventToContainerPoint(t.touches[0]),i=n.mouseEventToContainerPoint(t.touches[1]),this._centerPoint=n.getSize()._divideBy(2),this._startLatLng=n.containerPointToLatLng(this._centerPoint),"center"!==n.options.touchZoom&&(this._pinchStartLatLng=n.containerPointToLatLng(e.add(i)._divideBy(2))),this._startDist=e.distanceTo(i),this._startZoom=n.getZoom(),this._moved=!1,this._zooming=!0,n._stop(),S(document,"touchmove",this._onTouchMove,this),S(document,"touchend touchcancel",this._onTouchEnd,this),O(t))},_onTouchMove:function(t){if(t.touches&&2===t.touches.length&&this._zooming){var e=this._map,i=e.mouseEventToContainerPoint(t.touches[0]),n=e.mouseEventToContainerPoint(t.touches[1]),o=i.distanceTo(n)/this._startDist;if(this._zoom=e.getScaleZoom(o,this._startZoom),!e.options.bounceAtZoomLimits&&(this._zoom<e.getMinZoom()&&o<1||this._zoom>e.getMaxZoom()&&1<o)&&(this._zoom=e._limitZoom(this._zoom)),"center"===e.options.touchZoom){if(this._center=this._startLatLng,1==o)return}else{i=i._add(n)._divideBy(2)._subtract(this._centerPoint);if(1==o&&0===i.x&&0===i.y)return;this._center=e.unproject(e.project(this._pinchStartLatLng,this._zoom).subtract(i),this._zoom)}this._moved||(e._moveStart(!0,!1),this._moved=!0),r(this._animRequest);n=a(e._move,e,this._center,this._zoom,{pinch:!0,round:!1},void 0);this._animRequest=x(n,this,!0),O(t)}},_onTouchEnd:function(){this._moved&&this._zooming?(this._zooming=!1,r(this._animRequest),k(document,"touchmove",this._onTouchMove,this),k(document,"touchend touchcancel",this._onTouchEnd,this),this._map.options.zoomAnimation?this._map._animateZoom(this._center,this._map._limitZoom(this._zoom),!0,this._map.options.zoomSnap):this._map._resetView(this._center,this._map._limitZoom(this._zoom))):this._zooming=!1}})),Xi=(A.addInitHook("addHandler","touchZoom",Ot),A.BoxZoom=_t,A.DoubleClickZoom=Ct,A.Drag=Zt,A.Keyboard=St,A.ScrollWheelZoom=Et,A.TapHold=kt,A.TouchZoom=Ot,t.Bounds=f,t.Browser=b,t.CRS=ot,t.Canvas=Fi,t.Circle=vi,t.CircleMarker=gi,t.Class=et,t.Control=B,t.DivIcon=Ri,t.DivOverlay=Ai,t.DomEvent=mt,t.DomUtil=pt,t.Draggable=Xe,t.Evented=it,t.FeatureGroup=ci,t.GeoJSON=wi,t.GridLayer=Ni,t.Handler=n,t.Icon=di,t.ImageOverlay=Ei,t.LatLng=v,t.LatLngBounds=s,t.Layer=o,t.LayerGroup=ui,t.LineUtil=vt,t.Map=A,t.Marker=mi,t.Mixin=ft,t.Path=fi,t.Point=p,t.PolyUtil=gt,t.Polygon=xi,t.Polyline=yi,t.Popup=Bi,t.PosAnimation=Fe,t.Projection=wt,t.Rectangle=Yi,t.Renderer=Wi,t.SVG=Gi,t.SVGOverlay=Oi,t.TileLayer=Di,t.Tooltip=Ii,t.Transformation=at,t.Util=tt,t.VideoOverlay=ki,t.bind=a,t.bounds=_,t.canvas=Ui,t.circle=function(t,e,i){return new vi(t,e,i)},t.circleMarker=function(t,e){return new gi(t,e)},t.control=Ue,t.divIcon=function(t){return new Ri(t)},t.extend=l,t.featureGroup=function(t,e){return new ci(t,e)},t.geoJSON=Si,t.geoJson=Mt,t.gridLayer=function(t){return new Ni(t)},t.icon=function(t){return new di(t)},t.imageOverlay=function(t,e,i){return new Ei(t,e,i)},t.latLng=w,t.latLngBounds=g,t.layerGroup=function(t,e){return new ui(t,e)},t.map=function(t,e){return new A(t,e)},t.marker=function(t,e){return new mi(t,e)},t.point=m,t.polygon=function(t,e){return new xi(t,e)},t.polyline=function(t,e){return new yi(t,e)},t.popup=function(t,e){return new Bi(t,e)},t.rectangle=function(t,e){return new Yi(t,e)},t.setOptions=c,t.stamp=h,t.svg=Ki,t.svgOverlay=function(t,e,i){return new Oi(t,e,i)},t.tileLayer=ji,t.tooltip=function(t,e){return new Ii(t,e)},t.transformation=ht,t.version="1.9.4",t.videoOverlay=function(t,e,i){return new ki(t,e,i)},window.L);t.noConflict=function(){return window.L=Xi,this},window.L=t});
}).call(globalThis, undefined, undefined, undefined, leafletNavigator);

// ===============================================================================================
// 2. sound: the storm sound, the siren and the spoken alerts (a female and a male voice)
// ===============================================================================================
// FloodQ Florida: the storm you hear, synthesised live with the Web Audio API (no audio files).
//
// The sound follows one number, the danger level, which the page works out for your spot
// (or for the coast nearest the storm when no spot is picked):
//   0 Calm     a distant swell and a faint breeze; nothing else
//   1 Watch    the wind rises and a low drone starts underneath
//   2 Warning  steady wind, the first rain bands, a slow pressure pulse
//   3 Severe   gusts that howl, heavy rain, a faster pulse, distant thunder
//   4 Extreme  roaring wind, driving rain, surf and surge rumble, close thunder, a grinding drone
// On top of that, short alerts mark the evacuation order, road closures, your last safe departure
// and landfall, and an outdoor-warning-siren wail sounds when the place you pick is under an
// evacuation order, followed by a spoken alert (the browser's own speech engine; a female and a
// male voice take turns, in a fixed order) naming the safest route. There is no melody and no
// major key: it should sound like a storm coming, not like music to enjoy. Nothing imitates the
// Emergency Alert System attention signal (853 + 960 Hz) or NOAA Weather Radio (1050 Hz): the
// siren sweeps between 380 and 820 Hz.
//
// API: enable(on), setVolume(0-1), setVoice(on), setVoiceMode('alternate' | 'female' | 'male'),
// voiceInfo(), setDanger(level 0-4, wind 0-1, rain 0-1, surge 0-1), cue(kind), speak(text),
// stopVoice(), mood() (older 0-1 form), levelName(level).
// init(ctx) also accepts an OfflineAudioContext, and tick(now) takes an explicit time, so the
// same code can render the storm to a file for a preview.
// Classic script, ASCII only, no import/export: loads the same way from file:// and on Qollab.
(function () {
  'use strict';

  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var NAMES = ['Calm', 'Watch', 'Warning', 'Severe', 'Extreme'];
  var STEP = 0.05;                       // scheduler period (s)
  var LOOKAHEAD = 0.25;                  // events are scheduled this far ahead (s)

  var WIND_FLOOR = [0.12, 0.25, 0.33, 0.43, 0.6];      // at levels 0, 1, 2, 3, 4

  function stageOf(level) { return level < 0.8 ? 0 : level < 1.8 ? 1 : level < 2.8 ? 2 : level < 3.6 ? 3 : 4; }
  function table(vals, x) {                              // piecewise-linear lookup at x = 0, 1, 2, ...
    var i = clamp(Math.floor(x), 0, vals.length - 2), f = clamp(x - i, 0, 1);
    return vals[i] + (vals[i + 1] - vals[i]) * f;
  }

  function Storm() {
    this.ctx = null;
    this.ready = false;
    this.muted = true;
    this.offline = false;
    this.target = { level: 0, wind: 0, rain: 0, surge: 0 };
    this.cur = { level: 0, wind: 0, rain: 0, surge: 0 };
    this.lastTick = null;
    this.timer = null;
    this.next = { gust: 0, pulse: 0, thunder: 0, drop: 0, swell: 0, pan: 0 };
    this.beat = 0;
    this.rand = Math.random;
    this.volume = 0.7;
    this.voiceOn = true;
    this.speaking = false;
    this.voiceMode = 'alternate';        // 'alternate' (female, male, female, ...), 'female' or 'male'
    this.voices = null;                  // the two voices chosen for this visit, kept for every alert
    this.turn = 0;                       // spoken alerts so far in 'alternate' mode
    this.lastSpoken = null;              // { kind, name, pitch } of the last alert
    this.voiceSeq = 0;
  }

  // ---- noise: white (rain), pink (wind), brown (surf, rumble, thunder) ----------
  function noiseBuffers(ctx) {
    var len = Math.floor(ctx.sampleRate * 4), out = {};
    ['white', 'pink', 'brown'].forEach(function (kind) {
      var buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var ch = 0; ch < 2; ch++) {
        var d = buf.getChannelData(ch);
        var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
        for (var i = 0; i < len; i++) {
          var w = Math.random() * 2 - 1;
          if (kind === 'white') d[i] = w * 0.5;
          else if (kind === 'pink') {          // Paul Kellet's pink-noise filter
            b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
            b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
            b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
            d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
            b6 = w * 0.115926;
          } else {                               // brown: leaky integral of white noise
            last = (last + 0.02 * w) / 1.02;
            d[i] = last * 3.2;
          }
        }
      }
      out[kind] = buf;
    });
    return out;
  }

  Storm.prototype.init = function (givenCtx) {
    if (this.ctx) return true;
    try {
      var ctx = givenCtx;
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
      }
      this.ctx = ctx;
      this.offline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;
      var t0 = ctx.currentTime;
      var g = function (v) { var n = ctx.createGain(); n.gain.value = v; return n; };
      var filt = function (type, f, q) { var n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q !== undefined) n.Q.value = q; return n; };
      var loop = function (buf, rate, offset) {
        var s = ctx.createBufferSource();
        s.buffer = buf; s.loop = true; s.playbackRate.value = rate || 1;
        s.start(t0, offset || 0);
        return s;
      };
      var pan = function () { return ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain(); };
      this.N = noiseBuffers(ctx);

      // output: master -> soft top cut -> compressor -> speakers
      this.master = g(0);
      var top = filt('lowpass', 11000, 0.5);
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4;
      comp.attack.value = 0.01; comp.release.value = 0.3;
      this.master.connect(top); top.connect(comp); comp.connect(ctx.destination);
      this.fx = g(1);                       // alerts and one-shots
      this.fx.connect(this.master);

      // wind: a roar (low-passed pink noise) and a howl (two narrow band-passes that wander with the
      // gusts), both through a gust envelope and a slowly wandering stereo position
      this.windBus = g(0);
      this.windPan = pan();
      this.windBus.connect(this.windPan); this.windPan.connect(this.master);
      var windSrc = loop(this.N.pink, 1.0);
      this.roarF = filt('lowpass', 420, 0.6);
      this.roarG = g(0);
      windSrc.connect(this.roarF); this.roarF.connect(this.roarG); this.roarG.connect(this.windBus);
      var howlSrc = loop(this.N.pink, 0.97, 1.3);
      this.howlF1 = filt('bandpass', 520, 9);
      this.howlF2 = filt('bandpass', 980, 11);
      this.howlG = g(0);
      howlSrc.connect(this.howlF1); howlSrc.connect(this.howlF2);
      this.howlF1.connect(this.howlG); this.howlF2.connect(this.howlG); this.howlG.connect(this.windBus);

      // rain: hiss (high-passed white noise) plus single drops scheduled in tick()
      var rainSrc = loop(this.N.white, 1.0, 0.7);
      var rHp = filt('highpass', 1100, 0.5);
      var rPk = filt('peaking', 4800, 0.7); rPk.gain.value = 5;
      this.rainG = g(0);
      rainSrc.connect(rHp); rHp.connect(rPk); rPk.connect(this.rainG); this.rainG.connect(this.master);
      this.dropBus = g(0.8);
      this.dropBus.connect(this.master);

      // surf and surge: deep brown-noise rumble with slow wave swells
      var surfSrc = loop(this.N.brown, 1.0, 2.1);
      this.surfF = filt('lowpass', 190, 0.7);
      this.surfG = g(0);
      surfSrc.connect(this.surfF); this.surfF.connect(this.surfG); this.surfG.connect(this.master);

      // drone: low D with a minor second (Eb) and, at the worst, a tritone (Ab), slowly beating
      this.droneF = filt('lowpass', 160, 0.9);
      this.droneG = g(0);
      this.droneF.connect(this.droneG); this.droneG.connect(this.master);
      var osc = function (type, f, det, gain) {
        var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det || 0;
        var og = g(gain); o.connect(og); og.connect(this.droneF); o.start(t0); return og;
      }.bind(this);
      osc('sine', 36.71, 0, 0.4);                                      // D1
      osc('sawtooth', 73.42, -6, 0.22); osc('sawtooth', 73.42, 6, 0.22); // D2
      osc('sawtooth', 146.83, 3, 0.12);                                // D3: audible on small speakers
      this.minor2 = osc('sawtooth', 77.78, 0, 0);                      // Eb2: roughness
      this.tritone = osc('sawtooth', 103.83, 0, 0);                    // Ab2: dread
      var trem = ctx.createOscillator(); trem.frequency.value = 0.18;
      this.tremDepth = g(0); trem.connect(this.tremDepth); this.tremDepth.connect(this.droneG.gain); trem.start(t0);
      this.trem = trem;

      this.ready = true;
      if (!this.offline) {
        var self = this;
        this.timer = setInterval(function () { self.tick(); }, STEP * 1000);
      }
      return true;
    } catch (err) {
      console.log('Audio unavailable: ' + err.message);
      this.ctx = null;
      return false;
    }
  };

  // ---- continuous layers: called every STEP seconds (or with explicit times when rendering offline)
  Storm.prototype.tick = function (when) {
    if (!this.ctx || (this.muted && !this.offline)) return;
    var now = when === undefined ? this.ctx.currentTime : when;
    var dt = this.lastTick === null ? STEP : clamp(now - this.lastTick, 0, 0.5);
    this.lastTick = now;
    var c = this.cur, T = this.target;
    var ease = function (x, y, tau) { return x + (y - x) * (1 - Math.exp(-dt / tau)); };
    c.level = ease(c.level, T.level, 1.6);
    c.wind = ease(c.wind, T.wind, 1.0);
    c.rain = ease(c.rain, T.rain, 1.4);
    c.surge = ease(c.surge, T.surge, 2.0);
    var L = c.level;
    // the level alone sets a floor under the wind: even before the model's wind reaches you,
    // a Warning should not sound like a calm day
    var W = Math.max(c.wind, table(WIND_FLOOR, L));
    var R = c.rain, U = c.surge;
    var set = function (param, v, tau) { param.setTargetAtTime(v, now, tau); };

    set(this.roarG.gain, 0.34 * Math.pow(W, 1.05), 0.4);
    set(this.roarF.frequency, 650 + 800 * W * W, 0.6);
    set(this.howlG.gain, 0.16 * Math.pow(clamp((W - 0.15) / 0.7, 0, 1), 1.2), 0.5);
    set(this.rainG.gain, 0.22 * Math.pow(R, 1.1), 0.6);
    var swellBase = 0.07 + 0.06 * clamp(L / 4, 0, 1) + 0.32 * U;
    set(this.surfF.frequency, 170 + 240 * U, 0.8);
    var dl = clamp((L - 0.45) / 3.55, 0, 1);
    set(this.droneG.gain, 0.17 * dl, 1.2);
    set(this.droneF.frequency, 170 + 700 * dl * dl, 1.0);
    set(this.minor2.gain, 0.28 * clamp((L - 2.1) / 1.4, 0, 1), 1.0);
    set(this.tritone.gain, 0.22 * clamp((L - 3.3) / 0.7, 0, 1), 1.0);
    set(this.tremDepth.gain, 0.06 * dl, 1.0);
    set(this.trem.frequency, 0.15 + 0.5 * dl, 1.0);

    var horizon = now + LOOKAHEAD, n = this.next, r = this.rand;
    // gusts: the wind bus swells and drops at random, deeper and faster as the wind grows
    if (n.gust < now) n.gust = now;
    while (n.gust < horizon) {
      var depth = 0.12 + 0.65 * W;
      var gust = clamp(1 + depth * (r() * 2 - 1) + (r() < 0.12 * W ? depth : 0), 0.15, 2.2);
      this.windBus.gain.setTargetAtTime(gust, n.gust, 0.18 + 0.7 * r());
      var f1 = 330 + 520 * W + 260 * r();
      this.howlF1.frequency.setTargetAtTime(f1, n.gust, 0.4 + 0.6 * r());
      this.howlF2.frequency.setTargetAtTime(f1 * (1.75 + 0.3 * r()), n.gust, 0.5 + 0.6 * r());
      n.gust += (2.4 - 1.8 * W) * (0.4 + r());
    }
    if (n.pan < horizon) {
      if (this.windPan.pan) this.windPan.pan.setTargetAtTime((r() * 2 - 1) * 0.55, Math.max(n.pan, now), 1.5);
      n.pan = Math.max(n.pan, now) + 2 + 3 * r();
    }
    // waves: slow swells of the surf (period 6-10 s), bigger with surge
    if (n.swell < horizon) {
      var ts = Math.max(n.swell, now), per = 6 + 4 * r();
      this.surfG.gain.setTargetAtTime(swellBase * (1.3 + 0.6 * r()), ts, per * 0.18);
      this.surfG.gain.setTargetAtTime(swellBase * 0.45, ts + per * 0.45, per * 0.22);
      n.swell = ts + per;
    }
    // rain drops on top of the hiss
    var rate = R > 0.03 ? 3 + 55 * R : 0;
    if (n.drop < now) n.drop = now;
    while (rate > 0 && n.drop < horizon) {
      this.drop(n.drop, 0.02 + 0.05 * R * r());
      n.drop += -Math.log(1 - r()) / rate;
    }
    // pressure pulse: a low thump, then a double beat (heartbeat) when it is severe
    var pv = clamp((L - 1.7) / 2.3, 0, 1);
    if (pv > 0.02) {
      var bpm = 52 + 44 * pv;
      if (n.pulse < now) n.pulse = now + 0.05;
      while (n.pulse < horizon) {
        this.thump(n.pulse, 0.07 + 0.22 * pv);
        if (L >= 2.8) this.thump(n.pulse + 0.21, 0.04 + 0.12 * pv);
        n.pulse += 60 / bpm;
      }
    } else {
      n.pulse = now;
    }
    // thunder from Severe up, closer and more often at Extreme
    var pt = L >= 2.6 ? 0.012 + 0.085 * clamp((L - 2.6) / 1.4, 0, 1) : 0;
    if (n.thunder < now) n.thunder = now;
    while (pt > 0 && n.thunder < horizon) {
      if (r() < pt * STEP * 4) this.thunder(n.thunder + 0.1 * r(), 0.12 + 0.25 * r() * pv, r() < 0.25 + 0.5 * pv);
      n.thunder += STEP * 4;
    }
  };

  // ---- one-shots -----------------------------------------------------------------
  Storm.prototype.noiseHit = function (kind, t, dur, filters, peak, attack, out) {
    var ctx = this.ctx;
    var src = ctx.createBufferSource();
    src.buffer = this.N[kind];
    src.loop = true;                       // long hits run past the end of the 4 s buffer
    var node = src;
    (filters || []).forEach(function (f) {
      var b = ctx.createBiquadFilter();
      b.type = f[0];
      b.frequency.setValueAtTime(f[1], t);
      if (f[2]) b.frequency.exponentialRampToValueAtTime(f[2], t + dur);
      if (f[3]) b.Q.value = f[3];
      node.connect(b);
      node = b;
    });
    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + (attack || 0.01));
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(env);
    env.connect(out || this.fx);
    src.start(t, this.rand() * 3);
    src.stop(t + dur + 0.05);
  };

  Storm.prototype.tone = function (type, f0, f1, t, dur, peak, lp, out) {
    var ctx = this.ctx;
    var o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var node = o;
    if (lp) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); node = f; }
    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.02, dur / 4));
    env.gain.setValueAtTime(peak, t + dur * 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(env);
    env.connect(out || this.fx);
    o.start(t);
    o.stop(t + dur + 0.05);
  };

  Storm.prototype.drop = function (t, vol) {
    this.noiseHit('white', t, 0.012 + 0.03 * this.rand(), [['bandpass', 2200 + 4200 * this.rand(), 0, 4]], vol, 0.001, this.dropBus);
  };

  Storm.prototype.thump = function (t, vol) {
    this.tone('sine', 62, 36, t, 0.2, vol, 0, this.master);
  };

  Storm.prototype.thunder = function (t, vol, close) {
    var r = this.rand;
    if (close) this.noiseHit('white', t, 0.18, [['highpass', 1400, 0, 0.7]], vol * 0.8, 0.003);
    var start = t + (close ? 0.05 : 0.4 + r());
    this.noiseHit('brown', start, 3.2 + 2 * r(), [['lowpass', close ? 520 : 300, 70, 0.8]], vol * 1.4, 0.08 + 0.2 * r());
    for (var k = 0; k < 3; k++) {
      this.noiseHit('brown', start + 0.3 + 1.6 * r(), 1.2 + r(), [['lowpass', 260, 80, 0.7]], vol * (0.5 + 0.5 * r()), 0.05);
    }
  };

  Storm.prototype.braam = function (t, vol) {
    // a low, detuned brass-like hit with a closing filter
    var ctx = this.ctx, fx = this.fx;
    var f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.Q.value = 2.2;
    f.frequency.setValueAtTime(180, t);
    f.frequency.exponentialRampToValueAtTime(1500, t + 0.16);
    f.frequency.exponentialRampToValueAtTime(240, t + 2.4);
    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    f.connect(env); env.connect(fx);
    [36.71, 55.0, 73.42].forEach(function (fr) {
      [-10, 0, 10].forEach(function (det) {
        var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = det;
        o.connect(f); o.start(t); o.stop(t + 2.9);
      });
    });
  };

  // two-tone attention pattern, falling: 587 Hz then 466 Hz (D5, Bb4), square through a low-pass
  Storm.prototype.alarm = function (t, pairs, vol) {
    for (var k = 0; k < pairs; k++) {
      var t1 = t + k * 0.44;
      this.tone('square', 587.3, 0, t1, 0.17, vol, 2400);
      this.tone('square', 466.2, 0, t1 + 0.2, 0.17, vol, 2400);
    }
  };

  // ---- public API --------------------------------------------------------------------
  Storm.prototype.enable = function (on) {
    if (on) voiceList();                  // starts the browser loading its voices
    if (on && !this.init()) return false;
    if (!this.ctx) return false;
    this.muted = !on;
    var now = this.ctx.currentTime;
    if (on && this.ctx.state === 'suspended' && this.ctx.resume) this.ctx.resume();
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? this.level() : 0.0, now, on ? 0.8 : 0.15);
    if (on) this.lastTick = null;
    if (!on) this.stopVoice();
    return true;
  };

  // overall loudness: the volume slider, lowered while the voice speaks so it stays clear
  Storm.prototype.level = function () { return 0.85 * this.volume * (this.speaking ? 0.45 : 1); };
  Storm.prototype.setVolume = function (v) {
    this.volume = clamp(+v, 0, 1);
    if (this.ctx && !this.muted) this.master.gain.setTargetAtTime(this.level(), this.ctx.currentTime, 0.2);
  };
  Storm.prototype.setVoice = function (on) {
    this.voiceOn = !!on;
    if (!on) this.stopVoice();
  };
  Storm.prototype.setVoiceMode = function (mode) {
    mode = mode === 'female' || mode === 'male' ? mode : 'alternate';
    if (mode !== this.voiceMode) this.turn = 0;          // taking turns again starts with the female voice
    this.voiceMode = mode;
  };

  // ---- the spoken alert: a female and a male voice, taking turns -------------------------
  // Alerts alternate between a female and a male voice in a fixed order (female, male, female,
  // ...), so one alert is easy to tell from the next; the voice menu can also keep just one of
  // them. Browsers list their voices only after the page has loaded, and in no fixed order, so the
  // page waits for the list, picks each of the two voices once by a fixed preference (clear US
  // English voices first; never the novelty voices macOS lists as English) and keeps them for the
  // visit. A browser with only one English voice (or none whose name says which it is) still
  // takes turns: the same voice, higher for the female turn and lower for the male turn.
  var FEMALE_PREF = [/Microsoft Aria Online/i, /Microsoft Jenny Online/i, /^Samantha\b/i, /Microsoft Zira/i,
    /^Google US English$/i, /Google UK English Female/i,
    /\b(Aria|Jenny|Ava|Emma|Michelle|Zira|Samantha|Allison|Susan|Joanna|Salli|Kendra|Kimberly|Karen|Moira|Tessa|Fiona|Serena|Hazel|Libby|Sonia|Natasha|Clara|Catherine|Female)\b/i];
  var MALE_PREF = [/Microsoft Guy Online/i, /Microsoft (Andrew|Christopher|Eric|Brian|Roger|Steffan|Davis) Online/i,
    /Microsoft David/i, /Microsoft Mark/i, /Google UK English Male/i, /^(Aaron|Alex|Tom|Evan|Nathan|Daniel)\b/i,
    /\b(Guy|Andrew|Christopher|Eric|Brian|Davis|Roger|Steffan|Tony|Jason|Ryan|Thomas|William|Liam|Connor|Mitchell|David|Mark|George|James|Richard|Sean|Alex|Daniel|Aaron|Arthur|Gordon|Oliver|Tom|Lee|Evan|Nathan|Reed|Rishi|Male)\b/i];
  var NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Junior|Organ|Pipe Organ|Princess|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Kathy|Agnes|Bruce|Vicki|Victoria)\b/i;
  var RATE = 0.96;
  var PITCH_UP = 1.15, PITCH_DOWN = 0.8;   // the female and male turns when only one voice is found
  function voiceList() {
    try { return (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.getVoices()) || []; } catch (e) { return []; }
  }
  // English voices, US English first, each group in name order (the list order is not fixed)
  function englishVoices(list) {
    var byName = function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; };
    var ok = function (v) { return v && v.name && !NOVELTY.test(v.name); };
    var us = list.filter(function (v) { return ok(v) && /^en[-_]US/i.test(v.lang || ''); }).sort(byName);
    var en = list.filter(function (v) { return ok(v) && /^en/i.test(v.lang || '') && !/^en[-_]US/i.test(v.lang || ''); }).sort(byName);
    return us.concat(en);
  }
  function firstMatch(voices, prefs, not) {
    for (var i = 0; i < prefs.length; i++) {
      for (var j = 0; j < voices.length; j++) if (voices[j] !== not && prefs[i].test(voices[j].name)) return voices[j];
    }
    return null;
  }
  function pickVoices(list) {
    var en = englishVoices(list);
    var female = firstMatch(en, FEMALE_PREF, null);
    var male = firstMatch(en, MALE_PREF, female);
    var any = en.filter(function (v) { return v.localService; })[0] || en[0] || null;
    var out = {
      n: list.length,
      female: { voice: female || any, pitch: 1, found: !!female },
      male: { voice: male || any, pitch: 1, found: !!male },
    };
    if (!out.female.voice || out.female.voice === out.male.voice) {
      if (!female) out.female.pitch = PITCH_UP;
      if (!male) out.male.pitch = PITCH_DOWN;
    }
    out.female.name = out.female.voice ? out.female.voice.name : '';
    out.male.name = out.male.voice ? out.male.voice.name : '';
    return out;
  }
  // the voice for one turn: { voice, pitch, kind, name }. Picked once, when the browser has listed
  // its voices; picked again only if a longer list brings a voice that was missing.
  Storm.prototype.chooseVoice = function (kind) {
    var list = voiceList();
    var V = this.voices;
    if (list.length && (!V || (list.length > V.n && (!V.female.found || !V.male.found)))) V = this.voices = pickVoices(list);
    var slot = V ? V[kind] : null;
    if (!slot) return { voice: null, pitch: kind === 'male' ? PITCH_DOWN : PITCH_UP, kind: kind, name: '' };
    for (var i = 0; i < list.length; i++) {
      if (list[i].name === slot.name) return { voice: list[i], pitch: slot.pitch, kind: kind, name: slot.name };
    }
    return { voice: slot.voice, pitch: slot.pitch, kind: kind, name: slot.name };
  };
  // whose turn it is: in 'alternate' mode female, male, female, ...
  Storm.prototype.nextKind = function () {
    if (this.voiceMode === 'female' || this.voiceMode === 'male') return this.voiceMode;
    var k = this.turn % 2 === 0 ? 'female' : 'male';
    this.turn += 1;
    return k;
  };
  // the two voices (after the browser has listed them), for the page and the checks
  Storm.prototype.voiceInfo = function () {
    var V = this.voices;
    return { mode: this.voiceMode, turn: this.turn, last: this.lastSpoken,
             female: V ? { name: V.female.name, pitch: V.female.pitch, found: V.female.found } : null,
             male: V ? { name: V.male.name, pitch: V.male.pitch, found: V.male.found } : null };
  };
  // sentences, spoken one by one: some browsers cut a long utterance off after about 15 s.
  // "St." and "U.S." do not end a sentence.
  function sentences(text) {
    var out = [], cur = '';
    String(text).split(/\s+/).forEach(function (w) {
      if (!w) return;
      cur += (cur ? ' ' : '') + w;
      if (/[.!?]$/.test(w) && !/^(St|Ft|Mt|Dr|No|U\.S|[A-Z])\.$/.test(w)) { out.push(cur); cur = ''; }
    });
    if (cur) out.push(cur);
    return out;
  }
  // a spoken alert; false when the browser has no speech engine
  Storm.prototype.speak = function (text, delay) {
    if (!this.voiceOn || this.muted || typeof window === 'undefined' || !window.speechSynthesis ||
        typeof SpeechSynthesisUtterance === 'undefined') return false;
    var self = this, ss = window.speechSynthesis;
    var seq = ++this.voiceSeq;
    var finish = function () {
      if (seq !== self.voiceSeq) return;
      clearTimeout(self.duckTimer);
      self.speaking = false;
      self.setVolume(self.volume);
    };
    var go = function () {
      if (seq !== self.voiceSeq || !self.voiceOn || self.muted) return;
      try {
        ss.cancel();
        var kind = self.nextKind();                 // one voice for the whole alert
        var pick = self.chooseVoice(kind), v = pick.voice;
        self.lastSpoken = { kind: kind, name: pick.name, pitch: pick.pitch };
        var parts = sentences(text), left = parts.length;
        parts.forEach(function (p) {
          var u = new SpeechSynthesisUtterance(p);
          u.lang = v ? v.lang : 'en-US';
          if (v) u.voice = v;
          u.rate = RATE;
          u.pitch = pick.pitch;
          u.volume = clamp(0.35 + 0.65 * self.volume, 0, 1);
          u.onend = u.onerror = function () { left -= 1; if (left <= 0) finish(); };
          ss.speak(u);
        });
        self.speaking = true;
        self.setVolume(self.volume);
        clearTimeout(self.duckTimer);
        self.duckTimer = setTimeout(finish, 4000 + 90 * String(text).length);   // in case no end event comes
      } catch (e) { finish(); }
    };
    // wait (at most 1.5 s) for the browser's list of voices, so the first alert already gets its own voice
    var whenReady = function () {
      var t0 = Date.now();
      var poll = function () {
        if (seq !== self.voiceSeq) return;
        if (self.voices || voiceList().length || Date.now() - t0 > 1500) go();
        else self.voiceTimer = setTimeout(poll, 100);
      };
      poll();
    };
    clearTimeout(this.voiceTimer);
    this.voiceTimer = setTimeout(whenReady, delay || 0);
    return true;
  };
  Storm.prototype.stopVoice = function () {
    this.voiceSeq += 1;
    clearTimeout(this.voiceTimer);
    clearTimeout(this.duckTimer);
    try { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* none */ }
    this.speaking = false;
  };

  // an outdoor warning siren: two slightly detuned rotors rising to about 800 Hz and falling back
  // to 380 Hz, about 4 s per cycle, with a little vibrato; band-limited so it is loud but not harsh
  Storm.prototype.siren = function (t, cycles, vol) {
    var ctx = this.ctx, per = 4.2, dur = cycles * per;
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(vol, t + 0.7);
    out.gain.setValueAtTime(vol, t + dur - 0.9);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.7;
    lp.connect(out);
    out.connect(this.fx);
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5;
    var lfoG = ctx.createGain();
    lfoG.gain.value = 7;
    lfo.connect(lfoG);
    [[0, 'square', 0.42], [6, 'sawtooth', 0.3]].forEach(function (spec) {
      var o = ctx.createOscillator();
      o.type = spec[1];
      o.detune.value = spec[0];
      var f = o.frequency;
      f.setValueAtTime(380, t);
      for (var c = 0; c < cycles; c++) {
        var c0 = t + c * per;
        f.setTargetAtTime(820, c0 + 0.05, 0.85);
        f.setTargetAtTime(380, c0 + 2.3, 0.75);
      }
      lfoG.connect(f);
      var g = ctx.createGain();
      g.gain.value = spec[2];
      o.connect(g);
      g.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.1);
    });
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
  };

  // level 0 (calm) .. 4 (extreme); wind, rain and surge 0..1 at the place in focus
  Storm.prototype.setDanger = function (level, wind, rain, surge) {
    this.target.level = clamp(+level || 0, 0, 4);
    this.target.wind = clamp(+wind || 0, 0, 1);
    this.target.rain = clamp(+rain || 0, 0, 1);
    this.target.surge = clamp(+surge || 0, 0, 1);
  };

  // older form: mood 0..1
  Storm.prototype.mood = function (level, wind, rain) { this.setDanger(4 * (+level || 0), wind, rain, 0); };

  Storm.prototype.levelName = function (level) { return NAMES[stageOf(level)]; };
  Storm.prototype.stageOf = stageOf;

  // on phones, the big moments buzz too (only with the sound on, and only live, not when rendering)
  var BUZZ = { order: [180, 90, 180, 90, 180], evacuate: [400, 160, 400, 160, 400], landfall: [420, 140, 220], surge: [260, 110, 260] };

  Storm.prototype.cue = function (kind, at) {
    if (!this.ctx || (this.muted && !this.offline)) return;
    if (!this.offline && at === undefined && BUZZ[kind] && typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(BUZZ[kind]); } catch (e) { /* not allowed here (an embedding frame, say) */ }
    }
    var t = at === undefined ? this.ctx.currentTime + 0.03 : at;
    if (kind === 'evacuate') {                    // your area is under an evacuation order: hit, then the siren
      this.braam(t, 0.18);
      this.siren(t + 0.35, 2, 0.16);
    } else if (kind === 'ready') {                // just outside the zone: the two-tone call, twice
      this.alarm(t, 2, 0.06);
    } else if (kind === 'order') {                // evacuation order: low hit, then the two-tone call
      this.braam(t, 0.2);
      this.alarm(t + 0.5, 3, 0.07);
    } else if (kind === 'warn') {                 // tropical-storm winds reach the coast, bridges close
      this.noiseHit('pink', t, 2.2, [['bandpass', 500, 1300, 3]], 0.2, 0.5);   // a gust rushing past
      this.tone('triangle', 392, 0, t + 0.15, 0.16, 0.08, 1800);
      this.tone('triangle', 330, 0, t + 0.36, 0.22, 0.08, 1800);
    } else if (kind === 'landfall') {             // the eye comes ashore
      this.tone('sine', 72, 26, t, 1.6, 0.5, 0, this.master);
      this.noiseHit('brown', t, 4.5, [['lowpass', 480, 60, 0.7]], 0.55, 0.05);
      this.noiseHit('pink', t + 0.1, 3.0, [['bandpass', 420, 1100, 2]], 0.3, 0.6);
      this.thunder(t + 0.25, 0.35, true);
    } else if (kind === 'surge') {                // the sea rushes in
      this.noiseHit('brown', t, 3.4, [['lowpass', 90, 460, 0.8]], 0.5, 1.4);
      this.noiseHit('white', t + 1.0, 2.4, [['bandpass', 700, 300, 0.6]], 0.08, 0.9);
      this.tone('sawtooth', 110, 55, t + 0.2, 2.6, 0.06, 400);
    } else if (kind === 'quantum') {              // results in: two short neutral blips
      this.tone('sine', 1320, 0, t, 0.05, 0.025);
      this.tone('sine', 1320, 0, t + 0.09, 0.05, 0.02);
    } else if (kind === 'route' || kind === 'hope') {   // your plan is ready: one plain confirmation
      this.tone('sine', 660, 0, t, 0.12, 0.04);
      this.tone('sine', 660, 0, t + 0.15, 0.18, 0.03);
    } else if (kind === 'clear') {                // the storm is leaving: the wind dies away
      this.noiseHit('pink', t, 4.0, [['lowpass', 900, 160, 0.6]], 0.12, 0.3);
      this.tone('sine', 98, 82, t + 0.4, 3.2, 0.05, 0, this.master);
    } else if (kind === 'tick') {
      this.tone('sine', 1900, 0, t, 0.025, 0.015);
    }
  };

  window.FloodQSound = new Storm();
  window.FloodQSound.Storm = Storm;
})();

// ===============================================================================================
// 3. fx: map drawing (land and flood layers, the storm, moving dots along a route)
// ===============================================================================================
// FloodQ Florida: map drawing machinery.
//   FQ.FieldLayer   tiles painted pixel by pixel from model grids (the land, the evacuation zone)
//   FQ.CanvasLayer  one full-map canvas, redrawn on every move or animation frame (storm, routes)
//   FQ.stormSprite  a procedural hurricane cloud image
//   FQ.radarSprite  the same storm's rain bands, coloured like a weather-radar scale
//   FQ.Flow         particles moving along routes (the direction to drive)
// Classic script, ASCII only, no import/export: loads the same way from file:// and on Qollab.
(function () {
  'use strict';
  var FQ = window.FQ = window.FQ || {};

  FQ.smooth = function (e0, e1, x) {
    var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  FQ.mix = function (a, b, t) { return a + (b - a) * t; };

  // ---------------------------------------------------------------------------
  // FieldLayer: shader(lat, lon, data, offset) writes RGBA for one pixel and returns true if
  // it drew anything. Tiles outside the data box are skipped.
  // ---------------------------------------------------------------------------
  FQ.makeFieldLayer = function (L) {
    return L.GridLayer.extend({
      options: { tileSize: 256, updateWhenZooming: false, updateWhenIdle: true, keepBuffer: 1, bounds: null },
      initialize: function (shader, options) {
        this._shader = shader;
        L.setOptions(this, options);
      },
      setShader: function (fn) { this._shader = fn; this.refresh(); },
      createTile: function (coords) {
        var c = document.createElement('canvas');
        c.width = c.height = 256;
        this._paint(c, coords);
        return c;
      },
      refresh: function () {
        if (!this._map) return;
        for (var key in this._tiles) {
          var t = this._tiles[key];
          if (t.current && t.el) this._paint(t.el, t.coords);
        }
      },
      _paint: function (canvas, coords) {
        var ctx = canvas.getContext('2d');
        var n = Math.pow(2, coords.z);
        var b = this.options.box;     // [latMin, lonMin, latMax, lonMax]
        var lon0 = coords.x / n * 360 - 180;
        var lon1 = (coords.x + 1) / n * 360 - 180;
        var latTop = 180 / Math.PI * Math.atan(Math.sinh(Math.PI - 2 * Math.PI * coords.y / n));
        var latBot = 180 / Math.PI * Math.atan(Math.sinh(Math.PI - 2 * Math.PI * (coords.y + 1) / n));
        if (b && (lon1 < b[1] || lon0 > b[3] || latTop < b[0] || latBot > b[2])) {
          ctx.clearRect(0, 0, 256, 256);
          return;
        }
        var img = ctx.createImageData(256, 256);
        var d = img.data;
        var lons = this._lons || (this._lons = new Float64Array(256));
        var lats = this._lats || (this._lats = new Float64Array(256));
        for (var x = 0; x < 256; x++) lons[x] = (coords.x + (x + 0.5) / 256) / n * 360 - 180;
        for (var y = 0; y < 256; y++) {
          var yy = Math.PI - 2 * Math.PI * (coords.y + (y + 0.5) / 256) / n;
          lats[y] = 180 / Math.PI * Math.atan(Math.sinh(yy));
        }
        var shade = this._shader;
        var any = false;
        for (var j = 0; j < 256; j++) {
          var la = lats[j];
          var row = j * 1024;
          for (var i = 0; i < 256; i++) {
            if (shade(la, lons[i], d, row + i * 4, i, j)) any = true;
          }
        }
        if (any) ctx.putImageData(img, 0, 0);
        else ctx.clearRect(0, 0, 256, 256);
      },
    });
  };

  // ---------------------------------------------------------------------------
  // CanvasLayer: a padded full-map canvas. draw(ctx, view) is called with helpers to project
  // lat/lon into canvas pixels. During a pan the canvas moves with the map; it is redrawn at
  // the end of every move and on every animation frame the app requests.
  // ---------------------------------------------------------------------------
  FQ.makeCanvasLayer = function (L) {
    return L.Layer.extend({
      options: { pane: 'overlayPane', pad: 0.2 },
      initialize: function (draw, options) {
        this._draw = draw;
        L.setOptions(this, options);
      },
      onAdd: function (map) {
        this._map = map;
        var c = this._canvas = L.DomUtil.create('canvas', 'fq-scene leaflet-zoom-animated');
        c.style.position = 'absolute';
        c.style.pointerEvents = 'none';
        map.getPane(this.options.pane).appendChild(c);
        map.on('moveend', this._reset, this);
        map.on('resize', this._resize, this);
        map.on('zoomanim', this._animateZoom, this);
        this._resize();
      },
      onRemove: function (map) {
        L.DomUtil.remove(this._canvas);
        map.off('moveend', this._reset, this);
        map.off('resize', this._resize, this);
        map.off('zoomanim', this._animateZoom, this);
      },
      _resize: function () {
        var s = this._map.getSize();
        var p = this.options.pad;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        this._w = Math.round(s.x * (1 + 2 * p));
        this._h = Math.round(s.y * (1 + 2 * p));
        this._dpr = dpr;
        this._canvas.width = this._w * dpr;
        this._canvas.height = this._h * dpr;
        this._canvas.style.width = this._w + 'px';
        this._canvas.style.height = this._h + 'px';
        this._reset();
      },
      _reset: function () {
        var map = this._map;
        var s = map.getSize();
        var p = this.options.pad;
        var tl = map.containerPointToLayerPoint([-s.x * p, -s.y * p]);
        this._origin = tl;
        L.DomUtil.setPosition(this._canvas, tl);
        this._zoom = map.getZoom();
        this._pixelOrigin = map.getPixelOrigin();
        this.redraw();
      },
      _animateZoom: function (e) {
        var map = this._map;
        var scale = map.getZoomScale(e.zoom);
        var s = map.getSize();
        var p = this.options.pad;
        var offset = map._latLngToNewLayerPoint(map.containerPointToLatLng([-s.x * p, -s.y * p]), e.zoom, e.center);
        L.DomUtil.setTransform(this._canvas, offset, scale);
      },
      // canvas pixel of an absolute projected point (map.project at this._zoom)
      view: function () {
        var o = this._origin;
        var po = this._pixelOrigin;
        var map = this._map;
        var z = this._zoom;
        var ox = po.x + o.x;
        var oy = po.y + o.y;
        return {
          map: map, zoom: z, w: this._w, h: this._h, ox: ox, oy: oy,
          px: function (lat, lon) {
            var p = map.project([lat, lon], z);
            return [p.x - ox, p.y - oy];
          },
          kmToPx: function (km, lat) {
            return km * 1000 / (156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, z));
          },
        };
      },
      redraw: function () {
        if (!this._map || this._map._animatingZoom) return;
        var ctx = this._canvas.getContext('2d');
        ctx.setTransform(this._dpr, 0, 0, this._dpr, 0, 0);
        ctx.clearRect(0, 0, this._w, this._h);
        this._draw(ctx, this.view());
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Procedural hurricane: spiral cloud bands with fractal noise, a clear eye and a bright eyewall
  // ---------------------------------------------------------------------------
  function hash(x, y) {
    var h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
  }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y);
    var xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) {
    var s = 0, amp = 0.5;
    for (var o = 0; o < 5; o++) {
      s += amp * vnoise(x, y);
      x *= 2.03; y *= 2.03; amp *= 0.5;
    }
    return s;
  }
  FQ.stormSprite = function (size) {
    var S = size || 512;
    var c = document.createElement('canvas');
    c.width = c.height = S;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(S, S);
    var d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r >= 1) continue;
        var th = Math.atan2(dy, dx);
        // logarithmic spiral arms; screen y points down, so this winds counter-clockwise on the map
        var arm = 0.5 + 0.5 * Math.sin(3 * th - 7.5 * Math.log(r + 0.04));
        var n = fbm(x / S * 7 + 3, y / S * 7 + 1);
        var core = 1 - FQ.smooth(0.0, 0.42, r);
        var dens = (0.35 + 0.65 * arm) * (0.55 + 0.75 * n) * (0.35 + 0.9 * core);
        dens *= FQ.smooth(0.05, 0.11, r);               // the eye
        dens += 0.55 * Math.exp(-Math.pow((r - 0.12) / 0.04, 2)) * (0.7 + 0.3 * n);   // eyewall
        dens *= 1 - FQ.smooth(0.55, 1.0, r);           // soft edge
        dens = Math.max(0, Math.min(1, dens));
        var o = (y * S + x) * 4;
        var cool = 1 - core;
        d[o] = 230 - 40 * cool;
        d[o + 1] = 238 - 20 * cool;
        d[o + 2] = 255;
        d[o + 3] = Math.round(235 * dens);
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  };

  // ---------------------------------------------------------------------------
  // Radar-style rain field of a hurricane: the same spiral bands, coloured like a weather-radar
  // reflectivity scale (green, yellow, orange, red, and magenta in the eyewall). Illustrative:
  // the model has no radar data; the bands only show where a hurricane's heaviest rain sits.
  // ---------------------------------------------------------------------------
  var RADAR = [[0.16, 40, 190, 110, 0], [0.26, 40, 190, 110, 120], [0.42, 235, 220, 70, 165],
               [0.58, 255, 150, 45, 185], [0.74, 240, 60, 70, 200], [0.9, 225, 70, 205, 215]];
  FQ.radarSprite = function (size) {
    var S = size || 512;
    var c = document.createElement('canvas');
    c.width = c.height = S;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(S, S);
    var d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2);
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r >= 1) continue;
        var th = Math.atan2(dy, dx);
        var arm = 0.5 + 0.5 * Math.sin(3 * th - 7.5 * Math.log(r + 0.04) + 0.6);
        var n = fbm(x / S * 9 + 11, y / S * 9 + 5);
        var env = Math.exp(-Math.max(0, r - 0.16) / 0.33);
        var v = Math.pow(arm, 1.6) * (0.45 + 0.85 * n) * env * 0.95;
        v += 0.95 * Math.exp(-Math.pow((r - 0.13) / 0.035, 2)) * (0.75 + 0.35 * n);   // eyewall
        v *= FQ.smooth(0.06, 0.1, r);                                                  // the eye
        v *= 1 - FQ.smooth(0.62, 1.0, r);
        if (v < RADAR[0][0]) continue;
        var a = RADAR[0], b = RADAR[RADAR.length - 1];
        for (var k = 0; k < RADAR.length - 1; k++) {
          if (v >= RADAR[k][0] && v <= RADAR[k + 1][0]) { a = RADAR[k]; b = RADAR[k + 1]; break; }
        }
        var t = b[0] === a[0] ? 1 : Math.max(0, Math.min(1, (v - a[0]) / (b[0] - a[0])));
        var o = (y * S + x) * 4;
        d[o] = a[1] + (b[1] - a[1]) * t;
        d[o + 1] = a[2] + (b[2] - a[2]) * t;
        d[o + 2] = a[3] + (b[3] - a[3]) * t;
        d[o + 3] = a[4] + (b[4] - a[4]) * t;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  };

  // ---------------------------------------------------------------------------
  // Flow: particles along routes. routes: [{pts: [[lat, lon], ...], load: [v/c per vertex step],
  // n: particle count, speed: relative speed, color: optional}]
  // ---------------------------------------------------------------------------
  FQ.Flow = function () {
    this.routes = [];
    this.parts = [];
    this.zoom = null;
  };
  FQ.Flow.prototype.set = function (routes) {
    this.routes = routes || [];
    this.zoom = null;
    this.parts = [];
    for (var r = 0; r < this.routes.length; r++) {
      var R = this.routes[r];
      for (var k = 0; k < R.n; k++) this.parts.push({ r: r, s: Math.random(), v: 0.75 + 0.5 * Math.random() });
    }
  };
  FQ.Flow.prototype._project = function (view) {
    this.zoom = view.zoom;
    for (var r = 0; r < this.routes.length; r++) {
      var R = this.routes[r];
      var xs = new Float64Array(R.pts.length), ys = new Float64Array(R.pts.length), cum = new Float64Array(R.pts.length);
      for (var i = 0; i < R.pts.length; i++) {
        var p = view.map.project(R.pts[i], view.zoom);
        xs[i] = p.x; ys[i] = p.y;
        if (i) cum[i] = cum[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
      }
      R._x = xs; R._y = ys; R._c = cum; R._len = cum[cum.length - 1] || 1;
    }
  };
  FQ.Flow.prototype._at = function (R, s) {
    var c = R._c, lo = 0, hi = c.length - 1, d = s * R._len;
    while (hi - lo > 1) {
      var m = (lo + hi) >> 1;
      if (c[m] <= d) lo = m; else hi = m;
    }
    var seg = c[hi] - c[lo] || 1;
    var t = (d - c[lo]) / seg;
    return { x: R._x[lo] + (R._x[hi] - R._x[lo]) * t, y: R._y[lo] + (R._y[hi] - R._y[lo]) * t, i: lo };
  };
  FQ.Flow.prototype.draw = function (ctx, view, dt, alpha, colorOf) {
    if (!this.routes.length || alpha <= 0) return;
    if (this.zoom !== view.zoom) this._project(view);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var pxPerSec = (34 + 6 * Math.max(0, view.zoom - 6)) * (FQ.reducedMotion() ? 0.3 : 1);
    for (var k = 0; k < this.parts.length; k++) {
      var P = this.parts[k];
      var R = this.routes[P.r];
      var a0 = this._at(R, P.s);
      var load = R.load ? R.load[Math.min(a0.i, R.load.length - 1)] : 0;
      var slow = 1 / (1 + 2.2 * Math.max(0, load - 0.6));
      P.s += dt * pxPerSec * P.v * slow * (R.speed || 1) / R._len;
      if (P.s >= 1) P.s -= 1;
      // head and tail both from the new position, so a particle that wraps
      // back to the start never draws a chord across the map
      var a = this._at(R, P.s);
      var b = this._at(R, Math.max(0, P.s - 9 / R._len));
      var x = a.x - view.ox, y = a.y - view.oy;
      ctx.strokeStyle = colorOf(load, alpha * 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x - view.ox, b.y - view.oy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = colorOf(load, alpha);
      ctx.fillRect(x - 1.3, y - 1.3, 2.6, 2.6);
    }
    ctx.restore();
  };

  FQ.reducedMotion = function () {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };
})();

// ===============================================================================================
// 4. planner: time-dependent shortest paths with road closures and the leave-by time
// ===============================================================================================
// FloodQ Florida: your own way out. Time-dependent shortest paths on the statewide highway
// graph, with the storm's road closures and the statewide plan's traffic, plus the latest
// time you can leave and still be through every road before it closes or tropical-storm
// winds reach it (Florida's clearance-time rule).
// Classic script, ASCII only, no import/export: loads the same way from file:// and on Qollab.
(function () {
  'use strict';
  var FQ = window.FQ = window.FQ || {};
  var KM_LAT = 111.32;

  function km(lat1, lon1, lat2, lon2) {
    var x = (lon2 - lon1) * KM_LAT * Math.cos((lat1 + lat2) * Math.PI / 360);
    var y = (lat2 - lat1) * KM_LAT;
    return Math.sqrt(x * x + y * y);
  }
  FQ.km = km;

  function Heap() { this.a = []; }
  Heap.prototype.push = function (k, v) {
    var a = this.a;
    a.push([k, v]);
    var i = a.length - 1;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      var t = a[p]; a[p] = a[i]; a[i] = t; i = p;
    }
  };
  Heap.prototype.pop = function () {
    var a = this.a;
    var top = a[0];
    var last = a.pop();
    if (a.length) {
      a[0] = last;
      var i = 0;
      for (;;) {
        var l = 2 * i + 1, r = l + 1, m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        var t = a[m]; a[m] = a[i]; a[i] = t; i = m;
      }
    }
    return top;
  };

  // graph: info.roads = {nodes: [[lat, lon]], edges: [[u, v, cls, ref, km, kmh, cap, bridge, flatGeom]]}
  function Planner(roads) {
    this.nodes = roads.nodes;
    this.edges = roads.edges.map(function (e, i) {
      var g = [];
      for (var k = 0; k < e[8].length; k += 2) g.push([e[8][k], e[8][k + 1]]);
      return { i: i, u: e[0], v: e[1], cls: e[2], ref: e[3], km: e[4], kmh: e[5], cap: e[6], bridge: !!e[7], geom: g };
    });
    this.t0 = new Float64Array(this.edges.length);
    this.adj = this.nodes.map(function () { return []; });
    for (var i = 0; i < this.edges.length; i++) {
      var e = this.edges[i];
      this.t0[i] = e.km / e.kmh;
      this.adj[e.u].push([e.v, i]);
      this.adj[e.v].push([e.u, i]);
    }
  }

  Planner.prototype.nearestNode = function (lat, lon) {
    var best = -1, bd = Infinity;
    for (var i = 0; i < this.nodes.length; i++) {
      var d = km(lat, lon, this.nodes[i][0], this.nodes[i][1]);
      if (d < bd) { bd = d; best = i; }
    }
    return { node: best, km: bd };
  };

  // nodes within r km of a point, nearest first (at least the nearest node)
  Planner.prototype.nearNodes = function (lat, lon, r) {
    var out = [];
    for (var i = 0; i < this.nodes.length; i++) {
      var d = km(lat, lon, this.nodes[i][0], this.nodes[i][1]);
      if (d <= r) out.push({ node: i, km: d });
    }
    if (!out.length) out.push(this.nearestNode(lat, lon));
    out.sort(function (a, b) { return a.km - b.km; });
    return out;
  };

  // Earliest arrival. src is a node (leaving at tStart) or a list of entry points {node, t}, so
  // a trip can join whichever nearby highway gets it out first. A road can be entered only
  // before openUntil[edge]; mult[edge] scales its time (congestion). origin[v] is the entry
  // point the best path to v starts from.
  Planner.prototype.search = function (src, tStart, openUntil, mult) {
    var n = this.nodes.length;
    var dist = new Float64Array(n).fill(Infinity);
    var prev = new Int32Array(n).fill(-1);
    var origin = new Int32Array(n).fill(-1);
    var h = new Heap();
    var starts = Array.isArray(src) ? src : [{ node: src, t: tStart }];
    for (var s = 0; s < starts.length; s++) {
      var st = starts[s];
      if (st.t < dist[st.node]) {
        dist[st.node] = st.t;
        origin[st.node] = st.node;
        prev[st.node] = -1;
        h.push(st.t, st.node);
      }
    }
    while (h.a.length) {
      var top = h.pop();
      var t = top[0], u = top[1];
      if (t > dist[u]) continue;
      var adj = this.adj[u];
      for (var k = 0; k < adj.length; k++) {
        var v = adj[k][0], ei = adj[k][1];
        if (openUntil && t >= openUntil[ei]) continue;
        var tv = t + this.t0[ei] * (mult ? mult[ei] : 1);
        if (tv < dist[v]) {
          dist[v] = tv;
          prev[v] = ei;
          origin[v] = origin[u];
          h.push(tv, v);
        }
      }
    }
    return { dist: dist, prev: prev, origin: origin };
  };

  // edges of the best path to dst, from its entry point (search.origin[dst]); null if unreachable
  Planner.prototype.path = function (res, dst) {
    if (!isFinite(res.dist[dst])) return null;
    var out = [], v = dst;
    while (res.prev[v] >= 0) {
      var ei = res.prev[v];
      out.push(ei);
      var e = this.edges[ei];
      v = e.u === v ? e.v : e.u;
    }
    return out.reverse();
  };

  // oriented polyline of a path from src
  Planner.prototype.geometry = function (src, edges) {
    var pts = [this.nodes[src]];
    var v = src;
    for (var k = 0; k < edges.length; k++) {
      var e = this.edges[edges[k]];
      var g = e.geom;
      var forward = e.u === v;
      for (var j = 1; j < g.length; j++) pts.push(forward ? g[j] : g[g.length - 1 - j]);
      v = forward ? e.v : e.u;
    }
    return pts;
  };

  // highway legs: [{ref, km, dir}]
  Planner.prototype.legs = function (src, edges) {
    var legs = [];
    var v = src;
    for (var k = 0; k < edges.length; k++) {
      var e = this.edges[edges[k]];
      var a = this.nodes[v];
      var w = e.u === v ? e.v : e.u;
      var b = this.nodes[w];
      var ref = (e.ref === 'connector' || e.ref === 'link') ? null : e.ref;
      var last = legs[legs.length - 1];
      if (last && (ref === null || last.ref === ref)) {
        last.km += e.km;
        last.to = b;
      } else {
        legs.push({ ref: ref || 'local roads', km: e.km, from: a, to: b });
      }
      v = w;
    }
    var kept = legs.filter(function (L) { return L.km >= 1 || legs.length === 1; });
    var merged = [];
    kept.forEach(function (L) {
      var last = merged[merged.length - 1];
      if (last && last.ref === L.ref) { last.km += L.km; last.to = L.to; } else merged.push(L);
    });
    return merged.map(function (L) {
      var ang = Math.atan2((L.to[1] - L.from[1]) * Math.cos(L.from[0] * Math.PI / 180), L.to[0] - L.from[0]) * 180 / Math.PI;
      var dir = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(((ang + 360) % 360 + 22.5) / 45) % 8];
      return { ref: L.ref, km: L.km, dir: dir };
    });
  };

  // travel time with congestion and the latest departure that clears every road in time
  Planner.prototype.timing = function (edges, openUntil, mult) {
    var t = 0, latest = Infinity;
    for (var k = 0; k < edges.length; k++) {
      var ei = edges[k];
      if (openUntil) latest = Math.min(latest, openUntil[ei] - t);
      t += this.t0[ei] * (mult ? mult[ei] : 1);
    }
    var kmSum = 0;
    for (var j = 0; j < edges.length; j++) kmSum += this.edges[edges[j]].km;
    return { hours: t, km: kmSum, latest: latest };
  };

  FQ.Planner = Planner;
})();

// ===============================================================================================
// 5. routes: the route-selection QAOA, emulated exactly to train its angles
// ===============================================================================================
// FloodQ Florida: pick K of N candidate routes with a constraint-preserving QAOA.
//
// For the place a person types in, the page finds up to N candidate routes to safe destinations
// (app.js, classical shortest paths). It then has to pick the K it shows. Each should be fast
// and safe, and together they should not lean on the same roads, so that one jammed or closed
// highway cannot take out every option. That is a quadratic problem with a cardinality rule:
//
//     C(x) = sum_i c_i x_i + sum_{i<j} J_ij x_i x_j,   sum_i x_i = K
//
// One qubit per candidate (x_i = 1: route i is shown). The circuit starts in the Dicke state
// (every way to pick exactly K routes, equally likely), applies exp(-i gamma C) and an XY ring
// mixer that swaps a chosen and an unchosen route, so every ideal shot picks exactly K routes.
// floodq/portfolio.py builds the same circuit in Qiskit; this file emulates it exactly in the
// C(N, K)-dimensional subspace, trains the angles (CVaR, then a Gibbs sharpening step, as
// floodq/qaoa.py does for the statewide plan) and samples it when there is no Python (the
// double-click page) or no job to spare (IonQ's one job per run).
// Classic script, ASCII only, no import/export: loads the same way from file:// and on Qollab.
(function () {
  'use strict';
  var FQ = window.FQ = window.FQ || {};

  function popcount(x) { var c = 0; while (x) { x &= x - 1; c++; } return c; }

  function rng32(seed) {
    var s = seed | 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  FQ.rng32 = rng32;

  function linspace(a, b, n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(n === 1 ? a : a + (b - a) * i / (n - 1));
    return out;
  }

  // Nelder-Mead with scipy's default coefficients and initial simplex (5% steps)
  function nelderMead(f, x0, opt) {
    opt = opt || {};
    var n = x0.length, maxiter = opt.maxiter || 200 * n, xatol = opt.xatol || 1e-4, fatol = opt.fatol || 1e-4;
    var sim = [x0.slice()];
    for (var k = 0; k < n; k++) {
      var y = x0.slice();
      y[k] = y[k] !== 0 ? 1.05 * y[k] : 0.00025;
      sim.push(y);
    }
    var fs = sim.map(f), nfev = n + 1, it = 0;
    var order = function () {
      var idx = fs.map(function (v, i) { return i; }).sort(function (a, b) { return fs[a] - fs[b]; });
      sim = idx.map(function (i) { return sim[i]; });
      fs = idx.map(function (i) { return fs[i]; });
    };
    order();
    while (it < maxiter) {
      var xs = 0, fsd = 0;
      for (var i = 1; i <= n; i++) {
        fsd = Math.max(fsd, Math.abs(fs[i] - fs[0]));
        for (var j = 0; j < n; j++) xs = Math.max(xs, Math.abs(sim[i][j] - sim[0][j]));
      }
      if (xs <= xatol && fsd <= fatol) break;
      var c = new Array(n).fill(0);
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) c[b] += sim[a][b] / n;
      var lin = function (t) { return c.map(function (v, q) { return v + t * (sim[n][q] - v); }); };
      var xr = lin(-1), fr = f(xr); nfev++;
      if (fr < fs[0]) {
        var xe = lin(-2), fe = f(xe); nfev++;
        if (fe < fr) { sim[n] = xe; fs[n] = fe; } else { sim[n] = xr; fs[n] = fr; }
      } else if (fr < fs[n - 1]) {
        sim[n] = xr; fs[n] = fr;
      } else {
        var shrink = false;
        if (fr < fs[n]) {
          var xc = lin(-0.5), fc = f(xc); nfev++;
          if (fc <= fr) { sim[n] = xc; fs[n] = fc; } else shrink = true;
        } else {
          var xcc = lin(0.5), fcc = f(xcc); nfev++;
          if (fcc < fs[n]) { sim[n] = xcc; fs[n] = fcc; } else shrink = true;
        }
        if (shrink) {
          for (var s = 1; s <= n; s++) {
            sim[s] = sim[s].map(function (v, q) { return sim[0][q] + 0.5 * (v - sim[0][q]); });
            fs[s] = f(sim[s]); nfev++;
          }
        }
      }
      order();
      it++;
    }
    return { x: sim[0], fun: fs[0], nfev: nfev, nit: it };
  }
  FQ.nelderMead = nelderMead;

  // ---------------------------------------------------------------------------
  // The problem and its exact emulation in the subspace of "exactly K routes"
  // lin: n numbers; quad: [[i, j, v], ...] with i < j
  // ---------------------------------------------------------------------------
  function Selection(n, k, lin, quad) {
    this.n = n;
    this.k = k;
    this.lin = lin.slice();
    this.quad = quad.filter(function (q) { return Math.abs(q[2]) > 0; }).map(function (q) {
      return q[0] < q[1] ? [q[0], q[1], q[2]] : [q[1], q[0], q[2]];
    });
    var states = [];
    for (var m = 0; m < (1 << n); m++) if (popcount(m) === k) states.push(m);
    this.states = states;
    this.M = states.length;
    this.index = new Int32Array(1 << n).fill(-1);
    for (var s = 0; s < states.length; s++) this.index[states[s]] = s;
    this.costs = new Float64Array(this.M);
    var cmin = Infinity, cmax = -Infinity, best = 0;
    for (var t = 0; t < this.M; t++) {
      var c = this.cost(states[t]);
      this.costs[t] = c;
      if (c < cmin - 1e-12) { cmin = c; best = t; }
      if (c > cmax) cmax = c;
    }
    this.cmin = cmin;
    this.cmax = cmax;
    this.span = Math.max(cmax - cmin, 1e-9);
    this.norm = new Float64Array(this.M);
    for (var u = 0; u < this.M; u++) this.norm[u] = (this.costs[u] - cmin) / this.span;
    this.optimum = best;
    // the XY ring mixer: neighbouring qubits (0,1), (1,2), ..., (n-1,0), applied in this order
    // (floodq/qaoa.py ring_pairs). Each one rotates every pair of states that differ by swapping
    // those two bits.
    this.ring = [];
    var pairs = [];
    if (n === 2) pairs.push([0, 1]);
    else if (n > 2) for (var r = 0; r < n; r++) pairs.push([r, (r + 1) % n]);
    for (var p = 0; p < pairs.length; p++) {
      var A = pairs[p][0], B = pairs[p][1], us = [], vs = [];
      for (var w = 0; w < this.M; w++) {
        var st = states[w];
        if (((st >> A) & 1) === 1 && ((st >> B) & 1) === 0) {
          us.push(w);
          vs.push(this.index[st ^ (1 << A) ^ (1 << B)]);
        }
      }
      this.ring.push({ a: A, b: B, u: Int32Array.from(us), v: Int32Array.from(vs) });
    }
    var norm = this.norm;
    this.order = [];
    for (var o = 0; o < this.M; o++) this.order.push(o);
    this.order.sort(function (a, b) { return norm[a] - norm[b]; });
  }

  Selection.prototype.cost = function (mask) {
    var c = 0;
    for (var i = 0; i < this.n; i++) if ((mask >> i) & 1) c += this.lin[i];
    for (var q = 0; q < this.quad.length; q++) {
      var e = this.quad[q];
      if (((mask >> e[0]) & 1) && ((mask >> e[1]) & 1)) c += e[2];
    }
    return c;
  };

  // amplitudes after the Dicke state and p layers (cost phase, then the ring mixer)
  Selection.prototype.state = function (gammas, betas) {
    var M = this.M, re = new Float64Array(M), im = new Float64Array(M);
    var a0 = 1 / Math.sqrt(M);
    for (var i = 0; i < M; i++) re[i] = a0;
    for (var l = 0; l < gammas.length; l++) {
      var g = gammas[l];
      for (var j = 0; j < M; j++) {
        var ph = -g * this.norm[j], cs = Math.cos(ph), sn = Math.sin(ph);
        var r = re[j], m = im[j];
        re[j] = r * cs - m * sn;
        im[j] = r * sn + m * cs;
      }
      var c = Math.cos(betas[l]), s = Math.sin(betas[l]);
      for (var p = 0; p < this.ring.length; p++) {
        var R = this.ring[p];
        for (var k = 0; k < R.u.length; k++) {
          var u = R.u[k], v = R.v[k];
          var ur = re[u], ui = im[u], vr = re[v], vi = im[v];
          // [c, -i s; -i s, c]
          re[u] = c * ur + s * vi;
          im[u] = c * ui - s * vr;
          re[v] = c * vr + s * ui;
          im[v] = c * vi - s * ur;
        }
      }
    }
    return { re: re, im: im };
  };

  Selection.prototype.probs = function (gammas, betas) {
    var st = this.state(gammas, betas), out = new Float64Array(this.M);
    for (var i = 0; i < this.M; i++) out[i] = st.re[i] * st.re[i] + st.im[i] * st.im[i];
    return out;
  };

  // CVaR_alpha (Barkoutsos et al. 2020): mean normalised cost of the best alpha of the mass
  Selection.prototype.cvar = function (theta, alpha) {
    var p = theta.length / 2, pr = this.probs(theta.slice(0, p), theta.slice(p));
    if (alpha >= 1) {
      var e = 0;
      for (var i = 0; i < this.M; i++) e += pr[i] * this.norm[i];
      return e;
    }
    var acc = 0, tot = 0;
    for (var k = 0; k < this.order.length && acc < alpha - 1e-15; k++) {
      var idx = this.order[k], w = Math.min(pr[idx], alpha - acc);
      tot += w * this.norm[idx];
      acc += w;
    }
    return tot / alpha;
  };

  // Gibbs objective -log <exp(-eta cost)> (Li et al. 2020)
  Selection.prototype.gibbs = function (theta, eta) {
    var p = theta.length / 2, pr = this.probs(theta.slice(0, p), theta.slice(p)), s = 0;
    for (var i = 0; i < this.M; i++) s += pr[i] * Math.exp(-eta * this.norm[i]);
    return -Math.log(s + 1e-300);
  };

  // p = 1 grid search, then layer-wise INTERP starts with Nelder-Mead on CVaR, then a Gibbs
  // sharpening step kept only if CVaR does not get worse (as floodq/qaoa.py SubspaceQAOA.train).
  // Nothing here looks at which choice is optimal; that is only used to report how often it comes up.
  Selection.prototype.train = function (layers, alpha, seed) {
    layers = layers || 2;
    alpha = alpha === undefined ? 0.1 : alpha;
    var self = this, evals = 0;
    var obj = function (th) { evals++; return self.cvar(th, alpha); };
    var gs = linspace(0.05, 3 * Math.PI, 30), bs = linspace(0.05, Math.PI - 0.05, 16);
    var best = Infinity, theta = null;
    for (var a = 0; a < gs.length; a++) {
      for (var b = 0; b < bs.length; b++) {
        var v = obj([gs[a], bs[b]]);
        if (v < best) { best = v; theta = [gs[a], bs[b]]; }
      }
    }
    var rnd = rng32(seed || 7);
    var normal = function () {
      var u = Math.max(rnd(), 1e-12), w = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w);
    };
    for (var p = 1; p <= layers; p++) {
      if (p > 1) {
        var gOld = theta.slice(0, p - 1), bOld = theta.slice(p - 1);
        var interp = function (arr) {
          if (arr.length === 1) return linspace(arr[0], arr[0], p);
          return linspace(0, 1, p).map(function (x) {
            var pos = x * (arr.length - 1), i0 = Math.min(Math.floor(pos), arr.length - 2);
            return arr[i0] + (arr[i0 + 1] - arr[i0]) * (pos - i0);
          });
        };
        theta = interp(gOld).concat(interp(bOld));
      }
      var starts = [theta];
      if (p > 1) for (var r = 0; r < 2; r++) starts.push(theta.map(function (x) { return x + 0.15 * normal(); }));
      var bestRes = null;
      for (var st = 0; st < starts.length; st++) {
        var res = nelderMead(obj, starts[st], { maxiter: 250 * p, xatol: 1e-4, fatol: 1e-6 });
        if (!bestRes || res.fun < bestRes.fun) bestRes = res;
      }
      theta = bestRes.x;
    }
    var base = this.cvar(theta, alpha), sharpened = false;
    var g = nelderMead(function (th) { evals++; return self.gibbs(th, 20); }, theta, { maxiter: 400 * layers, xatol: 1e-4, fatol: 1e-8 });
    if (this.cvar(g.x, alpha) <= base + 1e-9 * Math.max(1, Math.abs(base))) { theta = g.x; sharpened = true; }
    var pr = this.probs(theta.slice(0, layers), theta.slice(layers));
    return { gammas: theta.slice(0, layers), betas: theta.slice(layers), probs: pr, p_opt: pr[this.optimum],
             evals: evals, sharpened: sharpened, cvar: this.cvar(theta, alpha) };
  };

  // shots drawn from the exact output (labelled as such on the page)
  Selection.prototype.sample = function (probs, shots, seed) {
    var rnd = rng32(seed || 11), cum = new Float64Array(this.M), acc = 0;
    for (var i = 0; i < this.M; i++) { acc += probs[i]; cum[i] = acc; }
    var counts = new Int32Array(this.M);
    for (var s = 0; s < shots; s++) {
      var x = rnd() * acc, lo = 0, hi = this.M - 1;
      while (lo < hi) {
        var mid = (lo + hi) >> 1;
        if (cum[mid] < x) lo = mid + 1; else hi = mid;
      }
      counts[lo]++;
    }
    return counts;
  };

  // the K routes with the lowest cost of their own, ignoring shared roads
  Selection.prototype.greedy = function () {
    var self = this;
    var idx = this.lin.map(function (v, i) { return i; }).sort(function (a, b) { return self.lin[a] - self.lin[b] || a - b; });
    var m = 0;
    for (var i = 0; i < this.k; i++) m |= 1 << idx[i];
    return m;
  };

  // The Ising fields of the cost, scaled as floodq/portfolio.py scales them (only which ones are
  // non-zero matters here: they decide which RZ and RZZ gates the circuit has)
  Selection.prototype.ising = function () {
    var h = new Float64Array(this.n), J = [];
    for (var i = 0; i < this.n; i++) h[i] -= this.lin[i] / 2;
    for (var q = 0; q < this.quad.length; q++) {
      var e = this.quad[q];
      h[e[0]] -= e[2] / 4;
      h[e[1]] -= e[2] / 4;
      J.push([e[0], e[1], e[2] / 4 / this.span]);
    }
    for (var k = 0; k < this.n; k++) h[k] /= this.span;
    return { h: h, J: J };
  };

  // The gate list of the Qiskit circuit (floodq/portfolio.py build_circuit), for its size on screen
  // when no Python is running: qubits, depth (with the final measurement) and gate counts.
  Selection.prototype.circuitStats = function (layers) {
    var n = this.n, k = this.k, gates = [];
    var add = function (name, qs) { gates.push([name, qs]); };
    var cry = function (c, t) { add('ry', [t]); add('cx', [c, t]); add('ry', [t]); add('cx', [c, t]); };
    var ccry = function (c1, c2, t) { cry(c2, t); add('cx', [c1, c2]); cry(c2, t); add('cx', [c1, c2]); cry(c1, t); };
    var kk = Math.min(k, n - k);
    var q = function (pos) { return pos - 1; };
    for (var p0 = n - kk + 1; p0 <= n; p0++) add('x', [q(p0)]);
    for (var m = n; m >= 2; m--) {
      var top = Math.min(kk, m - 1);
      if (top < 1) continue;
      add('cx', [q(m - 1), q(m)]); cry(q(m), q(m - 1)); add('cx', [q(m - 1), q(m)]);
      for (var l = 2; l <= top; l++) {
        add('cx', [q(m - l), q(m)]); ccry(q(m), q(m - l + 1), q(m - l)); add('cx', [q(m - l), q(m)]);
      }
    }
    if (kk !== k) for (var x = 0; x < n; x++) add('x', [x]);
    var is = this.ising();
    for (var L = 0; L < layers; L++) {
      for (var i = 0; i < n; i++) if (Math.abs(is.h[i]) > 1e-12) add('rz', [i]);
      for (var j = 0; j < is.J.length; j++) if (Math.abs(is.J[j][2]) > 1e-12) add('rzz', [is.J[j][0], is.J[j][1]]);
      for (var r = 0; r < this.ring.length; r++) {
        add('rxx', [this.ring[r].a, this.ring[r].b]);
        add('ryy', [this.ring[r].a, this.ring[r].b]);
      }
    }
    var level = new Int32Array(n), ops = {}, two = 0;
    gates.forEach(function (gt) {
      var lv = 0;
      gt[1].forEach(function (qq) { lv = Math.max(lv, level[qq]); });
      gt[1].forEach(function (qq) { level[qq] = lv + 1; });
      ops[gt[0]] = (ops[gt[0]] || 0) + 1;
      if (gt[1].length === 2) two++;
    });
    var depth = 0;
    for (var z = 0; z < n; z++) depth = Math.max(depth, level[z]);
    ops.measure = n;
    return { qubits: n, depth: depth + 1, two_qubit: two, ops: ops, gates: gates.length };
  };

  FQ.Selection = Selection;

  // n choose k
  FQ.choose = function (n, k) {
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  };
})();

// ===============================================================================================
// 6. app: the page (map, storm clock, alerts, risk panel, the five routes, map views)
// ===============================================================================================
// FloodQ Florida: the page. Enter a place (or click the map). FloodQ loads the hypothetical
// hurricane most relevant to it, shows the flood, wind and road risk there, sounds a simulated
// emergency alert when the area is told to leave, and gives up to five safe, feasible ways out:
// classical pathfinding finds every candidate, a QAOA circuit (up to 9 qubits) chooses the five.
//
// One app, two starters, because the two places it runs cannot share one:
//   * On Qollab, main.js imports this file and calls start() with the live Python engine
//     (floodq/engine.py running in the browser with Qiskit) and Qollab's `backend`.
//   * FloodQ-Florida.html (built by tools/build_offline.py) carries this file inline and calls
//     start() with saved runs of the same engine, because a browser will not run Python from
//     a double-clicked file. The circuits for your place are then sampled from their exact output
//     (routes.js emulates the route circuit exactly), and the page says so.
// start() refuses to run twice. Classic script, ASCII only, no import/export.
(function () {
  'use strict';

  var N_POOL = 9;            // candidate routes the circuit chooses from (one qubit each)
  var K_SHOW = 5;            // routes it picks; the page shows them
  var SHOTS = 1024;
  var ROUTE_LAYERS = 4;      // QAOA layers of the route circuit, trained with CVaR at ROUTE_ALPHA
  var ROUTE_ALPHA = 0.2;
  var PRIMARY_W = 1.0;       // extra weight on the safest single route: it is the one you take if every road stays open
  var OVERLAP_W = 1.2;       // cost of two routes sharing all their road (per pair)
  var CAP_MI = 120;          // realistic reach of an emergency evacuation, straight-line miles
  var CAP_KM = CAP_MI * 1.609;
  var FAR_KM = 300;          // looked at only when you must leave and nothing within CAP_MI works
  var MAX_HOURS = 8;         // longest drive considered
  var AREA_MI = 10;          // the alert area around a place
  var AREA_KM = AREA_MI * 1.609;
  var TRIAGE_H = 6;          // less time than this before the roads out close: local refuge first
  var HAZARD_SLACK_H = 3;    // a road that closes less than 3 h after you pass it is marked
  var RELEVANT_KM = 200;     // a storm is offered for a place only if its track passes this close
  var PLAY_RATE = 1.8;       // model hours per second while the storm plays
  var T_MIN = -48, T_MAX = 18;
  var ROUTE_COLORS = ['#2ee59d', '#4c9aff', '#ff9f43', '#b57bff', '#a7b1c2'];
  var ROUTE_NAMES = ['Recommended', 'Alternative A', 'Alternative B', 'Alternative C', 'Backup'];
  var APPROACHES = [
    { id: 'gulf', label: 'Gulf of Mexico', short: 'Gulf' },
    { id: 'atlantic', label: 'Atlantic coast', short: 'Atlantic' },
    { id: 'south', label: 'Straits of Florida', short: 'South' },
  ];

  function start(opts) {
    if (window.__floodqStarted) {
      console.log('FloodQ: start() was called a second time; ignoring it.');
      return;
    }
    window.__floodqStarted = true;
    var FQ = window.FQ;
    var L = opts.L;
    var engine = opts.engine;
    var BACKEND = opts.backend || null;
    var MODE = opts.mode || 'qollab';
    var SND = window.FloodQSound || null;
    var $ = function (id) { return document.getElementById(id); };
    var MINUS = '\u2212', MIDDOT = '\u00b7';

    var S = {
      info: null, prep: null, q: null, be: null, runsUsed: 0,
      preset: null, stageIdx: 1, busy: false, ready: false,
      prepId: 0, pyChain: Promise.resolve(), running: null,
      you: null, sel: 0, hover: null, choice: null,
      t: T_MIN, playing: false, events: [], fired: {}, lastFieldT: null, lastFieldMs: 0,
      alertAt: -1e9, sound: true, band: null, lastFrame: 0, liveHour: null,
    };

    // =========================================================================
    // small helpers
    // =========================================================================
    var fmtInt = function (x) { return Math.round(x).toLocaleString('en-US'); };
    var roundPeople = function (x) {
      if (x < 50) return x < 1 ? 0 : Math.round(x);
      var mag = Math.pow(10, Math.floor(Math.log10(x)) - 1);
      return Math.round(x / mag) * mag;
    };
    var pct = function (x, d) { return (100 * x).toFixed(d === undefined ? 0 : d) + '%'; };
    var fmtH = function (h) {
      var r = Math.round(h);
      return r === 0 ? 'H0' : 'H' + (r < 0 ? MINUS : '+') + Math.abs(r);
    };
    var esc = function (s) {
      return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    };
    var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
    var miles = function (km) { return Math.max(1, Math.round(km * 0.621)) + ' mi'; };
    var feet = function (m) { return Math.round(m * 3.281); };
    var dur = function (h) {
      var m = Math.max(1, Math.round(h * 60));
      if (m < 60) return m + ' min';
      var hh = Math.floor(m / 60), mm = Math.round((m % 60) / 5) * 5;
      if (mm === 60) { hh += 1; mm = 0; }
      return hh + ' h' + (mm ? ' ' + mm + ' min' : '');
    };
    function clockLabel(h) {
      if (!S.prep || h === null || h === undefined || !isFinite(h)) return '';
      var lc = S.prep.preset.landfall_clock;      // [weekday index, hour]
      var total = lc[0] * 24 + lc[1] + Math.round(h);
      var day = ((Math.floor(total / 24) % 7) + 7) % 7;
      var hr = ((total % 24) + 24) % 24;
      var ap = hr < 12 ? 'AM' : 'PM';
      var h12 = hr % 12 === 0 ? 12 : hr % 12;
      return S.info.weekdays[day] + ' ' + h12 + ' ' + ap;
    }
    function b64bytes(b64) {
      var s = atob(b64);
      var a = new Uint8Array(s.length);
      for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
      return a;
    }
    function inflateBytes(b64) {
      if (typeof DecompressionStream === 'undefined') {
        return Promise.reject(new Error('this browser is too old for FloodQ (no DecompressionStream)'));
      }
      var stream = new Blob([b64bytes(b64)]).stream().pipeThrough(new DecompressionStream('deflate'));
      return new Response(stream).arrayBuffer().then(function (buf) { return new Uint8Array(buf); });
    }
    function view(bytes, Type) {
      return new Type(bytes.buffer, bytes.byteOffset, bytes.byteLength / Type.BYTES_PER_ELEMENT);
    }
    function toast(msg, ms) {
      var el = $('toast');
      el.textContent = msg;
      el.hidden = false;
      clearTimeout(toast._t);
      toast._t = setTimeout(function () { el.hidden = true; }, ms || 3800);
    }
    function setLoading(title, text, frac) {
      var el = $('loading');
      el.classList.remove('hidden', 'error');
      $('loading-title').textContent = title;
      $('loading-text').textContent = text || '';
      if (frac !== undefined) $('loading-bar').style.width = Math.round(100 * frac) + '%';
    }
    function hideLoading() { $('loading').classList.add('hidden'); }
    function showError(err) {
      console.log(err && err.stack ? err.stack : String(err));
      var el = $('loading');
      el.classList.remove('hidden');
      el.classList.add('error');
      $('loading-title').textContent = 'The run stopped';
      $('loading-text').textContent = (err && err.message ? err.message : String(err)) +
        (MODE === 'offline' ? '' : ' Press Stop, then Run, to try again; the console has the details.');
      S.busy = false;
      syncFind();
    }
    function catLabel(c) { return c >= 1 ? 'Category ' + c : (c === 0 ? 'Tropical storm' : 'Depression'); }
    function catShort(c) { return c >= 1 ? 'Cat ' + c : (c === 0 ? 'TS' : 'TD'); }
    function catColor(c) {
      return ['#7fd4ff', '#9ad0ff', '#ffe066', '#ffb547', '#ff7a3d', '#ff3b5c', '#ff4fd8'][clamp(c + 1, 0, 6)];
    }
    function say(text) { $('say').textContent = text; }
    function store(key, val) {
      try {
        if (val === undefined) return window.localStorage.getItem(key);
        window.localStorage.setItem(key, val);
      } catch (e) { /* storage unavailable (private window, blocked) */ }
      return null;
    }

    // =========================================================================
    // map
    // =========================================================================
    // zoom out far enough to see a whole storm from the Gulf or the Atlantic; the bounds only stop
    // the map from wandering off, and are wide enough that fitting a storm beside the panel (or above
    // the phone's bottom sheet) is never pushed back
    var map = L.map('map', { zoomControl: false, minZoom: 4, maxZoom: 13, worldCopyJump: false, preferCanvas: true,
                             zoomSnap: 0.25, attributionControl: true,
                             maxBounds: L.latLngBounds([[-30, -140], [65, -10]]), maxBoundsViscosity: 0.7 });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    L.control.zoom({ position: 'topleft', zoomInTitle: 'Zoom in (+)', zoomOutTitle: 'Zoom out (\u2212)' }).addTo(map);
    [['landFillPane', 205], ['landPane', 210], ['footPane', 330], ['floodPane', 345], ['staticPane', 360], ['scenePane', 450]].forEach(function (p) {
      var pane = map.createPane(p[0]);
      pane.style.zIndex = p[1];
      pane.style.pointerEvents = 'none';
    });
    function small() { return window.innerWidth <= 760; }
    function padding() {
      var top = document.querySelector('.fq-top');
      var topH = top ? top.offsetHeight : 60;
      var bar = $('playbar') ? $('playbar').offsetHeight : 60;
      if (small()) {
        var sheet = $('panel') ? $('panel').offsetHeight : window.innerHeight * 0.45;
        return { tl: [16, topH + 16], br: [16, sheet + bar + 24] };
      }
      return { tl: [64, topH + 24], br: [$('panel').offsetWidth + 40, bar + 50] };
    }
    function frame(pts, maxZoom, animate) {
      var b = pts && pts.length ? L.latLngBounds(pts) : L.latLngBounds([[24.4, -87.6], [31.0, -80.0]]);
      var p = padding();
      map.fitBounds(b, { paddingTopLeft: p.tl, paddingBottomRight: p.br, maxZoom: maxZoom || 9, animate: !!animate });
    }
    frame();

    var FieldLayer = FQ.makeFieldLayer(L);
    var CanvasLayer = FQ.makeCanvasLayer(L);
    var F = {};          // per-frame fields

    // =========================================================================
    // decoding the engine's data
    // =========================================================================
    var G = null;        // static grids
    var P = null;        // planner (road graph)

    function bilin(arr, fi, fj, nx, ny) {
      var i0 = fi | 0, j0 = fj | 0;
      if (fi < 0 || fj < 0 || i0 >= ny - 1 || j0 >= nx - 1) return null;
      var ti = fi - i0, tj = fj - j0, k = i0 * nx + j0;
      return (arr[k] * (1 - tj) + arr[k + 1] * tj) * (1 - ti) + (arr[k + nx] * (1 - tj) + arr[k + nx + 1] * tj) * ti;
    }

    function decodeInfo(info) {
      var g = info.grid;
      var keys = ['landfrac', 'ocean', 'county', 'pop', 'elev_cm', 'dist_dm', 'seg_of', 'sea_depth_m'];
      return Promise.all(keys.map(function (k) { return inflateBytes(info.grids[k]); })).then(function (arr) {
        G = {
          nx: g.nx, ny: g.ny, d: g.d, latMax: g.bbox.lat_max, latMin: g.bbox.lat_min,
          lonMin: g.bbox.lon_min, lonMax: g.bbox.lon_max,
          cnx: info.coarse.nx, cny: info.coarse.ny, cd: info.coarse.d,
          landfrac: arr[0], ocean: arr[1], county: arr[2], pop: view(arr[3], Uint16Array),
          elevBase: view(arr[4], Int16Array), dist: view(arr[5], Uint16Array), segOf: view(arr[6], Uint16Array),
          seaDepth: view(arr[7], Int16Array), nseg: info.segments.length, segments: info.segments,
        };
        G.n = g.nx * g.ny;
        P = new FQ.Planner(info.roads);
        S.cityByName = {};
        info.cities.forEach(function (c) { S.cityByName[c[0].toLowerCase()] = c; });
        // the land cells of every county (for county-wide numbers)
        var lists = info.counties.map(function () { return []; });
        for (var c = 0; c < G.n; c++) {
          var ci = G.county[c];
          if (ci < 255 && lists[ci] && modelledLand(c)) lists[ci].push(c);
        }
        G.countyCells = lists.map(function (l) { return Int32Array.from(l); });
        var byFips = {};
        (info.shapes.counties || []).forEach(function (s) { byFips[s.fips] = s.rings; });
        G.countyRings = info.counties.map(function (c) { return byFips[c.fips] || []; });
        // which way is inland at each stretch of coast (for the surge waves)
        var lf = function (fi, fj) { var v = bilin(G.landfrac, fi, fj, G.nx, G.ny); return v === null ? 0 : v; };
        G.segN = new Float32Array(2 * G.nseg);
        for (var s = 0; s < G.nseg; s++) {
          var fi = (G.latMax - G.segments[s][0]) / G.d - 0.5, fj = (G.segments[s][1] - G.lonMin) / G.d - 0.5;
          var gE = lf(fi, fj + 2) - lf(fi, fj - 2), gN = lf(fi - 2, fj) - lf(fi + 2, fj);
          var len = Math.hypot(gE, gN) || 1;
          G.segN[2 * s] = gE / len;
          G.segN[2 * s + 1] = gN / len;
        }
        // where each road runs (for "roads near you")
        G.edgePts = P.edges.map(function (e) { return e.geom; });
        // the coastline: the edges of the state outlines with sea on one side (the others are
        // borders between states, drawn without the glow)
        var isSea = function (lat, lon) { var c = cellIndex(lat, lon); return c >= 0 && G.ocean[c] === 1; };
        G.coast = [];
        Object.keys(info.shapes.states).forEach(function (k) {
          info.shapes.states[k].forEach(function (ring) {
            var run = null;
            for (var i = 1; i < ring.length; i++) {
              var a = ring[i - 1], b = ring[i];
              var dl = b[0] - a[0], dn = b[1] - a[1], len = Math.hypot(dl, dn) || 1;
              var ml = (a[0] + b[0]) / 2, mn = (a[1] + b[1]) / 2, ol = -dn / len * 0.03, on = dl / len * 0.03;
              if (isSea(ml + ol, mn + on) || isSea(ml - ol, mn - on) || isSea(a[0], a[1]) || isSea(b[0], b[1])) {
                if (!run) { run = [a]; G.coast.push(run); }
                run.push(b);
              } else run = null;
            }
          });
        });
      });
    }

    function decodePrep(prep) {
      var jobs = [inflateBytes(prep.normally_wet)];
      if (prep.elev_cm) jobs.push(inflateBytes(prep.elev_cm));
      prep.stages.forEach(function (st) { jobs.push(inflateBytes(st.zones)); jobs.push(inflateBytes(st.p_surge)); });
      return Promise.all(jobs).then(function (arr) {
        var k = 0;
        var D = {};
        D.wet = arr[k++];
        var elev = prep.elev_cm ? view(arr[k++], Int16Array) : G.elevBase;
        D.levels = b64bytes(prep.levels);
        D.H = prep.hours.length;
        D.hour0 = prep.hours[0];
        D.zEff = new Float32Array(G.n);
        var flood = [];
        var lossPerKm = S.info.model.inland_loss_m_per_km;
        for (var c = 0; c < G.n; c++) {
          var land = modelledLand(c);
          var dkm = G.dist[c] / 10;
          if (land && dkm < 60 && !D.wet[c]) {
            D.zEff[c] = elev[c] / 100 + lossPerKm * dkm;
            flood.push(c);
          } else {
            D.zEff[c] = 99;
          }
        }
        D.flood = Int32Array.from(flood);
        D.zMinSeg = new Float32Array(G.nseg).fill(99);
        for (var fc = 0; fc < D.flood.length; fc++) {
          var cc = D.flood[fc], sg = G.segOf[cc];
          if (D.zEff[cc] < D.zMinSeg[sg]) D.zMinSeg[sg] = D.zEff[cc];
        }
        D.elev = elev;
        D.stages = prep.stages.map(function (st) {
          var z = arr[k++], ps = arr[k++];
          return { zones: z, psurge: ps, phu: b64bytes(st.p_hu), pts: b64bytes(st.p_ts), segPeak: b64bytes(st.seg_peak) };
        });
        D.ts = b64bytes(prep.ts_arrival);
        D.hu = b64bytes(prep.hu_arrival);
        D.maxWind = b64bytes(prep.max_wind_kt);
        var off = S.info.model.level_offset, step = S.info.model.level_step;
        D.lv = function (t, s) { return D.levels[t * G.nseg + s] * step - off; };
        // highest water per stretch of coast over the storm, and per hour the highest on the coast
        D.maxLevel = new Float32Array(G.nseg).fill(-9);
        D.coastMax = new Float32Array(D.H);
        for (var t = 0; t < D.H; t++) {
          var m = -9;
          for (var s = 0; s < G.nseg; s++) {
            var v = D.lv(t, s);
            if (v > m) m = v;
            if (v > D.maxLevel[s]) D.maxLevel[s] = v;
          }
          D.coastMax[t] = m;
        }
        // the highest water on any of the 8 possible tracks, per stretch of coast and order time
        var nM = prep.stages[0].weights.length;
        D.stages.forEach(function (ds) {
          ds.segWorst = new Float32Array(G.nseg).fill(-9);
          for (var mm = 0; mm < nM; mm++) {
            for (var s2 = 0; s2 < G.nseg; s2++) {
              var w = ds.segPeak[mm * G.nseg + s2] * step - off;
              if (w > ds.segWorst[s2]) ds.segWorst[s2] = w;
            }
          }
        });
        // road open-until hour (closure or tropical-storm winds, whichever first), and the first
        // hour each road is under water ('c') or shut by wind (bridges, 'x')
        var nE = prep.roads.close_h.length;
        D.openUntil = new Float64Array(nE);
        D.firstWater = new Float64Array(nE).fill(Infinity);
        D.firstShut = new Float64Array(nE).fill(Infinity);
        for (var e = 0; e < nE; e++) {
          var a = prep.roads.close_h[e], b = prep.roads.ts_h[e];
          D.openUntil[e] = Math.min(a === null ? Infinity : a, b === null ? Infinity : b);
        }
        for (var t2 = 0; t2 < D.H; t2++) {
          var row = prep.roads.status[t2], hh = prep.hours[t2];
          for (var e2 = 0; e2 < nE; e2++) {
            var ch = row.charCodeAt(e2);
            if (ch === 99 && D.firstWater[e2] === Infinity) D.firstWater[e2] = hh;
            else if (ch === 120 && D.firstShut[e2] === Infinity) D.firstShut[e2] = hh;
          }
        }
        D.depth = new Float32Array(G.n).fill(-1);
        S.D = D;
        footprint(S.stageIdx);
      });
    }

    // The flood footprint of an order time: where the sea can reach (evacuation zone, or a 10%+
    // chance of half a metre of water), stronger where the worst of the 8 tracks is deeper.
    function footprint(si) {
      var D = S.D, ds = D.stages[si];
      if (ds.foot) { D.foot = ds.foot; D.edgeFloodKm = ds.edgeFloodKm; return; }
      var foot = new Uint8Array(G.n);
      for (var q = 0; q < D.flood.length; q++) {
        var c = D.flood[q];
        if (ds.zones[c] !== 2 && ds.psurge[c] < 25) continue;
        var worst = ds.segWorst[G.segOf[c]] - D.zEff[c];
        foot[c] = Math.round(255 * (0.3 + 0.7 * clamp(worst / 3, 0, 1)));
      }
      // km of every road that runs through it
      var ekm = new Float32Array(P.edges.length);
      for (var e = 0; e < P.edges.length; e++) {
        var g = P.edges[e].geom, sum = 0;
        for (var i = 1; i < g.length; i++) {
          var c2 = cellIndex((g[i - 1][0] + g[i][0]) / 2, (g[i - 1][1] + g[i][1]) / 2);
          if (c2 >= 0 && foot[c2]) sum += FQ.km(g[i - 1][0], g[i - 1][1], g[i][0], g[i][1]);
        }
        ekm[e] = sum;
      }
      ds.foot = foot;
      ds.edgeFloodKm = ekm;
      D.foot = foot;
      D.edgeFloodKm = ekm;
    }

    // =========================================================================
    // per-frame fields: the water on land at the time on the storm clock
    // =========================================================================
    function updateFields(t) {
      var D = S.D;
      if (!D) return;
      var tf = clamp(t - D.hour0, 0, D.H - 1);
      var t0 = Math.floor(tf), t1 = Math.min(t0 + 1, D.H - 1), w = tf - t0;
      var off = S.info.model.level_offset, step = S.info.model.level_step;
      var lv = F.lv || (F.lv = new Float32Array(G.nseg));
      for (var s = 0; s < G.nseg; s++) {
        lv[s] = (D.levels[t0 * G.nseg + s] * (1 - w) + D.levels[t1 * G.nseg + s] * w) * step - off;
      }
      var depth = D.depth, cells = D.flood, any = false;
      for (var k = 0; k < cells.length; k++) {
        var c = cells[k];
        var dd = lv[G.segOf[c]] - D.zEff[c];
        depth[c] = dd;
        if (dd >= 0.15) any = true;
      }
      S.lastFieldT = t;
      if (layers.water && (any || F.anyWater)) layers.water.refresh();
      F.anyWater = any;
    }

    // =========================================================================
    // map layers: land and sea, the flood zone (soft red, the map key's "Flood Zone"), and the
    // water on land at the time on the storm clock (blue, then yellow, orange, red by depth)
    // =========================================================================
    var WATER_LUT = (function () {
      // depth (m): NOAA's surge colours by feet above ground: blue to 3 ft, yellow 3-6, orange 6-9, red over 9.
      // Under 15 cm is not drawn (high tide alone wets the lowest marsh)
      var stops = [[0.15, 80, 190, 255, 0], [0.3, 80, 190, 255, 140], [0.85, 95, 175, 255, 175], [1.15, 255, 214, 80, 190],
        [1.9, 255, 150, 50, 200], [2.8, 255, 62, 84, 212], [4.5, 236, 64, 200, 222]];
      var lut = new Uint8ClampedArray(256 * 4);
      for (var i = 0; i < 256; i++) {
        var v = i / 255 * 4.5;
        var a = stops[0], b = stops[stops.length - 1];
        for (var k = 0; k < stops.length - 1; k++) {
          if (v >= stops[k][0] && v <= stops[k + 1][0]) { a = stops[k]; b = stops[k + 1]; break; }
        }
        if (v < stops[0][0]) b = a;
        var t = b[0] === a[0] ? 0 : clamp((v - a[0]) / (b[0] - a[0]), 0, 1);
        for (var c = 0; c < 4; c++) lut[i * 4 + c] = a[c + 1] + (b[c + 1] - a[c + 1]) * t;
      }
      return lut;
    })();

    var shaders = {
      land: function (lat, lon, d, o) {
        if (!G) return false;
        var fi = (G.latMax - lat) / G.d - 0.5, fj = (lon - G.lonMin) / G.d - 0.5;
        var lf = bilin(G.landfrac, fi, fj, G.nx, G.ny);
        if (lf === null) return false;
        var landA = FQ.smooth(30, 60, lf);
        var dep = bilin(G.seaDepth, fi, fj, G.nx, G.ny) || 0;
        // sea: the shallow shelf glows (the West Florida Shelf is why the Gulf coast gets big surges)
        var sh = 1 - FQ.smooth(0, 1, Math.log(1 + dep) / Math.log(1 + 220));
        var sr = 9 + 26 * sh, sg = 34 + 108 * sh, sb = 72 + 118 * sh, sa = 150 * sh;
        var edge = Math.min(fi, fj, G.ny - 1 - fi, G.nx - 1 - fj);
        var fade = FQ.smooth(0, 14, edge);
        var z = S.D ? S.D.elev[(fi + 0.5 | 0) * G.nx + (fj + 0.5 | 0)] / 100 : 0;
        var hl = clamp(z / 45, 0, 1);
        var lr = 17 + 24 * hl, lg = 26 + 28 * hl, lb = 43 + 32 * hl;
        d[o] = sr + (lr - sr) * landA;
        d[o + 1] = sg + (lg - sg) * landA;
        d[o + 2] = sb + (lb - sb) * landA;
        d[o + 3] = (sa + (245 - sa) * landA) * fade;
        return true;
      },
      foot: function (lat, lon, d, o) {
        var D = S.D;
        if (!D || !D.foot) return false;
        var fi = (G.latMax - lat) / G.d - 0.5, fj = (lon - G.lonMin) / G.d - 0.5;
        var v = bilin(D.foot, fi, fj, G.nx, G.ny);
        if (v === null || v <= 30) return false;
        var a = clamp((v - 30) / 225, 0, 1);
        d[o] = 255 - 30 * a; d[o + 1] = 112 - 78 * a; d[o + 2] = 132 - 58 * a; d[o + 3] = 58 + 120 * a;
        return true;
      },
      water: function (lat, lon, d, o) {
        var D = S.D;
        if (!D) return false;
        var v = bilin(D.depth, (G.latMax - lat) / G.d - 0.5, (lon - G.lonMin) / G.d - 0.5, G.nx, G.ny);
        if (v === null || v < 0.15) return false;
        var k = Math.min(255, (v / 4.5 * 255) | 0) * 4;
        d[o] = WATER_LUT[k]; d[o + 1] = WATER_LUT[k + 1]; d[o + 2] = WATER_LUT[k + 2]; d[o + 3] = WATER_LUT[k + 3];
        return true;
      },
    };
    var layers = {};
    var staticLayer = null, scene = null;
    function makeLayers() {
      var box = [G.latMin, G.lonMin, G.latMax, G.lonMax];
      layers.landFill = new CanvasLayer(drawLandFill, { pane: 'landFillPane', pad: 0.25 }).addTo(map);
      layers.land = new FieldLayer(shaders.land, { pane: 'landPane', box: box, opacity: 1 }).addTo(map);
      layers.foot = new FieldLayer(shaders.foot, { pane: 'footPane', box: box, opacity: 1 }).addTo(map);
      layers.water = new FieldLayer(shaders.water, { pane: 'floodPane', box: box, opacity: 0.92 }).addTo(map);
      staticLayer = new CanvasLayer(drawStatic, { pane: 'staticPane', pad: 0.25 }).addTo(map);
      scene = new CanvasLayer(drawScene, { pane: 'scenePane', pad: 0.2 }).addTo(map);
    }

    // =========================================================================
    // static canvas: coastline glow, counties, rivers and lakes, highways, town names
    // =========================================================================
    var projCache = { zoom: null };
    function projectAll(v) {
      if (projCache.zoom === v.zoom) return projCache;
      var proj = function (lines) {
        return lines.map(function (pts) {
          var a = new Float64Array(pts.length * 2);
          for (var i = 0; i < pts.length; i++) {
            var p = map.project(pts[i], v.zoom);
            a[2 * i] = p.x; a[2 * i + 1] = p.y;
          }
          return a;
        });
      };
      var sh = S.info.shapes;
      var states = [];
      Object.keys(sh.states).forEach(function (k) { sh.states[k].forEach(function (r) { states.push(r); }); });
      projCache = {
        zoom: v.zoom,
        states: proj(states),
        counties: proj(sh.county_borders),
        rivers: proj(sh.rivers.map(function (r) { return r.pts; })),
        lakes: proj(sh.lakes.map(function (r) { return r.pts; })),
        roads: proj(P.edges.map(function (e) { return e.geom; })),
        coast: proj(G.coast),
        segs: G.segments.map(function (s) { var p = map.project(s, v.zoom); return [p.x, p.y]; }),
      };
      return projCache;
    }
    function strokeLines(ctx, v, lines, close) {
      ctx.beginPath();
      for (var l = 0; l < lines.length; l++) {
        var a = lines[l];
        ctx.moveTo(a[0] - v.ox, a[1] - v.oy);
        for (var i = 2; i < a.length; i += 2) ctx.lineTo(a[i] - v.ox, a[i + 1] - v.oy);
        if (close) ctx.closePath();
      }
    }
    function drawLandFill(ctx, v) {
      if (!G || !S.info) return;
      var pc = projectAll(v);
      ctx.fillStyle = 'rgb(17, 26, 43)';
      strokeLines(ctx, v, pc.states, true);
      ctx.fill('nonzero');
    }
    function drawStatic(ctx, v) {
      if (!G || !S.info) return;
      var pc = projectAll(v);
      ctx.fillStyle = 'rgba(30, 86, 150, 0.36)';
      strokeLines(ctx, v, pc.lakes, true);
      ctx.fill();
      ctx.strokeStyle = 'rgba(70, 150, 230, 0.32)';
      ctx.lineWidth = 0.9;
      strokeLines(ctx, v, pc.rivers);
      ctx.stroke();
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(130, 170, 255, 0.11)';
      ctx.lineWidth = 0.8;
      strokeLines(ctx, v, pc.counties);
      ctx.stroke();
      // major highways, faint, for orientation
      var major = [];
      for (var e = 0; e < P.edges.length; e++) if (P.edges[e].cls <= 2) major.push(pc.roads[e]);
      ctx.strokeStyle = 'rgba(150, 175, 230, 0.2)';
      ctx.lineWidth = 1.1;
      strokeLines(ctx, v, major);
      ctx.stroke();
      // borders between states, then the coastline with its glow
      strokeLines(ctx, v, pc.states, true);
      ctx.strokeStyle = 'rgba(150, 175, 230, 0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();
      strokeLines(ctx, v, pc.coast, false);
      ctx.strokeStyle = 'rgba(53, 232, 255, 0.08)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(53, 232, 255, 0.18)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(170, 232, 255, 0.72)';
      ctx.lineWidth = 1;
      ctx.stroke();
      drawLabels(ctx, v);
    }
    function drawLabels(ctx, v) {
      var z = v.zoom;
      var minPop = z < 6.5 ? 400000 : z < 7.5 ? 150000 : z < 8.5 ? 60000 : z < 9.5 ? 20000 : 5000;
      var taken = [];
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      var cities = S.info.cities;
      // the destinations of your routes carry their own names on the map
      var dest = S.you && S.you.options ? S.you.options.map(function (o) { return v.px(o.h.lat, o.h.lon); }) : [];
      for (var i = 0; i < cities.length; i++) {
        var c = cities[i];
        if (c[3] < minPop) continue;
        var p = v.px(c[1], c[2]);
        if (p[0] < 0 || p[1] < 0 || p[0] > v.w || p[1] > v.h) continue;
        var near = false;
        for (var q = 0; q < dest.length; q++) if (Math.abs(dest[q][0] - p[0]) < 24 && Math.abs(dest[q][1] - p[1]) < 12) { near = true; break; }
        if (near) continue;
        var wdt = ctx.measureText(c[0]).width;
        var bx = [p[0] + 5, p[1] - 7, p[0] + 9 + wdt, p[1] + 7];
        var clash = false;
        for (var k = 0; k < taken.length; k++) {
          var t = taken[k];
          if (bx[0] < t[2] && bx[2] > t[0] && bx[1] < t[3] && bx[3] > t[1]) { clash = true; break; }
        }
        if (clash) continue;
        taken.push(bx);
        ctx.fillStyle = 'rgba(200, 215, 245, 0.6)';
        ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(3, 8, 18, 0.8)';
        ctx.strokeText(c[0], p[0] + 6, p[1]);
        ctx.fillStyle = 'rgba(205, 218, 245, 0.74)';
        ctx.fillText(c[0], p[0] + 6, p[1]);
      }
      ctx.textBaseline = 'alphabetic';
    }

    // =========================================================================
    // the scene, redrawn every frame: closed roads, the county under the alert, safe destinations,
    // surge waves on the coast, the track and cone, wind radii, the storm, your routes, the sirens
    // and you. Dashed red means one thing only: a closed road.
    // =========================================================================
    var radar = null, clouds = null;
    var flow = new FQ.Flow();

    function currentHourIdx() { return clamp(Math.round(S.t - S.prep.hours[0]), 0, S.prep.hours.length - 1); }
    function trackAt(t) {
      var tr = S.prep.track;
      var tf = clamp(t - tr.hours[0], 0, tr.hours.length - 1);
      var i0 = Math.floor(tf), i1 = Math.min(i0 + 1, tr.hours.length - 1), w = tf - i0;
      var lerp = function (a) { return a[i0] + (a[i1] - a[i0]) * w; };
      return { lat: lerp(tr.lat), lon: lerp(tr.lon), vmax: lerp(tr.vmax), pc: lerp(tr.pc), cat: tr.cat[Math.round(tf)],
               radii: tr.radii[Math.round(tf)], land: tr.land[Math.round(tf)], rmax: lerp(tr.rmax_km) };
    }
    function hexA(hex, a) {
      var n = parseInt(hex.slice(1), 16);
      return 'rgba(' + (n >> 16) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + a + ')';
    }
    function label(ctx, text, x, y, align, color, font) {
      ctx.font = font || '600 11px system-ui, sans-serif';
      ctx.textAlign = align || 'left';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(3, 8, 18, 0.9)';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color || '#fff';
      ctx.fillText(text, x, y);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
    // a name on a dark rounded backing, so it stays readable over town names and routes
    function chip(ctx, text, x, y, color, font) {
      ctx.font = font;
      var w = ctx.measureText(text).width, h = 18, r = 6;
      var x0 = x - 5, y0 = y - h / 2;
      ctx.fillStyle = 'rgba(5, 11, 23, 0.86)';
      ctx.beginPath();
      ctx.moveTo(x0 + r, y0);
      ctx.arcTo(x0 + w + 10, y0, x0 + w + 10, y0 + h, r);
      ctx.arcTo(x0 + w + 10, y0 + h, x0, y0 + h, r);
      ctx.arcTo(x0, y0 + h, x0, y0, r);
      ctx.arcTo(x0, y0, x0 + w + 10, y0, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + 0.5);
      ctx.textBaseline = 'alphabetic';
    }
    function polyline(ctx, v, pts) {
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = v.px(pts[i][0], pts[i][1]);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
    }
    function onScreen(v, p, m) { return p[0] > -m && p[1] > -m && p[0] < v.w + m && p[1] < v.h + m; }

    function drawScene(ctx, v) {
      if (!S.prep || !G || !S.D) return;
      var pc = projectAll(v), now = performance.now();
      var dt = S.lastFrame ? Math.min(0.05, (now - S.lastFrame) / 1000) : 0;
      S.lastFrame = now;
      var st = S.prep.stages[S.stageIdx];
      var cur = trackAt(S.t);
      drawClosedRoads(ctx, v, pc);
      drawAlertRegion(ctx, v, now);
      drawSafe(ctx, v, st);
      drawWaves(ctx, v, pc, now);
      drawTrack(ctx, v, st, cur);
      drawRadii(ctx, v, cur);
      drawStorm(ctx, v, cur, now);
      drawRoutes(ctx, v, now, dt);
      drawSirens(ctx, v, now);
      drawYou(ctx, v, now);
    }

    // roads closed at this hour: under water, or a bridge shut by wind
    function drawClosedRoads(ctx, v, pc) {
      var status = S.prep.roads.status[currentHourIdx()];
      var water = [], wind = [];
      for (var e = 0; e < P.edges.length; e++) {
        var ch = status.charCodeAt(e);
        if (ch === 99) water.push(pc.roads[e]);
        else if (ch === 120) wind.push(pc.roads[e]);
      }
      if (!water.length && !wind.length) return;
      ctx.save();
      ctx.lineCap = 'butt';
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = 'rgba(255, 77, 109, 0.95)';
      ctx.lineWidth = 2.4;
      strokeLines(ctx, v, water.concat(wind));
      ctx.stroke();
      ctx.restore();
    }

    // the county under the alert: a soft wash and a thin solid outline, with a slow pulse
    function drawAlertRegion(ctx, v, now) {
      var Y = S.you;
      if (!Y || !Y.alert || !Y.alert.siren || Y.ci < 0) return;
      var rings = G.countyRings[Y.ci];
      if (!rings || !rings.length) return;
      var pulse = FQ.reducedMotion() ? 0.5 : 0.5 + 0.5 * Math.sin(now / 900);
      ctx.save();
      ctx.beginPath();
      rings.forEach(function (ring) {
        for (var i = 0; i < ring.length; i++) {
          var p = v.px(ring[i][0], ring[i][1]);
          if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
        }
        ctx.closePath();
      });
      ctx.fillStyle = hexA(Y.alert.color, (0.025 + 0.025 * pulse).toFixed(3));
      ctx.fill('evenodd');
      ctx.strokeStyle = hexA(Y.alert.color, (0.3 + 0.25 * pulse).toFixed(3));
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }

    // green rings: safe destinations for this storm (faint once a place has its own five)
    function drawSafe(ctx, v, st) {
      var Y = S.you;
      var shown = {};
      if (Y && Y.options) Y.options.forEach(function (o) { shown[o.host] = true; });
      ctx.save();
      ctx.globalAlpha = Y && Y.options && Y.options.length ? 0.3 : 0.85;
      ctx.fillStyle = 'rgba(46, 229, 157, 0.14)';
      ctx.strokeStyle = 'rgba(46, 229, 157, 0.9)';
      ctx.lineWidth = 1.5;
      st.hosts.forEach(function (h, hi) {
        if (!h.safe || h.local || shown[hi]) return;
        var p = v.px(h.lat, h.lon);
        if (!onScreen(v, p, 30)) return;
        var r = 4 + Math.sqrt(h.cap) / 90;
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.restore();
    }

    // the surge coming ashore: swells roll in from the sea wherever the water is up; their colour
    // follows the water level (blue, then yellow, orange, red), and they push inland when it is high
    function drawWaves(ctx, v, pc, now) {
      if (!F.lv) return;
      var rm = FQ.reducedMotion();
      var ph = rm ? 0.5 : (now / 2600) % 1;
      var zs = clamp(Math.pow(2, v.zoom - 7), 0.7, 2.2);
      ctx.save();
      ctx.lineCap = 'round';
      for (var s = 0; s < G.nseg; s++) {
        var lv = F.lv[s];
        if (lv < 0.3) continue;
        var p = pc.segs[s];
        var x = p[0] - v.ox, y = p[1] - v.oy;
        if (x < -50 || y < -50 || x > v.w + 50 || y > v.h + 50) continue;
        var nx = G.segN[2 * s], ny = -G.segN[2 * s + 1];      // inland, in screen pixels
        var tx = -ny, ty = nx;                                 // along the coast
        var reach = clamp(6 + 9 * lv, 8, 44) * zs;
        var half = clamp(4 + 2.2 * lv, 4, 13) * clamp(zs, 0.8, 1.8);
        var col = lv > 2.8 ? '236, 64, 200' : lv > 1.9 ? '255, 62, 84' : lv > 1.15 ? '255, 150, 50' : lv > 0.85 ? '255, 214, 80' : '120, 210, 255';
        var strength = clamp(lv / 1.6, 0.25, 1);
        for (var k = 0; k < 3; k++) {
          var f = (ph + k / 3 + (s % 7) * 0.031) % 1;
          var d = -reach * (1 - f) + (lv > 1 ? 0.25 * reach * f : 0);
          var cx = x + nx * d, cy = y + ny * d;
          var a = strength * Math.sin(Math.PI * f) * 0.9;
          ctx.strokeStyle = 'rgba(' + col + ', ' + a.toFixed(3) + ')';
          ctx.lineWidth = 1.2 + 1.3 * strength;
          ctx.beginPath();
          ctx.moveTo(cx - tx * half, cy - ty * half);
          ctx.quadraticCurveTo(cx + nx * 2.4, cy + ny * 2.4, cx + tx * half, cy + ty * half);
          ctx.stroke();
        }
        if (lv >= 1) {
          var rg = half * 2.3;
          var gr = ctx.createRadialGradient(x, y, 0, x, y, rg);
          gr.addColorStop(0, 'rgba(' + col + ', ' + (0.32 * strength).toFixed(3) + ')');
          gr.addColorStop(1, 'rgba(' + col + ', 0)');
          ctx.fillStyle = gr;
          ctx.beginPath(); ctx.arc(x, y, rg, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    }

    // the cone of uncertainty of the order time's forecast, the 8 possible tracks, and the track
    function drawTrack(ctx, v, st, cur) {
      var trk = S.prep.track;
      ctx.save();
      if (S.t <= 6) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (S.t < st.hour ? 0.045 : 0.065) + ')';
        ctx.beginPath();
        var cone = st.cone.filter(function (c) { return c[0] <= 12; });
        for (var ci = 0; ci < cone.length; ci++) {
          var cp = v.px(cone[ci][1], cone[ci][2]);
          var rr = Math.max(2, v.kmToPx(cone[ci][3], cone[ci][1]));
          ctx.moveTo(cp[0] + rr, cp[1]);
          ctx.arc(cp[0], cp[1], rr, 0, Math.PI * 2);
        }
        ctx.fill('nonzero');
        for (var cj = 0; cj < cone.length - 1; cj++) {
          var A = v.px(cone[cj][1], cone[cj][2]), B = v.px(cone[cj + 1][1], cone[cj + 1][2]);
          var ra = v.kmToPx(cone[cj][3], cone[cj][1]), rb = v.kmToPx(cone[cj + 1][3], cone[cj + 1][1]);
          var dx = B[0] - A[0], dy = B[1] - A[1], dl = Math.hypot(dx, dy) || 1;
          var nx = -dy / dl, ny = dx / dl;
          ctx.beginPath();
          ctx.moveTo(A[0] + nx * ra, A[1] + ny * ra);
          ctx.lineTo(B[0] + nx * rb, B[1] + ny * rb);
          ctx.lineTo(B[0] - nx * rb, B[1] - ny * rb);
          ctx.lineTo(A[0] - nx * ra, A[1] - ny * ra);
          ctx.closePath();
          ctx.fill();
        }
      }
      if (S.t <= 12) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(176, 140, 255, 0.16)';
        st.members.forEach(function (mem) {
          ctx.beginPath();
          for (var mi = 0; mi < mem.length; mi++) {
            var mp = v.px(mem[mi][0], mem[mi][1]);
            if (mi === 0) ctx.moveTo(mp[0], mp[1]); else ctx.lineTo(mp[0], mp[1]);
          }
          ctx.stroke();
        });
      }
      var i0 = clamp(Math.round(T_MIN - trk.hours[0]), 0, trk.hours.length - 1);
      var nowIdx = clamp(Math.floor(S.t - trk.hours[0]), i0, trk.hours.length - 1);
      var cp0 = v.px(cur.lat, cur.lon);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      for (var ti = i0; ti <= nowIdx; ti++) {
        var tp = v.px(trk.lat[ti], trk.lon[ti]);
        if (ti === i0) ctx.moveTo(tp[0], tp[1]); else ctx.lineTo(tp[0], tp[1]);
      }
      ctx.lineTo(cp0[0], cp0[1]);
      ctx.stroke();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.beginPath();
      ctx.moveTo(cp0[0], cp0[1]);
      for (var tj = nowIdx + 1; tj < trk.hours.length; tj++) {
        var tq = v.px(trk.lat[tj], trk.lon[tj]);
        ctx.lineTo(tq[0], tq[1]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      for (var tk = i0; tk < trk.hours.length; tk += 6) {
        var dp = v.px(trk.lat[tk], trk.lon[tk]);
        ctx.fillStyle = catColor(trk.cat[tk]);
        ctx.beginPath();
        ctx.arc(dp[0], dp[1], trk.hours[tk] === 0 ? 4.6 : 3, 0, Math.PI * 2);
        ctx.fill();
        if (trk.hours[tk] === 0 && v.zoom >= 6) {
          label(ctx, 'Landfall ' + clockLabel(0), dp[0] + 9, dp[1] + 1, 'left', 'rgba(255, 200, 210, 0.95)', '600 10.5px system-ui, sans-serif');
        }
      }
      ctx.restore();
    }

    function radiusShape(ctx, v, lat, lon, quads, k) {
      // a smooth closed curve through the four quadrant radii (NE, SE, SW, NW) for threshold k
      var c = v.px(lat, lon);
      var kmpx = v.kmToPx(1, lat);
      ctx.beginPath();
      for (var a = 0; a <= 64; a++) {
        var ang = a / 64 * 2 * Math.PI;
        var deg = ang * 180 / Math.PI;
        var q = Math.floor(((deg - 45 + 360) % 360) / 90);
        var f = (((deg - 45 + 360) % 360) % 90) / 90;
        var r0 = quads[q][k], r1 = quads[(q + 1) % 4][k];
        var r = (r0 + (r1 - r0) * (0.5 - 0.5 * Math.cos(Math.PI * f))) * 1.852 * kmpx;
        var x = c[0] + Math.sin(ang) * r, y = c[1] - Math.cos(ang) * r;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    function drawRadii(ctx, v, cur) {
      if (!cur.radii) return;
      ctx.save();
      radiusShape(ctx, v, cur.lat, cur.lon, cur.radii, 0);
      ctx.fillStyle = 'rgba(255, 196, 64, 0.05)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 196, 64, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      if (cur.radii[0][2] > 0) {
        radiusShape(ctx, v, cur.lat, cur.lon, cur.radii, 2);
        ctx.fillStyle = 'rgba(255, 60, 90, 0.09)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 60, 90, 0.7)';
        ctx.stroke();
      }
      ctx.restore();
    }

    // the hurricane: radar-coloured rain bands and a cloud veil, turning counter-clockwise
    function drawStorm(ctx, v, cur, now) {
      if (!radar) { radar = FQ.radarSprite(512); clouds = FQ.stormSprite(512); }
      var cp = v.px(cur.lat, cur.lon);
      var r34 = cur.radii ? Math.max(cur.radii[0][0], cur.radii[1][0], cur.radii[2][0], cur.radii[3][0]) : 120;
      var R = Math.max(26, v.kmToPx(Math.max(r34, 60) * 1.852 * 1.15, cur.lat));
      var zf = clamp((9.6 - v.zoom) / 3, 0.12, 1);           // zoomed in, the storm is a veil over the map
      var strength = clamp(0.4 + cur.vmax / 190, 0.4, 1);
      var ang = FQ.reducedMotion() ? 0 : -now / 1000 * 0.45;
      ctx.save();
      ctx.translate(cp[0], cp[1]);
      ctx.save();
      ctx.rotate(ang);
      ctx.globalAlpha = 0.6 * strength * zf;
      ctx.drawImage(radar, -0.84 * R, -0.84 * R, 1.68 * R, 1.68 * R);
      ctx.restore();
      ctx.save();
      ctx.rotate(ang * 0.7 + 1.3);
      ctx.globalAlpha = 0.36 * strength * zf;
      ctx.drawImage(clouds, -R, -R, 2 * R, 2 * R);
      ctx.restore();
      var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
      glow.addColorStop(0, catColor(cur.cat));
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (v.zoom < 8.75 && onScreen(v, cp, 0)) {
        label(ctx, catShort(cur.cat) + ' ' + MIDDOT + ' ' + Math.round(cur.vmax * 1.15) + ' mph', cp[0] + 16, cp[1] - 16, 'left', 'rgba(235, 240, 255, 0.92)');
      }
    }

    // your routes, each in its own colour. With no card picked all of them show clearly (route 1 on
    // top); a picked (or hovered) card brings its route and destination forward and dims the rest.
    // Dashed red: a road on the way that closes less than HAZARD_SLACK_H after you would pass it.
    // Moving dots show the way to drive on the route in focus (route 1 when none is picked).
    function focusIdx() { return S.hover !== null ? S.hover : (S.picked ? S.sel : null); }
    function drawRoutes(ctx, v, now, dt) {
      var Y = S.you;
      if (!Y || !Y.options || !Y.options.length) return;
      var n = Y.options.length, fi = focusIdx();
      var focus = fi === null ? null : Math.min(fi, n - 1);
      var dimOthers = focus !== null && S.picked;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // back to front: the others, then route 1 (or the route in focus) on top
      var order = [];
      for (var k = n - 1; k >= 0; k--) if (k !== (focus === null ? 0 : focus)) order.push(k);
      order.push(focus === null ? 0 : focus);
      order.forEach(function (i) {
        var o = Y.options[i], col = ROUTE_COLORS[i], on = i === focus;
        if (!o.route || o.route.length < 2) return;
        var late = o.latest !== null && S.t > o.latest + 0.01;
        polyline(ctx, v, o.route);
        ctx.strokeStyle = col;
        if (on) {
          ctx.globalAlpha = 0.22;
          ctx.lineWidth = 14;
          ctx.stroke();
          ctx.globalAlpha = late ? 0.45 : 1;
          ctx.lineWidth = 5.5;
        } else if (focus !== null) {
          ctx.globalAlpha = (dimOthers ? 0.18 : 0.5) * (late ? 0.6 : 1);
          ctx.lineWidth = 2.6;
        } else {
          ctx.globalAlpha = 0.12 * (late ? 0.5 : 1);
          ctx.lineWidth = 9;
          ctx.stroke();
          ctx.globalAlpha = late ? 0.45 : 0.95;
          ctx.lineWidth = i === 0 ? 4.5 : 3.6;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (o.hazard && o.hazard.length && (on || !dimOthers)) {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = 'rgba(255, 77, 109, ' + (on || focus === null ? 0.95 : 0.5) + ')';
          ctx.lineWidth = on ? 3.4 : 2.4;
          o.hazard.forEach(function (ei) { polyline(ctx, v, P.edges[ei].geom); ctx.stroke(); });
          ctx.setLineDash([]);
        }
      });
      var fo = Y.options[focus === null ? 0 : focus];
      if (fo && fo.route && fo.route.length > 1 && !(fo.latest !== null && S.t > fo.latest + 0.01)) {
        flow.draw(ctx, v, dt, 1, function (load, a) { return 'rgba(255, 255, 255, ' + (0.85 * a).toFixed(3) + ')'; });
      }
      // destinations: numbered markers in the route's colour; names that would overlap are left out
      var taken = [];
      order.slice().reverse().forEach(function (i) {
        var o = Y.options[i], on = i === focus;
        var p = v.px(o.h.lat, o.h.lon);
        var lab = on || !dimOthers;
        ctx.font = (on ? '700 12px' : '600 11px') + ' system-ui, sans-serif';
        var r = on ? 11 : 9, wdt = ctx.measureText(o.h.name).width;
        var box = [p[0] - r, p[1] - r, p[0] + r + 16 + wdt, p[1] + r];
        if (lab && !on) {
          for (var q = 0; q < taken.length; q++) {
            var t2 = taken[q];
            if (box[0] < t2[2] && box[2] > t2[0] && box[1] < t2[3] && box[3] > t2[1]) { lab = false; break; }
          }
        }
        if (lab) taken.push(box);
        o._lab = lab;
      });
      order.forEach(function (i) {
        var o = Y.options[i], on = i === focus;
        var p = v.px(o.h.lat, o.h.lon), r = on ? 11 : 9;
        ctx.globalAlpha = !on && dimOthers ? 0.4 : 1;
        if (on) {
          var halo = ctx.createRadialGradient(p[0], p[1], r, p[0], p[1], r + 14);
          halo.addColorStop(0, hexA(ROUTE_COLORS[i], 0.4));
          halo.addColorStop(1, hexA(ROUTE_COLORS[i], 0));
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(p[0], p[1], r + 14, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = ROUTE_COLORS[i];
        ctx.strokeStyle = on ? '#ffffff' : 'rgba(3, 8, 18, 0.9)';
        ctx.lineWidth = on ? 2.5 : 2;
        ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#06101f';
        ctx.font = '800 ' + (on ? 12 : 11) + 'px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), p[0], p[1] + 0.5);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        if (o._lab) chip(ctx, o.h.name, p[0] + r + 9, p[1], on ? '#ffffff' : 'rgba(228, 236, 252, 0.95)', (on ? '700 12px' : '600 11.5px') + ' system-ui, sans-serif');
        ctx.globalAlpha = 1;
      });
      ctx.restore();
    }
    function setFlow() {
      var Y = S.you;
      if (!Y || !Y.options || !Y.options.length) { flow.set([]); S.flowKey = null; return; }
      var fi = focusIdx();
      var o = Y.options[fi === null ? 0 : Math.min(fi, Y.options.length - 1)];
      var key = Y.lat + ',' + Y.lon + ':' + o.host + ':' + o.km;
      if (S.flowKey === key) return;
      S.flowKey = key;
      flow.set(o.route && o.route.length > 1 ? [{ pts: o.route, n: clamp(Math.round(o.km / 5), 10, 70), speed: 1 }] : []);
    }

    // sirens across the area told to leave: rings spreading from each neighbourhood in the zone
    function drawSirens(ctx, v, now) {
      var Y = S.you;
      if (!Y || !Y.alert || !Y.alert.siren || !Y.sirenPts || !Y.sirenPts.length) return;
      var age = (now - S.alertAt) / 1000;
      if (age < 0 || age > 30) return;
      var fade = age < 24 ? 1 : (30 - age) / 6;
      var rm = FQ.reducedMotion();
      ctx.save();
      Y.sirenPts.forEach(function (pt, j) {
        var p = v.px(pt[0], pt[1]);
        if (!onScreen(v, p, 60)) return;
        for (var k = 0; k < 3; k++) {
          var f = rm ? 0.55 : ((age / 2.1) + k / 3 + j * 0.13) % 1;
          ctx.strokeStyle = 'rgba(255, 77, 109, ' + (0.6 * (1 - f) * fade).toFixed(3) + ')';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p[0], p[1], 5 + 30 * f, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255, 77, 109, ' + (0.9 * fade).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }

    // you: a dot in the colour of your alert, with a slow ping
    function drawYou(ctx, v, now) {
      var Y = S.you;
      if (!Y) return;
      var u = v.px(Y.lat, Y.lon);
      var col = Y.alert ? Y.alert.color : '#4fd8ff';
      ctx.save();
      var ph = FQ.reducedMotion() ? 0.5 : (now / 1000) % 1.8 / 1.8;
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.75 * (1 - ph)).toFixed(3) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(u[0], u[1], 8 + 22 * ph, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(u[0], u[1], 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // the timeline under the map: the danger at the place in focus (colour band, the same levels
    // as the chip beside it), the events (dots), your last safe departure (green), landfall
    // (dotted line) and the storm clock (white)
    // =========================================================================
    function tlX(hh, w) { return 8 + (hh - T_MIN) / (T_MAX - T_MIN) * (w - 16); }
    var EVENT_COLOR = { alert: '#ff4d6d', warn: '#ffb547', calm: '#2ee59d' };
    function drawTimeline() {
      var c = $('tl-canvas');
      var w = c.clientWidth, h = c.clientHeight;
      if (!w || !h || !S.prep || !S.D) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      var ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var X = function (hh) { return tlX(hh, w); };
      var top = 14, bot = h - 3;
      var band = dangerBand(), hours = S.prep.hours;
      for (var i = 0; i < hours.length; i++) {
        if (hours[i] < T_MIN - 1 || hours[i] > T_MAX + 1) continue;
        var stg = dangerStage(band[i]);
        ctx.globalAlpha = 0.12 + 0.08 * stg;
        ctx.fillStyle = DANGER_COLOR[stg];
        ctx.fillRect(X(hours[i] - 0.5), top, X(hours[i] + 0.5) - X(hours[i] - 0.5) + 0.5, bot - top);
      }
      ctx.globalAlpha = 1;
      ctx.font = '600 9.5px ui-monospace, Menlo, Consolas, monospace';
      ctx.fillStyle = 'rgba(160, 180, 220, 0.85)';
      ctx.textAlign = 'center';
      var stepH = w < 420 ? 24 : 12;
      for (var hh = -48; hh <= T_MAX; hh += stepH) {
        var tx = X(hh);
        ctx.fillRect(tx - 0.5, top - 3, 1, 3);
        ctx.fillText(fmtH(hh), clamp(tx, 14, w - 14), 9);
      }
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(X(0), top); ctx.lineTo(X(0), bot); ctx.stroke();
      ctx.setLineDash([]);
      var Y = S.you;
      if (Y && Y.options && Y.options.length && Y.options[0].latest !== null && Y.verdict !== 'stay') {
        var lx = X(clamp(Y.options[0].latest, T_MIN, T_MAX));
        ctx.fillStyle = '#2ee59d';
        ctx.fillRect(lx - 1, top, 2, bot - top);
      }
      S.events.forEach(function (e) {
        if (e.h < T_MIN || e.h > T_MAX) return;
        ctx.fillStyle = EVENT_COLOR[e.kind] || '#4fd8ff';
        ctx.strokeStyle = 'rgba(3, 8, 18, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(X(e.h), top + 6, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      var cx = X(S.t);
      ctx.fillStyle = 'rgba(79, 216, 255, 0.22)';
      ctx.fillRect(cx - 4, top - 2, 8, bot - top + 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, top - 3, 2, bot - top + 3);
    }

    // =========================================================================
    // the statewide plan (QAOA) behind the traffic and shelter loads
    // =========================================================================
    function activePlan() {
      if (!S.prep) return null;
      var st = S.prep.stages[S.stageIdx];
      if (S.q && S.q.stages[S.stageIdx]) return S.q.stages[S.stageIdx].quantum_plan;
      return st.plans.decomposed;
    }
    function congestionMult(plan) {
      var m = new Float64Array(P.edges.length).fill(1);
      if (plan && plan.links) {
        plan.links.forEach(function (l) {
          var x = l[1];
          m[l[0]] = x <= 1 ? 1 + 0.15 * Math.pow(x, 4) : 1.15 + 1.2 * (x - 1);
        });
      }
      return m;
    }

    // =========================================================================
    // where you are
    // =========================================================================
    function cellIndex(lat, lon) {
      var i = Math.floor((G.latMax - lat) / G.d), j = Math.floor((lon - G.lonMin) / G.d);
      if (i < 0 || j < 0 || i >= G.ny || j >= G.nx) return -1;
      return i * G.nx + j;
    }
    function coarseIndex(lat, lon) {
      var i = Math.floor((G.latMax - lat) / G.cd), j = Math.floor((lon - G.lonMin) / G.cd);
      if (i < 0 || j < 0 || i >= G.cny || j >= G.cnx) return -1;
      return i * G.cnx + j;
    }
    function nearestCity(lat, lon) {
      var best = null, bd = 1e9;
      S.info.cities.forEach(function (c) {
        var d = FQ.km(lat, lon, c[1], c[2]);
        if (d < bd) { bd = d; best = c; }
      });
      return bd < 30 ? best[0] : null;
    }
    function modelledLand(k) { return G.ocean[k] === 0 && G.landfrac[k] >= 35; }
    function nearestLandCell(lat, lon, rad) {
      var i0 = Math.floor((G.latMax - lat) / G.d), j0 = Math.floor((lon - G.lonMin) / G.d);
      var best = -1, bd = 1e9;
      for (var di = -rad; di <= rad; di++) {
        for (var dj = -rad; dj <= rad; dj++) {
          var i = i0 + di, j = j0 + dj;
          if (i < 0 || j < 0 || i >= G.ny || j >= G.nx) continue;
          var k = i * G.nx + j;
          if (!modelledLand(k)) continue;
          var d = FQ.km(lat, lon, G.latMax - (i + 0.5) * G.d, G.lonMin + (j + 0.5) * G.d);
          if (d < bd) { bd = d; best = k; }
        }
      }
      return best;
    }
    // the deepest water at one cell on the forecast track, and on the worst of the 8 possible tracks
    function spotWater(k, si) {
      var D = S.D, z = D.zEff[k];
      if (!(z < 98)) return null;
      var seg = G.segOf[k], off = S.info.model.level_offset, step = S.info.model.level_step;
      var w = S.prep.stages[si].weights, n = 0;
      for (var m = 0; m < w.length; m++) {
        if (D.stages[si].segPeak[m * G.nseg + seg] * step - off - z >= 0.5) n += 1;
      }
      return { peak: D.maxLevel[seg] - z, worst: D.stages[si].segWorst[seg] - z, n: n };
    }

    // =========================================================================
    // which storms fit a place. The eight hypothetical storms come from three directions; a
    // direction is offered for a place only when one of its storms passes within RELEVANT_KM
    // (between a day before and a day after landfall). Each direction, and the first storm shown,
    // is the storm that comes closest, counting a landfall nearby (the surge) ahead of a track
    // that only passes over (inland, the wind): min(landfall distance, track distance + 80 km).
    // =========================================================================
    function trackDist(p, lat, lon) {
      var rows = p.track, best = Infinity;
      for (var i = 0; i < rows.length - 1; i++) {
        var a = rows[i], b = rows[i + 1];
        if (b[0] < -24 || a[0] > 24) continue;
        for (var s = 0; s <= 8; s++) {
          var f = s / 8;
          var d = FQ.km(lat, lon, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
          if (d < best) best = d;
        }
      }
      return best;
    }
    function landfallDist(p, lat, lon) {
      var row = p.track.filter(function (r) { return r[0] === 0; })[0];
      return row ? FQ.km(lat, lon, row[1], row[2]) : Infinity;
    }
    function scenarioChoice(lat, lon) {
      var by = {}, best = null;
      S.info.presets.forEach(function (p) {
        var d = trackDist(p, lat, lon), ap = p.approach || 'gulf';
        var sc = Math.min(landfallDist(p, lat, lon), d + 80);
        if (d <= RELEVANT_KM && (!by[ap] || sc < by[ap].sc)) by[ap] = { id: p.id, d: d, sc: sc };
        if (!best || sc < best.sc) best = { id: p.id, d: d, sc: sc };
      });
      return { by: by, best: best.id, bestD: best.d };
    }
    function presetInfo(id) { return S.info.presets.filter(function (p) { return p.id === id; })[0] || null; }

    // =========================================================================
    // your options: a route to every safe destination within reach (classical, time-dependent
    // shortest paths), then a QAOA circuit picks the K_SHOW the page shows (routes.js, portfolio.py)
    // =========================================================================
    // A route's own cost, in rough "hours of risk", in the order of what matters most: wind at
    // the destination, driving back into the flood footprint, little time to spare before a road on
    // the way closes, a destination over its planning capacity, then the drive itself (long trips
    // cost more and more). The statewide plan's pick for your county gets a small bonus; when the
    // roads out close soon, high ground nearby goes first (local triage).
    function ownCost(o) {
      var wind = 2 * o.h.p_hu + 0.4 * o.h.p_ts;
      var flood = Math.min(1.5, 0.12 * o.floodKm);
      var tight = o.margin === null ? 0 : 1.5 * clamp((6 - o.margin) / 6, 0, 1);
      var crowd = o.fill > 0.75 ? Math.min(1.5, 1.5 * (o.fill - 0.75) / 0.25) : 0;
      var time = o.hours / 3 + Math.max(0, o.hours - 3) / 2;
      return wind + flood + tight + crowd + time - (o.inPlan ? 0.3 : 0) - (o.triage ? 3 : 0);
    }
    function routeOf(lat, lon, o) {
      return o.edges.length ? [[lat, lon]].concat(P.geometry(o.start, o.edges)) : [[lat, lon], [o.h.lat, o.h.lon]];
    }
    // the main road corridor: the first two highways driven for 8 km or more
    function viaOf(o) {
      var seen = [], out = [];
      (o.legs || []).forEach(function (L2) {
        if (L2.ref === 'local streets' || L2.ref === 'local roads' || L2.ref === 'connector' || L2.ref === 'link' || L2.km < 8) return;
        if (seen.indexOf(L2.ref) >= 0) return;
        seen.push(L2.ref);
        out.push(L2.ref.charAt(0).toUpperCase() + L2.ref.slice(1) + (L2.dir ? ' ' + L2.dir : ''));
      });
      return out.length ? 'via ' + out.slice(0, 2).join(', ') : 'via local streets';
    }

    function computeOptions(lat, lon, depart) {
      var D = S.D, si = S.stageIdx, st = S.prep.stages[si];
      var res = { lat: lat, lon: lon, place: nearestCity(lat, lon), cell: -1, ci: -1, options: [], pool: [], quad: [],
                  prepId: S.prepId, preset: S.preset, depart: depart, orderHour: st.hour, feasible: 0 };
      var k = cellIndex(lat, lon);
      if (k < 0) { res.verdict = 'outside'; return res; }
      if (!modelledLand(k)) {
        k = nearestLandCell(lat, lon, 3);        // a key narrower than a 2 km cell: nearest modelled land
        if (k < 0) { res.verdict = 'water'; return res; }
      }
      res.cell = k;
      res.qlat = G.latMax - (Math.floor(k / G.nx) + 0.5) * G.d;
      res.qlon = G.lonMin + (k % G.nx + 0.5) * G.d;
      res.water = spotWater(k, si);
      var ci = G.county[k];
      res.ci = ci < 255 ? ci : -1;
      res.county = ci < 255 ? S.info.counties[ci].name : null;
      var fips = ci < 255 ? S.info.counties[ci].fips : '';
      res.zone = D.stages[si].zones[k];
      res.pSurge = D.stages[si].psurge[k] / 250;
      var c = coarseIndex(lat, lon);
      res.pHu = c >= 0 ? D.stages[si].phu[c] / 250 : 0;
      res.pTs = c >= 0 ? D.stages[si].pts[c] / 250 : 0;
      res.tsHour = c >= 0 && D.ts[c] < 255 ? S.prep.hours[D.ts[c]] : null;
      res.huHour = c >= 0 && D.hu[c] < 255 ? S.prep.hours[D.hu[c]] : null;
      res.maxWindKt = c >= 0 ? D.maxWind[c] : 0;
      if (res.zone === 2) res.verdict = 'go';
      else if (res.zone === 1) res.verdict = 'ready';
      else res.verdict = 'stay';
      res.reason = res.zone === 2 ? 'surge' : null;
      var plan = activePlan();
      var mult = congestionMult(plan);
      var loads = {};
      if (plan && plan.host_loads) plan.host_loads.forEach(function (hl) { loads[hl[0]] = hl[1]; });
      // the statewide plan's destination for the evacuating area of your county
      var mine = null, bd = Infinity;
      st.groups.forEach(function (g, gi) {
        if (g.county !== ci) return;
        var dg = FQ.km(lat, lon, g.lat, g.lon);
        if (dg < bd) { bd = dg; mine = gi; }
      });
      res.group = mine !== null ? st.groups[mine] : null;
      var pick = mine !== null && plan ? st.groups[mine].options[plan.choice[mine]] : null;
      res.planHost = pick ? pick.host : null;
      var unsafe = [];
      st.hosts.forEach(function (h) {
        var dh = FQ.km(lat, lon, h.lat, h.lon);
        if (!h.safe && !h.local && dh <= CAP_KM) unsafe.push([dh, h.name.replace(/ \(.*\)$/, '')]);
      });
      unsafe.sort(function (a, b) { return a[0] - b[0]; });
      res.unsafeNear = unsafe.length;
      res.unsafeNames = unsafe.map(function (u) { return u[1]; });
      // join whichever highway within 20 km gets you out first; the drive to it is on local streets
      // (35% longer than a straight line, at 45 km/h, as in floodq/evac.py)
      var entries = P.nearNodes(lat, lon, 20).slice(0, 60);
      var access = {};
      entries.forEach(function (e) { access[e.node] = 1.35 * e.km; });
      var gather = function (dep) {
        var search = P.search(entries.map(function (e) { return { node: e.node, t: dep + access[e.node] / 45 }; }), null, D.openUntil, mult);
        var cands = [], tooLate = 0, tooLong = 0;
        st.hosts.forEach(function (h, hi) {
          if (!h.safe) return;
          if (h.local && h.id !== 'local-' + fips) return;
          var crow = FQ.km(lat, lon, h.lat, h.lon);
          if (crow < 3 || crow > FAR_KM) return;
          var o = { host: hi, h: h, crow: crow, far: crow > CAP_KM, local: !!h.local };
          if (h.local) {
            if (crow > 50) return;
            // high ground in your own county over the local street grid, before tropical-storm winds
            var hl = 1.35 * crow / 45;
            o.edges = []; o.hours = hl; o.km = 1.35 * crow; o.firstKm = 0;
            o.latest = res.tsHour !== null ? Math.floor(res.tsHour - hl + 1e-6) : null;
            o.legs = [{ ref: 'local streets', km: o.km, dir: '' }];
            o.hazard = [];
            o.minSlack = res.tsHour !== null ? res.tsHour - hl - dep : Infinity;
            o.floodKm = 0;
            o.avgMult = 1;
          } else {
            var edges = P.path(search, h.node);
            if (edges === null) { tooLate++; return; }
            var start = search.origin[h.node];
            var firstKm = access[start], firstH = firstKm / 45;
            var tm = P.timing(edges, D.openUntil, mult);
            var lim = tm.latest - firstH;
            if (res.tsHour !== null) lim = Math.min(lim, res.tsHour - firstH);
            o.edges = edges; o.start = start; o.firstKm = firstKm;
            o.hours = tm.hours + firstH; o.km = tm.km + firstKm;
            o.latest = isFinite(lim) ? Math.floor(lim + 1e-6) : null;
            o.legs = P.legs(start, edges);
            if (firstKm >= 3) o.legs.unshift({ ref: 'local streets', km: firstKm, dir: '' });
            // hours between passing each road and its closing (or tropical-storm winds reaching it);
            // km through the flood footprint once the route has left the footprint it starts in
            // (getting out of your own zone is the same for every route); how slow the traffic is
            var t = dep + firstH, hz = [], minSlack = res.tsHour !== null ? res.tsHour - firstH - dep : Infinity;
            var out = false, fk = 0, mk = 0, ks = 0;
            for (var q = 0; q < edges.length; q++) {
              var ei = edges[q], slack = D.openUntil[ei] - t, ekm = P.edges[ei].km;
              if (slack < minSlack) minSlack = slack;
              if (slack < HAZARD_SLACK_H) hz.push(ei);
              t += P.t0[ei] * mult[ei];
              if (!out && D.edgeFloodKm[ei] < 0.5 * ekm) out = true;
              if (out) fk += D.edgeFloodKm[ei];
              mk += ekm * mult[ei];
              ks += ekm;
            }
            o.hazard = hz;
            o.minSlack = minSlack;
            o.floodKm = fk;
            o.avgMult = ks > 0 ? mk / ks : 1;
          }
          if (o.latest !== null && o.latest < dep) { tooLate++; return; }
          if (o.hours > MAX_HOURS) { tooLong++; return; }
          o.load = loads[hi] || 0;
          o.fill = h.cap > 0 ? o.load / h.cap : 0;
          o.inPlan = res.planHost === hi;
          o.margin = o.latest === null ? null : o.latest - dep;
          o.route = routeOf(lat, lon, o);
          cands.push(o);
        });
        return { cands: cands, tooLate: tooLate, tooLong: tooLong, depart: dep };
      };
      // depart at the order (or now, once it is out); if every way out closes before then, see
      // whether leaving earlier (as early as the model has an order time, but never in the past)
      // still works, and say so
      var got = gather(depart);
      res.early = false;
      var earlier = Math.max(S.prep.stages[0].hour, Math.ceil(S.t - 1e-6));
      if (!got.cands.length && res.verdict !== 'stay' && depart <= st.hour && earlier < depart) {
        var g2 = gather(earlier);
        if (g2.cands.length) { got = g2; res.early = true; }
      }
      var cands = got.cands;
      res.depart = got.depart;
      res.tooLate = got.tooLate;
      res.tooLong = got.tooLong;
      // a realistic reach: destinations within CAP_MI. Only when you must leave and no regional
      // destination within CAP_MI works do farther ones (up to FAR_KM) come in, flagged as such.
      var near = cands.filter(function (o) { return !o.far; });
      var farC = cands.filter(function (o) { return o.far; });
      var nearRegional = near.filter(function (o) { return !o.local; });
      res.farDropped = farC.length;
      res.farOnly = false;
      if (!nearRegional.length && farC.length && res.verdict === 'go') {
        cands = near.concat(farC);
        res.farOnly = true;
        res.farDropped = 0;
      } else {
        cands = near;
      }
      // local triage: when every regional way out closes within TRIAGE_H (or none can be reached
      // before the roads close), high ground nearby comes first
      var localO = cands.filter(function (o) { return o.local; })[0] || null;
      var regional = cands.filter(function (o) { return !o.local; });
      var bestMargin = -Infinity;
      regional.forEach(function (o) { bestMargin = Math.max(bestMargin, o.margin === null ? 99 : o.margin); });
      res.bestMargin = regional.length ? bestMargin : null;
      res.triage = !!localO && res.verdict === 'go' && (regional.length ? bestMargin < TRIAGE_H : res.tooLate > 0);
      if (localO) localO.triage = res.triage;
      cands.forEach(function (o) { o.cost = ownCost(o); });
      cands.sort(function (a, b) { return a.cost - b.cost; });
      res.feasible = cands.length;
      res.pool = cands.slice(0, N_POOL);
      if (!res.pool.length) {
        if (res.verdict !== 'stay') res.verdict = 'late';
        return res;
      }
      // shared road beyond each route's first 10 km (routes from one street always share a start)
      res.pool.forEach(function (o, i) {
        o.id = i;
        o.trunk = {};
        o.trunkKm = 0;
        var acc2 = o.firstKm || 0;
        o.edges.forEach(function (ei) {
          var e = P.edges[ei];
          if (acc2 >= 10) { o.trunk[ei] = e.km; o.trunkKm += e.km; }
          acc2 += e.km;
        });
      });
      for (var a = 0; a < res.pool.length; a++) {
        for (var b = a + 1; b < res.pool.length; b++) {
          var A = res.pool[a], B = res.pool[b], shared = 0;
          for (var key in A.trunk) if (B.trunk[key] !== undefined) shared += A.trunk[key];
          if (shared <= 0) continue;
          var ov = shared / Math.max(5, Math.min(A.trunkKm, B.trunkKm));
          if (ov > 0.02) res.quad.push([a, b, OVERLAP_W * Math.min(1, ov), shared]);
        }
      }
      return res;
    }

    // Which routes to show. A circuit with one qubit per candidate picks exactly K_SHOW: each
    // should be safe and quick, and together they should share as little road as possible, so one
    // closed or jammed highway cannot take out every option. Objective: the routes' own costs
    // (the safest single route counts PRIMARY_W lower: it is the one you take if every road stays
    // open) plus OVERLAP_W times the share of road each pair has in common.
    function chooseRoutes(res) {
      var pool = res.pool, n = pool.length, k = Math.min(K_SHOW, n);
      res.qaoa = null;
      if (n > k) {
        var lin = pool.map(function (o, i) { return o.cost - (i === 0 ? PRIMARY_W : 0); });
        var quad = res.quad.map(function (q) { return [q[0], q[1], q[2]]; });
        var key = lin.map(function (x) { return x.toFixed(5); }).join(',') + '|' + quad.map(function (q) { return q[0] + ':' + q[1] + ':' + q[2].toFixed(5); }).join(',');
        var sel, tr;
        if (S.qcache && S.qcache.key === key) { sel = S.qcache.sel; tr = S.qcache.tr; }
        else {
          sel = new FQ.Selection(n, k, lin, quad);
          tr = sel.train(ROUTE_LAYERS, ROUTE_ALPHA, 7);
          S.qcache = { key: key, sel: sel, tr: tr };
        }
        var counts = sel.sample(tr.probs, SHOTS, 1000 + res.cell);
        var best = -1;
        for (var t = 0; t < sel.M; t++) if (counts[t] > 0 && (best < 0 || sel.costs[t] < sel.costs[best] - 1e-12)) best = t;
        res.qaoa = { sel: sel, tr: tr, counts: counts, shots: SHOTS, best: sel.states[best], optimum: sel.states[sel.optimum],
                     stats: sel.circuitStats(ROUTE_LAYERS), source: 'emulation', measured: null, pending: false };
        applyMask(res, sel.states[best]);
      } else {
        applyMask(res, (1 << n) - 1);
      }
    }
    function applyMask(res, mask) {
      res.mask = mask;
      res.options = res.pool.filter(function (o, i) { return (mask >> i) & 1; })
        .sort(function (a, b) { return a.cost - b.cost; });
    }
    // the K_SHOW cheapest routes on their own, ignoring shared roads (the pool is sorted by cost)
    function greedyMask(res) { return (1 << Math.min(K_SHOW, res.pool.length)) - 1; }
    // the whole objective for a set of routes, and what it means on the road
    function scoreSet(res, mask) {
      var chosen = res.pool.filter(function (o, i) { return (mask >> i) & 1; });
      var use = {}, worst = 0, worstRef = '';
      chosen.forEach(function (o) {
        for (var e in o.trunk) {
          use[e] = (use[e] || 0) + 1;
          if (use[e] > worst) {
            worst = use[e];
            var ref = P.edges[+e].ref;
            worstRef = ref === 'connector' || ref === 'link' ? '' : ref;
          }
        }
      });
      var cost = 0, shared = 0;
      res.pool.forEach(function (o, i) { if ((mask >> i) & 1) cost += o.cost - (i === 0 ? PRIMARY_W : 0); });
      res.quad.forEach(function (q) {
        if (((mask >> q[0]) & 1) && ((mask >> q[1]) & 1)) { cost += q[2]; shared += q[3]; }
      });
      var nC = Math.max(1, chosen.length);
      return { cost: cost, n: chosen.length, shared: shared, worst: Math.max(1, worst), worstRef: worstRef,
               avgH: chosen.reduce(function (s2, o) { return s2 + o.hours; }, 0) / nC,
               room: chosen.filter(function (o) { return o.fill < 1; }).length,
               hu: chosen.reduce(function (s2, o) { return s2 + o.h.p_hu; }, 0) / nC,
               floodKm: chosen.reduce(function (s2, o) { return s2 + o.floodKm; }, 0) / nC,
               primary: (mask & 1) === 1 };
    }

    // =========================================================================
    // the flood chance where you are (amplitude estimation), emulated when there is no Python
    // =========================================================================
    function mlae(hits, shots, sched) {
      var ll = function (t) {
        var s = 0;
        for (var q = 0; q < sched.length; q++) {
          var pr = clamp(Math.pow(Math.sin((2 * sched[q] + 1) * t), 2), 1e-12, 1 - 1e-12);
          s += hits[q] * Math.log(pr) + (shots[q] - hits[q]) * Math.log(1 - pr);
        }
        return s;
      };
      var grid = 3000, best = -Infinity, bt = 0, g, v;
      for (g = 0; g < grid; g++) {
        var t = (g + 0.5) / grid * Math.PI / 2;
        v = ll(t);
        if (v > best) { best = v; bt = t; }
      }
      var lo = bt - Math.PI / 2 / grid, hi = bt + Math.PI / 2 / grid;
      for (g = 0; g <= 400; g++) {
        var t2 = lo + (hi - lo) * g / 400;
        v = ll(t2);
        if (v > best) { best = v; bt = t2; }
      }
      var a = Math.pow(Math.sin(bt), 2), fisher = 0;
      for (var q2 = 0; q2 < sched.length; q2++) fisher += 4 * shots[q2] * Math.pow(2 * sched[q2] + 1, 2);
      var sd = Math.abs(Math.sin(2 * bt)) / Math.sqrt(fisher);
      return { a: a, sd: sd, ci95: [Math.max(0, a - 1.96 * sd), Math.min(1, a + 1.96 * sd)] };
    }
    function emulateSpot(lat, lon, si, shots) {
      var c = cellIndex(lat, lon);
      if (c < 0) return { ok: false };
      var st = S.prep.stages[si], ds = S.D.stages[si];
      var off = S.info.model.level_offset, step = S.info.model.level_step;
      var z = S.D.zEff[c], seg = G.segOf[c];
      var w = st.weights, f = [], a = 0;
      for (var m = 0; m < w.length; m++) {
        var lv = ds.segPeak[m * G.nseg + seg] * step - off;
        var hit = z < 98 && lv - z >= 0.5 ? 1 : 0;
        f.push(hit);
        a += w[m] * hit;
      }
      a = clamp(a, 0, 1);
      var th = Math.asin(Math.sqrt(a)), sched = [0, 1, 2, 4], rnd = FQ.rng32(1000 + c);
      var hits = sched.map(function (k) {
        var p1 = Math.pow(Math.sin((2 * k + 1) * th), 2), n = 0;
        for (var s = 0; s < shots; s++) if (rnd() < p1) n++;
        return n;
      });
      var tot = sched.map(function () { return shots; });
      var est = mlae(hits, tot, sched);
      var calls = sched.reduce(function (acc, k) { return acc + shots * (2 * k + 1); }, 0);
      return { ok: true, exact: a, estimate: est.a, ci95: est.ci95, mlae_sd: est.sd,
               mc_sd_same_calls: Math.sqrt(Math.max(a * (1 - a), 1e-9) / calls), hits: hits, shots: tot,
               schedule: sched, oracle_calls: calls, weights: w, f: f, source: 'emulation', backend: 'none',
               tracks_flooding: f.reduce(function (x, y) { return x + y; }, 0), why_emulated: 'no Python in this view' };
    }

    // On Qollab: ONE job for your place (engine.personal): the route circuit with the angles trained
    // here, plus the four amplitude-estimation circuits. Elsewhere: sampled from their exact output.
    function quantumForPlace(res) {
      var wantQae = res.pSurge > 0;
      res.qae = null;
      if (MODE === 'offline' || !engine.personal) {
        if (wantQae) res.qae = emulateSpot(res.qlat, res.qlon, S.stageIdx, SHOTS);
        return;
      }
      if (!wantQae && !res.qaoa) return;
      if (res.qaoa) res.qaoa.pending = true;
      res.qaePending = wantQae;
      var params = { lat: res.qlat, lon: res.qlon, stage: S.stageIdx, shots: SHOTS, qae: wantQae };
      if (res.qaoa) {
        var Q = res.qaoa;
        params.route = { n: Q.sel.n, k: Q.sel.k, lin: Q.sel.lin, quad: Q.sel.quad, gammas: Q.tr.gammas, betas: Q.tr.betas,
                         predicted: Q.sel.states.map(function (m, t) { return [m, Q.tr.probs[t]]; }) };
      }
      var job = function () {
        return Promise.resolve(engine.personal.callPromisingKwargs(BACKEND, { params: JSON.stringify(params) }))
          .then(function (j) { return JSON.parse(j); });
      };
      var p = S.pyChain.then(job, job);
      S.pyChain = p.catch(function () {});
      p.then(function (r) {
        if (S.you !== res) return;
        res.qaePending = false;
        if (r.qae) res.qae = r.qae;
        if (r.route && res.qaoa) {
          var Q2 = res.qaoa;
          Q2.pending = false;
          Q2.measured = r.route;
          Q2.source = r.source;
          Q2.backend = r.backend;
          Q2.why = r.why_emulated;
          if (r.route.best !== null && r.route.best !== undefined && r.route.best !== res.mask) {
            var old = res.options[S.sel] ? res.options[S.sel].host : null;
            applyMask(res, r.route.best);
            S.sel = Math.max(0, res.options.map(function (o) { return o.host; }).indexOf(old));
            toast('Route choice updated with the run on ' + r.backend + '.');
          }
        }
        afterPlan(res, false);
      }, function (err) {
        if (S.you !== res) return;
        res.qaePending = false;
        if (res.qaoa) { res.qaoa.pending = false; res.qaoa.error = err && err.message ? err.message : String(err); }
        if (res.pSurge > 0) res.qae = emulateSpot(res.qlat, res.qlon, S.stageIdx, SHOTS);
        afterPlan(res, false);
      });
    }

    // =========================================================================
    // who is at risk around a place, and what is at stake: residents in the alert area and the
    // county, water depth, the roads that close, and what the statewide plan can and cannot move
    // =========================================================================
    function computeImpact(res) {
      var D = S.D, si = S.stageIdx, ds = D.stages[si], st = S.prep.stages[si];
      var Z = ds.zones, lat = res.lat, lon = res.lon;
      var A = { pop: 0, z2: 0, z1: 0, low: 0, high: 0, bands: [0, 0, 0], worstLow: 0 };
      var dLat = AREA_KM / 111.32, dLon = AREA_KM / (111.32 * Math.cos(lat * Math.PI / 180));
      var i0 = Math.max(0, Math.floor((G.latMax - lat - dLat) / G.d)), i1 = Math.min(G.ny - 1, Math.floor((G.latMax - lat + dLat) / G.d));
      var j0 = Math.max(0, Math.floor((lon - dLon - G.lonMin) / G.d)), j1 = Math.min(G.nx - 1, Math.floor((lon + dLon - G.lonMin) / G.d));
      var cells = [];
      for (var i = i0; i <= i1; i++) {
        for (var j = j0; j <= j1; j++) {
          var c = i * G.nx + j;
          if (!modelledLand(c)) continue;
          if (FQ.km(lat, lon, G.latMax - (i + 0.5) * G.d, G.lonMin + (j + 0.5) * G.d) > AREA_KM) continue;
          var pop = G.pop[c];
          A.pop += pop;
          if (Z[c] === 2) A.z2 += pop; else if (Z[c] === 1) A.z1 += pop;
          if (D.zEff[c] < 98) {
            cells.push(c);
            var dpk = D.maxLevel[G.segOf[c]] - D.zEff[c];
            if (dpk >= 0.5) { A.low += pop; A.bands[dpk < 1 ? 0 : dpk < 2 ? 1 : 2] += pop; } else A.high += pop;
            if (ds.segWorst[G.segOf[c]] - D.zEff[c] >= 0.5) A.worstLow += pop;
          } else {
            A.high += pop;
          }
        }
      }
      res.areaCells = Int32Array.from(cells);
      var C = null;
      res.sirenPts = [];
      if (res.ci >= 0) {
        var cc = G.countyCells[res.ci];
        C = { name: res.county, pop: 0, z2: 0, z1: 0, low: 0 };
        for (var q = 0; q < cc.length; q++) {
          var c2 = cc[q], p2 = G.pop[c2];
          C.pop += p2;
          if (Z[c2] === 2) C.z2 += p2; else if (Z[c2] === 1) C.z1 += p2;
          if (D.zEff[c2] < 98 && D.maxLevel[G.segOf[c2]] - D.zEff[c2] >= 0.5) C.low += p2;
        }
        C.leaving = 0;
        C.stranded = 0;
        st.groups.forEach(function (g2) {
          if (g2.county !== res.ci) return;
          if (g2.options && g2.options.length) C.leaving += g2.people; else C.stranded += g2.people;
        });
        C.mobile = st.mobile_by_county[res.county] || 0;
        C.remaining = C.z2 * (1 - S.info.assumptions.leave_in_zone) + C.stranded;
        res.sirenPts = sirenPoints(cc, Z);
      }
      // roads within the alert area that close (under water, or a bridge shut by wind): the first
      // to close (the nearest one when several close in the same hour, a named road before a
      // connector), the first under water, and how many close at all
      var firstW = Infinity, firstX = Infinity, nRisk = 0, kmRisk = 0, firstRef = '', road = null;
      for (var e = 0; e < P.edges.length; e++) {
        if (D.firstWater[e] === Infinity && D.firstShut[e] === Infinity) continue;
        var gp = G.edgePts[e], dmin = Infinity;
        for (var v2 = 0; v2 < gp.length; v2++) dmin = Math.min(dmin, FQ.km(lat, lon, gp[v2][0], gp[v2][1]));
        if (dmin > AREA_KM) continue;
        nRisk++;
        kmRisk += P.edges[e].km;
        var ref = P.edges[e].ref;
        var named = ref !== 'connector' && ref !== 'link';
        if (D.firstWater[e] < firstW) {
          firstW = D.firstWater[e];
          firstRef = named ? ref : '';
        }
        if (D.firstShut[e] < firstX) firstX = D.firstShut[e];
        var tc = Math.min(D.firstWater[e], D.firstShut[e]);
        if (!road || tc < road.h - 1e-9 || (Math.abs(tc - road.h) < 1e-9 && (named && !road.named || named === road.named && dmin < road.km))) {
          road = { h: tc, km: dmin, ref: ref, named: named, kind: D.firstWater[e] <= D.firstShut[e] ? 'water' : 'wind' };
        }
      }
      res.impact = { area: A, county: C, breach: firstW === Infinity ? null : firstW, breachRef: firstRef,
                     shut: firstX === Infinity ? null : firstX, roadsAtRisk: nRisk, roadsAtRiskKm: kmRisk, road: road };
    }
    // where the sirens sound: the most populated parts of the county's evacuation zone, 6 km apart
    function sirenPoints(cells, Z) {
      var list = [];
      for (var q = 0; q < cells.length; q++) { var c = cells[q]; if (Z[c] === 2 && G.pop[c] > 0) list.push(c); }
      list.sort(function (a, b) { return G.pop[b] - G.pop[a]; });
      var pts = [];
      for (var k = 0; k < list.length && pts.length < 8; k++) {
        var c2 = list[k], la = G.latMax - (Math.floor(c2 / G.nx) + 0.5) * G.d, lo = G.lonMin + (c2 % G.nx + 0.5) * G.d;
        var ok = true;
        for (var m = 0; m < pts.length; m++) if (FQ.km(la, lo, pts[m][0], pts[m][1]) < 6) { ok = false; break; }
        if (ok) pts.push([la, lo]);
      }
      return pts;
    }

    // The alert for a place: an evacuation order where you are, an order elsewhere in your county
    // or alert area (everyone there hears the siren; the message says who must leave), be ready,
    // too late to drive, or nothing.
    var ALERT_RANK = { none: 0, ready: 1, area: 2, evac: 3, late: 4 };
    function alertFor(res) {
      if (res.verdict === 'outside' || res.verdict === 'water') return { level: 'none', siren: false, color: '#4fd8ff' };
      var I = res.impact || {}, C = I.county, A = I.area || { z2: 0, z1: 0 };
      if (res.verdict === 'late') return { level: 'late', siren: true, color: '#ff4d6d' };
      if (res.verdict === 'go') return { level: 'evac', siren: true, color: '#ff4d6d' };
      if ((C && C.z2 >= 200) || A.z2 >= 100) return { level: 'area', siren: true, color: '#ff7a3d' };
      if (res.verdict === 'ready' || A.z1 >= 300) return { level: 'ready', siren: false, color: '#ffb547' };
      return { level: 'none', siren: false, color: '#2ee59d' };
    }

    // =========================================================================
    // planning for a place
    // =========================================================================
    function buildPlan(lat, lon) {
      var st = S.prep.stages[S.stageIdx];
      var depart = Math.max(st.hour, Math.ceil(S.t - 1e-6));
      var res = computeOptions(lat, lon, depart);
      if (res.verdict !== 'outside' && res.verdict !== 'water') {
        if (res.pool.length) chooseRoutes(res);
        computeImpact(res);
      }
      res.alert = alertFor(res);
      return res;
    }
    function planAt(lat, lon, opts) {
      opts = opts || {};
      if (!S.ready || S.busy) return;
      var k0 = cellIndex(lat, lon);
      var onLand = k0 >= 0 && (modelledLand(k0) || nearestLandCell(lat, lon, 3) >= 0);
      var choice = onLand ? scenarioChoice(lat, lon) : null;
      var want = opts.preset || (choice ? choice.best : S.preset);
      var go = function () {
        S.choice = choice;
        var res = buildPlan(lat, lon);
        S.you = res;
        S.sel = 0;
        S.hover = null;
        S.picked = false;
        S.flowKey = null;
        quantumForPlace(res);
        afterPlan(res, true);
        if (opts.fly !== false) flyTo(res);
        if (!opts.keepText) $('you-search').value = res.place || (res.county ? res.county + ' County' : '');
        announce(res, null);
      };
      if (want !== S.preset) {
        S.preset = want;
        runAll().then(function () { if (S.prep && S.preset === want) go(); });
      } else go();
    }
    function afterPlan(res, fresh) {
      renderResults(res, fresh);
      if (staticLayer) staticLayer.redraw();
      buildEvents();
      S.band = null;
      setFlow();
      updateDanger(S.t);
      drawTimeline();
    }
    // the storm clock moved (after a pause or a jump): leaving now is a different plan. After
    // landfall the plan stays as it was (the panel marks the deadlines that have passed).
    function replanForTime() {
      var Y = S.you;
      if (!Y || !S.prep || Y.cell < 0 || S.busy || !S.ready || S.t > 0) return;
      var st = S.prep.stages[S.stageIdx];
      var depart = Math.max(st.hour, Math.ceil(S.t - 1e-6));
      if (depart === Y.depart && !Y.early) return;
      var oldHost = Y.options[S.sel] ? Y.options[S.sel].host : null;
      var res = buildPlan(Y.lat, Y.lon);
      res.qae = Y.qae;
      res.qaePending = false;
      if (res.qaoa && Y.qaoa && Y.qaoa.measured && res.mask !== Y.mask) res.qaoa.retimed = true;
      S.you = res;
      var idx = res.options.map(function (o) { return o.host; }).indexOf(oldHost);
      S.sel = idx >= 0 ? idx : 0;
      afterPlan(res, false);
      announce(res, Y);
    }
    function flyTo(res) {
      var pts = [[res.lat, res.lon]];
      var dLat = AREA_KM / 111.32, dLon = AREA_KM / (111.32 * Math.cos(res.lat * Math.PI / 180));
      pts.push([res.lat + dLat, res.lon], [res.lat - dLat, res.lon], [res.lat, res.lon + dLon], [res.lat, res.lon - dLon]);
      (res.options || []).forEach(function (o) { pts.push([o.h.lat, o.h.lon]); (o.route || []).forEach(function (p) { pts.push(p); }); });
      var p = padding();
      map.flyToBounds(L.latLngBounds(pts), { paddingTopLeft: p.tl, paddingBottomRight: p.br, maxZoom: 10, duration: 1.1 });
    }
    // a click on a card highlights that route and its destination and dims the others; a second
    // click on the same card shows all of them again
    function focusRoute(i) {
      var Y = S.you;
      if (!Y || !Y.options[i]) return;
      var off = S.picked && S.sel === i;
      S.sel = i;
      S.picked = !off;
      document.querySelectorAll('.fq-card').forEach(function (b) {
        var on = S.picked && +b.dataset.i === i;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var list = document.querySelector('.fq-cards');
      if (list) list.classList.toggle('picked', S.picked);
      setFlow();
      if (off) {
        flyTo(Y);
        say('All ' + Y.options.length + ' routes shown.');
        return;
      }
      var o = Y.options[i], pts = [[Y.lat, Y.lon], [o.h.lat, o.h.lon]].concat(o.route || []);
      var p = padding();
      map.flyToBounds(L.latLngBounds(pts), { paddingTopLeft: p.tl, paddingBottomRight: p.br, maxZoom: 10, duration: 0.8 });
      say('Route ' + (i + 1) + ': ' + o.h.name + ', ' + miles(o.km) + ', about ' + dur(o.hours) + '.');
    }

    // =========================================================================
    // map views. The + and - buttons (and the mouse wheel, a pinch, the + and - keys) zoom in and
    // out; the buttons under them show the whole storm (its track over the storm clock, its wind
    // field now, the cone, and your place), your place and routes, or all of Florida; Follow keeps
    // the storm in view while the clock runs; Bigger map hides the panel. When the storm is off
    // the map, an arrow at the edge points to it, and a click on it shows the whole storm.
    // Keys: F whole storm, R your routes, H all of Florida, M bigger map.
    // =========================================================================
    function addCircle(pts, lat, lon, km) {
      var dLat = km / 111.32, dLon = km / (111.32 * Math.cos(lat * Math.PI / 180));
      pts.push([lat + dLat, lon], [lat - dLat, lon], [lat, lon + dLon], [lat, lon - dLon]);
    }
    function stormKm(cur) {          // the radius of the rain bands and clouds, as drawStorm draws them
      var r34 = cur.radii ? Math.max(cur.radii[0][0], cur.radii[1][0], cur.radii[2][0], cur.radii[3][0]) : 120;
      return Math.max(r34, 60) * 1.852 * 1.15;
    }
    function viewStorm() {
      if (!S.prep) { viewFlorida(); return; }
      var tr = S.prep.track, st = S.prep.stages[S.stageIdx], cur = trackAt(S.t), pts = [];
      for (var i = 0; i < tr.hours.length; i++) if (tr.hours[i] >= T_MIN) pts.push([tr.lat[i], tr.lon[i]]);   // the track as drawn
      addCircle(pts, cur.lat, cur.lon, stormKm(cur));
      if (S.t <= 6) (st.cone || []).forEach(function (c) { if (c[0] <= 12) addCircle(pts, c[1], c[2], c[3]); });
      if (S.you && S.you.verdict !== 'outside' && S.you.verdict !== 'water') {
        pts.push([S.you.lat, S.you.lon]);
        (S.you.options || []).forEach(function (o) { pts.push([o.h.lat, o.h.lon]); });
      }
      var p = padding(), m = 24;                    // a little room around the storm's winds
      map.flyToBounds(L.latLngBounds(pts), { paddingTopLeft: [p.tl[0] + m, p.tl[1] + m], paddingBottomRight: [p.br[0] + m, p.br[1] + m],
                                             maxZoom: 8, duration: 0.9 });
      say('The whole storm is in view: its track, its winds now and the cone.');
    }
    function viewRoutes() {
      if (S.you && S.you.options) { flyTo(S.you); return; }
      toast('Enter your location first, then press Find My Safest Routes.', 3000);
      viewFlorida();
    }
    function viewFlorida() {
      var p = padding();
      map.flyToBounds(L.latLngBounds([[24.4, -87.6], [31.0, -80.0]]), { paddingTopLeft: p.tl, paddingBottomRight: p.br, maxZoom: 9, duration: 0.8 });
    }
    function setPressed(id, on) {
      var b = $(id);
      if (!b) return;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('on', !!on);
    }
    // the part of the map not covered by the top bar, the panel and the storm clock
    function visibleBox() {
      var size = map.getSize(), p = padding();
      return { x0: Math.max(8, p.tl[0] - 50), y0: Math.max(8, p.tl[1] - 14),
               x1: Math.min(size.x - 8, size.x - p.br[0] + 26), y1: Math.min(size.y - 8, size.y - p.br[1] + 30) };
    }
    function centerOn(lat, lon) {
      var b = visibleBox(), pt = map.latLngToContainerPoint([lat, lon]);
      map.panBy([pt.x - (b.x0 + b.x1) / 2, pt.y - (b.y0 + b.y1) / 2], { animate: true, duration: 0.6 });
    }
    function toggleFollow(on) {
      S.follow = on === undefined ? !S.follow : !!on;
      setPressed('view-follow', S.follow);
      S.followT = null;
      if (S.follow && S.prep) {
        var cur = trackAt(S.t);
        centerOn(cur.lat, cur.lon);
        toast('Following the storm. Press play to watch it come ashore; drag the map to stop.', 3200);
      }
    }
    // while following: pan just enough to keep the eye (and some of its rain bands) in view
    function followStorm(now) {
      if (!S.follow || !S.prep || S.userDrag || S.t === S.followT || now - (S.followAt || 0) < 300) return;
      S.followT = S.t;
      S.followAt = now;
      var cur = trackAt(S.t), b = visibleBox();
      var pt = map.latLngToContainerPoint([cur.lat, cur.lon]);
      var rpx = Math.abs(map.latLngToContainerPoint([cur.lat + stormKm(cur) / 111.32, cur.lon]).y - pt.y);
      var m = clamp(0.5 * rpx, 30, Math.max(30, Math.min(110, (b.x1 - b.x0) / 3, (b.y1 - b.y0) / 3)));
      var tx = clamp(pt.x, b.x0 + m, b.x1 - m), ty = clamp(pt.y, b.y0 + m, b.y1 - m);
      if (Math.abs(pt.x - tx) < 1 && Math.abs(pt.y - ty) < 1) return;
      map.panBy([pt.x - tx, pt.y - ty], { animate: true, duration: 0.3, easeLinearity: 1 });
    }
    function toggleWide(on) {
      S.wide = on === undefined ? !S.wide : !!on;
      $('fq-app').classList.toggle('wide', S.wide);
      setPressed('view-wide', S.wide);
      $('btn-showpanel').hidden = !S.wide;
      drawTimeline();
      say(S.wide ? 'Panel hidden: the map uses the whole window. Press M or Show panel to bring it back.' : 'Panel shown.');
    }
    // an arrow at the edge of the map toward the storm, when the storm is off the map
    var ptr = { shown: false, x: null, y: null, a: null, text: '', w: 170 };
    function updatePointer() {
      var el = $('storm-ptr');
      if (!el) return;
      var show = false, x = 0, y = 0, ang = 0, text = '';
      if (S.prep && S.ready && !S.busy) {
        var cur = trackAt(S.t), b = visibleBox();
        var pt = map.latLngToContainerPoint([cur.lat, cur.lon]);
        if (pt.x < b.x0 || pt.x > b.x1 || pt.y < b.y0 || pt.y > b.y1) {
          var cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, dx = pt.x - cx, dy = pt.y - cy;
          var hx = (b.x1 - b.x0 - ptr.w) / 2 - 10, hy = (b.y1 - b.y0) / 2 - 28;
          if (hx > 12 && hy > 12) {
            var s = Math.min(hx / Math.max(1e-6, Math.abs(dx)), hy / Math.max(1e-6, Math.abs(dy)));
            x = Math.round(cx + dx * s);
            y = Math.round(cy + dy * s);
            ang = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
            var mine = S.you && S.you.verdict !== 'outside' && S.you.verdict !== 'water';
            var from = mine ? L.latLng(S.you.lat, S.you.lon) : map.containerPointToLatLng([cx, cy]);
            var mi = Math.max(1, Math.round(from.distanceTo([cur.lat, cur.lon]) / 1609.34));
            text = catShort(cur.cat) + ' ' + MIDDOT + ' ' + fmtInt(mi) + ' mi' + (mine ? ' away' : '');
            show = true;
          }
        }
      }
      if (show !== ptr.shown) { el.hidden = !show; ptr.shown = show; }
      if (!show) return;
      if (text !== ptr.text) {
        $('storm-ptr-text').textContent = text;
        ptr.text = text;
        ptr.w = el.offsetWidth || ptr.w;        // the next frame places it by its real width
      }
      if (x !== ptr.x || y !== ptr.y) { el.style.left = x + 'px'; el.style.top = y + 'px'; ptr.x = x; ptr.y = y; }
      if (ang !== ptr.a) { $('storm-ptr-arrow').style.transform = 'rotate(' + ang + 'deg)'; ptr.a = ang; }
    }
    var VIEW_ICON = {
      storm: '<circle cx="10" cy="10" r="2.6"></circle><path d="M7.5 9.2C6.8 5.6 9.6 3 14.5 3.4M12.5 10.8c.7 3.6-2.1 6.2-7 5.8"></path>',
      routes: '<path d="M10 17.5s5-4.8 5-8.7a5 5 0 0 0-10 0c0 3.9 5 8.7 5 8.7z"></path><circle cx="10" cy="8.8" r="1.8"></circle>',
      florida: '<path d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4"></path>',
      follow: '<circle cx="10" cy="10" r="5.2"></circle><circle cx="10" cy="10" r="1.3"></circle><path d="M10 1.8v3M10 15.2v3M1.8 10h3M15.2 10h3"></path>',
      wide: '<path d="M12 3.5h4.5V8M8 16.5H3.5V12M16.5 3.5L11 9M3.5 16.5L9 11"></path>',
    };
    var VIEW_BUTTONS = [
      { id: 'storm', label: 'Show the whole storm', title: 'Whole storm: zoom out to the full hurricane, its track and the coast it hits (F)', run: function () { viewStorm(); } },
      { id: 'routes', label: 'Show your place and routes', title: 'Your place and routes (R)', run: function () { viewRoutes(); } },
      { id: 'florida', label: 'Show all of Florida', title: 'All of Florida (H)', run: function () { viewFlorida(); } },
      { id: 'follow', label: 'Follow the storm', title: 'Follow the storm while the storm clock runs', toggle: true, run: function () { toggleFollow(); } },
      { id: 'wide', label: 'Bigger map', title: 'Bigger map: hide the panel (M)', toggle: true, run: function () { toggleWide(); } },
    ];
    var ViewControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        var box = L.DomUtil.create('div', 'leaflet-bar fq-viewbar');
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Map view');
        VIEW_BUTTONS.forEach(function (b) {
          var el = L.DomUtil.create('button', '', box);
          el.type = 'button';
          el.id = 'view-' + b.id;
          el.title = b.title;
          el.setAttribute('aria-label', b.label);
          if (b.toggle) el.setAttribute('aria-pressed', 'false');
          el.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true">' + VIEW_ICON[b.id] + '</svg>';
          L.DomEvent.on(el, 'click', function (e) { L.DomEvent.stop(e); b.run(); });
        });
        L.DomEvent.disableClickPropagation(box);
        L.DomEvent.disableScrollPropagation(box);
        return box;
      },
    });

    // =========================================================================
    // the right panel: the place, its alert, three risk indicators, the evacuation options
    // =========================================================================
    var DEG = '\u00b0';
    function stormLine() {
      if (!S.prep) return '';
      var p = S.prep.preset, s = S.prep.summary, info = presetInfo(p.id) || {};
      return 'Hypothetical ' + catLabel(s.landfall_cat) + ' ' + MIDDOT + ' ' + (info.tag || p.like) + ' ' + MIDDOT + ' landfall ' + clockLabel(0);
    }
    function approachHtml() {
      var ch = S.choice;
      if (!ch) return '';
      var cur = presetInfo(S.preset), curAp = cur ? cur.approach : null;
      var btns = APPROACHES.map(function (a) {
        var c = ch.by[a.id] || (a.id === curAp ? { id: S.preset, d: ch.bestD } : null);
        var p = c ? presetInfo(c.id) : null;
        var on = a.id === curAp;
        var title = c ? a.label + ': hypothetical storm ' + p.tag + ', passing ' + Math.max(1, Math.round(c.d * 0.621)) + ' mi from here' :
          'No modeled storm from the ' + a.label + ' passes near here';
        return '<button type="button" class="' + (on ? 'on' : '') + '" data-ap="' + a.id + '" data-preset="' + (c ? esc(c.id) : '') + '"' +
          (c ? '' : ' disabled') + ' aria-pressed="' + on + '" title="' + esc(title) + '">' + a.short + '</button>';
      }).join('');
      return '<div class="fq-approach"><span>Storm approach</span><div class="fq-seg" role="group" aria-label="Storm approach">' + btns + '</div></div>';
    }
    function whereOf(res) { return res.place || (res.county ? res.county + ' County' : 'This location'); }
    // the alert for the place: what to do and by when, in two short lines. It comes from the model,
    // so the panel labels it as such; `head` is the title of the banner on the map.
    function statusInfo(res) {
      var C = (res.impact || {}).county;
      var o1 = res.options[0];
      var lb = o1 && o1.latest !== null ? clockLabel(o1.latest) : null;
      var w = res.water, depth = w ? Math.max(w.peak, w.worst) : 0;
      switch (res.alert.level) {
        case 'late':
          return { cls: 'late', head: 'Too late to drive out', title: 'Too late to drive out', line: 'Go to the highest floor of a sturdy building now.' };
        case 'evac':
          if (res.triage) return { cls: 'evac', head: 'Move to high ground now', title: 'Move to high ground now', line: 'Roads out close within ' + TRIAGE_H + ' hours. Shelter in a sturdy building nearby.' };
          if (res.early) return { cls: 'evac', head: 'Leave before the order', title: 'Leave before the order' + (lb ? ', by ' + lb : ''), line: 'Roads out close before the order at ' + clockLabel(res.orderHour) + '.' };
          return { cls: 'evac', head: 'Evacuate', title: 'Evacuate' + (lb ? ' by ' + lb : ' now'),
                   line: depth >= 0.15 ? 'Storm surge up to ' + Math.max(1, feet(depth)) + ' ft is possible here.' : 'This location is in the evacuation zone.' };
        case 'area':
          var t = (C && C.z2 >= 200 ? C.name + ' County' : 'Nearby') + ' evacuation order';
          return { cls: 'area', head: t, title: t, line: 'You are outside the zone. Be ready, and keep roads clear.' };
        case 'ready':
          return { cls: 'ready', head: 'Be ready to leave', title: 'Be ready to leave', line: 'You are just outside the evacuation zone.' };
        default:
          return { cls: 'none', head: 'No evacuation needed', title: 'No evacuation needed',
                   line: res.pHu >= 0.1 ? 'Hurricane winds are possible. Stay indoors, away from windows.' : 'Stay off the roads so others can leave.' };
      }
    }

    // three risk indicators: flood depth, wind, and the first road to close nearby
    var LEVEL = { bad: 'High', warn: 'Moderate', ok: 'Low' };
    function riskRow(name, lvl, value, sub, tip) {
      return '<div class="fq-risk-row"' + (tip ? ' title="' + esc(tip) + '"' : '') + '><div class="fq-risk-k"><span>' + name + '</span>' +
        '<span class="fq-lvl ' + lvl + '">' + LEVEL[lvl] + '</span></div><div class="fq-risk-v">' + esc(value) + '</div>' +
        (sub ? '<div class="fq-risk-s">' + esc(sub) + '</div>' : '') + '</div>';
    }
    function roadName(r) {
      if (!r.ref || r.ref === 'connector' || r.ref === 'link') return 'A local road';
      return r.ref === 'expressway' ? 'An expressway' : r.ref;
    }
    function riskHtml(res) {
      var out = [];
      // flood: the deepest water at this spot on the forecast track and on the worst of 8 tracks,
      // and the chance of more than 0.5 m over the 8 tracks (the amplitude-estimation result)
      var w = res.water, pk = w ? w.peak : 0, wc = w ? w.worst : 0;
      var ft = function (m) { return Math.max(1, feet(m)) + ' ft'; };
      var fl = pk >= 0.9 || wc >= 1.8 ? 'bad' : pk >= 0.15 || wc >= 0.5 ? 'warn' : 'ok';
      var Q = res.qae && res.qae.ok ? res.qae : null;
      var chance = Q ? Q.estimate : res.pSurge;
      var fSub = chance >= 0.01 ? [pct(chance) + ' chance of over 1.5 ft of water.'] : [];
      var fTip = 'Storm surge only; rain and river flooding are not modeled.' + (chance >= 0.01 ? ' The chance is over 8 possible storm tracks' +
        (Q ? ', estimated with quantum amplitude estimation (' + (Q.source === 'backend' ? 'run on ' + Q.backend : 'simulated') + ').' : '.') : '');
      if (pk >= 0.15) {
        if (wc >= pk + 0.3) fSub.push('Up to ' + ft(wc) + ' if the track shifts.');
        out.push(riskRow('Flood Risk', fl, 'Up to ' + ft(pk) + ' of water', fSub.join(' '), fTip));
      } else if (wc >= 0.15) {
        fSub.push('Up to ' + ft(wc) + ' if the track shifts.');
        out.push(riskRow('Flood Risk', fl, 'Dry on the forecast track', fSub.join(' '), fTip));
      } else {
        out.push(riskRow('Flood Risk', 'ok', 'No storm surge expected here', '', fTip));
      }
      // wind: the chance of hurricane-force (or tropical-storm) winds, the peak, when they arrive
      var mph = res.maxWindKt > 0 ? Math.round(res.maxWindKt * 1.15) : 0;
      var wl = res.pHu >= 0.3 ? 'bad' : res.pHu >= 0.05 || res.pTs >= 0.3 ? 'warn' : 'ok';
      var wv = res.pHu >= 0.05 ? pct(res.pHu) + ' chance of hurricane-force winds' :
        res.pTs >= 0.05 ? pct(res.pTs) + ' chance of tropical-storm winds' : 'No damaging winds expected';
      var ws = [];
      if (mph >= 39) ws.push('Up to ' + mph + ' mph.');
      if (res.tsHour !== null) ws.push('Strong winds start ' + clockLabel(res.tsHour) + '.');
      out.push(riskRow('Wind Threat', wl, wv, ws.join(' '), 'Chances over 8 possible storm tracks; speed and timing on the forecast track.'));
      // roads: the first road within AREA_MI to flood or shut, and how far away it is
      var R = res.impact && res.impact.road;
      if (R) {
        var must = res.verdict === 'go' || res.verdict === 'late';
        out.push(riskRow('Road Closures', must && R.h <= 0 ? 'bad' : 'warn', roadName(R) + ': closed from ' + clockLabel(R.h),
          (R.kind === 'water' ? 'Flooding' : 'High winds') + ', ' + (R.km < 1.6 ? 'under 1 mi' : miles(R.km)) + ' away.',
          'The first road within ' + AREA_MI + ' miles to close in this scenario.'));
      } else {
        out.push(riskRow('Road Closures', 'ok', 'No closures expected nearby', '', 'No road within ' + AREA_MI + ' miles closes in this scenario.'));
      }
      return out.join('');
    }

    // one line, only when it matters: a road that closes soon after you pass, flood water on the
    // way, a long trip, or hurricane wind at the destination
    function routeWarning(o) {
      if (o.hazard.length) {
        var slack = Math.max(0, Math.round(o.minSlack));
        return 'Leave on time: a road on the way closes ' + (slack < 1 ? 'right after' : slack + ' h after') + ' you pass.';
      }
      if (o.floodKm >= 4) return 'Passes ' + miles(o.floodKm) + ' through a flood zone.';
      if (o.far) return 'Over ' + CAP_MI + ' miles: nothing closer can be reached in time.';
      if (o.h.p_hu >= 0.1) return 'Hurricane winds possible there. Shelter in a sturdy building.';
      return '';
    }
    function leaveText(o) {
      if (o.latest === null) return '';
      return S.t > o.latest + 0.01 ? 'Deadline passed (' + clockLabel(o.latest) + ')' : 'Leave by ' + clockLabel(o.latest);
    }
    function cardHtml(res, o, i) {
      var on = S.picked && i === S.sel;
      var late = o.latest !== null && S.t > o.latest + 0.01;
      var warn = routeWarning(o), leave = leaveText(o);
      return '<li><button type="button" class="fq-card' + (on ? ' on' : '') + (late ? ' late' : '') + '" data-i="' + i + '" aria-pressed="' + on +
        '" style="--c:' + ROUTE_COLORS[i] + '"><span class="fq-card-num" aria-hidden="true">' + (i + 1) + '</span><span class="fq-card-body">' +
        '<span class="fq-card-lab">' + ROUTE_NAMES[i] + '<span class="fq-sr">, route ' + (i + 1) + '</span></span>' +
        '<span class="fq-card-dest">' + esc(o.h.name) + '</span>' +
        '<span class="fq-card-meta">' + dur(o.hours) + ' ' + MIDDOT + ' ' + miles(o.km) + ' ' + MIDDOT + ' ' + esc(viaOf(o)) + '</span>' +
        (leave ? '<span class="fq-card-leave' + (late ? ' late' : '') + '" data-leave="' + i + '">' + esc(leave) + '</span>' : '') +
        (warn ? '<span class="fq-card-warn">' + esc(warn) + '</span>' : '') + '</span></button></li>';
    }
    // where the route choice came from, in a few words (never claims hardware it did not run on)
    function sourceShort(Q) {
      if (Q.pending) return 'running on ' + (S.be ? S.be.name : 'the backend');
      if (Q.measured && Q.source === 'backend') return 'run on ' + Q.backend;
      return 'simulated';
    }
    function optionsHtml(res) {
      var n = res.options.length, html = '<section class="fq-options"><h3>Evacuation Options</h3>';
      if (!n) {
        html += '<p class="fq-note">' + (res.verdict === 'late' ? 'No route can be completed before the roads close.' :
          res.verdict === 'stay' ? 'No safe destination within ' + CAP_MI + ' miles in this scenario. You do not need to leave: stay in a sturdy building.' :
          'No safe destination within ' + CAP_MI + ' miles can be reached in time.') + '</p>';
        return html + '</section>';
      }
      html += '<ol class="fq-cards' + (S.picked ? ' picked' : '') + '">' + res.options.map(function (o, i) { return cardHtml(res, o, i); }).join('') + '</ol>';
      var notes = [];
      if (n < K_SHOW) notes.push(n === 1 ? 'Only 1 safe destination is within reach.' : 'Only ' + n + ' safe destinations are within reach.');
      if (res.farOnly) notes.push('Nothing within ' + CAP_MI + ' miles is reachable, so farther destinations are shown.');
      if (res.qaoa) notes.push('Chosen from ' + res.pool.length + ' safe routes by quantum optimization (QAOA, ' + sourceShort(res.qaoa) + ').');
      html += notes.map(function (t) { return '<p class="fq-note">' + esc(t) + '</p>'; }).join('');
      return html + '</section>';
    }

    function renderIntro() {
      if (!S.prep) return;
      $('results').innerHTML = '<section class="fq-intro"><h2>Find your safest way out</h2>' +
        '<p>Enter a Florida location or click the map.</p>' +
        '<p class="fq-storm" title="' + esc('Landfall near ' + S.prep.preset.landfall_place) + '">' + esc(stormLine()) + '</p>' +
        '<p class="fq-hint">Press play to watch the storm.</p></section>';
      $('panel').classList.remove('has-results');
    }

    function renderResults(res, fresh) {
      var el = $('results');
      if (res.verdict === 'outside' || res.verdict === 'water') {
        el.innerHTML = '<p class="fq-msg">' + (res.verdict === 'outside' ? 'That spot is outside the model area. Pick a place in Florida.' : 'That spot is open water. Pick a place on land.') + '</p>';
        say(res.verdict === 'outside' ? 'That spot is outside the model area.' : 'That spot is open water.');
        return;
      }
      var stt = statusInfo(res);
      var where = whereOf(res);
      var coords = Math.abs(res.lat).toFixed(2) + DEG + ' N, ' + Math.abs(res.lon).toFixed(2) + DEG + ' W';
      var html = '<section class="fq-loc"><h2 title="' + coords + '">' + esc(where) + '</h2>' +
        '<div class="fq-loc-sub" title="' + coords + '">' + (res.county && res.place ? esc(res.county) + ' County' : coords) + '</div>' +
        approachHtml() + '<p class="fq-storm" title="' + esc('Landfall near ' + S.prep.preset.landfall_place) + '">' + esc(stormLine()) + '</p>' +
        '<div class="fq-status ' + stt.cls + '"><div class="fq-status-k">Modeled alert ' + MIDDOT + ' not an official order</div>' +
        '<strong>' + esc(stt.title) + '</strong><span>' + esc(stt.line) + '</span></div></section>';
      html += '<section class="fq-risk"><h3>Risk at this location</h3>' + riskHtml(res) + '</section>';
      html += optionsHtml(res);
      el.innerHTML = html;
      $('panel').classList.add('has-results');
      if (fresh) {
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
        $('panel-body').scrollTop = 0;
      }
      el.querySelectorAll('.fq-card').forEach(function (b) {
        b.addEventListener('click', function () { focusRoute(+b.dataset.i); });
        b.addEventListener('mouseenter', function () { S.hover = +b.dataset.i; setFlow(); });
        b.addEventListener('mouseleave', function () { S.hover = null; setFlow(); });
        b.addEventListener('focus', function () { S.hover = +b.dataset.i; setFlow(); });
        b.addEventListener('blur', function () { S.hover = null; setFlow(); });
      });
      el.querySelectorAll('[data-ap]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.disabled || S.busy || !S.you || b.dataset.preset === S.preset) return;
          planAt(S.you.lat, S.you.lon, { preset: b.dataset.preset, keepText: true, fly: false });
        });
      });
      S.liveHour = null;
      var s = where + ': ' + stt.title + '.';
      if (res.options.length) s += ' ' + res.options.length + ' options. Route 1: ' + res.options[0].h.name + ', ' + miles(res.options[0].km) + ', about ' + dur(res.options[0].hours) + '.';
      if (fresh) say(s);
    }
    // the parts of the panel that follow the storm clock: departure deadlines that have passed
    function updateLive() {
      var q = Math.floor(S.t * 4);
      if (S.liveHour === q) return;
      S.liveHour = q;
      var Y = S.you;
      if (!Y || !Y.options) return;
      document.querySelectorAll('#results [data-leave]').forEach(function (el) {
        var o = Y.options[+el.dataset.leave];
        if (!o || o.latest === null) return;
        var late = S.t > o.latest + 0.01;
        el.textContent = leaveText(o);
        el.classList.toggle('late', late);
        var card = el.closest('.fq-card');
        if (card) card.classList.toggle('late', late);
      });
    }

    function renderHow() {
      $('tab-how').innerHTML = '<ol class="fq-steps">' +
        '<li>Select a location and storm scenario.</li>' +
        '<li>Evaluate modeled flood, wind, and road hazards.</li>' +
        '<li>Compare feasible evacuation routes using classical analysis and quantum optimization.</li>' +
        '</ol>';
    }

    // =========================================================================
    // spoken alerts (the browser's own voice) and the banner on the map
    // =========================================================================
    var WEEKDAYS_FULL = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
    var DIRS = { N: 'north', NE: 'northeast', E: 'east', SE: 'southeast', S: 'south', SW: 'southwest', W: 'west', NW: 'northwest' };
    function spokenClock(h) {
      var s = clockLabel(h), d = s.slice(0, 3);
      return (WEEKDAYS_FULL[d] || d) + s.slice(3);
    }
    function spokenDur(h) {
      var m = Math.max(1, Math.round(h * 60 / 5) * 5);
      if (m < 60) return m + ' minutes';
      var hh = Math.floor(m / 60), mm = m % 60;
      return hh + (hh === 1 ? ' hour' : ' hours') + (mm ? ' ' + mm + ' minutes' : '');
    }
    function spokenVia(o) {
      var seen = [], out = [];
      (o.legs || []).forEach(function (L2) {
        if (L2.ref === 'local streets' || L2.ref === 'local roads' || L2.km < 8 || seen.indexOf(L2.ref) >= 0) return;
        seen.push(L2.ref);
        var ref = /\d/.test(L2.ref) ? L2.ref.replace(/^I-/, 'Interstate ').replace(/^US /, 'U.S. ') : 'the ' + L2.ref;
        out.push(ref + (L2.dir ? ' ' + DIRS[L2.dir] : ''));
      });
      return out.length ? ', taking ' + out.slice(0, 2).join(', then ') : '';
    }
    function routeWords(o) {
      return o.h.name.replace(/\s*\(([^)]*)\)/, ', $1') + ', ' + Math.max(1, Math.round(o.km * 0.621)) + ' miles, about ' + spokenDur(o.hours);
    }
    // what the voice says: who, what to do, by when, which way. Always marked as a simulation.
    function speechFor(res, kind) {
      var where = res.place || (res.county ? res.county + ' County' : 'this location');
      var o = res.options[0], C = (res.impact || {}).county;
      if (kind === 'deadline') {
        return 'Simulated alert for ' + where + '. This is the last safe time to leave on route 1. If you cannot leave now, go to high ground nearby.';
      }
      switch (res.alert.level) {
        case 'late':
          return 'Simulated emergency alert for ' + where + '. It is too late to drive out. Go to the highest floor of a sturdy building.';
        case 'evac':
          if (res.triage) {
            return 'Simulated emergency alert for ' + where + '. The roads out close within ' + TRIAGE_H + ' hours. Move to high ground nearby now, and shelter in a sturdy building.';
          }
          return 'Simulated emergency alert. Evacuation order for ' + where + '.' +
            (o && o.latest !== null ? ' Leave by ' + spokenClock(o.latest) + '.' : '') +
            (o ? ' The safest route is route 1, to ' + routeWords(o) + spokenVia(o) + '.' : '');
        case 'area':
          return 'Simulated emergency alert. Evacuation order for parts of ' + (C ? C.name + ' County' : 'this area') + '. ' +
            where + ' is outside the zone. Be ready to leave, and keep the roads clear.';
        case 'ready':
          return 'Simulated advisory. ' + where + ' is just outside the evacuation zone. Be ready to leave.';
        default:
          return 'Simulation. No evacuation is needed for ' + where + '.';
      }
    }
    // the banner on the map: each event shows (and sounds) at its own hour on the storm clock,
    // replacing the one before, so the banner never falls behind the storm
    function banner(e) {
      var el = $('banner');
      el.className = 'fq-banner ' + (e.kind || 'info');
      $('banner-kicker').textContent = clockLabel(e.h) + ' ' + MIDDOT + ' ' + e.kicker;
      $('banner-title').textContent = e.title;
      $('banner-sub').textContent = e.sub || '';
      el.hidden = false;
      clearTimeout(banner._t); clearTimeout(banner._t2);
      var hold = e.kind === 'alert' ? 6000 : 4600;
      banner._t = setTimeout(function () { el.classList.add('out'); }, hold);
      banner._t2 = setTimeout(function () { el.hidden = true; el.classList.remove('out'); }, hold + 450);
      if (e.cue && SND) SND.cue(e.cue);
    }
    function hideBanner() {
      clearTimeout(banner._t); clearTimeout(banner._t2);
      $('banner').hidden = true;
    }
    // "230,000"; "1.2 million"
    function people(x) { return x >= 1e6 ? (x / 1e6).toFixed(1) + ' million' : fmtInt(roundPeople(x)); }
    // a new plan for a place: sirens and the spoken alert (only when it is new or gets worse)
    function announce(res, prev) {
      if (!prev) hideBanner();
      if (!res.alert || res.verdict === 'outside' || res.verdict === 'water') return;
      var a = res.alert;
      if (prev) {
        var worse = ALERT_RANK[a.level] > ALERT_RANK[prev.alert.level] || (res.triage && !prev.triage);
        if (!worse) return;
      }
      var stt = statusInfo(res), o = res.options[0];
      if (a.siren) {
        S.alertAt = performance.now();
        if (SND) SND.cue('evacuate');
        var go = a.level === 'evac' && !res.triage && o;
        banner({ h: S.t, kind: 'alert', kicker: 'Simulated emergency alert', title: stt.head + (a.level === 'area' ? '' : ': ' + whereOf(res)),
                 sub: go ? (o.latest !== null ? 'Leave by ' + clockLabel(o.latest) + '. ' : '') + 'Route 1: ' + o.h.name + ', ' + miles(o.km) + '.' : stt.line });
      } else if (a.level === 'ready') {
        if (SND) SND.cue('ready');
      } else if (SND) {
        SND.cue('route');
      }
      if (SND) SND.speak(speechFor(res), a.siren ? 5200 : 700);
    }

    // =========================================================================
    // events on the storm clock: only the ones that change what you should do. The evacuation
    // order, the first road to close (near your place, or the first bridge statewide), your
    // last safe departure, and landfall.
    // =========================================================================
    function topCounties(st) {
      var by = {};
      st.groups.forEach(function (g) { var nm = S.info.counties[g.county] ? S.info.counties[g.county].name : null; if (nm) by[nm] = (by[nm] || 0) + g.people_red; });
      var names = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).slice(0, 3);
      if (!names.length) return '';
      return names.length === 1 ? names[0] + ' County' : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] + ' counties';
    }
    function buildEvents() {
      if (!S.prep || !S.D) return;
      var prep = S.prep, st = prep.stages[S.stageIdx], ev = [];
      var Y = S.you && S.you.cell >= 0 && S.you.alert ? S.you : null;
      var where = Y ? whereOf(Y) : '';
      if (Y && Y.alert.siren && Y.alert.level !== 'late') {
        var C = Y.impact && Y.impact.county;
        var told = C && C.z2 >= 200 ? C.z2 : Y.impact.area.z2;
        ev.push({ h: st.hour, kind: 'alert', cue: 'evacuate', voice: 'order', kicker: 'Evacuation order',
                  title: (C ? C.name + ' County' : where) + ': ' + people(told) + ' residents told to leave',
                  sub: Y.alert.level === 'evac' && Y.options.length ? 'Route 1: ' + Y.options[0].h.name + ', ' + miles(Y.options[0].km) + '.' : 'Be ready to leave.' });
      } else {
        var tc = topCounties(st);
        ev.push({ h: st.hour, kind: 'alert', cue: 'order', kicker: 'Evacuation order', title: people(st.people_red) + ' residents told to leave',
                  sub: tc ? 'Most in ' + tc + '.' : '' });
      }
      var R = Y && Y.impact ? Y.impact.road : null;
      if (R) {
        ev.push({ h: R.h, kind: 'warn', cue: R.kind === 'water' ? 'surge' : 'warn', kicker: 'Road closure',
                  title: roadName(R) + ' closes near ' + where, sub: (R.kind === 'water' ? 'Flooding' : 'High winds') + ', ' + (R.km < 1.6 ? 'under 1 mi' : miles(R.km)) + ' away.' });
      } else if (!Y) {
        var firstClose = null, bname = '';
        prep.roads.close_h.forEach(function (h, e) {
          if (h !== null && P.edges[e].bridge && (firstClose === null || h < firstClose)) { firstClose = h; bname = P.edges[e].ref; }
        });
        if (firstClose !== null && firstClose < 6) {
          ev.push({ h: firstClose, kind: 'warn', cue: 'warn', kicker: 'Road closure', title: 'Bridges start to close in high winds', sub: 'First: ' + bname + '.' });
        }
      }
      if (Y && Y.options.length && Y.verdict !== 'stay' && Y.options[0].latest !== null) {
        ev.push({ h: Y.options[0].latest, kind: 'warn', cue: 'warn', voice: 'deadline', kicker: 'Last safe departure',
                  title: 'Leave now on route 1 to ' + Y.options[0].h.name, sub: 'After this, go to high ground nearby.' });
      }
      var s0 = prep.summary;
      ev.push({ h: 0, kind: 'alert', cue: 'landfall', kicker: 'Landfall', title: catLabel(s0.landfall_cat) + ' at ' + prep.preset.landfall_place.split(',')[0],
                sub: Math.round(s0.landfall_vmax_kt * 1.15) + ' mph winds.' });
      ev = ev.filter(function (e) { return e.h >= T_MIN && e.h <= T_MAX; });
      ev.sort(function (a, b) { return a.h - b.h; });
      S.events = ev;
      S.fired = {};
      ev.forEach(function (e, i) { if (e.h <= S.t) S.fired[i] = true; });
    }
    function fireEvents(prev, now) {
      S.events.forEach(function (e, i) {
        if (S.fired[i] || !(prev < e.h && now >= e.h)) return;
        S.fired[i] = true;
        banner(e);
        if (e.cue === 'evacuate') S.alertAt = performance.now();
        if (e.voice && S.you && SND) SND.speak(speechFor(S.you, e.voice), e.cue === 'evacuate' ? 4800 : 700);
      });
    }

    // =========================================================================
    // the danger level: 0 (calm) to 4 (extreme) at the place in focus (your place, or else the
    // stretch of coast nearest the storm). The storm sound, the level on the play bar and the
    // colour band of the timeline all follow it, and so does how much water is coming.
    // =========================================================================
    var DANGER_NAME = ['Calm', 'Watch', 'Warning', 'Severe', 'Extreme'];
    var DANGER_COLOR = ['#2ee59d', '#7fd4ff', '#ffb547', '#ff7a3d', '#ff4d6d'];
    function dangerStage(x) { return x < 0.8 ? 0 : x < 1.8 ? 1 : x < 2.8 ? 2 : x < 3.6 ? 3 : 4; }
    // wind at a point as a share: 0.4 at the edge of tropical-storm winds, 0.78 at hurricane force
    function windShare(cur, lat, lon) {
      if (!cur.radii) return 0;
      var dy = (lat - cur.lat) * 111.32, dx = (lon - cur.lon) * 111.32 * Math.cos(cur.lat * Math.PI / 180);
      var d = Math.sqrt(dx * dx + dy * dy);
      var ang = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
      var q = cur.radii[ang < 90 ? 0 : ang < 180 ? 1 : ang < 270 ? 2 : 3];
      var r34 = q[0] * 1.852, r50 = q[1] * 1.852, r64 = q[2] * 1.852;
      if (r64 > 0 && d <= r64) return 0.78 + 0.22 * (1 - d / r64);
      if (r50 > 0 && d <= r50) return 0.6 + 0.18 * (r50 - d) / Math.max(r50 - r64, 1);
      if (r34 > 0 && d <= r34) return 0.4 + 0.2 * (r34 - d) / Math.max(r34 - r50, 1);
      return r34 > 0 ? 0.4 * Math.exp(-(d - r34) / 160) : 0.25 * Math.exp(-d / 160);
    }
    // rain rate as a share, from the same profile as floodq/storm.py (peaks just outside the eyewall)
    function rainShare(cur, d) {
      var rm = 1.4 * (cur.rmax || 30) + 10;
      var peak = 6 + 0.16 * Math.max(cur.vmax - 34, 0);
      var rate = d > 600 ? 0 : peak * (d < rm ? 0.35 + 0.65 * d / rm : Math.exp(-(d - rm) / 110));
      return clamp(rate / 22, 0, 1);
    }
    function dangerAt(t) {
      var D = S.D, cur = trackAt(t), Y = (S.you && S.you.cell >= 0 && S.you.alert) ? S.you : null;
      var lat, lon, seg = 0, z = 99;
      if (Y) {
        lat = Y.lat; lon = Y.lon; seg = G.segOf[Y.cell]; z = D.zEff[Y.cell];
      } else {
        var best = 1e9;
        for (var s = 0; s < G.nseg; s += 2) {
          var dd0 = FQ.km(cur.lat, cur.lon, G.segments[s][0], G.segments[s][1]);
          if (dd0 < best) { best = dd0; seg = s; }
        }
        lat = G.segments[seg][0]; lon = G.segments[seg][1]; z = D.zMinSeg[seg];
      }
      var d = FQ.km(cur.lat, cur.lon, lat, lon);
      var wind = windShare(cur, lat, lon), rain = rainShare(cur, d);
      var tf = clamp(t - D.hour0, 0, D.H - 1), t0 = Math.floor(tf), t1 = Math.min(t0 + 1, D.H - 1), fw = tf - t0;
      var level = D.lv(t0, seg) * (1 - fw) + D.lv(t1, seg) * fw;
      var water = z < 98 ? clamp((level - z) / 1.5, 0, 1) : 0;
      var st = S.prep.stages[S.stageIdx];
      var x = 1.4 * clamp((1100 - d) / 800, 0, 1);                                // Watch as the storm comes closer
      if (t >= st.hour && t < 18) x = Math.max(x, !Y ? 1.5 : Y.alert.siren ? 2.2 : Y.alert.level === 'ready' ? 1.9 : 1.2);
      var xw = wind >= 0.4 ? 2.9 + 1.1 * clamp((wind - 0.4) / 0.38, 0, 1) : 2.5 * clamp((wind - 0.2) / 0.2, 0, 1);
      if (Y) {
        // in step with the panel, which times deadlines by the wind field: not Severe before
        // tropical-storm winds reach this place, not Extreme from wind before hurricane winds do
        if (Y.tsHour === null || t < Y.tsHour) xw = Math.min(xw, 2.75);
        if (Y.huHour === null || t < Y.huHour) xw = Math.min(xw, 3.55);
      }
      x = Math.max(x, xw);
      // how much water is coming: the deepest water in the alert area
      var areaW = 0;
      if (Y && Y.areaCells && Y.areaCells.length) {
        var maxD = 0;
        for (var k = 0; k < Y.areaCells.length; k++) {
          var c = Y.areaCells[k], sg = G.segOf[c];
          var dd = D.lv(t0, sg) * (1 - fw) + D.lv(t1, sg) * fw - D.zEff[c];
          if (dd > maxD) maxD = dd;
        }
        areaW = clamp(maxD / 2.5, 0, 1);
        if (maxD > 0.15) x = Math.max(x, 2.5 + 1.5 * areaW);
      }
      if (water > 0.03) x = Math.max(x, 3 + water);
      x = clamp(x, 0, 4);
      return { level: x, stage: dangerStage(x), wind: wind, rain: rain, surge: Math.max(water, 0.8 * areaW),
               where: Y ? (Y.place || 'your location') : 'the coast' };
    }
    function updateDanger(t) {
      if (!S.D || !S.prep) return;
      var dz = dangerAt(t);
      S.danger = dz;
      if (SND) SND.setDanger(dz.level, dz.wind, dz.rain, dz.surge);
      var el = $('level');
      if (el && el.dataset.stage !== String(dz.stage)) {
        el.dataset.stage = String(dz.stage);
        el.style.setProperty('--lv', DANGER_COLOR[dz.stage]);
        $('level-name').textContent = DANGER_NAME[dz.stage];
        el.title = 'Danger ' + (dz.where === 'the coast' ? 'on the coast nearest the storm' : 'at ' + dz.where) + ': ' + DANGER_NAME[dz.stage];
      }
    }
    // the danger level hour by hour for the timeline (recomputed when the place or the storm changes)
    function dangerBand() {
      var Y = S.you;
      var key = S.prepId + ':' + (Y && Y.alert ? Y.lat.toFixed(3) + ',' + Y.lon.toFixed(3) + ',' + Y.alert.level : 'coast');
      if (S.band && S.band.key === key) return S.band.v;
      var hours = S.prep.hours, v = new Float32Array(hours.length);
      for (var i = 0; i < hours.length; i++) v[i] = dangerAt(hours[i]).level;
      S.band = { key: key, v: v };
      return v;
    }

    // =========================================================================
    // the storm clock
    // =========================================================================
    function setTime(t, opts) {
      opts = opts || {};
      if (!S.prep || !S.D) return;
      var prev = S.t;
      S.t = clamp(t, T_MIN, T_MAX);
      $('tl-range').value = S.t;
      $('clock-main').textContent = fmtH(S.t);
      $('clock-sub').textContent = clockLabel(S.t) + ' ' + MIDDOT + ' ' + (S.t < -0.5 ? Math.round(-S.t) + ' h to landfall' : S.t < 0.5 ? 'landfall' : Math.round(S.t) + ' h after landfall');
      var nowMs = performance.now();
      if (S.lastFieldT === null || (!S.playing && Math.abs(S.t - S.lastFieldT) >= 0.01) ||
          (S.playing && nowMs - S.lastFieldMs > 160 && Math.abs(S.t - S.lastFieldT) >= 0.2)) {
        S.lastFieldMs = nowMs;
        updateFields(S.t);
      }
      if (opts.play) fireEvents(prev, S.t);
      updateDanger(S.t);
      drawTimeline();
      updateLive();
    }
    function loop() {
      var now = performance.now();
      if (S.playing && S.prep && !S.busy) {
        var dt = Math.min(0.1, (now - (loop.last || now)) / 1000);
        var nt = S.t + dt * PLAY_RATE;
        if (nt >= T_MAX) { setTime(T_MAX, { play: true }); stopPlay(); }
        else setTime(nt, { play: true });
      }
      loop.last = now;
      if (scene) scene.redraw();
      followStorm(now);
      updatePointer();
      requestAnimationFrame(loop);
    }
    function startPlay() {
      if (!S.prep || S.busy) return;
      if (S.t >= T_MAX - 0.1) { S.t = T_MIN; S.fired = {}; }
      S.events.forEach(function (e, i) { if (e.h <= S.t) S.fired[i] = true; else delete S.fired[i]; });
      S.playing = true;
      $('btn-play').classList.add('playing');
      $('btn-play').setAttribute('aria-label', 'Pause the storm');
      $('playbar').classList.remove('hint');
    }
    function stopPlay() {
      if (!S.playing) return;
      S.playing = false;
      $('btn-play').classList.remove('playing');
      $('btn-play').setAttribute('aria-label', 'Play the storm');
      updateFields(S.t);
      replanForTime();
    }

    // =========================================================================
    // sound: the storm, the sirens and the voice
    // =========================================================================
    function syncSoundUi() {
      $('btn-sound').setAttribute('aria-pressed', S.sound ? 'true' : 'false');
      $('btn-sound').classList.toggle('muted', !S.sound);
      $('sound-box').classList.toggle('off', !S.sound);
    }
    // the voice menu: 'alternate' (a female and a male voice take turns), 'female', 'male' or 'off'
    function applyVoice(mode) {
      if (!SND) return;
      SND.setVoice(mode !== 'off');
      if (mode !== 'off') SND.setVoiceMode(mode);
    }
    function setSound(on) {
      S.sound = on;
      store('floodq-sound', on ? '1' : '0');
      var ok = SND ? SND.enable(on) : false;
      if (on && !ok) toast('This browser cannot play the storm sound.');
      syncSoundUi();
    }
    // browsers start audio only after a click or a key press on the page
    var armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      document.removeEventListener('pointerdown', arm, true);
      document.removeEventListener('keydown', arm, true);
      if (S.sound && SND) SND.enable(true);
    }

    // =========================================================================
    // controls
    // =========================================================================
    function syncFind() {
      var b = $('btn-find');
      b.disabled = !S.ready || S.busy;
      b.textContent = !S.ready ? 'Loading\u2026' : (S.busy ? 'Loading the storm\u2026' : 'Find My Safest Routes');
      document.querySelectorAll('#results [data-ap]').forEach(function (x) { if (S.busy) x.disabled = true; });
    }
    function findTown(q) {
      q = q.trim().toLowerCase();
      if (!q) return null;
      var c = S.cityByName[q];
      if (!c) c = S.info.cities.filter(function (x) { return x[0].toLowerCase().indexOf(q) === 0; })[0];
      if (!c) c = S.info.cities.filter(function (x) { return x[0].toLowerCase().indexOf(q) >= 0; })[0];
      return c || null;
    }
    function wireControls() {
      // Find My Safest Routes. Qollab runs the page in a sandboxed frame that blocks form
      // submission (the browser drops it before any submit event), so the button and the Enter
      // key call this directly; the submit listener stays for pages without that sandbox.
      var lastFind = 0;
      function findFromSearch() {
        var now = Date.now();
        if (now - lastFind < 400) return;          // one search per press, however it arrives
        lastFind = now;
        if (!S.ready) return;
        if (S.busy) { toast('Loading the storm; press Find again in a moment.'); return; }
        var q = $('you-search').value;
        var c = findTown(q);
        if (!c) {
          if (!q.trim() && S.you) { planAt(S.you.lat, S.you.lon); return; }
          toast(q.trim() ? 'No Florida town called "' + q + '" in the list. Pick one from the list, or click the map.' : 'Enter a Florida town, or click the map.');
          return;
        }
        $('you-search').value = c[0];
        $('you-search').blur();
        planAt(c[1], c[2], { keepText: true });
      }
      $('btn-find').addEventListener('click', function (e) { e.preventDefault(); findFromSearch(); });
      $('you-search').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); findFromSearch(); }
      });
      $('ask').addEventListener('submit', function (e) { e.preventDefault(); findFromSearch(); });
      map.on('click', function (e) {
        if (!S.ready) return;
        if (S.busy) { toast('Loading the storm; click again in a moment.'); return; }
        planAt(e.latlng.lat, e.latlng.lng, { fly: true });
      });
      // no storm sound from a tab in the background
      document.addEventListener('visibilitychange', function () {
        if (!SND || !armed || !S.sound) return;
        SND.enable(!document.hidden);
      });
      $('btn-play').addEventListener('click', function () { if (S.playing) stopPlay(); else startPlay(); });
      var rng = $('tl-range');
      rng.addEventListener('input', function () {
        if (S.playing) { S.playing = false; $('btn-play').classList.remove('playing'); $('btn-play').setAttribute('aria-label', 'Play the storm'); }
        setTime(+rng.value, {});
      });
      rng.addEventListener('change', function () { replanForTime(); });
      // hovering over a marker on the timeline names its event
      rng.addEventListener('mousemove', function (e) {
        var box = rng.getBoundingClientRect(), x = e.clientX - box.left, hit = null;
        S.events.forEach(function (ev) { if (Math.abs(tlX(ev.h, box.width) - x) <= 6) hit = ev; });
        rng.title = hit ? clockLabel(hit.h) + ': ' + hit.kicker : 'Storm clock';
      });
      $('btn-sound').addEventListener('click', function () { setSound(!S.sound); });
      $('vol').addEventListener('input', function () {
        var v = clamp(+$('vol').value, 0, 100);
        if (SND) SND.setVolume(v / 100);
        store('floodq-vol', String(v));
      });
      $('voice').addEventListener('change', function () {
        var m = $('voice').value;
        applyVoice(m);
        store('floodq-voice', m);
        if (m !== 'off' && S.sound && armed && SND) {
          SND.speak(m === 'alternate' ? 'Voice alerts on. A female and a male voice take turns.' : 'Voice alerts on.', 150);
        }
      });
      // map views
      new ViewControl().addTo(map);
      $('storm-ptr').addEventListener('click', function () { viewStorm(); });
      $('btn-showpanel').addEventListener('click', function () { toggleWide(false); });
      map.on('dragstart', function () {
        S.userDrag = true;
        if (S.follow) toggleFollow(false);       // moving the map yourself ends following
      });
      map.on('dragend', function () { S.userDrag = false; });
      window.addEventListener('resize', function () { drawTimeline(); });
      document.addEventListener('keydown', function (e) {
        var tag = e.target && e.target.tagName;
        if (e.key === ' ' && (tag === 'BODY' || tag === 'DIV' || e.target === document.body)) {
          e.preventDefault();
          if (S.playing) stopPlay(); else startPlay();
          return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' ||
            (e.target && e.target.isContentEditable)) return;
        var inMap = map.getContainer().contains(e.target);    // there the map's own keys zoom
        var k = e.key;
        if ((k === '+' || k === '=') && !inMap) { e.preventDefault(); map.zoomIn(); }
        else if ((k === '-' || k === '_') && !inMap) { e.preventDefault(); map.zoomOut(); }
        else if (k === 'f' || k === 'F') viewStorm();
        else if (k === 'r' || k === 'R') viewRoutes();
        else if (k === 'h' || k === 'H') viewFlorida();
        else if (k === 'm' || k === 'M') toggleWide();
      });
      document.addEventListener('pointerdown', arm, true);
      document.addEventListener('keydown', arm, true);
    }

    // =========================================================================
    // running the engine
    // =========================================================================
    function runAll() {
      if (S.running) return S.running;
      S.busy = true;
      if (S.playing) { S.playing = false; $('btn-play').classList.remove('playing'); }
      syncFind();
      var t0 = performance.now();
      var name = (presetInfo(S.preset) || {}).name || 'the storm';
      setLoading('Loading the storm: ' + name, MODE === 'offline' ? 'Opening the saved run for this storm.' :
        'Storm surge, road closures and the statewide evacuation plan, in Python.', 0.35);
      var params = JSON.stringify({ preset: S.preset, shift_km: 0, intensity: 1, slr: 0, tide: true });
      var run = S.pyChain.then(function () {
        return engine.prepare.callPromisingKwargs({ params: params, dem: S.dem ? JSON.stringify(S.dem) : '' });
      })
        .then(function (json) {
          var prep = JSON.parse(json);
          S.prep = prep;
          S.prepId += 1;
          S.q = null;
          S.qcache = null;
          return decodePrep(prep);
        })
        .then(function () {
          S.preset = S.prep.preset.id;
          S.stageIdx = Math.min(1, S.prep.stages.length - 1);
          footprint(S.stageIdx);
          if (layers.foot) layers.foot.refresh();
          S.lastFieldT = null;
          S.band = null;
          updateFields(S.t);
          buildEvents();
          var n = S.prep.stages.reduce(function (a, s2) { return a + s2.clusters.length + 4 * s2.qae.length; }, 0);
          var usesJob = BACKEND && !(S.be && S.be.one_job_per_run && S.runsUsed >= 1);
          setLoading('Running ' + n + ' circuits', MODE === 'offline' ? 'Loading the saved circuit results.' :
            (usesJob ? 'One job to ' + (S.be ? S.be.name : 'the backend') + '.' : 'Simulating the circuits (this backend takes one job per run).'), 0.75);
          return engine.run_quantum.callPromisingKwargs(BACKEND, { shots: SHOTS });
        })
        .then(function (qjson) {
          S.q = JSON.parse(qjson);
          S.runsUsed = S.q.runs_used;
          hideLoading();
          console.log('[FloodQ] ' + S.prep.preset.name + ': model, plan and ' + S.q.circuits + ' circuits in ' +
            ((performance.now() - t0) / 1000).toFixed(1) + ' s (' + S.q.source + ')');
          S.busy = false;
          S.running = null;
          syncFind();
          setTime(S.t, {});
          if (!S.you) renderIntro();
        });
      S.running = run.catch(function (err) { S.running = null; showError(err); });
      S.pyChain = run.catch(function () {});
      return S.running;
    }

    function stormFrame() {
      var tr = S.prep.track, pts = [[24.4, -87.6], [31.0, -80.0]];
      for (var i = 0; i < tr.hours.length; i++) if (tr.hours[i] >= S.t - 2 && tr.hours[i] <= 6) pts.push([tr.lat[i], tr.lon[i]]);
      frame(pts, 7, true);
    }

    function boot() {
      setLoading('Loading Florida', 'Counties, towns, roads and coastline.', 0.1);
      var pref = store('floodq-sound');
      S.sound = pref !== '0';
      var vol = store('floodq-vol');
      if (vol !== null && vol !== '' && isFinite(+vol)) $('vol').value = clamp(+vol, 0, 100);
      var vm = store('floodq-voice');
      vm = vm === '0' ? 'off' : (['alternate', 'female', 'male', 'off'].indexOf(vm) >= 0 ? vm : 'alternate');
      $('voice').value = vm;
      if (SND) SND.setVolume(+$('vol').value / 100);
      applyVoice(vm);
      syncSoundUi();
      Promise.resolve(engine.info.callPromising())
        .then(function (json) {
          S.info = JSON.parse(json);
          S.preset = S.info.default_preset;
          return decodeInfo(S.info);
        })
        .then(function () {
          makeLayers();
          renderHow();
          wireControls();
          $('city-list').innerHTML = S.info.cities.filter(function (c) { return c[4]; }).map(function (c) { return '<option value="' + esc(c[0]) + '">'; }).join('');
          if (MODE === 'offline') return null;
          return Promise.resolve(engine.backend_info.callPromising(BACKEND)).then(function (j) {
            S.be = BACKEND ? JSON.parse(j) : null;
            setLoading('Fetching measured elevation', 'USGS 3DEP elevation (AWS Terrain Tiles). The built-in ground model is used if it does not load.', 0.2);
            return loadTerrain(S.info.grid).then(function (dem) {
              S.dem = dem ? dem.values : null;
              if (dem) map.attributionControl.addAttribution('Elevation: AWS Terrain Tiles (USGS 3DEP)');
            });
          });
        })
        .then(function () { return runAll(); })
        .then(function () {
          if (!S.prep) return;
          S.ready = true;
          syncFind();
          stormFrame();
          $('playbar').classList.add('hint');
          if (!small()) $('you-search').focus({ preventScroll: true });
        })
        .catch(showError);
    }

    // a hook for the checks in a browser (tools/browser_check.py): plan for a place, read the answer
    window.__floodq = {
      plan: function (lat, lon, preset) { planAt(lat, lon, { fly: false, preset: preset }); },
      setTime: function (t) { setTime(t, {}); replanForTime(); },
      view: function (t) { setTime(t, {}); },        // move the storm clock without re-planning (screenshots)
      frameStorm: function () {                      // your place, your routes and the storm in one view
        var pts = [], cur = trackAt(S.t);
        pts.push([cur.lat, cur.lon]);
        if (S.you) {
          pts.push([S.you.lat, S.you.lon]);
          (S.you.options || []).forEach(function (o) { pts.push([o.h.lat, o.h.lon]); });
        }
        frame(pts, 9, false);
      },
      viewStorm: function () { viewStorm(); },
      wide: function (on) { toggleWide(on); },
      follow: function (on) { toggleFollow(on); },
      pointer: function () { return { shown: ptr.shown, x: ptr.x, y: ptr.y, angle: ptr.a, text: ptr.text }; },
      zoom: function () { return map.getZoom(); },
      mapView: function (lat, lon, z) { map.setView([lat, lon], z, { animate: false }); },        // screenshots
      panBy: function (dx, dy) { map.panBy([dx, dy], { animate: false }); },
      eye: function () {
        var c = trackAt(S.t), p = map.latLngToContainerPoint([c.lat, c.lon]);
        return { lat: c.lat, lon: c.lon, x: p.x, y: p.y, cat: c.cat };
      },
      voice: function () { return SND ? SND.voiceInfo() : null; },
      state: function () { return S; },
      speech: function (kind) { return S.you && S.you.alert ? speechFor(S.you, kind) : null; },
      summary: function () {
        var Y = S.you;
        if (!Y || !Y.alert) return null;
        return {
          place: Y.place, county: Y.county, preset: S.preset, verdict: Y.verdict, alert: Y.alert.level, siren: Y.alert.siren,
          triage: !!Y.triage, approaches: S.choice ? Object.keys(S.choice.by) : [], feasible: Y.feasible, pool: Y.pool.length,
          depart: Y.depart, farOnly: !!Y.farOnly, tooLate: Y.tooLate || 0,
          options: Y.options.map(function (o) {
            return { name: o.h.name, mi: Math.round(o.km * 0.621), crowMi: Math.round(o.crow * 0.621), h: +o.hours.toFixed(2), cost: +o.cost.toFixed(3),
                     hazard: o.hazard.length, local: o.local, far: o.far, floodKm: +o.floodKm.toFixed(1), latest: o.latest, inPlan: o.inPlan,
                     via: viaOf(o), warn: routeWarning(o) };
          }),
          impact: Y.impact ? { areaZ2: Y.impact.area.z2, areaLow: Y.impact.area.low, countyZ2: Y.impact.county ? Y.impact.county.z2 : null,
                               breach: Y.impact.breach, roads: Y.impact.roadsAtRisk, sirens: (Y.sirenPts || []).length,
                               road: Y.impact.road ? { h: Y.impact.road.h, km: +Y.impact.road.km.toFixed(1), ref: Y.impact.road.ref, kind: Y.impact.road.kind } : null } : null,
          water: Y.water ? { peak: +Y.water.peak.toFixed(2), worst: +Y.water.worst.toFixed(2) } : null,
          wind: { pHu: Y.pHu, pTs: Y.pTs, mph: Math.round(Y.maxWindKt * 1.15), tsHour: Y.tsHour },
          status: statusInfo(Y),
          events: S.events.map(function (e) { return { h: e.h, kicker: e.kicker, title: e.title }; }),
          qaoa: Y.qaoa ? { n: Y.qaoa.sel.n, k: Y.qaoa.sel.k, M: Y.qaoa.sel.M, p_opt: Y.qaoa.tr.p_opt, best: Y.mask, optimum: Y.qaoa.optimum,
                           greedy: greedyMask(Y), primary: (Y.mask & 1) === 1, stats: Y.qaoa.stats, quad: Y.quad.length,
                           source: sourceShort(Y.qaoa), chosenSet: scoreSet(Y, Y.mask), greedySet: scoreSet(Y, greedyMask(Y)) } : null,
          qae: Y.qae ? { estimate: Y.qae.estimate, exact: Y.qae.exact } : null,
        };
      },
    };

    requestAnimationFrame(loop);
    setTimeout(function () { map.invalidateSize(); }, 0);
    syncFind();
    boot();
  }

  // ===========================================================================
  // live data (Qollab mode): measured elevation for the model grid
  // ===========================================================================
  var TERRARIUM = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium';
  function withTimeout(promise, ms) {
    return Promise.race([promise, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]);
  }
  function lon2x(lon, z) { return (lon + 180) / 360 * Math.pow(2, z); }
  function lat2y(lat, z) {
    var r = lat * Math.PI / 180;
    return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z);
  }
  function x2lon(x, z) { return x / Math.pow(2, z) * 360 - 180; }
  function y2lat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return 180 / Math.PI * Math.atan(Math.sinh(n));
  }
  function decodeTile(z, x, y) {
    return fetch(TERRARIUM + '/' + z + '/' + x + '/' + y + '.png').then(function (res) {
      if (!res.ok) throw new Error('tile ' + z + '/' + x + '/' + y + ': HTTP ' + res.status);
      return res.blob();
    }).then(function (b) { return createImageBitmap(b); }).then(function (bmp) {
      var c = document.createElement('canvas');
      c.width = bmp.width; c.height = bmp.height;
      var ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(bmp, 0, 0);
      return { x: x, y: y, size: bmp.width, data: ctx.getImageData(0, 0, bmp.width, bmp.height).data };
    });
  }
  function loadTerrain(grid) {
    var zoom = 8;
    var b = grid.bbox, nx = grid.nx, ny = grid.ny;
    var x0 = Math.floor(lon2x(b.lon_min, zoom)), x1 = Math.floor(lon2x(b.lon_max, zoom));
    var y0 = Math.floor(lat2y(b.lat_max, zoom)), y1 = Math.floor(lat2y(b.lat_min, zoom));
    var jobs = [];
    for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) jobs.push(decodeTile(zoom, x, y));
    return withTimeout(Promise.all(jobs), 25000).then(function (tiles) {
      var sum = new Float64Array(nx * ny), cnt = new Uint32Array(nx * ny);
      var dlon = (b.lon_max - b.lon_min) / nx, dlat = (b.lat_max - b.lat_min) / ny;
      tiles.forEach(function (t) {
        for (var py = 0; py < t.size; py++) {
          var lat = y2lat(t.y + (py + 0.5) / t.size, zoom);
          var i = Math.floor((b.lat_max - lat) / dlat);
          if (i < 0 || i >= ny) continue;
          for (var px = 0; px < t.size; px++) {
            var lon = x2lon(t.x + (px + 0.5) / t.size, zoom);
            var j = Math.floor((lon - b.lon_min) / dlon);
            if (j < 0 || j >= nx) continue;
            var o = (py * t.size + px) * 4;
            sum[i * nx + j] += t.data[o] * 256 + t.data[o + 1] + t.data[o + 2] / 256 - 32768;
            cnt[i * nx + j] += 1;
          }
        }
      });
      var out = new Array(nx * ny);
      var filled = 0;
      for (var k = 0; k < nx * ny; k++) {
        if (cnt[k]) { out[k] = Math.round(sum[k] / cnt[k] * 100) / 100; filled++; } else out[k] = null;
      }
      if (filled < 0.9 * nx * ny) throw new Error('elevation tiles did not cover the state');
      return { values: out, source: 'AWS Terrain Tiles z' + zoom + ' (' + tiles.length + ' tiles)' };
    }).catch(function (err) {
      console.log('Measured elevation unavailable (' + err.message + '); using the illustrative ground.');
      return null;
    });
  }

  // ===========================================================================
  // offline engine: the Python engine's interface, serving saved runs
  // ===========================================================================
  function offlineEngine(pack) {
    if (!pack) throw new Error('the saved runs are missing from this page; rebuild it with tools/build_offline.py');
    var current = pack.default;
    function inflate(b64) {
      if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('this browser is too old to open the saved results'));
      var s = atob(b64);
      var bytes = new Uint8Array(s.length);
      for (var i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
      var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
      return new Response(stream).text();
    }
    var fn = function (impl) { var f = function () { return impl.apply(null, arguments); }; f.callPromising = f; f.callPromisingKwargs = f; return f; };
    return {
      info: fn(function () { return inflate(pack.info); }),
      backend_info: fn(function () { return Promise.resolve(JSON.stringify({ name: 'basic_simulator (saved run)', kind: 'offline', one_job_per_run: false })); }),
      prepare: fn(function (kw) {
        var p = JSON.parse((kw && kw.params) || '{}');
        current = pack.scenarios[p.preset] ? p.preset : pack.default;
        return inflate(pack.scenarios[current].prepare);
      }),
      run_quantum: fn(function () { return inflate(pack.scenarios[current].quantum); }),
    };
  }

  window.FloodQApp = { start: start, offlineEngine: offlineEngine };
})();

// ===============================================================================================
// start: hand the app the Python engine and the backend picked in Select QPU
// ===============================================================================================
const qpu = typeof backend === 'undefined' ? null : backend;
window.FloodQApp.start({ L: window.L, engine, backend: qpu, mode: 'qollab' });
