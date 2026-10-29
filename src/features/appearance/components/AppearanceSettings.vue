<template>
  <section class="appearance-settings" aria-labelledby="appearance-title">
    <header>
      <div>
        <p class="appearance-kicker">나에게 맞는 공간</p>
        <h2 id="appearance-title">작업 공간의 분위기</h2>
        <p>디자인과 밝기를 골라 나에게 맞는 공간을 만드세요.</p>
      </div>
      <span class="appearance-local">이 브라우저에 저장</span>
    </header>
    <fieldset class="design-options">
      <legend class="sr-only">디자인 테마</legend>
      <label
        v-for="option in designOptions"
        :key="option.id"
        class="design-option"
        :class="[`option-${option.id}`, { selected: app.design === option.id }]"
      >
        <input
          type="radio"
          name="workspace-design"
          :value="option.id"
          :checked="app.design === option.id"
          @change="app.setDesign(option.id)"
        />
        <span class="theme-miniature" aria-hidden="true"
          ><span class="mini-sidebar"><i>✳</i><b></b><b></b><b></b></span
          ><span class="mini-content"
            ><span class="mini-heading">{{
              option.id === "console" ? "공간 / 01" : "생각의 여백."
            }}</span
            ><span class="mini-panels"><i></i><i>✳</i></span
            ><span class="mini-lines"><i></i><i></i><i></i></span></span
        ></span>
        <span class="option-copy"
          ><span
            ><strong>{{ option.code }} · {{ option.name }}</strong
            ><small>{{ option.description }}</small></span
          ><span class="option-check" aria-hidden="true">{{
            app.design === option.id ? "✓" : "○"
          }}</span></span
        >
      </label>
    </fieldset>
    <fieldset class="mode-options">
      <legend>화면 밝기</legend>
      <label
        v-for="mode in modes"
        :key="mode.id"
        :class="{ selected: app.theme === mode.id }"
        ><input
          type="radio"
          name="workspace-mode"
          :value="mode.id"
          :checked="app.theme === mode.id"
          @change="app.setTheme(mode.id)"
        /><component :is="mode.icon" />{{ mode.label
        }}<span v-if="app.theme === mode.id" aria-hidden="true">✓</span></label
      >
    </fieldset>
    <p class="appearance-current" role="status">
      현재 {{ selectedName }} ·
      {{ app.theme === "dark" ? "다크" : "라이트" }} 테마
    </p>
  </section>
</template>
<script setup>
import { computed } from "vue";
import { BulbOutlined, BulbFilled } from "@ant-design/icons-vue";
import { useAppStore } from "@/store/app";
import { designOptions } from "../lib/themes";
const app = useAppStore();
const selectedName = computed(
  () => designOptions.find((option) => option.id === app.design)?.name,
);
const modes = [
  { id: "light", label: "라이트", icon: BulbOutlined },
  { id: "dark", label: "다크", icon: BulbFilled },
];
</script>
<style scoped>
.appearance-settings {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 28px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}
header h2 {
  margin: 4px 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}
header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}
header .appearance-kicker {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--color-primary);
}
.appearance-local {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  border: 1px solid var(--color-border);
  padding: 5px 8px;
  border-radius: var(--radius-sm);
}
fieldset {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.design-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.design-option {
  position: relative;
  display: block;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 7px;
  cursor: pointer;
  min-width: 0;
}
.design-option.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}
.design-option:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}
.design-option > input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.theme-miniature {
  --mini-bg: #f5f4f0;
  --mini-side: #eeeee8;
  --mini-ink: #252d29;
  --mini-accent: #3759d7;
  display: flex;
  height: 125px;
  background: var(--mini-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  color: var(--mini-ink);
  border: 1px solid #0000000c;
}
.option-studio .theme-miniature {
  --mini-bg: #f2f1e9;
  --mini-side: #242728;
  --mini-accent: #d5ed72;
}
.option-console .theme-miniature {
  --mini-bg: #10171c;
  --mini-side: #0b1116;
  --mini-ink: #e1edf0;
  --mini-accent: #8cd8c3;
}
.mini-sidebar {
  display: flex;
  flex-direction: column;
  gap: 9px;
  background: var(--mini-side);
  width: 28%;
  padding: 12px 9px;
}
.mini-sidebar i {
  font-style: normal;
  color: var(--mini-accent);
  font-size: 20px;
  line-height: 1;
}
.mini-sidebar b {
  display: block;
  height: 3px;
  width: 80%;
  background: #9ca59b66;
  border-radius: 2px;
}
.mini-sidebar b:first-of-type {
  background: var(--mini-accent);
  margin-top: 10px;
}
.mini-content {
  flex: 1;
  padding: 15px 12px;
  min-width: 0;
}
.mini-heading {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.6px;
  white-space: nowrap;
}
.option-console .mini-heading {
  font-size: 10px;
  font-family: monospace;
  letter-spacing: 0.5px;
}
.mini-panels {
  display: flex;
  height: 38px;
  gap: 6px;
  margin: 10px 0;
}
.mini-panels i {
  display: block;
  width: 54%;
  background: #ffffff22;
  border: 1px solid #7c877144;
  border-radius: 2px;
}
.mini-panels i:last-child {
  background: var(--mini-accent);
  width: 40%;
  display: grid;
  place-items: center;
  color: var(--mini-bg);
  font-size: 22px;
  font-style: normal;
}
.mini-lines {
  display: flex;
  gap: 5px;
}
.mini-lines i {
  width: 30%;
  height: 2px;
  background: #9ca59b66;
}
.option-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  padding: 14px 6px 9px;
}
.option-copy strong {
  font-size: 13px;
  color: var(--color-text-primary);
  display: block;
}
.option-copy small {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 5px;
  line-height: 1.7;
}
.option-check {
  flex-shrink: 0;
  color: var(--color-primary);
}
.mode-options {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.mode-options legend {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 10px;
}
.mode-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  min-height: 44px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.mode-options input {
  accent-color: var(--color-primary);
}
.mode-options .selected {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.appearance-current {
  color: var(--color-text-muted);
  font-size: 12px;
  margin: 16px 0 0;
}
@media (max-width: 760px) {
  .appearance-settings {
    padding: 20px;
  }
  header {
    flex-direction: column;
  }
  .design-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .design-option {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }
  .theme-miniature {
    height: 95px;
  }
  .mini-content {
    padding: 10px 5px;
  }
  .mini-heading {
    font-size: 10px;
  }
  .mini-sidebar {
    padding: 10px 5px;
  }
  .mini-panels {
    height: 26px;
  }
  .option-copy {
    padding: 6px;
  }
  .option-copy strong {
    font-size: 14px;
  }
  header h2 {
    font-size: 22px;
  }
}
</style>
