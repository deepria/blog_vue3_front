import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import { message } from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUser, faPen } from "@fortawesome/free-solid-svg-icons";
import { faRotate } from "@fortawesome/free-solid-svg-icons";

import "./assets/styles/global.css";

const app = createApp(App);
const pinia = createPinia();

message.config({
  top: "80vh",
  duration: 1.5,
  maxCount: 1,
});

app.use(router);
app.use(pinia);

library.add(faUser, faPen, faRotate);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
