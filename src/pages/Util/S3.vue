<template>
  <PageShell class="s3-container" title="File Storage" eyebrow="Vault">
    <template #actions>
      <button
        class="icon-btn-secondary"
        @click="refreshDirectory"
        title="Refresh"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path
            d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          ></path>
        </svg>
      </button>
    </template>

    <div class="s3-grid page-content">
      <div class="storage-tabs" role="tablist" aria-label="Storage view">
        <button
          type="button"
          role="tab"
          :aria-selected="viewMode === 'owned'"
          :class="{ active: viewMode === 'owned' }"
          @click="viewMode = 'owned'"
        >
          My files
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="viewMode === 'shared'"
          :class="{ active: viewMode === 'shared' }"
          @click="viewMode = 'shared'"
        >
          Shared with me
          <span v-if="previewableSharedFiles.length" class="tab-count">
            {{ previewableSharedFiles.length }}
          </span>
        </button>
      </div>

      <StorageUploadPanel
        v-if="viewMode === 'owned'"
        :is-dragging="isDragging"
        @change="handleFileChange"
        @drop="handleDrop"
        @drag-state="isDragging = $event"
      />

      <div
        class="storage-workspace"
        :class="{ 'shared-workspace': viewMode === 'shared' }"
      >
        <StorageDirectoryTree
          v-if="viewMode === 'owned'"
          :directories="organization.directories"
          :selected-id="selectedDirectoryId"
          :file-counts="directoryFileCounts"
          :total-files="previewableFiles.length"
          :unassigned-count="unassignedFiles.length"
          @create="createDirectory"
          @rename="renameDirectory"
          @delete="deleteDirectory"
          @select="selectedDirectoryId = $event"
          @move-file="moveFileToDirectory"
        />

        <StorageFileList
          :files="visibleFiles"
          :loading="viewMode === 'owned' ? loading : sharedLoading"
          :empty-text="
            viewMode === 'owned'
              ? 'No files uploaded yet'
              : 'No files have been shared with you'
          "
          @preview="requestAction($event, 'preview')"
          @download="requestAction($event, 'download')"
          @share="openShareModal"
          @delete="requestAction($event, 'delete')"
        />
      </div>
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
        <BaseButton
          variant="secondary"
          @click="cancelUpload"
          :disabled="isUploading"
          >Cancel</BaseButton
        >
        <BaseButton variant="primary" @click="upload" :loading="isUploading"
          >Start Upload</BaseButton
        >
      </template>
    </BaseModal>

    <BaseModal
      v-model="showShareModal"
      :title="shareTarget ? `Share ${shareTarget.display_name}` : 'Share file'"
      @close="closeShareModal"
    >
      <div class="share-form">
        <BaseInput
          v-model="shareEmail"
          label="Registered user email"
          placeholder="name@example.com"
          type="email"
          :disabled="sharing"
          @enter="addViewer"
        />
        <BaseButton
          variant="primary"
          :loading="sharing"
          :disabled="!shareEmail.trim()"
          @click="addViewer"
        >
          Add viewer
        </BaseButton>
      </div>

      <div class="viewer-section">
        <p class="viewer-section-title">People with access</p>
        <p v-if="viewersLoading" class="viewer-empty">Loading...</p>
        <p v-else-if="fileViewers.length === 0" class="viewer-empty">
          Only you can access this file.
        </p>
        <div v-else class="viewer-list">
          <div
            v-for="viewer in fileViewers"
            :key="viewer.viewer_id"
            class="viewer-row"
          >
            <div class="viewer-details">
              <strong>{{ viewer.viewer_name }}</strong>
              <span>{{ viewer.viewer_email }}</span>
            </div>
            <BaseButton variant="ghost" size="sm" @click="removeViewer(viewer)">
              Remove
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-model="showAuthModal" title="Security Check">
      <p class="auth-desc">Enter the password for this file:</p>
      <BaseInput
        v-model="authKeyInput"
        placeholder="Password"
        type="password"
        @enter="confirmAuth"
      />
      <template #footer>
        <BaseButton variant="secondary" @click="closeAuthPopup"
          >Cancel</BaseButton
        >
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
          <button
            class="image-preview-close"
            type="button"
            aria-label="Close preview"
            @click.stop="closeImagePreview"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            :src="imagePreview.url"
            :alt="imagePreview.name"
            class="image-preview-media"
            @click.stop
          />
        </div>
      </transition>
    </teleport>

    <BaseModal
      v-model="textPreview.visible"
      :title="textPreview.name || 'Preview'"
    >
      <div class="text-preview-container">
        <div v-if="textPreview.loading" class="text-preview-loading">
          Loading preview...
        </div>
        <MarkdownViewer
          v-else-if="textPreview.type === 'markdown'"
          :content="textPreview.content"
          custom-class="storage-markdown-preview"
        />
        <pre v-else class="text-preview-body">{{ textPreview.content }}</pre>
      </div>
    </BaseModal>
  </PageShell>
