import { createApp } from "vue";

if (import.meta.env.DEV) {
  window.onerror = function (msg, url, line, col, error) {
    const div = document.createElement("div");
    div.style =
      "position:fixed; top:0; left:0; width:100%; z-index:999999; background:red; color:white; padding:10px; font-size:12px; font-family:monospace;";
    div.innerHTML = `<strong>Error:</strong> ${msg}<br/>${url}:${line}:${col}<br/><pre>${error?.stack}</pre>`;
    document.body.appendChild(div);
  };
  window.addEventListener("unhandledrejection", function (event) {
    const div = document.createElement("div");
    div.style =
      "position:fixed; top:0; left:0; width:100%; z-index:999999; background:orange; color:black; padding:10px; font-size:12px; font-family:monospace;";
    div.innerHTML = `<strong>Unhandled Rejection:</strong> ${event.reason?.message || event.reason}<br/><pre>${event.reason?.stack}</pre>`;
    document.body.appendChild(div);
  });
}

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
import "./app/styles/reset.css";

const app = createApp(App);
const pinia = createPinia();

message.config({
  top: "80vh",
  duration: 1.5,
  maxCount: 1,
});

app.use(pinia);
app.use(router);

library.add(faUser, faPen, faRotate);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
