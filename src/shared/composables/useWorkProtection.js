import { onBeforeUnmount } from "vue";
import { protectWork } from "../lib/workProtection.js";
export function useWorkProtection(label, blocked) {
  const release = protectWork(label, blocked);
  onBeforeUnmount(release);
}