</template>

<script setup>
import { App, message } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import { useStorage } from "@/features/storage/composables/useStorage";
import { storageApi } from "@/features/storage/api/storageApi";
import StorageFileList from "@/features/storage/components/StorageFileList.vue";
import StorageDirectoryTree from "@/features/storage/components/StorageDirectoryTree.vue";
import StorageUploadPanel from "@/features/storage/components/StorageUploadPanel.vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseModal from "@/shared/ui/BaseModal.vue";
import BaseProgressBar from "@/shared/ui/BaseProgressBar.vue";
import { useDownload } from "@/shared/composables/useDownload";
import PageShell from "@/shared/ui/PageShell.vue";
import { getPreviewType } from "@/features/storage/lib/filePresentation";
import {
  collectDirectoryIds,
  DASHBOARD_DIRECTORY,
  normalizeOrganization,
} from "@/features/storage/lib/organization";

const { modal } = App.useApp();
const {
  loading,
  sharedLoading,
  previewableFiles,
  previewableSharedFiles,
  loadFiles,
  loadSharedFiles,
  uploadFile,
  getDownloadUrl,
  getDeleteUrl,
} = useStorage();
const { downloadFromUrl } = useDownload();

const isDragging = ref(false);
const viewMode = ref("owned");
const selectedFile = ref(null);
const customFileName = ref("");
const authKey = ref("");
const authKeyInput = ref("");
const isUploading = ref(false);
const uploadTask = ref(null);
const showUploadModal = ref(false);
const showAuthModal = ref(false);
const showShareModal = ref(false);
const shareTarget = ref(null);
const shareEmail = ref("");
const fileViewers = ref([]);
const viewersLoading = ref(false);
const sharing = ref(false);
const selectedDirectoryId = ref("all");
const organization = ref({
  directories: [],
  file_locations: {},
});
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

const knownFileKeys = computed(
  () => new Set(previewableFiles.value.map((file) => file.key)),
);

const unassignedFiles = computed(() =>
  previewableFiles.value.filter(
    (file) => !organization.value.file_locations[file.key],
  ),
);

const visibleFiles = computed(() => {
  if (viewMode.value === "shared") return previewableSharedFiles.value;
  if (selectedDirectoryId.value === "all") return previewableFiles.value;
  if (selectedDirectoryId.value === "unassigned") return unassignedFiles.value;
  return previewableFiles.value.filter(
    (file) =>
      organization.value.file_locations[file.key] === selectedDirectoryId.value,
  );
});

const directoryFileCounts = computed(() => {
  const counts = {};
  organization.value.directories.forEach((directory) => {
    counts[directory.id] = 0;
  });
  Object.entries(organization.value.file_locations).forEach(
    ([key, directoryId]) => {
      if (!knownFileKeys.value.has(key) || !directoryId) return;
      counts[directoryId] = (counts[directoryId] || 0) + 1;
    },
  );
  return counts;
});

const refreshDirectory = async () => {
  await Promise.all([loadFiles(), loadSharedFiles(), loadOrganization()]);
  message.success("Refreshed");
};

