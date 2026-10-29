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

import "./assets/styles/global.css";
import "./app/styles/reset.css";
import { registerPwa } from "./shared/pwa";

const app = createApp(App);
const pinia = createPinia();

message.config({
  top: "80vh",
  duration: 1.5,
  maxCount: 1,
});

app.use(pinia);
app.use(router);

app.mount("#app");
registerPwa();
