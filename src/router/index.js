import {createRouter, createWebHistory} from "vue-router";

// 뷰 컴포넌트 import
import HomeView from "@/view/HomeView.vue";
import Get from "@/view/Attribute/Get.vue";
import Put from "@/view/Attribute/Put.vue";
import List from "@/view/Entity/List.vue";
import Save from "@/view/Entity/Save.vue";
import Upload from "@/view/Util/Upload.vue";
import QR from "@/view/Util/QR.vue";
import ColorPicker from "@/view/Util/ColorPicker.vue";
// 라우트 정의
const routes = [
    {
        path: "/",
        name: "Home",
        component: HomeView
    },
    {
        path: "/get",
        name: "Get",
        component: Get
    },
    {
        path: "/put",
        name: "Put",
        component: Put
    },
    {
        path: "/list",
        name: "List",
        component: List
    },
    {
        path: "/save",
        name: "Save",
        component: Save
    },
    {
        path: "/upload",
        name: "Upload",
        component: Upload
    },
    {
        path: "/qr",
        name: "QR",
        component: QR
    },
    {
        path: "/colorPicker",
        name: "ColorPicker",
        component: ColorPicker
    },
];

// 라우터 생성
const router = createRouter({
    history: createWebHistory(), // HTML5 모드 (브라우저 히스토리)
    routes,
});

export default router;