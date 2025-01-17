import "@/assets/base.css";
import "@/assets/main.css";
import "@fortawesome/fontawesome-free/css/all.css";

import {createApp} from 'vue'
import {createPinia} from "pinia";
import App from './App.vue'
import router from "./router"
import Antd, {message} from 'ant-design-vue';

const app = createApp(App);
const pinia = createPinia();

message.config({
    top: "unset",
    bottom: "50px",
    duration: 1.5,
    maxCount: 3,
});

app.use(router);
app.use(pinia);
app.use(Antd)
app.mount("#app");

