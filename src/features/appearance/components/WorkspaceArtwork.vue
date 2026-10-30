<template>
  <div class="workspace-artwork" aria-hidden="true">
    <span class="art-label">D / 01</span><span class="art-sun"></span
    ><span class="art-orbit orbit-one"></span
    ><span class="art-orbit orbit-two"></span
    ><span class="art-hill hill-back"></span
    ><span class="art-hill hill-front"></span
    ><span class="studio-type">생각을<br />펼치다.</span
    ><span class="studio-star">✳</span><span class="studio-disc"></span
    ><span class="console-type"
      >작업 공간 / 나의 기록<br />가능성을 펼치는 공간<br />─────────────────<br />생각
      → 기록 → 완성</span
    >
  </div>
</template>
<style scoped>
.workspace-artwork {
  min-height: 270px;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #e6e8dd, #c6d0bd 58%, #9baa90);
}
.art-label {
  position: absolute;
  top: 20px;
  left: 22px;
  z-index: 3;
  font-size: 10px;
  letter-spacing: 2px;
  color: #435448;
}
.art-sun {
  position: absolute;
  width: 115px;
  height: 115px;
  top: 28px;
  left: 48%;
  border-radius: 50%;
  background: linear-gradient(145deg, #faf9e9, #ece8cd);
}
.art-hill {
  position: absolute;
  width: 150%;
  left: -20%;
  border-radius: 50% 50% 0 0;
  transform: rotate(-14deg);
}
.hill-back {
  height: 240px;
  top: 160px;
  background: linear-gradient(120deg, #a0b09a, #7d947d);
}
.hill-front {
  height: 220px;
  top: 230px;
  left: -9%;
  transform: rotate(12deg);
  background: linear-gradient(125deg, #657f70, #2e5349);
}
.art-orbit {
  position: absolute;
  border: 1px solid #f4f7e978;
  border-radius: 50%;
  z-index: 2;
}
.orbit-one {
  width: 270px;
  height: 270px;
  top: 20px;
  left: 24%;
}
.orbit-two {
  width: 220px;
  height: 220px;
  top: 45px;
  left: 30%;
}
.studio-type,
.console-type,
.studio-star,
.studio-disc {
  display: none;
}
[data-design="studio"] .workspace-artwork {
  background: #d5ed72;
  min-height: 300px;
}
[data-design="studio"] .art-sun,
[data-design="studio"] .art-hill,
[data-design="studio"] .art-orbit {
  display: none;
}
[data-design="studio"] .studio-type {
  display: block;
  position: absolute;
  top: 55px;
  left: 26px;
  z-index: 2;
  color: #292c24;
  font: 900 clamp(58px, 5vw, 82px)/1.08 var(--font-family);
  letter-spacing: -4px;
  transform: rotate(-6deg);
}
[data-design="studio"] .studio-star {
  display: block;
  position: absolute;
  right: -12px;
  top: 0;
  font-size: 150px;
  line-height: 1;
  color: #5142dc;
  transform: rotate(12deg);
}
[data-design="studio"] .studio-disc {
  display: block;
  position: absolute;
  width: 130px;
  height: 130px;
  right: -35px;
  bottom: -45px;
  border: 22px solid #292c24;
  border-radius: 50%;
}
[data-theme="dark"][data-design="editorial"] .workspace-artwork {
  background: linear-gradient(145deg, #555448, #333e33 70%);
}
[data-theme="dark"][data-design="editorial"] .art-label {
  color: #ebe5d1;
}
[data-theme="dark"][data-design="editorial"] .art-sun {
  background: #d8c8a9;
}
[data-theme="dark"][data-design="editorial"] .hill-back {
  background: linear-gradient(120deg, #68755f, #465b4c);
}
[data-theme="dark"][data-design="editorial"] .hill-front {
  background: linear-gradient(125deg, #3b5545, #1c352d);
}
[data-design="console"] .workspace-artwork {
  background:
    linear-gradient(#466b5e25 1px, transparent 1px),
    linear-gradient(90deg, #466b5e25 1px, transparent 1px),
    radial-gradient(ellipse at 50% 60%, #22483d, #111d24 70%);
  background-size:
    24px 24px,
    24px 24px,
    100% 100%;
}
[data-design="console"] .art-hill,
[data-design="console"] .art-sun {
  display: none;
}
[data-design="console"] .art-orbit {
  border-color: #8cd8c359;
  width: 150px;
  height: 150px;
  top: 35px;
  left: calc(50% - 75px);
}
[data-design="console"] .orbit-two {
  width: 220px;
  height: 220px;
  top: 0;
  left: calc(50% - 110px);
  transform: rotateX(65deg) rotateZ(-20deg);
}
[data-design="console"] .art-label {
  color: #8cd8c3;
}
[data-design="console"] .console-type {
  display: block;
  position: absolute;
  bottom: 20px;
  left: 22px;
  font:
    10px/1.8 ui-monospace,
    monospace;
  letter-spacing: 1px;
  color: #8cd8c3;
}
@media (max-width: 720px) {
  .workspace-artwork {
    min-height: 220px;
  }
  .hill-back {
    top: 130px;
  }
  .hill-front {
    top: 190px;
  }
  [data-design="studio"] .workspace-artwork {
    min-height: 255px;
  }
  [data-design="studio"] .studio-type {
    font-size: 64px;
    top: 45px;
  }
}
</style>
