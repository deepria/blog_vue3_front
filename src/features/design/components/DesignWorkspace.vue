<template>
  <div
    class="workspace"
    :class="[
      `direction-${direction}`,
      { 'is-dark': dark, 'memo-mode': screen === 'memo' },
    ]"
  >
    <aside class="app-sidebar">
      <a
        href="?screen=home"
        class="wordmark"
        @click.prevent="$emit('navigate', 'home')"
        ><span class="brand-symbol" aria-hidden="true">✳</span
        ><span
          >deepria<span class="brand-suffix"> cloud</span
          ><small>YOUR PERSONAL SPACE</small></span
        ></a
      >
      <div class="workspace-label">MY WORKSPACE <span>01</span></div>
      <nav class="main-nav" aria-label="작업 공간">
        <button
          v-for="item in navItems"
          :key="item.label"
          :class="{
            selected: screen === item.screen && item.screen,
            unavailable: !item.screen,
          }"
          :disabled="!item.screen"
          @click="$emit('navigate', item.screen)"
        >
          <component :is="item.icon" /><span>{{ item.label }}</span
          ><small v-if="item.count">{{ item.count }}</small
          ><span v-if="item.screen === screen" class="nav-dot"></span>
        </button>
      </nav>
      <div class="sidebar-note">
        <span class="note-orbit" aria-hidden="true">✳</span>
        <p>생각을 모으고,<br />가능성을 펼치는 곳.</p>
        <small>A little space for big ideas.</small>
      </div>
      <div class="sidebar-profile">
        <span class="avatar">d.</span>
        <div><strong>deepria</strong><small>Personal workspace</small></div>
        <span aria-hidden="true">⌘</span>
      </div>
    </aside>

    <div class="main-column">
      <header class="workspace-topbar">
        <span class="breadcrumb"
          >내 작업 공간 <span>/</span>
          <strong>{{ screen === "home" ? "홈" : "메모" }}</strong></span
        >
        <div class="topbar-right">
          <span class="private-mark"><LockOutlined /> 나만의 공간</span
          ><span class="avatar small">d.</span>
        </div>
      </header>

      <main v-if="screen === 'home'" class="home-content">
        <div class="intro-row">
          <span class="date-label"
            ><span class="tiny-dot"></span>2026년 10월 29일 목요일</span
          ><span class="edition-label">PERSONAL EDITION — 001</span>
        </div>
        <section class="home-heading">
          <div>
            <p class="section-kicker">
              {{
                direction === "console"
                  ? "WORKSPACE / OVERVIEW"
                  : "A SPACE TO MAKE IT YOURS"
              }}
            </p>
            <h1>
              좋은 생각이<br /><span>머무는 곳.</span
              ><span class="heading-star" aria-hidden="true">✳</span>
            </h1>
            <p class="heading-description">
              기록하고, 정리하고, 이어가세요.<br class="mobile-break" />
              오늘의 가능성은 여기서 시작됩니다.
            </p>
          </div>
          <button
            class="new-note"
            @click="
              createNote();
              $emit('navigate', 'memo');
            "
          >
            <PlusOutlined /> 새 메모 쓰기 <ArrowUpRightIcon />
          </button>
        </section>

        <div class="hero-grid">
          <section class="capture-panel" aria-labelledby="capture-title">
            <div class="panel-heading">
              <div>
                <span class="panel-index">01 / CAPTURE</span>
                <h2 id="capture-title">생각을 잠시 놓아두세요.</h2>
              </div>
              <span class="surface-icon"><SnippetsOutlined /></span>
            </div>
            <label for="study-clipboard" class="sr-only">빠른 클립보드</label>
            <textarea
              id="study-clipboard"
              v-model="clipboard"
              spellcheck="false"
              @input="saved = false"
            ></textarea>
            <div class="capture-footer">
              <span class="capture-status" role="status"
                ><span class="tiny-dot" :class="{ pending: !saved }"></span
                >{{ clipboardStatus }}</span
              >
              <div>
                <button class="copy-action" @click="copyText">
                  <CopyOutlined /><span>복사</span></button
                ><button class="save-action" @click="saveClipboard">
                  저장 <ArrowRightOutlined />
                </button>
              </div>
            </div>
          </section>
          <section class="visual-panel" aria-label="작업 공간 브랜드 그래픽">
            <div class="visual-art" aria-hidden="true">
              <div class="art-sun"></div>
              <div class="art-orbit orbit-one"></div>
              <div class="art-orbit orbit-two"></div>
              <div class="art-hill hill-back"></div>
              <div class="art-hill hill-front"></div>
              <span class="art-grid"></span
              ><span class="art-number">D / 01</span
              ><span class="studio-art-type">Make<br />room.</span
              ><span class="console-art-type"
                >SYSTEM / PERSONAL<br />SPACE FOR POSSIBILITY<br />─────────────────<br />THINK
                → CAPTURE → CREATE</span
              >
            </div>
            <div class="visual-caption">
              <span>조금의 여백, 새로운 시선.</span
              ><span>DEEPRIA STUDIES ↗</span>
            </div>
          </section>
        </div>

        <section class="recent-section" aria-labelledby="recent-title">
          <div class="recent-heading">
            <div>
              <span class="panel-index">02 / CONTINUE</span>
              <h2 id="recent-title">이어서 생각하기</h2>
            </div>
            <button @click="$emit('navigate', 'memo')">
              메모 둘러보기 <ArrowRightOutlined />
            </button>
          </div>
          <div class="recent-grid">
            <button
              v-for="(note, index) in notes"
              :key="note.title"
              class="recent-note"
              @click="openNote(index)"
            >
              <span class="note-type"
                ><FileTextOutlined /> MEMO <span>↗</span></span
              >
              <h3>{{ note.title }}</h3>
              <p>{{ note.description }}</p>
              <span class="note-date"
                >{{ note.date }}<span>{{ note.category }}</span></span
              >
            </button>
          </div>
        </section>
        <footer class="page-signoff">
          <span>조금씩 쌓이는, 나다운 하루.</span
          ><span>DESIGNED FOR YOUR EVERYDAY.</span>
        </footer>
      </main>

      <main v-else class="memo-content">
        <aside class="memo-library">
          <div class="library-heading">
            <h1>나의 메모<span>03</span></h1>
            <button aria-label="새 샘플 메모" @click="createNote">
              <PlusOutlined />
            </button>
          </div>
          <label class="memo-search"
            ><SearchOutlined /><input
              v-model="search"
              placeholder="메모 검색"
              aria-label="샘플 메모 검색"
          /></label>
          <p class="library-label">
            ALL NOTES <span>{{ filteredNotes.length }}</span>
          </p>
          <button
            v-for="note in filteredNotes"
            :key="note.title"
            class="library-note"
            :class="{ active: selectedTitle === note.title }"
            @click="selectNote(note)"
          >
            <span>{{ note.category }}</span
            ><strong>{{ note.title }}</strong>
            <p>{{ note.description }}</p>
            <small>{{ note.date }}</small>
          </button>
          <p v-if="!filteredNotes.length" class="search-empty">
            검색 결과가 없습니다.
          </p>
          <div class="library-foot">당신의 생각을 위한 작은 서재.</div>
        </aside>
        <article class="document-surface">
          <header class="document-toolbar">
            <button class="back-home" @click="$emit('navigate', 'home')">
              <ArrowLeftOutlined /> 홈</button
            ><span class="document-status" role="status"
              ><span class="tiny-dot" :class="{ pending: memoDirty }"></span
              >{{ memoDirty ? "변경됨 · 샘플 편집" : "샘플 메모" }}</span
            >
            <div class="document-modes">
              <button :aria-pressed="!editing" @click="editing = false">
                읽기</button
              ><button :aria-pressed="editing" @click="editing = true">
                <EditOutlined /> 편집
              </button>
            </div>
          </header>
          <div class="document-body">
            <div class="document-eyebrow">
              PERSONAL NOTES <span>/ {{ selectedCategory }}</span>
            </div>
            <input
              v-if="editing"
              v-model="memoTitle"
              class="document-title-input"
              aria-label="메모 제목"
              @input="memoDirty = true"
            />
            <h1 v-else>{{ memoTitle }}</h1>
            <div class="document-meta">
              <span class="avatar tiny">d.</span><strong>deepria</strong
              ><span>2026년 10월 29일</span><span>3분 읽기</span>
            </div>
            <textarea
              v-if="editing"
              v-model="memoContent"
              class="document-editor"
              aria-label="메모 본문"
              @input="memoDirty = true"
            ></textarea>
            <div v-else class="document-reading">
              <MarkdownViewer :content="memoContent" />
            </div>
            <div class="document-end">
              <span>✳</span>
              <p>생각은 기록할 때 조금 더 선명해집니다.</p>
            </div>
          </div>
        </article>
      </main>
    </div>

    <nav class="mobile-nav" aria-label="모바일 작업 공간">
      <button
        v-for="item in navItems.slice(0, 5)"
        :key="item.label"
        :class="{ selected: item.screen === screen }"
        :disabled="!item.screen"
        @click="$emit('navigate', item.screen)"
      >
        <component :is="item.icon" /><span>{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, ref } from "vue";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckSquareOutlined,
  CloudOutlined,
  CopyOutlined,
  EditOutlined,
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined,
  SnippetsOutlined,
} from "@ant-design/icons-vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";

