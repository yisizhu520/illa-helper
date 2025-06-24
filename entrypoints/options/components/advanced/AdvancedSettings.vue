<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 class="text-2xl font-bold text-foreground">高级设置</h2>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <Label>触发模式</Label>
          <RadioGroup
            :model-value="settings.triggerMode"
            @update:model-value="settings.triggerMode = $event as any"
            class="flex items-center space-x-4 pt-2"
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="mode-auto" value="automatic" />
              <Label for="mode-auto">自动翻译</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="mode-manual" value="manual" />
              <Label for="mode-manual">手动触发</Label>
            </div>
          </RadioGroup>
        </div>
        <div class="space-y-2">
          <Label for="max-length">最大处理长度</Label>
          <Input
            id="max-length"
            type="number"
            :model-value="settings.maxLength"
            @update:model-value="settings.maxLength = Number($event)"
            placeholder="例如: 400"
          />
        </div>
        <div class="border-t border-border pt-6 flex items-center justify-between">
          <div class="space-y-1">
            <Label for="enable-pronunciation">启用发音工具提示</Label>
          </div>
          <Switch
            id="enable-pronunciation"
            :model-value="settings.enablePronunciationTooltip"
            @update:model-value="settings.enablePronunciationTooltip = $event"
          />
        </div>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <Label for="enable-thinking">启用GPT思考模式</Label>
          </div>
          <Switch
            id="enable-thinking"
            :model-value="settings.apiConfig.enable_thinking"
            @update:model-value="settings.apiConfig.enable_thinking = $event"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { StorageManager } from '@/src/modules/storageManager';
import { UserSettings, DEFAULT_SETTINGS } from '@/src/modules/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

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
