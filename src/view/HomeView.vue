<script>
import {ref, onMounted} from "vue";

export default {
  name: "HomeView",
  setup() {

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const articles = ref([]);
    const headlines = ref([]);

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
    onMounted(() => {
      fetchRSS();
    });

    return {
      articles,
      headlines,
    };
  },
};
</script>

<template>
<!--  <div>-->
<!--    <img src="@/assets/uwu.gif" alt="uwu"/>-->
<!--  </div>-->
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
  height: 40vh; /* 웹뷰 전체 화면 */
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
  animation: rise 15s ease-in forwards;
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
    opacity: 0.9;
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
</style>