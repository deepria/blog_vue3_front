<template>
  <main class="privacy-page">
    <PageShell
      title="개인정보처리방침"
      eyebrow="서비스 안내"
      description="Deepria Cloud가 어떤 정보를 왜 처리하고, 어떻게 관리하는지 안내합니다."
    >
      <template #actions>
        <RouterLink class="back-link" :to="returnRoute">
          {{ app.user ? "설정으로 돌아가기" : "로그인으로 돌아가기" }}
        </RouterLink>
      </template>

      <div class="policy-meta">
        <span>시행일 <time datetime="2026-11-04">2026년 11월 4일</time></span>
        <span>버전 1.0</span>
      </div>
      <article class="policy-content" aria-label="개인정보처리방침 본문">
        <MarkdownViewer :content="policyContent" />
      </article>
      <footer class="policy-footer">
        <RouterLink class="back-link" :to="returnRoute">
          {{ app.user ? "설정으로 돌아가기" : "로그인으로 돌아가기" }}
        </RouterLink>
      </footer>
    </PageShell>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAppStore } from "@/store/app";
import PageShell from "@/shared/ui/PageShell.vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";
import policyContent from "@/content/privacy-policy.md?raw";

const app = useAppStore();
const route = useRoute();
const returnRoute = computed(() =>
  app.user
    ? { name: "Account" }
    : {
        name: "Login",
        query: route.query.returnTo ? { returnTo: route.query.returnTo } : {},
      },
);

let previousTitle;
onMounted(() => {
  previousTitle = document.title;
  document.title = "개인정보처리방침 · Deepria Cloud";
});
onBeforeUnmount(() => {
  document.title = previousTitle;
});
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: var(--color-bg-base);
}

.privacy-page :deep(.page-shell) {
  max-width: 960px;
}

.back-link {
  color: var(--color-primary);
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.back-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.policy-meta,
.policy-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}

.policy-meta {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.policy-meta time {
  margin-left: 8px;
}

.policy-content {
  min-width: 0;
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.9;
  overflow-wrap: anywhere;
  word-break: keep-all;
}

.policy-content :deep(h2) {
  margin: 36px 0 16px;
  padding-top: 28px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 20px;
  line-height: 1.5;
}

.policy-content :deep(h2:first-of-type) {
  margin-top: 28px;
}

.policy-content :deep(p),
.policy-content :deep(ul) {
  margin: 0 0 16px;
}

.policy-content :deep(ul) {
  padding-left: 22px;
}

.policy-content :deep(li) {
  margin: 8px 0;
}

.policy-content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.policy-content :deep(a:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.policy-content :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 16px 0 24px;
  font-size: 13px;
}

.policy-content :deep(th),
.policy-content :deep(td) {
  min-width: 110px;
  padding: 12px;
  border: 1px solid var(--color-border);
  text-align: left;
  vertical-align: top;
}

.policy-content :deep(th) {
  background: var(--color-bg-base);
}

.policy-content :deep(blockquote) {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 3px solid var(--color-primary);
  background: var(--color-bg-base);
  color: var(--color-text-secondary);
}

.policy-content :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

@media (max-width: 720px) {
  .policy-content {
    padding: 20px 16px;
  }

  .policy-content :deep(h2) {
    font-size: 18px;
  }
}
</style>
