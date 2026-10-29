<template>
  <section class="home-page">
    <div class="home-meta">
      <span><i></i>{{ today }}</span
      ><span class="edition">나의 작업 공간 / {{ accountName }}</span>
    </div>
    <header class="home-heading">
      <div>
        <p class="eyebrow">나의 생각을 위한 공간</p>
        <h1>
          좋은 생각이<br /><span>머무는 곳.</span><i aria-hidden="true">✳</i>
        </h1>
        <p class="home-description">
          기록하고, 정리하고, 이어가세요.<br class="mobile-break" />
          오늘의 가능성은 여기서 시작됩니다.
        </p>
      </div>
      <router-link to="/memo/edit" class="new-memo"
        ><PlusOutlined />새 메모 쓰기<ArrowRightOutlined
      /></router-link>
    </header>
    <div class="home-hero">
      <section class="clipboard-shell" aria-labelledby="clipboard-title">
        <header class="capture-heading">
          <div>
            <p class="eyebrow">01 / 빠른 기록</p>
            <h2 id="clipboard-title">생각을 잠시 놓아두세요.</h2>
          </div>
          <SnippetsOutlined />
        </header>
        <div v-if="loadError" class="clipboard-error" role="alert">
          <p>{{ loadError }}</p>
          <BaseButton variant="secondary" size="sm" @click="loadClipboard"
            >다시 불러오기</BaseButton
          >
        </div>
        <label for="clipboard-text" class="sr-only">빠른 클립보드</label>
        <textarea
          id="clipboard-text"
          ref="clipboardTextarea"
          v-model="clipboardText"
          class="clipboard-textarea"
          placeholder="기기 사이에 이어 쓸 문장이나 떠오른 생각을 남겨보세요."
          :disabled="clipboardLoading || !hasLoaded"
          @compositionstart="isComposing = true"
          @compositionend="handleCompositionEnd"
          @keydown.meta.enter.prevent="handleSaveShortcut"
          @keydown.ctrl.enter.prevent="handleSaveShortcut"
        />
        <footer class="clipboard-footer">
          <span
            class="save-status"
            :class="{ pending: isDirty, failed: saveError }"
            role="status"
            ><i></i>{{ saveStatus }}</span
          >
          <div class="clipboard-actions">
            <button
              class="copy-button"
              :disabled="!clipboardText || !hasLoaded"
              @click="handleCopyClipboard"
            >
              <CopyOutlined /><span>복사</span></button
            ><button
              class="clear-button"
              :disabled="!clipboardText || clipboardSaving || !hasLoaded"
              @click="handleClearClipboard"
            >
              비우기</button
            ><BaseButton
              :loading="clipboardSaving"
              :disabled="!isDirty || !hasLoaded || clipboardLoading"
              @click="handleSaveClipboard"
              >저장<ArrowRightOutlined
            /></BaseButton>
          </div>
        </footer>
      </section>
      <section
        class="home-visual"
        :aria-label="activeSlide ? '내 갤러리' : 'Deepria 브랜드 그래픽'"
      >
        <div v-if="activeSlide" class="dashboard-gallery">
          <Transition name="slide-fade" mode="out-in"
            ><img
              :key="activeSlide.id"
              :src="activeSlide.url"
              :alt="activeSlide.name"
          /></Transition>
        </div>
        <WorkspaceArtwork v-else />
        <footer>
          <span>{{
            activeSlide ? activeSlide.name : "조금의 여백, 새로운 시선."
          }}</span
          ><router-link v-if="activeSlide" to="/s3">내 파일 보기 ↗</router-link
          ><span v-else>나만의 시선 ↗</span>
        </footer>
      </section>
    </div>
    <section class="recent-section" aria-labelledby="recent-title">
      <header class="recent-heading">
        <div>
          <p class="eyebrow">02 / 이어서 작업하기</p>
          <h2 id="recent-title">이어서 생각하기</h2>
        </div>
        <router-link to="/memo"
          >메모 둘러보기<ArrowRightOutlined
        /></router-link>
      </header>
      <div v-if="recentLoading" class="recent-grid">
        <BaseSkeleton v-for="i in 3" :key="i" height="150px" />
      </div>
      <div v-else-if="recentError" class="recent-state" role="alert">
        <p>최근 메모를 불러오지 못했습니다.</p>
        <BaseButton variant="ghost" size="sm" @click="loadRecent"
          >다시 시도</BaseButton
        >
      </div>
      <div v-else-if="!recentNotes.length" class="recent-state">
        <p>아직 기록이 없습니다. 첫 생각을 남겨보세요.</p>
        <router-link to="/memo/edit">첫 메모 쓰기 ↗</router-link>
      </div>
      <div v-else class="recent-grid">
        <router-link
          v-for="note in recentNotes"
          :key="note.id"
          :to="`/memo/edit/${encodeURIComponent(note.id)}`"
          class="recent-note"
          ><span class="note-type"><FileTextOutlined />메모<span>↗</span></span>
          <h3>{{ note.title || "제목 없는 메모" }}</h3>
          <span class="note-bottom"
            >{{ formatDate(note.updatedAt || note.updated_at)
            }}<span>열어서 이어 쓰기</span></span
          ></router-link
        >
      </div>
    </section>
    <footer class="home-signoff">
      <span>조금씩 쌓이는, 나다운 하루.</span
      ><span>나의 일상을 담는 공간.</span>
    </footer>
  </section>
