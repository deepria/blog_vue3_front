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
        :files="files"
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

    <BaseModal v-model="previewVisible" title="Preview">
      <div class="preview-container">
        <img v-if="previewUrl" :src="previewUrl" class="preview-image" />
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
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseModal from "@/shared/ui/BaseModal.vue";
import BaseProgressBar from "@/shared/ui/BaseProgressBar.vue";
import { useDownload } from "@/shared/composables/useDownload";

const { modal } = App.useApp();
const { files, loading, loadFiles, uploadFile, getDownloadUrl, getDeleteUrl } = useStorage();
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
const previewVisible = ref(false);
const previewUrl = ref("");
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
  let providedAuthKey = null;
  if (file.has_password) {
    providedAuthKey = await waitForAuthConfirmation();
    if (providedAuthKey === null) return;
  }

  if (action === "preview") {
    const data = await getDownloadUrl(file.key, providedAuthKey);
    previewUrl.value = data.url;
    previewVisible.value = true;
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

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  border-radius: var(--radius-md);
  object-fit: contain;
}

@media (max-width: 640px) {
  /* removed .section-header flex-direction column override */
}
</style>
