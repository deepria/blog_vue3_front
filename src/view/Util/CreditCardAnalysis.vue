<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">×ls 사용내역 업로드 및 포탈변경</h1>

    <input
      type="file"
      @change="handleFileUpload"
      accept=".xls,.xlsx,.csv"
      class="mb-4"
    />

    <div v-if="allColumns.length" class="mb-4 flex flex-wrap gap-3">
      <label
        v-for="col in allColumns"
        :key="col.field"
        class="text-sm flex items-center gap-1"
      >
        <input type="checkbox" :value="col.field" v-model="visibleColumnKeys" />
        {{ col.label }}
      </label>
    </div>

    <vue-good-table
      v-if="tableData.length > 1"
      :columns="columns"
      :rows="groupedTableData"
      :search-options="{ enabled: true }"
      :pagination-options="{ enabled: true, perPage: tableData.length || 1000 }"
      theme="nocturnal"
    />
  </div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { getCurrentInstance, ref, computed } from "vue";
import "vue-good-table-next/dist/vue-good-table-next.css";
import { VueGoodTable } from "vue-good-table-next";

const tableData = ref([]);
const tableColumns = ref([]);
const allColumns = ref([]);
const visibleColumnKeys = ref([]);

const columns = computed(() =>
  allColumns.value.filter((col) => visibleColumnKeys.value.includes(col.field)),
);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    if (rawData.length < 3) return;

    const headers = rawData[2];
    const bodyRows = rawData.slice(3);

    tableData.value = bodyRows.map((row) =>
      Object.fromEntries(headers.map((key, index) => [key, row[index]])),
    );
    tableColumns.value = headers;
    allColumns.value = headers.map((key) => ({ label: key, field: key }));
    const initiallyHidden = [
      "거래일자",
      "이용카드",
      "적립예정마이신한포인트율",
      "사용포인트",
      "수수료(이자)",
      "결제 금액",
      "결제 후 잔액",
      "거래구분",
    ];
    visibleColumnKeys.value = headers.filter(
      (key) => !initiallyHidden.includes(key),
    );
  };
  reader.readAsArrayBuffer(file);
};

const app = getCurrentInstance();
if (app) {
  app.appContext.app.component("VueGoodTable", VueGoodTable);
}

const groupedTableData = computed(() => {
  if (
    !tableData.value.length ||
    !tableColumns.value.includes("이용가맹점") ||
    !tableColumns.value.includes("거래금액")
  ) {
    return tableData.value;
  }

  const map = new Map();

  for (const row of tableData.value) {
    const key = row["이용가맹점"];
    const current = map.get(key) || { ...row, 거래금액: 0 };

    current["거래금액"] += Number(row["거래금액"]) || 0;
    map.set(key, current);
  }

  return Array.from(map.values());
});
</script>

<style scoped>
th,
td {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .p-6 {
    padding: 1rem;
  }

  h1 {
    font-size: 1.25rem;
  }

  table {
    font-size: 0.875rem;
  }

  .overflow-auto {
    overflow-x: auto;
  }

  th,
  td {
    padding: 0.5rem;
  }
}
</style>
