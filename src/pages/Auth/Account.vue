<template>
  <PageShell
    class="account-page"
    title="Account"
    eyebrow="Profile"
    description="Manage your identity, sign-in providers, and friends."
  >
    <template #actions>
      <a-button
        class="theme-toggle"
        :title="themeToggleTitle"
        :aria-label="themeToggleTitle"
        :aria-pressed="isDarkMode"
        @click="app.toggleTheme"
      >
        <component :is="isDarkMode ? BulbFilled : BulbOutlined" />
      </a-button>
    </template>

    <div class="account-header">
      <img
        v-if="app.user?.avatar_url"
        :src="app.user.avatar_url"
        alt=""
        class="avatar"
      />
      <div>
        <h1>{{ app.user?.name }}</h1>
        <p>{{ app.user?.email }}</p>
      </div>
      <a-button class="logout-button" @click="logout">Logout</a-button>
    </div>

    <div class="provider-list">
      <div
        v-for="provider in providers"
        :key="provider.id"
        class="provider-row"
      >
        <div>
          <strong>{{ provider.label }}</strong>
          <span>{{
            connected(provider.id) ? "Connected" : "Not connected"
          }}</span>
        </div>
        <a-button
          v-if="connected(provider.id)"
          :disabled="app.providers.length <= 1"
          @click="disconnect(provider.id)"
        >
          Disconnect
        </a-button>
        <a-button v-else type="primary" @click="connect(provider.id)">
          Connect
        </a-button>
      </div>
    </div>

    <section class="preferences-section" aria-labelledby="preferences-title">
      <div class="section-heading">
        <div>
          <h2 id="preferences-title">Preferences</h2>
          <p>These settings follow your account across devices.</p>
        </div>
      </div>
      <div class="preference-row">
        <div>
          <label id="gallery-setting-label">Main page image slideshow</label>
          <p>Show images from your Dashboard folder on the main page.</p>
        </div>
        <a-switch
          :checked="settings.dashboardGalleryEnabled"
          :loading="settings.loading || settings.saving"
          :disabled="!settings.loaded || settings.loading || settings.saving"
          aria-labelledby="gallery-setting-label"
          @change="saveGalleryPreference"
        />
      </div>
      <div v-if="settingsError" class="settings-error" role="alert">
        <span>{{ settingsError }}</span>
        <a-button v-if="!settings.loaded" size="small" @click="loadPreferences">
          Retry
        </a-button>
      </div>
    </section>

    <section class="friends-section">
      <div class="section-heading">
        <div>
          <h2>Friends</h2>
          <p>Add friends to share files without entering their email again.</p>
        </div>
        <span class="friend-count">{{ friends.length }}</span>
      </div>

      <div class="friend-request-form">
        <a-input
          v-model:value="friendEmail"
          type="email"
          placeholder="Friend's registered email"
          :disabled="sendingRequest"
          @press-enter="sendFriendRequest"
        />
        <a-button
          type="primary"
          :loading="sendingRequest"
          :disabled="!friendEmail.trim()"
          @click="sendFriendRequest"
        >
          Send request
        </a-button>
      </div>

      <div v-if="friendsLoading" class="friend-empty">Loading friends...</div>
      <template v-else>
        <div v-if="incomingRequests.length" class="friend-group">
          <h3>Received requests</h3>
          <div class="friend-list">
            <div
              v-for="request in incomingRequests"
              :key="request.request_id"
              class="friend-row"
            >
              <div class="friend-identity">
                <img
                  v-if="request.avatar_url"
                  :src="request.avatar_url"
                  alt=""
                  class="friend-avatar"
                />
                <span v-else class="friend-avatar fallback">
                  {{ initial(request.name) }}
                </span>
                <div>
                  <strong>{{ request.name }}</strong>
                  <span>{{ request.email }}</span>
                </div>
              </div>
              <div class="friend-actions">
                <a-button
                  size="small"
                  @click="dismissFriendRequest(request.request_id)"
                >
                  Decline
                </a-button>
                <a-button
                  size="small"
                  type="primary"
                  @click="acceptFriendRequest(request.request_id)"
                >
                  Accept
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="outgoingRequests.length" class="friend-group">
          <h3>Sent requests</h3>
          <div class="friend-list">
            <div
              v-for="request in outgoingRequests"
              :key="request.request_id"
              class="friend-row"
            >
              <div class="friend-identity">
                <img
                  v-if="request.avatar_url"
                  :src="request.avatar_url"
                  alt=""
                  class="friend-avatar"
                />
                <span v-else class="friend-avatar fallback">
                  {{ initial(request.name) }}
                </span>
                <div>
                  <strong>{{ request.name }}</strong>
                  <span>{{ request.email }}</span>
                </div>
              </div>
              <a-button
                size="small"
                @click="dismissFriendRequest(request.request_id)"
              >
                Cancel
              </a-button>
            </div>
          </div>
        </div>

        <div class="friend-group">
          <h3>Your friends</h3>
          <div v-if="friends.length" class="friend-list">
            <div
              v-for="friend in friends"
              :key="friend.user_id"
              class="friend-row"
            >
              <div class="friend-identity">
                <img
                  v-if="friend.avatar_url"
                  :src="friend.avatar_url"
                  alt=""
                  class="friend-avatar"
                />
                <span v-else class="friend-avatar fallback">
                  {{ initial(friend.name) }}
                </span>
                <div>
                  <strong>{{ friend.name }}</strong>
                  <span>{{ friend.email }}</span>
                </div>
              </div>
              <a-button
                size="small"
                danger
                @click="confirmRemoveFriend(friend)"
              >
                Remove
              </a-button>
            </div>
          </div>
          <div v-else class="friend-empty">
            No friends yet. Send a request using their registered email.
          </div>
        </div>
      </template>
    </section>
  </PageShell>
