<template>
  <div class="index-page">
    <h1 class="title">
      <transition :name="dir.what" mode="out-in">
        <span :key="idx.what" class="fix" :style="{ width: maxWhatLen + 'em' }">
          {{ what[idx.what] }}
        </span>
      </transition>
      <transition :name="dir.does" mode="out-in">
        <span :key="idx.does" class="fix" :style="{ width: maxDoesLen + 'em' }">
          {{ does[idx.does] }}
        </span>
      </transition>
    </h1>

    <div class="danmaku-container">
      <div
        v-for="a in active"
        :key="a.item.id"
        class="danmaku"
        :ref="(el) => (danmakuRefs[a.item.id] = el)"
        :style="{
          top: `${a.line * GAP}%`,
          background: `${a.item.color + 80}`,
        }"
        @click="onClickLine(a)"
      >
        <span
          class="priority-icon"
          :class="{
            'text-red': a.item.priority === 'high',
            'text-yellow': a.item.priority === 'medium',
            'text-green': a.item.priority === 'low',
          }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </span>
        &nbsp;{{ a.item.text }}
      </div>
    </div>

    <div v-if="selected" class="detail-modal" @click.self="selected = null">
      <div class="detail-content">
        <h2>상세 정보</h2>
        <p>{{ selected.text }}</p>
        <button @click="selected = null">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { getData } from "@/services/dynamoService.js";
import { animate, createDraggable, utils } from "animejs";

// Constants
const GAP = 8;
const NUM_LINE = Math.floor(100 / GAP);
const MIN_DUR = 6;
const MAX_DUR = 12;
const VH = window.innerHeight;

const randDur = () =>
  +(Math.random() * (MAX_DUR - MIN_DUR) + MIN_DUR).toFixed(2);

const blobs = ["", "", "", "", "", "", "", "", "", "", "", ""];

// Data
const what = ref(["그것", "순간", "영감", "아이디어", "문도"]);
const does = ref(["저장한다.", "기억한다.", "기록한다.", "정리한다."]);

const idx = reactive({ what: 0, does: 0 });
const dir = reactive({ what: "slide-down", does: "slide-down" });

const items = ref([]);
const lineQueues = ref(Array.from({ length: NUM_LINE }, () => []));
const active = ref([]);
const danmakuRefs = reactive({});
const selected = ref(null);

// Lifecycle
onMounted(async () => {
  items.value = await getData("todo", "todo");
  initQueues();
  setInterval(shuffleTitle, 1500);
});

// Computed
const maxWhatLen = computed(
  () => Math.max(...what.value.map((s) => s.length)) * 1.1,
);
const maxDoesLen = computed(
  () => Math.max(...does.value.map((s) => s.length)) * 1.1,
);

// Functions
function shuffleTitle() {
  ["what", "does"].forEach((k) => {
    const list = k === "what" ? what.value : does.value;
    const next = Math.floor(Math.random() * list.length);
    dir[k] = next > idx[k] ? "slide-down" : next < idx[k] ? "slide-up" : dir[k];
    idx[k] = next;
  });
}

function initQueues() {
  lineQueues.value.forEach((q) => (q.length = 0));
  items.value.forEach((it, i) => lineQueues.value[i % NUM_LINE].push(it));
  for (let l = 0; l < NUM_LINE; l++) startNext(l);
}

function startNext(line) {
  const q = lineQueues.value[line];
  if (!q.length) return;
  const item = q.shift();
  active.value.push({ item, line });
  nextTick(() => {
    createRandomAnimation(item, line);
  });
}

function handleEnd(line, id) {
  const pos = active.value.findIndex((a) => a.item.id === id);
  if (pos > -1) {
    const [finished] = active.value.splice(pos, 1);
    lineQueues.value[line].push(finished.item);
  }
  startNext(line);
}

function onClickLine(a) {
  const el = danmakuRefs[a.item.id];
  if (el.ani.paused) {
    el.ani.play();
  } else {
    el.ani.pause();
  }
  utils.set(el, { z: 100 });
  createDraggable(el, {
    x: { mapTo: "rotateY", modifier: utils.wrap(-128, 128) },
    y: { mapTo: "z" },
  });
}

function createRandomAnimation(item, line) {
  const el = danmakuRefs[item.id];
  if (!el) return;
  const du = Math.floor(Math.random() * 4001) + 4000;
  const r = Math.floor(Math.random() * 4);
  switch (r) {
    case 0:
      el.ani = animate(el, {
        x: { from: "100vw", to: "-100vw" },
        y: {
          to: "50vw",
          modifier: (v) => Math.cos(v) / 2, // Specific modifier to y property
        },
        duration: du,
        onComplete: () => {
          handleEnd(line, item.id);
        },
      });
      break;
    case 1:
      el.ani = animate(el, {
        x: { from: "100vw", to: "5vw" },
        duration: 400,
        onComplete: () => {
          setTimeout(() => {
            handleEnd(line, item.id);
          }, 1500);
        },
      });
      break;
    case 2:
      el.ani = animate(el, {
        x: { from: "100vw", to: "-100vw" },
        duration: du,
        onComplete: () => {
          handleEnd(line, item.id);
        },
      });
      break;
    case 3:
      el.ani = animate(el, {
        rotate: {
          to: 360,
          duration: 1500,
        },
        x: { from: "100vw", to: "-100vw" },
        y: {
          to: "50vw",
          modifier: (v) => Math.cos(v) / 2, // Specific modifier to y property
        },
        duration: du,
        onComplete: () => {
          handleEnd(line, item.id);
        },
      });
      break;
  }
}
</script>

<style scoped>
.index-page {
  position: relative;
  overflow: hidden;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #f0f0f0;
  z-index: 900;
}

.fix {
  white-space: nowrap;
  vertical-align: top;
  display: inline-block;
  text-align: center;
  overflow: hidden;
}

.danmaku-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 800;
}

.danmaku {
  display: flex;
  position: absolute;
  //left: 100%;
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 1.1rem;
  pointer-events: auto;
  cursor: pointer;
}

.priority-icon.text-red {
  color: #e63946;
}

.priority-icon.text-yellow {
  color: #f1c40f;
}

.priority-icon.text-green {
  color: #2ecc71;
}

.detail-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.detail-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 90%;
}

/* Title transition animations */
.slide-down-enter-active,
.slide-down-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.4s,
    opacity 0.4s;
}
.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}
.slide-down-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

<style>
@keyframes moveLeft {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}
</style>