</template>
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import {
  ArrowRightOutlined,
  CopyOutlined,
  FileTextOutlined,
  PlusOutlined,
  SnippetsOutlined,
} from "@ant-design/icons-vue";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";
import WorkspaceArtwork from "@/features/appearance/components/WorkspaceArtwork.vue";
import { useClipboard } from "@/features/dashboard/composables/useClipboard";
import { useDashboardGallery } from "@/features/dashboard/composables/useDashboardGallery";
import { memoApi } from "@/features/memo/api/memoApi";
import { normalizeMemoTimestamp } from "@/features/memo/lib/memoModel";
import { useWorkProtection } from "@/shared/composables/useWorkProtection";
import { useAppStore } from "@/store/app";
const app = useAppStore();
const { activeSlide } = useDashboardGallery();
const {
  clipboardText,
  clipboardLoading,
  clipboardSaving,
  saveClipboard,
  fetchClipboard,
} = useClipboard();
const savedText = ref("");
const hasLoaded = ref(false);
const isComposing = ref(false);
const clipboardTextarea = ref(null);
const loadError = ref("");
const saveError = ref(false);
const recentNotes = ref([]);
const recentLoading = ref(true);
const recentError = ref(false);
const now = ref(new Date());
const dateTimer = setInterval(() => {
  now.value = new Date();
}, 60000);
onBeforeUnmount(() => clearInterval(dateTimer));
const today = computed(() =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now.value),
);
const accountName = computed(
  () => app.user?.name || app.user?.email?.split("@")[0] || "나의 공간",
);
const isDirty = computed(
  () => hasLoaded.value && clipboardText.value !== savedText.value,
);
useWorkProtection(
  "클립보드 편집",
  () => isDirty.value || clipboardSaving.value,
);
const saveStatus = computed(() =>
  clipboardLoading.value
    ? "불러오는 중"
    : loadError.value
      ? "불러오기 실패"
      : clipboardSaving.value
        ? "저장 중"
        : saveError.value
          ? "저장 실패 · 다시 시도하세요"
          : !hasLoaded.value
            ? "연결 대기"
            : isDirty.value
              ? "저장되지 않은 변경"
              : "저장됨",
);
async function loadClipboard() {
  loadError.value = "";
  try {
    await fetchClipboard();
    savedText.value = clipboardText.value;
    hasLoaded.value = true;
  } catch (error) {
    loadError.value = error.userMessage || "클립보드를 불러오지 못했습니다.";
  }
}
async function handleSaveClipboard() {
  await nextTick();
  if (
    isComposing.value ||
    !hasLoaded.value ||
    clipboardSaving.value ||
    !isDirty.value
  )
    return;
  const text = clipboardTextarea.value?.value ?? clipboardText.value;
  saveError.value = false;
  try {
    await saveClipboard(text);
    savedText.value = text;
    message.success("저장했습니다.");
  } catch {
    saveError.value = true;
  }
}
function handleCompositionEnd(event) {
  clipboardText.value = event.target.value;
  isComposing.value = false;
}
function handleSaveShortcut() {
  if (!isComposing.value) handleSaveClipboard();
}
async function handleClearClipboard() {
  clipboardText.value = "";
  await handleSaveClipboard();
}
async function handleCopyClipboard() {
  try {
    await navigator.clipboard.writeText(clipboardText.value);
    message.success("복사했습니다.");
  } catch {
    message.error("복사 권한을 확인해 주세요.");
  }
}
function formatDate(value) {
  const time = normalizeMemoTimestamp(value);
  return time
    ? new Intl.DateTimeFormat("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(time))
    : "날짜 없음";
}
async function loadRecent() {
  recentLoading.value = true;
  recentError.value = false;
  try {
    const notes = await memoApi.fetchNotes();
    recentNotes.value = [...notes]
      .sort(
        (a, b) =>
          normalizeMemoTimestamp(b.updatedAt || b.updated_at) -
          normalizeMemoTimestamp(a.updatedAt || a.updated_at),
      )
      .slice(0, 3);
  } catch {
    recentError.value = true;
  } finally {
    recentLoading.value = false;
  }
}
onMounted(() => {
  loadClipboard();
  loadRecent();
});
</script>
<style scoped>
.home-page {
  max-width: 1320px;
  margin: 0 auto;
  padding: 32px 40px 30px;
}
.home-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  color: var(--color-text-muted);
  font-size: 12px;
}
.home-meta > span:first-child {
  display: flex;
  align-items: center;
  gap: 8px;
}
.home-meta i,
.save-status i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--art-color);
  flex-shrink: 0;
}
.edition {
  font-size: 9px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  text-align: right;
  max-width: 45%;
  overflow-wrap: anywhere;
}
.home-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  padding: 38px 0 34px;
}
.eyebrow {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  color: var(--color-text-muted);
  margin: 0 0 15px;
}
.home-heading h1 {
  font-size: clamp(40px, 4.2vw, 62px);
  font-weight: 580;
  line-height: 1.18;
  letter-spacing: -2.7px;
  margin: 0;
}
.home-heading h1 > span {
  color: var(--color-primary);
}
.home-heading h1 > i {
  font-style: normal;
  font-size: 46px;
  margin-left: 20px;
  color: var(--art-color);
  font-weight: 400;
}
.home-description {
  font-size: 13px;
  line-height: 1.9;
  margin: 20px 0 0;
}
.mobile-break {
  display: none;
}
.new-memo {
  text-decoration: none;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 0 18px;
  border-radius: var(--radius-sm);
  background: var(--color-text-primary);
  color: var(--color-bg-base);
  font-size: 13px;
}
.new-memo:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
}
.new-memo .anticon:last-child {
  margin-left: 14px;
}
.home-hero {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 22px;
}
.clipboard-shell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 25px 26px 18px;
}
.capture-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
}
.capture-heading .eyebrow {
  margin-bottom: 10px;
}
.capture-heading h2 {
  font-size: 20px;
  font-weight: 560;
  letter-spacing: -0.7px;
  margin: 0;
}
.capture-heading > .anticon {
  font-size: 24px;
  color: var(--color-text-muted);
}
.clipboard-textarea {
  width: 100%;
  flex: 1;
  min-height: 180px;
  resize: vertical;
  background: transparent;
  color: var(--color-text-primary);
  border: 0;
  padding: 24px 0;
  font: inherit;
  font-size: 16px;
  line-height: 1.9;
}
.clipboard-textarea::placeholder {
  color: var(--color-text-muted);
}
.clipboard-textarea:focus-visible {
  outline-offset: 0;
}
.clipboard-footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.save-status {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  color: var(--color-text-muted);
}
.save-status.pending i {
  background: var(--color-warning);
}
.save-status.failed {
  color: var(--color-danger);
}
.clipboard-actions {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-left: auto;
}
.copy-button,
.clear-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: transparent;
  border: 0;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 12px;
  min-height: 40px;
  cursor: pointer;
}
.copy-button:disabled,
.clear-button:disabled {
  opacity: 0.5;
  cursor: default;
}
.clipboard-actions :deep(.base-button) {
  gap: 12px;
}
.clipboard-actions :deep(.button-content) {
  gap: 12px;
}
.clipboard-error {
  padding: 12px 0;
  color: var(--color-danger);
  font-size: 13px;
}
.clipboard-error p {
  color: inherit;
}
.home-visual {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  min-width: 0;
}
.home-visual > :first-child {
  flex: 1;
}
.home-visual > footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--color-bg-panel);
  color: var(--color-text-secondary);
  font-size: 11px;
}
.home-visual > footer > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.home-visual > footer > :last-child {
  font-size: 9px;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}