const openShareModal = async (file) => {
  shareTarget.value = file;
  shareEmail.value = "";
  fileViewers.value = [];
  showShareModal.value = true;
  viewersLoading.value = true;
  try {
    fileViewers.value = await storageApi.listFileViewers(file.key);
  } catch (error) {
    message.error(error?.userMessage || "Could not load sharing settings");
  } finally {
    viewersLoading.value = false;
  }
};

const closeShareModal = () => {
  showShareModal.value = false;
  shareTarget.value = null;
  shareEmail.value = "";
  fileViewers.value = [];
};

const addViewer = async () => {
  const email = shareEmail.value.trim();
  if (!email || !shareTarget.value || sharing.value) return;
  sharing.value = true;
  try {
    const viewer = await storageApi.shareFile(shareTarget.value.key, email);
    const existingIndex = fileViewers.value.findIndex(
      (item) => item.viewer_id === viewer.viewer_id,
    );
    if (existingIndex >= 0) {
      fileViewers.value.splice(existingIndex, 1, viewer);
    } else {
      fileViewers.value.push(viewer);
    }
    shareEmail.value = "";
    message.success("File shared");
  } catch (error) {
    message.error(error?.userMessage || "Could not share file");
  } finally {
    sharing.value = false;
  }
};

const removeViewer = async (viewer) => {
  if (!shareTarget.value) return;
  try {
    await storageApi.unshareFile(shareTarget.value.key, viewer.viewer_id);
    fileViewers.value = fileViewers.value.filter(
      (item) => item.viewer_id !== viewer.viewer_id,
    );
    message.success("Access removed");
  } catch (error) {
    message.error(error?.userMessage || "Could not remove access");
  }
};

const loadOrganization = async () => {
  const loadedOrganization = normalizeOrganization(
    await storageApi.getOrganization(),
  );
  const hasDashboardDirectory = loadedOrganization.directories.some(
    (directory) => directory.id === DASHBOARD_DIRECTORY.id,
  );
  if (hasDashboardDirectory) {
    organization.value = loadedOrganization;
    return;
  }
  await saveOrganization({
    ...loadedOrganization,
    directories: [DASHBOARD_DIRECTORY, ...loadedOrganization.directories],
  });
};

const saveOrganization = async (nextOrganization) => {
  organization.value = normalizeOrganization(
    await storageApi.saveOrganization(nextOrganization),
  );
};

