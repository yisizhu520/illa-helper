<template>
  <div class="space-y-6">
    <div class="bg-card rounded-lg border border-border">
      <div class="p-4 border-b border-border">
        <h3 class="text-lg font-medium text-foreground">翻译服务设置</h3>
      </div>
      <div class="p-4 space-y-6">
        <div>
          <label for="api-key" class="block text-sm font-medium text-muted-foreground mb-2">
            API密钥
          </label>
          <input id="api-key" type="password" v-model="settings.apiConfig.apiKey"
            class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="输入你的API密钥" />
        </div>
        <div>
          <label for="api-endpoint" class="block text-sm font-medium text-muted-foreground mb-2">
            API端点
          </label>
          <input id="api-endpoint" type="text" v-model="settings.apiConfig.apiEndpoint"
            class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="输入API端点" />
        </div>
        <div>
          <label for="user-level" class="block text-sm font-medium text-muted-foreground mb-2">
            单词熟悉度 (User Level: {{ settings.userLevel }})
          </label>
          <input id="user-level" type="range" min="1" max="5" step="1" v-model.number="settings.userLevel"
            class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <label for="replacement-rate" class="block text-sm font-medium text-muted-foreground mb-2">
            替换率 (Replacement Rate:
            {{ Math.round(settings.replacementRate * 100) }}%)
          </label>
          <input id="replacement-rate" type="range" min="0" max="1" step="0.01"
            v-model.number="settings.replacementRate"
            class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import { UserSettings, DEFAULT_SETTINGS } from '@/src/modules/types';

const settings = ref<UserSettings>(DEFAULT_SETTINGS);
const storageManager = new StorageManager();

const emit = defineEmits<{
  saveMessage: [message: string];
}>();

onMounted(async () => {
  settings.value = await storageManager.getUserSettings();
});

watch(
  settings,
  async (newSettings) => {
    await storageManager.saveUserSettings(newSettings);
    emit('saveMessage', '设置已保存');
    browser.runtime.sendMessage({
      type: 'settings_updated',
      settings: newSettings,
    });
  },
  { deep: true },
);
</script>
