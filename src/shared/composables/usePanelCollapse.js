import { ref, watch } from "vue";
import {
  readPreference,
  writePreference,
} from "@/features/appearance/lib/themes";

export function usePanelCollapse(panel) {
  const key = `workspace:${panel}:collapsed`;
  const collapsed = ref(readPreference(key, "false") === "true");
  watch(collapsed, (value) => writePreference(key, String(value)));
  return collapsed;
}
