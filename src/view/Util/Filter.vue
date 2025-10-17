<template>
  <div class="p-4 max-w-4xl mx-auto space-y-4">
    <h1 class="text-xl font-bold">로그 단어 필터 (프론트 전용)</h1>

    <!-- 1) File input -->
    <div class="space-y-2">
      <input type="file" accept=".log,.txt" @change="onPick" />
      <p v-if="file" class="text-sm text-gray-500">
        선택됨: {{ file.name }} ({{ formatBytes(file.size) }})
      </p>
    </div>

    <!-- 2) Controls -->
    <div class="flex flex-wrap items-center gap-3" v-if="file">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="wholeWord" /> 단어 경계로만 일치
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="caseInsensitive" /> 대소문자 무시
      </label>
      <label class="flex items-center gap-2">
        <span class="text-sm">최소 단어 길이</span>
        <input
          type="number"
          v-model.number="minWordLength"
          min="1"
          class="w-20 border rounded px-2 py-1"
        />
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="excludeNumbers" /> 숫자 제외
      </label>
      <button
        class="px-3 py-1.5 rounded bg-black text-white disabled:opacity-50"
        :disabled="loading || !file"
        @click="analyze"
      >
        {{ loading ? "분석 중…" : "단어 분석 실행" }}
      </button>
      <label class="flex items-center gap-2">
        <span class="text-sm">통계 정렬 기준</span>
        <select v-model="sortMode" class="border rounded px-2 py-1">
          <option value="length">길이(내림차순)</option>
          <option value="freq">빈도(내림차순)</option>
          <option value="alpha">알파벳(A→Z)</option>
        </select>
      </label>
    </div>

    <!-- 3) Top 20 words (sorted by length desc for display) -->
    <div v-if="topForDisplay.length" class="space-y-2">
      <h2 class="font-semibold">상위 20개 단어(3글자 이상·숫자 제외)</h2>
      <div class="text-xs text-gray-500">
        제외할 단어 선택: {{ selected.size }}개
      </div>
      <div class="word-list">
        <label
          v-for="w in topForDisplay"
          :key="w[0]"
          class="flex items-center gap-2 border rounded px-2 py-1 word-item"
        >
          <input
            type="checkbox"
            :value="w[0]"
            @change="toggle(w[0], $event)"
            :checked="selected.has(w[0])"
          />
          <span class="font-mono truncate" :title="`${w[0]} — ${w[1]}`">{{
            w[0]
          }}</span>
          <span class="ml-auto text-xs text-gray-500">{{ w[1] }}</span>
        </label>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="manualWord"
          placeholder="단어 수동 추가…"
          class="border rounded px-2 py-1"
          @keyup.enter="addManual"
        />
        <button class="px-3 py-1.5 rounded border" @click="addManual">
          추가
        </button>
        <button class="px-3 py-1.5 rounded border" @click="selected.clear()">
          선택 해제
        </button>
      </div>
    </div>

    <!-- 4) Preview + Download -->
    <div v-if="file && (selected.size > 0 || analyzed)" class="space-y-3">
      <div class="flex items-center gap-3">
        <button
          class="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
          :disabled="!file || selected.size === 0 || filtering"
          @click="makePreview"
        >
          {{ filtering ? "필터링 중…" : "미리보기 생성" }}
        </button>
        <div class="text-sm text-gray-600" v-if="stats">
          총 라인: {{ stats.totalLines }} → 유지 {{ stats.keptLines }} (제거
          {{ stats.removedLines }})
        </div>
        <a
          v-if="downloadUrl"
          :href="downloadUrl"
          download="cleaned.log"
          class="px-3 py-1.5 rounded border"
          >cleaned.log 다운로드</a
        >
      </div>

      <div v-if="false" class="space-y-1">
        <div class="text-xs text-gray-500">
          첫 {{ preview.length }}줄 미리보기
        </div>
        <textarea
          class="w-full h-72 border rounded p-2 font-mono text-sm"
          :value="preview.join('\n')"
          readonly
        ></textarea>
      </div>
      <div v-else class="text-xs text-gray-500">
        미리보기는 전체 화면 팝업에서 확인됩니다.
      </div>
    </div>

    <!-- Fullscreen Preview Modal -->
    <div v-if="showPreview" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-topbar">
          <input
            v-model="searchDraft"
            class="search-input"
            placeholder="미리보기 검색… (버튼을 눌러 적용)"
            @keyup.enter="applySearch"
          />
          <div class="topbar-actions">
            <button class="btn" @click="applySearch">검색</button>
            <button
              class="btn btn-border"
              v-if="searchQuery"
              @click="clearSearch"
            >
              초기화
            </button>
            <a
              v-if="downloadUrl"
              :href="downloadUrl"
              download="cleaned.log"
              class="btn btn-border"
              >cleaned.log 다운로드</a
            >
            <button class="btn" @click="showPreview = false">닫기</button>
          </div>
        </div>
        <div class="modal-body">
          <template v-if="filteredPreview.length">
            <pre class="preview-pre" v-html="highlightedPreview"></pre>
          </template>
          <template v-else>
            <div class="empty-state">
              표시할 라인이 없습니다. (검색 결과 없음 또는 모든 라인이 제거됨)
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const file = ref(null);
const loading = ref(false);
const filtering = ref(false);
const analyzed = ref(false);
const text = ref("");
const frequencies = ref([]); // [word, count]
const selected = ref(new Set());
const manualWord = ref("");
const wholeWord = ref(false);
const caseInsensitive = ref(true);
const sortMode = ref("length");
const preview = ref([]);
const downloadUrl = ref("");
const stats = ref(null);

