import { createRouter, createWebHistory } from "vue-router";

// 뷰 컴포넌트 import
import HomeView from "@/view/HomeView.vue";
import Get from "@/view/Legacy/Get.vue";
import Put from "@/view/Legacy/Put.vue";
import List from "@/view/Legacy/List.vue";
import Save from "@/view/Legacy/Save.vue";
import Upload from "@/view/Util/Upload.vue";
import Todo from "@/view/Util/Todo.vue";
import S3 from "@/view/Util/S3.vue";
// 라우트 정의
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/get",
    name: "Get",
    component: Get,
  },
  {
    path: "/put",
    name: "Put",
    component: Put,
  },
  {
    path: "/list",
    name: "List",
    component: List,
  },
  {
    path: "/save",
    name: "Save",
    component: Save,
  },
  {
    path: "/upload",
    name: "Upload",
    component: Upload,
  },
  {
    path: "/todo",
    name: "Todo",
    component: Todo,
  },
  {
    path: "/s3",
    name: "S3",
    component: S3,
  },
];

// 라우터 생성
const router = createRouter({
  history: createWebHistory(), // HTML5 모드 (브라우저 히스토리)
  routes,
});

export default router;
