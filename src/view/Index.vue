<!--
  Index.vue (Vue 3 + p5.js)

  이 파일은 p5.js 스케치를 Vue 3 컴포넌트 안에서 실행하는 예제입니다.
  - p5의 전역 콜백(window.setup/window.draw/window.windowResized)을 Vue 마운트 시점에 등록하여 루프를 구동합니다.
  - createCanvas(..., WEBGL)로 3D 컨텍스트를 사용하며, 오소그래픽 카메라(ortho)로 평면적인 깊이를 연출합니다.
  - 원본 알고리즘(다각형 성장 → 원기둥 적층 → 서서히 이동/소멸)을 최대한 보존하고, 모바일/WebView 안정화를 위해 DPR 제한과 리사이즈 동기화를 추가했습니다。
-->
<template>
  <!-- p5 캔버스를 parent()로 붙일 컨테이너. 전체 화면을 차지하도록 CSS에서 고정 레이아웃을 설정 -->
  <div class="sketch"></div>
</template>

<script setup>
//작품 원작자 정보
//Created by kusakari
//https://twitter.com/kusakarism

/*
  [스크립트 개요]
  - p5.js를 Vue 3 SFC 내부에서 사용하는 패턴.
  - onMounted에서 window.setup/draw/windowResized에 콜백을 바인딩하여 p5 루프를 동작시킵니다.
  - DPR(픽셀 밀도) 상한을 두어 모바일 WebView에서 과도한 해상도 연산을 방지합니다.
  - setObject() → RegionRect → AreaPolygon 구조로, 영역을 분할/샘플링하여 다각형을 성장시키고,
    각 다각형을 원기둥(cylinder) 형태로 적층하여 3D 구조를 만듭니다.
*/

import p5 from "p5";
import { onBeforeUnmount, onMounted } from "vue";

let _p5 = null;
let _renderer = null;

// ----- 전역 상태 변수 -----
// _minW/_maxW: 현재 화면 크기에 기반한 최소/최대 치수 (스케일 기준)
// _aryRegionRect: 화면에 표현될 RegionRect 인스턴스 목록
// _aryRotate: 회전값 저장(원본 소스에서 사용하던 배열; 현재는 생성/애니메이션에 사용하지 않지만 보존)
let _minW;
let _maxW;
let _aryRegionRect = [];
let _aryRotate = [];

/*
  화면 크기와 픽셀 밀도(DPR)를 반영하여 그리기 모드/선 굵기를 설정하고,
  사각형 영역(RegionRect)을 1개 생성합니다.
  - _minW/_maxW: 스케일 기준
  - strokeWeight: 해상도가 달라져도 선 두께가 비슷하게 보이도록 DPR 반영
  - RegionRect: 내부에서 다각형을 생성/성장시키고, 원기둥으로 적층/이동 처리
*/
function setObject(p) {
  _minW = p.min(p.width, p.height) * 1;
  _maxW = p.max(p.width, p.height) * 1;

  // 타원/사각형의 기준 모드 설정 (p5 3D에서도 2D 프리미티브 사용 가능)
  p.ellipseMode(p.RADIUS);
  p.rectMode(p.CENTER);

  // 라인/면 스타일 기본값
  p.stroke(0); // 검정 선
  p.strokeWeight(((_minW / 800) * p.pixelDensity()) / 2); // 해상도 보정

  // 생성 목록 초기화
  _aryRegionRect = [];

  // 표현할 영역 개수(원본은 1개). 필요 시 늘릴 수 있음
  let numRegionRect = 1; // int(random(1,7)) 등으로 변형 가능

  // 표현 영역: X는 전체 폭, Y는 정사각 기준의 70% 범위로 제한 (가시성/구도 안정화)
  let minRegionX = (-p.width / 2) * 1;
  let maxRegionX = (p.width / 2) * 1;
  let minRegionY = (-_minW / 2) * 0.7;
  let maxRegionY = (_minW / 2) * 0.7;

  // RegionRect 인스턴스 생성
  for (let i = 0; i < numRegionRect; i++) {
    _aryRegionRect.push(
      new RegionRect(minRegionX, maxRegionX, minRegionY, maxRegionY),
    );
  }

  // 회전값 초기화(원본 보존; 현재 사용 X)
  _aryRotate = [];
  for (let i = 0; i < 3; i++) {
    _aryRotate[i] = p.random(2 * p.PI);
  }
}

