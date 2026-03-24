import {createRouter, createWebHistory} from "vue-router";

// vue 컴포넌트 import

// 라우트 정의
const routes = [
    {
        path: "/",
        name: "index",
        component: () => import("@/pages/Index.vue"),
    },
    {
        path: "/todo",
        name: "Todo",
        component: () => import("@/pages/Util/Todo.vue"),
    },
    {
        path: "/s3",
        name: "S3",
        component: () => import("@/pages/Util/S3.vue"),
    },
    {
        path: "/memo",
        name: "MemoList",
        component: () => import("@/pages/Memo/MemoList.vue"),
    },
    {
        path: "/memo/edit/:id?",
        name: "MemoEditor",
        component: () => import("@/pages/Memo/MemoEditor.vue"),
        props: true,
    },
    {
        path: "/chat",
        name: "Chat",
        component: () => import("@/pages/Chat.vue"),
    },
];

// 라우터 생성
const router = createRouter({
    history: createWebHistory(), // HTML5 모드 (브라우저 히스토리)
    routes,
});

export default router;
