<template>
  <div class="space-y-6">
    <div class="bg-card rounded-lg border border-border">
      <div class="p-4 border-b border-border">
        <h3 class="text-lg font-medium text-foreground">基本设置</h3>
      </div>
      <div class="p-4 space-y-6">
        <div class="flex items-center justify-between">
          <label
            for="extension-enabled"
            class="block text-sm font-medium text-foreground"
          >
            启用扩展总开关
            <p class="text-xs text-muted-foreground">
              关闭后，所有翻译功能将停止工作。
            </p>
          </label>
          <input
            id="extension-enabled"
            type="checkbox"
            v-model="settings.isEnabled"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div class="border-t border-border pt-6">
          <label class="block text-sm font-medium text-muted-foreground mb-2">
            翻译位置
          </label>
          <div class="flex items-center space-x-4">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                v-model="settings.translationPosition"
                value="after"
                class="h-4 w-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
              <span class="text-sm text-foreground">词后</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                v-model="settings.translationPosition"
                value="before"
                class="h-4 w-4 text-primary bg-background border-border rounded focus:ring-ring"
              />
              <span class="text-sm text-foreground">词前</span>
            </label>
          </div>
        </div>
        <div>
          <label
            for="show-parentheses"
            class="block text-sm font-medium text-muted-foreground mb-2"
          >
            显示括号
          </label>
          <div class="flex items-center">
            <input
              id="show-parentheses"
              type="checkbox"
              v-model="settings.showParentheses"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label
            for="translation-style"
            class="block text-sm font-medium text-muted-foreground mb-2"
          >
            翻译样式
          </label>
          <select
            id="translation-style"
            v-model="settings.translationStyle"
            class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="default">默认</option>
            <option value="subtle">柔和</option>
            <option value="bold">粗体</option>
            <option value="italic">斜体</option>
            <option value="underlined">下划线</option>
            <option value="highlighted">高亮</option>
          </select>
        </div>
      </div>
    </div>
    <!-- 预览效果 -->
    <div class="bg-card rounded-lg border border-border">
      <div class="p-4 border-b border-border">
        <h3 class="text-lg font-medium text-foreground">预览效果</h3>
      </div>
      <div class="p-4">
        <div class="bg-muted p-4 rounded-lg">
          <div class="flex items-center text-sm text-foreground">
            <span>这是一个示例文本，其中包含</span>
            <template v-if="settings.translationPosition === 'before'">
              <span class="text-primary font-semibold mx-1">
                {{ previewTranslation }}
              </span>
              <span
                class="px-2 py-0.5 bg-background border rounded-md text-sm mx-1"
              >
                原文
              </span>
            </template>
            <template v-else>
              <span
                class="px-2 py-0.5 bg-background border rounded-md text-sm mx-1"
              >
                原文
              </span>
              <span class="text-primary font-semibold mx-1">
                {{ previewTranslation }}
              </span>
            </template>
            <span>。</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
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

const previewTranslation = computed(() => {
  if (settings.value.showParentheses) {
    return '(翻译)';
  }
  return '翻译';
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
