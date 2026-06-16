import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from "@/features/auth/api/authApi";

const THEME_STORAGE_KEY = "deepria.theme";
const normalizeTheme = (value) => (value === "dark" ? "dark" : "light");

export const useAppStore = defineStore('app', () => {
    // State
    const isLoading = ref(false);
    const theme = ref(normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY)));
    const user = ref(null);
    const providers = ref([]);
    const authReady = ref(false);

    // Actions
    const setLoading = (status) => {
        isLoading.value = status;
    };

    const setTheme = (value) => {
        theme.value = normalizeTheme(value);
        localStorage.setItem(THEME_STORAGE_KEY, theme.value);
    };

    const toggleTheme = () => {
        setTheme(theme.value === 'dark' ? 'light' : 'dark');
    };

    const setSession = (session) => {
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
