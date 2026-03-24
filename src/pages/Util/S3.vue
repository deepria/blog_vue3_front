<template>
  <div class="s3-container">
    <header class="section-header">
      <div class="header-copy">
        <h1 class="page-title">File Storage</h1>
      </div>
      <div class="header-actions">
        <BaseButton class="header-icon-btn" variant="ghost" @click="refreshDirectory">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        </BaseButton>
      </div>
    </header>

    <transition name="page-section" appear>
      <div v-if="contentVisible" class="s3-grid page-content">
      <BaseCard class="upload-panel" hoverable>
        <template #header>
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Upload Zone</h3>
              <p class="panel-subtitle">Drop a file here or tap to choose one</p>
            </div>
            <span class="panel-chip">Encrypted</span>
          </div>
        </template>

        <div
          class="upload-zone"
          :class="{ 'is-dragging': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerUpload"
        >
          <div class="upload-content">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p class="upload-title"><strong>Click to upload</strong> or drag and drop</p>
            <p class="sub-text">Supports all file types and optional protection keys</p>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            style="display: none"
          />
        </div>

        <transition name="fade">
          <div v-if="uploadTask" class="upload-status-card">
            <div class="upload-info">
              <span>{{ uploadTask.name }}</span>
              <span>{{ uploadTask.progress }}%</span>
            </div>
            <BaseProgressBar :value="uploadTask.progress" />
          </div>
        </transition>
      </BaseCard>

      <BaseCard class="library-panel">
        <template #header>
          <div class="panel-header">
            <div>
              <h3 class="panel-title">File Library</h3>
              <p class="panel-subtitle">{{ loading ? 'Loading files...' : `${directory.length} files available` }}</p>
            </div>
          </div>
        </template>

        <div v-if="loading" class="grid-skeleton">
          <BaseSkeleton v-for="i in 6" :key="i" height="86px" shape="rect" />
        </div>

        <div v-else-if="directory.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p>No files uploaded yet</p>
        </div>

        <div v-else class="file-grid">
          <BaseCard
            v-for="(file, index) in directory"
            :key="index"
            class="file-card"
            hoverable
          >
            <div class="file-item-row">
              <div class="file-icon-wrapper" @click="handleAuth(file, 'preview')">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="file-details">
                <div class="file-name" :title="truncateFileName(file)">
                  {{ truncateFileName(file) }}
                </div>
                <div class="file-actions">
                  <button class="icon-text-btn" @click.stop="handleAuth(file, 'preview')">Preview</button>
                  <div class="divider">|</div>
                  <button class="icon-text-btn" @click.stop="handleAuth(file, 'download')">Download</button>
                  <div class="divider">|</div>
                  <button class="icon-text-btn danger" @click.stop="handleAuth(file, 'remove')">Delete</button>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </BaseCard>
      </div>
    </transition>

    <!-- Upload Settings Modal -->
    <BaseModal v-model="showPopup" title="Upload Settings">
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
                Selected: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </div>
        </div>
        <template #footer>
            <BaseButton variant="secondary" @click="cancelUpload">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="isUploading" @click="upload">Start Upload</BaseButton>
        </template>
    </BaseModal>

    <!-- Auth Confirmation Modal -->
    <BaseModal v-model="showAuthPopup" title="Security Check">
        <p class="auth-desc">Enter the password for this file:</p>
        <BaseInput 
            v-model="authKeyInput" 
            placeholder="Password" 
            type="password"
            @keyup.enter="confirmAuth"
        />
        <template #footer>
            <BaseButton variant="secondary" @click="closeAuthPopup">Cancel</BaseButton>
            <BaseButton variant="primary" @click="confirmAuth">Confirm</BaseButton>
        </template>
    </BaseModal>

    <!-- Image Preview Modal -->
    <BaseModal v-model="visible" title="Preview">
        <div class="preview-container">
            <img v-if="src" :src="src" class="preview-image" />
        </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { compressAndEncode, decodeAndDecompress } from "@/utils/compressor.js";
import { getData, postData, deleteData } from "@/services/dynamoService.js";
import { load, uploadToS3, downloadFromS3, previewFromS3, deleteFromS3 } from "@/services/s3Service.js";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseCard from "@/components/layout/BaseCard.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSkeleton from "@/components/base/BaseSkeleton.vue";
import BaseProgressBar from "@/components/base/BaseProgressBar.vue";
import { message, App } from "ant-design-vue";

// State
const directory = ref([]);
const loading = ref(true);
const isDragging = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const uploadTask = ref(null); 
const isUploading = ref(false);
const { modal } = App.useApp();

// Modals
const showPopup = ref(false);
const showAuthPopup = ref(false);
const visible = ref(false);
const src = ref("");

