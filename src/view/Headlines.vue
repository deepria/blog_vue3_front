<script>
import {ref, onMounted} from "vue";

export default {
  name: "HomeView",
  setup() {

    const headlines = ref([]); // 뉴스 헤드라인 데이터'
    // 딜레이 함수
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // 뉴스 헤드라인 가져오기
    const fetchHeadlines = async () => {
      try {
        const response = await fetch(
            "https://newsapi.org/v2/top-headlines?country=us&apiKey=ecb792be20bb45988e999801f817f575"
        );
        const data = await response.json();

        if (data.articles) {
          for (const article of data.articles) {
            if (article.title.length > 20) {
              // 문자열을 단어 배열로 변환
              const words = article.title.split(" "); // 공백을 기준으로 나눔

              // 4개의 단어씩 묶기
              const split = [];
              for (let i = 0; i < words.length; i += 4) {
                split.push(words.slice(i, i + 4).join(" ")); // 4개씩 묶어서 하나의 문자열로 변환
              }

              // 나눈 문장을 headlines에 추가
              for (const part of split) {
                headlines.value.push(part);
                await delay(2000); // 3초 딜레이
              }

            } else {
              headlines.value.push(article.title); // 하나씩 추가
              await delay(2000); // 1초 딜레이
            }
          }
        }
      } catch (error) {
        console.error("뉴스 데이터를 가져오는 중 오류가 발생했습니다:", error);
      }
    };

    // 초기 데이터 가져오기
    onMounted(() => {
          fetchHeadlines();
        }
    );

    return {
      headlines,
    };
  }
}
;
</script>

<template>
  <div class="main">
  </div>
  <div class="container">
    <div
        v-for="(text, index) in headlines"
        :key="index"
        class="falling-text"
    >
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
.main {
  .video {
    width: 100%;
  }
}

/* 컨테이너 스타일 */
.container {
  position: relative;
  width: 100%;
  height: 40vh;
  overflow: hidden;
  background-color: #131313;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 떨어지는 텍스트 스타일 */
.falling-text {
  position: absolute;
  font-size: 20px;
  font-weight: bold;
  color: #fefefe;
  animation: fall 20s ease-in forwards; /* 애니메이션 */
  white-space: nowrap;
}

/* 애니메이션 키프레임 */
@keyframes fall {
  0% {
    top: calc(100vh + 20px); /* 화면 아래에서 시작 */
    opacity: 0;
  }
  20% {
    opacity: 1; /* 점차 나타남 */
  }
  80% {
    top: -10px; /* 화면 위로 올라감 */
    opacity: 1;
  }
  100% {
    top: -50px; /* 화면 위로 사라짐 */
    opacity: 0;
  }
}
</style>