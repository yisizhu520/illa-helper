<template>
  <div class="space-y-6">
    <div class="bg-card rounded-lg border border-border">
      <div class="p-4 border-b border-border">
        <h3 class="text-lg font-medium text-foreground">界面与样式设置</h3>
      </div>
      <div class="p-4 space-y-6">
        <div class="border-t border-border pt-6">
          <h4 class="text-md font-medium text-foreground mb-4">悬浮球设置</h4>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label
                for="floating-ball-enabled"
                class="block text-sm font-medium text-muted-foreground"
              >
                启用悬浮球
              </label>
              <input
                id="floating-ball-enabled"
                type="checkbox"
                v-model="settings.floatingBall.enabled"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                for="floating-ball-position"
                class="block text-sm font-medium text-muted-foreground mb-2"
              >
                位置 ({{ settings.floatingBall.position }}%)
              </label>
              <input
                id="floating-ball-position"
                type="range"
                min="0"
                max="100"
                v-model.number="settings.floatingBall.position"
                class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label
                for="floating-ball-opacity"
                class="block text-sm font-medium text-muted-foreground mb-2"
              >
                透明度 ({{ settings.floatingBall.opacity }})
              </label>
              <input
                id="floating-ball-opacity"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                v-model.number="settings.floatingBall.opacity"
                class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
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
