<template>
  <div class="s3-container">
    <header class="section-header">
      <div class="header-left">
        <h1 class="page-title">File Storage</h1>
        <p class="page-subtitle">Secure S3 Management</p>
      </div>
      <div class="header-actions">
         <BaseButton variant="ghost" @click="refreshDirectory">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
         </BaseButton>
      </div>
    </header>

    <!-- Upload Zone & Progress -->
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
            <p><strong>Click to upload</strong> or drag and drop</p>
            <p class="sub-text">Supports all file types (Encrypted)</p>
        </div>
        <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileChange" 
            style="display: none" 
        />
    </div>

    <!-- Upload Progress -->
    <transition name="fade">
        <div v-if="uploadTask" class="upload-status-card">
            <BaseCard padding="md">
                <div class="upload-info">
                    <span>{{ uploadTask.name }}</span>
                    <span>{{ uploadTask.progress }}%</span>
                </div>
                <BaseProgressBar :value="uploadTask.progress" />
            </BaseCard>
        </div>
    </transition>

    <!-- File Grid -->
    <div v-if="loading" class="grid-skeleton">
        <BaseSkeleton v-for="i in 6" :key="i" height="80px" shape="rect" />
    </div>

    <div v-else class="file-grid">
      <BaseCard 
        v-for="(file, index) in directory" 
        :key="index" 
        class="file-card"
        hoverable
      >
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
                <button class="icon-text-btn" @click.stop="handleAuth(file, 'download')">
                    Download
                </button>
                <div class="divider">|</div>
                <button class="icon-text-btn danger" @click.stop="handleAuth(file, 'remove')">
                    Delete
                </button>
            </div>
        </div>
      </BaseCard>
    </div>

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
    <BaseModal v-model="visible" title="Preview" class="preview-modal">
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
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseCard from "@/components/base/BaseCard.vue";
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

onMounted(loadDirectory);
</script>

<style scoped>
.s3-container {
    padding: var(--space-xl);
    max-width: var(--max-width);
    margin: 0 auto;
    padding-bottom: 120px; /* Nav overlap fix */
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end; /* Align icon with bottom of text */
    margin-bottom: var(--space-xl);
}
.page-title {
    font-size: var(--text-3xl);
    font-weight: 800;
    margin: 0;
}
.page-subtitle {
     color: var(--text-muted);
     margin-top: var(--space-xs);
}
.header-actions {
    display: flex;
    gap: var(--space-sm);
}

/* Upload Zone */
.upload-zone {
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-2xl);
    text-align: center;
    background: rgba(255,255,255,0.02);
    transition: all 0.2s ease;
    cursor: pointer;
    margin-bottom: var(--space-xl);
}
.upload-zone:hover, .upload-zone.is-dragging {
    border-color: var(--color-primary);
    background: rgba(66, 185, 131, 0.05);
}
.upload-icon {
    color: var(--text-muted);
    margin-bottom: var(--space-md);
}
.sub-text {
    font-size: var(--text-xs);
    color: var(--text-disabled);
    margin-top: var(--space-xs);
}

/* File Grid */
.file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Wider cards */
    gap: var(--space-md);
}
.grid-skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-md);
}

/* Card Improvements */
.file-card :deep(.card-body) {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
}

.file-icon-wrapper {
    width: 44px;
    height: 44px;
    background: rgba(255,255,255,0.05);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    flex-shrink: 0;
    cursor: pointer;
    transition: all 0.2s;
}
.file-icon-wrapper:hover {
    color: var(--color-primary);
    background: rgba(66, 185, 131, 0.1);
}

.file-details {
    flex: 1;
    min-width: 0;
}
.file-name {
    font-weight: 500;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: var(--text-base);
    color: var(--text-main);
}

/* Clean Actions */
.file-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--text-xs);
}
.icon-text-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--text-muted);
    cursor: pointer;
    font-size: inherit;
}
.icon-text-btn:hover {
    color: var(--text-main);
    text-decoration: underline;
}
.icon-text-btn.danger:hover {
    color: var(--color-danger);
}
.divider {
    color: var(--border-color);
}

/* Utils */
.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}
.selected-file-preview {
    font-size: var(--text-sm);
    color: var(--color-info);
    padding: var(--space-xs) 0;
}
.upload-status-card {
    margin-bottom: var(--space-lg);
}
.upload-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-xs);
    font-size: var(--text-xs);
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

/* Mobile */
@media (max-width: 640px) {
    .file-grid {
        grid-template-columns: 1fr;
    }
    .header-left {
        margin-right: auto;
    }
}
</style>
