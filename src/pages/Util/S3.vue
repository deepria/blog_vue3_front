<template>
  <PageShell class="s3-container" title="파일" eyebrow="파일 보관함">
    <template #actions>
      <button
        class="icon-btn-secondary"
        @click="refreshDirectory"
        title="새로고침"
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
      <div class="storage-tabs" role="tablist" aria-label="파일 보기">
        <button
          type="button"
          role="tab"
          :aria-selected="viewMode === 'owned'"
          :class="{ active: viewMode === 'owned' }"
          @click="viewMode = 'owned'"
        >
          내 파일
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="viewMode === 'shared'"
          :class="{ active: viewMode === 'shared' }"
          @click="viewMode = 'shared'"
        >
          공유받은 파일
          <span v-if="previewableSharedFiles.length" class="tab-count">
            {{ previewableSharedFiles.length }}
          </span>
        </button>
      </div>

      <StorageUploadPanel
        v-if="viewMode === 'owned' && !organizationError && !isUploading"
        :is-dragging="isDragging"
        @change="handleFileChange"
        @drop="handleDrop"
        @drag-state="isDragging = $event"
      />

      <div v-if="currentError" class="storage-error" role="alert">
        <span>{{ currentError }}</span
        ><BaseButton variant="secondary" size="sm" @click="refreshDirectory"
          >다시 시도</BaseButton
        >
      </div>
      <BaseInput
        v-model="fileSearch"
        label="파일 검색"
        placeholder="파일명으로 검색"
      />
      <div v-if="organizationLoading && viewMode === 'owned'" role="status">
        폴더를 불러오는 중입니다.
      </div>
      <div
        v-if="viewMode === 'shared' || !organizationError"
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
          @create="runAction(createDirectory)"
          @rename="runAction(renameDirectory, $event)"
          @delete="deleteDirectory"
          @select="selectedDirectoryId = $event"
          @move-file="runAction(moveFileToDirectory, $event)"
        />

        <StorageFileList
          v-if="!currentError || visibleFiles.length"
          :files="visibleFiles"
          :loading="viewMode === 'owned' ? loading : sharedLoading"
          @move="openMove"
          :empty-text="
            fileSearch
              ? '검색 결과가 없습니다.'
              : viewMode === 'owned'
                ? '아직 업로드한 파일이 없습니다.'
                : '아직 공유받은 파일이 없습니다.'
          "
          @preview="runAction(() => requestAction($event, 'preview'))"
          @download="runAction(() => requestAction($event, 'download'))"
          @share="openShareModal"
          @delete="requestAction($event, 'delete')"
        />
      </div>
    </div>

    <BaseModal
      v-model="showUploadModal"
      title="업로드 설정"
      :close-disabled="isUploading"
      @close="cancelUpload"
    >
      <div class="form-group">
        <BaseInput
          v-model="customFileName"
          label="파일 이름 (선택)"
          placeholder="비워두면 원래 파일 이름을 사용합니다."
        />
        <BaseInput
          v-model="authKey"
          label="보호 키 (선택)"
          placeholder="파일에 사용할 보호 키를 입력하세요."
          type="password"
        />
        <div class="selected-file-preview" v-if="selectedFile">
          선택한 파일: {{ selectedFile.name }}
        </div>
        <div v-if="uploadTask" class="upload-status-card">
          <div class="upload-info">
            <span>{{ uploadTask.name }}</span>
            <span>{{
              uploadTask.progress ? `${uploadTask.progress}%` : "전송 중"
            }}</span>
          </div>
          <BaseProgressBar
            v-if="uploadTask.progress"
            :value="uploadTask.progress"
          />
          <p v-else role="status">파일을 전송하고 있습니다.</p>
        </div>
      </div>
      <template #footer>
        <BaseButton
          variant="secondary"
          @click="cancelUpload"
          :disabled="isUploading"
          >취소</BaseButton
        >
        <BaseButton variant="primary" @click="upload" :loading="isUploading"
          >업로드 시작</BaseButton
        >
      </template>
    </BaseModal>

    <BaseModal
      v-model="showShareModal"
      :title="shareTarget ? `${shareTarget.display_name} 공유` : '파일 공유'"
      @close="closeShareModal"
    >
      <div class="friend-picker">
        <BaseInput
          v-model="friendSearch"
          label="친구 선택"
          placeholder="이름이나 이메일로 검색"
          :disabled="friendsLoading"
        />
        <p v-if="friendsLoading" class="viewer-empty">
          친구를 불러오는 중입니다.
        </p>
        <div v-else-if="friends.length === 0" class="friend-picker-empty">
          <span>설정에서 친구를 추가한 뒤 파일을 공유할 수 있습니다.</span>
          <router-link :to="{ name: 'Account' }" @click="closeShareModal">
            친구 관리
          </router-link>
        </div>
        <p v-else-if="filteredFriends.length === 0" class="viewer-empty">
          검색 결과가 없습니다.
        </p>
        <div v-else class="friend-picker-list">
          <div
            v-for="friend in filteredFriends"
            :key="friend.user_id"
            class="friend-picker-row"
          >
            <div class="friend-picker-identity">
              <img
                v-if="friend.avatar_url"
                :src="friend.avatar_url"
                alt=""
                class="friend-picker-avatar"
              />
              <span v-else class="friend-picker-avatar fallback">
                {{ friendInitial(friend.name) }}
              </span>
              <div class="viewer-details">
                <strong>{{ friend.name }}</strong>
                <span>{{ friend.email }}</span>
              </div>
            </div>
            <BaseButton
              size="sm"
              :variant="viewerIds.has(friend.user_id) ? 'secondary' : 'primary'"
              :disabled="viewerIds.has(friend.user_id)"
              :loading="sharingFriendId === friend.user_id"
              @click="shareWithFriend(friend)"
            >
              {{ viewerIds.has(friend.user_id) ? "공유됨" : "공유" }}
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="viewer-section">
        <p class="viewer-section-title">접근 가능한 사용자</p>
        <p v-if="viewersLoading" class="viewer-empty">불러오는 중입니다.</p>
        <p v-else-if="fileViewers.length === 0" class="viewer-empty">
          현재 나만 접근할 수 있습니다.
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
              삭제
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>

    <BaseModal
      v-model="showAuthModal"
      title="보호 키 확인"
      @close="closeAuthPopup"
    >
      <p class="auth-desc">이 파일의 보호 키를 입력하세요.</p>
      <BaseInput
        v-model="authKeyInput"
        placeholder="보호 키"
        type="password"
        @enter="confirmAuth"
      />
      <template #footer>
        <BaseButton variant="secondary" @click="closeAuthPopup"
          >취소</BaseButton
        >
        <BaseButton variant="primary" @click="confirmAuth">확인</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="imagePreview.visible"
      :title="imagePreview.name || '이미지 미리보기'"
      wide
      @close="closeImagePreview"
      ><img
        :src="imagePreview.url"
        :alt="imagePreview.name"
        style="
          display: block;
          max-width: 100%;
          max-height: 75dvh;
          margin: auto;
          object-fit: contain;
        "
    /></BaseModal>
    <BaseModal
      :model-value="!!moveTarget"
      title="파일 이동"
      :close-disabled="moving"
      @update:model-value="!$event && (moveTarget = null)"
      ><p>{{ moveTarget?.display_name }}</p>
      <label for="move-directory">이동할 폴더</label
      ><select
        id="move-directory"
        v-model="moveDirectoryId"
        class="base-select"
      >
        <option value="">미분류</option>
        <option
          v-for="directory in organization.directories"
          :key="directory.id"
          :value="directory.id"
        >
          {{
            directory.id === "dashboard" && directory.name === "Dashboard"
              ? "대시보드"
              : directory.name
          }}
        </option></select
      ><template #footer
        ><BaseButton
          variant="secondary"
          :disabled="moving"
          @click="moveTarget = null"
          >취소</BaseButton
        ><BaseButton :loading="moving" @click="moveSelectedFile"
          >이동</BaseButton
        ></template
      ></BaseModal
    >
    <BaseModal
      v-model="textPreview.visible"
      :title="textPreview.name || '미리보기'"
    >
      <div class="text-preview-container">
        <div v-if="textPreview.loading" class="text-preview-loading">
          미리보기를 불러오는 중입니다.
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useAppStore } from "@/store/app";
import { readListState, writeListState } from "@/shared/lib/listState";
import { onBeforeRouteLeave } from "vue-router";
import { useWorkProtection } from "@/shared/composables/useWorkProtection";
import { getErrorMessage } from "@/shared/api/http";
import { useStorage } from "@/features/storage/composables/useStorage";
import { storageApi } from "@/features/storage/api/storageApi";
import { friendApi } from "@/features/friend/api/friendApi";
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
import { fetchOnline } from "@/shared/utils/network";
import {
  collectDirectoryIds,
  DASHBOARD_DIRECTORY,
  normalizeOrganization,
} from "@/features/storage/lib/organization";

