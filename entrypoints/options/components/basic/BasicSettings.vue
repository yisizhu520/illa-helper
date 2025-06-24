<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">基本设置</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="extension-enabled">启用扩展总开关</Label>
            <p class="text-xs text-muted-foreground">
              关闭后，所有翻译功能将停止工作。
            </p>
          </div>
          <Switch id="extension-enabled" :model-value="settings.isEnabled"
            @update:model-value="settings.isEnabled = $event" />
        </div>
        <div class="border-t border-border pt-6">
          <Label class="text-sm mb-2">翻译位置</Label>
          <RadioGroup :model-value="settings.translationPosition" @update:model-value="
            settings.translationPosition = $event as TranslationPosition
            " class="mt-2 flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="pos-after" value="after" />
              <Label for="pos-after">词后</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="pos-before" value="before" />
              <Label for="pos-before">词前</Label>
            </div>
          </RadioGroup>
        </div>
        <div class="flex items-center justify-between">
          <Label for="show-parentheses">翻译是否显示括号</Label>
          <Switch id="show-parentheses" :model-value="settings.showParentheses"
            @update:model-value="settings.showParentheses = $event" />
        </div>
        <div>
          <Label for="translation-style" class="mb-3">翻译样式</Label>
          <Select :model-value="settings.translationStyle" @update:model-value="
            settings.translationStyle = $event as TranslationStyle
            ">
            <SelectTrigger>
              <SelectValue placeholder="选择样式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认</SelectItem>
              <SelectItem value="subtle">柔和</SelectItem>
              <SelectItem value="bold">粗体</SelectItem>
              <SelectItem value="italic">斜体</SelectItem>
              <SelectItem value="underlined">下划线</SelectItem>
              <SelectItem value="highlighted">高亮</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
    <!-- 预览效果 -->
    <Card>
      <CardHeader>
        <CardTitle>预览效果</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="bg-muted p-4 rounded-lg">
          <div class="flex items-center text-sm text-foreground">
            <span>这是一个示例文本，其中包含</span>
            <template v-if="settings.translationPosition === 'before'">
              <span class="text-primary font-semibold mx-1">
                {{ previewTranslation }}
              </span>
              <span class="px-2 py-0.5 bg-background border rounded-md text-sm mx-1">
                原文
              </span>
            </template>
            <template v-else>
              <span class="px-2 py-0.5 bg-background border rounded-md text-sm mx-1">
                原文
              </span>
              <span class="text-primary font-semibold mx-1">
                {{ previewTranslation }}
              </span>
            </template>
            <span>。</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import {
  UserSettings,
  DEFAULT_SETTINGS,
  TranslationPosition,
  TranslationStyle,
} from '@/src/modules/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