defineProps({
  direction: { type: String, default: "editorial" },
  dark: Boolean,
  screen: { type: String, default: "home" },
});
const emit = defineEmits(["navigate"]);
const ArrowUpRightIcon = defineComponent({
  setup: () => () =>
    h(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.6,
        "aria-hidden": "true",
      },
      [h("path", { d: "M5 19 19 5M5 5h14v14" })],
    ),
});
const navItems = [
  { label: "홈", icon: HomeOutlined, screen: "home" },
  { label: "메모", icon: FileTextOutlined, screen: "memo", count: "03" },
  { label: "할 일", icon: CheckSquareOutlined },
  { label: "파일", icon: CloudOutlined },
  { label: "대화", icon: MessageOutlined },
];
const notes = ref([
  {
    title: "좋은 작업 공간에 대한 생각",
    description:
      "집중할 수 있는 공간은 어떤 모습일까. 나에게 필요한 것들을 천천히 적어본다.",
    date: "오늘 · 오전 10:20",
    category: "생각과 기록",
  },
  {
    title: "이번 주에 해보고 싶은 것들",
    description:
      "거창한 계획보다는 작고 확실한 시작. 매일 하나씩 이어가는 연습.",
    date: "어제 · 오후 4:35",
    category: "일상과 계획",
  },
  {
    title: "다음 프로젝트를 위한 단서",
    description:
      "지나치기 아쉬웠던 아이디어와 언젠가 다시 꺼내 보고 싶은 장면들.",
    date: "10월 27일",
    category: "아이디어",
  },
]);
const clipboard = ref(
  "아이디어를 모으고, 생각을 연결하고,\n나만의 속도로 완성하기.\n\n이번 주에는 작업 공간을 조금 더\n나답게 정리해보자.",
);
const saved = ref(true);
const copyState = ref("");
const clipboardStatus = computed(
  () =>
    copyState.value || (saved.value ? "샘플 클립보드" : "변경됨 · 샘플 편집"),
);
function saveClipboard() {
  saved.value = true;
  copyState.value = "미리보기에 반영됨";
}
async function copyText() {
  try {
    await navigator.clipboard.writeText(clipboard.value);
    copyState.value = "복사했습니다";
  } catch {
    copyState.value = "복사 권한을 확인하세요";
  }
}
const search = ref("");
const selectedTitle = ref(notes.value[0].title);
const selectedCategory = ref(notes.value[0].category);
const memoTitle = ref(notes.value[0].title);
const editing = ref(false);
const memoDirty = ref(false);
const bodies = [
  "> 나의 생각이 자연스럽게 놓이는 곳.\n\n좋은 작업 공간은 더 많은 것을 보여주기보다, 지금 필요한 것에 집중할 수 있게 해준다. 흩어진 생각을 모으고 다시 꺼내 보는 일이 편안해야 한다.\n\n## 여백이 하는 일\n\n화면에 여백이 있다는 건, 아직 채울 수 있는 가능성이 있다는 뜻이기도 하다. 제목과 본문 사이의 작은 간격, 정돈된 목록과 조용한 도구들이 생각의 속도를 지켜준다.\n\n## 이번 주의 작은 목표\n\n- [x] 흩어진 아이디어 한곳에 모으기\n- [ ] 기록을 위한 짧은 시간 만들기\n- [ ] 내게 필요한 것만 남겨 보기\n\n---\n\n완벽한 공간보다, 매일 돌아오고 싶은 공간을 만들고 싶다.",
  "> 작은 시작을 매일 이어가기.\n\n이번 주에는 거창한 목표보다 일상의 리듬을 만들어 보려고 한다.\n\n## 작고 확실한 시작\n\n- [ ] 아침에 한 문장 기록하기\n- [ ] 읽던 책 열 페이지 이어 읽기\n- [x] 산책하면서 떠오른 생각 모으기\n\n조금씩 쌓이는 시간이 나의 방향을 만든다.",
  "> 다음에 다시 꺼내 보고 싶은 장면들.\n\n아이디어는 완성된 형태로 찾아오지 않는다. 스쳐 가는 단어와 풍경도 다음 프로젝트의 시작이 될 수 있다.\n\n## 수집한 단서\n\n- 여백이 많은 인쇄물의 리듬\n- 오래된 도서관의 차분한 색\n- 한눈에 들어오는 작은 도구\n\n이 단서들을 나의 작업에 연결해 보자.",
];
const memoContent = ref(bodies[0]);
const filteredNotes = computed(() =>
  notes.value.filter((note) => note.title.includes(search.value)),
);
function selectNote(note) {
  selectedTitle.value = note.title;
  selectedCategory.value = note.category;
  memoTitle.value = note.title;
  memoContent.value = bodies[notes.value.indexOf(note)] || "";
  memoDirty.value = false;
}
function openNote(index) {
  selectNote(notes.value[index]);
  emit("navigate", "memo");
}
function createNote() {
  selectedTitle.value = "";
  selectedCategory.value = "새 메모";
  memoTitle.value = "제목 없는 메모";
  memoContent.value = "";
  editing.value = true;
  memoDirty.value = true;
}
</script>

