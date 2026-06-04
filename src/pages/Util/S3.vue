<template>
  <div class="s3-container">
    <header class="section-header">
      <div class="header-copy">
        <h1 class="page-title">File Storage</h1>
      </div>
      <div class="header-actions">
        <button class="icon-btn-secondary" @click="refreshDirectory" title="Refresh">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        </button>
      </div>
    </header>

    <div class="s3-grid page-content">
      <StorageUploadPanel
        :is-dragging="isDragging"
        @change="handleFileChange"
        @drop="handleDrop"
        @drag-state="isDragging = $event"
      />

      <StorageFileList
        :files="previewableFiles"
        :loading="loading"
        @preview="requestAction($event, 'preview')"
        @download="requestAction($event, 'download')"
        @delete="requestAction($event, 'delete')"
      />
    </div>

    <BaseModal v-model="showUploadModal" title="Upload Settings">
      <div class="form-group">
        <BaseInput
          v-model="customFileName"
          label="File Name (Optional)"
          placeholder="Leave empty to use original name"
        />
        <BaseInput
          v-model="authKey"
          label="Protection Key (Optional)"
          placeholder="Set a password for this file"
          type="password"
        />
        <div class="selected-file-preview" v-if="selectedFile">
          Selected: {{ selectedFile.name }}
        </div>
        <div v-if="uploadTask" class="upload-status-card">
          <div class="upload-info">
            <span>{{ uploadTask.name }}</span>
            <span>{{ uploadTask.progress }}%</span>
          </div>
          <BaseProgressBar :value="uploadTask.progress" />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelUpload" :disabled="isUploading">Cancel</BaseButton>
        <BaseButton variant="primary" @click="upload" :loading="isUploading">Start Upload</BaseButton>
      </template>
    </BaseModal>

    <BaseModal v-model="showAuthModal" title="Security Check">
      <p class="auth-desc">Enter the password for this file:</p>
      <BaseInput v-model="authKeyInput" placeholder="Password" type="password" @enter="confirmAuth" />
      <template #footer>
        <BaseButton variant="secondary" @click="closeAuthPopup">Cancel</BaseButton>
        <BaseButton variant="primary" @click="confirmAuth">Confirm</BaseButton>
      </template>
    </BaseModal>

    <teleport to="body">
      <transition name="image-preview-fade">
        <div
          v-if="imagePreview.visible"
          class="image-preview-backdrop"
          role="dialog"
          aria-modal="true"
          :aria-label="`Preview ${imagePreview.name}`"
          @click="closeImagePreview"
        >
          <button class="image-preview-close" type="button" aria-label="Close preview" @click.stop="closeImagePreview">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img :src="imagePreview.url" :alt="imagePreview.name" class="image-preview-media" @click.stop />
        </div>
      </transition>
    </teleport>

    <BaseModal v-model="textPreview.visible" :title="textPreview.name || 'Preview'">
      <div class="text-preview-container">
        <div v-if="textPreview.loading" class="text-preview-loading">Loading preview...</div>
        <MarkdownViewer
          v-else-if="textPreview.type === 'markdown'"
          :content="textPreview.content"
          custom-class="storage-markdown-preview"
        />
        <pre v-else class="text-preview-body">{{ textPreview.content }}</pre>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { App, message } from "ant-design-vue";
import { onMounted, ref } from "vue";
import { useStorage } from "@/features/storage/composables/useStorage";
import StorageFileList from "@/features/storage/components/StorageFileList.vue";
import StorageUploadPanel from "@/features/storage/components/StorageUploadPanel.vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseModal from "@/shared/ui/BaseModal.vue";
import BaseProgressBar from "@/shared/ui/BaseProgressBar.vue";
import { useDownload } from "@/shared/composables/useDownload";

const { modal } = App.useApp();
const { loading, previewableFiles, loadFiles, uploadFile, getDownloadUrl, getDeleteUrl } = useStorage();
const { downloadFromUrl } = useDownload();

const isDragging = ref(false);
const selectedFile = ref(null);
const customFileName = ref("");
const authKey = ref("");
const authKeyInput = ref("");
const isUploading = ref(false);
const uploadTask = ref(null);
const showUploadModal = ref(false);
const showAuthModal = ref(false);
const imagePreview = ref({
  visible: false,
  url: "",
  name: "",
});
const textPreview = ref({
  visible: false,
  loading: false,
  name: "",
  type: "text",
  content: "",
});
const pendingAction = ref(null);
let resolveAuthPromise = null;

const refreshDirectory = async () => {
  await loadFiles();
  message.success("Refreshed");
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  showUploadModal.value = true;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files?.[0];
  if (!file) return;
  selectedFile.value = file;
  showUploadModal.value = true;
};

const cancelUpload = () => {
  selectedFile.value = null;
  customFileName.value = "";
  authKey.value = "";
  showUploadModal.value = false;
};