const showPreview = ref(false);
const keptAll = ref([]); // full kept lines after filtering
const searchQuery = ref("");
const searchDraft = ref("");
function applySearch() {
  searchQuery.value = (searchDraft.value || "").trim();
}
function clearSearch() {
  searchDraft.value = "";
  searchQuery.value = "";
}

const minWordLength = ref(3);
const excludeNumbers = ref(true);

const formatBytes = (n) => {
  if (!n && n !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return v.toFixed(1) + " " + units[i];
};

function onPick(e) {
  resetAll();
  file.value = e.target.files?.[0] || null;
}

function resetAll() {
  loading.value = false;
  filtering.value = false;
  analyzed.value = false;
  text.value = "";
  frequencies.value = [];
  selected.value = new Set();
  manualWord.value = "";
  preview.value = [];
  downloadUrl.value = "";
  stats.value = null;
  showPreview.value = false;
  keptAll.value = [];
  searchQuery.value = "";
  searchDraft.value = "";
}

async function analyze() {
  if (!file.value) return;
  loading.value = true;
  text.value = await file.value.text();
  // tokenize → words >= minWordLength, not all digits if excludeNumbers
  const map = new Map();
  const re = /\w+/g;
  const lower = text.value.toLowerCase();
  let m;
  while ((m = re.exec(lower)) !== null) {
    const w = m[0];
    if (w.length < minWordLength.value) continue;
    if (excludeNumbers.value && /^\d+$/.test(w)) continue;
    map.set(w, (map.get(w) || 0) + 1);
  }
  const list = Array.from(map.entries()).sort((a, b) => b[1] - a[1]); // by freq desc
  frequencies.value = list;
  analyzed.value = true;
  loading.value = false;
}

// pick top 20 by frequency, then sort for display by length desc
const topForDisplay = computed(() => {
  const topN = frequencies.value.slice(0, 20);
  if (sortMode.value === "length")
    return [...topN].sort((a, b) => b[0].length - a[0].length);
  if (sortMode.value === "alpha")
    return [...topN].sort((a, b) => a[0].localeCompare(b[0]));
  // 'freq' keeps original (already sorted by frequency desc)
  return topN;
});

function toggle(word, ev) {
  const s = selected.value;
  if (ev.target.checked) s.add(word);
  else s.delete(word);
}

function addManual() {
  const w = manualWord.value.trim().toLowerCase();
  if (!w) return;
  if (w.length < minWordLength.value) return;
  if (excludeNumbers.value && /^\d+$/.test(w)) return;
  selected.value.add(w);
  manualWord.value = "";
}

function buildMatcher() {
  const flags = caseInsensitive.value ? "i" : "";
  if (selected.value.size === 0) return null;
  const arr = Array.from(selected.value).map(escapeRegExp);
  if (wholeWord.value) {
    // word boundary for each
    const withBoundary = arr.map((w) => `\\b${w}\\b`);
    return new RegExp(withBoundary.join("|"), flags);
  } else {
    return new RegExp(arr.join("|"), flags);
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, (r) => `\\${r}`);
}

async function makePreview() {
  if (!text.value) return;
  const matcher = buildMatcher();
  if (!matcher) return;
  filtering.value = true;
  // filter lines
  const lines = text.value.split(/\r?\n/);
  const kept = [];
  let keptCount = 0,
    removedCount = 0;
  for (const ln of lines) {
    if (!ln.trim()) {
      continue;
    } // drop empty lines
    if (matcher.test(ln)) removedCount++;
    else {
      kept.push(ln);
      keptCount++;
    }
  }
  stats.value = {
    totalLines: lines.length,
    keptLines: keptCount,
    removedLines: removedCount,
  };
  preview.value = kept.slice(0, 500);
  keptAll.value = kept;
  // blob for download
  if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);
  const blob = new Blob([kept.join("\n")], { type: "text/plain" });
  downloadUrl.value = URL.createObjectURL(blob);
  filtering.value = false;
  showPreview.value = true;
}

