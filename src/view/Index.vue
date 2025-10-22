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

// p5가 생성한 캔버스/렌더러 참조를 저장 (언마운트 시 제거에 사용)
import { onBeforeUnmount, onMounted } from "vue";

let _renderer = null;

function setup() {
  // 1) p5 캔버스 생성: 3D 렌더러(WEBGL) 사용
  _renderer = createCanvas(windowWidth, windowHeight, WEBGL);

  // 2) 모바일/WebView 안정화를 위한 DPR 상한(최대 2배)
  //    - 너무 높은 DPR은 연산량과 메모리 소비를 급격히 올려 프레임 저하를 유발
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  // 3) 생성된 p5 캔버스를 Vue 템플릿의 .sketch 컨테이너에 붙임
  const host = document.querySelector(".sketch");
  if (host && _renderer && typeof _renderer.parent === "function") {
    _renderer.parent(host);
  }

  // 4) 색상 공간: HSB (채도/명도 조절에 직관적)
  colorMode(HSB, 360, 100, 100, 255);

  // 5) 프레임레이트: 원본 대비 살짝 안정적인 30fps
  frameRate(30);

  // 6) 화면 크기/밀도 기반 파라미터 초기화 및 객체 생성
  setObject();
}

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
function setObject() {
  _minW = min(width, height) * 1;
  _maxW = max(width, height) * 1;

  // 타원/사각형의 기준 모드 설정 (p5 3D에서도 2D 프리미티브 사용 가능)
  ellipseMode(RADIUS);
  rectMode(CENTER);

  // 라인/면 스타일 기본값
  stroke(0); // 검정 선
  strokeWeight(((_minW / 800) * pixelDensity()) / 2); // 해상도 보정

  // 생성 목록 초기화
  _aryRegionRect = [];

  // 표현할 영역 개수(원본은 1개). 필요 시 늘릴 수 있음
  let numRegionRect = 1; // int(random(1,7)) 등으로 변형 가능

  // 표현 영역: X는 전체 폭, Y는 정사각 기준의 70% 범위로 제한 (가시성/구도 안정화)
  let minRegionX = (-width / 2) * 1;
  let maxRegionX = (width / 2) * 1;
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
    _aryRotate[i] = random(2 * PI);
  }
}

// 뷰포트 변경(회전/주소창 변화 등) 시 캔버스를 리사이즈하고,
// DPR을 다시 반영한 뒤, 모든 객체를 재생성하여 스케일을 일치시킵니다.
function windowResized() {
  // keep canvas in sync with viewport
  resizeCanvas(windowWidth, windowHeight);
  // recompute dependent sizes/weights and regenerate objects
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  setObject();
}

// 하나의 가시 영역을 나타내는 컨테이너 클래스
// - setPolygon()에서 다각형을 여러 개 생성하여 aryPolygon에 보관
// - draw()에서 폴리곤을 이동/소멸시키고, 주기적으로 addPolygon()으로 보충
class RegionRect {
  constructor(minRegionX, maxRegionX, minRegionY, maxRegionY) {
    this.minRegionX = minRegionX;
    this.maxRegionX = maxRegionX;
    this.minRegionY = minRegionY;
    this.maxRegionY = maxRegionY;
    this.setPolygon();
  }

