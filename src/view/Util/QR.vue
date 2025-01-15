<script>
import {ref, computed} from "vue";

export default {
  setup() {
    const url = ref("");
    const data = ref([]);
    const error = ref(null);

    const src = computed(
        () => `https://qrtag.net/api/qr_12.png?url=${encodeURIComponent(url.value)}`
    );

    const clear = () => {
      url.value = "";
      error.value = null;
    };

    const generate = () => {
      if (!url.value) {
        error.value = "URL cannot be empty!";
      } else {
        error.value = null;
      }
    };

    return {
      url,
      data,
      error,
      src,
      clear,
      generate,
    };
  },
};
</script>

<template>
  <div class="main-container">
    <!-- Input and Submit Container -->
    <div class="form-container">
      <h1 class="header">Generate QR</h1>
      <div class="form-group">
        <label for="url">URL</label>
        <input
            id="url"
            type="text"
            v-model="url"
            placeholder="Enter URL"
            class="styled-input"
        />
      </div>
      <button class="button-primary" @click="clear">Clear</button>
      <button class="button-primary" @click="generate">Generate</button>
    </div>
    <br/>
    <!-- Result Container -->
    <div class="result-container">
      <h1 class="header">Result</h1>
      <div v-if="error" class="error-message">
        <p>Error: {{ error }}</p>
      </div>
      <div v-else-if="url">
        <img :src="src" alt="qrtag"/>
      </div>
      <div v-else>
        <p>No Data Yet</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: #ffffff;
  background-color: #121212;
}

.form-container,
.result-container {
  border: 1px solid #333333;
  border-radius: 10px;
  padding: 20px;
  background: #1e1e1e;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  min-height: 200px;
}

.header {
  font-size: 1.8rem;
  text-align: center;
  color: #42b983;
  margin-bottom: 20px;
}

.error-message {
  margin-top: 15px;
  color: #ff4d4d;
  font-weight: bold;
  text-align: center;
}

.result-container p {
  font-size: 1.2rem;
  color: #ffffff;
  text-align: center;
}
</style>