import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    // State
    const isLoading = ref(false);
    const theme = ref('dark'); // Default to dark for this design
    const user = ref({ name: 'Developer', role: 'Admin' }); // Mock user

    // Actions
    const setLoading = (status) => {
        isLoading.value = status;
    };

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
        // Logic to toggle global CSS class could go here
    };

    return {
        isLoading,
        theme,
        user,
        setLoading,
        toggleTheme
    };
});
