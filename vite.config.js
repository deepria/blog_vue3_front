import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import vueDevTools from "vite-plugin-vue-devtools";

import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      manifest: false,
      includeAssets: [
        "favicon.ico",
        "favicon.png",
        "manifest.webmanifest",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "deepria-pages",
              networkTimeoutSeconds: 4,
              cacheableResponse: {
                statuses: [0, 200],
              },
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 24 * 60 * 60,
              },
              precacheFallback: {
                fallbackURL: "/index.html",
              },
            },
          },
        ],
      },
    }),
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
          antd: ["ant-design-vue", "@ant-design/icons-vue"],
        },
      },
    },
  },
});
