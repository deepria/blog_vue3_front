import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useAppStore } from "@/store/app";
import { useSettingsStore } from "@/features/settings/store/settingsStore";
import { storageApi } from "@/features/storage/api/storageApi";

const DASHBOARD_DIRECTORY_ID = "dashboard";
const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
const SLIDE_INTERVAL_MS = 10_000;

export function useDashboardGallery() {
  const app = useAppStore();
  const settings = useSettingsStore();
  const ready = ref(false);
  let mounted = false;
  let requestId = 0;
  let settingsRequestId = 0;
  const enabled = computed(() =>
    Boolean(
      ready.value &&
      app.user?.id &&
      settings.loaded &&
      settings.dashboardGalleryEnabled,
    ),
  );
  const slides = ref([]);
  const activeIndex = ref(0);
  const loading = ref(false);
  let timerId = null;

  const activeSlide = computed(() => slides.value[activeIndex.value] || null);

  const stopSlideshow = () => {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  };

  const startSlideshow = () => {
    stopSlideshow();
    if (!enabled.value || slides.value.length < 2) return;
    timerId = window.setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % slides.value.length;
    }, SLIDE_INTERVAL_MS);
  };

  const clearGallery = () => {
    requestId += 1;
    stopSlideshow();
    slides.value = [];
    activeIndex.value = 0;
    loading.value = false;
  };

  const refreshGallery = async () => {
    clearGallery();
    if (!mounted || !enabled.value) return;
    const currentRequest = requestId;
    const isCurrent = () =>
      mounted && enabled.value && currentRequest === requestId;
    loading.value = true;
    try {
      const [organization, files] = await Promise.all([
        storageApi.getOrganization(),
        storageApi.listFiles(),
      ]);
      if (!isCurrent()) return;
      const fileLocations = organization?.file_locations || {};
      const imageFiles = files.filter(
        (file) =>
          fileLocations[file.key] === DASHBOARD_DIRECTORY_ID &&
          !file.has_password &&
          IMAGE_EXTENSION.test(file.display_name || ""),
      );
      const gallerySlides = await Promise.all(
        imageFiles.map(async (file) => {
          const download = await storageApi.createDownload({ key: file.key });
          return { id: file.key, name: file.display_name, url: download.url };
        }),
      );
      if (!isCurrent()) return;
      slides.value = gallerySlides;
      activeIndex.value = 0;
    } catch (error) {
      if (isCurrent()) {
        console.warn("Unable to load dashboard gallery", error);
        slides.value = [];
      }
    } finally {
      if (currentRequest === requestId) loading.value = false;
    }
  };

  watch(
    () => slides.value.length,
    () => startSlideshow(),
  );

  const loadPreferences = async () => {
    const currentRequest = ++settingsRequestId;
    ready.value = false;
    clearGallery();
    if (!app.user?.id) return;
    try {
      await settings.loadSettings();
      if (mounted && currentRequest === settingsRequestId) ready.value = true;
    } catch (error) {
      if (mounted && currentRequest === settingsRequestId) {
        console.warn("Unable to load dashboard settings", error);
      }
    }
  };

  watch(
    enabled,
    () => {
      if (enabled.value) refreshGallery();
      else clearGallery();
    },
    { flush: "sync" },
  );
  watch(
    () => app.user?.id,
    () => {
      if (mounted) loadPreferences();
    },
    { flush: "sync" },
  );
  onMounted(() => {
    mounted = true;
    loadPreferences();
  });
  onBeforeUnmount(() => {
    mounted = false;
    settingsRequestId += 1;
    clearGallery();
  });

  return { activeSlide, loading, refreshGallery };
}