.dashboard-gallery {
  position: relative;
  min-height: 300px;
  background: var(--color-bg-panel);
}
.dashboard-gallery img {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.recent-section {
  margin-top: 34px;
}
.recent-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}
.recent-heading .eyebrow {
  margin-bottom: 9px;
}
.recent-heading h2 {
  margin: 0;
  font-size: 23px;
  font-weight: 560;
  letter-spacing: -0.8px;
}
.recent-heading > a {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-secondary);
  min-height: 40px;
}
.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}
.recent-note {
  color: var(--color-text-primary);
  text-decoration: none;
  border-top: 1px solid var(--color-border);
  padding: 20px 0;
  min-width: 0;
}
.recent-note:hover {
  border-color: var(--color-primary);
}
.note-type {
  display: flex;
  gap: 7px;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 10px;
  letter-spacing: 0.1em;
}
.note-type > span:last-child {
  margin-left: auto;
  font-size: 17px;
}
.recent-note h3 {
  margin: 17px 0 24px;
  font-size: 17px;
  font-weight: 560;
  overflow-wrap: anywhere;
}
.note-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--color-text-muted);
}
.note-bottom > span {
  border: 1px solid var(--color-border);
  padding: 2px 5px;
  border-radius: var(--radius-sm);
  font-size: 10px;
}
.recent-state {
  border: 1px dashed var(--color-border);
  padding: 26px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.recent-state p {
  margin: 0;
  font-size: 14px;
}
.recent-state a {
  font-size: 13px;
  flex-shrink: 0;
}
.home-signoff {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--color-border);
  padding-top: 18px;
  margin-top: 24px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.home-signoff > span:last-child {
  font-size: 9px;
  letter-spacing: 0.12em;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.35s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
[data-design="studio"] .home-heading h1 {
  font-weight: 850;
  letter-spacing: -3.5px;
}
[data-design="studio"] .home-heading h1 > span {
  color: var(--color-text-primary);
}
[data-design="studio"] .new-memo {
  background: var(--color-primary);
  color: var(--text-inverse);
}
[data-design="studio"] .home-hero {
  gap: 0;
  border: 1px solid var(--color-text-primary);
  grid-template-columns: 1fr 1fr;
}
[data-design="studio"] .clipboard-shell {
  border: 0;
  border-right: 1px solid var(--color-text-primary);
  border-radius: 0;
}
[data-design="studio"] .home-visual {
  border: 0;
  border-radius: 0;
}
[data-design="studio"] .recent-grid {
  gap: 0;
}
[data-design="studio"] .recent-note {
  border: 1px solid var(--color-border);
  padding: 20px;
}
[data-design="console"] .home-heading {
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 24px;
}
[data-design="console"] .home-heading h1 {
  font-size: 42px;
  font-weight: 500;
  letter-spacing: -1.7px;
}
[data-design="console"] .eyebrow,
[data-design="console"] .home-meta {
  font-family: ui-monospace, monospace;
}
[data-design="console"] .home-hero {
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
}
[data-design="console"] .recent-note {
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  padding: 20px;
}
@media (max-width: 1100px) {
  .home-page {
    padding: 28px;
  }
  .home-hero {
    gap: 16px;
  }
  .clipboard-shell {
    padding: 23px 20px 17px;
  }
}
@media (max-width: 720px) {
  .home-page {
    padding: 26px 18px;
  }
  .home-meta {
    font-size: 11px;
  }
  .edition {
    display: none;
  }
  .home-heading {
    flex-direction: column;
    align-items: flex-start;
    padding: 30px 0 25px;
    gap: 20px;
  }
  .home-heading h1 {
    font-size: 44px;
    letter-spacing: -2px;
  }
  .home-heading h1 > i {
    font-size: 36px;
    margin-left: 14px;
  }
  .home-description {
    font-size: 13px;
    margin-top: 17px;
  }
  .mobile-break {
    display: block;
  }
  .new-memo {
    min-height: 44px;
    font-size: 13px;
  }
  .home-hero {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .clipboard-shell {
    padding: 23px 20px 18px;
  }
  .capture-heading h2 {
    font-size: 19px;
  }
  .clipboard-textarea {
    min-height: 200px;
  }
  .clipboard-footer {
    gap: 12px;
  }
  .copy-button,
  .clear-button {
    min-height: 44px;
  }
  .clipboard-actions :deep(.base-button) {
    min-height: 44px;
  }
  .home-visual {
    min-height: 260px;
  }
  .dashboard-gallery {
    min-height: 260px;
  }
  .recent-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .recent-heading h2 {
    font-size: 22px;
  }
  .recent-heading > a {
    font-size: 11px;
    gap: 6px;
  }
  .recent-note {
    padding: 20px 0;
  }
  .recent-note h3 {
    margin: 13px 0 20px;
  }
  .recent-state {
    flex-direction: column;
    align-items: flex-start;
  }
  .home-signoff {
    font-size: 10px;
  }
  .home-signoff > span:last-child {
    display: none;
  }
  [data-design="studio"] .home-hero,
  [data-design="console"] .home-hero {
    grid-template-columns: 1fr;
  }
  [data-design="studio"] .clipboard-shell {
    border-right: 0;
    border-bottom: 1px solid var(--color-text-primary);
  }
  [data-design="studio"] .home-heading h1 {
    font-size: 48px;
  }
  [data-design="console"] .home-heading h1 {
    font-size: 40px;
  }
}
</style>
