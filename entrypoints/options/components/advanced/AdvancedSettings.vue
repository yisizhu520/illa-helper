<template>
  <div class="space-y-6">
    <div class="bg-card rounded-lg border border-border">
      <div class="p-4 border-b border-border">
        <h3 class="text-lg font-medium text-foreground">进阶设置</h3>
      </div>
      <div class="p-4 space-y-6">
        <div>
          <label class="block text-sm font-medium text-muted-foreground mb-2">
            触发模式
          </label>
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                v-model="settings.triggerMode"
                value="automatic"
                class="h-4 w-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
              <span class="text-sm text-foreground">自动翻译</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                v-model="settings.triggerMode"
                value="manual"
                class="h-4 w-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
              <span class="text-sm text-foreground">手动触发</span>
            </label>
          </div>
        </div>
        <div>
          <label
            for="max-length"
            class="block text-sm font-medium text-muted-foreground mb-2"
          >
            最大处理长度
          </label>
          <input
            id="max-length"
            type="number"
            v-model.number="settings.maxLength"
            class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="例如: 400"
          />
        </div>
        <div class="flex items-center justify-between">
          <label
            for="enable-pronunciation"
            class="block text-sm font-medium text-muted-foreground"
          >
            启用发音工具提示
          </label>
          <input
            id="enable-pronunciation"
            type="checkbox"
            v-model="settings.enablePronunciationTooltip"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div class="flex items-center justify-between">
          <label
            for="enable-thinking"
            class="block text-sm font-medium text-muted-foreground"
          >
            启用GPT思考模式
          </label>
          <input
            id="enable-thinking"
            type="checkbox"
            v-model="settings.apiConfig.enable_thinking"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
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
