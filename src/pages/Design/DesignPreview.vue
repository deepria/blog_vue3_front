<template>
  <div class="design-lab">
    <header class="lab-toolbar">
      <div class="lab-label">
        <strong>Deepria 디자인 비교</strong
        ><span>01 / 시각 방향 탐색 · 샘플 데이터</span>
      </div>
      <div class="lab-controls">
        <div class="lab-segment" aria-label="디자인 방향">
          <button
            v-for="option in directions"
            :key="option.id"
            :aria-label="option.label"
            :aria-pressed="direction === option.id"
            @click="setQuery('direction', option.id)"
          >
            <span class="direction-long">{{ option.label }}</span
            ><span class="direction-short">{{ option.short }}</span>
          </button>
        </div>
        <div class="lab-segment" aria-label="화면 선택">
          <button
            :aria-pressed="screen === 'home'"
            @click="setQuery('screen', 'home')"
          >
            홈
          </button>
          <button
            :aria-pressed="screen === 'memo'"
            @click="setQuery('screen', 'memo')"
          >
            메모
          </button>
        </div>
        <button
          class="lab-theme"
          :aria-pressed="dark"
          @click="setQuery('theme', dark ? 'light' : 'dark')"
        >
          {{ dark ? "라이트" : "다크" }}
        </button>
      </div>
    </header>
    <DesignWorkspace
      :direction="direction"
      :dark="dark"
      :screen="screen"
      @navigate="setQuery('screen', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import DesignWorkspace from "@/features/design/components/DesignWorkspace.vue";
const route = useRoute();
const router = useRouter();
const directions = [
  { id: "editorial", label: "A · 편집 디자인", short: "A · 편집" },
  { id: "studio", label: "B · 그래픽 스튜디오", short: "B · 그래픽" },
  { id: "console", label: "C · 작업 콘솔", short: "C · 콘솔" },
];
const direction = computed(() =>
  directions.some((option) => option.id === route.query.direction)
    ? route.query.direction
    : "editorial",
);
const screen = computed(() =>
  route.query.screen === "memo" ? "memo" : "home",
);
const dark = computed(() => route.query.theme === "dark");
function setQuery(key, value) {
  router.replace({ query: { ...route.query, [key]: value } });
}
</script>

<style scoped>
.design-lab {
  min-height: 100dvh;
}
.lab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: #fff;
  color: #202625;
  border-bottom: 1px solid #e4e6e2;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.lab-label {
  display: grid;
  gap: 3px;
  font-size: 12px;
}
.lab-label strong {
  font-size: 13px;
  letter-spacing: 0.02em;
}
.lab-label span {
  color: #68716c;
  font-size: 11px;
}
.lab-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.lab-segment {
  display: flex;
  padding: 3px;
  border: 1px solid #e0e3dd;
  border-radius: 8px;
  gap: 2px;
}
.lab-controls button {
  border: 0;
  background: transparent;
  color: #53605a;
  padding: 7px 11px;
  border-radius: 5px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  min-height: 32px;
}
.lab-segment button[aria-pressed="true"] {
  background: #242c28;
  color: #fff;
}
.direction-short {
  display: none;
}
.lab-controls .lab-theme {
  border: 1px solid #dce1d9;
}
@media (max-width: 767px) {
  .lab-toolbar {
    padding: 12px 14px;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .lab-label {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }
  .lab-controls {
    gap: 6px;
    flex-wrap: nowrap;
  }
  .direction-long {
    display: none;
  }
  .direction-short {
    display: inline;
  }
  .lab-controls button {
    padding: 7px 9px;
    min-height: 36px;
  }
}
</style>
