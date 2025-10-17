<template>
  <div class="container space-y-4">
    <h1 class="text-xl font-bold">로그 단어 필터</h1>

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
          class="styled-input"
          style="max-width: 6rem"
        />
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="excludeNumbers" /> 숫자 제외
      </label>
      <button
        class="button-primary"
        :disabled="loading || !file"
        @click="analyze"
        type="button"
      >
        {{ loading ? "분석 중…" : "단어 분석 실행" }}
      </button>
      <label class="flex items-center gap-2">
        <span class="text-sm">통계 정렬 기준</span>
        <select v-model="sortMode" class="styled-input">
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
          class="styled-input"
          @keyup.enter="addManual"
        />
        <button class="button-secondary" @click="addManual" type="button">
          추가
        </button>
        <button
          class="button-secondary"
          @click="selected.clear()"
          type="button"
        >
          선택 해제
        </button>
      </div>
    </div>

    <!-- 4) Preview + Download -->
    <div v-if="file && (selected.size > 0 || analyzed)" class="space-y-3">
      <div class="flex items-center gap-3">
        <button
          class="button-primary"
          :disabled="!file || selected.size === 0 || filtering"
          @click="makePreview"
          type="button"
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
          class="button-secondary"
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
            <label class="ctx-ctl">
              <span class="ctx-label">전후 라인</span>
              <input
                type="number"
                min="0"
                max="50"
                v-model.number="contextRadius"
                class="ctx-input"
              />
            </label>
            <button class="button-primary" @click="applySearch" type="button">
              검색
            </button>
            <button
              class="button-secondary"
              v-if="searchQuery"
              @click="clearSearch"
              type="button"
            >
              초기화
            </button>
            <a
              v-if="downloadUrl"
              :href="downloadUrl"
              download="cleaned.log"
              class="button-secondary"
              >cleaned.log 다운로드</a
            >
            <button
              class="button-secondary"
              @click="showPreview = false"
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
        <div
          class="modal-body"
          tabindex="0"
          ref="modalBodyRef"
          @keydown="onModalKey"
        >
          <template v-if="renderItems.length">
            <div class="preview-lines">
              <template v-for="(it, idx) in renderItems" :key="it.key">
                <div
                  v-if="it.type === 'line'"
                  class="line-row"
                  v-html="it.html"
                ></div>
                <div
                  v-else-if="it.type === 'sep-top'"
                  class="sep-row"
                  @click="expandAbove(it.anchor)"
                  title="경계선 클릭: 위로 5줄 확장"
                >
                  <div class="wavy-sep"></div>
                </div>
                <div
                  v-else-if="it.type === 'sep-bottom'"
                  class="sep-row"
                  @click="expandBelow(it.anchor)"
                  title="경계선 클릭: 아래로 5줄 확장"
                >
                  <div class="wavy-sep"></div>
                </div>
              </template>
            </div>
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
import { ref, computed, nextTick } from "vue";

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

// Modal controls for preview
const modalBodyRef = ref(null);
const contextRadius = ref(0); // experimental context lines around matches

function focusModalBodySoon() {
  nextTick(() => {
    try {
      modalBodyRef.value && modalBodyRef.value.focus();
    } catch {}
  });
}

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
  extraIdxs.value = new Set();
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
  focusModalBodySoon();
}

function onModalKey(e) {
  const el = modalBodyRef.value;
  if (!el) return;
  const lineHeight = 24; // px
  const page = Math.max(0, el.clientHeight - 40);

  switch (e.key) {
    case "PageDown":
      el.scrollTop += page;
      e.preventDefault();
      break;
    case "PageUp":
      el.scrollTop -= page;
      e.preventDefault();
      break;
    case "ArrowDown":
      el.scrollTop += lineHeight;
      e.preventDefault();
      break;
    case "ArrowUp":
      el.scrollTop -= lineHeight;
      e.preventDefault();
      break;
    case "Home":
      el.scrollTop = 0;
      e.preventDefault();
      break;
    case "End":
      el.scrollTop = el.scrollHeight;
      e.preventDefault();
      break;
  }
}

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

