import { defineStore } from "pinia";
import { ref } from "vue";
import { authApi } from "@/features/auth/api/authApi";
import { useSettingsStore } from "@/features/settings/store/settingsStore";

import {
  DESIGN_STORAGE_KEY,
  MODE_STORAGE_KEY,
  normalizeDesign,
  normalizeMode,
  readPreference,
  writePreference,
} from "@/features/appearance/lib/themes";

export const useAppStore = defineStore("app", () => {
  // State
  const isLoading = ref(false);
  const theme = ref(normalizeMode(readPreference(MODE_STORAGE_KEY, "light")));
  const design = ref(
    normalizeDesign(readPreference(DESIGN_STORAGE_KEY, "editorial")),
  );
  const user = ref(null);
  const providers = ref([]);
  const authReady = ref(false);

  // Actions
  const setLoading = (status) => {
    isLoading.value = status;
  };

  const setTheme = (value) => {
    theme.value = normalizeMode(value);
    writePreference(MODE_STORAGE_KEY, theme.value);
  };

  const setDesign = (value) => {
    design.value = normalizeDesign(value);
    writePreference(DESIGN_STORAGE_KEY, design.value);
  };

  const toggleTheme = () => {
    setTheme(theme.value === "dark" ? "light" : "dark");
  };

  const setSession = (session) => {
    useSettingsStore().setUser(session?.user?.id || null);
    user.value = session?.user || null;
    providers.value = session?.providers || [];
    authReady.value = true;
  };

  const loadSession = async () => {
    try {
      setSession(await authApi.me());
      return user.value;
    } catch (error) {
      if (error.status === 401) {
        try {
          setSession(await authApi.refresh());
          return user.value;
        } catch {
          setSession(null);
          return null;
        }
      }
      setSession(null);
      return null;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setSession(null);
    }
  };

  return {
    isLoading,
    theme,
    design,
    setDesign,
    user,
    providers,
    authReady,
    setLoading,
    setTheme,
    toggleTheme,
    loadSession,
    logout,
    setSession,
  };
});