// Inputs
const customFileName = ref("");
const authKey = ref("");
const authKeyInput = ref("");
const contentVisible = ref(false);

let resolveAuthPromise = null;

// Methods
const loadDirectory = async () => {
    // Only show skeleton on init
    if(directory.value.length === 0) loading.value = true;
    try {
        const response = await load();        
        directory.value = response.data.files.map(file => file.replace("upload/", ""));
    } catch (error) {
        console.error("Directory load error:", error);
        message.error("Failed to load files");
    } finally {
        loading.value = false;
    }
};

const refreshDirectory = async () => {
    await loadDirectory();
    message.success("Refreshed");
};

const triggerUpload = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
        selectedFile.value = event.target.files[0];
        showPopup.value = true;
    }
};

const handleDrop = (event) => {
    isDragging.value = false;
    if (event.dataTransfer.files.length > 0) {
        selectedFile.value = event.dataTransfer.files[0];
        showPopup.value = true;
    }
};

const cancelUpload = () => {
    selectedFile.value = null;
    authKey.value = "";
    customFileName.value = "";
    showPopup.value = false;
};

const upload = async () => {
    if (!selectedFile.value) return;
    
    isUploading.value = true;
    uploadTask.value = { name: selectedFile.value.name, progress: 0 };
    
    try {
        const originalName = selectedFile.value.name;
        // Logic from original S3.vue
        const extMatch = originalName.match(/\.[^./\\]+$/);
        const originalExt = extMatch ? extMatch[0] : "";
        let displayName = customFileName.value.trim() || originalName;
        
        if (customFileName.value.trim() && !displayName.includes(".") && originalExt) {
            displayName = `${displayName}${originalExt}`;
        }

        const baseName = compressAndEncode(displayName);
        const uuid = crypto.randomUUID();
        const newFileName = `${uuid}_${baseName}`;
        const newFile = new File([selectedFile.value], newFileName, {
            type: selectedFile.value.type,
            lastModified: selectedFile.value.lastModified,
        });

        // Mock Progress
        const interval = setInterval(() => {
           if (uploadTask.value && uploadTask.value.progress < 90) uploadTask.value.progress += 10;
        }, 200);

        const response = await uploadToS3(newFile);
        
        clearInterval(interval);
        if(uploadTask.value) uploadTask.value.progress = 100;

        if (response !== false) {
             await postData(
                "file",
                "file:" + newFileName,
                "authKey",
                compressAndEncode(authKey.value)
            );
            message.success("Upload complete");
            await loadDirectory();
            showPopup.value = false;
            cancelUpload();
        } else {
            message.warn("Upload failed");
        }
    } catch (error) {
        console.error("Upload error:", error);
        message.warn("Upload error");
    } finally {
        isUploading.value = false;
        setTimeout(() => { uploadTask.value = null }, 2000);
    }
};

const formatFileSize = (size) => (size / (1024 * 1024)).toFixed(2) + " MB";

const truncateFileName = (name) => {
  name = name.replace("upload/", "");
  const encoded = name.replace(/^[a-f0-9-]{36}_/, "");
  try {
    return decodeAndDecompress(encoded);
  } catch (e) {
    console.error("Failed to decode file name:", e);
    return encoded;
  }
};

const getAuthKey = async (file) => {
    const key = await getData("file", "file:" + encodeURIComponent(file.replace("upload/", "")));
    try {
        return decodeAndDecompress(key);
    } catch (e) {
        console.error("Failed to decode auth key:", e);
        return key;
    }
};

