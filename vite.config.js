import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      dirs: [],
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css is handled globally or manually to avoid less setup issues for now
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue", "vue-router"],
          state: ["pinia"],
          http: ["axios"],
          editor: ["@milkdown/crepe", "@milkdown/vue"],
          antd: ["ant-design-vue", "@ant-design/icons-vue"],
        },
      },
    },
  },
});
