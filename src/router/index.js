import { createRouter, createWebHistory } from "vue-router";

// vue 컴포넌트 import

// 라우트 정의
const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("@/view/Index.vue"),
  },
  {
    path: "/todo",
    name: "Todo",
    component: () => import("@/view/Util/Todo.vue"),
  },
  {
    path: "/s3",
    name: "S3",
    component: () => import("@/view/Util/S3.vue"),
  },
];

// 라우터 생성
const router = createRouter({
  history: createWebHistory(), // HTML5 모드 (브라우저 히스토리)
  routes,
});

export default router;