<style scoped>
.workspace {
  --paper: #f5f4f0;
  --surface: #fff;
  --ink: #252d29;
  --muted: #717870;
  --line: #dedfd8;
  --soft: #eeeee8;
  --accent: #3759d7;
  --accent-soft: #e9edff;
  --inverse: #fff;
  --side: #eeeee8;
  --radius: 14px;
  display: flex;
  min-height: calc(100dvh - 76px);
  background: var(--paper);
  color: var(--ink);
  font-family:
    "Pretendard",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    -apple-system,
    sans-serif;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: -0.025em;
}
.workspace *,
.workspace *::before,
.workspace *::after {
  box-sizing: border-box;
}
.workspace h1,
.workspace h2,
.workspace h3,
.workspace p {
  color: inherit;
  margin: 0;
  letter-spacing: inherit;
}
.workspace button,
.workspace input,
.workspace textarea {
  font: inherit;
  color: inherit;
}
.workspace button {
  cursor: pointer;
}
.workspace button:disabled {
  cursor: default;
}
.workspace button:focus-visible,
.workspace a:focus-visible,
.workspace input:focus-visible,
.workspace textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
.workspace button {
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}
.app-sidebar {
  width: 224px;
  flex-shrink: 0;
  background: var(--side);
  border-right: 1px solid var(--line);
  padding: 35px 22px 24px;
  display: flex;
  flex-direction: column;
}
.wordmark {
  display: flex;
  gap: 9px;
  align-items: center;
  text-decoration: none;
  color: var(--ink);
  font-size: 26px;
  font-weight: 750;
  line-height: 1;
  letter-spacing: -1.5px;
}
.brand-symbol {
  font-size: 38px;
  color: var(--accent);
  line-height: 1;
}
.brand-suffix {
  font-size: 16px;
  font-weight: 450;
  letter-spacing: -0.7px;
}
.wordmark small {
  display: block;
  font-size: 8px;
  letter-spacing: 1.5px;
  margin-top: 9px;
  font-weight: 500;
}
.workspace-label {
  margin: 52px 10px 16px;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 1.4px;
  display: flex;
  justify-content: space-between;
}
.workspace-label span {
  letter-spacing: 0;
}
.main-nav {
  display: grid;
  gap: 5px;
}
.main-nav button {
  border: 0;
  border-radius: 7px;
  background: transparent;
  display: flex;
  gap: 13px;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  text-align: left;
  color: var(--muted);
  font-weight: 550;
}
.main-nav button > .anticon {
  font-size: 17px;
}
.main-nav button.selected {
  background: var(--surface);
  color: var(--accent);
  box-shadow: 0 2px 6px #1b302205;
}
.main-nav button:not(:disabled):hover {
  background: var(--surface);
}
.main-nav button small {
  margin-left: auto;
  font-size: 12px;
  color: var(--muted);
  font-weight: 400;
}
.nav-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  margin-left: auto;
}
.main-nav button small + .nav-dot {
  margin-left: 0;
}
.sidebar-note {
  margin-top: auto;
  padding: 90px 12px 35px;
}
.note-orbit {
  font-size: 34px;
  color: #a0a793;
}
.sidebar-note p {
  margin: 13px 0 9px;
  font-size: 17px;
  line-height: 1.6;
  font-weight: 450;
}
.sidebar-note small {
  font-size: 12px;
  letter-spacing: 0;
  color: var(--muted);
}
.sidebar-profile {
  border-top: 1px solid var(--line);
  padding-top: 22px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--paper);
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sidebar-profile div {
  flex: 1;
  display: grid;
  gap: 2px;
}
.sidebar-profile strong {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
}
.sidebar-profile small {
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0;
}
.sidebar-profile > span:last-child {
  color: var(--muted);
  font-size: 19px;
}
.main-column {
  flex: 1;
  min-width: 0;
}
.workspace-topbar {
  height: 67px;
  padding: 0 46px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.breadcrumb {
  color: var(--muted);
  font-size: 11px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.breadcrumb strong {
  font-weight: 500;
  color: var(--ink);
}
.breadcrumb > span {
  opacity: 0.5;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.private-mark {
  color: var(--muted);
  font-size: 12px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.avatar.small {
  width: 27px;
  height: 27px;
  font-size: 18px;
}
.home-content {
  max-width: 1320px;
  margin: 0 auto;
  padding: 31px 46px 22px;
}
.intro-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.date-label {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
}
.tiny-dot {
  width: 5px;
  height: 5px;
  display: inline-block;
  border-radius: 50%;
  background: #73856c;
  flex-shrink: 0;
}
.tiny-dot.pending {
  background: #b58436;
}
.edition-label {
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 1.4px;
}
.home-heading {
  padding: 34px 0 32px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}
.section-kicker {
  font-size: 8px;
  letter-spacing: 2px;
  color: var(--muted) !important;
  margin-bottom: 16px !important;
}
.home-heading h1 {
  font-size: clamp(38px, 4.1vw, 62px);
  line-height: 1.17;
  letter-spacing: -3px;
  font-weight: 600;
  position: relative;
}
.home-heading h1 > span:first-child {
  color: var(--accent);
}
.heading-star {
  display: inline-block;
  margin-left: 22px;
  font-size: 47px;
  vertical-align: middle;
  font-weight: 400;
  color: #8d9b80;
}
.heading-description {
  margin-top: 18px !important;
  font-size: 12px;
  color: var(--muted) !important;
  line-height: 1.8;
}
.mobile-break {
  display: none;
}
.new-note {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--ink);
  color: var(--paper) !important;
  min-height: 44px;
  padding: 0 17px;
  border-radius: 6px;
  border: 0;
  font-size: 12px !important;
  flex-shrink: 0;
}
.new-note svg:last-child {
  width: 17px;
  height: 17px;
  margin-left: 16px;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 22px;
}
.capture-panel {
  min-width: 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 23px 25px 17px;
  display: flex;
  flex-direction: column;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.panel-index {
  display: block;
  font-size: 8px;
  letter-spacing: 1.5px;
  color: var(--muted);
  font-weight: 500;
}
.panel-heading h2 {
  font-size: 18px;
  font-weight: 550;
  margin-top: 9px;
  letter-spacing: -0.6px;
}
.surface-icon {
  color: var(--muted);
  font-size: 22px;
}
.capture-panel textarea {
  resize: none;
  width: 100%;
  min-height: 148px;
  border: 0;
  background: transparent;
  padding: 22px 0 15px;
  font-size: 14px;
  line-height: 1.9;
  outline-offset: 0;
}
.capture-footer {
  border-top: 1px solid var(--line);
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
}
.capture-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--muted);
}
.capture-footer > div {
  display: flex;
  gap: 10px;
  align-items: center;
}
.copy-action,
.save-action {
  border: 0;
  border-radius: 5px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px !important;
  min-height: 36px;
}
.copy-action {
  background: transparent;
  color: var(--muted) !important;
}
.save-action {
  background: var(--accent-soft);
  color: var(--accent) !important;
  min-width: 67px;
  justify-content: space-between;
}
.visual-panel {
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--line);
  background: #c5cbbd;
  display: flex;
  flex-direction: column;
  min-height: 302px;
}
.visual-art {
  flex: 1;
  min-height: 250px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #e6e8dd 0%, #c6d0bd 58%, #9baa90 100%);
}
.art-sun {
  position: absolute;
  width: 115px;
  height: 115px;
  top: 28px;
  left: 48%;
  border-radius: 50%;
  background: linear-gradient(145deg, #faf9e9, #ece8cd);
  box-shadow: 0 0 70px #f8f4d952;
}
.art-hill {
  position: absolute;
  width: 150%;
  left: -20%;
  border-radius: 50% 50% 0 0;
  transform: rotate(-14deg);
}
.hill-back {
  background: linear-gradient(120deg, #a0b09a, #7d947d);
  height: 210px;
  top: 155px;
}
.hill-front {
  background: linear-gradient(125deg, #657f70, #2e5349);
  height: 180px;
  top: 215px;
  left: -9%;
  transform: rotate(12deg);
}
.art-orbit {
  position: absolute;
  border: 1px solid #f4f7e978;
  border-radius: 50%;
  z-index: 2;
}
.orbit-one {
  width: 270px;
  height: 270px;
  top: 20px;
  left: 24%;
}
.orbit-two {
  width: 220px;
  height: 220px;
  top: 45px;
  left: 30%;
}
.art-number {
  position: absolute;
  z-index: 3;
  left: 20px;
  top: 18px;
  font-size: 11px;
  color: #435448;
  letter-spacing: 2px;
}
.visual-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 13px 18px;
  background: #e9ecdf;
  color: #4b5c4d;
  font-size: 12px;
}
.visual-caption span:last-child {
  font-size: 7px;
  letter-spacing: 1px;
}
.studio-art-type,
.console-art-type {
  display: none;
}
.recent-section {
  margin-top: 32px;
}
.recent-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 17px;
  gap: 16px;
}
.recent-heading h2 {
  font-size: 19px;
  font-weight: 550;
  letter-spacing: -0.7px;
  margin-top: 7px;
}
.recent-heading > button {
  border: 0;
  background: transparent;
  font-size: 12px;
  color: var(--muted);
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  min-height: 36px;
}
.recent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.recent-note {
  padding: 19px 0 15px;
  text-align: left;
  border: 0;
  border-top: 1px solid var(--line);
  background: transparent;
  min-width: 0;
}
.recent-note:hover {
  border-color: var(--accent);
}
.note-type {
  display: flex;
  gap: 6px;
  align-items: center;
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 1px;
}
.note-type > span:last-child {
  margin-left: auto;
  font-size: 15px;
}
.recent-note h3 {
  font-size: 15px;
  font-weight: 550;
  margin-top: 12px;
  letter-spacing: -0.4px;
}
.recent-note p {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.8;
  margin-top: 8px;
}
.note-date {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  margin-top: 22px;
  color: var(--muted);
  font-size: 8px;
}
.note-date {
  font-size: 11px;
}
.note-date > span {
  border: 1px solid var(--line);
  padding: 1px 5px;
  border-radius: 3px;
}
.page-signoff {
  border-top: 1px solid var(--line);
  margin-top: 29px;
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 11px;
}
.page-signoff span:last-child {
  font-size: 7px;
  letter-spacing: 1.4px;
}
.mobile-nav {
  display: none;
}
/* Document composition */
.memo-content {
  display: flex;
  min-height: calc(100dvh - 143px);
}
.memo-library {
  flex: 0 0 260px;
  border-right: 1px solid var(--line);
  padding: 30px 18px 24px;
  display: flex;
  flex-direction: column;
}
.library-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}
.library-heading h1 {
  font-size: 20px;
  font-weight: 550;
}
.library-heading h1 span {
  margin-left: 8px;
  font-size: 12px;
  color: var(--muted);
}
.library-heading button {
  border: 0;
  background: transparent;
  width: 36px;
  height: 36px;
}
.memo-search {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  border-radius: 6px;
  margin: 22px 4px;
  padding: 0 10px;
  color: var(--muted);
}
.memo-search input {
  min-width: 0;
  width: 100%;
  padding: 10px 0;
  border: 0;
  background: transparent;
  font-size: 11px;
}
.library-label {
  display: flex;
  justify-content: space-between;
  color: var(--muted) !important;
  font-size: 8px;
  letter-spacing: 1px !important;
  padding: 0 8px 12px;
}
.library-note {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  padding: 15px 12px;
  border-radius: 8px;
  margin-bottom: 6px;
}
.library-note.active {
  background: var(--surface);
  border-color: var(--line);
}
.library-note > span {
  color: var(--accent);
  font-size: 11px;
}
.library-note strong {
  display: block;
  font-size: 13px;
  font-weight: 550;
  margin: 7px 0;
}
.library-note p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.library-note small {
  display: block;
  color: var(--muted);
  font-size: 11px;
  margin-top: 12px;
}
.library-foot {
  margin-top: auto;
  padding: 40px 8px 0;
  font-size: 12px;
  color: var(--muted);
}
.search-empty {
  color: var(--muted) !important;
  font-size: 12px;
  padding: 12px;
}
.document-surface {
  background: var(--surface);
  flex: 1;
  min-width: 0;
}
.document-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
  padding: 0 28px;
  border-bottom: 1px solid var(--line);
  gap: 16px;
}
.back-home {
  background: transparent;
  border: 0;
  font-size: 12px !important;
  color: var(--muted) !important;
  display: flex;
  gap: 7px;
  align-items: center;
  min-height: 36px;
}
.document-status {
  display: flex;
  gap: 7px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}