  // 초기 다각형 배치
  // - maxTrial: 충돌/중복 방지를 위한 좌표 재시도 횟수
  // - maxPolygonR/stepR/shrink: 성장 최대 반경/증가 단위/내부 수축량
  // - speedX/triggerX: 전체 폴리곤의 좌측 이동 속도와 생성 트리거 위치
  // - addRate: 몇 프레임마다 새로운 폴리곤을 추가할지 (밀도 제어)
  setPolygon() {
    this.maxTrial = 100;
    let numPolygon = 5; //300;

    this.maxPolygonR =
      min(
        this.maxRegionX - this.minRegionX,
        this.maxRegionY - this.minRegionY,
      ) / 3;
    this.stepR = _minW / 500;
    this.shrink =
      min(
        this.maxRegionX - this.minRegionX,
        this.maxRegionY - this.minRegionY,
      ) / 400; //100;
    let palette = []; //this.setCol();
    this.speedX = -_minW / 400;
    this.triggerX = this.maxRegionX / 2;
    let minX = this.triggerX;
    let maxX = this.triggerX + _minW * 0.5;
    this.addRate = 4; //frame per an object
    this.aryPolygon = [];
    this.aryAryCornerXy = [];

    // 초기 다각형을 여러 개 생성 (원본값은 300, 퍼포먼스상 5로 낮춤)
    for (let i = 0; i < numPolygon; i++) {
      let areaXy = setAreaXy(minX, maxX, this.minRegionY, this.maxRegionY);
      let rotateAng = random(2 * PI);
      let numCorner = int(random(3, 9));
      let numInner = int(random(3, 10));
      let hi = random(_minW / 100, (_minW / 100) * 7);

      // 이전에 생성된 다각형들과의 포함/충돌 여부를 검사하여 겹치지 않게 배치
      if (i > 0) {
        let isInside = checkInside(this.aryAryCornerXy, areaXy);
        let countTrial = 0;
        while (isInside == true) {
          countTrial++;
          areaXy = setAreaXy(minX, maxX, this.minRegionY, this.maxRegionY);
          isInside = checkInside(this.aryAryCornerXy, areaXy);
          if (countTrial > this.maxTrial) {
            break;
          }
        }
        if (countTrial > this.maxTrial) {
          break;
        }
      }

      // 중심에서부터 반경을 키워가며, 경계/다른 다각형과 충돌하기 직전까지 성장
      let aryTemp = growPolygon(
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
      ); //maxRegionX * 2
      let aryCornerXy = aryTemp[0];
      let areaR = aryTemp[1];

      // 성장 성공 시 AreaPolygon(원기둥 적층 표현)으로 래핑하여 보관
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
        ); // col, col2));
        this.aryAryCornerXy.push(aryCornerXy);
      }
    }
  }

  // 주기적으로 새 다각형을 생성하여 오른쪽에서 유입시키는 로직
  addPolygon() {
    let minX = this.triggerX;
    let maxX = this.triggerX + _minW * 0.5;
    let areaXy = setAreaXy(minX, maxX, this.minRegionY, this.maxRegionY);
    let rotateAng = random(2 * PI);
    let numCorner = int(random(3, 9));
    let numInner = int(random(3, 10));
    let hi = random(_minW / 100, (_minW / 100) * 7);
    let palette = [];
    let isInside = checkInside(this.aryAryCornerXy, areaXy);
    let countTrial = 0;
    while (isInside == true) {
      countTrial++;
      areaXy = setAreaXy(minX, maxX, this.minRegionY, this.maxRegionY);
      isInside = checkInside(this.aryAryCornerXy, areaXy);
      if (countTrial > this.maxTrial) {
        break;
      }
    }
    if (countTrial > this.maxTrial) {
      return;
    }
    let aryTemp = growPolygon(
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
    ); //maxRegionX * 2
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
      ); // col, col2));
      this.aryAryCornerXy.push(aryCornerXy);
    }
  }

  // 모든 폴리곤을 그리면서 왼쪽으로 이동시킴.
  // 트리거를 지나 왼쪽 바깥으로 빠져나간 폴리곤은 리스트에서 제거(메모리/퍼포먼스 관리).
  // addRate 주기에 맞춰 새로운 폴리곤을 추가하여 스트림을 유지.
  draw() {
    for (let i = this.aryPolygon.length - 1; i >= 0; i--) {
      this.aryPolygon[i].draw();
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
    if (frameCount % this.addRate === 0) {
      this.addPolygon();
    }
  }
}

// 주어진 영역(min/max X,Y) 안에서 임의의 중심 좌표를 반환
function setAreaXy(minRegionX, maxRegionX, minRegionY, maxRegionY) {
  let areaXy = createVector(
    random(minRegionX, maxRegionX),
    random() * (maxRegionY - minRegionY) + minRegionY,
  );

  return areaXy;
}