// 뷰포트 변경(회전/주소창 변화 등) 시 캔버스를 리사이즈하고,
// DPR을 다시 반영한 뒤, 모든 객체를 재생성하여 스케일을 일치시킵니다.

// 하나의 가시 영역을 나타내는 컨테이너 클래스
// - setPolygon()에서 다각형을 여러 개 생성하여 aryPolygon에 보관
// - draw()에서 폴리곤을 이동/소멸시키고, 주기적으로 addPolygon()으로 보충
class RegionRect {
  constructor(minRegionX, maxRegionX, minRegionY, maxRegionY) {
    this.minRegionX = minRegionX;
    this.maxRegionX = maxRegionX;
    this.minRegionY = minRegionY;
    this.maxRegionY = maxRegionY;
  }

  setPolygon(p) {
    this.maxTrial = 100;
    let numPolygon = 5;
    this.maxPolygonR =
      p.min(
        this.maxRegionX - this.minRegionX,
        this.maxRegionY - this.minRegionY,
      ) / 3;
    this.stepR = _minW / 500;
    this.shrink =
      p.min(
        this.maxRegionX - this.minRegionX,
        this.maxRegionY - this.minRegionY,
      ) / 400;
    let palette = [];
    this.speedX = -_minW / 400;
    this.triggerX = this.maxRegionX / 2;
    let minX = this.triggerX;
    let maxX = this.triggerX + _minW * 0.5;
    this.addRate = 4;
    this.aryPolygon = [];
    this.aryAryCornerXy = [];
    for (let i = 0; i < numPolygon; i++) {
      let areaXy = setAreaXy(p, minX, maxX, this.minRegionY, this.maxRegionY);
      let rotateAng = p.random(2 * p.PI);
      let numCorner = p.int(p.random(3, 9));
      let numInner = p.int(p.random(3, 10));
      let hi = p.random(_minW / 100, (_minW / 100) * 7);
      if (i > 0) {
        let isInside = checkInside(p, this.aryAryCornerXy, areaXy);
        let countTrial = 0;
        while (isInside == true) {
          countTrial++;
          areaXy = setAreaXy(p, minX, maxX, this.minRegionY, this.maxRegionY);
          isInside = checkInside(p, this.aryAryCornerXy, areaXy);
          if (countTrial > this.maxTrial) break;
        }
        if (countTrial > this.maxTrial) break;
      }
      let aryTemp = growPolygon(
        p,
        numCorner,
        this.aryAryCornerXy,
        areaXy,
        rotateAng,
        this.maxPolygonR,
        this.stepR,
        this.minRegionX,
        this.maxRegionX * 2,
        this.minRegionY,
        this.maxRegionY,
      );
      let aryCornerXy = aryTemp[0];
      let areaR = aryTemp[1];
      if (areaR > 0) {
        this.aryPolygon.push(
          new AreaPolygon(
            areaXy,
            areaR,
            rotateAng,
            this.shrink,
            palette,
            numInner,
            numCorner,
            hi,
            this.speedX,
            this.triggerX,
          ),
        );
        this.aryAryCornerXy.push(aryCornerXy);
      }
    }
  }

  addPolygon(p) {
    let minX = this.triggerX;
    let maxX = this.triggerX + _minW * 0.5;
    let areaXy = setAreaXy(p, minX, maxX, this.minRegionY, this.maxRegionY);
    let rotateAng = p.random(2 * p.PI);
    let numCorner = p.int(p.random(3, 9));
    let numInner = p.int(p.random(3, 10));
    let hi = p.random(_minW / 100, (_minW / 100) * 7);
    let palette = [];
    let isInside = checkInside(p, this.aryAryCornerXy, areaXy);
    let countTrial = 0;
    while (isInside == true) {
      countTrial++;
      areaXy = setAreaXy(p, minX, maxX, this.minRegionY, this.maxRegionY);
      isInside = checkInside(p, this.aryAryCornerXy, areaXy);
      if (countTrial > this.maxTrial) break;
    }
    if (countTrial > this.maxTrial) return;
    let aryTemp = growPolygon(
      p,
      numCorner,
      this.aryAryCornerXy,
      areaXy,
      rotateAng,
      this.maxPolygonR,
      this.stepR,
      this.minRegionX,
      this.maxRegionX * 2,
      this.minRegionY,
      this.maxRegionY,
    );
    let aryCornerXy = aryTemp[0];
    let areaR = aryTemp[1];
    if (areaR > 0) {
      this.aryPolygon.push(
        new AreaPolygon(
          areaXy,
          areaR,
          rotateAng,
          this.shrink,
          palette,
          numInner,
          numCorner,
          hi,
          this.speedX,
          this.triggerX,
        ),
      );
      this.aryAryCornerXy.push(aryCornerXy);
    }
  }