const upload = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  uploadTask.value = { name: selectedFile.value.name, progress: 15 };

  try {
    await uploadFile({
      file: selectedFile.value,
      displayName: customFileName.value.trim() || selectedFile.value.name,
      authKey: authKey.value.trim(),
    });
    uploadTask.value = { name: selectedFile.value.name, progress: 100 };
    message.success("Upload complete");
    cancelUpload();
  } catch (error) {
    message.error(error?.userMessage || "Upload failed");
  } finally {
    isUploading.value = false;
    setTimeout(() => {
      uploadTask.value = null;
    }, 1200);
  }
};

function waitForAuthConfirmation() {
  return new Promise((resolve) => {
    resolveAuthPromise = resolve;
    authKeyInput.value = "";
    showAuthModal.value = true;
  });
}

function confirmAuth() {
  showAuthModal.value = false;
  resolveAuthPromise?.(authKeyInput.value);
}

function closeAuthPopup() {
  showAuthModal.value = false;
  resolveAuthPromise?.(null);
}

async function requestAction(file, action) {
  if (action === "preview" && getPreviewType(file) === "unsupported") {
    message.info("미리보기 기능을 사용할 수 없는 파일입니다.");
    return;
  }

  let providedAuthKey = null;
  if (file.has_password) {
    providedAuthKey = await waitForAuthConfirmation();
    if (providedAuthKey === null) return;
  }

  if (action === "preview") {
    const data = await getDownloadUrl(file.key, providedAuthKey);
    await openPreview(file, data.url);
    return;
  }

  if (action === "download") {
    const data = await getDownloadUrl(file.key, providedAuthKey);
    await downloadFromUrl(data.url, file.display_name);
    return;
  }

  pendingAction.value = { file, authKey: providedAuthKey };
  modal.confirm({
    title: "Delete File",
    content: `Delete "${file.display_name}"?`,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    centered: true,
    onOk: async () => {
      const data = await getDeleteUrl(file.key, providedAuthKey);
      await fetch(data.url, { method: "DELETE" });
      await loadFiles();
      message.success("Deleted");
    },
  });
}

async function openPreview(file, url) {
  const previewType = getPreviewType(file);

  if (previewType === "image") {
    imagePreview.value = {
      visible: true,
      url,
      name: file.display_name,
    };
    return;
  }

  textPreview.value = {
    visible: true,
    loading: true,
    name: file.display_name,
    type: previewType,
    content: "",
  };

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Preview failed (${response.status})`);
    const content = await response.text();
    textPreview.value = {
      visible: true,
      loading: false,
      name: file.display_name,
      type: previewType,
      content,
    };
  } catch (error) {
    textPreview.value.visible = false;
    message.error(error?.message || "Preview failed");
  }
}

function closeImagePreview() {
  imagePreview.value = {
    visible: false,
    url: "",
    name: "",
  };
}

function getPreviewType(file) {
  if (file.previewType) return file.previewType;
  const name = file.display_name?.toLowerCase() || "";
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif"].some((ext) => name.endsWith(ext))) {
    return "image";
  }
  if (name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";
  if ([".txt", ".log", ".csv", ".json", ".xml", ".yaml", ".yml"].some((ext) => name.endsWith(ext))) {
    return "text";
  }
  return "unsupported";
}

onMounted(() => {
  loadFiles();
});
</script>

<style scoped>
.s3-container {
  padding: var(--space-6);
  max-width: var(--max-width);
  margin: 0 auto;
  padding-bottom: 120px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.page-title {
  font-size: var(--font-size-hero);
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.s3-grid {
  display: grid;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.selected-file-preview {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  padding: var(--space-3);
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.upload-status-card {
  margin-top: var(--space-2);
}

.upload-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.auth-desc {
  margin-bottom: var(--space-4);
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  /* removed .section-header flex-direction column override */
}
</style>

<style>
.image-preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.82);
  padding: 56px 20px 28px;
}

.image-preview-media {
  display: block;
  max-width: min(100%, 1280px);
  max-height: calc(100dvh - 96px);
  object-fit: contain;
}

.image-preview-close {
  position: fixed;
  top: calc(16px + var(--safe-top));
  right: 16px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-full);
  background: rgba(9, 9, 11, 0.72);
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.image-preview-close:hover {
  background: rgba(24, 24, 27, 0.92);
  border-color: rgba(255, 255, 255, 0.34);
}

.image-preview-fade-enter-active,
.image-preview-fade-leave-active {
  transition: opacity 0.15s ease;
}

.image-preview-fade-enter-from,
.image-preview-fade-leave-to {
  opacity: 0;
}

.text-preview-container {
  min-height: 220px;
  max-height: min(68vh, 760px);
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-base);
}

.text-preview-loading {
  padding: var(--space-6);
  color: var(--color-text-secondary);
}

.text-preview-body {
  margin: 0;
  padding: var(--space-4);
  color: var(--color-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.storage-markdown-preview {
  padding: var(--space-4);
  color: var(--color-text-primary);
}

.storage-markdown-preview p,
.storage-markdown-preview li {
  color: var(--color-text-secondary);
}

.storage-markdown-preview pre {
  padding: var(--space-3);
  overflow: auto;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
}

@media (max-width: 640px) {
  .image-preview-backdrop {
    padding: 56px 12px 24px;
  }

  .image-preview-close {
    right: 12px;
  }
}
</style>