const handleAuth = async (file, action) => {
  const storedKey = await getAuthKey(file);
  if (storedKey) {
    const inputKey = await waitForAuthConfirmation();
    if (inputKey !== storedKey) {
      message.error("Incorrect password");
      return;
    }
  }
  
  if (action === 'preview') {
      const fileName = truncateFileName(file);
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
      if(!isImage) {
          message.warn("Preview unavailable for this file type");
          return;
      }
      await previewFileClick(file);
  } else if (action === 'download') {
      await download(file);
  } else if (action === 'remove') {
      // Add Confirmation
      modal.confirm({
        title: 'Delete File',
        content: `Are you sure you want to delete this file?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        centered: true,
        onOk: async () => {
             await remove(file);
        }
    });
  }
};

const waitForAuthConfirmation = () => {
    return new Promise((resolve) => {
        resolveAuthPromise = resolve;
        showAuthPopup.value = true;
        authKeyInput.value = "";
    });
};

const confirmAuth = () => {
    showAuthPopup.value = false;
    if (resolveAuthPromise) resolveAuthPromise(authKeyInput.value);
};

const closeAuthPopup = () => {
    showAuthPopup.value = false;
    if (resolveAuthPromise) resolveAuthPromise(null);
};

const previewFileClick = async (file) => {
    const url = await previewFromS3(file);
    if(url) {
        src.value = url;
        visible.value = true;
    }
};

const download = async (file) => {
     await downloadFromS3(file, truncateFileName(file));
};

const remove = async (file) => {
    await deleteFromS3(file);
    await deleteData("file", "file:" + file.replace("upload/", ""));
    message.success("Deleted");
    await loadDirectory();
};

onMounted(async () => {
    await loadDirectory();
    requestAnimationFrame(() => {
        contentVisible.value = true;
    });
});
</script>

<style scoped>
.s3-container {
    padding: clamp(14px, 3vw, var(--space-8));
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 120px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--space-8);
    gap: var(--space-4);
    flex-wrap: wrap;
}

.header-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-end;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #fff 0%, #888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.header-icon-btn :deep(.base-button) {
    width: 42px;
    min-width: 42px;
    padding: 0;
}

.s3-grid {
    display: grid;
    gap: clamp(10px, 2vw, var(--space-6));
}

.page-content {
    will-change: transform, opacity;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.panel-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
}

.panel-subtitle {
    margin: 4px 0 0;
    color: var(--color-text-secondary);
}

.panel-chip {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: var(--radius-full);
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(255, 255, 255, 0.018);
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.76rem;
    font-weight: 600;
}

/* Upload Zone */
.upload-zone {
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-12);
    text-align: center;
    background: rgba(255, 255, 255, 0.014);
    backdrop-filter: var(--glass-blur);
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
.upload-zone:hover, .upload-zone.is-dragging {
    border-color: var(--color-primary);
    background: var(--glass-bg-hover);
    transform: scale(1.01);
}
.upload-icon {
    color: var(--color-primary);
    margin-bottom: var(--space-md);
}

.upload-title {
    margin: 0;
}

.sub-text {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin-top: var(--space-xs);
}

/* File Grid */
.file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
}
.grid-skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
}

/* Card Improvements */
.file-card {
    min-height: 56px;
}

.file-card :deep(.base-card-body) {
    width: 100%;
    padding: 8px 10px !important;
}

.file-item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-width: 0;
}

.file-icon-wrapper {
    width: 34px;
    height: 34px;
    background: rgba(255,255,255,0.02);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.07);
}

.file-icon-wrapper svg {
    width: 16px;
    height: 16px;
}

.file-icon-wrapper:hover {
    color: var(--color-primary);
    background: rgba(255, 255, 255, 0.04);
}

.file-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
}

.file-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.84rem;
    color: var(--color-text-primary);
    line-height: 1.2;
}

/* Clean Actions */
.file-actions {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.66rem;
    white-space: nowrap;
    overflow: hidden;
}
.icon-text-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: inherit;
}
.icon-text-btn:hover {
    color: var(--color-text-primary);
    text-decoration: underline;
}
.icon-text-btn.danger:hover {
    color: var(--color-danger);
}
.divider {
    color: rgba(255, 255, 255, 0.18);
}

/* Utils */
.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}
.selected-file-preview {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    padding: var(--space-xs) 0;
}
.upload-status-card {
    margin-top: var(--space-4);
}
.upload-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-xs);
    font-size: var(--text-xs);
}
.library-panel :deep(.base-card-body) {
    display: grid;
    gap: 0;
}

.empty-state {
    min-height: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    gap: 12px;
}

.empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.07);
}

.preview-image {
    max-width: 100%;
    max-height: 70vh;
    border-radius: var(--radius-md);
}
.preview-container {
    display: flex;
    justify-content: center;
}

.page-section-enter-active,
.page-section-appear-active {
    transition: opacity 0.42s ease, transform 0.42s ease;
}

.page-section-enter-from,
.page-section-appear-from {
    opacity: 0;
    transform: translateY(18px);
}

/* Mobile */
@media (max-width: 640px) {
    .s3-container {
        padding: var(--mobile-shell-gutter);
    }

    .section-header {
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
    }

    .header-actions {
        margin-left: auto;
        flex-shrink: 0;
    }

    .panel-header {
        flex-direction: column;
        align-items: stretch;
    }

    .upload-zone {
        padding: 32px 16px;
    }

    .file-grid {
        grid-template-columns: 1fr;
    }

    .grid-skeleton {
        grid-template-columns: 1fr;
    }

    .file-card {
        min-height: 54px;
    }

    .file-card :deep(.base-card-body) {
        padding: 8px 10px !important;
    }

    .file-actions {
        font-size: 0.62rem;
        gap: 4px;
    }
}
</style>
