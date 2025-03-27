<template>
  <div class="weather-info">
    <div class="weather-display">
      <!-- 아이콘 -->
      <div class="weather-icon">
        <i :class="iconClass"></i>
      </div>

      <!-- 텍스트 정보 -->
      <ul>
        <li>기온 : {{ weather.temperature }}℃</li>
        <li>강수 형태: {{ precipitationText }}</li>
        <li>습도: {{ weather.humidity }}%</li>
        <li>1시간 강수량: {{ weather.rainPerHour }}mm</li>
        <li>풍속: {{ weather.windSpeed }}m/s</li>
        <li>풍향: {{ windDirectionText }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import '@/assets/styles/weather-widget.css';

const weather = ref({});

// 강수 형태 해석
const precipitationMap = {
  0: "없음",
  1: "비",
  2: "비/눈",
  3: "눈",
  4: "소나기",
};

// 강수 형태 아이콘 맵
const iconMap = {
  0: "fa-solid fa-sun",
  1: "fa-solid fa-cloud-showers-heavy",
  2: "fa-solid fa-cloud-rain",
  3: "fa-solid fa-snowflake",
  4: "fa-solid fa-cloud-bolt",
};

const precipitationText = computed(
  () => precipitationMap[weather.value.precipitationType] || "정보 없음",
);

const iconClass = computed(
  () => iconMap[weather.value.precipitationType] || "fa-solid fa-question",
);

// 풍향 해석
const getWindDirection = (angle) => {
  const directions = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
  return directions[Math.round(angle / 45) % 8];
};

const windDirectionText = computed(() =>
  getWindDirection(Number(weather.value.windDirection)),
);

// Android에 GPS 데이터 요청
const requestGPSData = () => {
  return new Promise((resolve, reject) => {
    if (navigator.userAgent.includes("Android")) {
      // Android 브릿지 호출
      window.GPS.getGPSData();

      // GPS 데이터를 받아 처리
      window.receiveGPSData = (latitude, longitude) => {
        const gridData = latLonToGrid(latitude, longitude);
        resolve(gridData);
      };
    } else {
      reject(new Error("AndroidBridge가 활성화되지 않았습니다."));
    }
  });
};

const latLonToGrid = (lat, lon) => {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx: x, ny: y };
};

const fetchWeather = async () => {
  const now = new Date();

  const getYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const getHHMM = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = date.getMinutes();
    return minutes < 30
      ? `${String(hours - 1).padStart(2, "0")}00`
      : `${hours}00`;
  };

  try {
    const gridData = await requestGPSData();
    const url = new URL(
      "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst",
    );
    const params = {
      serviceKey:
        "w5c0HrdcfeykNvDjMhIQzq/5MpELUA0eBU/u1TpRBNG293IqdrinnVGeaHuFLyFdOODRDbD0EkJSiZ2fTGjvcw==",
      pageNo: "1",
      numOfRows: "1000",
      dataType: "JSON",
      base_date: getYYYYMMDD(now),
      base_time: getHHMM(now),
      nx: gridData.nx,
      ny: gridData.ny,
    };

    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key]),
    );

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.statusText}`);
    }

    const data = await response.json();

    const items = data.response?.body?.items?.item || [];
    weather.value = {
      precipitationType:
        items.find((item) => item.category === "PTY")?.obsrValue || "0",
      humidity: items.find((item) => item.category === "REH")?.obsrValue || "0",
      rainPerHour:
        items.find((item) => item.category === "RN1")?.obsrValue || "0",
      temperature:
        items.find((item) => item.category === "T1H")?.obsrValue || "0",
      windSpeedEastWest:
        items.find((item) => item.category === "UUU")?.obsrValue || "0",
      windSpeedNorthSouth:
        items.find((item) => item.category === "VVV")?.obsrValue || "0",
      windDirection:
        items.find((item) => item.category === "VEC")?.obsrValue || "0",
      windSpeed:
        items.find((item) => item.category === "WSD")?.obsrValue || "0",
    };
  } catch (error) {
    console.error("날씨 데이터를 가져오는 중 오류 발생:", error);
  }
};

onMounted(() => {
  fetchWeather();
});
</script> 