const baseMatchedIdxs = computed(() => {
  const lines = keptAll.value;
  const q = (searchQuery.value || "").toLowerCase();
  const radius = Number(contextRadius.value) || 0;

  if (!q) return new Set(lines.map((_, i) => i));

  const idxs = new Set();
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i] || "").toLowerCase().includes(q)) {
      if (radius === 0) {
        idxs.add(i);
      } else {
        const s = Math.max(0, i - radius);
        const e = Math.min(lines.length - 1, i + radius);
        for (let k = s; k <= e; k++) idxs.add(k);
      }
    }
  }
  return idxs;
});

const extraIdxs = ref(new Set());

function expandAbove(anchor) {
  const set = new Set(extraIdxs.value);
  let added = 0;
  for (let i = anchor - 1; i >= 0 && added < 5; i--) {
    if (!set.has(i) && !baseMatchedIdxs.value.has(i)) {
      set.add(i);
      added++;
    }
  }
  extraIdxs.value = set;
}
function expandBelow(anchor) {
  const lines = keptAll.value;
  const set = new Set(extraIdxs.value);
  let added = 0;
  for (let i = anchor + 1; i < lines.length && added < 5; i++) {
    if (!set.has(i) && !baseMatchedIdxs.value.has(i)) {
      set.add(i);
      added++;
    }
  }
  extraIdxs.value = set;
}

const renderIndices = computed(() => {
  const u = new Set();
  baseMatchedIdxs.value.forEach((i) => u.add(i));
  extraIdxs.value.forEach((i) => u.add(i));
  return Array.from(u).sort((a, b) => a - b);
});

const renderItems = computed(() => {
  const items = [];
  const indices = renderIndices.value;
  const lines = keptAll.value;
  const q = (searchQuery.value || "").trim();
  const re = q ? new RegExp(escapeRegExpLite(q), "ig") : null;

  if (indices.length === 0) return items;

  const mergeGap = 2; // 작은 공백은 같은 블록으로 병합
  const blocks = [];
  let start = indices[0];
  let prev = indices[0];
  for (let k = 1; k < indices.length; k++) {
    const cur = indices[k];
    if (cur <= prev + 1 + mergeGap) {
      prev = cur;
    } else {
      blocks.push([start, prev]);
      start = cur;
      prev = cur;
    }
  }
  blocks.push([start, prev]);

  for (const [s, e] of blocks) {
    // TOP boundary
    items.push({ type: "sep-top", key: `sep-top-${s}`, anchor: s });
    // LINES
    for (let i = s; i <= e; i++) {
      const raw = lines[i] ?? "";
      const safe = escapeHtml(raw);
      const html = re
        ? safe.replace(re, (m) => `<mark class="hl">${escapeHtml(m)}</mark>`)
        : safe;
      items.push({ type: "line", key: `line-${i}`, html });
    }
    // BOTTOM boundary
    items.push({ type: "sep-bottom", key: `sep-bottom-${e}`, anchor: e });
  }
  return items;
});
</script>

<style scoped>
/* Basic sensible defaults (works without Tailwind) */
* {
  box-sizing: border-box;
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
.ml-auto {
  margin-left: auto;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
/* button.border and .underline removed as unused */

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

.empty-state {
  padding: 1rem;
  color: #6b7280; /* gray-500 */
}
.modal-content {
  color: #111;
}

.modal-content {
  user-select: text;
}
.ctx-ctl {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.ctx-label {
  font-size: 0.875rem;
  color: #4b5563;
}
.ctx-input {
  width: 4.5rem;
}

mark.hl {
  background: #fde047;
  color: #111;
  padding: 0 0.1em;
  border-radius: 0.2em;
}

.preview-lines {
  padding: 0.25rem 0.75rem;
}
.line-row {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #111;
}

.line-row,
.preview-lines {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
.sep-row {
  display: flex;
  justify-content: center;
  padding: 0.25rem 0;
}
.wavy-sep {
  width: 100%;
  height: 0;
  cursor: pointer;
  border-top: 2px dashed #6b7280;
}
.wavy-sep:hover {
  border-top-color: #374151;
}
</style>
