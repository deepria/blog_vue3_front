<template>
  <div class="news-container">
    <ul>
      <li
        v-for="(article, index) in headlines"
        :key="index"
        class="falling-text"
      >
        <div class="news-content">
          <img
            :src="article.image"
            alt="Article Image"
            v-if="article.image"
            loading="lazy"
          />
          <h3>
            <a :href="article.link" target="_blank">{{ article.title }}</a>
          </h3>
          <p>{{ article.description }}</p>
          <small>{{ article.pubDate }}</small>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import '@/assets/styles/news-widget.css';

const articles = ref([]);
const headlines = ref([]);
const MAX_HEADLINES = 20;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchRSS = async () => {
  const response = await fetch(
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  );
  const data = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "text/xml");

  const items = xmlDoc.querySelectorAll("item");
  articles.value = Array.from(items).map((item) => {
    const namespace = "http://search.yahoo.com/mrss/";
    const image =
      item
        .getElementsByTagNameNS(namespace, "content")[0]
        ?.getAttribute("url") || "";

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
</script>
 