  draw(p) {
    for (let i = this.aryPolygon.length - 1; i >= 0; i--) {
      this.aryPolygon[i].draw(p);
      for (let j = 0; j < this.aryAryCornerXy[i].length; j++) {
        this.aryAryCornerXy[i][j].x += this.speedX;
      }
      if (
        this.aryPolygon[i].areaXy.x <
        (this.minRegionX - this.maxPolygonR) * 1.5
      ) {
        this.aryPolygon.splice(i, 1);
        this.aryAryCornerXy.splice(i, 1);
      }
    }
    if (p.frameCount % this.addRate === 0) {
      this.addPolygon(p);
    }
  }
}

// 주어진 영역(min/max X,Y) 안에서 임의의 중심 좌표를 반환
function setAreaXy(p, minRegionX, maxRegionX, minRegionY, maxRegionY) {
  let areaXy = p.createVector(
    p.random(minRegionX, maxRegionX),
    p.random() * (maxRegionY - minRegionY) + minRegionY,
  );
  return areaXy;
}

// 다각형을 '중심에서 바깥으로' 서서히 성장시키는 핵심 알고리즘
// - 각 코너는 중심에서 일정 각도를 두고 배치됨(stepAng)
// - 반경을 stepR씩 증가시키며, 기존 다각형의 변과 교차하거나 영역 경계를 넘기 직전까지 확장
// - 최종적으로 가능한 최대 반경 areaR과 코너 좌표 배열을 반환
function growPolygon(
  p,
  numCorner,
  aryAryXyPolygon,
  areaXy,
  rotateAng,
  maxPolygonR,
  stepR,
  minRegionX,
  maxRegionX,
  minRegionY,
  maxRegionY,
) {
  let areaR = 0;
  let isCross = false;
  let stepAng = (2 * p.PI) / numCorner;
  let aryCornerXy = [];
  while (isCross == false) {
    areaR += stepR;
    aryCornerXy = [];
    for (let i = 0; i < numCorner; i++) {
      aryCornerXy[i] = p.constructor.Vector.add(
        areaXy,
        p
          .createVector(0, -areaR)
          .rotate(stepAng * (i - 0.5))
          .rotate(rotateAng),
      );
    }
    for (let i = 0; i < aryAryXyPolygon.length; i++) {
      for (let j = 0; j < aryAryXyPolygon[i].length; j++) {
        let next_j = (j + 1) % aryAryXyPolygon[i].length;
        for (let k = 0; k < numCorner; k++) {
          let next_k = (k + 1) % numCorner;
          if (
            checkCrossLineSegment(
              p,
              aryCornerXy[k],
              aryCornerXy[next_k],
              aryAryXyPolygon[i][j],
              aryAryXyPolygon[i][next_j],
            ) === true
          ) {
            isCross = true;
            break;
          }
        }
        if (isCross === true) break;
      }
      if (isCross === true) break;
    }
    for (let i = 0; i < numCorner; i++) {
      if (
        aryCornerXy[i].x < minRegionX ||
        aryCornerXy[i].x > maxRegionX ||
        aryCornerXy[i].y < minRegionY ||
        aryCornerXy[i].y > maxRegionY
      ) {
        isCross = true;
      }
    }
    if (isCross === true) {
      areaR -= stepR;
    }
    if (areaR > maxPolygonR) {
      areaR = maxPolygonR;
      break;
    }
  }
  aryCornerXy = [];
  for (let i = 0; i < numCorner; i++) {
    aryCornerXy[i] = p.constructor.Vector.add(
      areaXy,
      p
        .createVector(0, -areaR)
        .rotate(stepAng * (i - 0.5))
        .rotate(rotateAng),
    );
  }
  return [aryCornerXy, areaR];
}

