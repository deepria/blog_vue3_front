import {createRouter, createWebHistory} from "vue-router";

// 뷰 컴포넌트 가져오기
import HomeView from "@/view/HomeView.vue";
import Get from "@/view/Get.vue";
import Put from "@/view/Put.vue";
// 라우트 정의
const routes = [
    {
        path: "/", // 기본 경로
        name: "Home",
        component: HomeView
    },
    {
        path: "/get", // 기본 경로
        name: "Get",
        component: Get
    },
    {
        path: "/put", // 기본 경로
        name: "Put",
        component: Put
    },
    {
        path: "/put/:obj", // 기본 경로
        name: "Modify",
        component: Put,
        props: true
    }
];

// 라우터 생성
const router = createRouter({
    history: createWebHistory(), // HTML5 모드 (브라우저 히스토리)
    routes,
});

export default router;