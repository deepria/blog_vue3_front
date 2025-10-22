<template>
  <div class="sketch">
    <canvas id="canvas2D"></canvas>
    <canvas id="canvasWebGL"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

let rafId = null;
let gl = null;
let program = null;
let vao = null; // WebGL2 only
let pointCount = 0;
let isWebGL2 = false;

// Adaptive density and point size
let densityDiv = 2; // base: cols = width / densityDiv
let pointSizePx = 1.0;

// Normalized speed and displacement for mobile/desktop
let timeScale = 1.0; // multiplies motion speed inside shader
let displaceWeight = 0.2; // base displacement weight

// ------------------ Original GLSL (ES 3.00) ------------------
// (kept exactly as your source intended)
const snoise4D = `
	/*
		Description : Array and textureless GLSL 4D simplex
		              noise functions.
		     Author : Ian McEwan, Ashima Arts.
		 Maintainer : stegu
		    Lastmod : 20110822 (ijm)
		    License : Copyright (C) 2011 Ashima Arts. All rights reserved.
		              Distributed under the MIT License. See LICENSE file.
		              https://github.com/ashima/webgl-noise
		              https://github.com/stegu/webgl-noise

		Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
		The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/

	vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
	vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
	float permute(float x) { return mod289(((x*34.0)+10.0)*x); }
	vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
	float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

	vec4 grad4(float j, vec4 ip) {
		const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
		vec4 p,s;

		p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
		p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
		s = vec4(lessThan(p, vec4(0.0)));
		p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

		return p;
	}

	#define F4 0.309016994374947451

	float snoise(vec4 v) {
		const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
													0.276393202250021,  // 2 * G4
													0.414589803375032,  // 3 * G4
												-0.447213595499958);  // -1 + 4 * G4

		vec4 i  = floor(v + dot(v, vec4(F4)) );
		vec4 x0 = v -   i + dot(i, C.xxxx);

		vec4 i0;
		vec3 isX = step( x0.yzw, x0.xxx );
		vec3 isYZ = step( x0.zww, x0.yyz );

		i0.x = isX.x + isX.y + isX.z;
		i0.yzw = 1.0 - isX;

		i0.y += isYZ.x + isYZ.y;
		i0.zw += 1.0 - isYZ.xy;
		i0.z += isYZ.z;
		i0.w += 1.0 - isYZ.z;

		vec4 i3 = clamp( i0, 0.0, 1.0 );
		vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
		vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

		vec4 x1 = x0 - i1 + C.xxxx;
		vec4 x2 = x0 - i2 + C.yyyy;
		vec4 x3 = x0 - i3 + C.zzzz;
		vec4 x4 = x0 + C.wwww;

		i = mod289(i);
		float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
		vec4 j1 = permute( permute( permute( permute (
							i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
						+ i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
						+ i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
						+ i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

		vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

		vec4 p0 = grad4(j0,   ip);
		vec4 p1 = grad4(j1.x, ip);
		vec4 p2 = grad4(j1.y, ip);
		vec4 p3 = grad4(j1.z, ip);
		vec4 p4 = grad4(j1.w, ip);

		vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
		p0 *= norm.x;
		p1 *= norm.y;
		p2 *= norm.z;
		p3 *= norm.w;
		p4 *= taylorInvSqrt(dot(p4,p4));

		vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
		vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
		m0 = m0 * m0;
		m1 = m1 * m1;
		return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
								+ dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
	}
`;

const snoise4DImage = `
	// MIT License
	// Copyright © 2023 Zaron
	// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	vec4 snoise4DImage(vec2 uv, float scal, float gain, float ofst, vec4 move) {
		uv *= scal;
		float R = snoise(vec4(uv, 100., 200.)+move);
		float G = snoise(vec4(uv, 300., 400.)+move);
		float B = snoise(vec4(uv, 500., 600.)+move);
		vec3 color = ofst+gain*vec3(R, G, B);
		return vec4(color, 1.);
	}

	vec4 snoise4DImage(vec2 uv, float scal, float gain, float ofst, float expo, vec4 move) {
		uv *= scal;
		float R = snoise(vec4(uv, 100., 200.)+move);
		float G = snoise(vec4(uv, 300., 400.)+move);
		float B = snoise(vec4(uv, 500., 600.)+move);
		vec3 col;
		col.r = pow(abs(R), expo)*(step(0., R)*2.-1.);
		col.g = pow(abs(G), expo)*(step(0., G)*2.-1.);
		col.b = pow(abs(B), expo)*(step(0., B)*2.-1.);
		return vec4(ofst+gain*col, 1.);
	}
`;