// 두 선분(xy_a-xy_b, xy_c-xy_d)이 교차하는지 검사
// p5.Vector.cross의 z성분 부호를 이용하여 양쪽에서 교차 여부를 확인
function checkCrossLineSegment(p, xy_a, xy_b, xy_c, xy_d) {
  let isCross = false;
  let vec_a_b = p.constructor.Vector.sub(xy_b, xy_a);
  let vec_a_c = p.constructor.Vector.sub(xy_c, xy_a);
  let vec_a_d = p.constructor.Vector.sub(xy_d, xy_a);
  let vec_c_d = p.constructor.Vector.sub(xy_d, xy_c);
  let vec_c_a = p.constructor.Vector.sub(xy_a, xy_c);
  let vec_c_b = p.constructor.Vector.sub(xy_b, xy_c);
  let cr_ab_ac = p.constructor.Vector.cross(vec_a_b, vec_a_c);
  let cr_ab_ad = p.constructor.Vector.cross(vec_a_b, vec_a_d);
  let cr_cd_ca = p.constructor.Vector.cross(vec_c_d, vec_c_a);
  let cr_cd_cb = p.constructor.Vector.cross(vec_c_d, vec_c_b);
  if (cr_ab_ac.z * cr_ab_ad.z <= 0 && cr_cd_ca.z * cr_cd_cb.z <= 0) {
    isCross = true;
  }
  return isCross;
}

// 점(areaXy)이 주어진 다각형 집합(aryAryXy) 내부에 포함되는지 검사
// 각 변에 대해 동일한 방향으로 외적(z>0)이 유지되면 내부로 판단
function checkInside(p, aryAryXy, areaXy) {
  let isInside = false;
  for (let i = 0; i < aryAryXy.length; i++) {
    for (let j = 0; j < aryAryXy[i].length; j++) {
      let next_j = (j + 1) % aryAryXy[i].length;
      let vec_a_b = p.constructor.Vector.sub(
        aryAryXy[i][next_j],
        aryAryXy[i][j],
      );
      let vec_a_c = p.constructor.Vector.sub(areaXy, aryAryXy[i][j]);
      let cr_ab_ac = p.constructor.Vector.cross(vec_a_b, vec_a_c);
      if (cr_ab_ac.z < 0) {
        break;
      } else if (j === aryAryXy[i].length - 1) {
        isInside = true;
      }
    }
    if (isInside === true) break;
  }
  return isInside;
}

// 하나의 다각형을 3D 원기둥들의 적층으로 표현하는 클래스
// - hi/hiStep: 전체 높이 및 각 내부 링의 단 높이
// - growSpeed/count: 프레임 기반 성장 제어 (서서히 쌓이는 연출)
// - palette: 색상 팔레트(현재는 HSB/회색계로 단순화)
// - speedX/triggerX: 좌측 이동 및 그리기 중단 트리거(화면 우측 생성 → 좌측 소멸)
class AreaPolygon {
  constructor(
    areaXy,
    areaR,
    rotateAng,
    shrink,
    palette,
    numInner,
    numCorner,
    hi,
    speedX,
    triggerX,
  ) {
    this.areaXy = areaXy;
    this.areaR = areaR;
    this.rotateAng = rotateAng;
    this.shrink = shrink;
    this.r = this.areaR - this.shrink;
    this.numCorner = numCorner;
    this.stepAng = null; // assigned in draw
    this.hi = hi;
    this.hiStep = this.hi / 2;
    this.speedX = speedX;
    this.triggerX = triggerX;
    this.growSpeed = null;
    this.count = 0;
    this.currentHi = 0;
    this.currentCol = [];
    this.palette = palette;
    this.numInner = numInner;
    this.aryInnerR = [];
    this.aryInnerAng = [];
    this.aryGrad = [];
    this.aryCurrentHi = [];
    this.aryCurrentCol = [];
  }

  setInner(p) {
    this.aryInnerR = [];
    this.aryInnerAng = [];
    this.aryGrad = [];
    this.aryCurrentHi = [];
    this.aryCurrentCol = [];
    let stepR = (this.r / ((this.numInner + 1) * 2 - 1)) * 2;
    for (let i = 0; i < this.numInner; i++) {
      this.aryInnerR[i] = this.r - stepR * (i + 1);
      this.aryInnerAng[i] =
        ((2 * p.PI) / this.numCorner) * p.int(p.random(this.numCorner));
      this.aryCurrentHi[i] = 0;
      this.aryCurrentCol[i] = [];
    }
  }

