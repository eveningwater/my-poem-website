!function(){"use strict";var t="/my-poem-website/".replace(/([^/])$/,"$1/"),e=location.pathname,n=e.startsWith(t)&&decodeURI("/".concat(e.slice(t.length)));if(n){var a=document,c=a.head,r=a.createElement.bind(a),i=function(t,e,n){var a,c=e.r[t]||(null===(a=Object.entries(e.r).find((function(e){var n=e[0];return new RegExp("^".concat(n.replace(/\/:[^/]+/g,"/[^/]+").replace("/*","/.+"),"$")).test(t)})))||void 0===a?void 0:a[1]);return null==c?void 0:c.map((function(t){var a=e.f[t][1],c=e.f[t][0];return{type:c.split(".").pop(),url:"".concat(n.publicPath).concat(c),attrs:[["data-".concat(e.b),"".concat(e.p,":").concat(a)]]}}))}(n,{"p":"my-poem","b":"webpack","f":[["nm__dumi__dist__client__pages__Demo__index.578aa5c0.chunk.css",9],["nm__dumi__dist__client__pages__Demo__index.fb467357.async.js",9],["nm__dumi__dist__client__pages__404.8b85f2d9.chunk.css",65],["nm__dumi__dist__client__pages__404.e5b14889.async.js",65],["docs__old-style-word.md.54a26451.async.js",151],["docs__old-poem.md.74db3eda.async.js",224],["370.e8c51481.chunk.css",370],["370.78746e02.async.js",370],["docs__short-novel.md.79793950.async.js",386],["docs__novel-design.md.505a56f0.async.js",421],["nm__dumi__theme-default__layouts__DocLayout__index.34268a98.async.js",519],["docs__modern-poem.md.66c1a831.async.js",546],["dumi__tmp-production__dumi__theme__ContextWrapper.621ae8e1.async.js",923],["docs__index.md.123e30b2.async.js",935],["docs__old-style-poem.md.3d7ee6ce.async.js",983],["docs__classical-chinese.md.5c2d267e.async.js",985],["docs__lang.md.083c6660.async.js",993]],"r":{"/*":[2,3,6,7,10,12],"/":[13,6,7,10,12],"/classical-chinese":[15,6,7,10,12],"/old-style-poem":[14,6,7,10,12],"/old-style-word":[4,6,7,10,12],"/novel-design":[9,6,7,10,12],"/modern-poem":[11,6,7,10,12],"/short-novel":[8,6,7,10,12],"/old-poem":[5,6,7,10,12],"/lang":[16,6,7,10,12],"/~demos/:id":[0,1,12]}},{publicPath:"/my-poem-website/"});null==i||i.forEach((function(t){var e,n=t.type,a=t.url;if("js"===n)(e=r("script")).src=a,e.async=!0;else{if("css"!==n)return;(e=r("link")).href=a,e.rel="preload",e.as="style"}t.attrs.forEach((function(t){e.setAttribute(t[0],t[1]||"")})),c.appendChild(e)}))}}();