</template>

<script setup>
import { App, message } from "ant-design-vue";
import { useAppStore } from "@/store/app";
import { useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { BulbFilled, BulbOutlined } from "@ant-design/icons-vue";
import { authApi } from "@/features/auth/api/authApi";
import { friendApi } from "@/features/friend/api/friendApi";
import PageShell from "@/shared/ui/PageShell.vue";
import { useSettingsStore } from "@/features/settings/store/settingsStore";

const app = useAppStore();
const settings = useSettingsStore();
const settingsError = ref("");
const { modal } = App.useApp();
const router = useRouter();
const friendEmail = ref("");
const friendsLoading = ref(false);
const sendingRequest = ref(false);
const friends = ref([]);
const incomingRequests = ref([]);
const outgoingRequests = ref([]);
const isDarkMode = computed(() => app.theme === "dark");
const themeToggleTitle = computed(() =>
  isDarkMode.value ? "Turn dark mode off" : "Turn dark mode on",
);
const providers = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

function connected(provider) {
  return app.providers.includes(provider);
}

async function loadPreferences() {
  settingsError.value = "";
  try {
    await settings.loadSettings();
  } catch (error) {
    settingsError.value = error.userMessage || "Unable to load preferences.";
  }
}

async function saveGalleryPreference(enabled) {
  settingsError.value = "";
  try {
    if (await settings.saveDashboardGallery(enabled)) {
      message.success("Preferences saved.");
    }
  } catch (error) {
    settingsError.value = error.userMessage || "Unable to save preferences.";
  }
}

function connect(provider) {
  window.location.assign(authApi.connectUrl(provider, window.location.href));
}

async function disconnect(provider) {
  try {
    app.setSession(await authApi.disconnect(provider));
  } catch (error) {
    message.error(error.userMessage || "Unable to disconnect provider.");
  }
}

async function logout() {
  await app.logout();
  router.push({ name: "Login" });
}

async function loadFriends() {
  friendsLoading.value = true;
  try {
    const data = await friendApi.overview();
    friends.value = data?.friends || [];
    incomingRequests.value = data?.incoming_requests || [];
    outgoingRequests.value = data?.outgoing_requests || [];
  } catch (error) {
    message.error(error.userMessage || "Unable to load friends.");
  } finally {
    friendsLoading.value = false;
  }
}

async function sendFriendRequest() {
  const email = friendEmail.value.trim();
  if (!email || sendingRequest.value) return;
  sendingRequest.value = true;
  try {
    const request = await friendApi.sendRequest(email);
    outgoingRequests.value.unshift(request);
    friendEmail.value = "";
    message.success("Friend request sent.");
  } catch (error) {
    message.error(error.userMessage || "Unable to send friend request.");
  } finally {
    sendingRequest.value = false;
  }
}

async function acceptFriendRequest(requestId) {
  try {
    const friend = await friendApi.acceptRequest(requestId);
    incomingRequests.value = incomingRequests.value.filter(
      (request) => request.request_id !== requestId,
    );
    friends.value.push(friend);
    friends.value.sort((left, right) => left.name.localeCompare(right.name));
    message.success("Friend request accepted.");
  } catch (error) {
    message.error(error.userMessage || "Unable to accept friend request.");
  }
}

async function dismissFriendRequest(requestId) {
  try {
    await friendApi.dismissRequest(requestId);
    incomingRequests.value = incomingRequests.value.filter(
      (request) => request.request_id !== requestId,
    );
    outgoingRequests.value = outgoingRequests.value.filter(
      (request) => request.request_id !== requestId,
    );
    message.success("Friend request removed.");
  } catch (error) {
    message.error(error.userMessage || "Unable to remove friend request.");
  }
}

function confirmRemoveFriend(friend) {
  modal.confirm({
    title: "Remove friend",
    content: `Remove ${friend.name} from your friends? Existing file access will remain until you remove it from the file.`,
    okText: "Remove",
    okType: "danger",
    cancelText: "Cancel",
    centered: true,
    onOk: async () => {
      await friendApi.removeFriend(friend.user_id);
      friends.value = friends.value.filter(
        (item) => item.user_id !== friend.user_id,
      );
      message.success("Friend removed.");
    },
  });
}

function initial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

onMounted(loadFriends);
onMounted(loadPreferences);
</script>

<style scoped>
.account-page {
  display: block;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  padding: 0;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.logout-button {
  margin-left: auto;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

h1,
p {
  margin: 0;
}

h1 {
  font-size: 24px;
  color: var(--color-text-primary);
}

p,
span {
  color: var(--color-text-secondary);
}

.provider-list {
  display: grid;
  gap: 12px;
}

.friends-section,
.preferences-section {
  display: grid;
  gap: 20px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.preference-row,
.settings-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.preference-row label {
  color: var(--color-text-primary);
  font-weight: 600;
}

.preference-row p {
  margin-top: 6px;
  font-size: var(--font-size-caption);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-heading h2,
.friend-group h3 {
  margin: 0;
  color: var(--color-text-primary);
}

.section-heading h2 {
  font-size: 20px;
}

.section-heading p {
  margin-top: 4px;
  font-size: var(--font-size-caption);
}

.friend-count {
  min-width: 30px;
  padding: 4px 9px;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  text-align: center;
  font-weight: 700;
}

.friend-request-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.friend-group {
  display: grid;
  gap: 10px;
}

.friend-group h3 {
  font-size: var(--font-size-body);
}

.friend-list {
  display: grid;
  gap: 8px;
}

.friend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-panel);
}

.friend-identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.friend-identity > div {
  display: grid;
  min-width: 0;
}

.friend-identity strong,
.friend-identity span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-identity span {
  font-size: var(--font-size-caption);
}

.friend-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-avatar.fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-weight: 750;
}

.friend-actions {
  display: flex;
  gap: 8px;
}

.friend-empty {
  padding: 20px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
  text-align: center;
  font-size: var(--font-size-caption);
}

.provider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.provider-row div {
  display: grid;
  gap: 4px;
}

@media (max-width: 640px) {
  .account-page :deep(.page-shell-header) {
    align-items: flex-start;
    flex-direction: row;
  }

  .account-page :deep(.page-shell-actions) {
    flex: none;
    justify-content: flex-end;
  }

  .account-header,
  .provider-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .friend-request-form {
    grid-template-columns: 1fr;
  }

  .friend-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .friend-actions {
    width: 100%;
  }

  .logout-button {
    margin-left: 0;
  }
}
</style>