  draw(p) {
    if (!this.stepAng) this.stepAng = (2 * p.PI) / this.numCorner;
    if (!this.growSpeed) this.growSpeed = p.random(10, 20);
    if (this.aryInnerR.length === 0) this.setInner(p);
    this.areaXy.x += this.speedX;
    if (this.areaXy.x > this.triggerX) return;
    if (this.r < 0) return;
    if (this.count > 0) {
      if (this.count <= this.growSpeed) {
        let ratio = this.count / this.growSpeed;
        this.currentHi = this.hi * ratio;
        this.currentCol = [p.color(100, 50 * ratio), p.color(100, 30 * ratio)];
      }
      p.push();
      p.stroke(this.currentCol[0]);
      p.fill(this.currentCol[1]);
      p.translate(this.areaXy.x, this.areaXy.y);
      drawCylinder(
        p,
        this.numCorner,
        this.r,
        this.currentHi,
        this.rotateAng,
        8,
      );
      p.pop();
      this.drawInner(p);
    }
    this.count++;
  }

  drawInner(p) {
    for (let i = 0; i < this.numInner; i++) {
      if (
        this.count > (i + 1) * this.growSpeed &&
        this.count <= (i + 2) * this.growSpeed
      ) {
        let ratio = (this.count - (i + 1) * this.growSpeed) / this.growSpeed;
        this.aryCurrentHi[i] = this.hiStep * ratio;
        this.aryCurrentCol[i] = [
          p.color(100, 50 * ratio),
          p.color(100, 30 * ratio),
        ];
      }
      if (this.aryCurrentHi[i] > 0) {
        p.push();
        p.stroke(this.aryCurrentCol[i][0]);
        p.fill(this.aryCurrentCol[i][1]);
        p.translate(this.areaXy.x, this.areaXy.y, this.hi + this.hiStep * i);
        drawCylinder(
          p,
          this.numCorner,
          this.aryInnerR[i],
          this.aryCurrentHi[i],
          this.rotateAng,
          8,
        );
        p.pop();
      }
    }
  }
}

// p5의 WEBGL 프리미티브 cylinder()를 사용하여 각 링/바디를 렌더
// - 정육각형/팔각형 느낌을 위해 side(세그먼트 수)를 numCorner+1로 지정
// - 정렬 보정: rotateX/rotateY 및 상하 중앙 정렬(translate(0, hi/2))
function drawCylinder(p, numCorner, r, hi, rotateAng, detailY) {
  p.push();
  p.rotateX(p.PI / 2);
  if (numCorner % 2 == 0) {
    p.rotateY((-2 * p.PI) / numCorner / 2);
  }
  p.translate(0, hi / 2);
  p.rotateY(rotateAng + p.PI);
  p.cylinder(r, hi, numCorner + 1, detailY, true, true);
  p.pop();
}

const sketch = (p) => {
  p.setup = () => {
    _renderer = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    const host = document.querySelector(".sketch");
    if (host) _renderer.parent(host);
    p.colorMode(p.HSB, 360, 100, 100, 255);
    p.frameRate(30);
    setObject(p);
    // call setPolygon for each RegionRect with p
    for (let i = 0; i < _aryRegionRect.length; i++) {
      if (typeof _aryRegionRect[i].setPolygon === "function") {
        _aryRegionRect[i].setPolygon(p);
      }
    }
  };

  p.draw = () => {
    p.background(0);
    p.ortho(
      -p.width / 2,
      p.width / 2,
      -p.height / 2,
      p.height / 2,
      0,
      p.width * 2,
    );
    p.translate(0, _minW / 10, 0);
    p.rotateX(p.PI / 2 - p.PI / 4);
    p.rotateZ(p.PI / 4);
    for (let i = 0; i < _aryRegionRect.length; i++) {
      _aryRegionRect[i].draw(p);
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    setObject(p);
    // call setPolygon for each RegionRect with p
    for (let i = 0; i < _aryRegionRect.length; i++) {
      if (typeof _aryRegionRect[i].setPolygon === "function") {
        _aryRegionRect[i].setPolygon(p);
      }
    }
  };
};

onMounted(() => {
  _p5 = new p5(sketch);
});

onBeforeUnmount(() => {
  if (_p5) {
    _p5.remove();
    _p5 = null;
  }
});
</script>

<style scoped>
/*
  전체 화면 고정 레이아웃
  - 스크롤/바운스 방지(overscroll-behavior, touch-action)
  - .sketch 컨테이너를 화면에 고정하고, p5 캔버스를 절대 배치로 꽉 채움
  - 배경은 검정(#000)으로 설정하여 3D 형태 대비를 높임
*/
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
/* p5 캔버스가 붙을 컨테이너 (전체 화면) */
.sketch {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 1;
}
/* p5가 생성한 canvas 엘리먼트가 컨테이너를 꽉 채우도록 설정 */
.sketch canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