const filteredPreview = computed(() => {
  if (!searchQuery.value) return keptAll.value;
  const q = searchQuery.value.toLowerCase();
  return keptAll.value.filter((l) => l.toLowerCase().includes(q));
});

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExpLite(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, (r) => `\\${r}`);
}

const highlightedPreview = computed(() => {
  const lines = filteredPreview.value;
  if (!lines || !lines.length) return "";
  const q = (searchQuery.value || "").trim();
  if (!q) {
    // just escaped text
    return escapeHtml(lines.join("\n"));
  }
  const re = new RegExp(escapeRegExpLite(q), "ig");
  // escape then mark
  const marked = lines.map((line) => {
    const safe = escapeHtml(line);
    return safe.replace(re, (m) => `<mark class="hl">${escapeHtml(m)}</mark>`);
  });
  return marked.join("\n");
});
</script>

<style scoped>
/* Basic sensible defaults (works without Tailwind) */
* {
  box-sizing: border-box;
}
.p-4 {
  padding: 1rem;
}
.max-w-4xl {
  max-width: 64rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.space-y-4 > * + * {
  margin-top: 1rem;
}
.space-y-2 > * + * {
  margin-top: 0.5rem;
}
.flex {
  display: flex;
}
.flex-wrap {
  flex-wrap: wrap;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.text-xl {
  font-size: 1.25rem;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.text-sm {
  font-size: 0.875rem;
}
.text-xs {
  font-size: 0.75rem;
}
.text-gray-500 {
  color: #6b7280;
}
.text-gray-600 {
  color: #4b5563;
}
.bg-black {
  background: #111827;
}
.bg-blue-600 {
  background: #2563eb;
}
.text-white {
  color: #fff;
}
.rounded {
  border-radius: 0.5rem;
}
.border {
  border: 1px solid #e5e7eb;
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.py-1\.5 {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}
.w-full {
  width: 100%;
}
.h-72 {
  height: 18rem;
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.md\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.lg\:grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.gap-2 {
  gap: 0.5rem;
}
.ml-auto {
  margin-left: auto;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.disabled\:opacity-50:disabled {
  opacity: 0.5;
}
textarea,
input[type="text"],
select {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.5rem;
  font: inherit;
}
button {
  cursor: pointer;
}
button.border {
  background: #fff;
}
.underline {
  text-decoration: underline;
}

/* New styles for word list layout */
.word-list {
  display: block;
}
.word-item {
  display: flex;
  width: 100%;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
}
.modal-content {
  background: #fff;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.modal-topbar {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}
.search-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  font: inherit;
}
.topbar-actions {
  display: flex;
  gap: 0.5rem;
}
.modal-body {
  flex: 1;
  overflow: auto;
}
.preview-pre {
  margin: 0;
  padding: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  white-space: pre-wrap; /* 줄바꿈 허용: 긴 라인도 화면에 표시됨 */
  word-break: break-word; /* 너무 긴 토큰도 줄바꿈 */
  color: #111; /* 텍스트 색상 명시 */
  background: #fff; /* 배경을 확실히 흰색으로 */
}

.empty-state {
  padding: 1rem;
  color: #6b7280; /* gray-500 */
}
.modal-content {
  color: #111;
}
.btn {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  background: #111827;
  color: #fff;
}
.btn-border {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
}
</style>

mark.hl { background: #fde047; color: #111; padding: 0 .1em; border-radius:
.2em; }