const displace = `
	// MIT License
	// Copyright © 2023 Zaron
	// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
	// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	vec2 displace(vec2 uv, vec2 duv, float off, float wei) {
		//uv.x *= iResolution.x/iResolution.y; // square
		duv -= off;
		return uv-duv*wei;
	}

	vec4 displace(vec2 uv, sampler2D img, vec2 duv, float off, float wei) {
		duv -= off;
		return texture(img, uv-duv*wei);
	}
`;

const vert300 = `#version 300 es
  in vec2 aPosition;
  in vec2 aTexCoord;
  uniform vec2 uRandomVec2;
  uniform float uTime;
  uniform float uPointSize;
  uniform float uTimeScale;
  uniform float uDisplaceWeight;
  ${snoise4D}
  ${snoise4DImage}
  ${displace}
  vec4 noise(vec2 uv, float scal, float gain, float ofst, float expo, vec4 move) {
    vec4 noise;
    noise  =     1.*snoise4DImage((uv-vec2(421., 132))*1., scal, gain, ofst, move);
    noise +=     .5*snoise4DImage((uv-vec2(913., 687))*2., scal, gain, ofst, move);
    noise +=    .25*snoise4DImage((uv-vec2(834., 724))*4., scal, gain, ofst, move);
    noise +=   .125*snoise4DImage((uv-vec2(125., 209))*8., scal, gain, ofst, move);
    noise +=  .0625*snoise4DImage((uv-vec2(387., 99))*16., scal, gain, ofst, move);
    noise /= 1.9375;
    return noise;
  }
  out vec2 vTexCoord;
  out vec2 vCol;
  void main() {
    vTexCoord = aTexCoord;
    vec2 pos = aPosition;
    float circle = smoothstep(1., .0, length(0.-aPosition));
    vec2 n = noise(pos, 2., 5., .5, 1., vec4(vec2(0.), vec2(cos(uTime*.5*uTimeScale), sin(uTime*.5*uTimeScale))+uRandomVec2)).rg*circle;
    vec2 dpos = displace(pos, n, .5, uDisplaceWeight*circle);
    vCol = n.rg*noise(pos*1000., 1., 1., .5, 1., vec4(0.)).r;
    gl_Position = vec4(dpos, 0., 1.);
    gl_PointSize = uPointSize;
  }`;

const frag300 = `#version 300 es
  precision mediump float;
  in vec2 vTexCoord;
  in vec2 vCol;
  out vec4 fragColor;
  void main() {
    vec2 uv = vTexCoord;
    fragColor = vec4(vCol.rrr, 1.);
  }`;

