import "@fortawesome/fontawesome-free/css/all.css";
import { createApp } from 'vue'
import { createPinia } from "pinia";
import App from './App.vue'
import router from "./router"
import Antd, { message } from 'ant-design-vue';
import './assets/styles/global.css'

const app = createApp(App);
const pinia = createPinia();

message.config({
    top: '80vh',
    duration: 1.5,
    maxCount: 1,
});

app.use(router);
app.use(pinia);
app.use(Antd)
app.mount("#app");

