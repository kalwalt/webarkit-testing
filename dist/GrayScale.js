!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.GrayScale=e():t.GrayScale=e()}("undefined"!=typeof self?self:this,(()=>(()=>{var t={133:t=>{t.exports="attribute vec2 position;\nvarying vec2 tex_coords;\nuniform float flipY;\nvoid main(void) {\ntex_coords = (position + 1.0) / 2.0;\ntex_coords.y = 1.0 - tex_coords.y;\ngl_Position = vec4(position * vec2(1, flipY), 0.0, 1.0);\n}"},426:t=>{t.exports="precision highp float;\nuniform sampler2D u_image;\nvarying vec2 tex_coords;\nconst vec3 g = vec3(0.299, 0.587, 0.114);\nvoid main(void) {\nvec4 color = texture2D(u_image, tex_coords);\nfloat gray = dot(color.rgb, g);\ngl_FragColor = vec4(vec3(gray), 1.0);\n}"}},e={};function i(r){var o=e[r];if(void 0!==o)return o.exports;var a=e[r]={exports:{}};return t[r](a,a.exports,i),a.exports}i.d=(t,e)=>{for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},i.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),i.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})};var r={};return(()=>{"use strict";function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(e,i){for(var r=0;r<i.length;r++){var o=i[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,(a=o.key,n=void 0,n=function(e,i){if("object"!==t(e)||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var o=r.call(e,"string");if("object"!==t(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(a),"symbol"===t(n)?n:String(n)),o)}var a,n}i.r(r),i.d(r,{GrayScaleMedia:()=>o});var o=function(){function t(e,r,o,a){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this._source=e,this._width=r,this._height=o,this._canvas=a||document.createElement("canvas"),this._canvas.width=r,this._canvas.height=o,this._flipImageProg=i(133),this._grayscaleProg=i(426),this.glReady=!1,this.initGL(this._flipImageProg,this._grayscaleProg)}var r,o;return r=t,(o=[{key:"initGL",value:function(t,e){this.gl=this._canvas.getContext("webgl"),this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight),this.gl.clearColor(.1,.1,.1,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT);var i=this.gl.createShader(this.gl.VERTEX_SHADER),r=this.gl.createShader(this.gl.FRAGMENT_SHADER);this.gl.shaderSource(i,t),this.gl.shaderSource(r,e),this.gl.compileShader(i),this.gl.compileShader(r);var o=this.gl.createProgram();this.gl.attachShader(o,i),this.gl.attachShader(o,r),this.gl.linkProgram(o),this.gl.useProgram(o);var a=new Float32Array([-1,-1,-1,1,1,1,-1,-1,1,1,1,-1]),n=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,n),this.gl.bufferData(this.gl.ARRAY_BUFFER,a,this.gl.STATIC_DRAW);var s=this.gl.getAttribLocation(o,"position");this.gl.vertexAttribPointer(s,2,this.gl.FLOAT,!1,0,0),this.gl.enableVertexAttribArray(s),this.flipLocation=this.gl.getUniformLocation(o,"flipY");var l=this.gl.createTexture();this.gl.activeTexture(this.gl.TEXTURE0),this.gl.bindTexture(this.gl.TEXTURE_2D,l),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.glReady=!0,this.pixelBuf=new Uint8Array(this.gl.drawingBufferWidth*this.gl.drawingBufferHeight*4),this.grayBuf=new Uint8Array(this.gl.drawingBufferWidth*this.gl.drawingBufferHeight)}},{key:"getFrame",value:function(){if(this.glReady){this.gl.uniform1f(this.flipLocation,-1),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this._source),this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.gl.readPixels(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight,this.gl.RGBA,this.gl.UNSIGNED_BYTE,this.pixelBuf);for(var t=0,e=0;e<this.pixelBuf.length;e+=4)this.grayBuf[t]=this.pixelBuf[e],t++;return this.grayBuf}}},{key:"requestStream",value:function(){var t=this;return new Promise((function(e,i){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return i();var r,o,a=t._width/t._height;o=!1,r=navigator.userAgent||navigator.vendor||window.opera,(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(r)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(r.substr(0,4)))&&(o=!0),o&&(a=1/a),navigator.mediaDevices.getUserMedia({audio:!1,video:{width:{ideal:t._width},height:{ideal:t._height},aspectRatio:{ideal:a},facingMode:"environment"}}).then((function(i){t._source.srcObject=i,t._source.onloadedmetadata=function(i){t._source.play(),e(t._source)}})).catch((function(t){i(t)}))}))}}])&&e(r.prototype,o),Object.defineProperty(r,"prototype",{writable:!1}),t}()})(),r})()));