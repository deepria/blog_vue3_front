<script setup>
import * as XLSX from "xlsx";
import { ref, computed } from "vue";

const tableData = ref([]);
const allColumns = ref([]);
const visibleColumnKeys = ref([]);

const sortKey = ref("");
const sortOrder = ref("asc");

const groupedTableData = computed(() => {
  if (
    !tableData.value.length ||
    !allColumns.value.some((col) => col.field === "이용가맹점") ||
    !allColumns.value.some((col) => col.field === "결제 금액")
  ) {
    return tableData.value;
  }

  const map = new Map();

  for (const row of tableData.value) {
    const key = row["이용가맹점"];
    const current = map.get(key) || { ...row, "결제 금액": 0 };

    // Properly parse formatted currency strings like "1,000원"
    const rawValue = String(row["결제 금액"]).replace(/[^\d]/g, "");
    const parsed = Number(rawValue) || 0;
    current["결제 금액"] += parsed;
    map.set(key, current);
  }

  return Array.from(map.values()).sort(
    (a, b) => b["결제 금액"] - a["결제 금액"],
  );
});

const sortedTableData = computed(() => {
  const data = [...groupedTableData.value];
  if (!sortKey.value) return data;

  return data.sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];

    const parseCurrency = (val) =>
      typeof val === "string"
        ? Number(val.replace(/[^\d.-]/g, "")) || 0
        : typeof val === "number"
          ? val
          : 0;

    const aParsed = parseCurrency(aVal);
    const bParsed = parseCurrency(bVal);

    if (!isNaN(aParsed) && !isNaN(bParsed)) {
      return sortOrder.value === "asc" ? aParsed - bParsed : bParsed - aParsed;
    }

    return sortOrder.value === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
});

const columns = computed(() =>
  allColumns.value.filter((col) => visibleColumnKeys.value.includes(col.field)),
);

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const formatCurrency = (val) => {
  if (typeof val !== "number") return val;
  return `${val.toLocaleString()}원`;
};

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

    tableData.value = bodyRows.map((row) => {
      const record = Object.fromEntries(
        headers.map((key, index) => [key, row[index]]),
      );

      // Fix 거래일자 if it's a serial number
      if (record["거래일자"] && typeof record["거래일자"] === "number") {
        const excelDate = new Date(
          Date.UTC(1899, 11, 30) + record["거래일자"] * 86400000,
        );
        record["거래일자"] = excelDate.toISOString().split("T")[0];
      }

      const currencyFields = [
        "결제 금액",
        "거래금액",
        "수수료(이자)",
        "결제 후 잔액",
      ];
      for (const field of currencyFields) {
        if (record[field] !== undefined && record[field] !== "") {
          const num = Number(record[field]) || 0;
          record[field] = `${num.toLocaleString()}원`;
        }
      }

      if (record["이용개월"] !== undefined && record["이용개월"] !== "") {
        record["이용개월"] = `${record["이용개월"]}개월`;
      }

      if (record["청구회차"] !== undefined && record["청구회차"] !== "") {
        record["청구회차"] = `${record["청구회차"]}회`;
      }

      return record;
    });
    allColumns.value = headers.map((key) => ({ label: key, field: key }));
    const initiallyHidden = [
      "거래일자",
      "이용카드",
      "적립예정마이신한포인트율",
      "사용포인트",
      "수수료(이자)",
      "거래금액",
      "결제 후 잔액",
      "거래구분",
      "이용개월",
      "청구회차",
    ];
    visibleColumnKeys.value = headers.filter(
      (key) => !initiallyHidden.includes(key),
    );
  };
  reader.readAsArrayBuffer(file);
};
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">×ls 사용내역 업로드 및 포탈변경</h1>

    <input
      type="file"
      @change="handleFileUpload"
      accept=".xls,.xlsx,.csv"
      class="mb-4"
    />

    <div
      v-if="allColumns.length"
      class="mb-4 column-selector p-3 border border-white flex flex-col gap-1"
    >
      <label
        v-for="col in allColumns"
        :key="col.field"
        class="text-sm flex items-center gap-1"
      >
        <input type="checkbox" :value="col.field" v-model="visibleColumnKeys" />
        {{ col.label }}
      </label>
    </div>

    <div class="overflow-auto">
      <table class="min-w-full table-auto border border-white">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.field"
              class="text-left px-4 py-2 border border-white cursor-pointer select-none"
              @click="handleSort(col.field)"
            >
              {{ col.label }}
              <span v-if="sortKey === col.field">
                {{ sortOrder === "asc" ? "🔼" : "🔽" }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in sortedTableData"
            :key="rowIndex"
            class="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700 border-b border-white"
          >
            <td
              v-for="col in columns"
              :key="col.field"
              :class="[
                'px-4 py-2 border border-white',
                col.field === '결제 금액' ? 'text-right' : '',
              ]"
            >
              {{
                col.field === "결제 금액"
                  ? formatCurrency(row[col.field])
                  : row[col.field]
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

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

.column-selector {
  border: 1px solid white;
}
</style>
