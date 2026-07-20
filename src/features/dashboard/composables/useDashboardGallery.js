import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { storageApi } from "@/features/storage/api/storageApi";

const DASHBOARD_DIRECTORY_ID = "dashboard";
const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;
const SLIDE_INTERVAL_MS = 10_000;

export function useDashboardGallery() {
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
    if (slides.value.length < 2) return;
    timerId = window.setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % slides.value.length;
    }, SLIDE_INTERVAL_MS);
  };

  const refreshGallery = async () => {
    loading.value = true;
    try {
      const [organization, files] = await Promise.all([
        storageApi.getOrganization(),
        storageApi.listFiles(),
      ]);
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
      slides.value = gallerySlides;
      activeIndex.value = 0;
    } catch (error) {
      console.warn("Unable to load dashboard gallery", error);
      slides.value = [];
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => slides.value.length,
    () => startSlideshow(),
  );

  onMounted(refreshGallery);
  onBeforeUnmount(stopSlideshow);

  return { activeSlide, loading, refreshGallery };
}
