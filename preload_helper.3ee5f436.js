!function(){"use strict";var t="/my-poem-website/".replace(/([^/])$/,"$1/"),e=location.pathname,n=e.startsWith(t)&&decodeURI("/".concat(e.slice(t.length)));if(n){var a=document,c=a.head,r=a.createElement.bind(a),i=function(t,e,n){var a,c=e.r[t]||(null===(a=Object.entries(e.r).find((function(e){var n=e[0];return new RegExp("^".concat(n.replace(/\/:[^/]+/g,"/[^/]+").replace("/*","/.+"),"$")).test(t)})))||void 0===a?void 0:a[1]);return null==c?void 0:c.map((function(t){var a=e.f[t][1],c=e.f[t][0];return{type:c.split(".").pop(),url:"".concat(n.publicPath).concat(c),attrs:[["data-".concat(e.b),"".concat(e.p,":").concat(a)]]}}))}(n,{"p":"my-poem","b":"webpack","f":[["nm__dumi__dist__client__pages__Demo__index.578aa5c0.chunk.css",9],["nm__dumi__dist__client__pages__Demo__index.c00358a5.async.js",9],["nm__dumi__dist__client__pages__404.8b85f2d9.chunk.css",65],["nm__dumi__dist__client__pages__404.c8afc25f.async.js",65],["docs__old-style-word.md.bb82c374.async.js",151],["docs__old-poem.md.085bbab0.async.js",224],["docs__short-novel.md.aea8c3d9.async.js",386],["docs__novel-design.md.797ae6c0.async.js",421],["nm__dumi__theme-default__layouts__DocLayout__index.3c43874e.async.js",519],["docs__modern-poem.md.6fcfcf13.async.js",546],["839.e8c51481.chunk.css",839],["839.2fa666ea.async.js",839],["dumi__tmp-production__dumi__theme__ContextWrapper.7f971830.async.js",923],["docs__index.md.f7d7895a.async.js",935],["docs__old-style-poem.md.2d82e67d.async.js",983],["docs__classical-chinese.md.9e2fa6df.async.js",985],["docs__lang.md.94eaa9b3.async.js",993]],"r":{"/*":[2,3,8,10,11,12],"/":[13,8,10,11,12],"/classical-chinese":[15,8,10,11,12],"/old-style-poem":[14,8,10,11,12],"/old-style-word":[4,8,10,11,12],"/novel-design":[7,8,10,11,12],"/modern-poem":[9,8,10,11,12],"/short-novel":[6,8,10,11,12],"/old-poem":[5,8,10,11,12],"/lang":[16,8,10,11,12],"/~demos/:id":[0,1,12]}},{publicPath:"/my-poem-website/"});null==i||i.forEach((function(t){var e,n=t.type,a=t.url;if("js"===n)(e=r("script")).src=a,e.async=!0;else{if("css"!==n)return;(e=r("link")).href=a,e.rel="preload",e.as="style"}t.attrs.forEach((function(t){e.setAttribute(t[0],t[1]||"")})),c.appendChild(e)}))}}();