// 다각형을 '중심에서 바깥으로' 서서히 성장시키는 핵심 알고리즘
// - 각 코너는 중심에서 일정 각도를 두고 배치됨(stepAng)
// - 반경을 stepR씩 증가시키며, 기존 다각형의 변과 교차하거나 영역 경계를 넘기 직전까지 확장
// - 최종적으로 가능한 최대 반경 areaR과 코너 좌표 배열을 반환
function growPolygon(
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
  // areaR: 현재 반경, isCross: 충돌 여부 플래그
  let areaR = 0;
  let isCross = false;
  let stepAng = (2 * PI) / numCorner;
  let aryCornerXy = [];
  while (isCross == false) {
    areaR += stepR;
    aryCornerXy = [];
    for (let i = 0; i < numCorner; i++) {
      aryCornerXy[i] = p5.Vector.add(
        areaXy,
        createVector(0, -areaR)
          .rotate(stepAng * (i - 0.5))
          .rotate(rotateAng),
      ); // side toward upper direction
    }
    // 기존 폴리곤들의 각 변과 현재 성장 중인 다각형의 각 변이 교차하는지 검사
    for (let i = 0; i < aryAryXyPolygon.length; i++) {
      for (let j = 0; j < aryAryXyPolygon[i].length; j++) {
        let next_j = (j + 1) % aryAryXyPolygon[i].length;
        for (let k = 0; k < numCorner; k++) {
          let next_k = (k + 1) % numCorner;
          if (
            checkCrossLineSegment(
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
        if (isCross === true) {
          break;
        }
      }
      if (isCross === true) {
        break;
      }
    }
    // 성장한 코너가 영역 경계를 벗어나는지 검사 (벗어나면 직전 반경에서 정지)
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

  // 최종 areaR에 맞춰 코너 좌표를 한 번 더 정확히 계산
  aryCornerXy = [];
  for (let i = 0; i < numCorner; i++) {
    aryCornerXy[i] = p5.Vector.add(
      areaXy,
      createVector(0, -areaR)
        .rotate(stepAng * (i - 0.5))
        .rotate(rotateAng),
    ); //side toward upper direction
  }

  return [aryCornerXy, areaR];
}

// 두 선분(xy_a-xy_b, xy_c-xy_d)이 교차하는지 검사
// p5.Vector.cross의 z성분 부호를 이용하여 양쪽에서 교차 여부를 확인
function checkCrossLineSegment(xy_a, xy_b, xy_c, xy_d) {
  //line xy_a to xy_b, line xy_c to xy_d
  let isCross = false;
  let vec_a_b = p5.Vector.sub(xy_b, xy_a);
  let vec_a_c = p5.Vector.sub(xy_c, xy_a);
  let vec_a_d = p5.Vector.sub(xy_d, xy_a);
  let vec_c_d = p5.Vector.sub(xy_d, xy_c);
  let vec_c_a = p5.Vector.sub(xy_a, xy_c);
  let vec_c_b = p5.Vector.sub(xy_b, xy_c);
  let cr_ab_ac = p5.Vector.cross(vec_a_b, vec_a_c);
  let cr_ab_ad = p5.Vector.cross(vec_a_b, vec_a_d);
  let cr_cd_ca = p5.Vector.cross(vec_c_d, vec_c_a);
  let cr_cd_cb = p5.Vector.cross(vec_c_d, vec_c_b);
  if (cr_ab_ac.z * cr_ab_ad.z <= 0 && cr_cd_ca.z * cr_cd_cb.z <= 0) {
    isCross = true;
  }

  return isCross;
}

// 점(areaXy)이 주어진 다각형 집합(aryAryXy) 내부에 포함되는지 검사
// 각 변에 대해 동일한 방향으로 외적(z>0)이 유지되면 내부로 판단
function checkInside(aryAryXy, areaXy) {
  let isInside = false;
  for (let i = 0; i < aryAryXy.length; i++) {
    for (let j = 0; j < aryAryXy[i].length; j++) {
      let next_j = (j + 1) % aryAryXy[i].length;
      let vec_a_b = p5.Vector.sub(aryAryXy[i][next_j], aryAryXy[i][j]);
      let vec_a_c = p5.Vector.sub(areaXy, aryAryXy[i][j]);
      let cr_ab_ac = p5.Vector.cross(vec_a_b, vec_a_c);
      if (cr_ab_ac.z < 0) {
        break;
      } else if (j === aryAryXy[i].length - 1) {
        isInside = true;
      }
    }
    if (isInside === true) {
      break;
    }
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
    this.stepAng = (2 * PI) / this.numCorner;
    this.hi = hi; //_minW / 50;
    this.hiStep = this.hi / 2; //_minW / 100;
    this.speedX = speedX;
    this.triggerX = triggerX;

    this.growSpeed = random(10, 20); //count per a floor
    this.count = 0;
    this.currentHi = 0;
    this.currentCol = [];

    this.palette = palette;
    this.numInner = numInner;
    this.setInner();
  }

  // 내부 링(Inner) 반경/회전각/그라데이션/현재 높이 초기화
  // numInner 개수만큼 concentric ring을 생성
  setInner() {
    this.aryInnerR = [];
    this.aryInnerAng = [];
    this.aryGrad = [];
    this.aryCurrentHi = [];
    this.aryCurrentCol = [];
    let stepR = (this.r / ((this.numInner + 1) * 2 - 1)) * 2;
    for (let i = 0; i < this.numInner; i++) {
      this.aryInnerR[i] = this.r - stepR * (i + 1);
      this.aryInnerAng[i] =
        ((2 * PI) / this.numCorner) * int(random(this.numCorner));
      this.aryCurrentHi[i] = 0;
      this.aryCurrentCol[i] = [];
    }
  }

  // 1) 전체 다각형의 중심을 좌측으로 이동
  // 2) 트리거를 지나가면 더 이상 그리지 않음 (오른쪽에서 왼쪽으로 흘러가는 느낌)
  // 3) count(프레임 카운트)에 비례해 높이/색을 서서히 증가시켜 성장 연출
  draw() {
    this.areaXy.x += this.speedX;
    if (this.areaXy.x > this.triggerX) {
      return;
    }
    if (this.r < 0) {
      return;
    }
    if (this.count > 0) {
      if (this.count <= this.growSpeed) {
        let ratio = this.count / this.growSpeed;
        this.currentHi = this.hi * ratio;
        this.currentCol = [color(100, 50 * ratio), color(100, 30 * ratio)];
      }
      push();
      stroke(this.currentCol[0]);
      fill(this.currentCol[1]);
      translate(this.areaXy.x, this.areaXy.y);
      drawCylinder(this.numCorner, this.r, this.currentHi, this.rotateAng, 8);
      pop();

      this.drawInner();
    }
    this.count++;
  }

  // 내부 링들을 계단식으로 일정 프레임 간격을 두고 성장시키는 루프
  drawInner() {
    for (let i = 0; i < this.numInner; i++) {
      if (
        this.count > (i + 1) * this.growSpeed &&
        this.count <= (i + 2) * this.growSpeed
      ) {
        let ratio = (this.count - (i + 1) * this.growSpeed) / this.growSpeed;
        this.aryCurrentHi[i] = this.hiStep * ratio;
        this.aryCurrentCol[i] = [
          color(100, 50 * ratio),
          color(100, 30 * ratio),
        ];
      }
      if (this.aryCurrentHi[i] > 0) {
        push();
        stroke(this.aryCurrentCol[i][0]);
        fill(this.aryCurrentCol[i][1]);
        translate(this.areaXy.x, this.areaXy.y, this.hi + this.hiStep * i);
        drawCylinder(
          this.numCorner,
          this.aryInnerR[i],
          this.aryCurrentHi[i],
          this.rotateAng,
          8,
        );
        pop();
      }
    }
  }
}

// p5의 WEBGL 프리미티브 cylinder()를 사용하여 각 링/바디를 렌더
// - 정육각형/팔각형 느낌을 위해 side(세그먼트 수)를 numCorner+1로 지정
// - 정렬 보정: rotateX/rotateY 및 상하 중앙 정렬(translate(0, hi/2))
function drawCylinder(numCorner, r, hi, rotateAng, detailY) {
  push();
  rotateX(PI / 2);
  if (numCorner % 2 == 0) {
    rotateY((-2 * PI) / numCorner / 2);
  }
  translate(0, hi / 2);
  rotateY(rotateAng + PI);
  cylinder(r, hi, numCorner + 1, detailY, true, true);
  pop();
}

// 매 프레임 초기화(검정 배경)
// 오소그래픽 카메라 설정
//  - 원근 왜곡이 없는 등각 투영에 가까운 느낌
//  - 근/원거리 클리핑을 넉넉히 잡아(0 ~ width*2) Z깊이 표현 안정화
// 장면의 전체 위치/각도를 적당히 틀어 입체감 부여
// 모든 RegionRect를 그리기(내부에서 폴리곤 이동/성장/소멸 관리)
function draw() {
  // 매 프레임 초기화(검정 배경)
  background(0);

  // 오소그래픽 카메라 설정
  //  - 원근 왜곡이 없는 등각 투영에 가까운 느낌
  //  - 근/원거리 클리핑을 넉넉히 잡아(0 ~ width*2) Z깊이 표현 안정화
  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, width * 2);

  // 장면의 전체 위치/각도를 적당히 틀어 입체감 부여
  translate(0, _minW / 10, 0);
  rotateX(PI / 2 - PI / 4);
  rotateZ(PI / 4);

  // 모든 RegionRect를 그리기(내부에서 폴리곤 이동/성장/소멸 관리)
  for (let i = 0; i < _aryRegionRect.length; i++) {
    _aryRegionRect[i].draw();
  }
}

// ----- Vue 라이프사이클: p5 전역 콜백 등록/해제 -----
onMounted(() => {
  // Vue가 DOM을 마운트한 뒤 p5가 전역 콜백을 인식하도록 설정
  // expose p5 callbacks so p5 runs the loop
  window.setup = setup;
  window.draw = draw;
  window.windowResized = windowResized;
});

onBeforeUnmount(() => {
  // p5 전역 콜백 해제 (다른 페이지로 이동 시 루프 정지)
  // 생성된 캔버스 제거(메모리 누수 방지)
  delete window.setup;
  delete window.draw;
  delete window.windowResized;
  if (_renderer && typeof _renderer.remove === "function") {
    _renderer.remove();
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
