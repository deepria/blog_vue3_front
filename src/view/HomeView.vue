<script>
import {onMounted, ref, computed} from "vue";

export default {
  name: "HomeView",
  setup() {

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const articles = ref([]);
    const headlines = ref([]);
    const weather = ref({});


    const MAX_HEADLINES = 20;

    const fetchRSS = async () => {
      const response = await fetch(
          "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
      );
      const data = await response.text();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");

      const items = xmlDoc.querySelectorAll("item");
      articles.value = Array.from(items).map((item) => {
        const namespace = "http://search.yahoo.com/mrss/";
        const image =
            item.getElementsByTagNameNS(namespace, "content")[0]?.getAttribute("url") ||
            '';

        return {
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
          description: item.querySelector("description")?.textContent || "",
          pubDate: item.querySelector("pubDate")?.textContent || "",
          image: image,
        };
      });

      const animationDuration = 25000;
      const delayTime = animationDuration / 2;

      for (const article of articles.value) {
        if (headlines.value.length >= MAX_HEADLINES) {
          headlines.value.shift();
        }
        headlines.value.push(article);
        await delay(delayTime);
      }
    };


    // Android에 GPS 데이터 요청
    const requestGPSData = () => {
      return new Promise((resolve, reject) => {
        if (navigator.userAgent.includes("Android")) {
          // Android 브릿지 호출
          window.GPS.getGPSData();

          // GPS 데이터를 받아 처리
          window.receiveGPSData = (latitude, longitude) => {
            const gridData = latLonToGrid(latitude, longitude); // 위도/경도를 격자 좌표로 변환
            resolve(gridData); // 격자 좌표 반환
          };
        } else {
          reject(new Error("AndroidBridge가 활성화되지 않았습니다."));
        }
      });
    };

    const latLonToGrid = (lat, lon) => {
      const RE = 6371.00877; // 지구 반경 (km)
      const GRID = 5.0; // 격자 간격 (km)
      const SLAT1 = 30.0; // 표준 위도 1 (degree)
      const SLAT2 = 60.0; // 표준 위도 2 (degree)
      const OLON = 126.0; // 기준점 경도 (degree)
      const OLAT = 38.0; // 기준점 위도 (degree)
      const XO = 43; // 기준점 X좌표 (GRID)
      const YO = 136; // 기준점 Y좌표 (GRID)

      const DEGRAD = Math.PI / 180.0;

      const re = RE / GRID;
      const slat1 = SLAT1 * DEGRAD;
      const slat2 = SLAT2 * DEGRAD;
      const olon = OLON * DEGRAD;
      const olat = OLAT * DEGRAD;

      let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
      sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

      let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
      sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;

      let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
      ro = re * sf / Math.pow(ro, sn);

      let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
      ra = re * sf / Math.pow(ra, sn);

      let theta = lon * DEGRAD - olon;
      if (theta > Math.PI) theta -= 2.0 * Math.PI;
      if (theta < -Math.PI) theta += 2.0 * Math.PI;
      theta *= sn;

      const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
      const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

      return {nx: x, ny: y};
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
        // 30분 이전이면 한 시간 전으로 설정
        return minutes < 30
            ? `${String(hours - 1).padStart(2, "0")}00`
            : `${hours}00`;
      };

      try {
        const gridData = await requestGPSData(); // GPS 데이터 요청 및 격자 좌표 변환
        const url = new URL('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst');
        const params = {
          serviceKey: 'w5c0HrdcfeykNvDjMhIQzq/5MpELUA0eBU/u1TpRBNG293IqdrinnVGeaHuFLyFdOODRDbD0EkJSiZ2fTGjvcw==',
          pageNo: '1',
          numOfRows: '1000',
          dataType: 'JSON',
          base_date: getYYYYMMDD(now),
          base_time: getHHMM(now),
          nx: gridData.nx,
          ny: gridData.ny,
        };

        // URL에 파라미터 추가
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, params[key])
        );

        const response = await fetch(url);
        if (!response.ok) {
          console.error(`API 요청 실패: ${response.statusText}`);
        }

        const data = await response.json();

        // 날씨 데이터 매핑
        const items = data.response?.body?.items?.item || [];
        weather.value = {
          precipitationType: items.find((item) => item.category === 'PTY')?.obsrValue || '0',
          humidity: items.find((item) => item.category === 'REH')?.obsrValue || '0',
          rainPerHour: items.find((item) => item.category === 'RN1')?.obsrValue || '0',
          temperature: items.find((item) => item.category === 'T1H')?.obsrValue || '0',
          windSpeedEastWest: items.find((item) => item.category === 'UUU')?.obsrValue || '0',
          windSpeedNorthSouth: items.find((item) => item.category === 'VVV')?.obsrValue || '0',
          windDirection: items.find((item) => item.category === 'VEC')?.obsrValue || '0',
          windSpeed: items.find((item) => item.category === 'WSD')?.obsrValue || '0',
        };

        console.log('날씨 데이터:', weather.value);
      } catch (error) {
        console.error('날씨 데이터를 가져오는 중 오류 발생:', error);
      }
    };

    // 강수 형태 해석
    const precipitationMap = {
      "0": "없음",
      "1": "비",
      "2": "비/눈",
      "3": "눈",
      "4": "소나기",
    };
    const precipitationText = computed(
        () => precipitationMap[weather.value.precipitationType] || "정보 없음"
    );

    // 강수 형태 아이콘 맵
    const iconMap = {
      "0": "fa-solid fa-sun",
      "1": "fa-solid fa-cloud-showers-heavy",
      "2": "fa-solid fa-cloud-rain",
      "3": "fa-solid fa-snowflake",
      "4": "fa-solid fa-cloud-bolt",
    };

    const iconClass = computed(
        () => iconMap[weather.value.precipitationType] || "fa-solid fa-question"
    );

    // 풍향 해석
    const getWindDirection = (angle) => {
      const directions = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
      return directions[Math.round(angle / 45) % 8];
    };
    const windDirectionText = computed(() =>
        getWindDirection(Number(weather.value.windDirection))
    );

    onMounted(() => {
          fetchRSS();
          fetchWeather();
        }
    );

    return {
      articles,
      headlines,
      weather,
      precipitationText,
      windDirectionText,
      iconClass,
    };
  },
}
;
</script>

