<template>
  <div class="sketch"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
let canvas;
/******************
 Code by Vamoss
 Original code link:
 https://www.openprocessing.org/sketch/751983

 Author links:
 http://vamoss.com.br
 http://twitter.com/vamoss
 http://github.com/vamoss
 ******************/

//Inspired by Felix Auer
//http://www.felixauer.com/javascript/difeqrk.html

onMounted(() => {
  window.setup = setup;
  window.draw = draw;
  window.windowResized = windowResized;
});

onBeforeUnmount(() => {
  // clean up global bindings
  delete window.setup;
  delete window.draw;
  delete window.windowResized;

  // remove canvas if exists
  if (canvas && typeof canvas.remove === "function") {
    canvas.remove();
  }
});

var blobs = [];
var colors;
let variation = 0;
let xScale, yScale, centerX, centerY;
//auto change
let changeDuration = 3000;
let lastChange = 0;
// auto emit every 5s
let autoEmitMs = 5000;
let lastAutoEmit = 0;

// density/scaling controls for WebView & small screens
let scaleFactor = 1; // 0.35..1 based on viewport
let emitCount = 20; // particles per emission
let fadeAlpha = 10; // trail fade alpha (higher = faster fade)

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  // Ensure opaque canvas and reduce WebView compositing issues
  setAttributes({ alpha: false, antialias: true });
  // Attach canvas to the Vue container to avoid layout side-effects
  canvas.parent(document.querySelector(".sketch"));
  // Optional: stabilize performance on very high-DPI devices (uncomment if needed)
  pixelDensity(1);

  textAlign(CENTER, CENTER);

  colors = [
    color("#42b883"), // Vue primary green
    color("#35495e"), // Vue dark accent
    color("#3fb984"),
    color("#2c8e6f"),
    color("#27ae60"),
  ];
  recalcViewportParams();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalcViewportParams();
}

function recalcViewportParams() {
  // base math from original
  xScale = width / 20;
  yScale = (height / 20) * (width / height);
  centerX = width / 2;
  centerY = height / 2;

  // scale factor by shorter edge; clamp to avoid too tiny strokes
  scaleFactor = constrain(min(width, height) / 800, 0.35, 1);

  // fewer particles on smaller screens
  emitCount = Math.max(6, Math.round(20 * scaleFactor));

  // stronger fade on smaller screens (to reduce visual clutter)
  fadeAlpha = Math.round(8 + (1 - scaleFactor) * 12); // ~8..20
}

function emitParticlesAt(x, y, count = emitCount) {
  for (let i = 0; i < count; i++) {
    const rx = x + random(-100, 100);
    const ry = y + random(-100, 100);
    const blob = {
      x: getXPos(rx),
      y: getYPos(ry),
      size: random(1, 5) * scaleFactor,
      lastX: rx,
      lastY: ry,
      color: colors[floor(random(colors.length))],
      direction: random(0.1, 1) * (random() > 0.5 ? 1 : -1),
    };
    blobs.push(blob);
  }
}

function draw() {
  //DEBUG
  // textSize(20);
  // noStroke();
  // fill(255);
  // ellipse(centerX, centerY, 60, 60);
  // fill(0);
  // text(variation, centerX, centerY - 10);
  // text(length, centerX, centerY + 10);

  // auto emit at random position every 5s (even without user touch)
  const now = millis();
  if (now - lastAutoEmit > autoEmitMs) {
    lastAutoEmit = now;
    emitParticlesAt(random(width), random(height), emitCount);
  }

  if (mouseIsPressed) {
    for (let i = 0; i < emitCount; i++) {
      let x = mouseX + random(-100, 100);
      let y = mouseY + random(-100, 100);
      var blob = {
        x: getXPos(x),
        y: getYPos(y),
        size: random(1, 5) * scaleFactor,
        lastX: x,
        lastY: y,
        color: colors[floor(random(colors.length))],
        direction: random(0.1, 1) * (random() > 0.5 ? 1 : -1),
      };
      blobs.push(blob);
    }
  }

  var length = blobs.length;
  if (length == 0) {
    // pure black background when no particles yet
    background(0);
  } else {
    // fade trail on black
    noStroke();
    fill(0, 0, 0, fadeAlpha);
    rect(0, 0, width, height);
  }

  //auto change
  let time = millis();
  if (time - lastChange > changeDuration) {
    lastChange = time;
    variation++;
    if (variation > 11) variation = 0;
  }

  var stepsize = deltaTime * 0.002;
  for (var i = length - 1; i >= 0; i--) {
    let blob = blobs[i];

    var x = getSlopeX(blob.x, blob.y);
    var y = getSlopeY(blob.x, blob.y);
    blob.x += blob.direction * x * stepsize;
    blob.y += blob.direction * y * stepsize;

    x = getXPrint(blob.x);
    y = getYPrint(blob.y);
    stroke(blob.color);
    strokeWeight(blob.size);
    line(x, y, blob.lastX, blob.lastY);
    blob.lastX = x;
    blob.lastY = y;

    const border = 200;
    if (
      x < -border ||
      y < -border ||
      x > width + border ||
      y > height + border
    ) {
      blobs.splice(i, 1);
    }
  }
}

function getSlopeY(x, y) {
  switch (variation) {
    case 0:
      return Math.sin(x);
    case 1:
      return Math.sin(x * 5) * y * 0.3;
    case 2:
      return Math.cos(x * y);
    case 3:
      return Math.sin(x) * Math.cos(y);
    case 4:
      return Math.cos(x) * y * y;
    case 5:
      return Math.log(Math.abs(x)) * Math.log(Math.abs(y));
    case 6:
      return Math.tan(x) * Math.cos(y);
    case 7:
      return -Math.sin(x * 0.1) * 3; //orbit
    case 8:
      return (x - x * x * x) * 0.01; //two orbits
    case 9:
      return -Math.sin(x);
    case 10:
      return -y - Math.sin(1.5 * x) + 0.7;
    case 11:
      return Math.sin(x) * Math.cos(y);
  }
}

function getSlopeX(x, y) {
  switch (variation) {
    case 0:
      return Math.cos(y);
    case 1:
      return Math.cos(y * 5) * x * 0.3;
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return 1;
    case 7:
      return Math.sin(y * 0.1) * 3; //orbit
    case 8:
      return y / 3; //two orbits
    case 9:
      return -y;
    case 10:
      return -1.5 * y;
    case 11:
      return Math.sin(y) * Math.cos(x);
  }
}

function getXPos(x) {
  return (x - centerX) / xScale;
}
function getYPos(y) {
  return (y - centerY) / yScale;
}

function getXPrint(x) {
  return xScale * x + centerX;
}
function getYPrint(y) {
  return yScale * y + centerY;
}
</script>

<style scoped>
:root,
html,
body,
#app {
  height: 100%;
  margin: 0;
  overflow: hidden; /* prevent scroll */
  overscroll-behavior: none; /* block iOS/Android WebView bounce */
  touch-action: none; /* avoid touch scroll while interacting */
}

.sketch {
  width: 100%;
  height: 100%;
  position: fixed;
  inset: 0;
  z-index: 1; /* keep canvas above backgrounds */
  background: transparent; /* canvas is opaque due to alpha:false */
}

.sketch canvas {
  display: block; /* remove inline gap causing scroll */
  width: 100% !important;
  height: 100% !important;
}
</style>