const { modal } = App.useApp();
const listOwner = useAppStore().user?.id;
const previousList = readListState(listOwner, "files");
const {
  loading,
  error: filesError,
  sharedError,
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

const organizationError = ref("");
const organizationLoading = ref(false);
const fileSearch = ref(previousList.query || "");
const moveTarget = ref(null);
const moveDirectoryId = ref("");
const moving = ref(false);
const isDragging = ref(false);
const viewMode = ref(previousList.view === "shared" ? "shared" : "owned");
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
const friends = ref([]);
const friendSearch = ref("");
const fileViewers = ref([]);
const viewersLoading = ref(false);
const friendsLoading = ref(false);
const sharingFriendId = ref(null);
const selectedDirectoryId = ref(previousList.directory || "unassigned");
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

useWorkProtection(
  "파일 업로드",
  () =>
    isUploading.value ||
    moving.value ||
    (showUploadModal.value && !!selectedFile.value),
);
onBeforeRouteLeave(
  () =>
    (!isUploading.value && !moving.value) ||
    (message.warning("파일 작업이 끝난 뒤 이동해 주세요."), false),
);
const currentError = computed(() =>
  viewMode.value === "owned"
    ? organizationError.value || filesError.value
    : sharedError.value,
);
onBeforeUnmount(() =>
  writeListState(listOwner, "files", {
    query: fileSearch.value,
    view: viewMode.value,
    directory: selectedDirectoryId.value,
  }),
);
const knownFileKeys = computed(
  () => new Set(previewableFiles.value.map((file) => file.key)),
);

const unassignedFiles = computed(() =>
  previewableFiles.value.filter(
    (file) => !organization.value.file_locations[file.key],
  ),
);

const directoryFiles = computed(() => {
  if (viewMode.value === "shared") return previewableSharedFiles.value;
  if (selectedDirectoryId.value === "all") return previewableFiles.value;
  if (selectedDirectoryId.value === "unassigned") return unassignedFiles.value;
  return previewableFiles.value.filter(
    (file) =>
      organization.value.file_locations[file.key] === selectedDirectoryId.value,
  );
});

const visibleFiles = computed(() =>
  directoryFiles.value.filter((file) =>
    (file.display_name || "")
      .toLowerCase()
      .includes(fileSearch.value.trim().toLowerCase()),
  ),
);
async function moveSelectedFile() {
  if (!moveTarget.value || moving.value) return;
  moving.value = true;
  try {
    await moveFileToDirectory({
      fileKey: moveTarget.value.key,
      directoryId: moveDirectoryId.value || null,
    });
    moveTarget.value = null;
  } catch (error) {
    message.error(getErrorMessage(error, "파일을 이동하지 못했습니다."));
  } finally {
    moving.value = false;
  }
}
function openMove(file) {
  moveTarget.value = file;
  moveDirectoryId.value = organization.value.file_locations[file.key] || "";
}
async function runAction(action, value) {
  try {
    await action(value);
  } catch (error) {
    message.error(getErrorMessage(error));
  }
}
const viewerIds = computed(
  () => new Set(fileViewers.value.map((viewer) => viewer.viewer_id)),
);

const filteredFriends = computed(() => {
  const search = friendSearch.value.trim().toLowerCase();
  if (!search) return friends.value;
  return friends.value.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search) ||
      friend.email.toLowerCase().includes(search),
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

const refreshDirectory = async (notify = true) => {
  const results = await Promise.allSettled([
    loadFiles(),
    loadSharedFiles(),
    loadOrganization(),
  ]);
  if (
    notify !== false &&
    results.every((result) => result.status === "fulfilled")
  )
    message.success("새로고침했습니다.");
};

const openShareModal = async (file) => {
  shareTarget.value = file;
  friendSearch.value = "";
  friends.value = [];
  fileViewers.value = [];
  showShareModal.value = true;
  viewersLoading.value = true;
  friendsLoading.value = true;
  try {
    const [viewers, friendOverview] = await Promise.all([
      storageApi.listFileViewers(file.key),
      friendApi.overview(),
    ]);
    fileViewers.value = viewers;
    friends.value = friendOverview?.friends || [];
  } catch (error) {
    message.error(error?.userMessage || "공유 설정을 불러오지 못했습니다.");
  } finally {
    viewersLoading.value = false;
    friendsLoading.value = false;
  }
};

const closeShareModal = () => {
  showShareModal.value = false;
  shareTarget.value = null;
  friendSearch.value = "";
  friends.value = [];
  fileViewers.value = [];
};

const shareWithFriend = async (friend) => {
  if (
    !shareTarget.value ||
    sharingFriendId.value ||
    viewerIds.value.has(friend.user_id)
  ) {
    return;
  }
  sharingFriendId.value = friend.user_id;
  try {
    const viewer = await storageApi.shareFile(
      shareTarget.value.key,
      friend.user_id,
    );
    const existingIndex = fileViewers.value.findIndex(
      (item) => item.viewer_id === viewer.viewer_id,
    );
    if (existingIndex >= 0) {
      fileViewers.value.splice(existingIndex, 1, viewer);
    } else {
      fileViewers.value.push(viewer);
    }
    message.success("파일을 공유했습니다.");
  } catch (error) {
    message.error(error?.userMessage || "파일을 공유하지 못했습니다.");
  } finally {
    sharingFriendId.value = null;
  }
};

const friendInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "?";

const removeViewer = async (viewer) => {
  if (!shareTarget.value) return;
  try {
    await storageApi.unshareFile(shareTarget.value.key, viewer.viewer_id);
    fileViewers.value = fileViewers.value.filter(
      (item) => item.viewer_id !== viewer.viewer_id,
    );
    message.success("접근 권한을 해제했습니다.");
  } catch (error) {
    message.error(error?.userMessage || "접근 권한을 해제하지 못했습니다.");
  }
};

const loadOrganization = async () => {
  organizationLoading.value = true;
  organizationError.value = "";
  try {
    const loaded = normalizeOrganization(await storageApi.getOrganization());
    organization.value = {
      ...loaded,
      directories: loaded.directories.some(
        (directory) => directory.id === DASHBOARD_DIRECTORY.id,
      )
        ? loaded.directories
        : [DASHBOARD_DIRECTORY, ...loaded.directories],
    };
    if (
      !["all", "unassigned"].includes(selectedDirectoryId.value) &&
      !organization.value.directories.some(
        (d) => d.id === selectedDirectoryId.value,
      )
    )
      selectedDirectoryId.value = "unassigned";
  } catch (error) {
    organizationError.value =
      "폴더 정보를 불러오지 못했습니다. 다시 시도해 주세요.";
    throw error;
  } finally {
    organizationLoading.value = false;
  }
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
    name: "새 폴더",
    parent_id: null,
    sort_order: sortOrder,
  };
  await saveOrganization({
    ...organization.value,
    directories: [...organization.value.directories, nextDirectory],
  });
  selectedDirectoryId.value = nextDirectory.id;
  message.success("폴더를 추가했습니다.");
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
    title: "폴더 삭제",
    content: `"${target.name}" 폴더를 삭제할까요? 파일은 보관함에 남습니다.`,
    okText: "삭제",
    okType: "danger",
    cancelText: "취소",
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
      message.success("폴더를 삭제했습니다.");
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
  message.success(
    directoryId ? "폴더로 이동했습니다." : "미분류로 이동했습니다.",
  );
};

const handleFileChange = (event) => {
  const file = event.target.files?.[0];
  if (!file || isUploading.value) return;
  selectedFile.value = file;
  showUploadModal.value = true;
};

const handleDrop = (event) => {
  if (isUploading.value) return;
  isDragging.value = false;
  const file = event.dataTransfer.files?.[0];
  if (!file || isUploading.value) return;
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
  uploadTask.value = { name: selectedFile.value.name, progress: 0 };

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
    message.success("업로드했습니다.");
    cancelUpload();
  } catch (error) {
    message.error(
      error?.userMessage || "업로드하지 못했습니다. 다시 시도해 주세요.",
    );
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
    title: "파일 삭제",
    content: `"${file.display_name}" 파일을 삭제할까요?`,
    okText: "삭제",
    okType: "danger",
    cancelText: "취소",
    centered: true,
    onOk: async () => {
      const data = await getDeleteUrl(file.key, providedAuthKey);
      const response = await fetchOnline(data.url, { method: "DELETE" });
      if (!response.ok) {
        throw {
          userMessage: `파일을 삭제하지 못했습니다. (${response.status})`,
          status: response.status,
        };
      }
      await Promise.all([loadFiles(), loadOrganization()]);
      message.success("삭제했습니다.");
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
    const response = await fetchOnline(url);
    if (!response.ok)
      throw {
        status: response.status,
        userMessage: `미리보기를 불러오지 못했습니다. (${response.status})`,
      };
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
    message.error(getErrorMessage(error, "미리보기를 불러오지 못했습니다."));
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
  refreshDirectory(false);
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

.friend-picker {
  display: grid;
  gap: var(--space-3);
}

.friend-picker-list {
  display: grid;
  gap: var(--space-2);
  max-height: 240px;
  overflow-y: auto;
}

.friend-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
}

.friend-picker-identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--space-2);
}

.friend-picker-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-picker-avatar.fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-weight: 750;
}

.friend-picker-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.friend-picker-empty a {
  color: var(--color-primary);
  font-weight: 700;
  white-space: nowrap;
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

  .friend-picker-empty {
    align-items: flex-start;
    flex-direction: column;
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
.storage-error {
  padding: 18px;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: var(--radius-lg);
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
.storage-error {
  padding: 18px;
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: var(--radius-lg);
}
</style>