<template>
  <!--  <div>-->
  <!--    <img src="@/assets/uwu.gif" alt="uwu"/>-->
  <!--  </div>-->
  <div id="weather-info">
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

  <div class="container">
    <ul>
      <li v-for="(article, index) in headlines" :key="index" class="falling-text">
        <div class="content">
          <img :src="article.image" alt="Article Image" v-if="article.image" loading="lazy"/>
          <h3><a :href="article.link" target="_blank">{{ article.title }}</a></h3>
          <p>{{ article.description }}</p>
          <small>{{ article.pubDate }}</small>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 60vh; /* 웹뷰 전체 화면 */
  overflow: hidden;
  background-color: #131313;
  justify-content: center;
  align-items: center;
}

.falling-text {
  position: absolute;
  width: 90%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: rise 30s ease-in forwards;
  white-space: normal;
  margin: 0 auto;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #131313;
  padding: 1vw;
  border-radius: 8px;
  color: #fefefe;
  font-size: 16px;
}

.content img {
  max-width: 80%;
  height: auto;
  margin-bottom: 10px;
  border-radius: 5px;
}

@keyframes rise {
  0% {
    bottom: -50%;
    opacity: 0;
  }
  20% {
    opacity: 0.1;
  }
  30% {
    opacity: 0.8;
  }
  40% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.6;
  }
  60% {
    opacity: 0.5;
  }
  70% {
    opacity: 0.4;
  }
  80% {
    bottom: 100%;
    opacity: 0.3;
  }
  90% {
    bottom: 100%;
    opacity: 0.1;
  }
  100% {
    bottom: 120%;
    opacity: 0;
  }
}

#weather-info {
  font-family: Arial, sans-serif;
  text-align: left;
  animation: fadeIn 1s ease-in-out;
}

.weather-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.weather-icon {
  font-size: 100px;
  color: #ffa500;
  animation: spin 3s linear infinite;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  font-size: 18px;
  margin: 5px 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>