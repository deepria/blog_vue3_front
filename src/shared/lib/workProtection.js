import { computed, shallowReactive } from "vue";

const guards = shallowReactive(new Map());
export const blockingWork = computed(() =>
  [...guards.values()]
    .filter((guard) => guard.blocked())
    .map((guard) => guard.label),
);
export function protectWork(label, blocked) {
  const key = Symbol(label);
  guards.set(key, { label, blocked });
  return () => guards.delete(key);
}
export async function applyWhenIdle(apply) {
  if (blockingWork.value.length || !apply) return false;
  await apply(true);
  return true;
}