.document-modes {
  display: flex;
  padding: 3px;
  gap: 2px;
  background: var(--paper);
  border-radius: 5px;
}
.document-modes button {
  border: 0;
  background: transparent;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 3px;
  min-height: 32px;
}
.document-modes button[aria-pressed="true"] {
  background: var(--surface);
  box-shadow: 0 1px 3px #00000008;
}
.document-body {
  max-width: 740px;
  margin: 0 auto;
  padding: 50px 48px 36px;
}
.document-eyebrow {
  color: var(--accent);
  font-size: 11px;
  letter-spacing: 1.6px;
  margin-bottom: 20px;
}
.document-eyebrow span {
  color: var(--muted);
  letter-spacing: 0;
  margin-left: 8px;
}
.document-body > h1,
.document-title-input {
  font-size: 32px !important;
  line-height: 1.4;
  font-weight: 550;
  letter-spacing: -1.4px !important;
  word-break: keep-all;
  overflow-wrap: anywhere;
}
.document-title-input {
  border: 0;
  width: 100%;
  background: transparent;
  padding: 0;
}
.document-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 37px;
  font-size: 11px;
  color: var(--muted);
  flex-wrap: wrap;
}
.document-meta strong {
  font-weight: 500;
  color: var(--ink);
}
.avatar.tiny {
  width: 23px;
  height: 23px;
  font-size: 15px;
}
.document-reading {
  font-size: 15px;
  line-height: 1.95;
}
.document-reading :deep(.markdown-body),
.document-reading :deep(.markdown-content) {
  color: var(--ink);
  background: transparent;
}
.document-reading :deep(p),
.document-reading :deep(li) {
  color: var(--ink);
  line-height: 1.95;
  font-size: 15px;
}
.document-reading :deep(h2) {
  color: var(--ink);
  font-size: 21px;
  margin: 32px 0 16px;
  font-weight: 550;
  border: 0;
}
.document-reading :deep(blockquote) {
  border-left: 2px solid var(--accent);
  padding: 3px 18px;
  color: var(--muted);
  background: transparent;
  margin: 0 0 24px;
}
.document-reading :deep(blockquote p) {
  color: var(--muted);
  margin: 0;
}
.document-reading :deep(hr) {
  border: 0;
  border-top: 1px solid var(--line);
  background: none;
  margin: 30px 0;
  height: 0;
}
.document-reading :deep(input) {
  accent-color: var(--accent);
}
.document-editor {
  width: 100%;
  min-height: 480px;
  resize: vertical;
  background: transparent;
  border: 0;
  padding: 0;
  line-height: 1.95;
  font-size: 15px;
}
.document-end {
  margin-top: 42px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
}
.document-end > span {
  font-size: 23px;
  color: var(--accent);
}
.document-end p {
  font-size: 12px;
}
/* A: editorial light and dark */
.workspace.is-dark {
  --paper: #151b19;
  --surface: #1d2521;
  --ink: #eeefe6;
  --muted: #a3afa5;
  --line: #354039;
  --soft: #26302a;
  --accent: #a8b9ff;
  --accent-soft: #2c3851;
  --side: #19211c;
}
.is-dark .visual-art {
  filter: brightness(0.8) saturate(0.8);
}
.is-dark .visual-caption {
  background: #2d3b31;
  color: #d1ddc9;
}
/* B: graphic studio, bold surfaces and typographic artwork */
.direction-studio {
  --paper: #f2f1e9;
  --side: #242728;
  --accent: #5142dc;
  --accent-soft: #e6e1ff;
  --radius: 0px;
}
.direction-studio .app-sidebar {
  color: #f2f3e7;
  border-color: #242728;
}
.direction-studio .wordmark {
  color: #f2f3e7;
}
.direction-studio .brand-symbol {
  color: #d5ed72;
}
.direction-studio .workspace-label,
.direction-studio .main-nav button,
.direction-studio .sidebar-note small,
.direction-studio .sidebar-profile small,
.direction-studio .sidebar-profile > span:last-child {
  color: #b8bdb5;
}
.direction-studio .main-nav button {
  border-radius: 0;
}
.direction-studio .main-nav button.selected {
  color: #242728;
  background: #d5ed72;
}
.direction-studio .main-nav button:not(:disabled):hover {
  color: #242728;
  background: #d5ed72;
}
.direction-studio .sidebar-profile {
  border-color: #474c47;
}
.direction-studio .sidebar-note .note-orbit {
  color: #d5ed72;
  font-size: 55px;
}
.direction-studio .sidebar-note p {
  font-weight: 650;
  font-size: 20px;
}
.direction-studio .sidebar-profile .avatar {
  background: #d5ed72;
  color: #242728;
}
.direction-studio .home-heading h1 {
  font-weight: 850;
  letter-spacing: -4px;
  font-size: clamp(42px, 4.5vw, 68px);
}
.direction-studio .home-heading h1 > span:first-child {
  color: var(--ink);
}
.direction-studio .heading-star {
  color: var(--accent);
  transform: rotate(15deg);
  font-size: 63px;
}
.direction-studio .new-note {
  background: var(--accent);
  color: #fff !important;
  border-radius: 0;
}
.direction-studio .hero-grid {
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid var(--ink);
}
.direction-studio .capture-panel {
  border: 0;
  border-right: 1px solid var(--ink);
}
.direction-studio .visual-panel {
  border: 0;
}
.direction-studio .visual-art {
  background: #d5ed72;
}
.direction-studio .art-sun,
.direction-studio .art-hill,
.direction-studio .art-orbit {
  display: none;
}
.direction-studio .studio-art-type {
  display: block;
  position: absolute;
  top: 40px;
  left: 30px;
  font-family: Arial, sans-serif;
  font-weight: 900;
  letter-spacing: -8px;
  font-size: 100px;
  line-height: 0.84;
  color: #292c24;
  transform: rotate(-7deg);
}
.direction-studio .art-number {
  color: #292c24;
}
.direction-studio .visual-caption {
  background: #292c24;
  color: #e6edc6;
}
.direction-studio .recent-grid {
  gap: 0;
  border-bottom: 1px solid var(--line);
}
.direction-studio .recent-note {
  padding: 20px;
  border: 1px solid var(--line);
  border-right: 0;
}
.direction-studio .recent-note:last-child {
  border-right: 1px solid var(--line);
}
.direction-studio .note-type {
  color: var(--accent);
}
.direction-studio.is-dark {
  --paper: #1c1c22;
  --surface: #262630;
  --ink: #f4f0e8;
  --muted: #b5b2bd;
  --line: #44424c;
  --accent: #b8abff;
  --accent-soft: #3c3456;
}
.direction-studio.is-dark .new-note {
  color: #211d33 !important;
}
/* C: precise console with an independent spatial treatment */
.direction-console,
.direction-console.is-dark {
  --paper: #10171c;
  --surface: #172127;
  --side: #0b1116;
  --ink: #e1edf0;
  --muted: #90a5ae;
  --line: #2c3c43;
  --accent: #8cd8c3;
  --accent-soft: #203b35;
  --radius: 5px;
}
.direction-console .wordmark {
  font-family: monospace;
  letter-spacing: -1.5px;
  font-size: 24px;
}
.direction-console .brand-suffix {
  font-family: monospace;
}
.direction-console .workspace-label,
.direction-console .panel-index,
.direction-console .section-kicker,
.direction-console .edition-label,
.direction-console .note-type,
.direction-console .date-label,
.direction-console .document-eyebrow {
  font-family: monospace;
  letter-spacing: 1px;
}
.direction-console .workspace-topbar {
  background: #0d151a;
}
.direction-console .main-nav button {
  border-radius: 3px;
}
.direction-console .main-nav button.selected {
  background: var(--accent-soft);
}
.direction-console .home-heading {
  border-bottom: 1px solid var(--line);
  margin-bottom: 24px;
  padding-top: 25px;
}
.direction-console .home-heading h1 {
  font-size: 44px;
  font-weight: 500;
  letter-spacing: -1.9px;
}
.direction-console .home-heading h1 br {
  display: none;
}
.direction-console .home-heading h1 > span:first-of-type::before {
  content: " ";
}
.direction-console .heading-star {
  font-size: 30px;
  color: var(--accent);
}
.direction-console .new-note {
  background: var(--accent);
  color: #10251f !important;
  border-radius: 3px;
}
.direction-console .hero-grid {
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
}
.direction-console .visual-art {
  background: radial-gradient(ellipse at 50% 60%, #22483d, #111d24 70%);
}
.direction-console .art-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(#466b5e25 1px, transparent 1px),
    linear-gradient(90deg, #466b5e25 1px, transparent 1px);
  background-size: 24px 24px;
}
.direction-console .art-hill,
.direction-console .art-sun {
  display: none;
}
.direction-console .art-orbit {
  border-color: #8cd8c359;
  width: 150px;
  height: 150px;
  top: 30px;
  left: calc(50% - 75px);
  box-shadow: inset 0 0 40px #8cd8c30c;
}
.direction-console .orbit-two {
  transform: rotateX(65deg) rotateZ(-20deg);
  width: 220px;
  height: 220px;
  top: -5px;
  left: calc(50% - 110px);
}
.direction-console .console-art-type {
  display: block;
  position: absolute;
  bottom: 15px;
  left: 20px;
  font-family: monospace;
  color: #8cd8c3;
  font-size: 8px;
  line-height: 1.8;
  letter-spacing: 1px;
  z-index: 2;
}
.direction-console .art-number {
  color: #8cd8c3;
}
.direction-console .visual-caption {
  background: #172923;
  color: #b6d4c6;
}
.direction-console .recent-grid {
  gap: 12px;
}
.direction-console .recent-note {
  background: var(--surface);
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 4px;
}
.direction-console .sidebar-note p {
  font-size: 15px;
}
.direction-console .note-orbit {
  color: var(--accent);
}
.direction-console:not(.is-dark) {
  --paper: #eaf0ee;
  --surface: #f7faf8;
  --side: #dfe8e4;
  --ink: #203c34;
  --muted: #5d756c;
  --line: #bfcec6;
  --accent: #206753;
  --accent-soft: #d3e7dd;
}
.direction-console:not(.is-dark) .workspace-topbar {
  background: var(--paper);
}
.direction-console:not(.is-dark) .new-note {
  color: #fff !important;
}
@media (min-width: 1600px) {
  .home-content {
    padding-top: 44px;
  }
  .home-heading {
    padding-top: 48px;
    padding-bottom: 44px;
  }
  .visual-panel {
    min-height: 340px;
  }
  .capture-panel textarea {
    min-height: 180px;
  }
}
@media (max-width: 1199px) and (min-width: 768px) {
  .app-sidebar {
    width: 180px;
    padding: 28px 13px 20px;
  }
  .wordmark {
    font-size: 22px;
    gap: 5px;
  }
  .brand-symbol {
    font-size: 29px;
  }
  .brand-suffix {
    font-size: 12px;
  }
  .wordmark small {
    font-size: 6px;
  }
  .workspace-topbar {
    padding: 0 28px;
  }
  .home-content {
    padding-left: 28px;
    padding-right: 28px;
  }
  .hero-grid {
    gap: 15px;
  }
  .capture-panel {
    padding: 20px 18px 15px;
  }
  .panel-heading h2 {
    font-size: 16px;
  }
  .capture-footer {
    flex-wrap: wrap;
  }
  .capture-footer > div {
    margin-left: auto;
  }
  .recent-grid {
    gap: 14px;
  }
  .memo-library {
    flex-basis: 210px;
    padding-left: 10px;
    padding-right: 10px;
  }
  .document-body {
    padding: 35px 28px;
  }
  .document-body > h1,
  .document-title-input {
    font-size: 27px !important;
  }
}
@media (max-width: 900px) and (min-width: 768px) {
  .app-sidebar {
    width: 72px;
    padding: 25px 10px;
  }
  .wordmark > span:last-child,
  .workspace-label,
  .main-nav button > span:not(.anticon),
  .main-nav button small,
  .sidebar-note,
  .sidebar-profile div,
  .sidebar-profile > span:last-child {
    display: none;
  }
  .wordmark {
    justify-content: center;
  }
  .main-nav {
    margin-top: 44px;
  }
  .main-nav button {
    justify-content: center;
    padding: 0;
  }
  .sidebar-profile {
    margin-top: auto;
    justify-content: center;
  }
  .memo-library {
    flex-basis: 220px;
  }
}
@media (max-width: 767px) {
  .workspace {
    min-height: calc(100dvh - 125px);
    padding-bottom: calc(78px + env(safe-area-inset-bottom, 0px));
  }
  .app-sidebar {
    display: none;
  }
  .workspace-topbar {
    height: 55px;
    padding: 0 22px;
  }
  .breadcrumb {
    font-size: 12px;
    gap: 8px;
  }
  .topbar-right {
    gap: 10px;
  }
  .private-mark {
    display: none;
  }
  .home-content {
    padding: 23px 22px 24px;
  }
  .date-label {
    font-size: 12px;
  }
  .edition-label {
    font-size: 6px;
    letter-spacing: 1px;
  }
  .home-heading {
    padding: 29px 0 25px;
    gap: 12px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .section-kicker {
    font-size: 7px;
    letter-spacing: 1.5px;
    margin-bottom: 14px !important;
  }
  .home-heading h1 {
    font-size: 43px;
    letter-spacing: -2px;
  }
  .heading-star {
    font-size: 37px;
    margin-left: 14px;
  }
  .heading-description {
    font-size: 11px;
    margin-top: 15px !important;
  }
  .mobile-break {
    display: block;
  }
  .new-note {
    margin-top: 4px;
    min-height: 40px;
    padding: 0 14px;
    font-size: 12px !important;
  }
  .new-note svg:last-child {
    margin-left: 7px;
    width: 15px;
    height: 15px;
  }
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .capture-panel {
    padding: 21px 20px 15px;
  }
  .panel-heading h2 {
    font-size: 18px;
  }
  .panel-index {
    font-size: 7px;
  }
  .surface-icon {
    font-size: 21px;
  }
  .capture-panel textarea {
    min-height: 166px;
    padding: 20px 0 15px;
    font-size: 14px;
  }
  .capture-status {
    font-size: 8px;
  }
  .copy-action,
  .save-action {
    min-height: 44px;
    font-size: 12px !important;
  }
  .copy-action {
    padding: 8px;
  }
  .save-action {
    padding: 8px 12px;
  }
  .visual-panel {
    min-height: 225px;
  }
  .visual-art {
    min-height: 190px;
  }
  .art-sun {
    width: 90px;
    height: 90px;
    top: 22px;
  }
  .hill-back {
    top: 111px;
    height: 190px;
  }
  .hill-front {
    top: 162px;
  }
  .orbit-one {
    width: 220px;
    height: 220px;
    top: -3px;
    left: 26%;
  }
  .orbit-two {
    width: 180px;
    height: 180px;
    top: 18px;
    left: 32%;
  }
  .visual-caption {
    padding: 12px 14px;
    font-size: 11px;
  }
  .visual-caption span:last-child {
    font-size: 6px;
  }
  .recent-section {
    margin-top: 29px;
  }
  .recent-heading h2 {
    font-size: 19px;
  }
  .recent-heading > button {
    font-size: 11px;
    gap: 6px;
  }
  .recent-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .recent-note {
    padding: 17px 0;
  }
  .recent-note h3 {
    font-size: 16px;
    margin-top: 8px;
  }
  .recent-note p {
    font-size: 12px;
    margin-top: 7px;
  }
  .note-date {
    margin-top: 15px;
    font-size: 11px;
  }
  .note-type {
    font-size: 8px;
  }
  .page-signoff {
    margin-top: 10px;
    font-size: 8px;
  }
  .page-signoff span:last-child {
    font-size: 6px;
    letter-spacing: 0.5px;
  }
  .mobile-nav {
    display: flex;
    position: fixed;
    z-index: 90;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
    min-height: 66px;
    background: var(--surface);
    border-top: 1px solid var(--line);
    justify-content: space-around;
  }
  .mobile-nav button {
    flex: 1;
    min-width: 0;
    min-height: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    color: var(--muted);
    background: transparent;
    border: 0;
    border-radius: 5px;
  }
  .mobile-nav button > .anticon {
    font-size: 19px;
  }
  .mobile-nav button > span:last-child {
    font-size: 11px;
  }
  .mobile-nav button.selected {
    color: var(--accent);
  }
  .mobile-nav button.selected::before {
    content: "";
    width: 15px;
    height: 2px;
    background: var(--accent);
    position: absolute;
    top: 0;
  }
  .memo-content {
    min-height: calc(100dvh - 250px);
    display: block;
  }
  .memo-library {
    display: none;
  }
  .document-toolbar {
    min-height: 58px;
    padding: 0 19px;
    gap: 10px;
  }
  .document-status {
    font-size: 11px;
  }
  .back-home {
    min-height: 44px;
  }
  .document-modes button {
    min-height: 38px;
    padding: 6px 11px;
  }
  .document-body {
    padding: 35px 25px 30px;
  }
  .document-body > h1,
  .document-title-input {
    font-size: 30px !important;
    line-height: 1.45;
    letter-spacing: -1.2px !important;
  }
  .document-meta {
    gap: 8px;
    margin: 20px 0 28px;
    font-size: 11px;
  }
  .document-eyebrow {
    font-size: 8px;
  }
  .document-reading :deep(p),
  .document-reading :deep(li) {
    font-size: 15px;
    line-height: 1.95;
  }
  .document-editor {
    font-size: 16px;
  }
  .direction-studio .home-heading h1 {
    font-size: 49px;
    letter-spacing: -3px;
  }
  .direction-studio .heading-star {
    font-size: 44px;
    margin-left: 12px;
  }
  .direction-studio .hero-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .direction-studio .capture-panel {
    border-right: 0;
    border-bottom: 1px solid var(--ink);
  }
  .direction-studio .studio-art-type {
    font-size: 92px;
    left: 32px;
    top: 32px;
  }
  .direction-studio .visual-panel {
    min-height: 245px;
  }
  .direction-studio .visual-art {
    min-height: 210px;
  }
  .direction-studio .recent-grid {
    border: 0;
  }
  .direction-studio .recent-note {
    padding: 20px 15px;
    border-right: 1px solid var(--line);
    border-bottom: 0;
  }
  .direction-studio .recent-note:last-child {
    border-bottom: 1px solid var(--line);
  }
  .direction-console .home-heading h1 {
    font-size: 39px;
  }
  .direction-console .home-heading h1 br {
    display: block;
  }
  .direction-console .heading-star {
    font-size: 29px;
    margin-left: 10px;
  }
  .direction-console .hero-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .direction-console .recent-grid {
    gap: 12px;
  }
  .direction-console .visual-art {
    min-height: 215px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .workspace button {
    transition: none;
  }
}
</style>
