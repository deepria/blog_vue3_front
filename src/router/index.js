import {createRouter, createWebHistory} from "vue-router";
import { useAppStore } from "@/store/app";

// vue 컴포넌트 import

// 라우트 정의
const routes = [
    {
        path: "/login",
        name: "Login",
        component: () => import("@/pages/Auth/Login.vue"),
        meta: { public: true },
    },
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
    {
        path: "/account",
        name: "Account",
        component: () => import("@/pages/Auth/Account.vue"),
    },
];

// 라우터 생성
const router = createRouter({
    history: createWebHistory(), // HTML5 모드 (브라우저 히스토리)
    routes,
});

router.beforeEach(async (to) => {
    if (to.meta.public) {
        return true;
    }
    const app = useAppStore();
    if (!app.authReady) {
        await app.loadSession();
    }
    if (!app.user) {
        return {
            name: "Login",
            query: { returnTo: window.location.href },
        };
    }
    return true;
});

export default router;
