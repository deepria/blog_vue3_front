import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authApi } from "@/features/auth/api/authApi";

export const useAppStore = defineStore('app', () => {
    // State
    const isLoading = ref(false);
    const theme = ref('dark'); // Default to dark for this design
    const user = ref(null);
    const providers = ref([]);
    const authReady = ref(false);

    // Actions
    const setLoading = (status) => {
        isLoading.value = status;
    };

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
        // Logic to toggle global CSS class could go here
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
                } catch (_) {
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
        toggleTheme,
        loadSession,
        logout,
        setSession,
    };
});