const createDirectory = async () => {
  const sortOrder = organization.value.directories.length + 1;
  const nextDirectory = {
    id: `dir_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: "New folder",
    parent_id: null,
    sort_order: sortOrder,
  };
  await saveOrganization({
    ...organization.value,
    directories: [...organization.value.directories, nextDirectory],
  });
  selectedDirectoryId.value = nextDirectory.id;
  message.success("Folder added");
};

const renameDirectory = async ({ id, name }) => {
  await saveOrganization({
    ...organization.value,
    directories: organization.value.directories.map((directory) =>
      directory.id === id ? { ...directory, name } : directory,
    ),
  });
};

const deleteDirectory = async (id) => {
  const target = organization.value.directories.find(
    (directory) => directory.id === id,
  );
  if (!target) return;
  modal.confirm({
    title: "Delete Folder",
    content: `Delete "${target.name}"? Files will remain in storage.`,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    centered: true,
    onOk: async () => {
      const directoryIds = collectDirectoryIds(
        organization.value.directories,
        id,
      );
      const fileLocations = { ...organization.value.file_locations };
      Object.entries(fileLocations).forEach(([key, directoryId]) => {
        if (directoryIds.has(directoryId)) {
          delete fileLocations[key];
        }
      });
      await saveOrganization({
        directories: organization.value.directories.filter(
          (directory) => !directoryIds.has(directory.id),
        ),
        file_locations: fileLocations,
      });
      if (directoryIds.has(selectedDirectoryId.value)) {
        selectedDirectoryId.value = "unassigned";
      }
      message.success("Folder deleted");
    },
  });
};

const moveFileToDirectory = async ({ fileKey, directoryId }) => {
  if (!knownFileKeys.value.has(fileKey)) return;
  const fileLocations = { ...organization.value.file_locations };
  if (directoryId) {
    fileLocations[fileKey] = directoryId;
  } else {
    delete fileLocations[fileKey];
  }
  await saveOrganization({
    ...organization.value,
    file_locations: fileLocations,
  });
  message.success(directoryId ? "Moved to folder" : "Moved to unassigned");
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
    const uploadedFile = await uploadFile({
      file: selectedFile.value,
      displayName: customFileName.value.trim() || selectedFile.value.name,
      authKey: authKey.value.trim(),
      onProgress: (progress) => {
        uploadTask.value = { name: selectedFile.value.name, progress };
      },
    });
    if (
      selectedDirectoryId.value !== "all" &&
      selectedDirectoryId.value !== "unassigned"
    ) {
      await moveFileToDirectory({
        fileKey: uploadedFile.key,
        directoryId: selectedDirectoryId.value,
      });
    }
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
  if (
    action === "preview" &&
    (file.previewType || getPreviewType(file.display_name)) === "unsupported"
  ) {
    message.info("미리보기 기능을 사용할 수 없는 파일입니다.");
    return;
  }

  let providedAuthKey = null;
  if (file.has_password) {
    providedAuthKey = await waitForAuthConfirmation();
    if (providedAuthKey === null) return;
  }

  if (action === "preview") {
    const data = await getDownloadUrl(file.key, providedAuthKey, file.owner_id);
    await openPreview(file, data.url);
    return;
  }

  if (action === "download") {
    const data = await getDownloadUrl(file.key, providedAuthKey, file.owner_id);
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
      await Promise.all([loadFiles(), loadOrganization()]);
      message.success("Deleted");
    },
  });
}

async function openPreview(file, url) {
  const previewType = file.previewType || getPreviewType(file.display_name);

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

onMounted(() => {
  Promise.all([loadFiles(), loadSharedFiles(), loadOrganization()]);
});
</script>

<style scoped>
.s3-container {
  display: block;
}

.s3-grid {
  display: grid;
  gap: var(--space-4);
  align-items: start;
}

.s3-grid > * {
  min-width: 0;
}

.storage-tabs {
  display: inline-flex;
  width: fit-content;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
}

.storage-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: calc(var(--radius-md) - 3px);
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 650;
  cursor: pointer;
}

.storage-tabs button.active {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.tab-count {
  min-width: 19px;
  padding: 1px 5px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, currentColor 15%, transparent);
  font-size: 11px;
}

.storage-workspace {
  display: grid;
  grid-template-columns: minmax(240px, 0.38fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}

.storage-workspace > * {
  min-width: 0;
}

.storage-workspace.shared-workspace {
  grid-template-columns: minmax(0, 1fr);
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

.share-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: var(--space-3);
}

.viewer-section {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.viewer-section-title {
  margin: 0 0 var(--space-3);
  font-weight: 700;
}

.viewer-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.viewer-list {
  display: grid;
  gap: var(--space-2);
}

.viewer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
}

.viewer-details {
  display: grid;
  min-width: 0;
}

.viewer-details strong,
.viewer-details span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-details span {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

@media (max-width: 640px) {
  .s3-container :deep(.page-shell-header) {
    align-items: center;
    flex-direction: row;
    gap: 12px;
  }

  .s3-container :deep(.page-shell-actions) {
    flex-shrink: 0;
    justify-content: flex-end;
  }

  .s3-grid {
    grid-template-columns: 1fr;
  }

  .storage-workspace {
    grid-template-columns: 1fr;
  }

  .storage-tabs {
    width: 100%;
  }

  .storage-tabs button {
    flex: 1;
    justify-content: center;
  }

  .share-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .s3-grid {
    grid-template-columns: 1fr;
  }

  .storage-workspace {
    grid-template-columns: 1fr;
  }
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
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
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
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    monospace;
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