// ------------------ WebGL1 fallback (GLSL ES 1.00) ------------------
// Converted 1:1 from the ES 3.00 code above
const vert100 = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  uniform vec2 uRandomVec2;
  uniform float uTime;
  uniform float uPointSize;
  uniform float uTimeScale;
  uniform float uDisplaceWeight;
  varying vec2 vTexCoord;
  varying vec2 vCol;
  ${snoise4D}
  ${snoise4DImage}
  ${displace}
  vec4 noise(vec2 uv, float scal, float gain, float ofst, float expo, vec4 move) {
    vec4 noise;
    noise  =     1.*snoise4DImage((uv-vec2(421., 132))*1., scal, gain, ofst, move);
    noise +=     .5*snoise4DImage((uv-vec2(913., 687))*2., scal, gain, ofst, move);
    noise +=    .25*snoise4DImage((uv-vec2(834., 724))*4., scal, gain, ofst, move);
    noise +=   .125*snoise4DImage((uv-vec2(125., 209))*8., scal, gain, ofst, move);
    noise +=  .0625*snoise4DImage((uv-vec2(387., 99))*16., scal, gain, ofst, move);
    noise /= 1.9375;
    return noise;
  }
  void main() {
    vTexCoord = aTexCoord;
    vec2 pos = aPosition;
    float circle = smoothstep(1., .0, length(0.-aPosition));
    vec2 n = noise(pos, 2., 5., .5, 1., vec4(vec2(0.), vec2(cos(uTime*.5*uTimeScale), sin(uTime*.5*uTimeScale))+uRandomVec2)).rg*circle;
    vec2 dpos = displace(pos, n, .5, uDisplaceWeight*circle);
    vCol = n.rg*noise(pos*1000., 1., 1., .5, 1., vec4(0.)).r;
    gl_Position = vec4(dpos, 0., 1.);
    gl_PointSize = uPointSize;
  }`;

const frag100 = `
  precision mediump float;
  varying vec2 vTexCoord;
  varying vec2 vCol;
  void main() {
    vec2 uv = vTexCoord;
    gl_FragColor = vec4(vCol.rrr, 1.0);
  }`;

onMounted(() => {
  main();
  window.addEventListener("resize", handleResize, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (rafId) cancelAnimationFrame(rafId);
});

async function main() {
  const canvasGL = document.getElementById("canvasWebGL");
  const canvas2D = document.getElementById("canvas2D");
  if (!canvasGL || !canvas2D) return;

  // Try WebGL2 first, then WebGL1
  gl =
    canvasGL.getContext("webgl2", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    }) ||
    canvasGL.getContext("webgl", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
  if (!gl) {
    console.warn("WebGL not supported in this environment");
    return;
  }
  isWebGL2 = gl instanceof WebGL2RenderingContext;

  // ---- Diagnostics: which WebGL version/context are we using?
  try {
    const ctxName = isWebGL2 ? "WebGL2" : "WebGL1";
    const version = gl.getParameter(gl.VERSION);
    const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    console.info(`[WebGL] Context: ${ctxName}`);
    console.info(`[WebGL] VERSION: ${version}`);
    console.info(`[WebGL] SHADING_LANGUAGE_VERSION: ${shading}`);
    console.info(`[WebGL] RENDERER: ${renderer}`);
    console.info(`[WebGL] VENDOR: ${vendor}`);
  } catch (e) {
    console.warn("[WebGL] Could not query context parameters:", e);
  }

  program = gl.createProgram();
  if (isWebGL2) {
    setShader(gl, program, vert300, frag300);
  } else {
    setShader(gl, program, vert100, frag100);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // WebGL2 requires VAO for attribute state
  if (isWebGL2) {
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
  }

  // Additive blending (filament effect)
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);

  // Uniforms
  const uRandomVec2Loc = gl.getUniformLocation(program, "uRandomVec2");
  const uTimeLoc = gl.getUniformLocation(program, "uTime");
  const uPointSizeLoc = gl.getUniformLocation(program, "uPointSize");
  const uTimeScaleLoc = gl.getUniformLocation(program, "uTimeScale");
  const uDisplaceWeightLoc = gl.getUniformLocation(program, "uDisplaceWeight");
  const randomVec2 = new Float32Array([
    Math.random() * 300,
    Math.random() * 300,
  ]);
  if (uRandomVec2Loc) gl.uniform2fv(uRandomVec2Loc, randomVec2);
  // initialize point size (handleResize will refine based on device)
  if (uPointSizeLoc) gl.uniform1f(uPointSizeLoc, pointSizePx || 1.5);
  if (uTimeScaleLoc) gl.uniform1f(uTimeScaleLoc, timeScale);
  if (uDisplaceWeightLoc) gl.uniform1f(uDisplaceWeightLoc, displaceWeight);

  // Buffers
  const positionData = [];
  const texCoordData = [];

  // initial size
  handleResize();
  // build buffers for current viewport size (use internal pixel size)
  pointCount = buildBuffers(positionData, texCoordData);

  // 2D layer setup
  const ctx2d = canvas2D.getContext("2d", { alpha: false });
  ctx2d.imageSmoothingEnabled = true;

  // Draw loop
  let time = 0;
  const draw = () => {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (uTimeLoc) gl.uniform1f(uTimeLoc, time);
    if (uPointSizeLoc) gl.uniform1f(uPointSizeLoc, pointSizePx);
    if (uTimeScaleLoc) gl.uniform1f(uTimeScaleLoc, timeScale);
    if (uDisplaceWeightLoc) gl.uniform1f(uDisplaceWeightLoc, displaceWeight);
    if (isWebGL2) gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, pointCount);

    // Composite to 2D with faint trail
    compositeTo2D(canvasGL, canvas2D);

    time += 0.02;
    rafId = requestAnimationFrame(draw);
  };
  draw();
}

function buildBuffers(positionData, texCoordData) {
  positionData.length = 0;
  texCoordData.length = 0;
  // Use current drawingbuffer size (already DPR-scaled by handleResize)
  const cols = Math.max(1, Math.floor(gl.drawingBufferWidth / densityDiv));
  const rows = Math.max(1, Math.floor(gl.drawingBufferHeight / densityDiv));
  const xOff = 2 / cols;
  const yOff = 2 / rows;
  const uOff = 1 / cols;
  const vOff = 1 / rows;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      // clip-space positions (-1..1)
      positionData.push(-1 + xOff * col + 1 / cols);
      positionData.push(1 - yOff * row - 1 / rows);
      // UV (center of cell for stability)
      texCoordData.push((col + 0.5) / cols);
      texCoordData.push((row + 0.5) / rows);
    }
  }
  setAttributeVec2(gl, program, "aPosition", new Float32Array(positionData));
  setAttributeVec2(gl, program, "aTexCoord", new Float32Array(texCoordData));
  if (isWebGL2) gl.bindVertexArray(vao);
  return cols * rows;
}

function setShader(gl, program, vertSrc, fragSrc) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertSrc);
  gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    console.error("VS error:", gl.getShaderInfoLog(vs));
  }
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragSrc);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error("FS error:", gl.getShaderInfoLog(fs));
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
}

function setAttributeVec2(gl, program, name, data) {
  const loc = gl.getAttribLocation(program, name);
  if (loc === -1) return;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
}

function handleResize() {
  const canvasGL = document.getElementById("canvasWebGL");
  const canvas2D = document.getElementById("canvas2D");
  if (!canvasGL || !gl) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(window.innerWidth));
  const h = Math.max(1, Math.floor(window.innerHeight));

  // size canvases
  resizeCanvasGL(canvasGL, w, h, dpr);
  resizeCanvas2D(canvas2D, w, h, dpr);

  // adaptive density for mobile (bigger visuals) — halve point count on mobile
  const longEdge = Math.max(w, h);
  if (longEdge <= 600) {
    densityDiv = 8; // coarse grid (fewer points)
    pointSizePx = 3.2 * dpr;
    timeScale = 0.65; // slower motion on small screens
    displaceWeight = 0.12; // smaller displacement so flow doesn't look too fast
  } else if (longEdge <= 900) {
    densityDiv = 6;
    pointSizePx = 2.7 * dpr;
    timeScale = 0.8;
    displaceWeight = 0.16;
  } else {
    densityDiv = 2; // desktop
    pointSizePx = 1.5 * dpr;
    timeScale = 1.0;
    displaceWeight = 0.2;
  }

  // update uniforms immediately when available
  if (program) {
    const pLoc = gl.getUniformLocation(program, "uPointSize");
    if (pLoc) gl.uniform1f(pLoc, pointSizePx);
    const tsLoc = gl.getUniformLocation(program, "uTimeScale");
    if (tsLoc) gl.uniform1f(tsLoc, timeScale);
    const dwLoc = gl.getUniformLocation(program, "uDisplaceWeight");
    if (dwLoc) gl.uniform1f(dwLoc, displaceWeight);
  }

  // ---- Diagnostics: viewport & tuning
  console.info(
    "[WebGL] Resize -> css:",
    { w, h, dpr },
    "drawBuffer:",
    { dbw: gl.drawingBufferWidth, dbh: gl.drawingBufferHeight },
    "params:",
    { densityDiv, pointSizePx, timeScale, displaceWeight },
  );

  // rebuild buffers for new viewport/density
  if (gl && program) {
    pointCount = buildBuffers([], []);
  }
}
function resizeCanvasGL(canvas, cssW, cssH, dpr = 1) {
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  gl.viewport(0, 0, canvas.width, canvas.height);
}
function resizeCanvas2D(canvas, cssW, cssH, dpr = 1) {
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
}

function compositeTo2D(srcCanvas, dstCanvas) {
  const ctx = dstCanvas.getContext("2d", { alpha: false });
  // subtle trail fade
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, dstCanvas.width, dstCanvas.height);
  // additive composite
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1;
  ctx.drawImage(srcCanvas, 0, 0, dstCanvas.width, dstCanvas.height);
}
</script>

<style scoped>
:root,
html,
body,
#app {
  height: 100%;
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
}
.sketch {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 1;
}
.sketch canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
